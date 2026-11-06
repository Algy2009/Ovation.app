import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../_helpers";

export async function GET(req) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const isStaff = ["admin", "super_admin"].includes(session.user.role);
    const logs = await prisma.auditLog.findMany({
      where: isStaff ? { entityName: "support" } : { actorId: session.user.id, entityName: "support" },
      orderBy: { createdAt: "desc" },
    });

    const mapped = logs.map((l) => ({
      id: l.id,
      buyerName: session.user.name,
      buyerEmail: session.user.email,
      subject: l.action,
      status: "open",
      createdAt: l.createdAt.toISOString(),
      messages: [{ id: `msg_${l.id}`, text: l.newValues || "Pertanyaan dukungan pelanggan", from: "customer", at: l.createdAt.toISOString() }],
    }));

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
      },
    });

    return NextResponse.json({ id: log.id, ok: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/support error:", err);
    return NextResponse.json({ error: "Gagal mengirim pesan." }, { status: 500 });
  }
}
