import { z } from "zod";
export declare const attendeeInfoSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    nik: z.ZodString;
}, z.core.$strip>;
export declare const checkoutItemSchema: z.ZodObject<{
    ticketCategoryId: z.ZodString;
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const checkoutRequestSchema: z.ZodObject<{
    eventId: z.ZodString;
    queueToken: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        ticketCategoryId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    attendees: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        nik: z.ZodString;
    }, z.core.$strip>>;
    paymentProvider: z.ZodDefault<z.ZodEnum<{
        MIDTRANS: "MIDTRANS";
    }>>;
    paymentChannel: z.ZodEnum<{
        QRIS: "QRIS";
        VIRTUAL_ACCOUNT: "VIRTUAL_ACCOUNT";
        EWALLET: "EWALLET";
        CREDIT_CARD: "CREDIT_CARD";
        RETAIL_OUTLET: "RETAIL_OUTLET";
    }>;
    paymentMethodDetail: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodString;
}, z.core.$strip>;
export type AttendeeInfo = z.infer<typeof attendeeInfoSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
