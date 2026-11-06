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
| Add or change a skill | edit `agents/.config/opencode/skills/<name>/SKILL.md`, then `make agents-sync && make restow` |
| Install only some parts | `make stow PKG="agents opencode nvim"` |
| Remove a part | `make unstow PKG="nvim"` |
| Also set up the zsh config | `./setup.sh --shell` |
| See usage and quota for every agent | `ai-usage` (or the menu bar) |
| Edit a config | change the file in `$HOME` (it is a symlink), then `git commit` here |

## What you get

**One skill set for every agent.** All 117 skills live in `agents/.config/opencode/skills/` and are linked into each agent's own skills folder, so a skill added once works in Claude Code, Codex, OpenCode, Kimi, Amp, CommandCode and Antigravity. Just describe the task in plain words; agents pick the skill by its description, or name one: "use the admin-panel-dashboard-design skill".

**A macOS menu bar** (SwiftBar) with two plugins:

- *System monitor*: CPU, RAM, disk, battery and network at a glance, turning orange or red only when something needs attention.
- *AI usage*: quota left, reset timers and a burn-rate forecast per agent, with alerts and per-agent icons. Details in [`swiftbar/README.md`](swiftbar/README.md).

**Dev tools in `~/.local/bin`**: `ai-usage`, `agents-sync`, `crew` (multi-agent tmux orchestrator), `gate` (local ship gate), `git-wt` (worktrees), `ai-account`, `agent-icons` and more. See [`scripts/README.md`](scripts/README.md).

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

1. Create `agents/.config/opencode/skills/<name>/SKILL.md`:
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
| `command not found: ai-usage` | Add `export PATH="$HOME/.local/bin:$PATH"` to your shell profile. |

More detail: [`agents/README.md`](agents/README.md) (agent setup) and [`scripts/README.md`](scripts/README.md) (CLI tools).

## Credits

Started from a colleague's dotfiles layout and adapted.
