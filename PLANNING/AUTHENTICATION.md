# 🔐 AUTHENTICATION.md

Version: 1.0

---

# Authentication Goals

- Secure user authentication
- Stateless API authentication
- Multi-device login
- Session management
- OAuth support

---

# Authentication Methods

- Email + Password
- GitHub OAuth

Future

- Google OAuth
- GitLab OAuth

---

# Password Security

- Argon2
- Password confirmation
- Password reset
- Email verification

---

# Tokens

Access Token

- JWT
- 15 Minutes

Refresh Token

- JWT
- 30 Days
- Stored in Database

---

# Session Flow

Register

↓

Verify Email

↓

Login

↓

Issue Tokens

↓

Authenticated Requests

↓

Refresh Token

↓

Logout

---

# APIs

POST /auth/register

POST /auth/login

POST /auth/logout

POST /auth/refresh

POST /auth/forgot-password

POST /auth/reset-password

GET /auth/me

---

# Database Tables

users

github_accounts

refresh_tokens

email_verification_tokens

password_reset_tokens

---

# Security

- Argon2 Hashing
- HTTPS Only
- JWT Validation
- Refresh Rotation
- Rate Limiting
- Secure Cookies (Future)

---

# Edge Cases

- Expired Token
- Invalid JWT
- Reused Refresh Token
- Email Not Verified
- OAuth Failure
- Duplicate Email

---

# Status

Planning