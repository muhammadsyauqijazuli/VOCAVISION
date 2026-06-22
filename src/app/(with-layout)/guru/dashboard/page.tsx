import { auth } from "@/lib/auth";
import { backendUrl, getRoleHomePath } from "@/lib/auth/backend-auth";
import type { DashboardStatsResponse } from "@/types/analytics";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TeacherDashboard } from "./_components/teacher-dashboard";

type DashboardStudentRow = {
  id: string;
  nama: string;
  nisn: string;
  predicted_score: number | null;
  risk_status: "Rendah" | "Netral" | "Tinggi" | null;
};

type StudentsResponse = {
  items?: DashboardStudentRow[];
};

async function fetchDashboardStats(
  token: string,
): Promise<DashboardStatsResponse> {
  const response = await fetch(backendUrl("/dashboard/stats"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {};
  }

  return (await response.json()) as DashboardStatsResponse;
}

async function fetchStudents(token: string): Promise<DashboardStudentRow[]> {
  const response = await fetch(backendUrl("/students?page_size=200"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as StudentsResponse;
  return payload.items ?? [];
}

export default async function GuruDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/guru/dashboard");
  }

  if (session.user.role !== "guru") {
    redirect(getRoleHomePath(session.user.role));
  }

  const token = session.session?.token;
  const [stats, students] = token
    ? await Promise.all([fetchDashboardStats(token), fetchStudents(token)])
    : [{}, [] as DashboardStudentRow[]];

  const alertRows = students
    .filter((student) => student.risk_status === "Rendah")
    .sort(
      (left, right) =>
        (left.predicted_score ?? 999) - (right.predicted_score ?? 999),
    )
    .slice(0, 5)
    .map((student) => ({
      studentId: student.id,
      name: student.nama,
      className: "Belum tersedia",
      score: student.predicted_score ?? 0,
      status: student.risk_status ?? "Rendah",
    }));

  const fallbackAlertRows =
    alertRows.length > 0
      ? alertRows
      : (stats.top_risky_students ?? [])
          .filter((student) => student.risk_status === "Rendah")
          .slice(0, 5)
          .map((student) => ({
            studentId: student.student_id,
            name: student.nama,
            className: "Belum tersedia",
            score: student.predicted_nilai_raport ?? 0,
            status: student.risk_status,
          }));

  return (
    <TeacherDashboard
      teacherName={session.user.name ?? "Guru"}
      stats={stats}
      lastUpdatedLabel={new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date())}
      alertRows={fallbackAlertRows}
    />
  );
}
