"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventSchema = exports.ticketCategoryInputSchema = void 0;
const zod_1 = require("zod");
exports.ticketCategoryInputSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(2, "Nama kategori tiket minimal 2 karakter"),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive("Harga tiket harus lebih dari 0"),
    totalQuota: zod_1.z.number().int().positive("Kuota total minimal 1 tiket"),
    maxPerTransaction: zod_1.z.number().int().min(1).max(10).default(4),
    isVirtualQueueEnabled: zod_1.z.boolean().default(false),
    isStanding: zod_1.z.boolean().default(false),
    salesStartTime: zod_1.z.string().datetime("Format tanggal mulai penjualan tidak valid"),
    salesEndTime: zod_1.z.string().datetime("Format tanggal selesai penjualan tidak valid"),
});
exports.createEventSchema = zod_1.z.object({
    categoryId: zod_1.z.string().min(1, "Kategori event wajib dipilih"),
    title: zod_1.z.string().min(5, "Judul event minimal 5 karakter").max(200),
    description: zod_1.z.string().min(20, "Deskripsi event minimal 20 karakter"),
    termsAndConditions: zod_1.z.string().optional(),
    bannerUrl: zod_1.z.string().url("URL banner event tidak valid").or(zod_1.z.string().startsWith("/")),
    venueName: zod_1.z.string().min(3, "Nama venue minimal 3 karakter"),
    venueCity: zod_1.z.string().min(2, "Kota venue minimal 2 karakter"),
    address: zod_1.z.string().min(5, "Alamat lengkap venue minimal 5 karakter"),
    startDatetime: zod_1.z.string().datetime("Format waktu mulai konser tidak valid"),
    endDatetime: zod_1.z.string().datetime("Format waktu selesai konser tidak valid"),
    warTicketActive: zod_1.z.boolean().default(false),
    warTicketStartTime: zod_1.z.string().datetime().optional().nullable(),
    maxTicketsPerNik: zod_1.z.number().int().min(1).max(10).default(4),
    maxTicketsPerTransaction: zod_1.z.number().int().min(1).max(10).default(4),
    ticketCategories: zod_1.z.array(exports.ticketCategoryInputSchema).min(1, "Wajib menambahkan minimal 1 kategori tiket"),
});
//# sourceMappingURL=event.schema.js.map