"use client";

import { Alert } from "@/components/ui-elements/alert";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type PreviewRow = string[];

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
  const [status, setStatus] = useState<{ type: "success" | "warning" | "error"; title: string; description: string } | null>(null);

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

    setPreviewRows([[
      "Preview untuk XLSX tidak ditampilkan di browser ini.",
      "File tetap bisa diupload ke backend.",
    ]]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      toast.error("Pilih file CSV atau Excel terlebih dahulu");
      return;
    }

    setIsUploading(true);
    setStatus(null);

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

      setStatus({
        type: "success",
        title: "Upload berhasil",
        description: payload.message || `File ${file.name} berhasil diproses oleh backend.`,
      });
      toast.success("Dataset berhasil diupload");
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
              Upload file CSV atau Excel yang berisi data siswa. Preview akan muncul untuk CSV.
            </p>
          </div>

          {fileInfo && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="min-w-0 rounded-xl bg-gray-2 p-4 dark:bg-dark-2">
                <p className="text-xs uppercase tracking-wide text-dark-4 dark:text-dark-6">Nama File</p>
                <p className="mt-1 break-all text-sm font-medium text-dark dark:text-white sm:wrap-break-word sm:text-base">
                  {fileInfo.name}
                </p>
              </div>
              <div className="min-w-0 rounded-xl bg-gray-2 p-4 dark:bg-dark-2">
                <p className="text-xs uppercase tracking-wide text-dark-4 dark:text-dark-6">Ukuran</p>
                <p className="mt-1 wrap-break-word text-sm font-medium text-dark dark:text-white sm:text-base">
                  {fileInfo.size}
                </p>
              </div>
              <div className="min-w-0 rounded-xl bg-gray-2 p-4 dark:bg-dark-2">
                <p className="text-xs uppercase tracking-wide text-dark-4 dark:text-dark-6">Tipe</p>
                <p className="mt-1 wrap-break-word text-sm font-medium text-dark dark:text-white sm:text-base">
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
              {isUploading ? "Uploading..." : "Upload Dataset"}
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
              variant={status.type === "success" ? "success" : status.type === "warning" ? "warning" : "error"}
              title={status.title}
              description={status.description}
              className="shadow-none"
            />
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
                    <tr key={`${row.join("-")}-${rowIndex}`} className="hover:bg-gray-1 dark:hover:bg-dark-2/60">
                      {row.map((cell, cellIndex) => (
                        <td key={`${cell}-${cellIndex}`} className="px-4 py-3 text-sm text-dark dark:text-white">
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
              <p className="font-medium text-dark dark:text-white">Belum ada file dipilih</p>
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
