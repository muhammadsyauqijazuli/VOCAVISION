import {
  AUTH_COOKIE_NAME,
  backendUrl,
  getCookieValue,
} from "@/lib/auth/backend-auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = getCookieValue(request.headers.get("cookie"), AUTH_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  // Pass through pagination params but default to a smaller page size
  const url = new URL(request.url);
  const params = url.searchParams;
  const page = params.get("page") ?? "1";
  const page_size = params.get("page_size") ?? "20";

  // Forward request to backend
  const response = await fetch(
    backendUrl(
      `/students?page=${encodeURIComponent(page)}&page_size=${encodeURIComponent(page_size)}${params.has("search") ? `&search=${encodeURIComponent(params.get("search") ?? "")}` : ""}`,
    ),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const payload = await response.json().catch(() => ({}));

  type BackendStudentItem = {
    id: string;
    nama_siswa?: string;
    nama?: string;
    name?: string;
    nisn?: string | null;
    latest_prediction?: {
      predicted_exam_score?: number;
      risk_status?: string;
    };
    predicted_exam_score?: number;
    risk_status?: string;
  };

  // If backend returns a students array, map to a minimal summary payload for the client
  if (Array.isArray(payload.students)) {
    const minimal = payload.students.map((s: BackendStudentItem) => ({
      id: s.id,
      nama: s.nama_siswa ?? s.nama ?? s.name,
      nisn: s.nisn ?? null,
      predicted_score:
        s.latest_prediction?.predicted_exam_score ??
        s.predicted_exam_score ??
        null,
      risk_status: s.latest_prediction?.risk_status ?? s.risk_status ?? null,
    }));

    return NextResponse.json(
      {
        items: minimal,
        total: payload.total ?? payload.count ?? minimal.length,
        page: Number(page),
        page_size: Number(page_size),
      },
      { status: response.status },
    );
  }

  // Fallback to original payload if it doesn't match expected shape
  return NextResponse.json(payload, { status: response.status });
}
