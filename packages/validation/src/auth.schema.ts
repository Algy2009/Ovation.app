import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Nama lengkap minimal 3 karakter").max(100),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Format nomor WhatsApp tidak valid (contoh: 08123456789)"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  nik: z.string().regex(/^[0-9]{16}$/, "NIK wajib berupa 16 digit angka sesuai KTP").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

export const nikBindingSchema = z.object({
  nik: z.string().regex(/^[0-9]{16}$/, "NIK wajib berupa 16 digit angka sesuai KTP"),
  fullName: z.string().min(3, "Nama lengkap sesuai KTP minimal 3 karakter"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type NikBindingInput = z.infer<typeof nikBindingSchema>;

