import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type RiskStatus = "Beresiko" | "Aman" | "Sangat Aman";

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

  if (parsedScore <= 81.83) {
    return "Beresiko";
  }

  if (parsedScore < 85.75) {
    return "Aman";
  }

  return "Sangat Aman";
}

/**
 * Format the risk status safely, providing a fallback if the data is missing.
 * @param status - The raw risk status string
 * @returns The formatted risk status string
 */
export function formatRiskStatus(status: RiskStatus | string | null | undefined): string {
  return status || "Belum ada data";
}
export function formatShapFeatureName(name: string): string {
  if (!name) return "";
  const dictionary: Record<string, string> = {
    jam_belajar_per_hari: "Jam Belajar Harian",
    screen_time: "Screen Time",
    jam_tidur: "Jam Tidur Malam",
    presentase_kehadiran: "Kehadiran Kelas",
    presentase_kehadiran_efektif: "Libur Tanpa Keterangan",
    skor_time_management: "Manajemen Waktu",
    motivasi_akademik: "Motivasi Akademik",
    industry_readiness: "Kesiapan Industri",
    skor_skill_level: "Skor Keahlian/Skill Level",
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

  // Handle interaction features (e.g., "feature1 feature2")
  if (name.includes(" ")) {
    const parts = name.split(" ");
    const mappedParts = parts.map((p) => dictionary[p] || p);
    return mappedParts.join(" × ");
  }

  return name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}
