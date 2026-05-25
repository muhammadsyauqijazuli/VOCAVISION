import { AUTH_COOKIE_NAME, backendUrl, getCookieValue } from "@/lib/auth/backend-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const token = getCookieValue(request.headers.get("cookie"), AUTH_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const response = await fetch(backendUrl("/dashboard/stats"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  return NextResponse.json(payload, { status: response.status });
}
