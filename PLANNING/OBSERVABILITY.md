# 🔭 OBSERVABILITY.md

Version: 2.0 (V1 MVP)

---

# ⚠️ V1 Scope Notice

Full observability (Prometheus/Grafana, OpenTelemetry/Jaeger tracing, distributed service maps)
is **post-V1** — it monitors infrastructure that doesn't exist yet in a simulated-deployment MVP.
V1's "observability" is deliberately minimal: console logs + the product's own monitoring feature
(which is itself simulated data, see `MONITORING.md`).

---

# V1 Pillars

- **Application logs** — console, via NestJS `Logger` (see `LOGGING.md`)
- **Product metrics** — simulated, stored in Postgres, shown on the dashboard (see
  `MONITORING.md`)
- **Alerts** — threshold-based, generated from the simulated metrics/health/deployment data (see
  the Alerts section of `PROJECT_BIBLE.md`)

No tracing, no APM, no dashboards-about-the-backend-itself in V1 — the "observability" surface
in V1 IS the product surface (that's fine; it's a monitoring dashboard product, not a system with
separate ops tooling yet).

---

# Post-V1

Prometheus/Grafana, OpenTelemetry, Jaeger, service maps, APM — once there's real infrastructure
(actual deployed services, actual backend under real load) worth instrumenting.

---

# Status

Deferred (Post-V1) — see `MONITORING.md` for what V1 actually ships
