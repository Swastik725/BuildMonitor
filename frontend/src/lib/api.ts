import axios from 'axios';

// Points at your NestJS backend. Set VITE_API_URL in .env to override
// (e.g. VITE_API_URL=http://localhost:3001) for local dev.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the access token to every request. We store it in localStorage;
// swap for httpOnly cookies later if you want tighter security, but that
// requires backend changes (cookie-parser + CORS credentials) not present yet.
api.interceptors.request.use(config => {
  const token = window.localStorage.getItem('buildmonitor-access-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401, clear the stored token and bounce to login. We don't attempt
// silent refresh here yet — /auth/refresh exists on the backend, but wiring
// automatic retry-after-refresh is a follow-up, not v1-critical.
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      window.localStorage.removeItem('buildmonitor-access-token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ---- Types mirroring the Prisma models we're actually hitting ----

export type Organization = {
  id: string;
  name: string;
  slug: string;
};

export type Project = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: 'PRIVATE' | 'PUBLIC';
  defaultBranch: string;
  repositoryUrl: string | null;
  healthUrl: string | null;
  healthEnabled: boolean;
  monitoringEnabled: boolean;
  repository?: Repository | null;
};

export type Repository = {
  id: string;
  githubOwner: string;
  repositoryName: string;
  htmlUrl: string | null;
  defaultBranch: string;
  isConnected: boolean;
  lastSync: string | null;
  latestCommitSha: string | null;
  latestCommitMessage: string | null;
  latestCommitAuthor: string | null;
};

export type GithubRepoOption = {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch: string;
  private: boolean;
  description: string | null;
};

export type Deployment = {
  id: string;
  environmentId: string;
  branch: string;
  commitSha: string;
  commitMessage: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  duration: number | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  triggeredBy?: { id: string; fullName: string; username: string };
};

export type HealthCheck = {
  id: string;
  status: string;
  statusCode: number | null;
  responseTime: number | null;
  message: string | null;
  checkedAt: string;
};

export type Incident = {
  id: string;
  title: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  openedAt: string;
  resolvedAt: string | null;
};

// ---- Auth ----
export const authApi = {
  register: (data: { email: string; username: string; password: string; fullName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ accessToken: string }>('/auth/login', data),
  me: () => api.get('/auth/me'),
  googleUrl: () => `${API_BASE_URL}/auth/google`,
  githubUrl: () => `${API_BASE_URL}/auth/github`,
};

// ---- Organizations ----
export const orgsApi = {
  list: () => api.get<Organization[]>('/organizations'),
  create: (data: { name: string; slug: string }) => api.post<Organization>('/organizations', data),
  get: (id: string) => api.get<Organization>(`/organizations/${id}`),
  update: (id: string, data: { name?: string; slug?: string }) => api.patch<Organization>(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
};

// ---- Projects ----
export const projectsApi = {
  list: () => api.get<Project[]>('/projects'),
  get: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: { name: string; slug: string; organizationId: string; visibility: 'PRIVATE' | 'PUBLIC'; defaultBranch: string }) =>
    api.post<Project>('/projects', data),
  update: (id: string, data: { name?: string; slug?: string; description?: string }) =>
    api.patch<Project>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// ---- Repositories (GitHub sync) ----
export const reposApi = {
  listAvailable: () => api.get<GithubRepoOption[]>('/github/repositories'),
  getConnected: (projectId: string) => api.get<Repository>(`/projects/${projectId}/repository`),
  connect: (projectId: string, repository: string) =>
    api.post<Repository>(`/projects/${projectId}/repository/connect`, { repository }),
  sync: (projectId: string) => api.post<Repository>(`/projects/${projectId}/repository/sync`),
  disconnect: (projectId: string) => api.delete(`/projects/${projectId}/repository`),
};

// ---- Deployments ----
export const deploymentsApi = {
  listByProject: (projectId: string) => api.get<Deployment[]>(`/projects/${projectId}/deployments`),
  trigger: (projectId: string, data?: { branch?: string; commitMessage?: string }) =>
    api.post<Deployment>(`/projects/${projectId}/deployments`, data ?? {}),
  logs: (deploymentId: string) => api.get(`/deployments/${deploymentId}/logs`),
  retry: (deploymentId: string) => api.patch(`/deployments/${deploymentId}/retry`),
  cancel: (deploymentId: string) => api.patch(`/deployments/${deploymentId}/cancel`),
};

// ---- Health ----
export const healthApi = {
  listByProject: (projectId: string) => api.get<HealthCheck[]>(`/projects/${projectId}/health`),
  checkNow: (projectId: string) => api.post(`/projects/${projectId}/health/check`),
};

// ---- Incidents ----
export const incidentsApi = {
  listByProject: (projectId: string) => api.get<Incident[]>(`/projects/${projectId}/incidents`),
  resolve: (id: string) => api.patch(`/incidents/${id}/resolve`),
};

export type CodeFinding = {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  details: string;
  evidence: string[];
  suggestedFix?: string;
  autoFixable: boolean;
  confidence: number;
  source: 'deterministic' | 'llm';
};

export type CodeCheckReport = {
  projectId: string;
  repository: string;
  checkedAt: string;
  snapshot: { commitSha: string; fileCount: number };
  findings: CodeFinding[];
};

// ---- Dashboard ----
export const dashboardApi = {
  summary: () => api.get('/dashboard'),
};

// ---- Code Checker ----
export const codeCheckerApi = {
  run: (projectId: string) => api.post<CodeCheckReport>(`/projects/${projectId}/code-check`),
  history: (projectId: string) => api.get<CodeCheckReport[]>(`/projects/${projectId}/code-check/history`),
};
