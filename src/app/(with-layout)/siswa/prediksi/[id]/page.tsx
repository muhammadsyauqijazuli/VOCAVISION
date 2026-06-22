import { InterventionForm } from "@/components/guru/InterventionForm";
import { RiskBadge } from "@/components/guru/RiskBadge";
import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { getRiskStatus } from "@/lib/utils";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  FiUser,
  FiTrendingUp,
  FiHash,
  FiBarChart2,
  FiList,
  FiArrowLeft,
  FiActivity,
} from "react-icons/fi";
import { SHAPChart } from "@/components/Charts/SHAPChart";

type StudentDetailResponse = {
  id: string;
  user_id?: string | null;
  nama: string;
  nisn: string;
  jam_belajar_per_hari: number | string | null;
  presentase_kehadiran: number | string | null;
  nilai_rata_rata_raport: number | string | null;
  skor_time_management: number | string | null;
  jam_tidur: number | string | null;
  screen_time: number | string | null;
  motivasi_akademik: number | string | null;
  ses_index: number | string | null;
  deviasi_tidur: number | string | null;
  gender: string | null;
  kerja_sampingan: string | null;
  study_environment: string | null;
  kompetensi_skill_level: string | null;
  industry_readiness: string | null;
  stress_level: string | null;
  jurusan: string | null;
  latest_prediction: {
    predicted_nilai_raport: number | string | null;
    risk_status: string | null;
    created_at: string | null;
  } | null;
};

type InsightResponse = {
  student_id: string;
  student_name: string;
  predicted_nilai_raport: number | string | null;
  risk_status: string | null;
  shap_analysis?: {
    feature_name: string;
    impact_value: number;
    suggestion_text: string;
  }[];
};

type PageProps = {
  params: Promise<{ id: string }>;
};

type InterventionRecommendation = {
  title: string;
  description: string;
};

type StudentNumericKey =
  | "jam_belajar_per_hari"
  | "presentase_kehadiran"
  | "nilai_rata_rata_raport"
  | "skor_time_management"
  | "jam_tidur"
  | "screen_time"
  | "motivasi_akademik"
  | "ses_index"
  | "deviasi_tidur";

type StudentCategoricalKey =
  | "gender"
  | "kerja_sampingan"
  | "study_environment"
  | "kompetensi_skill_level"
  | "industry_readiness"
  | "stress_level"
  | "jurusan";

const numericFields: Array<{ key: StudentNumericKey; label: string }> = [
  { key: "jam_belajar_per_hari", label: "Jam belajar per hari" },
  { key: "presentase_kehadiran", label: "Presentase kehadiran" },
  { key: "nilai_rata_rata_raport", label: "Nilai rata-rata raport" },
  { key: "skor_time_management", label: "Skor time management" },
  { key: "jam_tidur", label: "Jam tidur" },
  { key: "deviasi_tidur", label: "Deviasi tidur" },
  { key: "screen_time", label: "Screen time" },
  { key: "ses_index", label: "SES Index" },
  { key: "motivasi_akademik", label: "Motivasi akademik" },
] as const;

const categoricalFields: Array<{ key: StudentCategoricalKey; label: string }> =
  [
    { key: "gender", label: "Gender" },
    { key: "kerja_sampingan", label: "Kerja Sampingan" },
    { key: "study_environment", label: "Lingkungan Belajar" },
    { key: "kompetensi_skill_level", label: "Tingkat Kompetensi Skill" },
    { key: "industry_readiness", label: "Kesiapan Industri" },
    { key: "stress_level", label: "Tingkat Stres" },
    { key: "jurusan", label: "Jurusan" },
  ] as const;

function formatValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isNaN(parsed) && value !== "") {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(
      parsed,
    );
  }
  return String(value);
}

function formatScore(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsed)) return String(value);
  return parsed.toFixed(2);
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildRecommendations(
  student: StudentDetailResponse,
): InterventionRecommendation[] {
  const recommendations: InterventionRecommendation[] = [];
  const name = student.nama;

  const studyHours = toNumber(student.jam_belajar_per_hari);
  if (studyHours !== null && studyHours < 3) {
    recommendations.push({
      title: "Tingkatkan jam belajar harian",
      description: `${name} saat ini belajar sekitar ${studyHours.toFixed(1)} jam per hari. Dorong target belajar rutin 3-4 jam per hari dengan jadwal yang konsisten agar pemahaman materi lebih stabil.`,
    });
  }

  const attendance = toNumber(student.presentase_kehadiran);
  if (attendance !== null && attendance < 80) {
    recommendations.push({
      title: "Perbaiki kehadiran kelas",
      description: `Kehadiran ${name} berada di ${attendance.toFixed(0)}%. Pantau absensi mingguan dan berikan pengingat agar tidak tertinggal materi penting.`,
    });
  }

  const timeManagement = toNumber(student.skor_time_management);
  if (timeManagement !== null && timeManagement < 70) {
    recommendations.push({
      title: "Latih manajemen waktu",
      description: `Skor time management ${name} masih ${timeManagement.toFixed(0)}. Buat jadwal belajar yang lebih terstruktur, target harian, dan evaluasi progres mingguan.`,
    });
  }

  const screenTime = toNumber(student.screen_time);
  if (screenTime !== null && screenTime > 4) {
    recommendations.push({
      title: "Batasi screen time",
      description: `Screen time ${name} mencapai ${screenTime.toFixed(1)} jam. Arahkan penggunaan gawai untuk kebutuhan belajar dan batasi distraksi di luar jam belajar.`,
    });
  }

  const sleepHours = toNumber(student.jam_tidur);
  if (sleepHours !== null && sleepHours < 7) {
    recommendations.push({
      title: "Perbaiki pola tidur",
      description: `${name} hanya tidur sekitar ${sleepHours.toFixed(1)} jam. Dorong tidur cukup 7-8 jam per malam agar fokus dan daya serap meningkat.`,
    });
  }

  const motivation = toNumber(student.motivasi_akademik);
  if (motivation !== null && motivation < 70) {
    recommendations.push({
      title: "Bangun motivasi akademik",
      description: `Motivasi akademik ${name} berada di ${motivation.toFixed(0)}. Gunakan target jangka pendek, umpan balik positif, dan pendampingan belajar yang lebih personal.`,
    });
  }

  if (
    student.study_environment &&
    student.study_environment.toLowerCase() !== "baik"
  ) {
    recommendations.push({
      title: "Benahi lingkungan belajar",
      description: `Study environment ${name} masih ${student.study_environment}. Pastikan ruang belajar tenang, pencahayaan cukup, dan minim gangguan saat belajar.`,
    });
  }

  if (student.stress_level && student.stress_level.toLowerCase() !== "rendah") {
    recommendations.push({
      title: "Kelola tingkat stres",
      description: `Tingkat stres ${name} terdeteksi ${student.stress_level}. Lakukan monitoring ringan, konseling, atau dukungan emosional secara berkala.`,
    });
  }

  if (
    student.kompetensi_skill_level &&
    student.kompetensi_skill_level.toLowerCase() !== "tinggi"
  ) {
    recommendations.push({
      title: "Tingkatkan skill inti",
      description: `Kompetensi skill level ${name} masih ${student.kompetensi_skill_level}. Berikan latihan tambahan, proyek kecil, atau modul penguatan konsep.`,
    });
  }

  if (
    student.industry_readiness &&
    student.industry_readiness.toLowerCase() !== "siap"
  ) {
    recommendations.push({
      title: "Bangun kesiapan industri",
      description: `Industry readiness ${name} masih ${student.industry_readiness}. Ajak mengikuti pelatihan, simulasi praktik, atau kegiatan berbasis proyek.`,
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      title: "Pertahankan kebiasaan belajar yang baik",
      description: `Variabel ${name} saat ini relatif mendukung performa akademik. Fokus pada konsistensi belajar, kehadiran, dan evaluasi rutin untuk menjaga hasil tetap stabil.`,
    });
  }

  return recommendations.slice(0, 6);
}

async function getRequestOrigin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  if (!host) throw new Error("Host header tidak ditemukan");
  return {
    origin: `${protocol}://${host}`,
    cookie: headerList.get("cookie") ?? "",
  };
}

async function fetchJson<T>(url: string, cookie: string) {
  const response = await fetch(url, {
    headers: cookie ? { cookie } : undefined,
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };
  return { response, payload };
}

export default async function PrediksiSiswaPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;

  if (!session?.user) {
    redirect(`/auth/sign-in?callbackUrl=/siswa/prediksi/${id}`);
  }

  if (session.user.role !== "siswa" && session.user.role !== "guru") {
    redirect(getRoleHomePath(session.user.role));
  }

  const { origin, cookie } = await getRequestOrigin();

  const [studentResult, insightResult] = await Promise.all([
    fetchJson<StudentDetailResponse>(`${origin}/api/students/${id}`, cookie),
    fetchJson<InsightResponse>(`${origin}/api/predict/insight/${id}`, cookie),
  ]);

  if (studentResult.response.status === 404) notFound();

  if (!studentResult.response.ok) {
    throw new Error(
      studentResult.payload?.message ?? "Gagal mengambil detail siswa",
    );
  }

  const student = studentResult.payload;

  let insight: Partial<InsightResponse> = {};
  if (insightResult.response.ok) {
    insight = insightResult.payload;
  } else if (insightResult.response.status !== 404) {
    console.error(
      "Gagal mengambil insight prediksi terbaru:",
      insightResult.payload?.message,
    );
  }

  const predictedScore =
    insight.predicted_nilai_raport ??
    student.latest_prediction?.predicted_nilai_raport;
  const riskStatus =
    getRiskStatus(predictedScore) ??
    insight.risk_status ??
    student.latest_prediction?.risk_status;
  const recommendations = buildRecommendations(student);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500 ease-out">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-blue-dark p-8 shadow-1 md:p-10">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Student Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white ring-2 ring-white/30 backdrop-blur-md">
              {student.nama.charAt(0).toUpperCase()}
            </div>
            <div className="text-white">
              <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
                Detail Siswa
              </p>
              <h1 className="text-2xl font-bold md:text-3xl">{student.nama}</h1>
              <p className="mt-0.5 text-sm text-white/80">
                NISN: {student.nisn}
              </p>
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex w-fit flex-col gap-3 rounded-2xl bg-white/15 px-6 py-4 backdrop-blur-md lg:text-right">
            <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">
              Prediksi Nilai Raport
            </p>
            <p className="text-4xl font-bold text-white">
              {formatScore(predictedScore)}
            </p>
            <div className="flex items-center gap-2 lg:justify-end">
              <RiskBadge status={riskStatus} score={predictedScore} />
            </div>
            {session.user.role === "guru" && (
              <Link
                href={`/guru/reports/${student.id}`}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                Buka Laporan Siswa
              </Link>
            )}
          </div>
        </div>

        {/* Back link for siswa */}
        {session.user.role === "siswa" && (
          <div className="relative z-10 mt-5">
            <Link
              href="/siswa/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 transition hover:text-white"
            >
              <FiArrowLeft size={13} />
              Kembali ke Dashboard
            </Link>
          </div>
        )}
      </section>

      {/* ── Data 17 Variabel ── */}
      <section className="rounded-2xl border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex items-center gap-3 border-b border-stroke p-6 dark:border-dark-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
            <FiBarChart2 size={18} />
          </div>
          <div>
            <h2 className="font-bold text-dark dark:text-white">
              Data 15 Variabel
            </h2>
            <p className="text-sm text-dark-4 dark:text-dark-6">
              Informasi numerik dan kategorikal yang digunakan untuk prediksi
              siswa.
            </p>
          </div>
        </div>

        <div className="grid gap-0 divide-y divide-stroke p-6 xl:grid-cols-2 xl:divide-x xl:divide-y-0 dark:divide-dark-3">
          {/* Numeric */}
          <div className="pb-6 xl:pr-6 xl:pb-0">
            <div className="mb-4 flex items-center gap-2">
              <FiHash size={14} className="text-dark-5 dark:text-dark-6" />
              <h3 className="text-sm font-bold text-dark dark:text-white">
                Data Numerik
              </h3>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {numericFields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-xl border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2"
                >
                  <dt className="text-xs font-semibold tracking-wider text-dark-5 uppercase dark:text-dark-6">
                    {field.label}
                  </dt>
                  <dd className="mt-1.5 text-base font-bold text-dark dark:text-white">
                    {formatValue(student[field.key])}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Categorical */}
          <div className="pt-6 xl:pt-0 xl:pl-6">
            <div className="mb-4 flex items-center gap-2">
              <FiList size={14} className="text-dark-5 dark:text-dark-6" />
              <h3 className="text-sm font-bold text-dark dark:text-white">
                Data Kategorikal
              </h3>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {categoricalFields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-xl border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2"
                >
                  <dt className="text-xs font-semibold tracking-wider text-dark-5 uppercase dark:text-dark-6">
                    {field.label}
                  </dt>
                  <dd className="mt-1.5 text-base font-bold text-dark dark:text-white">
                    {formatValue(student[field.key])}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Student Meta ── */}
      <section className="grid gap-5 sm:grid-cols-3">
        {[
          { icon: FiUser, label: "Nama Lengkap", value: student.nama },
          { icon: FiHash, label: "NISN", value: student.nisn },
          {
            icon: FiTrendingUp,
            label: "Prediksi Terakhir",
            value: student.latest_prediction?.created_at
              ? new Date(
                  student.latest_prediction.created_at,
                ).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Belum ada",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-dark-5 uppercase dark:text-dark-6">
                  {item.label}
                </p>
                <p className="mt-0.5 font-bold text-dark dark:text-white">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── SHAP Insight Chart ── */}
      {insight.shap_analysis && insight.shap_analysis.length > 0 && (
        <section className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="mb-5 flex items-center gap-3 border-b border-stroke pb-5 dark:border-dark-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue/10 text-blue dark:bg-blue-dark/20">
              <FiActivity size={18} />
            </div>
            <div>
              <h2 className="font-bold text-dark dark:text-white">
                Analisis Faktor (SHAP)
              </h2>
              <p className="text-sm text-dark-4 dark:text-dark-6">
                Faktor yang paling berkontribusi terhadap prediksi skor (Hijau =
                Positif, Merah = Negatif).
              </p>
            </div>
          </div>
          <SHAPChart data={insight.shap_analysis} />
        </section>
      )}

      {/* ── Intervention Form (guru only) ── */}
      {session.user.role === "guru" && (
        <section className="w-full max-w-none">
          <InterventionForm
            studentId={student.id}
            studentName={student.nama}
            recommendations={recommendations}
          />
        </section>
      )}
    </div>
  );
}
