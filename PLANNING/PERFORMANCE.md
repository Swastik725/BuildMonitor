# ⚡ PERFORMANCE.md

Version: 2.0 (current build)

---

# ⚠️ current build Scope Notice

Redis caching and horizontal-scaling concerns are next phase (no real load yet). current build focuses on the
basics that are cheap to get right from day one.

---

# Goals (current build)

- Reasonably fast API responses
- Efficient queries (the schema already has the right indexes — see `DATABASE_DESIGN.md`)
- Responsive UI

---

# Backend (current build)

- Avoid N+1 queries (use Prisma's `include`/`select` deliberately)
- Pagination on list endpoints (deployments, logs, metrics, notifications)
- Connection pooling (Prisma default)

---

# Frontend (current build)

- TanStack Query caching/dedup (also serves as the "no Redis needed yet" caching layer)
- Route-level code splitting (Next.js default)
- Image optimization (Next.js default)

---

# next phase

Redis cache, CDN, horizontal scaling, load balancing — once there's real multi-user load to
justify them.

---

# Status

Building (current build)

