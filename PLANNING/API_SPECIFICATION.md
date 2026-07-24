# 📡 API_SPECIFICATION.md

Version 2.0 (current build)

---

# ⚠️ current build Scope Notice

Endpoints below are grouped into **current build** (build these) and **next phase** (documented for
completeness, not built in the build sprint).

---

# API Version

```
/api/current build
```

---

# current build Endpoints

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
GET    /projects/{projectId}/repository
POST   /projects/{projectId}/repository/connect   { repository }
POST   /projects/{projectId}/repository/sync
DELETE /projects/{projectId}/repository
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
(No manual PATCH/DELETE in current build — status changes only through the simulator.)

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

# next phase Endpoints (documented, not built)

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

Building (current build)

