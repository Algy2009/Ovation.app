import { NextResponse } from "next/server";
import { auth } from "@/auth";

export function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function requireRole(...roles) {
  const session = await auth();
  if (!session?.user || !roles.includes(session.user.role)) {
    return { session: null, error: NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 }) };
  }
  return { session, error: null };
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Perlu masuk terlebih dahulu." }, { status: 401 }) };
  }
  return { session, error: null };
}
