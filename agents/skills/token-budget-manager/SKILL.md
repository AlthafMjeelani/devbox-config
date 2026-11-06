---
name: token-budget-manager
description: Use when setting task-specific soft token budgets, tracking real observed usage, and pruning redundant tool calls without compromising validation.
---

# Token Budget Manager

## When to use
- Starting complex, multi-step tasks that risk excessive context consumption.
- Managing long-running refactoring or research sessions.
- When tool outputs or context windows grow rapidly.

## Inputs to gather
- Current task scope and expected complexity.
- Observed input, output, and context token numbers from harness logs where available.
- Frequency and payload sizes of proposed tool executions.

## Procedure
1. Set soft budget expectations:
   Estimate the minimal number of tool calls and file inspections needed.
   Define milestone boundaries where context should be checked.
2. Establish pruning thresholds:
   Pause and summarize context when tool calls yield diminishing returns.
   Avoid re-reading files whose contents are already established.
3. Batch operations:
   Group related searches or inspections instead of issuing repetitive single-file queries.
   Combine sequential checks into cohesive scripts when appropriate.
4. Bound outputs:
   Always restrict log viewing and grep searches to necessary line ranges or specific patterns.
   Pipe noisy test commands through filtering tools while preserving errors.
5. Track actuals:
   Record real observed token metrics using [usage-report-template.md](references/usage-report-template.md).
   Treat missing metrics as unknown rather than zero.
6. Hard stop condition:
   If progress stalls after 3 similar attempts, halt, re-diagnose, and seek user input.
   Do not loop indefinitely on failing approaches.

## Output / handoff
- Task usage report documenting observed tool call counts, inspected files, and milestone efficiency.
- Recommendations for context pruning or subagent offloading if context exceeds comfort limits.

## Verification and guardrails
- Never invent credit, dollar, or token totals; report only metrics exposed by the environment.
- Never skip essential testing, security checks, or validation to save tokens.
- Treat unavailable billing data as unknown rather than zero.
- Prioritize correctness and engineering safety over token savings.
