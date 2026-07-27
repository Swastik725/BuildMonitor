"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens } from "@/lib/api";

function OAuthSuccessInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    if (accessToken && refreshToken) {
      setTokens({ accessToken, refreshToken });
      // Full reload (not router.replace) so AuthProvider re-initializes
      // and picks up the token that was just stored - a client-side nav
      // would leave its in-memory `user` state stale (still logged out),
      // and the dashboard's auth guard would bounce straight back to /login.
      window.location.href = "/dashboard";
    } else {
      router.replace("/login");
    }
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-text-muted">
      Signing you in...
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OAuthSuccessInner />
    </Suspense>
  );
}
