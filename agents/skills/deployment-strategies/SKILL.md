---
name: deployment-strategies
description: Choose and execute rollout strategies (rolling, blue-green, canary, feature flags) with rollback plans. Use when planning a production release or reducing deploy risk.
---

# Deployment strategies

## Pick by risk
- Rolling: default for stateless services with backward-compatible changes.
- Blue-green: instant switch and instant rollback; needs double capacity and compatible data.
- Canary: send 1-5% of traffic, watch error rate and latency, then step up. Best for risky changes.
- Feature flags: decouple deploy from release; remove flags after rollout.

## Database changes
- Expand, migrate, contract: add nullable or new structures first, backfill, switch reads and writes, drop old later.
- Old and new code must both work against the schema during rollout (see `database-migration-safety`).

## Checklist
- Health checks and automated rollback criteria defined before shipping.
- Rollback tested, and fast (under minutes). Know who can trigger it.
- Deploy away from peak traffic and avoid Friday-evening releases for risky changes.
- Post-deploy: watch dashboards for a defined window.

Related: `ci-cd-and-release`, `kubernetes-ops`, `database-migration-safety`, `incident-response-runbooks`.
