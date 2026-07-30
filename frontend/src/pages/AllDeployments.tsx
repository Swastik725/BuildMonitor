import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { StatusPill } from '../components/StatusPill';
import { projectsApi, deploymentsApi, type Deployment } from '../lib/api';

type Row = Deployment & { projectName: string; projectId: string };

export function AllDeploymentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setLoading(true);
    projectsApi
      .list()
      .then(async ({ data: projects }) => {
        const results = await Promise.all(
          projects.map(p =>
            deploymentsApi
              .listByProject(p.id)
              .then(res => res.data.map(d => ({ ...d, projectName: p.name, projectId: p.id })))
              .catch(() => []),
          ),
        );
        const flat = results.flat().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        if (flat.length === 0) {
          setRows(PREVIEW.map(r => ({ ...r })));
          setIsPreview(true);
        } else {
          setRows(flat);
          setIsPreview(false);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Deployments</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Across all your projects</p>
        </div>
        {isPreview && (
          <span
            className="text-[10px] font-mono px-2 py-1 rounded-full"
            style={{ color: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
          >
            Preview data
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={`/projects/${d.projectId}`}>
                <GlassCard className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium" style={{ color: 'var(--text)' }}>{d.projectName}</span>
                      <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{d.commitSha.slice(0, 7)}</span>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>{d.branch}</span>
                    </div>
                    <p className="text-xs mt-1 truncate" style={{ color: 'var(--muted)' }}>{d.commitMessage}</p>
                  </div>
                  <StatusPill status={d.status} />
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}

const PREVIEW: Row[] = [
  { id: 'p1', environmentId: 'e', projectId: '', projectName: 'buildmonitor-api', branch: 'main', commitSha: 'a3f9c2e8b1', commitMessage: 'Fix auth token refresh race condition', status: 'SUCCESS', duration: 87, createdAt: new Date().toISOString(), startedAt: null, finishedAt: null },
  { id: 'p2', environmentId: 'e', projectId: '', projectName: 'fluxora-landing', branch: 'main', commitSha: '7b1e4d091f', commitMessage: 'Add health check retry logic', status: 'RUNNING', duration: null, createdAt: new Date().toISOString(), startedAt: null, finishedAt: null },
  { id: 'p3', environmentId: 'e', projectId: '', projectName: 'internal-tools', branch: 'feature/oauth', commitSha: 'c92a831de4', commitMessage: 'WIP: GitHub App install flow', status: 'FAILED', duration: 34, createdAt: new Date().toISOString(), startedAt: null, finishedAt: null },
];
