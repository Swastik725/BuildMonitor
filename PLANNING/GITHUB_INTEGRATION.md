# 🐙 GITHUB_INTEGRATION.md

Version: 2.0 (V1 MVP)

---

# ⚠️ V1 Scope Notice

**No OAuth, no webhooks in V1.** Setting up a GitHub OAuth App + webhook infrastructure correctly
(and securely) is itself multiple days of work — not worth it for a 10-day MVP when the actual
UI/monitoring features are the point. V1 uses a manual, read-only connection instead.

---

# Goals (V1)

- Connect a public repository by owner + name
- Fetch basic repo metadata (default branch, latest commit) via the GitHub REST API
  (unauthenticated or with a single server-side personal access token — not per-user OAuth)
- Manual "Sync" button to refresh that metadata on demand

---

# V1 Flow

```
User enters "owner/repo"
   ↓
Backend calls GitHub REST API (GET /repos/{owner}/{repo}, GET /repos/{owner}/{repo}/commits)
   ↓
Store repository_name, github_owner, default_branch, clone_url, last_sync
   ↓
Display in UI; "Sync" re-runs the same call on demand
```

---

# Features (V1)

- Repository connect (manual)
- Repository metadata display
- Manual sync

_Removed for V1: OAuth flow, automatic sync, webhook processing (push/pull_request/etc), commit
history beyond "latest commit", branch tracking beyond `default_branch`._

---

# Database (V1)

```
repositories
```
(`github_accounts` table is post-V1, once OAuth exists.)

---

# Security (V1)

- Store the server-side GitHub token (if used) as an environment variable, never in the DB or
  logs
- Handle GitHub API rate limits gracefully (surface a clear error, don't crash)

---

# Post-V1

GitHub OAuth (login + per-user tokens), real webhooks (push/pull_request/release), commit
history, branch tracking, GitLab/Bitbucket/Azure DevOps support.

---

# Status

Building (V1)
