import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
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

  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  if (riskStatus) {
    params.set("risk_status", riskStatus);
  }

  let students: StudentPrediction[] = [];
  let errorMessage = "";

  if (token) {
    const response = await fetch(backendUrl(`/students${params.toString() ? `?${params.toString()}` : ""}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.ok) {
      students = (await response.json()) as StudentPrediction[];
    } else {
      const responseText = await response.text().catch(() => "");
      errorMessage = `Gagal memuat daftar prediksi siswa dari backend (${response.status}). ${responseText}`;
    }
  }

  const totalStudents = students.length;
  const predictedStudents = students.filter((student) => student.predicted_score !== null).length;
  const riskyStudents = students.filter((student) => student.risk_status === "Sangat Beresiko" || student.risk_status === "Beresiko").length;

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

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-1 dark:bg-gray-dark">
          <p className="text-sm text-dark-4 dark:text-dark-6">Total Siswa Tampil</p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">{totalStudents}</h2>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-1 dark:bg-gray-dark">
          <p className="text-sm text-dark-4 dark:text-dark-6">Sudah Diprediksi</p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">{predictedStudents}</h2>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-1 dark:bg-gray-dark">
          <p className="text-sm text-dark-4 dark:text-dark-6">Siswa Perlu Perhatian</p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">{riskyStudents}</h2>
        </div>
      </section>

      <section className="rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <form className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end" action="/admin/predictions" method="get">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-dark dark:text-white">Cari siswa</span>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Nama atau NISN"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-dark dark:text-white">Filter risiko</span>
            <select
              name="risk_status"
              defaultValue={riskStatus}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
            >
              <option value="">Semua</option>
              <option value="Sangat Beresiko">Sangat Beresiko</option>
              <option value="Beresiko">Beresiko</option>
              <option value="Tidak Beresiko">Tidak Beresiko</option>
            </select>
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Terapkan
            </button>
            <a
              href="/admin/predictions"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-stroke px-5 text-sm font-semibold text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            >
              Reset
            </a>
          </div>
        </form>
      </section>

      {errorMessage ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </section>
      ) : null}

      <section className="rounded-2xl border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-5 py-4 dark:border-dark-3">
          <h2 className="text-lg font-bold text-dark dark:text-white">Daftar Prediksi Siswa</h2>
          <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
            Data ini diambil dari prediksi terbaru yang dihasilkan model di folder ml_model.
          </p>
        </div>

        {students.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stroke dark:divide-dark-3">
              <thead className="bg-gray-2 dark:bg-dark-2">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-dark dark:text-white">Nama</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-dark dark:text-white">NISN</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-dark dark:text-white">Skor Prediksi</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-dark dark:text-white">Status Risiko</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-dark-3">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-1 dark:hover:bg-dark-2/60">
                    <td className="px-5 py-4 font-medium text-dark dark:text-white">{student.nama}</td>
                    <td className="px-5 py-4 text-dark-4 dark:text-dark-6">{student.nisn}</td>
                    <td className="px-5 py-4 text-dark-4 dark:text-dark-6">{formatScore(student.predicted_score)}</td>
                    <td className="px-5 py-4">
                      <span className={getRiskBadgeClass(student.risk_status)}>{student.risk_status ?? "Belum ada prediksi"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-8 text-sm text-dark-4 dark:text-dark-6">
            Tidak ada data prediksi yang cocok dengan filter saat ini.
          </div>
        )}
      </section>
    </div>
  );
}