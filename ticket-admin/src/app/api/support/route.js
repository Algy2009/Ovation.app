import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { supportTickets, supportMessages } from "@/db/schema";
import { makeId, requireRole, requireSession } from "../_helpers";

async function withMessages(ticketRows) {
  const allMessages = await db.select().from(supportMessages);
  return ticketRows.map((t) => ({
    ...t,
    messages: allMessages.filter((m) => m.ticketId === t.id).sort((a, b) => (a.at < b.at ? -1 : 1)),
  }));
}

export async function GET(req) {
  const { session, error } = await requireSession();
  if (error) return error;

  const mine = new URL(req.url).searchParams.get("mine");
  let rows;
  if (mine) {
    rows = await db.select().from(supportTickets).where(eq(supportTickets.buyerEmail, session.user.email));
  } else {
    if (!["admin", "super_admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
    }
    rows = await db.select().from(supportTickets);
  }
  return NextResponse.json(await withMessages(rows));
}

export async function POST(req) {
  const { session, error } = await requireRole("customer");
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const subject = body?.subject?.trim();
  const message = body?.message?.trim();
  if (!subject || !message) {
    return NextResponse.json({ error: "Topik dan pesan wajib diisi." }, { status: 400 });
  }

  const id = makeId("sup");
  const now = new Date().toISOString();
  await db.insert(supportTickets).values({
    id,
    buyerName: session.user.name,
    buyerEmail: session.user.email,
    subject,
    status: "open",
    createdAt: now,
  });
  await db.insert(supportMessages).values({ id: makeId("msg"), ticketId: id, from: "customer", text: message, at: now });

  return NextResponse.json({ id }, { status: 201 });
}
