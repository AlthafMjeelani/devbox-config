# Dart, UI and state management standards

# Dart Standards

- Use sound null safety.
- Prefer immutable data.
- Use `final` by default and `const` whenever values are compile-time constants.
- Use explicit, meaningful names.
- Avoid abbreviations except established domain terms.
- Keep public APIs small.
- Prefer named parameters when a call has multiple values of the same type or unclear meaning.
- Mark required named parameters with `required`.
- Prefer enums, sealed classes, and value objects over magic strings and integers.
- Use exhaustive pattern matching for sealed state where supported.
- Avoid `dynamic` unless interacting with genuinely dynamic external data.
- Avoid unchecked `as` casts and non-null assertions.
- Do not use `late` to bypass correct initialization design.
- Keep functions focused and reduce hidden side effects.
- Prefer composition over inheritance.
- Do not create generic utility classes that become unrelated dumping grounds.
- Document decisions and non-obvious constraints, not obvious syntax.
- Keep generated files out of manual edits.
- Respect all repository lint rules.
- Do not disable lints globally to avoid fixing local code.

## Formatting

Run the resolved equivalent of:

```sh
dart format .
```

Prefer formatting only touched files in very large repositories when full formatting would create unrelated changes.

# Flutter UI Standards

- Build small, focused widgets.
- Extract widgets when doing so improves readability, reuse, testing, or rebuild isolation.
- Do not split every few lines into a separate widget without benefit.
- Prefer `StatelessWidget` unless local mutable lifecycle state is required.
- Use `const` constructors wherever valid.
- Keep business logic outside widgets.
- Never trigger network calls directly from `build`.
- Avoid side effects in `build`.
- Use lifecycle-safe initialization.
- Check `context.mounted` or `mounted` after asynchronous gaps before using context or state.
- Dispose controllers, focus nodes, animation controllers, streams, and subscriptions.
- Use stable keys when identity matters in dynamic lists.
- Use `ListView.builder`, slivers, or pagination for large collections.
- Avoid deeply nested conditionals in widget trees; model UI states explicitly.
- Use the project's theme and design tokens rather than hard-coded visual values.
- Support light and dark themes when the product requires them.
- Respect safe areas, keyboard insets, text scaling, and multiple screen sizes.
- Do not assume phone-only dimensions when tablet, desktop, or web is in scope.

## Responsive Design

Select layout using available constraints rather than device-name checks.

Prefer:

- `LayoutBuilder`
- `MediaQuery.sizeOf`
- adaptive navigation patterns
- max-width content constraints
- responsive spacing and grids
- reusable breakpoint definitions owned by the design system

Avoid scattering raw breakpoint numbers throughout widgets.

## Accessibility

- Add semantic labels where visual meaning is not automatically exposed.
- Ensure keyboard and focus navigation where relevant.
- Do not encode state using color alone.
- Support text scaling without clipping critical content.
- Maintain readable contrast.
- Provide sufficiently large interactive targets.
- Respect reduced-motion expectations for nonessential animation.
- Test important screens with screen-reader semantics when accessibility matters.

# State Management

Use the state-management solution already present in the repository.

Regardless of framework:

- Keep state immutable.
- Represent loading, data, empty, error, refreshing, and paginated states explicitly where applicable.
- Keep transient UI state separate from business state.
- Avoid multiple competing sources of truth.
- Avoid storing derivable values when they can be computed safely.
- Scope state to the smallest valid lifetime.
- Cancel obsolete requests and subscriptions.
- Prevent duplicate submissions.
- Model one-time effects deliberately rather than hiding them inside persistent state.
- Do not pass `BuildContext` into repositories or business services.
- Make asynchronous transitions deterministic and testable.

## Riverpod

When the project uses Riverpod:

- Prefer generated providers when the project already uses Riverpod code generation.
- Use `Notifier`/`AsyncNotifier` or their generated equivalents for feature state.
- Use `ref.watch` for reactive dependencies and `ref.read` for one-time actions.
- Use `select` to reduce unnecessary rebuilds when beneficial.
- Use `autoDispose` for short-lived state unless persistence is intentional.
- Keep providers focused and avoid a global provider graph with hidden coupling.
- Do not put navigation or snackbar behaviour in repositories.

## BLoC/Cubit

When the project uses BLoC:

- Events describe intent.
- States are immutable and meaningful.
- Keep handlers deterministic.
- Use event transformers when concurrency behaviour matters.
- Avoid emitting UI widgets or `BuildContext`.
- Prefer Cubit for simple transitions and BLoC when event modelling adds real value.

## Provider, GetX, MobX, Redux, or Other Existing Solutions

Follow the established project pattern without mixing a second state-management framework into the same feature.

