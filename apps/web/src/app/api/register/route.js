import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import bcrypt from "bcryptjs";
import { encryptNIK } from "@ovation/shared";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const phone = body?.phone?.trim();
  const nik = body?.nik?.trim();

  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Nama, email, dan kata sandi (min. 6 karakter) wajib diisi." },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nikEncrypted = nik ? encryptNIK(nik) : null;
    const nikLast4 = nik ? nik.slice(-4) : null;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "CUSTOMER",
        status: "ACTIVE",
        nikEncrypted,
        nikLast4,
        isPhoneVerified: true,
      },
    });

    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/register error:", err);
    return NextResponse.json({ error: "Gagal memproses pendaftaran akun." }, { status: 500 });
  }
}
