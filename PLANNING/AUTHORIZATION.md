# 🛡️ AUTHORIZATION.md

Version: 1.0

---

# Model

RBAC

Role Based Access Control

---

# Roles

OWNER

ADMIN

DEVELOPER

VIEWER

---

# Permissions

Owner

- Full Access

Admin

- Manage Members
- Manage Projects
- Deploy
- View Metrics

Developer

- View Projects
- Deploy
- Logs
- Metrics

Viewer

- Read Only

---

# Resource Ownership

User

↓

Organization

↓

Project

↓

Environment

↓

Deployment

---

# Authorization Rules

User must belong to Organization.

Organization owns Projects.

Projects own Environments.

Deployments inherit Project permissions.

---

# Permission Checks

Authentication

↓

Organization Membership

↓

Role Validation

↓

Permission Check

↓

Execute Request

---

# APIs Protected

Everything except

Login

Register

Forgot Password

OAuth Callback

---

# Future

Custom Roles

Permission Matrix

Attribute Based Access Control

---

# Status

Planning