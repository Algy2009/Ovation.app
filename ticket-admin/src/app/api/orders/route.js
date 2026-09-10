import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orders, events, ticketCategories } from "@/db/schema";
import { makeId, requireRole, requireSession } from "../_helpers";

export async function GET(req) {
  const { session, error } = await requireSession();
  if (error) return error;

  const mine = new URL(req.url).searchParams.get("mine");
  if (mine) {
    const rows = await db.select().from(orders).where(eq(orders.buyerEmail, session.user.email));
    return NextResponse.json(rows);
  }

  if (!["admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }
  const rows = await db.select().from(orders);
  return NextResponse.json(rows);
}

export async function POST(req) {
  const { session, error } = await requireRole("customer");
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { eventId, categoryId } = body;
  const qty = Number(body.qty);

  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  const [category] = await db.select().from(ticketCategories).where(eq(ticketCategories.id, categoryId)).limit(1);
  if (!event || !category || event.status !== "published") {
    return NextResponse.json({ error: "Event atau kategori tidak ditemukan." }, { status: 404 });
  }
  if (!(qty >= 1) || qty > event.purchaseLimit) {
    return NextResponse.json({ error: `Jumlah tiket melebihi batas ${event.purchaseLimit} per transaksi.` }, { status: 400 });
  }
  const remaining = category.quota - category.sold;
  if (qty > remaining) {
    return NextResponse.json({ error: "Stok tiket tidak mencukupi." }, { status: 400 });
  }

  const id = makeId("ord");
  const total = category.price * qty;
  const flagged = qty >= 4;

  await db.insert(orders).values({
    id,
    eventId,
    categoryId,
    qty,
    total,
    buyerName: session.user.name,
    buyerEmail: session.user.email,
    status: "paid",
    createdAt: new Date().toISOString(),
    flagged,
    flagReason: flagged
      ? `${qty} tiket dibeli sekaligus dalam satu transaksi — melebihi pola pembelian wajar.`
      : null,
  });

  await db.update(ticketCategories).set({ sold: category.sold + qty }).where(eq(ticketCategories.id, categoryId));

  const { notifications } = await import("@/db/schema");
  await db.insert(notifications).values({
    id: makeId("ntf"),
    toEmail: session.user.email,
    message: `Pembayaran untuk "${event.name}" berhasil. E-tiket kamu sudah tersedia.`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ id }, { status: 201 });
}
