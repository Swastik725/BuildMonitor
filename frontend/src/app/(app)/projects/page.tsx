"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Organization, Project } from "@/lib/types";
import { ApiError } from "@/lib/api";

export default function ProjectsPage() {
  const { data: projects, loading, error, reload } = useFetch(
    () => api.get<Project[]>("/projects"),
    [],
  );
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-text-muted">Every project across your organizations.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>New project</Button>
      </div>

      {loading && <p className="text-sm text-text-muted">Loading projects...</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      {projects && projects.length === 0 && (
        <Card>
          <CardBody className="py-10 text-center">
            <p className="text-sm text-text-muted">
              No projects yet. Create one to connect a repo and start monitoring it.
            </p>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="h-full hover:border-accent/50">
              <CardBody>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-medium">{project.name}</h3>
                  <StatusPill tone={project.monitoringEnabled ? "success" : "neutral"}>
                    {project.monitoringEnabled ? "Active" : "Paused"}
                  </StatusPill>
                </div>
                {project.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-text-muted">
                    {project.description}
                  </p>
                )}
                <div className="font-mono text-xs text-text-muted">
                  {project.defaultBranch} · {project.visibility}
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function CreateProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { data: orgs } = useFetch(() => api.get<Organization[]>("/organizations"), []);
  const [form, setForm] = useState({
    organizationId: "",
    name: "",
    slug: "",
    defaultBranch: "main",
    description: "",
    visibility: "PRIVATE" as "PRIVATE" | "PUBLIC",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.organizationId) {
      setError("Choose an organization");
      return;
    }
    setLoading(true);
    try {
      await api.post("/projects", form);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <Card className="w-full max-w-md">
        <CardBody className="space-y-4">
          <h2 className="text-lg font-semibold">New project</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-text-muted">Organization</label>
              <select
                required
                value={form.organizationId}
                onChange={(e) => setForm((f) => ({ ...f, organizationId: e.target.value }))}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="">Select an organization</option>
                {orgs?.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-muted">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-muted">Slug</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-text-muted">Default branch</label>
                <input
                  required
                  value={form.defaultBranch}
                  onChange={(e) => setForm((f) => ({ ...f, defaultBranch: e.target.value }))}
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Visibility</label>
                <select
                  value={form.visibility}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, visibility: e.target.value as "PRIVATE" | "PUBLIC" }))
                  }
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  <option value="PRIVATE">Private</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-muted">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                rows={2}
              />
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create project
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
