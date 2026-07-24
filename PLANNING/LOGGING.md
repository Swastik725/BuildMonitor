# 📝 LOGGING.md

Version: 2.0 (current build)

---

# ⚠️ current build Scope Notice

This document covers two different things that were conflated in current build.0 — keep them separate:

1. **Application logs** (backend's own operational logs) — current build uses NestJS's built-in `Logger` to
   console output. No file/DB pipeline, no ELK/Loki.
2. **Deployment logs** (the product feature — logs shown to the user for a simulated deployment)
   — these ARE stored in Postgres (`deployment_logs` table) and are core current build functionality. See
   `DEPLOYMENT_ENGINE.md`.

---

# Application Logs (current build)

- NestJS `Logger`, console output only
- Log levels: `log` / `warn` / `error` / `debug`
- No request-ID/correlation-ID tracing in current build (next phase with real observability tooling)

---

# Deployment Logs (current build — product feature)

- Stored per-deployment in `deployment_logs`
- Fields: timestamp, log level, message
- Paginated via `GET /deployments/{id}/logs`
- No search/filter/download in current build — just chronological display

---

# next phase

Structured app-log pipeline (DB/file + dashboard viewer), search/filter/download for deployment
logs, retention policy, ELK/Loki/cloud logging, real-time log streaming via WebSockets.

---

# Status

Building (current build)

