const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type DeploymentStatus = "QUEUED" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface Organization { id: string; name: string; slug: string; createdAt: string }
export interface Environment { id: string; name: string; environmentType: string; domain?: string | null }
export interface Repository {
  id: string;
  projectId: string;
  githubRepositoryId: string;
  githubOwner: string;
  repositoryName: string;
  cloneUrl: string;
  htmlUrl?: string | null;
  defaultBranch: string;
  visibility: "PRIVATE" | "PUBLIC";
  webhookSecret: string;
  isConnected: boolean;
  lastSync?: string | null;
  latestCommitSha?: string | null;
  latestCommitMessage?: string | null;
  latestCommitAuthor?: string | null;
  latestCommitDate?: string | null;
}
export interface Project {
  id: string; organizationId: string; name: string; slug: string; description?: string | null;
  visibility: "PRIVATE" | "PUBLIC"; defaultBranch: string; repositoryUrl?: string | null;
  productionUrl?: string | null; healthUrl?: string | null; environments?: Environment[];
  repository?: Repository | null;
}
export interface Deployment {
  id: string; commitSha: string; commitMessage: string; branch: string; status: DeploymentStatus;
  createdAt: string; startedAt?: string | null; finishedAt?: string | null; duration?: number | null;
  triggeredBy?: { fullName: string; username: string }; environment?: { project?: Project };
}
export interface DeploymentLog { id: string; timestamp: string; logLevel: "INFO" | "WARNING" | "ERROR" | "DEBUG"; message: string }
export interface Incident { id: string; title: string; status: "OPEN" | "INVESTIGATING" | "RESOLVED"; openedAt: string; project?: { name: string; slug: string } }
export interface Member { id: string; role: string; user: { id: string; fullName: string; username: string; email: string; avatarUrl?: string | null; lastLogin?: string | null } }
export interface User { id: string; email: string; username: string; fullName: string; avatarUrl?: string | null }

function getAccessToken() { return localStorage.getItem("accessToken"); }
function getRefreshToken() { return localStorage.getItem("refreshToken"); }

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}
export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const res = await fetch(`${API_BASE}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }) });
  if (!res.ok) return false;
  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return true;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const doFetch = (token: string | null) => fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  let res = await doFetch(getAccessToken());
  if (res.status === 401 && await tryRefresh()) res = await doFetch(getAccessToken());
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const authApi = {
  register: (data: { email: string; username: string; password: string; fullName: string }) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) => apiFetch<{ accessToken: string; refreshToken: string }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => apiFetch<User>("/auth/me"),
  googleLoginUrl: () => `${API_BASE}/auth/google`,
  githubLoginUrl: () => `${API_BASE}/auth/github`,
};

export const organizationsApi = {
  list: () => apiFetch<Organization[]>("/organizations"),
  members: (id: string) => apiFetch<Member[]>(`/organizations/${id}/members`),
  invite: (id: string, email: string) => apiFetch<Member>(`/organizations/${id}/members`, { method: "POST", body: JSON.stringify({ email }) }),
};
export const projectsApi = {
  list: (organizationId?: string) => apiFetch<Project[]>(`/projects${organizationId ? `?organizationId=${organizationId}` : ""}`),
  get: (id: string) => apiFetch<Project>(`/projects/${id}`),
  create: (data: Pick<Project, "organizationId" | "name" | "slug" | "visibility" | "defaultBranch"> & Partial<Pick<Project, "description" | "repositoryUrl" | "productionUrl" | "healthUrl">>) => apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
};
export const repositoriesApi = {
  get: (projectId: string) => apiFetch<Repository | null>(`/projects/${projectId}/repository`),
  connect: (projectId: string, repository: string) => apiFetch<Repository>(`/projects/${projectId}/repository/connect`, { method: "POST", body: JSON.stringify({ repository }) }),
  sync: (projectId: string) => apiFetch<Repository>(`/projects/${projectId}/repository/sync`, { method: "POST" }),
  disconnect: (projectId: string) => apiFetch<{ disconnected: true }>(`/projects/${projectId}/repository`, { method: "DELETE" }),
};
export const deploymentsApi = {
  recent: () => apiFetch<Deployment[]>("/deployments"),
  list: (projectId: string) => apiFetch<Deployment[]>(`/projects/${projectId}/deployments`),
  get: (id: string) => apiFetch<Deployment>(`/deployments/${id}`),
  logs: (id: string) => apiFetch<DeploymentLog[]>(`/deployments/${id}/logs`),
  trigger: (projectId: string, body: { branch?: string; commitMessage?: string } = {}) => apiFetch<Deployment>(`/projects/${projectId}/deployments`, { method: "POST", body: JSON.stringify(body) }),
  retry: (id: string) => apiFetch<Deployment>(`/deployments/${id}/retry`, { method: "PATCH" }),
  cancel: (id: string) => apiFetch<Deployment>(`/deployments/${id}/cancel`, { method: "PATCH" }),
};
export const incidentsApi = { open: () => apiFetch<Incident[]>("/incidents") };
export const healthApi = { summary: () => apiFetch<{ uptimePercentage: number | null; totalChecks: number; avgResponseTime: number | null }>("/health/summary") };
export const usersApi = {
  profile: () => apiFetch<User>("/users/me"),
  updateProfile: (fullName: string) => apiFetch<User>("/users/me", { method: "PATCH", body: JSON.stringify({ fullName }) }),
  providers: () => apiFetch<Array<{ id: string; provider: string; createdAt: string }>>("/users/me/auth-providers"),
  disconnectProvider: (provider: string) => apiFetch(`/users/me/auth-providers/${provider}`, { method: "DELETE" }),
};
