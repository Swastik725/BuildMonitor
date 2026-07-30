import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../lib/api';

type User = { id: string; email: string; username: string; fullName: string; avatarUrl?: string | null };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem('buildmonitor-access-token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(res => setUser(res.data))
      .catch(() => window.localStorage.removeItem('buildmonitor-access-token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    window.localStorage.setItem('buildmonitor-access-token', res.data.accessToken);
    const me = await authApi.me();
    setUser(me.data);
  };

  const logout = () => {
    window.localStorage.removeItem('buildmonitor-access-token');
    setUser(null);
  };

  // Re-fetches the current user from /auth/me. Used after OAuth redirects
  // (Google/GitHub), where the token arrives via URL params rather than
  // through the login() form flow above.
  const refreshUser = async () => {
    const res = await authApi.me();
    setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
