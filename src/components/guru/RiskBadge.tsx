import { getRiskStatus, type RiskStatus } from "@/lib/utils";

type RiskBadgeProps = {
  status?: RiskStatus | string | null;
  score?: number | string | null;
};

export function RiskBadge({ status, score }: RiskBadgeProps) {
  const resolvedStatus = getRiskStatus(score) ?? status ?? null;

  if (resolvedStatus === "Rendah") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
        Rendah
      </span>
    );
  }

  if (resolvedStatus === "Netral") {
    return (
      <span className="bg-brand-warning inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm">
        Netral
      </span>
    );
  }

  if (resolvedStatus === "Tinggi") {
    return (
      <span className="bg-brand-accent-2 text-brand-header inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
        Tinggi
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-dark-4 shadow-sm dark:bg-dark-3 dark:text-dark-6">
      Belum ada data
    </span>
  );
}
