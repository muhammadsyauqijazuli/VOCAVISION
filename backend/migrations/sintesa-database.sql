-- ============================================================
-- SINTESA - Database setelah revisi variabel
-- Target: nilai_rata_rata_raport
-- Prediktor: 14 variabel (tanpa exam_score & kehadiran_pelatihan_industry)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `sintesa-database` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `sintesa-database`;

-- --------------------------------------------------------
-- Tabel users
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','guru','siswa') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Tabel students (14 prediktor + target nilai_rata_rata_raport)
-- exam_score & kehadiran_pelatihan_industry DIHAPUS
-- --------------------------------------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) DEFAULT NULL,
  `nisn` varchar(20) NOT NULL,
  `nama_siswa` varchar(100) NOT NULL,
  `jam_belajar_per_hari` decimal(4,1) DEFAULT NULL,
  `presentase_kehadiran` decimal(5,2) DEFAULT NULL,
  `nilai_rata_rata_raport` decimal(5,2) NOT NULL,   -- TARGET, tidak boleh NULL
  `skor_time_management` int DEFAULT NULL,
  `jam_tidur` decimal(4,1) DEFAULT NULL,
  `screen_time` decimal(5,1) DEFAULT NULL,
  `motivasi_akademik` int DEFAULT NULL,
  `gender` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `rata_rata_pemasukan_keluarga` enum('< 2 Juta','2 - 5 Juta','5 - 10 Juta','> 10 Juta') DEFAULT NULL,
  `pendidikan_terakhir_orang_tua` enum('SD','SMP','SMA/SMK','Diploma','Sarjana') DEFAULT NULL,
  `kerja_sampingan` enum('Ya','Tidak') DEFAULT NULL,
  `study_environment` enum('Kondusif','Cukup Kondusif','Kurang Kondusif') DEFAULT NULL,
  `kompetensi_skill_level` enum('Rendah','Menengah','Tinggi') DEFAULT NULL,
  `industry_readiness` enum('Siap','Belum Siap') DEFAULT NULL,
  `stress_level` enum('Rendah','Sedang','Berat') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nisn` (`nisn`),
  KEY `idx_students_nisn` (`nisn`),
  KEY `idx_students_user_id` (`user_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Tabel predictions (risk_status dengan 3 kategori baru)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `predictions`;
CREATE TABLE `predictions` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `student_id` char(36) NOT NULL,
  `predicted_exam_score` decimal(5,2) NOT NULL,  -- meskipun sekarang prediksi nilai rapor, nama kolom tetap exam_score untuk kompatibilitas
  `risk_status` enum('Sangat Beresiko','Beresiko','Tidak Beresiko') DEFAULT NULL,
  `model_version` varchar(20) DEFAULT '2.0.0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_predictions_student_id` (`student_id`),
  KEY `idx_predictions_risk` (`risk_status`),
  CONSTRAINT `predictions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Tabel shap_analysis (tidak berubah)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `shap_analysis`;
CREATE TABLE `shap_analysis` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `prediction_id` char(36) NOT NULL,
  `feature_name` varchar(50) NOT NULL,
  `impact_value` decimal(8,4) NOT NULL,
  `suggestion_text` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_shap_prediction_id` (`prediction_id`),
  CONSTRAINT `shap_analysis_ibfk_1` FOREIGN KEY (`prediction_id`) REFERENCES `predictions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Tabel interventions (tidak berubah)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `interventions`;
CREATE TABLE `interventions` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `student_id` char(36) NOT NULL,
  `guru_id` char(36) NOT NULL,
  `note` text NOT NULL,
  `action_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_interventions_student_id` (`student_id`),
  KEY `idx_interventions_guru_id` (`guru_id`),
  CONSTRAINT `interventions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `interventions_ibfk_2` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Tabel datasets (tidak berubah)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `datasets`;
CREATE TABLE `datasets` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `admin_id` char(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `row_count` int DEFAULT NULL,
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_datasets_admin_id` (`admin_id`),
  CONSTRAINT `datasets_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Data contoh (sesuaikan dengan akun demo)
-- ============================================================
INSERT INTO `users` (`id`, `nama`, `email`, `password_hash`, `role`) VALUES
('947bc8ca-7b83-4ccf-9b48-2823ac1c75c4', 'Admin', 'admin@test.com', 'scrypt:32768:8:1...', 'admin'),
('b245ded7-6ba2-4a66-bfab-480b1279753d', 'Siswa 1', 'siswa@test.com', 'scrypt:32768:8:1...', 'siswa'),
('f21db272-bf78-4df7-a85c-aa84c78a3dc8', 'Guru', 'guru@test.com', 'scrypt:32768:8:1...', 'guru'),
('e54e400b-1977-4bc6-b71f-2735cb6ccc58', 'Muhammad Syauqi Jazuli', 'siswa0301@sekolah.id', 'scrypt:32768:8:1...', 'siswa');

INSERT INTO `students` (`id`, `user_id`, `nisn`, `nama_siswa`, `jam_belajar_per_hari`, `presentase_kehadiran`, `nilai_rata_rata_raport`, `skor_time_management`, `jam_tidur`, `screen_time`, `motivasi_akademik`, `gender`, `rata_rata_pemasukan_keluarga`, `pendidikan_terakhir_orang_tua`, `kerja_sampingan`, `study_environment`, `kompetensi_skill_level`, `industry_readiness`, `stress_level`) VALUES
('a66fb113-74dd-4dd0-9442-7175f8c4bd5b', 'b245ded7-6ba2-4a66-bfab-480b1279753d', '1111111111', 'Siswa Test', 3.5, 85.00, 72.00, 60, 6.5, 7.0, 65, 'Laki-laki', '2 - 5 Juta', 'SMA/SMK', 'Tidak', 'Cukup Kondusif', 'Menengah', 'Belum Siap', 'Sedang'),
('ef2c9792-9495-44bf-b327-a88b286c5be9', 'e54e400b-1977-4bc6-b71f-2735cb6ccc58', '1000000301', 'Muhammad Syauqi Jazuli', 3.5, 65.00, 70.00, 60, 6.5, 12.0, 81, 'Laki-laki', '< 2 Juta', 'SMA/SMK', 'Tidak', 'Kondusif', 'Tinggi', 'Siap', 'Berat'),
('d03511f4-b867-4258-817e-64f60a42cbd1', NULL, 'AUTOb19777df', 'Tanpa Nama', 2.0, 98.00, 85.00, 100, 8.0, 6.0, 60, 'Laki-laki', '5 - 10 Juta', 'Sarjana', 'Ya', 'Kondusif', 'Tinggi', 'Siap', 'Rendah');