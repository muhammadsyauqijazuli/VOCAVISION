import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  backendUrl,
  getCookieValue,
} from "@/lib/auth/backend-auth";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const token = getCookieValue(cookieHeader, AUTH_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  try {
    const response = await fetch(backendUrl("/notifications"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ([]));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Backend tidak merespons" },
      { status: 502 },
    );
  }
}
