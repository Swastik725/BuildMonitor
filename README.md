# BuildMonitor

BuildMonitor is a developer operations dashboard for tracking organizations, projects,
deployments, incidents, and application health from one place.

The application is split into:

- a React + Vite frontend in the repo root
- a NestJS + Prisma backend in `backend/`
- PostgreSQL as the persistence layer

What works today:

- email/password authentication
- Google and GitHub OAuth login
- JWT access/refresh session handling
- organizations and members
- projects and default production environments
- repository connection and manual sync
- deployments with live status, retry/cancel, and log history
- incidents
- user settings and linked auth providers
- health summary aggregation

What is still part of the product direction:

- metrics collection and charts
- alert generation and resolution
- in-app notifications
- real-time push updates if they become justified later

## Running locally

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run start:dev
```

## Environment variables

Frontend:

- `VITE_API_URL`

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
- `GITHUB_TOKEN` optional, for private GitHub repository sync

## Notes

- OAuth redirects are wired back to the configured frontend URL.
- CORS is configured from `FRONTEND_URL` or `CORS_ORIGIN`.
- The old mock data file has been removed from the active app surface.
