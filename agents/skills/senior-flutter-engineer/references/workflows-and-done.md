# Bug, feature and review workflows, git safety, definition of done, final response

# Bug-Fixing Workflow

1. Reproduce or establish the failing path.
2. Trace the issue across presentation, state, domain, data, persistence, and platform boundaries as needed.
3. Identify root cause rather than patching only the visible symptom.
4. Add a regression test when feasible.
5. Make the smallest safe fix.
6. Check adjacent flows for the same defect pattern.
7. Run format, analyze, and relevant tests.
8. Summarize root cause, fix, and verification.

# Feature Workflow

1. Read the feature request and relevant existing code.
2. Clarify assumptions from repository evidence before asking the user.
3. Identify affected architecture boundaries and data contracts.
4. Define loading, success, empty, error, retry, and offline behaviour where relevant.
5. Implement domain and data behaviour before coupling it to UI.
6. Build UI using existing design-system components.
7. Add tests at the correct layers.
8. Run code generation if required.
9. Format, analyze, test, and build as appropriate.
10. Report changed files and important decisions.

# Code Review Workflow

Review by severity, not by file order.

Prioritize:

1. Data loss, security, privacy, payment, and authorization risks
2. Crashes, race conditions, lifecycle defects, and incorrect async handling
3. Business-rule defects
4. Offline synchronization and transaction consistency
5. Architecture boundary violations
6. Performance and rebuild problems
7. Accessibility and localization defects
8. Test gaps
9. Maintainability and naming
10. Style-only observations

For every finding include:

- severity,
- precise location,
- why it is a problem,
- realistic failure scenario,
- recommended correction.

Do not report speculative issues as confirmed defects.

# Git and Change Safety

- Inspect existing changes before editing.
- Keep diffs focused.
- Do not reformat unrelated files.
- Do not revert user changes.
- Do not delete files unless required.
- Do not modify lockfiles unnecessarily.
- Do not commit, push, force-push, rebase, reset, or clean unless explicitly requested.
- Never expose signing credentials or secrets in output.
- Mention generated or platform files changed by tooling.

# Definition of Done

A Flutter task is complete only when applicable conditions are met:

- The requested behaviour is implemented.
- The implementation follows existing architecture.
- No unrelated behaviour was changed.
- Generated code is current.
- Formatting is clean.
- Analyzer results were checked.
- Relevant tests pass.
- Platform configuration is valid.
- Loading, empty, error, retry, and offline states are handled where applicable.
- Security and sensitive logging were reviewed.
- Accessibility and localization were considered for UI changes.
- The final response states what changed and what was actually verified.

# Final Response Format

Keep the delivery concise and engineering-focused:

```text
Implemented
- Main behaviour changed
- Important architectural decision

Files
- path/to/file.dart
- path/to/test.dart

Validation
- format: passed
- analyze: passed
- tests: passed
- build: not run (reason)

Notes
- Remaining risk, migration, or follow-up only when relevant
```

Never say a validation step passed unless it was executed successfully.

For every completed task, the final response must explicitly report:

- formatting result,
- analyzer result,
- test result,
- build result when applicable,
- any unresolved or pre-existing errors.

