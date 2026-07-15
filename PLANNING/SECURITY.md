# 🔒 SECURITY.md

Version: 2.0 (V1 MVP)

---

# ⚠️ V1 Scope Notice

Webhook signature verification and audit logging are post-V1 (no webhooks, no audit writes in
V1). Everything else below is real V1 scope — auth security doesn't get a pass just because the
timeline is short.

---

# Authentication (V1)

- JWT (access + refresh)
- Password hashing (bcrypt/argon2)

---

# Authorization (V1)

- Organization-ownership checks on every resource (see `AUTHORIZATION.md`)

---

# API Security (V1)

- HTTPS (via hosting provider)
- Rate limiting on auth endpoints
- Request validation (class-validator DTOs) on every endpoint
- CORS configured for the deployed frontend origin only

---

# Secrets (V1)

- Environment variables only, never committed
- `.env.example` checked in, `.env` gitignored

---

# Database (V1)

- Parameterized queries via Prisma (no raw SQL string concatenation)
- Foreign keys + constraints as already defined in the schema

---

# Logging (V1)

- Never log passwords or tokens

---

# Threats Considered in V1

SQL injection (mitigated by Prisma), XSS (React escaping + input validation), brute force on
login (rate limiting), token theft (short-lived access tokens, revocable refresh tokens).

---

# Post-V1

Webhook signature verification, audit logs, 2FA, secret manager, key rotation, CSP/HSTS headers.

---

# Status

Building (V1)
