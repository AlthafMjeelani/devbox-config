---
name: requirement-analysis
description: Use when translating business goals or ambiguous requests into concrete scope, functional acceptance criteria, edge cases, and permission boundaries.
---

# Requirement Analysis

## When to use
- Receiving a new feature request, enhancement proposal, or user story.
- Facing underspecified requirements, conflicting constraints, or ambiguous acceptance criteria.
- Before beginning implementation planning or code changes.

## Inputs to gather
- User request, feature specification, ticket description, or business goal.
- Existing system behavior, domain models, and permission boundaries.
- Constraints: regulatory, performance, backward compatibility, and platform limitations.

## Procedure
1. Dissect the core problem:
   Clarify the actual user outcome desired versus the proposed implementation details.
   Separate the underlying business requirement from premature implementation choices.
2. Identify actors and permissions:
   Map which user roles, API consumers, or services interact with the feature.
   Define required authorization levels and access boundaries.
3. Define functional acceptance criteria:
   Formulate clear, observable Given-When-Then criteria for expected behavior.
   Specify input parameters, expected states, and returned data structures.
4. Enumerate edge cases and failure modes:
   Document network failures, validation errors, boundary values, and race conditions.
   Identify how the system should respond when external dependencies fail.
5. Identify cross-cutting impacts:
   Analyze impacts on authentication, logging, reporting, and audit requirements.
   Check for compliance or privacy implications.
6. Clarify ambiguities:
   Formulate concise questions with recommended defaults for any blocking open decisions.
   Present recommendations clearly to the user.

## Output / handoff
- Formal requirements brief: problem statement, actor permissions, acceptance criteria, edge cases, and open assumptions.
- Explicit list of non-goals to prevent scope creep.

## Verification and guardrails
- Do not make unverified assumptions about business-critical requirements without documenting them.
- Ensure every acceptance criterion is verifiable through automated tests or deterministic manual checks.
- Keep requirement documents focused on outcomes rather than premature implementation choices.
- Confirm all stakeholder constraints are addressed before approving the requirements.
