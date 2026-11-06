---
name: context-manager
description: Use when identifying the minimum relevant project or feature context, discovering entry points, and tracking authoritative working context across tasks.
---

# Context Manager

## When to use
- Starting work on an unfamiliar codebase, complex feature, or cross-cutting defect.
- When working context becomes cluttered, repetitive, or ambiguous.
- Before delegating bounded sub-problems to subagents.
- When performing task transitions or preparing clean working state.

## Inputs to gather
- Current user request, acceptance criteria, or defect description.
- Repository structure, package manifests, and architecture guidelines (`AGENTS.md`, `README.md`).
- Active file paths, entry points, and primary symbols involved.
- Relevant test commands, build scripts, and configuration boundaries.

## Procedure
1. Identify primary boundaries:
   Inspect top-level manifest files and build configurations to determine project runtime constraints.
   Identify whether the workspace contains monorepo packages, independent modules, or microservices.
2. Locate entry points:
   Use targeted filename searches (`find_by_name`, `glob`) before inspecting file contents.
   Identify HTTP routers, CLI commands, event listeners, or application bootstrap files.
3. Symbol discovery:
   Run targeted pattern searches (`grep_search`) for classes, functions, or error messages rather than dumping broad files.
   Record matching file paths and line ranges.
4. Establish authoritative sources:
   Distinguish primary application code and contracts from generated files, mocks, or documentation summaries.
   Treat production code and schemas as authoritative ground truth.
5. Maintain a minimal working set:
   Record only modified files, core interfaces, and current test commands in active working memory.
   Keep track of the immediate next milestone.
6. Prune stale context:
   Discard obsolete assumptions, resolved stack traces, and unneeded file contents as milestones complete.
   Avoid re-reading files whose contents are already established.

## Output / handoff
- Bounded context summary: list of authoritative files, entry points, core interfaces, and active test commands.
- Explicit list of verified facts versus unverified assumptions.

## Verification and guardrails
- Never dump entire multi-thousand-line files into context when targeted line ranges suffice.
- Verify that every cited file path exists in the working tree.
- Do not rely on generated artifacts or obsolete documentation as authoritative truth.
- Update working context only when new evidence is discovered.
