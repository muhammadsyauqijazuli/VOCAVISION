- phpMyAdmin SQL Dump
-- version 6.0.0-dev+20250814.d53832d337
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3307
-- Generation Time: May 23, 2026 at 05:47 AM
-- Server version: 8.4.3
-- PHP Version: 8.4.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sintesa-database`
--

-- --------------------------------------------------------

--
-- Table structure for table `datasets`
--

CREATE TABLE `datasets` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `admin_id` char(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `row_count` int DEFAULT NULL,
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interventions`
--

CREATE TABLE `interventions` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `student_id` char(36) NOT NULL,
  `guru_id` char(36) NOT NULL,
  `note` text NOT NULL,
  `action_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `predictions`
--

CREATE TABLE `predictions` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `student_id` char(36) NOT NULL,
  `predicted_exam_score` decimal(5,2) NOT NULL,
  `risk_status` enum('Sangat Beresiko','Beresiko','Tidak Beresiko') NOT NULL,
  `model_version` varchar(20) DEFAULT '1.0.0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shap_analysis`
--

CREATE TABLE `shap_analysis` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `prediction_id` char(36) NOT NULL,
  `feature_name` varchar(50) NOT NULL,
  `impact_value` decimal(8,4) NOT NULL,
  `suggestion_text` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) DEFAULT NULL,
  `nisn` varchar(20) NOT NULL,
  `nama_siswa` varchar(100) NOT NULL,
  `jam_belajar_per_hari` decimal(4,1) DEFAULT NULL,
  `presentase_kehadiran` decimal(5,2) DEFAULT NULL,
  `nilai_rata_rata_raport` decimal(5,2) DEFAULT NULL,
  `skor_time_management` int DEFAULT NULL,
  `jam_tidur` decimal(4,1) DEFAULT NULL,
  `screen_time` decimal(5,1) DEFAULT NULL,
  `kehadiran_pelatihan_industry` decimal(5,2) DEFAULT NULL,
  `motivasi_akademik` int DEFAULT NULL,
  `exam_score` decimal(5,2) DEFAULT NULL,
  `gender` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `rata_rata_pemasukan_keluarga` enum('< 2 Juta','2 - 5 Juta','5 - 10 Juta','> 10 Juta') DEFAULT NULL,
  `pendidikan_terakhir_orang_tua` enum('SD','SMP','SMA/SMK','Diploma','Sarjana') DEFAULT NULL,
  `kerja_sampingan` enum('Ya','Tidak') DEFAULT NULL,
  `study_environment` enum('Kondusif','Cukup Kondusif','Kurang Kondusif') DEFAULT NULL,
  `kompetensi_skill_level` enum('Rendah','Menengah','Tinggi') DEFAULT NULL,
  `industry_readiness` enum('Siap','Belum Siap') DEFAULT NULL,
  `stress_level` enum('Rendah','Sedang','Berat') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','guru','siswa') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `datasets`
--
ALTER TABLE `datasets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_datasets_admin_id` (`admin_id`);

--
-- Indexes for table `interventions`
--
ALTER TABLE `interventions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_interventions_student_id` (`student_id`),
  ADD KEY `idx_interventions_guru_id` (`guru_id`);

--
-- Indexes for table `predictions`
--
ALTER TABLE `predictions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_predictions_student_id` (`student_id`),
  ADD KEY `idx_predictions_risk` (`risk_status`);

--
-- Indexes for table `shap_analysis`
--
ALTER TABLE `shap_analysis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_shap_prediction_id` (`prediction_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nisn` (`nisn`),
  ADD KEY `idx_students_nisn` (`nisn`),
  ADD KEY `idx_students_user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `datasets`
--
ALTER TABLE `datasets`
  ADD CONSTRAINT `datasets_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `interventions`
--
ALTER TABLE `interventions`
  ADD CONSTRAINT `interventions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `interventions_ibfk_2` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `predictions`
--
ALTER TABLE `predictions`
  ADD CONSTRAINT `predictions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shap_analysis`
--
ALTER TABLE `shap_analysis`
  ADD CONSTRAINT `shap_analysis_ibfk_1` FOREIGN KEY (`prediction_id`) REFERENCES `predictions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
