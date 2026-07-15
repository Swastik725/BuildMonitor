# 🔌 WEBSOCKETS.md

Version: 2.0 (V1 MVP)

---

# ⚠️ V1 Scope Notice

**No WebSockets in V1.** Real-time push isn't needed to make the product feel alive at MVP scale
— polling every few seconds via TanStack Query gives a "live enough" experience for a demo, with
far less implementation and hosting complexity (no sticky sessions/connection scaling to worry
about).

---

# V1 Substitute: Polling

```
Client (TanStack Query, refetchInterval) → GET /deployments/{id} (or /logs, /metrics, /notifications)
   → re-renders on change
```

Suggested intervals: deployment status/logs every 2–3s while `RUNNING`, metrics every 10s,
notifications every 15–30s.

---

# Post-V1

Reintroduce WebSockets (NestJS Gateway) for: live deployment logs, deployment status push,
notification push, metric updates, health updates — once polling actually becomes a bottleneck or
the UX gap becomes worth the added complexity.

---

# Status

Deferred (Post-V1) — polling used instead in V1
