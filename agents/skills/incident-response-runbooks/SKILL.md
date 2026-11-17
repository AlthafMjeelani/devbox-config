---
name: incident-response-runbooks
description: Run and write incident response: triage, mitigation, comms, postmortems and runbooks. Use during an outage or when creating on-call documentation.
---

# Incident response and runbooks

## During an incident
1. Declare severity and an incident lead. State impact in one line.
2. Mitigate first (rollback, disable flag, scale, failover), diagnose second.
3. Change one thing at a time and record each action with a timestamp.
4. Post status updates on a fixed cadence until resolved.
- Rollbacks and data-affecting actions need explicit user approval.

## Runbook template
- Title, owner, last verified date.
- Symptoms and the alert that points here.
- Quick checks (dashboards, commands) with expected output.
- Mitigation steps in order, with rollback for each.
- Escalation contacts and when to use them.

## Blameless postmortem
- Summary, impact, timeline, root cause and contributing factors, what went well and badly, action items with owner and date.
- Fix the system and the detection gap, not the person.

Related: `incident-debugging`, `observability-and-monitoring`, `deployment-strategies`, `decision-log`.
