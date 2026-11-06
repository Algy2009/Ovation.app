# AUDIT FLOW ATTESTER KREDLEDGER — END-TO-END

## ROLE

Kamu bertindak sebagai **Senior Software Auditor / PM Technical Auditor** untuk project KredLedger.

Tugasmu BUKAN mengimplementasikan, memperbaiki, atau mengubah kode.

Tugasmu hanya:

* membaca docs
* membaca source code
* melakukan tracing flow
* membandingkan implementasi dengan ketentuan/docs
* menjelaskan flow Attester dari awal sampai akhir
* mengidentifikasi state, UI, API, database, input/output, dan integrasinya dengan Claim
* memberikan bukti konkret dari file dan kode

### ATURAN WAJIB

1. **READ-ONLY.**
2. Jangan edit file apa pun.
3. Jangan membuat file baru.
4. Jangan menjalankan migration.
5. Jangan mengubah database.
6. Jangan melakukan commit.
7. Jangan melakukan push/merge.
8. Jangan menyimpulkan hanya berdasarkan nama file. Buka dan baca implementasinya.
9. Setiap kesimpulan harus memiliki bukti berupa:

   * path file
   * function/component/class yang relevan
   * endpoint/API yang dipanggil
   * potongan kode singkat bila diperlukan
10. Jika sesuatu tidak ditemukan, tuliskan dengan jelas:
    **TIDAK DITEMUKAN**
    dan jelaskan pencarian apa yang sudah dilakukan.
11. Bedakan dengan jelas:

* IMPLEMENTED
* PARTIALLY IMPLEMENTED
* TIDAK DITEMUKAN
* DRIFT DARI DOCS
* BELUM BISA DIBUKTIKAN

12. Jangan mengarang behavior yang tidak ada di kode.

---

# TUJUAN AUDIT

Saya ingin mengetahui **flow Attester KredLedger dari awal sampai akhir**, khususnya:

Subject membuat/request Attestation
→ Attester menerima/mengakses request
→ Attester mengisi/submit data
→ hasil Attestation diproses backend
→ hasilnya masuk/terhubung ke Claim
→ status Claim berubah
→ UI Subject berubah
→ tombol Request Attestation muncul/hilang sesuai status Claim.

Audit harus menjawab flow tersebut berdasarkan **implementasi aktual di repository dan docs**, bukan asumsi.

---

# BAGIAN A — CARI DAN BACA DOCS TERLEBIH DAHULU

Sebelum membaca implementasi, cari seluruh dokumentasi yang menjelaskan:

* Attester
* Attestation
* Claim
* Verified Claim
* Claim status
* Subject
* Attester Request
* verification
* certification jika berkaitan
* evidence jika berkaitan

Prioritaskan:

```text
/docs/00-foundations/
/docs/20-architecture/
/docs/90-decisions/
```

Cari juga docs lain yang secara eksplisit menyebut:

```text
attester
attestation
claim
verified claim
request attestation
```

Gunakan pencarian repository seperti:

```bash
grep -Rni "attestation" docs/
grep -Rni "attester" docs/
grep -Rni "request attestation" docs/
grep -Rni "verified claim" docs/
grep -Rni "claim status" docs/
```

### HASIL YANG HARUS DIBUAT

Buat bagian:

## A. Ketentuan Attester dari Docs

Jelaskan:

1. Apa tujuan Attester?
2. Siapa yang membuat request?
3. Siapa yang mengisi Attestation?
4. Apa input Subject?
5. Apa input Attester?
6. Apa output Attester?
7. Output tersebut masuk ke entity/claim mana?
8. Status Claim apa saja yang terlibat?
9. Kapan Subject boleh request Attestation?
10. Kapan Subject tidak boleh request Attestation?
11. Kapan tombol Request Attestation harus muncul?
12. Kapan tombol harus hilang?
13. Apa yang terjadi setelah Attester submit?
14. Apakah Claim otomatis menjadi Verified?
15. Apakah masih ada proses review/verifikasi setelah Attester submit?
16. Apa hubungan Attestation dengan Verified Claim?

Jika docs tidak menjelaskan sesuatu, jangan mengarang.

Tuliskan:

> DOCS TIDAK MENJELASKAN: ...

---

# BAGIAN B — EKSISTENSI FLOW DI CODE

Audit apakah flow Attester benar-benar sudah ada di implementasi.

Minimal periksa:

```text
packages/frontend/src/app/[locale]/entity/claims/
packages/frontend/src/app/[locale]/attest/
packages/backend/src/modules/attestation/
packages/backend/src/modules/claim/
```

Lakukan pencarian:

```bash
grep -rni "attestation" packages/frontend/src/
grep -rni "attestation" packages/backend/src/

grep -rni "attester" packages/frontend/src/
grep -rni "attester" packages/backend/src/

find packages/frontend/src -iname "*attest*"
find packages/backend/src -iname "*attest*"
```

Jangan berhenti pada hasil grep.

Buka file yang relevan dan trace pemanggilan function/component/API sampai jelas flow sebenarnya.

### Buat tabel:

| Layer | File | Component/Function | Peran | Status      |
| ----- | ---- | ------------------ | ----- | ----------- |
| FE    | ...  | ...                | ...   | Implemented |
| FE    | ...  | ...                | ...   | ...         |
| BE    | ...  | ...                | ...   | ...         |
| DB    | ...  | ...                | ...   | ...         |

---

# BAGIAN C — TRACE FLOW SUBJECT

Audit dari sudut pandang Subject.

## C1. Halaman

Cari halaman Claim yang menampilkan Attestation.

Jelaskan:

* route URL
* file page
* component utama
* component child yang relevan

Contoh format:

```text
Subject
→ Claims page
→ Claim detail
→ Attestation section
→ Request Attestation button
```

Tetapi JANGAN menggunakan contoh tersebut sebagai fakta.

Trace dari kode aktual.

---

## C2. REQUEST ATTESTATION BUTTON

Ini bagian penting.

Cari implementasi tombol:

```text
Request Attestation
```

atau variasi text/key/translation-nya.

Jelaskan:

### Kapan tombol muncul?

Identifikasi kondisi kode secara persis.

Contoh yang harus dicari:

```ts
claim.status === ...
```

atau:

```ts
claim.status !== ...
```

atau:

```ts
canRequestAttestation(...)
```

atau kondisi lain.

Tuliskan state/status yang membuat tombol:

* MUNCUL
* TIDAK MUNCUL

### Fokus khusus

Validasi apakah requirement berikut benar-benar diterapkan:

> Jika Claim masih `PENDING`, Subject dapat melakukan/request Attestation.

> Jika Claim sudah `VERIFIED`, tombol Request Attestation tidak boleh muncul lagi.

JANGAN langsung menganggap requirement tersebut benar.

Cek:

1. docs
2. FE condition
3. BE validation
4. API behavior

Kemudian jelaskan apakah ketiganya konsisten.

---

# BAGIAN D — FORM REQUEST ATTESTATION DI SUBJECT

Jika Subject menekan Request Attestation:

Trace apa yang terjadi.

Jelaskan:

1. Apakah muncul modal?
2. Apakah muncul halaman baru?
3. Apakah redirect?
4. Apakah muncul confirmation?
5. Field apa saja?
6. Mana yang otomatis terisi?
7. Mana yang diinput Subject?
8. Apakah Subject memasukkan data Attester?
9. Apakah Subject memilih Attester?
10. Apakah Subject mendapatkan link/request token?
11. API apa yang dipanggil?
12. HTTP method apa?
13. Request body apa?
14. Response apa?
15. Data apa yang disimpan?

Tampilkan flow aktual:

```text
Subject click Request Attestation
↓
FE function
↓
API endpoint
↓
BE controller/route
↓
service
↓
database
↓
response
↓
FE state update
↓
UI berubah menjadi ...
```

---

# BAGIAN E — TRACE FLOW ATTESTER

Sekarang audit dari sisi Attester.

## E1. Bagaimana Attester masuk ke flow?

Cari:

* route `/attest/...`
* route dengan token/request ID
* invitation
* request link
* attester request
* public/private access

Jelaskan:

```text
Attester menerima apa?
↓
Attester membuka URL apa?
↓
Frontend page apa?
↓
Backend endpoint apa?
↓
Request diambil berdasarkan apa?
```

---

# E2. HALAMAN ATTESTER

Audit halaman:

```text
packages/frontend/src/app/[locale]/attest/
```

Untuk setiap route/page:

* route
* file
* component
* tujuan halaman
* siapa yang dapat mengakses
* apakah membutuhkan login
* apakah menggunakan token
* data apa yang di-fetch

---

# E3. TAMPILAN ATTESTER

Jelaskan UI yang benar-benar ada.

Misalnya:

```text
Header
Subject information
Claim information
Evidence/information
Attestation form
Submit button
Status/message
```

Tetapi hanya tuliskan jika benar-benar ditemukan.

Untuk setiap bagian tampilkan:

| UI                  | Ada?   | Data source | File |
| ------------------- | ------ | ----------- | ---- |
| Subject information | YES/NO | ...         | ...  |
| Claim information   | YES/NO | ...         | ...  |
| Attestation form    | YES/NO | ...         | ...  |
| Submit button       | YES/NO | ...         | ...  |
| Status              | YES/NO | ...         | ...  |

---

# E4. FORM ATTESTER

Audit semua field yang dapat diisi Attester.

Untuk setiap field:

| Field | Required? | Type | Source | Dikirim ke API? | Disimpan di DB? |
| ----- | --------- | ---- | ------ | --------------- | --------------- |
| ...   | ...       | ...  | ...    | ...             | ...             |

Jelaskan juga:

* validation
* minimum/maximum
* enum
* default value
* apakah field bisa kosong
* error message
* submit behavior

---

# E5. API ATTESTER

Trace API dari frontend sampai backend.

Untuk setiap API:

```text
METHOD
PATH
FE caller
BE route/controller
BE service
request body
response
database operation
```

Contoh format:

```text
POST /...
↓
frontend: ...
↓
backend route: ...
↓
controller: ...
↓
service: ...
↓
repository/ORM: ...
↓
database table: ...
```

Jangan mengarang endpoint.

---

# BAGIAN F — STATE MACHINE ATTESTER

Ini WAJIB.

Identifikasi semua state yang benar-benar ada.

Cari:

* enum
* status
* database enum
* conditional rendering
* backend validation
* workflow transition

Buat tabel:

| State | Artinya | Siapa yang bisa melakukan action | UI Subject | UI Attester | Transition |
| ----- | ------- | -------------------------------- | ---------- | ----------- | ---------- |
| ...   | ...     | ...                              | ...        | ...         | ...        |

Minimal audit kemungkinan state:

```text
PENDING
REQUESTED
IN_PROGRESS
SUBMITTED
VERIFIED
REJECTED
EXPIRED
CANCELLED
```

Tetapi JANGAN menganggap semuanya ada.

Jika state tidak ditemukan:

```text
TIDAK DITEMUKAN DI CODE
```

---

# BAGIAN G — INPUT / OUTPUT

Buat flow data lengkap.

## G1. Input Subject

Jelaskan semua data yang berasal dari Subject.

Contoh kategori:

```text
claimId
attester information
request information
claim information
```

Tetapi gunakan data aktual dari kode.

---

## G2. Input Attester

Jelaskan semua data yang diisi Attester.

Pisahkan:

### Data yang sudah tersedia

vs

### Data yang benar-benar diinput Attester

---

## G3. Output Attester

Setelah Attester submit:

1. Response API apa?
2. Record apa yang dibuat/diupdate?
3. Table apa yang berubah?
4. Status apa yang berubah?
5. Apakah ada credential?
6. Apakah ada verification?
7. Apakah Claim berubah?
8. Apakah Verified Claim dibuat?
9. Apakah Subject mendapatkan hasilnya?

---

# BAGIAN H — DATABASE

Audit schema/database yang berhubungan dengan Attester.

Cari:

```bash
grep -Rni "attestation" packages/backend/src/
grep -Rni "attester" packages/backend/src/
grep -Rni "attestation" packages/backend/
```

Identifikasi:

* table/model
* primary key
* foreign key
* relation ke Claim
* relation ke Subject
* relation ke Attester
* status
* timestamps
* request ID
* token jika ada
* result/output

Buat diagram sederhana:

```text
Subject
   |
   v
Claim
   |
   v
Attestation Request
   |
   v
Attester
   |
   v
Attestation Result
   |
   v
Claim / Verified Claim
```

Sesuaikan diagram dengan implementasi aktual.

---

# BAGIAN I — INTEGRASI KE CLAIM

Ini bagian PALING PENTING.

Saya perlu tahu dengan jelas:

> "Hasil Attester masuk ke Claim gimana?"

Trace dari source code.

Jawab:

1. Attestation memiliki `claimId` atau tidak?
2. Jika iya, di mana?
3. Apakah Attestation dibuat untuk satu Claim?
4. Setelah Attester submit, apakah Claim di-update?
5. Field Claim apa yang berubah?
6. Status Claim berubah menjadi apa?
7. Apakah dibuat record baru?
8. Apakah hasil Attestation disimpan sebagai Evidence?
9. Apakah hasilnya masuk ke Verified Claim?
10. Apakah Claim tetap Pending?
11. Siapa yang menentukan Claim menjadi Verified?
12. Apakah backend melakukan validation sebelum status berubah?
13. Apakah FE hanya menampilkan status dari backend?

Tunjukkan exact file/function yang melakukan hubungan tersebut.

---

# BAGIAN J — SUBJECT UI SETELAH ATTESTATION

Trace perubahan UI Subject.

Buat state-based UI table:

| Claim State | Request Attestation Button              | Status/Badge | Action lain | Evidence/Result |
| ----------- | --------------------------------------- | ------------ | ----------- | --------------- |
| ...         | ...                                     | ...          | ...         | ...             |
| ...         | ...                                     | ...          | ...         | ...             |
| VERIFIED    | HARUS TIDAK ADA jika sesuai requirement | ...          | ...         | ...             |

Khusus validasi:

### PENDING

Apakah:

```text
Request Attestation
```

tersedia?

### VERIFIED

Apakah tombol tersebut benar-benar hilang?

Cari kondisi FE yang membuktikan hal tersebut.

---

# BAGIAN K — TAMPILAN SETELAH SUBMIT

Audit apa yang terjadi setelah:

## Subject submit request

dan setelah:

## Attester submit attestation

Untuk masing-masing jelaskan:

* redirect
* toast
* modal
* status
* button
* loading
* error
* success
* data refresh
* polling/re-fetch jika ada

Buat flow:

```text
SUBJECT
Request Attestation
↓
UI state
↓
ATTESTER
Open Request
↓
Fill Form
↓
Submit
↓
Backend
↓
Database
↓
Claim
↓
SUBJECT UI
```

---

# BAGIAN L — ERROR / EDGE CASE

Audit apakah flow menangani:

1. Claim sudah VERIFIED tapi masih request Attestation
2. Claim sudah punya Attestation
3. Request Attestation dua kali
4. Attester submit dua kali
5. Request expired
6. Request tidak ditemukan
7. Token invalid
8. Claim tidak ditemukan
9. Attester tidak valid
10. Claim berubah status ketika Attester sedang mengisi form
11. Subject melakukan request ketika Attestation sedang berjalan

Untuk setiap kasus:

```text
HANDLED
PARTIALLY HANDLED
NOT HANDLED
UNKNOWN
```

sertakan bukti.

---

# BAGIAN M — AUDIT KONSISTENSI DOCS vs CODE

Buat tabel utama:

| Area                | Docs | Implementasi | Status       | Bukti     |
| ------------------- | ---- | ------------ | ------------ | --------- |
| Request Attestation | ...  | ...          | SESUAI/DRIFT | file:line |
| Pending Claim       | ...  | ...          | ...          | ...       |
| Verified Claim      | ...  | ...          | ...          | ...       |
| Attester Form       | ...  | ...          | ...          | ...       |
| Submit              | ...  | ...          | ...          | ...       |
| Claim Integration   | ...  | ...          | ...          | ...       |
| UI Subject          | ...  | ...          | ...          | ...       |
| UI Attester         | ...  | ...          | ...          | ...       |

Gunakan status:

```text
SESUAI
DRIFT
PARTIAL
MISSING
TOO FAR
BELUM BISA DIBUKTIKAN
```

---

# BAGIAN N — HASIL AKHIR UNTUK PM/FE

Di bagian terakhir, jangan hanya memberikan hasil audit teknis.

Buat penjelasan sederhana yang bisa saya gunakan sebagai acuan implementasi FE.

Format:

## 1. FLOW YANG SEHARUSNYA

Tuliskan flow dari awal sampai akhir dalam bahasa sederhana.

```text
[STEP 1]
...

[STEP 2]
...

[STEP 3]
...
```

---

## 2. FLOW YANG SAAT INI TERIMPLEMENTASI

Tuliskan flow aktual berdasarkan code.

---

## 3. PERBEDAAN

Tuliskan bagian:

```text
SUDAH SESUAI
- ...

BELUM SESUAI
- ...

BELUM ADA
- ...

BELUM JELAS DI DOCS
- ...
```

---

## 4. PANDUAN UI FE

Buat state-based requirement yang mudah dipahami developer FE.

Contoh struktur:

```text
CLAIM = PENDING
→ tampilkan Request Attestation

CLAIM = ...
→ tampilkan ...

CLAIM = VERIFIED
→ jangan tampilkan Request Attestation
```

JANGAN mengisi state berdasarkan asumsi.
Gunakan hasil tracing aktual.

---

## 5. PANDUAN UI ATTTESTER

Jelaskan:

```text
Attester membuka ...
↓
melihat ...
↓
mengisi ...
↓
submit ...
↓
melihat ...
```

Lengkap dengan field dan state.

---

## 6. KONTRAK FE ↔ BE

Buat tabel:

| Action              | Endpoint | Method | Input | Output | Status |
| ------------------- | -------- | ------ | ----- | ------ | ------ |
| Request Attestation | ...      | ...    | ...   | ...    | ...    |
| Get Attestation     | ...      | ...    | ...   | ...    | ...    |
| Submit Attestation  | ...      | ...    | ...   | ...    | ...    |
| Get Claim           | ...      | ...    | ...   | ...    | ...    |

---

## 7. DATA FLOW

Buat diagram sederhana:

```text
SUBJECT
  |
  | Request Attestation
  v
CLAIM
  |
  v
ATTESTATION REQUEST
  |
  v
ATTESTER
  |
  | input + submit
  v
ATTESTATION RESULT
  |
  v
CLAIM
  |
  v
CLAIM STATUS
  |
  v
SUBJECT UI
```

Sesuaikan dengan code aktual.

---

# OUTPUT FINAL YANG SAYA INGINKAN

Jangan hanya memberikan daftar file.

Saya ingin laporan audit yang terstruktur:

```text
# AUDIT FLOW ATTESTER KREDLEDGER

## 1. EXECUTIVE SUMMARY

## 2. KETENTUAN DARI DOCS

## 3. EKSISTENSI DI CODE

## 4. FLOW END-TO-END

## 5. FLOW SUBJECT

## 6. REQUEST ATTESTATION BUTTON

## 7. FLOW ATTESTER

## 8. ATTTESTER UI

## 9. ATTTESTER FORM

## 10. API / ENDPOINT

## 11. DATABASE

## 12. STATE MACHINE

## 13. INPUT / OUTPUT

## 14. INTEGRASI KE CLAIM

## 15. SUBJECT UI AFTER SUBMIT

## 16. ATTTESTER UI AFTER SUBMIT

## 17. ERROR / EDGE CASE

## 18. DOCS VS CODE

## 19. PANDUAN IMPLEMENTASI FE

## 20. PANDUAN IMPLEMENTASI BE

## 21. OPEN QUESTIONS / KETIDAKJELASAN DOCS

## 22. KESIMPULAN
```

### ATURAN PENTING UNTUK KESIMPULAN

Jika menemukan bahwa requirement:

> "Request Attestation dapat dilakukan ketika Claim masih Pending, dan ketika Claim sudah Verified tombol Request Attestation tidak muncul"

benar-benar didukung docs dan code, tunjukkan bukti.

Jika hanya ada di salah satu sisi, katakan:

```text
DOCS: ...
FE: ...
BE: ...
KESIMPULAN: BELUM KONSISTEN
```

Jangan menganggap behavior yang "seharusnya" sebagai behavior yang "sudah diimplementasikan".

Tujuan akhir audit adalah agar tim FE dapat mengetahui dengan jelas:

**"Pada setiap status Claim, UI apa yang harus tampil, action apa yang boleh dilakukan Subject, halaman apa yang dibuka Attester, field apa yang diisi Attester, API apa yang dipanggil, dan setelah submit hasilnya masuk ke mana."**

Sekali lagi: **READ-ONLY. Jangan mengubah apa pun di repository.**
