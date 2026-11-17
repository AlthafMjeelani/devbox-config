# Networking, persistence, security, performance, platform, i18n, dependencies, codegen

# Networking and API Integration

- Keep endpoint paths, headers, timeout policy, and environment configuration centralized.
- Use typed request and response models.
- Validate and normalize external data.
- Separate DTOs from domain entities when architecture requires it.
- Translate transport exceptions into application failure types at the data boundary.
- Distinguish timeout, connectivity, authorization, validation, server, cancellation, and unknown failures when behaviour differs.
- Do not expose raw stack traces or server messages directly to users.
- Support cancellation for replaceable requests such as search.
- Add retries only for safe, idempotent operations and only with bounded backoff.
- Never automatically retry a non-idempotent payment, order, collection, upload, or submission without a valid idempotency design.
- Handle pagination explicitly.
- Do not log access tokens, passwords, private keys, payment data, or sensitive personal data.
- Redact sensitive request and response fields in logs.
- Respect certificate and TLS validation. Never disable certificate validation as a workaround.

# Offline-First and Synchronization

For offline-capable applications:

- Define the local source of truth.
- Persist pending operations with stable local identifiers.
- Make synchronization resumable.
- Use idempotency keys or deterministic identifiers for server writes where possible.
- Track sync state and failure reason.
- Distinguish local creation time from server acknowledgement time.
- Preserve ordering when business rules depend on it.
- Design conflict resolution explicitly.
- Never discard unsynced user data silently.
- Avoid marking a record synchronized before the server has acknowledged it.
- Use database transactions for local multi-record consistency.
- Make retry behaviour bounded and observable.
- Test duplicate delivery, partial failure, process restart, network loss, and server rejection scenarios.

# Persistence

- Use repositories as the boundary for storage concerns.
- Version database schemas.
- Write reversible or safely forward-only migrations according to project policy.
- Do not perform destructive migration fallback in production.
- Keep secure values out of plain preferences.
- Avoid storing entire large API payloads when normalized data is appropriate.
- Use transactions for related writes.
- Close resources correctly.
- Test migrations using representative old schemas when data durability matters.

# Error Handling

Use explicit failure modelling appropriate to the architecture.

Good patterns include:

- sealed failure types,
- typed result objects,
- domain-specific exceptions translated at boundaries,
- `AsyncValue` or equivalent state wrappers at presentation boundaries.

Rules:

- Catch errors only where they can be handled, translated, logged, retried, or cleaned up.
- Preserve stack traces when rethrowing.
- Avoid empty `catch` blocks.
- Avoid `catch (_) {}`.
- Never convert every failure into a generic `false`.
- Provide actionable, localized user messages.
- Keep developer diagnostics separate from user-facing text.
- Always restore loading/submitting state in failure paths.
- Treat cancellation differently from failure.

# Security and Privacy

- Never commit secrets, API keys, signing files, service credentials, or private certificates.
- Use environment or build-time configuration according to project policy.
- Store sensitive runtime values using platform-backed secure storage.
- Do not rely on client-side authorization for server security.
- Validate deep links and externally supplied navigation arguments.
- Sanitize untrusted content rendered in web views.
- Use minimum required platform permissions.
- Do not log secrets or sensitive personal data.
- Clear sensitive in-memory and persisted values on logout when appropriate.
- Review Android and iOS permission declarations when adding plugins.
- Do not weaken transport security for development convenience.

# Performance

Optimize based on evidence.

- Avoid expensive synchronous work on the UI isolate.
- Move CPU-heavy parsing or computation off the UI isolate when measurements justify it.
- Prevent unnecessary widget rebuilds using proper state granularity.
- Use lazy lists and pagination.
- Resize and cache images appropriately.
- Avoid decoding full-resolution images for small thumbnails.
- Reuse controllers and expensive objects with correct lifecycle ownership.
- Avoid repeated object creation inside hot build paths when it is measurable.
- Use Flutter DevTools, performance overlays, traces, and release/profile builds to diagnose issues.
- Do not claim a performance improvement without measurement when benchmarking is possible.

# Platform Integration

When changing Android, iOS, web, desktop, or plugin configuration:

- Inspect existing minimum SDK and deployment targets.
- Verify plugin compatibility with the project's Flutter version.
- Apply changes only to required platforms.
- Keep Android Gradle, Kotlin, Java, iOS, CocoaPods, Swift, and Xcode settings compatible with the repository.
- Preserve signing configuration.
- Do not expose secrets in Gradle, plist, manifest, or source files.
- Add required permissions with a clear reason.
- Handle denied, permanently denied, restricted, and unavailable permission states.
- Test lifecycle behaviour, background/foreground transitions, and process recreation when relevant.
- Use method channels only when a maintained plugin or Dart implementation is unsuitable.
- Keep native-channel contracts typed and versioned.

# Internationalization

When localization exists:

- Do not hard-code user-facing strings.
- Use the project's localization generation system.
- Support pluralization, gender, dates, times, numbers, and currencies correctly.
- Avoid string concatenation that breaks translation.
- Support right-to-left layout where required.
- Keep backend error codes separate from localized display messages.

# Dependency Management

Before adding a package:

1. Check whether the project already has an equivalent capability.
2. Confirm the package is compatible with the project's Flutter and Dart constraints.
3. Evaluate maintenance, platform support, licensing, transitive impact, and API stability.
4. Prefer focused, well-maintained packages.
5. Avoid packages for trivial utilities that are easy to implement safely.
6. Add the narrowest compatible constraint consistent with repository policy.
7. Run dependency resolution and validation.

Do not upgrade unrelated packages during a feature or bug-fix task.

Do not run broad dependency upgrades unless explicitly requested.

# Code Generation

Detect code-generation tools from `pubspec.yaml` and existing generated files.

Typical command:

```sh
dart run build_runner build --delete-conflicting-outputs
```

Use the FVM Dart equivalent when FVM is selected.

Rules:

- Run code generation only when inputs changed or generated outputs are required.
- Never manually edit generated files.
- Review generated diffs for unexpected changes.
- Do not delete conflicting outputs blindly if they contain intentional manual changes; investigate first.
- Follow repository policy on committing generated files.

