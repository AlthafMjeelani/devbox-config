# SwiftBar Dotfiles Package

macOS menu bar plugin showing coding-agent quota use and reset times.

The plugin runs `ai-usage --json` (from the `scripts` package) every 5 minutes.
The menu bar shows the agent to use first and its remaining quota.
The dropdown lists every agent (Codex, Claude, Amp, Antigravity, Kimi, CommandCode, OpenCode) with per-window usage bars and reset countdowns.

## Install

```bash
brew install --cask swiftbar
make restow-scripts stow-swiftbar
```

On first launch, choose `~/.config/swiftbar/plugins` as the SwiftBar plugin folder.
Rename `ai-usage.5m.ts` to change the refresh interval (for example `ai-usage.15m.ts`).
