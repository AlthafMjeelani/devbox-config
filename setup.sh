#!/usr/bin/env bash
# One-command setup for devbox-config.
#
#   git clone git@github.com:AlthafMjeelani/devbox-config.git ~/devbox-config
#   cd ~/devbox-config && ./setup.sh
#
# What it does (safe to re-run):
#   1. Installs prerequisites (git, stow, make, jq, bun) with brew / pacman / apt.
#   2. Backs up files that would block Stow into ~/.devbox-config-backup/<timestamp>/.
#   3. Syncs agent skills and subagents (agents-sync) and symlinks every package with Stow.
#   4. Creates ~/.codex/config.toml from the template if you have none.
#   5. macOS: installs SwiftBar and points it at the menu bar plugins (system monitor + AI usage).
#   6. Verifies the result and prints what to do next.
#
# Options:
#   --dry-run          show what would happen, change nothing
#   --shell            also stow zsh, zshenv and zprofile (they replace ~/.zshrc)
#   --packages "a b"   stow only these packages instead of the defaults
#   --no-install       skip installing prerequisites
#   --no-swiftbar      skip the SwiftBar step on macOS
#   -y, --yes          do not ask for confirmation
#   -h, --help         show this help
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO"

DRY=0; SHELL_PKGS=0; INSTALL=1; SWIFTBAR=1; YES=0; PACKAGES=""
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY=1 ;;
    --shell) SHELL_PKGS=1 ;;
    --packages) shift; PACKAGES="${1:-}" ;;
    --no-install) INSTALL=0 ;;
    --no-swiftbar) SWIFTBAR=0 ;;
    -y|--yes) YES=1 ;;
    -h|--help) sed -n '2,24p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $1 (try --help)" >&2; exit 2 ;;
  esac
  shift
done

if [ -t 1 ]; then B=$'\033[1m'; G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; D=$'\033[2m'; N=$'\033[0m'; else B=""; G=""; Y=""; R=""; D=""; N=""; fi
step() { printf '\n%s==> %s%s\n' "$B" "$*" "$N"; }
ok()   { printf '  %s✓%s %s\n' "$G" "$N" "$*"; }
warn() { printf '  %s!%s %s\n' "$Y" "$N" "$*"; }
die()  { printf '%s✗ %s%s\n' "$R" "$*" "$N" >&2; exit 1; }
run()  { if [ "$DRY" = 1 ]; then printf '  %s[dry-run]%s %s\n' "$D" "$N" "$*"; else "$@"; fi; }
have() { command -v "$1" >/dev/null 2>&1; }

OS="$(uname -s)"
case "$OS" in Darwin) PLATFORM=mac ;; Linux) PLATFORM=linux ;; *) die "Unsupported OS: $OS" ;; esac

DEFAULT_PKGS="$(sed -n 's/^DEFAULT_PACKAGES := //p' Makefile)"
[ -n "$DEFAULT_PKGS" ] || die "Could not read DEFAULT_PACKAGES from the Makefile."
PKGS="${PACKAGES:-$DEFAULT_PKGS}"
[ "$SHELL_PKGS" = 1 ] && [ -z "$PACKAGES" ] && PKGS="$PKGS zsh zshenv zprofile"

printf '%sdevbox-config setup%s  (%s, repo: %s)\n' "$B" "$N" "$PLATFORM" "$REPO"
printf 'Packages: %s\n' "$PKGS"
[ "$DRY" = 1 ] && printf '%sDry run: nothing will be changed.%s\n' "$Y" "$N"
if [ "$YES" = 0 ] && [ "$DRY" = 0 ] && [ -t 0 ]; then
  read -r -p "Continue? [Y/n] " answer
  case "${answer:-y}" in [Yy]*) ;; *) echo "Aborted."; exit 1 ;; esac
fi

# ---- 1. prerequisites ------------------------------------------------------------------------
step "1/6 Prerequisites"
install_pkgs() {
  if have brew; then run brew install "$@"
  elif have pacman; then run sudo pacman -S --needed --noconfirm "$@"
  elif have apt-get; then run sudo apt-get install -y "$@"
  else die "No supported package manager found (brew, pacman, apt-get). Install: $*"; fi
}
missing=()
for tool in git stow make jq; do have "$tool" || missing+=("$tool"); done
if [ "$INSTALL" = 1 ] && [ ${#missing[@]} -gt 0 ]; then
  [ "$PLATFORM" = mac ] && ! have brew && die "Homebrew is required on macOS: https://brew.sh"
  [ "$PLATFORM" = linux ] && have apt-get && [ "$DRY" = 0 ] && sudo apt-get update -y >/dev/null
  warn "Installing: ${missing[*]}"
  install_pkgs "${missing[@]}"
elif [ ${#missing[@]} -gt 0 ]; then
  [ "$DRY" = 1 ] || die "Missing: ${missing[*]} (re-run without --no-install)."
fi
if ! have bun && [ ! -x "$HOME/.bun/bin/bun" ]; then
  if [ "$INSTALL" = 1 ]; then
    warn "Installing bun"
    if have brew; then run brew install oven-sh/bun/bun
    else run bash -c 'curl -fsSL https://bun.sh/install | bash'; fi
  else
    [ "$DRY" = 1 ] || die "bun is required (agents-sync, menu bar plugins)."
  fi
fi
export PATH="$HOME/.bun/bin:$HOME/.local/bin:$PATH"
if [ "$DRY" = 0 ]; then
  for tool in git stow make jq bun; do have "$tool" && ok "$tool" || die "$tool is still missing."; done
fi

# ---- 2. back up conflicting files ------------------------------------------------------------
step "2/6 Checking for files that would block Stow"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$HOME/.devbox-config-backup/$STAMP"
backed_up=0
run mkdir -p "$HOME/.agents/skills"
# An empty ~/.claude/skills directory blocks the symlink the agents package wants to create.
[ -d "$HOME/.claude/skills" ] && [ ! -L "$HOME/.claude/skills" ] && run rmdir "$HOME/.claude/skills" 2>/dev/null || true

conflicts_of() { # stdin: stow output -> relative conflicting paths
  sed -n \
    -e 's/.*existing target is neither a link nor a directory: //p' \
    -e 's/.*existing target is not owned by stow: //p' \
    -e 's/.*over existing target \(.*\) since .*/\1/p'
}
if have stow; then
  for _ in 1 2 3 4 5; do
    out="$(stow -d "$REPO" -t "$HOME" --no-folding -n -S $PKGS 2>&1)" && break
    list="$(printf '%s\n' "$out" | conflicts_of | sort -u)"
    [ -n "$list" ] || { printf '%s\n' "$out" >&2; die "Stow failed for a reason this script cannot fix."; }
    while IFS= read -r rel; do
      [ -n "$rel" ] || continue
      src="$HOME/$rel"
      if [ "$DRY" = 1 ]; then warn "would back up ~/$rel"; continue; fi
      mkdir -p "$BACKUP/$(dirname "$rel")"
      mv "$src" "$BACKUP/$rel"
      warn "backed up ~/$rel"
      backed_up=1
    done <<<"$list"
    [ "$DRY" = 1 ] && break
  done
  [ "$backed_up" = 1 ] && ok "Backups saved in $BACKUP" || ok "No conflicts"
fi

# ---- 3. agents-sync + stow -------------------------------------------------------------------
step "3/6 Syncing agent skills and linking packages"
run ./scripts/.local/bin/agents-sync --force   # --force: replace stale links from older installs
run make stow PKG="$PKGS"
[ "$DRY" = 0 ] && ok "Linked: $PKGS"

# ---- 3a. Branch guard (agents stay on feature branches) --------------------------------------
step "3a Branch guard"
if have jq && { [ -d "$HOME/.claude" ] || have claude; }; then
  run "$REPO/scripts/.local/bin/guard-default-branch" install-claude-hook
else
  ok "Claude Code not found (hook installs with: guard-default-branch install-claude-hook)"
fi
ok "Git hooks block commits on main/master/develop. Override: ALLOW_DEFAULT_BRANCH=1 or git config devbox.allowDefaultBranch true"

# ---- 3a2. Claude Code status line (model, branch, context, 5h and 7d usage bars) ---------------
if have jq && { [ -d "$HOME/.claude" ] || have claude; }; then
  run "$REPO/scripts/.local/bin/claude-statusline-install"
fi

# ---- 3b. Rex terminal ------------------------------------------------------------------------
if printf '%s' " $PKGS " | grep -q ' rex '; then
  step "3b Rex terminal"
  REXBIN=""
  for c in "$(command -v rex 2>/dev/null || true)" "/Applications/Rex Beta.app/Contents/Helpers/Rex Server.rex/Contents/MacOS/rex" "/Applications/Rex.app/Contents/Helpers/Rex Server.rex/Contents/MacOS/rex"; do
    [ -n "$c" ] && [ -x "$c" ] && { REXBIN="$c"; break; }
  done
  if [ -z "$REXBIN" ]; then
    ok "Rex not found (config is linked at ~/.config/rex/init.lua and applies once Rex is installed)"
  elif [ "$DRY" = 1 ]; then
    run "$REXBIN" config check
  elif "$REXBIN" config check >/tmp/devbox-rex-check.log 2>&1; then
    "$REXBIN" config reload >/dev/null 2>&1 || true
    ok "Rex config valid and reloaded"
  else
    warn "rex config check failed (Rex works without it). First lines of the error:"
    head -n 6 /tmp/devbox-rex-check.log | sed 's/^/      /' >&2
    warn "Full log: /tmp/devbox-rex-check.log   Fix: edit ~/.config/rex/init.lua (or delete it) then run: rex config check"
  fi
fi

# ---- 4. codex config -------------------------------------------------------------------------
step "4/6 Codex config"
if [ -e "$HOME/.codex/config.toml" ]; then
  ok "~/.codex/config.toml already exists (left untouched)"
elif [ -f agents/codex-config.toml.example ]; then
  run mkdir -p "$HOME/.codex"
  run cp agents/codex-config.toml.example "$HOME/.codex/config.toml"
  ok "Created ~/.codex/config.toml from the template"
fi

# ---- 5. SwiftBar (macOS) ---------------------------------------------------------------------
step "5/6 Menu bar (SwiftBar)"
if [ "$PLATFORM" != mac ]; then
  ok "Skipped (macOS only)"
elif [ "$SWIFTBAR" = 0 ]; then
  ok "Skipped (--no-swiftbar)"
elif ! printf '%s' " $PKGS " | grep -q ' swiftbar '; then
  ok "Skipped (swiftbar package not selected)"
else
  if [ ! -d /Applications/SwiftBar.app ] && [ "$INSTALL" = 1 ]; then run brew install --cask swiftbar; fi
  PLUGINS="$HOME/.config/swiftbar/plugins"
  if [ "$DRY" = 0 ]; then chmod +x "$PLUGINS"/*.ts 2>/dev/null || true; fi
  run defaults write com.ameba.SwiftBar PluginDirectory -string "$PLUGINS"
  BUN_PATH="$(command -v bun || true)"
  if [ -n "$BUN_PATH" ] && [ ! -x /opt/homebrew/bin/bun ]; then
    warn "Plugins expect bun at /opt/homebrew/bin/bun but yours is $BUN_PATH."
    warn "Fix: sudo mkdir -p /opt/homebrew/bin && sudo ln -s $BUN_PATH /opt/homebrew/bin/bun"
  fi
  if [ -d /Applications/SwiftBar.app ]; then
    run osascript -e 'tell application "SwiftBar" to quit' 2>/dev/null || true
    run open -a SwiftBar
    ok "SwiftBar pointed at $PLUGINS (system-monitor + ai-usage)"
  else
    warn "SwiftBar is not installed: brew install --cask swiftbar, then re-run ./setup.sh"
  fi
fi

# ---- 6. verify -------------------------------------------------------------------------------
step "6/6 Verifying"
if [ "$DRY" = 1 ]; then
  ok "Dry run finished. Re-run without --dry-run to apply."
  exit 0
fi
skills_src="agents/skills"
total="$(find "$skills_src" -mindepth 1 -maxdepth 1 -type d ! -name '.*' | wc -l | tr -d ' ')"
for dir in "$HOME/.claude/skills" "$HOME/.agents/skills" "$HOME/.config/opencode/skills"; do
  if [ -d "$dir" ]; then
    n="$(find -L "$dir" -mindepth 1 -maxdepth 1 -type d ! -name '.*' 2>/dev/null | wc -l | tr -d ' ')"
    if [ "$n" -ge "$total" ]; then ok "$dir: $n skills"; else warn "$dir: $n of $total skills"; fi
  else
    warn "$dir is missing"
  fi
  if [ -d "$dir" ]; then
    dangling="$(find "$dir" -maxdepth 2 -type l ! -exec test -e {} \; -print 2>/dev/null | wc -l | tr -d ' ')"
    [ "$dangling" -gt 0 ] && warn "$dir: $dangling dangling symlinks (remove: find $dir -maxdepth 1 -type l ! -exec test -e {} \\; -delete)"
  fi
done
if make verify-agent-workflow >/tmp/devbox-verify.log 2>&1; then ok "make verify-agent-workflow passed"; else warn "verify-agent-workflow reported problems, see /tmp/devbox-verify.log"; fi
if [ "$PLATFORM" = linux ]; then ok "AI usage in your bar: see docs/LINUX-STATUSBAR.md (waybar, tmux: ai-usage-bar)"; fi
case ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) warn 'Add to your shell profile: export PATH="$HOME/.local/bin:$PATH"' ;; esac

printf '\n%sDone.%s Restart your terminal and your coding agents so they pick up the new skills.\n' "$G$B" "$N"
printf 'Update later with: %scd %s && git pull && ./setup.sh -y%s\n' "$B" "$REPO" "$N"
