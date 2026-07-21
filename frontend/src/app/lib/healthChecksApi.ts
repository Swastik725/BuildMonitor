import { apiFetch } from "./api";

export interface HealthCheck {
  id: string;
  environmentId: string;
  status: "UP" | "DEGRADED" | "DOWN";
  responseTime: number;
  statusCode: number;
  checkedAt: string;
}

export interface HealthSummary {
  uptimePercentage: number | null;
  totalChecks: number;
  avgResponseTime: number | null;
}

export const healthChecksApi = {
  getByProject: (projectId: string): Promise<HealthCheck[]> => apiFetch(`/projects/${projectId}/health`),
  getSummary: (): Promise<HealthSummary> => apiFetch("/health/summary"),
};
