---
name: git-and-pr-workflow
description: Use when managing git workflows, reviewing status and diffs, crafting conventional commits, and drafting pull requests safely.
---

# Git and PR Workflow

## When to use
- Staging and committing completed, verified work increments.
- Preparing pull requests, branches, and changelogs.
- Inspecting repository state and ensuring uncommitted user work is never destroyed.

## Inputs to gather
- Current working tree status (`git status`, `git diff`).
- Active branch name, target base branch, and recent commit history (`git log -n 5`).
- Acceptance criteria and ticket reference for the delivered change.

## Procedure
0. Pick the branch (do not create unneeded branches):
   Run `git branch --show-current`.
   If on `main`, `master`, `develop` or the default branch, always create a new branch before the first edit.
   Name it by intent: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`, `docs/<topic>`, `refactor/<topic>`.
   Use `git switch -c <type>/<topic>`.
   If already on a local feature branch that is not yet merged or rebased into the default branch, do all the work on that same branch.
   Do not create another branch for each small change.
   Create a new branch from the default branch only when continuing here would affect others, for example:
   the branch is already pushed or shared, has an open PR under review, or holds unrelated work that would get mixed into the same PR.
   When unsure whether it affects others, ask instead of branching.
1. Audit working tree:
   Run `git status` and `git diff` to inspect every modified, added, and deleted file.
   Ensure that only files intended for the commit are staged.
2. Segregate changes:
   Ensure commits are atomic; do not combine unrelated refactors with feature work.
   Keep commit diffs focused and easy to review.
3. Preserve user work:
   Never discard unstaged modifications or untracked files without explicit user consent.
   Stop and ask before running operations that could overwrite uncommitted work.
4. Format commit message:
   Use Conventional Commits standard (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`).
   Provide a concise subject line followed by an explanatory body where needed.
5. Craft clear PR description:
   Summarize changes, rationale, verified test results, and deployment notes.
   Link to relevant issues, tickets, or specifications.
6. Final safety check:
   Ensure no sensitive files (`.env`, credentials, local configs) are staged.
   Verify that branch is up to date with target base before opening PR.

## Output / handoff
- Clean git commit or pull request ready for peer review.
- Detailed PR description covering problem context, solution summary, and testing proof.

## Verification and guardrails
- Never run a plain `git push --force`; never rewrite history of shared or deploy branches.
- Never edit or commit on the default branch; create a branch first.
- Reuse the current unmerged local feature branch when that does not affect others; do not create extra branches.
- On local feature branches, commit, rebase onto the default branch, push (`git push -u origin <branch>`) and open or update PRs without asking again.
- Never push to the deploy branch (`main`, `master`, `production`, `release/*` or whatever branch triggers a deploy); push is blocked there, open a PR instead and let the user merge.
- Only force-push a feature branch after a rebase, with `--force-with-lease`, and only on your own unshared branch.
- Do not include agent names as co-authors or add automated tool trailers unless requested.
- Verify that working tree is in a clean, consistent state.
