import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireRole } from "../../../_helpers";

export async function POST(req, { params }) {
  const { error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const { id: eventId } = await params;
  const body = await req.json().catch(() => ({}));
  const name = body?.name?.trim();
  const price = Number(body?.price);
  const quota = Number(body?.quota);

  if (!name || !(price >= 0) || !(quota >= 0)) {
    return NextResponse.json({ error: "Nama, harga, dan kuota tidak valid." }, { status: 400 });
  }

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event tidak ditemukan." }, { status: 404 });
    }

    const created = await prisma.ticketCategory.create({
      data: {
        eventId,
        name,
        price,
        totalQuota: quota,
        remainingQuota: quota,
        salesStartTime: event.startDatetime ? new Date(Math.min(Date.now(), event.startDatetime.getTime())) : new Date(),
        salesEndTime: event.endDatetime || new Date(Date.now() + 86400000 * 30),
      },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/events/[id]/categories error:", err);
    return NextResponse.json({ error: "Gagal menambahkan kategori tiket." }, { status: 500 });
  }
}
