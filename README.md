# QuickDevBase

**Developer Knowledge, At a Glance.** QuickDevBase is a responsive learning portal with concise explanations, tiny practical examples, official-documentation links, account-based progress, and assessment-gated completion certificates.

Available paths:

- **Java** — 18 modules and 148 concepts, including Java 8, 11, 17, and 21 milestones.
- **Docker** — 18 modules and 126 concepts.
- **Python** — 18 modules and 126 concepts.
- **SQL** — 18 modules and 126 concepts, with PostgreSQL-flavoured examples.
- **Generative AI Foundations** — 12 modules and 84 concepts.
- **RAG Systems** — 12 modules and 84 concepts.
- **Agentic AI** — 12 modules and 84 concepts.

The technology library is at `/`. Course paths open at `/java`, `/docker`, `/python`, `/sql`, `/ai/generative-ai`, `/ai/rag`, and `/ai/agents`.

## Technology stack

- Java 17 and Spring Boot 4.1
- Spring MVC for pages and JSON APIs
- Spring Security with database-backed sessions, CSRF tokens, origin validation, security headers, and rate limits
- Spring JDBC with HikariCP
- PostgreSQL 16 with pgvector
- Flyway database migrations
- Optional Gemini-powered Ask QuickDev lesson guide and hybrid RAG topic finder
- Thymeleaf for public certificate pages
- HTML, CSS, and vanilla JavaScript for the responsive frontend
- Maven for builds and tests
- Docker Compose for the application and PostgreSQL
- Node.js only for content, HTTP integration, and Chrome browser QA scripts; Node is not part of the production runtime

## Quick start with Docker

Install Docker Desktop or Docker Engine with Compose, then create the local environment file:

```powershell
Copy-Item .env.example .env
```

Change `POSTGRES_PASSWORD` in `.env`, then start the stack:

```powershell
docker compose up --build -d
```

Open <http://localhost:3000>. Flyway creates or upgrades the tables during startup. User, progress, session, and certificate data remain in the named `java_basecamp_data` volume across normal rebuilds.

### Optional Ask QuickDev AI guide

Create a Gemini API key in Google AI Studio and set it only in `.env`:

```dotenv
GEMINI_API_KEY=your-server-side-key
```

Then rebuild the app with `docker compose up --build -d`. When the key is blank, the learning portal continues to work normally and the lesson UI reports that AI is not configured.

Ask QuickDev is intentionally bounded: it requires login, receives only the learner's question and retrieved server-owned curriculum excerpts, and can inspect a PNG, JPEG, or WebP image up to 5 MB. Its hybrid RAG pipeline combines the existing exact technical matcher with 768-dimensional semantic search in pgvector, fuses both rankings, and asks Gemini to answer only from the top three QuickDevBase matches. Every answer keeps numbered source cards, official documentation, and exact lesson links. Uploaded images are sent to Gemini for that request but are not retained after processing or placed in the answer cache by QuickDevBase. If RAG is disabled, unavailable, or still indexing, local lexical retrieval remains available. Run `npm run curriculum:export` after editing a browser curriculum so the server-side retrieval snapshots stay synchronized; content hashes ensure only changed concepts are re-embedded. Per-minute, per-user daily, and site-wide limits are enforced in PostgreSQL. Names, emails, progress, and certificates are not sent to Gemini. Never put `GEMINI_API_KEY` in browser JavaScript or commit it to Git.

Useful commands:

```powershell
docker compose ps
docker compose logs -f app
docker compose down
```

`docker compose down -v` permanently removes the PostgreSQL volume and all application data. Use it only for an intentional clean reset.

## Existing Node deployment migration

The Spring backend uses the existing `users`, `sessions`, `learning_progress`, and `certificates` tables. The original `java_basecamp_session` cookie name and SHA-256 session-token storage are preserved, so valid database sessions remain compatible.

Passwords created by the former Express backend use its `scrypt:<salt>:<hash>` format. Spring accepts these legacy hashes and transparently replaces them with Spring Security's current scrypt format after a successful login. No password reset or database wipe is required.

Back up PostgreSQL before the first production deployment, as with any runtime migration.

## Run without Docker

Requirements:

- Java 17+
- Maven 3.9+
- PostgreSQL with the pgvector extension

Set the database URL and run Spring Boot:

```powershell
$env:DATABASE_URL = "postgresql://java_basecamp:your-password@localhost:5432/java_basecamp"
mvn spring-boot:run
```

Alternatively:

```powershell
mvn package
java -jar target/quickdevbase-1.0.0.jar
```

The npm commands `npm start`, `npm run dev`, and `npm run build` are convenience wrappers around Maven.

## DBeaver connection

For the default Compose configuration, use:

| Setting | Value |
| --- | --- |
| Host | `localhost` |
| Port | value of `DB_PORT`, default `5432` |
| Database | value of `POSTGRES_DB` |
| Username | value of `POSTGRES_USER` |
| Password | value of `POSTGRES_PASSWORD` |

The database port is bound to `127.0.0.1`, so it is available to local tools without being exposed to other computers.

## Account, progress, and certificate behavior

- Visitors can browse lessons without an account.
- Registration creates a UUID user and a salted Spring Security scrypt password hash.
- Authentication uses an opaque random token in an `HttpOnly`, `SameSite=Lax` cookie; only its SHA-256 hash is stored in PostgreSQL.
- CSRF protection is enabled for every state-changing request, with same-origin validation as an additional layer.
- Progress is isolated by user ID and course code.
- Completing every module unlocks a 15-question, 10-minute certificate assessment. A learner must score at least 11/15 within three attempts; two exam-window warnings are allowed before the third violation voids an attempt.
- Assessment questions are generated from the server-owned curriculum, change between attempts, and are scored by the server. Fullscreen and copy controls discourage casual misuse but are not equivalent to remote proctoring.
- Certificate publication requires current, explicit consent and a chosen public name.
- Public certificate IDs and verification hashes are random and unique.
- Users can rename, unpublish a certificate, republish after fresh consent, or permanently delete their account.
- Certificates record completion of every topic and a passing short knowledge check; they are not professional licences, accredited qualifications, proctored skills assessments, or vendor certifications.

## Production configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL URI or `jdbc:postgresql:` URL |
| `APP_ORIGIN` | Exact public origin, such as `https://learn.example.com` |
| `PUBLIC_APP_URL` | Public origin used in certificate and LinkedIn links |
| `COOKIE_SECURE` | Set to `true` behind production HTTPS |
| `ENFORCE_HTTPS` | Redirect safe requests and reject insecure mutations |
| `SESSION_DAYS` | Login lifetime; defaults to `30` |
| `DB_POOL_SIZE` | Maximum JDBC connections; defaults to `10` |
| `DB_SSL` | Enables PostgreSQL TLS options |
| `DB_SSL_MODE` | Optional PostgreSQL JDBC mode such as `verify-full` or `require` |
| `DB_SSL_REJECT_UNAUTHORIZED` | When `false`, default SSL mode becomes `require` |
| `GEMINI_API_KEY` | Optional server-side Gemini key; blank disables Ask QuickDev |
| `GEMINI_MODEL` | Gemini model; defaults to `gemini-3.5-flash-lite` |
| `GEMINI_EMBEDDING_MODEL` | Embedding model for semantic retrieval; defaults to `gemini-embedding-2` |
| `RAG_ENABLED` | Enables semantic retrieval and grounded discovery answers when a Gemini key exists |
| `RAG_SEMANTIC_THRESHOLD` | Minimum cosine similarity accepted from vector search; defaults to `0.55` |
| `RAG_SYNC_INTERVAL_MS` | Delay between resumable curriculum-index synchronization attempts; defaults to six hours |
| `AI_DAILY_LIMIT` | Non-cached provider requests allowed per user/day; defaults to `20` |
| `AI_MINUTE_LIMIT` | AI requests per user/minute, including cached hits; defaults to `5` |
| `AI_GLOBAL_DAILY_LIMIT` | Site-wide non-cached provider-call ceiling/day; defaults to `200` |
| `AI_MAX_OUTPUT_TOKENS` | Output ceiling per provider call; defaults to `450` |
| `AI_CACHE_DAYS` | Identical-answer cache lifetime; defaults to `7` |
| `AI_TIMEOUT_SECONDS` | Provider connect/read timeout; defaults to `20` |

For production, serve the application through HTTPS and set `APP_ORIGIN`, `PUBLIC_APP_URL`, `COOKIE_SECURE=true`, and `ENFORCE_HTTPS=true`. The application refuses to start in HTTPS-enforcement mode unless secure cookies and an HTTPS public URL are configured.

Back up PostgreSQL regularly. With the default local credentials:

```powershell
docker compose exec -T db pg_dump -U java_basecamp java_basecamp > java-basecamp-backup.sql
```

Public policy pages are available at `/privacy`, `/terms`, and `/certificate-policy`.

## Tests

Run Java unit tests and static curriculum checks:

```powershell
npm test
```

Run the API integration suite against a running stack:

```powershell
$env:TEST_BASE_URL = "http://localhost:3000"
npm run test:integration
```

Run the responsive Chrome smoke suite:

```powershell
$env:TEST_BASE_URL = "http://localhost:3000"
npm run test:browser
```

## Git identity

This repository is configured locally with user `aigwotts1` and email `sabhinav425@gmail.com`.
