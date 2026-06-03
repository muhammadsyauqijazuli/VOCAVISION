"use client";

import { useEffect, useState } from "react";
import {
  type BackendUser,
  type Role,
  type SessionPayload,
  type SessionResult,
} from "./backend-auth";

type ActionResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

type SessionHookState = {
  data: SessionPayload | null;
  error: { message: string } | null;
  isPending: boolean;
  refresh: () => Promise<void>;
};

async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<ActionResult<T>> {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      data: null,
      error: {
        message:
          (payload as { message?: string }).message ?? "Request gagal diproses",
      },
    };
  }

  return {
    data: payload as T,
    error: null,
  };
}

async function loadSession(): Promise<SessionResult> {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      data: null,
      error: {
        message: (payload as { message?: string }).message ?? "Belum login",
      },
    };
  }

  return {
    data: payload as SessionPayload,
    error: null,
  };
}

async function updateUser(payload: Record<string, unknown>) {
  return requestJson<{ success: boolean }>("/api/auth/update", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function signOut() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

async function signInWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<ActionResult<SessionPayload>> {
  return requestJson<SessionPayload>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

async function signInWithSocial(_options?: {
  provider?: string;
  callbackURL?: string;
}) {
  throw new Error("Login Google belum dihubungkan ke backend ini.");
}

async function signUpWithEmail(_options?: {
  name?: string;
  email?: string;
  password?: string;
  callbackURL?: string;
}) {
  return {
    data: null,
    error: { message: "Pendaftaran belum tersedia di backend ini." },
  } satisfies ActionResult<SessionPayload>;
}

export function useSession(): SessionHookState {
  const [state, setState] = useState<Omit<SessionHookState, "refresh">>({
    data: null,
    error: null,
    isPending: true,
  });

  const refresh = async () => {
    setState((current) => ({ ...current, isPending: true }));
    const session = await loadSession();

    setState({
      data: session.data,
      error: session.error,
      isPending: false,
    });
  };

  useEffect(() => {
    void refresh();
  }, []);

  return {
    ...state,
    refresh,
  };
}

async function getSession() {
  return loadSession();
}

export const authClient = {
  signIn: {
    email: signInWithEmail,
    social: signInWithSocial,
  },
  signOut,
  signUp: {
    email: signUpWithEmail,
  },
  updateUser,
  useSession,
  getSession,
};

export { getSession, signOut, updateUser };
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
