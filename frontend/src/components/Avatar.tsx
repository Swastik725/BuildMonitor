import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

function initials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ fullName, avatarUrl, size = 32 }: { fullName: string; avatarUrl?: string | null; size?: number }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        style={{ width: size, height: size }}
        className="rounded-full object-cover border"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
      className="rounded-full flex items-center justify-center font-mono font-semibold text-xs shrink-0"
    >
      {initials(fullName || '?')}
    </div>
  );
}

export function AvatarEditModal({
  fullName,
  currentUrl,
  onClose,
  onSaved,
}: {
  fullName: string;
  currentUrl?: string | null;
  onClose: () => void;
  onSaved: (url: string) => void;
}) {
  const [url, setUrl] = useState(currentUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.patch('/users/me', { avatarUrl: url || null });
      onSaved(url);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not update avatar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          onClick={e => e.stopPropagation()}
          className="glass rounded-2xl p-6 w-full max-w-sm"
          style={{ boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Avatar fullName={fullName} avatarUrl={url} size={48} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{fullName}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Update your avatar</p>
            </div>
          </div>

          <input
            placeholder="Image URL (e.g. https://...)"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm mb-2"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
          />
          {error && <p className="text-xs mb-2" style={{ color: 'var(--fail)' }}>{error}</p>}

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="glass-btn flex-1 rounded-md px-3 py-2 text-sm font-medium disabled:opacity-60"
              style={{ color: 'var(--text)' }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={onClose}
              className="rounded-md border px-3 py-2 text-sm font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
