---
name: documentation-sync
description: Use when updating affected technical documentation, README files, API specs, and runbooks alongside code changes to prevent stale claims.
---

# Documentation Sync

## When to use
- Completing a feature, API modification, configuration change, or bug fix.
- Deprecating or altering an existing command, CLI parameter, or environment variable.
- Identifying discrepancies between written docs and real system behavior.

## Inputs to gather
- Git diff of all changed code files and configuration schemas.
- Existing documentation files (`README.md`, `docs/`, OpenAPI specs, inline docstrings).
- Verified test runs confirming the documented behavior is accurate.

## Procedure
1. Scan for documentation touchpoints:
   Identify all docs referencing changed symbols, endpoints, flags, or workflows.
   Check setup guides, architecture overviews, and release notes.
2. Verify reality first:
   Execute code or tests to confirm how the feature actually works before writing docs.
   Never document assumed behavior without test confirmation.
3. Update specific sections:
   Modify only affected documentation sections using concise, semantic sentences.
   Preserve existing tone, formatting, and file organization.
4. Audit for stale claims:
   Search for obsolete prerequisites, removed parameters, or deprecated workflows and remove them.
   Flag any unverified assertions for team review.
5. Check examples:
   Verify that all code snippets, curl commands, and sample configurations in the documentation run cleanly.
   Test sample commands against current code.
6. Review diff:
   Check documentation diffs alongside code diffs to ensure consistency.
   Confirm that all links between doc files resolve.

## Output / handoff
- Updated documentation files matching current code implementation.
- Summary of documentation changes and list of any remaining unverified claims.

## Verification and guardrails
- Never document hypothetical, unmerged, or unverified functionality as working truth.
- Do not rewrite unrelated documentation sections or alter overall documentation styling arbitrarily.
- Every code example included in documentation must be verified against actual implementation.
- Keep documentation changes atomic with the corresponding code changes.
