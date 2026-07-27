"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/deployments", label: "Deployments" },
  { href: "/alerts", label: "Alerts" },
  { href: "/incidents", label: "Incidents" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r border-border bg-surface px-4 py-5">
        <div className="mb-8 px-2 font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
          BuildMonitor
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-surface-2 text-text font-medium"
                    : "text-text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border pt-3">
          <div className="mb-2 px-2 text-xs text-text-muted truncate">{user.email}</div>
          <button
            onClick={logout}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-text-muted hover:bg-surface-2 hover:text-text"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
