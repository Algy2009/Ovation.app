export declare const SYSTEM_CONFIG: {
    readonly APP_NAME: "Ovation.app";
    readonly APP_DESCRIPTION: "Platform Pemesanan Tiket Konser Online Terintegrasi";
    readonly DEFAULT_PLATFORM_FEE_PERCENTAGE: 0.05;
    readonly DEFAULT_ADMIN_FEE_FIXED_IDR: 5000;
    readonly ORDER_EXPIRATION_MINUTES: 15;
    readonly MAX_TICKETS_PER_NIK_DEFAULT: 4;
    readonly MAX_TICKETS_PER_TRANSACTION: 4;
    readonly DYNAMIC_QR_ROTATION_SECONDS: 30;
    readonly DYNAMIC_QR_TIME_WINDOW_TOLERANCE: 1;
    readonly VIRTUAL_QUEUE_BATCH_SIZE: 50;
    readonly VIRTUAL_QUEUE_TOKEN_TTL_SECONDS: 600;
};
export declare const USER_ROLES: {
    readonly SUPER_ADMIN: "SUPER_ADMIN";
    readonly ORGANIZER: "ORGANIZER";
    readonly CUSTOMER: "CUSTOMER";
};
export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export declare const PAYMENT_PROVIDERS: {
    readonly MIDTRANS: "MIDTRANS";
};
export declare const PAYMENT_CHANNELS: {
    readonly QRIS: "QRIS";
    readonly VIRTUAL_ACCOUNT: "VIRTUAL_ACCOUNT";
    readonly EWALLET: "EWALLET";
    readonly CREDIT_CARD: "CREDIT_CARD";
    readonly RETAIL_OUTLET: "RETAIL_OUTLET";
};
