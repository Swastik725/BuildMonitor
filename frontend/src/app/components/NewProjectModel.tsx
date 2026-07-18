import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Field, Btn } from "./primitives";
import { organizationsApi, type Organization } from "../lib/organizationsApi";
import { projectsApi } from "../lib/projectsApi";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function NewProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgId, setOrgId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    organizationsApi
      .list()
      .then(list => {
        setOrgs(list);
        if (list.length > 0) setOrgId(list[0].id);
      })
      .catch(() => setError("Could not load organizations"))
      .finally(() => setLoadingOrgs(false));
  }, []);

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!orgId) {
      setError("You need an organization first — create one from the Organization page.");
      return;
    }

    setLoading(true);
    try {
      await projectsApi.create({
        organizationId: orgId,
        name,
        slug,
        visibility,
        defaultBranch,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">New project</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loadingOrgs ? (
          <p className="text-sm text-muted-foreground">Loading organizations…</p>
        ) : orgs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You don't have an organization yet. Create one from the Organization page first.
          </p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Organization</label>
              <select
                value={orgId}
                onChange={e => setOrgId(e.target.value)}
                className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {orgs.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            <Field label="Project name" placeholder="Web frontend" value={name} onChange={handleNameChange} />
            <Field
              label="Slug"
              placeholder="web-frontend"
              value={slug}
              onChange={v => { setSlug(v); setSlugTouched(true); }}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Visibility</label>
              <select
                value={visibility}
                onChange={e => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
                className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
              </select>
            </div>

            <Field label="Default branch" placeholder="main" value={defaultBranch} onChange={setDefaultBranch} />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Btn variant="secondary" onClick={onClose} type="button">Cancel</Btn>
              <Btn variant="primary" type="submit" disabled={loading || !name || !slug}>
                {loading ? "Creating…" : "Create project"}
              </Btn>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}