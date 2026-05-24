import {
  backendUrl,
  fetchCurrentUser,
  getTokenFromHeaders,
  normalizeUser,
  type SessionPayload,
} from "./backend-auth";

type SessionResult = {
  user: ReturnType<typeof normalizeUser>;
  session: {
    token: string;
    role: SessionPayload["role"];
  };
} | null;

export const auth = {
  api: {
    async getSession({ headers }: { headers: Headers }): Promise<SessionResult> {
      const token = getTokenFromHeaders(headers);

      if (!token) {
        return null;
      }

      const currentUser = await fetchCurrentUser(token);

      if (!currentUser) {
        return null;
      }

      return {
        user: currentUser,
        session: {
          token,
          role: currentUser.role,
        },
      };
    },
  },
};

export { backendUrl };
