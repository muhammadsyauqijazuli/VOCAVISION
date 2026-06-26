"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  FiInfo,
  FiZap,
  FiArrowUp,
  FiArrowDown,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiAlertTriangle,
  FiRotateCcw,
  FiUser,
  FiDollarSign,
  FiBookOpen,
  FiClock,
  FiActivity,
  FiTarget,
  FiLock,
} from "react-icons/fi";
import { formatRiskStatus } from "@/lib/utils";

/* ================================================================
   TYPE DEFINITIONS
   ================================================================ */

type RiskStatus = "Beresiko" | "Aman" | "Sangat Aman";

type ShapInsight = {
  feature_name: string;
  impact_value: number;
  suggestion_text: string;
};

type PredictionResponse = {
  student_id?: string;
  predicted_nilai_raport?: number;
  risk_status?: RiskStatus;
  shap_analysis?: ShapInsight[];
  model_version?: string;
  message?: string;
};

type InsightResponse = {
  student_id: string;
  student_name: string;
  predicted_nilai_raport: number;
  risk_status: RiskStatus;
  shap_analysis: ShapInsight[];
  message?: string;
};

type ResultState = {
  student_id: string;
  student_name?: string;
  predicted_nilai_raport: number;
  risk_status: RiskStatus;
  shap_analysis: ShapInsight[];
  source: "prediction" | "insight";
};

type QuestionType = "radio" | "number";

type RadioOption = {
  label: string;
  value: string;
};

type Question = {
  id: number;
  section: 1 | 2 | 3;
  text: string;
  type: QuestionType;
  options?: RadioOption[];
  numberConfig?: { min: number; max: number; step?: number; unit?: string };
  helperText?: string;
};

/* ================================================================
   QUESTIONS DATA (19 pertanyaan, 3 section)
   ================================================================ */

const SECTION_LABELS: Record<number, string> = {
  1: "Data Diri & Ekonomi",
  2: "Gaya Hidup Harian",
  3: "Dinamika Praktik & Lingkungan Belajar",
};

const SECTION_ICONS: Record<number, React.ReactNode> = {
  1: <FiUser size={14} />,
  2: <FiClock size={14} />,
  3: <FiTarget size={14} />,
};

const QUESTIONS: Question[] = [
  // ── Section 1: Data Diri & Ekonomi ──
  {
    id: 1,
    section: 1,
    text: "Jenis Kelamin",
    type: "radio",
    options: [
      { label: "Laki-laki", value: "Laki-laki" },
      { label: "Perempuan", value: "Perempuan" },
    ],
  },
  {
    id: 2,
    section: 1,
    text: "Rata-rata Pemasukan Keluarga per Bulan",
    type: "radio",
    options: [
      { label: "Kurang dari Rp.2.000.000", value: "< 2 Juta" },
      { label: "Rp.2.000.000 sampai Rp.5.000.000", value: "2 - 5 Juta" },
      { label: "Rp.5.000.000 sampai Rp.10.000.000", value: "5 - 10 Juta" },
      { label: "Lebih dari Rp.10.000.000", value: "> 10 Juta" },
    ],
  },
  {
    id: 3,
    section: 1,
    text: "Apakah kamu saat ini memiliki Pekerjaan Sampingan?",
    type: "radio",
    options: [
      { label: "Ya", value: "Ya" },
      { label: "Tidak", value: "Tidak" },
    ],
  },
  {
    id: 4,
    section: 1,
    text: "Pendidikan terakhir orang tua (yang paling tinggi)",
    type: "radio",
    options: [
      { label: "SD", value: "SD" },
      { label: "SMP", value: "SMP" },
      { label: "SMA/SMK", value: "SMA/SMK" },
      { label: "Diploma", value: "Diploma" },
      { label: "Sarjana", value: "Sarjana" },
    ],
  },

  // ── Section 2: Gaya Hidup Harian ──
  {
    id: 5,
    section: 2,
    text: "Berapa jam rata-rata waktu yang kamu habiskan untuk belajar materi sekolah/praktik di luar jam sekolah?",
    type: "number",
    numberConfig: { min: 0, max: 12, step: 0.5, unit: "jam" },
    helperText: "Masukkan angka antara 0 sampai 12 jam",
  },
  {
    id: 6,
    section: 2,
    text: "Jam Tidur per Malam",
    type: "number",
    numberConfig: { min: 0, max: 12, step: 0.5, unit: "jam" },
    helperText: "Masukkan angka antara 0 sampai 12 jam",
  },
  {
    id: 7,
    section: 2,
    text: "Berapa jam rata-rata waktu yang kamu habiskan sehari untuk bermain HP di luar keperluan sekolah?",
    type: "number",
    numberConfig: { min: 0, max: 12, step: 0.5, unit: "jam" },
    helperText: "Masukkan angka antara 0 sampai 12 jam",
  },
  {
    id: 8,
    section: 2,
    text: "Bagaimana catatan kehadiranmu di sekolah semester ini?",
    type: "radio",
    options: [
      { label: "Hampir selalu hadir (95–100%)", value: "98" },
      { label: "Cukup sering hadir (80–95%)", value: "90" },
      { label: "Kadang absen (60–80%)", value: "70" },
      { label: "Sering bolos (di bawah 60%)", value: "45" },
    ],
  },

  // ── Section 3: Dinamika Praktik & Lingkungan Belajar ──
  {
    id: 9,
    section: 3,
    text: "Saat sedang praktik, kamu menghadapi masalah aneh yang belum pernah diajarkan. Apa insting pertamamu?",
    type: "radio",
    options: [
      {
        label: "Segera melepaskan alat dan lapor ke pembimbing",
        value: "30",
      },
      {
        label: "Perhatikan error, cari di Google/YouTube",
        value: "50",
      },
      {
        label: "Langsung restart/cabut pasang kabel",
        value: "10",
      },
    ],
  },
  {
    id: 10,
    section: 3,
    text: "Supervisor memintamu memakai alat/aplikasi brand baru yang belum diajarkan. Sikap kerjamu?",
    type: "radio",
    options: [
      {
        label: "Cari tutorial di YouTube secara otodidak",
        value: "50",
      },
      {
        label: "Minta izin tetap pakai alat yang sudah dikenal",
        value: "10",
      },
      {
        label: "Minta pembimbing contohkan langkah demi langkah",
        value: "30",
      },
    ],
  },
  {
    id: 11,
    section: 3,
    text: "Seberapa yakin kamu dengan kemampuan keahlian praktikmu saat ini?",
    type: "radio",
    options: [
      {
        label: "Saya sangat menguasai, siap terima project",
        value: "Tinggi",
      },
      {
        label:
          "Bisa mandiri untuk tugas standar, tapi kesulitan jika error",
        value: "Menengah",
      },
      {
        label: "Masih sering bingung, bergantung instruksi guru/teman",
        value: "Rendah",
      },
    ],
  },
  {
    id: 12,
    section: 3,
    text: "Kamu harus menyelesaikan tugas yang butuh konsentrasi penuh. Bagaimana kamu memilih tempat bekerja?",
    type: "radio",
    options: [
      {
        label: "Ruang keluarga/TV, ada sedikit keramaian",
        value: "30",
      },
      {
        label: "Meja khusus, singkirkan barang lain",
        value: "50",
      },
      {
        label: "Kasur/sofa empuk",
        value: "10",
      },
    ],
  },
  {
    id: 13,
    section: 3,
    text: "Saat duduk mengerjakan tugas sulit, di mana posisi HP-mu?",
    type: "radio",
    options: [
      {
        label: "Di sebelah laptop, layar menghadap atas",
        value: "10",
      },
      {
        label: "Di laci/tas, jauh dari jangkauan",
        value: "50",
      },
      {
        label: "Di atas meja, dibalik, mode senyap",
        value: "30",
      },
    ],
  },
  {
    id: 14,
    section: 3,
    text: "Kamu ada ujian teori besok, tapi dapat ide proyek praktik yang sangat seru. Apa yang kamu lakukan?",
    type: "radio",
    options: [
      {
        label: "Eksekusi ide sekarang, ujian nanti malam",
        value: "10",
      },
      {
        label: "Paksa belajar teori, abaikan ide",
        value: "30",
      },
      {
        label: "Catat ide, lalu fokus belajar ujian",
        value: "50",
      },
    ],
  },
  {
    id: 15,
    section: 3,
    text: "Saat fokus belajar di rumah, grup WhatsApp tiba-tiba ramai. Responmu?",
    type: "radio",
    options: [
      {
        label: "Baca obrolan sambil tetap mengetik",
        value: "10",
      },
      {
        label: "Ikut membalas sebentar untuk refreshing",
        value: "30",
      },
      {
        label: "Tidak tahu karena HP dijauhkan/Do Not Disturb",
        value: "50",
      },
    ],
  },
  {
    id: 16,
    section: 3,
    text: "Saat jenuh dengan tugas menumpuk, pikiran apa yang paling ampuh membuatmu kembali semangat?",
    type: "radio",
    options: [
      {
        label: "Takut urusan makin panjang dengan guru",
        value: "20",
      },
      {
        label: "Target kebebasan finansial/masa depan",
        value: "60",
      },
      {
        label: "Sensasi puas saat berhasil memecahkan masalah sulit",
        value: "100",
      },
    ],
  },
  {
    id: 17,
    section: 3,
    text: "Fisik sudah lelah, lalu guru memberi instruksi praktik rumit sebelum pulang. Refleksmu?",
    type: "radio",
    options: [
      {
        label: "Cari alasan keluar/toilet",
        value: "35",
      },
      {
        label: "Langsung kerjakan pelan-pelan",
        value: "10",
      },
      {
        label: "Panik, kerjakan asal-asalan",
        value: "20",
      },
    ],
  },
  {
    id: 18,
    section: 3,
    text: "Guru mengkritik tajam hasil praktikmu. Pikiranmu?",
    type: "radio",
    options: [
      {
        label: "Mengiyakan saja, tidak dipikir dalam",
        value: "20",
      },
      {
        label: "Terima sebagai simulasi tekanan kerja",
        value: "10",
      },
      {
        label: "Merasa omelan berlebihan",
        value: "35",
      },
    ],
  },
  {
    id: 19,
    section: 3,
    text: "Saat ujian praktik, teman-teman selesai duluan, kamu masih stuck. Suara batinmu?",
    type: "radio",
    options: [
      {
        label: '"Alatku yang jelek, bukan salahku"',
        value: "15",
      },
      {
        label: '"Aku memang gak berbakat"',
        value: "30",
      },
      {
        label: '"Aku lirik cara mereka untuk belajar"',
        value: "5",
      },
    ],
  },
];

const TOTAL_QUESTIONS = QUESTIONS.length; // 19

/* ================================================================
   CONVERSION LOGIC (answers → 14 predictors)
   ================================================================ */

function convertToPayload(answers: Record<number, string | number>) {
  const num = (id: number) => Number(answers[id] ?? 0);
  const str = (id: number) => String(answers[id] ?? "");

  // Industry readiness: Q9 + Q10, > 50 → "Siap"
  const industrySum = num(9) + num(10);
  const industry_readiness = industrySum > 50 ? "Siap" : "Belum Siap";

  // Study environment: Q12 + Q13
  const envSum = num(12) + num(13);
  const study_environment =
    envSum <= 40
      ? "Kurang Kondusif"
      : envSum <= 70
        ? "Cukup Kondusif"
        : "Kondusif";

  // Time management: Q14 + Q15
  const skor_time_management = num(14) + num(15);

  // Motivasi: Q16
  const motivasi_akademik = num(16);

  // Stress: Q17 + Q18 + Q19
  const stressSum = num(17) + num(18) + num(19);
  const stress_level =
    stressSum <= 45 ? "Rendah" : stressSum <= 70 ? "Sedang" : "Berat";

  return {
    gender: str(1),
    rata_rata_pemasukan_keluarga: str(2),
    kerja_sampingan: str(3),
    pendidikan_terakhir_orang_tua: str(4),
    jam_belajar_per_hari: num(5),
    jam_tidur: num(6),
    screen_time: num(7),
    presentase_kehadiran: num(8),
    industry_readiness,
    kompetensi_skill_level: str(11),
    study_environment,
    skor_time_management,
    motivasi_akademik,
    stress_level,
    // Fields not filled by student — backend handles from DB
    nilai_rata_rata_raport: null,

  };
}

/* ================================================================
   CONSISTENCY VALIDATION
   ================================================================ */

function checkConsistency(
  answers: Record<number, string | number>,
): string | null {
  const jamBelajar = Number(answers[5] ?? 0);
  const screenTime = Number(answers[7] ?? 0);
  const motivasi = Number(answers[16] ?? 0);
  const kehadiran = Number(answers[8] ?? 0);

  const stressSum =
    Number(answers[17] ?? 0) +
    Number(answers[18] ?? 0) +
    Number(answers[19] ?? 0);

  const warnings: string[] = [];

  if (motivasi >= 60 && jamBelajar === 0) {
    warnings.push(
      "Motivasimu tinggi, tapi jam belajar di luar sekolah 0 jam.",
    );
  }
  if (screenTime >= 10 && jamBelajar === 0) {
    warnings.push(
      "Screen time-mu sangat tinggi (≥10 jam), tapi jam belajar 0 jam.",
    );
  }
  if (kehadiran >= 95 && stressSum > 70) {
    warnings.push(
      "Kehadiranmu hampir selalu penuh, tapi tingkat stresmu terdeteksi sangat tinggi.",
    );
  }

  return warnings.length > 0 ? warnings.join(" ") : null;
}

/* ================================================================
   SUMMARY DISPLAY TEXT (human-readable, no raw scores)
   ================================================================ */

function getAnswerDisplayText(q: Question, answer: string | number): string {
  if (q.type === "number") {
    return `${answer} ${q.numberConfig?.unit ?? ""}`.trim();
  }
  // For radio, find label
  const option = q.options?.find((o) => o.value === String(answer));
  return option?.label ?? String(answer);
}

/* ================================================================
   HELPERS
   ================================================================ */

function getRiskConfig(status?: RiskStatus) {
  switch (status) {
    case "Sangat Aman":
      return {
        badge: "bg-green-light-7 text-green ring-1 ring-green/20",
        bar: "bg-green",
        dot: "bg-green",
      };
    case "Aman":
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

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export default function UpdateDataPage() {
  // Questionnaire state
  const [currentStep, setCurrentStep] = useState(0); // 0..18
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [locked, setLocked] = useState<Set<number>>(new Set());
  const [showSummary, setShowSummary] = useState(false);
  const [numberInput, setNumberInput] = useState<string>("");

  // Warning modal
  const [warningText, setWarningText] = useState<string | null>(null);

  // Prediction state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);

  const currentQuestion = QUESTIONS[currentStep];
  const currentSection = currentQuestion?.section ?? 1;
  const isAnswered = currentQuestion
    ? currentQuestion.type === "number"
      ? numberInput !== "" && !isNaN(parseFloat(numberInput))
      : answers[currentQuestion.id] !== undefined
    : false;
  const isLocked = currentQuestion ? locked.has(currentQuestion.id) : false;
  const progressPercent = ((currentStep + 1) / TOTAL_QUESTIONS) * 100;

  const topInsights = useMemo(
    () => sortInsights(result?.shap_analysis ?? []).slice(0, 5),
    [result],
  );
  const riskConfig = getRiskConfig(result?.risk_status);

  // ── Answer handlers ──
  const handleRadioSelect = useCallback(
    (questionId: number, value: string) => {
      if (locked.has(questionId)) return;
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    [locked],
  );

  // ── Navigation ──
  const goNext = useCallback(() => {
    if (!currentQuestion) return;

    // For number questions, save numberInput into answers before locking
    let updatedAnswers = { ...answers };
    if (currentQuestion.type === "number") {
      const val = parseFloat(numberInput);
      if (isNaN(val)) return;
      const cfg = currentQuestion.numberConfig;
      const clamped = Math.max(cfg?.min ?? 0, Math.min(cfg?.max ?? 12, val));
      updatedAnswers[currentQuestion.id] = clamped;
      setAnswers(updatedAnswers);
    }

    // Lock the current question
    setLocked((prev) => new Set(prev).add(currentQuestion.id));

    if (currentStep < TOTAL_QUESTIONS - 1) {
      const nextQ = QUESTIONS[currentStep + 1];
      if (nextQ.type === "number" && updatedAnswers[nextQ.id] !== undefined) {
        setNumberInput(String(updatedAnswers[nextQ.id]));
      } else {
        setNumberInput("");
      }
      setCurrentStep((s) => s + 1);
    } else {
      // Last question → check consistency
      const warning = checkConsistency(updatedAnswers);
      if (warning) {
        setWarningText(warning);
      } else {
        setShowSummary(true);
      }
    }
  }, [currentStep, currentQuestion, answers, numberInput]);

  const goPrev = useCallback(() => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    if (currentStep > 0) {
      const prevQ = QUESTIONS[currentStep - 1];
      if (prevQ.type === "number" && answers[prevQ.id] !== undefined) {
        setNumberInput(String(answers[prevQ.id]));
      } else {
        setNumberInput("");
      }
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep, showSummary, answers]);

  // Sync numberInput when arriving at a number question
  const syncNumberInput = useCallback(
    (step: number) => {
      const q = QUESTIONS[step];
      if (q.type === "number" && answers[q.id] !== undefined) {
        setNumberInput(String(answers[q.id]));
      } else if (q.type === "number") {
        setNumberInput("");
      }
    },
    [answers],
  );

  // ── Predict ──
  async function handlePredict() {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const payload = convertToPayload(answers);

      const response = await fetch("/api/predict/single", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response
        .json()
        .catch(() => ({}))) as PredictionResponse;

      if (!response.ok) {
        throw new Error(
          data.message ?? `Gagal memproses prediksi (${response.status})`,
        );
      }

      if (!data.student_id) {
        setResult({
          student_id: "-",
          predicted_nilai_raport: data.predicted_nilai_raport ?? 0,
          risk_status: data.risk_status ?? "Beresiko",
          shap_analysis: data.shap_analysis ?? [],
          source: "prediction",
        });
        return;
      }

      // Fetch detailed insight
      const insightResponse = await fetch(
        `/api/predict/insight/${data.student_id}`,
        { credentials: "include" },
      );
      const insightData = (await insightResponse
        .json()
        .catch(() => ({}))) as InsightResponse;

      if (!insightResponse.ok) {
        setResult({
          student_id: data.student_id,
          predicted_nilai_raport: data.predicted_nilai_raport ?? 0,
          risk_status: data.risk_status ?? "Beresiko",
          shap_analysis: data.shap_analysis ?? [],
          source: "prediction",
        });
        return;
      }

      setResult({
        student_id: insightData.student_id,
        student_name: insightData.student_name,
        predicted_nilai_raport: insightData.predicted_nilai_raport,
        risk_status: insightData.risk_status,
        shap_analysis: insightData.shap_analysis ?? [],
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

  // ── Reset ──
  function resetForm() {
    setCurrentStep(0);
    setAnswers({});
    setLocked(new Set());
    setShowSummary(false);
    setNumberInput("");
    setWarningText(null);
    setResult(null);
    setError(null);
  }

  // ── Group questions by section for summary ──
  const groupedBySection = useMemo(() => {
    const groups: Record<number, Question[]> = { 1: [], 2: [], 3: [] };
    QUESTIONS.forEach((q) => groups[q.section].push(q));
    return groups;
  }, []);

  /* ================================================================
     RENDER
     ================================================================ */

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
            Kuesioner Gaya Hidup & Belajar
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
            Jawab 19 pertanyaan singkat tentang kebiasaan sehari-hari,
            lingkungan belajar, dan cara kamu menghadapi tantangan praktik.
            Hasilnya akan digunakan untuk memprediksi performa akademikmu.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "19 Pertanyaan",
              "3 Bagian",
              "Prediksi Otomatis",
              "Insight SHAP",
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
        {/* ── Left: Questionnaire ── */}
        <section className="rounded-2xl border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          {/* Progress Bar */}
          <div className="border-b border-stroke p-6 dark:border-dark-3 md:p-8">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {SECTION_ICONS[currentSection]}
                </span>
                <div>
                  <p className="text-sm font-bold text-dark dark:text-white">
                    {showSummary
                      ? "Ringkasan Jawaban"
                      : `Pertanyaan ${currentStep + 1} dari ${TOTAL_QUESTIONS}`}
                  </p>
                  <p className="text-xs text-dark-5 dark:text-dark-6">
                    {showSummary
                      ? "Periksa jawaban sebelum mengirim"
                      : `Bagian ${currentSection} — ${SECTION_LABELS[currentSection]}`}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {showSummary
                  ? "100%"
                  : `${Math.round(progressPercent)}%`}
              </span>
            </div>

            {/* Bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-2 dark:bg-dark-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-blue-dark transition-all duration-500 ease-out"
                style={{
                  width: showSummary ? "100%" : `${progressPercent}%`,
                }}
              />
            </div>

            {/* Section dots */}
            <div className="mt-3 flex gap-1.5">
              {QUESTIONS.map((q, i) => {
                const isDone = locked.has(q.id);
                const isCurrent = i === currentStep && !showSummary;
                return (
                  <div
                    key={q.id}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${isDone
                        ? "bg-primary"
                        : isCurrent
                          ? "bg-primary/40"
                          : "bg-gray-3 dark:bg-dark-3"
                      }`}
                  />
                );
              })}
            </div>
          </div>

          {/* ── Question Card / Summary ── */}
          <div className="p-6 md:p-8">
            {showSummary ? (
              /* ── SUMMARY VIEW ── */
              <div className="space-y-6">
                {([1, 2, 3] as const).map((sectionNum) => (
                  <div key={sectionNum}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {SECTION_ICONS[sectionNum]}
                      </span>
                      <h3 className="text-sm font-bold text-dark dark:text-white">
                        {SECTION_LABELS[sectionNum]}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {groupedBySection[sectionNum].map((q) => (
                        <div
                          key={q.id}
                          className="flex items-start gap-3 rounded-xl border border-stroke bg-gray-1 p-3.5 dark:border-dark-3 dark:bg-dark-2"
                        >
                          <FiCheckCircle
                            size={16}
                            className="mt-0.5 shrink-0 text-green"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-dark-5 dark:text-dark-6">
                              {q.text}
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-dark dark:text-white">
                              {answers[q.id] !== undefined
                                ? getAnswerDisplayText(q, answers[q.id])
                                : "—"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    id="btn-predict"
                    onClick={handlePredict}
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-1 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                        <span>Memproses prediksi...</span>
                      </>
                    ) : (
                      <>
                        <FiZap size={16} />
                        <span>Kirim untuk Prediksi</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={goPrev}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-stroke bg-white px-5 py-3.5 text-sm font-semibold text-dark-4 transition hover:border-dark-3 hover:bg-gray-1 dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6 dark:hover:border-dark-2"
                  >
                    <FiChevronLeft size={15} />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="button"
                    id="btn-reset"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-stroke bg-white px-5 py-3.5 text-sm font-semibold text-dark-4 transition hover:border-dark-3 hover:bg-gray-1 dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6 dark:hover:border-dark-2"
                  >
                    <FiRotateCcw size={15} />
                    <span>Mulai Ulang</span>
                  </button>
                </div>
              </div>
            ) : currentQuestion ? (
              /* ── QUESTION CARD ── */
              <div
                key={currentQuestion.id}
                className="animate-in fade-in slide-in-from-right-4 duration-300"
              >
                {/* Question header */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {currentQuestion.id}
                    </span>
                    <span className="rounded-full bg-gray-2 px-2.5 py-0.5 text-xs font-medium text-dark-5 dark:bg-dark-3 dark:text-dark-6">
                      Bagian {currentSection}
                    </span>
                    {isLocked && (
                      <span className="flex items-center gap-1 rounded-full bg-green-light-7 px-2.5 py-0.5 text-xs font-semibold text-green">
                        <FiLock size={12} />
                        Terkunci
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold leading-snug text-dark dark:text-white md:text-xl">
                    {currentQuestion.text}
                  </h2>
                  {currentQuestion.helperText && (
                    <p className="mt-1.5 text-sm text-dark-5 dark:text-dark-6">
                      {currentQuestion.helperText}
                    </p>
                  )}
                </div>

                {/* ── Radio options ── */}
                {currentQuestion.type === "radio" &&
                  currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((opt, i) => {
                        const isSelected =
                          String(answers[currentQuestion.id]) === opt.value;
                        const optionLetter = String.fromCharCode(65 + i); // A, B, C...

                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={isLocked}
                            onClick={() =>
                              handleRadioSelect(currentQuestion.id, opt.value)
                            }
                            className={`group flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 ${isSelected
                                ? "border-primary bg-primary/5 shadow-sm dark:bg-primary/10"
                                : isLocked
                                  ? "cursor-not-allowed border-stroke bg-gray-1 opacity-50 dark:border-dark-3 dark:bg-dark-2"
                                  : "border-stroke bg-white hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-sm dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary/40"
                              }`}
                          >
                            {/* Letter circle */}
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${isSelected
                                  ? "bg-primary text-white shadow-sm"
                                  : "bg-gray-2 text-dark-5 group-hover:bg-primary/10 group-hover:text-primary dark:bg-dark-3 dark:text-dark-6"
                                }`}
                            >
                              {isSelected ? (
                                <FiCheckCircle size={16} />
                              ) : (
                                optionLetter
                              )}
                            </span>

                            {/* Label */}
                            <span
                              className={`flex-1 text-sm leading-relaxed ${isSelected
                                  ? "font-semibold text-dark dark:text-white"
                                  : "text-dark-4 group-hover:text-dark dark:text-dark-6 dark:group-hover:text-white"
                                }`}
                            >
                              {opt.label}
                            </span>

                            {isLocked && isSelected && (
                              <FiLock
                                size={14}
                                className="shrink-0 text-primary/60"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                {/* ── Number input ── */}
                {currentQuestion.type === "number" && (
                  <div className="space-y-4">
                    <div
                      className={`rounded-xl border-2 p-5 transition-all ${isLocked
                          ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                          : "border-stroke bg-gray-1 dark:border-dark-3 dark:bg-dark-2"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={currentQuestion.numberConfig?.min ?? 0}
                          max={currentQuestion.numberConfig?.max ?? 12}
                          step={currentQuestion.numberConfig?.step ?? 0.5}
                          value={
                            isLocked
                              ? String(answers[currentQuestion.id] ?? "")
                              : numberInput
                          }
                          onChange={(e) => setNumberInput(e.target.value)}
                          disabled={isLocked}
                          placeholder="0"
                          className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-center text-2xl font-bold text-dark transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-70 dark:border-dark-3 dark:bg-dark-3 dark:text-white dark:focus:border-primary"
                        />
                        {currentQuestion.numberConfig?.unit && (
                          <span className="text-sm font-semibold text-dark-5 dark:text-dark-6">
                            {currentQuestion.numberConfig.unit}
                          </span>
                        )}
                      </div>

                      {/* Quick select buttons */}
                      {!isLocked && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Array.from(
                            {
                              length:
                                (currentQuestion.numberConfig?.max ?? 12) + 1,
                            },
                            (_, i) => i,
                          )
                            .filter((v) => v % 2 === 0 || v <= 4)
                            .map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setNumberInput(String(val))}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${numberInput === String(val)
                                    ? "bg-primary text-white"
                                    : "bg-white text-dark-5 hover:bg-primary/10 hover:text-primary dark:bg-dark-3 dark:text-dark-6"
                                  }`}
                              >
                                {val}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {isLocked && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-green">
                        <FiLock size={16} />
                        <span>
                          Terkunci: {answers[currentQuestion.id]}{" "}
                          {currentQuestion.numberConfig?.unit ?? ""}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Navigation buttons ── */}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={currentStep === 0}
                    className={`inline-flex items-center gap-2 rounded-xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-dark-4 transition hover:border-dark-3 hover:bg-gray-1 dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6 ${currentStep === 0
                        ? "invisible"
                        : ""
                      }`}
                  >
                    <FiChevronLeft size={15} />
                    Sebelumnya
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!isAnswered}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-1 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {currentStep === TOTAL_QUESTIONS - 1 ? (
                      <>
                        <span>Lihat Ringkasan</span>
                        <FiCheckCircle size={15} />
                      </>
                    ) : (
                      <>
                        <span>Lanjut</span>
                        <FiChevronRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

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
                    Menghubungkan ke backend
                  </p>
                  <p className="text-sm text-dark-4 dark:text-dark-6">
                    Jawaban kamu sedang dikonversi dan diproses oleh model
                    prediksi.
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
                      Prediksi Nilai Rata-rata Raport
                    </p>
                    <div className="mt-2 flex flex-wrap items-end gap-3">
                      <span className="text-4xl font-bold tracking-tight text-white">
                        {result.predicted_nilai_raport.toFixed(2)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${riskConfig.badge}`}
                      >
                        {formatRiskStatus(result.risk_status)}
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
                    Jawab semua pertanyaan dan kirim kuesioner untuk melihat
                    hasil prediksi.
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
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${insight.impact_value >= 0
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
                          className={`shrink-0 text-xs font-bold ${insight.impact_value >= 0
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
                Catatan
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-dark-4 dark:text-dark-6">
              Jawaban kamu akan dikonversi secara otomatis menjadi data yang
              dibutuhkan oleh model prediksi. Kamu tidak perlu mengisi angka
              atau skor secara manual — cukup jawab pertanyaan dengan jujur.
            </p>
          </div>
        </aside>
      </div>

      {/* ── Warning Modal ── */}
      {warningText && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in-95 mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-dark">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-light-4 text-yellow-dark">
                <FiAlertTriangle size={20} />
              </span>
              <h3 className="text-lg font-bold text-dark dark:text-white">
                Jawaban Tidak Konsisten
              </h3>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-dark-4 dark:text-dark-6">
              {warningText}{" "}
              <strong>Yakin ingin melanjutkan?</strong>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setWarningText(null);
                  setShowSummary(true);
                }}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Lanjutkan Saja
              </button>
              <button
                type="button"
                onClick={() => setWarningText(null)}
                className="flex-1 rounded-xl border border-stroke bg-white px-4 py-2.5 text-sm font-semibold text-dark-4 transition hover:bg-gray-1 dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6"
              >
                Kembali & Periksa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
