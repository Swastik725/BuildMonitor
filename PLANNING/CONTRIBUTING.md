# 🤝 CONTRIBUTING.md

Version: 2.0 (V1 MVP — solo dev, 10 day sprint)

---

## Branch Strategy (V1)

- `main` — always deployable
- `feature/*` — one branch per roadmap item from `ROADMAP.md`

(`develop` and `hotfix/*` are dropped for V1 — unnecessary ceremony for a solo 10-day build.)

---

## Commit Convention

feat: / fix: / docs: / refactor: / test: / perf: / chore:

---

## Rules (V1)

- No direct push to `main` once the app is live (Day 10 onward) — small feature branches instead
- Update `ROADMAP.md` checkboxes as items complete, so progress stays honest against the 10-day
  clock
