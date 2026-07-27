# BuildMonitor

BuildMonitor is a developer operations dashboard for tracking organizations, projects,
deployments, incidents, metrics, alerts, and application health from one place.

The application is split into:

- a Next.js frontend in `frontend/`
- a NestJS + Prisma backend in `backend/`
- PostgreSQL as the persistence layer

What works today:

- email/password authentication
- Google and GitHub OAuth login
- JWT access/refresh session handling
- organizations and members
- projects and default production environments
- repository connection and manual sync
- metrics collection and charts
- in-app notifications
- deployments with live status, retry/cancel, and log history
- incidents
- user settings and linked auth providers
- health summary aggregation

What is still part of the product direction:

- final QA and smoke tests
- AI-assisted repo error correction, once designed and added as a dedicated feature

## Running locally

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run start:dev
```

Root-level package files are legacy and should not be treated as the active frontend app.

## Environment variables

Frontend:

- `NEXT_PUBLIC_API_URL`

Backend:

- `DATABASE_URL`
- `PORT`
- `FRONTEND_URL`
- `CORS_ORIGIN`
- `JWT_SECRET`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRY`
- `JWT_REFRESH_EXPIRY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `GITHUB_TOKEN` optional, for private GitHub repository sync and deployment polling

## Notes

- OAuth redirects are wired back to the configured frontend URL.
- CORS is configured from `FRONTEND_URL` or `CORS_ORIGIN`.
- The old mock data file has been removed from the active app surface.
- The frontend reads its API base URL from `NEXT_PUBLIC_API_URL`.
- The deployment workflow now builds and publishes frontend and backend container images to GHCR.
