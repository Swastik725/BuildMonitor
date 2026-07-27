"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { deploymentTone, isLive } from "@/lib/status";
import type { Deployment, DeploymentLog } from "@/lib/types";

export default function DeploymentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: deployment, reload } = useFetch(
    () => api.get<Deployment>(`/deployments/${id}`),
    [id],
  );
  const { data: logs, reload: reloadLogs } = useFetch(
    () => api.get<DeploymentLog[]>(`/deployments/${id}/logs`),
    [id],
  );

  const [actionError, setActionError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const retry = async () => {
    setWorking(true);
    setActionError(null);
    try {
      await api.patch(`/deployments/${id}/retry`);
      reload();
      reloadLogs();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Retry failed");
    } finally {
      setWorking(false);
    }
  };

  const cancel = async () => {
    setWorking(true);
    setActionError(null);
    try {
      await api.patch(`/deployments/${id}/cancel`);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Cancel failed");
    } finally {
      setWorking(false);
    }
  };

  if (!deployment) return <p className="text-sm text-text-muted">Loading deployment...</p>;

  const canCancel = deployment.status === "QUEUED" || deployment.status === "RUNNING";
  const canRetry = deployment.status === "FAILED" || deployment.status === "CANCELLED";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{deployment.commitMessage}</h1>
          <p className="font-mono text-xs text-text-muted">
            {deployment.branch} · {deployment.commitSha.slice(0, 7)} ·{" "}
            {deployment.environment?.project?.name}
          </p>
        </div>
        <StatusPill tone={deploymentTone(deployment.status)} pulse={isLive(deployment.status)}>
          {deployment.status}
        </StatusPill>
      </div>

      <div className="flex gap-2">
        {canRetry && (
          <Button loading={working} onClick={retry}>
            Retry
          </Button>
        )}
        {canCancel && (
          <Button variant="danger" loading={working} onClick={cancel}>
            Cancel
          </Button>
        )}
      </div>
      {actionError && <p className="text-sm text-error">{actionError}</p>}

      <Card>
        <CardHeader>
          <h2 className="text-sm font-medium">Timeline</h2>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <TimelineItem
            label="Dispatched"
            value={deployment.dispatchedAt ? new Date(deployment.dispatchedAt).toLocaleTimeString() : "-"}
          />
          <TimelineItem
            label="Started"
            value={deployment.startedAt ? new Date(deployment.startedAt).toLocaleTimeString() : "-"}
          />
          <TimelineItem
            label="Finished"
            value={deployment.finishedAt ? new Date(deployment.finishedAt).toLocaleTimeString() : "-"}
          />
          <TimelineItem
            label="Duration"
            value={deployment.duration != null ? `${deployment.duration}s` : "-"}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-medium">Logs</h2>
        </CardHeader>
        <CardBody className="max-h-96 overflow-y-auto p-0">
          {logs?.length === 0 && (
            <p className="px-5 py-6 text-sm text-text-muted">
              No logs yet - check back shortly, GitHub Actions run status is polled every 10s.
            </p>
          )}
          <div className="divide-y divide-border font-mono text-xs">
            {logs?.map((log) => (
              <div key={log.id} className="flex gap-3 px-5 py-2">
                <span className="shrink-0 text-text-muted">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={
                    log.logLevel === "ERROR"
                      ? "text-error"
                      : log.logLevel === "WARNING"
                        ? "text-warning"
                        : "text-text"
                  }
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono">{value}</div>
      <div className="mt-0.5 text-xs text-text-muted">{label}</div>
    </div>
  );
}
