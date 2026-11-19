---
name: agent-orchestration
description: Plan and run multi-agent workflows - split a goal into independent tasks, spawn worker agents in isolated worktrees (crew, herdr, tmux or Rex), monitor, review and merge. Use for parallel work, agentic workflows, or when asked to orchestrate agents.
---

# Agent orchestration

You are the orchestrator. Workers do bounded tasks; you decompose, dispatch, verify and integrate.

This flow starts automatically whenever a task involves more than one agent (Codex, crew, subagents, parallel workers); the user does not need to ask for it.
If the goal, the split, the worker choice or the safety of a step is unclear, ask the user before dispatching.

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

## Delegating to Codex
When the user says to give, ask or hand a task to Codex, you stay the orchestrator and Codex does the work.
The user's request is the authorization for `--yolo`; never add it otherwise.

1. **Prepare**: for code changes, give Codex its own worktree and branch (`git worktree add ../<repo>-<topic> -b <type>/<topic>`).
   For one-off outputs (images, research, drafts), use a scratch directory.
   Put reference files (screenshots, specs) in that directory and attach images with `-i`.
2. **Brief**: write the brief with the template below to `BRIEF.md` in that directory.
   Name the exact output files Codex must create.
3. **Run** headless, in the background, with stdin closed (without `</dev/null` Codex waits for stdin and hangs):
   ```bash
   codex exec --yolo --skip-git-repo-check -C <dir> -i <ref.png> -o <dir>/codex-last.md "$(cat <dir>/BRIEF.md)" </dev/null > <dir>/codex.log 2>&1
   ```
   Add `-m <model>` only when `agent-route` says so.
   Image generation is built in (`codex features list | grep image_generation`); tell Codex to save the image into `<dir>`.
4. **Monitor**: wait for the background completion; for progress, read `<dir>/codex.log` or the newest `~/.codex/sessions/**/rollout-*.jsonl`.
   If nothing changes for about 10 minutes, check the process and stop it rather than waiting indefinitely.
5. **Review**: open the produced files (look at images, read the diff, run the tests).
   Codex's summary is not proof.
6. **Integrate**: apply or adapt the result in the main work, verify it end to end, then report what Codex produced and what you changed.
7. **Clean up**: remove worktrees you created once their branch is merged or abandoned.

Guardrails still apply under `--yolo`: the brief must forbid push, force-push, history rewrites, `sudo`, deleting files outside its directory and touching secrets.

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
