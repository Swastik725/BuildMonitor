# 📡 API_SPECIFICATION.md

Version 2.0 (V1 MVP)

---

# ⚠️ V1 Scope Notice

Endpoints below are grouped into **V1** (build these) and **Post-V1** (documented for
completeness, not built in the 10-day sprint).

---

# API Version

```
/api/v1
```

---

# V1 Endpoints

## Authentication
```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
```

## Organizations
```
GET   /organizations/me       (the auto-created personal org)
PATCH /organizations/{id}
```

## Projects
```
GET    /projects
GET    /projects/{id}
POST   /projects
PATCH  /projects/{id}
DELETE /projects/{id}
```

## Repository
```
POST   /repositories/connect     { owner, name }
GET    /repositories/{id}
POST   /repositories/{id}/sync   (manual pull of latest commit/branch via GitHub REST API)
DELETE /repositories/{id}
```

## Environments
```
GET    /environments?projectId=
POST   /environments
PATCH  /environments/{id}
DELETE /environments/{id}
```

## Deployments
```
POST /deployments                { environmentId, branch, commitSha?, commitMessage? }
GET  /deployments?environmentId=
GET  /deployments/{id}
```
(No manual PATCH/DELETE in V1 — status changes only through the simulator.)

## Deployment Logs
```
GET /deployments/{id}/logs
```

## Metrics
```
GET /environments/{id}/metrics?type=&from=&to=
```

## Health
```
GET /environments/{id}/health
```

## Alerts
```
GET   /alerts?resolved=
PATCH /alerts/{id}/resolve
```

## Notifications
```
GET   /notifications
PATCH /notifications/{id}/read
```

## Dashboard
```
GET /dashboard      (aggregated counts, recent deployments, recent alerts)
```

---

# Post-V1 Endpoints (documented, not built)

```
POST /auth/forgot-password
POST /auth/reset-password
GET  /github/oauth
GET  /github/callback
POST /github/webhook
GET  /organizations/{id}/members
POST /organizations/{id}/invite
PATCH /members/{id}
DELETE /members/{id}
GET  /audit
GET  /search
```

---

# Error Response

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": ""
  }
}
```

---

# Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

# Status

Building (V1)
