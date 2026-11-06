import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireRole } from "../../_helpers";

export async function PATCH(req, { params }) {
  const { session, error } = await requireRole("super_admin");
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body.status?.toUpperCase();

  if (!status || !["APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  const updated = await prisma.organizer.update({
    where: { id },
    data: {
      verificationStatus: status,
      verifiedAt: status === "APPROVED" ? new Date() : null,
      verifiedByUserId: status === "APPROVED" ? session.user.id : null,
      rejectionReason: body.rejectionReason || null,
    },
  });

  return NextResponse.json({ ok: true, organizer: updated });
}
