# Herdr GUI (herdr-app)

Config for the native Herdr GUI, taken from the dotfiles repo. The app itself is installed separately; only your own files are tracked here.

- `keys.json`: key bindings, including the tmux-style `Ctrl+B` prefix keys (`Ctrl+B ?` lists them).
- `settings.json`: zoom, sounds and contrast. No theme is set, so the app default applies.
- `layouts/workspace.json`: the `main` layout with `worktree-support` as the spaces list (`Ctrl+Shift+L` to switch).
- `mods/`: `git-graph` (`Ctrl+Shift+G`), `float-space` (`Ctrl+Shift+Space`), `agent-deck-overview` (`Ctrl+Shift+D`), `agent-resume` (`Ctrl+Shift+R`), `workspace-tabs`, `worktree-support`, `worktree-actions`, `last-pane` and `prefix`.

Left out on purpose: the Noctalia theme (a Linux desktop theme) and the `sessionizer` mod (it needs a `herdr-sessionizer.sh` script this repo does not have).

`agent-resume` learns sessions from hooks. Install them with `python3 ~/.config/herdr-app/mods/agent-resume/agent_resume.py install-hooks`.

## Rex

Rex has its own Lua config (`rex/.config/rex/init.lua`). Its `Ctrl+Q` prefix already mirrors the Herdr `Ctrl+B` keys for tabs, sessions, splits, zoom, close and balance. The Herdr mods are JavaScript for the Herdr GUI and do not run in Rex.
