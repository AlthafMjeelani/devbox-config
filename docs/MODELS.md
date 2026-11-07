# Models and token budget

How to pick models, keep them current, and spend tokens on purpose.

## Pick by task

| Task | Tier | Claude | Codex | Antigravity | Effort |
|---|---|---|---|---|---|
| Architecture, security, hard bugs | deep | `opus` | `gpt-6.1-sol` | `gemini-3.1-pro-high` | high |
| Features, fixes, tests, review | standard | `sonnet` | `gpt-6.1-terra` | `gemini-3.1-pro-high` | medium |
| Docs, renames, search, summaries | fast | `haiku` | `gpt-6-luna` | `gemini-3.8-flash-*` | low |

Role-level choices (reviewer, debugger, tester and so on) live in `agents/models.json`.
After editing it, run `agents-sync` to regenerate the subagent files for Claude and Codex.

## Keep models current

- **Claude**: `opus`, `sonnet`, `haiku` are aliases that follow the newest release. Nothing to update.
- **Codex and Gemini**: names are pinned. Once a month, check the vendor's model list and update `agents/models.json` and the profiles in `agents/codex-config.toml.example`, then `agents-sync`.
- Only change a model on purpose, not mid-session (it breaks prompt caching).

## Codex settings that save tokens

In `~/.codex/config.toml` (template: `agents/codex-config.toml.example`):

| Setting | Why |
|---|---|
| `model_reasoning_effort = "medium"` | high only for hard work; low for mechanical tasks |
| `model_auto_compact_token_limit` | summarize before the window fills (about 60-70% of it); a huge value disables compaction |
| `tool_output_token_limit` | caps how much command output is kept in context |
| `[profiles.fast|standard|deep]` | switch model and effort in one flag: `codex -p deep` |

Verify key names against your installed version (`codex --help`, the Codex config reference), since settings change between releases.

## Habits that save the most

1. One task per session; compact at about 65%; start fresh for the next task.
2. Short, specific `AGENTS.md` in every project (`project-agents-md`); details in skills.
3. Exact paths and one clear brief instead of many vague follow-ups.
4. Push noisy work to subagents or `crew`; read only their summaries.
5. Do not switch models mid-session.

## See what you spend

- Quota left and reset times: `ai-usage`, or the menu bar / `ai-usage-bar`.
- Codex: `/status` in a session; `npx @ccusage/codex@latest daily` for history.
- Claude Code: `/context` and `/cost`-style views in session; `npx ccusage@latest daily` for history.

Related skills: `model-routing`, `context-management`, `project-agents-md`.
