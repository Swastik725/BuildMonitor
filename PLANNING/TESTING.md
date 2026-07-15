# 🧪 TESTING.md

Version: 2.0 (V1 MVP)

---

# ⚠️ V1 Scope Notice

Full coverage across every layer (including Redis/Celery/webhook testing from v1.0) isn't
realistic in 10 days. V1 targets tests on the critical path only — enough to catch regressions
in the features the demo depends on.

---

# Goals (V1)

Reliable, automated, fast enough to run on every push.

---

# Backend

Jest (NestJS default), Supertest for API tests, a test database (or Prisma against a disposable
Postgres in CI).

---

# Frontend

Minimal for V1 — a couple of component tests if time allows on Day 6/9. Not a priority against
the 10-day clock.

---

# What to Actually Test in V1 (priority order)

1. Auth: register → login → access protected route → refresh → logout
2. Project CRUD scoped to the right organization
3. Deployment trigger → simulator advances it to a terminal state
4. Alert created when a deployment resolves to `FAILED`

---

# CI

Run tests + lint on every push (see `CI_CD.md`).

---

# Post-V1

Full unit/integration/E2E coverage, load testing, stress testing, chaos testing, Playwright.

---

# Status

Building (V1)
