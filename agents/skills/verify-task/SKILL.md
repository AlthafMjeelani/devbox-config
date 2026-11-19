---
name: verify-task
description: Final check to run before reporting any task as done. Re-checks the request against the changes, runs lint, typecheck, tests and build, reviews the diff, and reports what was and was not verified.
---

# Verify task

Run this last, after the work is finished and before telling the user it is done.

## Steps
1. **Requirements.** Re-read the original request. List each requirement and mark it done, partly done or not done, with the file or output that shows it.
2. **Project checks.** Find the commands from the repo's `AGENTS.md`, `README`, `Makefile` or `package.json`. Run lint, typecheck, tests and build. Fix failures your change caused; report unrelated ones without fixing them.
3. **Run it.** For behavior changes, exercise the real path as a user would (start the app, call the endpoint, open the page). Passing unit tests alone are not proof.
4. **Diff review.** Read `git diff` and `git status`. Remove stray edits, debug code, commented-out blocks and generated noise. Check for secrets, `.env` files and machine-specific paths.
5. **Safety.** Confirm you are on a feature branch (or `dev`/`staging`, which are unrestricted) and nothing was pushed, merged or deleted without approval. Pushes to `dev` or `staging` need no approval.
6. **Re-review.** If you fixed review findings, use `second-pass` to confirm each one is resolved. For guardrails, hooks or permissions, use `adversarial-verification`. For reports, decks or documents, use `artifact-quality-review`. For API or version claims, use `grounding`.
7. **Docs.** Update the README, docs and `.env.example` when behavior or config changed.

## Report
- Done: what changed, in one or two lines.
- Verified: each command run and its real result.
- Not verified: anything skipped or unavailable, and why.
- Failures: output of anything still failing. Never say done while checks fail.

Related: `second-pass`, `adversarial-verification`, `artifact-quality-review`, `grounding`, `ship-gate`.
