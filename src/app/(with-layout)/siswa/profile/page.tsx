import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SiswaProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/siswa/profile");
  }

  if (session.user.role !== "siswa") {
    redirect(getRoleHomePath(session.user.role));
  }

  return (
    <div className="mx-auto w-full max-w-270 space-y-6">
      <Breadcrumb pageName="Profil Pribadi" />

      <div className="bg-white p-6 rounded-md shadow-sm">
        <h1 className="text-heading-4 mb-2 font-bold text-dark dark:text-white">Profil Pribadi</h1>

        <p className="text-sm text-dark-4 mb-4">
          Halaman profil menampilkan data pribadi siswa. Endpoint: GET /api/users/me
        </p>

        <div className="h-48 flex items-center justify-center rounded-md border border-dashed border-gray-200 text-dark-4">
          Placeholder: student profile card
        </div>
      </div>
    </div>
  );
}
