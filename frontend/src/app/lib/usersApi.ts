import { apiFetch } from "./api";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface AuthProviderLink {
  id: string;
  provider: string;
  createdAt: string;
}

export interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
}

export const usersApi = {
  getProfile: (): Promise<UserProfile> => apiFetch("/users/me"),

  updateProfile: (data: { fullName?: string }): Promise<UserProfile> =>
    apiFetch("/users/me", { method: "PATCH", body: JSON.stringify(data) }),

  getAuthProviders: (): Promise<AuthProviderLink[]> => apiFetch("/users/me/auth-providers"),

  disconnectProvider: (provider: string): Promise<{ disconnected: string }> =>
    apiFetch(`/users/me/auth-providers/${provider}`, { method: "DELETE" }),

  getSessions: (): Promise<Session[]> => apiFetch("/users/me/sessions"),

  revokeSession: (id: string): Promise<{ revoked: boolean }> =>
    apiFetch(`/users/me/sessions/${id}`, { method: "DELETE" }),
};
