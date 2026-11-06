"use strict";
// ==============================================================================
// CURRENCY & NUMERIC FORMATTERS
// ==============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatIDR = formatIDR;
exports.calculateOrderSummary = calculateOrderSummary;
/**
 * Format a number or string into Indonesian Rupiah (IDR).
 * Example: 1500000 -> "Rp 1.500.000"
 */
function formatIDR(amount) {
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : Number(amount);
    if (isNaN(numericAmount))
        return "Rp 0";
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
function calculateOrderSummary(subtotal, platformFeePercent = constants_js_1.SYSTEM_CONFIG.DEFAULT_PLATFORM_FEE_PERCENTAGE, adminFeeFixed = constants_js_1.SYSTEM_CONFIG.DEFAULT_ADMIN_FEE_FIXED_IDR) {
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
const constants_js_1 = require("./constants.js");
//# sourceMappingURL=currency.js.map