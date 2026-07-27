"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, setTokens, clearTokens, API_BASE } from "./api";

type User = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  githubLoginUrl: string;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const me = await api.get<User>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("bm_access_token");
    if (!hasToken) {
      setLoading(false);
      return;
    }
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const tokens = await api.post<{ accessToken: string; refreshToken: string }>(
      "/auth/login",
      { email, password },
    );
    setTokens(tokens);
    await refreshUser();
    router.push("/dashboard");
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    fullName: string,
  ) => {
    const tokens = await api.post<{ accessToken: string; refreshToken: string }>(
      "/auth/register",
      { email, username, password, fullName },
    );
    setTokens(tokens);
    await refreshUser();
    router.push("/dashboard");
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        githubLoginUrl: `${API_BASE}/auth/github`,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
