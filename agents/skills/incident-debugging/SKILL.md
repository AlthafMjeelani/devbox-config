---
name: incident-debugging
description: Use when diagnosing production incidents, isolating root cause with evidence, preserving logs safely, and documenting corrective actions.
---

# Incident Debugging

## When to use
- Responding to active production incidents, outages, high error rates, or critical user alerts.
- Conducting post-incident root cause investigations and post-mortems.
- Triage of severe intermittent bugs affecting live systems.

## Inputs to gather
- Incident timeline, alert notifications, and user-facing symptoms.
- Relevant system logs, error traces, metrics dashboards, and recent deployment history.
- Active system configuration and recent change logs.

## Procedure
1. Stabilize first:
   Evaluate immediate mitigation actions (rollback, traffic shedding, feature flag disable) before deep diagnosis.
   Focus on restoring service availability for affected users.
2. Establish incident timeline:
   Record exact timestamps for first alert, symptom onset, and mitigation actions.
   Correlate the timeline with recent releases or configuration updates.
3. Isolate evidence safely:
   Extract and preserve relevant log traces, metrics, and error payloads without exposing customer PII.
   Store diagnostic logs in a secure, tamper-free location.
4. Formulate hypotheses:
   Brainstorm potential root causes based on recent deployments, external outages, or load spikes.
   Rank hypotheses by likelihood and testability.
5. Test hypotheses with evidence:
   Verify or disprove each hypothesis using telemetry data rather than guesswork.
   Seek disconfirming evidence before accepting an explanation.
6. Verify root cause:
   Confirm the underlying defect or environmental trigger responsible for the failure.
   Reproduce the failure mechanism in a non-production environment if possible.
7. Document corrective actions:
   Produce a blameless post-mortem with permanent remediation steps and prevention items.
   Assign action items with concrete owners and deadlines.

## Output / handoff
- Incident triage report: timeline, root cause analysis, mitigation applied, and permanent action items.
- Recommendations for automated alerts, synthetic monitoring, and resiliency improvements.

## Verification and guardrails
- Prioritize customer impact mitigation and service stabilization over root-cause fixes during active outages.
- Never paste raw production secrets or customer PII into incident notes or tickets.
- Ensure proposed permanent fixes undergo standard code review and regression testing before release.
- Validate that all post-incident action items address systemic prevention.
