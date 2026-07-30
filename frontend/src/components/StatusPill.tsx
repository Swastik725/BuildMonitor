type Status = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | string;

const STATUS_STYLES: Record<string, { color: string; label: string; pulse?: boolean }> = {
  QUEUED: { color: 'var(--pending)', label: 'Queued', pulse: true },
  RUNNING: { color: 'var(--pending)', label: 'Running', pulse: true },
  SUCCESS: { color: 'var(--success)', label: 'Success' },
  FAILED: { color: 'var(--fail)', label: 'Failed' },
  CANCELLED: { color: 'var(--muted)', label: 'Cancelled' },
  OPEN: { color: 'var(--fail)', label: 'Open', pulse: true },
  INVESTIGATING: { color: 'var(--pending)', label: 'Investigating', pulse: true },
  RESOLVED: { color: 'var(--success)', label: 'Resolved' },
  healthy: { color: 'var(--success)', label: 'Healthy' },
  unhealthy: { color: 'var(--fail)', label: 'Unhealthy' },
};

export function StatusPill({ status }: { status: Status }) {
  const style = STATUS_STYLES[status] ?? { color: 'var(--muted)', label: status };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-mono"
      style={{ backgroundColor: `color-mix(in srgb, ${style.color} 15%, transparent)`, color: style.color }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${style.pulse ? 'status-dot-pulse' : ''}`}
        style={{ backgroundColor: style.color }}
      />
      {style.label}
    </span>
  );
}
