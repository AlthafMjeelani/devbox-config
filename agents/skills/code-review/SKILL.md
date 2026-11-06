---
name: code-review
description: Use when reviewing code, diffs, staged changes, or pull requests for correctness, regressions, maintainability, and missing tests.
---

# Code Review

## When to use
- Reviewing pull requests, staged changes, working tree diffs, or proposed patch files.
- Auditing implementations for correctness, architectural adherence, security, and edge cases.
- Performing pre-merge reviews before shipping code to production.

## Inputs to gather
- Source requirement: user request, specification, ticket, or acceptance criteria.
- Target diff: merge-base diff against target branch, or staged/unstaged working tree changes.
- Project guidelines: `AGENTS.md`, repository conventions, and existing nearby patterns.

## Procedure
1. Establish review fixed point:
   For a branch or PR: review the three-dot merge-base diff against the target branch.
   For working tree changes: capture a snapshot of staged and unstaged diffs without altering scope.
2. Check requirement fidelity:
   Verify that all acceptance criteria are met and no unrequested scope was introduced.
   If no source requirement is available, note that spec fidelity is unverified.
3. Review dual independent axes:
   **Spec:** missing behavior, incorrect logic, unmet criteria, and unrequested scope creep.
   **Standards:** correctness, regressions, concurrency hazards, maintainability, idioms, and test coverage.
4. Prioritize findings:
   Order findings strictly by severity: Critical, Important, Minor.
   Critical: exploitable security issue, data loss, broken production path, or unsafe migration.
   Important: likely bug, missed edge case, broken contract, or insufficient test coverage.
   Minor: maintainability issue worth noting but not blocking.
5. Cite exact locations:
   Include file path and line numbers for every finding.
   Tag each finding with `[Spec]` or `[Standards]`.
6. Format output:
   Structure the review using the schema in [review-output-format.md](references/review-output-format.md).
   Highlight residual risks and untested areas.
7. Maintain read-only stance:
   Provide review feedback and findings without modifying source files.
   Do not make code edits during a review turn.

## Output / handoff
- Structured code review report matching [review-output-format.md](references/review-output-format.md).
- Clear verdict: Approve, Request Changes, or Comment with residual risk analysis.

## Verification and guardrails
- Findings must be evidence-based; distinguish confirmed bugs from personal styling preferences.
- Tag findings with `[Spec]` or `[Standards]`.
- Do not edit files during a code review session.
- State explicitly when no findings are detected.
