# Ovation.app — Platform Pemesanan Tiket Konser

Platform pemesanan tiket konser online modern yang dirancang untuk:
- Mempermudah proses pembelian tiket konser secara online.
- Menyediakan informasi konser yang lengkap dan mudah diakses.
- Mengurangi antrean pembelian tiket secara langsung lewat antrian virtual (*virtual queue*).
- Memberikan sistem pembayaran yang aman dan cepat.
- Menghasilkan tiket digital (*e-ticket QR code*) yang mudah digunakan saat masuk ke venue konser.

---

## Arsitektur Sistem

```
Ovation.app/
├── ticket-admin/          # Next.js App Router (Dashboard Admin, Super Admin & Backend REST API)
│   ├── src/
│   │   ├── app/           # Routes (Admin, Super Admin, API endpoints)
│   │   ├── components/    # Reusable UI components & ImageUpload
│   │   ├── db/            # Drizzle ORM schema & SQLite client
│   │   └── lib/           # Auth, store, formatting & helpers
│   ├── public/
│   │   ├── images/events/ # Aset poster visual konser Indonesia
│   │   └── uploads/       # Direktori upload poster oleh Admin
│   └── scripts/           # Skrip seed database konser nyata
└── (mobile-app)/          # Aplikasi Customer Mobile (terhubung ke REST API)
```

---

## Role & Fitur Utama

### 1. Admin (Promotor / Event Organizer)
- **Buat & Kelola Event**: Menambahkan konser baru, jadwal, venue, deskripsi, dan upload poster langsung dari komputer atau via URL.
- **Atur Kategori & Kuota Tiket**: Menentukan kategori tiket (VIP, CAT 1, Festival, dsb.), harga, kuota, limit pembelian per transaksi, dan mengaktifkan antrian virtual untuk event *high demand*.
- **Analitik Penjualan**: Memantau grafik penjualan tiket harian, pendapatan per kategori tiket, dan performa event.
- **Rekonsiliasi Pendapatan**: Laporan bagi hasil pendapatan bersih setelah dipotong biaya platform, dapat diekspor ke CSV.

### 2. Super Admin (Platform Oversight)
- **Verifikasi Organizer**: Meninjau dan menyetujui pendaftaran promotor/organizer baru.
- **Anti-Fraud & Cegah Calo**: Mendeteksi pola transaksi tidak wajar secara otomatis dan memblokir calo/bot.
- **Kelola Refund**: Meninjau dan menyetujui pengajuan pengembalian dana tiket dari pembeli.
- **Customer Service**: Merespons tiket bantuan dan pertanyaan pembeli secara real-time.

### 3. Customer (Aplikasi Mobile)
- Terhubung via REST API (`/api/events`, `/api/orders`, `/api/wishlist`, `/api/notifications`, `/api/refunds`, `/api/support`).
- Menampilkan visual poster konser resolusi tinggi, antrian virtual saat checkout, dan e-ticket QR code digital.

---

## Cara Menjalankan Backend & Dashboard Admin

```bash
cd ticket-admin
npm install --ignore-scripts
cp .env.example .env.local
node scripts/seed.mjs
npm run dev
```

Buka **http://localhost:3000** di browser.

### Akun Demo Pengujian
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@ovation.id` | `admin123` |
| **Super Admin** | `superadmin@ovation.id` | `super123` |
| **Customer** | `dinda@example.com` | `customer123` |
