import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { events, ticketCategories } from "@/db/schema";
import { requireRole } from "../../_helpers";

async function loadEvent(id) {
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) return null;
  const categories = await db.select().from(ticketCategories).where(eq(ticketCategories.eventId, id));
  return { ...event, categories };
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
  const patch = {};
  for (const key of [
    "name", "venue", "city", "date", "time", "genre", "status",
    "description", "poster", "highDemand", "purchaseLimit",
  ]) {
    if (key in body) patch[key] = body[key];
  }
  if ("purchaseLimit" in patch) patch.purchaseLimit = Number(patch.purchaseLimit) || 1;
  if ("highDemand" in patch) patch.highDemand = !!patch.highDemand;

  await db.update(events).set(patch).where(eq(events.id, id));
  const event = await loadEvent(id);
  return NextResponse.json(event);
}

export async function DELETE(_req, { params }) {
  const { error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const { id } = await params;
  await db.delete(ticketCategories).where(eq(ticketCategories.eventId, id));
  await db.delete(events).where(eq(events.id, id));
  return NextResponse.json({ ok: true });
}
