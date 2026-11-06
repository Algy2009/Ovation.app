/**
 * Mask an Indonesian NIK (16 digits) for privacy and display.
 * Example: "3171012304900001" -> "************0001"
 */
export declare function maskNIK(nik: string): string;
/**
 * Encrypt sensitive NIK data using AES-256-CBC.
 */
export declare function encryptNIK(nik: string, secretKey?: string): string;
/**
 * Decrypt sensitive NIK data using AES-256-CBC.
 */
export declare function decryptNIK(encryptedPayload: string, secretKey?: string): string;
/**
 * Generate a dynamic, time-rotating TOTP token for an Issued Ticket.
 * Rotates every 30 seconds to prevent screenshot sharing or ticket scalping.
 */
export declare function generateDynamicTicketToken(ticketCode: string, hmacSecret: string, timeStepSeconds?: number, timestampMs?: number): {
    token: string;
    step: number;
    expiresInSeconds: number;
};
/**
 * Validate a dynamic QR code token presented at gate check-in.
 * Supports ±1 step window tolerance (previous 30s or current 30s) to absorb network latency.
 */
export declare function verifyDynamicTicketToken(presentedToken: string, ticketCode: string, hmacSecret: string, timeStepSeconds?: number, windowTolerance?: number): boolean;
/**
 * Verify Midtrans Webhook Signature Hash (SHA-512).
 * Signature formula: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export declare function verifyMidtransSignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string, receivedSignature: string): boolean;
/**
 * Verify Xendit Webhook Verification Token.
 */
export declare function verifyXenditWebhook(receivedToken: string, configuredToken: string): boolean;
