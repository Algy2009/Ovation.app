import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireRole } from "../../_helpers";

export async function PATCH(req, { params }) {
  const { session, error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  let status = body.status?.toUpperCase();

  // Normalize legacy "APPROVED" status
  if (status === "APPROVED") {
    status = session.user.role === "admin" ? "ORGANIZER_APPROVED" : "SUPERADMIN_APPROVED";
  }

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

  if (status === "COMPLETED" || status === "SUPERADMIN_APPROVED") {
    updateData.completedAt = new Date();
  }

  try {
    const updated = await prisma.refundRequest.update({
      where: { id },
      data: updateData,
      include: { order: true, user: true },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: updated.userId,
        title: "Pembaruan Pengajuan Refund",
        message: `Pengajuan refund pesanan ${updated.order.orderNumber} telah diperbarui menjadi: ${status}.`,
        type: "REFUND_UPDATE",
        linkUrl: "/account/tickets",
      },
    });

    return NextResponse.json({ ok: true, refund: updated });
  } catch (err) {
    console.error("PATCH /api/refunds/[id] error:", err);
    return NextResponse.json({ error: "Gagal memperbarui status refund." }, { status: 500 });
  }
}
