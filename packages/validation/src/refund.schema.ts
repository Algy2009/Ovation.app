import { z } from "zod";

export const createRefundRequestSchema = z.object({
  orderId: z.string().min(1, "Order ID wajib disertakan"),
  reason: z.string().min(10, "Alasan pengajuan refund minimal 10 karakter"),
  bankName: z.string().min(2, "Nama bank tujuan refund wajib diisi"),
  bankAccountNumber: z.string().min(5, "Nomor rekening wajib diisi"),
  bankAccountHolder: z.string().min(3, "Nama pemilik rekening wajib diisi"),
});

export const updateRefundStatusSchema = z.object({
  status: z.enum([
    "ORGANIZER_APPROVED",
    "SUPERADMIN_APPROVED",
    "REJECTED",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
  ]),
  rejectionReason: z.string().optional(),
});

export type CreateRefundInput = z.infer<typeof createRefundRequestSchema>;
export type UpdateRefundStatusInput = z.infer<typeof updateRefundStatusSchema>;

