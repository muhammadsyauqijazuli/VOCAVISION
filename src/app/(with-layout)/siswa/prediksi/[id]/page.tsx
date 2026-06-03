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
} from "react-icons/fi";

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
  kehadiran_pelatihan_industry: number | string | null;
  motivasi_akademik: number | string | null;
  exam_score: number | string | null;
  gender: string | null;
  rata_rata_pemasukan_keluarga: string | null;
  pendidikan_terakhir_orang_tua: string | null;
  kerja_sampingan: string | null;
  study_environment: string | null;
  kompetensi_skill_level: string | null;
  industry_readiness: string | null;
  stress_level: string | null;
  latest_prediction: {
    predicted_exam_score: number | string | null;
    risk_status: string | null;
    created_at: string | null;
  } | null;
};

type InsightResponse = {
  student_id: string;
  student_name: string;
  predicted_exam_score: number | string | null;
  risk_status: string | null;
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
  | "kehadiran_pelatihan_industry"
  | "motivasi_akademik"
  | "exam_score";

type StudentCategoricalKey =
  | "gender"
  | "rata_rata_pemasukan_keluarga"
  | "pendidikan_terakhir_orang_tua"
  | "kerja_sampingan"
  | "study_environment"
  | "kompetensi_skill_level"
  | "industry_readiness"
  | "stress_level";

const numericFields: Array<{ key: StudentNumericKey; label: string }> = [
  { key: "jam_belajar_per_hari", label: "Jam belajar per hari" },
  { key: "presentase_kehadiran", label: "Presentase kehadiran" },
  { key: "nilai_rata_rata_raport", label: "Nilai rata-rata raport" },
  { key: "skor_time_management", label: "Skor time management" },
  { key: "jam_tidur", label: "Jam tidur" },
  { key: "screen_time", label: "Screen time" },
  { key: "kehadiran_pelatihan_industry", label: "Kehadiran pelatihan industry" },
  { key: "motivasi_akademik", label: "Motivasi akademik" },
  { key: "exam_score", label: "Exam score" },
] as const;

const categoricalFields: Array<{ key: StudentCategoricalKey; label: string }> = [
  { key: "gender", label: "Gender" },
  { key: "rata_rata_pemasukan_keluarga", label: "Rata-rata pemasukan keluarga" },
  { key: "pendidikan_terakhir_orang_tua", label: "Pendidikan terakhir orang tua" },
  { key: "kerja_sampingan", label: "Kerja sampingan" },
  { key: "study_environment", label: "Study environment" },
  { key: "kompetensi_skill_level", label: "Kompetensi skill level" },
  { key: "industry_readiness", label: "Industry readiness" },
  { key: "stress_level", label: "Stress level" },
] as const;

function formatValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isNaN(parsed) && value !== "") {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(parsed);
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

function buildRecommendations(student: StudentDetailResponse): InterventionRecommendation[] {
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

  if (student.study_environment && student.study_environment.toLowerCase() !== "baik") {
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

  if (student.kompetensi_skill_level && student.kompetensi_skill_level.toLowerCase() !== "tinggi") {
    recommendations.push({
      title: "Tingkatkan skill inti",
      description: `Kompetensi skill level ${name} masih ${student.kompetensi_skill_level}. Berikan latihan tambahan, proyek kecil, atau modul penguatan konsep.`,
    });
  }

  if (student.industry_readiness && student.industry_readiness.toLowerCase() !== "siap") {
    recommendations.push({
      title: "Bangun kesiapan industri",
      description: `Industry readiness ${name} masih ${student.industry_readiness}. Ajak mengikuti pelatihan, simulasi praktik, atau kegiatan berbasis proyek.`,
    });
  }

  const industryTrainingAttendance = toNumber(student.kehadiran_pelatihan_industry);
  if (industryTrainingAttendance !== null && industryTrainingAttendance < 1) {
    recommendations.push({
      title: "Dorong ikut pelatihan industri",
      description: `Kehadiran pelatihan industry ${name} masih ${industryTrainingAttendance.toFixed(0)}. Dorong partisipasi agar mendapat pengalaman praktik dan eksposur yang relevan.`,
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
  return { origin: `${protocol}://${host}`, cookie: headerList.get("cookie") ?? "" };
}

async function fetchJson<T>(url: string, cookie: string) {
  const response = await fetch(url, {
    headers: cookie ? { cookie } : undefined,
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };
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
    throw new Error(studentResult.payload?.message ?? "Gagal mengambil detail siswa");
  }

  if (!insightResult.response.ok) {
    throw new Error(insightResult.payload?.message ?? "Gagal mengambil insight prediksi terbaru");
  }

  const student = studentResult.payload;
  const insight = insightResult.payload;
  const predictedScore = insight.predicted_exam_score ?? student.latest_prediction?.predicted_exam_score;
  const riskStatus = getRiskStatus(predictedScore) ?? insight.risk_status ?? student.latest_prediction?.risk_status;
  const recommendations = buildRecommendations(student);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-blue-dark p-8 shadow-1 md:p-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Student Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white backdrop-blur-md ring-2 ring-white/30">
              {student.nama.charAt(0).toUpperCase()}
            </div>
            <div className="text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Detail Siswa
              </p>
              <h1 className="text-2xl font-bold md:text-3xl">{student.nama}</h1>
              <p className="mt-0.5 text-sm text-white/80">NISN: {student.nisn}</p>
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex w-fit flex-col gap-3 rounded-2xl bg-white/15 px-6 py-4 backdrop-blur-md lg:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Prediksi Skor Ujian
            </p>
            <p className="text-4xl font-bold text-white">{formatScore(predictedScore)}</p>
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
            <h2 className="font-bold text-dark dark:text-white">Data 17 Variabel</h2>
            <p className="text-sm text-dark-4 dark:text-dark-6">
              Informasi numerik dan kategorikal yang digunakan untuk prediksi siswa.
            </p>
          </div>
        </div>

        <div className="grid gap-0 divide-y divide-stroke p-6 dark:divide-dark-3 xl:grid-cols-2 xl:divide-x xl:divide-y-0">
          {/* Numeric */}
          <div className="pb-6 xl:pb-0 xl:pr-6">
            <div className="mb-4 flex items-center gap-2">
              <FiHash size={14} className="text-dark-5 dark:text-dark-6" />
              <h3 className="text-sm font-bold text-dark dark:text-white">Data Numerik</h3>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {numericFields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-xl border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2"
                >
                  <dt className="text-xs font-semibold uppercase tracking-wider text-dark-5 dark:text-dark-6">
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
          <div className="pt-6 xl:pl-6 xl:pt-0">
            <div className="mb-4 flex items-center gap-2">
              <FiList size={14} className="text-dark-5 dark:text-dark-6" />
              <h3 className="text-sm font-bold text-dark dark:text-white">Data Kategorikal</h3>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {categoricalFields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-xl border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2"
                >
                  <dt className="text-xs font-semibold uppercase tracking-wider text-dark-5 dark:text-dark-6">
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
              ? new Date(student.latest_prediction.created_at).toLocaleDateString("id-ID", {
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
                <p className="text-xs font-semibold uppercase tracking-wider text-dark-5 dark:text-dark-6">
                  {item.label}
                </p>
                <p className="mt-0.5 font-bold text-dark dark:text-white">{item.value}</p>
              </div>
            </div>
          );
        })}
      </section>

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
