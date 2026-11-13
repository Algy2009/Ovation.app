import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireRole } from "../../_helpers";

export async function PATCH(req, { params }) {
  const { session, error } = await requireRole("super_admin");
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body.status?.toUpperCase();

  if (!status || !["APPROVED", "TRANSFERRED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Status settlement tidak valid." }, { status: 400 });
  }

  try {
    const updateData = {
      status,
      approvedByUserId: session.user.id,
      transferReference: body.transferReference || null,
    };

    if (status === "TRANSFERRED") {
      updateData.transferredAt = new Date();
    }

    const updated = await prisma.settlement.update({
      where: { id },
      data: updateData,
      include: { organizer: true, event: true },
    });

    return NextResponse.json({ ok: true, settlement: updated });
  } catch (err) {
    console.error("PATCH /api/settlements/[id] error:", err);
    return NextResponse.json({ error: "Gagal memperbarui status settlement." }, { status: 500 });
  }
}

