import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { StudentsTable } from "./_components/students-table";

export default async function GuruStudentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/guru/students");
  }

  if (session.user.role !== "guru") {
    redirect(getRoleHomePath(session.user.role));
  }

  return (
    <div className="mx-auto w-full max-w-270 space-y-6">
      <Breadcrumb pageName="Data Siswa & Kelas" />

      <section className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Guru access</p>
        <h1 className="text-heading-4 mb-2 font-bold text-dark dark:text-white">Data Siswa & Kelas</h1>

        <p className="max-w-3xl text-sm text-dark-4 dark:text-dark-6">
          Tabel ini mengikuti tema template light/dark, menampilkan skor prediksi terbaru, status risiko,
          dan tombol untuk membuka detail siswa yang terhubung ke fitur SHAP serta intervensi.
        </p>
      </section>

      <div className="rounded-2xl border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <StudentsTable />
      </div>
    </div>
  );
}
