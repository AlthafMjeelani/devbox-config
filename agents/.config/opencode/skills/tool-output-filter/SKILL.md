---
name: tool-output-filter
description: Use when executing searches, commands, and log views with bounded ranges, targeted queries, and diff hunks while preserving debugging evidence.
---

# Tool Output Filter

## When to use
- Running terminal commands that produce extensive stdout/stderr (builds, test runners, linters).
- Searching codebases with ripgrep or glob tools.
- Viewing large files, log dumps, or system traces.

## Inputs to gather
- Target search term, error signature, or specific line range needed.
- Expected volume of output from the command or file inspection.
- Relevant filter flags (e.g. `--grep`, `-n <N>`, line range parameters).

## Procedure
1. Pre-filter searches:
   Use precise ripgrep queries with filetype includes (e.g. `--glob '*.ts'`) rather than searching all files.
   Avoid unbounded regexes that match thousands of lines.
2. Limit search results:
   Avoid unbounded searches; inspect the first 20-50 matches before expanding scope.
   Refine the query pattern if too many false positives appear.
3. Slice file reads:
   Specify `StartLine` and `EndLine` parameters when viewing files larger than 100 lines.
   Read the specific function or class block rather than the whole module.
4. Bound command output:
   Pipe noisy build or test output through filtering tools (`tail -n`, `grep`) while capturing errors.
   Ensure that critical build failure summaries are not lost in truncated output.
5. Preserve error traces:
   Never suppress stderr or truncate stack traces required to diagnose root cause.
   Retain line numbers, file names, and exception messages.
6. Capture summaries:
   Extract meaningful failure summaries, line numbers, and error messages into working notes.
   Prune repetitive log lines that add no diagnostic value.

## Output / handoff
- Concise, evidence-based snippets containing exact line numbers, error messages, and context.
- Uncluttered working memory ready for diagnosis.

## Verification and guardrails
- Do not hide or silence failures; every filtered error must be accounted for.
- Do not dump entire log files or dependency trees into context.
- Ensure line numbers in filtered outputs accurately correspond to current file contents.
- Keep raw error messages intact when reporting bugs.
