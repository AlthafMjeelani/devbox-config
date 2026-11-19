---
name: branch-cleanup
description: Use when merging a feat/fix/chore branch into the default branch (always rebase first, then fast-forward) and right after a successful rebase or merge, to delete the finished local and remote branch safely.
---
## Merge policy: rebase first, always
- Every merge into the default branch is a rebase followed by a fast-forward. Never create a merge commit unless the user explicitly asks for one.
- Update the default branch first: `git fetch origin && git switch <default> && git pull --ff-only`.
- Rebase the topic branch onto it: `git switch <branch> && git rebase <default>`. If the branch is checked out in another worktree, run the rebase there.
- On conflicts, resolve them, `git add` the files and `git rebase --continue`. If the resolution is unclear, run `git rebase --abort` and ask.
- Re-run the project's lint, tests and build on the rebased branch before merging.
- Fast-forward the default branch: `git switch <default> && git merge --ff-only <branch>`. If `--ff-only` fails, rebase again; never fall back to a plain merge.
- If the branch was already pushed, update it with `git push --force-with-lease` (never plain `--force`) before or instead of merging through a PR.
- Push `dev` or `staging` directly. Push any other default branch (`main`, `master`, `develop`) only when the user asked, and let them run it if the agent's push is blocked.
- Then run the cleanup procedure below in the same session.

## Procedure
- Always run this after every successful merge or rebase of a topic branch; deleting the finished branch is the default, no extra ask needed.
- Run only after a rebase or merge into the default branch (main/master/develop) has succeeded. Never delete before that.
- Identify the default branch: `git symbolic-ref --short refs/remotes/origin/HEAD` (fall back to `main`).
- Only delete topic branches with prefixes `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`, `perf/`, `ci/`, `build/`, `hotfix/`. Never delete the default branch, `dev`, `staging`, `develop`, `release/*`, or the branch you are currently on.
- Switch to the default branch and update it: `git checkout <default> && git pull --ff-only`.
- Verify the work landed before deleting:
  - Merge or fast-forward: `git branch --merged <default>` lists the branch.
  - Squash or rebase merge: `git branch --merged` may not list it. Check `git cherry <default> <branch>` shows no `+` lines, or the PR is merged (`gh pr view <branch> --json state`).
  - If it cannot be confirmed, stop and ask. Do not use `git branch -D` to bypass this check unless the user says so.
- Delete locally with `git branch -d <branch>`.
- Delete the remote branch too when it exists and the merge is confirmed on the remote default branch (`git branch -r --contains` / PR merged): `git push origin --delete <branch>` (skip if the host already auto-deleted it; check `git ls-remote --heads origin <branch>`).
- Run `git fetch --prune` to drop stale remote-tracking refs.
- Worktrees: if the branch is checked out in a worktree, remove it first with `git worktree remove <path>`.
- Verify with `git branch -a` and report which branches were deleted and which were kept.

## Guardrails
- Delete the remote branch only after the default branch containing it is pushed; never delete the only remote copy of unpublished work.
- Never delete branches with unmerged commits, open PRs, or that someone else owns.
- Batch cleanup: list candidates with `git branch --merged <default>`, show them, and delete only the topic-prefixed ones after confirmation.
