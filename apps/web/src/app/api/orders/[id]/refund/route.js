import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../../../_helpers";

export async function POST(req, { params }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id: orderId } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = body?.reason?.trim();
  const bankName = body?.bankName?.trim() || "BCA";
  const bankAccountNumber = body?.bankAccountNumber?.trim() || "1234567890";
  const bankAccountHolder = body?.bankAccountHolder?.trim() || session.user.name || "Customer";

  if (!reason) {
    return NextResponse.json({ error: "Alasan refund wajib diisi." }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan atau bukan milik akun Anda." }, { status: 404 });
    }

    if (order.status !== "PAID") {
      return NextResponse.json({ error: "Hanya pesanan berstatus lunas yang dapat diajukan refund." }, { status: 400 });
    }

    const created = await prisma.refundRequest.create({
      data: {
        orderId,
        userId: session.user.id,
        reason,
        refundAmount: order.subtotal,
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        status: "REQUESTED",
      },
    });

    return NextResponse.json({ ok: true, refund: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/orders/[id]/refund error:", err);
    return NextResponse.json({ error: "Gagal memproses permohonan refund." }, { status: 500 });
  }
}
