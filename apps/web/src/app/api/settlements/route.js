import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireRole } from "../_helpers";

export async function GET() {
  const { session, error } = await requireRole("admin", "super_admin");
  if (error) return error;

  try {
    const isSuperAdmin = session.user.role === "super_admin";
    let whereClause = {};

    if (!isSuperAdmin) {
      const organizer = await prisma.organizer.findFirst({
        where: { userId: session.user.id },
      });
      if (organizer) {
        whereClause = { organizerId: organizer.id };
      }
    }

    const rows = await prisma.settlement.findMany({
      where: whereClause,
      include: {
        organizer: true,
        event: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = rows.map((s) => ({
      id: s.id,
      settlementNumber: s.settlementNumber,
      organizerName: s.organizer.brandName,
      eventName: s.event.title,
      totalGrossSales: Number(s.totalGrossSales),
      totalPlatformFee: Number(s.totalPlatformFee),
      totalAdminFee: Number(s.totalAdminFee),
      netPayoutAmount: Number(s.netPayoutAmount),
      status: s.status,
      bankInfo: `${s.organizer.bankName} - ${s.organizer.bankAccountNumber} (a.n ${s.organizer.bankAccountHolder})`,
      transferReference: s.transferReference,
      createdAt: s.createdAt.toISOString(),
      transferredAt: s.transferredAt?.toISOString() || null,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/settlements error:", err);
    return NextResponse.json({ error: "Gagal memuat data settlement." }, { status: 500 });
  }
}

export async function POST(req) {
  const { session, error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { eventId } = body;

  if (!eventId) {
    return NextResponse.json({ error: "eventId wajib disertakan." }, { status: 400 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketCategories: true,
        organizer: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event tidak ditemukan." }, { status: 404 });
    }

    // Check if pending settlement already exists
    const existingPending = await prisma.settlement.findFirst({
      where: { eventId, status: "PENDING" },
    });
    if (existingPending) {
      return NextResponse.json(
        { error: "Pengajuan pencairan untuk event ini sedang menunggu peninjauan Super Admin." },
        { status: 409 }
      );
    }

    // Calculate gross sales
    let grossSales = 0;
    for (const cat of event.ticketCategories) {
      const sold = cat.totalQuota - cat.remainingQuota;
      grossSales += sold * Number(cat.price);
    }

    if (grossSales <= 0) {
      return NextResponse.json({ error: "Belum ada tiket terjual untuk dicairkan." }, { status: 400 });
    }

    const platformFee = Math.round(grossSales * 0.05);
    const adminFee = 0;
    const netPayout = grossSales - platformFee - adminFee;
    const settlementNumber = `STL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const settlement = await prisma.settlement.create({
      data: {
        settlementNumber,
        organizerId: event.organizerId,
        eventId: event.id,
        totalGrossSales: grossSales,
        totalPlatformFee: platformFee,
        totalAdminFee: adminFee,
        netPayoutAmount: netPayout,
        status: "PENDING",
      },
    });

    return NextResponse.json({ ok: true, settlement }, { status: 201 });
  } catch (err) {
    console.error("POST /api/settlements error:", err);
    return NextResponse.json({ error: "Gagal membuat pengajuan pencairan dana." }, { status: 500 });
  }
}

