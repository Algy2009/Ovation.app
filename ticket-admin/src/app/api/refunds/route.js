import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { refundRequests } from "@/db/schema";
import { requireRole } from "../_helpers";

export async function GET() {
  const { error } = await requireRole("super_admin");
  if (error) return error;
  const rows = await db.select().from(refundRequests);
  return NextResponse.json(rows);
}
