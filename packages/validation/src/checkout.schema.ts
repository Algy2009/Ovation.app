import { z } from "zod";

export const attendeeInfoSchema = z.object({
  name: z.string().min(3, "Nama penonton minimal 3 karakter"),
  email: z.string().email("Format email penonton tidak valid"),
  phone: z.string().min(9, "Nomor WhatsApp penonton minimal 9 digit").optional(),
  nik: z.string().regex(/^[0-9]{16}$/, "NIK wajib berupa 16 digit angka"),
});

export const checkoutItemSchema = z.object({
  ticketCategoryId: z.string().min(1, "Kategori tiket wajib dipilih"),
  quantity: z.number().int().min(1, "Jumlah tiket minimal 1").max(4, "Maksimal 4 tiket per transaksi"),
});

export const checkoutRequestSchema = z.object({
  eventId: z.string().min(1, "Event ID wajib disertakan"),
  queueToken: z.string().optional(), // Required if event has active virtual queue
  items: z.array(checkoutItemSchema).min(1, "Pilih minimal satu tiket"),
  attendees: z.array(attendeeInfoSchema).min(1, "Data pengunjung wajib diisi"),
  paymentProvider: z.enum(["MIDTRANS"]).default("MIDTRANS"),
  paymentChannel: z.enum(["QRIS", "VIRTUAL_ACCOUNT", "EWALLET", "CREDIT_CARD", "RETAIL_OUTLET"]),
  paymentMethodDetail: z.string().optional(), // "BCA", "MANDIRI", "GOPAY", etc.
  idempotencyKey: z.string().min(8, "Idempotency key wajib disertakan"),
});

export type AttendeeInfo = z.infer<typeof attendeeInfoSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

