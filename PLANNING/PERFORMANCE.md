# ⚡ PERFORMANCE.md

Version: 2.0 (V1 MVP)

---

# ⚠️ V1 Scope Notice

Redis caching and horizontal-scaling concerns are post-V1 (no real load yet). V1 focuses on the
basics that are cheap to get right from day one.

---

# Goals (V1)

- Reasonably fast API responses
- Efficient queries (the schema already has the right indexes — see `DATABASE_DESIGN.md`)
- Responsive UI

---

# Backend (V1)

- Avoid N+1 queries (use Prisma's `include`/`select` deliberately)
- Pagination on list endpoints (deployments, logs, metrics, notifications)
- Connection pooling (Prisma default)

---

# Frontend (V1)

- TanStack Query caching/dedup (also serves as the "no Redis needed yet" caching layer)
- Route-level code splitting (Next.js default)
- Image optimization (Next.js default)

---

# Post-V1

Redis cache, CDN, horizontal scaling, load balancing — once there's real multi-user load to
justify them.

---

# Status

Building (V1)
