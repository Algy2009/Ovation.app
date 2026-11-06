import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orders, refundRequests } from "@/db/schema";
import { makeId, requireRole } from "../../../_helpers";

export async function POST(req, { params }) {
  const { session, error } = await requireRole("customer");
  if (error) return error;

  const { id: orderId } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = body?.reason?.trim();
  if (!reason) return NextResponse.json({ error: "Alasan refund wajib diisi." }, { status: 400 });

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.buyerEmail !== session.user.email) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }
  if (order.status !== "paid") {
    return NextResponse.json({ error: "Pesanan ini tidak bisa diajukan refund." }, { status: 400 });
  }

  await db.update(orders).set({ status: "refund_requested" }).where(eq(orders.id, orderId));
  await db.insert(refundRequests).values({
    id: makeId("rfd"),
    orderId,
    reason,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
