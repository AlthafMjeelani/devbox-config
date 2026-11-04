---
name: regression-testing
description: Use when reproducing defects end-to-end, authoring failing regression tests, and verifying root-cause fixes across relevant test suites.
---

# Regression Testing

## When to use
- Fixing reported bugs, runtime crashes, edge-case failures, or performance regressions.
- Ensuring previously resolved defects do not reappear during refactoring or dependency upgrades.

## Inputs to gather
- Defect report, error logs, stack traces, and reproduction steps.
- Existing test suites and fixtures related to the failing component.
- Root cause diagnosis from code inspection.

## Procedure
1. Reproduce defect:
   Recreate the failure in a clean local environment matching user conditions.
   Confirm that the issue reproduces consistently with exact steps.
2. Author failing regression test:
   Write an automated unit or integration test that fails specifically due to the bug.
   Do not modify production code while writing the reproduction test.
3. Confirm test failure:
   Run the new test and verify it fails with the expected assertion error or exception.
   Ensure the test fails for the right reason, matching the observed bug symptoms.
4. Implement the fix:
   Apply the minimal root-cause code modification in production code.
   Address the fundamental flaw rather than masking the symptoms.
5. Confirm test passes:
   Re-run the regression test and verify it now passes cleanly.
   Verify that assertion logic verifies the fixed state thoroughly.
6. Run adjacent test suites:
   Execute all related tests across the module to ensure zero regressions were introduced.
   Confirm that existing functionality remains unaffected.

## Output / handoff
- Passing regression test permanently checked into the repository's test suite.
- Verified bug fix with confirmed root cause and before/after test execution evidence.

## Verification and guardrails
- Never claim a bug is fixed without first reproducing it and confirming the test fails prior to the fix.
- Do not weaken existing test assertions to make a failing test pass.
- Ensure regression tests run quickly and deterministically in CI pipelines.
- Keep the regression test in the permanent test suite to prevent future regressions.
