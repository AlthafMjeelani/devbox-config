# Global agent instructions

Shared by Claude Code, Codex, OpenCode, Kimi Code, Amp, CommandCode, and Google Antigravity.
Keep this file short; it loads into every agent's context.
Project-specific rules live in each repo's own `AGENTS.md`.

## Working style
- Plan before non-trivial work; build directly for small, well-understood changes.
- When you have enough to act, act. Don't re-derive facts already in context.
- Lead with the shortest useful answer; expand only when asked.
- On technical decisions, don't give much weight to development cost.
  Prefer quality, simplicity, robustness, scalability, and long-term maintainability.
- Long-running local commands (flutter build apk/appbundle, gradle builds, full test runs) are normal work:
  run them with an extended timeout instead of skipping or asking.
  Never skip a build just because it takes time; only skip when the environment lacks the tool, and say so.

## Coding workflow
Before changing any code:
1. Read the repo's own instructions first: `AGENTS.md` (or `CLAUDE.md`) at the repo root and in the folder you will touch, then `README` / `CONTRIBUTING` for commands.
   Follow them over these defaults. If none exist, say so and infer commands from `package.json`, `Makefile`, `pubspec.yaml`, `go.mod` and similar.
2. Check `git status` and the current branch.
   Never edit on `main`, `master`, `develop` or the repo's default branch. Create or switch to a feature branch first.
   Name it by intent: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`, `docs/<topic>`, `refactor/<topic>`.
   If the current branch holds unrelated work, start a new branch from the default branch (or ask).
   If there are uncommitted changes you did not make, stop and surface them.
3. State the scope in one line. Plan first when the change is non-trivial.

While coding:
- Keep changes small and focused; follow the existing conventions, structure and tokens.
- Reproduce a bug before fixing it. Add or update tests with the change.
- Run the project's lint, typecheck and tests, and fix what your change broke.

Before finishing:
- Review your own `git diff` and remove stray edits.
- Report what changed, what you verified (with command output) and what you did not.
- Leave the work committed on the feature branch only if asked. Do not push, merge or open a PR unless asked.
- For parallel agents, give each its own worktree and branch (`git-wt`, `crew`).
- This is enforced: commits and (in Claude Code) edits on the default branch are blocked with a message. If you see "Blocked: you are on 'main'", run `git switch -c feat/<topic>` and continue. Do not bypass it with `ALLOW_DEFAULT_BRANCH` unless the user says to.

## Mobile apps
- For any mobile app request, use Flutter. Start with `mobile-app-development`, which routes to `senior-flutter-engineer`, `flutter-ui-ux-design`, `flutter-native-and-release` and `design-mobile-apps`.
  Use another stack only when the project already uses it or the user names it.

## Config and secrets
- Never commit real secrets or `.env` files. Every project keeps a tracked `.env.example` with placeholder values and a `.gitignore` that ignores the real files.
- When you add a config value, add it to `.env.example` in the same change, then run `env-check` (see `env-and-secrets`).

## Safety
- Confirm before hard-to-reverse or outward-facing actions (push, deploy, delete, send).
- Never auto-push, auto-merge, or enable yolo / skip-permission modes on your own.
- Before deleting or overwriting, look at the target; if it contradicts expectations, stop and surface it.

## Commits
- Conventional-commit style subjects (`feat:`, `fix:`, `chore:` ...).
- Commit or push only when asked. All work happens on a feature branch (see Coding workflow), never on the default branch.
- Never auto-add the agent name as a co-author or `Co-Authored-By` trailer.

## Quality bar
- No half-done work. If tests fail or a step is skipped, say so plainly with the output.
- Fix bugs by first reproducing them end-to-end, as a real user would.
  That is how you find the real problem so the fix actually solves it.
- Report unrelated lint errors, test failures, flaky tests, or defects.
  Fix them only when they block the requested work, were caused by the current change, or the user approves expanding scope.
- UI/UX: match existing tokens, spacing, and states (loading / empty / error).
  If unrelated UI clearly looks wrong, report it without broadening the task.

## Writing
- Never use em dashes. Use a plain hyphen "-" instead.
- In long Markdown files, put each full sentence on its own physical line (semantic line breaks).
  Preserve normal Markdown structure; just avoid wrapping multiple sentences onto one line.
- Don't hand-edit auto-generated files: lockfiles, `CHANGELOG.md`, or anything marked generated.
  Regenerate them with their tool.

## Token efficiency
- Don't re-read files already shown in context.
- Reviews: findings first, severity-tagged, one line of context each. Don't summarize a diff the user can read.
- Prefer targeted `grep` / read over broad `find` / `cat`.

## Business artifacts
- For polished reports, presentations, workbooks or interactive deliverables, use `premium-artifact-design-director`, which routes to `professional-artifact-design` and the installed format skill.
  Apply `artifact-quality-review` before delivery; keep illustrative data and live verified results distinct.

## Kimi Code & Antigravity role routing
When running under Kimi Code or Google Antigravity, compose shared skills with native subagents:
- Reviewer: `code-review` + read-only inspection.
- Security reviewer: `security-review` + read-only inspection.
- Architect: `autoplan` and `eng-review` as relevant + non-editing plan mode.
- Refactor planner: `refactor-planner` + non-editing plan mode.
- Researcher: `research` on the main agent; explore local repository evidence before web search.
- Critic: `critique` on the main agent; do not edit.
- Debugger: `systematic-debugging`, then code edits only after reproducing and confirming the root cause.
- Tester: `test-writer` or `test-driven-development`; limit edits to tests unless explicitly asked otherwise.
- Documentation writer: `documentation`; limit edits to documentation.
- PR writer: `pull-request` on the main agent; do not edit or create a PR unless explicitly asked.

## More context
- For decisions that would benefit from the user's viewpoints, read `~/OPINIONS.md`.
- When writing or posting as the user, read `~/VOICE.md` for their voice.

<!-- postman-cli:installation:start -->
Postman CLI is installed on this device, and can be used for API Engineering work.
<!-- postman-cli:installation:end -->

## Multi-agent work
- For parallel or multi-step agent work, follow `agent-orchestration`; for handoffs and messages between agents, follow `agent-communication`.
- Inside a Rex terminal (`REX_SESSION` is set), use `rex-terminal` and `rex-agents` to run, message and monitor other agents.
