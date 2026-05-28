import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function GuruStudentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/guru/students");
  }

  if (session.user.role !== "guru") {
    redirect(getRoleHomePath(session.user.role));
  }

  return (
    <div className="mx-auto w-full max-w-270 space-y-6">
      <Breadcrumb pageName="Data Siswa & Kelas" />

      <div className="bg-white p-6 rounded-md shadow-sm">
        <h1 className="text-heading-4 mb-2 font-bold text-dark dark:text-white">Data Siswa & Kelas</h1>

        <p className="text-sm text-dark-4 mb-4">
          Halaman ini akan menampilkan daftar siswa dan kelas yang berada di bawah
          pengawasan guru. Endpoint: GET /api/students
        </p>

        <div className="h-48 flex items-center justify-center rounded-md border border-dashed border-gray-200 text-dark-4">
          Placeholder: table of students
        </div>
      </div>
    </div>
  );
}
