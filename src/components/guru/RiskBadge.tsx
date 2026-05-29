import { getRiskStatus, type RiskStatus } from "@/lib/utils";

type RiskBadgeProps = {
  status?: RiskStatus | string | null;
  score?: number | string | null;
};

export function RiskBadge({ status, score }: RiskBadgeProps) {
  const resolvedStatus = getRiskStatus(score) ?? status ?? null;

  if (resolvedStatus === "Sangat Beresiko") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
        Sangat Beresiko
      </span>
    );
  }

  if (resolvedStatus === "Beresiko") {
    return (
      <span className="inline-flex items-center rounded-full bg-brand-warning px-3 py-1 text-xs font-semibold text-white shadow-sm">
        Beresiko
      </span>
    );
  }

  if (resolvedStatus === "Tidak Beresiko") {
    return (
      <span className="inline-flex items-center rounded-full bg-brand-accent-2 px-3 py-1 text-xs font-semibold text-brand-header shadow-sm">
        Tidak Beresiko
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-dark-4 shadow-sm dark:bg-dark-3 dark:text-dark-6">
      Belum ada data
    </span>
  );
}