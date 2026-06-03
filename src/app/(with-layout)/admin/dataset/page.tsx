import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DatasetUploadForm } from "./_components/dataset-upload-form";

export default async function AdminDatasetPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/admin/dataset");
  }

  if (session.user.role !== "admin") {
    redirect(getRoleHomePath(session.user.role));
  }

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
          <h1 className="text-3xl font-bold md:text-4xl">Dataset Upload</h1>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-white/90 md:text-base">
            Upload file CSV atau Excel berisi data siswa untuk memproses akun
            dan memprediksi performa siswa.
          </p>
        </div>
      </section>

      <DatasetUploadForm />
    </div>
  );
}
