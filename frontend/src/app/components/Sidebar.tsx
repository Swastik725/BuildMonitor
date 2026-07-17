import { Activity, ChevronDown, Bell, LogOut } from "lucide-react";
import type { Page } from "../lib/types";
import { cn, NAV } from "./primitives";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";

export function Sidebar({ current, onNav, onLogout }: {
  current: Page; onNav: (p: Page) => void; onLogout: () => void;
}) {
  return (
    <aside className="w-60 flex-shrink-0 border-r border-border flex flex-col h-screen" style={{ background: "var(--sidebar)" }}>
      <div className="px-4 py-4 border-b border-sidebar-border flex items-center gap-2.5">
        
      <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
        <AllInclusiveIcon
          sx={{
            color: "var(--primary-foreground)",
            fontSize: 22,
          }}
        />
      </div>
        <span className="font-semibold text-sm text-sidebar-foreground tracking-tight">BuildMonitor</span>
      </div>

      <div className="px-3 py-2.5 border-b border-sidebar-border">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/50 transition-colors">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground">A</div>
          <span className="text-sm font-medium text-sidebar-foreground flex-1 text-left">Acme Corp</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-px">
        {NAV.map(item => {
          const active = current === item.id || (item.id === "project" && current === "deployment");
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary/40"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {item.id === "project" && (
                <span
                  className="ml-auto px-1.5 py-px rounded text-xs"
                  style={{ color: "#c06060", background: "rgba(192,96,96,0.13)" }}
                >1</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-sidebar-border space-y-px">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary/40 transition-colors">
          <Bell className="w-4 h-4" />
          Notifications
          <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-px leading-none">2</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
