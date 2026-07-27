import { useMemo } from "react";
import { Check, CircleAlert, TriangleAlert } from "lucide-react";
import type { NavState } from "../lib/types";
import { alertsApi, type Alert } from "../lib/api";
import { useResource } from "../lib/use-resource";
import { Btn, PageFade } from "../components/primitives";
import { TopBar } from "../components/TopBar";

const severityClass: Record<Alert["severity"], string> = {
  LOW: "text-sky-400 bg-sky-400/10",
  MEDIUM: "text-amber-400 bg-amber-400/10",
  HIGH: "text-orange-400 bg-orange-400/10",
  CRITICAL: "text-red-400 bg-red-400/10",
};

export function AlertsPage({ onNav }: { onNav: (nav: NavState) => void }) {
  const alerts = useResource(() => alertsApi.list(), [], 10000);
  const openAlerts = useMemo(() => alerts.data ?? [], [alerts.data]);

  return (
    <PageFade>
      <TopBar title="Alerts" crumbs={[{ label: "Command center", nav: { page: "dashboard" } }]} onCrumb={onNav} />
      <div className="saas-page space-y-5">
        <section className="glass-panel">
          <div className="px-5 py-4 border-b border-white/[.06] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Active alerts</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Threshold breaches and failed service signals detected by the monitor</p>
            </div>
            <span className="text-xs text-muted-foreground">{openAlerts.length} open</span>
          </div>
          {alerts.error ? <div className="p-6 text-sm text-destructive">{alerts.error}</div> : !alerts.loading && !openAlerts.length ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No active alerts. All monitored signals are within their configured limits.</div>
          ) : (
            <div className="divide-y divide-white/[.06]">
              {openAlerts.map(alert => <AlertRow key={alert.id} alert={alert} onResolve={async () => { await alertsApi.resolve(alert.id); await alerts.refresh(); }} />)}
            </div>
          )}
        </section>
      </div>
    </PageFade>
  );
}

function AlertRow({ alert, onResolve }: { alert: Alert; onResolve: () => Promise<void> }) {
  return (
    <div className="flex items-start gap-4 p-5">
      <div className={`mt-0.5 rounded-full p-2 ${severityClass[alert.severity]}`}><CircleAlert className="w-4 h-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-medium">{alert.title}</p><p className="mt-1 text-sm text-muted-foreground">{alert.description}</p></div>
          <span className={`rounded px-2 py-1 text-[10px] font-semibold tracking-wide ${severityClass[alert.severity]}`}>{alert.severity}</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{alert.project?.name ?? "Project"} · {new Date(alert.createdAt).toLocaleString()}</span>
          <Btn variant="secondary" size="sm" onClick={() => void onResolve()}><Check className="w-3.5 h-3.5" /> Resolve</Btn>
        </div>
      </div>
    </div>
  );
}
