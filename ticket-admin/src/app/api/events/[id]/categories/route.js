import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { ticketCategories } from "@/db/schema";
import { makeId, requireRole } from "../../../_helpers";

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

  const id = makeId("cat");
  await db.insert(ticketCategories).values({ id, eventId, name, price, quota, sold: 0 });
  return NextResponse.json({ id }, { status: 201 });
}
