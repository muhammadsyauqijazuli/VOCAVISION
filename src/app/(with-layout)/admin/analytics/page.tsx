import { auth } from "@/lib/auth";
import { backendUrl, getRoleHomePath } from "@/lib/auth/backend-auth";
import type {
  AnalyticsStudentRecord,
  DashboardStatsResponse,
} from "@/types/analytics";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "./_components/analytics-dashboard";

async function fetchJson<T>(url: string, token: string): Promise<T | null> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

async function fetchManyStudentDetails(
  ids: string[],
  token: string,
  chunkSize = 24,
): Promise<AnalyticsStudentRecord[]> {
  const records: AnalyticsStudentRecord[] = [];

  for (let index = 0; index < ids.length; index += chunkSize) {
    const chunk = ids.slice(index, index + chunkSize);
    const chunkRecords = await Promise.all(
      chunk.map(async (id) => {
        const detail = await fetchJson<AnalyticsStudentRecord>(
          backendUrl(`/students/${id}`),
          token,
        );
        return detail;
      }),
    );

    for (const record of chunkRecords) {
      if (record) {
        records.push(record);
      }
    }
  }

  return records;
}

export default async function AdminAnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/admin/analytics");
  }

  if (session.user.role !== "admin") {
    redirect(getRoleHomePath(session.user.role));
  }

  const token = session.session?.token;
  let stats: DashboardStatsResponse = {};
  let students: AnalyticsStudentRecord[] = [];

  if (token) {
    const [statsPayload, studentsPayload] = await Promise.all([
      fetchJson<DashboardStatsResponse>(backendUrl("/dashboard/stats"), token),
      fetchJson<{ items?: Array<{ id: string }> }>(
        backendUrl("/students?page_size=80"),
        token,
      ),
    ]);

    stats = statsPayload ?? {};
    const studentIds =
      studentsPayload?.items?.map((student) => student.id).filter(Boolean) ??
      [];
    students = studentIds.length
      ? await fetchManyStudentDetails(studentIds, token)
      : [];
  }

  return <AnalyticsDashboard stats={stats} students={students} />;
}
