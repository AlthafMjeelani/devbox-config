---
name: model-routing
description: Choose the right model and reasoning effort per task and per agent (Claude, Codex, Antigravity, OpenCode, Kimi) to keep quality high and token cost low. Use when picking a model, setting up subagents, or when usage limits matter.
---

# Model routing

Use the strongest model where mistakes are expensive, and the cheapest one that does the job everywhere else. Reasoning effort is a second dial: raise it for hard thinking, lower it for mechanical work.

## Task to tier
| Task | Tier | Claude | Codex | Effort |
|---|---|---|---|---|
| Architecture, security review, hard or unclear bugs, risky refactors | deep | `opus` | `gpt-6.1-sol` | high |
| Normal features, fixes, tests, code review | standard | `sonnet` | `gpt-6.1-terra` | medium |
| Docs, renames, formatting, search, summaries, commit messages | fast | `haiku` | `gpt-6-luna` | low |

Antigravity: `gemini-3.1-pro-high` for deep and standard, `gemini-3.8-flash-*` for fast. The source of truth for roles is `agents/models.json`; change it there, then run `agents-sync`.

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

## Automatic routing (all agents)
Before starting a task, or when splitting work into subtasks, run:

```sh
agent-route "short task description" --files <how many files you expect to touch>
```

It prints the tier, the effort, and the exact launch command for Codex, Claude and OpenCode. Default is low effort; it escalates to Sol/Opus and medium or high only for risk or size signals (security, auth, payments, migrations, concurrency, architecture, many files). Follow it:
- If it says a higher tier than the current session, suggest switching (`/model`) or hand that subtask to a subagent launched with the printed command.
- If it says fast, do not spend the big model on it.
- `crew new --profile auto "task"` applies it automatically per crewmate.
Edit the word lists at the top of `agent-route` to tune it.
