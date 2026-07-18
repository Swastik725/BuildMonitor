import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronRight } from "lucide-react";
import type { NavState } from "../lib/types";
import { INCIDENTS, ALL_RECENT } from "../lib/mockData";
import { PageFade, SectionCard, Btn, StatusBadge, Mono } from "../components/primitives";
import { TopBar } from "../components/TopBar";
import { NewProjectModal } from "../components/NewProjectModel";
import { projectsApi, type Project } from "../lib/projectsApi";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:border-border/80 transition-colors">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground mt-1 tabular-nums tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export function DashboardPage({ onNav }: { onNav: (s: NavState) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);

  const loadProjects = useCallback(() => {
    setLoading(true);
    projectsApi
      .list()
      .then(setProjects)
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <PageFade>
      <TopBar title="Dashboard" />
      <div className="p-5 max-w-6xl space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active projects" value={String(projects.length)} sub={`${projects.length} repos monitored`} />
          {/* These three are still placeholder — they depend on the Deployments/Incidents
              modules, which don't have backend endpoints yet. */}
          <StatCard label="Deployments (7d)" value="—" sub="Coming with Deployments module" />
          <StatCard label="Mean uptime" value="—" sub="Coming with monitoring module" />
          <StatCard label="Open incidents" value="—" sub="Coming with monitoring module" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <SectionCard
              title="Projects"
              action={
                <Btn variant="ghost" size="sm" onClick={() => setShowNewProject(true)}>
                  <Plus className="w-3.5 h-3.5" />New project
                </Btn>
              }
            >
              {loading ? (
                <p className="px-5 py-4 text-sm text-muted-foreground">Loading projects…</p>
              ) : error ? (
                <p className="px-5 py-4 text-sm text-destructive">{error}</p>
              ) : projects.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted-foreground">
                  No projects yet — create your first one.
                </p>
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
                          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {p.visibility}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mono className="text-muted-foreground">{p.slug}</Mono>
                          <span>·</span>
                          <span>{p.defaultBranch}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div>
            <SectionCard title="Incidents">
              <div className="divide-y divide-border">
                {INCIDENTS.map(inc => (
                  <div key={inc.id} className="px-5 py-3.5 space-y-2">
                    <p className="text-xs text-foreground leading-snug">{inc.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={inc.status} />
                      <Mono className="text-muted-foreground">{inc.project}</Mono>
                    </div>
                    <p className="text-xs text-muted-foreground">{inc.opened}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        <SectionCard title="Recent deployments">
          <div className="divide-y divide-border">
            {ALL_RECENT.map(dep => (
              <button
                key={dep.id}
                onClick={() => onNav({ page: "deployment", projectId: dep.project, deploymentId: dep.id })}
                className="w-full px-5 py-3 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left cursor-pointer"
              >
                <div className="w-24 flex-shrink-0">
                  <StatusBadge status={dep.status} pulse={dep.status === "in-progress"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{dep.message}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mono className="text-muted-foreground">{dep.commit}</Mono>
                    <span className="text-muted-foreground text-xs">·</span>
                    <Mono className="text-muted-foreground">{dep.project}</Mono>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 text-xs text-muted-foreground">
                  <div>{dep.timestamp}</div>
                  {dep.duration && <div className="font-mono mt-0.5">{dep.duration}</div>}
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreated={loadProjects}
        />
      )}
    </PageFade>
  );
}