import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../../../_helpers";
import { getMidtransStatus } from "@/lib/payments/midtrans";
import { getXenditInvoiceStatus } from "@/lib/payments/xendit";

export async function GET(_req, { params }) {
  const { session } = await requireSession().catch(() => ({ session: null }));

  const { id } = await params;

  try {
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ id }, { referenceId: id }, { orderId: id }],
      },
      include: {
        order: {
          include: { user: true, event: true, items: { include: { ticketCategory: true } } },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Data pembayaran tidak ditemukan." }, { status: 404 });
    }

    const order = payment.order;
    if (session?.user) {
      const isOwner = order.userId === session.user.id || order.user.email === session.user.email;
      const isStaff = ["admin", "super_admin"].includes(session.user.role);
      if (!isOwner && !isStaff) {
        return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
      }
    }

    // Auto-reconciliation check if payment is still pending
    if (payment.status === "PENDING" && order.status === "PENDING") {
      if (payment.provider === "MIDTRANS") {
        const liveStatus = await getMidtransStatus(order.orderNumber);
        if (liveStatus?.transaction_status === "settlement" || liveStatus?.transaction_status === "capture") {
          // Reconcile as paid
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: { status: "SETTLEMENT", paidAt: new Date() },
            });
            await tx.order.update({
              where: { id: order.id },
              data: { status: "PAID", paidAt: new Date() },
            });
          });
          payment.status = "SETTLEMENT";
          order.status = "PAID";
        }
      } else if (payment.provider === "XENDIT") {
        const liveInvoice = await getXenditInvoiceStatus(payment.referenceId);
        if (liveInvoice?.status === "PAID" || liveInvoice?.status === "SETTLED") {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: { status: "SETTLEMENT", paidAt: new Date() },
            });
            await tx.order.update({
              where: { id: order.id },
              data: { status: "PAID", paidAt: new Date() },
            });
          });
          payment.status = "SETTLEMENT";
          order.status = "PAID";
        }
      }
    }

    return NextResponse.json({
      id: payment.id,
      orderNumber: order.orderNumber,
      provider: payment.provider,
      channel: payment.channel,
      amount: Number(payment.amount),
      status: payment.status,
      orderStatus: order.status,
      paymentUrl: payment.paymentUrl,
      vaNumber: payment.vaNumber,
      qrString: payment.qrString,
      paidAt: payment.paidAt?.toISOString() || null,
      expiredAt: payment.expiredAt.toISOString(),
      event: {
        title: order.event.title,
        venueName: order.event.venueName,
      },
    });
  } catch (err) {
    console.error("GET /api/payments/[id]/status error:", err);
    return NextResponse.json({ error: "Gagal memeriksa status pembayaran." }, { status: 500 });
  }
}

