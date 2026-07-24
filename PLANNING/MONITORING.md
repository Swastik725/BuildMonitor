# MONITORING.md

Version: 2.0

---

# Scope Notice

There is no Prometheus/Grafana stack in the current build. Deployments are simulated, so the
monitoring system stores generated metric rows in Postgres and renders them with recharts on the
frontend.

---

# Goal

Give the dashboard real-looking, time-series data to display and alert on.

---

# Stack

`@nestjs/schedule` job -> Postgres -> `GET /environments/{id}/metrics` -> recharts on the frontend.

---

# Metrics

CPU, Memory, Latency, Error Rate are the primary dashboard charts. Disk, Network, and Requests are
also persisted so the schema supports broader monitoring later.

---

# Simulation Approach

- Baseline value per metric type with small random jitter each tick
- Occasional spikes to make the charts and future alert thresholds meaningful

---

# Health Checks

- If the environment has a `domain` set, actually HTTP GET it and record status/response time
- Otherwise, simulate a result on the same cadence

---

# Dashboard

CPU/Memory/Latency/Error-rate charts per environment, current health status, recent deployment
outcomes.

---

# next phase

Prometheus + Grafana once there is a real service to scrape, plus custom metrics and tracing.

---

# Status

Implemented for the current build; Prometheus/Grafana remain a future phase.
