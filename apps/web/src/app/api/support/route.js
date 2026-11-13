import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../_helpers";

export async function GET(req) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const isStaff = ["admin", "super_admin"].includes(session.user.role);
    const tickets = await prisma.auditLog.findMany({
      where: isStaff ? { entityName: "support" } : { actorId: session.user.id, entityName: "support" },
      include: { actor: true },
      orderBy: { createdAt: "desc" },
    });

    const ticketIds = tickets.map((t) => t.id);
    const allMessages = await prisma.auditLog.findMany({
      where: {
        entityName: "support_message",
        entityId: { in: ticketIds },
      },
      include: { actor: true },
      orderBy: { createdAt: "asc" },
    });

    const messagesByTicket = new Map();
    for (const m of allMessages) {
      if (!messagesByTicket.has(m.entityId)) {
        messagesByTicket.set(m.entityId, []);
      }
      messagesByTicket.get(m.entityId).push({
        id: m.id,
        text: m.newValues || "",
        from: ["admin", "super_admin"].includes(m.actorRole) ? "admin" : "customer",
        at: m.createdAt.toISOString(),
      });
    }

    const mapped = tickets.map((l) => {
      const msgs = [
        {
          id: `msg_init_${l.id}`,
          text: l.newValues || "Pertanyaan dukungan pelanggan",
          from: "customer",
          at: l.createdAt.toISOString(),
        },
        ...(messagesByTicket.get(l.id) || []),
      ];

      return {
        id: l.id,
        buyerName: l.actor?.name || "Customer",
        buyerEmail: l.actor?.email || "",
        subject: l.action,
        status: l.oldValues === "closed" ? "closed" : "open",
        createdAt: l.createdAt.toISOString(),
        messages: msgs,
      };
    });

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/support error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(req) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const subject = body?.subject?.trim() || "Bantuan Tiket";
  const message = body?.message?.trim() || "";

  if (!message) {
    return NextResponse.json({ error: "Pesan bantuan wajib diisi." }, { status: 400 });
  }

  try {
    const log = await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        actorRole: session.user.role,
        action: subject,
        entityName: "support",
        entityId: `sup_${Date.now()}`,
        newValues: message,
        oldValues: "open",
      },
    });

    return NextResponse.json({ id: log.id, ok: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/support error:", err);
    return NextResponse.json({ error: "Gagal mengirim pesan." }, { status: 500 });
  }
}
