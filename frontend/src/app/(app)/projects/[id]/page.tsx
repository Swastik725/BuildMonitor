"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { deploymentTone, healthTone, isLive } from "@/lib/status";
import type {
  Deployment,
  GithubRepoOption,
  HealthCheck,
  Incident,
  Metric,
  Project,
  Repository,
} from "@/lib/types";

const TABS = ["Overview", "Repository", "Deployments", "Health", "Metrics", "Incidents"] as const;
type Tab = (typeof TABS)[number];

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [tab, setTab] = useState<Tab>("Overview");

  const { data: project, reload: reloadProject } = useFetch(
    () => api.get<Project>(`/projects/${projectId}`),
    [projectId],
  );

  if (!project) return <p className="text-sm text-text-muted">Loading project...</p>;

  const productionEnv = project.environments?.find((e) => e.environmentType === "PRODUCTION");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="font-mono text-xs text-text-muted">
            {project.defaultBranch} · {project.visibility}
          </p>
        </div>
        <StatusPill tone={project.monitoringEnabled ? "success" : "neutral"}>
          {project.monitoringEnabled ? "Monitoring active" : "Monitoring paused"}
        </StatusPill>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm transition-colors ${
              tab === t
                ? "border-b-2 border-accent text-text font-medium"
                : "text-text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <OverviewTab project={project} onChanged={reloadProject} />}
      {tab === "Repository" && <RepositoryTab projectId={projectId} />}
      {tab === "Deployments" && <DeploymentsTab projectId={projectId} />}
      {tab === "Health" && <HealthTab projectId={projectId} />}
      {tab === "Metrics" && productionEnv && (
        <MetricsTab projectId={projectId} environmentId={productionEnv.id} />
      )}
      {tab === "Metrics" && !productionEnv && (
        <p className="text-sm text-text-muted">No environment found for this project.</p>
      )}
      {tab === "Incidents" && <IncidentsTab projectId={projectId} />}
    </div>
  );
}

function OverviewTab({
  project,
  onChanged,
}: {
  project: Project;
  onChanged: () => void;
}) {
  const [saving, setSaving] = useState(false);

  const toggleMonitoring = async () => {
    setSaving(true);
    try {
      await api.patch(`/projects/${project.id}`, {
        monitoringEnabled: !project.monitoringEnabled,
      });
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 className="text-sm font-medium">Monitoring</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm text-text-muted">
            While paused, this project is skipped by the automatic health-check and metrics
            schedulers. Turn it on once the project is actually ready to be watched.
          </p>
          <Button variant={project.monitoringEnabled ? "secondary" : "primary"} loading={saving} onClick={toggleMonitoring}>
            {project.monitoringEnabled ? "Pause monitoring" : "Activate monitoring"}
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-medium">Details</h2>
        </CardHeader>
        <CardBody className="space-y-2 text-sm">
          <Row label="Slug" value={project.slug} mono />
          <Row label="Production URL" value={project.productionUrl || "Not set"} />
          <Row label="Health URL" value={project.healthUrl || "Not set"} />
          <Row label="Created" value={new Date(project.createdAt).toLocaleString()} />
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  );
}

function RepositoryTab({ projectId }: { projectId: string }) {
  const { data: repo, loading, reload } = useFetch(
    () => api.get<Repository | null>(`/projects/${projectId}/repository`),
    [projectId],
  );
  const [showPicker, setShowPicker] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = async () => {
    setSyncing(true);
    setError(null);
    try {
      await api.post(`/projects/${projectId}/repository/sync`);
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const disconnect = async () => {
    if (!confirm("Disconnect this repository?")) return;
    await api.delete(`/projects/${projectId}/repository`);
    reload();
  };

  if (loading) return <p className="text-sm text-text-muted">Loading repository...</p>;

  if (!repo) {
    return (
      <Card>
        <CardBody className="space-y-4 py-8 text-center">
          <p className="text-sm text-text-muted">No repository connected yet.</p>
          <Button onClick={() => setShowPicker(true)}>Connect from GitHub</Button>
          {error && <p className="text-sm text-error">{error}</p>}
        </CardBody>
        {showPicker && (
          <RepoPickerModal
            projectId={projectId}
            onClose={() => setShowPicker(false)}
            onConnected={() => {
              setShowPicker(false);
              reload();
            }}
          />
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-sm font-medium">
          {repo.githubOwner}/{repo.repositoryName}
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" loading={syncing} onClick={sync}>
            Sync
          </Button>
          <Button variant="danger" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      </CardHeader>
      <CardBody className="space-y-2 text-sm">
        <Row label="Default branch" value={repo.defaultBranch} mono />
        <Row label="Workflow file" value={repo.workflowFile || "deploy.yml"} mono />
        <Row label="Visibility" value={repo.visibility} />
        <Row label="Latest commit" value={repo.latestCommitSha?.slice(0, 7) || "-"} mono />
        <Row label="Commit message" value={repo.latestCommitMessage || "-"} />
        <Row
          label="Last synced"
          value={repo.lastSync ? new Date(repo.lastSync).toLocaleString() : "Never"}
        />
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block pt-1 text-xs text-accent hover:underline"
        >
          Open on GitHub {"->"}
        </a>
      </CardBody>
    </Card>
  );
}

function RepoPickerModal({
  projectId,
  onClose,
  onConnected,
}: {
  projectId: string;
  onClose: () => void;
  onConnected: () => void;
}) {
  const { data: repos, loading, error } = useFetch(
    () => api.get<GithubRepoOption[]>("/github/repositories"),
    [],
  );
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const connect = async (fullName: string) => {
    setConnecting(fullName);
    setConnectError(null);
    try {
      await api.post(`/projects/${projectId}/repository/connect`, { repository: fullName });
      onConnected();
    } catch (err) {
      setConnectError(err instanceof ApiError ? err.message : "Failed to connect repository");
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <Card className="max-h-[70vh] w-full max-w-lg overflow-hidden">
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Choose a repository</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            x
          </button>
        </CardHeader>
        <CardBody className="max-h-[55vh] space-y-1 overflow-y-auto">
          {loading && <p className="text-sm text-text-muted">Loading your repositories...</p>}
          {error && <p className="text-sm text-error">{error}</p>}
          {connectError && <p className="text-sm text-error">{connectError}</p>}
          {repos?.length === 0 && (
            <p className="text-sm text-text-muted">No repositories found on your GitHub account.</p>
          )}
          {repos?.map((r) => (
            <button
              key={r.id}
              onClick={() => connect(r.fullName)}
              disabled={connecting !== null}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-surface-2 disabled:opacity-50"
            >
              <div>
                <div className="text-sm">{r.fullName}</div>
                {r.description && (
                  <div className="line-clamp-1 text-xs text-text-muted">{r.description}</div>
                )}
              </div>
              <span className="font-mono text-xs text-text-muted">
                {connecting === r.fullName ? "Connecting..." : r.private ? "Private" : "Public"}
              </span>
            </button>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function DeploymentsTab({ projectId }: { projectId: string }) {
  const { data: deployments, loading, error, reload } = useFetch(
    () => api.get<Deployment[]>(`/projects/${projectId}/deployments`),
    [projectId],
  );
  const [triggering, setTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);

  const trigger = async () => {
    setTriggering(true);
    setTriggerError(null);
    try {
      await api.post(`/projects/${projectId}/deployments`, {});
      reload();
    } catch (err) {
      setTriggerError(err instanceof ApiError ? err.message : "Failed to trigger deployment");
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Triggers dispatch the connected repo's real GitHub Actions workflow.
        </p>
        <Button loading={triggering} onClick={trigger}>
          Trigger deployment
        </Button>
      </div>
      {triggerError && <p className="text-sm text-error">{triggerError}</p>}
      {loading && <p className="text-sm text-text-muted">Loading deployments...</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      <Card>
        <CardBody className="divide-y divide-border p-0">
          {deployments?.length === 0 && (
            <p className="px-5 py-6 text-sm text-text-muted">No deployments yet.</p>
          )}
          {deployments?.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-5 py-3">
              <Link href={`/deployments/${d.id}`} className="min-w-0">
                <div className="text-sm font-medium">{d.commitMessage}</div>
                <div className="font-mono text-xs text-text-muted">
                  {d.branch} · {d.commitSha.slice(0, 7)} ·{" "}
                  {new Date(d.createdAt).toLocaleString()}
                </div>
              </Link>
              <StatusPill tone={deploymentTone(d.status)} pulse={isLive(d.status)}>
                {d.status}
              </StatusPill>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function HealthTab({ projectId }: { projectId: string }) {
  const { data: checks, loading, error, reload } = useFetch(
    () => api.get<HealthCheck[]>(`/projects/${projectId}/health`),
    [projectId],
  );
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const checkNow = async () => {
    setChecking(true);
    setCheckError(null);
    try {
      await api.post(`/projects/${projectId}/health/check`);
      reload();
    } catch (err) {
      setCheckError(err instanceof ApiError ? err.message : "Health check failed");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Runs a real HTTP request against the project's configured health URL.
        </p>
        <Button loading={checking} onClick={checkNow}>
          Check now
        </Button>
      </div>
      {checkError && <p className="text-sm text-error">{checkError}</p>}
      {loading && <p className="text-sm text-text-muted">Loading health checks...</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      <Card>
        <CardBody className="divide-y divide-border p-0">
          {checks?.length === 0 && (
            <p className="px-5 py-6 text-sm text-text-muted">
              No health checks yet. Set a health URL for this project and run a check.
            </p>
          )}
          {checks?.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="text-sm">{c.message || "-"}</div>
                <div className="font-mono text-xs text-text-muted">
                  {new Date(c.checkedAt).toLocaleString()}
                  {c.responseTime != null ? ` · ${c.responseTime}ms` : ""}
                </div>
              </div>
              <StatusPill tone={healthTone(c.status)}>{c.status}</StatusPill>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function MetricsTab({ projectId, environmentId }: { projectId: string; environmentId: string }) {
  const { data: metrics, loading, error, reload } = useFetch(
    () => api.get<Metric[]>(`/environments/${environmentId}/metrics`),
    [environmentId],
  );
  const [collecting, setCollecting] = useState(false);
  const [collectError, setCollectError] = useState<string | null>(null);

  const collectNow = async () => {
    setCollecting(true);
    setCollectError(null);
    try {
      await api.post(`/projects/${projectId}/metrics/collect`);
      reload();
    } catch (err) {
      setCollectError(err instanceof ApiError ? err.message : "Failed to collect metrics");
    } finally {
      setCollecting(false);
    }
  };

  const latest = new Map<string, Metric>();
  metrics?.forEach((m) => {
    const existing = latest.get(m.metricType);
    if (!existing || new Date(m.recordedAt) > new Date(existing.recordedAt)) {
      latest.set(m.metricType, m);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Real CPU/memory/disk of the BuildMonitor server, plus real HTTP traffic stats.
        </p>
        <Button loading={collecting} onClick={collectNow}>
          Collect now
        </Button>
      </div>
      {collectError && <p className="text-sm text-error">{collectError}</p>}
      {loading && <p className="text-sm text-text-muted">Loading metrics...</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from(latest.values()).map((m) => (
          <Card key={m.metricType}>
            <CardBody>
              <div className="font-mono text-xl font-semibold">
                {m.value}
                {m.metricType === "ERROR_RATE" ? "%" : ""}
              </div>
              <div className="mt-1 text-xs text-text-muted">{m.metricType}</div>
            </CardBody>
          </Card>
        ))}
        {latest.size === 0 && !loading && (
          <p className="col-span-full text-sm text-text-muted">
            No metrics yet. Collect a snapshot to get started.
          </p>
        )}
      </div>
    </div>
  );
}

function IncidentsTab({ projectId }: { projectId: string }) {
  const { data: incidents, loading, error, reload } = useFetch(
    () => api.get<Incident[]>(`/projects/${projectId}/incidents`),
    [projectId],
  );
  const [showForm, setShowForm] = useState(false);

  const resolve = async (id: string) => {
    await api.patch(`/incidents/${id}/resolve`);
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Track and resolve incidents for this project.</p>
        <Button onClick={() => setShowForm(true)}>Report incident</Button>
      </div>
      {loading && <p className="text-sm text-text-muted">Loading incidents...</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      <Card>
        <CardBody className="divide-y divide-border p-0">
          {incidents?.length === 0 && (
            <p className="px-5 py-6 text-sm text-text-muted">No incidents reported.</p>
          )}
          {incidents?.map((i) => (
            <div key={i.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="text-sm font-medium">{i.title}</div>
                {i.description && (
                  <div className="text-xs text-text-muted">{i.description}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StatusPill tone={i.status === "OPEN" ? "error" : "success"}>
                  {i.status}
                </StatusPill>
                {i.status === "OPEN" && (
                  <Button variant="secondary" onClick={() => resolve(i.id)}>
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
