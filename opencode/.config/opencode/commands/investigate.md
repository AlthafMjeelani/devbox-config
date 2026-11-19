---
description: Investigate a bug or failure systematically before proposing fixes.
agent: debugger
---
Use the systematic-debugging skill, plus grounding, code-review and test-writer when relevant.

Issue:
$ARGUMENTS

Context:
!`git status --short`
!`git branch --show-current`
!`git log --oneline -10`

Do not edit files unless the user explicitly asks you to fix it after the investigation.
