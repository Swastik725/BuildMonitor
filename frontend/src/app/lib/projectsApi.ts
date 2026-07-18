import { apiFetch } from "./api";

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateProjectInput {
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  visibility: "PUBLIC" | "PRIVATE";
  defaultBranch: string;
}

export const projectsApi = {
  list: (): Promise<Project[]> => apiFetch("/projects"),
  get: (id: string): Promise<Project> => apiFetch(`/projects/${id}`),
  create: (data: CreateProjectInput): Promise<Project> =>
    apiFetch("/projects", { method: "POST", body: JSON.stringify(data) }),
};