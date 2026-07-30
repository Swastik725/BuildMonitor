import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { StatusPill } from './StatusPill';

// Dummy data — a real version would come from a backend endpoint that joins
// deployments/incidents/health checks across all of the user's projects,
// ordered by recency. No such aggregation endpoint exists yet.
const DUMMY_ACTIVITY: Array<{
  id: string;
  project: string;
  type: 'deployment' | 'incident' | 'health';
  message: string;
  status: string;
  time: string;
}> = [
  { id: '1', project: 'buildmonitor-api', type: 'deployment', message: 'Deployed a3f9c2e to main', status: 'SUCCESS', time: '2m ago' },
  { id: '2', project: 'fluxora-landing', type: 'health', message: 'Health check passed', status: 'healthy', time: '6m ago' },
  { id: '3', project: 'buildmonitor-api', type: 'deployment', message: 'Deployed 7b1e4d0 to main', status: 'RUNNING', time: '12m ago' },
  { id: '4', project: 'internal-tools', type: 'incident', message: 'API latency spike detected', status: 'INVESTIGATING', time: '34m ago' },
  { id: '5', project: 'fluxora-landing', type: 'deployment', message: 'Deployed c92a831 to main', status: 'FAILED', time: '1h ago' },
  { id: '6', project: 'internal-tools', type: 'health', message: 'Health check passed', status: 'healthy', time: '2h ago' },
];

const TYPE_ICON: Record<string, string> = {
  deployment: '⬢',
  incident: '⚠',
  health: '♥',
};

export function ActivityFeed() {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Recent activity</p>
        <span
          className="text-[10px] font-mono px-2 py-1 rounded-full"
          style={{ color: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
        >
          Preview
        </span>
      </div>
      <div className="flex flex-col mt-3">
        {DUMMY_ACTIVITY.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 py-2.5"
            style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}
          >
            <span className="text-sm w-4 text-center shrink-0" style={{ color: 'var(--muted)' }}>
              {TYPE_ICON[item.type]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium truncate" style={{ color: 'var(--text)' }}>{item.project}</span>
              </div>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>{item.message}</p>
            </div>
            <StatusPill status={item.status} />
            <span className="text-[10px] font-mono shrink-0 w-12 text-right" style={{ color: 'var(--muted)' }}>{item.time}</span>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
