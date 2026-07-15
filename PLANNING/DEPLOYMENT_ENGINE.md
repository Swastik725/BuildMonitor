# 🚀 DEPLOYMENT_ENGINE.md

Version: 2.0 (V1 MVP — Simulated)

---

# ⚠️ V1 Scope Notice

**This is a simulator, not a real build/deploy system.** BuildMonitor is a monitoring platform,
not a CI/CD product — in V1 there is no real code being built, tested, or deployed anywhere. The
goal is to model the deployment *lifecycle* realistically (states, timing, logs) so the
monitoring/alerting features have something real to react to. This should be stated plainly in
the README/demo, not hidden.

---

# Goal (V1)

Simulate a deployment lifecycle realistically enough to drive the monitoring, alerting, and
notification features.

---

# Deployment States (unchanged)

```
QUEUED → RUNNING → SUCCESS / FAILED
```
(`CANCELLED` stays in the schema/enum but isn't reachable from the V1 UI.)

---

# Flow (V1)

```
User clicks "Deploy"
   ↓
Deployment row created (QUEUED)
   ↓
@nestjs/schedule tick picks it up → RUNNING
   ↓
Generates canned-but-varied log lines over several ticks (e.g. "Installing dependencies…",
"Running tests…", "Building…", "Deploying…")
   ↓
Resolves to SUCCESS (~85% of the time) or FAILED (~15%, to give Alerts something to react to)
   ↓
duration/finishedAt set → Metrics simulator starts for the environment → Alert created if FAILED
   ↓
Notification created for the triggering user
```

---

# Deployment Data (unchanged)

Commit SHA, commit message, branch, triggered-by, duration, status, environment.

(In V1, `commitSha`/`commitMessage` can be supplied by the user when triggering a deploy, or
defaulted from the connected repository's latest known commit if available.)

---

# Logs

Persistent in `deployment_logs`, paginated over the API. No real-time streaming in V1 — the
frontend polls `GET /deployments/{id}/logs` every few seconds while status is `RUNNING`.

---

# Post-V1

Real build execution, rollback, blue/green, canary, pipeline builder, real GitHub Actions/webhook
triggered deploys.

---

# Status

Building (V1)
