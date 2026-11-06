---
name: repo-agentic-setup
description: Make every repository agent-ready with the same set of agentic files (AGENTS.md, CLAUDE.md link, docs/, .env.example, skills reference, PLAN/TASKS conventions). Use when starting in a new repo, joining one that lacks these files, or asked to standardise a repo for AI agents.
---

# Repo agentic setup

Every repo should give any agent (Claude, Codex, Antigravity, OpenCode, Kimi, Amp) the same starting point, so nobody re-explores the codebase. Run the scaffold, then fill in the facts.

## Steps
1. Work on a feature branch (`git switch -c chore/agentic-setup`).
2. Preview: `agentic-init --dry-run`. Apply: `agentic-init`. It never overwrites an existing file.
3. Fill in the placeholders marked `TODO` with facts you have verified by running the commands.
4. Audit: `agentic-init --check` lists missing files and leftover `TODO`s. Exit 1 if any are missing.
5. Run `env-check` so `.env.example` is complete and real env files are ignored.

## Files it creates
| File | Purpose |
|---|---|
| `AGENTS.md` | Commands, structure, rules. Short (about 120 lines). Read first, every session. |
| `CLAUDE.md` | Symlink to `AGENTS.md`, for Claude Code. |
| `README.md` | What the project is, quick start. Only if missing. |
| `.env.example` | Every variable the app reads, with safe sample values. |
| `docs/ARCHITECTURE.md` | Components, data flow, key decisions. |
| `docs/DECISIONS.md` | Short decision log (date, decision, reason). |
| `docs/SKILLS.md` | Which shared skills apply to this repo (design, backend, mobile = Flutter, etc.). |
| `docs/PLAN.md` | Current plan and task list; agents update it as they work. |

## Rules for agents in a repo
- Read `AGENTS.md` first, then the doc relevant to the task. Do not read everything.
- Update the docs in the same change as the code: new command, env var, or decision means an edit to `AGENTS.md`, `.env.example` or `docs/DECISIONS.md`.
- Keep `docs/PLAN.md` current: tick done items, add discovered work, note blockers.
- Never put secrets in these files. Use `.env.example` samples only.
- Link to deeper docs rather than copying them. Delete stale text instead of leaving it.

Related skills: `project-agents-md` (writing a good AGENTS.md), `env-and-secrets`, `context-management`.
