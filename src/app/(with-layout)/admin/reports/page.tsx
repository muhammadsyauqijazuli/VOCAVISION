import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DownloadButton from "@/components/guru/DownloadButton";
import { FiPieChart, FiBarChart2, FiUsers, FiFileText } from "react-icons/fi";

export default async function AdminReportsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/admin/reports");
  }

  if (session.user.role !== "admin") {
    redirect(getRoleHomePath(session.user.role));
  }

  return (
    <div className="mx-auto w-full max-w-270 space-y-6">
      <Breadcrumb pageName="Laporan Global" />

      <section className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <div className="mb-6">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Admin access
          </p>
          <h1 className="mt-1 text-heading-3 font-bold text-dark dark:text-white">
            Laporan Analitik Global
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-dark-4 dark:text-dark-6">
            Unduh laporan analitik komprehensif (EDA Dashboard) yang berisi
            ringkasan prediksi skor ujian, status risiko siswa, dan analisis
            berbagai variabel secara keseluruhan.
          </p>
        </div>

        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FiPieChart, label: "Distribusi Risiko" },
            { icon: FiBarChart2, label: "Skor vs Stres" },
            { icon: FiUsers, label: "Kehadiran Tertinggi" },
            { icon: FiFileText, label: "Tabel Data Lengkap" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center gap-3 rounded-xl border border-stroke bg-gray-1 p-5 text-center dark:border-dark-3 dark:bg-dark-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                  <Icon size={20} />
                </div>
                <span className="text-sm font-semibold text-dark dark:text-white">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <DownloadButton
            studentId=""
            format="pdf"
            label="Unduh Laporan PDF"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-1 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          />
          <DownloadButton
            studentId=""
            format="excel"
            label="Unduh Data Excel"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-stroke bg-white px-6 py-3.5 font-semibold text-dark-4 transition hover:border-dark-3 hover:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6 dark:hover:border-dark-2"
          />
        </div>
      </section>
    </div>
  );
}
