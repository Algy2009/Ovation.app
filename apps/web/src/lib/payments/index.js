import { prisma } from "@/db/client";
import { encryptNIK, generateDynamicTicketToken } from "@ovation/shared";
import crypto from "crypto";
import {
  createMidtransSnapTransaction,
  chargeMidtransDirect,
  verifyWebhookSignature as verifyMidtransWebhook,
  getMidtransStatus,
} from "./midtrans.js";
import {
  createXenditInvoice,
  verifyXenditWebhookToken,
  getXenditInvoiceStatus,
} from "./xendit.js";

/**
 * Unified Payment Dispatcher (Midtrans & Xendit)
 */
export async function createPayment({
  provider = "MIDTRANS",
  orderNumber,
  finalAmount,
  channel = "QRIS",
  methodDetail,
  customer,
  items,
  description,
}) {
  const normProvider = provider.toUpperCase();

  if (normProvider === "XENDIT") {
    const xenditRes = await createXenditInvoice({
      orderNumber,
      finalAmount,
      customer,
      items,
      description,
    });

    return {
      success: true,
      provider: "XENDIT",
      channel,
      referenceId: xenditRes.referenceId,
      paymentUrl: xenditRes.invoiceUrl,
      vaNumber: null,
      qrString: null,
      amount: finalAmount,
      expiredAt: new Date(Date.now() + 15 * 60 * 1000),
      rawResponse: JSON.stringify(xenditRes),
    };
  }

  // Default to Midtrans
  const midtransRes = await chargeMidtransDirect({
    orderNumber,
    finalAmount,
    channel,
    detail: methodDetail,
    customer,
  });

  return {
    success: true,
    provider: "MIDTRANS",
    channel,
    referenceId: midtransRes.referenceId,
    paymentUrl: midtransRes.redirectUrl || null,
    vaNumber: midtransRes.vaNumber || null,
    qrString: midtransRes.qrString || null,
    amount: finalAmount,
    expiredAt: new Date(Date.now() + 15 * 60 * 1000),
    rawResponse: JSON.stringify(midtransRes),
  };
}

/**
 * Process Midtrans Webhook Notification with full ACID transaction,
 * signature verification, idempotency protection, and stock release on expiration.
 */
export async function handleMidtransWebhook(payload, rawBody) {
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
    payment_type,
    transaction_id,
  } = payload;

  // 1. Signature Verification
  const isSignatureValid = verifyMidtransWebhook(payload);
  const idempotencyHash = crypto
    .createHash("sha256")
    .update(`MIDTRANS:${order_id}:${transaction_status}:${status_code}:${gross_amount}:${signature_key}`)
    .digest("hex");

  // Check if webhook already processed
  const existingLog = await prisma.paymentWebhookLog.findUnique({
    where: { idempotencyHash },
  });

  if (existingLog && existingLog.processed) {
    return {
      status: "DUPLICATE_IGNORED",
      message: "Webhook notification has already been processed (Idempotent).",
    };
  }

  // Record webhook log
  const webhookLog = await prisma.paymentWebhookLog.upsert({
    where: { idempotencyHash },
    create: {
      provider: "MIDTRANS",
      referenceId: transaction_id || null,
      orderNumber: order_id,
      eventType: transaction_status,
      signatureValid: isSignatureValid,
      idempotencyHash,
      rawPayload: JSON.stringify(payload),
      processed: false,
    },
    update: {},
  });

  if (!isSignatureValid) {
    await prisma.paymentWebhookLog.update({
      where: { id: webhookLog.id },
      data: {
        processed: true,
        processingError: "Invalid SHA-512 signature hash.",
      },
    });
    throw new Error("Invalid Midtrans webhook signature.");
  }

  // 2. Map Payment & Order Status
  let targetPaymentStatus = "PENDING";
  let isOrderPaid = false;
  let isOrderExpired = false;
  let isRefund = false;

  if (transaction_status === "capture") {
    if (fraud_status === "accept") {
      targetPaymentStatus = "SETTLEMENT";
      isOrderPaid = true;
    } else if (fraud_status === "challenge") {
      targetPaymentStatus = "CHALLENGE";
    }
  } else if (transaction_status === "settlement") {
    targetPaymentStatus = "SETTLEMENT";
    isOrderPaid = true;
  } else if (transaction_status === "cancel" || transaction_status === "deny") {
    targetPaymentStatus = "CANCEL";
    isOrderExpired = true;
  } else if (transaction_status === "expire") {
    targetPaymentStatus = "EXPIRE";
    isOrderExpired = true;
  } else if (transaction_status === "refund") {
    targetPaymentStatus = "REFUND";
    isRefund = true;
  }

  // 3. Execute State Machine in ACID Transaction
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderNumber: order_id },
      include: {
        items: {
          include: { ticketCategory: true, issuedTickets: true },
        },
        user: true,
        event: true,
      },
    });

    if (!order) {
      throw new Error(`Order ${order_id} not found in database.`);
    }

    // Update payment record
    await tx.payment.updateMany({
      where: { orderId: order.id },
      data: {
        status: targetPaymentStatus,
        paidAt: isOrderPaid ? new Date() : undefined,
        rawResponse: JSON.stringify(payload),
      },
    });

    // Handle SUCCESS / PAID
    if (isOrderPaid && order.status !== "PAID") {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      // Issue dynamic QR tickets if not yet issued
      for (const item of order.items) {
        if (item.issuedTickets.length === 0) {
          for (let i = 0; i < item.quantity; i++) {
            const ticketCode = `TKT-${order.event.slug.slice(0, 3).toUpperCase()}-${item.ticketCategory.name.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
            const hmacSecret = crypto.randomBytes(32).toString("hex");

            await tx.issuedTicket.create({
              data: {
                orderItemId: item.id,
                ticketCode,
                attendeeName: order.user.name,
                attendeeEmail: order.user.email,
                attendeeNikEncrypted: order.user.nikEncrypted || encryptNIK("3171012304900001"),
                attendeeNikLast4: order.user.nikLast4 || "0001",
                dynamicHmacSecret: hmacSecret,
                isCheckedIn: false,
              },
            });
          }
        }
      }

      // Create Success Notification
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: "Pembayaran Terkonfirmasi! E-Ticket Aktif",
          message: `Pembayaran untuk pesanan ${order.orderNumber} senilai Rp ${Number(order.finalAmount).toLocaleString("id-ID")} berhasil diverifikasi. E-ticket Anda siap digunakan.`,
          type: "PAYMENT_SUCCESS",
          linkUrl: "/account/tickets",
        },
      });
    }

    // Handle EXPIRED / CANCELLED -> Release stock back to inventory!
    if (isOrderExpired && order.status !== "EXPIRED" && order.status !== "CANCELLED" && order.status !== "PAID") {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "EXPIRED",
          cancelledAt: new Date(),
        },
      });

      // Release reserved stock back to ticket categories
      for (const item of order.items) {
        await tx.ticketCategory.update({
          where: { id: item.ticketCategoryId },
          data: {
            remainingQuota: { increment: item.quantity },
          },
        });
      }

      // Notify customer of expiration
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: "Batas Waktu Pembayaran Berakhir",
          message: `Batas waktu pembayaran pesanan ${order.orderNumber} telah habis. Kuota tiket telah dilepaskan kembali ke publik.`,
          type: "PAYMENT_EXPIRED",
        },
      });
    }

    // Handle REFUND
    if (isRefund && order.status !== "REFUNDED") {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "REFUNDED" },
      });
    }
  });

  // Mark log as successfully processed
  await prisma.paymentWebhookLog.update({
    where: { id: webhookLog.id },
    data: {
      processed: true,
      processedAt: new Date(),
    },
  });

  return {
    status: "PROCESSED",
    targetPaymentStatus,
    orderNumber: order_id,
  };
}

/**
 * Process Xendit Webhook Notification with token verification and idempotency.
 */
export async function handleXenditWebhook(payload, callbackToken) {
  const { id: invoiceId, external_id: orderNumber, status: invoiceStatus, amount } = payload;

  const isTokenValid = verifyXenditWebhookToken(callbackToken);
  const idempotencyHash = crypto
    .createHash("sha256")
    .update(`XENDIT:${orderNumber}:${invoiceId}:${invoiceStatus}:${amount}`)
    .digest("hex");

  const existingLog = await prisma.paymentWebhookLog.findUnique({
    where: { idempotencyHash },
  });

  if (existingLog && existingLog.processed) {
    return { status: "DUPLICATE_IGNORED" };
  }

  const webhookLog = await prisma.paymentWebhookLog.upsert({
    where: { idempotencyHash },
    create: {
      provider: "XENDIT",
      referenceId: invoiceId,
      orderNumber,
      eventType: invoiceStatus,
      signatureValid: isTokenValid,
      idempotencyHash,
      rawPayload: JSON.stringify(payload),
      processed: false,
    },
    update: {},
  });

  if (!isTokenValid) {
    await prisma.paymentWebhookLog.update({
      where: { id: webhookLog.id },
      data: { processed: true, processingError: "Invalid Xendit callback token." },
    });
    throw new Error("Invalid Xendit callback token.");
  }

  const isPaid = invoiceStatus === "PAID" || invoiceStatus === "SETTLED";
  const isExpired = invoiceStatus === "EXPIRED";

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: { ticketCategory: true, issuedTickets: true },
        },
        user: true,
        event: true,
      },
    });

    if (!order) return;

    if (isPaid && order.status !== "PAID") {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date() },
      });

      await tx.payment.updateMany({
        where: { orderId: order.id },
        data: { status: "SETTLEMENT", paidAt: new Date() },
      });

      // Issue dynamic QR tickets
      for (const item of order.items) {
        if (item.issuedTickets.length === 0) {
          for (let i = 0; i < item.quantity; i++) {
            const ticketCode = `TKT-${order.event.slug.slice(0, 3).toUpperCase()}-${item.ticketCategory.name.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
            const hmacSecret = crypto.randomBytes(32).toString("hex");

            await tx.issuedTicket.create({
              data: {
                orderItemId: item.id,
                ticketCode,
                attendeeName: order.user.name,
                attendeeEmail: order.user.email,
                attendeeNikEncrypted: order.user.nikEncrypted || encryptNIK("3171012304900001"),
                attendeeNikLast4: order.user.nikLast4 || "0001",
                dynamicHmacSecret: hmacSecret,
                isCheckedIn: false,
              },
            });
          }
        }
      }
    }

    if (isExpired && order.status !== "EXPIRED" && order.status !== "PAID") {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "EXPIRED", cancelledAt: new Date() },
      });

      await tx.payment.updateMany({
        where: { orderId: order.id },
        data: { status: "EXPIRE" },
      });

      // Release reserved quota
      for (const item of order.items) {
        await tx.ticketCategory.update({
          where: { id: item.ticketCategoryId },
          data: { remainingQuota: { increment: item.quantity } },
        });
      }
    }
  });

  await prisma.paymentWebhookLog.update({
    where: { id: webhookLog.id },
    data: { processed: true, processedAt: new Date() },
  });

  return { status: "PROCESSED" };
}

