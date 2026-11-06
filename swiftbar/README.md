# SwiftBar Dotfiles Package

Two macOS menu bar plugins:

| Plugin | Refresh | Shows |
|---|---|---|
| `system-monitor.10s.ts` | 10 s | CPU, memory, disk, battery and network capacity with top processes |
| `ai-usage.5m.ts` | 5 min | Coding-agent quota left and reset timers (Codex, Claude, Amp, Antigravity, Kimi, CommandCode, OpenCode) |

## System monitor

The menu bar shows `CPU% RAM%` (for example `23% 61%`). It stays in the normal text color while everything is healthy and turns orange or red only when something needs attention, so it does not distract you.

Hover a section in the dropdown for details:

- **Processor**: user/system/idle split, load average against core count, top 5 processes by CPU.
- **Memory**: used vs total, memory pressure (the real health signal on macOS), app/wired/compressed/cached/free, swap, top 5 processes by memory.
- **Storage**: used and free space on the data volume, with a shortcut to Storage settings when it is getting full.
- **Power** (laptops): charge, charging state, time remaining, battery health and cycle count.
- **Network**: live download/upload speed on the default interface, IP address, totals.
- **Uptime**, plus shortcuts to Activity Monitor and Refresh.

Thresholds (warn / critical):

| Metric | Warn | Critical |
|---|---|---|
| CPU | 70% | 90% |
| Memory pressure | 50% | 75% (swap above 4 GB also warns) |
| Disk | 80% used or under 30 GB free | 90% used or under 10 GB free |
| Battery (on battery power) | 20% | 10% |

Edit the numbers in `plugins/system-monitor.10s.ts` to taste. The parsing logic lives in `lib/sysmon.ts` and is covered by `tests/sysmon.test.ts`.

## AI usage

The plugin runs `ai-usage --json` (from the `scripts` package) every 5 minutes.
The menu bar shows the agent to use first and its remaining quota.
The dropdown lists every agent with per-window usage bars and reset countdowns.

## Install

```bash
brew install --cask swiftbar
brew install oven-sh/bun/bun
make restow-scripts stow-swiftbar
```

On first launch, choose `~/.config/swiftbar/plugins` as the SwiftBar plugin folder.
Rename a plugin to change its refresh interval (for example `system-monitor.5s.ts` or `ai-usage.15m.ts`).
The plugins expect Bun at `/opt/homebrew/bin/bun` (Apple Silicon). On an Intel Mac, change the first line to `/usr/local/bin/bun`.
