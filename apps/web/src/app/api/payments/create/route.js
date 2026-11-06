import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../../_helpers";
import { createPayment } from "@/lib/payments";

export async function POST(req) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { orderId, provider = "MIDTRANS", channel = "QRIS", methodDetail } = body;

  if (!orderId) {
    return NextResponse.json({ error: "orderId wajib disertakan." }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { ticketCategory: true },
        },
        user: true,
        event: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    if (order.userId !== session.user.id && !["admin", "super_admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    // Call unified payment creator
    const paymentResult = await createPayment({
      provider,
      orderNumber: order.orderNumber,
      finalAmount: Number(order.finalAmount),
      channel,
      methodDetail,
      customer: {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone,
      },
      items: order.items.map((i) => ({
        name: `${order.event.title} - ${i.ticketCategory.name}`,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
      })),
      description: `Tiket ${order.event.title} (${order.orderNumber})`,
    });

    // Create or update payment record
    const paymentRecord = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: provider.toUpperCase() === "XENDIT" ? "XENDIT" : "MIDTRANS",
        channel,
        paymentMethodDetail: methodDetail || channel,
        referenceId: paymentResult.referenceId || `ref_${order.id}`,
        merchantOrderId: order.orderNumber,
        paymentUrl: paymentResult.paymentUrl,
        vaNumber: paymentResult.vaNumber,
        qrString: paymentResult.qrString,
        amount: order.finalAmount,
        status: "PENDING",
        rawResponse: paymentResult.rawResponse,
        expiredAt: paymentResult.expiredAt,
      },
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentRecord.id,
        orderNumber: order.orderNumber,
        provider: paymentRecord.provider,
        channel: paymentRecord.channel,
        amount: Number(paymentRecord.amount),
        status: paymentRecord.status,
        paymentUrl: paymentRecord.paymentUrl,
        vaNumber: paymentRecord.vaNumber,
        qrString: paymentRecord.qrString,
        expiredAt: paymentRecord.expiredAt.toISOString(),
      },
    }, { status: 201 });
  } catch (err) {
    console.error("POST /api/payments/create error:", err);
    return NextResponse.json({ error: err.message || "Gagal membuat transaksi pembayaran." }, { status: 500 });
  }
}

