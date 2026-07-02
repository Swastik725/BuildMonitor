# BuildMonitor

BuildMonitor is a backend service for monitoring software projects, tracking build status, and providing authentication for project management. It is being built as a portfolio project to demonstrate backend engineering skills using modern web technologies.

## Features

* User authentication with JWT
* Google OAuth authentication
* Protected API routes
* PostgreSQL database with Prisma ORM
* Input validation using NestJS ValidationPipe
* Modular NestJS architecture
* Environment-based configuration

## Tech Stack

* **Framework:** NestJS
* **Language:** TypeScript
* **Database:** PostgreSQL (Neon)
* **ORM:** Prisma
* **Authentication:** JWT + Google OAuth (Passport)
* **Validation:** class-validator & class-transformer

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Swastik725/BuildMonitor.git
cd BuildMonitor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Start the development server

```bash
npm run start:dev
```

The API will be available at:

```
http://localhost:3000
```

## Current API

### Authentication

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | `/auth/register`        | Register a new user    |
| POST   | `/auth/login`           | Login and receive JWT  |
| GET    | `/auth/me`              | Get authenticated user |
| GET    | `/auth/google`          | Google OAuth login     |
| GET    | `/auth/google/callback` | Google OAuth callback  |

## Project Status

🚧 BuildMonitor is currently under active development.

Planned features include:

* Project management
* Build tracking
* CI/CD integrations
* Deployment history
* Build logs
* GitHub integration
* Dashboard and analytics
* Notifications

## License

This project is licensed under the MIT License.
