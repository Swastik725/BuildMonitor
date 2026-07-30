import { useState } from 'react';
import { Layout } from '../components/Layout';
import { GlassCard, GlassButton } from '../components/GlassCard';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.patch('/users/me', { fullName, avatarUrl: avatarUrl || null });
      await refreshUser();
      setSaved(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Settings</h1>

      <div className="max-w-lg flex flex-col gap-4">
        <GlassCard className="p-5">
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--text)' }}>Profile</p>
          <div className="flex items-center gap-3 mb-4">
            <Avatar fullName={fullName || user.fullName} avatarUrl={avatarUrl} size={48} />
            <div className="flex-1">
              <p className="text-xs" style={{ color: 'var(--muted)' }}>@{user.username}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{user.email}</p>
            </div>
          </div>

          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>Full name</label>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm mb-3"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
          />

          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>Avatar URL</label>
          <input
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-md border px-3 py-2 text-sm mb-1"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
          />
          <p className="text-[11px] mb-3" style={{ color: 'var(--muted)' }}>
            File upload isn't available yet — paste an image URL for now.
          </p>

          {error && <p className="text-xs mb-2" style={{ color: 'var(--fail)' }}>{error}</p>}
          {saved && <p className="text-xs mb-2" style={{ color: 'var(--success)' }}>Saved.</p>}

          <GlassButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </GlassButton>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>Appearance</p>
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Theme</p>
            <GlassButton variant="ghost" onClick={toggleTheme}>
              {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
