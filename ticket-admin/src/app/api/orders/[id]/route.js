import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { requireRole, requireSession } from "../../_helpers";

export async function GET(_req, { params }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

  const isOwner = order.buyerEmail === session.user.email;
  const isStaff = ["admin", "super_admin"].includes(session.user.role);
  if (!isOwner && !isStaff) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  return NextResponse.json(order);
}

export async function PATCH(req, { params }) {
  const { error } = await requireRole("super_admin");
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const patch = {};
  if ("status" in body) patch.status = body.status;
  if ("flagged" in body) patch.flagged = !!body.flagged;

  await db.update(orders).set(patch).where(eq(orders.id, id));
  return NextResponse.json({ ok: true });
}
