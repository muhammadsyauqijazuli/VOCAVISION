"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiX, FiUser, FiBarChart2 } from "react-icons/fi";
import { RiskBadge } from "@/components/guru/RiskBadge";
import type { RiskStatus } from "@/lib/utils";

type SearchResult = {
  id: string;
  nama: string;
  nisn: string;
  predicted_score: number | null;
  risk_status: RiskStatus | null;
};

type StudentDetailResponse = {
  id: string;
  nama: string;
  nisn: string;
  jam_belajar_per_hari: number | null;
  presentase_kehadiran: number | null;
  skor_time_management: number | null;
  jam_tidur: number | null;
  screen_time: number | null;
  motivasi_akademik: number | null;
  study_environment: string | null;
  stress_level: string | null;
  kompetensi_skill_level: string | null;
  skor_skill_level: number | null;
  industry_readiness: number | null;
};

type InterventionRecommendation = {
  title: string;
  description: string;
};

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsedValue = typeof value === "number" ? value : Number(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function buildRecommendations(student: StudentDetailResponse): InterventionRecommendation[] {
  const recommendations: InterventionRecommendation[] = [];
  const studentName = student.nama;

  const studyHours = toNumber(student.jam_belajar_per_hari);
  if (studyHours !== null && studyHours < 3) {
    recommendations.push({
      title: "Tingkatkan jam belajar harian",
      description: `${studentName} saat ini belajar sekitar ${studyHours.toFixed(1)} jam per hari. Dorong target belajar rutin 3-4 jam per hari dengan jadwal yang konsisten agar pemahaman materi lebih stabil.`,
    });
  }

  const attendance = toNumber(student.presentase_kehadiran);
  if (attendance !== null && attendance < 80) {
    recommendations.push({
      title: "Perbaiki kehadiran kelas",
      description: `Kehadiran ${studentName} berada di ${attendance.toFixed(0)}%. Pantau absensi mingguan dan berikan pengingat agar tidak tertinggal materi penting.`,
    });
  }

  const timeManagement = toNumber(student.skor_time_management);
  if (timeManagement !== null && timeManagement < 70) {
    recommendations.push({
      title: "Latih manajemen waktu",
      description: `Skor time management ${studentName} masih ${timeManagement.toFixed(0)}. Buat jadwal belajar yang lebih terstruktur, target harian, dan evaluasi progres mingguan.`,
    });
  }

  const screenTime = toNumber(student.screen_time);
  if (screenTime !== null && screenTime > 4) {
    recommendations.push({
      title: "Batasi screen time",
      description: `Screen time ${studentName} mencapai ${screenTime.toFixed(1)} jam. Arahkan penggunaan gawai untuk kebutuhan belajar dan batasi distraksi di luar jam belajar.`,
    });
  }

  const sleepHours = toNumber(student.jam_tidur);
  if (sleepHours !== null && sleepHours < 7) {
    recommendations.push({
      title: "Perbaiki pola tidur",
      description: `${studentName} hanya tidur sekitar ${sleepHours.toFixed(1)} jam. Dorong tidur cukup 7-8 jam per malam agar fokus dan daya serap meningkat.`,
    });
  }

  const motivation = toNumber(student.motivasi_akademik);
  if (motivation !== null && motivation < 70) {
    recommendations.push({
      title: "Bangun motivasi akademik",
      description: `Motivasi akademik ${studentName} berada di ${motivation.toFixed(0)}. Gunakan target jangka pendek, umpan balik positif, dan pendampingan belajar yang lebih personal.`,
    });
  }

  if (student.study_environment && student.study_environment.toLowerCase() !== "baik") {
    recommendations.push({
      title: "Benahi lingkungan belajar",
      description: `Study environment ${studentName} masih ${student.study_environment}. Pastikan ruang belajar tenang, pencahayaan cukup, dan minim gangguan saat belajar.`,
    });
  }

  if (student.stress_level && student.stress_level.toLowerCase() !== "rendah") {
    recommendations.push({
      title: "Kelola tingkat stres",
      description: `Tingkat stres ${studentName} terdeteksi ${student.stress_level}. Lakukan monitoring ringan, konseling, atau dukungan emosional secara berkala.`,
    });
  }

  if (student.kompetensi_skill_level && student.kompetensi_skill_level.toLowerCase() !== "tinggi") {
    recommendations.push({
      title: "Tingkatkan skill inti",
      description: `Kompetensi skill level ${studentName} masih ${student.kompetensi_skill_level}. Berikan latihan tambahan, proyek kecil, atau modul penguatan konsep.`,
    });
  }

  const skillScore = toNumber(student.skor_skill_level);
  if (skillScore !== null && skillScore < 80) {
    recommendations.push({
      title: "Optimalkan skor skill",
      description: `Skor skill ${studentName} berada di angka ${skillScore.toFixed(1)}. Ajak siswa untuk berlatih praktik mandiri lebih tekun dan tingkatkan latihan keterampilan kejuruan.`,
    });
  }

  if (student.industry_readiness !== null && student.industry_readiness < 70) {
    recommendations.push({
      title: "Kesiapan Industri Kurang",
      description: `Industry readiness ${studentName} masih di angka ${student.industry_readiness}. Ajak mengikuti pelatihan, simulasi praktik, atau kegiatan berbasis proyek.`,
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      title: "Pertahankan kebiasaan belajar yang baik",
      description: `Variabel ${studentName} saat ini relatif mendukung performa akademik. Fokus pada konsistensi belajar, kehadiran, dan evaluasi rutin untuk menjaga hasil tetap stabil.`,
    });
  }

  return recommendations.slice(0, 5); // Limit to top 5
}

export function StudentSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SearchResult | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetailResponse | null>(null);
  const [recommendations, setRecommendations] = useState<InterventionRecommendation[]>([]);
  const [isShapLoading, setIsShapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      setError(null);
      try {
        const res = await fetch(`/api/students?search=${encodeURIComponent(debouncedQuery)}&page_size=10`);
        const data = await res.json();
        if (res.ok && data.items) {
          setResults(data.items);
        } else {
          setResults([]);
        }
      } catch (err) {
        setError("Gagal mencari data siswa");
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Fetch Student Detail when a student is selected
  useEffect(() => {
    if (!selectedStudent) {
      setStudentDetail(null);
      setRecommendations([]);
      return;
    }

    const fetchDetail = async () => {
      setIsShapLoading(true);
      try {
        const res = await fetch(`/api/students/${selectedStudent.id}`);
        if (res.ok) {
          const data = await res.json();
          setStudentDetail(data);
          setRecommendations(buildRecommendations(data));
        }
      } catch (err) {
        // silently fail
      } finally {
        setIsShapLoading(false);
      }
    };

    fetchDetail();
  }, [selectedStudent]);

  return (
    <section className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-dark dark:text-white">Cari Data Anak Anda</h2>
        <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
          Masukkan nama atau NISN untuk melihat detail status risiko dan analisis faktor prediksi.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <FiSearch className="text-dark-4 dark:text-dark-6" size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ketik nama atau NISN..."
          className="w-full rounded-xl border border-stroke bg-transparent py-3 pl-12 pr-10 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSelectedStudent(null);
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-dark-4 hover:text-primary dark:text-dark-6"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown-like Area */}
      {query.trim() && !selectedStudent && (
        <div className="mb-6 rounded-xl border border-stroke bg-gray-50 p-4 dark:border-dark-3 dark:bg-dark-2">
          {isSearching ? (
            <p className="text-center text-sm text-dark-4 dark:text-dark-6">Mencari...</p>
          ) : error ? (
            <p className="text-center text-sm text-red-500">{error}</p>
          ) : results.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="cursor-pointer rounded-lg border border-stroke bg-white p-4 transition-all hover:border-primary hover:shadow-md dark:border-dark-3 dark:bg-gray-dark dark:hover:border-primary"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FiUser size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-dark dark:text-white">{student.nama}</p>
                      <p className="text-xs text-dark-4 dark:text-dark-6">{student.nisn}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-dark-4 dark:text-dark-6">Skor: {student.predicted_score?.toFixed(2) ?? "-"}</span>
                    <RiskBadge status={student.risk_status} score={student.predicted_score ?? undefined} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-dark-4 dark:text-dark-6">Tidak ditemukan siswa dengan nama/NISN tersebut.</p>
          )}
        </div>
      )}

      {/* Selected Student Detail & SHAP Panel */}
      {selectedStudent && (
        <div className="animate-in fade-in slide-in-from-top-4 mt-6 rounded-2xl border border-stroke bg-gray-50 p-6 dark:border-dark-3 dark:bg-dark-2/60">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-dark dark:text-white">Detail Analisis – {selectedStudent.nama}</h3>
              <p className="text-sm text-dark-4 dark:text-dark-6">NISN: {selectedStudent.nisn}</p>
            </div>
            <button
              onClick={() => setSelectedStudent(null)}
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-dark-4 shadow-sm hover:text-dark dark:bg-gray-dark dark:text-dark-6 dark:hover:text-white"
            >
              <FiX size={16} /> Tutup
            </button>
          </div>

          {isShapLoading ? (
            <div className="flex h-60 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-dark-4 dark:text-dark-6">Memuat detail siswa...</p>
              </div>
            </div>
          ) : studentDetail && recommendations.length > 0 ? (
            <div className="space-y-6">
              {/* Score & Risk Summary */}
              <div className="flex flex-wrap items-center gap-6 rounded-xl bg-white p-5 shadow-sm dark:bg-gray-dark">
                <div>
                  <p className="text-xs font-medium text-dark-4 dark:text-dark-6 uppercase tracking-wide">Skor Prediksi</p>
                  <p className="text-2xl font-bold text-dark dark:text-white">{(selectedStudent.predicted_score ?? 0).toFixed(2)}</p>
                </div>
                <div className="h-10 w-px bg-stroke dark:bg-dark-3" />
                <div>
                  <p className="text-xs font-medium text-dark-4 dark:text-dark-6 uppercase tracking-wide">Status Risiko</p>
                  <div className="mt-1">
                    <RiskBadge status={selectedStudent.risk_status as RiskStatus} />
                  </div>
                </div>
              </div>

              {/* Suggestions using InterventionForm UI style */}
              <div className="border-brand-accent/20 bg-brand-accent/5 dark:border-brand-accent/30 dark:bg-brand-accent/10 mb-5 rounded-2xl border p-5">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                      Rekomendasi
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-dark dark:text-white">
                      Fokus perbaikan performa akademik
                    </h3>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-dark shadow-sm dark:bg-gray-dark dark:text-white">
                    {recommendations.length} poin
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {recommendations.map((item) => (
                    <article
                      key={item.title}
                      className="rounded-xl border border-white/70 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-dark-3 dark:bg-dark-2"
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
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-gray-dark">
              <div className="text-center">
                <FiBarChart2 size={32} className="mx-auto mb-2 text-gray-300 dark:text-dark-4" />
                <p className="text-sm font-medium text-dark-4 dark:text-dark-6">Belum ada analisis data tersedia</p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
