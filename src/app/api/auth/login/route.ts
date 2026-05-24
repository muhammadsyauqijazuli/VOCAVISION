import {
  AUTH_COOKIE_NAME,
  backendUrl,
  getRoleHomePath,
  normalizeUser,
  ROLE_COOKIE_NAME,
} from "@/lib/auth/backend-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json(
      { message: "Email dan password wajib diisi" },
      { status: 400 },
    );
  }

  const loginResponse = await fetch(backendUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const loginPayload = (await loginResponse.json().catch(() => ({}))) as {
    access_token?: string;
    role?: string;
    message?: string;
  };

  if (!loginResponse.ok || !loginPayload.access_token) {
    return NextResponse.json(
      {
        message: loginPayload.message ?? "Login gagal",
      },
      { status: loginResponse.status || 500 },
    );
  }

  const meResponse = await fetch(backendUrl("/auth/me"), {
    headers: {
      Authorization: `Bearer ${loginPayload.access_token}`,
    },
    cache: "no-store",
  });

  const mePayload = (await meResponse.json().catch(() => ({}))) as {
    id?: string;
    nama?: string;
    email?: string;
    role?: string;
  };

  const user = normalizeUser(
    {
      ...mePayload,
      email: mePayload.email ?? body.email,
      role: mePayload.role ?? loginPayload.role,
      nama: mePayload.nama ?? body.email?.split("@")[0] ?? "Pengguna",
    },
    (loginPayload.role as "admin" | "guru" | "siswa") ?? "siswa",
  );

  const response = NextResponse.json({
    user,
    role: user.role,
    redirectTo: getRoleHomePath(user.role),
  });

  response.cookies.set(AUTH_COOKIE_NAME, loginPayload.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  response.cookies.set(ROLE_COOKIE_NAME, user.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
