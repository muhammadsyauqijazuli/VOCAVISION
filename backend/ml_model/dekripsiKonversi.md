# Deskripsi Alur Data Kuesioner → Model Prediksi

Proyek **SINTESA** (Sistem Intelijen Evaluasi Siswa) mengumpulkan data melalui **kuesioner siswa** yang kemudian diproses melalui tahapan **normalisasi**, **konversi numerik**, dan **penyimpanan database** sebelum digunakan untuk melatih model **Random Forest**.

---

## 1. Struktur Form Kuesioner

Kuesioner terdiri dari **17 pertanyaan** yang dibagi menjadi tiga kelompok:

### A. Data Demografi (8 pertanyaan)

| # | Variabel | Tipe | Keterangan |
|---|----------|------|------------|
| 1 | `nisn` | Teks | Nomor Induk Siswa Nasional |
| 2 | `nama_siswa` | Teks | Nama lengkap siswa |
| 3 | `email` | Teks | Email aktif siswa (digunakan sebagai username) |
| 4 | `gender` | Pilihan | Laki‑laki / Perempuan |
| 5 | `pendidikan_ayah` | Pilihan | SD / SMP / SMA‑SMK / Diploma / Sarjana |
| 6 | `pendidikan_ibu` | Pilihan | SD / SMP / SMA‑SMK / Diploma / Sarjana |
| 7 | `pendapatan_keluarga` | Pilihan | < 2 Juta / 2‑5 Juta / 5‑10 Juta / > 10 Juta |
| 8 | `kerja_sampingan` | Pilihan | Ya / Tidak |

### B. Data Numerik Langsung (3 pertanyaan)

| # | Variabel | Tipe | Rentang Valid |
|---|----------|------|---------------|
| 9 | `jam_belajar_per_hari` | Angka | 0 – 12 jam |
| 10 | `jam_tidur` | Angka | 0 – 12 jam |
| 11 | `screen_time` | Angka | 0 – 12 jam |

### C. Pertanyaan Psikologis & Vokasi (9 pertanyaan)

Setiap pertanyaan memiliki **3 pilihan** (A, B, C) dengan bobot skor yang berbeda.

| # | Variabel yang Diukur | Sumber Referensi | Skor |
|---|----------------------|------------------|------|
| 12 | Troubleshooting (Industry Readiness) | Spöttl & Windelband (2021) | A=30, B=50, C=10 |
| 13 | Adaptability (Industry Readiness) | Spöttl & Windelband (2021) | A=50, B=10, C=30 |
| 14 | Manajemen Lingkungan Fisik (Study Environment) | Broadbent & Poon (2015) | A=30, B=50, C=10 |
| 15 | Manajemen Distraksi Digital (Study Environment) | Broadbent & Poon (2015) | A=10, B=50, C=30 |
| 16 | Penentuan Prioritas (Time Management) | Adams & Blair (2019) | A=10, B=30, C=50 |
| 17 | Kendali Distraksi (Time Management) | Adams & Blair (2019) | A=10, B=30, C=50 |
| 18 | Motivasi Akademik | Stover et al. (2012) | A=20, B=60, C=100 |
| 19 | Workload Stress | Bedewy & Gabriel (2015) | A=35, B=10, C=20 |
| 20 | Academic Expectations (Stress) | Bedewy & Gabriel (2015) | A=20, B=10, C=35 |
| 21 | Academic Self‑Perception (Stress) | Bedewy & Gabriel (2015) | A=15, B=30, C=5 |
| 22 | Kompetensi Skill Level | Self‑assessment | A=Rendah, B=Menengah, C=Tinggi (dengan teks panjang) |

---

## 2. Alur Pemrosesan Data

### 2.1 Normalisasi (`normalisasi.py`)

**Tujuan:** Membersihkan anomali pada data numerik (jam_tidur, screen_time, jam_belajar).

**Langkah:**

1. Baca CSV mentah dari Google Form.
2. Konversi kolom numerik ke tipe `float` (tangani koma, spasi).
3. Deteksi format **HHMM** pada `jam_tidur` (misal `2312`) → anggap sebagai error → set ke `NaN`.
4. Deteksi nilai > 12 jam → set ke `NaN`.
5. Isi `NaN` dengan **median** masing‑masing kolom.
6. Klip nilai ke rentang 0–12.
7. Simpan hasil ke `data_normalized.csv`.

**Output:** File CSV bersih dengan 21 kolom (identitas + semua jawaban).

### 2.2 Konversi (`convert.py`)

**Tujuan:** Mengubah jawaban mentah menjadi **15 variabel final** (1 target + 14 prediktor) yang siap digunakan untuk pemodelan.

**Langkah:**

1. Baca `data_normalized.csv`.
2. **Ekstrak data demografi** → map ke kategori final.
   - `pendidikan_tertinggi_orang_tua` = max(pendidikan_ayah, pendidikan_ibu).
   - `pendapatan_keluarga` → `< 2 Juta`, `2 - 5 Juta`, `5 - 10 Juta`, `> 10 Juta`.
   - `kerja_sampingan` → `Ya` / `Tidak`.
3. **Skoring psikologis**:
   - Cocokkan jawaban teks ke pilihan A/B/C menggunakan fungsi `match_choice()` (exact + substring + fallback kata kunci).
   - Konversi pilihan ke skor numerik sesuai tabel di atas.
   - **Agregasi**:
     - `industry_readiness` = score Q12 + Q13 → threshold >50 → "Siap", else "Belum Siap".
     - `study_environment` = score Q14 + Q15 → ≤40 "Kurang Kondusif", 41–70 "Cukup Kondusif", >70 "Kondusif".
     - `skor_time_management` = score Q16 + Q17 (20–100).
     - `motivasi_akademik` = score Q18 (20–100).
     - `stress_level` = score Q19 + Q20 + Q21 → ≤45 "Rendah", 46–70 "Sedang", >70 "Berat".
     - `kompetensi_skill_level` → "Rendah", "Menengah", "Tinggi" (dari teks jawaban).
4. **Target**: `nilai_rata_rata_raport` diisi manual oleh admin (tidak dari kuesioner).
5. Simpan ke `data_17_variabel.csv` (15 kolom final: nisn, nama, email, 14 prediktor, 1 target).

**Output:** File CSV siap latih model.

---

## 3. Integrasi Database

### 3.1 ERD

![ERD SINTESA](erd_sintesa.png)

### 3.2 Tabel Utama

| Tabel | Isi |
|-------|-----|
| `users` | Akun login (admin, guru, siswa) |
| `students` | 15 variabel final (prediktor + target + data demografis) |
| `predictions` | Hasil prediksi terbaru untuk setiap siswa |
| `shap_analysis` | Nilai SHAP untuk setiap fitur per prediksi |
| `interventions` | Catatan intervensi guru untuk siswa |
| `datasets` | Log unggahan dataset oleh admin |

### 3.3 Alur Input ke Database

1. Admin mengunggah CSV hasil konversi (`data_17_variabel.csv`) melalui website SINTESA.
2. Backend Flask membaca CSV, validasi kolom, dan memasukkan data ke tabel `students`.
3. Siswa dapat memperbarui data pribadi (jam tidur, screen time, dll.) melalui form di halaman `/siswa/update-data`.
4. Setiap kali data siswa diinput/diubah, backend otomatis menjalankan prediksi dan menyimpan hasilnya di `predictions` + `shap_analysis`.

---

## 4. Teknologi yang Digunakan

| Komponen | Tools |
|----------|-------|
| Kuesioner | Google Form (CSV export) |
| Normalisasi & Konversi | Python (pandas, numpy, re) |
| Database | MySQL (via Laragon / XAMPP) |
| Backend API | Flask (Python) |
| Frontend | Next.js + Tailwind CSS |
| Model ML | Random Forest (scikit‑learn) |
| Visualisasi | Recharts (SHAP chart) |

---

## 5. Catatan Penting

- **Jam tidur** rentan salah input (format HHMM). Normalisasi mendeteksi dan memperbaikinya otomatis.
- **Skoring psikologis** menggunakan instrumen yang sudah divalidasi secara ilmiah (lihat tabel referensi).
- **Variabel target** (`nilai_rata_rata_raport`) tidak berasal dari kuesioner, melainkan diambil dari database sekolah.
- Semua data yang dikirim ke model sudah melalui **StandardScaler** di backend sebelum prediksi.
