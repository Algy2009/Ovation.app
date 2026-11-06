import crypto from "crypto";

// ==============================================================================
// CRYPTO & SECURITY UTILITIES
// ==============================================================================

/**
 * Mask an Indonesian NIK (16 digits) for privacy and display.
 * Example: "3171012304900001" -> "************0001"
 */
export function maskNIK(nik: string): string {
  if (!nik || nik.length < 4) return "****";
  const last4 = nik.slice(-4);
  return "*".repeat(Math.max(0, nik.length - 4)) + last4;
}

/**
 * Encrypt sensitive NIK data using AES-256-CBC.
 */
export function encryptNIK(nik: string, secretKey: string = process.env.DATA_ENCRYPTION_KEY || "ovation_secret_key_32_bytes_nik"): string {
  const key = Buffer.from(secretKey.padEnd(32, "0").slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(nik, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt sensitive NIK data using AES-256-CBC.
 */
export function decryptNIK(encryptedPayload: string, secretKey: string = process.env.DATA_ENCRYPTION_KEY || "ovation_secret_key_32_bytes_nik"): string {
  try {
    const [ivHex, cipherText] = encryptedPayload.split(":");
    if (!ivHex || !cipherText) return "";
    const key = Buffer.from(secretKey.padEnd(32, "0").slice(0, 32));
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(cipherText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return "";
  }
}

/**
 * Generate a dynamic, time-rotating TOTP token for an Issued Ticket.
 * Rotates every 30 seconds to prevent screenshot sharing or ticket scalping.
 */
export function generateDynamicTicketToken(
  ticketCode: string,
  hmacSecret: string,
  timeStepSeconds: number = 30,
  timestampMs: number = Date.now()
): { token: string; step: number; expiresInSeconds: number } {
  const step = Math.floor(timestampMs / 1000 / timeStepSeconds);
  const payload = `${ticketCode}:${step}`;
  const hmac = crypto.createHmac("sha256", hmacSecret).update(payload).digest("hex").slice(0, 8).toUpperCase();
  const token = `${ticketCode}-${hmac}`;
  const secondsIntoCurrentStep = Math.floor((timestampMs / 1000) % timeStepSeconds);
  const expiresInSeconds = timeStepSeconds - secondsIntoCurrentStep;

  return { token, step, expiresInSeconds };
}

/**
 * Validate a dynamic QR code token presented at gate check-in.
 * Supports ±1 step window tolerance (previous 30s or current 30s) to absorb network latency.
 */
export function verifyDynamicTicketToken(
  presentedToken: string,
  ticketCode: string,
  hmacSecret: string,
  timeStepSeconds: number = 30,
  windowTolerance: number = 1
): boolean {
  if (!presentedToken || !presentedToken.startsWith(ticketCode)) {
    return false;
  }

  const now = Date.now();
  const currentStep = Math.floor(now / 1000 / timeStepSeconds);

  for (let offset = -windowTolerance; offset <= windowTolerance; offset++) {
    const candidateStep = currentStep + offset;
    const payload = `${ticketCode}:${candidateStep}`;
    const expectedHmac = crypto.createHmac("sha256", hmacSecret).update(payload).digest("hex").slice(0, 8).toUpperCase();
    const candidateToken = `${ticketCode}-${expectedHmac}`;

    if (crypto.timingSafeEqual(Buffer.from(presentedToken), Buffer.from(candidateToken))) {
      return true;
    }
  }

  return false;
}

/**
 * Generate Midtrans Webhook Signature Hash (SHA-512).
 * Signature formula: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function generateMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string
): string {
  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  return crypto.createHash("sha512").update(payload).digest("hex");
}

/**
 * Verify Midtrans Webhook Signature Hash (SHA-512).
 * Signature formula: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  receivedSignature: string
): boolean {
  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const computedHash = crypto.createHash("sha512").update(payload).digest("hex");
  return computedHash.toLowerCase() === (receivedSignature || "").toLowerCase();
}

/**
 * Verify Xendit Webhook Verification Token.
 */
export function verifyXenditWebhook(receivedToken: string, configuredToken: string): boolean {
  if (!receivedToken || !configuredToken) return false;
  return crypto.timingSafeEqual(Buffer.from(receivedToken), Buffer.from(configuredToken));
}

