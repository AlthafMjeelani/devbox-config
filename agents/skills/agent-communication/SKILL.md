---
name: agent-communication
description: How agents talk to each other and to the user - handoff files, status signals, terminal messaging (Rex, herdr, tmux), and when to ask versus decide. Use when coordinating several agents or handing work between sessions.
---

# Agent communication

Agents share no memory. Everything that must survive a handoff goes in a file, a commit, or a message. Prefer the most durable channel that fits.

## Channels (most to least durable)
1. **Files in the worktree**: `TASK.md` (instructions), `REPORT.md` (results), `PLAN.md` (orchestrator state). Best for anything longer than a sentence.
2. **Git**: commits and branch names carry the work; commit messages say why.
3. **Terminal messaging**: type a short pointer into the other agent's prompt.
   - Rex: `rex-agents send <name> "Read TASK.md and start"`, `rex-agents read <name>`.
   - herdr / tmux: use their send-keys equivalents; same rules.
4. **Status signals**: Rex and herdr report each agent as idle, working, done, blocked or error. Read them instead of guessing from the screen.

## Message rules
- One line per terminal message (newlines submit). Put detail in a file and point to it.
- Say what you want, the file to read, and what to produce: "Read TASK.md, implement it, write REPORT.md, then stop."
- Include identifiers: branch, worktree path, session name.
- Never paste secrets into messages or files that get committed.

## Handoff contents (REPORT.md)
- What changed (files, behavior) and why.
- What was verified (commands run and results) and what was not.
- Open questions and risks.
- Next step for whoever continues.

## Ask or decide
- Decide yourself when the choice is reversible and cheap; note the decision in REPORT.md.
- Ask the user when it is irreversible, costs money, affects other people, or the requirements conflict.
- A blocked agent asking permission is a signal to the orchestrator: answer promptly or reassign.

## Avoid
- Relying on "I told it earlier": the other agent may have restarted. Re-send the file pointer.
- Two agents writing the same file. Assign ownership per path.
- Trusting another agent's summary without checking the diff or test output.

See also: `agent-orchestration`, `rex-terminal`.
