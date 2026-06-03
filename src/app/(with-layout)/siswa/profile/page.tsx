import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FiUser,
  FiMail,
  FiShield,
  FiEdit3,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";

export default async function SiswaProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/siswa/profile");
  }

  if (session.user.role !== "siswa") {
    redirect(getRoleHomePath(session.user.role));
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "S";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-blue-dark p-8 shadow-1 md:p-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold text-white backdrop-blur-md ring-2 ring-white/30">
            {initials}
          </div>

          <div className="text-white">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/70">
              Profil Pribadi
            </p>
            <h1 className="text-2xl font-bold md:text-3xl">{user.name}</h1>
            <p className="mt-1 text-sm text-white/80">{user.email}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold capitalize text-white backdrop-blur-sm">
              <FiShield size={11} />
              {user.role}
            </span>
          </div>
        </div>
      </section>

      {/* ── Profile Info ── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Detail Card */}
        <section className="rounded-2xl border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between border-b border-stroke p-6 dark:border-dark-3">
            <h2 className="font-bold text-dark dark:text-white">Informasi Akun</h2>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-1 text-dark-4 dark:bg-dark-2 dark:text-dark-6">
              <FiUser size={15} />
            </div>
          </div>

          <div className="divide-y divide-stroke p-6 dark:divide-dark-3">
            {[
              {
                icon: FiUser,
                label: "Nama Lengkap",
                value: user.name ?? "-",
              },
              {
                icon: FiMail,
                label: "Email",
                value: user.email ?? "-",
              },
              {
                icon: FiShield,
                label: "Role Akses",
                value: user.role ?? "-",
                capitalize: true,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-dark-5 dark:text-dark-6">
                      {item.label}
                    </p>
                    <p
                      className={`mt-0.5 truncate text-sm font-semibold text-dark dark:text-white ${item.capitalize ? "capitalize" : ""}`}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="flex flex-col gap-4">
          <div className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
            <h2 className="mb-4 font-bold text-dark dark:text-white">Aksi Cepat</h2>
            <div className="space-y-3">
              {[
                {
                  icon: FiTrendingUp,
                  label: "Lihat Prediksi Saya",
                  desc: "Cek skor dan status risiko terbaru.",
                  href: `/siswa/prediksi/${user.id}`,
                  colorBg: "bg-primary/10 text-primary dark:bg-primary/20",
                },
                {
                  icon: FiActivity,
                  label: "Insight SHAP",
                  desc: "Analisis faktor yang mempengaruhi performa.",
                  href: "/siswa/insight",
                  colorBg: "bg-blue/10 text-blue dark:bg-blue/20",
                },
                {
                  icon: FiEdit3,
                  label: "Update Data",
                  desc: "Perbarui data belajar untuk prediksi akurat.",
                  href: "/siswa/update-data",
                  colorBg: "bg-green/10 text-green dark:bg-green-dark/20",
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-xl border border-stroke bg-gray-1 p-4 transition-all hover:border-primary/30 hover:bg-white dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary/30 dark:hover:bg-dark-2"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.colorBg}`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-dark dark:text-white">
                        {action.label}
                      </p>
                      <p className="text-xs text-dark-4 dark:text-dark-6">{action.desc}</p>
                    </div>
                    <FiTrendingUp
                      size={14}
                      className="shrink-0 text-dark-5 transition-transform group-hover:translate-x-0.5 dark:text-dark-6"
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Session Info */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 dark:border-primary/30 dark:bg-primary/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Sesi Aktif
            </p>
            <p className="mt-2 text-sm text-dark-4 dark:text-dark-6">
              Kamu sedang login sebagai{" "}
              <span className="font-semibold text-dark dark:text-white capitalize">
                {user.role}
              </span>
              . Semua data yang kamu lihat bersifat personal dan hanya bisa diakses
              oleh kamu.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
