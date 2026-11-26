# Models and token budget

How to pick models, keep them current, and spend tokens on purpose.

## Pick by task

| Task | Tier | Effort |
|---|---|---|
| Architecture, security, hard bugs | deep | high |
| Features, fixes, tests, review | standard | medium |
| Docs, renames, search, summaries | fast | low |

Model names are not stored in this repo, and setting them is **optional**. If you set nothing, every engine runs its own default model (Claude, Pi and Amp use the alias-only tiers in `agents/tiers.example.json`). To pin models, use your local file `~/.config/agents/tiers.json`:

```bash
agent-model --init     # copy the template to ~/.config/agents/tiers.json (never overwrites)
agent-model --check    # list engines and tiers that still have no model
```

Fill in a model per engine and tier there. Claude, Pi and Amp are prefilled with aliases or modes. Codex, OpenCode, Kimi, Command Code and Antigravity start empty, which means the CLI's own default model is used (the `--model` flag is simply left out).
Override one value for a single run with `AGENT_MODEL_<ENGINE>_<TIER>` (and `_EFFORT`), or point `AGENT_TIERS` at another file.

Role-level choices (reviewer, debugger, tester and so on) live in `agents/models.json` as tiers only. After editing it, run `agents-sync`.

## Keep models current

- Edit `~/.config/agents/tiers.json` when a vendor ships a newer model. Claude aliases follow the newest release by themselves.
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
