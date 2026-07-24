# 🔒 SECURITY.md

Version: 2.0 (current build)

---

# ⚠️ current build Scope Notice

Webhook signature verification and audit logging are next phase (no webhooks, no audit writes in
current build). Everything else below is real current build scope — auth security doesn't get a pass just because the
timeline is short.

---

# Authentication (current build)

- JWT (access + refresh)
- Password hashing (bcrypt/argon2)

---

# Authorization (current build)

- Organization-ownership checks on every resource (see `AUTHORIZATION.md`)

---

# API Security (current build)

- HTTPS (via hosting provider)
- Rate limiting on auth endpoints
- Request validation (class-validator DTOs) on every endpoint
- CORS configured for the deployed frontend origin only

---

# Secrets (current build)

- Environment variables only, never committed
- `.env.example` checked in, `.env` gitignored

---

# Database (current build)

- Parameterized queries via Prisma (no raw SQL string concatenation)
- Foreign keys + constraints as already defined in the schema

---

# Logging (current build)

- Never log passwords or tokens

---

# Threats Considered in current build

SQL injection (mitigated by Prisma), XSS (React escaping + input validation), brute force on
login (rate limiting), token theft (short-lived access tokens, revocable refresh tokens).

---

# next phase

Webhook signature verification, audit logs, 2FA, secret manager, key rotation, CSP/HSTS headers.

---

# Status

Building (current build)

