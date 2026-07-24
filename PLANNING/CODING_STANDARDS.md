# 📐 CODING_STANDARDS.md

Version: 2.0 (current build)

---

# ⚠️ current build Scope Notice

Corrected to match the actual stack (NestJS/TypeScript, not Python/FastAPI as the original draft
assumed).

---

# General

Readable code, small functions, meaningful names, no magic numbers.

---

# Backend (NestJS/TypeScript)

- ESLint + Prettier
- Strict TypeScript
- DTOs with `class-validator` for every input
- Constructor-based dependency injection (NestJS default)
- Controller → Service → Prisma layering — no Prisma calls inside controllers

---

# Frontend

- Functional components
- Custom hooks for data fetching (TanStack Query)
- Strict TypeScript
- Reusable components (shadcn/ui as the base)

---

# Git

Conventional commits, small commits, feature branches off `main`.

---

# Reviews (solo-dev adaptation)

No dead code, no TODOs left in for more than a day, at least a smoke test for anything on the
critical path (auth, deployment trigger).

---

# Status

Building (current build)

