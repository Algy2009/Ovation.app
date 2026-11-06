import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireRole } from "../../_helpers";

async function loadEvent(id) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      ticketCategories: true,
      organizer: true,
      category: true,
    },
  });
  if (!event) return null;

  return {
    id: event.id,
    name: event.title,
    title: event.title,
    venue: event.venueName,
    venueName: event.venueName,
    city: event.venueCity,
    venueCity: event.venueCity,
    date: event.startDatetime.toISOString().slice(0, 10),
    time: event.startDatetime.toISOString().slice(11, 16),
    startDatetime: event.startDatetime,
    endDatetime: event.endDatetime,
    genre: event.category?.name || "Festival",
    status: event.status.toLowerCase(),
    rawStatus: event.status,
    organizerId: event.organizerId,
    highDemand: event.warTicketActive,
    warTicketActive: event.warTicketActive,
    purchaseLimit: event.maxTicketsPerTransaction,
    poster: event.bannerUrl,
    bannerUrl: event.bannerUrl,
    description: event.description,
    categories: event.ticketCategories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      price: Number(c.price),
      quota: c.totalQuota,
      sold: c.totalQuota - c.remainingQuota,
      remainingQuota: c.remainingQuota,
    })),
  };
}

export async function GET(_req, { params }) {
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) return NextResponse.json({ error: "Event tidak ditemukan." }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(req, { params }) {
  const { error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const updateData = {};
  if (body.title || body.name) updateData.title = body.title || body.name;
  if (body.venue || body.venueName) updateData.venueName = body.venue || body.venueName;
  if (body.city || body.venueCity) updateData.venueCity = body.city || body.venueCity;
  if (body.description) updateData.description = body.description;
  if (body.poster || body.bannerUrl) updateData.bannerUrl = body.poster || body.bannerUrl;
  if ("highDemand" in body) updateData.warTicketActive = !!body.highDemand;
  if ("purchaseLimit" in body) {
    updateData.maxTicketsPerTransaction = Number(body.purchaseLimit) || 4;
    updateData.maxTicketsPerNik = Number(body.purchaseLimit) || 4;
  }
  if (body.status) {
    const s = body.status.toUpperCase();
    if (["DRAFT", "SUBMITTED", "APPROVED", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED"].includes(s)) {
      updateData.status = s;
    }
  }

  await prisma.event.update({
    where: { id },
    data: updateData,
  });

  const event = await loadEvent(id);
  return NextResponse.json(event);
}

export async function DELETE(_req, { params }) {
  const { error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const { id } = await params;
  await prisma.event.delete({
    where: { id },
  });
  return NextResponse.json({ ok: true });
}
