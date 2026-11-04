---
name: integration-reliability
description: Use when building or reviewing integrations with third-party APIs and services for idempotency, retries, timeouts, and reconciliation.
---

# Integration Reliability

## When to use
- Integrating payment gateways, ERP systems, external CRMs, or third-party webhooks.
- Designing asynchronous background workers, message queues, and pub/sub handlers.
- Handling network unreliability, duplicate webhook deliveries, and partial system failures.

## Inputs to gather
- Third-party API documentation, authentication methods, rate limits, and error codes.
- Transaction semantics, idempotency support (e.g. `Idempotency-Key` headers), and webhook formats.
- System SLAs, timeout budgets, and retry requirements.

## Procedure
1. Enforce idempotency:
   Attach unique idempotency keys to outgoing mutating requests and record incoming webhook keys.
   Store transaction status to prevent duplicate processing.
2. Configure timeouts:
   Set aggressive connect and read timeouts; never leave HTTP requests without timeout limits.
   Ensure that client sockets do not hang indefinitely.
3. Implement retry with jitter:
   Retry only transient errors (5xx, network drops) using exponential backoff with full jitter.
   Avoid synchronizing retries across multiple workers.
4. Handle partial failures:
   Use dead-letter queues (DLQ) or outbox tables for failed events; avoid losing uncommitted state.
   Ensure failed events can be replayed safely.
5. Consult the reliability checklist:
   Review against [retry-idempotency-checklist.md](references/retry-idempotency-checklist.md).
   Confirm all security and observability requirements are met.
6. Implement reconciliation:
   Design recurring reconciliation jobs to detect and repair data drift between systems.
   Audit discrepancies automatically and alert operators.

## Output / handoff
- Integration implementation hardened with idempotency, exponential backoff, and circuit breakers.
- Monitoring alert recommendations for DLQ depths, webhook failure spikes, and rate-limit exhaustion.

## Verification and guardrails
- Never retry non-idempotent mutations without an idempotency key.
- Never retry 4xx client errors (400, 401, 403, 404) unless explicitly indicated by API documentation.
- Mask all API keys, client secrets, and sensitive payload tokens in integration logs.
- Test integration behavior under simulated network partition and latency spikes.
