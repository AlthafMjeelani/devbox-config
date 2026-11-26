---
name: crew
description: Use when orchestrating several agents in parallel - split a request into independent features, dispatch one crewmate per feature with the `crew` CLI, then report status on request (not continuously).
compatibility: Requires the local Crew, git-wt, Herdr, Rex, or tmux, and agent CLI setup. In Amp orbs, use native Amp delegation or separate orb threads instead.
---
## What it is
`crew` runs multiple agents in parallel, each in its own `git wt` worktree with a Herdr workspace, Rex session, or detached tmux session per crewmate.
It records the backend at dispatch so monitoring and cleanup can run from another terminal.
A job with a task runs headlessly and reports through its log and exit status. A branch-only launch starts the engine interactively.
You are the **captain**: you plan, dispatch, and monitor - you do not write code yourself.
Each crewmate implements one feature and commits on its own branch. Crewmates never push; the user reviews and ships each ready branch.

## When to use
The user asks to build 2-3 (or more) independent features/fixes at once, or to fan a batch of
similar changes across a codebase. If the work is a single change, do it directly instead - crew
is overhead you only want for genuine parallelism.

Before dispatching, verify that `crew`, `git-wt`, the selected agent CLI, and a supported Herdr, Rex, or tmux backend are available.
This is a local-runner workflow and must not be bootstrapped inside an Amp orb.
In an orb, use the native delegation tools available to Amp for independent work, or create separate orb threads when each task needs its own checkout.

## Native subagents versus crew
Use native subagents, including Amp's `Task` tool, for parallel read-only exploration, review, research, or tightly coordinated subtasks that contribute to one main-agent result.
Use `crew` when each task should independently edit, test, and commit a shippable branch.
Native subagents share the parent workspace and are not a substitute for crew's Git worktree isolation. Do not dispatch concurrent editing subagents that may touch the same files.

## Dispatch routing
In herdr or Rex, use Crew by default and follow the direct delegation instructions in `agent-orchestration` when the user names Codex or Claude as the worker.
Follow the host’s native delegation path in an Amp orb.

## The protocol
1. **Split** the request into independent features. Each must be shippable on its own and must
   not fight another crewmate over the same files (crewmates do not coordinate shared edits).
   If two "features" touch the same core file, merge them into one task or sequence them.
2. **Name + brief** each feature: a short branch name (`feat-dark-mode`) and a crisp,
   self-contained task string. The crewmate has no other context, so use the evidence contract
   below. It does not need generic commit/push instructions - `crew` appends those.

   ```markdown
   ## Goal
   ## Desired behavior
   ## Acceptance criteria
   ## Out of scope
   ## Ownership boundary or likely touchpoints
   ## Allowed authority
   - May edit:
   - May add dependencies:
   - May commit: yes
   - May push/publish/deploy: no
   ## Verification
   - Focused command:
   - Broader command:
   - Manual scenario, if unavoidable:
   ## Relevant artifacts
   - Plan/spec:
   - Decisions/research/prototype verdict:
   ## Blocked by
   ```

   Use exact commands when they are known from repository evidence.
   If an authority boundary or prerequisite decision is unclear, resolve it before dispatch rather
   than asking the crewmate to guess.
3. **Dispatch** one crewmate per feature:
   ```bash
   crew new "<self-contained task>"
   # Or force a branch name:
   crew new -b <branch> "<self-contained task>"
   ```
   OpenCode is the default engine. Add `--claude`, `--codex`, `--kimi`, `--amp`, `--commandcode`, or
   `--antigravity` to select another engine. Kimi tasks use regular K2.7 for `fast` and `standard`, K3 for `deep`, and run
   headlessly because Kimi has no documented seeded-prompt interactive launch mode. Amp uses
   `low` for `fast` and `medium` for both `standard` and `deep`; Crew never selects Amp's costly
   `high` or `ultra` modes. CommandCode uses DeepSeek V4 Flash for `fast`, DeepSeek V4 Pro for
   `standard`, and Qwen3.7-Max for `deep`. CommandCode headless runs use the required Crew guard hook in read-only mode.
   Antigravity and Kimi use standard provider permissions.
   Codex uses the workspace-write sandbox, with no shared Git directory added to it.
   Use an attended branch-only session when a provider requires interactive approvals.
4. **Make crewmates visible.** Announce each branch and its session or workspace label after launch.
   The user can open it from the terminal sidebar or run `crew attach <branch>`.
   Keep the captain in the original pane and leave finished displays available for inspection.
5. **Stop and report.** After dispatch, stop. Report status when the user asks, using `crew status`, `crew watch`, and `crew logs <branch>`.
   Resolve routine questions yourself and bring the user decisions requiring their authority.
6. **Review and ship.** Each ready branch is reviewed on its own (`/review-diff`) and shipped separately (`/ship-gate`) by the user.

## Rules
- Crewmates commit on their own branch and never push. Each branch is reviewed and shipped on its own; there is no shared integration branch.
- Use `--resume` for a reviewed existing worktree.
- `crew stop <branch>` stops the session and preserves files and logs.
- Run `crew cleanup <branch>` from the default branch after the branch is merged and its commits are reachable.
