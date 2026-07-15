# 🗺️ ROADMAP.md — V1 MVP (10 Days)

> Superseded the original open-ended Phase 0–10 roadmap (Celery/Redis/Prometheus/Grafana/OAuth
> track). That version lives on conceptually in `PROJECT_BIBLE.md → Future Scope`. This is the
> plan actually being executed, day by day, assuming the existing Auth/Orgs/Projects NestJS
> scaffolding + Prisma schema as the starting point.

---

## Day 1 — Backend Foundation + Auth

- [ ] Fresh NestJS setup wired to existing Prisma schema
- [ ] Register / Login / JWT access + refresh token
- [ ] Auto-create "Personal" organization on registration
- [ ] `GET /auth/me`, auth guard, global exception filter, validation pipe

## Day 2 — Organizations, Projects, Repository

- [ ] Organization read/rename endpoints
- [ ] Project CRUD (with soft delete)
- [ ] Repository connect (owner/repo → GitHub REST API fetch) + manual sync endpoint

## Day 3 — Environments + Deployment Engine

- [ ] Environment CRUD per project
- [ ] `POST /deployments` triggers a deployment
- [ ] Deployment simulator: cron-driven state machine QUEUED → RUNNING → SUCCESS/FAILED with
      generated log lines written to `deployment_logs`

## Day 4 — Monitoring Simulators

- [ ] Metrics simulator: cron job inserts CPU/Memory/Latency/Error-rate rows per active
      environment on an interval
- [ ] Health check simulator: cron job pings environment domain if set, else simulates a result
- [ ] `GET /metrics`, `GET /health` endpoints

## Day 5 — Alerts + Notifications + Dashboard

- [ ] Alert rules: deployment failure, metric threshold breach, N failed health checks
- [ ] Notification creation on alert/deployment events
- [ ] `GET /dashboard` aggregation endpoint (counts, recent deployments, recent alerts)

## Day 6 — Backend Hardening

- [ ] Input validation everywhere (class-validator DTOs)
- [ ] Consistent error response shape
- [ ] Rate limiting on auth endpoints
- [ ] Seed script with demo org/project/environment/deployments for the demo
- [ ] Tests for: auth flow, project CRUD, deployment trigger → simulator completes

## Day 7 — Frontend Foundation

- [ ] Next.js app shell, layout, protected routes
- [ ] Login/Register pages, auth context, API client
- [ ] Dashboard shell wired to `GET /dashboard`

## Day 8 — Frontend Core Features

- [ ] Projects list/detail, create/edit/delete
- [ ] Environments UI, repository connect UI
- [ ] Deployment trigger button + deployment history + log viewer (polling every few seconds)

## Day 9 — Frontend Monitoring + Polish

- [ ] Metrics charts (recharts) per environment
- [ ] Alerts list + resolve action
- [ ] Notifications bell + dropdown
- [ ] UI pass: empty states, loading states, error states

## Day 10 — Ship

- [ ] Deploy backend (Railway/Render) + frontend (Vercel)
- [ ] Final README with setup instructions + screenshots
- [ ] Record a short demo walkthrough
- [ ] Final bug bash / buffer for anything that slipped

---

# Definition of Done for V1

- A new user can register, land in a personal org, create a project, connect a repo, add an
  environment, trigger a deployment, watch it complete, see simulated metrics/health, and receive
  an alert + notification if something fails — all deployed and reachable by URL.
