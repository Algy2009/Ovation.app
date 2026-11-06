import { z } from "zod";
export declare const createRefundRequestSchema: z.ZodObject<{
    orderId: z.ZodString;
    reason: z.ZodString;
    bankName: z.ZodString;
    bankAccountNumber: z.ZodString;
    bankAccountHolder: z.ZodString;
}, z.core.$strip>;
export declare const updateRefundStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        ORGANIZER_APPROVED: "ORGANIZER_APPROVED";
        SUPERADMIN_APPROVED: "SUPERADMIN_APPROVED";
        REJECTED: "REJECTED";
        PROCESSING: "PROCESSING";
        COMPLETED: "COMPLETED";
        FAILED: "FAILED";
    }>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateRefundInput = z.infer<typeof createRefundRequestSchema>;
export type UpdateRefundStatusInput = z.infer<typeof updateRefundStatusSchema>;
