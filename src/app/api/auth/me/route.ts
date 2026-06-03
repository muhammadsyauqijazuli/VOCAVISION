import {
  AUTH_COOKIE_NAME,
  backendUrl,
  getCookieValue,
  normalizeUser,
  ROLE_COOKIE_NAME,
} from "@/lib/auth/backend-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const token = getCookieValue(cookieHeader, AUTH_COOKIE_NAME);
  const fallbackRole = getCookieValue(cookieHeader, ROLE_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const response = await fetch(backendUrl("/auth/me"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Sesi tidak valid" }, { status: 401 });
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const user = normalizeUser(
    payload,
    fallbackRole as "admin" | "guru" | "siswa" | undefined,
  );

  return NextResponse.json({
    user,
    role: user.role,
  });
}
