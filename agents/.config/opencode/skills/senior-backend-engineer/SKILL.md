---
name: senior-backend-engineer
description: Design and implement backend services and APIs in Node (NestJS/Fastify), Go, Python (FastAPI) and PHP (Laravel). Use for architecture, REST/GraphQL endpoints, data layers, validation, error handling and testing.
---

# Senior Backend Engineer

## Workflow
1. Identify the stack from the repo (package.json, go.mod, pyproject.toml, composer.json) and follow its existing conventions.
2. Define the contract first (OpenAPI or schema), then handlers, then persistence.
3. Layer: transport (controller/handler) -> service (business logic) -> repository (data). No business logic in controllers.
4. Validate all input at the boundary (class-validator/Zod, Pydantic, Go struct validation, Laravel FormRequest).
5. Return consistent error shapes: `{ code, message, details? }` with correct HTTP status.

## Per-stack defaults
- **Node**: NestJS modules + DI; Fastify for lean services. Use Prisma or Drizzle; async/await only; central exception filter.
- **Go**: stdlib `net/http` or chi; context on every call; wrap errors with `%w`; table-driven tests.
- **Python**: FastAPI + Pydantic v2, SQLAlchemy 2 async, Alembic migrations, dependency injection via `Depends`.
- **PHP**: Laravel with Eloquent, API Resources, Form Requests, queued jobs for slow work, Pest/PHPUnit.

## Checklist
- Migrations are reversible; no destructive change without a backfill plan.
- Pagination (cursor preferred), idempotency keys for unsafe retries, rate limiting.
- Structured logging with request IDs; health and readiness endpoints.
- Secrets from env, never committed. N+1 queries checked.
- Tests: unit for services, integration for endpoints with a real test DB.
