# 🔄 CI_CD.md

Version: 2.0 (current build)

---

# ⚠️ current build Scope Notice

Docker image build + automated deploy pipeline are **next phase**. current build deploys manually to
Railway/Render (backend) and Vercel (frontend) — both support "push to deploy" out of the box for
the `main` branch, so a custom CD pipeline isn't needed yet.

---

# Platform

GitHub Actions (CI only for current build)

---

# Workflow (current build)

```
Push → Install → Lint → Run Tests → Build
```

---

# Jobs (current build)

Backend, Frontend

---

# Branches (current build)

`main`, `feature/*` — skip `develop`/`hotfix/*` at this scale; a build solo sprint doesn't need
a long-lived integration branch.

---

# Requirements

Tests pass, lint passes.

---

# next phase

Docker build step, automated deploy job, preview deployments, semantic versioning.

---

# Status

Building (current build)

