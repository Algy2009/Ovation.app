# DOKUMEN RANCANGAN SISTEM, DIAGRAM UML, DAN ENTITY-RELATIONSHIP DIAGRAM (ERD)
# PLATFORM PEMESANAN TIKET KONSER ONLINE (OVATION.APP)

> **Standar Arsitektur:** Loket.com, Tiket.com, dan Traveloka.  
> **Klasifikasi Proyek:** Enterprise High-Concurrency Ticketing Platform (Monorepo Next.js 16 + React Native Expo + MySQL 8.4 + Prisma ORM + Redis + Midtrans & Xendit Dual Gateway).

---

## DAFTAR ISI

1. [Rancangan Arsitektur Sistem (System Architecture Design)](#1-rancangan-arsitektur-sistem-system-architecture-design)
   - [1.1 Gambaran Arsitektur Global](#11-gambaran-arsitektur-global)
   - [1.2 Komponen dan Lapisan Sistem (Tier Architecture)](#12-komponen-dan-lapisan-sistem-tier-architecture)
   - [1.3 Arsitektur Keamanan & Anti-Calo](#13-arsitektur-keamanan--anti-calo)
2. [Diagram Unified Modeling Language (UML)](#2-diagram-unified-modeling-language-uml)
   - [2.1 Use Case Diagram (Seluruh Aktor & Hak Akses)](#21-use-case-diagram)
   - [2.2 Activity Diagram: Alur Pemesanan & Pembayaran Tiket](#22-activity-diagram-alur-pemesanan--pembayaran-tiket)
   - [2.3 Sequence Diagram 1: Virtual Queue War Room & Reservasi Kuota](#23-sequence-diagram-1-virtual-queue-war-room--reservasi-kuota)
   - [2.4 Sequence Diagram 2: Webhook Payment Gateway, Idempotency & E-Ticket Issuance](#24-sequence-diagram-2-webhook-payment-gateway-idempotency--e-ticket-issuance)
   - [2.5 Sequence Diagram 3: Dynamic QR TOTP & Single-Use Gate Check-in](#25-sequence-diagram-3-dynamic-qr-totp--single-use-gate-check-in)
   - [2.6 State Machine Diagram: Siklus Hidup Pesanan & Tiket (Order & Ticket Lifecycle)](#26-state-machine-diagram-siklus-hidup-pesanan--tiket)
   - [2.7 Class Diagram: Struktur Model & Kontrak Domain](#27-class-diagram-struktur-model--kontrak-domain)
3. [Entity-Relationship Diagram (ERD) & Kamus Data](#3-entity-relationship-diagram-erd--kamus-data)
   - [3.1 Visualisasi ERD Lengkap (17 Entitas Relasional MySQL)](#31-visualisasi-erd-lengkap-17-entitas-relasional-mysql)
   - [3.2 Kamus Data & Spesifikasi Tabel Utama](#32-kamus-data--spesifikasi-tabel-utama)
   - [3.3 Skema Indexing & Integritas Referensial](#33-skema-indexing--integritas-referensial)

---

## 1. RANCANGAN ARSITEKTUR SISTEM (SYSTEM ARCHITECTURE DESIGN)

### 1.1 Gambaran Arsitektur Global

Ovation.app mengadopsi pola **Event-Driven Monorepo Architecture** yang mengintegrasikan aplikasi web untuk admin/promotor, aplikasi mobile untuk pembeli, dan micro-service modular untuk antrean virtual serta gateway pembayaran.

```mermaid
flowchart TB
    subgraph ClientLayer["1. Client Presentation Layer"]
        MobileApp["Mobile App (Customer)<br>React Native + Expo Router"]
        WebAdmin["Web Portal (Promotor & Super Admin)<br>Next.js 16 App Router (Velvet & Amber UI)"]
        GateScanner["Gate Scanner App (Mobile / PDA Scanner)<br>Camera Barcode / Dynamic QR Scanner"]
    end

    subgraph GatewayLayer["2. Gateway & Edge Security Layer"]
        Nginx["Reverse Proxy / Cloudflare<br>Rate Limiter & WAF Protection"]
        AuthModule["NextAuth v5 & JWT Engine<br>RBAC Enforcement"]
    end

    subgraph ServiceLayer["3. Core Application & Service Layer (Node.js REST API)"]
        EventService["Event & Inventory Engine<br>(SELECT FOR UPDATE Concurrency Lock)"]
        QueueEngine["Virtual War Room Queue Engine<br>(Redis Token Bucket / Rate Limiter)"]
        PaymentDispatcher["Unified Payment Dispatcher<br>(Midtrans CoreApi/Snap + Xendit Invoices)"]
        CryptoService["Security Crypto Service<br>(TOTP HMAC-SHA256 & AES-256 NIK)"]
        CheckinService["Gate Validation Service<br>(Single-Use Dynamic QR Verifier)"]
        NotifService["Notification Service<br>(Fonnte WhatsApp API + In-App Alerts)"]
    end

    subgraph DataLayer["4. Data Persistence & Cache Layer"]
        MySQL[("MySQL 8.4 Enterprise DB<br>17 Relational Tables (ACID)")]
        RedisDB[("Redis In-Memory Data Store<br>Distributed Locks & Waiting Queues")]
        CDNStorage[("Media Storage<br>Cloudinary CDN / Public Uploads")]
    end

    subgraph ExternalLayer["5. Third-Party External Services"]
        MidtransPG["Midtrans Payment Gateway<br>(QRIS, Virtual Account, Credit Card)"]
        XenditPG["Xendit Payment Gateway<br>(E-Wallets, Retail Outlets, Invoices)"]
        WhatsAppAPI["WhatsApp Gateway (Fonnte / Twilio)<br>OTP & E-Ticket Notification Dispatch"]
    end

    ClientLayer --> Nginx
    Nginx --> AuthModule
    AuthModule --> ServiceLayer

    EventService --> MySQL
    QueueEngine --> RedisDB
    PaymentDispatcher --> MidtransPG
    PaymentDispatcher --> XenditPG
    CryptoService --> MySQL
    CheckinService --> MySQL
    NotifService --> WhatsAppAPI
    WebAdmin --> CDNStorage
```

---

### 1.2 Komponen dan Lapisan Sistem (Tier Architecture)

1. **Presentation Layer:**
   - **Customer Mobile:** Dibangun dengan React Native dan Expo Router, menggunakan React Query untuk caching status antrean dan SVG QR renderer untuk memutar token dinamis secara offline-resilient.
   - **Organizer & Super Admin Web:** Next.js 16 (Turbopack) dengan tema *Velvet & Amber* (`#090A0F`, `#7C3AED`, `#F59E0B`), visualisasi chart GMV, form wizard event bertingkat, dan scanner log monitor.
2. **Business Logic & API Layer:**
   - REST API terpusat berbasis Next.js Route Handlers (`/api/events`, `/api/orders`, `/api/payments`, `/api/checkin/validate`, `/api/queue`).
   - Role-Based Access Control (RBAC) ketat yang memisahkan otoritas `CUSTOMER`, `ORGANIZER`, dan `SUPER_ADMIN`.
3. **High-Concurrency Engine:**
   - **Distributed Lock:** Mencegah *race condition* dan *overselling* saat pembukaan tiket serentak (*ticket war*).
   - **Row-Level Lock (InnoDB):** Mengunci record kategori tiket dengan klausa `SELECT ... FOR UPDATE` dan *conditional update* `WHERE remaining_quota >= qty`.
4. **Data Persistence Layer:**
   - **MySQL 8.4:** Menampung seluruh data transaksional dengan jaminan ACID penuh, foreign key constraints, dan unique indexes.
   - **Redis Store:** Menangani antrean *Virtual Waiting Room*, token antrean bertanda tangan, dan distributed mutex.

---

### 1.3 Arsitektur Keamanan & Anti-Calo

- **Enkripsi NIK Identitas Pembeli:** Nomor Induk Kependudukan (16 digit) dienkripsi menggunakan algoritma **AES-256-CBC**. Hanya 4 digit terakhir (`nikLast4`) yang disimpan dalam bentuk teks biasa untuk verifikasi staf pintu masuk (`************0004`).
- **Dynamic QR E-Ticket (TOTP HMAC-SHA256):** Token QR dibuat menggunakan formula:
  $$\text{Token} = \text{ticketCode} + \text{"-"} + \text{HMAC-SHA256}(\text{ticketCode} + \text{":"} + \lfloor\text{now} / 30000\rfloor, \text{secret})[0..8]$$
  Token berotasi otomatis setiap **30 detik**. Tangkapan layar (*screenshot*) yang dibagikan atau dijual calo otomatis hangus dalam 30 detik.
- **Idempotensi Pembayaran:** Webhook payment gateway menghitung SHA-256 hash payload. Duplikasi panggilan callback langsung dijawab dengan status `DUPLICATE_IGNORED` tanpa memicu pencetakan tiket ganda.

---

## 2. DIAGRAM UNIFIED MODELING LANGUAGE (UML)

### 2.1 Use Case Diagram

Diagram berikut memetakan interaksi seluruh aktor (*Customer*, *Promotor / Organizer*, *Super Admin*, *Petugas Gate*, dan *Payment Gateway*) terhadap kapabilitas sistem Ovation.

```mermaid
flowchart LR
    Customer(("👤 Customer / Pembeli"))
    Organizer(("🏢 Promotor / Organizer"))
    SuperAdmin(("🛡️ Super Admin"))
    GateStaff(("🎟️ Petugas Gate Scanner"))
    PaymentGW[["💳 Midtrans & Xendit Gateway"]]

    subgraph OvationSystem["Sistem Platform Ovation.app"]
        UC1["Eksplorasi & Pencarian Konser"]
        UC2["Antrean Virtual (War Ticket Room)"]
        UC3["Pemesanan & Checkout Tiket"]
        UC4["Pembayaran (QRIS / VA / E-Wallet)"]
        UC5["Akses E-Ticket Dynamic QR (TOTP 30s)"]
        UC6["Pengajuan Refund Tiket"]

        UC7["Manajemen Event & Kategori Tiket"]
        UC8["Pengaturan Kuota & Batas Maks. NIK"]
        UC9["Monitoring Live Sales & Scanner Log"]
        UC10["Review Pengajuan Refund Konser"]
        UC11["Pengajuan Settlement & Payout"]

        UC12["Verifikasi Legalitas Promotor (KYB)"]
        UC13["Approval & Moderasi Event Konser"]
        UC14["Persetujuan Akhir Refund & Settlement"]
        UC15["Monitoring GMV, Fraud & Audit Logs"]

        UC16["Validasi Dynamic QR & Check-in"]
        UC17["Kirim Callback Webhook Pembayaran"]
    end

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5
    Customer --> UC6

    Organizer --> UC7
    Organizer --> UC8
    Organizer --> UC9
    Organizer --> UC10
    Organizer --> UC11

    SuperAdmin --> UC12
    SuperAdmin --> UC13
    SuperAdmin --> UC14
    SuperAdmin --> UC15

    GateStaff --> UC16
    PaymentGW --> UC17
    UC4 -. Pemicu .-> PaymentGW
```

---

### 2.2 Activity Diagram: Alur Pemesanan & Pembayaran Tiket

Menggambarkan alur aktivitas pembeli mulai dari pemilihan tiket, pengantrean virtual, pemesanan atomik, pembayaran, hingga tiket diterbitkan atau kuota dikembalikan jika kedaluwarsa.

```mermaid
flowchart TD
    Start([Mulai: Pembeli Membuka Detail Konser]) --> CheckWar{Konser Berstatus War Ticket?}
    
    CheckWar -- Ya --> JoinQueue[Mendaftar ke Ruang Tunggu Virtual]
    JoinQueue --> WaitTurn[Menunggu Giliran Sesuai Nomor Antrean]
    WaitTurn --> Admitted[Giliran Tiba: Mendapat Token Checkout]
    Admitted --> SelectCategory[Pilih Kategori Tiket & Jumlah Qty]
    
    CheckWar -- Tidak --> SelectCategory
    
    SelectCategory --> CheckLimit{Qty <= Limit per NIK/Akun?}
    CheckLimit -- Tidak --> LimitError[Tampilkan Peringatan: Melebihi Kuota Maksimal]
    LimitError --> SelectCategory
    
    CheckLimit -- Ya --> LockStock[Backend: Akuisisi Row Lock SELECT FOR UPDATE]
    LockStock --> StockAvailable{Sisa Kuota >= Qty?}
    
    StockAvailable -- Tidak --> SoldOut[Tampilkan Notifikasi: Tiket Habis / Sold Out]
    SoldOut --> EndFail([Selesai: Transaksi Batal])
    
    StockAvailable -- Ya --> DecrementStock[Kurangi remainingQuota Secara Atomik]
    DecrementStock --> CreateOrder[Buat Order: Status PENDING, Timer 15 Menit]
    CreateOrder --> GeneratePayment[Buat Transaksi Midtrans / Xendit]
    GeneratePayment --> PresentPayment[Tampilkan QRIS / Nomor Virtual Account]
    
    PresentPayment --> UserPay{Pembeli Membayar Tepat Waktu?}
    
    UserPay -- Tidak / Melewati 15 Menit --> OrderExpired[Order Menjadi EXPIRED]
    OrderExpired --> RestoreStock[Kembalikan Kuota: remainingQuota += Qty]
    RestoreStock --> ReleaseLock([Selesai: Pesanan Kedaluwarsa & Kuota Dilepas])
    
    UserPay -- Ya --> WebhookReceived[Gateway Mengirimkan Webhook Callback]
    WebhookReceived --> VerifySignature{Tanda Tangan SHA-512 Valid?}
    
    VerifySignature -- Tidak --> RejectWebhook[Tolak Webhook: Signature Invalid]
    RejectWebhook --> Investigate[Catat ke Audit Security Log]
    
    VerifySignature -- Ya --> CheckIdempotency{Pernah Diproses Sebelumnya?}
    CheckIdempotency -- Ya --> IgnoreDuplicate[Balas HTTP 200: DUPLICATE_IGNORED]
    
    CheckIdempotency -- Tidak --> MarkPaid[Update Status Order Menjadi PAID]
    MarkPaid --> IssueTicket[Terbitkan E-Ticket + Secret HMAC-SHA256]
    IssueTicket --> DispatchWhatsApp[Kirim Notifikasi WhatsApp & In-App Alert]
    DispatchWhatsApp --> EndSuccess([Selesai: Tiket Aktif di Aplikasi Mobile])
```

---

### 2.3 Sequence Diagram 1: Virtual Queue War Room & Reservasi Kuota

Alur interaksi pembeli saat memperebutkan tiket konser berkategori *high-demand* melalui ruang antrean virtual dan transaksi database atomik:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Mobile App)
    participant API as Route Handlers (/api)
    participant Redis as Redis Queue Engine
    participant DB as MySQL 8.4 (Prisma ACID)

    Customer->>API: POST /api/queue/join { eventId }
    API->>Redis: RPUSH queue:event:{id} { userId }
    Redis-->>API: Position Number (#142)
    API-->>Customer: 200 OK { queueToken, position: 142, estWaitSeconds: 45 }

    loop Polling Status Tiap 3 Detik
        Customer->>API: GET /api/queue/status?token={queueToken}
        API->>Redis: ZRANK / Queue Check
        Redis-->>API: Current Position (#1) -> Admitted
        API-->>Customer: 200 OK { canCheckout: true, reservationExpiry }
    end

    Customer->>API: POST /api/orders { eventId, categoryId, qty: 2 }
    Note over API,DB: Memulai Database Transaction ACID
    API->>DB: SELECT * FROM ticket_categories WHERE id = ? FOR UPDATE
    DB-->>API: Row Locked (remainingQuota = 5)
    
    alt Sisa Kuota Mencukupi (remainingQuota >= 2)
        API->>DB: UPDATE ticket_categories SET remaining_quota = remaining_quota - 2 WHERE id = ?
        API->>DB: INSERT INTO orders (orderNumber, status: 'PENDING', expiredAt: now + 15m)
        API->>DB: INSERT INTO order_items (quantity: 2, price, subtotal)
        Note over API,DB: Transaksi Commit Berhasil
        API-->>Customer: 201 Created { orderNumber, status: 'PENDING', paymentOptions }
    else Sisa Kuota Tidak Cukup
        Note over API,DB: Transaksi Langsung Rollback
        API-->>Customer: 400 Bad Request { error: 'Stok tiket sudah habis' }
    end
```

---

### 2.4 Sequence Diagram 2: Webhook Payment Gateway, Idempotency & E-Ticket Issuance

Alur penerimaan callback notifikasi dari payment gateway, verifikasi integritas data, pencegahan pembayaran ganda, serta penerbitan e-ticket dan notifikasi:

```mermaid
sequenceDiagram
    autonumber
    participant Gateway as Midtrans / Xendit
    participant WebhookHandler as Webhook Route (/api/webhooks/*)
    participant Crypto as Crypto & Idempotency Validator
    participant DB as MySQL 8.4 (Prisma Transaction)
    participant WhatsApp as WhatsApp Service (Fonnte API)
    actor Customer as Customer

    Gateway->>WebhookHandler: POST /api/webhooks/midtrans (Payload JSON)
    WebhookHandler->>Crypto: verifyMidtransSignature(order_id, status_code, gross_amount, serverKey)
    
    alt Signature Tidak Cocok
        Crypto-->>WebhookHandler: Invalid Signature
        WebhookHandler-->>Gateway: 400 Bad Request (Security Alert Logged)
    else Signature Valid (SHA-512 Match)
        Crypto-->>WebhookHandler: Signature OK
        WebhookHandler->>DB: SELECT FROM payment_webhook_logs WHERE idempotencyHash = ?
        
        alt Webhook Sudah Pernah Diproses (Idempotent)
            DB-->>WebhookHandler: Record Ditemukan (processed = true)
            WebhookHandler-->>Gateway: 200 OK { status: 'DUPLICATE_IGNORED' }
        else Webhook Baru
            Note over WebhookHandler,DB: Transaksi ACID: Update Order & Terbitkan Tiket
            WebhookHandler->>DB: UPDATE orders SET status = 'PAID', paidAt = now() WHERE orderNumber = ?
            WebhookHandler->>DB: UPDATE payments SET status = 'SETTLEMENT', paidAt = now()
            loop Tiap Tiket yang Dibeli
                WebhookHandler->>Crypto: generateRandomSecret(32 bytes)
                Crypto-->>WebhookHandler: hmacSecret
                WebhookHandler->>DB: INSERT INTO issued_tickets (ticketCode, dynamicHmacSecret, isCheckedIn: false)
            end
            WebhookHandler->>DB: INSERT INTO notifications (userId, type: 'PAYMENT_SUCCESS')
            WebhookHandler->>DB: INSERT INTO payment_webhook_logs (idempotencyHash, processed: true)
            Note over WebhookHandler,DB: Commit Transaksi
            
            WebhookHandler-->>Gateway: 200 OK { status: 'SUCCESS' }
            
            WebhookHandler->>WhatsApp: sendTicketIssuedWhatsApp(buyerPhone, { orderNumber, ticketUrl })
            WhatsApp-->>Customer: Pesan WA: "Pembayaran Terkonfirmasi! E-Ticket Konser Anda Siap"
        end
    end
```

---

### 2.5 Sequence Diagram 3: Dynamic QR TOTP & Single-Use Gate Check-in

Alur pemindaian e-ticket di pintu masuk venue konser, validasi token berotasi 30 detik, dan penolakan tiket ganda secara instan:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Mobile App)
    actor GateStaff as Petugas Pintu Masuk (Scanner)
    participant Validator as Checkin API (/api/checkin/validate)
    participant Crypto as TOTP Verifier (HMAC-SHA256)
    participant DB as MySQL 8.4

    Customer->>Customer: Hitung Token TOTP = HMAC(ticketCode:floor(now/30s), secret)
    Customer->>Customer: Render Dynamic QR di Layar Mobile (Countdown Bar 30s)
    GateStaff->>Customer: Memindai QR Code Menggunakan Scanner
    GateStaff->>Validator: POST /api/checkin/validate { ticketCode, dynamicQrToken, gateName: 'Gate VIP A' }
    
    Validator->>DB: SELECT * FROM issued_tickets WHERE ticketCode = ?
    DB-->>Validator: Data Tiket (isCheckedIn, dynamicHmacSecret, checkedInAt)
    
    alt Tiket Sudah Pernah Check-in Sebelumnya
        Validator->>DB: INSERT INTO checkin_logs (scanResult: 'ALREADY_CHECKED_IN', rejectionReason)
        Validator-->>GateStaff: 409 Conflict ❌ (TIKET SUDAH DIGUNAKAN pada 19:30:12)
    else Tiket Belum Check-in
        Validator->>Crypto: verifyDynamicTicketToken(presentedToken, ticketCode, dynamicHmacSecret, 30s, tolerance: +-1)
        
        alt Token QR Kedaluwarsa / Palsu (Screenshot Usang)
            Crypto-->>Validator: Token Invalid
            Validator->>DB: INSERT INTO checkin_logs (scanResult: 'INVALID_TOKEN')
            Validator-->>GateStaff: 400 Bad Request ❌ (QR CODE KEDALUWARSA ATAU TIDAK VALID)
        else Token QR Valid & Segar
            Crypto-->>Validator: Token OK
            Validator->>DB: UPDATE issued_tickets SET isCheckedIn = true, checkedInAt = now(), checkedInGate = 'Gate VIP A'
            Validator->>DB: INSERT INTO checkin_logs (scanResult: 'SUCCESS', gateName: 'Gate VIP A')
            Validator-->>GateStaff: 200 OK ✔️ (CHECK-IN BERHASIL: Silakan Masuk)
        end
    end
```

---

### 2.6 State Machine Diagram: Siklus Hidup Pesanan & Tiket

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Pelanggan Memilih Kategori Tiket
    DRAFT --> PENDING : Checkout Dibuat (Reservasi Kuota 15 Menit)
    
    PENDING --> EXPIRED : Batas Waktu Bayar 15 Menit Habis\n(remainingQuota Dikembalikan ke DB)
    PENDING --> CANCELLED : Dibatalkan Pengguna / Payment Gateway Denied\n(remainingQuota Dikembalikan)
    PENDING --> PAID : Webhook Settlement Diverifikasi (Signature SHA-512 Cocok)
    
    state PAID {
        [*] --> ISSUED : Tiket Digital Terbit (HMAC Secret Dibuat)
        ISSUED --> ACTIVE : Dynamic QR Aktif Berotasi Tiap 30 Detik
        ACTIVE --> CHECKED_IN : Berhasil Dipindai di Gate Masuk (Single-Use Locked)
        ACTIVE --> REFUND_REQUESTED : Pengguna Mengajukan Refund
    }
    
    REFUND_REQUESTED --> ORGANIZER_APPROVED : Promotor Menyetujui Refund
    ORGANIZER_APPROVED --> SUPERADMIN_APPROVED : Super Admin Menyetujui Pencairan Refund
    SUPERADMIN_APPROVED --> REFUNDED : Gateway Mengembalikan Dana ke Rekening Pembeli
    
    CHECKED_IN --> [*] : Konser Selesai
    EXPIRED --> [*]
    CANCELLED --> [*]
    REFUNDED --> [*]
```

---

### 2.7 Class Diagram: Struktur Model & Kontrak Domain

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +String phone
        +String passwordHash
        +UserRole role
        +UserStatus status
        +String nikEncrypted
        +String nikLast4
        +Boolean isPhoneVerified
        +register()
        +login()
        +bindNIK(nik)
    }

    class Organizer {
        +String id
        +String userId
        +String companyName
        +String brandName
        +String bankAccountNumber
        +OrganizerStatus verificationStatus
        +Decimal feePercentage
        +submitKYC()
        +requestPayout()
    }

    class Event {
        +String id
        +String organizerId
        +String title
        +String slug
        +String venueName
        +DateTime startDatetime
        +EventStatus status
        +Int maxTicketsPerTransaction
        +Boolean warTicketActive
        +publish()
        +endEvent()
    }

    class TicketCategory {
        +String id
        +String eventId
        +String name
        +Decimal price
        +Int totalQuota
        +Int remainingQuota
        +Int maxPerTransaction
        +Boolean isVirtualQueueEnabled
        +reserveQuota(qty)
        +releaseQuota(qty)
    }

    class Order {
        +String id
        +String orderNumber
        +String userId
        +String eventId
        +Int totalQuantity
        +Decimal subtotal
        +Decimal platformFee
        +Decimal finalAmount
        +OrderStatus status
        +String idempotencyKey
        +DateTime expiredAt
        +markAsPaid()
        +expireOrder()
    }

    class IssuedTicket {
        +String id
        +String orderItemId
        +String ticketCode
        +String attendeeName
        +String dynamicHmacSecret
        +Boolean isCheckedIn
        +DateTime checkedInAt
        +generateDynamicToken()
        +validateCheckin(token)
    }

    class Payment {
        +String id
        +String orderId
        +PaymentProvider provider
        +PaymentChannel channel
        +String referenceId
        +String vaNumber
        +String qrString
        +PaymentStatus status
        +processCallback()
    }

    class RefundRequest {
        +String id
        +String orderId
        +Decimal amount
        +String reason
        +RefundStatus status
        +approveOrganizer()
        +approveSuperadmin()
    }

    User "1" --> "0..1" Organizer : owns
    User "1" --> "0..*" Order : places
    Organizer "1" --> "0..*" Event : manages
    Event "1" --> "1..*" TicketCategory : contains
    Order "1" --> "1..*" TicketCategory : reserves
    Order "1" --> "1..*" IssuedTicket : issues
    Order "1" --> "0..*" Payment : fulfills
    Order "1" --> "0..1" RefundRequest : requests
```

---

## 3. ENTITY-RELATIONSHIP DIAGRAM (ERD) & KAMUS DATA

### 3.1 Visualisasi ERD Lengkap (17 Entitas Relasional MySQL)

Diagram relasi entitas berikut memetakan ke-17 tabel yang didefinisikan dalam skema Prisma ORM (`packages/database/prisma/schema.prisma`), mencakup relasi *one-to-one*, *one-to-many*, dan relasi ketergantungan cascading:

```mermaid
erDiagram
    USERS ||--o| ORGANIZERS : "memiliki profil promotor"
    USERS ||--o{ ORDERS : "melakukan pemesanan"
    USERS ||--o{ WISHLISTS : "menyimpan konser favorit"
    USERS ||--o{ VIRTUAL_QUEUES : "mengantre di war room"
    USERS ||--o{ NOTIFICATIONS : "menerima notifikasi"
    USERS ||--o{ AUDIT_LOGS : "mencatat jejak aktivitas"
    USERS ||--o{ CHECKIN_LOGS : "staf gate melakukan scan"

    ORGANIZERS ||--o{ EVENTS : "menyelenggarakan"
    ORGANIZERS ||--o{ SETTLEMENTS : "mengajukan pencairan dana"

    EVENT_CATEGORIES ||--o{ EVENTS : "mengelompokkan genre"

    EVENTS ||--o{ TICKET_CATEGORIES : "memiliki tier tiket"
    EVENTS ||--o{ ORDERS : "menjadi objek pemesanan"
    EVENTS ||--o{ WISHLISTS : "dimasukkan ke wishlist"
    EVENTS ||--o{ VIRTUAL_QUEUES : "antrean tiket konser"
    EVENTS ||--o{ SETTLEMENTS : "sumber pendapatan"

    TICKET_CATEGORIES ||--o{ ORDER_ITEMS : "dipesan dalam baris item"

    ORDERS ||--|{ ORDER_ITEMS : "memiliki rincian item"
    ORDERS ||--o{ PAYMENTS : "memiliki transaksi pembayaran"
    ORDERS ||--o{ REFUND_REQUESTS : "dapat diajukan refund"

    ORDER_ITEMS ||--|{ ISSUED_TICKETS : "menerbitkan tiket individual"

    ISSUED_TICKETS ||--o{ CHECKIN_LOGS : "riwayat pemindaian scanner"

    USERS {
        string id PK "cuid"
        string email UK "Email unik pelanggan/staf"
        string password_hash "Bcrypt hash"
        string name "Nama lengkap pengguna"
        string phone "No. WhatsApp"
        enum role "SUPER_ADMIN | ORGANIZER | CUSTOMER"
        enum status "ACTIVE | SUSPENDED | PENDING_VERIFICATION"
        string nik_encrypted "Enkripsi AES-256-CBC"
        string nik_last4 "4 digit terakhir untuk tampilan"
        datetime created_at
        datetime updated_at
    }

    ORGANIZERS {
        string id PK "cuid"
        string user_id FK,UK "Relasi 1:1 ke USERS"
        string company_name "Nama legal PT/CV"
        string brandName "Nama promotor di publik"
        string bank_name "Bank tujuan pencairan"
        string bank_account_number "No. rekening promotor"
        string npwp "Nomor Pokok Wajib Pajak"
        enum verification_status "PENDING | VERIFIED | REJECTED"
        decimal fee_percentage "Platform fee (default 5.00%)"
        datetime created_at
    }

    EVENT_CATEGORIES {
        string id PK "cuid"
        string name "Rock, Pop, Indie, Jazz"
        string slug UK "rock, pop, indie"
        string description
    }

    EVENTS {
        string id PK "cuid"
        string organizer_id FK "Relasi ke ORGANIZERS"
        string category_id FK "Relasi ke EVENT_CATEGORIES"
        string title "Judul resmi konser musik"
        string slug UK "slug-url-ramah-seo"
        string venue_name "Stadion GBK, JIExpo, dll."
        string venue_city "Jakarta, Semarang, Bali"
        datetime start_datetime "Waktu konser dimulai"
        enum status "DRAFT | SUBMITTED | PUBLISHED | REJECTED | ENDED"
        int max_tickets_per_transaction "Batas tiket (default 4)"
        boolean war_ticket_active "Toggle Virtual Queue War"
        datetime created_at
    }

    TICKET_CATEGORIES {
        string id PK "cuid"
        string event_id FK "Relasi ke EVENTS"
        string name "VIP Diamond, Festival Standing"
        decimal price "Harga per tiket (Decimal 12,2)"
        int total_quota "Kuota total yang dirilis"
        int remaining_quota "Sisa kuota real-time (Concurrency Lock)"
        int max_per_transaction "Limit per transaksi pembeli"
        boolean is_virtual_queue_enabled "Proteksi War Room"
        boolean is_standing "Kategori berdiri atau duduk"
        datetime sales_start_time
        datetime sales_end_time
    }

    ORDERS {
        string id PK "cuid"
        string order_number UK "OVN-XXXXXX unik"
        string user_id FK "Relasi ke USERS (Pembeli)"
        string event_id FK "Relasi ke EVENTS"
        int total_quantity "Total lembar tiket dipesan"
        decimal subtotal "Total harga dasar tiket"
        decimal platform_fee "Biaya platform Ovation (5%)"
        decimal admin_fee "Biaya administrasi (Rp 5.000)"
        decimal final_amount "Total pembayaran final"
        enum status "PENDING | PAID | EXPIRED | CANCELLED | REFUNDED"
        string payment_method "QRIS, BCA_VA, CREDIT_CARD"
        string idempotency_key UK "Kunci anti pesanan duplikat"
        datetime expired_at "Batas waktu bayar 15 menit"
        datetime paid_at
    }

    ORDER_ITEMS {
        string id PK "cuid"
        string order_id FK "Relasi ke ORDERS"
        string ticket_category_id FK "Relasi ke TICKET_CATEGORIES"
        int quantity "Jumlah lembar tiket tier ini"
        decimal unit_price "Harga per lembar"
        decimal subtotal
    }

    ISSUED_TICKETS {
        string id PK "cuid"
        string order_item_id FK "Relasi ke ORDER_ITEMS"
        string ticket_code UK "TKT-DEW-VIP-XXXXX unik"
        string attendee_name "Nama pemilik tiket"
        string attendee_nik_encrypted "AES-256 NIK Pemegang"
        string attendee_nik_last4 "4 digit NIK pemegang"
        string dynamic_hmac_secret "Kunci rahasia TOTP 32 bytes"
        boolean is_checked_in "Status kehadiran di venue"
        datetime checked_in_at "Waktu lolos check-in"
        string checked_in_gate "Nama pintu masuk (Gate VIP A)"
    }

    PAYMENTS {
        string id PK "cuid"
        string order_id FK "Relasi ke ORDERS"
        enum provider "MIDTRANS | XENDIT"
        enum channel "QRIS | VIRTUAL_ACCOUNT | EWALLET | CREDIT_CARD"
        string reference_id UK "ID transaksi dari payment gateway"
        string merchant_order_id "ID order lokal"
        string payment_url "URL redirect pembayaran Snap/Invoice"
        string va_number "Nomor Virtual Account bank"
        string qr_string "Payload string QRIS dinamis"
        decimal amount "Nominal uang yang ditagihkan"
        enum status "PENDING | SETTLEMENT | EXPIRE | CANCEL | REFUND"
        datetime paid_at
        datetime expired_at
    }

    PAYMENT_WEBHOOK_LOGS {
        string id PK "cuid"
        enum provider "MIDTRANS | XENDIT"
        string reference_id "Reference ID provider"
        string order_number "Nomor order lokal"
        string event_type "settlement, expire, capture"
        boolean signature_valid "Status verifikasi tanda tangan"
        string idempotency_hash UK "Hash SHA-256 anti duplikat"
        text raw_payload "JSON mentah callback"
        boolean processed "Status pemrosesan callback"
        string processing_error "Catatan error jika gagal"
    }

    REFUND_REQUESTS {
        string id PK "cuid"
        string order_id FK "Relasi ke ORDERS"
        string user_id FK "Relasi ke USERS (Pemohon)"
        decimal amount "Nominal dana yang diminta"
        text reason "Alasan refund"
        string bank_name "Bank tujuan pengembalian"
        string bank_account_number "Nomor rekening tujuan"
        enum status "REQUESTED | ORGANIZER_APPROVED | SUPERADMIN_APPROVED | REJECTED | COMPLETED"
        datetime reviewed_by_organizer_at
        datetime reviewed_by_superadmin_at
    }

    SETTLEMENTS {
        string id PK "cuid"
        string organizer_id FK "Relasi ke ORGANIZERS"
        string settlement_number UK "SETTLE-XXXXXX unik"
        decimal gross_revenue "Total penerimaan kotor"
        decimal platform_fee_deducted "Potongan fee platform"
        decimal net_payout "Pendapatan bersih dicairkan"
        enum status "PENDING | APPROVED | TRANSFERRED | REJECTED"
        string transfer_proof_url "Bukti transfer bank"
        datetime transferred_at
    }

    AUDIT_LOGS {
        string id PK "cuid"
        string actor_user_id FK "Pelaku aksi (Staf/User)"
        string action "EVENT_APPROVE, REFUND_PAYOUT"
        string entity_type "Event, Order, Organizer"
        string entity_id "ID baris yang diubah"
        string ip_address "IP Address aktor"
        string user_agent "Perangkat browser/mobile"
        text metadata "Snapshot JSON sebelum & sesudah"
        datetime created_at
    }

    WISHLISTS {
        string id PK "cuid"
        string user_id FK "Relasi ke USERS"
        string event_id FK "Relasi ke EVENTS"
        datetime created_at
    }

    VIRTUAL_QUEUES {
        string id PK "cuid"
        string event_id FK "Relasi ke EVENTS"
        string user_id FK "Relasi ke USERS"
        string queue_token UK "Token bertanda tangan kriptografis"
        int queue_number "Nomor urut antrean"
        enum status "WAITING | ADMITTED | EXPIRED | CANCELLED"
        string ip_address "Alamat IP pembeli"
        datetime admitted_at "Waktu masuk checkout"
        datetime expired_at "Batas waktu checkout"
    }

    CHECKIN_LOGS {
        string id PK "cuid"
        string issued_ticket_id FK "Relasi ke ISSUED_TICKETS"
        string scanned_by_user_id FK "Staf gate pemindai"
        string gate_name "Pintu Barat, Pintu VIP A"
        enum scan_result "SUCCESS | ALREADY_CHECKED_IN | INVALID_TOKEN | EXPIRED_TOKEN"
        string rejection_reason "Penyebab tiket ditolak"
        string dynamic_token_provided "Token TOTP yang disodorkan"
        datetime scanned_at
    }

    NOTIFICATIONS {
        string id PK "cuid"
        string user_id FK "Relasi ke USERS"
        string title "Judul notifikasi"
        text message "Isi pesan"
        enum type "PAYMENT_SUCCESS | PAYMENT_EXPIRED | REFUND_UPDATE | QUEUE_ADMITTED"
        boolean is_read "Status telah dibaca"
        string link_url "Tautan ke tiket / pesanan"
        datetime created_at
    }
```

---

### 3.2 Kamus Data & Spesifikasi Tabel Utama

#### A. Tabel `ticket_categories` (Pusat Concurrency & Inventory Control)
| Kolom | Tipe Data | Constraint | Keterangan Fungsional |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(30)` | PK, CUID | Identifier unik kategori tiket. |
| `event_id` | `VARCHAR(30)` | FK $\to$ `events.id` | Konser pemilik kategori tiket ini (Cascade delete). |
| `name` | `VARCHAR(100)` | NOT NULL | Nama tier (Contoh: VIP Diamond, Festival Standing). |
| `price` | `DECIMAL(12,2)` | NOT NULL | Harga dasar tiket per lembar (dalam Rupiah). |
| `total_quota` | `INT` | NOT NULL | Alokasi kapasitas total yang disediakan promotor. |
| `remaining_quota` | `INT` | NOT NULL, INDEX | Sisa stok tiket real-time. **Dikuasai oleh exclusive lock `SELECT FOR UPDATE`** dan dicek dengan syarat `remaining_quota >= qty`. |
| `max_per_transaction` | `INT` | DEFAULT 4 | Batas maksimal lembar tiket yang dapat dibeli dalam satu transaksi/akun untuk mencegah calo. |
| `is_virtual_queue_enabled`| `BOOLEAN` | DEFAULT false | Menentukan apakah pembelian wajib melalui Virtual War Room. |

#### B. Tabel `issued_tickets` (Pusat Anti-Calo & Dynamic QR)
| Kolom | Tipe Data | Constraint | Keterangan Fungsional |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(30)` | PK, CUID | Identifier unik tiket digital. |
| `order_item_id` | `VARCHAR(30)` | FK $\to$ `order_items.id`| Item baris transaksi induk pemesanan tiket. |
| `ticket_code` | `VARCHAR(50)` | UNIQUE, INDEX | Kode unik tiket alfabetis (Contoh: `TKT-DEW-VIP-9K2L1`). |
| `attendee_name` | `VARCHAR(150)`| NOT NULL | Nama pengunjung sesuai kartu identitas resmi (KTP). |
| `attendee_nik_encrypted`| `TEXT` | NOT NULL | NIK KTP lengkap yang telah dienkripsi dengan algoritma **AES-256-CBC**. |
| `attendee_nik_last4` | `VARCHAR(4)` | NOT NULL, INDEX | 4 digit terakhir NIK pembeli untuk verifikasi manual staf gate (`************0004`). |
| `dynamic_hmac_secret` | `VARCHAR(64)` | NOT NULL | Kunci privat unik 32-byte untuk memvalidasi token TOTP 30 detik. |
| `is_checked_in` | `BOOLEAN` | DEFAULT false, INDEX | Flag penanda kehadiran pengunjung. Sekali bernilai `true`, tidak dapat diubah kembali. |
| `checked_in_at` | `DATETIME` | NULLABLE | Timestamp pemindaian pertama di gate masuk. |
| `checked_in_gate` | `VARCHAR(50)` | NULLABLE | Pintu gerbang tempat tiket divalidasi. |

#### C. Tabel `payment_webhook_logs` (Pusat Idempotensi Gateway)
| Kolom | Tipe Data | Constraint | Keterangan Fungsional |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(30)` | PK, CUID | Identifier log webhook. |
| `provider` | `ENUM` | NOT NULL | `MIDTRANS` atau `XENDIT`. |
| `order_number` | `VARCHAR(50)` | INDEX | Nomor order transaksi terkait (`OVN-XXXXXX`). |
| `signature_valid` | `BOOLEAN` | NOT NULL | Status keabsahan signature hash SHA-512 dari provider. |
| `idempotency_hash` | `VARCHAR(64)` | UNIQUE, INDEX | Hash SHA-256 kombinasi: `provider:order_id:status:gross_amount:signature`. Menolak panggilan ganda seketika. |
| `raw_payload` | `LONGTEXT` | NOT NULL | Salinan utuh payload JSON callback untuk audit jejak forensik. |
| `processed` | `BOOLEAN` | DEFAULT false | Menandai apakah mutasi order dan tiket telah selesai dikerjakan. |

---

### 3.3 Skema Indexing & Integritas Referensial

Untuk menjaga performa kueri transaksi berkecepatan tinggi (*sub-50ms query time*) saat ribuan pengguna mengakses secara bersamaan, indeks komposit dan indeks kolom tunggal diterapkan pada kolom-kolom kritis:

1. **Pencarian Cepat & Filter Event:**
   - `events(status, start_datetime)`
   - `events(venue_city)`
   - `events(war_ticket_active)`
2. **Kueri Stok & Penguncian Transaksi:**
   - `ticket_categories(event_id, remaining_quota)`
   - `orders(order_number)` (B-Tree Unique Index)
   - `orders(user_id, status)`
3. **Verifikasi Gate Check-in:**
   - `issued_tickets(ticket_code)` (B-Tree Unique Index)
   - `issued_tickets(is_checked_in)`
   - `checkin_logs(issued_ticket_id, scanned_at)`
4. **Pencegahan Webhook Duplikat:**
   - `payment_webhook_logs(idempotency_hash)` (B-Tree Unique Index)
   - `payments(reference_id)` (B-Tree Unique Index)

---

*Dokumen ini disusun sebagai cetak biru resmi rancangan arsitektur, diagram UML komprehensif, dan skema database relasional platform Ovation.app.*

