import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiActivity, FiArrowRight, FiRefreshCw, FiZap } from "react-icons/fi";

export default async function SiswaInsightPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/siswa/insight");
  }

  if (session.user.role !== "siswa") {
    redirect(getRoleHomePath(session.user.role));
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-blue-dark p-8 shadow-1 md:p-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">
            VOCAVISION
          </p>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Hasil &amp; Insight Prediksi
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
            Lihat analisis mendalam tentang faktor-faktor yang paling mempengaruhi
            performa akademikmu berdasarkan model prediksi SHAP.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: Lihat Prediksi */}
        <div className="flex flex-col rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
            <FiActivity size={22} />
          </div>
          <h2 className="text-xl font-bold text-dark dark:text-white">
            Insight Personal SHAP
          </h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-dark-4 dark:text-dark-6">
            Lihat skor prediksi ujian, status risiko, dan faktor-faktor utama yang
            mempengaruhi hasil belajarmu. Data diambil langsung dari model machine
            learning menggunakan ID akunmu.
          </p>
          <Link
            href={`/siswa/prediksi/${session.user.id}`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <span>Lihat Insight Saya</span>
            <FiArrowRight size={15} />
          </Link>
        </div>

        {/* Card: Update Data */}
        <div className="flex flex-col rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green/10 text-green dark:bg-green-dark/20">
            <FiRefreshCw size={22} />
          </div>
          <h2 className="text-xl font-bold text-dark dark:text-white">
            Perbarui Data Kamu
          </h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-dark-4 dark:text-dark-6">
            Hasil insight bergantung pada kelengkapan dan keakuratan data yang kamu
            masukkan. Perbarui 17 variabel gaya hidup dan akademik untuk mendapatkan
            prediksi yang lebih akurat.
          </p>
          <Link
            href="/siswa/update-data"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-stroke bg-gray-1 px-5 py-2.5 text-sm font-semibold text-dark transition hover:border-primary/40 hover:bg-white dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:border-primary/40"
          >
            <span>Update Data Sekarang</span>
            <FiArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* ── Info Section ── */}
      <section className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
            <FiZap size={18} />
          </div>
          <div>
            <h2 className="font-bold text-dark dark:text-white">
              Bagaimana Insight SHAP Bekerja?
            </h2>
            <p className="text-sm text-dark-4 dark:text-dark-6">
              Endpoint: GET /api/predict/insight/[student_id]
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Kirim Data",
              desc: "17 variabel akademik dan gaya hidupmu dikirim ke model Flask melalui proxy Next.js.",
            },
            {
              step: "2",
              title: "Analisis SHAP",
              desc: "Model ML menghitung kontribusi setiap fitur terhadap prediksi skor ujian akhirmu.",
            },
            {
              step: "3",
              title: "Lihat Hasil",
              desc: "Prediksi skor, status risiko, dan rekomendasi personal ditampilkan secara responsif.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-stroke bg-gray-1 p-5 dark:border-dark-3 dark:bg-dark-2"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {item.step}
              </div>
              <h3 className="mb-1.5 font-semibold text-dark dark:text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-dark-4 dark:text-dark-6">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
