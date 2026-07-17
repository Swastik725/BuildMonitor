import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { authApi, setTokens, clearTokens } from "./api";

interface AuthContextValue {
  isAuthed: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string; fullName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(() => !!localStorage.getItem("accessToken"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <AuthContext.Provider value={{ isAuthed, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}