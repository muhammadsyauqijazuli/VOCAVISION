import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type RiskStatus = "Sangat Beresiko" | "Aman" | "Sangat Aman";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskStatus(
  score: number | string | null | undefined,
): RiskStatus | null {
  if (score === null || score === undefined || score === "") {
    return null;
  }

  const parsedScore = typeof score === "number" ? score : Number(score);
  if (Number.isNaN(parsedScore)) {
    return null;
  }

  if (parsedScore <= 83.36) {
    return "Sangat Beresiko";
  }

  if (parsedScore <= 85) {
    return "Aman";
  }

  return "Sangat Aman";
}

export function formatRiskStatus(status: RiskStatus | string | null | undefined): string {
  // Model now returns "Sangat Beresiko", "Aman", "Sangat Aman"
  // so no transformation is needed unless it's missing
  return status || "Belum ada data";
}
export function formatShapFeatureName(name: string): string {
  if (!name) return "";
  const dictionary: Record<string, string> = {
    jam_belajar_per_hari: "Jam Belajar Harian",
    screen_time: "Screen Time",
    jam_tidur: "Jam Tidur Malam",
    deviasi_tidur: "Penyimpangan Tidur",
    presentase_kehadiran: "Kehadiran Kelas",
    ses_index: "Status Sosial Ekonomi",
    skor_time_management: "Manajemen Waktu",
    motivasi_akademik: "Motivasi Akademik",
    rasio_belajar_vs_layar: "Rasio Belajar vs Layar",
    indeks_produktivitas: "Indeks Produktivitas",
    sisa_waktu_aktif: "Sisa Waktu Aktif",
    "industry_readiness_Belum Siap": "Kesiapan Industri (Belum)",
    "industry_readiness_Siap": "Kesiapan Industri (Siap)",
    "kompetensi_skill_level_Rendah": "Skill Level (Rendah)",
    "kompetensi_skill_level_Menengah": "Skill Level (Menengah)",
    "kompetensi_skill_level_Tinggi": "Skill Level (Tinggi)",
    "stress_level_Rendah": "Tingkat Stres (Rendah)",
    "stress_level_Sedang": "Tingkat Stres (Sedang)",
    "stress_level_Berat": "Tingkat Stres (Berat)",
    "kerja_sampingan_Ya": "Kerja Sampingan (Ya)",
    "kerja_sampingan_Tidak": "Kerja Sampingan (Tidak)",
  };

  if (dictionary[name]) {
    return dictionary[name];
  }

  // Interaction features, e.g. "jam_tidur indeks_produktivitas"
  if (name.includes(" ")) {
    const parts = name.split(" ");
    const mappedParts = parts.map((p) => dictionary[p] || p);
    return mappedParts.join(" × ");
  }

  return name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}
