---
name: rex-terminal
description: Operate the Rex terminal (Superlogical) from an agent - open panes, run commands with exit codes, type into other agents, read screens, watch agent status and write init.lua keybindings. Use when REX_SESSION is set or the user mentions Rex.
---

# Rex terminal

Rex is a terminal with persistent sessions and a scriptable CLI. Inside any Rex terminal `rex` is already on PATH, and `REX_SESSION` and `REX_BLOCK` say where you are.

## Vocabulary
| Rex | tmux | Flag |
|---|---|---|
| server | server | `-S` |
| session | session | `-s` |
| window (a tab) | window | `-w` |
| block | pane | `-b` |

## Core commands
- `rex run --wait -- <cmd>`: run in a new block and get the real exit code back. Prefer this for builds and tests.
- `rex split ...`: open a pane beside you (`--label`, `--keep-open`, `--focus`, `--json`).
- `rex send -s S -b B 'text'` then `rex send-key -s S -b B enter`: type into a block (an agent prompt, a shell).
- `rex capture -b B --trim`: read a block's screen and scrollback. Also `--unwrap`.
- `rex block call -b B program_status`: state of the agent in that block: idle, working, done, blocked (permission, question, auth), error.
- `rex events --json`: one JSON event per line (`program_status_changed`, `title_changed`). Use it to wait instead of polling.
- `rex ls`, `rex session inspect`, `rex session kill <name>`, `rex whoami`.
- `rex config check | reload`, `rex keymap`: validate and apply `~/.config/rex/init.lua`.

## Rules
1. Verify with your own eyes: after a child agent says it is done, read the files, test output or git state yourself.
2. Newlines submit a prompt. Fold messages to one line; for long instructions write a file and send "read TASK.md".
3. Give each parallel agent its own git worktree. Two sessions editing the same files collide.
4. The Rex server is shared. Never kill Rex processes or restart the server; end only sessions you started.
5. Leave panes open when the user may want to read them.
6. Remote control must be on in Rex settings for the CLI to drive the app.

## Config (init.lua)
Keys join with `>`: `rex.bind("ctrl+q>v", "pane.split", { direction = "right" })`. Custom actions use `rex.action{ name, title, run = function(ctx, args) ... end }`, are bindable and runnable with `rex do`. Always run `rex config check` after editing.

In this repo: `rex/.config/rex/init.lua` (keys) and `rex-agents` (helper: spawn, send, read, status, watch, kill).
