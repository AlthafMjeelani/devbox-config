---
name: agent-orchestration
description: Plan and run multi-agent workflows - split a goal into independent tasks, spawn worker agents in isolated worktrees (crew, herdr, tmux or Rex), monitor, review and merge. Use for parallel work, agentic workflows, or when asked to orchestrate agents.
---

# Agent orchestration

You are the orchestrator. Workers do bounded tasks; you decompose, dispatch, verify and integrate.

This flow starts automatically whenever a task involves more than one agent (Codex, crew, subagents, parallel workers); the user does not need to ask for it.
Resolve routine dispatch decisions yourself and bring the user decisions that require their authority.

## Flow
1. **Clarify the goal** and the definition of done (tests, build, behavior).
2. **Decompose** into tasks that touch disjoint files. If two tasks need the same file, sequence them or merge them. Keep each task completable in one sitting.
3. **Write a task brief** per worker (template below). One brief, one outcome.
4. **Dispatch** each worker into its own worktree and session:
   - `crew new "<task>" [--claude|--codex|--kimi|--amp|--commandcode] [--profile fast|standard|deep]` (headless, commits on its own branch, never pushes).
   - When the user names Codex or Claude as the worker, use direct delegation below. Otherwise use Crew.
   - Crew chooses herdr, Rex, or tmux automatically. Load the matching terminal skill when controlling terminal sessions directly.
5. **Monitor** with `crew status` / `crew watch`, or `rex-agents watch`. Do not poll in a tight loop; wait for finished or blocked events.
6. **Review** every branch yourself: read the diff, run the tests. A worker's summary is not proof.
7. **Integrate when authorized** in dependency order and run the full suite on the integrated result.
8. **Clean up** finished sessions and remove worktrees when authorized.

## Delegating directly to Codex or Claude
Stay the orchestrator and launch the named engine headlessly.
Use the authorized permission bypass on the delegated process, and give the worker a brief with scope, checks, and a report destination.

1. **Prepare**: for code changes, give the named worker its own worktree and branch (`git worktree add ../<repo>-<topic> -b <type>/<topic>`).
   For one-off outputs (images, research, drafts), use a scratch directory.
   Set `worker_dir` to the worktree and `run_dir` to an absolute directory for the brief and logs.
   Attach Codex reference images with `-i` when needed.
2. **Brief**: write `BRIEF.md` in `run_dir` using the template below.
   Assign the worker role explicitly and name the output files the worker must create.
3. **Run** headless, in the background, with stdin closed (without `</dev/null` Codex waits for stdin and hangs):
   ```bash
   codex exec --dangerously-bypass-approvals-and-sandbox -C "$worker_dir" -o "$run_dir/result.md" "$(cat "$run_dir/BRIEF.md")" </dev/null > "$run_dir/worker.log" 2>&1 &
   # Claude uses the worktree as its working directory.
   (cd "$worker_dir" && claude -p --dangerously-skip-permissions "$(cat "$run_dir/BRIEF.md")") </dev/null > "$run_dir/result.md" 2> "$run_dir/worker.log" &
   ```
   Add `-m <model>` only when `agent-route` says so.
   For a Codex scratch task outside Git, add `--skip-git-repo-check`.
4. **Monitor**: wait for the background completion; for progress, read the worker log or the engine run transcript.
   If nothing changes for about 10 minutes, check the process and stop it rather than waiting indefinitely.
5. **Review**: open the produced files (look at images, read the diff, run the tests).
6. **Integrate**: apply or adapt the result in the main work, verify it end to end, then report what the worker produced and what you changed.
7. **Clean up**: remove worktrees you created once their branch is merged or abandoned.

The brief reserves push, deployment, history rewrites, destructive actions, and access to secrets for the orchestrator.
Permission bypass gives the worker the process account’s access. Use OS-level isolation when that access must be constrained.

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
