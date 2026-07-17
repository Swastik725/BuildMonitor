import { motion } from "motion/react";
import { LayoutDashboard, Package, Building2, Settings } from "lucide-react";
import type { Status } from "../lib/types";
import { STATUS } from "../lib/types";

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}


// ─── Primitives ───────────────────────────────────────────────────────────────

export function StatusBadge({ status, pulse }: { status: Status; pulse?: boolean }) {
  const cfg = STATUS[status];
  return (
    <span
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium tracking-wide"
    >
      <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
        {pulse && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ backgroundColor: cfg.color }}
          />
        )}
        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: cfg.color }} />
      </span>
      {cfg.label}
    </span>
  );
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-xs", className)}>
      {children}
    </span>
  );
}

export function Av({ initials, size = "sm" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-6 h-6 text-xs", md: "w-8 h-8 text-sm", lg: "w-11 h-11 text-base" }[size];
  return (
    <div className={cn("rounded-full bg-accent flex items-center justify-center font-medium text-accent-foreground flex-shrink-0", s)}>
      {initials}
    </div>
  );
}

export function Btn({
  children, variant = "primary", size = "md", className, onClick, type = "button", disabled,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const v = {
    primary:   "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border",
    ghost:     "text-muted-foreground hover:text-foreground hover:bg-secondary",
    danger:    "text-destructive hover:bg-destructive/10",
  };
  const s = { sm: "px-3 py-1.5 text-xs gap-1.5", md: "px-4 py-2 text-sm gap-2" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center rounded-md font-medium transition-all duration-150 disabled:opacity-40 cursor-pointer",
        v[variant], s[size], className
      )}
    >
      {children}
    </button>
  );
}

export function Field({ label, type = "text", placeholder, value, onChange, right }: {
  label?: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </div>
  );
}

export function SectionCard({ title, action, children }: {
  title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export function PageFade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex-1 overflow-y-auto"
    >
      {children}
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export const NAV = [
  { id: "dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { id: "project",   label: "Projects",     icon: Package         },
  { id: "org",       label: "Organization", icon: Building2       },
  { id: "settings",  label: "Settings",     icon: Settings        },
] as const;
