"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Alert } from "@/lib/types";

export default function AlertsPage() {
  const [showResolved, setShowResolved] = useState(false);
  const { data: alerts, loading, error, reload } = useFetch(
    () => api.get<Alert[]>(`/alerts?resolved=${showResolved}`),
    [showResolved],
  );

  const resolve = async (id: string) => {
    await api.patch(`/alerts/${id}/resolve`);
    reload();
  };

  const severityTone = (severity: Alert["severity"]) =>
    severity === "CRITICAL" ? "error" : severity === "WARNING" ? "warning" : "accent";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Alerts</h1>
          <p className="text-sm text-text-muted">Threshold-based alerts from your metrics.</p>
        </div>
        <div className="flex gap-1 rounded-md border border-border p-1">
          <button
            onClick={() => setShowResolved(false)}
            className={`rounded px-3 py-1 text-xs ${!showResolved ? "bg-surface-2 text-text" : "text-text-muted"}`}
          >
            Active
          </button>
          <button
            onClick={() => setShowResolved(true)}
            className={`rounded px-3 py-1 text-xs ${showResolved ? "bg-surface-2 text-text" : "text-text-muted"}`}
          >
            Resolved
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-text-muted">Loading alerts...</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      <Card>
        <CardBody className="divide-y divide-border p-0">
          {alerts?.length === 0 && (
            <p className="px-5 py-6 text-sm text-text-muted">
              {showResolved ? "No resolved alerts." : "No active alerts. Everything's quiet."}
            </p>
          )}
          {alerts?.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-xs text-text-muted">{a.message}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill tone={severityTone(a.severity)}>{a.severity}</StatusPill>
                {!a.resolved && (
                  <Button variant="secondary" onClick={() => resolve(a.id)}>
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
