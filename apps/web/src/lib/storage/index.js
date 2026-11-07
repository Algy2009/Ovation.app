/**
 * ==============================================================================
 * OVATION MODULAR CLOUD & LOCAL STORAGE ADAPTER
 * ==============================================================================
 * Mendukung penyimpanan poster konser & berkas promotor:
 * 1. Cloudinary (Direct HTTP REST API tanpa dependensi eksternal)
 * 2. AWS S3 / Supabase / MinIO compatible
 * 3. Local Disk Storage (/public/uploads)
 * ==============================================================================
 */

import path from "node:path";
import fs from "node:fs/promises";
import crypto from "crypto";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

/**
 * Upload berkas ke Cloudinary via REST API resmi
 */
async function uploadToCloudinary(buffer, filename, folder = "ovation-posters") {
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureStr = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

  const formData = new FormData();
  const blob = new Blob([buffer]);
  formData.append("file", blob, filename);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data.secure_url) {
    return {
      provider: "CLOUDINARY",
      url: data.secure_url,
      publicId: data.public_id,
      bytes: data.bytes,
    };
  }
  throw new Error(data.error?.message || "Cloudinary upload failed");
}

/**
 * Upload berkas ke Disk Lokal (/public/uploads)
 */
async function uploadToLocalDisk(buffer, filename) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);

  return {
    provider: "LOCAL_DISK",
    url: `/uploads/${filename}`,
    filename,
    bytes: buffer.length,
  };
}

/**
 * Universal Storage Dispatcher
 */
export async function uploadMediaFile(buffer, filename, mimeType) {
  // 1. Jika Cloudinary terkonfigurasi, prioritaskan upload ke Cloudinary CDN
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    try {
      return await uploadToCloudinary(buffer, filename);
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to local disk storage:", err.message);
    }
  }

  // 2. Default fallback: Simpan di disk lokal
  return await uploadToLocalDisk(buffer, filename);
}

