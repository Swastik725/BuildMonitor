export type Page = "login" | "dashboard" | "project" | "deployment" | "org" | "settings";
export interface NavState { page: Page; projectId?: string; deploymentId?: string; }
export type Status = "success" | "failed" | "in-progress" | "cancelled" | "warning" | "healthy" | "degraded" | "down" | "open" | "resolved";

// ─── Status config ────────────────────────────────────────────────────────────

export const STATUS: Record<Status, { label: string; color: string; bg: string }> = {
  success:     { label: "Success",    color: "#5fa86e", bg: "rgba(95,168,110,0.13)"  },
  failed:      { label: "Failed",     color: "#c06060", bg: "rgba(192,96,96,0.13)"   },
  "in-progress":{ label: "Building", color: "#5580c8", bg: "rgba(85,128,200,0.13)"  },
  cancelled:   { label: "Cancelled",  color: "#6e6e6a", bg: "rgba(110,110,106,0.13)" },
  warning:     { label: "Warning",    color: "#b88c4a", bg: "rgba(184,140,74,0.13)"  },
  healthy:     { label: "Healthy",    color: "#5fa86e", bg: "rgba(95,168,110,0.13)"  },
  degraded:    { label: "Degraded",   color: "#b88c4a", bg: "rgba(184,140,74,0.13)"  },
  down:        { label: "Down",       color: "#c06060", bg: "rgba(192,96,96,0.13)"   },
  open:        { label: "Open",       color: "#c06060", bg: "rgba(192,96,96,0.13)"   },
  resolved:    { label: "Resolved",   color: "#5fa86e", bg: "rgba(95,168,110,0.13)"  },
};
