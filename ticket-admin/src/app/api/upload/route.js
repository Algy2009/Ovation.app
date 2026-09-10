import { NextResponse } from "next/server";
import { requireRole } from "../_helpers";
import path from "node:path";
import fs from "node:fs/promises";

export async function POST(request) {
  const { session, error } = await requireRole("admin", "super_admin");
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "File gambar tidak ditemukan." }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap gunakan format JPG, PNG, atau WebP." },
        { status: 400 }
      );
    }

    // Max 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran gambar terlalu besar (maksimal 5MB)." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `poster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: publicUrl, filename });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Gagal mengunggah gambar: " + err.message }, { status: 500 });
  }
}
