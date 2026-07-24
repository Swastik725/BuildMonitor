import { Activity, Bell, LogOut } from "lucide-react";
import type { Page } from "../lib/types";
import { cn, NAV } from "./primitives";

export function Sidebar({
  current,
  onNav,
  onLogout,
  organizationName,
}: {
  current: Page;
  onNav: (p: Page) => void;
  onLogout: () => void;
  organizationName?: string | null;
}) {
  const workspaceName = organizationName?.trim() || "Workspace";
  const organizationInitial = workspaceName.slice(0, 1).toUpperCase();
  return (
    <aside className="w-[17rem] flex-shrink-0 border-r border-border flex flex-col h-screen bg-card/80 backdrop-blur-xl">
      <div className="px-5 py-5 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Activity className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm text-sidebar-foreground tracking-tight">BuildMonitor</span>
      </div>

      <div className="px-4 py-4 border-b border-border">
        <div className="rounded-xl px-3 py-3 bg-secondary/60 border border-border flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            {organizationInitial}
          </div>
          <span className="text-xs font-medium flex-1 truncate">{workspaceName}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map(item => {
          const active = current === item.id || (item.id === "project" && current === "deployment");
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary/40"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-1">
        <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary/40 transition-colors">
          <Bell className="w-4 h-4" />
          Notifications
          <span className="ml-auto bg-primary text-primary-foreground text-[10px] rounded-full min-w-5 px-1.5 py-px leading-none text-center">2</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
