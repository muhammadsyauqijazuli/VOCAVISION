```markdown
# CLAUDE.md

# SINTESA – Sistem Intelijen Evaluasi Siswa

## Project Overview

SINTESA adalah aplikasi analitik pendidikan berbasis web yang digunakan untuk memprediksi dan memantau performa akademik siswa menggunakan model Machine Learning Random Forest yang telah dilatih sebelumnya.

Sistem dirancang untuk membantu sekolah mengidentifikasi siswa berisiko lebih awal melalui prediksi nilai ujian, analisis faktor penyebab menggunakan SHAP, serta pencatatan intervensi akademik yang dapat dilakukan oleh guru.

Terdapat tiga jenis pengguna:

1. Admin
2. Guru
3. Siswa

Setiap peran memiliki dashboard dan fitur yang berbeda.

---

# Main Objectives

Sistem harus mampu:

- Memprediksi skor ujian siswa menggunakan model Random Forest.
- Menampilkan status risiko akademik (**Sangat Beresiko**, **Beresiko**, **Tidak Beresiko**).
- Menjelaskan faktor penyebab prediksi menggunakan SHAP values.
- Memberikan rekomendasi tindakan kepada siswa dan guru.
- Menyimpan catatan intervensi akademik.
- Mengelola data pengguna.
- Mengelola dataset pelatihan.
- Mengekspor laporan akademik dalam format PDF dan Excel.

---

# Risk Status Logic

Status risiko ditentukan berdasarkan **predicted exam score**:

| Skor Prediksi | Status Risiko |
|---------------|---------------|
| ≥ 75 | **Tidak Beresiko** |
| 65 – 74 | **Beresiko** |
| ≤ 64 | **Sangat Beresiko** |

Fungsi bantu di `lib/utils.ts`:

```ts
export function getRiskStatus(score: number): "Sangat Beresiko" | "Beresiko" | "Tidak Beresiko" {
  if (score >= 75) return "Tidak Beresiko";
  if (score >= 65) return "Beresiko";
  return "Sangat Beresiko";
}
```

---

# Tech Stack

## Frontend

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS v4 (CSS-first configuration, no `tailwind.config.js`)
- Recharts
- React Icons (Heroicons v1)

## Backend

Backend API akan dibuat menggunakan:

- Next.js Route Handlers
- REST API pattern
- *Note: Inferensi Machine Learning (file .pkl) mungkin memerlukan microservice Python terpisah (FastAPI/Flask) atau bridge Python-Node, namun semua rute komunikasi klien tetap melalui Next.js API.*

## Database

- MySQL (Production)
- ORM: Prisma

## Machine Learning

Model sudah tersedia dan tidak perlu dilatih ulang dari frontend.
Output model:

- Predicted Exam Score
- Risk Category
- SHAP Values
- Recommendation List

---

# API Endpoints (Architecture Contract)

Berikut adalah struktur REST API yang harus diimplementasikan menggunakan Next.js Route Handlers (`app/api/...`):

## Authentication & Users
| Method | Endpoint | Role Akses | Deskripsi |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Validasi email/password, return JWT token & role. |
| GET | `/api/users/me` | All | Mengambil profil user yang sedang login. |
| GET | `/api/users` | Admin | Mengambil daftar seluruh pengguna (Guru/Siswa). |
| POST | `/api/users` | Admin | Menambah pengguna baru. |

## Core Prediction (Machine Learning Bridge)
| Method | Endpoint | Role Akses | Deskripsi |
|---|---|---|---|
| POST | `/api/predict/single` | Siswa, Guru | Menerima payload 17 variabel, melakukan pre-processing, memanggil model RF, menyimpan ke DB, dan mengembalikan prediksi & SHAP. |
| POST | `/api/predict/batch` | Admin, Guru | Menerima file CSV/Excel, memproses banyak data sekaligus, dan menyimpan masal ke DB. |
| GET | `/api/predict/insight/[student_id]` | Siswa, Guru | Mengambil hasil analisis SHAP dan menerjemahkannya menjadi rekomendasi teks. |

## Dashboard & Monitoring
| Method | Endpoint | Role Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Admin, Guru | Mengembalikan metrik agregat (total siswa berisiko, rata-rata kelas, dll). |
| GET | `/api/students` | Guru | Mengambil daftar seluruh siswa & nilai prediksinya (mendukung query search & filter). |
| GET | `/api/students/[id]` | Guru, Siswa* | Mengambil detail 17 variabel dan riwayat prediksi siswa. (*Siswa hanya ID miliknya). |

## Interventions
| Method | Endpoint | Role Akses | Deskripsi |
|---|---|---|---|
| POST | `/api/interventions/[student_id]` | Guru | Menyimpan catatan intervensi/tindak lanjut terhadap siswa berisiko. |
| GET | `/api/interventions/[student_id]` | Guru | Melihat riwayat intervensi siswa tertentu. |

---

# Database Schema

Database menggunakan MySQL melalui Prisma ORM. Berikut adalah rincian skema tabel utamanya:

### 1. Table: `users`
- `id` (CHAR(36), Primary Key, default UUID)
- `nama` (VARCHAR 100)
- `email` (VARCHAR 100, Unique)
- `password_hash` (VARCHAR 255)
- `role` (ENUM: 'admin', 'guru', 'siswa')
- `created_at`, `updated_at` (TIMESTAMP)

### 2. Table: `students` (17 Variabel)
- `id` (CHAR(36), Primary Key)
- `user_id` (CHAR(36), Foreign Key ke users, nullable)
- `nisn` (VARCHAR 20, Unique)
- `nama_siswa` (VARCHAR 100)
- **Numerik (9):** `jam_belajar_per_hari`, `presentase_kehadiran`, `nilai_rata_rata_raport`, `skor_time_management`, `jam_tidur`, `screen_time`, `kehadiran_pelatihan_industry`, `motivasi_akademik`, `exam_score`
- **Kategorikal (8):** `gender`, `rata_rata_pemasukan_keluarga`, `pendidikan_terakhir_orang_tua`, `kerja_sampingan`, `study_environment`, `kompetensi_skill_level`, `industry_readiness`, `stress_level`

### 3. Table: `predictions`
- `id` (CHAR(36), Primary Key)
- `student_id` (CHAR(36), Foreign Key ke students)
- `predicted_exam_score` (DECIMAL 5,2)
- `risk_status` (ENUM: 'Sangat Beresiko', 'Beresiko', 'Tidak Beresiko')
- `model_version` (VARCHAR 20)
- `created_at`

### 4. Table: `shap_analysis`
- `id` (CHAR(36), Primary Key)
- `prediction_id` (CHAR(36), Foreign Key ke predictions)
- `feature_name` (VARCHAR 50)
- `impact_value` (DECIMAL 8,4)
- `suggestion_text` (TEXT)

### 5. Table: `interventions`
- `id` (CHAR(36), Primary Key)
- `student_id` (CHAR(36), Foreign Key ke students)
- `guru_id` (CHAR(36), Foreign Key ke users)
- `note` (TEXT)
- `action_date` (TIMESTAMP)
- `created_at`

### 6. Table: `datasets` (Log Upload)
- `id` (CHAR(36), Primary Key)
- `admin_id` (CHAR(36), Foreign Key ke users)
- `file_name` (VARCHAR 255)
- `row_count` (INT)
- `status` (ENUM: 'pending', 'processing', 'completed', 'failed')
- `uploaded_at`

---

# Design System

## Color Palette

| Token | HEX | Usage |
|---------|---------|---------|
| brand-header | #1F6F5F | Navbar, primary buttons |
| brand-accent | #3BA99C | Active menu, secondary buttons |
| brand-accent-2 | #A3E4D7 | Low risk badge, success state |
| brand-danger | #E74C3C | High risk badge, delete buttons |
| brand-warning | #F39C12 | Warning icon, medium risk |
| brand-light | #EEEEEE | Global page background |

---

# Tailwind CSS Rules

Tailwind CSS v4 digunakan dengan pendekatan **CSS-first**.

Semua custom theme harus ditulis di:

```
app/globals.css
```

Menggunakan direktif:

```css
@import "tailwindcss";

@theme {
  --color-brand-header: #1F6F5F;
  --color-brand-accent: #3BA99C;
  --color-brand-accent-2: #A3E4D7;
  --color-brand-danger: #E74C3C;
  --color-brand-warning: #F39C12;
  --color-brand-light: #EEEEEE;
}
```

**JANGAN membuat konfigurasi baru pada:**
- `tailwind.config.js`
- `tailwind.config.ts`

karena proyek menggunakan Tailwind CSS v4 yang membaca konfigurasi langsung dari CSS.

---

# Authentication Flow

## Public Route
- `/login` – Semua pengguna login dari halaman yang sama.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | admin |
| Guru | guru@test.com | guru |
| Siswa | siswa@test.com | siswa |

## Authorization

Setelah login:

| Role | Redirect |
|------|----------|
| Admin | `/admin/dashboard` |
| Guru | `/guru/dashboard` |
| Siswa | `/siswa/dashboard` |

Middleware (`middleware.ts`) digunakan untuk:
- Memeriksa token login
- Melindungi halaman privat
- Redirect user jika role tidak sesuai

---

# Project Structure

```
student-prediction/
│
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── api/
│   │   ├── auth/login/route.ts
│   │   ├── users/route.ts
│   │   ├── predict/single/route.ts
│   │   ├── predict/batch/route.ts
│   │   ├── dashboard/stats/route.ts
│   │   ├── students/[id]/route.ts
│   │   └── interventions/route.ts
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   └── dataset/page.tsx
│   ├── guru/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── students/page.tsx
│   │   ├── students/[id]/page.tsx
│   │   └── reports/page.tsx
│   ├── siswa/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── insight/page.tsx
│   │   └── update-data/page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── GuruSidebar.tsx
│   │   └── SiswaSidebar.tsx
│   ├── admin/
│   │   └── DataUploader.tsx
│   ├── guru/
│   │   ├── RiskBadge.tsx
│   │   ├── SHAPChart.tsx
│   │   └── InterventionForm.tsx
│   └── siswa/
│       ├── SummaryCard.tsx
│       ├── InsightList.tsx
│       └── LifestyleForm.tsx
│
├── hooks/
├── lib/
├── prisma/
│   └── schema.prisma
├── types/
│   ├── user.ts
│   └── prediction.ts
├── middleware.ts
├── next.config.js
├── postcss.config.mjs
└── package.json
```

---

# User Roles

## Admin
**Responsibilities:**
- Mengelola akun pengguna
- Upload dataset
- Monitoring data sistem

**Pages:**
- `/admin/dashboard` – Menampilkan metrik utama sistem.
- `/admin/users` – Tambah, edit, hapus, cari, dan filter akun.
- `/admin/dataset` – Upload CSV/Excel, validasi file, dan preview.

## Guru
**Responsibilities:**
- Memantau performa siswa
- Melihat SHAP analysis
- Memberikan intervensi akademik
- Mengekspor laporan

**Pages:**
- `/guru/dashboard` – Ringkasan kelas, rata-rata nilai, jumlah siswa berisiko.
- `/guru/students` – Daftar seluruh siswa, pencarian, dan filter.
- `/guru/students/[id]` – Detail siswa, prediksi, visualisasi SHAP, dan form intervensi.
- `/guru/reports` – Export PDF/Excel laporan prediksi.

## Siswa
**Responsibilities:**
- Melihat prediksi akademik
- Memahami faktor penyebab
- Memperbarui data pribadi

**Pages:**
- `/siswa/dashboard` – Prediksi skor, status risiko, nama siswa.
- `/siswa/insight` – Terjemahan SHAP menjadi rekomendasi actionable.
- `/siswa/update-data` – Form input kuesioner mandiri untuk 17 variabel gaya hidup.

---

# Core Components

## DataUploader
- Drag and drop
- CSV & Excel validation
- Error handling & Preview

## RiskBadge
- **Sangat Beresiko**: Red background (`bg-red-600 text-white`)
- **Beresiko**: Warning background (`bg-brand-warning text-white`)
- **Tidak Beresiko**: Success background (`bg-brand-accent-2 text-brand-header`)

## SHAPChart
- Menggunakan Recharts (Horizontal Bar Chart).
- Positif = meningkatkan skor (brand-accent); Negatif = menurunkan skor (brand-danger).
- Terurut menurun berdasarkan nilai absolut (absolute impact).

## InterventionForm
- Input catatan.
- Timestamp otomatis & riwayat.
- Disimpan ke localStorage (simulasi) atau API.

## SummaryCard
- Card layout (Nama, Prediksi, Status Risiko).
- Warna status sesuai RiskBadge.

## LifestyleForm
- Validasi 17 input field (9 numerik dan 8 select box).
- Terbagi dalam dua section: Data Numerik dan Data Kategorikal.
- Umpan balik sukses setelah submit.

---

# UI/UX & Coding Standards

1. **TypeScript Strict Mode**: Gunakan interface/types (simpan di `types/`), hindari `any`.
2. **Component Design**: Functional components, Hooks, modular, dan reusable. Server Components sebagai default, Client Components hanya bila perlu interaktivitas.
3. **Responsive & Accessible**: Wajib mendukung mobile, tablet, desktop. Selalu sediakan loading, empty, dan error state.
4. **Tailwind v4**: Gunakan warna dari Design System. Hindari hardcode hex di luar `globals.css`.
5. **Layout Background**: Semua halaman menggunakan `bg-brand-light` (#EEEEEE).
6. **Navbar**: Full width, menggunakan `bg-brand-header` (#1F6F5F).
7. **Sidebar**: Lebar tetap `w-64`, background putih, hidden di mobile.

---

# Important Notes for Claude

Saat menghasilkan kode:

1. Ikuti struktur folder yang sudah ditentukan. Termasuk struktur rute `/api` untuk backend.
2. Gunakan TypeScript secara ketat dan buat representasi schema database di `prisma/schema.prisma` saat diminta.
3. Gunakan Tailwind CSS v4 (tanpa config file tradisional).
4. Gunakan App Router Next.js 16.
5. Pisahkan logic fetching data (melalui fetch API ke Route Handlers) dan presentation.
6. Semua halaman dan komponen harus siap diintegrasikan dengan skema database dan endpoints yang tercantum di atas.
7. Nama aplikasi selalu **SINTESA** (bukan EduPredict).
8. Status risiko ada 3: **Sangat Beresiko**, **Beresiko**, **Tidak Beresiko**.
9. Password hash menggunakan bcrypt, tidak disimpan dalam teks biasa.
10. Semua ID menggunakan UUID (CHAR(36) di MySQL).
```