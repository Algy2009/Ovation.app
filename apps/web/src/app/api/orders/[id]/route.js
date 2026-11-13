import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireRole, requireSession } from "../../_helpers";

export async function GET(_req, { params }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
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
  });

  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

  const isOwner = order.userId === session.user.id || order.user?.email === session.user.email;
  const isStaff = ["admin", "super_admin"].includes(session.user.role);
  if (!isOwner && !isStaff) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  const firstItem = order.items[0];
  const category = firstItem?.ticketCategory;
  const flagged = order.totalQuantity >= 4;

  const mapped = {
    id: order.id,
    orderNumber: order.orderNumber,
    eventId: order.eventId,
    eventName: order.event?.title,
    categoryId: category?.id,
    categoryName: category?.name,
    qty: order.totalQuantity,
    total: Number(order.finalAmount),
    subtotal: Number(order.subtotal),
    platformFee: Number(order.platformFee),
    adminFee: Number(order.adminFee),
    buyerName: order.user?.name,
    buyerEmail: order.user?.email,
    status: order.status.toLowerCase(),
    rawStatus: order.status,
    flagged,
    flagReason: flagged ? "Pembelian mencapai batas maksimum transaksi" : null,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt.toISOString(),
    items: order.items,
    issuedTickets: order.items.flatMap((i) => i.issuedTickets),
    payments: order.payments,
  };

  return NextResponse.json(mapped);
}

export async function PATCH(req, { params }) {
  const { session, error } = await requireRole("super_admin");
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const updateData = {};

  if (body.status) {
    let s = body.status.toUpperCase();
    if (s === "BLOCKED") s = "CANCELLED";
    if (["PENDING", "PAYMENT_PROCESSING", "PAID", "EXPIRED", "CANCELLED", "REFUNDED"].includes(s)) {
      updateData.status = s;
    }
  }

  try {
    // Record audit trail of anti-fraud action
    if (body.status === "blocked" || body.status === "CANCELLED" || body.flagged === false) {
      await prisma.auditLog.create({
        data: {
          actorId: session?.user?.id || null,
          actorRole: "SUPER_ADMIN",
          action: body.status ? "ORDER_BLOCKED" : "ORDER_FLAG_CLEARED",
          entityName: "order",
          entityId: id,
          newValues: JSON.stringify(body),
        },
      });
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.order.update({
        where: { id },
        data: updateData,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/orders/[id] error:", err);
    return NextResponse.json({ error: "Gagal memperbarui status order." }, { status: 500 });
  }
}
