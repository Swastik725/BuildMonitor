const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

// Tries to use the current refresh token to get a new access+refresh pair.
// Returns true if it worked, false if the user needs to log in again.
async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return false;

  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return true;
}

// Wraps fetch: attaches the access token, and on a 401 tries exactly one
// silent refresh + retry before giving up. Throws on any other failure.
export async function apiFetch(path: string, options: RequestInit = {}) {
  const accessToken = getAccessToken();

  const doFetch = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

  let res = await doFetch(accessToken);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await doFetch(getAccessToken());
    } else {
      clearTokens();
      throw new Error("Session expired, please log in again");
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  // Handle empty responses (e.g. 204 No Content)
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const authApi = {
  register: (data: { email: string; username: string; password: string; fullName: string }) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  googleLoginUrl: () => `${API_BASE}/auth/google`,
  githubLoginUrl: () => `${API_BASE}/auth/github`,
};
