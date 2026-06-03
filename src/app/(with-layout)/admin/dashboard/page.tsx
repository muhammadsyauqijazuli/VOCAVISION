import { auth } from "@/lib/auth";
import { backendUrl } from "@/lib/auth/backend-auth";
import { RiskDistributionChart } from "@/components/admin/risk-distribution-chart";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RiskBadge } from "@/components/guru/RiskBadge";
import {
  FiUsers,
  FiBarChart2,
  FiAlertTriangle,
  FiUser,
  FiDatabase,
  FiSettings,
} from "react-icons/fi";

type DashboardStats = {
  total_siswa?: number;
  rata_rata_prediksi?: number;
  rata_rata_exam_score?: number;
  jumlah_siswa_berprediksi?: number;
  jumlah_siswa_exam_score?: number;
  sangat_beresiko?: number;
  beresiko?: number;
  tidak_beresiko?: number;
  top_risky_students?: {
    student_id: string;
    nama: string;
    nisn: string;
    role: string;
    predicted_exam_score: number | null;
    risk_status: string;
  }[];
};

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/admin/dashboard");
  }

  const token = session.session?.token;
  let stats: DashboardStats = {};

  if (token) {
    const response = await fetch(backendUrl("/dashboard/stats"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.ok) {
      stats = (await response.json()) as DashboardStats;
    }
  }

  const averageScore =
    stats.jumlah_siswa_berprediksi && stats.rata_rata_prediksi !== undefined
      ? stats.rata_rata_prediksi
      : stats.rata_rata_exam_score ?? 0;
  const averageBasis = stats.jumlah_siswa_berprediksi
    ? `Prediksi terbaru ${stats.jumlah_siswa_berprediksi} siswa`
    : `Nilai exam_score ${stats.jumlah_siswa_exam_score ?? 0} siswa`;

  const topStudents = stats.top_risky_students ?? [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-blue-dark p-8 shadow-1 md:p-10">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-white">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">
              Admin Dashboard
            </p>
            <h1 className="mb-2 text-3xl font-bold leading-tight md:text-4xl">
              Halo, {session.user.name}! 👋
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-white/85">
              Selamat datang di pusat kendali admin. Pantau keseluruhan data, distribusi risiko,
              dan kelola sistem dari sini.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl bg-white/15 px-5 py-3 backdrop-blur-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 text-white">
              <FiUser size={20} />
            </div>
            <div>
              <p className="text-xs text-white/75">Role Akses</p>
              <p className="font-semibold capitalize text-white">{session.user.role}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section className="grid gap-5 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl border border-stroke bg-white p-6 shadow-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-3 dark:border-dark-3 dark:bg-gray-dark">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 scale-100 rounded-full bg-primary/10 blur-2xl transition-all duration-300 group-hover:scale-125" />
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
            <FiUsers size={22} />
          </div>
          <p className="text-sm text-dark-4 dark:text-dark-6">Total Siswa</p>
          <h2 className="mt-1 text-3xl font-bold text-dark dark:text-white">
            {stats.total_siswa ?? 0}
          </h2>
          <p className="mt-2 text-sm text-dark-4 dark:text-dark-6">
            Total data siswa di sistem
          </p>
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl border border-stroke bg-white p-6 shadow-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-3 dark:border-dark-3 dark:bg-gray-dark">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 scale-100 rounded-full bg-blue/10 blur-2xl transition-all duration-300 group-hover:scale-125" />
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue/10 text-blue dark:bg-blue/20">
            <FiBarChart2 size={22} />
          </div>
          <p className="text-sm text-dark-4 dark:text-dark-6">Rata-rata Skor</p>
          <h2 className="mt-1 text-3xl font-bold text-dark dark:text-white">
            {Number(averageScore).toFixed(2)}
          </h2>
          <p className="mt-2 text-xs text-dark-4 dark:text-dark-6">
            {averageBasis}
          </p>
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl border border-stroke bg-white p-6 shadow-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-3 dark:border-dark-3 dark:bg-gray-dark">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 scale-100 rounded-full bg-red/10 blur-2xl transition-all duration-300 group-hover:scale-125" />
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red/10 text-red dark:bg-red/20">
            <FiAlertTriangle size={22} />
          </div>
          <p className="text-sm text-dark-4 dark:text-dark-6">Distribusi Risiko</p>
          <h2 className="mt-1 text-xl font-bold text-dark dark:text-white">
            {stats.sangat_beresiko ?? 0} / {stats.beresiko ?? 0} / {stats.tidak_beresiko ?? 0}
          </h2>
          <p className="mt-2 text-sm text-dark-4 dark:text-dark-6">
            Sangat Beresiko / Beresiko / Tidak Beresiko
          </p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Grafik Risiko</p>
              <h2 className="text-xl font-bold text-dark dark:text-white">Distribusi Risiko Akademik</h2>
            </div>
          </div>

          <RiskDistributionChart
            data={{
              sangat_beresiko: stats.sangat_beresiko ?? 0,
              beresiko: stats.beresiko ?? 0,
              tidak_beresiko: stats.tidak_beresiko ?? 0,
            }}
          />
        </div>

        <div className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Daftar Prioritas</p>
              <h2 className="text-xl font-bold text-dark dark:text-white">Siswa Berisiko Tertinggi</h2>
            </div>
          </div>

          {topStudents.length ? (
            <div className="overflow-hidden rounded-xl border border-stroke dark:border-dark-3">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stroke dark:divide-dark-3">
                  <thead className="bg-gray-2 dark:bg-dark-2">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-dark dark:text-white">Nama</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-dark dark:text-white">NISN</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-dark dark:text-white">Skor</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-dark dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stroke dark:divide-dark-3">
                    {topStudents.map((student) => (
                      <tr key={student.student_id} className="hover:bg-gray-1 dark:hover:bg-dark-2/60">
                        <td className="px-4 py-4 font-medium text-dark dark:text-white">{student.nama}</td>
                        <td className="px-4 py-4 text-dark-4 dark:text-dark-6">{student.nisn}</td>
                        <td className="px-4 py-4 text-dark-4 dark:text-dark-6">
                          {student.predicted_exam_score ?? "-"}
                        </td>
                        <td className="px-4 py-4">
                            <RiskBadge status={student.risk_status} score={student.predicted_exam_score} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stroke bg-gray-1 p-6 text-sm text-dark-4 dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6">
              Belum ada data prediksi untuk menampilkan siswa berisiko tertinggi.
            </div>
          )}
        </div>
      </section>

      {/* ── Admin Controls ── */}
      <section className="grid gap-5 md:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border border-stroke bg-white p-6 shadow-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-3 dark:border-dark-3 dark:bg-gray-dark">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple/10 text-purple dark:bg-purple/20">
            <FiSettings size={22} />
          </div>
          <h2 className="text-xl font-bold text-dark dark:text-white">Kelola User</h2>
          <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">Manajemen akun admin, guru, dan siswa.</p>
          <a href="/admin/users" className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline">
            Buka User Manager &rarr;
          </a>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-stroke bg-white p-6 shadow-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-3 dark:border-dark-3 dark:bg-gray-dark">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green/10 text-green dark:bg-green-dark/20">
            <FiDatabase size={22} />
          </div>
          <h2 className="text-xl font-bold text-dark dark:text-white">Upload Dataset</h2>
          <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">Perbarui dataset ML untuk prediksi terbaru.</p>
          <a href="/admin/dataset" className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline">
            Buka Dataset Uploader &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
