# Agentic Development Workflow

A practical guide to the agentic setup in these dotfiles - **what to run when**, and **what
every piece is for**. Its shared instruction and skill layer spans seven AI coding tools
(Claude Code, Codex, OpenCode, Kimi Code, Amp, CommandCode, Google Antigravity) and five
stow packages (`agents/`, `opencode/`, `scripts/`, `commandcode/`, `antigravity/`).

- New here? Read **Part 1** (the mental model) once, then keep **Part 2** (playbooks) open while you work.
- Looking up a specific command/skill/config? Jump to **Part 3** (reference).
- Package-level details live in [`agents/README.md`](../agents/README.md),
  [`opencode/README.md`](../opencode/README.md), [`scripts/README.md`](../scripts/README.md).

---

## Part 1 - The mental model

### Seven tools, one shared brain

| Layer | Shared across all 7? | Where it lives |
|---|---|---|
| **Instructions** (`AGENTS.md` / `CLAUDE.md` / `GEMINI.md`) | ✅ identical | `agents/AGENTS.md` → linked into each tool; Amp reads `~/AGENTS.md` |
| **Skills** (36) | ✅ identical | `agents/skills/` → linked into each tool; Codex discovers `~/.agents/skills`; Amp discovers `~/.claude/skills`; CommandCode discovers `~/.commandcode/skills`; Antigravity discovers `~/.gemini/antigravity-cli/skills` |
| **Commands** (41 slash commands) | ❌ OpenCode only | `opencode/.config/opencode/commands/` |
| **Subagents** (10 generated roles + native built-ins) | partly | OpenCode canonical prompts → generated Claude/Codex files; Kimi, Amp, CommandCode, and Antigravity compose skills with native agents/tools |
| **Config** | ❌ per-tool | `opencode.json` / Claude `settings.json` / Codex `config.toml` / Kimi `config.toml` / Amp `settings.json` / CommandCode `settings.json` / Antigravity `settings.json` |

Skills are the shared command layer.
Subagent prompts are canonical in OpenCode format and generated into Claude Code and Codex formats with per-harness model maps.
Kimi composes those shared skills with its native `coder`, `explore`, and `plan` subagents using
the conditional role-routing rules in `agents/AGENTS.md`.
Kimi Code does not currently document a mechanism for independently model-pinned custom role
agents equivalent to the generated Claude and Codex role files, so Kimi roles use the active
session model unless a workflow such as `crew` or `gate` launches a separate model explicitly.
OpenCode slash commands remain thin ergonomic wrappers for context injection and model routing.
Amp uses the shared skills with native tools such as `Task`, Oracle, Finder, and Librarian rather
than generated custom role files.
CommandCode reads the shared `AGENTS.md` and skills directly (like Claude and Codex) and composes
them with its native agents and taste-learning layer; Crew and Gate pin its model explicitly per
profile, so it does not use generated custom role files either.

### The four layers - what fires when

- **Skills** = portable *knowledge* (a checklist / lens / procedure). Available in all six
  tools. In Claude a skill is invocable as a slash (`/ceo-review`) or auto-activates by
  description; in Codex it is invocable as `$ceo-review`; in OpenCode an agent uses it as a tool;
  in Kimi use `/skill:ceo-review`; in Amp ask for the skill or let the model select it;
  in CommandCode use `/skills` or ask for it (import the shared set once with `/import claude`).
  **Rule: want a capability everywhere → make it a skill.**
- **Commands** (OpenCode) = ergonomic *slash triggers* that inject context (`git diff`, `$ARGUMENTS`),
  route to a subagent (which picks the model), and usually say "use the X skill". Thin wrappers over skills.
- **Subagents** = named *roles* (`reviewer`, `critic`, `architect`…) generated for all three harnesses.
  OpenCode remains canonical for prompts and permissions; Claude/Codex get harness-specific generated files.
  Kimi uses shared skills plus native subagents rather than generated custom role files.
- **Scripts** (`scripts/.local/bin`, on `$PATH`) = plain CLI tools the human or an agent runs:
  `wt`/`git-wt` (worktrees), `crew` (parallel agents), `gate` (ship gate).

### The sprint shape

```
Think → Align → Plan → Plan-review → Build → Review → Test → Ship → Handoff/Reflect
```

### Model-routing philosophy (in `opencode.json`)

OpenCode routing is OpenAI-only.
Luna Low handles lightweight writing, Terra handles everyday implementation and review, and Sol
handles reasoning-intensive planning and debugging.
Sol Pro is reserved for the highest-risk security and critique work.

`build` and `reviewer` sit a notch below their tier because they run on every ship.
`build` drives the entire gate - review, auto-fix, test/lint fixes, CI fixes - and that fix work is
high-volume and mechanical. `reviewer` backs the interactive review commands.

The gate's review pass is the exception: `gate_review_opencode` in `scripts/.local/bin/gate`
overrides `build`'s model to `standard`, because classifying findings `auto_fix` vs `ask_user`
is judgment rather than mechanical. The gate never routes to the `reviewer` agent - it is a
subagent, so headless runs cannot target it, and the gate carries its own inline review prompt.

| Tier | Agents | Model |
|---|---|---|
| Gate / build | `build` | `standard/low` (review pass: `terra`) |
| Workhorse | `tester` | `standard` |
| Planning | `plan`, `architect`, `refactor-planner` | `deep` |
| Debugging | `debugger` | `deep` |
| Review | `reviewer` | `standard` |
| Security / critique | `security-reviewer`, `critic` | `deep+` |
| Writing | `docs-writer`, `pr-writer` | `fast/low` |
| Research | `researcher` | `standard/low` |

`small_model = fast/low` (lightweight ops); `default_agent = build`.
On-demand escalation: `/claude-review` shells out to the `claude` CLI (your Claude subscription)
for a different-family second opinion - spend only when you ask.

Generated Claude/Codex model map:

| Role | OpenCode | Claude | Codex |
|---|---|---|---|
| `reviewer` | standard | opus | deep |
| `security-reviewer`, `critic` | deep+ | opus | deep+ |
| `architect`, `refactor-planner` | deep | opus | deep |
| `researcher` | standard/low | sonnet | standard/low |
| `debugger` | deep | sonnet | deep |
| `tester` | standard | sonnet | standard |
| `docs-writer`, `pr-writer` | fast/low | haiku | fast/low |

---

## Part 2 - Playbooks

Each step names the exact command (OpenCode `/slash`) or skill, and the model that runs it.
In Claude/Codex, use the same-named skill instead of the slash command.

### Optional front door - Grill requirements

*Goal: resolve consequential decisions before planning or implementation.*

Use `grill-me` only when you explicitly want a thorough interview.
Serial mode asks one dependency-aware question at a time; frontier mode batches all currently
independent questions.
The agent investigates facts itself, recommends an answer for each decision, tracks assumptions,
and waits for confirmation before acting.

### 1. Planning a product

*Goal: decide whether and what to build before designing anything.*

1. Use `grill-me` first when the problem, users, constraints, or success criteria need deliberate alignment.
2. `/research <topic>` - gather live context (researcher · standard/low).
3. `/autoplan <idea>` or `/agentic-plan` - produce verified facts, decisions, assumptions,
   acceptance criteria, test seams, and dependency-ordered vertical slices (architect · deep).
4. `/plan-ceo-review <the idea>` - founder lens: is the problem real, who's the user, what to
   cut, stronger alternatives (critic · deep+). **Framing before features.**
5. Capture the agreed scope + non-goals in the repo's `AGENTS.md` (seed with `/init-agents-md`).

### 2. Client proposal / estimation

*Goal: turn requirements into commercially safe estimates and proposal text without hiding scope risk.*

1. `/effort-estimate <requirement>` - structured effort, timeline, and cost estimate. Defaults to INR unless another currency is specified.
2. `/proposal-draft <requirement or notes>` - draft a business proposal from requirements, notes, or sample references.
3. `/proposal-review <proposal path or text>` - review clarity, missing sections, scope ambiguity, assumptions, exclusions, and timeline consistency.
4. `/proposal-commercial-review <proposal path or text>` - review pricing, AMC, hosting, payment terms, third-party costs, add-ons, and commercial risk.
5. `/proposal-prototype <proposal path or text>` - create a prototype plan, HTML prototype, or image prompts from the reviewed proposal for the initial client conversation.
6. Use `/plan-eng-review` for complex technical feasibility and `/plan-ceo-review` for final business/scope sanity before sending numbers.

### 3. Planning a feature

*Goal: a locked, reviewed implementation plan - no code yet.*

1. Use `grill-me` when important product or architecture decisions remain unresolved.
2. `/plan-feature <feature>` - implementation plan with observable acceptance criteria, test seams,
   assumptions, and independently verifiable vertical slices (architect · deep).
3. `/plan-eng-review` - architecture, data flow, edge cases, tests, failure modes (architect).
4. `/plan-design-review` - if there's UI: flow, design-system fit, a11y, AI-slop (architect).
5. `/plan-ceo-review` - scope/value gut-check (critic).
6. Lock the plan; only then build.

### 4. Building

*Goal: implement in small, isolated, repo-patterned changes.*

1. Work on the default `build` agent (standard/low).
2. Use the **`grounding`** skill when touching unfamiliar APIs/versions - forces verification
   against real code instead of hallucinating signatures.
3. When dispatching Crew, give each worker an evidence contract: desired behavior, acceptance
   criteria, non-goals, authority, exact verification, relevant artifacts, and blockers.
4. Isolate the work in a worktree so it never disturbs your main checkout → **Playbook 10**.

### 5. Fixing a bug

*Goal: reproduce first, then fix, then prove it's fixed.*

1. `/investigate <bug>` or `/debug-tests` - establish one deterministic red-capable command before
   theorizing, then investigate root cause with **`systematic-debugging`** (debugger · deep).
2. Fix on the `build` agent.
3. Rerun both the minimized regression and the original, unminimized user scenario.
4. `/qa-only` - exercise the changed behavior, report what still breaks (tester).
5. `/review-diff` - catch regressions (reviewer · standard).
6. `/second-pass <prior findings>` - after fixes, confirm resolved + no new regressions (reviewer).

### 6. Refactoring

1. `/refactor-plan <target>` - safe sequencing + verification points (refactor-planner · deep).
2. Apply in small steps on `build`.
3. `/review-diff` and run the tests after each step.

### 7. Reviewing a change (human-in-the-loop)

*Goal: deep review before you hand off to the gate.*

1. Establish a fixed review snapshot and the source requirement or accepted plan.
2. `/review-diff` (unstaged+staged) or `/review-staged` (pre-commit) - review independent **Spec**
   fidelity and **Standards** correctness axes (reviewer).
3. `/security-review` - auth, data handling, dependencies, risky code (security-reviewer · deep+).
4. `/ui-review` - if UI: visual hierarchy, states, tokens (reviewer + frontend-design skill).
5. `/ceo-review` - is this the right change / right scope (critic).
6. `/claude-review` - independent second opinion via the `claude` CLI (reviewer → Claude).
7. `/second-pass` - after you apply fixes, re-check.
8. `/long-context-review` - for very large diffs spanning many files.

### 8. Testing

1. `/test-plan <change>` - a practical test plan (tester).
2. Write tests with the **`test-writer`** skill, or **`test-driven-development`** when a failing
   test can define the behavior first.
3. `/qa-only` - behavior testing without code changes; for web use the **`browser`** skill
   (headless: fetch text, screenshot, click, fill, assert, axe a11y).
4. Use **`adversarial-verification`** for guardrails, validators, hooks, permissions, and invariants:
   prove valid pass → controlled violation fail → restored valid pass.

### 9. Reflect

- `/critique` or `/second-opinion` - an independent gut-check on your analysis or a review, to
  surface what the first pass missed (critic · deep+).
- Use `handoff` when pausing, changing tools, resetting context, or transferring work.
  It records decisions, repository state, exact verification, risks, and the next action in a
  redacted temporary artifact without modifying the project.

### Playbook 10 - Parallel multi-agent development (`wt` + `crew`)

*Run several agents at once, each fully isolated, without them clobbering each other.*

**`wt` - one isolated checkout.** Use when you want a single agent on its own branch without
touching your main working tree.

```bash
wt "add a dark-mode toggle"  # AI-name a branch, create <repo>.worktrees/<name> and cd in
opencode                     # (or claude) - the agent works here, isolated
git wt rm <branch> -D        # teardown: remove worktree + branch
```

`wt` is task-first: describe the work and the branch is AI-named (via `ai-branch-name`,
printed as `-> branch: ...`). Use `wt <existing>` to cd into an existing worktree, or
`wt -b <name> [start]` to force a specific branch. Tab completion covers all three.

Worktrees are **siblings** of the repo (`<repo>.worktrees/<branch>`), never nested inside it, so
they're never committed or scanned. If an executable **`.worktrees-setup`** exists at the repo
root, `wt`/`git wt new` runs it inside the new worktree (copy `.env`, install deps, warm caches).

**`crew` - parallel workers.** Use an explicit task-linked branch for each independent assignment.
Crew launches the selected engine in Rex, Herdr, or tmux and records progress in `crew status` and `crew logs`.
The orchestrator reviews changes, stages commits, and integrates them into a single task branch.

```bash
crew new -b agent/142-docs --claude "Update README usage and verify the commands"
crew status agent/142-docs
crew logs agent/142-docs -f
crew stop agent/142-docs
crew cleanup agent/142-docs  # from the integration branch after the worker commits are integrated
```

See the [orchestrator-first workflow](ORCHESTRATOR-FIRST.md) for permissions, recovery, and safe cleanup.

Crew profiles select explicit models for every engine rather than inheriting machine defaults:

| Profile | Use for | OpenCode | Claude | Codex | Kimi Code | Amp | CommandCode | Antigravity |
|---|---|---|---|---|---|---|---|---|
| `fast` | Mechanical documentation, formatting, boilerplate | Luna Fast | Haiku | Luna Fast | K2.7 Code | low | DeepSeek V4 Flash | Gemini 3.6 Flash Low |
| `standard` | Normal implementation and tests | Terra | Sonnet | Terra | K2.7 Code | medium | DeepSeek V4 Pro | Gemini 3.6 Flash High |
| `deep` | Architecture-sensitive work, concurrency, security, difficult debugging | Sol | Opus | Sol | K3 | high | Qwen3.7-Max | Gemini 3.1 Pro High |

The captain assigns profiles explicitly: `fast` for mechanical tasks, `standard` for normal work,
and `deep` only when stronger reasoning is justified.
Kimi is available only when explicitly selected with `--kimi`; OpenCode remains the default.
Like every tasked crewmate, Kimi runs headlessly on both tmux and Herdr.
Amp is available only when explicitly selected with `--amp`.
Tasked Amp crewmates use execute mode, so they exit when the bounded turn finishes.
An Amp crewmate with an explicit branch and no task remains interactive.
Amp `deep` uses `high`; Crew never selects `ultra` automatically.
CommandCode is available only when explicitly selected with `--commandcode`.
Tasked CommandCode crewmates run headlessly with `--yolo` bounded by the `CREW_MANAGED` guard hook
(its `-p` mode cannot write otherwise), and Crew refuses to launch one if that hook is missing.
A CommandCode crewmate with an explicit branch and no task remains interactive (no `--yolo`).

**Hands-off alerts (`crew watch`).** The captain has no background loop, so between your check-ins it
is idle - "report on request" is deliberate, not laziness. If you want to be *pushed* an alert the
moment a crewmate finishes or blocks, run `crew watch` in its own pane. It tails the state dir, costs
zero tokens, and fires a terminal bell + `notify-send` toast only on a real transition
(ready / blocked / crashed), e.g. `crew: feat-dark ready for review - done, 2 commit(s)`. That is the
event-driven layer an in-chat agent cannot provide on its own.

**How agnostic is this?** The engine (`crew` CLI, worktrees, tmux/herdr, state tracking) is fully
tool-agnostic - dispatch `opencode`, `claude`, `codex`, `kimi`, `amp`, or `commandcode` crewmates
from any terminal, all bounded the same way. The `crew` **skill** is shared across all six tools, so
any can play captain.
Only the packaged `/crew` **command** is OpenCode-specific. From **Claude**, get the same captain by
invoking the `crew` skill - it surfaces as `/crew` (or just ask Claude to "use the crew skill to
build A, B, C"); Claude then drives the same `crew` CLI. From **Codex**, invoke `$crew`.
From **Kimi Code**, invoke `/skill:crew` or ask it to use the `crew` skill.
From **Amp**, ask it to use the `crew` skill.
From **CommandCode**, use `/skills` to run `crew` or ask it to use the `crew` skill.

**When to use which:** one focused task → `wt`; several independent tasks you want running
(semi-)unattended → `crew` (manual) or `/crew` (captain-driven). Native alternatives if you prefer
Claude's own: `claude --tmux`, `claude --bg`.

Use Amp native threads for independent research, read-only reviews, and clean-clone orb work.
Use Crew for concurrent edits, cross-harness execution, or tasks that depend on uncommitted local state.
Orb threads start from a fresh clone; use a live Amp runner or Crew when local state matters.

**Guardrails:** every worktree is fully isolated, so parallel agents never collide. Crewmates commit
but never push; the captain never pushes or merges. Always review each ready branch and run it
through the gate before merging - a `done:0` means the crewmate committed, not that the work is right.
Features must be **independent**: crewmates do not coordinate edits to shared files, so merge or
sequence any tasks that would touch the same core files.

### Playbook 11 - Shipping through the gate (our no-mistakes alternative)

*`gate` validates committed work in a disposable worktree and only pushes + opens a PR once it
passes. Our self-owned version of no-mistakes - no external binary; built on `git-wt` + the coding
agent + `gh`.*

**Optional deterministic overrides:**

```bash
/init-gate        # (or: gate init) writes optional .gate.sh overrides
gate init --engine kimi  # writes a Kimi-specific variant without changing the default
gate init --engine amp   # writes an Amp variant using medium mode
gate init --engine commandcode  # writes a CommandCode variant (Qwen3.7-Max review, DeepSeek V4 Pro fixes)
```

Configure deterministic `GATE_TEST` and `GATE_LINT` commands in a committed `.gate.sh`.
Gate runs review and checks in a disposable worktree and preserves it if checks fail or review proposes commits.

```bash
gate run          # verify the task branch locally
gate run --ship   # with authorization, publish the verified commit and open a draft PR
```

With `GATE_WATCH_CI=1`, Gate watches the PR checks and returns their result.
See the [orchestrator-first workflow](ORCHESTRATOR-FIRST.md) for integration, permissions, and branch protection.


## Part 3 - Reference

### Commands (41) - OpenCode `/slash`, grouped by stage

Each routes to a subagent (which fixes the model) and usually uses the linked skill.

| Command | Agent (model) | Uses skill | Purpose |
|---|---|---|---|
| `/research` | researcher (standard/low) | research | Research a topic using live web sources |
| `/explain` | debugger (deep) | explain | Explain code, behavior, or repo structure |
| `/investigate` | debugger (deep) | systematic-debugging | Investigate a bug/failure before proposing fixes |
| `/autoplan` | architect (deep) | autoplan | End-to-end implementation plan, no edits |
| `/plan-feature` | architect (deep) | autoplan | Plan a feature implementation, no changes |
| `/effort-estimate` | architect (deep) | effort-estimate | Structured effort, timeline, and cost estimate |
| `/architecture-check` | architect (deep) | api-design, refactor-planner | Architecture review of a design/change |
| `/agentic-plan` | architect (deep) | autoplan | Plan an agentic workflow (subagents, tools, orchestration) |
| `/refactor-plan` | refactor-planner (deep) | refactor-planner | Safe refactor plan with sequencing + verification |
| `/plan-ceo-review` | critic (deep+) | ceo-review | Founder-lens review of a **plan** |
| `/plan-design-review` | architect (deep) | design-review | Plan-stage UX/design-system/a11y review |
| `/plan-eng-review` | architect (deep) | eng-review | Plan-stage architecture/edge-case/test review |
| `/proposal-draft` | docs-writer (fast/low) | proposal-writing | Draft a client proposal from requirements or notes |
| `/proposal-review` | critic (deep+) | proposal-writing, ceo-review | Review proposal clarity, scope safety, and consistency |
| `/proposal-commercial-review` | critic (deep+) | proposal-writing, effort-estimate, ceo-review | Review pricing, AMC, hosting, payment terms, and commercial risk |
| `/proposal-prototype` | docs-writer (fast/low) | prototyping-proposals, proposal-writing, frontend-design | Create proposal-aligned prototype plans, HTML prototypes, or image prompts |
| `/review-diff` | reviewer (standard) | code-review | Review unstaged+staged diffs for bugs/regressions |
| `/review-staged` | reviewer (standard) | code-review | Review only staged changes pre-commit |
| `/long-context-review` | reviewer (standard) | code-review | Review across many files / a long diff |
| `/ui-review` | reviewer (standard) | frontend-design | Visual/UI review of implemented components |
| `/ship-check` | reviewer (standard) | - | Final readiness review before merge/release |
| `/security-review` | security-reviewer (deep+) | security-review | Security review of changes + nearby risky code |
| `/ceo-review` | critic (deep+) | ceo-review | Founder-lens review of a **change/diff** |
| `/second-opinion` | critic (deep+) | critique | Independent second opinion on a plan/diff/review |
| `/critique` | critic (deep+) | critique | Critique of recent analysis/review |
| `/claude-review` | reviewer → `claude` CLI | - | Second opinion from the Claude CLI (your Claude sub) |
| `/second-pass` | reviewer (standard) | second-pass | Re-review after fixes; confirm resolved, no regressions |
| `/test-plan` | tester (standard) | test-writer | Practical test plan for a change/feature |
| `/qa-only` | tester (standard) | - | Test changed behavior, report bugs, no code changes |
| `/debug-tests` | debugger (deep) | systematic-debugging | Debug failing tests, root-cause first |
| `/crew` | build (standard/low) | crew | Dispatch a crewmate per feature, monitor, report ready branches |
| `/gate-review` | reviewer (standard) | gate-review | Structured JSON review for the gate (auto_fix vs ask_user) |
| `/ship-gate` | build → `gate` | ship-gate | Validate in a disposable worktree, then push + PR |
| `/commit` | pr-writer (fast/low) | git-commit | Commit staged changes (this repo or child repos) |
| `/commit-message` | pr-writer (fast/low) | git-commit | Draft a commit message (never commits) |
| `/branch-name` | pr-writer (fast/low) | - | Suggest short branch names from worktree context |
| `/changelog` | pr-writer (fast/low) | release-notes | Draft changelog/release notes from commits+diffs |
| `/pr-body` | pr-writer (fast/low) | pull-request | Draft a PR title + body from branch changes |
| `/docs-update` | docs-writer (fast/low) | documentation | Update docs/README from current changes |
| `/init-agents-md` | build (standard/low) | project-agents-md | Seed a per-project `AGENTS.md` (+ `CLAUDE.md` symlink) |
| `/init-gate` | build (standard/low) | - | Seed optional `.gate.sh` ship-gate overrides |

### Skills (36) - shared across Claude, Codex, OpenCode, Kimi Code, Amp, and CommandCode

| Skill | For | Used by |
|---|---|---|
| `ceo-review` | Founder lens: framing, scope, value, alternatives | `/ceo-review`, `/plan-ceo-review` |
| `design-review` | UI/UX review: flow, tokens, a11y, AI-slop | `/plan-design-review` |
| `eng-review` | Architecture, edge cases, failure modes, tests | `/plan-eng-review` |
| `second-pass` | Re-review after fixes | `/second-pass` |
| `code-review` | Findings-first correctness/regression review | `/review-diff`, `/review-staged`, `/long-context-review` |
| `security-review` | Security review checklist | `/security-review` |
| `database-review` | Schema/migration/query/index review | (architect/reviewer) |
| `api-design` | HTTP API / interface / schema review | `/architecture-check` |
| `frontend-design` | Building UI: layout, a11y, responsive | `/ui-review` |
| `effort-estimate` | Structured effort, timeline, cost, budget, and phase estimates | `/effort-estimate`, `/proposal-commercial-review` |
| `proposal-writing` | Client proposal drafting/review: scope, commercials, AMC, payment terms, assumptions, exclusions | `/proposal-draft`, `/proposal-review`, `/proposal-commercial-review` |
| `prototyping-proposals` | Proposal-aligned prototype plans, HTML prototypes, image briefs, and image-generation prompts | `/proposal-prototype` |
| `systematic-debugging` | Root-cause investigation | `/investigate` |
| `test-writer` | Create/update/review tests | `/test-plan` |
| `test-driven-development` | Failing-test-first for behavior changes | (build/tester) |
| `refactor-planner` | Plan safe incremental refactors | `/refactor-plan`, `/architecture-check` |
| `grounding` | Verify APIs/versions instead of hallucinating | (build) |
| `git-commit` | Conventional-commit messages | `/commit`, `/commit-message` |
| `pull-request` | PR title/body/test-plan | `/pr-body` |
| `release-notes` | Changelogs / release notes | `/changelog` |
| `documentation` | READMEs, docs, setup instructions | `/docs-update` |
| `ship-gate` | Drive the `gate` CLI + optional `.gate.sh` overrides | `/ship-gate` |
| `gate-review` | Structured JSON review for the ship gate (auto_fix vs ask_user) | `/gate-review`, `gate` |
| `crew` | Orchestrate parallel crewmates: split, dispatch, monitor, report | `/crew` |
| `browser` | Headless web QA (`browser-cli.ts`) | (any agent) |
| `find-skills` | Find/evaluate public skills before installing | (any agent) |
| `grill-me` | Explicit, dependency-aware requirements interview in serial or frontier mode | (any agent, user-invoked only) |
| `handoff` | Redacted cross-agent or cross-session continuation artifact | (any agent) |
| `adversarial-verification` | Pass-fail-pass proof for guardrails, validators, permissions, and invariants | (build/tester/reviewer) |
| `autoplan` | End-to-end implementation, feature, and agentic workflow plans | `/autoplan`, `/plan-feature`, `/agentic-plan` |
| `research` | External/web research with citations | `/research` |
| `critique` | Adversarial second opinion | `/critique`, `/second-opinion` |
| `explain` | Explain code/behavior with file references | `/explain` |

Available everywhere: in **Claude** as `/skill-name` or auto-activated; in **OpenCode** invoked by
agents (governed by each agent's `skill:` allowlist in its `.md`); in **Codex** as `$skill-name`;
in **Kimi Code** as `/skill:skill-name`; and in **Amp** by asking for it or automatic selection.

### Subagents - three harnesses

Canonical prompts live in `opencode/.config/opencode/agents/*.md`.
Run `make agents-sync` to regenerate `agents/.claude/agents/*.md` and `agents/.codex/agents/*.toml` from those prompts plus `agents/models.json`.
Run `agents-sync --check` to verify generated files are current.

Claude Code reads `~/.claude/agents/*.md`.
Codex reads `~/.codex/agents/*.toml`.
OpenCode reads `~/.config/opencode/agents/*.md` unchanged.

| Agent | Model | Role | Can edit? |
|---|---|---|---|
| `architect` | deep | Architecture / plan reviews | no |
| `debugger` | deep | Investigate bugs / failing tests | limited |
| `tester` | standard | Test plans / QA, no code changes | no |
| `reviewer` | standard | Code/UI/ship review, findings-first | no (deny) |
| `security-reviewer` | deep+ | Security review | no |
| `docs-writer` | fast (low effort) | Docs / README | docs only |
| `pr-writer` | fast (low effort) | Commits, PR bodies, changelogs | commit-scope |
| `refactor-planner` | deep | Refactor planning | no |
| `researcher` | deep (low effort) | Live web research | no |
| `critic` | deep+ | Founder/critique/second-opinion | no |

OpenCode built-ins `build` and `plan` still live in `opencode.json`.
Generated Claude/Codex roles cover the 10 custom subagents above.

### Scripts (`scripts/.local/bin`, on `$PATH`)

| Tool | Subcommands | Purpose |
|---|---|---|
| `git wt` / `wt` | `new`, `ls`, `path`, `rm`, `prune` | Sibling worktrees; `wt` adds `cd`; `.worktrees-setup` post-create hook |
| `crew` | `new`, `status`, `logs`, `watch`, `ls`, `attach`, `stop` | tmux/herdr multi-agent orchestrator over `wt`; OpenCode tasks use bounded `build --auto`; tracks completion; `watch` pushes alerts; `--claude`/`--codex`/`--kimi`/`--amp`/`--commandcode`/`--headless` |
| `gate` | `init`, `run`, `status` | Ship gate: structured review (auto-fix/ask-user + evidence) → test → docs → lint → push → PR → CI monitor; `init --engine opencode|claude|codex|kimi|amp|commandcode` |
| `codex-status` | `--json`, `--watch` | ChatGPT/Codex usage + rate-limit meter |

Full usage: [`scripts/README.md`](../scripts/README.md).

### Config files - what each controls, who reads it

| File | Read by | Controls |
|---|---|---|
| `~/AGENTS.md` (→ `agents/AGENTS.md`) | all six tools | Global behavioral instructions (short, shared) |
| `opencode.json` | OpenCode | Model routing (`agent` block), providers, `small_model`, global permissions |
| `tui.json` | OpenCode TUI | Theme (`noctalia`) + local plugins (`./codex-status.ts` usage meter) |
| Claude `settings.json` | Claude Code | Model, enabled plugins, marketplaces, permissions, statusline |
| Codex `config.toml` | Codex | Model, per-project trust levels, features; not stowed |
| Codex `rules/default.rules` | Codex | Exec-policy allow/forbid rules for shell approvals |
| `~/.config/amp/settings.json` | Amp | Runtime preferences and commit attribution |
| `~/.config/amp/plugins/workflow-guardrails.ts` | Amp | Approval gate for risky shell commands plus Herdr agent-state reporting |
| Amp Crew/Gate settings | Amp Crew/Gate | Minimal commit attribution settings for execute mode |
| `~/.commandcode/settings.json` | CommandCode | Registers the `CREW_MANAGED`-gated PreToolUse guard hook (no-op for interactive use) |
| `~/.commandcode/hooks/crew-guard.sh` | CommandCode | Fail-closed deny-list for bounded Crew/Gate `--yolo` runs (push/sudo/hard-reset/clean/rm) |
| `.gate.sh` (per repo, optional) | `gate` | Deterministic ship-gate overrides; empty test/lint uses auto-detection |
| `.worktrees-setup` (per repo) | `git wt` | Post-create hook run inside each new worktree |
| project `AGENTS.md` (per repo) | all six tools | Project-specific stack, commands, conventions, pitfalls |

`codex-status.ts` is a **local** OpenCode TUI plugin (needs `bun`) that renders your ChatGPT/Codex
usage % in the status bar; the standalone `codex-status` CLI prints the same on demand.

---

## Part 4 - Cross-tool cheatsheet

**Same capability, seven tools** (skills are shared; only the trigger differs):

| Capability | Claude Code | OpenCode | Codex | Kimi Code | Amp | CommandCode | Google Antigravity |
|---|---|---|---|---|---|---|---|
| CEO review | `/ceo-review` or ask | `/ceo-review` (→ critic) | `$ceo-review` | `/skill:ceo-review` | ask for `ceo-review` | `/skills` or ask | ask for `ceo-review` |
| Design review | `/design-review` or ask | `/plan-design-review` / `/ui-review` | `$design-review` | `/skill:design-review` | ask for `design-review` | `/skills` or ask | ask for `design-review` |
| Eng review | `/eng-review` or ask | `/plan-eng-review` / `/architecture-check` | `$eng-review` | `/skill:eng-review` | ask for `eng-review` | `/skills` or ask | ask for `eng-review` |
| Code review | `/code-review` or ask | `/review-diff` | `$code-review` | `/skill:code-review` | ask for `code-review` | `/skills` or ask | ask for `code-review` |
| Re-review | `/second-pass` or ask | `/second-pass` | `$second-pass` | `/skill:second-pass` | ask for `second-pass` | `/skills` or ask | ask for `second-pass` |
| Requirements grill | `/grill-me` | ask to use `grill-me` | `$grill-me` | `/skill:grill-me` | ask for `grill-me` | `/skills` or ask | ask for `grill-me` |
| Handoff | `/handoff` | ask to use `handoff` | `$handoff` | `/skill:handoff` | ask for `handoff` | `/skills` or ask | ask for `handoff` |
| Adversarial verification | `/adversarial-verification` | ask to use it | `$adversarial-verification` | `/skill:adversarial-verification` | ask for it | `/skills` or ask | ask for it |
| Crew captain | `/crew` or ask | `/crew` | `$crew` | `/skill:crew` | ask for `crew` | `/skills` or ask | ask for `crew` |
| Ship gate | run `gate run` | `/ship-gate` | run `gate run` | run `gate run` | run `gate run` | run `gate run` | run `gate run` |
| Web QA | `browser` skill | `browser` skill | `$browser` | `/skill:browser` | ask for `browser` | `/skills` or ask | `browser` skill |

**Rule of thumb:** want a capability in every tool → make it a **skill**. Want a slash trigger with
model routing → add an OpenCode **command** that uses the skill.

### Verify your setup

```bash
# generated subagents are current
make agents-sync && git diff --exit-code agents/
agents-sync --check
make verify-agent-workflow

# skills present in OpenCode (and no duplicates)
opencode debug skill | grep '"name"' | sort | uniq -d      # prints nothing = no dupes

# in Claude Code: /reload-skills  → should list your user skills

# shared symlinks resolve to one canonical source
readlink -f ~/AGENTS.md ~/.claude/CLAUDE.md ~/.codex/AGENTS.md ~/.config/opencode/AGENTS.md ~/.commandcode/AGENTS.md ~/.gemini/antigravity-cli/AGENTS.md | sort -u
readlink -f ~/.claude/skills ~/.commandcode/skills ~/.gemini/antigravity-cli/skills   # -> the shared skills dir
readlink -f ~/.agents/skills/code-review/SKILL.md                                     # -> the canonical shared skill
readlink -f ~/.claude/settings.json ~/.claude/agents/reviewer.md ~/.codex/agents/reviewer.toml
test -L ~/.claude/settings.json

# CommandCode crew guard is deployed and executable (Crew/Gate refuse --yolo runs without it)
test -x ~/.commandcode/hooks/crew-guard.sh && echo "commandcode guard ok"

# engines on PATH
command -v wt git-wt crew gate claude-statusline commandcode agy
```
