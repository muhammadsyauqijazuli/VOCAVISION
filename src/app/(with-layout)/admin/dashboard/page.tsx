import { auth } from "@/lib/auth";
import { backendUrl } from "@/lib/auth/backend-auth";
import { RiskDistributionChart } from "@/components/admin/risk-distribution-chart";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RiskBadge } from "@/components/guru/RiskBadge";

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
    <div className="space-y-6">
      <section className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
          Admin access
        </p>
        <h1 className="text-heading-4 mb-2 font-bold text-dark dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-dark-4 dark:text-dark-6">
          Login berhasil sebagai <strong>{session.user.name}</strong> dengan role <strong>{session.user.role}</strong>.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-1 dark:bg-gray-dark">
          <p className="text-sm text-dark-4 dark:text-dark-6">Total Siswa</p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">
            {stats.total_siswa ?? 0}
          </h2>
          <p className="mt-2 text-sm text-dark-4 dark:text-dark-6">
            Total data siswa di sistem
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-1 dark:bg-gray-dark">
          <p className="text-sm text-dark-4 dark:text-dark-6">Rata-rata Skor</p>
          <h2 className="mt-2 text-3xl font-bold text-dark dark:text-white">
            {Number(averageScore).toFixed(2)}
          </h2>
          <p className="mt-2 text-sm text-dark-4 dark:text-dark-6">
            Rata-rata skor berdasarkan data yang tersedia
          </p>
          <p className="mt-1 text-xs text-dark-4 dark:text-dark-6">
            {averageBasis}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-1 dark:bg-gray-dark">
          <p className="text-sm text-dark-4 dark:text-dark-6">Distribusi Risiko</p>
          <h2 className="mt-2 text-xl font-bold text-dark dark:text-white">
            {stats.sangat_beresiko ?? 0} / {stats.beresiko ?? 0} / {stats.tidak_beresiko ?? 0}
          </h2>
          <p className="mt-2 text-sm text-dark-4 dark:text-dark-6">
            Sangat Beresiko / Beresiko / Tidak Beresiko
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-dark-4 dark:text-dark-6">Grafik Risiko</p>
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

        <div className="rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-dark-4 dark:text-dark-6">Daftar Prioritas</p>
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

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-sm text-dark-4 dark:text-dark-6">Kelola User</p>
          <h2 className="mt-2 text-xl font-bold text-dark dark:text-white">Admin only</h2>
          <a href="/admin/users" className="mt-4 inline-flex text-sm font-semibold text-primary">
            Open user manager
          </a>
        </div>

        <div className="rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-sm text-dark-4 dark:text-dark-6">Upload Dataset</p>
          <h2 className="mt-2 text-xl font-bold text-dark dark:text-white">Admin only</h2>
          <a href="/admin/dataset" className="mt-4 inline-flex text-sm font-semibold text-primary">
            Open dataset uploader
          </a>
        </div>
      </section>
    </div>
  );
}
