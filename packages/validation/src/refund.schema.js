"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRefundStatusSchema = exports.createRefundRequestSchema = void 0;
const zod_1 = require("zod");
exports.createRefundRequestSchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1, "Order ID wajib disertakan"),
    reason: zod_1.z.string().min(10, "Alasan pengajuan refund minimal 10 karakter"),
    bankName: zod_1.z.string().min(2, "Nama bank tujuan refund wajib diisi"),
    bankAccountNumber: zod_1.z.string().min(5, "Nomor rekening wajib diisi"),
    bankAccountHolder: zod_1.z.string().min(3, "Nama pemilik rekening wajib diisi"),
});
exports.updateRefundStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "ORGANIZER_APPROVED",
        "SUPERADMIN_APPROVED",
        "REJECTED",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
    ]),
    rejectionReason: zod_1.z.string().optional(),
});
//# sourceMappingURL=refund.schema.js.map