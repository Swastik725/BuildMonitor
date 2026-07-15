# 🏛️ ARCHITECTURE.md

> Version: 2.0 (V1 MVP)

---

# ⚠️ V1 Scope Notice

Redis, BullMQ, Prometheus, Grafana, Nginx, and WebSockets are removed from the V1 architecture.
They remain the intended V2+ direction (see `PROJECT_BIBLE.md → Future Scope`) but are not part
of what ships in 10 days.

---

# Architecture Style (V1)

- Monolithic
- Modular (NestJS modules)
- Layered
- API First

---

# High Level Architecture (V1)

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

# Folder Structure (V1)

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

# External Services (V1)

- GitHub REST API (read-only, manual sync)

_Removed for V1: SMTP, Prometheus, Grafana._

---

# Internal Services (V1)

- Auth
- Organizations
- Projects
- Repositories
- Environments
- Deployments (simulator)
- Monitoring (simulator)
- Alerts
- Notifications

_Removed for V1: dedicated Audit service (table exists, unused)._

---

# Data Flow

```
Frontend → API → Service → Prisma → Database → Response
```

---

# "Event Flow" (V1 substitute)

No Redis queue / Celery. Instead:

```
Cron Tick (@nestjs/schedule) → Service Logic → Database Write → Alert Evaluation → Notification Row
                                                                                        │
                                                                          Frontend polls and picks it up
```

---

# Caching (V1)

None. TanStack Query provides client-side caching/dedup, which is sufficient at MVP scale. Redis
is deferred (see `CACHING.md`).

---

# Principles

Separation of Concerns, SOLID, DRY, KISS, REST, async where it matters.

---

# Status — V1 Stack (Actual)

Frontend
✅ Next.js · ✅ React · ✅ TypeScript · ✅ Tailwind CSS · ✅ shadcn/ui · ✅ TanStack Query
✅ React Hook Form · ✅ Zod · ✅ recharts

Backend
✅ NestJS · ✅ TypeScript · ✅ Prisma · ✅ PostgreSQL · ✅ `@nestjs/schedule`

DevOps
✅ GitHub Actions (lint/test/build) · ✅ Vercel (frontend) · ✅ Railway/Render (backend)
❌ Docker Compose full stack (nice-to-have Day 10) · ❌ Prometheus/Grafana/Nginx (post-V1)

Authentication
✅ JWT (access + refresh)
❌ GitHub OAuth (post-V1)

Real-Time
❌ WebSockets (post-V1) — polling via TanStack Query in V1
