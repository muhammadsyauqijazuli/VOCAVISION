"use client";

import { useState } from "react";
import { toast } from "sonner";

type InterventionFormProps = {
  studentId: string;
  studentName?: string;
  recommendations?: Array<{
    title: string;
    description: string;
  }>;
};

export function InterventionForm({
  studentId,
  studentName,
  recommendations = [],
}: InterventionFormProps) {
  const [note, setNote] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNote = note.trim();
    if (!trimmedNote) {
      toast.error("Catatan intervensi tidak boleh kosong.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/interventions/${studentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: trimmedNote }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(
          (payload as { message?: string }).message ??
            "Gagal menyimpan intervensi",
        );
      }

      setSavedCount((prev) => prev + 1);
      setNote("");
      toast.success("Catatan intervensi berhasil dikirim dan tersimpan.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan intervensi";
      toast.error(`Error: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-stroke bg-white p-4 shadow-1 sm:p-5 dark:border-dark-3 dark:bg-gray-dark">
      <div className="mb-5 space-y-2">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          Intervention Form
        </p>
        <h2 className="text-lg font-bold text-dark sm:text-xl dark:text-white">
          Catatan Tindak Lanjut
        </h2>
        <p className="text-sm leading-6 text-dark-4 dark:text-dark-6">
          {studentName
            ? `Rekomendasi untuk ${studentName} disusun dari variabel belajar yang tersedia. Catatan akan dikirim langsung ke siswa.`
            : "Simpan catatan intervensi untuk siswa ini. Catatan akan tersimpan di server dan dapat dilihat oleh siswa."}
        </p>
      </div>

      {recommendations.length > 0 && (
        <div className="border-brand-accent/20 bg-brand-accent/5 dark:border-brand-accent/30 dark:bg-brand-accent/10 mb-5 rounded-2xl border p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                Rekomendasi
              </p>
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
                <h4 className="text-sm font-semibold text-dark dark:text-white">
                  {item.title}
                </h4>
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
          <span className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Catatan
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={5}
            placeholder="Tulis langkah tindak lanjut atau rekomendasi untuk siswa ini"
            className="min-h-36 w-full rounded-xl border border-stroke bg-transparent px-4 py-3 text-dark transition outline-none placeholder:text-dark-4 focus:border-primary dark:border-dark-3 dark:text-white dark:placeholder:text-dark-6"
            disabled={submitting}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Mengirim...
            </>
          ) : (
            "Kirim Catatan ke Siswa"
          )}
        </button>
      </form>

      <div className="mt-5 grid gap-3 rounded-2xl bg-gray-1 p-4 text-sm text-dark-4 sm:grid-cols-2 dark:bg-dark-2 dark:text-dark-6">
        <p className="wrap-break-word">Student ID: {studentId}</p>
        <p className="sm:text-right">
          Catatan terkirim sesi ini: {savedCount}
        </p>
      </div>
    </section>
  );
}
