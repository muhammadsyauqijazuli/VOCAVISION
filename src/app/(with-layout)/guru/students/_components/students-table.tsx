"use client";

import { RiskBadge } from "@/components/guru/RiskBadge";
import Link from "next/link";
import { useEffect, useState } from "react";

type StudentRow = {
  id: string;
  nama: string;
  nisn: string;
  predicted_score: number | null;
  risk_status: string | null;
};

type ApiResponse = {
  items?: StudentRow[];
  message?: string;
};

function formatScore(score: number | null) {
  if (score === null || Number.isNaN(score)) {
    return "-";
  }

  return Number(score).toFixed(2);
}

export function StudentsTable() {
  const [items, setItems] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Auto-search (debounce) effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (query !== search) {
        setQuery(search);
        setPage(1); // Reset to page 1 on new search
      }
    }, 300); // 300ms delay

    return () => clearTimeout(handler);
  }, [search, query]);

  useEffect(() => {
    let ignore = false;

    async function loadStudents() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(pageSize),
        });

        if (query.trim()) {
          params.set("search", query.trim());
        }

        const response = await fetch(`/api/students?${params.toString()}`, {
          credentials: "include",
        });

        const payload = (await response
          .json()
          .catch(() => ({}))) as ApiResponse;

        if (!response.ok) {
          throw new Error(payload.message ?? "Gagal memuat data siswa");
        }

        if (!ignore) {
          setItems(payload.items ?? payload.items ?? []);
          setTotal((payload as any).total ?? 0);
        }
      } catch (caughtError) {
        if (!ignore) {
          const message =
            caughtError instanceof Error
              ? caughtError.message
              : "Gagal memuat data siswa";
          setError(message);
          setItems([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      ignore = true;
    };
  }, [query, page, pageSize]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(search);
    setPage(1);
  }

  function handleReset() {
    setSearch("");
    setQuery("");
    setPage(1);
  }

  function prevPage() {
    setPage((p) => Math.max(1, p - 1));
  }

  function nextPage() {
    const max = Math.max(1, Math.ceil(total / pageSize));
    setPage((p) => Math.min(max, p + 1));
  }

  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="border-b border-stroke p-5 sm:p-6 dark:border-dark-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Student Directory
            </p>
            <h2 className="text-xl font-bold text-dark sm:text-2xl dark:text-white">
              Daftar Siswa
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-dark-4 dark:text-dark-6">
              Cari siswa, lihat skor prediksi terbaru, lalu buka detail untuk
              SHAP insight dan intervensi.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-3 lg:max-w-xl lg:flex-row"
          >
            <label className="flex-1">
              <span className="sr-only">Cari nama atau NISN</span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama atau NISN"
                className="h-11 w-full rounded-lg border border-stroke bg-white px-4 text-sm text-dark transition outline-none placeholder:text-dark-4 focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:placeholder:text-dark-6"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-95 sm:flex-none sm:px-5"
              >
                Cari
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-stroke px-4 text-sm font-semibold text-dark transition hover:bg-gray-1 sm:flex-none sm:px-5 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className={`grid gap-3 md:hidden ${loading && items.length > 0 ? "opacity-50 transition-opacity" : ""}`}>
          {loading && items.length === 0 ? (
            <div className="rounded-2xl border border-stroke bg-gray-1 p-5 text-center text-dark-4 dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6">
              Memuat data siswa...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
              {error}
            </div>
          ) : items.length ? (
            items.map((student) => (
              <article
                key={student.id}
                className="rounded-2xl border border-stroke bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-dark-3 dark:bg-gray-dark"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-dark dark:text-white">
                      {student.nama}
                    </h3>
                    <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
                      NISN {student.nisn}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <RiskBadge
                      status={student.risk_status}
                      score={student.predicted_score}
                    />
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-gray-1 p-3 dark:bg-dark-2">
                    <dt className="text-dark-4 dark:text-dark-6">
                      Skor Prediksi
                    </dt>
                    <dd className="mt-1 font-semibold text-dark dark:text-white">
                      {formatScore(student.predicted_score)}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-gray-1 p-3 dark:bg-dark-2">
                    <dt className="text-dark-4 dark:text-dark-6">Status</dt>
                    <dd className="mt-1 font-semibold text-dark dark:text-white">
                      {student.risk_status ?? "-"}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/guru/students/${student.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Buka Detail
                </Link>
                <Link
                  href={`/guru/reports/${student.id}`}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-stroke px-4 py-2.5 text-sm font-semibold text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Buka Laporan
                </Link>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-stroke bg-gray-1 p-5 text-center text-dark-4 dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6">
              Tidak ada data siswa yang ditemukan.
            </div>
          )}
          {/* Pagination controls */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="text-sm text-dark-4 dark:text-dark-6">
              Menampilkan {items.length} dari {total} siswa
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="inline-flex items-center justify-center rounded-lg border border-stroke px-3 py-1 text-sm disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <div className="text-sm">
                Halaman {page} / {Math.max(1, Math.ceil(total / pageSize))}
              </div>
              <button
                onClick={nextPage}
                disabled={page >= Math.max(1, Math.ceil(total / pageSize))}
                className="inline-flex items-center justify-center rounded-lg border border-stroke px-3 py-1 text-sm disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-stroke md:block dark:border-dark-3">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stroke dark:divide-dark-3">
              <thead className="bg-gray-1 dark:bg-dark-2">
                <tr className="text-left text-sm font-semibold text-dark dark:text-white">
                  <th className="px-5 py-4">Nama</th>
                  <th className="px-5 py-4">NISN</th>
                  <th className="px-5 py-4">Skor Prediksi</th>
                  <th className="px-5 py-4">Status Risiko</th>
                  <th className="px-5 py-4">Aksi</th>
                </tr>
              </thead>

              <tbody className={`divide-y divide-stroke transition-opacity dark:divide-dark-3 ${loading && items.length > 0 ? "opacity-50" : ""}`}>
                {loading && items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-dark-4 dark:text-dark-6"
                    >
                      Memuat data siswa...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-red-600 dark:text-red-300"
                    >
                      {error}
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((student) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-gray-1 dark:hover:bg-dark-2/70"
                    >
                      <td className="px-5 py-4 font-medium text-dark dark:text-white">
                        {student.nama}
                      </td>
                      <td className="px-5 py-4 text-dark-4 dark:text-dark-6">
                        {student.nisn}
                      </td>
                      <td className="px-5 py-4 text-dark-4 dark:text-dark-6">
                        {formatScore(student.predicted_score)}
                      </td>
                      <td className="px-5 py-4">
                        <RiskBadge
                          status={student.risk_status}
                          score={student.predicted_score}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/guru/students/${student.id}`}
                            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
                          >
                            Detail
                          </Link>
                          <Link
                            href={`/guru/reports/${student.id}`}
                            className="inline-flex items-center rounded-lg border border-stroke px-4 py-2 text-sm font-semibold text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                          >
                            Laporan
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-dark-4 dark:text-dark-6"
                    >
                      Tidak ada data siswa yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
