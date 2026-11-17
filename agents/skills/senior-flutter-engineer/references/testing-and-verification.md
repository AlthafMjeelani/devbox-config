# Testing, mandatory verification and validation workflow

# Testing Strategy

Every behaviour change should have proportionate verification.

## Unit Tests

Use for:

- use cases,
- repositories with mocked boundaries,
- mapping,
- validation,
- calculations,
- state controllers,
- synchronization rules,
- error translation.

## Widget Tests

Use for:

- rendering states,
- user interactions,
- form validation,
- navigation triggers,
- accessibility semantics,
- state-driven UI.

## Integration Tests

Use for critical end-to-end flows such as:

- authentication,
- checkout or payment,
- order submission,
- offline synchronization,
- database migration,
- platform integrations,
- release-critical journeys.

## Testing Rules

- Keep tests deterministic.
- Avoid real network calls in unit and widget tests.
- Control clocks, random values, IDs, and platform services when they affect results.
- Test success, empty, loading, validation, failure, cancellation, and retry behaviour as applicable.
- Add regression tests for fixed bugs.
- Do not weaken assertions merely to make tests pass.
- Do not delete failing tests without understanding what contract they protect.
- Prefer behaviour-focused tests over implementation-detail tests.
- Use goldens selectively for stable visual contracts.


# Mandatory Verification for Every Task

Every Flutter task must end with formatting and error verification.

This rule applies to:

- new features,
- bug fixes,
- refactoring,
- code review changes,
- dependency changes,
- generated-code changes,
- UI changes,
- configuration changes,
- platform changes,
- small one-line fixes.

Do not mark a task complete without performing the applicable checks.

## Required Checks

At minimum, run the resolved SDK equivalents of:

```sh
dart format .
flutter analyze
```

When project tests exist or the change affects behaviour, also run:

```sh
flutter test
```

For a focused change, run the affected test first:

```sh
flutter test test/path/to/affected_test.dart
```

Then run the broader test suite when practical:

```sh
flutter test
```

When code generation is used, run the project-required generation command before analysis:

```sh
dart run build_runner build --delete-conflicting-outputs
```

When the project uses FVM, the commands must become:

```sh
fvm dart format .
fvm flutter analyze
fvm flutter test
```

## Error Verification Rules

- Check the command exit status.
- Read and report analyzer errors and warnings.
- Fix errors introduced by the current task.
- Fix formatting issues in touched files.
- Do not ignore warnings without a documented reason.
- Do not suppress analyzer rules merely to make validation pass.
- Do not claim that formatting, analysis, or tests passed unless the command was actually run successfully.
- Clearly report pre-existing errors separately from errors introduced by the current change.
- If tooling is unavailable, report exactly which command could not run and why.
- If a platform build is relevant, run the appropriate debug or release build check.
- Re-run failed validation after applying fixes.

## Required Completion Gate

Before giving the final response, verify:

```text
[ ] Changed files are formatted
[ ] Flutter analyzer was executed
[ ] Analyzer errors introduced by this task are resolved
[ ] Relevant tests were executed
[ ] Generated files are current when applicable
[ ] Relevant platform build was checked when applicable
[ ] Any remaining pre-existing errors are clearly reported
```

A task is not complete until this verification gate has been evaluated.

# Validation Workflow

After implementation, run the relevant commands using the resolved Flutter/FVM runner.

Minimum validation for most code changes:

```sh
flutter pub get
dart format .
flutter analyze
flutter test
```

Substitute FVM commands when FVM is selected.

For focused changes, run the narrowest tests first, then the broader suite:

```sh
flutter test test/path/to/affected_test.dart
flutter test
```

When required, also run:

```sh
dart run build_runner build --delete-conflicting-outputs
flutter test integration_test
flutter build apk --debug
flutter build appbundle
flutter build ios --no-codesign
flutter build web
```

Only run platform builds relevant to the task and available environment.

## Validation Failures

When validation fails:

1. Determine whether the failure was introduced by the current change.
2. Fix current-change failures.
3. Do not silently modify unrelated code to force a green result.
4. Clearly separate pre-existing failures from new failures.
5. Report the exact failing command and useful error summary.
6. Never claim tests passed when they were not run or did not complete.

