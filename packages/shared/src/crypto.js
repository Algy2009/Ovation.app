"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskNIK = maskNIK;
exports.encryptNIK = encryptNIK;
exports.decryptNIK = decryptNIK;
exports.generateDynamicTicketToken = generateDynamicTicketToken;
exports.verifyDynamicTicketToken = verifyDynamicTicketToken;
exports.verifyMidtransSignature = verifyMidtransSignature;
const crypto_1 = __importDefault(require("crypto"));
// ==============================================================================
// CRYPTO & SECURITY UTILITIES
// ==============================================================================
/**
 * Mask an Indonesian NIK (16 digits) for privacy and display.
 * Example: "3171012304900001" -> "************0001"
 */
function maskNIK(nik) {
    if (!nik || nik.length < 4)
        return "****";
    const last4 = nik.slice(-4);
    return "*".repeat(Math.max(0, nik.length - 4)) + last4;
}
/**
 * Encrypt sensitive NIK data using AES-256-CBC.
 */
function encryptNIK(nik, secretKey = process.env.DATA_ENCRYPTION_KEY || "ovation_secret_key_32_bytes_nik") {
    const key = Buffer.from(secretKey.padEnd(32, "0").slice(0, 32));
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(nik, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
}
/**
 * Decrypt sensitive NIK data using AES-256-CBC.
 */
function decryptNIK(encryptedPayload, secretKey = process.env.DATA_ENCRYPTION_KEY || "ovation_secret_key_32_bytes_nik") {
    try {
        const [ivHex, cipherText] = encryptedPayload.split(":");
        if (!ivHex || !cipherText)
            return "";
        const key = Buffer.from(secretKey.padEnd(32, "0").slice(0, 32));
        const iv = Buffer.from(ivHex, "hex");
        const decipher = crypto_1.default.createDecipheriv("aes-256-cbc", key, iv);
        let decrypted = decipher.update(cipherText, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
    catch {
        return "";
    }
}
/**
 * Generate a dynamic, time-rotating TOTP token for an Issued Ticket.
 * Rotates every 30 seconds to prevent screenshot sharing or ticket scalping.
 */
function generateDynamicTicketToken(ticketCode, hmacSecret, timeStepSeconds = 30, timestampMs = Date.now()) {
    const step = Math.floor(timestampMs / 1000 / timeStepSeconds);
    const payload = `${ticketCode}:${step}`;
    const hmac = crypto_1.default.createHmac("sha256", hmacSecret).update(payload).digest("hex").slice(0, 8).toUpperCase();
    const token = `${ticketCode}-${hmac}`;
    const secondsIntoCurrentStep = Math.floor((timestampMs / 1000) % timeStepSeconds);
    const expiresInSeconds = timeStepSeconds - secondsIntoCurrentStep;
    return { token, step, expiresInSeconds };
}
/**
 * Validate a dynamic QR code token presented at gate check-in.
 * Supports ±1 step window tolerance (previous 30s or current 30s) to absorb network latency.
 */
function verifyDynamicTicketToken(presentedToken, ticketCode, hmacSecret, timeStepSeconds = 30, windowTolerance = 1) {
    if (!presentedToken || !presentedToken.startsWith(ticketCode)) {
        return false;
    }
    const now = Date.now();
    const currentStep = Math.floor(now / 1000 / timeStepSeconds);
    for (let offset = -windowTolerance; offset <= windowTolerance; offset++) {
        const candidateStep = currentStep + offset;
        const payload = `${ticketCode}:${candidateStep}`;
        const expectedHmac = crypto_1.default.createHmac("sha256", hmacSecret).update(payload).digest("hex").slice(0, 8).toUpperCase();
        const candidateToken = `${ticketCode}-${expectedHmac}`;
        if (crypto_1.default.timingSafeEqual(Buffer.from(presentedToken), Buffer.from(candidateToken))) {
            return true;
        }
    }
    return false;
}
/**
 * Verify Midtrans Webhook Signature Hash (SHA-512).
 * Signature formula: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
function verifyMidtransSignature(orderId, statusCode, grossAmount, serverKey, receivedSignature) {
    const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const computedHash = crypto_1.default.createHash("sha512").update(payload).digest("hex");
    return computedHash.toLowerCase() === (receivedSignature || "").toLowerCase();
}
//# sourceMappingURL=crypto.js.map