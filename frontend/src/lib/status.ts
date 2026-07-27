import type { DeploymentStatus, HealthStatus } from "./types";

export function deploymentTone(status: DeploymentStatus) {
  switch (status) {
    case "SUCCESS":
      return "success" as const;
    case "FAILED":
      return "error" as const;
    case "RUNNING":
      return "accent" as const;
    case "CANCELLED":
      return "neutral" as const;
    default:
      return "warning" as const; // QUEUED
  }
}

export function healthTone(status: HealthStatus) {
  switch (status) {
    case "UP":
      return "success" as const;
    case "DOWN":
      return "error" as const;
    default:
      return "warning" as const; // DEGRADED
  }
}

export function isLive(status: DeploymentStatus) {
  return status === "RUNNING" || status === "QUEUED";
}
