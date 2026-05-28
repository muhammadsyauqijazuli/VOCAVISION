"use client";

import React, { useState } from "react";

type ExportFormat = "pdf" | "excel";

function fileNameFor(format: ExportFormat) {
  return format === "pdf" ? "laporan_prediksi.pdf" : "laporan_prediksi.xlsx";
}

async function downloadReport(format: ExportFormat) {
  const response = await fetch(`/api/export/${format}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({} as { message?: string }));
    throw new Error(payload.message ?? `Download ${format.toUpperCase()} gagal`);
  }

  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileNameFor(format);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export default function GuruReportsPage() {
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload(format: ExportFormat) {
    setError(null);
    setLoadingFormat(format);

    try {
      await downloadReport(format);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Gagal mengunduh laporan");
    } finally {
      setLoadingFormat(null);
    }
  }

  return (
    <div className="min-h-screen bg-brand-light px-4 py-6 text-slate-900 md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-linear-to-r from-brand-header to-brand-accent px-6 py-8 text-white md:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Guru</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Laporan & Export</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/90 md:text-base">
              Unduh laporan prediksi siswa melalui proxy Next.js agar stream file dari Flask tetap aman dan konsisten di browser.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => handleDownload("pdf")}
              disabled={loadingFormat !== null}
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand-header px-5 py-4 font-semibold text-white transition hover:bg-brand-accent disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingFormat === "pdf" && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />}
              <span>{loadingFormat === "pdf" ? "Menyiapkan PDF..." : "Export to PDF"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload("excel")}
              disabled={loadingFormat !== null}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-700 transition hover:border-brand-accent hover:text-brand-header disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingFormat === "excel" && <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-header/70 border-t-transparent" />}
              <span>{loadingFormat === "excel" ? "Menyiapkan Excel..." : "Export to Excel"}</span>
            </button>
          </div>

          {error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            File diunduh melalui endpoint <span className="font-semibold text-slate-800">/api/export/pdf</span> dan <span className="font-semibold text-slate-800">/api/export/excel</span>. Jika backend Flask sedang lambat, proxy Next.js akan mengembalikan status timeout yang jelas.
          </div>
        </section>
      </div>
    </div>
  );
}
