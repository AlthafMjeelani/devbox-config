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
| See usage and quota for every agent | `ai-usage` (or the menu bar; on Linux `ai-usage-bar`) |
| Pick models and save tokens | see [`docs/MODELS.md`](docs/MODELS.md); Codex: `codex -p fast|standard|deep` |
| Run parallel agents in worktrees | `crew new "<task>" --claude` (see `agent-orchestration`) |
| Run and message agents in Rex | `rex-agents spawn <name> -C <dir> -- claude`, `rex-agents send <name> "..."` |
| Check a project's env files and gitignore | `env-check` (add missing keys to `.env.example` with `env-check --sync`) |
| Show model, branch, context and usage bars in Claude Code | `claude-statusline-install` (setup does this for you) |
| Make a repo agent-ready (AGENTS.md, docs, .env.example, plan) | `agentic-init` (preview with `--dry-run`, audit with `--check`) |
| Allow commits on `main` in one repo | `git config devbox.allowDefaultBranch true` |
| Edit a config | change the file in `$HOME` (it is a symlink), then `git commit` here |

## What you get

**One skill set for every agent.** All 134 skills live in `agents/skills/` and are linked into each agent's own skills folder, so a skill added once works in Claude Code, Codex, OpenCode, Kimi, Amp, CommandCode and Antigravity. Just describe the task in plain words; agents pick the skill by its description, or name one: "use the admin-panel-dashboard-design skill".

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

Three skills teach your agents the workflow: `agent-orchestration` (plan, dispatch, review, merge), `agent-communication` (handoff files, status signals, ask-or-decide) and `rex-terminal` (the `rex` CLI). They load in all seven agents. To also install Rex's own skill and hook for Claude Code, run `rex skill setup --agent claude`.

If Rex says the CLI is not allowed, turn on Remote Control in Rex settings. `rex config check` validates `init.lua`; a binding that Rex rejects can simply be deleted, because Rex works with no config.

## Where agent rules live

| File | Applies to | Use it for |
|---|---|---|
| `agents/AGENTS.md` (this repo) | every agent, every project, via `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md` and the other links | the **coding workflow** (read the project's `AGENTS.md` first, always work on a feature branch), safety, commits, quality bar |
| `AGENTS.md` in each project repo | that project only | stack, commands, conventions, folder map, branch and PR rules for the team |
| `agents/.claude/settings.json`, `agents/.codex/rules/default.rules` | one tool | hard permissions, for example denying `git push` |

**Enforced, not just asked.** `guard-default-branch` blocks work on `main`, `master`, `develop`, `trunk` and a repo's default branch in two places:

- *Git*: a global `pre-commit` hook (`git/.config/git/hooks`) refuses commits on those branches for every agent and for you. Repo-local hooks still run through it.
- *Claude Code*: a `PreToolUse` hook blocks Edit and Write on those branches, with a message telling the agent to run `git switch -c feat/<topic>`. `./setup.sh` installs it into `~/.claude/settings.json` (a backup is kept); or run `guard-default-branch install-claude-hook`.

Allow it deliberately: `ALLOW_DEFAULT_BRANCH=1 git commit ...` once, or `git config devbox.allowDefaultBranch true` for one repo. Do that in this dotfiles repo if you commit straight to `main` here. Repos that set their own `core.hooksPath` (husky) skip the git hook, but the Claude hook still applies.

Edit `agents/AGENTS.md`, commit, and every agent picks it up on its next session. Keep it short, because it loads into every agent's context. Put project details in the project's own `AGENTS.md`, not here.

## What is inside

| Folder | What it configures |
|---|---|
| `agents/` | Shared agent brain: `AGENTS.md`, subagents, models, and the shared skills |
| `opencode/`, `amp/`, `antigravity/`, `commandcode/`, `herdr/` | Per-agent settings, plugins and commands |
| `nvim/` | Neovim (LazyVim) with AI plugins and LSPs |
| `tmux/`, `tmux-resurrect/` | tmux, session restore and agent status bar |
| `zsh/`, `zshenv/`, `zprofile/`, `starship/` | Shell, aliases, PATH exports, prompt, sessionizers |
| `alacritty/`, `ghostty/`, `kitty/`, `wezterm/` | Terminal emulators |
| `git/`, `lazygit/`, `.vscode/` | Git config, Lazygit (`Ctrl+a` runs an AI commit), VS Code settings |
| `rex/` | Rex terminal config (`init.lua`) |
| `swiftbar/` | macOS menu bar plugins |
| `scripts/` | CLI tools |
| `docs/`, `tests/` | Docs and workflow tests |

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
| "Blocked: you are on 'main'" | Intended. `git switch -c feat/<topic>`, or see the override above. |
| `command not found: ai-usage` | Add `export PATH="$HOME/.local/bin:$PATH"` to your shell profile. |

More detail: [`agents/README.md`](agents/README.md) (agent setup) and [`scripts/README.md`](scripts/README.md) (CLI tools).

## Credits

Started from a colleague's dotfiles layout and adapted.
