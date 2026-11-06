---
name: project-agents-md
description: Create or improve a repository's AGENTS.md so every coding agent (Claude, Codex, Antigravity, OpenCode, Kimi, Amp) starts with the right commands, structure and rules. Use when starting work in a repo that has no AGENTS.md or a weak one.
---

# Project AGENTS.md

A good `AGENTS.md` is the cheapest way to cut tokens: the agent stops exploring and starts working. Keep it short (under about 120 lines), specific and true. It is loaded every session.

## Method
1. Inspect the repo: `README`, package or build files (`pubspec.yaml`, `package.json`, `go.mod`, `pyproject.toml`, `composer.json`, `Makefile`), CI config, `.env.example`, folder layout.
2. Run the commands you plan to document, so they are known to work.
3. Write only what an agent cannot guess from the code. Do not restate the README or list every file.
4. Link to deeper docs instead of copying them.

## Template
```md
# <Project>
<One line: what it is and who uses it.>

## Stack
<language, framework, key packages, versions pinned by tools such as fvm or .nvmrc>

## Commands
- Install: `<cmd>`
- Run: `<cmd>`
- Test: `<cmd>` (single test: `<cmd>`)
- Lint / typecheck: `<cmd>`
- Build: `<cmd>`

## Layout
- `<dir>/` - <purpose>

## Conventions
- <state management, naming, error handling, API style, formatting>

## Workflow
- Work on a feature branch (`feat/...`, `fix/...`); never commit to `main`.
- Commit style: <conventional commits>. Do not push or open PRs unless asked.
- Config lives in `.env.example`; never commit real `.env` files.

## Do not
- <generated files to leave alone, risky areas, things that need approval>
```

## Rules
- Nested `AGENTS.md` files are fine for monorepo packages; keep each focused on its folder.
- Update it in the same change when a command, folder or convention changes.
- Mobile apps use Flutter unless the repo says otherwise (`mobile-app-development`).
