# 🏛️ ARCHITECTURE.md

> Version: 2.0 (current build)

---

# ⚠️ current build Scope Notice

Redis, BullMQ, Prometheus, Grafana, Nginx, and WebSockets are removed from the current build architecture.
They remain the intended V2+ direction (see `PROJECT_BIBLE.md → Future Scope`) but are not part
of what ships in builds.

---

# Architecture Style (current build)

- Monolithic
- Modular (NestJS modules)
- Layered
- API First

---

# High Level Architecture (current build)

```
                    Browser

                       │

              Next.js Frontend

                       │

                 HTTPS REST API

                       │

                  NestJS Backend

                       │

                  PostgreSQL (Prisma)

                       │
        @nestjs/schedule (simulators + alert evaluation)
```

---

# Backend Layers

```
Client → Controller → Service → Prisma → Database
```

---

# Responsibilities

## Controller
- Validation (DTOs)
- Auth guard
- Response shaping

## Service
- Business logic
- Simulator orchestration (deployment/metrics/health)
- Alert evaluation

## Prisma
- CRUD, queries, persistence (schema unchanged)

---

# Folder Structure (current build)

```
backend/
  src/
    auth/
    organizations/
    projects/
    repositories/
    environments/
    deployments/
    monitoring/       (metrics + health)
    alerts/
    notifications/
    dashboard/
    prisma/
    common/           (guards, filters, pipes)
  test/
```

---

# Frontend Structure

```
frontend/
  app/
  components/
  hooks/
  lib/
  services/
  types/
  providers/
```

---

# External Services (current build)

- GitHub REST API (read-only, manual sync)

_Removed for current build: SMTP, Prometheus, Grafana._

---

# Internal Services (current build)

- Auth
- Organizations
- Projects
- Repositories
- Environments
- Deployments (simulator)
- Monitoring (simulator)
- Alerts
- Notifications

_Removed for current build: dedicated Audit service (table exists, unused)._

---

# Data Flow

```
Frontend → API → Service → Prisma → Database → Response
```

---

# "Event Flow" (current build substitute)

No Redis queue / Celery. Instead:

```
Cron Tick (@nestjs/schedule) → Service Logic → Database Write → Alert Evaluation → Notification Row
                                                                                        │
                                                                          Frontend polls and picks it up
```

---

# Caching (current build)

None. TanStack Query provides client-side caching/dedup, which is sufficient at MVP scale. Redis
is deferred (see `CACHING.md`).

---

# Principles

Separation of Concerns, SOLID, DRY, KISS, REST, async where it matters.

---

# Status — current build Stack (Actual)

Frontend
✅ Next.js · ✅ React · ✅ TypeScript · ✅ Tailwind CSS · ✅ shadcn/ui · ✅ TanStack Query
✅ React Hook Form · ✅ Zod · ✅ recharts

Backend
✅ NestJS · ✅ TypeScript · ✅ Prisma · ✅ PostgreSQL · ✅ `@nestjs/schedule`

DevOps
✅ GitHub Actions (lint/test/build) · ✅ Vercel (frontend) · ✅ Railway/Render (backend)
❌ Docker Compose full stack (nice-to-have Day 10) · ❌ Prometheus/Grafana/Nginx (next phase)

Authentication
✅ JWT (access + refresh)
❌ GitHub OAuth (next phase)

Real-Time
❌ WebSockets (next phase) — polling via TanStack Query in current build

