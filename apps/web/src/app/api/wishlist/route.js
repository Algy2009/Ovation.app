import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireSession } from "../_helpers";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const rows = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        event: {
          include: { ticketCategories: true },
        },
      },
    });

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/wishlist error:", err);
    return NextResponse.json({ error: "Gagal memuat wishlist." }, { status: 500 });
  }
}

export async function POST(req) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const eventId = body?.eventId;
  if (!eventId) return NextResponse.json({ error: "eventId wajib diisi." }, { status: 400 });

  try {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ wished: false });
    }

    await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        eventId,
      },
    });

    return NextResponse.json({ wished: true });
  } catch (err) {
    console.error("POST /api/wishlist error:", err);
    return NextResponse.json({ error: "Gagal memperbarui wishlist." }, { status: 500 });
  }
}
