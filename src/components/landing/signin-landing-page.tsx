"use client";

import { signIn } from "@/lib/auth/auth-client";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import {
  HiArrowRight,
  HiChartBar,
  HiClipboardCheck,
  HiLightBulb,
  HiMoon,
  HiSun,
  HiUserGroup,
} from "react-icons/hi";
import { toast } from "sonner";

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "siswa@test.com";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_USER_PASS || "siswa";

type LoginFormState = {
  email: string;
  password: string;
};

export default function SigninLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const animatedNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-animate-on-scroll]"),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    for (const node of animatedNodes) {
      node.classList.add("reveal-on-scroll");
      observer.observe(node);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const isDark = useMemo(() => {
    if (!mounted) {
      return false;
    }

    return (resolvedTheme || theme) === "dark";
  }, [mounted, resolvedTheme, theme]);

  const callbackURL = searchParams.get("callbackUrl") || "/";

  const completeSignIn = async (
    email: string,
    password: string,
    isDemo = false,
  ) => {
    const result = await signIn.email({
      email,
      password,
      rememberMe: false,
    });

    if (!result.data) {
      throw new Error(result.error?.message || "Failed to sign in");
    }

    router.push(callbackURL === "/" ? getRoleHomePath(result.data.role) : callbackURL);
    router.refresh();
    toast.success(isDemo ? "Signed in as demo account" : "Sign in successful");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await completeSignIn(form.email, form.password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError("");
    setDemoLoading(true);

    try {
      await completeSignIn(DEMO_EMAIL, DEMO_PASSWORD, true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Demo sign in failed";
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setDemoLoading(false);
    }
  };

  const scrollToLogin = () => {
    const loginSection = document.getElementById("login-section");
    const emailInput = document.getElementById("email") as HTMLInputElement | null;

    loginSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      emailInput?.focus();
    }, 350);
  };

  return (
    <div className="min-h-screen scroll-smooth bg-white text-gray-800 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-100 dark:hover:bg-gray-900 sm:right-6 sm:top-6"
        aria-label="Toggle dark mode"
      >
        {isDark ? <HiSun className="h-5 w-5 text-yellow-400" /> : <HiMoon className="h-5 w-5 text-indigo-500" />}
        <span>{isDark ? "Light" : "Dark"} Mode</span>
      </button>

      <section id="login-section" className="relative overflow-hidden bg-linear-to-b from-blue-50 via-white to-white px-4 py-20 text-center dark:from-gray-900 dark:via-gray-950 dark:to-gray-950 sm:px-6 lg:px-8">
        <div className="animate-float-slow absolute -left-20 top-10 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/30" />
        <div className="animate-float-reverse absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl dark:bg-teal-900/20" />

        <div className="animate-fade-up relative mx-auto max-w-4xl">
          <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-blue-500/25 transition-transform duration-300 hover:scale-105">
            <svg
              className="h-11 w-11 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-label="Random Forest logo"
            >
              <circle cx="6" cy="5" r="2" fill="currentColor" stroke="none" />
              <circle cx="12" cy="5" r="2" fill="currentColor" stroke="none" />
              <circle cx="18" cy="5" r="2" fill="currentColor" stroke="none" />

              <circle cx="9" cy="11" r="2" fill="currentColor" stroke="none" />
              <circle cx="15" cy="11" r="2" fill="currentColor" stroke="none" />

              <circle cx="12" cy="18" r="2.5" fill="currentColor" stroke="none" />

              <path
                d="M6 7L9 9M12 7L9 9M12 7L15 9M18 7L15 9M9 13L12 15.5M15 13L12 15.5"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-blue-700 dark:text-blue-300 sm:text-5xl lg:text-6xl">
            Vocavision
          </h1>
          <p className="mt-4 text-xl font-medium text-gray-600 dark:text-gray-300 sm:text-2xl">
            Vocational Student Predictive Analytics
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-500 dark:text-gray-400 sm:text-lg">
            Platform prediksi performa akademik siswa menggunakan <span className="font-semibold text-primary">Random Forest</span>. Masuk untuk melihat analisis faktor dominan, saran cerdas, dan progres siswa dalam satu dasbor.
          </p>

          <div className="animate-fade-up-delay mx-auto mt-10 w-full max-w-xl rounded-2xl border border-blue-100/80 bg-white/95 p-5 text-left shadow-2xl shadow-blue-100/60 backdrop-blur md:p-7 dark:border-gray-700 dark:bg-gray-900/90 dark:shadow-none">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  placeholder="Masukkan email"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-primary/40 transition focus:border-primary focus:ring-4 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-primary/40 transition focus:border-primary focus:ring-4 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || demoLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Sign In
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <HiArrowRight className="h-5 w-5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={loading || demoLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700"
              >
                Sign in as Demo/Guest
                {demoLoading && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent dark:border-blue-300" />
                )}
              </button>

              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Demo account: {DEMO_EMAIL}
              </p>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 transition-colors duration-300 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 data-animate-on-scroll className="mb-12 text-center text-3xl font-bold text-gray-800 dark:text-white">
            Fitur Utama
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Prediksi Skor Ujian",
                description:
                  "Model menganalisis 17 variabel untuk memperkirakan skor ujian dengan akurasi tinggi.",
                Icon: HiChartBar,
              },
              {
                title: "Analisis SHAP",
                description:
                  "Temukan faktor paling dominan yang memengaruhi performa belajar setiap siswa.",
                Icon: HiLightBulb,
              },
              {
                title: "Intervensi & Tindak Lanjut",
                description:
                  "Guru menyusun aksi nyata berdasarkan rekomendasi sistem dan memantau hasilnya.",
                Icon: HiClipboardCheck,
              },
              {
                title: "Multi-Peran",
                description:
                  "Admin, Guru, dan Siswa mendapatkan pengalaman dashboard sesuai kebutuhan masing-masing.",
                Icon: HiUserGroup,
              },
            ].map(({ title, description, Icon }, index) => (
              <article
                key={title}
                data-animate-on-scroll
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                style={{
                  ["--reveal-delay" as string]: `${index * 90}ms`,
                }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 transition-colors duration-300 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 data-animate-on-scroll className="mb-12 text-center text-3xl font-bold text-gray-800 dark:text-white">
            Bagaimana Cara Kerjanya?
          </h2>

          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {[
              {
                step: "1",
                title: "Lengkapi Data",
                description:
                  "Siswa mengisi 17 variabel gaya hidup dan akademik melalui formulir interaktif.",
              },
              {
                step: "2",
                title: "Dapatkan Prediksi & Insight",
                description:
                  "Sistem memproses data, menampilkan skor prediksi, status risiko, dan faktor dominan.",
              },
              {
                step: "3",
                title: "Ambil Tindakan",
                description:
                  "Guru memberi intervensi terarah, siswa memperbaiki kebiasaan secara bertahap.",
              },
            ].map(({ step, title, description }, index) => (
              <article
                key={step}
                data-animate-on-scroll
                className="relative flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                style={{
                  ["--reveal-delay" as string]: `${index * 120}ms`,
                }}
              >
                <div className="absolute -left-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {step}
                </div>
                <h3 className="mb-2 mt-3 text-lg font-semibold text-gray-800 dark:text-white">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 transition-colors duration-300 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 data-animate-on-scroll className="mb-8 text-3xl font-bold text-gray-800 dark:text-white">
            Mengapa Vocavision?
          </h2>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <span className="text-4xl font-bold text-primary">17</span>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Variabel prediktor</p>
            </div>
            <div>
              <span className="text-4xl font-bold text-primary">3</span>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Peran pengguna</p>
            </div>
            <div>
              <span className="text-4xl font-bold text-primary">&gt;85%</span>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Akurasi model</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto bg-gray-900 py-6 text-white dark:bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-sm sm:flex-row">
          <span>© {new Date().getFullYear()} Vocavision. All rights reserved.</span>
          <button
            type="button"
            onClick={scrollToLogin}
            className="cursor-pointer text-blue-300 transition hover:underline"
          >
            Masuk
          </button>
        </div>
      </footer>

      <style jsx>{`
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(24px) scale(0.985);
          transition:
            opacity 650ms ease,
            transform 750ms cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--reveal-delay, 0ms);
          will-change: opacity, transform;
        }

        .reveal-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .animate-fade-up {
          animation: fadeUp 650ms ease-out both;
        }

        .animate-fade-up-delay {
          animation: fadeUp 750ms ease-out 120ms both;
        }

        .animate-float-slow {
          animation: floatY 7s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: floatYReverse 8s ease-in-out infinite;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatY {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes floatYReverse {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(12px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal-on-scroll,
          .reveal-on-scroll.is-visible {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .animate-fade-up,
          .animate-fade-up-delay,
          .animate-float-slow,
          .animate-float-reverse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}