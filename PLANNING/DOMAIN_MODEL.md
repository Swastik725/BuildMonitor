# 🧠 DOMAIN_MODEL.md

> Version: 2.0 (current build)
>
> Status: Building

---

# ⚠️ current build Scope Notice

The domain model and schema below are **unchanged** — the Prisma schema already models this
correctly and is being kept as-is. What changes for current build is which parts of this model are actually
*exercised* by the API/UI in the next builds:

* **Organization / Member** — every user gets exactly one auto-created "Personal" organization on
  registration, and is its only member (role `OWNER`). Multi-member orgs, invites, and role
  enforcement beyond "do you belong to this org" are schema-ready but not built in current build.
* **Audit Log** — the table exists but nothing writes to it in current build.
* Everything else (Project → Repository → Environment → Deployment → Logs/Metrics/Health → Alert
  → Notification) is fully in scope for current build.

---

# Purpose

Before designing the database, APIs, or frontend, we first model the business domain.

A domain model describes the real-world concepts (entities) that exist in the system and how they relate to one another.

This document intentionally avoids implementation details such as SQL tables or API endpoints.

Its purpose is to answer one question:

> **What are we actually building?**

---

# Domain Hierarchy

```
User
│
└── Organization
      │
      ├── Members
      │
      ├── Projects
      │      │
      │      ├── Repository
      │      │
      │      ├── Environments
      │      │       │
      │      │       ├── Deployments
      │      │       │      │
      │      │       │      ├── Deployment Logs
      │      │       │      ├── Metrics
      │      │       │      └── Health Checks
      │      │
      │      └── Alerts
      │
      ├── Notifications
      │
      └── Audit Logs
```

---

# Core Domain Concepts

---

## User

Represents a human using BuildMonitor.

Responsibilities

* Login
* Authentication
* Own Organizations
* Join Organizations
* Trigger Deployments
* View Dashboards

Important Notes

A user should never directly own projects.

Projects belong to organizations.

This allows collaboration later without changing the architecture.

---

## Organization

Represents a company, team, or personal workspace.

Examples

```
Swastik Personal

College Project

Startup XYZ
```

Responsibilities

* Own projects
* Manage members
* Manage permissions
* Store organization settings

---

## Member

Represents a User inside an Organization.

Why not just store users?

Because permissions belong to membership, not the user.

Example

```
Swastik

Owner in Organization A

Developer in Organization B

Viewer in Organization C
```

Each membership stores

* Role
* Joined Date
* Invite Status

---

## Project

Represents one software application.

Examples

```
PolyLingo

BuildMonitor

Portfolio

Inventory API
```

Every project belongs to exactly one organization.

A project contains environments.

---

## Repository

Represents a connected GitHub repository.

Stores

* Repository ID
* Repository Name
* Default Branch
* Visibility
* GitHub Owner
* Webhook Information

Each project has one repository.

---

## Environment

Represents an isolated deployment target.

Examples

```
Development

Testing

Preview

Production
```

Each project contains multiple environments.

---

## Deployment

Represents one deployment event.

A deployment records

* Commit
* Branch
* Trigger Source
* Status
* Started Time
* Finished Time
* Duration

Status Examples

```
Queued

Running

Success

Failed

Cancelled
```

---

## Deployment Log

Represents one log line generated during deployment.

Example

```
Installing dependencies...

Running Tests...

Building...

Deployment Complete
```

Logs belong to deployments.

---

## Metric

Represents a measured system value.

Examples

```
CPU

Memory

Latency

Disk

Network

Requests

Errors
```

Metrics are time-series data.

---

## Health Check

Represents a periodic availability check.

Stores

* Timestamp
* Status
* Response Time
* HTTP Status Code

---

## Alert

Represents an abnormal event.

Examples

```
CPU above threshold

Deployment failed

Health check failed

Memory exceeded
```

Alerts may generate notifications.

---

## Notification

Represents information delivered to users.

Examples

```
Deployment Successful

Deployment Failed

Invitation Accepted

Repository Synced
```

---

## Audit Log

Represents important actions performed inside the platform.

Examples

```
User joined organization

Project deleted

Deployment cancelled

Repository connected
```

Audit logs should never be editable.

---

# Relationships

```
One User

↓

Many Organizations
```

---

```
One Organization

↓

Many Members
```

---

```
One User

↓

Many Memberships
```

---

```
One Organization

↓

Many Projects
```

---

```
One Project

↓

One Repository
```

---

```
One Project

↓

Many Environments
```

---

```
One Environment

↓

Many Deployments
```

---

```
One Deployment

↓

Many Logs
```

---

```
One Deployment

↓

Many Metrics
```

---

```
One Environment

↓

Many Health Checks
```

---

```
One Organization

↓

Many Notifications
```

---

```
One Organization

↓

Many Audit Logs
```

---

# Business Rules

A user cannot access a project unless they belong to the owning organization.

A deployment must belong to exactly one environment.

An environment must belong to exactly one project.

A project cannot exist without an organization.

A deployment cannot exist without a project.

Logs cannot exist without a deployment.

Metrics cannot exist without a deployment.

Audit logs are immutable.

Deleting an organization should never silently remove production data.

Soft deletion should be preferred where possible.

---

# Future Domain Expansion

Possible future entities

```
API Keys

Webhooks

Secrets

Deployment Pipelines

Feature Flags

Usage Analytics

Billing

Teams

Service Accounts

Incident Reports

Status Pages

Integrations

Cloud Providers
```

These are intentionally excluded from Version 1.

---

# Open Questions

These questions remain unresolved and should be answered before implementation.

* Can one project connect multiple repositories?
* Should deployments be manually triggered or automatic?
* Should environments support custom variables?
* How should secrets be stored?
* Should organizations support custom roles?
* Should notifications support multiple delivery channels?
* How long should logs be retained?
* Should metrics be aggregated or stored raw?

---

# Version 1 Domain Freeze

For Version 1, the following hierarchy is considered stable:

```
User
    ↓
Organization
    ↓
Project
    ↓
Repository
    ↓
Environment
    ↓
Deployment
    ↓
Logs / Metrics / Health Checks
```

Any major structural change after this point should be documented with a design decision before implementation.

---

# current build Execution Note

For the build build, treat the hierarchy above as frozen and correct. Do not add or remove
tables. The only thing current build changes is *behavior* on top of it (auto-org-creation, single-member
orgs, simulated deployments/metrics/health instead of real ones). See `PROJECT_BIBLE.md` for the
full current build feature list.

