import {
  AUTH_COOKIE_NAME,
  backendUrl,
  getCookieValue,
  getRoleHomePath,
  ROLE_COOKIE_NAME,
} from "@/lib/auth/backend-auth";
import { NextRequest, NextResponse } from "next/server";

const AUTH_ONLY_PATHS = ["/auth/sign-in", "/auth/sign-up"];

async function resolveRole(token: string) {
  const response = await fetch(backendUrl("/auth/me"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return undefined;
  }

  const payload = (await response.json()) as { role?: string };
  return payload.role;
}

function isRolePath(pathname: string) {
  return ["/admin", "/guru", "/siswa"].some((prefix) =>
    pathname.startsWith(prefix),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const callbackUrl = `${pathname}${request.nextUrl.search}`;
  const isAuthOnly = AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path));
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let role = request.cookies.get(ROLE_COOKIE_NAME)?.value;

  if (!token) {
    if (!isAuthOnly) {
      const url = request.nextUrl.clone();
      url.searchParams.set("callbackUrl", callbackUrl);
      url.pathname = "/auth/sign-in";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  try {
    if (!role) {
      role = await resolveRole(token);
    }

    if (!role) {
      const url = request.nextUrl.clone();
      url.searchParams.set("callbackUrl", callbackUrl);
      url.pathname = "/auth/sign-in";
      return NextResponse.redirect(url);
    }

    if (isAuthOnly) {
      return NextResponse.redirect(new URL(getRoleHomePath(role), request.url));
    }

    if (isRolePath(pathname)) {
      const targetRole = pathname.startsWith("/admin")
        ? "admin"
        : pathname.startsWith("/guru")
          ? "guru"
          : "siswa";

      if (targetRole !== role) {
        return NextResponse.redirect(new URL(getRoleHomePath(role), request.url));
      }
    }
  } catch (error) {
    console.error(error);
    if (!isAuthOnly) {
      const url = request.nextUrl.clone();
      url.searchParams.set("callbackUrl", callbackUrl);
      url.pathname = "/auth/sign-in";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
