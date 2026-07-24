# BuildMonitor — Project Bible

## Vision

BuildMonitor is a developer operations dashboard that helps developers manage projects, track
deployments, monitor application health, inspect incidents, and connect source repositories from
a single workspace.

It is not intended to be a clone of Vercel or Datadog. It is a focused product that demonstrates
the backend, frontend, and data-modeling decisions behind that kind of system.

## Product goals

- Keep the product coherent end to end: workspace, project, deployment, incident, and health
  surfaces should all connect through the same backend model.
- Prefer simple, reliable implementation choices over unnecessary infra.
- Avoid dummy data in the live app surface.
- Use honest simulation only where it materially reduces scope without breaking the product.

## Core product areas

### Authentication

- Email/password registration and login
- JWT access and refresh tokens
- OAuth login with Google and GitHub
- Session persistence across page reloads

### Organizations

- Personal workspace creation during signup
- Organization listing and membership management

### Projects

- Project CRUD
- Default production environment creation on project creation
- Project detail view with deployment history
- GitHub repository connection and manual sync

### Deployments

- Manual deployment triggering
- Deployment lifecycle tracking
- Retry and cancel actions
- Deployment logs

### Health and incidents

- Health summary and health check tracking
- Incident tracking and resolution flow

### Settings

- Profile view and edit
- Connected auth providers
- Provider disconnect flow

## Current implementation notes

- The backend is NestJS + Prisma.
- The frontend is React + Vite.
- CORS and OAuth redirect targets come from environment variables.
- The active UI is backed by API calls instead of fixture data.

## Still to finish

- Metrics collection and charts
- Alert generation and resolution
- In-app notifications
- Any remaining product polish needed for a clean ship

## Architecture summary

Browser → React frontend → NestJS REST API → PostgreSQL

Background work is handled with scheduled jobs where needed, not by adding unnecessary queue
infrastructure before the workload exists.

## Final goal

Ship a complete, consistent, and deployable product with no dummy UI paths and a clear product
surface from authentication through workspace management and operational visibility.

