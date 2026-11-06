---
name: context-compaction
description: Use when preparing a loss-aware pre-compaction checkpoint before context resets or summarizing state to restore execution afterwards.
---

# Context Compaction

## When to use
- Approaching conversation token limits or prior to invoking compaction mechanisms.
- Pausing long-running implementation sessions to prevent state loss.
- Restoring and validating working state immediately after a context compaction or session reset.

## Inputs to gather
- Original goal, accepted scope, and agreed-upon acceptance criteria.
- Architecture decisions, constraints, and confirmed trade-offs.
- Current git status: modified, staged, unstaged, and newly created files.
- Last executed commands, test results, and unresolved errors.
- The single next immediate action required.

## Procedure
1. Pre-compaction capture:
   Run git status and diff summaries to confirm current on-disk state.
   Identify all files touched, tests added, and pending uncommitted edits.
2. Populate the structured checkpoint template:
   Use the format defined in [checkpoint-template.md](references/checkpoint-template.md).
   Record the task identity, accepted scope, and verified technical decisions.
3. Document unresolved state:
   Record active blockers, failing tests, and exact error messages.
   Note any hypotheses that were disproven to avoid repeating failed attempts.
4. Define immediate resumption action:
   Explicitly state the exact command or file edit to execute upon resumption.
   Include target file path and line number if applicable.
5. Emit the checkpoint:
   Output the checkpoint as a clean, self-contained markdown summary block.
   Ensure all critical context is persisted.
6. Post-compaction restore:
   Upon session resumption or context reset, immediately read the latest checkpoint.
   Do not guess missing context.
7. Post-compaction verification:
   Re-verify repository status and git diffs against the checkpoint before issuing new edits.
   Confirm that working tree state matches the checkpoint baseline.

## Output / handoff
- Loss-aware compaction checkpoint matching [checkpoint-template.md](references/checkpoint-template.md).
- Immediate actionable next step clearly identified for post-compaction execution.

## Verification and guardrails
- Checkpoint must contain zero credentials, API keys, customer data, or raw secret tokens.
- Never assume compaction preserved unspoken mental context; write all critical facts down.
- Re-validate on-disk git state before resuming code changes after compaction.
- If on-disk state contradicts the checkpoint, halt and reconcile with current reality.
