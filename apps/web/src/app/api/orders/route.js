import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../_helpers";
import { encryptNIK } from "@ovation/shared";
import crypto from "crypto";

export async function GET(req) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const url = new URL(req.url);
    const mine = url.searchParams.get("mine");
    const isStaff = ["admin", "super_admin"].includes(session.user.role);

    const whereClause = (mine || !isStaff) ? { userId: session.user.id } : {};

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        event: true,
        items: {
          include: {
            ticketCategory: true,
            issuedTickets: true,
          },
        },
        payments: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = orders.map((o) => {
      const firstItem = o.items[0];
      const category = firstItem?.ticketCategory;
      const flagged = o.totalQuantity >= 4;

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        eventId: o.eventId,
        eventName: o.event?.title || "Konser",
        categoryId: category?.id,
        categoryName: category?.name,
        qty: o.totalQuantity,
        total: Number(o.finalAmount),
        subtotal: Number(o.subtotal),
        platformFee: Number(o.platformFee),
        adminFee: Number(o.adminFee),
        buyerName: o.user?.name || "Customer",
        buyerEmail: o.user?.email || "",
        status: o.status.toLowerCase(),
        rawStatus: o.status,
        flagged,
        flagReason: flagged ? "Pembelian mencapai batas maksimum transaksi" : null,
        paymentMethod: o.paymentMethod || "QRIS",
        createdAt: o.createdAt.toISOString(),
        items: o.items,
        issuedTickets: o.items.flatMap((i) => i.issuedTickets),
        payments: o.payments,
      };
    });

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: "Gagal memuat pesanan." }, { status: 500 });
  }
}

export async function POST(req) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { eventId, categoryId } = body;
  const qty = Number(body.qty) || 1;

  if (!eventId || !categoryId || qty < 1) {
    return NextResponse.json({ error: "Parameter pesanan tidak lengkap." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });
      if (!event || event.status !== "PUBLISHED") {
        throw new Error("Event tidak ditemukan atau belum dibuka untuk penjualan.");
      }

      if (qty > event.maxTicketsPerTransaction) {
        throw new Error(`Maksimal ${event.maxTicketsPerTransaction} tiket per transaksi.`);
      }

      const category = await tx.ticketCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new Error("Kategori tiket tidak valid.");
      }

      // SELECT FOR UPDATE to acquire exclusive row lock
      const lockedRows = await tx.$queryRaw`
        SELECT id, remaining_quota AS remainingQuota 
        FROM ticket_categories 
        WHERE id = ${categoryId} 
        FOR UPDATE
      `;

      if (!lockedRows || lockedRows.length === 0 || lockedRows[0].remainingQuota < qty) {
        throw new Error("Stok tiket tidak mencukupi atau sudah habis terjual.");
      }

      // Atomic stock decrement with strict non-negative guard
      const updatedRows = await tx.$executeRaw`
        UPDATE ticket_categories 
        SET remaining_quota = remaining_quota - ${qty} 
        WHERE id = ${categoryId} AND remaining_quota >= ${qty}
      `;

      if (updatedRows === 0) {
        throw new Error("Stok tiket tidak mencukupi atau sudah habis terjual.");
      }

      const unitPrice = Number(category.price);
      const subtotal = unitPrice * qty;
      const platformFee = Math.round(subtotal * 0.05);
      const adminFee = 5000;
      const finalAmount = subtotal + platformFee + adminFee;
      const orderNumber = `OVN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      // Create Order with status PAID (or PENDING if choosing external gateway)
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          eventId: event.id,
          totalQuantity: qty,
          subtotal,
          platformFee,
          adminFee,
          finalAmount,
          status: "PAID",
          paymentMethod: body.paymentMethod || "QRIS",
          expiredAt: new Date(Date.now() + 15 * 60 * 1000),
          paidAt: new Date(),
          idempotencyKey: body.idempotencyKey || `idemp_${Date.now()}_${Math.random()}`,
        },
      });

      // Create Order Item
      const orderItem = await tx.orderItem.create({
        data: {
          orderId: order.id,
          ticketCategoryId: category.id,
          quantity: qty,
          unitPrice,
          subtotal,
        },
      });

      // Issue dynamic QR tickets with unique HMAC secrets
      for (let i = 0; i < qty; i++) {
        const ticketCode = `TKT-${event.slug.slice(0, 3).toUpperCase()}-${category.name.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const hmacSecret = crypto.randomBytes(32).toString("hex");

        await tx.issuedTicket.create({
          data: {
            orderItemId: orderItem.id,
            ticketCode,
            attendeeName: session.user.name,
            attendeeEmail: session.user.email,
            attendeeNikEncrypted: encryptNIK("3171012304900001"),
            attendeeNikLast4: "0001",
            dynamicHmacSecret: hmacSecret,
            isCheckedIn: false,
          },
        });
      }

      // Create Payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: "MIDTRANS",
          channel: "QRIS",
          paymentMethodDetail: "GOPAY_QRIS",
          referenceId: `mid_${order.id}`,
          merchantOrderId: order.orderNumber,
          amount: finalAmount,
          status: "SETTLEMENT",
          paidAt: new Date(),
          expiredAt: new Date(Date.now() + 15 * 60 * 1000),
          qrString: "00020101021226670016ID.CO.OVATION.WWW0118936009990000010002021500000192835204581253033605802ID5914OVATION TICKETS6007JAKARTA62070703A0163046B2F",
        },
      });

      // Create Notification
      await tx.notification.create({
        data: {
          userId: session.user.id,
          title: "Pembayaran Berhasil! E-Ticket Terbit",
          message: `Pesanan ${order.orderNumber} untuk ${event.title} (${qty}x ${category.name}) telah berhasil dikonfirmasi.`,
          type: "PAYMENT_SUCCESS",
          linkUrl: `/account/tickets`,
        },
      });

      return order;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ error: err.message || "Gagal memproses pesanan." }, { status: 400 });
  }
}
