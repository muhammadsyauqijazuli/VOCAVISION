"use client";

import type {
  AnalyticsStudentRecord,
  DashboardStatsResponse,
} from "@/types/analytics";
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
  nilai_raport: number;
  screen_time: number;
};

type StressDatum = {
  stress_level: string;
  avg_nilai_raport: number;
};

type RiskDatum = {
  name: string;
  value: number;
};

type AttendanceTrendDatum = {
  name: string;
  presentase_kehadiran: number;
  nilai_raport: number;
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
  return "rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hasBubbleMetrics(
  student: AnalyticsStudentRecord,
): student is AnalyticsStudentRecord & {
  jam_belajar_per_hari: number;
  nilai_rata_rata_raport: number;
  screen_time: number;
} {
  return (
    isNumber(student.jam_belajar_per_hari) &&
    isNumber(student.nilai_rata_rata_raport) &&
    isNumber(student.screen_time)
  );
}

function hasAttendanceMetrics(
  student: AnalyticsStudentRecord,
): student is AnalyticsStudentRecord & {
  presentase_kehadiran: number;
  nilai_rata_rata_raport: number;
} {
  return isNumber(student.presentase_kehadiran) && isNumber(student.nilai_rata_rata_raport);
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
    .sort(
      (left, right) => left.jam_belajar_per_hari - right.jam_belajar_per_hari,
    )
    .slice(0, 24)
    .map((student) => ({
      name: student.nama,
      jam_belajar_per_hari: student.jam_belajar_per_hari,
      nilai_raport: student.nilai_rata_rata_raport,
      screen_time: student.screen_time,
    }));
}

function buildStressData(students: AnalyticsStudentRecord[]) {
  const buckets = new Map<string, { total: number; count: number }>();

  for (const student of students) {
    if (!student.stress_level || !isNumber(student.nilai_rata_rata_raport)) {
      continue;
    }

    const current = buckets.get(student.stress_level) ?? { total: 0, count: 0 };
    current.total += student.nilai_rata_rata_raport;
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
        avg_nilai_raport: bucket.total / bucket.count,
      };
    });
}

function buildRiskData(
  stats: DashboardStatsResponse,
  students: AnalyticsStudentRecord[],
) {
  const hasStats =
    typeof stats.rendah === "number" ||
    typeof stats.netral === "number" ||
    typeof stats.tinggi === "number";

  if (hasStats) {
    return [
      { name: "Sangat Beresiko", value: stats.rendah ?? 0 },
      { name: "Aman", value: stats.netral ?? 0 },
      { name: "Sangat Aman", value: stats.tinggi ?? 0 },
    ];
  }

  const counts = {
    Rendah: 0,
    Netral: 0,
    Tinggi: 0,
  };

  for (const student of students) {
    const status =
      student.latest_prediction?.risk_status ?? student.risk_status;
    if (status && status in counts) {
      counts[status as keyof typeof counts] += 1;
    }
  }

  return [
    { name: "Sangat Beresiko", value: counts.Rendah },
    { name: "Aman", value: counts.Netral },
    { name: "Sangat Aman", value: counts.Tinggi },
  ];
}

function buildAttendanceTrendData(students: AnalyticsStudentRecord[]) {
  return students
    .filter(hasAttendanceMetrics)
    .sort(
      (left, right) => right.presentase_kehadiran - left.presentase_kehadiran,
    )
    .slice(0, 6)
    .map((student) => ({
      name: student.nama,
      presentase_kehadiran: student.presentase_kehadiran,
      nilai_raport: student.nilai_rata_rata_raport,
    }));
}

function buildReadinessData(students: AnalyticsStudentRecord[]) {
  const counts = { Siap: 0, "Belum Siap": 0 };
  for (const student of students) {
    if (student.industry_readiness === "Siap" || student.industry_readiness === "Belum Siap") {
      counts[student.industry_readiness]++;
    }
  }
  if (counts.Siap === 0 && counts["Belum Siap"] === 0) return [];
  return [
    { name: "Siap", value: counts.Siap },
    { name: "Belum Siap", value: counts["Belum Siap"] },
  ];
}

function getBubbleInsight(data: ReturnType<typeof buildBubbleData>) {
  if (!data.length) return null;
  const avgStudy = data.reduce((acc, curr) => acc + curr.jam_belajar_per_hari, 0) / data.length;
  const avgScore = data.reduce((acc, curr) => acc + curr.nilai_raport, 0) / data.length;
  return `Rata-rata jam belajar siswa pada populasi ini adalah ${avgStudy.toFixed(1)} jam/hari dengan pencapaian nilai rata-rata ${avgScore.toFixed(1)}.`;
}

function getStressInsight(data: ReturnType<typeof buildStressData>) {
  if (!data.length) return null;
  const highestScore = [...data].sort((a, b) => b.avg_nilai_raport - a.avg_nilai_raport)[0];
  return `Performa nilai tertinggi rata-rata diraih oleh kelompok siswa dengan tingkat stres '${highestScore.stress_level}'.`;
}

function getRiskInsight(data: ReturnType<typeof buildRiskData>) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  if (total === 0) return null;
  const rendah = data.find(d => d.name === "Sangat Beresiko")?.value || 0;
  const netral = data.find(d => d.name === "Aman")?.value || 0;
  const pct = (((rendah + netral) / total) * 100).toFixed(1);
  return `Dari total siswa, terdapat ${pct}% yang terdeteksi pada kategori Sangat Beresiko dan Aman yang membutuhkan perhatian.`;
}

function getAttendanceInsight(data: ReturnType<typeof buildAttendanceTrendData>) {
  if (!data.length) return null;
  const avgAtt = data.reduce((acc, curr) => acc + curr.presentase_kehadiran, 0) / data.length;
  return `Sampel menunjukkan rata-rata kehadiran sebesar ${avgAtt.toFixed(0)}%. Kehadiran yang tinggi konsisten dengan pencapaian nilai ujian yang baik.`;
}

function getReadinessInsight(data: ReturnType<typeof buildReadinessData>) {
  if (!data.length) return null;
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const siap = data.find(d => d.name === "Siap")?.value || 0;
  const pct = ((siap / total) * 100).toFixed(1);
  return `Sebanyak ${pct}% siswa dikategorikan "Siap Industri". Tingkatkan pelatihan praktik bagi siswa yang belum siap.`;
}

function BubbleTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: BubbleDatum }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl dark:border-dark-3 dark:bg-gray-dark">
      <p className="font-semibold text-dark dark:text-white">{data.name}</p>
      <p className="mt-2 text-dark-4 dark:text-dark-6">
        Jam belajar: {data.jam_belajar_per_hari.toFixed(1)} jam
      </p>
      <p className="text-dark-4 dark:text-dark-6">
        Nilai raport: {data.nilai_raport.toFixed(1)}
      </p>
      <p className="text-dark-4 dark:text-dark-6">
        Screen time: {data.screen_time.toFixed(1)} jam
      </p>
    </div>
  );
}

function StressTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: StressDatum }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl dark:border-dark-3 dark:bg-gray-dark">
      <p className="font-semibold text-dark dark:text-white">
        Stress Level: {data.stress_level}
      </p>
      <p className="mt-2 text-dark-4 dark:text-dark-6">
        Rata-rata nilai raport: {data.avg_nilai_raport.toFixed(1)}
      </p>
    </div>
  );
}

function RiskTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RiskDatum }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl dark:border-dark-3 dark:bg-gray-dark">
      <p className="font-semibold text-dark dark:text-white">{data.name}</p>
      <p className="mt-2 text-dark-4 dark:text-dark-6">
        Total siswa: {data.value}
      </p>
    </div>
  );
}

function AttendanceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: AttendanceTrendDatum }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl dark:border-dark-3 dark:bg-gray-dark">
      <p className="font-semibold text-dark dark:text-white">{data.name}</p>
      <p className="mt-2 text-dark-4 dark:text-dark-6">
        Kehadiran: {formatPercent(data.presentase_kehadiran)}
      </p>
      <p className="text-dark-4 dark:text-dark-6">
        Nilai raport: {formatScore(data.nilai_raport)}
      </p>
    </div>
  );
}

function ReadinessTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number } }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl dark:border-dark-3 dark:bg-gray-dark">
      <p className="font-semibold text-dark dark:text-white">{data.name}</p>
      <p className="mt-2 text-dark-4 dark:text-dark-6">
        Total siswa: {data.value}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-90 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-dark-3 dark:bg-dark-2">
      <div className="max-w-sm space-y-2">
        <p className="text-lg font-semibold text-dark dark:text-white">
          {title}
        </p>
        <p className="text-sm leading-6 text-slate-500 dark:text-dark-6">
          {description}
        </p>
      </div>
    </div>
  );
}

export function AnalyticsDashboard({
  stats,
  students,
}: AnalyticsDashboardProps) {
  const bubbleData = buildBubbleData(students);
  const stressData = buildStressData(students);
  const riskData = buildRiskData(stats, students);
  const attendanceTrendData = buildAttendanceTrendData(students);
  const readinessData = buildReadinessData(students);

  const bubbleInsight = getBubbleInsight(bubbleData);
  const stressInsight = getStressInsight(stressData);
  const riskInsight = getRiskInsight(riskData);
  const attendanceInsight = getAttendanceInsight(attendanceTrendData);
  const readinessInsight = getReadinessInsight(readinessData);

  const totalStudents = students.length || stats.total_siswa || 0;
  const averageExamScore =
    stats.rata_rata_nilai_raport ??
    average(students.map((student) => student.nilai_rata_rata_raport).filter(isNumber));
  const averageStudyHours = average(
    students.map((student) => student.jam_belajar_per_hari).filter(isNumber),
  );
  const lowRiskCount =
    stats.rendah ??
    riskData.find((item) => item.name === "Sangat Beresiko")?.value ??
    0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500 ease-out">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-blue-dark p-8 shadow-1 md:p-10">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 text-white">
          <p className="mb-2 text-xs font-semibold tracking-widest text-white/70 uppercase">
            Analytics
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">EDA Dashboard</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/90 md:text-base">
            Visualisasi eksploratif yang dibangun dari data siswa dan hasil
            analisis backend, bukan lagi mock data.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={cardClassName()}>
          <p className="text-sm text-slate-500 dark:text-dark-6">
            Total sample
          </p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">
            {totalStudents}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-6">
            Seluruh siswa yang tersedia di backend
          </p>
        </div>
        <div className={cardClassName()}>
          <p className="text-sm text-slate-500 dark:text-dark-6">
            Avg nilai raport
          </p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">
            {formatScore(averageExamScore)}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-6">
            Rata-rata nilai dari data nyata
          </p>
        </div>
        <div className={cardClassName()}>
          <p className="text-sm text-slate-500 dark:text-dark-6">
            Avg study hours
          </p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">
            {formatScore(averageStudyHours)}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-6">
            Rata-rata jam belajar per hari
          </p>
        </div>
        <div className={cardClassName()}>
          <p className="text-sm text-slate-500 dark:text-dark-6">High risk</p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">
            {lowRiskCount}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-6">
            Kategori Sangat Beresiko menurut analisis backend
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className={cardClassName()}>
          <div className="mb-4">
            <p className="text-brand-header text-sm font-semibold tracking-[0.2em] uppercase">
              Correlation
            </p>
            <h2 className="mt-1 text-xl font-bold text-dark dark:text-white">
              Korelasi Jam Belajar vs Nilai Ujian
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-dark-6">
              Bubble chart memakai data siswa asli dari backend. Ukuran bubble
              merepresentasikan screen time.
            </p>
          </div>

          {bubbleData.length ? (
            <div className="w-full" style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 10, right: 18, bottom: 12, left: 6 }}
                >
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
                    dataKey="nilai_raport"
                    name="Nilai Raport"
                    domain={[0, 100]}
                    tick={{ fill: COLORS.slate, fontSize: 12 }}
                    axisLine={{ stroke: COLORS.slate }}
                    tickLine={false}
                  />
                  <ZAxis
                    dataKey="screen_time"
                    range={[90, 420]}
                    name="Screen Time"
                    unit=" jam"
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "4 4" }}
                    content={<BubbleTooltip />}
                  />
                  <Scatter
                    data={bubbleData}
                    fill={COLORS.header}
                    stroke={COLORS.header}
                    strokeWidth={1}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="Belum ada data untuk chart ini"
              description="Backend belum mengirim siswa dengan jam belajar, nilai raport, dan screen time yang lengkap."
            />
          )}

          {bubbleInsight && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-dark-2">
              <p className="text-sm text-slate-600 dark:text-dark-6">
                <span className="font-semibold text-brand-header">Insight: </span>
                {bubbleInsight}
              </p>
            </div>
          )}
        </article>

        <article className={cardClassName()}>
          <div className="mb-4">
            <p className="text-brand-accent text-sm font-semibold tracking-[0.2em] uppercase">
              Psychology
            </p>
            <h2 className="mt-1 text-xl font-bold text-dark dark:text-white">
              Rata-rata Nilai Raport per Stress Level
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-dark-6">
              Distribusi ini dihitung langsung dari siswa yang punya stress
              level dan nilai raport.
            </p>
          </div>

          {stressData.length ? (
            <div className="w-full" style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stressData}
                  margin={{ top: 10, right: 16, bottom: 8, left: 8 }}
                >
                  <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="stress_level"
                    tick={{ fill: COLORS.slate, fontSize: 12 }}
                    axisLine={{ stroke: COLORS.slate }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: COLORS.slate, fontSize: 12 }}
                    axisLine={{ stroke: COLORS.slate }}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={<StressTooltip />}
                    cursor={{ fill: "rgba(31, 111, 95, 0.08)" }}
                  />
                  <Bar dataKey="avg_nilai_raport" radius={[10, 10, 0, 0]}>
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
              description="Chart ini akan muncul setelah backend mengirim data stress_level dan nilai_raport yang valid."
            />
          )}

          {stressInsight && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-dark-2">
              <p className="text-sm text-slate-600 dark:text-dark-6">
                <span className="font-semibold text-brand-accent">Insight: </span>
                {stressInsight}
              </p>
            </div>
          )}
        </article>

        <article className={cardClassName()}>
          <div className="mb-4">
            <p className="text-brand-warning text-sm font-semibold tracking-[0.2em] uppercase">
              Distribution
            </p>
            <h2 className="mt-1 text-xl font-bold text-dark dark:text-white">
              Distribusi Risk Status
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-dark-6">
              Donut chart ini memakai distribusi risiko nyata dari hasil
              analisis prediksi backend.
            </p>
          </div>

          <div
            className="flex w-full items-center justify-center"
            style={{ height: 360 }}
          >
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
                          : entry.name === "Aman"
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

          {riskInsight && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-dark-2">
              <p className="text-sm text-slate-600 dark:text-dark-6">
                <span className="font-semibold text-brand-warning">Insight: </span>
                {riskInsight}
              </p>
            </div>
          )}
        </article>

        <article className={cardClassName()}>
          <div className="mb-4">
            <p className="text-brand-header text-sm font-semibold tracking-[0.2em] uppercase">
              Trend
            </p>
            <h2 className="mt-1 text-xl font-bold text-dark dark:text-white">
              Attendance vs Nilai Raport
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-dark-6">
              Composed chart ini memakai siswa dengan kehadiran tertinggi untuk
              memperlihatkan pola nyata di data.
            </p>
          </div>

          {attendanceTrendData.length ? (
            <div className="w-full" style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={attendanceTrendData}
                  margin={{ top: 10, right: 16, bottom: 8, left: 8 }}
                >
                  <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: COLORS.slate, fontSize: 11 }}
                    axisLine={{ stroke: COLORS.slate }}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: COLORS.slate, fontSize: 12 }}
                    axisLine={{ stroke: COLORS.slate }}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: COLORS.slate, fontSize: 12 }}
                    axisLine={{ stroke: COLORS.slate }}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={<AttendanceTooltip />}
                    cursor={{ fill: "rgba(59, 169, 156, 0.08)" }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="presentase_kehadiran"
                    name="Kehadiran"
                    fill={COLORS.accent}
                    radius={[8, 8, 0, 0]}
                    barSize={22}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="nilai_raport"
                    name="Nilai Raport"
                    stroke={COLORS.header}
                    strokeWidth={3}
                    dot={{ r: 4, fill: COLORS.header }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="Belum ada data attendance"
              description="Chart ini akan tampil jika backend mengirim nilai kehadiran dan nilai raport siswa secara lengkap."
            />
          )}

          {attendanceInsight && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-dark-2">
              <p className="text-sm text-slate-600 dark:text-dark-6">
                <span className="font-semibold text-brand-header">Insight: </span>
                {attendanceInsight}
              </p>
            </div>
          )}
        </article>

        <article className={cardClassName()}>
          <div className="mb-4">
            <p className="text-brand-accent2 text-sm font-semibold tracking-[0.2em] uppercase">
              Readiness
            </p>
            <h2 className="mt-1 text-xl font-bold text-dark dark:text-white">
              Kesiapan Industri (Vocational)
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-dark-6">
              Melihat perbandingan jumlah siswa yang siap masuk dunia industri melawan yang belum siap.
            </p>
          </div>

          {readinessData.length ? (
            <div
              className="flex w-full items-center justify-center"
              style={{ height: 360 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ReadinessTooltip />} />
                  <Pie
                    data={readinessData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={0}
                    outerRadius={120}
                    paddingAngle={2}
                    cornerRadius={8}
                  >
                    {readinessData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.name === "Siap"
                            ? COLORS.accent
                            : COLORS.danger
                        }
                      />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="Belum ada data kesiapan industri"
              description="Chart ini akan muncul jika ada data mengenai tingkat industry_readiness siswa."
            />
          )}

          {readinessInsight && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-dark-2">
              <p className="text-sm text-slate-600 dark:text-dark-6">
                <span className="font-semibold text-brand-accent2">Insight: </span>
                {readinessInsight}
              </p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
