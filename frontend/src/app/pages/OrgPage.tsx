import { useState, useEffect, useCallback } from "react";
import { Settings, Plus, ChevronRight, X } from "lucide-react";
import type { NavState } from "../lib/types";
import { PageFade, SectionCard, Btn, Mono, Av, cn } from "../components/primitives";
import { TopBar } from "../components/TopBar";
import { NewProjectModal } from "../components/NewProjectModal";
import { InviteMemberModal } from "../components/InviteMemberModal";
import { organizationsApi, type Organization, type OrganizationMember } from "../lib/organizationsApi";
import { projectsApi, type Project } from "../lib/projectsApi";
import { formatRelativeTime } from "../lib/statusMap";

function initials(fullName: string) {
  return fullName.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

export function OrgPage({ onNav }: { onNav: (s: NavState) => void }) {
  const [tab, setTab] = useState<"projects" | "members">("projects");
  const [org, setOrg] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  async function handleRemoveMember(userId: string) {
    if (!org) return;
    if (!confirm("Remove this member from the organization?")) return;
    try {
      await organizationsApi.removeMember(org.id, userId);
      setMembers(prev => prev.filter(m => m.userId !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  }

  const load = useCallback(() => {
    setLoading(true);
    organizationsApi.list()
      .then(async orgs => {
        const first = orgs[0] ?? null;
        setOrg(first);
        if (first) {
          const [projs, mems] = await Promise.all([
            projectsApi.list(first.id),
            organizationsApi.getMembers(first.id),
          ]);
          setProjects(projs);
          setMembers(mems);
        }
      })
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load organization"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <PageFade>
        <TopBar title="Organization" onNav={onNav} />
        <div className="p-5 text-sm text-muted-foreground">Loading…</div>
      </PageFade>
    );
  }

  if (error) {
    return (
      <PageFade>
        <TopBar title="Organization" onNav={onNav} />
        <div className="p-5 text-sm text-destructive">{error}</div>
      </PageFade>
    );
  }

  if (!org) {
    return (
      <PageFade>
        <TopBar title="Organization" onNav={onNav} />
        <div className="p-5 text-sm text-muted-foreground">
          You don't belong to an organization yet — one gets created automatically the first time you make a project.
        </div>
      </PageFade>
    );
  }

  return (
    <PageFade>
      <TopBar title="Organization" onNav={onNav} />
      <div className="p-5 max-w-5xl space-y-5">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-lg font-semibold text-accent-foreground">
                {org.name[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground font-display">{org.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {org.slug} · {members.length} members · {projects.length} projects
                </p>
              </div>
            </div>
            <Btn variant="secondary" size="sm" onClick={() => onNav({ page: "settings" })}>
              <Settings className="w-3.5 h-3.5" />Settings
            </Btn>
          </div>
        </div>

        <div className="border-b border-border flex">
          {(["projects", "members"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px capitalize cursor-pointer",
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "projects" && (
          <SectionCard
            title="All projects"
            action={
              <Btn variant="ghost" size="sm" onClick={() => setShowNewProject(true)}>
                <Plus className="w-3.5 h-3.5" />New project
              </Btn>
            }
          >
            {projects.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted-foreground">No projects in this organization yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onNav({ page: "project", projectId: p.id })}
                    className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-foreground">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mono className="text-muted-foreground">{p.slug}</Mono>
                        <span>·</span>
                        <span>{p.defaultBranch}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {tab === "members" && (
          <SectionCard
            title="Members"
            action={
              <Btn variant="ghost" size="sm" onClick={() => setShowInvite(true)}>
                <Plus className="w-3.5 h-3.5" />Invite
              </Btn>
            }
          >
            <div className="divide-y divide-border">
              {members.map(m => (
                <div key={m.id} className="px-5 py-3.5 flex items-center gap-4">
                  <Av initials={initials(m.user.fullName)} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{m.user.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded">{m.role}</span>
                  <span className="text-xs text-muted-foreground w-20 text-right">
                    {m.user.lastLogin ? formatRelativeTime(m.user.lastLogin) : "Never"}
                  </span>
                  <button
                    onClick={() => handleRemoveMember(m.userId)}
                    className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    title="Remove member"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      {showNewProject && (
        <NewProjectModal onClose={() => setShowNewProject(false)} onCreated={load} />
      )}

      {showInvite && org && (
        <InviteMemberModal orgId={org.id} onClose={() => setShowInvite(false)} onInvited={load} />
      )}
    </PageFade>
  );
}
