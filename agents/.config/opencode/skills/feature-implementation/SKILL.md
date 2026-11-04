---
name: feature-implementation
description: Use when implementing focused production changes following existing patterns, clear tests, safe error handling, and self-review diffs.
---

# Feature Implementation

## When to use
- Implementing new features, user stories, or behavioral enhancements.
- Adding new endpoints, service methods, or business logic to existing applications.
- Writing production-ready code with complete test coverage.

## Inputs to gather
- Approved requirement specification and acceptance criteria.
- Target files and adjacent code demonstrating existing patterns and naming conventions.
- Relevant test runners and linting commands.

## Procedure
1. Review baseline:
   Run existing tests to verify working tree passes before making changes.
   Ensure that the baseline build compiles without warnings.
2. Follow existing idioms:
   Match existing project structure, dependency injection, and error handling patterns.
   Use established naming and coding conventions.
3. Implement core logic:
   Make minimal, focused code changes satisfying the acceptance criteria.
   Avoid modifying unrelated files or reformatting adjacent code.
4. Add comprehensive tests:
   Write unit and integration tests covering standard paths and boundary conditions.
   Verify that tests fail when expected behavior is altered.
5. Safe error handling:
   Ensure exceptions are caught, logged appropriately, and converted to structured domain errors.
   Do not swallow errors or leave empty catch blocks.
6. Self-review diff:
   Run git diff and inspect all changes line by line to eliminate extraneous whitespace or debug logs.
   Verify that diffs contain only intentional changes.
7. Verify build and tests:
   Execute the full local build, lint, and test suite to ensure zero regressions.
   Confirm that all tests pass cleanly.

## Output / handoff
- Production-ready implementation with passing automated test suite.
- Summary of modified files, new behavior verified, and remaining residual risks.

## Verification and guardrails
- Never introduce new external dependencies without explicit user approval.
- Do not edit files outside the approved feature scope.
- Confirm all tests pass locally before claiming the feature is complete.
- Verify that no debug statements or temporary flags remain in production code.
