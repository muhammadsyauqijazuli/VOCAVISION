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
  HiClipboardList,
  HiCheckCircle,
  HiDatabase,
  HiDocumentReport,
  HiLightBulb,
  HiMoon,
  HiServer,
  HiShieldCheck,
  HiVariable,
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

  const revealDelay = (delayMs: number) =>
    ({ ["--reveal-delay" as string]: `${delayMs}ms` } as React.CSSProperties);

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

      <section id="login-section" className="relative flex min-h-screen items-center overflow-hidden bg-linear-to-b from-blue-50 via-white to-white px-4 py-20 text-center dark:from-gray-900 dark:via-gray-950 dark:to-gray-950 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-90 dark:opacity-80">
          <div className="animate-gradient-drift absolute inset-0 bg-[linear-gradient(120deg,rgba(59,130,246,0.14),rgba(99,102,241,0.12),rgba(45,212,191,0.12),rgba(59,130,246,0.14))] bg-size-[300%_300%]" />
          <div className="animate-grid-pan absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-size-[72px_72px] opacity-35 mix-blend-soft-light dark:bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] dark:opacity-20" />
          <div className="animate-noise-drift absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] bg-size-[12px_12px] opacity-20 mix-blend-overlay dark:opacity-[0.08]" />
          <div className="animate-aurora-slow absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/12" />
          <div className="animate-aurora-slow absolute -right-16 top-32 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/12" />
          <div className="animate-float-slow absolute -left-20 top-10 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/30" />
          <div className="animate-float-reverse absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl dark:bg-teal-900/20" />
          <div className="animate-float-gentle absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-500/10" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 text-left md:grid-cols-2 md:gap-16">
          <div className="animate-fade-up relative mx-auto w-full max-w-2xl text-center md:mx-0 md:text-left" data-animate-on-scroll style={revealDelay(0)}>
            <div className="mx-auto mb-6 flex items-center justify-center gap-4 md:mx-0 md:justify-start">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-blue-500/25 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105">
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

              <h1 data-animate-on-scroll className="text-4xl font-extrabold tracking-tight text-blue-700 dark:text-blue-300 sm:text-5xl lg:text-6xl" style={revealDelay(80)}>
                Vocavision
              </h1>
            </div>

            <p data-animate-on-scroll className="mt-4 text-xl font-medium text-gray-600 dark:text-gray-300 sm:text-2xl" style={revealDelay(140)}>
              Vocational Student Predictive Analytics
            </p>
            <p data-animate-on-scroll className="mx-auto mt-4 max-w-2xl text-base text-gray-500 dark:text-gray-400 sm:text-lg" style={revealDelay(200)}>
              Platform prediksi performa akademik siswa menggunakan <span className="font-semibold text-primary">Random Forest</span>. Masuk untuk melihat analisis faktor dominan, saran cerdas, dan progres siswa dalam satu dasbor.
            </p>
          </div>

          <div className="w-full max-w-xl md:justify-self-end" data-animate-on-scroll style={revealDelay(260)}>
            <div className="rounded-2xl border border-blue-100/80 bg-white/95 p-5 text-left shadow-2xl shadow-blue-100/60 backdrop-blur transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl md:p-7 dark:border-gray-700 dark:bg-gray-900/90 dark:shadow-none">
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
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-offset-gray-950"
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
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-offset-gray-950"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || demoLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950"
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-semibold text-blue-700 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 hover:bg-blue-100 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:border-gray-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-950"
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
        </div>
      </section>

      <section className="relative overflow-hidden bg-linear-to-b from-slate-50 via-white to-blue-50/40 py-20 transition-colors duration-300 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-8 top-10 h-48 w-48 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/20" />
          <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl dark:bg-cyan-500/10" />
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-500/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-animate-on-scroll style={revealDelay(0)} className="mx-auto mb-6 inline-flex w-full justify-center">
            <span className="rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-700 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/70 dark:text-blue-300">
              Alur & Nilai Utama
            </span>
          </div>

          <h2 data-animate-on-scroll style={revealDelay(40)} className="mb-6 text-center text-3xl font-bold text-gray-800 dark:text-white sm:text-4xl">
            Bagaimana Vocavision Bekerja?
          </h2>

          <p data-animate-on-scroll style={revealDelay(70)} className="mx-auto max-w-3xl text-center text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
            Vocavision membantu siswa dan guru memahami data, melihat prediksi, lalu mengambil tindakan — semuanya dalam satu alur yang sederhana.
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div data-animate-on-scroll style={revealDelay(140)} className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white/85 p-6 text-center shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950/70">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-transform duration-500 group-hover:scale-105">
                <HiClipboardList className="h-7 w-7" />
              </div>
              <h4 className="mt-4 font-semibold text-gray-800 dark:text-white">1. Isi Data</h4>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Jawab 17 pertanyaan singkat tentang kebiasaan belajar & lingkungan.
              </p>
            </div>

            <div data-animate-on-scroll style={revealDelay(200)} className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white/85 p-6 text-center shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950/70">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-transform duration-500 group-hover:scale-105">
                <HiLightBulb className="h-7 w-7" />
              </div>
              <h4 className="mt-4 font-semibold text-gray-800 dark:text-white">2. Lihat Prediksi</h4>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Skor, status risiko, dan faktor dominan ditampilkan dengan jelas.
              </p>
            </div>

            <div data-animate-on-scroll style={revealDelay(260)} className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white/85 p-6 text-center shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950/70">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-transform duration-500 group-hover:scale-105">
                <HiCheckCircle className="h-7 w-7" />
              </div>
              <h4 className="mt-4 font-semibold text-gray-800 dark:text-white">3. Tindak Lanjut</h4>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Ikuti saran praktis dan pantau perubahan secara berkala.
              </p>
            </div>
          </div>

          <div data-animate-on-scroll style={revealDelay(300)} className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: HiShieldCheck, text: "Autentikasi JWT & RBAC (Admin/Guru/Siswa)" },
              { icon: HiDatabase, text: "Penyimpanan MySQL dengan SQLAlchemy" },
              { icon: HiChartBar, text: "Model Random Forest & SHAP Explainability" },
              { icon: HiDocumentReport, text: "Laporan PDF/Excel siap unduh" },
              { icon: HiServer, text: "Backend Flask dengan API RESTful" },
              { icon: HiVariable, text: "17 variabel prediktor tervalidasi" },
            ].map((item, idx) => (
              <div
                key={idx}
                data-animate-on-scroll
                style={revealDelay(340 + idx * 60)}
                className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950/70"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary dark:bg-gray-900">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="pt-0.5 text-sm leading-6 text-gray-700 dark:text-gray-300">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div data-animate-on-scroll style={revealDelay(100)} className="rounded-2xl border border-gray-100 bg-white/80 px-6 py-8 text-center shadow-sm backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/70">
              <span className="block text-4xl font-bold text-primary">17</span>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Variabel prediktor</p>
            </div>
            <div data-animate-on-scroll style={revealDelay(160)} className="rounded-2xl border border-gray-100 bg-white/80 px-6 py-8 text-center shadow-sm backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/70">
              <span className="block text-4xl font-bold text-primary">3</span>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Peran pengguna</p>
            </div>
            <div data-animate-on-scroll style={revealDelay(220)} className="rounded-2xl border border-gray-100 bg-white/80 px-6 py-8 text-center shadow-sm backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/70">
              <span className="block text-4xl font-bold text-primary">&gt;85%</span>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Akurasi model</p>
            </div>
          </div>

          <p className="mt-10 text-center text-sm italic text-gray-500 dark:text-gray-400">
            Mudah, cepat, dan langsung bisa diterapkan oleh guru maupun siswa.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-gray-950 py-6 text-white dark:bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-sm sm:flex-row">
          <span>© {new Date().getFullYear()} Vocavision. All rights reserved.</span>
          <button
            type="button"
            onClick={scrollToLogin}
            className="cursor-pointer text-blue-300 transition hover:text-white hover:underline"
          >
            Masuk
          </button>
        </div>
      </footer>

      <style jsx>{`
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(28px) scale(0.975);
          filter: blur(8px);
          transition:
            opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 1000ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 1000ms cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--reveal-delay, 0ms);
          will-change: opacity, transform;
        }

        .reveal-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }

        .animate-fade-up {
          animation: fadeUp 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .animate-fade-up-delay {
          animation: fadeUp 1000ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
        }

        .animate-float-slow {
          animation: floatY 7s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: floatYReverse 8s ease-in-out infinite;
        }

        .animate-float-gentle {
          animation: floatGentle 10s ease-in-out infinite;
        }

        .animate-gradient-drift {
          animation: gradientDrift 18s ease-in-out infinite;
          will-change: background-position;
        }

        .animate-grid-pan {
          animation: gridPan 32s linear infinite;
          will-change: background-position;
        }

        .animate-noise-drift {
          animation: noiseDrift 14s steps(6) infinite;
          will-change: transform, opacity;
        }

        .animate-aurora-slow {
          animation: auroraPulse 16s ease-in-out infinite;
          will-change: transform, opacity;
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

        @keyframes floatGentle {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -52%) scale(1.06);
          }
        }

        @keyframes gradientDrift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes gridPan {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 72px 72px;
          }
        }

        @keyframes noiseDrift {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          25% {
            transform: translate3d(-0.75%, 0.5%, 0);
          }
          50% {
            transform: translate3d(0.5%, -0.5%, 0);
          }
          75% {
            transform: translate3d(-0.5%, -0.25%, 0);
          }
        }

        @keyframes auroraPulse {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translate3d(0, -16px, 0) scale(1.08);
            opacity: 1;
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