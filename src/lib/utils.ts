import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type RiskStatus = "Rendah" | "Netral" | "Tinggi";

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

  if (parsedScore <= 70) {
    return "Rendah";
  }

  if (parsedScore <= 85) {
    return "Netral";
  }

  return "Tinggi";
}
