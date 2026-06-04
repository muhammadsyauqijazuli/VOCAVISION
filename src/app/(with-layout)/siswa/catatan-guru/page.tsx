import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FiMessageSquare, FiUser, FiCalendar, FiInbox } from "react-icons/fi";

type InterventionNote = {
  id: string;
  guru: string;
  note: string;
  date: string;
};

async function getRequestOrigin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("Host header tidak ditemukan");
  }

  return {
    origin: `${protocol}://${host}`,
    cookie: headerList.get("cookie") ?? "",
  };
}

export default async function SiswaCatatanGuruPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/siswa/catatan-guru");
  }

  if (session.user.role !== "siswa") {
    redirect(getRoleHomePath(session.user.role));
  }

  const { origin, cookie } = await getRequestOrigin();

  let notes: InterventionNote[] = [];
  try {
    const response = await fetch(`${origin}/api/interventions/my-notes`, {
      headers: cookie ? { cookie } : undefined,
      cache: "no-store",
    });

    if (response.ok) {
      notes = (await response.json()) as InterventionNote[];
    }
  } catch {
    // If fetch fails, show empty state
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500 ease-out">
      <Breadcrumb pageName="Catatan Guru" />

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-blue-dark p-8 shadow-1 md:p-10">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-white">
            <p className="mb-2 text-xs font-semibold tracking-widest text-white/70 uppercase">
              Catatan dari Guru
            </p>
            <h1 className="mb-2 text-3xl leading-tight font-bold md:text-4xl">
              Catatan & Tindak Lanjut
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-white/85">
              Lihat catatan, rekomendasi, dan tindak lanjut dari guru tentang
              perkembangan belajarmu.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl bg-white/15 px-5 py-3 backdrop-blur-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 text-white">
              <FiMessageSquare size={20} />
            </div>
            <div>
              <p className="text-xs text-white/75">Total Catatan</p>
              <p className="font-semibold text-white">{notes.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Notes List ── */}
      {notes.length > 0 ? (
        <section className="space-y-4">
          {notes.map((note) => (
            <article
              key={note.id}
              className="rounded-2xl border border-stroke bg-white p-5 shadow-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-3 sm:p-6 dark:border-dark-3 dark:bg-gray-dark"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                    <FiUser size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-dark dark:text-white">
                      {note.guru}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-dark-4 dark:text-dark-6">
                      <FiCalendar size={12} />
                      <time dateTime={note.date}>
                        {new Date(note.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        {" · "}
                        {new Date(note.date).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2">
                <p className="text-sm leading-7 whitespace-pre-line text-dark-4 dark:text-dark-6">
                  {note.note}
                </p>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-stroke bg-white p-10 text-center shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-1 dark:bg-dark-2">
            <FiInbox size={28} className="text-dark-4 dark:text-dark-6" />
          </div>
          <h2 className="text-lg font-bold text-dark dark:text-white">
            Belum Ada Catatan
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-dark-4 dark:text-dark-6">
            Guru belum mengirimkan catatan atau rekomendasi untukmu. Catatan akan
            muncul di sini setelah guru menambahkan tindak lanjut.
          </p>
        </section>
      )}
    </div>
  );
}
