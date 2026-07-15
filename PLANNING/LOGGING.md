# 📝 LOGGING.md

Version: 2.0 (V1 MVP)

---

# ⚠️ V1 Scope Notice

This document covers two different things that were conflated in v1.0 — keep them separate:

1. **Application logs** (backend's own operational logs) — V1 uses NestJS's built-in `Logger` to
   console output. No file/DB pipeline, no ELK/Loki.
2. **Deployment logs** (the product feature — logs shown to the user for a simulated deployment)
   — these ARE stored in Postgres (`deployment_logs` table) and are core V1 functionality. See
   `DEPLOYMENT_ENGINE.md`.

---

# Application Logs (V1)

- NestJS `Logger`, console output only
- Log levels: `log` / `warn` / `error` / `debug`
- No request-ID/correlation-ID tracing in V1 (post-V1 with real observability tooling)

---

# Deployment Logs (V1 — product feature)

- Stored per-deployment in `deployment_logs`
- Fields: timestamp, log level, message
- Paginated via `GET /deployments/{id}/logs`
- No search/filter/download in V1 — just chronological display

---

# Post-V1

Structured app-log pipeline (DB/file + dashboard viewer), search/filter/download for deployment
logs, retention policy, ELK/Loki/cloud logging, real-time log streaming via WebSockets.

---

# Status

Building (V1)
