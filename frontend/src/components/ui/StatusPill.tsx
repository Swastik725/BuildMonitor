import clsx from "clsx";

type Tone = "success" | "warning" | "error" | "neutral" | "accent";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  error: "bg-error/10 text-error border-error/30",
  neutral: "bg-neutral/10 text-neutral border-neutral/30",
  accent: "bg-accent/10 text-accent border-accent/30",
};

export function StatusPill({
  tone,
  children,
  pulse,
}: {
  tone: Tone;
  children: React.ReactNode;
  pulse?: boolean;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono font-medium uppercase tracking-wide",
        toneClasses[tone],
      )}
    >
      <span
        className={clsx("h-1.5 w-1.5 rounded-full bg-current", pulse && "status-pulse")}
      />
      {children}
    </span>
  );
}
