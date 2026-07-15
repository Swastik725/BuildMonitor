# 🚀 BuildMonitor

A developer platform for tracking projects, deployments, application health, metrics, and alerts
from a single dashboard.

**Status:** V1 MVP — 10 day build. See `PROJECT_BIBLE.md` for full scope and `ROADMAP.md` for the
day-by-day plan.

## V1 Features

- Authentication (email/password + JWT)
- Organizations (auto-created personal workspace)
- Projects
- Repository connection (GitHub, read-only, manual sync)
- Environments
- Deployments (simulated pipeline with live-ish status + logs)
- Monitoring (simulated metrics + health checks)
- Alerts (auto-generated from failures/thresholds)
- In-app notifications

> Note: the deployment pipeline and infrastructure metrics are **simulated** in V1 — there is no
> real build/deploy execution or real server being monitored. This is called out on purpose: it's
> the right tradeoff for a 10-day solo build, and the roadmap in `PROJECT_BIBLE.md` explains what
> "real" would look like next.

## Tech Stack

### Frontend
- Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- TanStack Query (polling for live-ish updates)
- React Hook Form + Zod

### Backend
- NestJS, TypeScript
- Prisma + PostgreSQL
- `@nestjs/schedule` for the deployment/metrics/health simulators

### DevOps
- GitHub Actions (lint + test + build)
- Backend on Railway/Render, frontend on Vercel

## Documentation

See `/PLANNING` — start with `PROJECT_BIBLE.md`, then `ROADMAP.md`, `SYSTEM_DESIGN.md`,
`DOMAIN_MODEL.md`, and `DATABASE_DESIGN.md`.

## Status

🚧 In active development — 10 day MVP sprint
