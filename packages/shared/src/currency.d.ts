/**
 * Format a number or string into Indonesian Rupiah (IDR).
 * Example: 1500000 -> "Rp 1.500.000"
 */
export declare function formatIDR(amount: number | string | bigint): string;
/**
 * Calculate order financial breakdown.
 */
export declare function calculateOrderSummary(subtotal: number, platformFeePercent?: number, adminFeeFixed?: number): {
    subtotal: number;
    platformFee: number;
    adminFee: number;
    finalAmount: number;
};
