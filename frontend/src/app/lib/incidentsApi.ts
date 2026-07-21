import { apiFetch } from "./api";

export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED";

export interface Incident {
  id: string;
  projectId: string;
  title: string;
  status: IncidentStatus;
  openedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  project?: { name: string; slug: string };
}

export const incidentsApi = {
  create: (projectId: string, title: string): Promise<Incident> =>
    apiFetch(`/projects/${projectId}/incidents`, { method: "POST", body: JSON.stringify({ title }) }),

  listOpen: (): Promise<Incident[]> => apiFetch("/incidents"),

  listByProject: (projectId: string): Promise<Incident[]> =>
    apiFetch(`/projects/${projectId}/incidents`),

  resolve: (id: string): Promise<Incident> =>
    apiFetch(`/incidents/${id}/resolve`, { method: "PATCH" }),
};
