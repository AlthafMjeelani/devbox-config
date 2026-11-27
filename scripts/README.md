# Scripts Dotfiles Package

> 📖 See [`docs/WORKFLOW.md`](../docs/WORKFLOW.md) for how `git-wt`, `crew`, and `gate` fit into
> the agentic workflow (parallel agents + ship gate playbooks).

GNU Stow package for personal CLI helpers. Commands live under `scripts/.local/bin/` and stow to
`~/.local/bin/` (already on `$PATH`); support data lives under `scripts/.local/share/`.

Install / update:

```bash
make stow-scripts     # or: make restow-scripts to pick up new files
```

## Contents

- `ai-usage` (`aiu` alias) - show usage limits and reset times for all installed coding agents, ranked by what to use first, with a "Use first" suggestion.
- `ai-account` - save and switch Claude Code and native Codex CLI logins without changing their shared settings or session history.
- `codex-status` - focused status for the active native Codex account, with JSON and watch modes.
- `codex-resets` - show earned rate-limit reset credits, which are separate from normal quota usage.
- `ai-branch-name` - turn a free-text task into one git branch name (AI, with a slug fallback); used by `crew` and `wt`.
- `git-wt` - sibling git worktree manager (see below).
- `crew` - tmux/herdr multi-agent orchestrator built on `git-wt` (see below).
- `gate` - local AI ship gate: validate in a disposable worktree, then push + PR (see below).
- `amp-global-sync` - sync the orb-safe skill/plugin subset into local Amp Personal repository checkouts without committing or pushing.

## ai-usage-bar - AI quota for Linux status bars

One-line or JSON output of the same view as the macOS menu bar, for waybar, tmux and similar. See `docs/LINUX-STATUSBAR.md`.

```bash
ai-usage-bar                   # plain line
ai-usage-bar --format waybar   # JSON for waybar
ai-usage-bar --format tmux     # tmux colors
ai-usage-bar --notify          # desktop notifications on changes
```

## env-check - audit env files and .gitignore

```bash
env-check [dir]          # ignored and untracked? example present? secrets in the example? keys in sync?
env-check [dir] --sync   # add missing keys from .env to .env.example with safe sample values
```

Exits 1 on any FAIL (tracked `.env`, not ignored, ignored example, real-looking secret in the example).

## guard-default-branch - no direct pushes to main

Blocks direct and force pushes to `main`, `master`, `develop`, `trunk`, `dev`, `staging` and a repo's default branch. Editing and committing are never blocked, and neither are pushes you run by hand: the Git hook only blocks when it detects an AI agent session. Used by the global Git `pre-push` hook and one Claude Code `PreToolUse` Bash hook.

```bash
guard-default-branch check-branch <name>    # exit 1 if <name> is protected
guard-default-branch claude-push-hook       # Bash hook: exit 2 when a git push targets a protected branch
guard-default-branch install-claude-hook    # merge the push hook into ~/.claude/settings.json
ALLOW_DEFAULT_BRANCH=1 git push ...         # one-off override
git config devbox.allowDefaultBranch true   # allow in one repo
```

## ai-account - Claude and Codex login profiles

Import the account that is currently logged in, then log in to a second account:

```bash
ai-account save claude personal
ai-account login claude work

ai-account save codex personal
ai-account login codex work
```

Switch by name, or omit the name to choose with `fzf`:

```bash
claude-account personal
claude-account                 # interactive picker
codex-account work
ai-account list
```

`aiu` shows every saved Claude and native Codex profile by name alongside the existing OpenCode profiles.
Claude's custom status line also shows the active profile as `acct:<name>`.
Codex does not support a custom status-line account field, so use `ai-account current codex`; `codex-status` also labels its active-account output.

The profile files live under `~/.local/share/ai-accounts/` with mode `0600`.
Only `~/.claude/.credentials.json` or `~/.codex/auth.json` is swapped, so the normal settings and sessions remain shared.
The active credential is saved before every switch to retain refreshed tokens.
Switch only after existing sessions for that provider have exited, then start a new session.

## amp-global-sync - prepare Amp Personal Skills and Plugins

Keep the shared dotfiles skill directory as the canonical source while making portable behavior available in Amp orbs:

```bash
make amp-global-sync
```

The command clones or updates the Amp Personal Skills and Plugins repositories under `~/.cache/amp/repositories/`, validates the source configuration, and copies the managed subset.
It excludes the local-runner-only `crew` and `ship-gate` skills, excludes `.system`, copies only `proposal-writing/SKILL.md` because global Amp Skills do not serve its binary DOCX assets, and installs only the custom `workflow-guardrails.ts` plugin.
It refuses to overwrite dirty checkouts or unmanaged entries with the same name, then prints the pending Git status and diff summary.
It never commits or pushes.

## git-wt - parallel worktrees for agentic development

Runs coding agents (opencode, Claude, etc.) in parallel without them clobbering
each other, by giving each task/branch its own isolated checkout. Worktrees are
created as a **sibling** of the main repo, never nested inside it:

```text
~/dev/github.com/you/myrepo/                 <- main worktree
~/dev/github.com/you/myrepo.worktrees/foo    <- linked worktree for branch "foo"
~/dev/github.com/you/myrepo.worktrees/bar    <- linked worktree for branch "bar"
```

Keeping them outside the repo means they never get committed, indexed, or
scanned by tooling.

### Usage

Invoke as a git subcommand (`git wt ...`) or directly (`git-wt ...`):

```bash
git wt new <branch> [<start-point>]   # create a worktree (creates branch if new)
git wt list                           # list worktrees for this repo
git wt path <branch>                  # print the worktree path
git wt rm <branch> [-D] [--force]     # remove worktree (-D also deletes branch)
git wt prune                          # prune stale worktree metadata
git wt help
```

`new` auto-detects: if the branch already exists it is attached; otherwise a new
branch is created from `<start-point>` (default: `origin/HEAD`, else current HEAD).
The base `.worktrees` directory is auto-created and auto-removed when empty.

#### Post-create hook

If an executable `.worktrees-setup` exists at the **main repo root**, `git wt new`
runs it inside the freshly-created worktree - handy for copying `.env`, installing
deps, or warming a build cache. It runs with the new worktree as its working
directory, receives the branch name as `$1`, and the main repo root in
`$GIT_WT_MAIN`. Skip it for one run with `git wt new <branch> --no-setup`.

```bash
# example .worktrees-setup
#!/usr/bin/env bash
cp "$GIT_WT_MAIN/.env" . 2>/dev/null || true
[ -f package.json ] && npm ci
```

### `wt` shell function (cd support)

An external binary cannot change the parent shell's directory, so a `wt` zsh
function in `zsh/.config/zsh/.aliasrc` wraps `git-wt` to add `cd`. It is
**task-first**: describe the work and the branch is AI-named for you (via
`ai-branch-name`), so you don't have to invent a name:

```bash
wt "refactor the auth module"   # AI-name a branch, create the worktree + cd in
wt foo                          # cd into existing worktree/branch "foo" (no AI)
wt -b feat/foo                  # create/reuse an explicit branch, then cd
wt -b feat/foo main             # explicit branch from start-point "main", then cd
wt list                         # pass-through to `git wt list` (also: rm, path, prune, help)
```

Tab completion (`_wt`) offers subcommands, `-b`, and existing worktrees.

### Typical agentic flow

```bash
wt feature-x                 # spin up + enter an isolated checkout
opencode                     # let an agent work here
# ... in another terminal ...
wt feature-y                 # a second agent, fully isolated
# when done:
cd ~/dev/github.com/you/myrepo
git wt rm feature-x -D       # remove worktree + branch
```

## crew - tmux/herdr multi-agent orchestrator

Crew runs each worker in its own Git worktree and terminal session.
Backend selection prefers herdr inside herdr, Rex inside Rex, and tmux elsewhere when available.
`CREW_BACKEND=herdr|rex|tmux` overrides detection.
Crew records the selected backend for later status, attachment, and cleanup.

Tasked workers run headlessly and report their logs and exit status.
Codex, Claude, and Kimi use permission bypass for the delegated process.
OpenCode and Amp use their automated execution policies, and CommandCode retains its required Crew hook.
A branch-only launch starts the engine interactively.
The orchestrator reviews results and handles decisions and outward-facing actions.

Headless Claude runs use its realtime event stream to log concise agent updates and tool activity
while omitting thinking and verbose tool results, so `crew status` and `crew logs -f` remain useful
before the task finishes.
Set `CREW_AMP_SETTINGS` only when supplying equivalent execute-mode settings.
The guard plugin must be installed at Amp's system plugin path via `make restow-amp`.

Assign an explicit worker branch tied to the task before dispatch.

```bash
crew new -b agent/142-docs --claude "Update the README examples"
crew status
crew logs agent/142-docs -f
crew attach agent/142-docs
crew stop agent/142-docs
crew cleanup agent/142-docs  # from the integration branch after committing and integrating the work
```

Profiles explicitly select the model for every engine rather than inheriting machine defaults:

| Profile | Use for | OpenCode | Claude | Codex | Kimi Code | Amp | CommandCode |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `fast` | Mechanical docs, formatting, boilerplate | Luna Fast | Haiku | Luna Fast | K2.7 Code | low | DeepSeek V4 Flash |
| `standard` (default) | Normal implementation and tests | Terra | Sonnet | Terra | K2.7 Code | medium | DeepSeek V4 Pro |
| `deep` | Architecture-sensitive work, concurrency, security, difficult debugging | Sol | Opus | Sol | K3 | high | Qwen3.7-Max |

Kimi is opt-in with `--kimi`; OpenCode remains the default engine.
Kimi tasks run headlessly on both tmux and Herdr because Kimi Code does not provide a documented
way to seed a prompt into its interactive TUI.
Interactive Kimi sessions are still available with `crew new -b <branch> --kimi`.
Amp is opt-in with `--amp` and tasked Amp runs use execute mode on both backends, fixing the TUI
remaining open after a Herdr crewmate finishes.
Interactive Amp remains available with `crew new -b <branch> --amp`.
Amp `deep` uses `high`; Crew never selects `ultra` automatically.
CommandCode headless mode is read-only and uses the required Crew guard hook.
For attended provider approvals, use `crew new -b <branch> --commandcode` without a task.

crew is **scoped per repository**: sessions/workspaces are named `crew_<repo-key>_<branch>` and
state lives in `~/.local/state/crew/<repo-key>/<branch>/` (`branch`, `worktree`, `session`, `task`,
`engine`, `profile`, `model`, `log`, `status`, `backend`, and on herdr `workspace_id`/`pane_id`).
The repo key is derived from the shared `--git-common-dir`, so it is stable from the
main repo or any of its worktrees. `crew ls`/`status`/`watch` show only the current repo's
crewmates (two repos can each run a `feat-x` without colliding); pass `--all` for the cross-repo
view. This is what `crew status`, `crew logs`, and `crew watch` read and `crew stop` retains. Run `crew watch`
in its own pane for zero-token, event-driven alerts (bell + `notify-send`) the moment a crewmate
is ready or blocked - the push layer a chat agent cannot provide on its own. Tab completion (`_crew`)
offers subcommands, `new` flags, and live sessions for `attach`/`stop`. Prefer the captain?
`/crew "build A, B, C"` in OpenCode dispatches crewmates and reports on request (it does not poll
in a loop). `claude --tmux` / `claude --bg` are native alternatives if you prefer Claude Code's
own worktree/background orchestration.

## gate - local AI ship gate

Gate validates the current task branch in a disposable worktree. Configure and commit deterministic test and lint commands in `.gate.sh`.

```bash
gate init --engine claude
gate status
gate run          # local review and verification
gate run --ship   # publish the verified commit and open a draft PR with authorization
```

Blocked worktrees remain available for inspection. Integrate any review fixes before retrying.
See the [orchestrator-first workflow](../docs/ORCHESTRATOR-FIRST.md) for setup and publishing details.

## agentic-init - scaffold agentic files into a repo

```sh
agentic-init [dir] --dry-run   # show what would be created
agentic-init [dir]             # create AGENTS.md, CLAUDE.md link, docs/*, .env.example (never overwrites)
agentic-init [dir] --check     # list missing files and leftover TODO markers
```

## agent-route - model and effort per task

```sh
agent-route "debug race condition in auth refresh" --files 6   # tier, effort, launch command per engine
agent-route --tier "fix typo"                                  # just the tier (used by crew --profile auto)
```
