"use client";

import { useState } from "react";

type Props = {
  studentId: string;
  format: "pdf" | "excel";
  label: string;
  className: string;
};

export default function DownloadButton({
  studentId,
  format,
  label,
  className,
}: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(
        `/api/export/${format}?student_id=${encodeURIComponent(studentId)}`,
        {
          // cookie will be automatically included for same-origin requests in Next/Browser
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        alert(error?.message || "Gagal mengunduh");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download =
        format === "pdf"
          ? `laporan-${studentId}.pdf`
          : `laporan-${studentId}.xlsx`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Terjadi kesalahan saat mengunduh.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={className}
    >
      {downloading ? "Mengunduh..." : label}
    </button>
  );
}
