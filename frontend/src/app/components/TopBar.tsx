import { ChevronRight, Search } from "lucide-react";
import type { NavState } from "../lib/types";
import { Av } from "./primitives";

export function TopBar({ title, crumbs, onCrumb }: {
  title: string;
  crumbs?: Array<{ label: string; nav: NavState }>;
  onCrumb?: (nav: NavState) => void;
}) {
  return (
    <header className="h-12 border-b border-border flex items-center px-5 gap-3 flex-shrink-0 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      {crumbs?.length ? (
        <div className="flex items-center gap-1 text-sm min-w-0">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
              <button
                onClick={() => onCrumb?.(c.nav)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {c.label}
              </button>
            </span>
          ))}
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-foreground font-medium truncate">{title}</span>
        </div>
      ) : (
        <span className="text-sm font-medium text-foreground">{title}</span>
      )}

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 text-xs bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-44 transition-all"
          />
        </div>
        <Av initials="AC" />
      </div>
    </header>
  );
}
