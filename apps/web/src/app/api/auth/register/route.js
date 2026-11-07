import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import bcrypt from "bcryptjs";
import { registerSchema } from "@ovation/validation";
import { encryptNIK } from "@ovation/shared";
import { sendWhatsAppOTP } from "@/lib/notifications/whatsapp";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Data pendaftaran tidak valid.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, phone, password, nik } = parseResult.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan login." }, { status: 409 });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const nikEncrypted = nik ? encryptNIK(nik) : null;
    const nikLast4 = nik ? nik.slice(-4) : null;

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        passwordHash,
        role: "CUSTOMER",
        status: "ACTIVE",
        nikEncrypted,
        nikLast4,
        isPhoneVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        nikLast4: true,
        createdAt: true,
      },
    });

    // Send WhatsApp Welcome & OTP Verification
    if (phone) {
      const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
      sendWhatsAppOTP(phone, demoOtp).catch((err) => console.error("WhatsApp OTP error:", err));
    }

    return NextResponse.json({ message: "Registrasi berhasil.", user }, { status: 201 });
  } catch (err) {
    console.error("POST /api/auth/register error:", err);
    return NextResponse.json({ error: "Gagal memproses registrasi akun." }, { status: 500 });
  }
}

