import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SiswaDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/siswa/dashboard");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
          Siswa access
        </p>
        <h1 className="text-heading-4 mb-2 font-bold text-dark dark:text-white">
          Murid Dashboard
        </h1>
        <p className="text-dark-4 dark:text-dark-6">
          Login berhasil sebagai <strong>{session.user.name}</strong> dengan role <strong>{session.user.role}</strong>.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-1 dark:bg-gray-dark">
          <p className="text-sm text-dark-4 dark:text-dark-6">Prediksi Pribadi</p>
          <h2 className="mt-2 text-xl font-bold text-dark dark:text-white">Siswa only</h2>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-1 dark:bg-gray-dark">
          <p className="text-sm text-dark-4 dark:text-dark-6">Insight SHAP</p>
          <h2 className="mt-2 text-xl font-bold text-dark dark:text-white">Siswa only</h2>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-1 dark:bg-gray-dark">
          <p className="text-sm text-dark-4 dark:text-dark-6">Update Data</p>
          <h2 className="mt-2 text-xl font-bold text-dark dark:text-white">Siswa only</h2>
        </div>
      </section>
    </div>
  );
}
