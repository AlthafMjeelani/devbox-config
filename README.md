# devbox-config

My dev machine as code: shell, terminal, editor, git, a macOS menu bar, and **one shared setup for seven AI coding agents** (Claude Code, Codex, OpenCode, Kimi Code, Amp, CommandCode, Antigravity). Managed with [GNU Stow](https://www.gnu.org/software/stow/): files in `$HOME` are symlinks into this repo, so editing a config edits the repo and `git diff` shows what changed.

## Quick start

```sh
git clone git@github.com:AlthafMjeelani/devbox-config.git ~/devbox-config
cd ~/devbox-config
./setup.sh
```

Then restart your terminal and your agents, and ask one of them: "list your skills".

`setup.sh` is safe to re-run. It installs prerequisites, backs up any file that would block Stow (into `~/.devbox-config-backup/`, nothing is deleted), assigns the shared skills to all seven agents, links every package, and on macOS installs SwiftBar with the menu bar plugins. Want to preview first? `./setup.sh --dry-run`.

## Everyday commands

| I want to | Run |
|---|---|
| Update this machine | `git pull && ./setup.sh -y` |
| Check everything is healthy | `make verify-agent-workflow` |
| Add or change a skill | edit `agents/skills/<name>/SKILL.md`, then `make agents-sync && make restow` |
| Install only some parts | `make stow PKG="agents opencode nvim"` |
| Remove a part | `make unstow PKG="nvim"` |
| Also set up the zsh config | `./setup.sh --shell` |
| Set model names per agent and tier (kept local, never committed) | `agent-model --init`, then edit `~/.config/agents/tiers.json`; `agent-model --check` shows gaps |
| Run a task on the right model and effort | `agent-route "<task>"` (picks tier and effort; prints launch commands for claude, codex, opencode, pi) |
| See usage and quota for every agent | `ai-usage` (or the menu bar; on Linux `ai-usage-bar`) |
| Pick models and save tokens | see [`docs/MODELS.md`](docs/MODELS.md); Codex: `codex -p fast|standard|deep` |
| Run parallel agents in worktrees | `crew new -b agent/142-docs --claude "<task>"` (see `agent-orchestration`) |
| Run and message agents in Rex | `rex-agents spawn <name> -C <dir> -- claude`, `rex-agents send <name> "..."` |
| Check a project's env files and gitignore | `env-check` (add missing keys to `.env.example` with `env-check --sync`) |
| Show model, branch, context and usage bars in Claude Code | `claude-statusline-install` (setup does this for you) |
| Make a repo agent-ready (AGENTS.md, docs, .env.example, plan) | `agentic-init` (preview with `--dry-run`, audit with `--check`) |
| Allow commits on `main` in one repo | `git config devbox.allowDefaultBranch true` |
| Edit a config | change the file in `$HOME` (it is a symlink), then `git commit` here |

## What you get

**One skill set for every agent.** All 158 skills live in `agents/skills/` and are linked into each agent's own skills folder, so a skill added once works in Claude Code, Codex, OpenCode, Kimi, Amp, CommandCode and Antigravity. Just describe the task in plain words; agents pick the skill by its description, or name one: "use the admin-panel-dashboard-design skill".

**A macOS menu bar** (SwiftBar) with two plugins:

- *System monitor*: CPU, RAM, disk, battery and network at a glance, turning orange or red only when something needs attention.
- *AI usage*: quota left, reset timers and a burn-rate forecast per agent, with alerts and per-agent icons. Details in [`swiftbar/README.md`](swiftbar/README.md).

**On Linux** the same AI usage view works in waybar, tmux or any bar through `ai-usage-bar` (setup in [`docs/LINUX-STATUSBAR.md`](docs/LINUX-STATUSBAR.md)). The `ai-usage` command itself runs on both macOS and Linux.

**Rex terminal support** (Superlogical Rex): keybindings in `rex/.config/rex/init.lua` (tmux-style `ctrl+q` prefix), plus `rex-agents` to start agents, message them, read their screens and get notified when one finishes or needs you. See [Using Rex](#using-rex).

**Mobile and config rules for agents**: any mobile app request goes to Flutter first (`mobile-app-development`), and every project keeps a tracked `.env.example` with a safe `.gitignore` (`env-and-secrets`, `env-check`). This repo's own variables are in [`.env.example`](.env.example).

**Dev tools in `~/.local/bin`**: `ai-usage`, `agents-sync`, `crew` (multi-agent tmux orchestrator), `gate` (local ship gate), `git-wt` (worktrees), `ai-account`, `agent-icons` and more. See [`scripts/README.md`](scripts/README.md).

## Using Rex

Rex is Superlogical's terminal with persistent sessions and a scriptable CLI. `./setup.sh` links `~/.config/rex/init.lua` and, if Rex is installed, validates and reloads it.

**Keys** (prefix `ctrl+q`, then): `c` new tab, `n`/`p` next/previous tab, `,` rename, `w` close tab, `r` rename session, `[`/`]` previous/next session, `v` split right, `-` split down, `z` zoom, `x` close pane, `=` balance, `s` switch session. Press `ctrl+q` twice to send a literal `ctrl+q`. List them with `rex keymap`.

**Agents in Rex**

```sh
rex-agents spawn api -C ~/code/app-api -- claude     # one agent = one session
rex-agents send api "Read TASK.md and start"         # type a message and press Enter
rex-agents read api                                  # see its screen
rex-agents watch                                     # macOS notification when an agent finishes or is blocked
rex-agents kill api
```

The shared `agent-orchestration`, `agent-communication`, and `crew` skills define dispatch, monitoring, and review.
Use the bundled `herdr` and `rex-terminal` skills for terminal control.
The shared herdr skill comes from `herdr --skill` and can be refreshed after upgrading herdr.
Run `rex skill setup --agent claude --agent codex` to install Rex’s official skill and session hooks.

If Rex says the CLI is not allowed, turn on Remote Control in Rex settings. `rex config check` validates `init.lua`; a binding that Rex rejects can simply be deleted, because Rex works with no config.

## Multi-agent workflow

Build several independent changes in parallel. You talk to one agent, the captain. It splits the work, starts one crewmate per task with `crew`, and each crewmate commits on its own branch and never pushes. You review and ship each branch.

```text
You:      Build these two in parallel with crew: 1) dark mode toggle  2) fix login redirect
Captain:  crew new "<brief 1>"   crew new "<brief 2>"      (one branch and worktree each)
You:      crew status   crew attach <branch>   crew logs <branch> -f
You:      review each branch, then /ship-gate               (pushes the branch, opens a draft PR)
You:      crew cleanup <branch>                             (after it is merged)
```

The full walkthrough, with engines, profiles and rules, is in [docs/MULTI-AGENT-FLOW.md](docs/MULTI-AGENT-FLOW.md).

## Where agent rules live

| File | Applies to | Use it for |
|---|---|---|
| `agents/AGENTS.md` (this repo) | every agent, every project, via `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md` and the other links | the **coding workflow** (read the project's `AGENTS.md` first, always work on a feature branch), safety, commits, quality bar |
| `AGENTS.md` in each project repo | that project only | stack, commands, conventions, folder map, branch and PR rules for the team |
| `agents/.claude/settings.json`, `agents/.codex/rules/default.rules`, `amp/.config/amp/settings.json` | one tool | provider permissions for protected branch pushes |
| `~/OPINIONS.md`, `~/VOICE.md` | your machine only | personal context agents read when deciding or writing as you; copy from `agents/OPINIONS.md.example` and `agents/VOICE.md.example` |

`guard-default-branch` blocks direct pushes and force pushes to `main`, `master`, `dev`, `develop`, `staging`, `trunk`, and the remote default branch. Editing and committing are never blocked, and feature branches can be pushed and force-pushed with `--force-with-lease`. See the [orchestrator-first workflow](docs/ORCHESTRATOR-FIRST.md) for task branches, approval, and GitHub rules.

- *Git*: the global `pre-push` hook (`git/.config/git/hooks`) checks the actual remote refs; `pre-commit` only scans for secrets. Repo-local hooks still run through it.
- *Claude Code*: a `PreToolUse` hook on Bash blocks any `git push` that updates or deletes a protected branch (`HEAD:main`, `+x:main`, `--delete main`, `--all`, `git -C`, `cd ... &&`).

`./setup.sh` installs it into `~/.claude/settings.json` (a backup is kept); or run `guard-default-branch install-claude-hook`.

Allow it deliberately: `ALLOW_DEFAULT_BRANCH=1 git push ...` once, or `git config devbox.allowDefaultBranch true` for one repo. GitHub rulesets enforce shared branch policy on the server. Repos that set their own `core.hooksPath` (husky) skip the git hook, but the Claude push hook still applies.

Edit `agents/AGENTS.md`, commit, and every agent picks it up on its next session. Keep it short, because it loads into every agent's context. Put project details in the project's own `AGENTS.md`, not here.

## What is inside

| Folder | What it configures |
|---|---|
| `agents/` | Shared agent brain: `AGENTS.md`, subagents, models, and the shared skills |
| `opencode/`, `amp/`, `antigravity/`, `commandcode/`, `herdr/`, `herdr-app/` | Per-agent settings, plugins and commands |
| `nvim/` | Neovim (LazyVim) with AI plugins and LSPs |
| `tmux/` | tmux, session restore (vendored tmux-resurrect) and agent status bar |
| `zsh/`, `zshenv/`, `zprofile/`, `starship/` | Shell, aliases, PATH exports, prompt, sessionizers |
| `alacritty/`, `ghostty/`, `kitty/`, `wezterm/` | Terminal emulators |
| `git/`, `lazygit/`, `.vscode/` | Git config, Lazygit (`Ctrl+a` runs an AI commit), VS Code settings |
| `rex/` | Rex terminal config (`init.lua`) |
| `swiftbar/` | macOS menu bar plugins |
| `scripts/` | CLI tools |
| `docs/`, `tests/` | Docs and workflow tests |

## DevOps, developer and designer skills

| Skill | Use it for |
|---|---|
| `docker-containerization` | Dockerfiles, multi-stage builds, Compose, image scanning |
| `kubernetes-ops` | Manifests, Helm, probes, rollouts, pod debugging |
| `terraform-iac` | Terraform or OpenTofu plans, state, modules, drift |
| `github-actions-ci` | Workflows, caching, OIDC, least-privilege permissions |
| `observability-and-monitoring` | Logs, metrics, traces, SLOs, alerts |
| `incident-response-runbooks` | Triage, comms, runbooks, postmortems |
| `deployment-strategies` | Rolling, blue-green, canary, flags, rollback |
| `linux-server-hardening` | SSH, firewall, nginx, TLS, systemd, backups |
| `secrets-and-supply-chain` | Secret rotation, scanning, SBOM, pinning |
| `dependency-upgrade` | Safe, verified dependency and runtime upgrades |
| `web-performance-optimization` | Core Web Vitals, bundles, images, caching |
| `monorepo-and-build-tooling` | Workspaces, Turborepo or Nx, build caching |
| `ux-research-and-flows` | Users, jobs, flows and wireframes before visuals |
| `typography-and-color-systems` | Type scales, palettes, contrast-safe tokens |
| `ux-writing-microcopy` | Buttons, errors, empty states and UI text |

## Skills added for full-stack and design work

| Skill | Use it for |
|---|---|
| `senior-backend-engineer` | APIs and services in Node (NestJS/Fastify), Go, Python (FastAPI), PHP (Laravel) |
| `auth-and-identity` | OAuth2/OIDC, JWT rotation, RBAC/ABAC, secure token storage |
| `fullstack-type-safety` | OpenAPI codegen, tRPC, GraphQL, Zod, Dart freezed |
| `react-state-and-query` | TanStack Query, Zustand, React Hook Form, Next.js caching |
| `flutter-native-and-release` | MethodChannels, push notifications, deep links, Fastlane |
| `flutter-ui-ux-design` | Material 3 tokens, adaptive UI, animation, golden tests |
| `admin-panel-dashboard-design` | Website admin panels, dashboards and control centers with a modern look and feel |
| `poster-and-social-media-design` | Social posts, OG cards, thumbnails, print posters |
| `svg-logo-and-icon-design` | Logos, icon sets, app icons, splash screens |
| `web-motion-and-microinteractions` | Framer Motion, scroll animation, bento grids, glass UI |
| `print-and-publication-documents` | Invoices, quotes, brochures, reports via Typst/LaTeX/WeasyPrint |

Full catalog: [`docs/DESIGN-SKILLS.md`](docs/DESIGN-SKILLS.md).

### Add your own skill

1. Create `agents/skills/<name>/SKILL.md`:
   ```md
   ---
   name: <name>          # must equal the folder name
   description: When this skill should be used.
   ---
   ```
2. Run `make agents-sync && make restow`.
3. Run `make verify-agent-workflow`, then commit and push.

## Setup details

### Options

`./setup.sh --help` lists them all:

| Option | Effect |
|---|---|
| `--dry-run` | show what would happen, change nothing |
| `--shell` | also stow `zsh`, `zshenv`, `zprofile` (they replace `~/.zshrc`) |
| `--packages "a b"` | stow only these packages |
| `--no-install` | skip installing prerequisites |
| `--no-swiftbar` | skip the macOS menu bar step |
| `-y` | no confirmation prompt |

### What the script automates

```sh
brew install git stow make jq oven-sh/bun/bun      # or pacman / apt
mkdir -p ~/.agents/skills
make agents-sync && make stow
make stow PKG="zsh zshenv zprofile"                  # optional shell setup
brew install --cask swiftbar                         # macOS menu bar
defaults write com.ameba.SwiftBar PluginDirectory -string ~/.config/swiftbar/plugins
make verify-agent-workflow
```

### Menu bar notes

- Plugins expect Bun at `/opt/homebrew/bin/bun`. On an Intel Mac, either symlink it there or change the first line of the plugins to `/usr/local/bin/bun`. `setup.sh` prints the exact command if it is needed.
- Colored agent icons are optional: `agent-icons set claude /Applications/Claude.app`. See [`swiftbar/.config/swiftbar/icons/README.md`](swiftbar/.config/swiftbar/icons/README.md).

### Good to know

- Flutter/Dart: `.exports` already adds `fvm` and `.pub-cache` to `PATH`.
- Codex's `~/.codex/config.toml` is machine-local and not symlinked. `setup.sh` creates it from `agents/codex-config.toml.example` only if you have none.
- Removed on purpose: `atac`, `btop`, `cava`, `cups`, `fastfetch`, `htop`, `neofetch` and the app-update scripts, since they are not part of the agent workflow.

## Troubleshooting

| Problem | Fix |
|---|---|
| "existing target is not owned by stow" | A real file is in the way. `./setup.sh` backs it up for you; or move it aside and rerun. |
| New skill not showing in an agent | `make agents-sync && make restow`, then restart the agent. |
| `stow` or `bun` not found | Run `./setup.sh`, or install them yourself. |
| `agents-sync` can't find the repo | Run it from inside `~/devbox-config`. |
| Menu bar plugin shows nothing | Check SwiftBar's plugin folder is `~/.config/swiftbar/plugins` and Bun is installed. |
| "Blocked: this push updates 'main'" | Intended. Push your feature branch and open a PR, or see the override above. |
| `command not found: ai-usage` | Add `export PATH="$HOME/.local/bin:$PATH"` to your shell profile. |

More detail: [`agents/README.md`](agents/README.md) (agent setup) and [`scripts/README.md`](scripts/README.md) (CLI tools).

## Credits

Started from a colleague's dotfiles layout and adapted.
