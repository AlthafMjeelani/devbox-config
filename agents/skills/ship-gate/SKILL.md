---
name: ship-gate
description: Use when shipping a branch through the local AI ship gate - validate in a disposable worktree, auto-fix, then push and open a PR. Covers the `gate` CLI, optional .gate.sh overrides, and .worktrees-setup bootstrap.
compatibility: Local-runner-only. Requires gate, git-wt, authenticated gh, local guard hooks, and the configured agent CLIs. Do not bootstrap or run it inside an Amp orb.
---
## What it is
`gate` is a local ship gate (our own, no external binary). It validates a branch's
committed work in a **disposable worktree** and only pushes + opens a PR once the gate
passes. Built on `git-wt` + your coding agent + `gh`.

Before use, verify `gate`, `git-wt`, `gh auth status`, the selected agent CLI, and required guard hooks.
In an Amp orb, run repository-native review and validation instead, then use the project's configured changes workflow when the user explicitly asks to ship.

## Pipeline
1. Copy the current branch HEAD into a disposable worktree (your working tree is untouched).
2. **review** - structured: the reviewer (via the `gate-review` skill) emits JSON findings classified
   `auto_fix` vs `ask_user`. `auto_fix` findings are applied automatically; `ask_user` findings are
   gated on **human approval** - prompted interactively (approve / fix / block), or **blocked** when
   headless (`GATE_REVIEW_APPROVE=0` makes them informational instead). Evidence is written under
   `GATE_EVIDENCE_DIR`. The LLM only classifies; the human decides.
3. Run the deterministic `GATE_TEST` and `GATE_LINT` commands from committed `.gate.sh`. Run `GATE_DOCS` when configured.
4. If review produces fixes, integrate the retained commits into the task branch and rerun.
5. `gate run --ship` publishes the verified commit and opens a draft PR. `GATE_WATCH_CI=1` watches checks and reports the outcome.

Use `gate init --engine <engine>` to seed the configuration. Configure test dependencies with non-secret project setup commands. Gate skips automatic worktree setup hooks.

## Usage
```bash
gate init          # optional: write .gate.sh deterministic overrides
gate init --engine amp
gate status        # show resolved config
gate run           # local verification
gate run --ship    # verify and publish a draft PR with authorization
```

## Rules
- Commit your work first; the gate validates commits, not the dirty tree.
- Use `--ship` only when the user authorizes publishing.
- In headless mode, unresolved `ask_user` findings must fail closed before any push or PR creation. Do not downgrade them to informational in a shipping run.
- Never bypass the gate to push a failing branch. If it escalates, fix the reported
  failures (or the kept worktree) and re-run. No yolo.
- `gate` refuses to run on the default branch.
