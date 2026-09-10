import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { wishlist } from "@/db/schema";
import { makeId, requireRole } from "../_helpers";

export async function GET() {
  const { session, error } = await requireRole("customer");
  if (error) return error;
  const rows = await db.select().from(wishlist).where(eq(wishlist.buyerEmail, session.user.email));
  return NextResponse.json(rows);
}

export async function POST(req) {
  const { session, error } = await requireRole("customer");
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const eventId = body?.eventId;
  if (!eventId) return NextResponse.json({ error: "eventId wajib diisi." }, { status: 400 });

  const [existing] = await db
    .select()
    .from(wishlist)
    .where(and(eq(wishlist.buyerEmail, session.user.email), eq(wishlist.eventId, eventId)))
    .limit(1);

  if (existing) {
    await db.delete(wishlist).where(eq(wishlist.id, existing.id));
    return NextResponse.json({ wished: false });
  }

  await db.insert(wishlist).values({ id: makeId("wl"), buyerEmail: session.user.email, eventId });
  return NextResponse.json({ wished: true });
}
