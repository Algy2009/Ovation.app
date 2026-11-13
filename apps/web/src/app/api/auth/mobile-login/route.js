import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password?.toString();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan kata sandi wajib diisi." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Email atau kata sandi tidak sesuai." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Email atau kata sandi tidak sesuai." }, { status: 401 });
    }

    // Generate session token
    const token = `mob_${user.id}_${crypto.randomBytes(24).toString("hex")}`;

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        nikLast4: user.nikLast4,
      },
    });
  } catch (err) {
    console.error("POST /api/auth/mobile-login error:", err);
    return NextResponse.json({ error: "Gagal memproses login mobile." }, { status: 500 });
  }
}

