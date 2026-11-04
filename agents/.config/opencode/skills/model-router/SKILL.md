---
name: model-router
description: Use when matching task complexity, risk, and cognitive load to capable available models and reasoning effort without unwarranted escalation.
---

# Model Router

## When to use
- Planning multi-stage tasks involving distinct skill requirements (research, architecture, coding, documentation).
- Configuring subagents with appropriate model tiers.
- Deciding whether high reasoning effort is genuinely required for a specific sub-problem.

## Inputs to gather
- Task classification: exploratory, architectural, routine implementation, testing, or documentation.
- Available models configured in the local harness or `models.json`.
- Inherent risk: concurrency, security, migrations, or ambiguous requirements versus trivial edits.

## Procedure
1. Analyze task risk and complexity:
   Assess whether the task involves architectural design, concurrency, security, or simple updates.
   Categorize task into high-reasoning, standard implementation, or fast research.
2. Match to model tier:
   Assign high-reasoning models for distributed state, concurrency, security boundaries, and tricky bugs.
   Assign standard capable models for routine feature implementation, unit test writing, and refactoring.
   Assign fast/economical models for file search, documentation updates, and research lookups.
3. Verify available models:
   Inspect local environment settings or models configuration without assuming uninstalled models exist.
   Never reference models that cannot be run locally.
4. Scale reasoning effort:
   Enable high reasoning effort only for ambiguous, high-risk, or architectural tasks.
   Keep reasoning effort moderate or standard for well-understood, scoped coding tasks.
5. Avoid unnecessary escalation:
   Do not escalate routine tasks to maximum reasoning or expensive tiers when standard models suffice.
   Route subagent delegation to the most economical capable tier.

## Output / handoff
- Model routing plan: assigned model tiers, reasoning effort levels, and rationale for each task phase.

## Verification and guardrails
- Never claim unavailable or uninstalled models are available.
- Never downgrade security-critical or architecture-critical reviews to inadequate models.
- Comply with repository `models.json` mappings when configuring subagents.
- Ensure all configured models are validated by the local CLI tools.
