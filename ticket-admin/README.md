# Ovation — Aplikasi Pemesanan Tiket Konser

Next.js (App Router) + Tailwind, dengan database SQLite sungguhan (Drizzle ORM)
dan autentikasi sungguhan (Auth.js / NextAuth v5, Credentials + bcrypt).

## Menjalankan di lokal

```bash
npm install --ignore-scripts
cp .env.example .env.local   # lalu isi AUTH_SECRET (lihat di bawah)
npx drizzle-kit push         # buat tabel di database SQLite lokal
node scripts/seed.mjs        # isi data contoh + akun demo
npm run dev
```

> Kenapa `--ignore-scripts`? Paket `better-sqlite3` sudah menyertakan binary
> native siap pakai untuk semua platform umum (Windows/Mac/Linux), tapi npm
> tetap mencoba mengompilasi ulang lewat `node-gyp` karena package tersebut
> punya `binding.gyp`. Kompilasi ini butuh toolchain build (Python, compiler
> C++) dan bisa gagal di banyak komputer — padahal tidak dibutuhkan sama
> sekali. `--ignore-scripts` melewati langkah itu dan langsung memakai binary
> yang sudah tersedia. Proyek ini sudah disertakan database contoh yang
> sudah di-seed (`data/ovation.db`) dan `.env.local` siap pakai, jadi 3
> langkah setelah `npm install` sebetulnya opsional — hanya diperlukan kalau
> kamu ingin reset data dari awal.

Buka http://localhost:3000.

### AUTH_SECRET

```bash
npx auth secret
```

Salin hasilnya ke `.env.local` sebagai `AUTH_SECRET=...`.
`AUTH_TRUST_HOST=true` sudah disertakan di `.env.example` — ini dibutuhkan
karena kita self-host (bukan di Vercel).

## Akun demo (dibuat oleh scripts/seed.mjs)

| Role         | Email                   | Password      |
|--------------|--------------------------|---------------|
| Admin        | admin@ovation.id         | admin123      |
| Super Admin  | superadmin@ovation.id    | super123      |
| Customer     | dinda@example.com        | customer123   |
| Customer     | bimo.p@example.com       | customer123   |
| Customer     | sriwulan@example.com     | customer123   |

Customer baru juga bisa daftar sendiri lewat halaman `/register`.

## Arsitektur data

- **Database**: SQLite lokal via `better-sqlite3`, file di `data/ovation.db`.
  Dipilih ketimbang Postgres/Prisma karena tidak butuh server database
  terpisah — tinggal `npm install` dan jalan. Skema (`src/db/schema.js`)
  ditulis dengan Drizzle ORM, yang query buildernya sama untuk SQLite maupun
  Postgres/MySQL — jadi migrasi ke Postgres nanti tinggal ganti driver di
  `src/db/client.js` dan `drizzle.config.js`, skema tabel tidak perlu ditulis ulang.
- **Auth**: Auth.js (NextAuth v5) dengan Credentials provider — email/password
  dicocokkan ke tabel `users` dengan bcrypt. Session pakai JWT.
- **API**: REST route handlers di `src/app/api/**`, masing-masing memverifikasi
  role lewat `auth()` sebelum baca/tulis ke database.
- **Client**: `src/lib/store.js` adalah cache di sisi client yang fetch ke API
  di atas — komponen halaman (admin, super admin, customer) memanggil method
  yang sama seperti sebelumnya (`addEvent`, `createOrder`, dst), sekarang
  method-method itu benar-benar menulis ke database lewat API.

## Yang masih disengaja belum ada

- **Payment gateway** — tombol "Bayar" saat ini langsung menyelesaikan
  pesanan (simulasi), sesuai permintaan awal untuk mengurus bagian
  admin/superadmin dulu.
- **Middleware-level route protection** — proteksi halaman saat ini di sisi
  client (redirect ke `/login` bila role tidak cocok) plus proteksi di setiap
  API route di server. Untuk production, pertimbangkan menambah
  `middleware.js` sebagai lapisan tambahan.
- **Migrasi ke Postgres** — skema sudah portable, tapi belum ada file migrasi
  khusus Postgres. Drizzle Kit bisa generate itu begitu `dialect` di
  `drizzle.config.js` diganti ke `"postgresql"`.
