---
name: crew
description: Use when orchestrating several agents in parallel - split a request into independent features, dispatch one crewmate per feature with the `crew` CLI, then stop and report status on request (not continuously) so ready branches can be reviewed and shipped.
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
   `standard`, and Qwen3.7-Max for `deep`; its headless (`-p`) mode cannot write without `--yolo`,
   so tasked crewmates run `--yolo` bounded by the required `CREW_MANAGED`-gated guard hook
   (`crew-guard.sh`), which denies push/sudo/hard-reset/clean/rm. Crew refuses to launch a
   CommandCode crewmate if that hook is missing. Antigravity uses `gemini-3.8-flash-low` for `fast`,
   `gemini-3.8-flash-high` for `standard`, and `gemini-3.1-pro-high` for `deep` under bounded
   `--dangerously-skip-permissions`. Codex uses `gpt-6-luna` with reasoning effort `low` for
   `fast`, `gpt-6.1-terra` for `standard`, and `gpt-6.1-sol` for `deep`; reasoning effort is a
   separate Codex setting and must not be appended to the model slug.
   Tasked Codex, Claude, and Kimi workers use their worker-only permission bypass modes.
   OpenCode and Amp use their existing automated execution policies.
4. **Monitor.** Use `crew watch`, `crew status`, and `crew logs <branch>` to follow workers through completion.
   Resolve routine questions and changes in scope through the orchestrator.
   Bring the user decisions requiring their authority.
5. **Review and verify.** Inspect the worker’s diff and run the applicable checks.
   Report the result to the user from the orchestrator session.

## Rules
- Never push or merge. Hand ready branches to the user to review (`/review-diff`) and ship
  (`/ship-gate`). A crewmate `done:0` means it committed, not that the work is correct.
- Choose independent features. If a plan needs shared-file coordination, say so and sequence it
  rather than dispatching colliding crewmates.
- One crewmate per branch. Re-running `crew new` on an existing branch reuses its session.
- Tear down finished processes with `crew stop <branch>`.
- Use `crew stop -D <branch>` only after verifying that the work is merged or disposable and obtaining approval to delete the worktree and branch.
