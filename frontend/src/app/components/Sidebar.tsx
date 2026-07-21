import { useState, useEffect } from "react";
import { Activity, ChevronDown, LogOut, Sparkles } from "lucide-react";
import type { Page } from "../lib/types";
import { cn, NAV } from "./primitives";
import { NotificationsPanel } from "./NotificationsPanel";
import { organizationsApi, type Organization } from "../lib/organizationsApi";

export function Sidebar({ current, onNav, onLogout }: { current: Page; onNav: (p: Page) => void; onLogout: () => void }) {
  const [org, setOrg] = useState<Organization | null>(null);
  useEffect(() => { organizationsApi.list().then(orgs => setOrg(orgs[0] ?? null)).catch(() => setOrg(null)); }, []);

  return (
    <aside className="w-[260px] flex-shrink-0 border-r border-sidebar-border flex flex-col h-screen relative overflow-hidden" style={{ background: "var(--sidebar)" }}>
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-3 relative">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[#38c9ff] flex items-center justify-center shadow-lg shadow-primary/30"><Activity className="w-5 h-5 text-primary-foreground" /></div>
        <div><span className="font-bold text-[15px] text-sidebar-foreground tracking-tight">BuildMonitor</span><p className="text-[10px] uppercase tracking-[.18em] text-[#93a6ca] mt-0.5">Control plane</p></div>
      </div>

      <div className="px-3.5 py-4 border-b border-sidebar-border relative">
        <button onClick={() => onNav("org")} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/[.045] hover:bg-white/[.08] transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8b82ff] to-[#38c9ff] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{org?.name[0]?.toUpperCase() ?? "…"}</div>
          <span className="text-sm font-medium text-sidebar-foreground flex-1 text-left truncate">{org?.name ?? "Loading…"}</span><ChevronDown className="w-3.5 h-3.5 text-[#93a6ca]" />
        </button>
      </div>

      <nav className="flex-1 px-3.5 py-5 space-y-1 relative">
        <p className="px-2.5 mb-2 text-[10px] font-bold tracking-[.15em] text-[#7182a4] uppercase">Workspace</p>
        {NAV.map(item => {
          const active = current === item.id || (item.id === "project" && current === "deployment");
          return <button key={item.id} onClick={() => onNav(item.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer", active ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-[inset_0_0_0_1px_rgba(139,130,255,.16)]" : "text-[#9eacc6] hover:text-sidebar-foreground hover:bg-white/[.045]")}><item.icon className="w-4 h-4 flex-shrink-0" />{item.label}</button>;
        })}
      </nav>

      <div className="px-3.5 py-4 border-t border-sidebar-border space-y-1 relative">
        <div className="flex gap-2 px-2.5 pb-3 text-[11px] text-[#8fa0c0] items-center"><Sparkles className="w-3.5 h-3.5 text-[#69d7ff]" /> System status: operational</div>
        <NotificationsPanel />
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#9eacc6] hover:text-sidebar-foreground hover:bg-white/[.045] transition-colors cursor-pointer"><LogOut className="w-4 h-4" />Sign out</button>
      </div>
    </aside>
  );
}
