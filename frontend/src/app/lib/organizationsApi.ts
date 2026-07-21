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

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  user: { id: string; fullName: string; username: string; email: string; avatarUrl: string | null; lastLogin?: string | null };
}

export const organizationsApi = {
  list: (): Promise<Organization[]> => apiFetch("/organizations"),
  get: (id: string): Promise<Organization> => apiFetch(`/organizations/${id}`),
  create: (data: CreateOrganizationInput): Promise<Organization> =>
    apiFetch("/organizations", { method: "POST", body: JSON.stringify(data) }),
  getMembers: (id: string): Promise<OrganizationMember[]> => apiFetch(`/organizations/${id}/members`),
  update: (id: string, data: { name?: string; slug?: string }): Promise<Organization> =>
    apiFetch(`/organizations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> => apiFetch(`/organizations/${id}`, { method: "DELETE" }),
  addMember: (id: string, email: string, role?: "ADMIN" | "MEMBER"): Promise<OrganizationMember> =>
    apiFetch(`/organizations/${id}/members`, { method: "POST", body: JSON.stringify({ email, role }) }),
  removeMember: (id: string, userId: string): Promise<void> =>
    apiFetch(`/organizations/${id}/members/${userId}`, { method: "DELETE" }),
};
