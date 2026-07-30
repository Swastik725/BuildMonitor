import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { StatusPill } from '../components/StatusPill';
import { projectsApi, incidentsApi, type Incident } from '../lib/api';

type Row = Incident & { projectName: string; projectId: string };

const PREVIEW: Row[] = [
  { id: 'i1', projectId: '', projectName: 'internal-tools', title: 'Elevated response times on /api/deployments', status: 'INVESTIGATING', openedAt: new Date(Date.now() - 2000000).toISOString(), resolvedAt: null },
  { id: 'i2', projectId: '', projectName: 'fluxora-landing', title: 'Health check failing intermittently', status: 'RESOLVED', openedAt: new Date(Date.now() - 86400000).toISOString(), resolvedAt: new Date(Date.now() - 82800000).toISOString() },
];

export function AllIncidentsPage() {
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
            incidentsApi
              .listByProject(p.id)
              .then(res => res.data.map(inc => ({ ...inc, projectName: p.name, projectId: p.id })))
              .catch(() => []),
          ),
        );
        const flat = results.flat().sort((a, b) => (a.openedAt < b.openedAt ? 1 : -1));
        if (flat.length === 0) {
          setRows(PREVIEW);
          setIsPreview(true);
        } else {
          setRows(flat);
          setIsPreview(false);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id: string) => {
    await incidentsApi.resolve(id);
    setRows(rows.map(r => (r.id === id ? { ...r, status: 'RESOLVED' } : r)));
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Incidents</h1>
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
      ) : rows.length === 0 ? (
        <GlassCard className="p-8 text-center border-dashed">
          <p className="text-sm" style={{ color: 'var(--success)' }}>No incidents anywhere. All clear.</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((inc, i) => (
            <motion.div key={inc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to={`/projects/${inc.projectId}`} className="text-xs font-mono font-medium" style={{ color: 'var(--accent)' }}>
                      {inc.projectName}
                    </Link>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text)' }}>{inc.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    Opened {new Date(inc.openedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill status={inc.status} />
                  {inc.status !== 'RESOLVED' && !isPreview && (
                    <button onClick={() => handleResolve(inc.id)} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                      Resolve
                    </button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
