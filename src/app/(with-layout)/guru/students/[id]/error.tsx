"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-10 text-center">
      <div className="rounded-2xl border border-stroke bg-white p-8 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <p className="text-brand-danger text-sm font-semibold tracking-wide uppercase">
          Terjadi kesalahan
        </p>
        <h1 className="mt-2 text-2xl font-bold text-dark dark:text-white">
          Gagal memuat detail siswa
        </h1>
        <p className="mt-3 text-sm text-dark-4 dark:text-dark-6">
          {error.message}
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}
