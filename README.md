# Java Basecamp

A friendly Java learning roadmap covering 18 modules and 135 concepts, now with secure accounts and database-backed learning progress.

## Quick start with Docker

You need Docker Desktop (or Docker Engine with Compose).

```powershell
Copy-Item .env.example .env
```

Change `POSTGRES_PASSWORD` in `.env`, then start the application:

```powershell
docker compose up --build -d
```

Open <http://localhost:3000>. The app waits for PostgreSQL to become healthy and creates its tables automatically. Account and progress data live in the named `java_basecamp_data` volume, so normal container restarts and rebuilds keep the data.

To inspect the local database in DBeaver, connect to `localhost` on `DB_PORT` (default `5432`) with the `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` values from `.env`. The database port is bound only to `127.0.0.1`, so it is not exposed to other computers on the network.

```powershell
docker compose logs -f app
docker compose down
```

`docker compose down -v` also deletes the database volume and all user data, so use it only when you intentionally want a clean reset.

## Account and progress behavior

- Visitors can browse every lesson without an account.
- Registering creates a user with a UUID and a salted `scrypt` password hash.
- Login uses a random, server-side database session. The browser receives only an `HttpOnly`, `SameSite=Lax` cookie.
- Completing or reopening a module updates the signed-in user's row in PostgreSQL.
- The same account restores its progress on another browser after login, while different account IDs remain isolated.
- Logout revokes the current session in the database.
- Completing all 18 modules makes the learner eligible for a certificate; it does not publish personal data automatically.
- The learner reviews the disclosure, chooses the displayed name, and explicitly selects **Claim & publish** before a public link is activated.
- Each certificate has an unguessable public link, a unique database verification code, LinkedIn sharing, and a print-to-PDF layout.
- Learners can correct their public name, make a certificate private, republish it after fresh consent, or permanently delete their entire account.
- Certificates are course-completion records, not professional licences, accredited qualifications, or Oracle certifications.

The schema contains four tables: `users`, `sessions`, `learning_progress`, and `certificates`. A composite key on `(user_id, module_id)` prevents duplicate completion records, while `(user_id, course_code)` ensures one certificate per completed course.

## Production deployment

The included [Dockerfile](Dockerfile) builds a single Node.js application image. PostgreSQL is a separate service in [compose.yaml](compose.yaml), which is convenient for a VPS; platforms with managed PostgreSQL can deploy only the app image and provide `DATABASE_URL` themselves.

Set these values in the deployment environment:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (provided automatically by Compose) |
| `APP_ORIGIN` | Exact public origin, such as `https://learn.example.com` |
| `PUBLIC_APP_URL` | Public HTTPS origin used for certificate and LinkedIn share links |
| `COOKIE_SECURE` | Set to `true` when the site is served over HTTPS |
| `ENFORCE_HTTPS` | Set to `true` in production to redirect page requests and reject insecure API mutations |
| `SESSION_DAYS` | Login lifetime; defaults to `30` |
| `DB_SSL` | Set to `true` if the hosted database requires TLS |
| `DB_SSL_REJECT_UNAUTHORIZED` | Keep `true` unless the provider specifically requires otherwise |

Use a strong unique database password, set `APP_ORIGIN` and `PUBLIC_APP_URL` to the deployed HTTPS domain, terminate TLS at the platform or reverse proxy, and set both `COOKIE_SECURE=true` and `ENFORCE_HTTPS=true`. The server refuses to start in HTTPS-enforcement mode if either safety setting is missing. Do not commit `.env`. A localhost certificate link works for local testing but cannot be opened by other people or previewed by LinkedIn. Public verification routes are throttled, and `GET /health` supports container and platform health checks.

Back up PostgreSQL regularly and test restoration. For the default Compose credentials, a manual backup can be created with:

```powershell
docker compose exec -T db pg_dump -U java_basecamp java_basecamp > java-basecamp-backup.sql
```

If the database name or user was changed in `.env`, use those values instead. A managed database provider's encrypted automatic backups are preferable for production.

Public policy pages are available at `/privacy`, `/terms`, and `/certificate-policy`. Replace or extend their operator-contact wording for the organization that deploys the service.

## Run without Docker

Install Node.js 22+ and make a PostgreSQL database available, then:

```powershell
npm install
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/java_basecamp"
npm start
```

Open <http://localhost:3000>.

## Tests

Unit and validation tests do not need a database:

```powershell
npm test
```

To exercise account isolation against a running stack:

```powershell
$env:TEST_BASE_URL = "http://localhost:3000"
npm run test:integration
```

With Chrome installed, the responsive browser smoke test can be run against the same URL:

```powershell
$env:TEST_BASE_URL = "http://localhost:3000"
npm run test:browser
```

## Features

- Responsive dimensional UI built with HTML, CSS, and JavaScript
- Search and stage filters across 135 concepts
- Plain-English explanations and labeled tiny examples for every topic
- Beginner comments explaining what each example operation does
- Keyboard-accessible lesson and account dialogs
- PostgreSQL-backed per-user progress with secure session cookies
- Consent-gated certificate publication, unpublishing, name correction, and account deletion
- Plain-language privacy, terms, certificate-scope, and Oracle independence notices
- Rate-limited public certificate verification and optional HTTPS enforcement
- Docker health checks, persistent storage, and production configuration
- Reduced-motion support

## Git identity

This repository is configured locally with user `aigwotts1` and email `sabhinav425@gmail.com`.
