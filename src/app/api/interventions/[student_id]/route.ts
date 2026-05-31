import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, backendUrl, getCookieValue } from "@/lib/auth/backend-auth";

const BACKEND_TIMEOUT_MS = 20_000;

async function readBackendPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }

  const text = await response.text().catch(() => "");
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

type RouteContext = {
  params: Promise<{ student_id: string }>;
};

async function forward(request: Request, context: RouteContext) {
  const cookieHeader = request.headers.get("cookie");
  const token = getCookieValue(cookieHeader, AUTH_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const { student_id } = await context.params;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    const response = await fetch(backendUrl(`/interventions/${student_id}`), {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: request.method === "GET" ? undefined : await request.text(),
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = await readBackendPayload(response);
    return NextResponse.json(payload, { status: response.status });
  } catch {
    if (controller.signal.aborted) {
      return NextResponse.json({ message: "Backend timeout" }, { status: 504 });
    }

    return NextResponse.json({ message: "Backend tidak merespons" }, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return forward(request, context);
}