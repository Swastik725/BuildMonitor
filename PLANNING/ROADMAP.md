# BuildMonitor — Roadmap

This roadmap is organized by implementation phases rather than by a sprint label.

## Phase 1 — Foundation

- [x] NestJS backend wired to Prisma and PostgreSQL
- [x] React + Vite frontend shell
- [x] JWT auth and OAuth login
- [x] Organization and project data model
- [x] Shared API client and auth context

## Phase 2 — Core workspace flow

- [x] Organizations and members
- [x] Projects and production environments
- [x] Deployment trigger, list, detail, retry, and cancel
- [x] Deployment logs
- [x] User settings
- [x] Health summary

## Phase 3 — Product completeness

- [x] Repository connection and manual GitHub sync
- [ ] Metrics collection and visualization
- [ ] Alert generation and resolution
- [ ] In-app notifications
- [ ] Repository-aware dashboard metrics

## Phase 4 — Polish and ship

- [ ] Final documentation pass
- [ ] Production deployment configuration
- [ ] End-to-end smoke testing
- [ ] Remove stale or dead test data
- [ ] Final UI consistency pass

## Definition of done

The product is complete when a user can:

- register or sign in
- create or join a workspace
- create projects
- connect and sync repositories
- trigger deployments and inspect logs
- see health and monitoring data
- act on alerts and notifications

