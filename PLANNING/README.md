# BuildMonitor

BuildMonitor is a developer operations dashboard for organizations, projects, deployments,
incidents, and application health.

This planning folder describes the product as a complete system rather than a versioned sprint.
Use it as the source of truth for the intended product shape, the implemented backend/frontend
surface, and the remaining work that still belongs in the product.

## Start here

- `PROJECT_BIBLE.md` — product vision, scope, and architecture
- `SYSTEM_DESIGN.md` — module boundaries and flow
- `DOMAIN_MODEL.md` — entities and relationships
- `DATABASE_DESIGN.md` — Prisma schema and persistence model
- `API_SPECIFICATION.md` — route-level contract
- `ROADMAP.md` — implementation phases
- `BuildMonitor_STATUS.md` — current implementation status

## Current framing

- The product is BuildMonitor, not a generic dashboard bundle.
- The codebase uses React + Vite on the frontend and NestJS + Prisma on the backend.
- Deployment, health, and monitoring behavior should be described honestly in the docs:
  simulated where appropriate, real where already implemented, and clearly called out when a
  feature is still missing.

