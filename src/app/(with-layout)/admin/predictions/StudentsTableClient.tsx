"use client";

import React, { useEffect, useState } from "react";

type Student = {
  id: string;
  nama: string;
  nisn: string;
  predicted_score: number | null;
  risk_status: string | null;
};

type Props = {
  initialSearch?: string;
};

export default function StudentsTableClient({ initialSearch = "" }: Props) {
  const [items, setItems] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 30;
  const [search, setSearch] = useState(initialSearch);
  // removed riskStatus filter per request
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (sortBy) params.set("sort_by", sortBy);
        if (sortDir) params.set("sort_dir", sortDir);
        params.set("page", String(page));
        params.set("page_size", String(pageSize));

        const res = await fetch(`/api/students?${params.toString()}`, { credentials: "include" });
        const payload = await res.json().catch(() => ({}));
        // debug log
        // eslint-disable-next-line no-console
        console.debug('[StudentsTableClient] fetch', { url: `/api/students?${params.toString()}`, status: res.status, payload });
        if (!res.ok) {
          const msg = payload?.message || `Gagal mengambil data siswa (${res.status})`;
          setError(msg);
          setItems([]);
          setTotal(0);
        } else {
          setItems(payload.items ?? []);
          setTotal(payload.total ?? 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [search, sortBy, sortDir, page]);

  // Debounced search input -> commit to `search` when user submits or presses Enter
  function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleReset() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  function toggleSort(field: string) {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  function formatScore(score: number | null) {
    if (score === null || Number.isNaN(score)) return "-";
    return Number(score).toFixed(2);
  }

  function riskBadge(status: string | null, score: number | null) {
    const base = "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold";
    // Preserve explicit very-high risk visual
    if (status === "Sangat Beresiko") {
      return <span className={`${base} bg-red-600 text-white`}><span className="h-2 w-2 rounded-full bg-white/80"/></span>;
    }
    // New rule: show yellow if predicted score is below 80 (but not the very-high risk above)
    if (score !== null && !Number.isNaN(score) && Number(score) < 80) {
      return <span className={`${base} bg-yellow-500 text-white`}><span className="h-2 w-2 rounded-full bg-white/80"/></span>;
    }
    if (status === "Beresiko") {
      return <span className={`${base} bg-yellow-500 text-white`}><span className="h-2 w-2 rounded-full bg-white/80"/></span>;
    }
    if (status === "Tidak Beresiko") {
      return <span className={`${base} bg-emerald-200 text-emerald-800`}><span className="h-2 w-2 rounded-full bg-emerald-800"/></span>;
    }
    return <span className={`${base} bg-gray-200 text-dark-4`}><span className="h-2 w-2 rounded-full bg-gray-400"/></span>;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="px-5 py-4">
        <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-2 items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-dark dark:text-white">Cari</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nama atau NISN"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
            />
          </label>
          {/* risk filter removed to simplify UI on small devices */}

          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-white cursor-pointer hover:opacity-95">Terapkan</button>
            <button type="button" onClick={handleReset} className="rounded-lg border border-stroke px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-4">Reset</button>
          </div>
        </form>
      </div>
      <div className="border-b border-stroke px-5 py-4 dark:border-dark-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-dark dark:text-white">Daftar Prediksi Siswa</h2>
          <div className="text-sm text-dark-4 dark:text-dark-6">Menampilkan {Math.min(total, pageSize)} dari {total} siswa</div>
        </div>
        <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">Data ini diambil dari prediksi terbaru yang dihasilkan model.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stroke dark:divide-dark-3">
          <thead className="bg-gray-2 dark:bg-dark-2">
            <tr>
              <th onClick={() => toggleSort('nama')} className="px-5 py-3 text-left text-sm font-semibold text-dark dark:text-white cursor-pointer">Nama {sortBy === 'nama' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => toggleSort('nisn')} className="px-5 py-3 text-left text-sm font-semibold text-dark dark:text-white cursor-pointer hidden sm:table-cell">NISN {sortBy === 'nisn' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => toggleSort('predicted_score')} className="px-5 py-3 text-left text-sm font-semibold text-dark dark:text-white cursor-pointer">Skor Prediksi {sortBy === 'predicted_score' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
              <th onClick={() => toggleSort('risk_status')} className="px-5 py-3 text-left text-sm font-semibold text-dark dark:text-white cursor-pointer hidden sm:table-cell">Status Risiko {sortBy === 'risk_status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke dark:divide-dark-3">
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center">Memuat...</td></tr>
            ) : error ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-red-600 dark:text-red-300">{error}</td></tr>
            ) : items.length ? (
              items.map((student) => (
                <tr key={student.id} className="hover:bg-gray-1 dark:hover:bg-dark-2/60">
                  <td className="px-5 py-4 font-medium text-dark dark:text-white">{student.nama}</td>
                  <td className="px-5 py-4 text-dark-4 dark:text-dark-6 hidden sm:table-cell">{student.nisn}</td>
                  <td className="px-5 py-4 text-dark-4 dark:text-dark-6">{formatScore(student.predicted_score)}</td>
                  <td className="px-5 py-4 hidden sm:table-cell">{riskBadge(student.risk_status, student.predicted_score)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-dark-4 dark:text-dark-6">Tidak ada data prediksi yang cocok dengan filter saat ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="text-sm text-dark-4 dark:text-dark-6">Halaman {page} dari {totalPages}</div>
          <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-stroke px-3 py-2 text-sm dark:border-dark-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-4">Prev</button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-stroke px-3 py-2 text-sm dark:border-dark-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-4">Next</button>
        </div>
      </div>
    </div>
  );
}
