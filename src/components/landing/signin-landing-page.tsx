"use client";

import { signIn } from "@/lib/auth/auth-client";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import fotoDrone from "@/assets/image_school/foto-drone.png";
import fotoDrone2 from "@/assets/image_school/foto-drone-2.png";
import fotoLab from "@/assets/image_school/foto-lab-smk.png";
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
  HiMenu,
  HiX,
} from "react-icons/hi";
import { toast } from "sonner";
import { Logo } from "@/components/logo";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
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
    ({ ["--reveal-delay" as string]: `${delayMs}ms` }) as React.CSSProperties;

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

    router.push(
      callbackURL === "/" ? getRoleHomePath(result.data.role) : callbackURL,
    );
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
      const message =
        err instanceof Error ? err.message : "Demo sign in failed";
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setDemoLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMobileMenuOpen(false);

    if (id === "login-section") {
      const emailInput = document.getElementById("email") as HTMLInputElement | null;
      window.setTimeout(() => {
        emailInput?.focus();
      }, 350);
    }
  };

  return (
    <div className="min-h-screen scroll-smooth bg-white text-gray-800 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200/50 bg-white/40 backdrop-blur-xl transition-colors duration-300 dark:border-gray-800/50 dark:bg-gray-950/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <div className="flex flex-1 cursor-pointer items-center gap-2" onClick={() => scrollToSection("login-section")}>
            <Logo />
          </div>

          {/* Center: Links (Desktop) */}
          <div className="hidden items-center justify-center gap-8 md:flex">
            <button onClick={() => scrollToSection("about-web")} className="text-sm font-medium text-gray-600 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-blue-400">About Web</button>
            <button onClick={() => scrollToSection("about-school")} className="text-sm font-medium text-gray-600 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-blue-400">About School</button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-sm font-medium text-gray-600 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-blue-400">Cara Web Bekerja</button>
          </div>

          {/* Right: Theme Switch + Sign In (Desktop) */}
          <div className="hidden flex-1 items-center justify-end gap-6 md:flex">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-950 ${isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              aria-label="Toggle dark mode"
            >
              <span className="sr-only">Toggle dark mode</span>
              <span
                className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${isDark ? "translate-x-5" : "translate-x-0"
                  }`}
              >
                {isDark ? (
                  <HiMoon className="h-3 w-3 text-indigo-500" />
                ) : (
                  <HiSun className="h-3 w-3 text-yellow-500" />
                )}
              </span>
            </button>
            <button
              onClick={() => scrollToSection("login-section")}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-blue-600 hover:shadow-lg dark:hover:bg-blue-500"
            >
              Sign In
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex flex-1 items-center justify-end gap-4 md:hidden">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-950 ${isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              aria-label="Toggle dark mode"
            >
              <span className="sr-only">Toggle dark mode</span>
              <span
                className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${isDark ? "translate-x-5" : "translate-x-0"
                  }`}
              >
                {isDark ? (
                  <HiMoon className="h-3 w-3 text-indigo-500" />
                ) : (
                  <HiSun className="h-3 w-3 text-yellow-500" />
                )}
              </span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden dark:border-gray-800 dark:bg-gray-950">
            <div className="flex flex-col space-y-4">
              <button onClick={() => scrollToSection("about-web")} className="text-left text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300">About Web</button>
              <button onClick={() => scrollToSection("about-school")} className="text-left text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300">About School</button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-left text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300">Cara Web Bekerja</button>
              <button
                onClick={() => scrollToSection("login-section")}
                className="w-full rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </nav>

      <section
        id="login-section"
        className="relative flex min-h-screen items-center overflow-hidden bg-linear-to-b from-blue-50 via-white to-white py-20 text-center dark:from-gray-900 dark:via-gray-950 dark:to-gray-950"
      >
        <div className="pointer-events-none absolute inset-0 opacity-90 dark:opacity-80">
          <div className="animate-gradient-drift absolute inset-0 bg-[linear-gradient(120deg,rgba(59,130,246,0.14),rgba(99,102,241,0.12),rgba(45,212,191,0.12),rgba(59,130,246,0.14))] bg-size-[300%_300%]" />
          <div className="animate-grid-pan absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-size-[72px_72px] opacity-35 mix-blend-soft-light dark:bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] dark:opacity-20" />
          <div className="animate-noise-drift absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] bg-size-[12px_12px] opacity-20 mix-blend-overlay dark:opacity-[0.08]" />
          <div className="animate-aurora-slow absolute top-12 -left-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/12" />
          <div className="animate-aurora-slow absolute top-32 -right-16 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/12" />
          <div className="animate-float-slow absolute top-10 -left-20 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/30" />
          <div className="animate-float-reverse absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl dark:bg-teal-900/20" />
          <div className="animate-float-gentle absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-500/10" />
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:px-8 text-left md:grid-cols-2 md:gap-16">
          <div
            className="animate-fade-up relative mx-auto w-full max-w-2xl text-center md:mx-0 md:text-left"
            data-animate-on-scroll
            style={revealDelay(0)}
          >
            <div className="mx-auto mb-6 flex items-center justify-center gap-4 md:mx-0 md:justify-start">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-blue-500/25 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105">
                <svg
                  className="h-11 w-11 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-label="Random Forest logo"
                >
                  <circle
                    cx="6"
                    cy="5"
                    r="2"
                    fill="currentColor"
                    stroke="none"
                  />
                  <circle
                    cx="12"
                    cy="5"
                    r="2"
                    fill="currentColor"
                    stroke="none"
                  />
                  <circle
                    cx="18"
                    cy="5"
                    r="2"
                    fill="currentColor"
                    stroke="none"
                  />

                  <circle
                    cx="9"
                    cy="11"
                    r="2"
                    fill="currentColor"
                    stroke="none"
                  />
                  <circle
                    cx="15"
                    cy="11"
                    r="2"
                    fill="currentColor"
                    stroke="none"
                  />

                  <circle
                    cx="12"
                    cy="18"
                    r="2.5"
                    fill="currentColor"
                    stroke="none"
                  />

                  <path
                    d="M6 7L9 9M12 7L9 9M12 7L15 9M18 7L15 9M9 13L12 15.5M15 13L12 15.5"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1
                data-animate-on-scroll
                className="text-4xl font-extrabold tracking-tight text-blue-700 sm:text-5xl lg:text-6xl dark:text-blue-300"
                style={revealDelay(80)}
              >
                Vocavision
              </h1>
            </div>

            <p
              data-animate-on-scroll
              className="mt-4 text-xl font-medium text-gray-600 sm:text-2xl dark:text-gray-300"
              style={revealDelay(140)}
            >
              Vocational Student Predictive Analytics
            </p>
            <p
              data-animate-on-scroll
              className="mx-auto mt-4 max-w-2xl text-base text-gray-500 sm:text-lg dark:text-gray-400"
              style={revealDelay(200)}
            >
              Platform prediksi performa akademik siswa menggunakan{" "}
              <span className="font-semibold text-primary">Random Forest</span>.
              Masuk untuk melihat analisis faktor dominan, saran cerdas, dan
              progres siswa dalam satu dasbor.
            </p>
          </div>

          <div
            className="w-full max-w-xl md:justify-self-end"
            data-animate-on-scroll
            style={revealDelay(260)}
          >
            <div className="rounded-2xl border border-blue-100/80 bg-white/95 p-5 text-left shadow-2xl shadow-blue-100/60 backdrop-blur transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl md:p-7 dark:border-gray-700 dark:bg-gray-900/90 dark:shadow-none">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
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
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-offset-gray-950"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
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
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-offset-gray-950"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || demoLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-gray-950"
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-semibold text-blue-700 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 hover:bg-blue-100 hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-950"
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

      {/* About Web Section */}
      <section id="about-web" className="relative overflow-hidden bg-white py-24 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div 
            data-animate-on-scroll 
            style={revealDelay(0)}
            className="mx-auto mb-16 max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50 px-4 py-2 text-xs font-bold tracking-[0.2em] text-blue-600 uppercase shadow-sm dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-400">
              Tentang Sistem
            </div>
            <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
              Mengapa Memilih <span className="text-primary">Vocavision</span>?
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              Vocavision adalah sistem analitik prediktif yang dirancang khusus untuk pendidikan vokasi. Kami membantu sekolah mengidentifikasi potensi siswa lebih awal menggunakan kecerdasan buatan.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div data-animate-on-scroll style={revealDelay(40)} className="group relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/50">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                <HiDatabase className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Integrasi Data</h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Menyatukan data akademik, kehadiran, dan kedisiplinan siswa dalam satu pangkalan data terpusat yang aman dan mudah diakses.
              </p>
            </div>

            {/* Feature 2 */}
            <div data-animate-on-scroll style={revealDelay(60)} className="group relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/50">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-900/30 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white">
                <HiLightBulb className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Algoritma Cerdas</h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Memanfaatkan model Machine Learning (Random Forest) untuk memprediksi tingkat kelulusan dan performa masa depan siswa.
              </p>
            </div>

            {/* Feature 3 */}
            <div data-animate-on-scroll style={revealDelay(80)} className="group relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/50">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white dark:bg-orange-900/30 dark:text-orange-400 dark:group-hover:bg-orange-600 dark:group-hover:text-white">
                <HiShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Peringatan Dini</h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Mendeteksi secara otomatis siswa yang berisiko mengalami penurunan performa sehingga guru dapat memberikan intervensi lebih awal.
              </p>
            </div>

            {/* Feature 4 */}
            <div data-animate-on-scroll style={revealDelay(100)} className="group relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/50">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-900/30 dark:text-emerald-400 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
                <HiChartBar className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Dasbor Analitik</h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Menyajikan visualisasi data yang interaktif dan mudah dipahami untuk membantu pengambilan keputusan berbasis bukti (data-driven).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About School Section */}
      <section id="about-school" className="relative overflow-hidden bg-slate-50 py-24 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div
            data-animate-on-scroll
            style={revealDelay(0)}
            className="mb-16 max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold tracking-[0.2em] text-primary uppercase shadow-sm">
              Profil Sekolah
            </div>
            <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-5xl dark:text-white">
              SMK Negeri 1 <span className="text-primary">Tanah Jambo Aye</span>
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-gray-400">
              A state-run vocational high school located in North Aceh Regency, Aceh. Established in 2007, the school focuses on equipping students with technical and engineering skills designed directly for the modern workforce.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8 xl:gap-12">
            {/* Left Column: Text Content */}
            <div className="flex flex-col gap-6 lg:col-span-7">
              <div className="grid gap-6 sm:grid-cols-2">
                <div data-animate-on-scroll style={revealDelay(40)} className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950/50">
                  <div>
                    <h3 className="mb-4 text-xs font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">School Profile</h3>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> <span className="font-semibold text-gray-800 dark:text-gray-200">NPSN:</span> 10108210</li>
                      <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> <span className="font-semibold text-gray-800 dark:text-gray-200">Status:</span> State (Negeri)</li>
                      <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> <span className="font-semibold text-gray-800 dark:text-gray-200">Accreditation:</span> B</li>
                      <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> <span className="font-semibold text-gray-800 dark:text-gray-200">Principal:</span> Fardian, M.Kom</li>
                    </ul>
                  </div>
                </div>

                <div data-animate-on-scroll style={revealDelay(60)} className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950/50">
                  <div>
                    <h3 className="mb-4 text-xs font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">Programs (Jurusan)</h3>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> TKJ</li>
                      <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> DKV (Multimedia)</li>
                      <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> TAV (Audio Video)</li>
                      <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> TPTUP (Air Cond.)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div data-animate-on-scroll style={revealDelay(80)} className="rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50/50 to-white p-6 shadow-sm dark:border-gray-800 dark:from-blue-900/10 dark:to-gray-950/50 sm:p-8">
                <h3 className="mb-6 text-xs font-bold tracking-wider text-primary uppercase">Key Initiatives</h3>
                <div className="space-y-5 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-bold text-blue-700 dark:text-blue-400">SMK Pusat Keunggulan:</span> <span className="opacity-90">National Center of Excellence status matching training with industry.</span>
                  </div>
                  <div className="h-px w-full bg-gray-200/50 dark:bg-gray-800/50" />
                  <div>
                    <span className="font-bold text-blue-700 dark:text-blue-400">Teaching Factory (TEFA):</span> <span className="opacity-90">Real-world client orders and services as part of education.</span>
                  </div>
                  <div className="h-px w-full bg-gray-200/50 dark:bg-gray-800/50" />
                  <div>
                    <span className="font-bold text-blue-700 dark:text-blue-400">Japan Internship:</span> <span className="opacity-90">Language and cultural training pipeline for graduates.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Images */}
            <div data-animate-on-scroll style={revealDelay(100)} className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
              <div className="flex flex-col gap-4">
                <div
                  className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl shadow-md ring-2 ring-transparent transition-all hover:ring-primary/50"
                  onClick={() => setSelectedImage(fotoDrone)}
                >
                  <Image
                    src={fotoDrone}
                    alt="School Drone View"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                    placeholder="blur"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                    <span className="rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 sm:scale-75">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div
                  className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl shadow-md ring-2 ring-transparent transition-all hover:ring-primary/50"
                  onClick={() => setSelectedImage(fotoLab)}
                >
                  <Image
                    src={fotoLab}
                    alt="School Lab"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                    placeholder="blur"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                    <span className="rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 sm:scale-75">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-full">
                <div
                  className="group relative h-full min-h-[300px] w-full cursor-pointer overflow-hidden rounded-2xl shadow-md ring-2 ring-transparent transition-all hover:ring-primary/50"
                  onClick={() => setSelectedImage(fotoDrone2)}
                >
                  <Image
                    src={fotoDrone2}
                    alt="School Activities"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                    loading="lazy"
                    placeholder="blur"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                    <span className="rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 sm:scale-75">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location / Maps Section - Floating Layout */}
          <div
            data-animate-on-scroll
            style={revealDelay(150)}
            className="group relative mt-20 h-[450px] w-full overflow-hidden rounded-3xl border border-gray-200/50 bg-gray-100 shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.193026365452!2d97.45268687508003!3d5.109436494866657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3047f35cbfffffff%3A0xc58a0cb0f61d3f75!2sSMK%20Negeri%201%20Tanah%20Jambo%20Aye!5e0!3m2!1sid!2sid!4v1717520000000!5m2!1sid!2sid"
              className="absolute inset-0 h-full w-full border-0" 
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Peta Lokasi SMK Negeri 1 Tanah Jambo Aye"
            ></iframe>

            {/* Overlay Gradient for readability on small screens */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent sm:hidden"></div>

            {/* Floating Info Card */}
            <div className="pointer-events-none absolute inset-0 flex items-end p-4 sm:items-start sm:p-8">
              <div className="pointer-events-auto w-full max-w-sm translate-y-0 rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 sm:w-auto dark:bg-gray-950/95 dark:ring-1 dark:ring-white/10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lokasi Kami</h3>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aceh Utara</p>
                  </div>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  4F54+F99, Samakurok, Kec. Tanah Jambo Aye, Kabupaten Aceh Utara, Aceh 24394
                </p>
                <a
                  href="https://www.google.com/maps/place/SMK+Negeri+1+Tanah+Jambo+Aye/@5.1097262,97.4551617,17z/data=!4m16!1m9!3m8!1s0x3047f35cbfffffff:0xc58a0cb0f61d3f75!2sSMK+Negeri+1+Tanah+Jambo+Aye!8m2!3d5.1095667!4d97.4552751!9m1!1b1!16s%2Fg%2F1pzy7hky7!3m5!1s0x3047f35cbfffffff:0xc58a0cb0f61d3f75!8m2!3d5.1095667!4d97.4552751!16s%2Fg%2F1pzy7hky7?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
                >
                  Lihat di Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative overflow-hidden bg-linear-to-b from-slate-50 via-white to-blue-50/40 py-20 transition-colors duration-300 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-10 left-8 h-48 w-48 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/20" />
          <div className="absolute top-1/3 right-0 h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl dark:bg-cyan-500/10" />
          <div className="absolute top-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-500/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            data-animate-on-scroll
            style={revealDelay(0)}
            className="mx-auto mb-6 inline-flex w-full justify-center"
          >
            <span className="rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.3em] text-blue-700 uppercase shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/70 dark:text-blue-300">
              Alur & Nilai Utama
            </span>
          </div>

          <h2
            data-animate-on-scroll
            style={revealDelay(40)}
            className="mb-6 text-center text-3xl font-bold text-gray-800 sm:text-4xl dark:text-white"
          >
            Bagaimana Vocavision Bekerja?
          </h2>

          <p
            data-animate-on-scroll
            style={revealDelay(70)}
            className="mx-auto max-w-3xl text-center text-sm leading-7 text-gray-600 sm:text-base dark:text-gray-400"
          >
            Vocavision membantu siswa dan guru memahami data, melihat prediksi,
            lalu mengambil tindakan — semuanya dalam satu alur yang sederhana.
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div
              data-animate-on-scroll
              style={revealDelay(140)}
              className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white/85 p-6 text-center shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950/70"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-transform duration-500 group-hover:scale-105">
                <HiClipboardList className="h-7 w-7" />
              </div>
              <h4 className="mt-4 font-semibold text-gray-800 dark:text-white">
                1. Isi Data
              </h4>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Jawab 17 pertanyaan singkat tentang kebiasaan belajar &
                lingkungan.
              </p>
            </div>

            <div
              data-animate-on-scroll
              style={revealDelay(200)}
              className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white/85 p-6 text-center shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950/70"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-transform duration-500 group-hover:scale-105">
                <HiLightBulb className="h-7 w-7" />
              </div>
              <h4 className="mt-4 font-semibold text-gray-800 dark:text-white">
                2. Lihat Prediksi
              </h4>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Skor, status risiko, dan faktor dominan ditampilkan dengan
                jelas.
              </p>
            </div>

            <div
              data-animate-on-scroll
              style={revealDelay(260)}
              className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white/85 p-6 text-center shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950/70"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-transform duration-500 group-hover:scale-105">
                <HiCheckCircle className="h-7 w-7" />
              </div>
              <h4 className="mt-4 font-semibold text-gray-800 dark:text-white">
                3. Tindak Lanjut
              </h4>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Ikuti saran praktis dan pantau perubahan secara berkala.
              </p>
            </div>
          </div>

          <div
            data-animate-on-scroll
            style={revealDelay(300)}
            className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                icon: HiShieldCheck,
                text: "Autentikasi JWT & RBAC (Admin/Guru/Siswa)",
              },
              { icon: HiDatabase, text: "Penyimpanan MySQL dengan SQLAlchemy" },
              {
                icon: HiChartBar,
                text: "Model Random Forest & SHAP Explainability",
              },
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
                <p className="pt-0.5 text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div
              data-animate-on-scroll
              style={revealDelay(100)}
              className="rounded-2xl border border-gray-100 bg-white/80 px-6 py-8 text-center shadow-sm backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/70"
            >
              <span className="block text-4xl font-bold text-primary">17</span>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Variabel prediktor
              </p>
            </div>
            <div
              data-animate-on-scroll
              style={revealDelay(160)}
              className="rounded-2xl border border-gray-100 bg-white/80 px-6 py-8 text-center shadow-sm backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/70"
            >
              <span className="block text-4xl font-bold text-primary">3</span>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Peran pengguna
              </p>
            </div>
            <div
              data-animate-on-scroll
              style={revealDelay(220)}
              className="rounded-2xl border border-gray-100 bg-white/80 px-6 py-8 text-center shadow-sm backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/70"
            >
              <span className="block text-4xl font-bold text-primary">
                &gt;85%
              </span>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Akurasi model
              </p>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500 italic dark:text-gray-400">
            Mudah, cepat, dan langsung bisa diterapkan oleh guru maupun siswa.
          </p>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-6 text-gray-500 transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 text-sm">
          <span className="text-center">
            © {new Date().getFullYear()} Vocavision. All rights reserved.
          </span>
        </div>
      </footer>

      {/* Fullscreen Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 z-10 rounded-full bg-white/20 p-2 text-white backdrop-blur transition-colors hover:bg-white/40"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <HiX className="h-8 w-8" />
          </button>
          <div
            className="relative h-full max-h-[90vh] w-full max-w-[90vw] overflow-hidden rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Fullscreen View"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition:
            opacity 800ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 800ms cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--reveal-delay, 0ms);
          will-change: opacity, transform;
        }

        .reveal-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
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
