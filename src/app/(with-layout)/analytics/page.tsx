import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ShapChart from "@/components/Charts/Analytics/ShapChart";
import BarComparisonChart from "@/components/Charts/Analytics/BarComparisonChart";
import TrendLineChart from "@/components/Charts/Analytics/TrendLineChart";
import PieDistributionChart from "@/components/Charts/Analytics/PieDistributionChart";

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/analytics");
  }

  // Role guard: only admin and guru can access analytics.
  if (session.user.role === "siswa") {
    redirect(getRoleHomePath(session.user.role));
  }

  return (
    <div className="space-y-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark dark:text-white">
            Analytics & SHAP Insights
          </h1>
          <p className="text-sm text-dark-4 dark:text-dark-6">
            Ringkasan analisis prediksi berbasis data (mock).
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ShapChart />
        </div>
        <div>
          <BarComparisonChart />
        </div>
        <div className="xl:col-span-2">
          <TrendLineChart />
        </div>
        <div>
          <PieDistributionChart />
        </div>
      </section>
    </div>
  );
}
