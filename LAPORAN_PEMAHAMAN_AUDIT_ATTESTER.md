# Laporan Pemahaman Instruksi: Audit Flow Attester KredLedger

**Dokumen Sumber:** `audit attester algy.md`  
**Peran:** Senior Software Auditor / PM Technical Auditor  
**Status Laporan:** Pemahaman & Kesiapan Eksekusi Audit  

---

## 1. Ringkasan & Esensi Tugas (Core Objective)
Saya memahami bahwa tugas ini bertujuan untuk melakukan **penelusuran menyeluruh (end-to-end tracing)** terhadap alur kerja **Attester** pada sistem **KredLedger**, menghubungkan dokumentasi arsitektur/bisnis dengan implementasi kode aktual (Frontend, Backend, dan Database).

Tujuan audit berpusat pada siklus hidup data berikut:
```text
Subject membuat/request Attestation
   │
   ▼
Attester menerima & mengakses request (link/token)
   │
   ▼
Attester mengisi form & submit data
   │
   ▼
Backend memproses payload Attestation
   │
   ▼
Hasil Attestation dihubungkan ke Claim terkait
   │
   ▼
Status Claim terupdate (Pending -> In Progress/Verified/dll.)
   │
   ▼
UI Subject ter-update secara reaktif
   │
   ▼
Tombol [Request Attestation] muncul atau hilang sesuai status Claim
```

---

## 2. Batasan Wajib (Strict Boundaries & Rules)
Saya telah memahami dan mematuhi seluruh batasan ketat yang ditetapkan:
* **Prinsip READ-ONLY mutlak:**
  * Tidak melakukan edit kode atau dokumen apapun di repository target.
  * Tidak membuat file/script baru di dalam repository yang diaudit.
  * Tidak menjalankan migrasi database, seeding, atau query mutasi data (`INSERT`/`UPDATE`/`DELETE`).
  * Tidak melakukan Git commit, push, atau merge.
* **Standar Pembuktian (Evidence-Based):**
  * Tidak menyimpulkan hanya dari nama file, folder, atau asumsi logika umum.
  * Setiap temuan wajib menyertakan bukti konkret: **Path file**, **nama fungsi/komponen/class**, **endpoint API / HTTP method**, dan **potongan baris kode relevan**.
* **Klasifikasi Status Audit yang Tegas:**
  * `IMPLEMENTED`: Benar-benar ada dan berjalan di kode.
  * `PARTIALLY IMPLEMENTED`: Baru sebagian diimplementasikan.
  * `TIDAK DITEMUKAN`: Tidak ada jejak di kode/docs (disertai keterangan pencarian yang dilakukan).
  * `DRIFT DARI DOCS`: Ada di kode tetapi perilakunya berbeda/melenceng dari dokumentasi.
  * `BELUM BISA DIBUKTIKAN`: Kode ada tapi alurnya terputus atau belum bisa dipastikan runtime-nya.

---

## 3. Peta Pemahaman Area Audit (Scope of Tracing)

Saya memahami seluruh area penelusuran yang harus diverifikasi:

### A. Ketentuan Dokumentasi (Docs Tracing)
* Memeriksa acuan spesifikasi pada `/docs/00-foundations/`, `/docs/20-architecture/`, dan `/docs/90-decisions/`.
* Mengidentifikasi definisi formal: Subject, Attester, Claim, Verified Claim, dan siklus verifikasi.
* Mencatat celah dokumentasi dengan tanda eksplisit: `> DOCS TIDAK MENJELASKAN: ...`.

### B. Eksistensi Modul di Kode
* Memeriksa kesiapan struktur:
  * Frontend: `packages/frontend/src/app/[locale]/entity/claims/` dan `packages/frontend/src/app/[locale]/attest/`.
  * Backend: `packages/backend/src/modules/attestation/` dan `packages/backend/src/modules/claim/`.
* Memetakan tabel matrix eksistensi layer (FE, BE, DB).

### C & D. Alur & Interaksi Subject (Subject Flow)
* **Validasi Tombol [Request Attestation]:**
  * Menemukan ekspresi logika kondisi pasti (contoh: `claim.status === 'PENDING'`, `canRequestAttestation()`).
  * Membuktikan requirement kunci:
    * Apakah saat `PENDING`, tombol **muncul**?
    * Apakah saat `VERIFIED`, tombol **wajib hilang**?
    * Memeriksa keselarasan antara docs, kondisi UI FE, dan validasi BE.
* **Form Request Attestation Subject:**
  * Menelusuri UX (modal/halaman baru/redirect).
  * Payload yang dikirim, parameter auto-fill vs user-input, pemilihan data Attester, hingga response token/link.

### E & F. Alur & Antarmuka Attester (Attester Flow & UI)
* Mekanisme akses Attester: Token publik, undangan khusus, atau session-based.
* Komponen halaman `/attest/[id]` atau `/attest/[token]`.
* Form input Attester: Audit lengkap setiap field (tipe data, mandatory/optional, validasi, nilai default).
* Pemanggilan API submission Attestation dari FE ke BE Controller & Service.

### G, H, I. State Machine, Database, & Integrasi ke Claim (Krusial)
* **Status Enum:** Menelusuri seluruh status nyata (misal: `PENDING`, `REQUESTED`, `IN_PROGRESS`, `SUBMITTED`, `VERIFIED`, `REJECTED`).
* **Skema Database:** Primary Key, Foreign Key relasi Claim ↔ Attestation ↔ Subject ↔ Attester.
* **Jawaban atas Pertanyaan Inti:**
  * Apakah record Attestation menyimpan `claimId`?
  * Field apa persisnya pada entitas `Claim` yang diperbarui saat Attester submit?
  * Apakah status Claim otomatis menjadi `VERIFIED`, atau masuk ke tahap peninjauan/evidence baru?

### J, K, L. Respon UI, Lifecycle Setelah Submit, & Edge Cases
* Audit feedback pasca submit (redirect, toast notification, auto re-fetch data).
* Ketahanan terhadap edge case:
  * Claim sudah `VERIFIED` tapi request ditembak via API langsung.
  * Request attestation ganda (double request).
  * Submit attestation berulang (idempotency / double submit).
  * Token kadaluarsa atau tidak valid.

---

## 4. Struktur Output Laporan Akhir yang Disiapkan
Saya telah memahami kerangka 22 bab yang menjadi format akhir yang diharapkan oleh PM / Lead FE:

1. **Executive Summary**
2. **Ketentuan Dari Docs**
3. **Eksistensi Di Code**
4. **Flow End-To-End**
5. **Flow Subject**
6. **Request Attestation Button (Audit Kondisi Tampil/Hilang)**
7. **Flow Attester**
8. **Attester UI**
9. **Attester Form (Tabel Field & Validasi)**
10. **API / Endpoint (Kontrak Request-Response Lengkap)**
11. **Database (ERD, Relasi Tabel, Schema Model)**
12. **State Machine (Tabel Transisi State)**
13. **Input / Output Data Mapping**
14. **Integrasi ke Claim (Mekanisme Penyambungan Hasil ke Claim)**
15. **Subject UI After Submit**
16. **Attester UI After Submit**
17. **Error / Edge Case Handling**
18. **Tabel Komparasi Docs vs Code (Sesuai / Drift / Missing)**
19. **Panduan Implementasi FE (Actionable UI Guide per Status Claim)**
20. **Panduan Implementasi BE**
21. **Open Questions / Ketidakjelasan Docs**
22. **Kesimpulan Final**

---

## 5. Kesiapan Tindak Lanjut
Laporan ini mengonfirmasi pemahaman utuh terhadap standar teknis, peran auditor, dan format output yang diinstruksikan. 

Kapan pun diperlukan untuk mulai menganalisis repository terkait, proses audit dapat langsung dijalankan langkah demi langkah sesuai urutan di atas tanpa melanggar batasan READ-ONLY.
