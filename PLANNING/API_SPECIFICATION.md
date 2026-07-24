# API_SPECIFICATION.md

Version 2.0

---

# Scope

The endpoints below are the current build surface.

---

# API Prefix

`/api`

---

# Current Build Endpoints

## Authentication

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
```

## Organizations

```text
GET   /organizations/me
PATCH /organizations/{id}
```

## Projects

```text
GET    /projects
GET    /projects/{id}
POST   /projects
PATCH  /projects/{id}
DELETE /projects/{id}
```

## Repository

```text
GET    /projects/{projectId}/repository
POST   /projects/{projectId}/repository/connect   { repository }
POST   /projects/{projectId}/repository/sync
DELETE /projects/{projectId}/repository
```

## Environments

```text
GET    /environments?projectId=
POST   /environments
PATCH  /environments/{id}
DELETE /environments/{id}
```

## Deployments

```text
POST /deployments                { environmentId, branch, commitSha?, commitMessage? }
GET  /deployments?environmentId=
GET  /deployments/{id}
```

## Deployment Logs

```text
GET /deployments/{id}/logs
```

## Metrics

```text
GET /environments/{id}/metrics?type=&from=&to=
```

The metrics endpoint is backed by persisted metric rows attached to deployments and is used by the
project page charts.

## Health

```text
GET /environments/{id}/health
```

## Alerts

```text
GET   /alerts?resolved=
PATCH /alerts/{id}/resolve
```

## Notifications

```text
GET   /notifications
PATCH /notifications/{id}/read
```

## Dashboard

```text
GET /dashboard
```

---

# Next Phase Endpoints

```text
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

# Status

Implemented for the current build.
