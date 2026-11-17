---
name: observability-and-monitoring
description: Add logging, metrics, tracing, dashboards and alerts that answer real questions. Use for monitoring setup, SLOs, alert noise, or diagnosing production behaviour.
---

# Observability

## Signals
- Logs: structured JSON, one event per line, with level, timestamp, request or trace id. Never log secrets or personal data.
- Metrics: RED for services (rate, errors, duration), USE for resources (utilization, saturation, errors). Keep label cardinality low.
- Traces: propagate context across services (OpenTelemetry). Sample sensibly; always keep errors.

## SLOs and alerts
- Define an SLI and SLO per user-facing journey (availability, latency percentile).
- Alert on symptoms users feel (burn rate), not causes (CPU). Every alert needs an owner, a runbook link and an action.
- Delete or downgrade alerts nobody acts on. Page only for urgent, actionable issues.

## Dashboards
- One overview per service: traffic, errors, latency, saturation, recent deploys.
- Mark deploys on graphs to correlate change with impact.

## Verify
- Trigger a test error or load and confirm the signal, the alert and the runbook path all work.

Related: `incident-response-runbooks`, `incident-debugging`, `web-performance-optimization`.
