# 🗄️ DATABASE_DESIGN.md

> Version: 1.0
>
> Status: Draft

---

# Philosophy

The database is the foundation of BuildMonitor.

The schema should prioritize:

* Data Integrity
* Scalability
* Readability
* Extensibility
* Performance

The goal is not to create many tables.

The goal is to correctly model the business domain.

---

# Database Choice

## PostgreSQL

Reasons

* ACID compliance
* Excellent indexing
* JSON support
* Powerful joins
* Mature ecosystem
* Widely used in production

---

# Naming Conventions

## Tables

Plural

```
users
projects
deployments
```

---

## Columns

snake_case

```
created_at

updated_at

repository_id
```

---

## Primary Keys

```
id UUID PRIMARY KEY
```

---

## Foreign Keys

```
project_id

organization_id

deployment_id
```

---

# Common Columns

Unless stated otherwise, every table contains

| Column     | Purpose            |
| ---------- | ------------------ |
| id         | UUID Primary Key   |
| created_at | Creation Timestamp |
| updated_at | Last Modification  |
| deleted_at | Soft Delete        |

---

# Entity Relationship Overview

```
users

↓

organizations

↓

members

↓

projects

↓

repositories

↓

environments

↓

deployments

↓

deployment_logs

↓

metrics
```

---

# TABLE 1 — users

Purpose

Represents authenticated users.

Columns

```
id

email

username

password_hash

full_name

avatar_url

email_verified

last_login

created_at

updated_at

deleted_at
```

Constraints

* email UNIQUE
* username UNIQUE

Indexes

* email
* username

---

# TABLE 2 — organizations

Purpose

Logical ownership boundary.

Columns

```
id

name

slug

owner_id

logo_url

created_at

updated_at

deleted_at
```

Relationships

One Organization

↓

Many Projects

Many Members

Many Notifications

---

Constraints

slug UNIQUE

---

Indexes

slug

owner_id

---

# TABLE 3 — organization_members

Purpose

Many-to-many relation.

Users belong to organizations.

Columns

```
id

organization_id

user_id

role

joined_at

invited_by

status

created_at

updated_at
```

Role

```
OWNER

ADMIN

DEVELOPER

VIEWER
```

Status

```
INVITED

ACTIVE

REMOVED
```

Composite Unique

```
organization_id

user_id
```

---

# TABLE 4 — projects

Purpose

Represents software applications.

Columns

```
id

organization_id

name

slug

description

visibility

default_branch

created_at

updated_at

deleted_at
```

Visibility

```
PRIVATE

PUBLIC
```

Indexes

organization_id

slug

---

# TABLE 5 — repositories

Purpose

Connected GitHub repository.

Columns

```
id

project_id

github_repository_id

github_owner

repository_name

clone_url

default_branch

visibility

webhook_secret

is_connected

last_sync

created_at

updated_at
```

One project

↓

One repository

---

# TABLE 6 — environments

Purpose

Deployment targets.

Examples

```
Development

Preview

Production
```

Columns

```
id

project_id

name

environment_type

domain

created_at

updated_at
```

Types

```
DEVELOPMENT

STAGING

PREVIEW

PRODUCTION
```

---

# TABLE 7 — deployments

Purpose

Represents every deployment.

Columns

```
id

environment_id

triggered_by

commit_sha

commit_message

branch

status

duration

started_at

finished_at

created_at
```

Status

```
QUEUED

RUNNING

SUCCESS

FAILED

CANCELLED
```

Indexes

environment_id

status

branch

commit_sha

---

# TABLE 8 — deployment_logs

Purpose

Store deployment output.

Columns

```
id

deployment_id

timestamp

log_level

message
```

Log Levels

```
INFO

WARNING

ERROR

DEBUG
```

One Deployment

↓

Many Log Entries

Not

One giant text field.

---

# TABLE 9 — metrics

Purpose

Time-series metrics.

Columns

```
id

deployment_id

metric_type

value

recorded_at
```

Metric Types

```
CPU

MEMORY

LATENCY

NETWORK

DISK

REQUESTS

ERROR_RATE
```

---

# TABLE 10 — health_checks

Purpose

Availability tracking.

Columns

```
id

environment_id

status

response_time

status_code

checked_at
```

---

# TABLE 11 — alerts

Purpose

Store abnormal events.

Columns

```
id

organization_id

project_id

severity

title

description

resolved

created_at
```

Severity

```
LOW

MEDIUM

HIGH

CRITICAL
```

---

# TABLE 12 — notifications

Purpose

User notifications.

Columns

```
id

user_id

title

message

type

read

created_at
```

---

# TABLE 13 — audit_logs

Purpose

Track important actions.

Columns

```
id

organization_id

performed_by

action

resource

resource_id

ip_address

user_agent

created_at
```

Audit logs are immutable.

Never update.

Never delete.

---

# Future Tables

Version 2

```
api_keys

secrets

billing

feature_flags

integrations

service_accounts

status_pages

incidents
```

---

# Indexing Strategy

Frequently searched fields should be indexed.

Examples

```
email

username

organization_id

project_id

deployment_id

environment_id

created_at

status

commit_sha
```

Avoid indexing every column.

Indexes speed up reads but slow down writes.

---

# Soft Delete Strategy

Tables supporting soft delete

```
users

organizations

projects

repositories
```

Tables that should never use soft delete

```
metrics

logs

audit_logs
```

Reason

Historical accuracy.

---

# Cascade Rules

Deleting Organization

↓

Should NOT automatically delete production data.

Instead

Organization

↓

Soft Deleted.

---

Deleting Deployment

↓

Delete Logs

↓

Delete Metrics

---

Deleting User

↓

Keep Audit Logs.

Never destroy history.

---

# Open Questions

* Should repositories support GitLab?
* Should projects support multiple repositories?
* How should secrets be encrypted?
* How long should metrics be retained?
* Should deployments reference GitHub Releases?

---

# Database Design Complete When

* Every entity exists.
* Every relationship is defined.
* Every FK is documented.
* Every important index exists.
* Cascade behavior is decided.
* Soft delete strategy is finalized.
* SQLAlchemy models can be generated directly from this document.
