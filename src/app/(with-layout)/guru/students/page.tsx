
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-blue-dark p-8 shadow-1 md:p-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 text-white">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">
            Guru access
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">
            Data Siswa & Kelas
          </h1>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-white/90 md:text-base">
            Menampilkan skor prediksi terbaru, status risiko, dan tautan ke profil siswa yang menampilkan analisis personal model SHAP.
          </p>
        </div>
      </section>

      <div className="rounded-2xl border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <StudentsTable />
      </div>
    </div>
  );
}
