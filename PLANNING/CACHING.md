# 🚀 CACHING.md

Version: 2.0 (current build)

---

# ⚠️ current build Scope Notice

**No server-side cache in current build.** At MVP scale (one user's data, small tables, no real load) a
cache adds operational complexity (Redis, invalidation logic) with no measurable benefit. Client-
side caching via TanStack Query is sufficient.

---

# current build Approach

- TanStack Query caches and dedupes GET requests on the frontend, with short `staleTime` for
  polled resources (deployments, metrics, notifications)
- No Redis, no server-side cache-aside layer

---

# next phase

Reintroduce Redis (cache-aside) once there's real multi-user load and measured slow endpoints
worth caching — dashboard aggregation and metrics queries are the likely first candidates. TTLs
and invalidation strategy from the original plan (dashboard 60s, projects 5min, metrics 30s,
sessions 30 days) remain a reasonable starting point when that day comes.

---

# Status

Deferred (next phase)

