---
name: branch-cleanup
description: Use after a feat/fix/chore branch is successfully rebased or merged into the default branch, to delete the finished local and remote branch safely.
---
## Procedure
- Run only after a rebase or merge into the default branch (main/master/develop) has succeeded. Never delete before that.
- Identify the default branch: `git symbolic-ref --short refs/remotes/origin/HEAD` (fall back to `main`).
- Only delete topic branches with prefixes `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`, `perf/`, `ci/`, `build/`, `hotfix/`. Never delete the default branch, `develop`, `release/*`, or the branch you are currently on.
- Switch to the default branch and update it: `git checkout <default> && git pull --ff-only`.
- Verify the work landed before deleting:
  - Merge or fast-forward: `git branch --merged <default>` lists the branch.
  - Squash or rebase merge: `git branch --merged` may not list it. Check `git cherry <default> <branch>` shows no `+` lines, or the PR is merged (`gh pr view <branch> --json state`).
  - If it cannot be confirmed, stop and ask. Do not use `git branch -D` to bypass this check unless the user says so.
- Delete locally with `git branch -d <branch>`.
- Delete the remote branch only if it exists and the user has approved remote deletion: `git push origin --delete <branch>` (skip if the host already auto-deleted it; check `git ls-remote --heads origin <branch>`).
- Run `git fetch --prune` to drop stale remote-tracking refs.
- Worktrees: if the branch is checked out in a worktree, remove it first with `git worktree remove <path>`.
- Verify with `git branch -a` and report which branches were deleted and which were kept.

## Guardrails
- Remote deletion is outward-facing: confirm first unless the user already asked for it.
- Never delete branches with unmerged commits, open PRs, or that someone else owns.
- Batch cleanup: list candidates with `git branch --merged <default>`, show them, and delete only the topic-prefixed ones after confirmation.
