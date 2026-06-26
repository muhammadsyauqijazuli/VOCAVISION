import type { RiskStatus } from "@/lib/utils";

export type StudentAnalyticsRecord = {
  student_id: string;
  nama: string;
  jam_belajar_per_hari: number;
  presentase_kehadiran: number;
  nilai_rata_rata_raport: number;
  skor_time_management: number;
  jam_tidur: number;
  screen_time: number;
  motivasi_akademik: number;
  gender: "Laki-laki" | "Perempuan";
  rata_rata_pemasukan_keluarga: "Rendah" | "Menengah" | "Tinggi";
  pendidikan_terakhir_orang_tua: "SMA" | "D3" | "S1" | "S2";
  kerja_sampingan: "Tidak" | "Ya";
  study_environment: "Kondusif" | "Cukup" | "Kurang Kondusif";
  kompetensi_skill_level: "Dasar" | "Menengah" | "Mahir";
  industry_readiness: "Siap" | "Belum Siap";
  stress_level: "Rendah" | "Sedang" | "Berat";
  risk_status: RiskStatus;
};

export type AnalyticsStudentRecord = {
  id: string;
  nama: string;
  nisn: string;
  jam_belajar_per_hari: number | null;
  presentase_kehadiran: number | null;
  nilai_rata_rata_raport: number | null;
  skor_time_management: number | null;
  jam_tidur: number | null;
  screen_time: number | null;
  motivasi_akademik: number | null;
  gender: "Laki-laki" | "Perempuan" | null;
  rata_rata_pemasukan_keluarga: string | null;
  pendidikan_terakhir_orang_tua: string | null;
  kerja_sampingan: string | null;
  study_environment: string | null;
  kompetensi_skill_level: string | null;
  industry_readiness: string | null;
  stress_level: "Rendah" | "Sedang" | "Berat" | null;
  predicted_score: number | null;
  risk_status: RiskStatus | null;
  latest_prediction: {
    predicted_nilai_raport: number | null;
    risk_status: RiskStatus | null;
    created_at: string | null;
  } | null;
};

export type DashboardStatsResponse = {
  total_siswa?: number;
  rata_rata_prediksi?: number;
  jumlah_siswa_berprediksi?: number;
  rata_rata_nilai_raport?: number;
  jumlah_siswa_dinilai?: number;
  beresiko?: number;
  aman?: number;
  sangat_aman?: number;
  top_risky_students?: {
    student_id: string;
    nama: string;
    nisn: string;
    role: string;
    predicted_score: number | null;
    risk_status: RiskStatus;
  }[];
  global_shap?: Array<{
    feature: string;
    importance: number;
  }>;
};
