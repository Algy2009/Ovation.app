import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Nama, email, dan kata sandi (min. 6 karakter) wajib diisi." },
      { status: 400 }
    );
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    id: makeId("usr"),
    name,
    email,
    passwordHash,
    role: "customer",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
