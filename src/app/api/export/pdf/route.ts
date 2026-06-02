import { NextResponse } from "next/server";
import { backendUrl, getCookieValue, AUTH_COOKIE_NAME } from "@/lib/auth/backend-auth";

const BACKEND_TIMEOUT_MS = 60_000;

function copyResponseHeaders(response: Response) {
  const headers = new Headers();
  const allowedHeaders = new Set([
    "content-type",
    "content-disposition",
    "content-length",
    "cache-control",
    "etag",
    "last-modified",
  ]);

  response.headers.forEach((value, key) => {
    if (allowedHeaders.has(key.toLowerCase()) || key.toLowerCase().startsWith("x-")) {
      headers.set(key, value);
    }
  });

  return headers;
}

function studentFileName(studentId: string | null) {
  return studentId ? `laporan-siswa-${studentId}.pdf` : "laporan-analytics-guru.pdf";
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const token = getCookieValue(cookieHeader, AUTH_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    const incoming = new URL(request.url);
    const qs = incoming.search;
    const studentId = incoming.searchParams.get("student_id");
    const resp = await fetch(backendUrl(`/export/pdf${qs}`), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    });

    const headers = copyResponseHeaders(resp);
    headers.set(
      "content-disposition",
      `attachment; filename="${studentFileName(studentId)}"`
    );

    // Always buffer response to avoid 0KB / incomplete downloads
    const arrayBuffer = await resp.arrayBuffer();
    console.log(
      "[export/pdf proxy] backend status=",
      resp.status,
      "bytes=",
      arrayBuffer.byteLength,
      "content-type=",
      resp.headers.get("content-type")
    );

    // keep content-length if backend provided it
    if (resp.headers.get("content-length")) {
      headers.set("content-length", resp.headers.get("content-length") as string);
    }

    return new Response(arrayBuffer, { status: resp.status, headers });
  } catch (e) {
    if (controller.signal.aborted) {
      return NextResponse.json({ message: "Backend timeout" }, { status: 504 });
    }

    return NextResponse.json({ message: "Backend tidak merespons" }, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }
}
