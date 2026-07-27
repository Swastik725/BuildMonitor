# CI_CD.md

Version: 3.0

---

# Scope

GitHub Actions builds both apps. The workflow now builds the frontend and backend, but the final
deploy step still needs to be wired to the chosen hosting target.

---

# Platform

GitHub Actions

---

# Workflow

```text
Push -> Install -> Lint -> Run Tests -> Build
```

---

# Jobs

Frontend, backend

---

# Branches

`main`, `feature/*`

---

# Requirements

Tests pass, lint passes, and deploy wiring points at a real target.

---

# Status

Partially implemented.
