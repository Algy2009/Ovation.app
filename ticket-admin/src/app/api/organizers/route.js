import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { organizers } from "@/db/schema";
import { requireRole } from "../_helpers";

export async function GET() {
  const { error } = await requireRole("admin", "super_admin");
  if (error) return error;
  const rows = await db.select().from(organizers);
  return NextResponse.json(rows);
}
