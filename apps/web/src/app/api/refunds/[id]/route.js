import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireRole } from "../../_helpers";

export async function PATCH(req, { params }) {
  const { session, error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body.status?.toUpperCase();

  const validStatuses = [
    "ORGANIZER_APPROVED",
    "SUPERADMIN_APPROVED",
    "REJECTED",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
  ];

  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Status refund tidak valid." }, { status: 400 });
  }

  const updateData = {
    status,
    rejectionReason: body.rejectionReason || null,
  };

  if (session.user.role === "admin") {
    updateData.reviewedByOrganizerId = session.user.id;
    updateData.reviewedByOrganizerAt = new Date();
  } else if (session.user.role === "super_admin") {
    updateData.approvedBySuperAdminId = session.user.id;
    updateData.approvedBySuperAdminAt = new Date();
  }

  if (status === "COMPLETED") {
    updateData.completedAt = new Date();
  }

  const updated = await prisma.refundRequest.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ ok: true, refund: updated });
}
