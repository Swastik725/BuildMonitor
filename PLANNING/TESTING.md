# 🧪 TESTING.md

Version: 2.0 (current build)

---

# ⚠️ current build Scope Notice

Full coverage across every layer (including Redis/Celery/webhook testing from current build.0) isn't
realistic in builds. current build targets tests on the critical path only — enough to catch regressions
in the features the demo depends on.

---

# Goals (current build)

Reliable, automated, fast enough to run on every push.

---

# Backend

Jest (NestJS default), Supertest for API tests, a test database (or Prisma against a disposable
Postgres in CI).

---

# Frontend

Minimal for current build — a couple of component tests if time allows on Day 6/9. Not a priority against
the build clock.

---

# What to Actually Test in current build (priority order)

1. Auth: register → login → access protected route → refresh → logout
2. Project CRUD scoped to the right organization
3. Deployment trigger → simulator advances it to a terminal state
4. Alert created when a deployment resolves to `FAILED`

---

# CI

Run tests + lint on every push (see `CI_CD.md`).

---

# next phase

Full unit/integration/E2E coverage, load testing, stress testing, chaos testing, Playwright.

---

# Status

Building (current build)

