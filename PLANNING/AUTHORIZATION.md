# 🛡️ AUTHORIZATION.md

Version: 2.0 (current build)

---

# ⚠️ current build Scope Notice

Full RBAC (Owner/Admin/Developer/Viewer with distinct permission sets) is **next phase**. In current build
every user has exactly one personal organization and is its only member with role `OWNER`. The
only check that matters in current build is: *does this resource belong to an organization/project the
requesting user owns?*

---

# Model (current build)

Ownership check only — not full RBAC yet. The `role` column exists on `organization_members` and
is always `OWNER` in current build.

---

# Resource Ownership

```
User → Organization (1:1 in current build) → Project → Environment → Deployment
```

---

# Authorization Rule (current build)

A request may only read/write a resource if the requesting user's organization owns the parent
project (directly or transitively). No other role logic runs in current build.

---

# Permission Checks (current build)

```
Authentication → Organization Ownership Check → Execute Request
```

---

# APIs Protected (current build)

Everything except `/auth/register`, `/auth/login`, `/auth/refresh`.

---

# next phase

- Full RBAC (Owner/Admin/Developer/Viewer) once org invites ship
- Custom roles, permission matrix, attribute-based access control

---

# Status

Building (current build)

