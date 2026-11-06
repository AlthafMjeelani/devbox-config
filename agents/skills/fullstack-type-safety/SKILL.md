---
name: fullstack-type-safety
description: Keep client and server types in sync end to end - OpenAPI/Swagger codegen, tRPC, GraphQL codegen, Dart freezed/json_serializable and TypeScript Zod.
---

# Fullstack Type Safety

## Choose the contract source
- **Single TS monorepo**: tRPC; share Zod schemas, infer types with `z.infer`.
- **Polyglot / public API**: OpenAPI as source of truth; generate clients (openapi-typescript, orval, openapi-generator for Dart).
- **GraphQL**: schema-first; `graphql-codegen` for typed hooks/documents.

## Rules
1. One source of truth; generated code is never hand-edited and is regenerated in CI (fail if diff).
2. Validate at runtime at every trust boundary (Zod `.parse` / `safeParse`), not just compile time.
3. Derive types from schemas, not the reverse.

## TypeScript + Zod
- Schemas live in a shared package; export both schema and inferred type.
- Use `z.coerce` for query params, `.transform` sparingly, discriminated unions for variants.

## Dart
- `freezed` + `json_serializable` for immutable models; run `dart run build_runner build --delete-conflicting-outputs`.
- Generate the Dart client from OpenAPI, wrap it in a repository layer.

## Checklist
Nullable vs optional handled explicitly, enums have an `unknown` fallback for forward compatibility, dates are ISO 8601 UTC, money as integer minor units or decimal strings, error responses typed too.
