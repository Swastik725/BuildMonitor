# 🔄 CI_CD.md

Version: 2.0 (V1 MVP)

---

# ⚠️ V1 Scope Notice

Docker image build + automated deploy pipeline are **post-V1**. V1 deploys manually to
Railway/Render (backend) and Vercel (frontend) — both support "push to deploy" out of the box for
the `main` branch, so a custom CD pipeline isn't needed yet.

---

# Platform

GitHub Actions (CI only for V1)

---

# Workflow (V1)

```
Push → Install → Lint → Run Tests → Build
```

---

# Jobs (V1)

Backend, Frontend

---

# Branches (V1)

`main`, `feature/*` — skip `develop`/`hotfix/*` at this scale; a 10-day solo sprint doesn't need
a long-lived integration branch.

---

# Requirements

Tests pass, lint passes.

---

# Post-V1

Docker build step, automated deploy job, preview deployments, semantic versioning.

---

# Status

Building (V1)
