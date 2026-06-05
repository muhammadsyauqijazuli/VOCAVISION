import StudentsTableClient from "./StudentsTableClient";
import { auth } from "@/lib/auth";
import { backendUrl, getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type StudentPrediction = {
  id: string;
  nama: string;
  nisn: string;
  predicted_score: number | null;
  risk_status: string | null;
};

type AdminPredictionsPageProps = {
  searchParams?: Promise<{
    search?: string;
    risk_status?: string;
  }>;
};

function getRiskBadgeClass(riskStatus: string | null) {
  if (riskStatus === "Rendah") {
    return "inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white";
  }

  if (riskStatus === "Netral") {
    return "inline-flex rounded-full bg-brand-warning px-3 py-1 text-xs font-semibold text-white";
  }

  if (riskStatus === "Tinggi") {
    return "inline-flex rounded-full bg-brand-accent-2 px-3 py-1 text-xs font-semibold text-brand-header";
  }

  return "inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-dark-4 dark:bg-dark-3 dark:text-dark-6";
}

function formatScore(score: number | null) {
  if (score === null || Number.isNaN(score)) {
    return "-";
  }

  return Number(score).toFixed(2);
}

function getDisplayRiskStatus(student: StudentPrediction) {
  if (
    student.predicted_score === null ||
    Number.isNaN(student.predicted_score)
  ) {
    return student.risk_status ?? "Belum ada prediksi";
  }

  if (student.predicted_score <= 70) {
    return "Rendah";
  }

  if (student.predicted_score <= 85) {
    return "Netral";
  }

  return "Tinggi";
}

export default async function AdminPredictionsPage({
  searchParams,
}: AdminPredictionsPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/admin/predictions");
  }

  if (session.user.role !== "admin") {
    redirect(getRoleHomePath(session.user.role));
  }

  const token = session.session?.token;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const search = resolvedSearchParams?.search?.trim() ?? "";
  const riskStatus = resolvedSearchParams?.risk_status?.trim() ?? "";
  const resolvedSearch = search;
  const resolvedRiskStatus = riskStatus;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500 ease-out">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-blue-dark p-8 shadow-1 md:p-10">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 text-white">
          <p className="mb-2 text-xs font-semibold tracking-widest text-white/70 uppercase">
            Admin access
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">Prediksi Per Siswa</h1>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-white/90 md:text-base">
            Lihat skor prediksi terbaru, status risiko, dan data per siswa yang
            dihitung dari model Random Forest di backend.
          </p>
        </div>
      </section>

      {/* Summary cards removed: counts are provided live by the table component which fetches paged data */}

      {/* Showing all predictions paginated 30 per page; search/filter removed as requested */}

      {/* Errors from server-side fetch were removed; table component shows errors client-side if any */}

      <section className="rounded-2xl border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <StudentsTableClient initialSearch={search} />
      </section>
    </div>
  );
}
