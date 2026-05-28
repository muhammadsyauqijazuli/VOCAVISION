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
    const resp = await fetch(backendUrl(`/export/pdf${qs}`), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    });

    const headers = copyResponseHeaders(resp);
    if (!headers.has("content-disposition")) {
      headers.set("content-disposition", 'attachment; filename="laporan_prediksi.pdf"');
    }

    if (resp.body) {
      return new Response(resp.body, { status: resp.status, headers });
    }

    const arrayBuffer = await resp.arrayBuffer();
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
