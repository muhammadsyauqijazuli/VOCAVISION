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

  const backendParams = new URLSearchParams();
  backendParams.set("page", page);
  backendParams.set("page_size", page_size);
  if (params.has("search")) backendParams.set("search", params.get("search")!);
  if (params.has("sort_by")) backendParams.set("sort_by", params.get("sort_by")!);
  if (params.has("sort_dir")) backendParams.set("sort_dir", params.get("sort_dir")!);
  if (params.has("risk_status")) backendParams.set("risk_status", params.get("risk_status")!);

  // Forward request to backend
  const response = await fetch(
    backendUrl(`/students?${backendParams.toString()}`),
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
      predicted_nilai_raport?: number;
      risk_status?: string;
    };
    predicted_nilai_raport?: number;
    risk_status?: string;
  };

  // If backend returns a students array, map to a minimal summary payload for the client
  if (Array.isArray(payload.students)) {
    const minimal = payload.students.map((s: BackendStudentItem) => ({
      id: s.id,
      nama: s.nama_siswa ?? s.nama ?? s.name,
      nisn: s.nisn ?? null,
      predicted_score:
        s.latest_prediction?.predicted_nilai_raport ??
        s.predicted_nilai_raport ??
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
