# OVATION.APP — Enterprise Online Concert Ticket Booking Platform
> Standardized after industry leaders: Loket.com, Tiket.com, and Traveloka.

[![Node.js Version](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black.svg)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%2052-blue.svg)](https://expo.dev/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4.1-indigo.svg)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4%20ACID-orange.svg)](https://www.mysql.com/)
[![Midtrans](https://img.shields.io/badge/Payment-Midtrans%20Snap%20%26%20CoreApi-00a4e4.svg)](https://midtrans.com/)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passed-emerald.svg)](./scripts/test-suite.ts)

---

## 1. System Architecture & Monorepo Structure

Ovation.app is built with a high-performance npm monorepo architecture organizing the Web administration portal, Mobile customer app, and shared security libraries.

```
concert-ticket-platform/ (ovation-app/)
├── apps/
│   ├── web/                     # Next.js 16 (App Router), Tailwind CSS v4, Velvet & Amber UI
│   │   ├── src/app/
│   │   │   ├── (auth)/          # Login & Register with 1-click Demo Accounts
│   │   │   ├── admin/           # Organizer / Promoter Management Dashboard
│   │   │   ├── superadmin/      # Platform Oversight, GMV, Anti-Fraud & Settlements
│   │   │   ├── events/[id]/     # Event Details, Waiting War Room & Multi-Channel Checkout
│   │   │   ├── account/tickets/ # Customer E-Ticket Wallet with Dynamic Rotating SVG QR
│   │   │   └── api/             # Centralized Next.js REST API Handlers
│   │   ├── src/lib/payments/    # Midtrans Official Gateway Integration (Snap & CoreApi)
│   │   └── src/db/              # Prisma Client Singleton
│   └── mobile/                  # React Native + Expo Router (Customer App)
│       ├── app/
│       │   ├── (tabs)/          # Discover, My Tickets, Wishlist, Profile
│       │   ├── (auth)/          # Customer Login & NIK Binding Register
│       │   ├── event/[id].tsx   # Concert Details & Ticket Tiers
│       │   ├── queue/[id].tsx   # Virtual War Room Real-Time Waiting Screen
│       │   ├── checkout/[id].tsx# Multi-Gateway Checkout (QRIS, VA, E-Wallet)
│       │   └── ticket/[id].tsx  # Dynamic QR E-Ticket (TOTP HMAC-SHA256)
│       └── lib/                 # Auth Context, API Client, Theme
├── packages/
│   ├── database/                # Prisma 6.4.1 Schema (17 Tables, ACID, Foreign Keys)
│   │   └── prisma/
│   │       ├── schema.prisma    # Complete Relational Schema
│   │       └── seed.ts          # Master Seeder (Dewa 19, Sheila On 7, Hindia, WTF)
│   ├── shared/                  # Cryptography, Dynamic QR TOTP, NIK AES-256 Encryption
│   │   └── src/crypto.ts
│   └── validation/              # Zod Schemas (Auth, Events, Checkout, Refunds)
├── scripts/
│   └── test-suite.ts            # Master Automated Test Suite (6 Critical Scenarios)
└── package.json                 # Monorepo Workspaces Configuration
```

---

## 2. Role & Permission Hierarchy

| Role | Portal | Capabilities |
| :--- | :--- | :--- |
| **SUPER ADMIN** | Web Only (`/superadmin`) | Global GMV metrics, Promoter KYB verification, Platform fee configuration, Fraud & bot detection, Settlement approvals, Master audit trail. |
| **ORGANIZER / PROMOTER** | Web Only (`/admin`) | Event lifecycle (Draft $\to$ Review $\to$ Published), Ticket quota & tier pricing, Per-account / NIK purchase limits, Sales analytics, Gate check-in scanner logs, Payout requests. |
| **CUSTOMER** | Mobile & Web (`/`, `/account/tickets`) | Discover concerts, Wishlist, Virtual queue war room, Multi-channel checkout, Dynamic QR E-Ticket wallet, NIK encryption binding. |

### Demo Credentials
- **Super Admin:** `superadmin@ovation.id` / `super123`
- **Promoter Admin:** `admin@ovation.id` / `admin123`
- **Customer User:** `dinda@example.com` / `customer123`

---

## 3. Database Schema (MySQL + Prisma ORM)

All 17 tables are enforced with strict foreign key constraints, indexes, and transactional integrity:

1. `users`: Customer & Staff accounts, role enum, AES-256 encrypted NIK, masked last 4 digits.
2. `organizers`: Promotor business profile, bank accounts, NPWP, verification status (`PENDING`, `VERIFIED`, `REJECTED`).
3. `event_categories`: Music genres (Rock, Pop, Indie, Electronic, Jazz).
4. `events`: Concert metadata, venue coordinates, dates, status (`DRAFT`, `SUBMITTED`, `PUBLISHED`, `ENDED`), max tickets per transaction.
5. `ticket_categories`: Pricing tiers (VIP, CAT 1, Festival Standing), `totalQuota`, `remainingQuota`, virtual queue toggles.
6. `orders`: Order ledger, status (`PENDING`, `PAID`, `EXPIRED`, `CANCELLED`, `REFUNDED`), fees calculation.
7. `order_items`: Line items mapping orders to ticket categories.
8. `issued_tickets`: Digital tickets, unique `ticketCode`, unique `dynamicHmacSecret`, `isCheckedIn` status.
9. `payments`: Payment records, dual gateway reference IDs, QR strings, virtual accounts.
10. `payment_webhook_logs`: Full raw webhook notifications, idempotency hashes, signature validation flags.
11. `refund_requests`: Customer refund applications, reason, status state machine (`REQUESTED` $\to$ `ORGANIZER_APPROVED` $\to$ `SUPERADMIN_APPROVED` $\to$ `COMPLETED`).
12. `settlements`: Promoter payout calculations, platform fee deductions (5%), bank transfer logs.
13. `audit_logs`: Immutable security audit trail with actor IDs, IP addresses, and action diffs.
14. `wishlists`: Customer saved events with war ticket notifications.
15. `virtual_queues`: Queue tokens, queue numbers, admissions, and timestamps.
16. `checkin_logs`: Real-time gate scanner records (`SUCCESS`, `ALREADY_CHECKED_IN`, `INVALID_TOKEN`).
17. `notifications`: In-app notification center for order updates, tickets, and admission alerts.

---

## 4. Payment Gateway Integration (Midtrans)

### Midtrans Gateway Architecture
- **Midtrans Official Driver (`apps/web/src/lib/payments/midtrans.js`):**
  - **Snap API:** Hosted multi-channel modal checkout.
  - **CoreApi Direct Charges:** QRIS dynamic QR string generation, Virtual Accounts (BCA, Mandiri, BNI, BRI, Permata).
  - **Webhook Signature Verification:** SHA-512 calculation formula:
    $$\text{Signature} = \text{SHA512}(\text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{ServerKey})$$
- **Payment State Machine (`apps/web/src/lib/payments/index.js`):**
  - **Idempotency Protection:** Webhooks generate a SHA-256 idempotency hash; duplicates return `DUPLICATE_IGNORED` immediately.
  - **Automatic Stock Release:** If a webhook reports `expire`, `cancel`, or `deny`, the reserved ticket quota is automatically credited back to `ticket_categories.remaining_quota` in the same database transaction.
  - **Auto-Reconciliation:** Endpoint `GET /api/payments/[id]/status` checks the live provider status and settles lagging transactions.

---

## 5. Anti-Overselling & Virtual Queue Engine

### Concurrency Protection (SELECT FOR UPDATE)
When high-demand tickets go on sale, multiple concurrent checkout requests are executed within InnoDB database transactions:
1. **Row Lock Acquisition:**
   ```sql
   SELECT id, remaining_quota FROM ticket_categories WHERE id = ? FOR UPDATE;
   ```
2. **Conditional Atomic Decrement:**
   ```sql
   UPDATE ticket_categories 
   SET remaining_quota = remaining_quota - ? 
   WHERE id = ? AND remaining_quota >= ?;
   ```
3. If `affectedRows === 0` or quota is depleted, the transaction immediately rolls back and throws an out-of-stock exception. **Stock is guaranteed to never drop below zero.**

### Virtual Queue & War Room (`/api/queue/join`, `/api/queue/status`)
- Rate limiting by account ID and IP.
- Generates a cryptographically signed `queueToken`.
- Dynamic position estimation and admission window (15-minute checkout reservation).

---

## 6. Dynamic QR E-Ticket (TOTP Anti-Calo Security)

Traditional static QR codes are vulnerable to screenshots, duplicates, and calo reselling. Ovation implements a rotating TOTP dynamic ticket token:
- **Algorithm:**
  $$\text{Token} = \text{ticketCode} + \text{"-"} + \text{HMAC-SHA256}(\text{ticketCode} + \text{":"} + \lfloor\frac{\text{now}}{30000}\rfloor, \text{secret})[0..8]$$
- **Properties:**
  - Token rotates every 30 seconds.
  - Gate scanners (`/api/checkin/validate`) verify the HMAC signature with a $\pm 1$ step tolerance window to absorb network latency.
  - **Single Use Enforcement:** The first valid scan marks `isCheckedIn: true` and logs to `checkin_logs`. Any subsequent scan is rejected with `ALREADY_CHECKED_IN` (HTTP 409) and logs an audit security event.

---

## 7. Master Automated Test Suite

A comprehensive test suite in [`scripts/test-suite.ts`](./scripts/test-suite.ts) verifies all 6 critical production scenarios:

```bash
npm test
```

### Verified Test Results (100% Passed)
```
══════════════════════════════════════════════════════════════════════
  OVATION.APP - SUITE PENGUJIAN END-TO-END SISTEM PEMESANAN TIKET    
══════════════════════════════════════════════════════════════════════

  ✔ Database MySQL terkoneksi.
  ✔ Web server http://localhost:3000 merespons (HTTP 200).

1. SKENARIO 1: CONCURRENCY TEST & ANTI-OVERSELLING
  ⏳ Menjalankan: 10 Pembeli Bersamaan Memperebutkan 1 Tiket Terakhir... PASSED (41ms)
     ↳ Sukses: 1/10, Ditolak: 9/10. Sisa Kuota DB: 0 (Tidak boleh < 0).

2. SKENARIO 2: DUPLICATE WEBHOOK (IDEMPOTENCY TEST)
  ⏳ Menjalankan: Kirim Webhook Pertama (Settlement)... PASSED (481ms)
     ↳ HTTP 200. Status Order: PAID, E-Ticket Terbit: 2 tiket.
  ⏳ Menjalankan: Kirim Ulang Webhook yang Sama Persis (Anti-Duplicate)... PASSED (35ms)
     ↳ Response: DUPLICATE_IGNORED. Total Tiket Tetap: 2 (Tidak terjadi penggandaan).

3. SKENARIO 3: DELAYED WEBHOOK & STATUS RECONCILIATION
  ⏳ Menjalankan: Sinkronisasi Status Pembayaran Tertunda... PASSED (2217ms)
     ↳ HTTP 200. Status Payment: PENDING, Order Status: PENDING.

4. SKENARIO 4: EXPIRED PAYMENT & STOCK RESTORATION
  ⏳ Menjalankan: Simulasi Expired Payment & Pelepasan Kuota Tiket... PASSED (77ms)
     ↳ Status Order: EXPIRED, Sisa Kuota Awal: 7 -> Dipulihkan ke: 10/10 (+3 tiket).

5. SKENARIO 5: ROLE-BASED ACCESS CONTROL (RBAC) SECURITY
  ⏳ Menjalankan: Customer / Anonim Ditolak Saat Mengakses Endpoint Admin... PASSED (1799ms)
     ↳ POST /api/events: HTTP 403, GET /api/organizers: HTTP 403, PATCH /api/refunds: HTTP 403. Semua dicegat 401/403.

6. SKENARIO 6: DYNAMIC QR TOTP & DUPLICATE CHECK-IN VALIDATION
  ⏳ Menjalankan: Validasi Algoritma Dynamic QR TOTP (HMAC-SHA256)... PASSED (2ms)
     ↳ Generated Token: TKT-CHK-MW54U4TI... Validasi Token Asli: true, Validasi Token Palsu: true.
  ⏳ Menjalankan: First Gate Scan: Sukses & Status Berubah Menjadi CHECKED_IN... PASSED (49ms)
     ↳ Scan Result: SUCCESS, Gate: Gate Utama VIP A, Waktu: 22.31.40.
  ⏳ Menjalankan: Second Gate Scan: Gagal & Ditolak dengan Status ALREADY_CHECKED_IN... PASSED (11ms)
     ↳ Scan Result: ALREADY_CHECKED_IN. Percobaan ganda berhasil ditolak dan tercatat dalam Audit Log (2 scan log).

══════════════════════════════════════════════════════════════════════
                     RINGKASAN HASIL PENGUJIAN                        
══════════════════════════════════════════════════════════════════════

  1. [Concurrency] 10 Pembeli Bersamaan Memperebutkan 1 Tiket Terakhir     ✔ PASS (41ms)
  2. [Idempotency] Kirim Webhook Pertama (Settlement)                      ✔ PASS (481ms)
  3. [Idempotency] Kirim Ulang Webhook yang Sama Persis (Anti-Duplicate)   ✔ PASS (35ms)
  4. [Reconciliation] Sinkronisasi Status Pembayaran Tertunda                 ✔ PASS (2217ms)
  5. [Stock Restoration] Simulasi Expired Payment & Pelepasan Kuota Tiket        ✔ PASS (77ms)
  6. [RBAC] Customer / Anonim Ditolak Saat Mengakses Endpoint Admin        ✔ PASS (1799ms)
  7. [Check-in] Validasi Algoritma Dynamic QR TOTP (HMAC-SHA256)           ✔ PASS (2ms)
  8. [Check-in] First Gate Scan: Sukses & Status Berubah Menjadi CHECKED_IN ✔ PASS (49ms)
  9. [Check-in] Second Gate Scan: Gagal & Ditolak dengan Status ALREADY_CHECKED_IN ✔ PASS (11ms)

  Total Pengujian: 9 | Lolos: 9 | Gagal: 0
  🎉 SEMUA SKENARIO PENGUJIAN MEMENUHI STANDAR PRODUKSI (100% PASSED)!
```

---

## 8. Getting Started & Execution Guide

### Prerequisites
- Node.js 18+ (Node 22 LTS recommended)
- MySQL 8.0+ running on port `3306` (e.g. via Laragon, Docker, or native service)

### 1. Environment Variables Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key configuration values:
```env
DATABASE_URL="mysql://root:@localhost:3306/ovation_db"
JWT_SECRET="super-secret-jwt-key-change-in-production-min-32-chars-ovation"
DATA_ENCRYPTION_KEY="ovation_secret_key_32_bytes_nik"
MIDTRANS_SERVER_KEY="SB-Mid-server-YOUR_SANDBOX_SERVER_KEY"
MIDTRANS_CLIENT_KEY="SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY"
MIDTRANS_IS_PRODUCTION="false"
```

### 2. Database Migration & Seeding
```bash
# Push Prisma schema to MySQL
npm run db:push

# Populate database with realistic Indonesian concerts & demo accounts
npm run db:seed
```

### 3. Run Web Application (Admin & Super Admin)
```bash
npm run dev:web
```
Access the application at `http://localhost:3000`.

### 4. Run Mobile Customer Application (Expo)
```bash
cd apps/mobile
npx expo start
```
Scan the QR code with **Expo Go** on Android or iOS.

### 5. Run Master Test Suite
```bash
npm test
```

---

## 9. Security & Compliance
- **NIK Data Protection:** Stored encrypted using AES-256-CBC. Gate scanners only see the last 4 digits (`************0004`).
- **Webhook Integrity:** All incoming callbacks verify cryptographic signatures before mutating state.
- **Auditing:** All critical operations (refund approvals, status transitions, check-in scans) are immutably logged to `audit_logs` and `checkin_logs`.
- **Anti-Bot & Rate Limiting:** Virtual queue prevents server saturation during national concert ticket on-sales.
