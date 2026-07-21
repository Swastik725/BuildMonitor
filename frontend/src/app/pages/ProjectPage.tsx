import { useState, useEffect, useCallback } from "react";
import { GitBranch, Zap, ChevronRight, Globe } from "lucide-react";
import type { NavState } from "../lib/types";
import { PageFade, SectionCard, Btn, StatusBadge, Mono } from "../components/primitives";
import { TopBar } from "../components/TopBar";
import { projectsApi, type Project } from "../lib/projectsApi";
import { deploymentsApi, type Deployment } from "../lib/deploymentsApi";
import { healthChecksApi, type HealthCheck } from "../lib/healthChecksApi";
import { deploymentStatusToUi, formatRelativeTime, formatDuration } from "../lib/statusMap";

export function ProjectPage({ projectId, onNav }: { projectId: string; onNav: (s: NavState) => void }) {
  const [project, setProject] = useState<Project | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([projectsApi.get(projectId), deploymentsApi.listByProject(projectId), healthChecksApi.getByProject(projectId)])
      .then(([p, deps, checks]) => {
        setProject(p);
        setDeployments(deps);
        setHealthChecks(checks);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load project"))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  async function handleDeploy() {
    setDeploying(true);
    try {
      await deploymentsApi.trigger(projectId, {});
      load(); // refresh list to show the new QUEUED deployment
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger deployment");
    } finally {
      setDeploying(false);
    }
  }

  if (loading) {
    return (
      <PageFade>
        <TopBar title="Loading…" crumbs={[{ label: "Projects", nav: { page: "dashboard" } }]} onCrumb={onNav} onNav={onNav} />
        <div className="p-5 text-sm text-muted-foreground">Loading project…</div>
      </PageFade>
    );
  }

  if (error || !project) {
    return (
      <PageFade>
        <TopBar title="Error" crumbs={[{ label: "Projects", nav: { page: "dashboard" } }]} onCrumb={onNav} onNav={onNav} />
        <div className="p-5 text-sm text-destructive">{error ?? "Project not found"}</div>
      </PageFade>
    );
  }

  const latest = deployments[0];
  const successCount = deployments.filter(d => d.status === "SUCCESS").length;
  const successRate = deployments.length > 0 ? `${Math.round((successCount / deployments.length) * 100)}%` : "—";
  const avgDurations = deployments.filter(d => d.duration != null).map(d => d.duration!) as number[];
  const avgDuration = avgDurations.length > 0
    ? formatDuration(Math.round(avgDurations.reduce((a, b) => a + b, 0) / avgDurations.length))
    : "—";

  const productionEnv = project.environments?.find(e => e.environmentType === "PRODUCTION");

  return (
    <PageFade>
      <TopBar
        title={project.name}
        crumbs={[{ label: "Projects", nav: { page: "dashboard" } }]}
        onCrumb={onNav}
        onNav={onNav}
      />
      <div className="p-6 max-w-5xl space-y-6">
        <div className="bg-card border border-border rounded-3xl p-6 surface-glow relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <h1 className="text-2xl font-bold text-foreground font-display">{project.name}</h1>
                {latest && <StatusBadge status={deploymentStatusToUi(latest.status)} pulse={latest.status === "RUNNING"} />}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" />
                  <Mono className="text-muted-foreground">{project.defaultBranch}</Mono>
                </span>
                <span className="text-xs uppercase tracking-wide px-1.5 py-0.5 rounded bg-secondary">
                  {project.visibility}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Btn variant="primary" size="sm" onClick={handleDeploy} disabled={deploying}>
                <Zap className="w-3.5 h-3.5" />{deploying ? "Queuing…" : "Deploy now"}
              </Btn>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-5 relative">
            {[
              { label: "Success rate",   value: successRate },
              { label: "Total deploys",  value: String(deployments.length) },
              { label: "Avg build time", value: avgDuration ?? "—" },
              { label: "Last deploy",    value: formatRelativeTime(latest?.createdAt ?? null) },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold text-foreground mt-0.5 tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <SectionCard title="Deployment history" action={<span className="text-xs text-muted-foreground">{deployments.length} total</span>}>
          {deployments.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">No deployments yet — click "Deploy now" to trigger one.</p>
          ) : (
            <div className="divide-y divide-border">
              {deployments.map(dep => (
                <button
                  key={dep.id}
                  onClick={() => onNav({ page: "deployment", projectId: project.id, deploymentId: dep.id })}
                  className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left cursor-pointer"
                >
                  <div className="w-24 flex-shrink-0">
                    <StatusBadge status={deploymentStatusToUi(dep.status)} pulse={dep.status === "RUNNING"} />
                  </div>
                  <div className="w-16 flex-shrink-0">
                    <Mono className="text-muted-foreground">{dep.commitSha.slice(0, 7)}</Mono>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{dep.commitMessage}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{dep.triggeredBy?.fullName ?? "Unknown"}</p>
                  </div>
                  <div className="text-right flex-shrink-0 text-xs text-muted-foreground space-y-0.5">
                    <div>{formatRelativeTime(dep.createdAt)}</div>
                    {dep.duration != null && <div className="font-mono">{formatDuration(dep.duration)}</div>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Environment">
          <div className="px-5 py-3.5 flex items-center gap-3 border-b border-border">
            <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <Mono className="text-foreground text-xs flex-1 truncate">
              {productionEnv?.domain || "No domain configured yet"}
            </Mono>
            <span className="text-xs text-muted-foreground border border-border px-1.5 py-px rounded">production</span>
          </div>
          {healthChecks.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">No health checks recorded yet — the monitor pings every ~15s.</p>
          ) : (
            <div className="divide-y divide-border">
              {healthChecks.slice(0, 8).map(check => (
                <div key={check.id} className="px-5 py-2.5 flex items-center gap-4">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        check.status === "UP" ? "var(--primary)" :
                        check.status === "DEGRADED" ? "var(--pulse)" : "var(--destructive)",
                    }}
                  />
                  <span className="text-xs text-foreground w-20">{check.status}</span>
                  <span className="text-xs text-muted-foreground flex-1">HTTP {check.statusCode}</span>
                  <Mono className="text-muted-foreground">{check.responseTime}ms</Mono>
                  <span className="text-xs text-muted-foreground w-20 text-right">{formatRelativeTime(check.checkedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </PageFade>
  );
}
