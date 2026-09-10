import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { events, ticketCategories } from "@/db/schema";
import { makeId, requireRole } from "../_helpers";

async function withCategories(eventRows) {
  const allCategories = await db.select().from(ticketCategories);
  return eventRows.map((e) => ({
    ...e,
    categories: allCategories.filter((c) => c.eventId === e.id),
  }));
}

export async function GET() {
  const rows = await db.select().from(events);
  const withCats = await withCategories(rows);
  return NextResponse.json(withCats);
}

export async function POST(req) {
  const { error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.venue || !body?.date) {
    return NextResponse.json({ error: "Nama, venue, dan tanggal wajib diisi." }, { status: 400 });
  }

  const id = makeId("evt");
  await db.insert(events).values({
    id,
    name: body.name,
    venue: body.venue,
    city: body.city ?? "",
    date: body.date,
    time: body.time ?? "",
    genre: body.genre ?? "Festival",
    status: body.status ?? "draft",
    organizerId: body.organizerId ?? null,
    highDemand: !!body.highDemand,
    purchaseLimit: Number(body.purchaseLimit) || 4,
    description: body.description ?? "",
    poster: body.poster ?? null,
  });

  return NextResponse.json({ id }, { status: 201 });
}
