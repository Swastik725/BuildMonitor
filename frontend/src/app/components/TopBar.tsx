import { ChevronRight, Command, Search } from "lucide-react";
import type { NavState } from "../lib/types";
import { ProfileMenu } from "./ProfileMenu";

export function TopBar({ title, crumbs, onCrumb, onNav }: { title: string; crumbs?: Array<{ label: string; nav: NavState }>; onCrumb?: (nav: NavState) => void; onNav: (nav: NavState) => void }) {
  return <header className="h-[72px] border-b border-border flex items-center px-6 gap-3 flex-shrink-0 bg-background/75 backdrop-blur-xl sticky top-0 z-10">
    {crumbs?.length ? <div className="flex items-center gap-1 text-sm min-w-0">{crumbs.map((c, i) => <span key={i} className="flex items-center gap-1">{i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}<button onClick={() => onCrumb?.(c.nav)} className="text-muted-foreground hover:text-foreground transition-colors">{c.label}</button></span>)}<ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-foreground font-bold truncate font-display">{title}</span></div> : <span className="text-lg font-bold text-foreground font-display">{title}</span>}
    <div className="ml-auto flex items-center gap-3"><div className="relative hidden sm:block"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" /><input placeholder="Search workspace" className="pl-8 pr-12 py-2 text-xs bg-secondary/70 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-52 transition-all" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground flex items-center gap-0.5"><Command className="w-2.5 h-2.5" />K</span></div><ProfileMenu onNav={onNav} /></div>
  </header>;
}
