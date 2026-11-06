---
name: safe-refactoring
description: Use when refactoring code, extracting modules, or cleaning technical debt while preserving external behavior and verifying regression risks.
---

# Safe Refactoring

## When to use
- Restructuring messy, tightly coupled, or duplicated code without changing external functionality.
- Extracting reusable modules, services, or domain objects from monolithic files.
- Updating internal implementation patterns while keeping public APIs and interfaces intact.

## Inputs to gather
- Target files and components designated for refactoring.
- Existing test suites covering the target code.
- Public interface contracts and caller expectations.

## Procedure
1. Verify baseline test suite:
   Ensure all existing tests pass before touching any code.
   Confirm that the working tree is clean and baseline metrics are known.
2. Establish characterization tests:
   If existing test coverage is sparse, write characterization tests capturing current behavior.
   Ensure edge cases and error handling paths are exercised.
3. Make small, atomic steps:
   Execute refactoring in incremental steps (rename, extract method, extract class).
   Avoid large, sweeping rewrites across multiple modules simultaneously.
4. Run tests after every step:
   Verify tests pass after each discrete modification.
   Do not accumulate unverified changes across multiple files.
5. Preserve public signatures:
   Keep existing public interfaces stable; use adapters or deprecation warnings if migrating.
   Ensure that external callers experience zero breaking changes.
6. Audit diff for behavioral drift:
   Review git diff specifically looking for unintended logic alterations or side effects.
   Verify that only structural improvements were made.

## Output / handoff
- Refactored codebase with improved modularity, readability, and zero behavioral regressions.
- All characterization and regression tests passing cleanly.

## Verification and guardrails
- Never combine behavioral feature changes with refactoring in the same step.
- Do not proceed with refactoring if baseline tests fail; fix bugs first or get explicit authorization.
- Reject refactorings that introduce unnecessary layers of indirection or cognitive overhead.
- Ensure that test suites run quickly to maintain a tight refactoring feedback loop.
