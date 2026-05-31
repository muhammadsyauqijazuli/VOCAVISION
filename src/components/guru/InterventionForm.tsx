"use client";

import { useEffect, useState } from "react";

type InterventionFormProps = {
  studentId: string;
  studentName?: string;
  recommendations?: Array<{
    title: string;
    description: string;
  }>;
};

type SavedIntervention = {
  id: string;
  studentId: string;
  note: string;
  createdAt: string;
};

export function InterventionForm({ studentId, studentName, recommendations = [] }: InterventionFormProps) {
  const storageKey = `vocavision-interventions-${studentId}`;
  const [note, setNote] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      const parsed = stored ? (JSON.parse(stored) as SavedIntervention[]) : [];
      setSavedCount(parsed.length);
    } catch {
      setSavedCount(0);
    }
  }, [storageKey]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNote = note.trim();
    if (!trimmedNote) {
      setMessage("Catatan intervensi tidak boleh kosong.");
      return;
    }

    const intervention: SavedIntervention = {
      id: crypto.randomUUID(),
      studentId,
      note: trimmedNote,
      createdAt: new Date().toISOString(),
    };

    try {
      const stored = window.localStorage.getItem(storageKey);
      const parsed = stored ? (JSON.parse(stored) as SavedIntervention[]) : [];
      const next = [intervention, ...parsed].slice(0, 20);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      setSavedCount(next.length);
      setNote("");
      setMessage("Catatan intervensi tersimpan di perangkat ini.");
    } catch {
      setMessage("Gagal menyimpan catatan intervensi.");
    }
  }

  return (
    <section className="rounded-2xl border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark sm:p-5">
      <div className="mb-5 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Intervention Form</p>
        <h2 className="text-lg font-bold text-dark dark:text-white sm:text-xl">Catatan Tindak Lanjut</h2>
        <p className="text-sm leading-6 text-dark-4 dark:text-dark-6">
          {studentName ? `Rekomendasi untuk ${studentName} disusun dari variabel belajar yang tersedia.` : "Simpan catatan intervensi untuk siswa ini sebagai simulasi lokal."}
        </p>
      </div>

      {recommendations.length > 0 && (
        <div className="mb-5 rounded-2xl border border-brand-accent/20 bg-brand-accent/5 p-4 dark:border-brand-accent/30 dark:bg-brand-accent/10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Rekomendasi</p>
              <h3 className="text-base font-semibold text-dark dark:text-white">
                Fokus perbaikan performa akademik
              </h3>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-dark shadow-sm dark:bg-gray-dark dark:text-white">
              {recommendations.length} poin
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {recommendations.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-white/70 bg-white p-3 shadow-sm dark:border-dark-3 dark:bg-dark-2"
              >
                <h4 className="text-sm font-semibold text-dark dark:text-white">{item.title}</h4>
                <p className="mt-1 text-sm leading-6 text-dark-4 dark:text-dark-6">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-dark dark:text-white">Catatan</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={5}
            placeholder="Tulis langkah tindak lanjut atau rekomendasi untuk siswa ini"
            className="min-h-36 w-full rounded-xl border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition placeholder:text-dark-4 focus:border-primary dark:border-dark-3 dark:text-white dark:placeholder:text-dark-6"
          />
        </label>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
        >
          Simpan Intervensi
        </button>
      </form>

      <div className="mt-5 grid gap-3 rounded-2xl bg-gray-1 p-4 text-sm text-dark-4 dark:bg-dark-2 dark:text-dark-6 sm:grid-cols-2">
        <p className="wrap-break-word">Student ID: {studentId}</p>
        <p className="sm:text-right">Total catatan tersimpan: {savedCount}</p>
        {message ? <p className="sm:col-span-2 text-dark dark:text-white">{message}</p> : null}
      </div>
    </section>
  );
}