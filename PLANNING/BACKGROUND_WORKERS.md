# ⚙️ BACKGROUND_WORKERS.md

Version: 2.0 (current build)

---

# ⚠️ current build Scope Notice

Celery + Redis are **next phase**. There is no real asynchronous workload in the current build feature set
(nothing is slow enough — GitHub sync is a single API call, and deployments/metrics/health are
simulated) to justify a dedicated queue + broker. current build uses NestJS's built-in scheduler instead.

---

# Technology (current build)

`@nestjs/schedule` — in-process cron/interval jobs, no separate broker or worker process.

---

# Purpose

Advance simulated state (deployments, metrics, health) on a timer without blocking HTTP requests.

---

# Jobs (current build)

- **Deployment Progressor** — every few seconds, advance any `RUNNING`/`QUEUED` deployment one
  step, appending a log line; resolve to `SUCCESS`/`FAILED` after N ticks
- **Metrics Generator** — every ~10–30s, insert a metric row per active environment
- **Health Check Runner** — every ~30–60s, ping environment domain if set, else simulate a result
- **Alert Evaluator** — runs right after the jobs above write data, checks thresholds, creates
  `Alert` + `Notification` rows on breach

---

# Failure Handling (current build)

If a job throws, log it and let the next tick retry — no dead-letter queue needed at this scale.

---

# next phase

Real BullMQ + Redis queue once there's a genuine async workload (e.g. real GitHub webhook
processing, real build execution, email sending).

---

# Status

Building (current build)

