import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { handleMidtransWebhook } from "@/lib/payments";
import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderNumber, action = "SETTLEMENT" } = body;

    if (!orderNumber) {
      return NextResponse.json({ error: "orderNumber wajib disertakan." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json({ error: `Order ${orderNumber} tidak ditemukan.` }, { status: 404 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-TEST_SANDBOX_KEY";
    const statusCode = action === "SETTLEMENT" ? "200" : action === "EXPIRE" ? "202" : "202";
    const transactionStatus = action === "SETTLEMENT" ? "settlement" : action === "EXPIRE" ? "expire" : "cancel";
    const grossAmount = Math.round(Number(order.finalAmount)).toString() + ".00";

    // Compute exact SHA-512 signature formula: SHA512(order_id + status_code + gross_amount + ServerKey)
    const signaturePayload = `${orderNumber}${statusCode}${grossAmount}${serverKey}`;
    const signatureKey = crypto.createHash("sha512").update(signaturePayload).digest("hex");

    const midtransPayload = {
      order_id: orderNumber,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: transactionStatus,
      fraud_status: "accept",
      payment_type: "qris",
      transaction_id: `trans_${Date.now()}`,
      transaction_time: new Date().toISOString(),
    };

    const result = await handleMidtransWebhook(midtransPayload, JSON.stringify(midtransPayload));

    // Return updated order state
    const updatedOrder = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { issuedTickets: true } },
        payments: true,
      },
    });

    return NextResponse.json({
      message: `Simulasi webhook Midtrans (${action}) berhasil diproses.`,
      result,
      order: {
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        issuedTicketsCount: updatedOrder.items.flatMap((i) => i.issuedTickets).length,
      },
    });
  } catch (err) {
    console.error("POST /api/payments/simulate error:", err);
    return NextResponse.json({ error: err.message || "Gagal memproses simulasi webhook." }, { status: 500 });
  }
}

