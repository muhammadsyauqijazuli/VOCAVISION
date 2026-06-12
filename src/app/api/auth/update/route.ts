import {
  AUTH_COOKIE_NAME,
  backendUrl,
  getCookieValue,
} from "@/lib/auth/backend-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const token = getCookieValue(cookieHeader, AUTH_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));

  const response = await fetch(backendUrl("/auth/me"), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    return NextResponse.json(
      { message: errorPayload.message || "Gagal memperbarui profile" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json({
    message: "Profile updated successfully",
    payload,
    success: true,
    data,
  });
}
