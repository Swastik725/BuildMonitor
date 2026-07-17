import { Hash, GitBranch, User, Clock, ExternalLink, Zap, Terminal } from "lucide-react";
import type { NavState } from "../lib/types";
import { PROJECTS, DEPLOYMENTS, LOG_LINES } from "../lib/mockData";
import { PageFade, SectionCard, Btn, StatusBadge, Mono } from "../components/primitives";
import { TopBar } from "../components/TopBar";

export function DeploymentPage({ projectId, deploymentId, onNav }: {
  projectId: string; deploymentId: string; onNav: (s: NavState) => void;
}) {
  const project = PROJECTS.find(p => p.id === projectId) ?? PROJECTS[0];
  const deps = DEPLOYMENTS[project.id] ?? DEPLOYMENTS["web-frontend"];
  const dep = deps.find(d => d.id === deploymentId) ?? deps[0];

  const logColor: Record<string, string> = {
    info:    "text-muted-foreground",
    success: "#5fa86e",
    error:   "#c06060",
    warn:    "#b88c4a",
    muted:   "",
  };

  return (
    <PageFade>
      <TopBar
        title={dep.id}
        crumbs={[
          { label: "Projects", nav: { page: "dashboard" } },
          { label: project.name, nav: { page: "project", projectId } },
        ]}
        onCrumb={onNav}
      />
      <div className="p-5 max-w-5xl space-y-5">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-start gap-4 justify-between flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2.5">
                <StatusBadge status={dep.status} pulse={dep.status === "in-progress"} />
                <Mono className="text-muted-foreground">{dep.id}</Mono>
              </div>
              <p className="text-base font-medium text-foreground mb-3">{dep.message}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  <Mono className="text-muted-foreground">{dep.commit}</Mono>
                </span>
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" />
                  <Mono className="text-muted-foreground">{dep.branch}</Mono>
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {dep.triggeredBy}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {dep.timestamp}{dep.duration ? ` · ${dep.duration}` : ""}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Btn variant="secondary" size="sm"><ExternalLink className="w-3.5 h-3.5" />View commit</Btn>
              {dep.status === "failed" && (
                <Btn variant="primary" size="sm"><Zap className="w-3.5 h-3.5" />Redeploy</Btn>
              )}
            </div>
          </div>

          {dep.status !== "in-progress" && (
            <div className="mt-5 pt-5 border-t border-border grid grid-cols-3 gap-5">
              {[
                { label: "Queue time",  value: "2s"        },
                { label: "Build time",  value: dep.duration ?? "—" },
                { label: "Deploy time", value: "8s"        },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 font-mono">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Build log</h2>
            {dep.duration && (
              <span className="ml-auto font-mono text-xs text-muted-foreground">{dep.duration}</span>
            )}
          </div>
          <div className="p-4 bg-[#0d1017] overflow-x-auto">
            <div className="space-y-px">
              {LOG_LINES.map((line, i) => (
                <div
                  key={i}
                  className="flex gap-4 px-1 py-px rounded hover:bg-white/5 transition-colors"
                >
                  <span className="font-mono text-xs select-none flex-shrink-0 w-16" style={{ color: "rgba(255,255,255,0.2)" }}>
                    {line.t}
                  </span>
                  <span
                    className="font-mono text-xs leading-5 whitespace-pre"
                    style={{
                      color: line.level === "success" ? "#5fa86e"
                           : line.level === "error"   ? "#c06060"
                           : line.level === "warn"    ? "#b88c4a"
                           : line.level === "muted"   ? "rgba(255,255,255,0.3)"
                           : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {line.msg}
                  </span>
                </div>
              ))}
              {dep.status === "in-progress" && (
                <div className="flex gap-4 px-1 py-px">
                  <span className="font-mono text-xs select-none w-16" style={{ color: "rgba(255,255,255,0.2)" }}>
                    {" "}
                  </span>
                  <span className="font-mono text-xs" style={{ color: "#5580c8" }}>
                    <span className="animate-pulse">█</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageFade>
  );
}
