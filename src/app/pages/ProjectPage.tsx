import { useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  GitBranch,
  Globe2,
  Link2,
  Rocket,
  ShieldCheck,
  X,
} from "lucide-react";
import type { NavState } from "../lib/types";
import {
  deploymentsApi,
  projectsApi,
  repositoriesApi,
  type DeploymentStatus,
} from "../lib/api";
import { useResource } from "../lib/use-resource";
import { Btn, Mono, PageFade, StatusBadge } from "../components/primitives";
import { TopBar } from "../components/TopBar";

const displayStatus = (value: DeploymentStatus) =>
  value === "SUCCESS"
    ? "success"
    : value === "FAILED"
      ? "failed"
      : value === "CANCELLED"
        ? "cancelled"
        : "in-progress";

const date = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function ProjectPage({
  projectId,
  onNav,
}: {
  projectId: string;
  onNav: (s: NavState) => void;
}) {
  const project = useResource(() => projectsApi.get(projectId), [projectId]);
  const deployments = useResource(
    () => deploymentsApi.list(projectId),
    [projectId],
    4000,
  );

  const [deploying, setDeploying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [repoOpen, setRepoOpen] = useState(false);
  const [repoInput, setRepoInput] = useState("");
  const [repoBusy, setRepoBusy] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const deploy = async () => {
    setDeploying(true);
    try {
      const result = await deploymentsApi.trigger(projectId, {
        branch: project.data?.defaultBranch,
        commitMessage: "Manual deployment from BuildMonitor",
      });
      onNav({ page: "deployment", projectId, deploymentId: result.id });
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not trigger deployment",
      );
    } finally {
      setDeploying(false);
    }
  };

  const connectRepository = async (event: React.FormEvent) => {
    event.preventDefault();
    setRepoBusy(true);
    setRepoError(null);
    try {
      await repositoriesApi.connect(projectId, repoInput);
      setRepoOpen(false);
      setRepoInput("");
      void project.refresh();
    } catch (err) {
      setRepoError(
        err instanceof Error ? err.message : "Could not connect repository",
      );
    } finally {
      setRepoBusy(false);
    }
  };

  const syncRepository = async () => {
    setRepoBusy(true);
    setRepoError(null);
    try {
      await repositoriesApi.sync(projectId);
      void project.refresh();
    } catch (err) {
      setRepoError(err instanceof Error ? err.message : "Could not sync repository");
    } finally {
      setRepoBusy(false);
    }
  };

  const disconnectRepository = async () => {
    if (!window.confirm("Disconnect this repository from the project?")) {
      return;
    }

    setRepoBusy(true);
    setRepoError(null);
    try {
      await repositoriesApi.disconnect(projectId);
      void project.refresh();
    } catch (err) {
      setRepoError(
        err instanceof Error ? err.message : "Could not disconnect repository",
      );
    } finally {
      setRepoBusy(false);
    }
  };

  if (project.loading) {
    return (
      <PageFade>
        <TopBar title="Project" />
        <div className="saas-page">
          <div className="glass-panel p-8 text-muted-foreground">
            Loading project workspace…
          </div>
        </div>
      </PageFade>
    );
  }

  if (!project.data) {
    return (
      <PageFade>
        <TopBar title="Project" />
        <div className="saas-page">
          <div className="glass-panel p-8 text-destructive">
            {project.error || "Project could not be found."}
          </div>
        </div>
      </PageFade>
    );
  }

  const item = project.data;
  const active = deployments.data?.find(
    d => d.status === "RUNNING" || d.status === "QUEUED",
  );

  return (
    <PageFade>
      <TopBar
        title={item.name}
        crumbs={[{ label: "Command center", nav: { page: "dashboard" } }]}
        onCrumb={onNav}
      />
      <div className="saas-page space-y-5">
        <section className="project-hero overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="live-dot">Production</span>
              <span className="text-xs text-muted-foreground">
                {item.visibility.toLowerCase()} project
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {item.name}
            </h1>
            <p className="mt-2 text-sm max-w-xl text-muted-foreground">
              {item.description ||
                "Deployment controls, build history, and production health in one focused view."}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" />
                <Mono>{item.defaultBranch}</Mono>
              </span>
              {item.productionUrl && (
                <a
                  href={item.productionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground"
                >
                  <Globe2 className="w-3.5 h-3.5" />
                  Live site <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <div className="relative z-10 flex flex-wrap items-start gap-2">
            <Btn
              variant="secondary"
              onClick={() => item.repository?.htmlUrl && window.open(item.repository.htmlUrl, "_blank")}
              disabled={!item.repository?.htmlUrl}
            >
              Repository
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Btn>
            <Btn onClick={deploy} disabled={deploying}>
              <Rocket className="w-4 h-4" />
              {deploying ? "Starting…" : "Deploy"}
            </Btn>
          </div>
          <div className="absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        </section>

        {actionError && (
          <div className="glass-panel border-destructive/30 px-5 py-3 text-sm text-destructive">
            {actionError}
          </div>
        )}
        {repoError && (
          <div className="glass-panel border-destructive/30 px-5 py-3 text-sm text-destructive">
            {repoError}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-3">
          <Signal
            label="Production environment"
            value={
              item.environments?.find(e => e.environmentType === "PRODUCTION")?.name ||
              "Production"
            }
            icon={Globe2}
          />
          <Signal
            label="Deployment status"
            value={active ? "Deploying now" : "Standing by"}
            icon={Rocket}
          />
          <Signal
            label="Health monitoring"
            value={item.healthUrl ? "Configured" : "Not configured"}
            icon={ShieldCheck}
          />
        </div>

        <section className="glass-panel">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.06]">
            <div>
              <h2 className="text-sm font-semibold">Repository</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                GitHub source connection and sync status
              </p>
            </div>
            {item.repository ? (
              <div className="flex gap-2">
                <Btn
                  variant="secondary"
                  onClick={() => void syncRepository()}
                  disabled={repoBusy}
                >
                  Sync now
                </Btn>
                <Btn
                  variant="danger"
                  onClick={() => void disconnectRepository()}
                  disabled={repoBusy}
                >
                  Disconnect
                </Btn>
              </div>
            ) : (
              <Btn variant="secondary" onClick={() => setRepoOpen(true)}>
                <Link2 className="w-3.5 h-3.5" />
                Connect repository
              </Btn>
            )}
          </div>

          {item.repository ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 p-5">
              <RepoStat
                label="Source"
                value={`${item.repository.githubOwner}/${item.repository.repositoryName}`}
              />
              <RepoStat label="Default branch" value={item.repository.defaultBranch} />
              <RepoStat
                label="Last sync"
                value={item.repository.lastSync ? date(item.repository.lastSync) : "Never"}
              />
              <RepoStat
                label="Latest commit"
                value={
                  item.repository.latestCommitSha
                    ? `${item.repository.latestCommitSha.slice(0, 7)}${
                        item.repository.latestCommitMessage
                          ? ` · ${item.repository.latestCommitMessage}`
                          : ""
                      }`
                    : "No sync yet"
                }
              />
              <div className="md:col-span-2 xl:col-span-4 text-xs text-muted-foreground px-5 pb-5 flex flex-wrap gap-4">
                <span>
                  <Mono>{item.repository.cloneUrl}</Mono>
                </span>
                {item.repository.latestCommitAuthor && (
                  <span>Author: {item.repository.latestCommitAuthor}</span>
                )}
                {item.repository.latestCommitDate && (
                  <span>Committed: {date(item.repository.latestCommitDate)}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 text-sm text-muted-foreground">
              Connect a GitHub repository to pull in branch and latest commit metadata.
            </div>
          )}
        </section>

        <section className="glass-panel">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.06]">
            <div>
              <h2 className="text-sm font-semibold">Deployment history</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Updates automatically while a build is active
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {deployments.data?.length ?? 0} deployments
            </span>
          </div>
          {deployments.error ? (
            <div className="p-6 text-sm text-destructive">{deployments.error}</div>
          ) : !deployments.loading && !deployments.data?.length ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No deployments yet. Launch your first one when you’re ready.
            </div>
          ) : (
            <div className="divide-y divide-white/[.06]">
              {deployments.data?.map(deployment => (
                <button
                  key={deployment.id}
                  onClick={() =>
                    onNav({ page: "deployment", projectId, deploymentId: deployment.id })
                  }
                  className="deployment-row"
                >
                  <StatusBadge
                    status={displayStatus(deployment.status)}
                    pulse={
                      deployment.status === "RUNNING" || deployment.status === "QUEUED"
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{deployment.commitMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Mono>{deployment.commitSha.slice(0, 7)}</Mono> ·{" "}
                      <Mono>{deployment.branch}</Mono> ·{" "}
                      {deployment.triggeredBy?.fullName || "You"}
                    </p>
                  </div>
                  <div className="hidden sm:block text-right text-xs text-muted-foreground">
                    <p>{date(deployment.createdAt)}</p>
                    <p className="mt-1">
                      {deployment.duration ? `${deployment.duration}s build` : "Processing"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </section>

        {repoOpen && (
          <ConnectRepoModal
            busy={repoBusy}
            onClose={() => setRepoOpen(false)}
            onSubmit={connectRepository}
            value={repoInput}
            onChange={setRepoInput}
          />
        )}
      </div>
    </PageFade>
  );
}

function ConnectRepoModal({
  busy,
  onClose,
  onSubmit,
  value,
  onChange,
}: {
  busy: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/70 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md glass-panel p-6 shadow-2xl shadow-black/50"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="eyebrow">Repository</p>
            <h2 className="text-xl font-semibold mt-1">Connect GitHub repo</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <label className="block text-sm">
            Owner / repo or GitHub URL
            <input
              required
              autoFocus
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="vercel/next.js"
              className="saas-input mt-1.5"
            />
          </label>
          <p className="text-xs text-muted-foreground">
            Public repos work immediately. Private repos require a configured `GITHUB_TOKEN`
            on the backend.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="ghost" onClick={onClose}>
              Cancel
            </Btn>
            <Btn type="submit" disabled={busy}>
              Connect
            </Btn>
          </div>
        </div>
      </form>
    </div>
  );
}

function RepoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium break-words">{value}</p>
    </div>
  );
}

function Signal({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Globe2;
}) {
  return (
    <div className="glass-panel p-5">
      <Icon className="w-4 h-4 text-primary" />
      <p className="mt-4 text-sm font-medium">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
