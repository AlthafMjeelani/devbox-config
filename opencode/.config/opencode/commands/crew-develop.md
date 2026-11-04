---
description: Split independent implementation work across isolated AI crew branches.
agent: build
---
Use the crew skill.

Act as the crew captain. Do not implement the requested changes in the current
workspace. First inspect the repository and split the request into genuinely
independent, shippable tasks. Do not dispatch tasks that modify the same core
files.

For each task, provide a self-contained brief with the goal, acceptance
criteria, ownership boundary, allowed changes, and verification commands. Then
dispatch one crewmate per task with `crew new`, using an explicit branch name
when the task name is not clear. Prefer the default OpenCode engine unless the
user requests another engine.

After dispatching, report the branches and commands to monitor them. Never
push, merge, or continuously poll. Ready branches must be reviewed with
`/review-diff` and shipped with `/ship-gate`.

Request:
$ARGUMENTS
