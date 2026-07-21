# BuildMonitor — Project Status

_Last updated: July 19, 2026_

A developer platform demonstrating the engineering concepts behind tools like Vercel and Datadog — project management, deployment tracking, and application health monitoring in one dashboard. Built as a 10-day MVP, with real deployment (not just local) as an explicit success criterion.

**Stack:** NestJS + Prisma 7 + PostgreSQL (Neon) on the backend, React + Vite + Tailwind + shadcn/ui on the frontend. Redis, BullMQ, Prometheus, Grafana, Nginx, WebSockets, and real GitHub OAuth/webhooks were deliberately cut per ADR-011 through ADR-015 — deployments, metrics, and health checks are **simulated** using NestJS's built-in scheduler, not real infrastructure.

---

## ✅ Completed

### Backend
- [x] NestJS + Prisma + Neon Postgres scaffolded and connected
- [x] `User`, `AuthProvider`, `RefreshToken` schema — supports email/password + linked OAuth accounts on one user
- [x] Full auth system:
  - [x] Register / login (bcrypt password hashing)
  - [x] JWT access + refresh tokens, with refresh rotation and revocation
  - [x] `JwtStrategy` + `JwtAuthGuard` protecting routes
  - [x] Google OAuth (passport-google-oauth20)
  - [x] GitHub OAuth (passport-github2)
  - [x] Account linking — same email across providers merges into one user
- [x] Projects CRUD (`organizationId`, `name`, `slug`, `visibility`, `defaultBranch`)
  - [x] Creating a project auto-creates a default `production` Environment (transactional)
- [x] Organizations CRUD
  - [x] `GET /organizations/:id/members` endpoint
- [x] Deployments module
  - [x] `Environment` → `Deployment` relation (`Deployment` belongs to an `Environment`, not directly to a `Project`)
  - [x] `POST /projects/:projectId/deployments` — trigger, auto-generates fake commit SHA
  - [x] `GET /projects/:projectId/deployments` — list per project
  - [x] `GET /deployments/:id` — single deployment detail
  - [x] `GET /deployments` — recent across all projects (for dashboard)
  - [x] Simulated lifecycle via `@nestjs/schedule` `@Interval`: `QUEUED` → `RUNNING` (~2s) → `SUCCESS`/`FAILED` (~8-10s, 90% success rate)
- [x] Incidents module (minimal)
  - [x] `Incident` model + `IncidentStatus` enum (`OPEN`, `INVESTIGATING`, `RESOLVED`)
  - [x] Create, list-open (dashboard), list-by-project, resolve

### Frontend
- [x] Figma Make design exported, then split from one 1098-line file into a proper structure (`lib/`, `components/`, `pages/`)
- [x] Auth wired end-to-end: real register/login, JWT storage, silent refresh-on-401, OAuth redirect handling, persistent sessions across page reloads
- [x] Dashboard — real project list, real recent deployments, real open incidents, working "New project" modal
- [x] Project detail page — real deployment history, working "Deploy now"
- [x] Deployment detail page — real status/timing, polls live while in progress, working "Redeploy"
- [x] Organization page — real org, real members list, real projects filtered by org
- [x] All mock data (`mockData.ts`) fully disconnected from every page — confirmed via grep, zero references remain outside the file itself

---

## ⏳ Remaining for v1 MVP

- [x] **Settings page** — currently still fully mock; needs:
  - [x] `GET/PATCH /users/me` backend endpoint (profile view/edit)
  - [x] OAuth connection status endpoint (which providers are linked) + disconnect action
  - [x] Wire "Save changes", "Connect"/"Disconnect" buttons to real endpoints
- [ ] **Deployment logs** — `DeploymentLog` model exists in schema but has no service/controller; Deployment detail page currently shows an honest "not implemented yet" notice instead of fake logs
- [ ] **Uptime / health check monitoring** — `HealthCheck` model exists in schema, tied to `Environment`, but no simulated polling job or endpoints built yet (this is the other big "simulated infra" piece alongside Deployments)
- [ ] **Invite member flow** — Organization page's "Invite" button is disabled with a tooltip; needs a `POST /organizations/:id/members` endpoint + invite UI
- [ ] **Fix**: stale/duplicate old test project(s) created before auto-environment logic existed have no `Environment` row — either delete them or leave as known dead test data
- [ ] **Deployment** (the actual infra kind, not the app feature):
  - [ ] Backend → Railway or Render (Postgres already on Neon)
  - [ ] Frontend → Vercel
  - [ ] CORS origin updated from `localhost:5173` to the real deployed frontend URL
  - [ ] Environment variables (JWT secrets, DB URL, OAuth client IDs/secrets, callback URLs) set on the hosting platform, not just `.env`
  - [ ] OAuth redirect URIs updated in Google Cloud Console / GitHub OAuth App settings to the real deployed backend URL

## 🔭 Later / Post-MVP (explicitly deferred)

- [ ] **The original bigger idea**: let users run their project through the site, with an integrated AI model auto-resolving errors. Deliberately deferred until the observability foundation (deployments, health checks, incidents) is solid — this is the natural next differentiator once v1 ships.
- [ ] CI/CD pipeline tracking via real webhook ingestion (currently deployments are manually triggered/simulated, not driven by real GitHub Actions/GitLab CI events)
- [ ] RBAC beyond single-owner orgs (currently `OrganizationRole` enum exists but isn't enforced anywhere)
- [ ] Email notifications
- [ ] Audit logging

---

## Resources to understand the architecture

**NestJS fundamentals** (if any part of the backend patterns feel unfamiliar):
- [NestJS official docs — Modules, Providers, Controllers](https://docs.nestjs.com/modules) — the DI pattern used throughout every module you've built
- [NestJS Authentication guide](https://docs.nestjs.com/security/authentication) — the exact JWT + Passport pattern used in your `AuthModule`
- [NestJS Task Scheduling (`@nestjs/schedule`)](https://docs.nestjs.com/techniques/task-scheduling) — powers the simulated deployment lifecycle; same approach you'll use for health check polling

**Prisma:**
- [Prisma Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations) — clarifies the `Project → Environment → Deployment` chain
- [Prisma Transactions (`$transaction`)](https://www.prisma.io/docs/orm/prisma-client/queries/transactions) — used in `ProjectsService.create()` to atomically create a project + its environment

**Auth concepts:**
- [JWT.io — Introduction](https://jwt.io/introduction) — what's actually inside an access/refresh token
- [OAuth 2.0 Simplified](https://www.oauth.com/) — the redirect/callback dance your Google/GitHub strategies perform

**Frontend:**
- [React Context docs](https://react.dev/reference/react/createContext) — the pattern behind your `AuthContext`
- [Vite Env Variables](https://vite.dev/guide/env-and-mode) — how `VITE_API_URL` and `.env` actually get loaded

**Deployment (for the infra step ahead):**
- [Railway docs](https://docs.railway.com/) or [Render docs](https://render.com/docs) — whichever you pick for the NestJS backend
- [Vercel docs — deploying a Vite app](https://vercel.com/docs/frameworks/vite) — frontend deployment
- [Neon docs — connection pooling](https://neon.tech/docs/connect/connection-pooling) — relevant since you're already on Neon, worth understanding before production traffic hits it
