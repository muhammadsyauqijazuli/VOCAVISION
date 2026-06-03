import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { InterventionForm } from "@/components/guru/InterventionForm";
import { RiskBadge } from "@/components/guru/RiskBadge";
import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { getRiskStatus } from "@/lib/utils";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FiActivity } from "react-icons/fi";
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
  {
    key: "kehadiran_pelatihan_industry",
    label: "Kehadiran pelatihan industry",
  },
  { key: "motivasi_akademik", label: "Motivasi akademik" },
  { key: "exam_score", label: "Exam score" },
] as const;

const categoricalFields: Array<{ key: StudentCategoricalKey; label: string }> =
  [
    { key: "gender", label: "Gender" },
    {
      key: "rata_rata_pemasukan_keluarga",
      label: "Rata-rata pemasukan keluarga",
    },
    {
      key: "pendidikan_terakhir_orang_tua",
      label: "Pendidikan terakhir orang tua",
    },
    { key: "kerja_sampingan", label: "Kerja sampingan" },
    { key: "study_environment", label: "Study environment" },
    { key: "kompetensi_skill_level", label: "Kompetensi skill level" },
    { key: "industry_readiness", label: "Industry readiness" },
    { key: "stress_level", label: "Stress level" },
  ] as const;

function formatValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const parsedValue = typeof value === "number" ? value : Number(value);
  if (!Number.isNaN(parsedValue) && value !== "") {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 2,
    }).format(parsedValue);
  }

  return String(value);
}

function formatScore(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const parsedValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsedValue)) {
    return String(value);
  }

  return parsedValue.toFixed(2);
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = typeof value === "number" ? value : Number(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function buildRecommendations(
  student: StudentDetailResponse,
): InterventionRecommendation[] {
  const recommendations: InterventionRecommendation[] = [];
  const studentName = student.nama;

  const studyHours = toNumber(student.jam_belajar_per_hari);
  if (studyHours !== null && studyHours < 3) {
    recommendations.push({
      title: "Tingkatkan jam belajar harian",
      description: `${studentName} saat ini belajar sekitar ${studyHours.toFixed(1)} jam per hari. Dorong target belajar rutin 3-4 jam per hari dengan jadwal yang konsisten agar pemahaman materi lebih stabil.`,
    });
  }

  const attendance = toNumber(student.presentase_kehadiran);
  if (attendance !== null && attendance < 80) {
    recommendations.push({
      title: "Perbaiki kehadiran kelas",
      description: `Kehadiran ${studentName} berada di ${attendance.toFixed(0)}%. Pantau absensi mingguan dan berikan pengingat agar tidak tertinggal materi penting.`,
    });
  }

  const timeManagement = toNumber(student.skor_time_management);
  if (timeManagement !== null && timeManagement < 70) {
    recommendations.push({
      title: "Latih manajemen waktu",
      description: `Skor time management ${studentName} masih ${timeManagement.toFixed(0)}. Buat jadwal belajar yang lebih terstruktur, target harian, dan evaluasi progres mingguan.`,
    });
  }

  const screenTime = toNumber(student.screen_time);
  if (screenTime !== null && screenTime > 4) {
    recommendations.push({
      title: "Batasi screen time",
      description: `Screen time ${studentName} mencapai ${screenTime.toFixed(1)} jam. Arahkan penggunaan gawai untuk kebutuhan belajar dan batasi distraksi di luar jam belajar.`,
    });
  }

  const sleepHours = toNumber(student.jam_tidur);
  if (sleepHours !== null && sleepHours < 7) {
    recommendations.push({
      title: "Perbaiki pola tidur",
      description: `${studentName} hanya tidur sekitar ${sleepHours.toFixed(1)} jam. Dorong tidur cukup 7-8 jam per malam agar fokus dan daya serap meningkat.`,
    });
  }

  const motivation = toNumber(student.motivasi_akademik);
  if (motivation !== null && motivation < 70) {
    recommendations.push({
      title: "Bangun motivasi akademik",
      description: `Motivasi akademik ${studentName} berada di ${motivation.toFixed(0)}. Gunakan target jangka pendek, umpan balik positif, dan pendampingan belajar yang lebih personal.`,
    });
  }

  if (
    student.study_environment &&
    student.study_environment.toLowerCase() !== "baik"
  ) {
    recommendations.push({
      title: "Benahi lingkungan belajar",
      description: `Study environment ${studentName} masih ${student.study_environment}. Pastikan ruang belajar tenang, pencahayaan cukup, dan minim gangguan saat belajar.`,
    });
  }

  if (student.stress_level && student.stress_level.toLowerCase() !== "rendah") {
    recommendations.push({
      title: "Kelola tingkat stres",
      description: `Tingkat stres ${studentName} terdeteksi ${student.stress_level}. Lakukan monitoring ringan, konseling, atau dukungan emosional secara berkala.`,
    });
  }

  if (
    student.kompetensi_skill_level &&
    student.kompetensi_skill_level.toLowerCase() !== "tinggi"
  ) {
    recommendations.push({
      title: "Tingkatkan skill inti",
      description: `Kompetensi skill level ${studentName} masih ${student.kompetensi_skill_level}. Berikan latihan tambahan, proyek kecil, atau modul penguatan konsep.`,
    });
  }

  if (
    student.industry_readiness &&
    student.industry_readiness.toLowerCase() !== "siap"
  ) {
    recommendations.push({
      title: "Bangun kesiapan industri",
      description: `Industry readiness ${studentName} masih ${student.industry_readiness}. Ajak mengikuti pelatihan, simulasi praktik, atau kegiatan berbasis proyek.`,
    });
  }

  const industryTrainingAttendance = toNumber(
    student.kehadiran_pelatihan_industry,
  );
  if (industryTrainingAttendance !== null && industryTrainingAttendance < 1) {
    recommendations.push({
      title: "Dorong ikut pelatihan industri",
      description: `Kehadiran pelatihan industry ${studentName} masih ${industryTrainingAttendance.toFixed(0)}. Dorong partisipasi agar mendapat pengalaman praktik dan eksposur yang relevan.`,
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      title: "Pertahankan kebiasaan belajar yang baik",
      description: `Variabel ${studentName} saat ini relatif mendukung performa akademik. Fokus pada konsistensi belajar, kehadiran, dan evaluasi rutin untuk menjaga hasil tetap stabil.`,
    });
  }

  return recommendations.slice(0, 6);
}

async function getRequestOrigin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("Host header tidak ditemukan");
  }

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

export default async function GuruStudentDetailPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/guru/students");
  }

  if (session.user.role !== "guru") {
    redirect(getRoleHomePath(session.user.role));
  }

  const { id } = await params;
  const { origin, cookie } = await getRequestOrigin();

  const [studentResult, insightResult] = await Promise.all([
    fetchJson<StudentDetailResponse>(`${origin}/api/students/${id}`, cookie),
    fetchJson<InsightResponse>(`${origin}/api/predict/insight/${id}`, cookie),
  ]);

  if (studentResult.response.status === 404) {
    notFound();
  }

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
    insight.predicted_exam_score ??
    student.latest_prediction?.predicted_exam_score;
  const riskStatus =
    getRiskStatus(predictedScore) ??
    insight.risk_status ??
    student.latest_prediction?.risk_status;
  const recommendations = buildRecommendations(student);

  return (
    <div className="space-y-6">
      <Breadcrumb pageName="Detail Siswa" />

      <section className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Guru access
            </p>
            <h1 className="mb-2 text-heading-3 font-bold text-dark dark:text-white">
              {student.nama}
            </h1>
            <p className="text-sm text-dark-4 dark:text-dark-6">
              NISN: {student.nisn}
            </p>
          </div>

          <div className="rounded-2xl border border-stroke bg-gray-1 px-5 py-4 text-left lg:text-right dark:border-dark-3 dark:bg-dark-2">
            <p className="text-sm text-dark-4 dark:text-dark-6">
              Prediksi skor ujian
            </p>
            <p className="mt-1 text-3xl font-bold text-dark dark:text-white">
              {formatScore(predictedScore)}
            </p>
            <div className="mt-3">
              <RiskBadge status={riskStatus} score={predictedScore} />
            </div>
            <div className="mt-4 flex justify-start lg:justify-end">
              <Link
                href={`/guru/reports/${student.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Buka Laporan Siswa
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-dark dark:text-white">
            Data 17 Variabel
          </h2>
          <p className="text-sm text-dark-4 dark:text-dark-6">
            Informasi numerik dan kategorikal yang digunakan untuk prediksi
            siswa.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-stroke p-5 dark:border-dark-3">
            <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
              Data Numerik
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              {numericFields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-xl bg-gray-1 p-4 dark:bg-dark-2"
                >
                  <dt className="text-sm text-dark-4 dark:text-dark-6">
                    {field.label}
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-dark dark:text-white">
                    {formatValue(student[field.key])}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-stroke p-5 dark:border-dark-3">
            <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
              Data Kategorikal
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              {categoricalFields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-xl bg-gray-1 p-4 dark:bg-dark-2"
                >
                  <dt className="text-sm text-dark-4 dark:text-dark-6">
                    {field.label}
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-dark dark:text-white">
                    {formatValue(student[field.key])}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
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
                Faktor yang paling berkontribusi terhadap prediksi skor siswa
                ini.
              </p>
            </div>
          </div>
          <SHAPChart data={insight.shap_analysis} />
        </section>
      )}

      <section className="w-full max-w-none">
        <InterventionForm
          studentId={student.id}
          studentName={student.nama}
          recommendations={recommendations}
        />
      </section>
    </div>
  );
}
