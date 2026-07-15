# 📖 BuildMonitor — Project Bible

> **Version:** 2.0 (V1 MVP — 10 Day Build Plan)
>
> **Status:** Building
>
> **Author:** Swastik Goswami
>
> **Project Type:** Full Stack Developer Platform

---

# ⚠️ V1 Scope Notice

The original plan (v1.0 of this document) was written as a long-term, resume-flagship system
(Celery, Redis, Prometheus, Grafana, real GitHub OAuth + webhooks, RBAC, audit logs, WebSockets).
That version is preserved conceptually in `Future Scope` below — it is **not** what gets built in
the next 10 days.

This revision defines a **shippable MVP** that:
* Reuses the existing Prisma schema as-is (it already models the full domain correctly).
* Rebuilds the service layer from scratch on **NestJS + Prisma + PostgreSQL** (matches what's
  actually already scaffolded in the backend repo — not FastAPI/SQLAlchemy as originally written).
* Replaces every heavy infra piece (Redis, Celery, Prometheus, Grafana, Nginx, WebSockets, real
  webhooks) with a simple, working substitute that demonstrates the same engineering concept
  without the setup cost.
* Simulates the parts a solo dev can't realistically build in 10 days (actual CI/CD deploy
  pipelines, real server metrics) with a deterministic, clearly-labeled simulator. This is a
  legitimate and common pattern for internal tools/demos — call it out plainly in the README so
  it reads as an intentional design choice, not a shortcut you're hiding.

---

# Table of Contents

* Vision
* Objectives
* Target Audience
* Problem Statement
* Solution
* Core Features (V1 MVP)
* Explicitly Out of Scope for V1
* Tech Stack (V1)
* High-Level Architecture (V1)
* 10-Day Roadmap
* Engineering Goals
* Future Scope (Post-V1)
* Decisions Log
* Final Goal

---

# Vision

BuildMonitor is a developer platform that helps developers manage projects, track deployments,
monitor application health, and get alerted when something breaks — from one dashboard.

Not a clone of Vercel/Datadog. A demonstration, at MVP scale, of the engineering principles
behind them: layered backend architecture, auth, background processing, monitoring, and clean
API design.

---

# Objectives

## Primary Goal (10 Days)

Ship a working, deployed, demoable full-stack product.

## Secondary Goals

* Learn clean layered backend architecture (NestJS modules/services/repos via Prisma)
* Learn JWT auth done properly
* Learn how to design and simulate a monitoring/alerting pipeline
* Learn to scope ruthlessly under a deadline — this is itself an engineering skill

---

# Target Audience

Primary: developers, students, engineers building a portfolio piece.
Future: small teams (post-V1, once org/RBAC is fleshed out).

---

# Problem Statement

Developers juggle separate tools for deployments, monitoring, logs, and alerts. BuildMonitor
centralizes the essentials into one dashboard.

---

# Solution

A single platform where a user can register, create a project, connect a repo, trigger/track
deployments, watch simulated live metrics and health, and get alerted when things fail.

---

# Core Features (V1 MVP)

## Authentication
* Register (email + password)
* Login / Logout
* JWT access token + refresh token
* `GET /auth/me`

_Cut for V1: GitHub OAuth login, email verification, forgot-password flow. See Future Scope._

## Organizations
* A "Personal" organization is auto-created on registration
* Rename organization
* (No invites / multi-member workflow in V1 — schema supports it, UI doesn't expose it yet)

## Projects
* Create / Read / Update / Delete (soft delete)

## Repository Connection
* Connect a GitHub repo by owner/name (public repos, read-only via GitHub REST API)
* Manual "Sync" button pulls latest commit/branch info on demand

_Cut for V1: GitHub OAuth app, webhooks, auto-sync. See Future Scope._

## Environments
* Create environments per project (development / staging / production)

## Deployments
* Trigger a deployment for an environment
* Simulated pipeline: QUEUED → RUNNING → SUCCESS/FAILED, with realistic timed progress and
  generated log lines (no real build/deploy happens — this is a monitoring platform, not a CI
  system)
* Deployment history + log viewer (polling, not WebSockets)

## Monitoring
* Simulated CPU / Memory / Latency / Error Rate metrics generated on an interval per environment
* Simulated health checks (or real HTTP ping if the environment has a domain set)
* Dashboard charts (recharts)

## Alerts
* Auto-created when a deployment fails, a metric crosses a threshold, or a health check fails
* Mark alert as resolved

## Notifications
* In-app only (bell icon), generated alongside alerts and deployment completions

_Cut for V1: Email notifications. See Future Scope._

---

# Explicitly Out of Scope for V1

* GitHub OAuth + real webhooks
* Redis, Celery/BullMQ, Prometheus, Grafana, Nginx
* WebSockets / real-time push (polling instead)
* RBAC beyond "owner of your own org" (Admin/Developer/Viewer roles stay in the schema, unused)
* Team invites, multi-member orgs
* Audit logs (table exists, not written to in V1)
* API keys, Slack/Discord integrations, 2FA, dark mode
* Kubernetes, Terraform, multi-region, microservices

All of the above remain valid **future** work — they are not being deleted from the vision, just
sequenced after a working V1 ships.

---

# Tech Stack (V1)

## Frontend
Next.js, React, TypeScript, Tailwind CSS, TanStack Query (polling), React Hook Form, Zod,
shadcn/ui, recharts

## Backend
NestJS, TypeScript, Prisma, class-validator, Passport (JWT strategy), `@nestjs/schedule`
(replaces Celery/Redis for the simulator jobs)

## Database
PostgreSQL (schema unchanged — see DATABASE_DESIGN.md)

## Deployment
Backend → Railway/Render (free tier). Frontend → Vercel. No Docker Compose stack required for
V1 (a single Dockerfile for the backend is a nice-to-have on Day 10 if time remains).

---

# High-Level Architecture (V1)

```
Browser
   │
Next.js Frontend (polling via TanStack Query)
   │
HTTPS REST API (/api/v1)
   │
NestJS Backend
   │
PostgreSQL  ←── @nestjs/schedule cron jobs (deployment simulator, metrics simulator, health checks, alert evaluation)
```

---

# 10-Day Roadmap

See ROADMAP.md for the day-by-day breakdown. Summary:

| Days | Focus |
|---|---|
| 1–2 | Backend: auth, orgs (auto-personal), projects, repository connect |
| 3–4 | Backend: environments, deployment simulator, metrics + health simulators |
| 5 | Backend: alerts engine, notifications, dashboard aggregation endpoint |
| 6 | Backend polish: validation, error handling, seed script, critical-path tests |
| 7 | Frontend: auth pages, layout, protected routes, API client |
| 8 | Frontend: projects/environments/repo pages, deploy trigger + log viewer |
| 9 | Frontend: monitoring dashboard, alerts, notifications, UI polish |
| 10 | Deploy, README, demo script/video, final bug bash, buffer |

---

# Engineering Goals

By the end of V1 you should be able to explain, in an interview:
* Why the domain is modeled Org → Project → Environment → Deployment
* How JWT auth + refresh works end to end
* How the deployment/metrics simulator is structured and why it's a legitimate stand-in for real
  infra given the timeline
* What you would build next (the Future Scope section) and why, in priority order

---

# Future Scope (Post-V1)

In priority order for a "V2":
1. GitHub OAuth (login + repo import) + real webhooks
2. Real background job queue (BullMQ + Redis) once there's an actual async workload
3. Org invites + full RBAC enforcement
4. WebSockets for live deployment logs and metric updates
5. Email notifications (forgot password, deployment alerts)
6. Prometheus/Grafana if/when real infrastructure exists to monitor
7. Audit logs, API keys, Slack/Discord integrations
8. Docker Compose full stack, then Kubernetes if it's ever justified

---

# Decisions Log

See ADR.md — new entries ADR-011 through ADR-015 document every scope cut made for V1 and why.

---

# Notes

Use this section for quick notes during the 10-day build.

---

# Final Goal

Ship a working, deployed, demoable product in 10 days that honestly represents what it is: a
well-architected MVP with clearly labeled simulated subsystems, and a clear, credible roadmap for
what a "real" version would add next.
