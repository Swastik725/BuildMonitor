# 📚 ADR.md

Architecture Decision Records

---

## ADR-001

Decision: Use PostgreSQL
Status: Accepted
Reason: Relational data, ACID guarantees

---

## ADR-002 (Revised — see ADR-011)

Decision: ~~Use FastAPI~~ → Use NestJS
Status: Superseded
Reason: The backend was actually scaffolded on NestJS + Prisma, not FastAPI + SQLAlchemy as
originally planned. ADR-011 formalizes sticking with what's already built rather than rewriting
to match the original doc.

---

## ADR-003 (Revised — see ADR-012)

Decision: ~~Use Redis~~
Status: Superseded for current build
Reason: No real caching/broker need at MVP scale. See ADR-012.

---

## ADR-004 (Revised — see ADR-013)

Decision: ~~Use Celery~~
Status: Superseded for current build
Reason: No real async workload yet; replaced by in-process scheduled jobs. See ADR-013.

---

## ADR-005

Decision: Use UUID
Status: Accepted
Reason: Distributed IDs

---

## ADR-006

Decision: Repository Pattern (via Prisma as the data layer)
Status: Accepted
Reason: Separation of concerns

---

## ADR-007

Decision: Layered Architecture (Controller → Service → Prisma)
Status: Accepted
Reason: Maintainability

---

## ADR-008

Decision: JWT Authentication
Status: Accepted
Reason: Stateless APIs

---

## ADR-009

Decision: Soft Deletes
Status: Accepted
Reason: Data recovery

---

## ADR-010

Decision: Organization-first domain model
Status: Accepted
Reason: Scalability — allows multi-member orgs later without restructuring

---

## ADR-011

Decision: Backend stack is NestJS + Prisma + PostgreSQL, not FastAPI + SQLAlchemy
Status: Accepted
Reason: Matches what's already built in the backend repo. Rewriting the backend to match the
original FastAPI plan would waste days of the build window for no benefit — the architecture
principles (layered, DI, REST) transfer directly.
Tradeoffs: Original planning docs referencing FastAPI/Alembic/Pydantic are corrected throughout.

---

## ADR-012

Decision: No Redis / caching layer in current build
Status: Accepted
Reason: At MVP scale (one user's data, low request volume), a cache adds operational complexity
with no measurable benefit. TanStack Query's client-side caching covers the practical need.
Tradeoffs: Will need to be added back once there's real concurrent load — deferred to next phase,
design already sketched in `CACHING.md`.

---

## ADR-013

Decision: No Celery/BullMQ; use `@nestjs/schedule` in-process jobs instead
Status: Accepted
Reason: There is no genuinely slow/async workload in the current build feature set — deployments, metrics,
and health checks are all simulated, not real work. A message broker + worker process would add
setup and operational cost for jobs that are themselves fake.
Tradeoffs: In-process jobs don't survive a server restart mid-tick and don't scale horizontally.
Acceptable for a single-instance MVP; revisit when real async work (e.g. webhook processing,
email sending) exists.

---

## ADR-014

Decision: Deployments, metrics, and health checks are simulated in current build, not real
Status: Accepted
Reason: Building a real CI/build/deploy engine and real infrastructure to monitor is a multi-week
project on its own — far outside a build MVP window, and not actually the point (BuildMonitor is
a monitoring/dashboard product, not a CI/CD product). A clearly-labeled simulator lets every
downstream feature (logs, dashboards, alerts, notifications) be built and demoed honestly.
Tradeoffs: The demo must be transparent that this is simulated — documented in the README and
called out explicitly rather than implied to be real.

---

## ADR-015

Decision: No GitHub OAuth or webhooks in current build; manual read-only repo connection instead
Status: Accepted
Reason: Setting up a GitHub OAuth App and secure webhook handling correctly is itself several
days of work unrelated to the product's core value (monitoring/alerting UX). A manual
owner/repo connect + on-demand sync via the public REST API delivers the same "connect your repo"
user story for a fraction of the effort.
Tradeoffs: No automatic sync on push, no commit history beyond "latest commit". Deferred to
next phase (see `GITHUB_INTEGRATION.md`).

