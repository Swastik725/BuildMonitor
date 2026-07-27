const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Tokens = { accessToken: string; refreshToken: string };

function getTokens(): Tokens | null {
  if (typeof window === "undefined") return null;
  const accessToken = localStorage.getItem("bm_access_token");
  const refreshToken = localStorage.getItem("bm_refresh_token");
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export function setTokens(tokens: Tokens) {
  localStorage.setItem("bm_access_token", tokens.accessToken);
  localStorage.setItem("bm_refresh_token", tokens.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("bm_access_token");
  localStorage.removeItem("bm_refresh_token");
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        setTokens(data);
        return data.accessToken as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<T> {
  const tokens = getTokens();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && !retried && tokens) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, options, true);
    }
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Session expired");
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // response wasn't JSON - keep the generic message
    }
    throw new ApiError(res.status, Array.isArray(message) ? message.join(", ") : message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T,>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { API_BASE, ApiError };
