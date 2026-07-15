# 🛡️ AUTHORIZATION.md

Version: 2.0 (V1 MVP)

---

# ⚠️ V1 Scope Notice

Full RBAC (Owner/Admin/Developer/Viewer with distinct permission sets) is **post-V1**. In V1
every user has exactly one personal organization and is its only member with role `OWNER`. The
only check that matters in V1 is: *does this resource belong to an organization/project the
requesting user owns?*

---

# Model (V1)

Ownership check only — not full RBAC yet. The `role` column exists on `organization_members` and
is always `OWNER` in V1.

---

# Resource Ownership

```
User → Organization (1:1 in V1) → Project → Environment → Deployment
```

---

# Authorization Rule (V1)

A request may only read/write a resource if the requesting user's organization owns the parent
project (directly or transitively). No other role logic runs in V1.

---

# Permission Checks (V1)

```
Authentication → Organization Ownership Check → Execute Request
```

---

# APIs Protected (V1)

Everything except `/auth/register`, `/auth/login`, `/auth/refresh`.

---

# Post-V1

- Full RBAC (Owner/Admin/Developer/Viewer) once org invites ship
- Custom roles, permission matrix, attribute-based access control

---

# Status

Building (V1)
