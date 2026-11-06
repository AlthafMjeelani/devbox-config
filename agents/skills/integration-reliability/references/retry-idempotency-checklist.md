# Integration Reliability Checklist

## 1. Idempotency & Deduplication
- [ ] Outgoing mutating requests include a deterministic `Idempotency-Key` header or unique transaction ID.
- [ ] Incoming webhooks verify duplicate delivery using a persistent deduplication cache or database constraint.
- [ ] In-flight duplicate requests are guarded using distributed locks or atomic status transitions (`PENDING`, `COMPLETED`).

## 2. Timeouts & Deadlines
- [ ] Connect timeout is set explicitly (e.g. 2-5 seconds).
- [ ] Read / socket timeout is set explicitly (e.g. 10-30 seconds).
- [ ] Context cancellation or deadlines propagate through downstream asynchronous calls.

## 3. Retries & Backoff
- [ ] Retries apply only to transient faults (HTTP 429, 502, 503, 504, TCP disconnects).
- [ ] Exponential backoff is configured with upper bounds (e.g., initial 500ms, max 30s).
- [ ] Full jitter is added to retry intervals to prevent thundering herd problems.
- [ ] Maximum retry count is capped (e.g. 3-5 attempts).

## 4. Failure Isolation & Recovery
- [ ] Exhausted retries route to a persistent Dead Letter Queue (DLQ) or error table.
- [ ] Circuit breakers protect downstream services during prolonged outages.
- [ ] Manual or automated replay mechanism exists for DLQ messages.

## 5. Security & Observability
- [ ] API keys, Bearer tokens, and secrets are retrieved from environment variables, never hardcoded.
- [ ] Request and response logging redacts Authorization headers, card numbers, and PII.
- [ ] Metrics track request latencies, error counts, retry counts, and DLQ depth.
