# Agent icons

Drop one PNG per agent here (name in lowercase) and the AI usage dropdown will show it instead of the
generic symbol:

`codex.png  claude.png  amp.png  antigravity.png  kimi.png  commandcode.png  opencode.png`

Easiest way on a Mac, using the icon of the app you already have installed:

```sh
agent-icons set claude /Applications/Claude.app
agent-icons set codex  ~/Downloads/my-codex-icon.png
agent-icons list
```

Square images around 64x64 work best. Missing files simply fall back to the built-in glyphs.
