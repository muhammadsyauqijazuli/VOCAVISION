"use client";

import type { AnalyticsStudentRecord, DashboardStatsResponse } from "@/types/analytics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

type BubbleDatum = {
  name: string;
  jam_belajar_per_hari: number;
  exam_score: number;
  screen_time: number;
};

type StressDatum = {
  stress_level: string;
  avg_exam_score: number;
};

type RiskDatum = {
  name: string;
  value: number;
};

type AttendanceTrendDatum = {
  name: string;
  presentase_kehadiran: number;
  exam_score: number;
};

type AnalyticsDashboardProps = {
  stats: DashboardStatsResponse;
  students: AnalyticsStudentRecord[];
};

const COLORS = {
  header: "#1F6F5F",
  accent: "#3BA99C",
  accent2: "#A3E4D7",
  danger: "#E74C3C",
  warning: "#F39C12",
  slate: "#64748B",
  grid: "rgba(148, 163, 184, 0.22)",
};

function cardClassName() {
  return "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-dark-3 dark:bg-gray-dark";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hasBubbleMetrics(
  student: AnalyticsStudentRecord,
): student is AnalyticsStudentRecord & {
  jam_belajar_per_hari: number;
  exam_score: number;
  screen_time: number;
} {
  return isNumber(student.jam_belajar_per_hari) && isNumber(student.exam_score) && isNumber(student.screen_time);
}

function hasAttendanceMetrics(
  student: AnalyticsStudentRecord,
): student is AnalyticsStudentRecord & {
  presentase_kehadiran: number;
  exam_score: number;
} {
  return isNumber(student.presentase_kehadiran) && isNumber(student.exam_score);
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatPercent(value: number) {
  return `${value.toFixed(0)}%`;
}

function formatScore(value: number) {
  return value.toFixed(1);
}

function buildBubbleData(students: AnalyticsStudentRecord[]) {
  return students
    .filter(hasBubbleMetrics)
    .sort((left, right) => left.jam_belajar_per_hari - right.jam_belajar_per_hari)
    .slice(0, 24)
    .map((student) => ({
      name: student.nama,
      jam_belajar_per_hari: student.jam_belajar_per_hari,
      exam_score: student.exam_score,
      screen_time: student.screen_time,
    }));
}

function buildStressData(students: AnalyticsStudentRecord[]) {
  const buckets = new Map<string, { total: number; count: number }>();

  for (const student of students) {
    if (!student.stress_level || !isNumber(student.exam_score)) {
      continue;
    }

    const current = buckets.get(student.stress_level) ?? { total: 0, count: 0 };
    current.total += student.exam_score;
    current.count += 1;
    buckets.set(student.stress_level, current);
  }

  const order = ["Rendah", "Sedang", "Berat"];

  return order
    .filter((label) => buckets.has(label))
    .map((label) => {
      const bucket = buckets.get(label)!;

      return {
        stress_level: label,
        avg_exam_score: bucket.total / bucket.count,
      };
    });
}

function buildRiskData(stats: DashboardStatsResponse, students: AnalyticsStudentRecord[]) {
  const hasStats =
    typeof stats.sangat_beresiko === "number" ||
    typeof stats.beresiko === "number" ||
    typeof stats.tidak_beresiko === "number";

  if (hasStats) {
    return [
      { name: "Sangat Beresiko", value: stats.sangat_beresiko ?? 0 },
      { name: "Beresiko", value: stats.beresiko ?? 0 },
      { name: "Tidak Beresiko", value: stats.tidak_beresiko ?? 0 },
    ];
  }

  const counts = {
    "Sangat Beresiko": 0,
    Beresiko: 0,
    "Tidak Beresiko": 0,
  };

  for (const student of students) {
    const status = student.latest_prediction?.risk_status ?? student.risk_status;
    if (status && status in counts) {
      counts[status as keyof typeof counts] += 1;
    }
  }

  return [
    { name: "Sangat Beresiko", value: counts["Sangat Beresiko"] },
    { name: "Beresiko", value: counts.Beresiko },
    { name: "Tidak Beresiko", value: counts["Tidak Beresiko"] },
  ];
}

function buildAttendanceTrendData(students: AnalyticsStudentRecord[]) {
  return students
    .filter(hasAttendanceMetrics)
    .sort((left, right) => right.presentase_kehadiran - left.presentase_kehadiran)
    .slice(0, 6)
    .map((student) => ({
      name: student.nama,
      presentase_kehadiran: student.presentase_kehadiran,
      exam_score: student.exam_score,
    }));
}

function BubbleTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: BubbleDatum }> }) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl dark:border-dark-3 dark:bg-gray-dark">
      <p className="font-semibold text-dark dark:text-white">{data.name}</p>
      <p className="mt-2 text-dark-4 dark:text-dark-6">Jam belajar: {data.jam_belajar_per_hari.toFixed(1)} jam</p>
      <p className="text-dark-4 dark:text-dark-6">Exam score: {data.exam_score.toFixed(1)}</p>
      <p className="text-dark-4 dark:text-dark-6">Screen time: {data.screen_time.toFixed(1)} jam</p>
    </div>
  );
}

function StressTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: StressDatum }> }) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl dark:border-dark-3 dark:bg-gray-dark">
      <p className="font-semibold text-dark dark:text-white">Stress Level: {data.stress_level}</p>
      <p className="mt-2 text-dark-4 dark:text-dark-6">Rata-rata exam score: {data.avg_exam_score.toFixed(1)}</p>
    </div>
  );
}

function RiskTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: RiskDatum }> }) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl dark:border-dark-3 dark:bg-gray-dark">
      <p className="font-semibold text-dark dark:text-white">{data.name}</p>
      <p className="mt-2 text-dark-4 dark:text-dark-6">Total siswa: {data.value}</p>
    </div>
  );
}

function AttendanceTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: AttendanceTrendDatum }> }) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl dark:border-dark-3 dark:bg-gray-dark">
      <p className="font-semibold text-dark dark:text-white">{data.name}</p>
      <p className="mt-2 text-dark-4 dark:text-dark-6">Kehadiran: {formatPercent(data.presentase_kehadiran)}</p>
      <p className="text-dark-4 dark:text-dark-6">Exam score: {formatScore(data.exam_score)}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-90 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-dark-3 dark:bg-dark-2">
      <div className="max-w-sm space-y-2">
        <p className="text-lg font-semibold text-dark dark:text-white">{title}</p>
        <p className="text-sm leading-6 text-slate-500 dark:text-dark-6">{description}</p>
      </div>
    </div>
  );
}

export function AnalyticsDashboard({ stats, students }: AnalyticsDashboardProps) {
  const bubbleData = buildBubbleData(students);
  const stressData = buildStressData(students);
  const riskData = buildRiskData(stats, students);
  const attendanceTrendData = buildAttendanceTrendData(students);

  const totalStudents = students.length || stats.total_siswa || 0;
  const averageExamScore =
    stats.rata_rata_exam_score ?? average(students.map((student) => student.exam_score).filter(isNumber));
  const averageStudyHours = average(students.map((student) => student.jam_belajar_per_hari).filter(isNumber));
  const lowRiskCount = stats.tidak_beresiko ?? riskData.find((item) => item.name === "Tidak Beresiko")?.value ?? 0;

  return (
    <div className="space-y-6 bg-brand-light/40 text-slate-900 dark:bg-[#020d1a] dark:text-white">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <div
          className="px-6 py-8 text-white md:px-8"
          style={{
            backgroundImage: "linear-gradient(90deg, #1F6F5F 0%, #3BA99C 50%, #1F6F5F 100%)",
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Analytics</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">EDA Dashboard</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/90 md:text-base">
            Visualisasi eksploratif yang dibangun dari data siswa dan hasil analisis backend, bukan lagi mock data.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={cardClassName()}>
          <p className="text-sm text-slate-500 dark:text-dark-6">Total sample</p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">{totalStudents}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-6">Seluruh siswa yang tersedia di backend</p>
        </div>
        <div className={cardClassName()}>
          <p className="text-sm text-slate-500 dark:text-dark-6">Avg exam score</p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">{formatScore(averageExamScore)}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-6">Rata-rata nilai dari data nyata</p>
        </div>
        <div className={cardClassName()}>
          <p className="text-sm text-slate-500 dark:text-dark-6">Avg study hours</p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">{formatScore(averageStudyHours)}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-6">Rata-rata jam belajar per hari</p>
        </div>
        <div className={cardClassName()}>
          <p className="text-sm text-slate-500 dark:text-dark-6">Low risk</p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">{lowRiskCount}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-6">Tidak Beresiko menurut analisis backend</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className={cardClassName()}>
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-header">Correlation</p>
            <h2 className="mt-1 text-xl font-bold text-dark dark:text-white">Korelasi Jam Belajar vs Nilai Ujian</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-dark-6">
              Bubble chart memakai data siswa asli dari backend. Ukuran bubble merepresentasikan screen time.
            </p>
          </div>

          {bubbleData.length ? (
            <div className="w-full" style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 18, bottom: 12, left: 6 }}>
                  <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="jam_belajar_per_hari"
                    name="Jam Belajar"
                    unit=" jam"
                    domain={[0, 8]}
                    tick={{ fill: COLORS.slate, fontSize: 12 }}
                    axisLine={{ stroke: COLORS.slate }}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    dataKey="exam_score"
                    name="Exam Score"
                    domain={[0, 100]}
                    tick={{ fill: COLORS.slate, fontSize: 12 }}
                    axisLine={{ stroke: COLORS.slate }}
                    tickLine={false}
                  />
                  <ZAxis dataKey="screen_time" range={[90, 420]} name="Screen Time" unit=" jam" />
                  <Tooltip cursor={{ strokeDasharray: "4 4" }} content={<BubbleTooltip />} />
                  <Scatter data={bubbleData} fill={COLORS.header} stroke={COLORS.header} strokeWidth={1} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="Belum ada data untuk chart ini"
              description="Backend belum mengirim siswa dengan jam belajar, exam score, dan screen time yang lengkap."
            />
          )}
        </article>

        <article className={cardClassName()}>
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Psychology</p>
            <h2 className="mt-1 text-xl font-bold text-dark dark:text-white">Rata-rata Exam Score per Stress Level</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-dark-6">
              Distribusi ini dihitung langsung dari siswa yang punya stress level dan exam score.
            </p>
          </div>

          {stressData.length ? (
            <div className="w-full" style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stressData} margin={{ top: 10, right: 16, bottom: 8, left: 8 }}>
                  <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="stress_level" tick={{ fill: COLORS.slate, fontSize: 12 }} axisLine={{ stroke: COLORS.slate }} tickLine={false} />
                  <YAxis tick={{ fill: COLORS.slate, fontSize: 12 }} axisLine={{ stroke: COLORS.slate }} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<StressTooltip />} cursor={{ fill: "rgba(31, 111, 95, 0.08)" }} />
                  <Bar dataKey="avg_exam_score" radius={[10, 10, 0, 0]}>
                    {stressData.map((entry) => (
                      <Cell
                        key={entry.stress_level}
                        fill={
                          entry.stress_level === "Rendah"
                            ? COLORS.accent2
                            : entry.stress_level === "Sedang"
                              ? COLORS.warning
                              : COLORS.danger
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="Belum ada data stress level"
              description="Chart ini akan muncul setelah backend mengirim data stress_level dan exam_score yang valid."
            />
          )}
        </article>

        <article className={cardClassName()}>
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-warning">Distribution</p>
            <h2 className="mt-1 text-xl font-bold text-dark dark:text-white">Distribusi Risk Status</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-dark-6">
              Donut chart ini memakai distribusi risiko nyata dari hasil analisis prediksi backend.
            </p>
          </div>

          <div className="flex w-full items-center justify-center" style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<RiskTooltip />} />
                <Pie
                  data={riskData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={78}
                  outerRadius={120}
                  paddingAngle={3}
                  cornerRadius={10}
                >
                  {riskData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === "Sangat Beresiko"
                          ? COLORS.danger
                          : entry.name === "Beresiko"
                            ? COLORS.warning
                            : COLORS.accent2
                      }
                    />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={cardClassName()}>
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-header">Trend</p>
            <h2 className="mt-1 text-xl font-bold text-dark dark:text-white">Attendance vs Exam Score</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-dark-6">
              Composed chart ini memakai siswa dengan kehadiran tertinggi untuk memperlihatkan pola nyata di data.
            </p>
          </div>

          {attendanceTrendData.length ? (
            <div className="w-full" style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={attendanceTrendData} margin={{ top: 10, right: 16, bottom: 8, left: 8 }}>
                  <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: COLORS.slate, fontSize: 11 }} axisLine={{ stroke: COLORS.slate }} tickLine={false} interval={0} />
                  <YAxis yAxisId="left" tick={{ fill: COLORS.slate, fontSize: 12 }} axisLine={{ stroke: COLORS.slate }} tickLine={false} domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: COLORS.slate, fontSize: 12 }} axisLine={{ stroke: COLORS.slate }} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<AttendanceTooltip />} cursor={{ fill: "rgba(59, 169, 156, 0.08)" }} />
                  <Bar yAxisId="left" dataKey="presentase_kehadiran" name="Kehadiran" fill={COLORS.accent} radius={[8, 8, 0, 0]} barSize={22} />
                  <Line yAxisId="right" type="monotone" dataKey="exam_score" name="Exam Score" stroke={COLORS.header} strokeWidth={3} dot={{ r: 4, fill: COLORS.header }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="Belum ada data attendance"
              description="Chart ini akan tampil jika backend mengirim nilai kehadiran dan exam score siswa secara lengkap."
            />
          )}
        </article>
      </section>
    </div>
  );
}