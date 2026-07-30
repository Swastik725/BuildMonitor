import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { StatusPill } from '../components/StatusPill';
import { GlassCard, GlassButton } from '../components/GlassCard';
import {
  projectsApi,
  reposApi,
  deploymentsApi,
  healthApi,
  incidentsApi,
  codeCheckerApi,
  type Project,
  type Deployment,
  type HealthCheck,
  type Incident,
  type GithubRepoOption,
  type CodeCheckReport,
  type CodeFinding,
} from '../lib/api';

type Tab = 'repository' | 'deployments' | 'health' | 'incidents' | 'code-check' | 'settings';

const PREVIEW_DEPLOYMENTS: Deployment[] = [
  { id: 'p1', environmentId: 'e', branch: 'main', commitSha: 'a3f9c2e8b1', commitMessage: 'Fix auth token refresh race condition', status: 'SUCCESS', duration: 87, createdAt: new Date().toISOString(), startedAt: null, finishedAt: null },
  { id: 'p2', environmentId: 'e', branch: 'main', commitSha: '7b1e4d091f', commitMessage: 'Add health check retry logic', status: 'RUNNING', duration: null, createdAt: new Date().toISOString(), startedAt: null, finishedAt: null },
  { id: 'p3', environmentId: 'e', branch: 'feature/oauth', commitSha: 'c92a831de4', commitMessage: 'WIP: GitHub App install flow', status: 'FAILED', duration: 34, createdAt: new Date().toISOString(), startedAt: null, finishedAt: null },
];

const PREVIEW_HEALTH: HealthCheck[] = [
  { id: 'h1', status: 'healthy', statusCode: 200, responseTime: 142, message: null, checkedAt: new Date().toISOString() },
  { id: 'h2', status: 'healthy', statusCode: 200, responseTime: 158, message: null, checkedAt: new Date(Date.now() - 60000).toISOString() },
  { id: 'h3', status: 'unhealthy', statusCode: 503, responseTime: 4021, message: 'Gateway timeout', checkedAt: new Date(Date.now() - 120000).toISOString() },
];

const PREVIEW_INCIDENTS: Incident[] = [
  { id: 'i1', title: 'Elevated response times on /api/deployments', status: 'RESOLVED', openedAt: new Date(Date.now() - 86400000).toISOString(), resolvedAt: new Date(Date.now() - 82800000).toISOString() },
];

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState<Tab>('repository');
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!id) return;
    setLoading(true);
    projectsApi.get(id).then(res => setProject(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) {
    return (
      <Layout>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <p className="text-sm" style={{ color: 'var(--fail)' }}>Project not found.</p>
      </Layout>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'repository', label: 'Repository' },
    { key: 'deployments', label: 'Deployments' },
    { key: 'health', label: 'Health' },
    { key: 'incidents', label: 'Incidents' },
    { key: 'code-check', label: 'Code Checker' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{project.name}</h1>
        <p className="text-xs font-mono mt-1" style={{ color: 'var(--muted)' }}>{project.slug}</p>
      </div>

      <div className="flex gap-1 mb-6 border-b relative overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className="relative px-3 py-2 text-sm font-medium whitespace-nowrap">
            <span style={{ color: tab === t.key ? 'var(--text)' : 'var(--muted)' }}>{t.label}</span>
            {tab === t.key && (
              <motion.div
                layoutId="project-tab-underline"
                className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {tab === 'repository' && <RepositoryTab project={project} onChange={load} />}
          {tab === 'deployments' && <DeploymentsTab projectId={project.id} />}
          {tab === 'health' && <HealthTab projectId={project.id} />}
          {tab === 'incidents' && <IncidentsTab projectId={project.id} />}
          {tab === 'code-check' && <CodeCheckTab projectId={project.id} hasRepo={!!project.repository} />}
          {tab === 'settings' && <SettingsTab project={project} onDeleted={() => navigate('/')} />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

function PreviewBadge() {
  return (
    <span
      className="text-[10px] font-mono px-2 py-1 rounded-full"
      style={{ color: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
    >
      Preview data
    </span>
  );
}

function RepositoryTab({ project, onChange }: { project: Project; onChange: () => void }) {
  const [available, setAvailable] = useState<GithubRepoOption[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [changingRepo, setChangingRepo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      await reposApi.sync(project.id);
      onChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not sync. Your GitHub session may have expired — try signing in with GitHub again.');
    } finally {
      setSyncing(false);
    }
  };

  const loadAvailable = () => {
    setLoadingList(true);
    setError(null);
    reposApi
      .listAvailable()
      .then(res => setAvailable(res.data))
      .catch(err =>
        setError(
          err.response?.data?.message ||
            'Could not load your GitHub repositories. Sign in with GitHub first, from the login page.',
        ),
      )
      .finally(() => setLoadingList(false));
  };

  const handleConnect = async (fullName: string) => {
    setConnecting(fullName);
    setError(null);
    try {
      await reposApi.connect(project.id, fullName);
      setChangingRepo(false);
      setAvailable([]);
      onChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not connect that repository.');
    } finally {
      setConnecting(null);
    }
  };

  const handleStartChangeRepo = () => {
    setChangingRepo(true);
    loadAvailable();
  };

  if (project.repository && !changingRepo) {
    const repo = project.repository;
    return (
      <GlassCard className="p-5 max-w-lg">
        <p className="font-mono text-sm font-medium" style={{ color: 'var(--text)' }}>
          {repo.githubOwner}/{repo.repositoryName}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          Default branch: <span className="font-mono">{repo.defaultBranch}</span>
        </p>
        {repo.latestCommitMessage && (
          <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
            Latest: <span style={{ color: 'var(--text)' }}>{repo.latestCommitMessage}</span>
            {repo.latestCommitAuthor && ` — ${repo.latestCommitAuthor}`}
          </p>
        )}
        <div className="mt-4 flex gap-2 flex-wrap">
          <GlassButton variant="ghost" onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Sync now'}
          </GlassButton>
          <GlassButton variant="ghost" onClick={handleStartChangeRepo}>
            Change repository
          </GlassButton>
          <a href={repo.htmlUrl ?? '#'} target="_blank" rel="noreferrer">
            <GlassButton variant="ghost">View on GitHub</GlassButton>
          </a>
        </div>
        {error && <p className="text-xs mt-3" style={{ color: 'var(--fail)' }}>{error}</p>}
      </GlassCard>
    );
  }

  return (
    <div>
      {changingRepo && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Currently connected: <span className="font-mono">{project.repository?.githubOwner}/{project.repository?.repositoryName}</span>
          </p>
          <button onClick={() => setChangingRepo(false)} className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            Cancel
          </button>
        </div>
      )}

      {available.length === 0 && !loadingList && (
        <GlassButton onClick={loadAvailable}>Browse your GitHub repositories</GlassButton>
      )}

      {loadingList && <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading your repositories…</p>}
      {error && <p className="text-sm mt-3" style={{ color: 'var(--fail)' }}>{error}</p>}

      {available.length > 0 && (
        <div className="flex flex-col gap-2 mt-4 max-w-lg">
          {available.map(repo => (
            <GlassCard key={repo.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm" style={{ color: 'var(--text)' }}>{repo.fullName}</p>
                {repo.description && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{repo.description}</p>
                )}
              </div>
              <GlassButton
                onClick={() => handleConnect(repo.fullName)}
                disabled={connecting === repo.fullName}
                className="shrink-0"
              >
                {connecting === repo.fullName ? 'Connecting…' : 'Connect'}
              </GlassButton>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function DeploymentsTab({ projectId }: { projectId: string }) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const load = () => {
    setLoading(true);
    deploymentsApi
      .listByProject(projectId)
      .then(res => {
        if (res.data.length === 0) {
          setDeployments(PREVIEW_DEPLOYMENTS);
          setIsPreview(true);
        } else {
          setDeployments(res.data);
          setIsPreview(false);
        }
      })
      .catch(() => setError('Could not load deployments.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [projectId]);

  const handleTrigger = async () => {
    setTriggering(true);
    setError(null);
    try {
      await deploymentsApi.trigger(projectId);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not trigger a deployment. Connect a repository first.');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {deployments.length} deployment{deployments.length === 1 ? '' : 's'}
          </p>
          {isPreview && <PreviewBadge />}
        </div>
        <GlassButton onClick={handleTrigger} disabled={triggering}>
          {triggering ? 'Dispatching…' : 'Trigger deployment'}
        </GlassButton>
      </div>

      {error && <p className="text-sm mb-4" style={{ color: 'var(--fail)' }}>{error}</p>}

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {deployments.map(d => (
            <GlassCard key={d.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>{d.commitSha.slice(0, 7)}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{d.branch}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{d.commitMessage}</p>
              </div>
              <StatusPill status={d.status} />
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function HealthTab({ projectId }: { projectId: string }) {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const load = () => {
    setLoading(true);
    healthApi
      .listByProject(projectId)
      .then(res => {
        if (res.data.length === 0) {
          setChecks(PREVIEW_HEALTH);
          setIsPreview(true);
        } else {
          setChecks(res.data);
          setIsPreview(false);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [projectId]);

  const handleCheckNow = async () => {
    setChecking(true);
    try {
      await healthApi.checkNow(projectId);
      load();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{checks.length} check{checks.length === 1 ? '' : 's'}</p>
          {isPreview && <PreviewBadge />}
        </div>
        <GlassButton onClick={handleCheckNow} disabled={checking}>
          {checking ? 'Checking…' : 'Check now'}
        </GlassButton>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {checks.map(c => (
            <GlassCard key={c.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{new Date(c.checkedAt).toLocaleString()}</p>
                {c.responseTime !== null && (
                  <p className="text-xs font-mono mt-1" style={{ color: 'var(--text)' }}>{c.responseTime}ms</p>
                )}
                {c.message && <p className="text-xs mt-1" style={{ color: 'var(--fail)' }}>{c.message}</p>}
              </div>
              <StatusPill status={c.status} />
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function IncidentsTab({ projectId }: { projectId: string }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  const load = () => {
    setLoading(true);
    incidentsApi
      .listByProject(projectId)
      .then(res => {
        if (res.data.length === 0) {
          setIncidents(PREVIEW_INCIDENTS);
          setIsPreview(true);
        } else {
          setIncidents(res.data);
          setIsPreview(false);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [projectId]);

  const handleResolve = async (id: string) => {
    await incidentsApi.resolve(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {isPreview && <PreviewBadge />}
      </div>
      {loading ? (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {incidents.map(inc => (
            <GlassCard key={inc.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text)' }}>{inc.title}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Opened {new Date(inc.openedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={inc.status} />
                {inc.status !== 'RESOLVED' && !isPreview && (
                  <button onClick={() => handleResolve(inc.id)} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                    Resolve
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

const SEVERITY_COLOR: Record<CodeFinding['severity'], string> = {
  critical: 'var(--fail)',
  error: 'var(--fail)',
  warning: 'var(--pending)',
  info: 'var(--muted)',
};

function CodeCheckTab({ projectId, hasRepo }: { projectId: string; hasRepo: boolean }) {
  const [report, setReport] = useState<CodeCheckReport | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = () => {
    setLoadingHistory(true);
    codeCheckerApi
      .history(projectId)
      .then(res => {
        if (res.data.length > 0) setReport(res.data[0]);
      })
      .finally(() => setLoadingHistory(false));
  };

  useEffect(loadHistory, [projectId]);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await codeCheckerApi.run(projectId);
      setReport(res.data);
      loadHistory();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not run the code check.');
    } finally {
      setRunning(false);
    }
  };

  if (!hasRepo) {
    return (
      <GlassCard className="p-8 text-center border-dashed">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Connect a GitHub repository first, from the Repository tab, before running a check.
        </p>
      </GlassCard>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {report ? `Last checked ${new Date(report.checkedAt).toLocaleString()} · ${report.snapshot.commitSha.slice(0, 7)}` : 'No checks run yet'}
        </p>
        <GlassButton onClick={handleRun} disabled={running}>
          {running ? 'Analyzing…' : 'Run check'}
        </GlassButton>
      </div>

      {error && <p className="text-sm mb-4" style={{ color: 'var(--fail)' }}>{error}</p>}

      {loadingHistory ? (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : !report ? (
        <GlassCard className="p-8 text-center border-dashed">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Run your first check to scan for missing scripts, workflows, and config issues.
          </p>
        </GlassCard>
      ) : report.findings.length === 0 ? (
        <GlassCard className="p-8 text-center border-dashed">
          <p className="text-sm" style={{ color: 'var(--success)' }}>No issues found. Clean report.</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {report.findings.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-mono font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                          style={{ color: SEVERITY_COLOR[f.severity], backgroundColor: `color-mix(in srgb, ${SEVERITY_COLOR[f.severity]} 15%, transparent)` }}
                        >
                          {f.severity}
                        </span>
                        {f.source === 'llm' && (
                          <span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>AI-enriched</span>
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1.5" style={{ color: 'var(--text)' }}>{f.title}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{f.details}</p>
                      {f.suggestedFix && (
                        <p className="text-xs mt-2 font-mono" style={{ color: 'var(--accent)' }}>→ {f.suggestedFix}</p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function SettingsTab({ project, onDeleted }: { project: Project; onDeleted: () => void }) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText === project.slug;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await projectsApi.delete(project.id);
      onDeleted();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete this project.');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-lg flex flex-col gap-4">
      <GlassCard className="p-5">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Project details</p>
        <div className="mt-3 flex flex-col gap-2 text-xs">
          <div className="flex justify-between"><span style={{ color: 'var(--muted)' }}>Name</span><span style={{ color: 'var(--text)' }}>{project.name}</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--muted)' }}>Slug</span><span className="font-mono" style={{ color: 'var(--text)' }}>{project.slug}</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--muted)' }}>Visibility</span><span style={{ color: 'var(--text)' }}>{project.visibility}</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--muted)' }}>Default branch</span><span className="font-mono" style={{ color: 'var(--text)' }}>{project.defaultBranch}</span></div>
        </div>
      </GlassCard>

      <GlassCard className="p-5" style={{ borderColor: 'var(--fail)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--fail)' }}>Danger zone</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          Deleting this project removes it and its deployment, health, and incident history permanently. This cannot be undone.
        </p>
        <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
          Type <span className="font-mono" style={{ color: 'var(--text)' }}>{project.slug}</span> to confirm:
        </p>
        <input
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder={project.slug}
          className="w-full rounded-md border px-3 py-2 text-sm font-mono mt-2"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
        />
        {error && <p className="text-xs mt-2" style={{ color: 'var(--fail)' }}>{error}</p>}
        <button
          onClick={handleDelete}
          disabled={!canDelete || deleting}
          className="w-full mt-3 rounded-md px-3 py-2 text-sm font-medium disabled:opacity-40"
          style={{ backgroundColor: 'var(--fail)', color: '#fff' }}
        >
          {deleting ? 'Deleting…' : 'Delete this project'}
        </button>
      </GlassCard>
    </div>
  );
}
