# AI usage in a Linux status bar

`ai-usage-bar` shows the same thing as the macOS menu bar (attention first, best agent next, reset timers, alerts) in any Linux bar. It reads `ai-usage --json` and needs only Bun, which `./setup.sh` installs.

```sh
ai-usage-bar                    # ✺ Cl 8%▲ 5h ↻59m  ϟ Amp 90%  +4 ok
ai-usage-bar --format waybar    # JSON for waybar
ai-usage-bar --format tmux      # colored for tmux status-right
ai-usage-bar --notify           # also send desktop notifications on changes
```

## Waybar

`~/.config/waybar/config.jsonc`:

```jsonc
"custom/ai-usage": {
  "exec": "ai-usage-bar --format waybar --notify",
  "return-type": "json",
  "interval": 300,
  "on-click": "ai-usage",
  "tooltip": true
}
```

Add `"custom/ai-usage"` to `modules-right`, then style by state in `style.css`:

```css
#custom-ai-usage.ok       { color: #30D158; }
#custom-ai-usage.warning  { color: #FF9F0A; }
#custom-ai-usage.critical { color: #FF453A; }
#custom-ai-usage.unknown  { color: #8E8E93; }
```

## tmux

```tmux
set -g status-interval 300
set -g status-right '#(ai-usage-bar --format tmux) %H:%M'
```

## i3status-rust, polybar, others

Use the plain output: `ai-usage-bar` prints one line. Poll it every 5 minutes.

## Notes

- Notifications use `notify-send` (libnotify) and fire only when an agent drops to critical or is available again. The first run is silent.
- If `ai-usage` fails, the last good result is shown with `⟳stale`.
- Pass `--notify` on one bar only, or alerts repeat.
- The system monitor plugin (`swiftbar/`) is macOS only. On Linux use btop, htop or your bar's built-in modules.
