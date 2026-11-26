# Multi-agent flow: captain and crewmates

Use this when you have two or more independent changes and want them built in parallel. For a single change, just ask your agent to do it directly.

## How it works

- **You talk to the captain.** This is your normal agent (Claude, Codex or another). It plans, dispatches and monitors. It does not write the code itself.
- **Each crewmate gets its own branch and worktree.** `crew` creates them and runs an agent in a Herdr workspace, a Rex session or a tmux session.
- **Crewmates commit and never push.** Each one commits on its own branch with a Conventional Commit message.
- **You review and ship each branch.** There is no shared integration branch.
- **Native subagents are for reading.** Exploring, reviewing and research can use native subagents. Use `crew` only for tasks that edit, test and commit.

## What you need

- `crew` and `git-wt` on your PATH (installed by `./setup.sh`).
- One agent CLI: `claude`, `codex`, `opencode`, `kimi`, `amp` or `commandcode`.
- A terminal backend: Herdr, Rex or tmux. Crew detects it, or set `CREW_BACKEND=herdr|rex|tmux`.
- Run it from inside the repo you want to change.

## Example: two features at once

Goal: add a dark mode toggle and fix the login redirect bug, in the same repo.

1. **Start your agent in the repo**, inside Herdr, Rex or tmux.

   ```bash
   cd ~/code/my-app
   claude        # or: codex
   ```

2. **Ask the captain for parallel work.** Say what each task is and that they are independent.

   ```text
   Build these two in parallel with crew:
   1. Add a dark mode toggle in settings (files: src/settings, src/theme).
   2. Fix the login redirect bug (files: src/auth).
   They don't share files. Run the tests for each.
   ```

3. **The captain splits and dispatches.** For each task it writes a short brief (goal, acceptance criteria, files it may touch, test command) and runs:

   ```bash
   crew new "<brief for dark mode>"
   crew new "<brief for login fix>"
   ```

   Crew names each branch from the task and prints it (`-> branch: feat-dark-mode`). The captain tells you each branch and where to watch it.

4. **Watch, or step away.** The captain stops after dispatch and reports when you ask.

   ```bash
   crew status              # who is running or done, commits, last log line
   crew attach <branch>     # jump into a crewmate's session
   crew logs <branch> -f    # follow its output
   crew watch               # notify when a crewmate finishes or is blocked
   ```

5. **Review each finished branch on its own.** Ask your agent to run `/review-diff` on it, or look yourself:

   ```bash
   git diff main...<branch>
   ```

   A crewmate that is stuck prints `BLOCKED: <reason>` and stops. Answer it, then re-run with `crew new -b <branch> --resume "<follow-up>"`.

6. **Ship each branch separately.** From the branch's worktree:

   ```bash
   /ship-gate        # or: gate run --ship
   ```

   Gate runs your checks, pushes that branch and opens a draft PR. You merge the PR. Nothing is pushed to `main` directly.

7. **Clean up after merging.**

   ```bash
   crew cleanup <branch>
   ```

   `crew stop <branch>` stops a session but keeps its files and logs.

## Choose the engine and model

```bash
crew new --codex "<task>"                  # use Codex for this crewmate
crew new --claude --profile deep "<task>"  # use Claude with the deep tier
crew new --profile fast "<task>"           # cheap tier for mechanical edits
```

Profiles are `fast`, `standard`, `deep` or `auto`. Run `agent-route "<task>" --files N` to get a suggestion.

## Naming Codex or Claude directly

If you say "use Codex for this", the captain launches that engine headlessly in its own worktree instead of using `crew`. The worker still commits on its own branch and never pushes, and you review and ship it the same way.

## Rules

- Tasks must not share files. If two tasks touch the same file, merge them into one task or run them one after the other.
- Three to five crewmates at once is the practical maximum, because review becomes the bottleneck.
- Crewmates never push, deploy or use sudo. Only you ship.
- You can push feature branches. Direct and force pushes to `main`, `master`, `dev`, `develop`, `staging` and `trunk` are blocked.
- When a branch is merged, delete it.

## When not to use it

- A single change: do it directly.
- Read-only work such as review, research or exploring the code: use a native subagent.
- Tasks that need the same files: do them in order.
