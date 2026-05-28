import { backendUrl, getCookieValue, AUTH_COOKIE_NAME } from "@/lib/auth/backend-auth";
import { NextResponse } from "next/server";

async function forwardToBackend(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const token = getCookieValue(cookieHeader, AUTH_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const incomingUrl = new URL(request.url);
  const probe = incomingUrl.searchParams.get("probe");

  if (probe === "1") {
    return NextResponse.json({
      message: "probe-ok",
      hasCookie: Boolean(token),
    });
  }

  const url = new URL(backendUrl("/users/"));
  url.search = incomingUrl.search;

  const response = await fetch(url, {
    method: request.method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: request.method === "GET" ? undefined : await request.text(),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  return NextResponse.json(payload, { status: response.status });
}

export async function GET(request: Request) {
  return forwardToBackend(request);
}

export async function POST(request: Request) {
  return forwardToBackend(request);
}
