import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { authApi, setTokens, clearTokens } from "./api";
import { usersApi, type UserProfile } from "./usersApi";

interface AuthContextValue {
  isAuthed: boolean;
  loading: boolean;
  error: string | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string; fullName: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // If a token already exists (e.g. page refresh), treat the user as authed.
  // apiFetch will silently refresh or clear it if it turns out to be invalid.
  const [isAuthed, setIsAuthed] = useState(() => !!localStorage.getItem("accessToken"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshProfile = useCallback(() => {
    usersApi.getProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  // Fetch the profile once whenever auth state flips to true (login, register,
  // OAuth redirect, or an existing token on page reload) — every page that
  // needs the user's name/initials reads it from context instead of re-fetching.
  useEffect(() => {
    if (isAuthed) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [isAuthed, refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const tokens = await authApi.login({ email, password });
      setTokens(tokens.accessToken, tokens.refreshToken);
      setIsAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: { email: string; username: string; password: string; fullName: string }) => {
      setLoading(true);
      setError(null);
      try {
        await authApi.register(data);
        const tokens = await authApi.login({ email: data.email, password: data.password });
        setTokens(tokens.accessToken, tokens.refreshToken);
        setIsAuthed(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registration failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    clearTokens();
    setIsAuthed(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthed, loading, error, profile, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
