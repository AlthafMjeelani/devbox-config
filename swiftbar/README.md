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

Runs `ai-usage --json` (from the `scripts` package) every 5 minutes.

**Menu bar**: shows what needs attention first, then the best agent to spend next, for example
`✺ Cl 8%▲ 5h ↻59m   ϟ Amp 90%   ⌘ Cx 70% 7d ↻3d 11h   +4 ok`.
At most 3 agents are shown; the rest collapse into `+N ok` (or `+N (2▲)` if some of the hidden ones need attention).
Each agent has its own icon (Codex ⌘, Claude ✺, Amp ϟ, Antigravity △, Kimi ☾, CommandCode ❯, OpenCode {}) in its identity color. The text after it takes the status color, with a `▲` when it is low or on pace to run out. `↻` is the time until the quota resets. In the dropdown each agent gets its own SF Symbol icon. The icons are generic shapes, not vendor logos.

**Dropdown**: agents sorted worst first. Each agent is one line (quota left, worst window, reset); hover it for every window, a usage bar and the burn-rate forecast (`at 23%/h you hit the limit in 20m`, plus the pace that is safe).

**Logic**
- **Use first** recommends the usable pool that resets soonest, but never one that is nearly exhausted (10% or less left) or blocked.
- Status colors: green above 30% left, orange at 30% or less or when the current pace would hit the limit before reset, red at 10% or less.
- **Notifications** fire only on changes: when an agent drops to critical, and when it is available again. The first run after install is silent.
- **Stale fallback**: if `ai-usage` fails, the last good result is shown with a `⟳stale` marker instead of an empty bar.
- Logins that are missing are listed under *Needs login* with a one-click fix.

The logic lives in `lib/aiusage.ts` and is covered by `tests/aiusage.test.ts`.

## Install

```bash
brew install --cask swiftbar
brew install oven-sh/bun/bun
make restow-scripts stow-swiftbar
```

On first launch, choose `~/.config/swiftbar/plugins` as the SwiftBar plugin folder.
Rename a plugin to change its refresh interval (for example `system-monitor.5s.ts` or `ai-usage.15m.ts`).
The plugins expect Bun at `/opt/homebrew/bin/bun` (Apple Silicon). On an Intel Mac, change the first line to `/usr/local/bin/bun`.
