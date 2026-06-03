"use client";

import React, { useMemo, useState } from "react";
import {
  FiInfo,
  FiRotateCcw,
  FiZap,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

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
  {
    key: "jam_belajar_per_hari",
    label: "Jam belajar per hari",
    helper: "Rata-rata waktu belajar mandiri setiap hari.",
    min: 0,
    max: 24,
    step: "0.5",
  },
  {
    key: "presentase_kehadiran",
    label: "Presentase kehadiran (%)",
    helper: "Kehadiran aktual dalam proses belajar.",
    min: 0,
    max: 100,
    step: "0.1",
  },
  {
    key: "nilai_rata_rata_raport",
    label: "Nilai rata-rata raport",
    helper: "Rata-rata nilai akademik terkini.",
    min: 0,
    max: 100,
    step: "0.1",
  },
  {
    key: "skor_time_management",
    label: "Skor time management",
    helper: "Skala kemampuan mengatur waktu (0–10).",
    min: 0,
    max: 10,
    step: "0.1",
  },
  {
    key: "jam_tidur",
    label: "Jam tidur",
    helper: "Durasi tidur rata-rata per malam.",
    min: 0,
    max: 24,
    step: "0.5",
  },
  {
    key: "screen_time",
    label: "Screen time",
    helper: "Durasi penggunaan layar per hari.",
    min: 0,
    max: 24,
    step: "0.5",
  },
  {
    key: "kehadiran_pelatihan_industry",
    label: "Kehadiran pelatihan industry (%)",
    helper: "Persentase kehadiran pada pelatihan relevan.",
    min: 0,
    max: 100,
    step: "0.1",
  },
  {
    key: "motivasi_akademik",
    label: "Motivasi akademik",
    helper: "Skala motivasi belajar saat ini (0–10).",
    min: 0,
    max: 10,
    step: "0.1",
  },
  {
    key: "exam_score",
    label: "Exam score saat ini",
    helper: "Nilai ujian yang sudah ada, jika tersedia.",
    min: 0,
    max: 100,
    step: "0.1",
  },
];

const SELECT_FIELDS: SelectField[] = [
  { key: "gender", label: "Gender", options: ["Laki-laki", "Perempuan"] },
  {
    key: "rata_rata_pemasukan_keluarga",
    label: "Rata-rata pemasukan keluarga",
    options: ["< 2 Juta", "2 - 5 Juta", "5 - 10 Juta", "> 10 Juta"],
  },
  {
    key: "pendidikan_terakhir_orang_tua",
    label: "Pendidikan terakhir orang tua",
    options: ["SD", "SMP", "SMA/SMK", "Diploma", "Sarjana"],
  },
  {
    key: "kerja_sampingan",
    label: "Kerja sampingan",
    options: ["Tidak", "Ya"],
  },
  {
    key: "study_environment",
    label: "Study environment",
    options: [
      "Kurang Kondusif",
      "Cukup Kondusif",
      "Kondusif",
      "Sangat Kondusif",
    ],
  },
  {
    key: "kompetensi_skill_level",
    label: "Kompetensi / skill level",
    options: ["Rendah", "Menengah", "Tinggi"],
  },
  {
    key: "industry_readiness",
    label: "Industry readiness",
    options: ["Belum Siap", "Siap"],
  },
  {
    key: "stress_level",
    label: "Stress level",
    options: ["Rendah", "Sedang", "Berat"],
  },
];

function getRiskConfig(status?: RiskStatus) {
  switch (status) {
    case "Tidak Beresiko":
      return {
        badge: "bg-green-light-7 text-green ring-1 ring-green/20",
        bar: "bg-green",
        dot: "bg-green",
      };
    case "Beresiko":
      return {
        badge: "bg-yellow-light-4 text-yellow-dark ring-1 ring-yellow-dark/20",
        bar: "bg-yellow-dark",
        dot: "bg-yellow-dark",
      };
    default:
      return {
        badge: "bg-red-light-6 text-red ring-1 ring-red/20",
        bar: "bg-red",
        dot: "bg-red",
      };
  }
}

function sortInsights(insights: ShapInsight[]) {
  return [...insights].sort(
    (a, b) => Math.abs(b.impact_value) - Math.abs(a.impact_value),
  );
}

export default function UpdateDataPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);

  const topInsights = useMemo(
    () => sortInsights(result?.shap_analysis ?? []).slice(0, 5),
    [result],
  );
  const riskConfig = getRiskConfig(result?.risk_status);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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

      const payload = (await response
        .json()
        .catch(() => ({}))) as PredictionResponse & { message?: string };

      if (!response.ok) {
        throw new Error(
          payload.message ?? `Gagal memproses prediksi (${response.status})`,
        );
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

      const insightResponse = await fetch(
        `/api/predict/insight/${payload.student_id}`,
        {
          credentials: "include",
        },
      );
      const insightPayload = (await insightResponse
        .json()
        .catch(() => ({}))) as InsightResponse & { message?: string };

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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghubungi server";
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
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500 ease-out">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-blue-dark p-8 shadow-1 md:p-10">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10">
          <p className="mb-2 text-xs font-semibold tracking-widest text-white/70 uppercase">
            VOCAVISION
          </p>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Perbarui Data &amp; Prediksi
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
            Isi 17 variabel gaya hidup dan akademik untuk mengirim data ke proxy
            Next.js, memanggil model Flask, lalu menampilkan prediksi skor ujian
            dan insight SHAP.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "Proxy: /api/predict/single",
              "Insight: /api/predict/insight/[id]",
              "SSOT DB: Flask SQLAlchemy",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Grid ── */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.9fr)] xl:items-start">
        {/* ── Left: Form ── */}
        <section className="rounded-2xl border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <form
            className="divide-y divide-stroke dark:divide-dark-3"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Numeric Fields */}
            <div className="p-6 md:p-8">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-dark dark:text-white">
                  Data Numerik
                </h2>
                <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
                  Gunakan angka yang paling mendekati kondisi siswa saat ini.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {NUMERIC_FIELDS.map((field) => (
                  <label
                    key={String(field.key)}
                    className="group block space-y-2 rounded-xl border border-stroke bg-gray-1 p-4 transition-all hover:border-primary/40 hover:bg-white dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary/40 dark:hover:bg-dark-2"
                  >
                    <span className="block text-sm font-semibold text-dark dark:text-white">
                      {field.label}
                    </span>
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={
                        field.key === "exam_score"
                          ? (form.exam_score ?? "")
                          : String(
                              form[
                                field.key as Exclude<FieldKey, "exam_score">
                              ],
                            )
                      }
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (field.key === "exam_score") {
                          updateField(
                            "exam_score",
                            raw === "" ? null : Number(raw),
                          );
                          return;
                        }
                        updateField(
                          field.key as Exclude<FieldKey, "exam_score">,
                          Number(raw) as FormState[typeof field.key],
                        );
                      }}
                      className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-dark-3 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                    />
                    <p className="text-xs text-dark-5 dark:text-dark-6">
                      {field.helper}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {/* Categorical Fields */}
            <div className="p-6 md:p-8">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-dark dark:text-white">
                  Data Kategorikal
                </h2>
                <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
                  Pilih nilai yang paling sesuai dengan kondisi siswa.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {SELECT_FIELDS.map((field) => (
                  <label
                    key={String(field.key)}
                    className="group block space-y-2 rounded-xl border border-stroke bg-gray-1 p-4 transition-all hover:border-primary/40 hover:bg-white dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary/40 dark:hover:bg-dark-2"
                  >
                    <span className="block text-sm font-semibold text-dark dark:text-white">
                      {field.label}
                    </span>
                    <select
                      value={String(form[field.key])}
                      onChange={(e) =>
                        updateField(
                          field.key,
                          e.target.value as FormState[typeof field.key],
                        )
                      }
                      className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm text-dark transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-dark-3 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 p-6 sm:flex-row md:p-8">
              <button
                type="button"
                id="btn-predict"
                onClick={handlePredict}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-1 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                    <span>Memproses prediksi...</span>
                  </>
                ) : (
                  <>
                    <FiZap size={16} />
                    <span>Lihat Prediksi Sekarang</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-reset"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stroke bg-white px-6 py-3 font-semibold text-dark-4 transition hover:border-dark-3 hover:bg-gray-1 dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6 dark:hover:border-dark-2"
              >
                <FiRotateCcw size={15} />
                <span>Reset Form</span>
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-6 flex items-start gap-3 rounded-xl border border-red/20 bg-red-light-6 px-4 py-3 text-sm text-red md:mx-8 md:mb-8">
              <FiInfo size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mx-6 mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 md:mx-8 md:mb-8">
              <div className="flex items-center gap-3">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                <div>
                  <p className="font-semibold text-dark dark:text-white">
                    Menghubungkan ke backend Flask
                  </p>
                  <p className="text-sm text-dark-4 dark:text-dark-6">
                    Data sedang diproses dan insight SHAP sedang disiapkan.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Right: Result Panel ── */}
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          {/* Result Summary Card */}
          <div className="rounded-2xl border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark">
            <div className="flex items-start justify-between gap-3 border-b border-stroke p-6 dark:border-dark-3">
              <div>
                <p className="text-xs font-semibold tracking-widest text-dark-5 uppercase dark:text-dark-6">
                  Hasil Prediksi
                </p>
                <h2 className="mt-1.5 text-2xl font-bold text-dark dark:text-white">
                  Ringkasan Real-time
                </h2>
              </div>
              <span className="shrink-0 rounded-lg bg-gray-1 px-3 py-1.5 text-xs font-semibold tracking-wider text-dark-5 uppercase dark:bg-dark-2 dark:text-dark-6">
                {result?.source === "insight"
                  ? "Insight Sinkron"
                  : "Menunggu Submit"}
              </span>
            </div>

            <div className="p-6">
              {result ? (
                <div className="space-y-5">
                  {/* Score Block */}
                  <div className="rounded-xl bg-dark p-5 dark:bg-dark-2">
                    <p className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                      Predicted Exam Score
                    </p>
                    <div className="mt-2 flex flex-wrap items-end gap-3">
                      <span className="text-4xl font-bold tracking-tight text-white">
                        {result.predicted_exam_score.toFixed(2)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${riskConfig.badge}`}
                      >
                        {result.risk_status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-white/75">
                      {result.student_name
                        ? `Insight untuk ${result.student_name}.`
                        : "Prediksi berhasil diterima dari backend Flask melalui proxy Next.js."}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2">
                      <p className="text-xs font-semibold tracking-wider text-dark-5 uppercase dark:text-dark-6">
                        Student ID
                      </p>
                      <p className="mt-1.5 text-sm font-semibold break-all text-dark dark:text-white">
                        {result.student_id}
                      </p>
                    </div>
                    <div className="rounded-xl border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2">
                      <p className="text-xs font-semibold tracking-wider text-dark-5 uppercase dark:text-dark-6">
                        Sumber Data
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-dark dark:text-white">
                        {result.source === "insight"
                          ? "GET /insight/[id]"
                          : "POST /predict/single"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-stroke bg-gray-1 p-6 text-center dark:border-dark-3 dark:bg-dark-2">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FiZap size={20} />
                  </div>
                  <p className="font-semibold text-dark dark:text-white">
                    Belum Ada Hasil
                  </p>
                  <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
                    Isi form dan tekan tombol prediksi untuk melihat hasil.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SHAP Insights */}
          {result && topInsights.length > 0 && (
            <div className="rounded-2xl border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark">
              <div className="flex items-center justify-between border-b border-stroke p-6 dark:border-dark-3">
                <h3 className="font-bold text-dark dark:text-white">
                  SHAP Insight Utama
                </h3>
                <span className="text-xs font-semibold tracking-wider text-dark-5 uppercase dark:text-dark-6">
                  Top {topInsights.length}
                </span>
              </div>

              <div className="divide-y divide-stroke p-4 dark:divide-dark-3">
                {topInsights.map((insight) => (
                  <article
                    key={`${insight.feature_name}-${insight.impact_value}`}
                    className="flex items-start gap-3 py-4 first:pt-2 last:pb-2"
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        insight.impact_value >= 0
                          ? "bg-green-light-7 text-green"
                          : "bg-red-light-6 text-red"
                      }`}
                    >
                      {insight.impact_value >= 0 ? (
                        <FiArrowUp size={13} />
                      ) : (
                        <FiArrowDown size={13} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-dark dark:text-white">
                          {insight.feature_name}
                        </p>
                        <span
                          className={`shrink-0 text-xs font-bold ${
                            insight.impact_value >= 0
                              ? "text-green"
                              : "text-red"
                          }`}
                        >
                          {insight.impact_value >= 0 ? "+" : ""}
                          {insight.impact_value.toFixed(3)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-dark-4 dark:text-dark-6">
                        {insight.suggestion_text}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Integration Note */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 dark:border-primary/30 dark:bg-primary/10">
            <div className="mb-2 flex items-center gap-2">
              <FiInfo size={15} className="text-primary" />
              <h3 className="text-sm font-bold text-dark dark:text-white">
                Catatan Integrasi
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-dark-4 dark:text-dark-6">
              Proxy Next.js menjaga frontend tetap seragam, menyembunyikan URL
              Flask, dan menghindari masalah CORS. Flask SQLAlchemy tetap
              menjadi sumber kebenaran utama.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
