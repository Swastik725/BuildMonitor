export function Gauge({ percentage, label, sub }: { percentage: number | null; label: string; sub?: string }) {
  const pct = percentage ?? 0;
  const angle = (pct / 100) * 360;

  return (
    <div className="bg-card border border-border rounded-lg p-5 hover-lift flex items-center gap-4">
      <div
        className="relative w-14 h-14 rounded-full flex-shrink-0"
        style={{
          background: percentage == null
            ? "var(--muted)"
            : `conic-gradient(var(--primary) ${angle}deg, var(--muted) ${angle}deg)`,
        }}
      >
        <div className="absolute inset-1.5 rounded-full bg-card flex items-center justify-center">
          <span className="text-xs font-medium text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
            {percentage != null ? `${Math.round(percentage)}%` : "—"}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}
