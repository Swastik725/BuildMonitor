import type { Status } from "./types";
import type { DeploymentStatus } from "./deploymentsApi";
import type { IncidentStatus } from "./incidentsApi";

export function deploymentStatusToUi(status: DeploymentStatus): Status {
  switch (status) {
    case "QUEUED": return "warning";
    case "RUNNING": return "in-progress";
    case "SUCCESS": return "success";
    case "FAILED": return "failed";
    case "CANCELLED": return "cancelled";
  }
}

export function incidentStatusToUi(status: IncidentStatus): Status {
  switch (status) {
    case "OPEN": return "open";
    case "INVESTIGATING": return "warning";
    case "RESOLVED": return "resolved";
  }
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export function formatDuration(seconds: number | null): string | null {
  if (seconds == null) return null;
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
}
