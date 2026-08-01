import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { GlassCard, GlassButton } from '../components/GlassCard';
import { orgsApi, type Organization } from '../lib/api';

export function OrganizationsPage() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const startEdit = (org: Organization) => {
    setDeletingId(null);
    setEditingId(org.id);
    setEditName(org.name);
    setEditSlug(org.slug);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      await orgsApi.update(editingId, { name: editName, slug: editSlug });
      setEditingId(null);
      load();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Could not update organization.');
    } finally {
      setSavingEdit(false);
    }
  };

  const startDelete = (org: Organization) => {
    setEditingId(null);
    setDeletingId(org.id);
    setConfirmText('');
    setDeleteError(null);
  };

  const cancelDelete = () => {
    setDeletingId(null);
    setDeleteError(null);
  };

  const handleDelete = async (org: Organization) => {
    if (confirmText !== org.slug) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await orgsApi.delete(org.id);
      setDeletingId(null);
      load();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Could not delete organization.');
    } finally {
      setDeleting(false);
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
              <GlassCard className="p-4" as="div">
                {editingId === org.id ? (
                  <form onSubmit={handleSaveEdit} className="flex flex-col gap-2">
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      required
                      className="rounded-md border px-2.5 py-1.5 text-sm"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
                    />
                    <input
                      value={editSlug}
                      onChange={e => setEditSlug(e.target.value)}
                      required
                      className="rounded-md border px-2.5 py-1.5 text-sm font-mono"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
                    />
                    {editError && <p className="text-xs" style={{ color: 'var(--fail)' }}>{editError}</p>}
                    <div className="flex gap-2 mt-1">
                      <button
                        type="submit"
                        disabled={savingEdit}
                        className="flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
                        style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                      >
                        {savingEdit ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 rounded-md border px-2.5 py-1.5 text-xs font-medium"
                        style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : deletingId === org.id ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Deletes <span className="font-medium" style={{ color: 'var(--text)' }}>{org.name}</span> and every project inside it, permanently. Type <span className="font-mono" style={{ color: 'var(--text)' }}>{org.slug}</span> to confirm:
                    </p>
                    <input
                      value={confirmText}
                      onChange={e => setConfirmText(e.target.value)}
                      placeholder={org.slug}
                      className="rounded-md border px-2.5 py-1.5 text-sm font-mono"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
                    />
                    {deleteError && <p className="text-xs" style={{ color: 'var(--fail)' }}>{deleteError}</p>}
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => handleDelete(org)}
                        disabled={confirmText !== org.slug || deleting}
                        className="flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
                        style={{ backgroundColor: 'var(--fail)', color: '#fff' }}
                      >
                        {deleting ? 'Deleting…' : 'Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelDelete}
                        className="flex-1 rounded-md border px-2.5 py-1.5 text-xs font-medium"
                        style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => navigate(`/?org=${org.id}`)}
                      className="min-w-0 text-left flex-1"
                    >
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{org.name}</p>
                      <p className="font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>{org.slug}</p>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(org)}
                        title="Rename"
                        className="p-1.5 rounded-md"
                        style={{ color: 'var(--muted)' }}
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => startDelete(org)}
                        title="Delete"
                        className="p-1.5 rounded-md"
                        style={{ color: 'var(--muted)' }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
