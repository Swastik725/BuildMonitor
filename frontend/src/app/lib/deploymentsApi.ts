import { apiFetch } from "./api";

export type DeploymentStatus = "QUEUED" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface Deployment {
  id: string;
  environmentId: string;
  triggeredById: string;
  commitSha: string;
  commitMessage: string;
  branch: string;
  status: DeploymentStatus;
  duration: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  triggeredBy?: { id: string; fullName: string; username: string };
  environment?: { id: string; name: string; domain: string | null; project?: { id: string; name: string; slug: string } };
}

export interface TriggerDeploymentInput {
  branch?: string;
  commitMessage?: string;
}

export interface DeploymentLog {
  id: string;
  timestamp: string;
  logLevel: "INFO" | "WARNING" | "ERROR" | "DEBUG";
  message: string;
}

export const deploymentsApi = {
  trigger: (projectId: string, data: TriggerDeploymentInput = {}): Promise<Deployment> =>
    apiFetch(`/projects/${projectId}/deployments`, { method: "POST", body: JSON.stringify(data) }),

  listByProject: (projectId: string): Promise<Deployment[]> =>
    apiFetch(`/projects/${projectId}/deployments`),

  listRecent: (): Promise<Deployment[]> => apiFetch("/deployments"),

  get: (id: string): Promise<Deployment> => apiFetch(`/deployments/${id}`),
  logs: (id: string): Promise<DeploymentLog[]> => apiFetch(`/deployments/${id}/logs`),
};
