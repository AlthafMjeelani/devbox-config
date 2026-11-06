---
name: context-management
description: Keep agent context small and sessions efficient - when to compact, when to start fresh, how to hand off through files, and what to keep out of the window. Use for long tasks, big repos, or when tokens or limits are tight.
---

# Context management

Tokens are the budget. Every file read, tool output and old message is re-sent each turn, so a long messy session costs more and reasons worse.

## Session hygiene
1. **One task per session.** New task, new session (`/new` in Codex, `/clear` in Claude Code).
2. **Compact before the window fills**, at about 60-70% (`/compact`). Do it at a task boundary, not mid-edit.
3. **Check usage** with `/status` (Codex) or `/context` (Claude Code), and `ai-usage` for quota.
4. **Do not switch models mid-session.** It breaks prompt caching.

## Read less
- Give exact paths and line ranges; do not ask for "look through the repo".
- Search first (`grep`, symbol search), then read only the hit. Do not re-read files already in context.
- Ignore generated and large files (`node_modules`, build output, lockfiles, fixtures) in `.gitignore` and tool ignores.
- Cap tool output: pipe long command output through `head`, `tail` or `grep`.

## Put memory in files, not chat
- `AGENTS.md`: stable facts and commands (short, specific).
- `PLAN.md`: goal, steps, status. `TASK.md`: brief for a worker. `REPORT.md`: result and next step.
- A fresh session that reads these continues without the old history.

## Offload noisy work
- Searches, log digging, big reads and reviews go to a subagent or `crew` worker; the main session receives only the summary.
- Use headless runs (`codex exec`, `claude -p`) for one-shot jobs.

## Prompting
- State the whole request in one message, with acceptance criteria. Many small follow-ups cost more than one clear brief.
- Ask for a diff or a short summary, not full file dumps.

See also: `model-routing`, `agent-communication`, `project-agents-md`.
