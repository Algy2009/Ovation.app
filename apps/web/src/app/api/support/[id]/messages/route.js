import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../../../_helpers";

export async function POST(req, { params }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id: ticketId } = await params;
  const body = await req.json().catch(() => ({}));
  const text = body?.text?.trim();

  if (!text) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
  }

  try {
    const ticket = await prisma.auditLog.findUnique({
      where: { id: ticketId },
      include: { actor: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
    }

    const isStaff = ["admin", "super_admin"].includes(session.user.role);
    const isOwner = ticket.actorId === session.user.id;
    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
    }

    const messageLog = await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        actorRole: session.user.role,
        action: `REPLY: ${ticket.action}`,
        entityName: "support_message",
        entityId: ticketId,
        newValues: text,
      },
    });

    if (isStaff && ticket.actorId) {
      await prisma.notification.create({
        data: {
          userId: ticket.actorId,
          title: "Balasan Customer Service",
          message: `Tim Ovation telah membalas tiket bantuan Anda: "${text.slice(0, 80)}..."`,
          type: "EVENT_UPDATE",
          linkUrl: "/help",
        },
      });
    }

    return NextResponse.json({ ok: true, messageId: messageLog.id });
  } catch (err) {
    console.error("POST /api/support/[id]/messages error:", err);
    return NextResponse.json({ error: "Gagal mengirim balasan." }, { status: 500 });
  }
}
