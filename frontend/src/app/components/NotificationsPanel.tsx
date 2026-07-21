import { useState, useEffect } from "react";
import { Bell, AlertTriangle, XCircle } from "lucide-react";
import { useClickOutside } from "../lib/useClickOutside";
import { incidentsApi, type Incident } from "../lib/incidentsApi";
import { deploymentsApi, type Deployment } from "../lib/deploymentsApi";
import { formatRelativeTime } from "../lib/statusMap";

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [failedDeploys, setFailedDeploys] = useState<Deployment[]>([]);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  useEffect(() => {
    if (!open) return;
    incidentsApi.listOpen().then(setIncidents).catch(() => setIncidents([]));
    deploymentsApi.listRecent().then(deps => setFailedDeploys(deps.filter(d => d.status === "FAILED"))).catch(() => setFailedDeploys([]));
  }, [open]);

  const count = incidents.length + failedDeploys.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        Notifications
        {count > 0 && (
          <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-px leading-none">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1.5 w-72 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-20">
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-xs font-medium text-foreground">Notifications</p>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {count === 0 ? (
              <p className="px-4 py-4 text-xs text-muted-foreground">Nothing to see — all clear.</p>
            ) : (
              <>
                {incidents.map(inc => (
                  <div key={inc.id} className="px-4 py-2.5 flex gap-2.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs text-foreground leading-snug">{inc.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {inc.project?.slug} · {formatRelativeTime(inc.openedAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {failedDeploys.map(dep => (
                  <div key={dep.id} className="px-4 py-2.5 flex gap-2.5">
                    <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs text-foreground leading-snug truncate">{dep.commitMessage}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {dep.environment?.project?.slug} · deployment failed · {formatRelativeTime(dep.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
