# 📊 MONITORING.md

Version: 2.0 (V1 MVP — Simulated)

---

# ⚠️ V1 Scope Notice

**No Prometheus/Grafana in V1.** There is no real infrastructure to monitor yet (deployments are
simulated), so standing up a metrics stack would be monitoring nothing real. Instead, V1 
generates plausible metric data directly into Postgres and renders it with recharts on the
frontend — same end-user experience (a working monitoring dashboard), no infra overhead.

---

# Goal (V1)

Give the dashboard real-looking, time-series data to display and alert on.

---

# Stack (V1)

`@nestjs/schedule` job → Postgres → `GET /environments/{id}/metrics` → recharts on the frontend.

---

# Metrics (V1)

CPU, Memory, Latency, Error Rate (the four most visually useful for a dashboard demo — Disk/
Network/Requests/Uptime stay in the schema's `MetricType` enum for later).

---

# Simulation Approach (V1)

- Baseline value per metric type with small random jitter each tick, to look like a real running
  service
- Occasionally (small probability per tick) inject a spike — this is what the Alert threshold
  logic reacts to, so alerts don't sit empty in the demo

---

# Health Checks (V1)

- If the environment has a `domain` set, actually `HTTP GET` it and record status/response time
- Otherwise, simulate a result (mostly "up", occasionally "down") on the same cadence

---

# Dashboard (V1)

CPU/Memory/Latency/Error-rate charts per environment, current health status, recent deployment
outcomes.

---

# Post-V1

Prometheus + Grafana once there's a real service to scrape, custom metrics, tracing.

---

# Status

Building (V1)
