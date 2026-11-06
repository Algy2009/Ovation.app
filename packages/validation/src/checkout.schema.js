"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutRequestSchema = exports.checkoutItemSchema = exports.attendeeInfoSchema = void 0;
const zod_1 = require("zod");
exports.attendeeInfoSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Nama penonton minimal 3 karakter"),
    email: zod_1.z.string().email("Format email penonton tidak valid"),
    phone: zod_1.z.string().min(9, "Nomor WhatsApp penonton minimal 9 digit").optional(),
    nik: zod_1.z.string().regex(/^[0-9]{16}$/, "NIK wajib berupa 16 digit angka"),
});
exports.checkoutItemSchema = zod_1.z.object({
    ticketCategoryId: zod_1.z.string().min(1, "Kategori tiket wajib dipilih"),
    quantity: zod_1.z.number().int().min(1, "Jumlah tiket minimal 1").max(4, "Maksimal 4 tiket per transaksi"),
});
exports.checkoutRequestSchema = zod_1.z.object({
    eventId: zod_1.z.string().min(1, "Event ID wajib disertakan"),
    queueToken: zod_1.z.string().optional(), // Required if event has active virtual queue
    items: zod_1.z.array(exports.checkoutItemSchema).min(1, "Pilih minimal satu tiket"),
    attendees: zod_1.z.array(exports.attendeeInfoSchema).min(1, "Data pengunjung wajib diisi"),
    paymentProvider: zod_1.z.enum(["MIDTRANS", "XENDIT"]).default("MIDTRANS"),
    paymentChannel: zod_1.z.enum(["QRIS", "VIRTUAL_ACCOUNT", "EWALLET", "CREDIT_CARD", "RETAIL_OUTLET"]),
    paymentMethodDetail: zod_1.z.string().optional(), // "BCA", "MANDIRI", "GOPAY", etc.
    idempotencyKey: zod_1.z.string().min(8, "Idempotency key wajib disertakan"),
});
//# sourceMappingURL=checkout.schema.js.map