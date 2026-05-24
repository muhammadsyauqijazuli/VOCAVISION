import { backendUrl, getCookieValue, AUTH_COOKIE_NAME } from "@/lib/auth/backend-auth";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function forwardToBackend(request: Request, context: RouteContext) {
  const cookieHeader = request.headers.get("cookie");
  const token = getCookieValue(cookieHeader, AUTH_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }

  const { id } = await context.params;
  const response = await fetch(backendUrl(`/users/${id}`), {
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

export async function PUT(request: Request, context: RouteContext) {
  return forwardToBackend(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return forwardToBackend(request, context);
}
