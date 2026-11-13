import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../../_helpers";

export async function PATCH(req, { params }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body?.status === "closed" ? "closed" : "open";

  try {
    const ticket = await prisma.auditLog.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
    }

    const isStaff = ["admin", "super_admin"].includes(session.user.role);
    const isOwner = ticket.actorId === session.user.id;
    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
    }

    await prisma.auditLog.update({
      where: { id },
      data: {
        oldValues: status,
      },
    });

    return NextResponse.json({ ok: true, status });
  } catch (err) {
    console.error("PATCH /api/support/[id] error:", err);
    return NextResponse.json({ error: "Gagal memperbarui status tiket." }, { status: 500 });
  }
}
