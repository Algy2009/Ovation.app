import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { organizers } from "@/db/schema";
import { requireRole } from "../../_helpers";

export async function PATCH(req, { params }) {
  const { error } = await requireRole("super_admin");
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!["approved", "rejected"].includes(body?.status)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }
  await db.update(organizers).set({ status: body.status }).where(eq(organizers.id, id));
  return NextResponse.json({ ok: true });
}
