// ==============================================================================
// CURRENCY & NUMERIC FORMATTERS
// ==============================================================================

/**
 * Format a number or string into Indonesian Rupiah (IDR).
 * Example: 1500000 -> "Rp 1.500.000"
 */
export function formatIDR(amount: number | string | bigint): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (isNaN(numericAmount)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

/**
 * Calculate order financial breakdown.
 */
export function calculateOrderSummary(
  subtotal: number,
  platformFeePercent: number = SYSTEM_CONFIG.DEFAULT_PLATFORM_FEE_PERCENTAGE,
  adminFeeFixed: number = SYSTEM_CONFIG.DEFAULT_ADMIN_FEE_FIXED_IDR
) {
  const platformFee = Math.round(subtotal * platformFeePercent);
  const adminFee = Math.round(adminFeeFixed);
  const finalAmount = subtotal + platformFee + adminFee;

  return {
    subtotal,
    platformFee,
    adminFee,
    finalAmount,
  };
}

import { SYSTEM_CONFIG } from "./constants.js";

