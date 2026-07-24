# GitHub Integration

Version: 2.0 (current build)

---

# Scope

BuildMonitor supports manual GitHub repository connection and sync for projects.

This is separate from the product’s Google/GitHub OAuth login flow. Repository sync does not use
GitHub OAuth apps or webhooks yet.

---

# Goals

- Connect a repository by owner/name, HTTPS Git URL, or SSH Git URL
- Fetch basic repo metadata (default branch, latest commit) via the GitHub REST API
- Use unauthenticated requests for public repositories
- Allow an optional server-side `GITHUB_TOKEN` for private repository sync
- Manual sync refreshes the stored metadata on demand

---

# Flow

```
User enters a repository reference
   ↓
Backend calls GitHub REST API
  - GET /repos/{owner}/{repo}
  - GET /repos/{owner}/{repo}/commits?sha={default_branch}&per_page=1
   ↓
Store repository owner/name, default branch, clone URL, HTML URL, last sync timestamp, and latest
commit metadata
   ↓
Display the repository in the UI; "Sync" repeats the same call on demand
```

---

# Features

- Repository connect
- Repository metadata display
- Manual sync
- Repository disconnect

---

# Database

The repository data lives in the `repositories` table and is linked 1:1 to `projects`.

Stored fields include:

- GitHub owner and repository name
- repository ID
- clone URL
- HTML URL
- default branch
- visibility
- last sync timestamp
- latest commit SHA, message, author, and date

---

# Security

- Store the optional server-side GitHub token as an environment variable, never in the DB or logs
- Handle GitHub API rate limits gracefully
- Public repos should work without any token

---

# Next phase

- GitHub OAuth app integration for repository-level auth, if private repo support needs to move
  beyond a single server-side token
- Webhooks for push-based sync
- Commit history beyond the latest commit
- Branch tracking beyond the default branch
- GitLab / Bitbucket / Azure DevOps support

---

# Status

Implemented in the current build
