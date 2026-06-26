# 🏛️ ARCHITECTURE.md

> Version: 1.0

---

# Architecture Style

- Monolithic
- Modular
- Layered
- API First
- Domain Driven
- Event Aware

---

# High Level Architecture

```
                    Browser

                       │

              Next.js Frontend

                       │

                 HTTPS REST API

                       │

                  FastAPI Backend

     ┌──────────────┬──────────────┐
     │              │              │
 PostgreSQL      Redis        Celery Workers
     │              │              │
     └──────────────┴──────────────┘
                    │
             Prometheus
                    │
                Grafana
```

---

# Backend Layers

```
Client

↓

API

↓

Services

↓

Repositories

↓

Database
```

---

# Responsibilities

## API

- Validation
- Authentication
- Authorization
- Serialization

---

## Services

- Business Logic
- Workflows
- Transactions

---

## Repository

- CRUD
- Queries
- Persistence

---

## Database

- Storage
- Constraints
- Indexes

---

# Folder Structure

```
backend/

app/

api/

core/

config/

db/

models/

schemas/

repositories/

services/

workers/

middleware/

events/

websocket/

utils/

tests/
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

styles/
```

---

# External Services

- GitHub API
- SMTP
- Prometheus
- Grafana

---

# Internal Services

- Auth
- Organization
- Project
- Deployment
- Monitoring
- Notification
- Audit

---

# Data Flow

```
Frontend

↓

API

↓

Service

↓

Repository

↓

Database

↓

Response
```

---

# Event Flow

```
GitHub Webhook

↓

Redis Queue

↓

Celery

↓

Database

↓

Notification

↓

Frontend
```

---

# Logging Pipeline

```
Application

↓

Logger

↓

File

↓

Database

↓

Dashboard
```

---

# Monitoring Pipeline

```
Application

↓

Metrics Collector

↓

Prometheus

↓

Grafana
```

---

# Caching

Redis

Cache

- Dashboard
- Projects
- Metrics
- Sessions

---

# Principles

- Separation of Concerns
- SOLID
- DRY
- KISS
- Repository Pattern
- Dependency Injection
- REST
- Async where appropriate

---

# Status

Planning

Frontend
✅ Next.js
✅ React
✅ TypeScript
✅ Tailwind CSS
✅ shadcn/ui
✅ TanStack Query
✅ React Hook Form
✅ Zod
Backend
✅ NestJS
✅ TypeScript
✅ Prisma
✅ PostgreSQL
✅ Redis
✅ BullMQ
DevOps
✅ Docker
✅ Docker Compose
✅ GitHub Actions
✅ Prometheus
✅ Grafana
✅ Nginx
Authentication
✅ JWT
✅ GitHub OAuth
Real-Time
✅ WebSockets