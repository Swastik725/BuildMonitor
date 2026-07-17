import { Plus, ChevronRight } from "lucide-react";
import type { NavState } from "../lib/types";
import { PROJECTS, INCIDENTS, ALL_RECENT } from "../lib/mockData";
import { PageFade, SectionCard, Btn, StatusBadge, Mono } from "../components/primitives";
import { TopBar } from "../components/TopBar";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:border-border/80 transition-colors">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground mt-1 tabular-nums tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export function DashboardPage({ onNav }: { onNav: (s: NavState) => void }) {
  return (
    <PageFade>
      <TopBar title="Dashboard" />
      <div className="p-5 max-w-6xl space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active projects"    value="4"      sub="4 repos monitored" />
          <StatCard label="Deployments (7d)"   value="23"     sub="↑ 4 from last week" />
          <StatCard label="Mean uptime"         value="99.7%"  sub="across all services" />
          <StatCard label="Open incidents"      value="2"      sub="1 critical, 1 high" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <SectionCard
              title="Projects"
              action={<Btn variant="ghost" size="sm"><Plus className="w-3.5 h-3.5" />New project</Btn>}
            >
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
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-muted-foreground">{p.lastDeploy}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.uptime} uptime</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>

          <div>
            <SectionCard title="Incidents">
              <div className="divide-y divide-border">
                {INCIDENTS.map(inc => (
                  <div key={inc.id} className="px-5 py-3.5 space-y-2">
                    <p className="text-xs text-foreground leading-snug">{inc.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={inc.status} />
                      <Mono className="text-muted-foreground">{inc.project}</Mono>
                    </div>
                    <p className="text-xs text-muted-foreground">{inc.opened}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        <SectionCard title="Recent deployments">
          <div className="divide-y divide-border">
            {ALL_RECENT.map(dep => (
              <button
                key={dep.id}
                onClick={() => onNav({ page: "deployment", projectId: dep.project, deploymentId: dep.id })}
                className="w-full px-5 py-3 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left cursor-pointer"
              >
                <div className="w-24 flex-shrink-0">
                  <StatusBadge status={dep.status} pulse={dep.status === "in-progress"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{dep.message}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mono className="text-muted-foreground">{dep.commit}</Mono>
                    <span className="text-muted-foreground text-xs">·</span>
                    <Mono className="text-muted-foreground">{dep.project}</Mono>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 text-xs text-muted-foreground">
                  <div>{dep.timestamp}</div>
                  {dep.duration && <div className="font-mono mt-0.5">{dep.duration}</div>}
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageFade>
  );
}
