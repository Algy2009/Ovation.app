import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { supportTickets, supportMessages, notifications } from "@/db/schema";
import { makeId, requireSession } from "../../../_helpers";

export async function POST(req, { params }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id: ticketId } = await params;
  const body = await req.json().catch(() => ({}));
  const text = body?.text?.trim();
  if (!text) return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });

  const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1);
  if (!ticket) return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });

  const isStaff = ["admin", "super_admin"].includes(session.user.role);
  const isOwner = ticket.buyerEmail === session.user.email;
  if (!isStaff && !isOwner) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  const from = isStaff ? "admin" : "customer";
  const now = new Date().toISOString();
  await db.insert(supportMessages).values({ id: makeId("msg"), ticketId, from, text, at: now });

  if (from === "admin") {
    await db.insert(notifications).values({
      id: makeId("ntf"),
      toEmail: ticket.buyerEmail,
      message: `Balasan baru untuk tiket "${ticket.subject}".`,
      read: false,
      createdAt: now,
    });
  }

  return NextResponse.json({ ok: true });
}
