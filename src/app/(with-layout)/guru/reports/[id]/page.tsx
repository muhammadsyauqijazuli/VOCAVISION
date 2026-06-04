import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { RiskBadge } from "@/components/guru/RiskBadge";
import DownloadButton from "@/components/guru/DownloadButton";
import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { getRiskStatus } from "@/lib/utils";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type StudentReportResponse = {
  id: string;
  nama: string;
  nisn: string;
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
  shap_analysis: Array<{
    feature_name: string;
    impact_value: number | string | null;
    suggestion_text: string | null;
  }>;
};

type InterventionRecord = {
  id: string;
  guru: string;
  note: string;
  date: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function CardField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-1 p-4 dark:bg-dark-2">
      <p className="text-xs font-semibold tracking-[0.18em] text-dark-4 uppercase dark:text-dark-6">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-dark dark:text-white">
        {value}
      </p>
    </div>
  );
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

function downloadHref(format: "pdf" | "excel", studentId: string) {
  return `/api/export/${format}?student_id=${encodeURIComponent(studentId)}`;
}

function formatScore(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isNaN(numericValue) ? String(value) : numericValue.toFixed(2);
}

export default async function GuruStudentReportPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/guru/students");
  }

  if (session.user.role !== "guru") {
    redirect(getRoleHomePath(session.user.role));
  }

  const { id } = await params;
  const { origin, cookie } = await getRequestOrigin();

  const [studentResult, insightResult, interventionResult] = await Promise.all([
    fetchJson<StudentReportResponse>(`${origin}/api/students/${id}`, cookie),
    fetchJson<InsightResponse>(`${origin}/api/predict/insight/${id}`, cookie),
    fetchJson<InterventionRecord[]>(
      `${origin}/api/interventions/${id}`,
      cookie,
    ),
  ]);

  if (studentResult.response.status === 404) {
    notFound();
  }

  if (!studentResult.response.ok) {
    throw new Error(
      studentResult.payload?.message ?? "Gagal mengambil data siswa",
    );
  }

  if (!interventionResult.response.ok) {
    throw new Error(
      interventionResult.payload?.message ??
        "Gagal mengambil riwayat intervensi",
    );
  }

  const student = studentResult.payload;

  let insight: Partial<InsightResponse> = {};
  if (insightResult.response.ok) {
    insight = insightResult.payload;
  } else if (insightResult.response.status !== 404) {
    console.error(
      "Gagal mengambil insight prediksi:",
      insightResult.payload?.message,
    );
  }

  const interventions = interventionResult.payload ?? [];
  const predictedScore =
    insight.predicted_exam_score ??
    student.latest_prediction?.predicted_exam_score ??
    null;
  const riskStatus =
    getRiskStatus(predictedScore) ??
    insight.risk_status ??
    student.latest_prediction?.risk_status ??
    null;
  const topShapItems = (insight.shap_analysis ?? []).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-270 space-y-6">
      <Breadcrumb pageName="Laporan Siswa" />

      <section className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          Guru access
        </p>
        <h1 className="mb-2 text-heading-4 font-bold text-dark dark:text-white">
          Report Akademik Per Siswa
        </h1>
        <p className="max-w-3xl text-sm text-dark-4 dark:text-dark-6">
          Laporan ini merangkum profil satu siswa, prediksi terbaru, faktor yang
          paling memengaruhi hasil, dan tindak lanjut guru yang sudah dicatat.
        </p>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-wide text-primary uppercase">
                  Profil siswa
                </p>
                <h2 className="text-2xl font-bold text-dark dark:text-white">
                  {student.nama}
                </h2>
                <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
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
                <div className="mt-3 flex justify-start lg:justify-end">
                  <RiskBadge status={riskStatus} score={predictedScore} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <DownloadButton
                studentId={student.id}
                format="pdf"
                label="Unduh PDF Per Siswa"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
              />
              <DownloadButton
                studentId={student.id}
                format="excel"
                label="Unduh Excel Per Siswa"
                className="inline-flex items-center justify-center rounded-xl border border-stroke px-4 py-3 text-sm font-semibold text-dark transition hover:bg-gray-1 disabled:opacity-60 dark:border-dark-3 dark:text-dark-3 dark:hover:bg-dark-2"
              />
            </div>

            <p className="mt-4 text-sm leading-6 text-dark-4 dark:text-dark-6">
              File export menyajikan profil siswa, prediksi terbaru, faktor SHAP
              teratas, dan riwayat intervensi dalam format yang siap dibagikan.
            </p>
          </div>

          <div className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-wide text-primary uppercase">
                  Faktor prediksi
                </p>
                <h3 className="mt-1 text-xl font-bold text-dark dark:text-white">
                  Tiga faktor utama pada siswa ini
                </h3>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {topShapItems.length} faktor
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {topShapItems.length ? (
                topShapItems.map((item) => (
                  <article
                    key={item.feature_name}
                    className="rounded-xl border border-stroke p-4 dark:border-dark-3"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="text-sm font-semibold text-dark dark:text-white">
                        {item.feature_name}
                      </h4>
                      <p className="text-sm font-semibold text-primary">
                        {typeof item.impact_value === "number"
                          ? item.impact_value.toFixed(4)
                          : (item.impact_value ?? "-")}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-dark-4 dark:text-dark-6">
                      {item.suggestion_text ?? "Tidak ada saran spesifik."}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-dark-4 dark:text-dark-6">
                  Belum ada data SHAP untuk siswa ini.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <aside className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <h3 className="text-lg font-bold text-dark dark:text-white">
              Ringkasan Singkat
            </h3>
            <div className="mt-4 grid gap-3">
              <CardField label="ID Siswa" value={student.id} />
              <CardField
                label="Prediksi Terbaru"
                value={formatScore(predictedScore)}
              />
              <CardField label="Status Risiko" value={riskStatus ?? "-"} />
            </div>

            <div className="mt-6 grid gap-3">
              <Link
                href={`/guru/students/${student.id}`}
                className="inline-flex items-center justify-center rounded-xl bg-dark px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-white dark:text-dark"
              >
                Buka Detail Siswa
              </Link>
              <Link
                href="/guru/students"
                className="inline-flex items-center justify-center rounded-xl border border-stroke px-4 py-3 text-sm font-semibold text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
              >
                Kembali ke Daftar Siswa
              </Link>
            </div>
          </aside>

          <div className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-wide text-primary uppercase">
                  Catatan tindak lanjut
                </p>
                <h3 className="mt-1 text-xl font-bold text-dark dark:text-white">
                  Riwayat intervensi guru untuk siswa ini
                </h3>
              </div>
              <span className="rounded-full bg-dark/5 px-3 py-1 text-xs font-semibold text-dark dark:bg-white/10 dark:text-white">
                {interventions.length} catatan
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {interventions.length ? (
                interventions.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-stroke p-4 dark:border-dark-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-dark dark:text-white">
                          {item.guru}
                        </p>
                        <p className="text-xs text-dark-4 dark:text-dark-6">
                          {new Date(item.date).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-dark-4 dark:text-dark-6">
                      {item.note}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-dark-4 dark:text-dark-6">
                  Belum ada intervensi yang tersimpan untuk siswa ini.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
