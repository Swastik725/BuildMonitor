import { useState } from "react";
import { Settings, Plus, ChevronRight, MoreHorizontal } from "lucide-react";
import type { NavState } from "../lib/types";
import { PROJECTS, MEMBERS } from "../lib/mockData";
import { PageFade, SectionCard, Btn, StatusBadge, Mono, Av, cn } from "../components/primitives";
import { TopBar } from "../components/TopBar";

export function OrgPage({ onNav }: { onNav: (s: NavState) => void }) {
  const [tab, setTab] = useState<"projects" | "members">("projects");

  return (
    <PageFade>
      <TopBar title="Organization" />
      <div className="p-5 max-w-5xl space-y-5">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-lg font-semibold text-accent-foreground">A</div>
              <div>
                <h1 className="text-base font-semibold text-foreground">Acme Corp</h1>
                <p className="text-sm text-muted-foreground mt-0.5">acme-corp · {MEMBERS.length} members · {PROJECTS.length} projects</p>
              </div>
            </div>
            <Btn variant="secondary" size="sm"><Settings className="w-3.5 h-3.5" />Settings</Btn>
          </div>
        </div>

        <div className="border-b border-border flex">
          {(["projects", "members"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px capitalize cursor-pointer",
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "projects" && (
          <SectionCard title="All projects" action={<Btn variant="ghost" size="sm"><Plus className="w-3.5 h-3.5" />New project</Btn>}>
            <div className="divide-y divide-border">
              {PROJECTS.map(p => (
                <button
                  key={p.id}
                  onClick={() => onNav({ page: "project", projectId: p.id })}
                  className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-foreground">{p.name}</span>
                      <StatusBadge status={p.status} pulse={p.status === "in-progress"} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mono className="text-muted-foreground">{p.repo}</Mono>
                      <span>·</span>
                      <span>{p.framework}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{p.deploys} deploys</div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </SectionCard>
        )}

        {tab === "members" && (
          <SectionCard title="Members" action={<Btn variant="ghost" size="sm"><Plus className="w-3.5 h-3.5" />Invite</Btn>}>
            <div className="divide-y divide-border">
              {MEMBERS.map(m => (
                <div key={m.id} className="px-5 py-3.5 flex items-center gap-4">
                  <Av initials={m.avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded">{m.role}</span>
                  <span className="text-xs text-muted-foreground w-14 text-right">{m.lastActive}</span>
                  <Btn variant="ghost" size="sm" className="w-7 h-7 p-0 justify-center">
                    <MoreHorizontal className="w-4 h-4" />
                  </Btn>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </PageFade>
  );
}
