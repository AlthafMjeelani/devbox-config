---
name: test-strategy
description: Use when designing testing plans and selecting the right pyramid balance across unit, integration, contract, E2E, and performance tests.
---

# Test Strategy

## When to use
- Architecting testing approaches for a new service, major feature, or legacy migration.
- Evaluating test suite efficiency, coverage gaps, or test execution speed bottlenecks.
- Defining verification criteria for complex user workflows.

## Inputs to gather
- System architecture, integration boundaries, and critical business paths.
- Available testing frameworks and test environments in the repository.
- Risk profile: financial transactions, auth flows, reporting, or background batch processing.

## Procedure
1. Map risk to test tiers:
   Assign unit tests for domain logic, calculation rules, state transitions, and validation routines.
   Assign integration tests for database repositories, caching layers, and external service adapters.
   Assign contract tests for API payload schemas, consumer-driven contracts, and event formats.
   Assign end-to-end (E2E) tests for critical revenue or authentication paths through the full stack.
2. Prioritize fast feedback:
   Keep the bulk of test cases at the unit level; reserve E2E for critical smoke tests.
   Aim for test suites that run in seconds rather than minutes.
3. Target meaningful assertions:
   Test domain invariants and error scenarios rather than trivial getters/setters.
   Verify state mutations, boundary conditions, and error propagation.
4. Establish test data strategy:
   Use deterministic factories or fixtures rather than brittle shared databases.
   Ensure each test run operates on isolated, repeatable test fixtures.
5. Define execution cadence:
   Specify which tests run in pre-commit, pull request CI, and nightly builds.
   Structure CI pipelines to run fast unit tests first and slow integration tests subsequently.

## Output / handoff
- Structured test strategy document mapping components to test tiers, frameworks, and verification gates.
- List of high-priority coverage gaps and concrete recommendations.

## Verification and guardrails
- Do not chase 100% line coverage at the expense of test maintainability and execution speed.
- Avoid flaky tests: eliminate non-deterministic sleeps, uncontrolled network calls, and order dependencies.
- Ensure all test commands can be executed locally by engineers without specialized remote infrastructure.
- Require automated test verification for all bug fixes and new features.
