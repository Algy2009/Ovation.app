import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../_helpers";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const isStaff = ["admin", "super_admin"].includes(session.user.role);
    const whereClause = isStaff ? {} : { userId: session.user.id };

    const rows = await prisma.refundRequest.findMany({
      where: whereClause,
      include: {
        order: {
          include: { event: true },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = rows.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      orderNumber: r.order.orderNumber,
      eventName: r.order.event.title,
      userName: r.user.name,
      userEmail: r.user.email,
      reason: r.reason,
      refundAmount: Number(r.refundAmount),
      bankName: r.bankName,
      bankAccountNumber: r.bankAccountNumber,
      bankAccountHolder: r.bankAccountHolder,
      status: r.status.toLowerCase(),
      rawStatus: r.status,
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/refunds error:", err);
    return NextResponse.json({ error: "Gagal memuat refund." }, { status: 500 });
  }
}

export async function POST(req) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { orderId, reason, bankName, bankAccountNumber, bankAccountHolder } = body;

  if (!orderId || !reason || !bankName || !bankAccountNumber || !bankAccountHolder) {
    return NextResponse.json({ error: "Seluruh informasi refund dan rekening wajib diisi." }, { status: 400 });
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

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/refunds error:", err);
    return NextResponse.json({ error: "Gagal membuat permohonan refund." }, { status: 500 });
  }
}
