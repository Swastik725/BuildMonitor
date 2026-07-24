# 🔭 OBSERVABILITY.md

Version: 2.0 (current build)

---

# ⚠️ current build Scope Notice

Full observability (Prometheus/Grafana, OpenTelemetry/Jaeger tracing, distributed service maps)
is **next phase** — it monitors infrastructure that doesn't exist yet in a simulated-deployment MVP.
current build's "observability" is deliberately minimal: console logs + the product's own monitoring feature
(which is itself simulated data, see `MONITORING.md`).

---

# current build Pillars

- **Application logs** — console, via NestJS `Logger` (see `LOGGING.md`)
- **Product metrics** — simulated, stored in Postgres, shown on the dashboard (see
  `MONITORING.md`)
- **Alerts** — threshold-based, generated from the simulated metrics/health/deployment data (see
  the Alerts section of `PROJECT_BIBLE.md`)

No tracing, no APM, no dashboards-about-the-backend-itself in current build — the "observability" surface
in current build IS the product surface (that's fine; it's a monitoring dashboard product, not a system with
separate ops tooling yet).

---

# next phase

Prometheus/Grafana, OpenTelemetry, Jaeger, service maps, APM — once there's real infrastructure
(actual deployed services, actual backend under real load) worth instrumenting.

---

# Status

Deferred (next phase) — see `MONITORING.md` for what current build actually ships

