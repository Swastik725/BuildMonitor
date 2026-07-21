import { apiFetch } from "./api";

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  environmentType: "DEVELOPMENT" | "STAGING" | "PREVIEW" | "PRODUCTION";
  domain: string | null;
}

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
  environments?: Environment[];
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
  list: (organizationId?: string): Promise<Project[]> =>
    apiFetch(organizationId ? `/projects?organizationId=${organizationId}` : "/projects"),
  get: (id: string): Promise<Project> => apiFetch(`/projects/${id}`),
  create: (data: CreateProjectInput): Promise<Project> =>
    apiFetch("/projects", { method: "POST", body: JSON.stringify(data) }),
};
