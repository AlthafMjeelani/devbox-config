---
name: task-decomposition
description: Use when breaking complex features into minimal, independently verifiable milestones with explicit dependencies, risks, and checkpoints.
---

# Task Decomposition

## When to use
- Planning implementation of features spanning multiple files, modules, or services.
- Organizing complex refactors or multi-stage architectural migrations.
- When a task is too large to complete within a single context window or agent turn.

## Inputs to gather
- Accepted requirements, specifications, and architecture constraints.
- Existing codebase structure, module boundaries, and dependency relationships.
- Test suites available for validating intermediate milestones.

## Procedure
1. Identify natural boundaries:
   Partition work along architectural seams (data layer, business logic, API, UI).
   Ensure each partition has clearly defined interfaces.
2. Create vertical slices:
   Ensure each milestone delivers an independently verifiable, behaviorally complete capability.
   Avoid horizontal slices that leave the system in an untestable state.
3. Order by dependency:
   Schedule foundation work (schemas, domain models, contracts) before consumer integration.
   Ensure that prerequisite components are verified before dependent work begins.
4. Define milestone checkpoints:
   Specify exact acceptance criteria, files involved, and automated tests for each slice.
   Establish clear stopping points for user review.
5. Assess risk and reversibility:
   Tag high-risk milestones (database migrations, auth changes) and provide mitigation steps.
   Ensure high-risk changes can be rolled back safely.
6. Prune ceremony:
   Skip formal decomposition for trivial single-file edits or simple bug fixes.
   Keep milestone overhead proportionate to task complexity.

## Output / handoff
- Dependency-ordered roadmap with numbered milestones, target files, acceptance criteria, and verification commands.
- Clear checkpoints where the user or parent agent can review progress.

## Verification and guardrails
- Milestones must not have circular dependencies.
- Every milestone must leave the repository in a compiling, testable state.
- Do not plan micro-tasks that fragment work into tiny, un-verifiable steps.
- Re-evaluate the decomposition plan if implementation uncovers unexpected complexity.
