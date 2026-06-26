# 📡 API_SPECIFICATION.md

Version 1.0

---

# API Version

```
/api/v1
```

---

# Authentication

```
POST /auth/register

POST /auth/login

POST /auth/logout

POST /auth/refresh

POST /auth/forgot-password

POST /auth/reset-password

GET /auth/me
```

---

# Organizations

```
GET /organizations

POST /organizations

PATCH /organizations/{id}

DELETE /organizations/{id}
```

---

# Members

```
GET /organizations/{id}/members

POST /organizations/{id}/invite

PATCH /members/{id}

DELETE /members/{id}
```

---

# Projects

```
GET /projects

GET /projects/{id}

POST /projects

PATCH /projects/{id}

DELETE /projects/{id}
```

---

# Repository

```
POST /repositories/connect

GET /repositories

GET /repositories/{id}

PATCH /repositories/{id}

DELETE /repositories/{id}
```

---

# GitHub

```
GET /github/oauth

GET /github/callback

POST /github/webhook

POST /github/sync
```

---

# Environments

```
GET /environments

POST /environments

PATCH /environments/{id}

DELETE /environments/{id}
```

---

# Deployments

```
POST /deployments

GET /deployments

GET /deployments/{id}

PATCH /deployments/{id}

DELETE /deployments/{id}
```

---

# Deployment Logs

```
GET /deployments/{id}/logs

GET /logs
```

---

# Metrics

```
GET /metrics

GET /metrics/{id}
```

---

# Health Checks

```
GET /health

GET /health/{environment}
```

---

# Alerts

```
GET /alerts

POST /alerts

PATCH /alerts/{id}

DELETE /alerts/{id}
```

---

# Notifications

```
GET /notifications

PATCH /notifications/{id}/read

DELETE /notifications/{id}
```

---

# Audit Logs

```
GET /audit
```

---

# Search

```
GET /search
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

Planning