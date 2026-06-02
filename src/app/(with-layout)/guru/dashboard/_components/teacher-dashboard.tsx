"use client";

import { RiskBadge } from "@/components/guru/RiskBadge";
import type { RiskStatus } from "@/lib/utils";
import type { DashboardStatsResponse } from "@/types/analytics";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiCalendar,
  FiUsers,
} from "react-icons/fi";

type TeacherDashboardProps = {
  teacherName: string;
  stats: DashboardStatsResponse;
  lastUpdatedLabel: string;
  alertRows: AlertRow[];
};

type SummaryStat = {
  label: string;
  value: string;
  helper: string;
  icon: typeof FiUsers;
  accentClass: string;
};

type RiskSegment = {
  label: string;
  count: number;
  share: number;
  color: string;
  description: string;
};

type AlertRow = {
  name: string;
  className: string;
  score: number;
  status: RiskStatus;
  studentId: string;
};

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}

function getRiskCount(stats: DashboardStatsResponse) {
  return (stats.sangat_beresiko ?? 0) + (stats.beresiko ?? 0);
}

function getAverageScore(stats: DashboardStatsResponse) {
  if (stats.jumlah_siswa_berprediksi) {
    return stats.rata_rata_prediksi ?? 0;
  }

  return stats.rata_rata_exam_score ?? 0;
}

function getAverageHelper(stats: DashboardStatsResponse) {
  if (stats.jumlah_siswa_berprediksi) {
    return `Rata-rata prediksi terbaru dari ${stats.jumlah_siswa_berprediksi} siswa`;
  }

  return `Rata-rata exam_score dari ${stats.jumlah_siswa_exam_score ?? 0} siswa`;
}

function buildSummaryStats(stats: DashboardStatsResponse): SummaryStat[] {
  return [
    {
      label: "Jumlah Siswa",
      value: formatNumber(stats.total_siswa ?? 0),
      helper: "Total siswa aktif yang diampu",
      icon: FiUsers,
      accentClass: "from-brand-header to-brand-accent",
    },
    {
      label: "Rata-rata Skor",
      value: formatNumber(getAverageScore(stats)),
      helper: getAverageHelper(stats),
      icon: FiBarChart2,
      accentClass: "from-sky-500 to-cyan-400",
    },
    {
      label: "Total Siswa Berisiko",
      value: formatNumber(getRiskCount(stats)),
      helper: "Siswa yang perlu perhatian khusus",
      icon: FiAlertTriangle,
      accentClass: "from-amber-500 to-rose-500",
    },
  ];
}

function buildRiskSegments(stats: DashboardStatsResponse): RiskSegment[] {
  const totalStudents = Math.max(stats.total_siswa ?? 0, 0);
  const safeCount = Math.max(stats.tidak_beresiko ?? 0, 0);
  const highCount = Math.max(stats.beresiko ?? 0, 0);
  const veryHighCount = Math.max(stats.sangat_beresiko ?? 0, 0);

  return [
    {
      label: "Rendah (Aman)",
      count: safeCount,
      share: totalStudents ? Math.round((safeCount / totalStudents) * 100) : 0,
      color: "#3BA99C",
      description: "Mayoritas siswa berada di zona aman dan stabil.",
    },
    {
      label: "Tinggi (Perlu Perhatian)",
      count: highCount,
      share: totalStudents ? Math.round((highCount / totalStudents) * 100) : 0,
      color: "#F39C12",
      description: "Perlu pemantauan mingguan dan follow-up ringan.",
    },
    {
      label: "Sangat Beresiko (Intervensi Segera)",
      count: veryHighCount,
      share: totalStudents ? Math.round((veryHighCount / totalStudents) * 100) : 0,
      color: "#E74C3C",
      description: "Butuh intervensi akademik dan komunikasi wali kelas.",
    },
  ];
}

export function TeacherDashboard({
  teacherName,
  stats,
  lastUpdatedLabel,
  alertRows,
}: TeacherDashboardProps) {
  const summaryStats = buildSummaryStats(stats);
  const riskSegments = buildRiskSegments(stats);
  const totalStudents = stats.total_siswa ?? 0;
  const alertCount = alertRows.length;
  const alertTitle = alertCount > 0 ? `${alertCount} siswa beresiko` : "Tidak ada siswa beresiko";
  const chartData = riskSegments.map((segment) => ({
    name: segment.label,
    value: segment.count,
    color: segment.color,
  }));

  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-stroke bg-white p-7 shadow-1 dark:border-dark-3 dark:bg-gray-dark sm:p-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
          <div className="absolute -left-24 top-0 h-48 w-48 rounded-full bg-brand-accent/15 blur-3xl" />
          <div className="absolute right-0 top-10 h-36 w-36 rounded-full bg-brand-warning/15 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-accent/20 bg-brand-accent/10 px-4 py-2 text-sm font-semibold text-brand-header">
              <FiCalendar className="text-base" />
              <span>{dateLabel}</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Teacher dashboard
              </p>
              <h1 className="text-3xl font-bold text-dark dark:text-white sm:text-4xl xl:text-5xl">
                Selamat pagi, Pak/Bu Guru {teacherName ? `• ${teacherName}` : ""}!
              </h1>
              <p className="max-w-2xl text-base leading-7 text-dark-4 dark:text-dark-6 sm:text-lg">
                Pantau performa siswa, sorot risiko akademik lebih cepat, dan ambil tindakan
                dari siswa yang paling membutuhkan perhatian hari ini.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-accent/20 bg-brand-header px-6 py-5 text-dark shadow-[0_18px_40px_rgba(31,111,95,0.18)] dark:text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dark/70 dark:text-white/70">
              Last sync
            </p>
            <p className="mt-1 text-3xl font-bold">{lastUpdatedLabel}</p>
            <p className="mt-1 text-sm text-dark/80 dark:text-white/80">Data terbaru dari backend</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="group relative overflow-hidden rounded-[24px] border border-stroke bg-white p-6 shadow-1 transition-transform duration-300 hover:-translate-y-1 dark:border-dark-3 dark:bg-gray-dark"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.accentClass}`} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-dark-4 dark:text-dark-6">{stat.label}</p>
                  <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">{stat.value}</h2>
                </div>

                <div className={`rounded-2xl bg-gradient-to-br ${stat.accentClass} p-3 text-dark dark:text-white shadow-lg`}>
                  <Icon className="text-xl" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-dark-4 dark:text-dark-6">{stat.helper}</p>
            </article>
          );
        })}
      </section>

      <section className="space-y-8">
        <article className="rounded-[28px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Risk distribution
              </p>
              <h2 className="mt-1 text-xl font-bold text-dark dark:text-white sm:text-2xl">
                Distribusi risiko siswa
              </h2>
            </div>
            <p className="text-sm text-dark-4 dark:text-dark-6">
              {totalStudents} siswa aktif terpantau
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-5">
              {riskSegments.map((segment) => (
                <div
                  key={segment.label}
                  className="rounded-2xl border border-stroke/70 bg-gray-50 p-5 dark:border-dark-3 dark:bg-dark-2/60"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-dark dark:text-white">{segment.label}</p>
                      <p className="text-sm text-dark-4 dark:text-dark-6">{segment.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-dark dark:text-white">{segment.count}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dark-4 dark:text-dark-6">
                        {segment.share}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-stroke/50 dark:bg-dark-3">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${segment.share}%`,
                        backgroundColor: segment.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-stroke/70 bg-gray-50 p-5 dark:border-dark-3 dark:bg-dark-2/60">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Summary chart
                </p>
                <h3 className="mt-1 text-lg font-bold text-dark dark:text-white">
                  Doughnut chart distribusi risiko
                </h3>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 16,
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-dark-4 dark:text-dark-6">
                {riskSegments.map((segment) => (
                  <div key={segment.label} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span>{segment.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Quick action / alerts
              </p>
              <h2 className="mt-1 text-xl font-bold text-dark dark:text-white sm:text-2xl">
                {alertTitle}
              </h2>
            </div>

            <div className="rounded-2xl bg-red-50 px-3 py-2 text-right dark:bg-red-500/10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-300">
                Prioritas
              </p>
              <p className="text-lg font-bold text-red-700 dark:text-red-200">Hari ini</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-stroke/70 dark:border-dark-3">
            <div className="grid grid-cols-[1.6fr_0.75fr_0.6fr_1fr] gap-4 border-b border-stroke/70 bg-gray-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-dark-4 dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6">
              <span>Nama Siswa</span>
              <span>Kelas</span>
              <span>Skor</span>
              <span>Status Risiko</span>
            </div>

            <div className="divide-y divide-stroke/70 dark:divide-dark-3">
              {alertRows.length > 0 ? (
                alertRows.map((row) => (
                  <div
                    key={row.studentId}
                    className="grid grid-cols-[1.6fr_0.75fr_0.6fr_1fr] items-center gap-4 px-5 py-5"
                  >
                    <div>
                      <p className="font-semibold text-dark dark:text-white">{row.name}</p>
                      <p className="text-sm text-dark-4 dark:text-dark-6">ID siswa: {row.studentId}</p>
                    </div>

                    <span className="text-sm font-medium text-dark-4 dark:text-dark-6">{row.className}</span>
                    <span className="text-sm font-bold text-dark dark:text-white">{formatNumber(row.score)}</span>
                    <div>
                      <RiskBadge status={row.status} score={row.score} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-6 text-sm text-dark-4 dark:text-dark-6">
                  Tidak ada siswa beresiko.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-header/5 p-5 dark:bg-brand-header/10">
                <p className="text-sm font-semibold text-brand-header">Catatan kelas</p>
              <p className="mt-2 text-sm leading-6 text-dark-4 dark:text-dark-6">
                  Kolom kelas akan tampil otomatis saat data kelas tersedia.
              </p>
            </div>

            <div className="rounded-2xl bg-brand-warning/10 p-5 dark:bg-brand-warning/15">
                <p className="text-sm font-semibold text-brand-header">Sumber data</p>
              <p className="mt-2 text-sm leading-6 text-dark-4 dark:text-dark-6">
                  Seluruh angka di halaman ini mengikuti data terbaru yang tersimpan di sistem.
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}