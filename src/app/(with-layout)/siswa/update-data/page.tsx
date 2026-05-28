"use client";

import React, { useMemo, useState } from "react";

type RiskStatus = "Sangat Beresiko" | "Beresiko" | "Tidak Beresiko";

type FormState = {
  jam_belajar_per_hari: number;
  presentase_kehadiran: number;
  nilai_rata_rata_raport: number;
  skor_time_management: number;
  jam_tidur: number;
  screen_time: number;
  kehadiran_pelatihan_industry: number;
  motivasi_akademik: number;
  exam_score: number | null;
  gender: string;
  rata_rata_pemasukan_keluarga: string;
  pendidikan_terakhir_orang_tua: string;
  kerja_sampingan: string;
  study_environment: string;
  kompetensi_skill_level: string;
  industry_readiness: string;
  stress_level: string;
};

type ShapInsight = {
  feature_name: string;
  impact_value: number;
  suggestion_text: string;
};

type PredictionResponse = {
  student_id?: string;
  predicted_exam_score?: number;
  risk_status?: RiskStatus;
  shap_analysis?: ShapInsight[];
  model_version?: string;
};

type InsightResponse = {
  student_id: string;
  student_name: string;
  predicted_exam_score: number;
  risk_status: RiskStatus;
  shap_analysis: ShapInsight[];
};

type ResultState = {
  student_id: string;
  student_name?: string;
  predicted_exam_score: number;
  risk_status: RiskStatus;
  shap_analysis: ShapInsight[];
  source: "prediction" | "insight";
};

type FieldKey = keyof FormState;

type NumericField = {
  key: FieldKey;
  label: string;
  helper: string;
  min?: number;
  max?: number;
  step?: string;
};

type SelectField = {
  key: FieldKey;
  label: string;
  options: readonly string[];
};

const DEFAULT_FORM: FormState = {
  jam_belajar_per_hari: 0,
  presentase_kehadiran: 0,
  nilai_rata_rata_raport: 0,
  skor_time_management: 0,
  jam_tidur: 0,
  screen_time: 0,
  kehadiran_pelatihan_industry: 0,
  motivasi_akademik: 0,
  exam_score: null,
  gender: "Laki-laki",
  rata_rata_pemasukan_keluarga: "< 2 Juta",
  pendidikan_terakhir_orang_tua: "SMA/SMK",
  kerja_sampingan: "Tidak",
  study_environment: "Cukup Kondusif",
  kompetensi_skill_level: "Menengah",
  industry_readiness: "Belum Siap",
  stress_level: "Sedang",
};

const NUMERIC_FIELDS: NumericField[] = [
  { key: "jam_belajar_per_hari", label: "Jam belajar per hari", helper: "Rata-rata waktu belajar mandiri setiap hari.", min: 0, max: 24, step: "0.5" },
  { key: "presentase_kehadiran", label: "Presentase kehadiran (%)", helper: "Kehadiran aktual dalam proses belajar.", min: 0, max: 100, step: "0.1" },
  { key: "nilai_rata_rata_raport", label: "Nilai rata-rata raport", helper: "Rata-rata nilai akademik terkini.", min: 0, max: 100, step: "0.1" },
  { key: "skor_time_management", label: "Skor time management", helper: "Skala kemampuan mengatur waktu.", min: 0, max: 10, step: "0.1" },
  { key: "jam_tidur", label: "Jam tidur", helper: "Durasi tidur rata-rata per malam.", min: 0, max: 24, step: "0.5" },
  { key: "screen_time", label: "Screen time", helper: "Durasi penggunaan layar per hari.", min: 0, max: 24, step: "0.5" },
  { key: "kehadiran_pelatihan_industry", label: "Kehadiran pelatihan industry (%)", helper: "Persentase kehadiran pada pelatihan relevan.", min: 0, max: 100, step: "0.1" },
  { key: "motivasi_akademik", label: "Motivasi akademik", helper: "Skala motivasi belajar saat ini.", min: 0, max: 10, step: "0.1" },
  { key: "exam_score", label: "Exam score saat ini", helper: "Nilai ujian yang sudah ada, jika tersedia.", min: 0, max: 100, step: "0.1" },
];

const SELECT_FIELDS: SelectField[] = [
  { key: "gender", label: "Gender", options: ["Laki-laki", "Perempuan"] },
  { key: "rata_rata_pemasukan_keluarga", label: "Rata-rata pemasukan keluarga", options: ["< 2 Juta", "2 - 5 Juta", "5 - 10 Juta", "> 10 Juta"] },
  { key: "pendidikan_terakhir_orang_tua", label: "Pendidikan terakhir orang tua", options: ["SD", "SMP", "SMA/SMK", "Diploma", "Sarjana"] },
  { key: "kerja_sampingan", label: "Kerja sampingan", options: ["Tidak", "Ya"] },
  { key: "study_environment", label: "Study environment", options: ["Kurang Kondusif", "Cukup Kondusif", "Kondusif", "Sangat Kondusif"] },
  { key: "kompetensi_skill_level", label: "Kompetensi / skill level", options: ["Rendah", "Menengah", "Tinggi"] },
  { key: "industry_readiness", label: "Industry readiness", options: ["Belum Siap", "Siap"] },
  { key: "stress_level", label: "Stress level", options: ["Rendah", "Sedang", "Berat"] },
];

function getRiskClass(status?: RiskStatus) {
  switch (status) {
    case "Tidak Beresiko":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "Beresiko":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    default:
      return "bg-rose-50 text-rose-700 ring-rose-200";
  }
}

function sortInsights(insights: ShapInsight[]) {
  return [...insights].sort((left, right) => Math.abs(right.impact_value) - Math.abs(left.impact_value));
}

export default function UpdateDataPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);

  const topInsights = useMemo(() => sortInsights(result?.shap_analysis ?? []).slice(0, 5), [result]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handlePredict() {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/predict/single", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json().catch(() => ({}))) as PredictionResponse & { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? `Gagal memproses prediksi (${response.status})`);
      }

      if (!payload.student_id) {
        setResult({
          student_id: "-",
          predicted_exam_score: payload.predicted_exam_score ?? 0,
          risk_status: payload.risk_status ?? "Sangat Beresiko",
          shap_analysis: payload.shap_analysis ?? [],
          source: "prediction",
        });
        return;
      }

      const insightResponse = await fetch(`/api/predict/insight/${payload.student_id}`, {
        credentials: "include",
      });
      const insightPayload = (await insightResponse.json().catch(() => ({}))) as InsightResponse & { message?: string };

      if (!insightResponse.ok) {
        setResult({
          student_id: payload.student_id,
          predicted_exam_score: payload.predicted_exam_score ?? 0,
          risk_status: payload.risk_status ?? "Sangat Beresiko",
          shap_analysis: payload.shap_analysis ?? [],
          source: "prediction",
        });
        return;
      }

      setResult({
        student_id: insightPayload.student_id,
        student_name: insightPayload.student_name,
        predicted_exam_score: insightPayload.predicted_exam_score,
        risk_status: insightPayload.risk_status,
        shap_analysis: insightPayload.shap_analysis ?? [],
        source: "insight",
      });
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : "Gagal menghubungi server";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(DEFAULT_FORM);
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-brand-light px-4 py-6 text-slate-900 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-brand-header via-brand-accent to-teal-500 px-6 py-8 text-white md:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">SINTESA</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Perbarui Data & Prediksi</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/90 md:text-base">
              Isi 17 variabel gaya hidup dan akademik untuk mengirim data ke proxy Next.js, memanggil model Flask, lalu menampilkan prediksi skor ujian dan insight SHAP yang lebih mudah dibaca.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 px-6 py-5 text-sm text-slate-600 md:px-8">
            <span className="rounded-full bg-slate-100 px-3 py-1">Proxy: /api/predict/single</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Insight: /api/predict/insight/[id]</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">SSOT DB: Flask SQLAlchemy</span>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <form className="space-y-8" onSubmit={(event) => event.preventDefault()}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Data Numerik</h2>
                  <p className="mt-1 text-sm text-slate-600">Gunakan angka yang paling mendekati kondisi siswa saat ini.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {NUMERIC_FIELDS.map((field) => (
                    <label key={String(field.key)} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-brand-accent/50 hover:bg-white">
                      <span className="block text-sm font-medium text-slate-800">{field.label}</span>
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={field.key === "exam_score" ? form.exam_score ?? "" : String(form[field.key as Exclude<FieldKey, "exam_score">])}
                        onChange={(event) => {
                          const rawValue = event.target.value;
                          if (field.key === "exam_score") {
                            updateField("exam_score", rawValue === "" ? null : Number(rawValue));
                            return;
                          }

                          updateField(field.key as Exclude<FieldKey, "exam_score">, Number(rawValue) as FormState[typeof field.key]);
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
                      />
                      <p className="text-xs leading-5 text-slate-500">{field.helper}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Data Kategorikal</h2>
                  <p className="mt-1 text-sm text-slate-600">Pilih nilai yang paling sesuai dengan kondisi siswa.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {SELECT_FIELDS.map((field) => (
                    <label key={String(field.key)} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-brand-accent/50 hover:bg-white">
                      <span className="block text-sm font-medium text-slate-800">{field.label}</span>
                      <select
                        value={String(form[field.key])}
                        onChange={(event) => updateField(field.key, event.target.value as FormState[typeof field.key])}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-header px-5 py-3 font-semibold text-white transition hover:bg-brand-accent disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />}
                  <span>{loading ? "Memproses prediksi..." : "Lihat Prediksi Sekarang"}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Reset Form
                </button>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {loading && (
                <div className="rounded-3xl border border-dashed border-brand-accent/40 bg-brand-light/60 p-5">
                  <div className="flex items-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-header border-t-transparent" />
                    <div>
                      <p className="font-semibold text-slate-900">Menghubungkan ke backend Flask</p>
                      <p className="text-sm text-slate-600">Data sedang diproses dan insight SHAP sedang dipersiapkan.</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Hasil Prediksi</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Ringkasan real-time</h2>
                </div>
                <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {result?.source === "insight" ? "Insight Sinkron" : "Menunggu submit"}
                </div>
              </div>

              {result ? (
                <div className="mt-6 space-y-5">
                  <div className="rounded-3xl bg-slate-900 p-5 text-white">
                    <p className="text-sm text-white/70">Predicted exam score</p>
                    <div className="mt-2 flex flex-wrap items-end gap-3">
                      <span className="text-4xl font-bold tracking-tight">{result.predicted_exam_score.toFixed(2)}</span>
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${getRiskClass(result.risk_status)}`}>
                        {result.risk_status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      {result.student_name ? `Insight untuk ${result.student_name}.` : "Prediksi berhasil diterima dari backend Flask melalui proxy Next.js."}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-brand-light/50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">SHAP insight utama</h3>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Top {Math.min(topInsights.length, 5)}</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {topInsights.length > 0 ? (
                        topInsights.map((insight) => (
                          <article key={`${insight.feature_name}-${insight.impact_value}`} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold text-slate-900">{insight.feature_name}</p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">{insight.suggestion_text}</p>
                              </div>
                              <div className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${insight.impact_value >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                {insight.impact_value >= 0 ? "+" : ""}{insight.impact_value.toFixed(3)}
                              </div>
                            </div>
                          </article>
                        ))
                      ) : (
                        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
                          Hasil SHAP akan muncul di sini setelah prediksi berhasil dijalankan.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Student ID</p>
                      <p className="mt-2 break-all text-sm font-medium text-slate-900">{result.student_id}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sumber data</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{result.source === "insight" ? "GET /api/predict/insight/[id]" : "POST /api/predict/single"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
                  Belum ada hasil yang ditampilkan. Setelah tombol prediksi ditekan, halaman ini akan menampilkan skor, status risiko, dan insight SHAP secara responsif.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-header to-brand-accent p-6 text-white shadow-sm">
              <h3 className="text-lg font-semibold">Catatan integrasi</h3>
              <p className="mt-2 text-sm leading-6 text-white/85">
                Proxy Next.js menjaga frontend tetap seragam, menyembunyikan URL Flask, dan menghindari masalah CORS. Untuk database, implementasi ini tetap menganggap Flask SQLAlchemy sebagai sumber kebenaran utama.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
