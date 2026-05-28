import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SiswaInsightPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/siswa/insight");
  }

  if (session.user.role !== "siswa") {
    redirect(getRoleHomePath(session.user.role));
  }

  return (
    <div className="mx-auto w-full max-w-270 space-y-6">
      <Breadcrumb pageName="Hasil & Insight Prediksi" />

      <div className="bg-white p-6 rounded-md shadow-sm">
        <h1 className="text-heading-4 mb-2 font-bold text-dark dark:text-white">Hasil & Insight Prediksi</h1>

        <p className="text-sm text-dark-4 mb-4">
          Halaman ini menampilkan hasil prediksi dan terjemahan SHAP untuk siswa.
          Endpoint: GET /api/predict/insight/[student_id]
        </p>

        <div className="h-48 flex items-center justify-center rounded-md border border-dashed border-gray-200 text-dark-4">
          Placeholder: prediction result & SHAP chart
        </div>
      </div>
    </div>
  );
}
