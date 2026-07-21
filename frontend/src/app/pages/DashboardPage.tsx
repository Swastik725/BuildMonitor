import { useState, useEffect, useCallback } from "react";
import { ArrowUpRight, CircleAlert, Plus, Radio, Rocket, ChevronRight } from "lucide-react";
import type { NavState } from "../lib/types";
import { PageFade, SectionCard, Btn, StatusBadge, Mono } from "../components/primitives";
import { TopBar } from "../components/TopBar";
import { NewProjectModal } from "../components/NewProjectModal";
import { Gauge } from "../components/Gauge";
import { projectsApi, type Project } from "../lib/projectsApi";
import { deploymentsApi, type Deployment } from "../lib/deploymentsApi";
import { incidentsApi, type Incident } from "../lib/incidentsApi";
import { healthChecksApi, type HealthSummary } from "../lib/healthChecksApi";
import { deploymentStatusToUi, incidentStatusToUi, formatRelativeTime, formatDuration } from "../lib/statusMap";

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon?: typeof Rocket }) {
  return (
    <div className="bg-card/90 border border-border rounded-2xl p-5 hover-lift surface-glow relative overflow-hidden">
      {Icon && <div className="absolute right-4 top-4 w-8 h-8 rounded-xl bg-accent text-accent-foreground grid place-items-center"><Icon className="w-4 h-4" /></div>}
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-3xl font-bold text-foreground mt-2 tabular-nums tracking-tight font-display">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-2">{sub}</p>}
    </div>
  );
}

export function DashboardPage({ onNav }: { onNav: (s: NavState) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentDeployments, setRecentDeployments] = useState<Deployment[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([projectsApi.list(), deploymentsApi.listRecent(), incidentsApi.listOpen(), healthChecksApi.getSummary()])
      .then(([p, deps, incs, h]) => {
        setProjects(p);
        setRecentDeployments(deps);
        setIncidents(incs);
        setHealth(h);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const deploysLast7d = recentDeployments.filter(d => new Date(d.createdAt).getTime() >= sevenDaysAgo).length;

  return (
    <PageFade>
      <TopBar title="Dashboard" onNav={onNav} />
      <div className="p-6 max-w-6xl space-y-6">
        <section className="rounded-3xl overflow-hidden border border-primary/20 p-6 sm:p-8 relative bg-[linear-gradient(115deg,#151d45,#182f5f_52%,#14425b)] surface-glow">
          <div className="absolute -right-12 -top-20 w-72 h-72 rounded-full bg-[#6d7bff]/30 blur-3xl" /><div className="absolute right-16 bottom-0 w-48 h-32 rounded-full bg-[#39d2ff]/20 blur-3xl" />
          <div className="relative flex items-end justify-between gap-6 flex-wrap"><div><div className="flex items-center gap-2 text-[#a9dfff] text-xs font-semibold uppercase tracking-[.16em]"><Radio className="w-3.5 h-3.5 animate-pulse" /> Operations overview</div><h1 className="text-3xl sm:text-4xl text-white font-bold font-display mt-3">Everything is in view.</h1><p className="text-sm text-[#bed0ed] mt-2 max-w-lg">Track releases, project health, and the signals that need your attention.</p></div><Btn variant="secondary" onClick={() => setShowNewProject(true)} className="bg-white text-[#17224a] border-0 hover:bg-[#e7f3ff]"><Plus className="w-4 h-4" />New project</Btn></div>
        </section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active projects" value={String(projects.length)} sub={`${projects.length} repos monitored`} icon={Rocket} />
          <StatCard label="Deployments (7d)" value={String(deploysLast7d)} sub="Release velocity" icon={ArrowUpRight} />
          {/* Uptime monitoring is now real — backed by the simulated HealthCheck scheduler */}
          <Gauge
            percentage={health?.uptimePercentage ?? null}
            label="Mean uptime"
            sub={health?.avgResponseTime != null ? `${health.avgResponseTime}ms avg response` : undefined}
          />
          <StatCard label="Open incidents" value={String(incidents.length)} sub={incidents.length ? "Needs attention" : "All clear"} icon={CircleAlert} />
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
              {incidents.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted-foreground">No open incidents.</p>
              ) : (
                <div className="divide-y divide-border">
                  {incidents.map(inc => (
                    <div key={inc.id} className="px-5 py-3.5 space-y-2">
                      <p className="text-xs text-foreground leading-snug">{inc.title}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={incidentStatusToUi(inc.status)} />
                        <Mono className="text-muted-foreground">{inc.project?.slug ?? ""}</Mono>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(inc.openedAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>

        <SectionCard title="Recent deployments">
          {recentDeployments.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">No deployments yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentDeployments.map(dep => (
                <button
                  key={dep.id}
                  onClick={() => onNav({
                    page: "deployment",
                    projectId: dep.environment?.project?.id ?? "",
                    deploymentId: dep.id,
                  })}
                  className="w-full px-5 py-3 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left cursor-pointer"
                >
                  <div className="w-24 flex-shrink-0">
                    <StatusBadge status={deploymentStatusToUi(dep.status)} pulse={dep.status === "RUNNING"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{dep.commitMessage}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Mono className="text-muted-foreground">{dep.commitSha.slice(0, 7)}</Mono>
                      <span className="text-muted-foreground text-xs">·</span>
                      <Mono className="text-muted-foreground">{dep.environment?.project?.slug ?? ""}</Mono>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 text-xs text-muted-foreground">
                    <div>{formatRelativeTime(dep.createdAt)}</div>
                    {dep.duration != null && <div className="font-mono mt-0.5">{formatDuration(dep.duration)}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreated={loadAll}
        />
      )}
    </PageFade>
  );
}
