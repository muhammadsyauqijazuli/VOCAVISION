import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
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
  if (riskStatus === "Sangat Beresiko") {
    return "inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white";
  }

  if (riskStatus === "Beresiko") {
    return "inline-flex rounded-full bg-brand-warning px-3 py-1 text-xs font-semibold text-white";
  }

  if (riskStatus === "Tidak Beresiko") {
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
  if (student.predicted_score === null || Number.isNaN(student.predicted_score)) {
    return student.risk_status ?? "Belum ada prediksi";
  }

  if (student.predicted_score <= 70) {
    return "Beresiko";
  }

  return "Tidak Beresiko";
}

export default async function AdminPredictionsPage({ searchParams }: AdminPredictionsPageProps) {
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
    <div className="space-y-6">
      <Breadcrumb pageName="Student Predictions" />

      <section className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Admin access</p>
        <h1 className="text-heading-4 mb-2 font-bold text-dark dark:text-white">Prediksi Per Siswa</h1>
        <p className="text-dark-4 dark:text-dark-6">
          Lihat skor prediksi terbaru, status risiko, dan data per siswa yang dihitung dari model Random Forest di backend.
        </p>
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