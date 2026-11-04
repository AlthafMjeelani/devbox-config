---
name: api-contract-design
description: Use when designing or evolving REST, RPC, and event schemas with stable contracts, validation, versioning, compatibility, and error schemas.
---

# API Contract Design

## When to use
- Designing new HTTP REST endpoints, gRPC services, or GraphQL schemas.
- Creating or updating asynchronous event schemas and message queues.
- Evolving existing API contracts without breaking backward compatibility.

## Inputs to gather
- Business requirements and client consumption patterns (read vs write heavy, latency needs).
- Existing API conventions in the project (naming, casing, pagination, error payload formats).
- Serialization schemas (OpenAPI, JSON Schema, Protobuf, Avro).

## Procedure
1. Define resource model:
   Choose intuitive, noun-based resource URIs and standard HTTP methods.
   Ensure consistent pluralization and casing conventions.
2. Establish schema definitions:
   Define explicit field names, data types, nullability, and validation rules.
   Avoid untyped JSON blobs or ambiguous map fields.
3. Standardize error envelopes:
   Use consistent error structures with error codes, human messages, and field-level details.
   Include machine-readable error codes for client error handling.
4. Implement safe pagination:
   Use cursor-based or offset pagination with bounded page sizes for collection endpoints.
   Prevent unbounded queries that could exhaust server memory.
5. Ensure backward compatibility:
   Add optional fields only; never rename, retype, or remove fields without versioning.
   Provide deprecation notices well in advance of contract changes.
6. Document contract:
   Produce or update OpenAPI specs, Protobuf definitions, or type declarations alongside implementation.
   Include comprehensive request and response examples.

## Output / handoff
- Machine-readable contract specification (OpenAPI, Protobuf, or TypeScript interfaces).
- Documentation covering authentication, headers, error codes, and request/response examples.

## Verification and guardrails
- Never expose internal database IDs or sensitive credentials in public contract fields.
- Validate that all input payloads are strictly validated before passing to domain services.
- Verify contract changes with schema linters or contract-testing suites.
- Ensure that contract definitions are version-controlled alongside application code.
