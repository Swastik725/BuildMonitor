import { Github, GitBranch, Package, ExternalLink, Zap, ChevronRight, Globe } from "lucide-react";
import type { NavState, Status } from "../lib/types";
import { PROJECTS, DEPLOYMENTS } from "../lib/mockData";
import { PageFade, SectionCard, Btn, StatusBadge, Mono } from "../components/primitives";
import { TopBar } from "../components/TopBar";

export function ProjectPage({ projectId, onNav }: { projectId: string; onNav: (s: NavState) => void }) {
  const project = PROJECTS.find(p => p.id === projectId) ?? PROJECTS[0];
  const deps = DEPLOYMENTS[project.id] ?? DEPLOYMENTS["web-frontend"];

  return (
    <PageFade>
      <TopBar
        title={project.name}
        crumbs={[{ label: "Projects", nav: { page: "dashboard" } }]}
        onCrumb={onNav}
      />
      <div className="p-5 max-w-5xl space-y-5">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <h1 className="text-base font-semibold text-foreground">{project.name}</h1>
                <StatusBadge status={project.status} pulse={project.status === "in-progress"} />
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5" />
                  <Mono className="text-muted-foreground">{project.repo}</Mono>
                </span>
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" />
                  <Mono className="text-muted-foreground">{project.branch}</Mono>
                </span>
                <span className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  {project.framework}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Btn variant="secondary" size="sm"><ExternalLink className="w-3.5 h-3.5" />View repo</Btn>
              <Btn variant="primary" size="sm"><Zap className="w-3.5 h-3.5" />Deploy now</Btn>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { label: "Uptime (30d)",    value: project.uptime  },
              { label: "Total deploys",   value: String(project.deploys)  },
              { label: "Avg build time",  value: "2m 48s" },
              { label: "Last deploy",     value: project.lastDeploy },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold text-foreground mt-0.5 tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <SectionCard title="Deployment history" action={<span className="text-xs text-muted-foreground">{deps.length} total</span>}>
          <div className="divide-y divide-border">
            {deps.map(dep => (
              <button
                key={dep.id}
                onClick={() => onNav({ page: "deployment", projectId: project.id, deploymentId: dep.id })}
                className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left cursor-pointer"
              >
                <div className="w-24 flex-shrink-0">
                  <StatusBadge status={dep.status} pulse={dep.status === "in-progress"} />
                </div>
                <div className="w-16 flex-shrink-0">
                  <Mono className="text-muted-foreground">{dep.commit}</Mono>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{dep.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{dep.triggeredBy}</p>
                </div>
                <div className="text-right flex-shrink-0 text-xs text-muted-foreground space-y-0.5">
                  <div>{dep.timestamp}</div>
                  {dep.duration && <div className="font-mono">{dep.duration}</div>}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </SectionCard>

        <div className="grid grid-cols-2 gap-5">
          <SectionCard title="Environment">
            <div className="divide-y divide-border">
              {[
                { key: "NODE_ENV",        val: "production",                  secret: false },
                { key: "NEXT_PUBLIC_URL", val: "https://app.acme.com",        secret: false },
                { key: "DATABASE_URL",    val: "postgres://••••••@...",        secret: true  },
                { key: "REDIS_URL",       val: "redis://••••••@...",           secret: true  },
                { key: "API_SECRET_KEY",  val: "sk_live_••••••••••••",         secret: true  },
              ].map(env => (
                <div key={env.key} className="px-5 py-2.5 flex items-center gap-3">
                  <Mono className="text-foreground flex-1 text-xs">{env.key}</Mono>
                  <Mono className="text-muted-foreground text-xs truncate max-w-36">{env.val}</Mono>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Domains">
            <div className="divide-y divide-border">
              {[
                { domain: "app.acme.com",         status: "healthy" as Status, primary: true  },
                { domain: "staging.acme.com",      status: "healthy" as Status, primary: false },
                { domain: "preview-pr-123.acme.com", status: "healthy" as Status, primary: false },
              ].map(d => (
                <div key={d.domain} className="px-5 py-3 flex items-center gap-3">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <Mono className="text-foreground text-xs flex-1 truncate">{d.domain}</Mono>
                  {d.primary && (
                    <span className="text-xs text-muted-foreground border border-border px-1.5 py-px rounded">primary</span>
                  )}
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageFade>
  );
}
