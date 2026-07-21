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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border border-current/10"
    >
      <span className={cn("relative flex h-1.5 w-1.5 flex-shrink-0 rounded-full", pulse && "signal-pulse")}>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: pulse ? "var(--pulse)" : cfg.color }} />
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
    <div className={cn("rounded-xl bg-gradient-to-br from-primary to-[#38c9ff] flex items-center justify-center font-semibold text-primary-foreground shadow-lg shadow-primary/15 flex-shrink-0", s)}>
      {initials}
    </div>
  );
}

export function Btn({
  children, variant = "primary", size = "md", className, onClick, type = "button", disabled, title,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  title?: string;
}) {
  const v = {
    primary:   "bg-gradient-to-r from-primary to-[#5a99ff] text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/75 border border-border",
    ghost:     "text-muted-foreground hover:text-foreground hover:bg-secondary",
    danger:    "text-destructive hover:bg-destructive/10",
  };
  const s = { sm: "px-3 py-1.5 text-xs gap-1.5", md: "px-4 py-2 text-sm gap-2" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex items-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 cursor-pointer active:scale-[0.97]",
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
          className="w-full bg-input-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
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
    <div className="bg-card/90 border border-border rounded-2xl overflow-hidden hover-lift surface-glow">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export function PageFade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
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
