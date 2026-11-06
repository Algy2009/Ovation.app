// ==============================================================================
// OVATION BUSINESS CONSTANTS & CONFIGURATIONS
// ==============================================================================

export const SYSTEM_CONFIG = {
  APP_NAME: "Ovation.app",
  APP_DESCRIPTION: "Platform Pemesanan Tiket Konser Online Terintegrasi",
  DEFAULT_PLATFORM_FEE_PERCENTAGE: 0.05, // 5%
  DEFAULT_ADMIN_FEE_FIXED_IDR: 5000,     // Rp 5.000 per order
  ORDER_EXPIRATION_MINUTES: 15,          // 15 minutes holding reservation
  MAX_TICKETS_PER_NIK_DEFAULT: 4,        // Anti-scalper default limit
  MAX_TICKETS_PER_TRANSACTION: 4,
  DYNAMIC_QR_ROTATION_SECONDS: 30,       // QR code expires every 30 seconds
  DYNAMIC_QR_TIME_WINDOW_TOLERANCE: 1,   // ±30 seconds clock drift tolerance
  VIRTUAL_QUEUE_BATCH_SIZE: 50,          // Users admitted per batch
  VIRTUAL_QUEUE_TOKEN_TTL_SECONDS: 600,  // 10 minutes checkout session
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ORGANIZER: "ORGANIZER",
  CUSTOMER: "CUSTOMER",
} as const;

export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PAYMENT_PROVIDERS = {
  MIDTRANS: "MIDTRANS",
  XENDIT: "XENDIT",
} as const;

export const PAYMENT_CHANNELS = {
  QRIS: "QRIS",
  VIRTUAL_ACCOUNT: "VIRTUAL_ACCOUNT",
  EWALLET: "EWALLET",
  CREDIT_CARD: "CREDIT_CARD",
  RETAIL_OUTLET: "RETAIL_OUTLET",
} as const;

