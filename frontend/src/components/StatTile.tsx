import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { GlassCard } from './GlassCard';

export function StatTile({
  label,
  value,
  suffix,
  trend,
  icon,
  delay = 0,
}: {
  label: string;
  value: string;
  suffix?: string;
  trend?: { direction: 'up' | 'down'; label: string; good: boolean };
  icon: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <GlassCard className="p-4">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</p>
          <div style={{ color: 'var(--accent)' }}>{icon}</div>
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-2xl font-semibold font-mono" style={{ color: 'var(--text)' }}>{value}</span>
          {suffix && <span className="text-sm" style={{ color: 'var(--muted)' }}>{suffix}</span>}
        </div>
        {trend && (
          <p
            className="text-xs mt-1.5 font-mono"
            style={{ color: trend.good ? 'var(--success)' : 'var(--fail)' }}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {trend.label}
          </p>
        )}
      </GlassCard>
    </motion.div>
  );
}
