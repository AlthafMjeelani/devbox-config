---
name: model-routing
description: Choose the right model and reasoning effort per task and per agent (Claude, Codex, Antigravity, OpenCode, Kimi) to keep quality high and token cost low. Use when picking a model, setting up subagents, or when usage limits matter.
---

# Model routing

Use the strongest model where mistakes are expensive, and the cheapest one that does the job everywhere else. Reasoning effort is a second dial: raise it for hard thinking, lower it for mechanical work.

## Task to tier
| Task | Tier | Claude | Codex | Effort |
|---|---|---|---|---|
| Architecture, security review, hard or unclear bugs, risky refactors | deep | `opus` | `gpt-5.6-sol` | high |
| Normal features, fixes, tests, code review | standard | `sonnet` | `gpt-5.6-terra` | medium |
| Docs, renames, formatting, search, summaries, commit messages | fast | `haiku` | `gpt-5.6-luna` | low |

Antigravity: `gemini-3.1-pro-high` for deep and standard, `gemini-3.6-flash-*` for fast. The source of truth for roles is `agents/models.json`; change it there, then run `agents-sync`.

## Rules
1. Always use the newest model in the tier. Claude aliases (`opus`, `sonnet`, `haiku`) already track the latest. For Codex and Gemini, check `docs/MODELS.md` monthly and update `models.json`.
2. Plan and review with the deep tier; implement with standard or fast. Do not run deep for everything.
3. Pick the model at the start of a session and keep it. Switching mid-session breaks prompt caching and wastes tokens.
4. Escalate one tier only after a real failure (tests still red after one honest attempt), not by habit.
5. Use a different vendor for second-opinion reviews.
6. Check headroom first with `ai-usage`; spend from the agent with the most quota left (the menu bar's "Use first").

## Per tool
- Claude Code: `/model` to switch; subagents set `model:` in their frontmatter (generated from `models.json`).
- Codex: `codex -p fast|standard|deep` (profiles in `~/.codex/config.toml`), or `-m <model> -c model_reasoning_effort="low"`; `/model` inside a session.
- crew: `crew new "<task>" --codex --profile fast|standard|deep`.
