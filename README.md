# VOCAVISION

**Vocational Student Predictive Analytics Platform**

VOCAVISION adalah platform analitik prediktif berbasis web untuk siswa SMK (Sekolah Menengah Kejuruan) yang dirancang untuk deteksi dini risiko akademik, forecasting performa ujian, dan intervensi terpadu. Platform ini menggunakan model **Random Forest** dan **SHAP Explainability** untuk memprediksi nilai raport siswa dan memberikan rekomendasi perbaikan yang dapat ditindaklanjuti.

---

## Daftar Isi

- [Arsitektur Sistem](#arsitektur-sistem)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi & Menjalankan](#instalasi--menjalankan)
- [Variabel Environment](#variabel-environment)
- [Akun Demo](#akun-demo)
- [Struktur Project](#struktur-project)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Machine Learning Pipeline](#machine-learning-pipeline)
- [Fitur per Role](#fitur-per-role)

---

## Arsitektur Sistem

```
┌──────────────────────────────┐     ┌──────────────────────────────┐
│         FRONTEND             │     │          BACKEND             │
│   Next.js 16 + React 19     │◄───►│   Flask + SQLAlchemy         │
│   Tailwind CSS v4            │     │   Flask-JWT-Extended         │
│   ApexCharts + Recharts      │     │   Flask-SocketIO             │
│   Socket.IO Client           │     │   Scikit-Learn + SHAP        │
│   http://localhost:3000      │     │   http://localhost:5000      │
└──────────────────────────────┘     └───────────┬──────────────────┘
                                                 │
                                     ┌───────────▼──────────────────┐
                                     │        DATABASE              │
                                     │     MySQL / MariaDB          │
                                     └──────────────────────────────┘
```

Frontend berkomunikasi dengan backend melalui **REST API** (`/api/*`) dan **WebSocket** (`/socket.io/*`) untuk notifikasi real-time. Autentikasi menggunakan **JWT (JSON Web Token)** dengan middleware role-based access control.

---

## Fitur Utama

### 🔮 Prediksi Akademik
- Prediksi nilai raport siswa menggunakan model Random Forest Classifier & Regressor
- Klasifikasi risiko otomatis: **Beresiko**, **Aman**, **Sangat Aman**
- Threshold berbasis Jenks Natural Breaks untuk klasifikasi yang akurat

### 📊 SHAP Explainability
- Analisis SHAP (SHapley Additive exPlanations) untuk setiap prediksi
- Visualisasi kontribusi setiap fitur terhadap skor prediksi
- Rekomendasi perbaikan otomatis berdasarkan impact positif/negatif

### 📁 Upload Dataset Batch
- Upload data siswa massal via file CSV atau XLSX
- Pemrosesan asinkron di background thread dengan progress tracking
- Auto-create akun siswa dan prediksi untuk setiap baris data

### 👥 Multi-Role Dashboard
- **Admin**: Manajemen pengguna, upload dataset, analytics EDA, export laporan
- **Guru**: Monitoring risiko siswa, catatan intervensi, insight SHAP
- **Siswa**: Update data mandiri, prediksi real-time, insight personal
- **Orang Tua**: Monitoring anak yang terhubung, insight SHAP per anak

### 📤 Export Laporan
- Export data ke **PDF** (dengan header, chart, dan layout landscape A4)
- Export data ke **Excel** (XLSX) dengan kolom lengkap

### 🔔 Notifikasi Real-time
- Push notification via Socket.IO untuk intervensi guru
- Notifikasi in-app dengan status dibaca/belum dibaca

---

## Tech Stack

### Frontend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.x | React framework dengan App Router |
| [React](https://react.dev/) | 19.x | UI component library |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type-safe JavaScript |
| [ApexCharts](https://apexcharts.com/) | 4.x | Interactive chart library |
| [Recharts](https://recharts.org/) | 2.x | Declarative chart components |
| [Socket.IO Client](https://socket.io/) | 4.x | Real-time WebSocket client |
| [Zod](https://zod.dev/) | 4.x | Schema validation |
| [Sonner](https://sonner.emilkowal.dev/) | 2.x | Toast notifications |
| [Prisma](https://www.prisma.io/) | 7.x | ORM (auth schema) |
| [Better Auth](https://www.better-auth.com/) | 1.x | Authentication framework |

### Backend
| Teknologi | Kegunaan |
|---|---|
| [Flask](https://flask.palletsprojects.com/) | Web framework |
| [Flask-SQLAlchemy](https://flask-sqlalchemy.readthedocs.io/) | ORM & database |
| [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/) | JWT authentication |
| [Flask-Migrate](https://flask-migrate.readthedocs.io/) | Database migrations (Alembic) |
| [Flask-CORS](https://flask-cors.readthedocs.io/) | Cross-Origin Resource Sharing |
| [Flask-SocketIO](https://flask-socketio.readthedocs.io/) | WebSocket support |
| [Scikit-Learn](https://scikit-learn.org/) | Machine learning (RandomForest) |
| [SHAP](https://shap.readthedocs.io/) | Model explainability |
| [Pandas](https://pandas.pydata.org/) | Data processing |
| [NumPy](https://numpy.org/) | Numerical computing |
| [ReportLab](https://www.reportlab.com/) | PDF generation |
| [OpenPyXL](https://openpyxl.readthedocs.io/) | Excel file handling |
| [PyMySQL](https://pymysql.readthedocs.io/) | MySQL driver |

### Database
- **MySQL** atau **MariaDB**

---

## Prasyarat

- **Node.js** v18+ dan **npm**
- **Python** 3.10+
- **MySQL** atau **MariaDB** (misalnya via XAMPP, Laragon, atau Docker)
- **Git**

---

## Instalasi & Menjalankan

### Cara Cepat (Start Bersamaan)

Dari root project:

```bash
.\start-dev.bat
```

Script ini akan menjalankan frontend dan backend secara bersamaan dalam window terpisah.

### Instalasi Manual

#### 1. Clone Repository

```bash
git clone https://github.com/muhammadsyauqijazuli/VOCAVISION.git
cd VOCAVISION
```

#### 2. Setup Frontend

```bash
npm install
```

#### 3. Setup Backend

```bash
cd backend
python -m venv .venv

# Aktifkan virtual environment
# PowerShell:
.venv\Scripts\Activate.ps1
# Command Prompt:
.venv\Scripts\activate.bat

pip install -r requirements.txt
```

#### 4. Setup Database

1. Buat database MySQL baru (contoh: `vocavision`)
2. Import file SQL dari folder `backend/migrations/` jika tersedia
3. Atau biarkan Flask-Migrate membuat tabel otomatis

#### 5. Konfigurasi Environment

**Frontend** — buat file `.env.local` di root:

```env
BETTER_AUTH_SECRET=your-auth-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=your-database-url
```

**Backend** — buat file `backend/.env`:

```env
SECRET_KEY=your-secret-key
DATABASE_URL=mysql+pymysql://root:password@localhost/vocavision
JWT_SECRET_KEY=your-jwt-secret
```

#### 6. Jalankan

**Frontend** (dari root):
```bash
npm run dev
```

**Backend** (dari folder `backend/`):
```bash
python run.py
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |

---

## Variabel Environment

### Frontend (`.env.local`)

| Variable | Deskripsi |
|---|---|
| `BETTER_AUTH_SECRET` | Secret key untuk Better Auth |
| `BETTER_AUTH_URL` | URL aplikasi |
| `NEXT_PUBLIC_APP_URL` | Public URL untuk client-side |
| `DATABASE_URL` | Connection string database (Prisma) |

### Backend (`backend/.env`)

| Variable | Default | Deskripsi |
|---|---|---|
| `SECRET_KEY` | `dev-secret` | Flask secret key |
| `DATABASE_URL` | `mysql+pymysql://root:@localhost/vocavision` | SQLAlchemy database URI |
| `JWT_SECRET_KEY` | `jwt-secret` | Secret untuk JWT token signing |

---

## Akun Demo

| Role | Email | Password |
|---|---|---|
| Admin | `admin@test.com` | `admin` |
| Guru | `guru@test.com` | `guru` |
| Siswa | `siswa@test.com` | `siswa` |

> **Catatan:** Akun siswa yang dibuat via upload dataset menggunakan NISN sebagai password default.

---

## Struktur Project

```
VOCAVISION/
├── backend/                        # Flask Backend
│   ├── app/
│   │   ├── __init__.py             # App factory, extension init, SocketIO
│   │   ├── config.py               # Flask configuration
│   │   ├── models.py               # SQLAlchemy ORM models
│   │   ├── utils.py                # Helper utilities (role_required decorator)
│   │   ├── routes/
│   │   │   ├── auth.py             # Login, /me endpoint
│   │   │   ├── users.py            # CRUD pengguna (admin)
│   │   │   ├── students.py         # Daftar & detail siswa
│   │   │   ├── predictions.py      # Single prediction & SHAP insight
│   │   │   ├── dataset.py          # Upload & batch processing dataset
│   │   │   ├── dashboard.py        # Statistik dashboard
│   │   │   ├── interventions.py    # Catatan intervensi guru
│   │   │   ├── notifications.py    # Notifikasi siswa
│   │   │   ├── orangtua.py         # Dashboard & SHAP orang tua
│   │   │   └── export.py           # Export PDF & Excel
│   │   └── services/
│   │       ├── ml_service.py       # ML pipeline (preprocess, predict, SHAP)
│   │       └── data_service.py     # Data helper service
│   ├── ml_model/
│   │   ├── rf_classifier_best.pkl  # Trained RandomForest classifier
│   │   ├── scaler.pkl              # Feature scaler
│   │   ├── feature_names.pkl       # Selected feature names
│   │   ├── train_columns.pkl       # Training column order
│   │   ├── final_model_rf.ipynb    # Training notebook
│   │   ├── konverter_data.py       # Data conversion utilities
│   │   └── *.csv                   # Raw & cleaned datasets
│   ├── migrations/                 # Flask-Migrate / SQL dumps
│   ├── run.py                      # Entry point server
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Backend environment variables
│
├── src/                            # Next.js Frontend
│   ├── app/
│   │   ├── (with-layout)/          # Pages dengan sidebar layout
│   │   │   ├── admin/              # Admin pages
│   │   │   │   ├── dashboard/      # Dashboard admin
│   │   │   │   ├── users/          # Manajemen pengguna
│   │   │   │   ├── dataset/        # Upload dataset
│   │   │   │   ├── predictions/    # Daftar prediksi
│   │   │   │   ├── monitoring/     # Monitoring siswa
│   │   │   │   ├── analytics/      # EDA analytics
│   │   │   │   └── reports/        # Export laporan
│   │   │   ├── guru/               # Guru pages
│   │   │   │   ├── dashboard/      # Dashboard guru
│   │   │   │   ├── students/       # Daftar siswa
│   │   │   │   ├── predictions/    # Prediksi siswa
│   │   │   │   ├── analytics/      # Analytics guru
│   │   │   │   └── reports/        # Export laporan
│   │   │   ├── siswa/              # Siswa pages
│   │   │   │   ├── dashboard/      # Dashboard siswa
│   │   │   │   ├── prediksi/       # Hasil prediksi
│   │   │   │   ├── insight/        # SHAP insight
│   │   │   │   ├── update-data/    # Update data mandiri
│   │   │   │   ├── catatan-guru/   # Catatan intervensi guru
│   │   │   │   └── profile/        # Profil siswa
│   │   │   └── orangtua/           # Orang tua pages
│   │   │       └── dashboard/      # Dashboard orang tua
│   │   ├── (without-layout)/       # Pages tanpa sidebar
│   │   │   └── auth/               # Sign-in & Sign-up
│   │   └── api/                    # Next.js API routes (proxy)
│   ├── components/                 # Reusable UI components
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Auth & utility libraries
│   ├── services/                   # Frontend service layer
│   ├── types/                      # TypeScript type definitions
│   ├── utils/                      # Utility functions
│   └── proxy.ts                    # Middleware (auth guard & role routing)
│
├── prisma/                         # Prisma schema (auth)
├── public/                         # Static assets
├── start-dev.bat                   # Quick start script (Windows)
├── package.json                    # Node.js dependencies
└── README.md                       # Dokumentasi ini
```

---

## Database Schema

### Entity Relationship

```
┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌───────────────┐
│  Users   │────►│ Students  │────►│ Predictions  │────►│ SHAPAnalysis  │
│          │     │           │     │              │     │               │
│ id (PK)  │     │ id (PK)   │     │ id (PK)      │     │ id (PK)       │
│ nama     │     │ user_id   │     │ student_id   │     │ prediction_id │
│ email    │     │ nisn      │     │ predicted_   │     │ feature_name  │
│ password │     │ nama_siswa│     │  exam_score  │     │ impact_value  │
│ role     │     │ ...fields │     │ risk_status  │     │ suggestion    │
└──────────┘     └───────────┘     │ model_version│     └───────────────┘
     │                │            └──────────────┘
     │                │
     │           ┌────▼────────┐     ┌──────────────┐
     │           │Interventions│     │ Notifications │
     │           │             │     │               │
     └──────────►│ student_id  │     │ student_id    │
                 │ guru_id     │     │ sender_id     │
                 │ note        │     │ message       │
                 └─────────────┘     │ is_read       │
                                     └───────────────┘

     ┌──────────┐     ┌──────────────┐
     │  Users   │────►│ ParentLinks  │
     │ (parent) │     │              │
     └──────────┘     │ parent_id    │
                      │ student_id   │
                      └──────────────┘

     ┌──────────────┐
     │   Datasets   │
     │              │
     │ admin_id     │
     │ file_name    │
     │ row_count    │
     │ status       │
     └──────────────┘
```

### Tabel Utama

| Tabel | Deskripsi |
|---|---|
| `users` | Semua pengguna (admin, guru, siswa, orang_tua) |
| `students` | Data profil akademik & demografis siswa |
| `predictions` | Hasil prediksi ML (skor & status risiko) |
| `shap_analysis` | Detail analisis SHAP per fitur per prediksi |
| `interventions` | Catatan intervensi guru terhadap siswa |
| `notifications` | Notifikasi in-app untuk siswa |
| `parent_links` | Relasi orang tua ↔ siswa |
| `datasets` | Log upload dataset batch |

### Roles Pengguna

| Role | Deskripsi |
|---|---|
| `admin` | Akses penuh: manajemen user, dataset, analytics, export |
| `guru` | Monitoring siswa, intervensi, insight prediksi |
| `siswa` | Lihat data diri, update profil, prediksi personal |
| `orang_tua` | Monitoring anak yang terhubung via ParentLink |

---

## API Endpoints

Semua endpoint berada di bawah prefix `/api`. Endpoint yang membutuhkan autentikasi harus mengirim header `Authorization: Bearer <token>`.

### Autentikasi

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/api/health` | ❌ | Health check |
| `POST` | `/api/auth/login` | ❌ | Login, mendapatkan JWT token |
| `GET` | `/api/auth/me` | ✅ | Profil user aktif dari token |

### Manajemen User (Admin)

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/users/` | `admin` | Daftar user (query: `role`, `search`) |
| `POST` | `/api/users/` | `admin` | Buat user baru |
| `PUT` | `/api/users/<user_id>` | `admin` | Update data user |
| `DELETE` | `/api/users/<user_id>` | `admin` | Hapus user |

### Data Siswa

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/students` | `admin`, `guru`, `orang_tua` | Daftar siswa (pagination, search, sort, filter) |
| `GET` | `/api/students/<student_id>` | Semua | Detail siswa (siswa hanya bisa lihat miliknya) |

### Prediksi & Insight

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| `POST` | `/api/predict/single` | Semua | Jalankan prediksi ML untuk satu siswa |
| `GET` | `/api/predict/insight/<student_id>` | Semua | Ambil insight SHAP & rekomendasi |

### Dataset

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| `POST` | `/api/dataset/upload` | `admin` | Upload CSV/XLSX untuk batch processing |
| `GET` | `/api/dataset/<dataset_id>` | `admin` | Cek progress processing dataset |

### Dashboard

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | `admin`, `guru`, `orang_tua` | Statistik: total siswa, rata-rata skor, distribusi risiko, top risky, global feature importance |

### Intervensi Guru

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| `POST` | `/api/interventions/<student_id>` | `guru` | Tambah catatan intervensi |
| `GET` | `/api/interventions/<student_id>` | Semua | Daftar intervensi siswa |

### Notifikasi

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/notifications` | `siswa` | Ambil notifikasi siswa |
| `PUT` | `/api/notifications/read/<notif_id>` | `siswa` | Tandai notifikasi dibaca |

### Orang Tua

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/orangtua/dashboard` | `orang_tua` | Dashboard anak yang terhubung |
| `GET` | `/api/orangtua/shap/<student_id>` | `orang_tua` | Analisis SHAP per anak |

### Export Laporan

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| `GET` | `/api/export/pdf` | `admin`, `guru` | Export data ke PDF (landscape A4) |
| `GET` | `/api/export/excel` | `admin`, `guru` | Export data ke Excel (XLSX) |

---

## Machine Learning Pipeline

### Model

- **Classifier**: `RandomForestClassifier` (Calibrated) — klasifikasi risiko 3-kelas
- **Regressor**: `RandomForestRegressor` — prediksi skor numerik
- **Explainer**: `SHAP TreeExplainer` — analisis kontribusi fitur
- **Model Version**: `3.0.0`

### Fitur Input

#### Numerik (8 fitur)
| Fitur | Deskripsi |
|---|---|
| `jam_belajar_per_hari` | Jam belajar mandiri per hari |
| `screen_time` | Waktu layar per hari (jam) |
| `jam_tidur` | Jam tidur per malam |
| `presentase_kehadiran` | Persentase kehadiran kelas |
| `presentase_kehadiran_efektif` | Kehadiran efektif (tanpa alpha) |
| `industry_readiness` | Skor kesiapan industri |
| `skor_time_management` | Skor manajemen waktu |
| `motivasi_akademik` | Skor motivasi akademik |

#### Kategorikal (6 fitur)
| Fitur | Nilai Valid |
|---|---|
| `kerja_sampingan` | Ya, Tidak |
| `rata_rata_pemasukan_keluarga` | < 2 Juta, 2 - 5 Juta, 5 - 10 Juta, > 10 Juta |
| `pendidikan_terakhir_orang_tua` | SD, SMP, SMA/SMK, Diploma, Sarjana |
| `study_environment` | Kondusif, Cukup Kondusif, Kurang Kondusif |
| `kompetensi_skill_level` | Rendah, Menengah, Tinggi |
| `stress_level` | Rendah, Sedang, Berat |

### Feature Engineering

Pipeline secara otomatis menghasilkan fitur turunan:

| Fitur Turunan | Formula |
|---|---|
| `rasio_belajar_screen` | `jam_belajar / (screen_time + 1)` |
| `indeks_kerentanan_stres` | `stress_num / (motivasi_akademik + 1)` |
| `skor_regulasi_diri` | `skor_time_management × motivasi_akademik` |
| `indeks_sosial_ekonomi` | `pemasukan_val × pendidikan_val` |
| `keselarasan_persepsi_skill` | Aligned / Imposter / Overconfident |

### Preprocessing Pipeline

```
Input Data → Normalize Aliases → Extract Features → Feature Engineering
    → One-Hot Encoding → Align to Training Columns → Scale → Predict
```

### Klasifikasi Risiko

| Status | Kriteria (Jenks Thresholds) |
|---|---|
| **Beresiko** | Skor ≤ 81.83 |
| **Aman** | 81.83 < Skor ≤ 85.75 |
| **Sangat Aman** | Skor > 85.75 |

### Artifacts Model (`backend/ml_model/`)

| File | Deskripsi |
|---|---|
| `rf_classifier_best.pkl` | Trained RandomForest classifier |
| `scaler.pkl` | StandardScaler untuk normalisasi fitur |
| `feature_names.pkl` | Daftar nama fitur yang digunakan model |
| `train_columns.pkl` | Urutan kolom saat training |
| `final_model_rf.ipynb` | Jupyter notebook proses training model |

---

## Fitur per Role

### 🔑 Admin

| Halaman | Path | Deskripsi |
|---|---|---|
| Dashboard | `/admin/dashboard` | Statistik global, distribusi risiko, top risky students |
| Manajemen User | `/admin/users` | CRUD pengguna semua role |
| Upload Dataset | `/admin/dataset` | Upload CSV/XLSX dengan progress tracking |
| Prediksi | `/admin/predictions` | Daftar semua prediksi |
| Monitoring | `/admin/monitoring` | Monitoring status siswa |
| Analytics | `/admin/analytics` | Visualisasi EDA interaktif |
| Laporan | `/admin/reports` | Export PDF & Excel |

### 👨‍🏫 Guru

| Halaman | Path | Deskripsi |
|---|---|---|
| Dashboard | `/guru/dashboard` | Overview siswa & risiko |
| Daftar Siswa | `/guru/students` | Daftar siswa dengan filter risiko |
| Prediksi | `/guru/predictions` | Detail prediksi per siswa |
| Analytics | `/guru/analytics` | Analisis tren dan pola |
| Laporan | `/guru/reports` | Export data siswa |

### 🎓 Siswa

| Halaman | Path | Deskripsi |
|---|---|---|
| Dashboard | `/siswa/dashboard` | Ringkasan status akademik |
| Prediksi | `/siswa/prediksi` | Hasil prediksi personal |
| Insight | `/siswa/insight` | Visualisasi SHAP & rekomendasi |
| Update Data | `/siswa/update-data` | Update data kebiasaan & profil |
| Catatan Guru | `/siswa/catatan-guru` | Lihat intervensi dari guru |
| Profil | `/siswa/profile` | Profil akun siswa |

### 👪 Orang Tua

| Halaman | Path | Deskripsi |
|---|---|---|
| Dashboard | `/orangtua/dashboard` | Monitoring anak yang terhubung, skor prediksi, dan insight SHAP |

---

## Catatan Teknis

- **CORS**: Backend dikonfigurasi untuk origin `http://localhost:3000`
- **WebSocket**: Socket.IO digunakan untuk notifikasi real-time intervensi guru ke siswa
- **Auth Flow**: Login → JWT token → disimpan di cookie → middleware proxy.ts memeriksa role dan routing
- **Dataset Processing**: Upload diproses secara asinkron di background thread, progress bisa di-poll via `/api/dataset/<id>`
- **Model Fallback**: Jika file `.pkl` tidak ditemukan, backend menggunakan dummy model untuk development

---

## Lisensi

Proyek ini dikembangkan untuk keperluan akademik dan riset pendidikan kejuruan.
