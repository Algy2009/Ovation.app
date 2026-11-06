import { z } from "zod";

export const ticketCategoryInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama kategori tiket minimal 2 karakter"),
  description: z.string().optional(),
  price: z.number().positive("Harga tiket harus lebih dari 0"),
  totalQuota: z.number().int().positive("Kuota total minimal 1 tiket"),
  maxPerTransaction: z.number().int().min(1).max(10).default(4),
  isVirtualQueueEnabled: z.boolean().default(false),
  isStanding: z.boolean().default(false),
  salesStartTime: z.string().datetime("Format tanggal mulai penjualan tidak valid"),
  salesEndTime: z.string().datetime("Format tanggal selesai penjualan tidak valid"),
});

export const createEventSchema = z.object({
  categoryId: z.string().min(1, "Kategori event wajib dipilih"),
  title: z.string().min(5, "Judul event minimal 5 karakter").max(200),
  description: z.string().min(20, "Deskripsi event minimal 20 karakter"),
  termsAndConditions: z.string().optional(),
  bannerUrl: z.string().url("URL banner event tidak valid").or(z.string().startsWith("/")),
  venueName: z.string().min(3, "Nama venue minimal 3 karakter"),
  venueCity: z.string().min(2, "Kota venue minimal 2 karakter"),
  address: z.string().min(5, "Alamat lengkap venue minimal 5 karakter"),
  startDatetime: z.string().datetime("Format waktu mulai konser tidak valid"),
  endDatetime: z.string().datetime("Format waktu selesai konser tidak valid"),
  warTicketActive: z.boolean().default(false),
  warTicketStartTime: z.string().datetime().optional().nullable(),
  maxTicketsPerNik: z.number().int().min(1).max(10).default(4),
  maxTicketsPerTransaction: z.number().int().min(1).max(10).default(4),
  ticketCategories: z.array(ticketCategoryInputSchema).min(1, "Wajib menambahkan minimal 1 kategori tiket"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type TicketCategoryInput = z.infer<typeof ticketCategoryInputSchema>;

