# 🔐 AUTHENTICATION.md

Version: 2.0 (V1 MVP)

---

# ⚠️ V1 Scope Notice

GitHub OAuth, email verification, and forgot/reset password are **post-V1**. V1 ships
email+password registration/login with JWT access + refresh tokens only. This is enough to
demonstrate real auth engineering (hashing, token issuance, refresh rotation, guards) without the
extra surface area of OAuth callbacks and transactional email.

---

# Authentication Goals (V1)

- Secure user authentication
- Stateless API authentication (JWT)
- Refresh token rotation

---

# Authentication Methods (V1)

- Email + Password only

_Post-V1: GitHub OAuth, Google OAuth, GitLab OAuth._

---

# Password Security (V1)

- bcrypt (or argon2 if trivial to add) password hashing
- Password confirmation on register (frontend validation via Zod)

_Post-V1: forgot password, reset password, email verification._

---

# Tokens (V1)

Access Token
- JWT, 15 minutes

Refresh Token
- JWT, 7–30 days, stored in DB (or as an httpOnly cookie) so it can be revoked on logout

---

# Session Flow (V1)

```
Register → Auto-verified, personal org created → Login → Issue Tokens
   → Authenticated Requests → Refresh Token → Logout (revoke refresh token)
```

(No email verification step in V1 — accounts are usable immediately after registration.)

---

# APIs (V1)

```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
```

---

# Database Tables Used (V1)

```
users
```
(`refresh_tokens` — add a minimal table or store hashed refresh token on the user row; keep it
simple. `github_accounts`, `email_verification_tokens`, `password_reset_tokens` are post-V1.)

---

# Security (V1)

- Password hashing
- JWT validation on every protected route
- Refresh token revocation on logout
- Rate limiting on `/auth/login` and `/auth/register`

---

# Edge Cases (V1)

- Expired/invalid JWT → 401
- Reused/revoked refresh token → force re-login
- Duplicate email/username → 409

---

# Status

Building (V1)
