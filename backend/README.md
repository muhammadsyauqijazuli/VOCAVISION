# Backend API - Student Prediction

Backend ini dibangun dengan Flask dan menyediakan API untuk autentikasi, manajemen user, data siswa, prediksi performa, intervensi guru, dashboard, dan upload dataset.

## Prasyarat

- Python 3.11+ atau versi yang kompatibel
- MySQL / MariaDB
- Database client atau tool untuk import file `.sql`
- Jika menjalankan frontend project ini, Node.js dan npm juga dibutuhkan di folder utama project

## Instalasi Backend

### 1. Masuk ke folder backend

```bash
cd backend
```

### 2. Buat virtual environment

```bash
python -m venv .venv
```

### 3. Aktifkan virtual environment

PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

Command Prompt:

```bash
.venv\Scripts\activate.bat
```

### 4. Install dependensi

```bash
pip install -r requirements.txt
```

### 5. Siapkan database

1. Buat database MySQL, misalnya `vocavision`.
2. Import file SQL dump di folder `migrations` ke database tersebut.
3. Pastikan user database punya akses baca/tulis ke database.

### 6. Atur environment variable

Backend membaca konfigurasi dari file `.env` di folder `backend/`. Minimal isi yang disarankan:

```env
SECRET_KEY=dev-secret
JWT_SECRET_KEY=jwt-secret
DATABASE_URL=mysql+pymysql://root:password@localhost/vocavision
```

Sesuaikan `DATABASE_URL` dengan kredensial MySQL Anda.

### 7. Jalankan backend

```bash
python run.py
```

Backend akan berjalan di `http://localhost:5000`.

### 8. Jalankan frontend project ini

Jika ingin menjalankan aplikasi fullstack, jalankan frontend dari folder utama project:

```bash
cd ..
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`.

## Akun Demo

Backend menyediakan akun demo untuk login cepat:

- Admin: `admin@test.com` / `admin`
- Guru: `guru@test.com` / `guru`
- Siswa: `siswa@test.com` / `siswa`

## Daftar API Endpoint

Semua endpoint berada di bawah prefix `/api`.

| Method | Endpoint                            | Auth  | Role            | Keterangan                                                                     |
| ------ | ----------------------------------- | ----- | --------------- | ------------------------------------------------------------------------------ |
| GET    | `/api/health`                       | Tidak | -               | Health check backend.                                                          |
| POST   | `/api/auth/login`                   | Tidak | -               | Login dan mendapatkan JWT access token.                                        |
| GET    | `/api/auth/me`                      | Ya    | Semua role      | Mengambil data profil user aktif dari token.                                   |
| GET    | `/api/users/`                       | Ya    | `admin`         | Mengambil daftar user, mendukung query `role` dan `search`.                    |
| POST   | `/api/users/`                       | Ya    | `admin`         | Membuat user baru.                                                             |
| PUT    | `/api/users/<user_id>`              | Ya    | `admin`         | Memperbarui data user.                                                         |
| DELETE | `/api/users/<user_id>`              | Ya    | `admin`         | Menghapus user.                                                                |
| GET    | `/api/students`                     | Ya    | `guru`          | Mengambil daftar siswa, mendukung query `search` dan `risk_status`.            |
| GET    | `/api/students/`                    | Ya    | `guru`          | Alias dari `/api/students`.                                                    |
| GET    | `/api/students/<student_id>`        | Ya    | Semua role      | Mengambil detail siswa. Role `siswa` hanya bisa melihat data miliknya sendiri. |
| POST   | `/api/predict/single`               | Ya    | Semua role      | Melakukan prediksi satu siswa, menyimpan hasil prediksi dan SHAP analysis.     |
| GET    | `/api/predict/insight/<student_id>` | Ya    | Semua role      | Mengambil insight prediksi dan SHAP analysis untuk siswa.                      |
| POST   | `/api/interventions/<student_id>`   | Ya    | `guru`          | Menambahkan catatan intervensi untuk siswa.                                    |
| GET    | `/api/interventions/<student_id>`   | Ya    | Semua role      | Mengambil daftar intervensi siswa.                                             |
| GET    | `/api/dashboard/stats`              | Ya    | `admin`, `guru` | Statistik dashboard: total siswa, rata-rata prediksi, dan rekap risiko.        |
| POST   | `/api/dataset/upload`               | Ya    | `admin`         | Upload dataset `.csv` atau `.xlsx` untuk diproses batch.                       |

## Detail Request Penting

- Endpoint yang memakai JWT harus mengirim header `Authorization: Bearer <token>`.
- `POST /api/auth/login` menerima JSON:

```json
{
  "email": "admin@test.com",
  "password": "admin"
}
```

- `POST /api/interventions/<student_id>` menerima JSON:

```json
{
  "note": "Perlu pendampingan belajar matematika 2x seminggu"
}
```

- `POST /api/dataset/upload` menggunakan `multipart/form-data` dengan field `file`.
- `POST /api/predict/single` menerima JSON data siswa. Field minimal mengikuti fitur model, dan bisa menyertakan `student_id`, `user_id`, `nisn`, serta `nama_siswa`.

## Catatan Teknis

- Backend memakai CORS untuk origin `http://localhost:3000`.
- Script entry point ada di `run.py`.
- Service prediksi menggunakan model di `backend/app/services/ml_service.py`.
