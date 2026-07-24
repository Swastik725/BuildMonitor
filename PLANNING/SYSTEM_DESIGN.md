# 🏗️ SYSTEM_DESIGN.md

> **Document Version:** 2.0 (current build)
>
> **Status:** Building
>
> **Project:** BuildMonitor

---

# ⚠️ current build Scope Notice

This document originally designed the full long-term system (FastAPI, Celery, Redis,
Prometheus/Grafana, real GitHub OAuth/webhooks). That target architecture is preserved in
`PROJECT_BIBLE.md → Future Scope`. Everything below describes what's actually being built in the
build current build sprint, on the real stack (NestJS + Prisma), with simulated infra where real infra
would take too long to stand up safely.

---

# 1. What is BuildMonitor (current build)?

A developer platform where a user can register, create a project, connect a GitHub repo
(read-only), define environments, trigger deployments, and watch a simulated
deployment/monitoring pipeline produce logs, metrics, health checks, and alerts.

---

# 2. Goals

## Functional Goals (current build)

* Register / login
* Create a project, connect a repository (manual owner/repo, no OAuth)
* Create environments
* Trigger a deployment and watch it progress and complete
* View deployment logs
* View simulated metrics and health status
* Receive alerts and in-app notifications

## Engineering Goals (current build)

* Layered NestJS architecture (controller → service → Prisma)
* JWT authentication done correctly (access + refresh)
* A believable, well-structured simulator standing in for real deploy/monitoring infra
* Clean REST API, versioned (`/api/current build`)
* Basic but real test coverage on the critical path

---

# 3. Non-Functional Requirements (current build)

## Maintainability
Controller/service separation. No business logic in controllers.

## Reliability
Simulator jobs run independently per environment; one failing job shouldn't take down others.

## Security
Passwords hashed (bcrypt/argon2). JWT auth. Input validation on every endpoint. No secrets in
source.

## Explicitly deferred to next phase
Horizontal scalability, multi-region, real background job durability (BullMQ/Redis), real-time
push (WebSockets) — see `PROJECT_BIBLE.md → Future Scope`.

---

# 4. Target Users (current build)

Individual developers and students building/reviewing a portfolio project. (Teams/orgs are
schema-ready but not exposed in current build UI.)

---

# 5. User Journey (current build)

```
Register → Land in personal org → Create project → Connect repository
   → Create environment(s) → Trigger deployment → Watch status/logs update
   → View metrics + health on dashboard → Get alerted on failure/threshold breach
   → See notification in bell icon
```

(Email verification, GitHub OAuth login, and org invites are removed from this journey for current build.)

---

# 6. Core Modules (current build)

```
Auth → Organizations (personal, auto-created) → Projects → Repository (manual connect)
   → Environments → Deployments (simulated) → Metrics/Health (simulated) → Alerts → Notifications
```

Removed from current build module list: GitHub OAuth/Webhooks, Background Workers (Celery/Redis),
Administration/Audit.

---

# 7. High-Level Architecture (current build)

```
                     Browser

                        │

          Next.js Frontend (React, polling)

                        │

              HTTPS REST API (/api/current build)

                        │

                  NestJS Backend

                        │

                  PostgreSQL (Prisma)

                        │

     @nestjs/schedule cron jobs (deployment / metrics / health simulators, alert evaluation)
```

No Redis. No Celery. No Prometheus/Grafana. No Nginx. These return in the next phase roadmap once
there's real infrastructure or real async load to justify them.

---

# 8. Backend Architecture (current build)

```
Controller (validation, auth guard)
      ↓
Service (business logic, simulator scheduling)
      ↓
Prisma (persistence)
      ↓
PostgreSQL
```

---

# 9. Frontend Architecture (current build)

```
Pages (Next.js App Router) → Layouts → Components → Hooks (TanStack Query, polling) → API Client → Backend
```

---

# 10. "Background Processing" in current build

Instead of Celery + Redis, current build uses **in-process scheduled jobs** (`@nestjs/schedule`) inside the
NestJS app itself:

* Deployment simulator — advances QUEUED → RUNNING → SUCCESS/FAILED on a timer, writing log rows
* Metrics simulator — inserts a metric row per active environment on an interval
* Health check simulator — pings the environment's domain if set, otherwise fabricates a result
* Alert evaluator — runs after each metric/health/deployment write, checks thresholds

This is a legitimate, explicitly-scoped substitute for a real job queue — call it out as a design
decision (see ADR-013), not something to be defensive about.

---

# 11–16. Flows (current build)

**Auth:** Login → validate credentials → issue access + refresh JWT → authenticated requests →
refresh → logout.

**Deployment:** User triggers deploy → row created (QUEUED) → cron picks it up → RUNNING → logs
generated → SUCCESS/FAILED → metrics/alerts follow → notification created.

**Monitoring:** Cron tick → metric/health row written → alert evaluator checks thresholds →
alert + notification created if breached → frontend polls and reflects it.

**Logging:** Deployment logs are stored in Postgres and paginated over the API (no separate log
pipeline/ELK stack in current build).

**Notifications:** In-app only, created directly on the relevant event, read via
`GET /notifications`, marked read via `PATCH /notifications/{id}/read`. No email in current build.

---

# 17. Security Model (current build)

* JWT access + refresh
* Password hashing (bcrypt/argon2)
* Every write endpoint validated (class-validator DTOs) and scoped to the requesting user's
  organization
* Rate limiting on auth endpoints
* No OAuth, no webhook signature verification needed in current build (no webhooks in current build)

---

# 18. Failure Scenarios (current build relevant subset)

Database restart, invalid/expired JWT, GitHub API rate limit on manual sync, deployment "fails"
(simulated), duplicate registration. See `FAILURE_SCENARIOS.md`.

---

# 19. Engineering Principles

Single Responsibility, Dependency Injection (native to NestJS), DRY, KISS, RESTful, versioned API.

---

# 20. Out of Scope (current build)

Microservices, Kubernetes, distributed databases, multi-region, Terraform, autoscaling,
serverless, mobile apps, real GitHub OAuth/webhooks, Redis/Celery, Prometheus/Grafana,
WebSockets, RBAC beyond owner, team invites, audit logs, email, 2FA.

---

# 21. Success Criteria (current build)

* Deployed and reachable by URL within builds
* Every simulated subsystem is clearly labeled as such in the README
* Every scope cut is documented in `ADR.md`
* The full user journey (section 5) works end to end without manual DB intervention

---

# Next Document

`DATABASE_DESIGN.md` — schema is frozen as-is (already built); see that document for what's kept
vs. unused in current build.

