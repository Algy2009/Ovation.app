import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireRole } from "../_helpers";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        ticketCategories: true,
        organizer: true,
        category: true,
      },
      orderBy: { startDatetime: "asc" },
    });

    const mapped = events.map((e) => ({
      id: e.id,
      name: e.title,
      title: e.title,
      venue: e.venueName,
      venueName: e.venueName,
      city: e.venueCity,
      venueCity: e.venueCity,
      date: e.startDatetime.toISOString().slice(0, 10),
      time: e.startDatetime.toISOString().slice(11, 16),
      startDatetime: e.startDatetime,
      endDatetime: e.endDatetime,
      genre: e.category?.name || "Festival",
      status: e.status.toLowerCase(),
      rawStatus: e.status,
      organizerId: e.organizerId,
      highDemand: e.warTicketActive,
      warTicketActive: e.warTicketActive,
      purchaseLimit: e.maxTicketsPerTransaction,
      poster: e.bannerUrl,
      bannerUrl: e.bannerUrl,
      description: e.description,
      categories: e.ticketCategories.map((c) => ({
        id: c.id,
        name: c.name,
        price: Number(c.price),
        quota: c.totalQuota,
        sold: c.totalQuota - c.remainingQuota,
        remainingQuota: c.remainingQuota,
      })),
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/events error:", err);
    return NextResponse.json({ error: "Gagal memuat data event." }, { status: 500 });
  }
}

export async function POST(req) {
  const { session, error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const body = await req.json().catch(() => null);
  if (!body?.name && !body?.title) {
    return NextResponse.json({ error: "Nama/judul event wajib diisi." }, { status: 400 });
  }

  try {
    const title = body.title || body.name;
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

    let category = await prisma.eventCategory.findFirst();
    if (!category) {
      category = await prisma.eventCategory.create({
        data: { name: "Music Concert", slug: "music-concert" },
      });
    }

    let organizer = await prisma.organizer.findFirst({
      where: { userId: session.user.id },
    });
    if (!organizer) {
      organizer = await prisma.organizer.findFirst();
    }

    const created = await prisma.event.create({
      data: {
        title,
        slug,
        organizerId: organizer?.id || body.organizerId,
        categoryId: category.id,
        description: body.description || "",
        bannerUrl: body.poster || body.bannerUrl || "/images/events/dewa_19.jpg",
        venueName: body.venue || body.venueName || "Venue Konser",
        venueCity: body.city || body.venueCity || "Jakarta",
        address: body.address || "Jakarta, Indonesia",
        startDatetime: new Date(body.date ? `${body.date}T${body.time || "19:00"}:00Z` : Date.now() + 86400000 * 30),
        endDatetime: new Date(body.date ? `${body.date}T23:00:00Z` : Date.now() + 86400000 * 30 + 14400000),
        status: "PUBLISHED",
        warTicketActive: !!body.highDemand,
        maxTicketsPerNik: Number(body.purchaseLimit) || 4,
        maxTicketsPerTransaction: Number(body.purchaseLimit) || 4,
      },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/events error:", err);
    return NextResponse.json({ error: "Gagal membuat event." }, { status: 500 });
  }
}
