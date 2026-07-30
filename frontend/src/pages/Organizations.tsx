import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { GlassCard, GlassButton } from '../components/GlassCard';
import { orgsApi, type Organization } from '../lib/api';

export function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    orgsApi
      .list()
      .then(res => setOrgs(res.data))
      .catch(() => setError('Could not load organizations. Try refreshing.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await orgsApi.create({ name, slug });
      setName('');
      setSlug('');
      setShowCreate(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not create organization.');
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Organizations</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Group projects and manage teammates</p>
        </div>
        <GlassButton onClick={() => setShowCreate(s => !s)}>+ New organization</GlassButton>
      </div>

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
              <input
                placeholder="Organization name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
              />
              <input
                placeholder="slug (e.g. acme-inc)"
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
      ) : orgs.length === 0 ? (
        <GlassCard className="p-8 text-center border-dashed">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No organizations yet. Create one to start grouping projects and inviting teammates.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((org, i) => (
            <motion.div key={org.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={`/?org=${org.id}`}>
                <GlassCard className="p-4">
                  <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{org.name}</p>
                  <p className="font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>{org.slug}</p>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
