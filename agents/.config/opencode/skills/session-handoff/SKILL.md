---
name: session-handoff
description: Use when creating or resuming structured task handoffs between agents, tools, or sessions with repository state verification.
---

# Session Handoff

## When to use
- Transferring work to another agent, teammate, or fresh session.
- Ending an interactive coding session with pending or partially completed tasks.
- Resuming work started in a previous session or by a different subagent.

## Inputs to gather
- Active branch name, working tree git status, and uncommitted diffs.
- Target milestone status (completed vs pending items).
- Command lines for running tests and verifying current changes.
- Critical architectural choices made during the active session.

## Procedure
1. Inspect the working directory:
   Check git status and git diff to capture all uncommitted changes.
   Identify newly added files, modified lines, and staged modifications.
2. Verify test status:
   Run current test suite and capture exact pass/fail counts.
   Record any flaky tests or known unrelated failures.
3. Formulate the handoff record:
   Document task objective, accomplished milestones, pending items, and active hazards.
   List files modified and why changes were made.
4. Highlight uncommitted changes:
   Specify why modifications remain uncommitted and what remains to be done.
   Explicitly warn of any incomplete refactoring steps.
5. On resumption:
   Read the handoff document carefully.
   Run git status to verify the working tree has not drifted.
   Re-run baseline tests to establish a verified starting state.
6. Acknowledge handoff:
   Report verified state and proceed with the designated next milestone.

## Output / handoff
- Structured handoff document with git snapshot, milestone progress, and verified next steps.
- Clear instructions on how to continue without re-discovering existing facts.

## Verification and guardrails
- Never commit or stash working tree modifications without explicit user instruction.
- Do not claim tests passed without running them during handoff generation.
- Confirm all file references in the handoff match valid paths on disk.
- Never include sensitive tokens or customer data in handoff records.
