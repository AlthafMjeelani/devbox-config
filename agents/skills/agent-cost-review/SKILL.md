---
name: agent-cost-review
description: Use when recording real session token metrics, tool call counts, retries, and estimated costs per verified task.
---

# Agent Cost Review

## When to use
- Concluding a multi-step task, milestone, or subagent workflow.
- Reviewing agent efficiency across repeated development workflows.
- Auditing session resource utilization when billing or usage metrics are exposed.

## Inputs to gather
- Real input, output, cache read, and cache write tokens reported by the tool or harness.
- Total count of tool invocations, retries, and command executions.
- Number of successful milestones verified and delivered.

## Procedure
1. Collect reported metrics:
   Extract token counts and invocation tallies directly from harness logs or command outputs.
   Record counts accurately without guesswork.
2. Audit tool call efficiency:
   Identify redundant calls, failed command retries, or overly broad file reads.
   Note instances where repetitive queries occurred.
3. Compute efficiency metrics:
   Calculate tool calls per verified milestone and observed token ratios.
   Assess whether subagent delegation was cost-effective.
4. Identify cost drivers:
   Flag runaway loops, noisy test outputs, or un-pruned context that inflated consumption.
   Document specific commands that produced excessive output.
5. Document findings:
   Compile an objective cost review separating known numbers from unobserved values.
   Use standard tabular or list formatting.
6. Suggest optimizations:
   Recommend specific search filters, prompt adjustments, or batching strategies for future runs.
   Highlight areas where caching or pruning could improve efficiency.

## Output / handoff
- Objective cost and efficiency report with real tool call counts and reported token metrics.
- Actionable recommendations for eliminating wasted operations in subsequent sessions.

## Verification and guardrails
- Never invent billing totals, dollar amounts, or credit numbers; mark missing metrics as Unknown.
- Do not prioritize cost savings over verification, correctness, or security.
- Distinguish between productive exploratory calls and wasteful repetitive retries.
- Report metrics objectively without speculative cost projections.
