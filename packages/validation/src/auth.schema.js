"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nikBindingSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Nama lengkap minimal 3 karakter").max(100),
    email: zod_1.z.string().email("Format email tidak valid"),
    phone: zod_1.z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Format nomor WhatsApp tidak valid (contoh: 08123456789)"),
    password: zod_1.z.string().min(8, "Password minimal 8 karakter"),
    nik: zod_1.z.string().regex(/^[0-9]{16}$/, "NIK wajib berupa 16 digit angka sesuai KTP").optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Format email tidak valid"),
    password: zod_1.z.string().min(1, "Password tidak boleh kosong"),
});
exports.nikBindingSchema = zod_1.z.object({
    nik: zod_1.z.string().regex(/^[0-9]{16}$/, "NIK wajib berupa 16 digit angka sesuai KTP"),
    fullName: zod_1.z.string().min(3, "Nama lengkap sesuai KTP minimal 3 karakter"),
});
//# sourceMappingURL=auth.schema.js.map