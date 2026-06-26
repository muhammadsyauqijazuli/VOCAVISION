"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialSearch?: string;
  initialRiskStatus?: string;
};

export default function SearchFormClient({
  initialSearch = "",
  initialRiskStatus = "",
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [riskStatus, setRiskStatus] = useState(initialRiskStatus);
  const [isPending, startTransition] = useTransition();

  function submitForm() {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (riskStatus) params.set("risk_status", riskStatus);

    startTransition(() => {
      // Use replace to avoid adding navigation history on each keystroke
      router.push(`/admin/predictions?${params.toString()}`);
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-dark dark:text-white">
          Cari siswa
        </span>
        <input
          type="text"
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nama atau NISN"
          className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark transition outline-none focus:border-primary dark:border-dark-3 dark:text-white"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-dark dark:text-white">
          Filter risiko
        </span>
        <select
          name="risk_status"
          value={riskStatus}
          onChange={(e) => setRiskStatus(e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark transition outline-none focus:border-primary dark:border-dark-3 dark:text-white"
        >
          <option value="">Semua</option>
          <option value="Beresiko">Beresiko</option>
          <option value="Aman">Aman</option>
          <option value="Sangat Aman">Sangat Aman</option>
        </select>
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => submitForm()}
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          {isPending ? "Mencari..." : "Terapkan"}
        </button>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setRiskStatus("");
            startTransition(() => router.push(`/admin/predictions`));
          }}
          className="inline-flex h-12 items-center justify-center rounded-lg border border-stroke px-5 text-sm font-semibold text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
