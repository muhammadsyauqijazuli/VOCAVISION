import { NextResponse } from "next/server";
import {
  backendUrl,
  getCookieValue,
  AUTH_COOKIE_NAME,
} from "@/lib/auth/backend-auth";

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
  params: Promise<{ id: string }>;
};

async function forward(request: Request, context: RouteContext) {
  const cookieHeader = request.headers.get("cookie");
  const token = getCookieValue(cookieHeader, AUTH_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const { id } = await context.params;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    const response = await fetch(backendUrl(`/predict/insight/${id}`), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = await readBackendPayload(response);
    return NextResponse.json(payload, { status: response.status });
  } catch (err) {
    if (controller.signal.aborted) {
      return NextResponse.json({ message: "Backend timeout" }, { status: 504 });
    }

    return NextResponse.json(
      { message: "Backend tidak merespons" },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(request: Request, context: RouteContext) {
  return forward(request, context);
}
