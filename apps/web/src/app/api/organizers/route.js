import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireRole } from "../_helpers";

export async function GET() {
  const { error } = await requireRole("admin", "super_admin");
  if (error) return error;

  try {
    const rows = await prisma.organizer.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = rows.map((r) => ({
      id: r.id,
      name: r.brandName,
      company: r.companyName,
      email: r.email,
      phone: r.phone,
      bank: `${r.bankName} - ${r.bankAccountNumber} (a.n ${r.bankAccountHolder})`,
      status: r.verificationStatus.toLowerCase(),
      rawStatus: r.verificationStatus,
      submittedAt: r.createdAt.toISOString().slice(0, 10),
      feePercentage: Number(r.feePercentage),
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/organizers error:", err);
    return NextResponse.json({ error: "Gagal memuat data promotor." }, { status: 500 });
  }
}
