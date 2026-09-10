import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { supportTickets } from "@/db/schema";
import { requireRole } from "../../_helpers";

export async function PATCH(req, { params }) {
  const { error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body?.status !== "closed") {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }
  await db.update(supportTickets).set({ status: "closed" }).where(eq(supportTickets.id, id));
  return NextResponse.json({ ok: true });
}
