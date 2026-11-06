---
name: agent-orchestration
description: Plan and run multi-agent workflows - split a goal into independent tasks, spawn worker agents in isolated worktrees (crew, herdr, tmux or Rex), monitor, review and merge. Use for parallel work, agentic workflows, or when asked to orchestrate agents.
---

# Agent orchestration

You are the orchestrator. Workers do bounded tasks; you decompose, dispatch, verify and integrate.

## Flow
1. **Clarify the goal** and the definition of done (tests, build, behavior).
2. **Decompose** into tasks that touch disjoint files. If two tasks need the same file, sequence them or merge them. Keep each task completable in one sitting.
3. **Write a task brief** per worker (template below). One brief, one outcome.
4. **Dispatch** each worker into its own worktree and session:
   - `crew new "<task>" [--claude|--codex|--kimi|--amp|--commandcode] [--profile fast|standard|deep]` (headless, commits on its own branch, never pushes).
   - In Rex: `rex-agents spawn <name> -C <worktree> -- claude` then `rex-agents send <name> "<brief pointer>"`.
5. **Monitor** with `crew status` / `crew watch`, or `rex-agents watch`. Do not poll in a tight loop; wait for finished or blocked events.
6. **Review** every branch yourself: read the diff, run the tests. A worker's summary is not proof.
7. **Integrate** in dependency order; resolve conflicts; run the full suite on the merged result.
8. **Clean up**: stop sessions, remove worktrees you created (`crew stop <branch> -D`).

## Task brief template
```
Goal: <one sentence outcome>
Context: <files/modules involved, links>
Do: <steps or constraints>
Do not: push, force-push, rewrite history, touch files outside <paths>, use sudo
Done when: <tests pass / command output / file exists>
Report: write REPORT.md with what changed, what you verified, open questions
```

## Choosing a worker
- Fast, mechanical edits: `--profile fast`.
- Normal features and fixes: `standard`.
- Hard design, tricky bugs, security review: `deep`, or keep it yourself.
- Different engines are useful for a second opinion: have another engine review the first one's branch.

## Guardrails
- Max 3-5 workers at once; more makes review the bottleneck.
- Workers never push or deploy. You (or `gate`) ship after review.
- Stop and ask the user before irreversible actions: deleting data, publishing, spending money.
- If a worker is `blocked` (permission, question, auth), answer it or reassign; do not leave it waiting.
- Record the plan and status in a `PLAN.md` in the main worktree so a restart can resume.

See also: `agent-communication`, `rex-terminal`, `code-review`.
