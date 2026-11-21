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
   - `crew new -b agent/<task-id>-<role> "<task>" [--claude|--codex|--kimi|--amp|--commandcode] [--profile fast|standard|deep]` (headless, reports changes for the orchestrator).
   - When the user names Codex or Claude as the worker, use direct delegation below. Otherwise use Crew.
   - Open one named worker session in Rex or workspace in Herdr for each task.
   - Crew chooses the current terminal backend automatically. Announce the worker name and the command the user can use to watch.
   - Keep the conversation in the original pane and keep worker output available after completion.
5. **Monitor** with `crew status` / `crew watch`, or `rex-agents watch`. Do not poll in a tight loop; wait for finished or blocked events.
6. **Review** every branch yourself: read the diff, run the tests. A worker's summary is not proof.
7. **Integrate when authorized** in dependency order and run the full suite on the integrated result.
8. **Clean up** when authorized. Keep worker sessions available while the user wants to inspect output.

## Delegating directly to Codex or Claude
Stay the orchestrator and launch the named engine headlessly.
Use standard provider permissions and give the worker a brief with scope, checks, and a report destination.

1. **Prepare**: for code changes, give the named worker its own worktree and branch (`git worktree add ../<repo>-<topic> -b <type>/<topic>`).
   For one-off outputs (images, research, drafts), use a scratch directory.
   Set `worker_dir` to the worktree and `run_dir` to an absolute directory for the brief and logs.
   Attach Codex reference images with `-i` when needed.
2. **Brief**: write `BRIEF.md` in `run_dir` using the template below.
   Assign the worker role explicitly and name the output files the worker must create.
3. **Launch** from a separate terminal session using a short launcher file in `run_dir`.
   Pass the engine, worker directory, and run directory as arguments to the launcher.
   The launcher reads the brief locally, displays output in the worker terminal, saves a log, and records the exit status.

   ```bash
   #!/usr/bin/env bash
   set -o pipefail
   engine=$1
   worker_dir=$2
   run_dir=$3
   cd "$worker_dir" || exit 1
   brief=$(cat "$run_dir/BRIEF.md") || exit 1
   case "$engine" in
     codex) command=(env CREW_MANAGED=1 codex -a never exec --sandbox workspace-write -o "$run_dir/result.md" "$brief") ;;
     claude) command=(env CREW_MANAGED=1 claude -p --verbose --output-format stream-json "$brief") ;;
     *) exit 2 ;;
   esac
   "${command[@]}" </dev/null 2>&1 | tee "$run_dir/worker.log"
   status=$?
   printf '%s\n' "$status" > "$run_dir/exit-status"
   exit "$status"
   ```

   Use the matching terminal skill and a unique, descriptive `worker_label`.

   - **Rex**: Run `rex new --cwd "$worker_dir" --keep-open --json "$worker_label" -- bash "$run_dir/worker.sh" "$engine" "$worker_dir" "$run_dir"`. Record the returned session ID.
   - **Herdr**: Run `herdr workspace create --cwd "$worker_dir" --label "$worker_label" --no-focus`. Extract `.result.root_pane.pane_id` and pass a short quoted launcher command using `herdr pane run "$pane_id" "$(printf '%q ' bash "$run_dir/worker.sh" "$engine" "$worker_dir" "$run_dir")"`.
   - In other terminals, use the available session backend or run the launcher in a separate terminal.

   Report the session or workspace label as soon as the launch succeeds.
   Add the model flag only when `agent-route` calls for it.
   For a Codex scratch task outside Git, add `--skip-git-repo-check`.
4. **Monitor** the session and `worker.log` until `exit-status` appears.
   Read Codex's final message from `result.md` or Claude's result event from the stream log.
   If progress stalls, inspect the terminal and resolve or surface the blocker.
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
