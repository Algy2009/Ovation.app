import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { refundRequests, orders, notifications } from "@/db/schema";
import { makeId, requireRole } from "../../_helpers";

export async function PATCH(req, { params }) {
  const { error } = await requireRole("super_admin");
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!["approved", "rejected"].includes(body?.status)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  const [refund] = await db.select().from(refundRequests).where(eq(refundRequests.id, id)).limit(1);
  if (!refund) return NextResponse.json({ error: "Permintaan tidak ditemukan." }, { status: 404 });

  const [order] = await db.select().from(orders).where(eq(orders.id, refund.orderId)).limit(1);

  await db.update(refundRequests).set({ status: body.status }).where(eq(refundRequests.id, id));
  await db.update(orders).set({ status: body.status === "approved" ? "refunded" : "paid" }).where(eq(orders.id, refund.orderId));

  if (order) {
    await db.insert(notifications).values({
      id: makeId("ntf"),
      toEmail: order.buyerEmail,
      message:
        body.status === "approved"
          ? `Refund untuk pesanan ${order.id} disetujui dan sedang diproses.`
          : `Permintaan refund untuk pesanan ${order.id} ditolak.`,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
