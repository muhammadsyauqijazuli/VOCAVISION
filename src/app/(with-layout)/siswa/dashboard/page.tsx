import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FiTrendingUp,
  FiActivity,
  FiRefreshCw,
  FiUser,
  FiClock,
  FiAward,
  FiChevronRight,
  FiZap,
} from "react-icons/fi";

export default async function SiswaDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/siswa/dashboard");
  }

  const menuCards = [
    {
      icon: FiTrendingUp,
      title: "Prediksi Pribadi",
      description: "Lihat hasil prediksi performa belajarmu berdasarkan data terbaru.",
      href: "/siswa/prediksi",
      colorBg: "bg-primary/10 dark:bg-primary/20",
      colorIcon: "text-primary dark:text-indigo-400",
      colorBlur: "bg-primary/10",
      colorLink: "text-primary dark:text-indigo-400",
      label: "Lihat Prediksi",
    },
    {
      icon: FiActivity,
      title: "Insight SHAP",
      description: "Analisis faktor-faktor yang paling mempengaruhi performamu.",
      href: "/siswa/insight",
      colorBg: "bg-blue/10 dark:bg-blue/20",
      colorIcon: "text-blue dark:text-blue-light-2",
      colorBlur: "bg-blue/10",
      colorLink: "text-blue dark:text-blue-light-2",
      label: "Lihat Insight",
    },
    {
      icon: FiRefreshCw,
      title: "Update Data",
      description: "Perbarui data belajarmu untuk mendapatkan prediksi yang akurat.",
      href: "/siswa/update-data",
      colorBg: "bg-green/10 dark:bg-green-dark/20",
      colorIcon: "text-green dark:text-green-light",
      colorBlur: "bg-green/10",
      colorLink: "text-green dark:text-green-light",
      label: "Update Sekarang",
    },
  ];

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
              Murid Dashboard
            </p>
            <h1 className="mb-2 text-3xl font-bold leading-tight md:text-4xl">
              Halo, {session.user.name}! 👋
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-white/85">
              Selamat datang kembali di dashboard pembelajaran kamu. Pantau perkembangan
              dan dapatkan insight personal di sini.
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

      {/* ── Menu Cards ── */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {menuCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.href}
              className="group relative overflow-hidden rounded-2xl border border-stroke bg-white p-6 shadow-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-3 dark:border-dark-3 dark:bg-gray-dark"
            >
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-all duration-300 group-hover:scale-125 ${card.colorBlur}`}
              />
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${card.colorBg} ${card.colorIcon}`}
              >
                <Icon size={22} />
              </div>
              <h2 className="mb-1.5 text-lg font-bold text-dark dark:text-white">
                {card.title}
              </h2>
              <p className="text-sm leading-relaxed text-dark-4 dark:text-dark-6">
                {card.description}
              </p>
              <Link
                href={card.href}
                className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5 ${card.colorLink}`}
              >
                <span>{card.label}</span>
                <FiChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          );
        })}
      </section>

      {/* ── Stats Row ── */}
      <section className="grid gap-5 md:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-yellow-light-4 text-yellow-dark">
            <FiClock size={24} />
          </div>
          <div>
            <h3 className="font-bold text-dark dark:text-white">Aktivitas Terakhir</h3>
            <p className="mt-0.5 text-sm text-dark-4 dark:text-dark-6">
              Belum ada aktivitas tercatat hari ini.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-green-light-7 text-green">
            <FiAward size={24} />
          </div>
          <div>
            <h3 className="font-bold text-dark dark:text-white">Pencapaian</h3>
            <p className="mt-0.5 text-sm text-dark-4 dark:text-dark-6">
              Pertahankan semangat belajarmu!
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick Action Banner ── */}
      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 dark:border-primary/30 dark:bg-primary/10 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <FiZap size={18} />
          </div>
          <div>
            <p className="font-semibold text-dark dark:text-white">
              Belum update data bulan ini?
            </p>
            <p className="text-sm text-dark-4 dark:text-dark-6">
              Data terbaru menghasilkan prediksi yang lebih akurat.
            </p>
          </div>
        </div>
        <Link
          href="/siswa/update-data"
          className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Update Sekarang
        </Link>
      </section>
    </div>
  );
}
