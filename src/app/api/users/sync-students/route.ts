import {
  backendUrl,
  getCookieValue,
  AUTH_COOKIE_NAME,
} from "@/lib/auth/backend-auth";
import { NextResponse } from "next/server";

async function forwardToBackend(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const token = getCookieValue(cookieHeader, AUTH_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const response = await fetch(backendUrl("/users/sync/students"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  return NextResponse.json(payload, { status: response.status });
}

export async function POST(request: Request) {
  return forwardToBackend(request);
}
