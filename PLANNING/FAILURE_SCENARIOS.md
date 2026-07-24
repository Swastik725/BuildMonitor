# 💥 FAILURE_SCENARIOS.md

Version: 2.0 (current build)

---

# ⚠️ current build Scope Notice

Redis/Celery failure scenarios removed — not part of current build architecture. GitHub failure scenarios
narrowed to what's relevant for a manual, read-only, no-webhook integration.

---

# Authentication (current build)

- Expired JWT
- Invalid JWT
- Reused/revoked refresh token
- Duplicate registration

---

# GitHub (current build)

- Repo not found / private repo without access
- GitHub API rate limit hit during manual sync
- Repository renamed or deleted upstream since last sync

_Removed (next phase, no webhooks in current build): invalid OAuth, invalid webhook signature._

---

# Database

- Connection lost
- Slow queries
- Migration failure

---

# Deployments (Simulated)

- Simulated deployment resolves to FAILED (this is expected/intentional behavior, not a bug —
  it's what feeds the Alerts feature)
- Simulator tick runs while the deployment row has been deleted (guard against this)

---

# Monitoring (Simulated)

- Simulated metric/health job fails to run on schedule (log it, don't crash the app)
- Alert not created due to evaluator error (log + retry next tick)

---

# Recovery Strategy

```
Retry (next tick) → Log → Graceful failure (never crash the whole app for one bad job run)
```

---

# next phase

Circuit breakers, dead letter queues, backup workers, Redis/Celery-specific failure handling.

---

# Status

Building (current build)

