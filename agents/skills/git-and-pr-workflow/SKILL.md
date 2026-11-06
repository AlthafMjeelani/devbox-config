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
- Never run `git push --force` or overwrite remote history without explicit instruction.
- Never commit or push without explicit user instruction.
- Do not include agent names as co-authors or add automated tool trailers unless requested.
- Verify that working tree is in a clean, consistent state.
