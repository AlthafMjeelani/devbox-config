# devbox-config

My dev machine setup as code: shell, terminal, editor, git and **AI coding agents**
(Claude Code, Codex, OpenCode, Kimi Code, Amp, CommandCode, Antigravity), all managed with
[GNU Stow](https://www.gnu.org/software/stow/).

Clone it once, run two commands, and every tool picks up the same config and the same skills.
Files in `$HOME` become symlinks into this repo, so editing a config edits the repo file and
`git diff` shows exactly what you changed.

## What is inside

| Folder | What it configures |
|---|---|
| `agents/` | Shared agent brain: `AGENTS.md`, subagents, models, and **100+ shared skills** in `agents/.config/opencode/skills/` |
| `opencode/`, `amp/`, `antigravity/`, `commandcode/`, `herdr/` | Per-agent settings, plugins and commands |
| `nvim/` | Neovim (LazyVim) with AI plugins and LSPs |
| `tmux/`, `tmux-resurrect/` | tmux, session restore and agent status bar |
| `zsh/`, `zshenv/`, `zprofile/`, `starship/` | Shell, aliases, PATH exports, prompt, sessionizers |
| `alacritty/`, `ghostty/`, `kitty/`, `wezterm/` | Terminal emulators |
| `git/`, `lazygit/`, `.vscode/` | Git config, Lazygit (`Ctrl+a` runs an AI commit), VS Code settings |
| `swiftbar/` | macOS menu bar: system monitor (CPU, RAM, disk, battery, network) and AI quota/reset timers |
| `scripts/` | CLI tools in `~/.local/bin` (`ai-usage`, `agents-sync`, `crew`, `gate`, `git-wt`, ...) |
| `docs/`, `tests/` | Docs and workflow tests |

## How the skills work

All agents read skills from one place: `agents/.config/opencode/skills/`.
`make agents-sync` and `make stow` link that folder into each agent's own skills directory, so a
skill added there is available to **all seven agents**. No per-agent copies.

Skills added for full-stack and design work:

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

### How to use a skill

Just ask your agent for the task in plain words, for example:

- "Design an admin dashboard for orders with a sidebar, data table and KPI cards" (uses `admin-panel-dashboard-design`)
- "Add JWT refresh rotation to this API" (uses `auth-and-identity`)

Agents pick skills by their description. You can also name one: "use the flutter-ui-ux-design skill".

### How to add your own skill

1. Create `agents/.config/opencode/skills/<name>/SKILL.md` with frontmatter:
   ```md
   ---
   name: <name>          # must equal the folder name
   description: When this skill should be used.
   ---
   ```
2. Run `make agents-sync && make restow`.
3. Run `make verify-agent-workflow`, then commit and push.

## Quick start (one command)

```sh
git clone git@github.com:AlthafMjeelani/devbox-config.git ~/devbox-config
cd ~/devbox-config
./setup.sh
```

`setup.sh` is safe to re-run and does everything:

1. Installs prerequisites (git, stow, make, jq, bun) with Homebrew, pacman or apt.
2. Moves any file that would block Stow into `~/.devbox-config-backup/<timestamp>/` (nothing is deleted).
3. Syncs the shared skills and subagents to all seven agents and links every package.
4. Creates `~/.codex/config.toml` from the template if you have none.
5. On macOS, installs SwiftBar and points it at the two menu bar plugins (system monitor and AI usage).
6. Verifies the result and prints what is left to do.

Options: `--dry-run` (show only), `--shell` (also stow zsh, zshenv, zprofile), `--packages "agents nvim"` (only these), `--no-install`, `--no-swiftbar`, `-y` (no prompt). Run `./setup.sh --help` for the list.

Prefer to see first? `./setup.sh --dry-run`.

After it finishes, restart your terminal and your agents, then ask one: "list your skills".
Update later with `git pull && ./setup.sh -y`.

### Manual steps (what the script automates)

```sh
brew install git stow make jq oven-sh/bun/bun      # or pacman / apt
mkdir -p ~/.agents/skills
make agents-sync && make stow
make stow PKG="zsh zshenv zprofile"                  # optional shell setup
brew install --cask swiftbar                         # macOS menu bar
defaults write com.ameba.SwiftBar PluginDirectory -string ~/.config/swiftbar/plugins
make verify-agent-workflow
```

If Stow reports "existing target is not owned by stow", move that file aside and run again.
Flutter/Dart users: `.exports` already adds `fvm` and `.pub-cache` to `PATH`.

### Pick only some parts

```sh
make stow PKG="agents opencode nvim"   # only these packages
make unstow PKG="nvim"                 # remove one package's symlinks
make TARGET=/tmp/test stow             # dry run into a temp directory
```

## Daily use

| I want to | Run |
|---|---|
| Pull new config on a machine | `git pull && ./setup.sh -y` |
| Change a config | Edit the file in `$HOME` (it is a symlink), then `git commit` in `~/devbox-config` |
| Add a skill | Create the skill folder (see above), `make agents-sync && make restow` |
| Check everything is healthy | `make verify-agent-workflow` |
| Sync skills to Amp personal repos | `make amp-global-sync` |

## Troubleshooting

- **"existing target is not owned by stow"**: a real file is in the way. `./setup.sh` backs it up for you; or move it aside and rerun.
- **New skill not showing in an agent**: run `make agents-sync && make restow`, then restart the agent.
- **`stow` or `bun` not found**: run `./setup.sh` (installs them) or install them yourself.
- **`agents-sync` can't find the repo**: run it from inside `~/devbox-config`.

## Notes

- Codex's `~/.codex/config.toml` is machine-local and not symlinked. See `agents/README.md` for the template.
- Removed on purpose: `atac`, `btop`, `cava`, `cups`, `fastfetch`, `htop`, `neofetch` and the app-update scripts, since they are not part of the agent workflow.
- More detail on the agent setup: [`agents/README.md`](agents/README.md) and [`scripts/README.md`](scripts/README.md).

## Credits

Started from a colleague's dotfiles layout and adapted.
