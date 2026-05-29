import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type RiskStatus = "Sangat Beresiko" | "Beresiko" | "Tidak Beresiko";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskStatus(score: number | string | null | undefined): RiskStatus | null {
  if (score === null || score === undefined || score === "") {
    return null;
  }

  const parsedScore = typeof score === "number" ? score : Number(score);
  if (Number.isNaN(parsedScore)) {
    return null;
  }

  if (parsedScore >= 75) {
    return "Tidak Beresiko";
  }

  if (parsedScore >= 65) {
    return "Beresiko";
  }

  return "Sangat Beresiko";
}
