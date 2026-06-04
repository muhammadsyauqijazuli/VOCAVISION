"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type InterventionRecord = {
  id: string;
  guru: string;
  guru_id?: string;
  note: string;
  date: string;
};

type InterventionItemProps = {
  item: InterventionRecord;
  currentUserId?: string;
};

export function InterventionItem({ item, currentUserId }: InterventionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(item.note);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isAuthor = currentUserId && item.guru_id === currentUserId;

  async function handleSave() {
    const trimmedNote = note.trim();
    if (!trimmedNote) {
      toast.error("Catatan tidak boleh kosong.");
      return;
    }

    if (trimmedNote === item.note) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/interventions/edit/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: trimmedNote }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || "Gagal menyimpan perubahan");
      }

      toast.success("Catatan berhasil diperbarui.");
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    setNote(item.note);
    setIsEditing(false);
  }

  return (
    <article className="rounded-xl border border-stroke p-4 dark:border-dark-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-dark dark:text-white">
            {item.guru}
          </p>
          <p className="text-xs text-dark-4 dark:text-dark-6">
            {new Date(item.date).toLocaleString("id-ID")}
          </p>
        </div>
        {isAuthor && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3 space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-semibold text-dark hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2 disabled:opacity-60"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-dark-4 dark:text-dark-6 whitespace-pre-wrap">
          {item.note}
        </p>
      )}
    </article>
  );
}
