export type Role = "admin" | "guru" | "siswa";

export type BackendUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  nama?: string;
};

export type SessionPayload = {
  user: BackendUser;
  role: Role;
};

export type SessionResult = {
  data: SessionPayload | null;
  error: { message: string } | null;
};

export const AUTH_COOKIE_NAME = "sintesa_access_token";
export const ROLE_COOKIE_NAME = "sintesa_role";

export function getBackendApiBase() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.BACKEND_URL ??
    "http://localhost:5000/api"
  ).replace(/\/$/, "");
}

export function backendUrl(path: string) {
  return `${getBackendApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getRoleHomePath(role?: string) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "guru":
      return "/guru/dashboard";
    case "siswa":
      return "/siswa/dashboard";
    default:
      return "/auth/sign-in";
  }
}

export function normalizeUser(raw: Record<string, unknown>, fallbackRole?: Role): BackendUser {
  const name =
    (raw.name as string | undefined) ??
    (raw.nama as string | undefined) ??
    "Pengguna";

  return {
    id: String(raw.id ?? ""),
    name,
    nama: name,
    email: String(raw.email ?? ""),
    role: (raw.role as Role | undefined) ?? fallbackRole ?? "siswa",
    image: (raw.image as string | null | undefined) ?? null,
    bio: (raw.bio as string | null | undefined) ?? null,
    phoneNumber: (raw.phoneNumber as string | null | undefined) ?? null,
  };
}

export function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const entry = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  if (!entry) {
    return null;
  }

  return decodeURIComponent(entry.slice(name.length + 1));
}

export function getTokenFromHeaders(headers: Headers) {
  return getCookieValue(headers.get("cookie"), AUTH_COOKIE_NAME);
}

export async function fetchCurrentUser(token: string) {
  const response = await fetch(backendUrl("/auth/me"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const rawUser = (await response.json()) as Record<string, unknown>;
  return normalizeUser(rawUser);
}
