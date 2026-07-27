"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: "", username: "", password: "", fullName: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form.email, form.username, form.password, form.fullName);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <div>
      <label className="mb-1 block text-xs text-text-muted">{label}</label>
      <input
        type={type}
        required
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
            BuildMonitor
          </div>
          <h1 className="text-xl font-semibold">Create your account</h1>
        </div>

        <Card>
          <CardBody className="space-y-4">
            <form onSubmit={onSubmit} className="space-y-3">
              {field("fullName", "Full name")}
              {field("username", "Username")}
              {field("email", "Email", "email")}
              {field("password", "Password", "password")}
              {error && <p className="text-sm text-error">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">
                Create account
              </Button>
            </form>
            <p className="text-center text-sm text-text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
