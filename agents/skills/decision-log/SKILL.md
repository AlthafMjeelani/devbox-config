---
name: decision-log
description: Use when recording significant architectural decisions, alternatives considered, trade-offs, rationale, and superseding decisions.
---

# Decision Log

## When to use
- Introducing a new architectural pattern, dependency, or structural convention.
- Making a trade-off between performance, complexity, development speed, or maintainability.
- Changing or superseding an existing architectural decision or contract.

## Inputs to gather
- Problem statement and business context driving the decision.
- Evaluated options and alternatives considered.
- Pros, cons, operational risks, and costs of each alternative.
- Chosen solution and explicit justification.

## Procedure
1. Identify the decision scope:
   Determine if the change impacts module boundaries, public APIs, persistence, or security.
   Verify whether team consensus or user approval is needed.
2. Document alternatives:
   Outline at least two viable alternatives alongside the chosen approach.
   Explain the technical trade-offs of each option.
3. List consequences:
   Document positive outcomes, negative impacts, risks, and technical debt incurred.
   Include operational considerations such as monitoring and deployment complexity.
4. Record status:
   Mark the decision as Proposed, Accepted, Rejected, or Superseded.
   Include date and primary stakeholders.
5. Handle superseding decisions:
   If superseding a previous decision, link to the superseded decision and explain why the change occurred.
   Document any backward-compatibility or migration steps required.
6. Store or format:
   Follow project ADR conventions (e.g., `docs/adr/` or project decision logs).
   Keep the record concise and discoverable.

## Output / handoff
- Clean ADR markdown entry with Title, Status, Context, Decision, Consequences, and Alternatives.
- Notification to team or user highlighting the long-term impact of the decision.

## Verification and guardrails
- Do not duplicate project truth or create conflicting guidelines across multiple doc files.
- Involve stakeholders or request approval before committing high-impact architectural changes.
- Ensure decisions respect global rules on quality, simplicity, and maintainability.
- Maintain decision history without deleting past rejected or superseded records.
