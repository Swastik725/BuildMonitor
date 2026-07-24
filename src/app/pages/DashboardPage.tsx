import { useMemo, useState, type ReactNode, type FormEvent } from "react";
import {
  Activity,
  ArrowUpRight,
  BellRing,
  Boxes,
  ChevronRight,
  Plus,
  Rocket,
  ShieldCheck,
  X,
} from "lucide-react";
import type { NavState } from "../lib/types";
import {
  deploymentsApi,
  healthApi,
  incidentsApi,
  metricsApi,
  organizationsApi,
  projectsApi,
  type Metric,
  type MetricType,
  type Project,
} from "../lib/api";
import { useResource } from "../lib/use-resource";
import { Btn, Mono, PageFade, StatusBadge } from "../components/primitives";
import { TopBar } from "../components/TopBar";

const status = (value: string) =>
  value === "SUCCESS"
    ? "success"
    : value === "FAILED"
      ? "failed"
      : value === "CANCELLED"
        ? "cancelled"
        : ("in-progress" as const);

const relative = (date: string) =>
  new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round((new Date(date).getTime() - Date.now()) / 60000),
    "minute",
  );

function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 py-12 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function Glass({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`glass-panel ${className}`}>{children}</section>;
}

function NewProjectModal({
  organizationId,
  onClose,
  onCreated,
}: {
  organizationId: string;
  onClose: () => void;
  onCreated: (project: Project) => void;
}) {
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("main");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      onCreated(
        await projectsApi.create({
          organizationId,
          name,
          slug,
          visibility: "PRIVATE",
          defaultBranch: branch,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/70 backdrop-blur-sm">
      <form
        onSubmit={create}
        className="w-full max-w-md glass-panel p-6 shadow-2xl shadow-black/50"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="eyebrow">New workspace</p>
            <h2 className="text-xl font-semibold mt-1">Create a project</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <label className="block text-sm">
            Project name
            <input
              required
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Production API"
              className="saas-input mt-1.5"
            />
          </label>
          <label className="block text-sm">
            Default branch
            <input
              required
              value={branch}
              onChange={e => setBranch(e.target.value)}
              className="saas-input mt-1.5"
            />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="ghost" onClick={onClose}>
              Cancel
            </Btn>
            <Btn type="submit" disabled={busy}>
              <Plus className="w-4 h-4" />
              {busy ? "Creating…" : "Create project"}
            </Btn>
          </div>
        </div>
      </form>
    </div>
  );
}

type DashboardProjectMetrics = {
  projectId: string;
  projectName: string;
  repositoryName: string | null;
  defaultBranch: string;
  metrics: Metric[];
};

const trackedMetricTypes: MetricType[] = [
  "CPU",
  "MEMORY",
  "LATENCY",
  "ERROR_RATE",
];

const metricLabel: Record<MetricType, string> = {
  CPU: "CPU",
  MEMORY: "Memory",
  LATENCY: "Latency",
  NETWORK: "Network",
  DISK: "Disk",
  REQUESTS: "Requests",
  ERROR_RATE: "Error rate",
};

function latestMetricValue(metrics: Metric[], metricType: MetricType) {
  const item = [...metrics].reverse().find(metric => metric.metricType === metricType);
  return item?.value ?? null;
}

function formatMetric(metricType: MetricType, value: number) {
  if (metricType === "LATENCY") {
    return `${Math.round(value)} ms`;
  }
  if (metricType === "REQUESTS") {
    return `${Math.round(value)} req/m`;
  }
  if (metricType === "NETWORK") {
    return `${Math.round(value)} mbps`;
  }
  return `${value.toFixed(1)}%`;
}

export function DashboardPage({ onNav }: { onNav: (s: NavState) => void }) {
  const projects = useResource(() => projectsApi.list());
  const deployments = useResource(() => deploymentsApi.recent(), [], 5000);
  const incidents = useResource(() => incidentsApi.open(), [], 15000);
  const health = useResource(() => healthApi.summary());
  const orgs = useResource(() => organizationsApi.list());

  const usableProjects = projects.data ?? [];

  const productionTargets = useMemo(
    () =>
      usableProjects
        .map(project => {
          const environment = project.environments?.find(
            item => item.environmentType === "PRODUCTION",
          );
          if (!environment) {
            return null;
          }

          return {
            projectId: project.id,
            projectName: project.name,
            repositoryName: project.repository?.repositoryName ?? null,
            defaultBranch: project.defaultBranch,
            environmentId: environment.id,
          };
        })
        .filter(
          (
            value,
          ): value is {
            projectId: string;
            projectName: string;
            repositoryName: string | null;
            defaultBranch: string;
            environmentId: string;
          } => Boolean(value),
        ),
    [usableProjects],
  );

  const workspaceMetrics = useResource<DashboardProjectMetrics[]>(
    async () => {
      if (!productionTargets.length) {
        return [];
      }

      return Promise.all(
        productionTargets.map(async target => ({
          projectId: target.projectId,
          projectName: target.projectName,
          repositoryName: target.repositoryName,
          defaultBranch: target.defaultBranch,
          metrics: await metricsApi.list(target.environmentId, { limit: 32 }),
        })),
      );
    },
    [productionTargets.map(target => target.environmentId).join("|")],
    10000,
  );

  const [creating, setCreating] = useState(false);

  const usableDeployments = deployments.data ?? [];
  const metricCards = workspaceMetrics.data ?? [];

  return (
    <PageFade>
      <TopBar title="Command center" />
      <div className="saas-page space-y-6">
        <div className="hero-grid relative overflow-hidden rounded-3xl px-6 py-8 md:px-8">
          <div className="relative z-10 max-w-2xl">
            <p className="eyebrow">Deployment intelligence</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Build with certainty.
              <br />
              <span className="text-primary">Ship with momentum.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              One calm, real-time view of every project, build, and production signal
              across your workspace.
            </p>
            <div className="mt-6 flex gap-3">
              <Btn onClick={() => setCreating(true)}>
                <Plus className="w-4 h-4" />
                New project
              </Btn>
              <Btn variant="secondary" onClick={() => deployments.refresh()}>
                <Activity className="w-4 h-4" />
                Refresh live data
              </Btn>
            </div>
          </div>
          <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <Metric
            icon={Boxes}
            label="Active projects"
            value={projects.loading ? "—" : String(usableProjects.length)}
            note="Connected to your workspace"
          />
          <Metric
            icon={Rocket}
            label="Recent deployments"
            value={deployments.loading ? "—" : String(usableDeployments.length)}
            note="Latest 20 deployments"
          />
          <Metric
            icon={ShieldCheck}
            label="Measured uptime"
            value={health.data?.uptimePercentage == null ? "—" : `${health.data.uptimePercentage}%`}
            note={health.data?.totalChecks ? `${health.data.totalChecks} health checks` : "No checks recorded yet"}
          />
          <Metric
            icon={BellRing}
            label="Open incidents"
            value={incidents.loading ? "—" : String(incidents.data?.length ?? 0)}
            note="Needs your attention"
          />
        </div>

        <div className="grid xl:grid-cols-5 gap-5">
          <Glass className="xl:col-span-3">
            <PanelTitle
              title="Projects"
              action={
                <button
                  onClick={() => setCreating(true)}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Create project
                </button>
              }
            />
            {projects.error ? (
              <Empty>{projects.error}</Empty>
            ) : !projects.loading && !usableProjects.length ? (
              <Empty>Create your first project to start monitoring deployments.</Empty>
            ) : (
              <div className="divide-y divide-white/[.06]">
                {usableProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => onNav({ page: "project", projectId: project.id })}
                    className="project-row"
                  >
                    <div className="project-orb">
                      {project.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Mono>{project.defaultBranch}</Mono> · {project.visibility.toLowerCase()}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-muted-foreground">Production</p>
                      <p className="mt-1 text-xs text-emerald-300">Ready</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </Glass>

          <Glass className="xl:col-span-2">
            <PanelTitle
              title="Incident feed"
              action={<span className="text-xs text-muted-foreground">{incidents.data?.length ?? 0} open</span>}
            />
            {incidents.error ? (
              <Empty>{incidents.error}</Empty>
            ) : !incidents.loading && !incidents.data?.length ? (
              <Empty>Everything looks healthy. No open incidents.</Empty>
            ) : (
              <div className="divide-y divide-white/[.06]">
                {incidents.data?.map(incident => (
                  <div key={incident.id} className="p-5">
                    <div className="flex justify-between gap-3">
                      <p className="text-sm font-medium leading-5">{incident.title}</p>
                      <span className="severity-dot" />
                    </div>
                    <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                      <span>{incident.project?.name ?? "Project"}</span>
                      <span>{relative(incident.openedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Glass>
        </div>

        <Glass>
          <PanelTitle
            title="Workspace metrics"
            action={
              <button
                onClick={() => void workspaceMetrics.refresh()}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Updated automatically
              </button>
            }
          />
          {!productionTargets.length ? (
            <Empty>No production environments found yet.</Empty>
          ) : workspaceMetrics.error ? (
            <Empty>{workspaceMetrics.error}</Empty>
          ) : !workspaceMetrics.loading && !metricCards.length ? (
            <Empty>Metrics will appear once a deployment starts.</Empty>
          ) : (
            <div className="grid gap-3 p-5 lg:grid-cols-2">
              {metricCards.map(card => (
                <div
                  key={card.projectId}
                  className="glass-panel border-white/[.06] bg-background/30 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{card.projectName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {card.repositoryName
                          ? `GitHub: ${card.repositoryName}`
                          : "Repository not connected"}
                      </p>
                    </div>
                    <button
                      className="text-xs text-primary hover:text-primary/80"
                      onClick={() =>
                        onNav({
                          page: "project",
                          projectId: card.projectId,
                        })
                      }
                    >
                      Open project
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {trackedMetricTypes.map(metricType => {
                      const value = latestMetricValue(card.metrics, metricType);
                      return (
                        <div key={metricType} className="rounded-2xl bg-white/[.03] p-3">
                          <p className="text-[11px] text-muted-foreground">
                            {metricLabel[metricType]}
                          </p>
                          <p className="mt-2 text-sm font-medium">
                            {value == null ? "—" : formatMetric(metricType, value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-xs text-muted-foreground flex items-center justify-between gap-3">
                    <span>
                      Default branch: <Mono>{card.defaultBranch}</Mono>
                    </span>
                    <span>{card.metrics.length} metric points</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Glass>

        <Glass>
          <PanelTitle
            title="Deployment activity"
            action={
              <button
                onClick={() => deployments.refresh()}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Updated automatically
              </button>
            }
          />
          {deployments.error ? (
            <Empty>{deployments.error}</Empty>
          ) : !deployments.loading && !usableDeployments.length ? (
            <Empty>Your new deployments will appear here.</Empty>
          ) : (
            <div className="divide-y divide-white/[.06]">
              {usableDeployments.map(dep => (
                <button
                  key={dep.id}
                  onClick={() =>
                    onNav({
                      page: "deployment",
                      projectId: dep.environment?.project?.id,
                      deploymentId: dep.id,
                    })
                  }
                  className="deployment-row"
                >
                  <StatusBadge
                    status={status(dep.status)}
                    pulse={dep.status === "RUNNING" || dep.status === "QUEUED"}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{dep.commitMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Mono>{dep.commitSha.slice(0, 7)}</Mono> · {dep.branch}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{relative(dep.createdAt)}</p>
                    <p className="mt-1">{dep.duration ? `${dep.duration}s` : "In progress"}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </Glass>
      </div>

      {creating && orgs.data?.[0] && (
        <NewProjectModal
          organizationId={orgs.data[0].id}
          onClose={() => setCreating(false)}
          onCreated={project => {
            setCreating(false);
            void projects.refresh();
            onNav({ page: "project", projectId: project.id });
          }}
        />
      )}
    </PageFade>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="metric-card">
      <span className="metric-icon">
        <Icon className="w-4 h-4" />
      </span>
      <p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function PanelTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.06]">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Workspace overview</p>
      </div>
      {action}
    </div>
  );
}
