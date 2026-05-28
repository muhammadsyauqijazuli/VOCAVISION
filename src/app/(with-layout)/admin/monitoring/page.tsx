import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminMonitoringPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/admin/monitoring");
  }

  if (session.user.role !== "admin") {
    redirect(getRoleHomePath(session.user.role));
  }

  return (
    <div className="mx-auto w-full max-w-270 space-y-6">
      <Breadcrumb pageName="Monitoring Sistem" />

      <div className="bg-white p-6 rounded-md shadow-sm">
        <h1 className="text-heading-4 mb-2 font-bold text-dark dark:text-white">
          Monitoring Sistem
        </h1>

        <p className="text-sm text-dark-4 mb-4">
          Halaman ini akan menampilkan metrik sistem dan log operasi. Endpoint
          backend yang akan dipanggil: GET /api/dashboard/stats
        </p>

        <div className="h-48 flex items-center justify-center rounded-md border border-dashed border-gray-200 text-dark-4">
          Placeholder: charts & system metrics
        </div>
      </div>
    </div>
  );
}
