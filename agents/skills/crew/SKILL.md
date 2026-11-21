---
name: crew
description: Use when orchestrating several agents in parallel - split a request into independent features, dispatch independent workers with the `crew` CLI, monitor them, and integrate their results into one task branch.
compatibility: Requires the local Crew, git-wt, Herdr, Rex, or tmux, and agent CLI setup. In Amp orbs, use native Amp delegation or separate orb threads instead.
---
## What it is
`crew` runs workers in isolated Git worktrees with a Herdr workspace, Rex session, or detached tmux session per worker.
It records the backend at dispatch so monitoring and cleanup can run from another terminal.
A job with a task runs headlessly and reports through its log and exit status.
A branch-only launch starts the engine interactively.

## When to use
The user asks to build 2-3 (or more) independent features/fixes at once, or to fan a batch of
similar changes across a codebase. If the work is a single change, do it directly instead - crew
is overhead you only want for genuine parallelism.

Before dispatching, verify that `crew`, `git-wt`, the selected agent CLI, and a supported Herdr, Rex, or tmux backend are available.
This is a local-runner workflow and must not be bootstrapped inside an Amp orb.
In an orb, use the native delegation tools available to Amp for independent work, or create separate orb threads when each task needs its own checkout.

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
   - Orchestrator stages and commits: yes
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
   crew new -b agent/<task-id>-<role> "<self-contained task>"
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
4. **Make workers visible.** Announce each branch and its session or workspace label after launch.
   The user can open it from the terminal sidebar or run `crew attach <branch>`.
   Keep the orchestrator in the original pane and leave finished worker displays available for inspection.
5. **Monitor.** Use `crew watch`, `crew status`, and `crew logs <branch>` to follow workers through completion.
   Resolve routine questions and changes in scope through the orchestrator.
   Bring the user decisions requiring their authority.
6. **Review and verify.** Inspect the worker’s diff and run the applicable checks.
   Report the result to the user from the orchestrator session.

## Rules
- The orchestrator reviews worker diffs, commits accepted changes, and integrates them into one task branch before validation.
- Use `--resume` for a reviewed existing worktree.
- `crew stop <branch>` stops the session and preserves files and logs.
- Run `crew cleanup <branch>` from the integration branch after work is clean and its commits are reachable.
