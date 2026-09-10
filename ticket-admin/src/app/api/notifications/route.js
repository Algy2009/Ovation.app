import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { notifications } from "@/db/schema";
import { requireSession } from "../_helpers";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;
  const rows = await db.select().from(notifications).where(eq(notifications.toEmail, session.user.email));
  return NextResponse.json(rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

export async function PATCH() {
  const { session, error } = await requireSession();
  if (error) return error;
  await db.update(notifications).set({ read: true }).where(eq(notifications.toEmail, session.user.email));
  return NextResponse.json({ ok: true });
}
