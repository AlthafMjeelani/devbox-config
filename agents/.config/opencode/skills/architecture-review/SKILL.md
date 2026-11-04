---
name: architecture-review
description: Use when evaluating proposed designs against modularity, coupling, data flow, scalability, operational complexity, and existing idioms.
---

# Architecture Review

## When to use
- Proposing significant structural changes, new service integrations, or framework additions.
- Reviewing design proposals, RFCs, or refactoring plans before implementation.
- Assessing technical debt, module coupling, or scalability bottlenecks in existing systems.

## Inputs to gather
- Proposed design document, architecture diagram, or implementation plan.
- Current codebase architecture guidelines (`AGENTS.md`, design docs) and established idioms.
- Non-functional requirements: throughput, latency, concurrency, data retention, and disaster recovery.

## Procedure
1. Evaluate modularity and coupling:
   Check if the design introduces tight coupling across domain boundaries.
   Verify that modules communicate through clean interfaces or message contracts.
2. Trace data flow:
   Follow read and write paths from client entry points through persistence and background jobs.
   Identify potential bottlenecks, serialization costs, or data consistency hazards.
3. Analyze failure modes:
   Evaluate how the architecture behaves during downstream timeouts, network partitions, or crashes.
   Check for single points of failure and circuit-breaking mechanisms.
4. Check consistency:
   Assess whether the proposal aligns with existing patterns or introduces gratuitous technology churn.
   Favor established repository idioms over novel external libraries.
5. Assess operational burden:
   Evaluate monitoring, logging, deployment sequencing, and maintenance complexity.
   Ensure that telemetry provides sufficient visibility into system health.
6. Document trade-offs:
   Compare the proposed approach against at least one viable alternative.
   Detail the rationale for the selected design.

## Output / handoff
- Architecture review report with findings categorized by severity (Critical, Important, Minor).
- Explicit trade-off matrix comparing options across complexity, scalability, and maintainability.

## Verification and guardrails
- Reject designs that introduce unnecessary dependencies or overly complex abstractions.
- Ensure all public interfaces and data contracts remain backward compatible or have versioning strategies.
- Prioritize simplicity, robustness, and long-term maintainability over development speed.
- Surface all unmitigated architecture risks to the user before implementation starts.
