import { apiFetch } from "./api";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
}

export const organizationsApi = {
  list: (): Promise<Organization[]> => apiFetch("/organizations"),
  get: (id: string): Promise<Organization> => apiFetch(`/organizations/${id}`),
  create: (data: CreateOrganizationInput): Promise<Organization> =>
    apiFetch("/organizations", { method: "POST", body: JSON.stringify(data) }),
};