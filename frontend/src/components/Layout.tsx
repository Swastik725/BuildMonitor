import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarEditModal } from './Avatar';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon },
  { to: '/deployments', label: 'Deployments', icon: DeployIcon },
  { to: '/incidents', label: 'Incidents', icon: IncidentIcon },
  { to: '/organizations', label: 'Organizations', icon: OrgIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function Layout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, refreshUser } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  return (
    <div className="flex min-h-screen">
      <motion.aside
        animate={{ width: collapsed ? 72 : 224 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="glass shrink-0 px-3 py-5 flex flex-col relative border-r"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <div className="flex items-center gap-2 px-1 mb-8 h-7">
          <motion.div
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="font-mono font-semibold text-sm tracking-tight whitespace-nowrap"
                style={{ color: 'var(--text)' }}
              >
                BuildMonitor
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className="relative">
                {active && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: 'var(--surface-2)' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <div
                  className="relative z-10 flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium"
                  style={{ color: active ? 'var(--text)' : 'var(--muted)' }}
                >
                  <Icon />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t flex flex-col gap-3" style={{ borderColor: 'var(--glass-border)' }}>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm"
            style={{ color: 'var(--muted)' }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {user && (
            <button
              onClick={() => setShowAvatarModal(true)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left"
            >
              <Avatar fullName={user.fullName} avatarUrl={user.avatarUrl} size={28} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{user.fullName}</p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--muted)' }}>@{user.username}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          )}

          {!collapsed && user && (
            <button
              onClick={logout}
              className="px-2.5 text-xs font-medium text-left"
              style={{ color: 'var(--fail)' }}
            >
              Sign out
            </button>
          )}
        </div>

        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-8 h-6 w-6 rounded-full flex items-center justify-center glass"
          style={{ boxShadow: 'var(--shadow)' }}
        >
          <motion.svg
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ color: 'var(--muted)' }}
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </button>
      </motion.aside>

      <main className="flex-1 px-8 py-6 overflow-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      {showAvatarModal && user && (
        <AvatarEditModal
          fullName={user.fullName}
          currentUrl={user.avatarUrl}
          onClose={() => setShowAvatarModal(false)}
          onSaved={() => refreshUser()}
        />
      )}
    </div>
  );
}

function DeployIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M12 2l4 8h-3v10h-2V10H8l4-8z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" strokeLinecap="round" />
    </svg>
  );
}
function IncidentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      <path d="M10.29 3.86L1.82 18a1.5 1.5 0 001.3 2.25h17.76a1.5 1.5 0 001.3-2.25L13.71 3.86a1.5 1.5 0 00-2.42 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function OrgIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M3 21V7l9-4 9 4v14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
