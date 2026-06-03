"use client";

import { Alert } from "@/components/ui-elements/alert";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type PreviewRow = string[];

type DatasetProgressPayload = {
  status?: string;
  phase?: string;
  phase_label?: string;
  row_count?: number;
  current?: number;
  total?: number;
  message?: string;
};

const PROGRESS_STEPS = [
  { key: "queued", label: "Dataset diterima" },
  { key: "creating_accounts", label: "Membuat akun siswa" },
  { key: "predicting", label: "Prediksi siswa" },
  { key: "saving_results", label: "Menyimpan hasil" },
  { key: "completed", label: "Selesai" },
];

function parseCsvPreview(text: string): PreviewRow[] {
  return text
    .trim()
    .split(/\r?\n/)
    .slice(0, 6)
    .map((row) => row.split(",").map((cell) => cell.trim()));
}

export function DatasetUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [processingRows, setProcessingRows] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [progressPhase, setProgressPhase] = useState<string>("idle");
  const [progressLabel, setProgressLabel] = useState<string>("");
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [status, setStatus] = useState<{
    type: "success" | "warning" | "error";
    title: string;
    description: string;
  } | null>(null);

  const fileInfo = useMemo(() => {
    if (!file) {
      return null;
    }

    return {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type || file.name.split(".").pop()?.toUpperCase() || "FILE",
    };
  }, [file]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    setStatus(null);
    setFile(selectedFile);
    setPreviewRows([]);

    if (!selectedFile) {
      return;
    }

    const isCsv = selectedFile.name.toLowerCase().endsWith(".csv");

    if (isCsv) {
      const text = await selectedFile.text();
      setPreviewRows(parseCsvPreview(text));
      return;
    }

    setPreviewRows([
      [
        "Preview untuk XLSX tidak ditampilkan di browser ini.",
        "File tetap bisa diupload ke backend.",
      ],
    ]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      toast.error("Pilih file CSV atau Excel terlebih dahulu");
      return;
    }

    setIsUploading(true);
    setStatus(null);
    setProcessingRows(0);
    setTotalRows(0);
    setProgressPhase("queued");
    setProgressLabel("Dataset diterima");
    setProgressMessage("Menyiapkan proses upload");

    const sleep = (ms: number) =>
      new Promise((resolve) => window.setTimeout(resolve, ms));

    async function pollDatasetStatus(datasetId: string, expectedRows: number) {
      while (true) {
        const response = await fetch(`/api/dataset/${datasetId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const payload = (await response.json()) as DatasetProgressPayload;

        if (!response.ok) {
          throw new Error(
            payload.message || "Gagal membaca status proses dataset",
          );
        }

        const processed = Number(payload.row_count ?? 0);
        const current = Number(payload.current ?? processed);
        const total = Number(payload.total ?? expectedRows);
        setProcessingRows(processed);
        setTotalRows(total);
        setProgressPhase(payload.phase ?? payload.status ?? "processing");
        setProgressLabel(payload.phase_label ?? payload.phase ?? "Memproses");
        setProgressMessage(
          payload.message ?? "Menunggu pembaruan status dari backend",
        );

        if (payload.status === "completed") {
          return payload;
        }

        if (payload.status === "failed") {
          throw new Error("Pemrosesan dataset gagal di backend");
        }

        await sleep(1500);
      }
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/dataset/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Upload gagal");
      }

      const datasetId = (payload as { dataset_id?: string }).dataset_id;
      const expectedRows = Number(
        (payload as { total_rows?: number }).total_rows ?? 0,
      );

      if (!datasetId) {
        throw new Error("Backend tidak mengembalikan dataset_id");
      }

      setStatus({
        type: "warning",
        title: "Dataset diterima",
        description:
          payload.message ||
          "Menunggu backend menyelesaikan pembuatan akun dan prediksi siswa.",
      });

      const finalStatus = await pollDatasetStatus(datasetId, expectedRows);
      const processedRows = Number(
        finalStatus.row_count ?? finalStatus.current ?? expectedRows,
      );

      setStatus({
        type: "success",
        title: "Upload selesai",
        description:
          `${file.name} sudah selesai diproses. ${processedRows}/${expectedRows || processedRows} baris diproses.`.trim(),
      });
      setProgressPhase("completed");
      setProgressLabel("Selesai diproses");
      setProgressMessage("Akun siswa dan prediksi sudah tersimpan.");
      toast.success("Dataset berhasil diproses");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload gagal";

      setStatus({
        type: "error",
        title: "Upload gagal",
        description: message,
      });
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ShowcaseSection title="Upload Dataset" className="p-6!">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-dashed border-stroke bg-gray-1 p-6 transition-all duration-300 ease-out hover:border-primary/40 hover:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary/50 dark:hover:bg-dark-2/80">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-lg border border-stroke bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-white hover:border-primary/40 dark:border-dark-3 dark:bg-dark-3"
            />
            <p className="mt-3 text-sm text-dark-4 dark:text-dark-6">
              Upload file CSV atau Excel yang berisi data siswa. Preview akan
              muncul untuk CSV.
            </p>
          </div>

          {fileInfo && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="min-w-0 rounded-xl bg-gray-2 p-4 dark:bg-dark-2">
                <p className="text-xs tracking-wide text-dark-4 uppercase dark:text-dark-6">
                  Nama File
                </p>
                <p className="mt-1 text-sm font-medium break-all text-dark sm:text-base sm:wrap-break-word dark:text-white">
                  {fileInfo.name}
                </p>
              </div>
              <div className="min-w-0 rounded-xl bg-gray-2 p-4 dark:bg-dark-2">
                <p className="text-xs tracking-wide text-dark-4 uppercase dark:text-dark-6">
                  Ukuran
                </p>
                <p className="mt-1 text-sm font-medium wrap-break-word text-dark sm:text-base dark:text-white">
                  {fileInfo.size}
                </p>
              </div>
              <div className="min-w-0 rounded-xl bg-gray-2 p-4 dark:bg-dark-2">
                <p className="text-xs tracking-wide text-dark-4 uppercase dark:text-dark-6">
                  Tipe
                </p>
                <p className="mt-1 text-sm font-medium wrap-break-word text-dark sm:text-base dark:text-white">
                  {fileInfo.type}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isUploading}
              className="rounded-lg bg-primary px-5 py-3 font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading
                ? totalRows > 0
                  ? `Memproses ${processingRows}/${totalRows}`
                  : "Mengupload dan menunggu proses..."
                : "Upload Dataset"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreviewRows([]);
                setStatus(null);
              }}
              className="rounded-lg border border-stroke px-5 py-3 font-medium text-dark transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-gray-2 hover:shadow-sm active:translate-y-0 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            >
              Reset
            </button>
          </div>

          {status && (
            <Alert
              variant={
                status.type === "success"
                  ? "success"
                  : status.type === "warning"
                    ? "warning"
                    : "error"
              }
              title={status.title}
              description={status.description}
              className="shadow-none"
            />
          )}

          {isUploading && totalRows > 0 && (
            <div className="space-y-2 rounded-xl border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2">
              <div className="flex items-center justify-between text-sm text-dark dark:text-white">
                <span>{progressLabel || "Progress pemrosesan"}</span>
                <span>{Math.round((processingRows / totalRows) * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-2 dark:bg-dark-3">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (processingRows / totalRows) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-sm text-dark-4 dark:text-dark-6">
                {progressMessage}
              </p>

              <div className="grid gap-2 pt-2 sm:grid-cols-2 lg:grid-cols-5">
                {PROGRESS_STEPS.map((step, index) => {
                  const activeIndex = PROGRESS_STEPS.findIndex(
                    (item) => item.key === progressPhase,
                  );
                  const isDone =
                    activeIndex > index || progressPhase === "completed";
                  const isActive = activeIndex === index;

                  return (
                    <div
                      key={step.key}
                      className={`rounded-xl border p-3 text-xs transition-colors ${
                        isDone
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : isActive
                            ? "border-warning/40 bg-warning/10 text-warning"
                            : "border-stroke bg-white text-dark-4 dark:border-dark-3 dark:bg-dark-3 dark:text-dark-6"
                      }`}
                    >
                      <p className="font-medium">
                        {index + 1}. {step.label}
                      </p>
                      <p className="mt-1">
                        {isDone
                          ? "Selesai"
                          : isActive
                            ? "Sedang berjalan"
                            : "Menunggu"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      </ShowcaseSection>

      <ShowcaseSection title="Preview" className="p-6!">
        {previewRows.length ? (
          <div className="overflow-hidden rounded-xl border border-stroke dark:border-dark-3">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stroke dark:divide-dark-3">
                <tbody className="divide-y divide-stroke dark:divide-dark-3">
                  {previewRows.map((row, rowIndex) => (
                    <tr
                      key={`${row.join("-")}-${rowIndex}`}
                      className="hover:bg-gray-1 dark:hover:bg-dark-2/60"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${cell}-${cellIndex}`}
                          className="px-4 py-3 text-sm text-dark dark:text-white"
                        >
                          {cell || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-stroke bg-gray-1 text-center dark:border-dark-3 dark:bg-dark-2">
            <div>
              <p className="font-medium text-dark dark:text-white">
                Belum ada file dipilih
              </p>
              <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
                Preview akan muncul setelah Anda memilih file CSV.
              </p>
            </div>
          </div>
        )}
      </ShowcaseSection>
    </div>
  );
}
