# Orchestrator-first Git workflow

1. Start on one task branch, for example `task/142-orchestration`. Record the task ID, acceptance checks, dependencies, and file ownership.
2. Keep small changes on that branch. Use read-only reviews without creating worker branches. For independent implementation tasks, launch workers with explicit names such as `crew new -b agent/142-backend --codex "Implement the assigned handler and run its tests"`.
3. Record task progress as planned, running, blocked, in review, approved, or completed. Use `crew status` and `crew logs` for worker progress. After interruption, inspect the worktree and logs before running `crew new --resume -b <branch> "<task>"`.
4. Review worker diffs and verification from the orchestrator session. Stage and commit accepted changes, then integrate worker commits into the task branch. Preserve worker commit ancestry if you want to use automatic cleanup.
5. Commit `.gate.sh` with deterministic test and lint commands and any required security checks. Run `gate run`. Inspect retained worktrees when a check fails or review proposes changes. Integrate accepted fixes and rerun.
6. With authorization, run `gate run --ship` to publish the verified task commit and open a draft PR. Human approval and required GitHub checks control merging.
7. `crew stop <branch>` stops the session and retains its worktree and logs. From the integration branch, `crew cleanup <branch>` only removes a clean worktree whose commits are reachable from that branch.

## Permissions and setup

Crew's tasked launch and Gate skip automatic setup hooks. Prepare dependencies explicitly using non-secret fixtures. A normal `git wt new` runs the configured setup hook and returns failure when setup fails, retaining the worktree for diagnosis.

Git worktrees share metadata and local hooks can be bypassed. Run workers with restricted provider permissions and credentials that cannot publish to GitHub. Use a separate restricted clone or runner when the worker needs a strong filesystem or credential boundary. Codex uses workspace-write and does not receive an extra grant for shared Git metadata. Headless providers may block when an operation requires interactive approval.

## GitHub rules

Repository admins should require pull requests, approving reviews, and the repository's CI status checks on the default branch and any shared integration branches, including `dev` and `staging`. Block force pushes and deletion, and review the bypass list. Local guards provide immediate feedback, while GitHub rulesets enforce remote policy across tools and machines.
