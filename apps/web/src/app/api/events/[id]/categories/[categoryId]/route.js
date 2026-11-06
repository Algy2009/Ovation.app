import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { ticketCategories } from "@/db/schema";
import { requireRole } from "../../../../_helpers";

export async function PATCH(req, { params }) {
  const { error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const { categoryId } = await params;
  const body = await req.json().catch(() => ({}));
  const [existing] = await db.select().from(ticketCategories).where(eq(ticketCategories.id, categoryId)).limit(1);
  if (!existing) return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 404 });

  const patch = {};
  if ("name" in body) patch.name = body.name;
  if ("price" in body) patch.price = Number(body.price);
  if ("quota" in body) {
    const quota = Number(body.quota);
    if (quota < existing.sold) {
      return NextResponse.json(
        { error: `Kuota tidak boleh kurang dari ${existing.sold} tiket yang sudah terjual.` },
        { status: 400 }
      );
    }
    patch.quota = quota;
  }

  await db.update(ticketCategories).set(patch).where(eq(ticketCategories.id, categoryId));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const { error } = await requireRole("admin", "super_admin");
  if (error) return error;

  const { categoryId } = await params;
  const [existing] = await db.select().from(ticketCategories).where(eq(ticketCategories.id, categoryId)).limit(1);
  if (existing && existing.sold > 0) {
    return NextResponse.json({ error: "Kategori dengan tiket terjual tidak bisa dihapus." }, { status: 400 });
  }
  await db.delete(ticketCategories).where(eq(ticketCategories.id, categoryId));
  return NextResponse.json({ ok: true });
}
