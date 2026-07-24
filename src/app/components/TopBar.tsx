import { ChevronRight, Moon, Sun } from "lucide-react";
import { useState } from "react";
import type { NavState } from "../lib/types";
import { Av } from "./primitives";
import { usersApi } from "../lib/api";
import { useResource } from "../lib/use-resource";

export function TopBar({ title, crumbs, onCrumb }: {
  title: string;
  crumbs?: Array<{ label: string; nav: NavState }>;
  onCrumb?: (nav: NavState) => void;
}) {
  const user = useResource(() => usersApi.profile());
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const initials =
    user.data?.fullName
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join("") || user.data?.username?.slice(0, 2).toUpperCase() || "?";
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <header className="h-16 border-b border-border flex items-center px-5 md:px-7 gap-3 flex-shrink-0 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
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
        <button onClick={toggleTheme} aria-label="Toggle color theme" className="h-8 w-8 rounded-lg border border-border bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          {isDark ? <Sun className="w-3.5 h-3.5"/> : <Moon className="w-3.5 h-3.5"/>}
        </button>
        <Av initials={initials} />
      </div>
    </header>
  );
}
