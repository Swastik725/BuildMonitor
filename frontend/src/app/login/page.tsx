"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login, githubLoginUrl } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
            BuildMonitor
          </div>
          <h1 className="text-xl font-semibold">Sign in</h1>
        </div>

        <Card>
          <CardBody className="space-y-4">
            <a
              href={githubLoginUrl}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface-2 px-3.5 py-2 text-sm font-medium hover:border-accent/60"
            >
              <GithubMark /> Continue with GitHub
            </a>

            <div className="flex items-center gap-3 text-xs text-text-muted">
              <div className="h-px flex-1 bg-border" />
              or
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-text-muted">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
              {error && <p className="text-sm text-error">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">
                Sign in
              </Button>
            </form>

            <p className="text-center text-sm text-text-muted">
              No account?{" "}
              <Link href="/register" className="text-accent hover:underline">
                Register
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function GithubMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
