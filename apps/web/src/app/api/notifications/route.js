import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../_helpers";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const rows = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const mapped = rows.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.isRead,
      isRead: n.isRead,
      linkUrl: n.linkUrl,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json({ error: "Gagal memuat notifikasi." }, { status: 500 });
  }
}

export async function PATCH() {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/notifications error:", err);
    return NextResponse.json({ error: "Gagal memperbarui notifikasi." }, { status: 500 });
  }
}
