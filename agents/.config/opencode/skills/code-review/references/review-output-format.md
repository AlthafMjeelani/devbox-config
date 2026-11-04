# Code Review Output Format

## Review Summary
- Target Branch / Diff:
- Requirements Reference:
- Overall Verdict: [APPROVE | REQUEST CHANGES | COMMENT]

## Findings

### Critical (Blockers - Security, Data Loss, Crash, Broken Path)
- `[Spec | Standards]` **[file_path:line]**: Description of issue.
  - *Impact*: Why this breaks production or loses data.
  - *Recommendation*: Concrete fix or alternative.

### Important (Likely Bugs, Unhandled Edge Cases, Missing Tests)
- `[Spec | Standards]` **[file_path:line]**: Description of issue.
  - *Impact*: Potential regression or failure mode.
  - *Recommendation*: Suggested mitigation.

### Minor (Maintainability, Clarity, Minor Idiom Improvements)
- `[Standards]` **[file_path:line]**: Observation and suggestion.

## Verification & Residual Risks
- Tests Verified: [List commands executed and results]
- Unreviewed Areas / Out of Scope:
- Residual Operational Risks:
