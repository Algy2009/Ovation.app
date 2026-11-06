import { NextResponse } from "next/server";
import { prisma } from "@/db/client";

export async function GET(_req, { params }) {
  const { id: eventId } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketCategories: {
          orderBy: { price: "asc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event tidak ditemukan." }, { status: 404 });
    }

    const tickets = event.ticketCategories.map((cat) => ({
      id: cat.id,
      eventId: cat.eventId,
      name: cat.name,
      description: cat.description,
      price: Number(cat.price),
      totalQuota: cat.totalQuota,
      remainingQuota: cat.remainingQuota,
      soldCount: cat.totalQuota - cat.remainingQuota,
      maxPerTransaction: cat.maxPerTransaction,
      isStanding: cat.isStanding,
      isVirtualQueueEnabled: cat.isVirtualQueueEnabled,
      salesStartTime: cat.salesStartTime,
      salesEndTime: cat.salesEndTime,
      isSoldOut: cat.remainingQuota <= 0,
    }));

    return NextResponse.json(tickets);
  } catch (err) {
    console.error("GET /api/events/[id]/tickets error:", err);
    return NextResponse.json({ error: "Gagal memuat daftar kategori tiket." }, { status: 500 });
  }
}

