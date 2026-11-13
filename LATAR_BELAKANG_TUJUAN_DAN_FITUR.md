# LATAR BELAKANG, TUJUAN, DAN FITUR APLIKASI
# PLATFORM PEMESANAN TIKET KONSER ONLINE (OVATION.APP)

---

## 1. LATAR BELAKANG

Industri hiburan dan konser musik di Indonesia mengalami lonjakan pertumbuhan yang sangat masif, ditandai dengan tingginya antusiasme masyarakat terhadap tur stadion (*stadium tour*), festival musik berskala internasional, hingga *intimate showcase* musisi nasional. Fenomena "War Ticket"—di mana puluhan hingga ratusan ribu calon penonton mengakses situs pemesanan tiket secara bersamaan dalam detik pertama penjualan dibuka—telah menjadi standar baru dalam industri hiburan modern.

Namun, di balik tingginya permintaan pasar, platform pemesanan tiket konvensional masih menghadapi sejumlah tantangan kritis yang merugikan pembeli maupun promotor:

1. **Praktik Percaloan dan Sindikat Penipuan Tiket (*Ticket Scalping & Fraud*):**
   - Calo dan spekulan kerap menggunakan program bot otomatis untuk memborong tiket dalam jumlah besar, lalu menjualnya kembali di pasar gelap (*secondary market*) dengan harga berkali-kali lipat.
   - E-ticket konvensional yang hanya mengandalkan kode QR statis atau file PDF sangat rentan dipalsukan, digandakan, atau dijual berulang kali kepada pembeli yang berbeda melalui tangkapan layar (*screenshot*).

2. **Server Down dan Kegagalan Sistem Saat Lonjakan Akses (*Traffic Spike*):**
   - Ratusan ribu permintaan *HTTP request* yang membanjiri server secara serentak sering kali melumpuhkan infrastruktur aplikasi (*error 502/504*), menyebabkan pengalaman pengguna yang buruk dan hilangnya potensi pendapatan secara mendadak.

3. **Masalah Penjualan Melebihi Kuota (*Overselling & Race Conditions*):**
   - Pada platform yang tidak menerapkan kontrol konkurensi tingkat database, transaksi yang dieksekusi bersamaan pada detik yang sama dapat mengakibatkan stok tiket bernilai minus (*overselling*), memicu sengketa hukum dan kekacauan kapasitas di lokasi acara.

4. **Ketiadaan Transparansi Finansial dan Manajemen Refund yang Rumit:**
   - Promotor sering menghadapi kesulitan dalam memantau pendapatan kotor, biaya platform, dan alur pencairan dana (*settlement*).
   - Apabila terjadi penundaan atau pembatalan konser, proses pengembalian dana (*refund*) memakan waktu berminggu-minggu karena tidak adanya alur persetujuan terintegrasi dengan penyedia *payment gateway*.

Berdasarkan permasalahan di atas, **Ovation.app** dirancang dan dibangun mengacu pada standar industri terkemuka seperti **Loket.com, Tiket.com, dan Traveloka**. Aplikasi ini mengintegrasikan teknologi *Virtual Waiting Room*, penguncian transaksi atomik berbasis *ACID*, payment gateway resmi (Midtrans Snap & Core API), enkripsi identitas KTP (NIK), serta tiket digital berotasi (*Dynamic QR TOTP 30-Second*) untuk mewujudkan ekosistem pemesanan tiket konser yang adil, aman, dan transparan.

---

## 2. TUJUAN DIBUATNYA APLIKASI

### A. Bagi Penonton / Pembeli Tiket (Customer):
1. **Peluang War Ticket yang Adil (*Fair Ticket War*):** Memberikan kepastian antrean melalui *Virtual War Room* berbasis token antrean kriptografis dan estimasi waktu tunggu transparan, mencegah manipulasi sistem oleh bot calo.
2. **Jaminan Keaslian Tiket Bebas Penipuan:** Mengamankan kepemilikan tiket menggunakan *Dynamic QR Code* berbasis TOTP yang berotasi setiap 30 detik di aplikasi mobile, sehingga tiket tidak dapat dipalsukan, difotokopi, atau dijual ulang via tangkapan layar.
3. **Kemudahan Transaksi Multi-Channel Instan:** Menyediakan metode pembayaran resmi tanpa hambatan, mulai dari QRIS dinamis, Virtual Account seluruh bank nasional, hingga e-Wallet.
4. **Perlindungan Privasi Identitas:** Mengamankan data pribadi pembeli dengan mengenkripsi NIK KTP menggunakan algoritma AES-256-CBC, di mana hanya 4 digit terakhir yang dapat dilihat oleh staf gate.

### B. Bagi Promotor / Penyelenggara Acara (Event Organizer):
1. **Kontrol Penuh Penjualan dan Kuota:** Memberikan fleksibilitas penuh dalam merilis tier tiket (VIP, CAT, Festival), menentukan batas pembelian tiket per akun/NIK, serta mengaktifkan mode *war ticket*.
2. **Operasional Pintu Masuk Cepat dan Akurat (*Gate Check-in*):** Menyediakan sistem validasi scanner real-time di lokasi konser yang mendeteksi dan menolak tiket duplikat secara instan (*single-use admission*).
3. **Transparansi Finansial & Pencairan Dana Otomatis (*Settlement*):** Memberikan akses laporan keuangan real-time, pembagian bagi hasil platform fee (5%), serta pengajuan penarikan saldo pendapatan bersih (*net payout*) ke rekening bank resmi.

### C. Bagi Pengelola Platform (Super Admin):
1. **Pengawasan Ekosistem Nasional (*Platform Governance*):** Memantau metrik Gross Merchandise Value (GMV), memverifikasi legalitas promotor baru (KYB), dan mengkurasi kelayakan konser sebelum dibuka untuk publik.
2. **Keamanan Finansial & Anti-Fraud:** Memantau audit log forensik transaksi dan menyetujui pengembalian dana (*refund dispute*) bertingkat secara terpusat.

---

## 3. FITUR-FITUR UTAMA APLIKASI

Ovation.app menyediakan fungsionalitas menyeluruh yang dibagi berdasarkan peran pengguna dan lapisan keamanan sistem:

### A. Fitur Pengguna Customer (Aplikasi Mobile & Web)
1. **Discovery & Smart Filter Konser:**
   - Menjelajahi katalog konser musik di Indonesia.
   - Filter berdasarkan genre (Rock, Pop, Indie, Jazz), lokasi kota venue, tanggal acara, serta konser unggulan (*Featured*).
2. **Binding NIK KTP & Perlindungan Data Pribadi:**
   - Pendaftaran akun terhubung dengan validasi 16 digit NIK resmi.
   - Enkripsi identitas menggunakan AES-256-CBC untuk verifikasi kepemilikan tiket anti-calo.
3. **Wishlist Konser:**
   - Menyimpan event favorit ke dalam daftar pantau untuk mendapatkan notifikasi jadwal pembukaan tiket.
4. **Virtual War Room (Antrean Tiket Dinamis):**
   - Ruang tunggu interaktif saat penjualan tiket dibuka serentak.
   - Menampilkan nomor urut antrean, progress bar dinamis, dan estimasi waktu tunggu.
   - Menerbitkan `queueToken` unik berbasis akun dan alamat IP untuk mencegah bypass antrean.
5. **Multi-Channel Checkout (Reservasi Kuota 15 Menit):**
   - Reservasi kuota sementara selama 15 menit agar pembeli tidak terburu-buru saat mengisi data pembayaran.
   - Dukungan pembayaran: **QRIS Dinamis**, **Virtual Account** (BCA, Mandiri, BNI, BRI, Permata), **E-Wallet**, dan **Kartu Kredit/Debit**.
6. **E-Ticket Wallet dengan Dynamic QR Code (TOTP):**
   - Tiket digital yang tersimpan rapi di menu "Tiket Saya".
   - **Dynamic QR SVG:** Barcode berotasi otomatis setiap **30 detik** menggunakan algoritma HMAC-SHA256.
   - Perlindungan anti-screenshot: screenshot yang dibagikan akan otomatis kedaluwarsa dan tidak bisa digunakan masuk gate.
7. **Pengajuan Refund Tiket:**
   - Formulir pengajuan pengembalian dana mandiri apabila konser dibatalkan atau memenuhi kebijakan event.
8. **Pusat Notifikasi WhatsApp & In-App Alerts:**
   - Penerimaan OTP pendaftaran dan notifikasi konfirmasi pembayaran otomatis via WhatsApp resmi.

---

### B. Fitur Promotor / Event Organizer (Web Dashboard)
1. **Event Management Wizard:**
   - Membuat, mengedit, dan mengelola draft konser baru (Judul, Lineup, Tanggal, Jam Buka Pintu, Venue, Syarat & Ketentuan).
   - Pengunggahan poster grafis resmi konser (terintegrasi Cloudinary CDN atau penyimpanan lokal).
2. **Kategori Tiket & Quota Management:**
   - Menentukan tier tiket (VIP Diamond, Festival Standing, Tribune).
   - Pengaturan kuota per tier, harga tiket, dan periode waktu penjualan (*sales window*).
   - Penguncian **Batas Maksimal Tiket per NIK/Akun** (misal maks. 4 tiket).
   - Pengaktifan fitur *Virtual War Room* untuk konser berkategori *high-demand*.
3. **Submit for Approval:**
   - Mengirim draft konser ke Super Admin untuk ditinjau legalitas dan kelayakannya sebelum diterbitkan.
4. **Live Sales Analytics & Revenue Monitor:**
   - Grafik penjualan tiket harian, persentase keterisian venue (*occupancy rate*), dan grafik pendapatan per kategori.
5. **Gate Scanner Operations & Scanner Logs:**
   - Pemindaian dynamic QR tiket di pintu masuk via scanner web/mobile.
   - Tampilan profil pengunjung instan (Nama, Kategori, NIK Masked `************0004`).
   - Penolakan otomatis tiket duplikat (`ALREADY_CHECKED_IN`, HTTP 409).
   - Log riwayat pemindaian real-time mencatat jam, nama gate, dan staf pemindai.
6. **Settlement & Payout Reports:**
   - Rekapitulasi pendapatan kotor, potongan platform fee (5%), dan refund terselesaikan.
   - Pengajuan pencairan dana pendapatan bersih (*net payout*) langsung ke rekening bank promotor yang terverifikasi.

---

### C. Fitur Super Admin (Web Dashboard Platform Oversight)
1. **Global Dashboard & GMV Analytics:**
   - Metrik Gross Merchandise Value (GMV) nasional, total tiket terjual di seluruh promotor, dan total platform fee terkumpul.
2. **Promoter Verification (KYB - Know Your Business):**
   - Tinjauan berkas pendaftaran promotor (Nama Perusahaan, NPWP, Rekening Bank, Dokumen Legal).
   - Fitur persetujuan (*Verify*) atau penolakan (*Reject*) akun promotor.
3. **Event Moderation & Approval:**
   - Kurasi draft konser sebelum diterbitkan ke publik (`PUBLISHED` atau `REJECTED`).
4. **Refund Dispute & Multi-Level Approval:**
   - Peninjauan akhir terhadap tiket yang disetujui refund oleh promotor sebelum dana dicairkan kembali ke pembeli.
5. **Fraud Detection & Audit Logs:**
   - Monitoring lalu lintas transaksi dan jejak audit digital (*actor, IP address, user agent, data diff*) untuk mengidentifikasi sindikat bot calo.

---

### D. Fitur Teknis, Transaksi & Keamanan Sistem
1. **Anti-Overselling Concurrency Protection:**
   - Menggunakan penguncian baris database InnoDB **`SELECT ... FOR UPDATE`** dan *conditional atomic decrement* (`WHERE remaining_quota >= qty`).
   - Menjamin secara matematis sisa kuota tiket **tidak pernah bernilai minus** meskipun diserbu ribuan pembeli pada detik yang sama.
2. **Midtrans Official Payment Gateway Engine:**
   - Pemrosesan transaksi multi-channel (QRIS, BCA VA, Mandiri VA, BNI VA, BRI VA, Permata VA, GoPay, ShopeePay, Kartu Kredit).
   - Verifikasi signature kriptografis SHA-512 resmi.
   - **Idempotency Protection:** Webhook duplikat otomatis diabaikan (`DUPLICATE_IGNORED`) untuk mencegah penggandaan tiket.
   - **Auto Stock Release:** Pelepasan kuota tiket kembali ke database secara instan apabila transaksi melewati batas waktu 15 menit (*expired*).
3. **High-Speed Redis Engine & Graceful Fallback:**
   - Redis untuk distributed locking dan virtual waiting queues dengan fallback otomatis ke *high-speed in-memory engine*.
4. **Master Automated Test Suite (`npm test`):**
   - Suite pengujian otomatis bawaan yang menguji 6 skenario kritis industri (Concurrency, Idempotency, Delayed Webhook, Expired Stock Restore, RBAC Security, dan Duplicate Gate Scan) dengan hasil **100% Passed**.

