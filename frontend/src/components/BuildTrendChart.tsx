import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GlassCard } from './GlassCard';

// Dummy data — represents avg build duration (seconds) per day over the last
// 14 days. Replace with a real backend aggregation endpoint
// (e.g. GET /dashboard/build-trend) once one exists.
const DUMMY_TREND = [
  { day: 'Jul 17', seconds: 142 },
  { day: 'Jul 18', seconds: 138 },
  { day: 'Jul 19', seconds: 151 },
  { day: 'Jul 20', seconds: 129 },
  { day: 'Jul 21', seconds: 134 },
  { day: 'Jul 22', seconds: 118 },
  { day: 'Jul 23', seconds: 122 },
  { day: 'Jul 24', seconds: 109 },
  { day: 'Jul 25', seconds: 115 },
  { day: 'Jul 26', seconds: 98 },
  { day: 'Jul 27', seconds: 104 },
  { day: 'Jul 28', seconds: 91 },
  { day: 'Jul 29', seconds: 87 },
  { day: 'Jul 30', seconds: 93 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs" style={{ boxShadow: 'var(--shadow)' }}>
      <p className="font-mono" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="font-mono font-semibold" style={{ color: 'var(--text)' }}>{payload[0].value}s avg build</p>
    </div>
  );
}

export function BuildTrendChart() {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Average build duration</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Last 14 days · sample data</p>
        </div>
        <span
          className="text-[10px] font-mono px-2 py-1 rounded-full"
          style={{ color: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
        >
          Preview
        </span>
      </div>
      <div className="h-48 mt-3 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DUMMY_TREND} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="buildTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              width={32}
              tickFormatter={v => `${v}s`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="seconds" stroke="var(--accent)" strokeWidth={2} fill="url(#buildTrendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
