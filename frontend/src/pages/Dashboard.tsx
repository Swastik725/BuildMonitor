import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { GlassCard, GlassButton } from '../components/GlassCard';
import { StatTile } from '../components/StatTile';
import { BuildTrendChart } from '../components/BuildTrendChart';
import { ActivityFeed } from '../components/ActivityFeed';
import { projectsApi, orgsApi, type Project, type Organization } from '../lib/api';

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [orgId, setOrgId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [params] = useSearchParams();
  const filterOrg = params.get('org');

  const load = () => {
    setLoading(true);
    Promise.all([projectsApi.list(), orgsApi.list()])
      .then(([p, o]) => {
        setProjects(p.data);
        setOrgs(o.data);
        if (o.data.length > 0 && !orgId) setOrgId(o.data[0].id);
      })
      .catch(() => setError('Could not load your projects. Try refreshing.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await projectsApi.create({ name, slug, organizationId: orgId, visibility: 'PRIVATE', defaultBranch: 'main' });
      setName('');
      setSlug('');
      setShowCreate(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not create project.');
    }
  };

  const visibleProjects = filterOrg ? projects.filter(p => p.organizationId === filterOrg) : projects;
  const connectedCount = projects.filter(p => p.repository).length;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            {visibleProjects.length} project{visibleProjects.length === 1 ? '' : 's'} being tracked
          </p>
        </div>
        {orgs.length > 0 && (
          <GlassButton onClick={() => setShowCreate(s => !s)}>+ New project</GlassButton>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile
          label="Projects tracked"
          value={String(projects.length)}
          icon={<BoxIcon />}
          delay={0}
        />
        <StatTile
          label="Repos connected"
          value={String(connectedCount)}
          suffix={projects.length ? `/ ${projects.length}` : undefined}
          icon={<LinkIcon />}
          delay={0.05}
        />
        <StatTile
          label="Avg build time"
          value="93"
          suffix="sec"
          trend={{ direction: 'down', label: '34% faster than last week', good: true }}
          icon={<ClockIcon />}
          delay={0.1}
        />
        <StatTile
          label="Uptime (30d)"
          value="99.8"
          suffix="%"
          trend={{ direction: 'up', label: '2 incidents resolved', good: true }}
          icon={<PulseIcon />}
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-8">
        <div className="xl:col-span-3">
          <BuildTrendChart />
        </div>
        <div className="xl:col-span-2">
          <ActivityFeed />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Projects</h2>
      </div>


      {orgs.length === 0 && !loading && (
        <GlassCard className="p-8 text-center border-dashed">
          <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
            You need an organization before creating a project.
          </p>
          <Link to="/organizations" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
            Create your first organization →
          </Link>
        </GlassCard>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="mb-6 overflow-hidden"
          >
            <GlassCard className="p-4 flex flex-col gap-3 max-w-sm" as="div">
              <select
                value={orgId}
                onChange={e => setOrgId(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
              >
                {orgs.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
              <input
                placeholder="Project name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
              />
              <input
                placeholder="slug (e.g. my-app)"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                required
                className="rounded-md border px-3 py-2 text-sm font-mono"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
              />
              <GlassButton type="submit">Create</GlassButton>
            </GlassCard>
          </motion.form>
        )}
      </AnimatePresence>

      {error && <p className="text-sm mb-4" style={{ color: 'var(--fail)' }}>{error}</p>}

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : visibleProjects.length === 0 && orgs.length > 0 ? (
        <GlassCard className="p-8 text-center border-dashed">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No projects yet. Create one, then connect a GitHub repo to start tracking deployments.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/projects/${project.id}`}>
                <GlassCard className="p-4 h-full">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{project.name}</p>
                    <span
                      className="h-2 w-2 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: project.repository ? 'var(--success)' : 'var(--muted)' }}
                    />
                  </div>
                  <p className="font-mono text-xs mt-2" style={{ color: 'var(--muted)' }}>
                    {project.repository ? `${project.repository.githubOwner}/${project.repository.repositoryName}` : 'No repo connected'}
                  </p>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}

function BoxIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8l9 5 9-5M12 13v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L12.5 19.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PulseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h4l2-7 4 14 2-7h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
