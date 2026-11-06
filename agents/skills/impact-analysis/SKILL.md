---
name: impact-analysis
description: Use when tracing callers, database migrations, downstream services, backward compatibility, and rollout risks before making code changes.
---

# Impact Analysis

## When to use
- Modifying shared libraries, core domain entities, public APIs, or database schemas.
- Deprecating existing methods, endpoints, or configuration parameters.
- Prior to executing large-scale refactors or library version upgrades.

## Inputs to gather
- Proposed changes to signatures, data contracts, schemas, or runtime behaviors.
- Call hierarchy: all internal callers, external consumers, and client dependencies.
- Persistence dependencies: foreign keys, indexes, active queries, and historical data shapes.

## Procedure
1. Trace upstream callers:
   Search for all references to the affected symbols or endpoints across the repository.
   Map internal call sites and dependent modules.
2. Check external consumers:
   Determine if external clients, mobile apps, or third-party webhooks consume the modified contract.
   Evaluate contract commitments and deprecation policies.
3. Analyze database implications:
   Check if changes require schema migrations, lock tables, or break existing stored records.
   Inspect historical data volumes to anticipate migration runtimes.
4. Evaluate backward compatibility:
   Identify any breaking changes in serialized payloads, return types, or status codes.
   Ensure that existing clients continue functioning during rollout.
5. Check deployment sequencing:
   Determine if changes require a multi-phase deploy (expand-and-contract pattern).
   Plan release order for databases, backend services, and frontends.
6. Plan mitigation:
   Formulate fallback mechanisms, feature flags, or rollout guards for identified risks.
   Define concrete rollback triggers.

## Output / handoff
- Impact matrix: affected files, downstream callers, database tables, and external integrations.
- Risk assessment with recommended rollout strategy (direct deploy vs phased migration).

## Verification and guardrails
- Never assume an unused parameter or field is safe to remove without searching all client repositories.
- Verify that deprecated fields continue to be accepted and populated during transition windows.
- Halt and warn the user if a proposed change causes irreversible data loss or unversioned API breaks.
- Validate impact analysis by inspecting actual call sites rather than relying on memory.
