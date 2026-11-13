import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireRole } from "../../../../_helpers";

export async function PATCH(req, { params }) {
  const { error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const { categoryId } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    const existing = await prisma.ticketCategory.findUnique({
      where: { id: categoryId },
    });
    if (!existing) return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 404 });

    const sold = existing.totalQuota - existing.remainingQuota;
    const updateData = {};

    if ("name" in body) updateData.name = body.name.trim();
    if ("price" in body) updateData.price = Number(body.price);
    if ("quota" in body) {
      const quota = Number(body.quota);
      if (quota < sold) {
        return NextResponse.json(
          { error: `Kuota tidak boleh kurang dari ${sold} tiket yang sudah terjual.` },
          { status: 400 }
        );
      }
      updateData.totalQuota = quota;
      updateData.remainingQuota = quota - sold;
    }

    const updated = await prisma.ticketCategory.update({
      where: { id: categoryId },
      data: updateData,
    });

    return NextResponse.json({ ok: true, category: updated });
  } catch (err) {
    console.error("PATCH /api/events/[id]/categories/[categoryId] error:", err);
    return NextResponse.json({ error: "Gagal memperbarui kategori tiket." }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const { error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const { categoryId } = await params;

  try {
    const existing = await prisma.ticketCategory.findUnique({
      where: { id: categoryId },
    });
    if (!existing) return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 404 });

    const sold = existing.totalQuota - existing.remainingQuota;
    if (sold > 0) {
      return NextResponse.json({ error: "Kategori dengan tiket terjual tidak bisa dihapus." }, { status: 400 });
    }

    await prisma.ticketCategory.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/events/[id]/categories/[categoryId] error:", err);
    return NextResponse.json({ error: "Gagal menghapus kategori tiket." }, { status: 500 });
  }
}
