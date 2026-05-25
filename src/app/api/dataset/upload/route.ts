import { AUTH_COOKIE_NAME, backendUrl, getCookieValue } from "@/lib/auth/backend-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const token = getCookieValue(request.headers.get("cookie"), AUTH_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const formData = await request.formData();

  const response = await fetch(backendUrl("/dataset/upload"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  return NextResponse.json(payload, { status: response.status });
}
