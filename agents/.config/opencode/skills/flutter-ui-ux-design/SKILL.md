---
name: flutter-ui-ux-design
description: Design polished Flutter UIs - Material 3 ThemeExtension tokens, adaptive Cupertino, CustomPainter and shaders, Rive/Lottie animation, and golden screenshot tests.
---

# Flutter UI/UX Design

## Design tokens
- Build `ThemeData(useMaterial3: true, colorScheme: ColorScheme.fromSeed(...))` for light and dark.
- Put brand tokens (spacing, radii, semantic colors, motion durations) in a `ThemeExtension<AppTokens>` with `copyWith` and `lerp`; access via `Theme.of(context).extension<AppTokens>()!`.
- No hardcoded colors or magic numbers in widgets.

## Adaptive UI
- `LayoutBuilder`/`MediaQuery` breakpoints (compact <600, medium <840, expanded). Use `NavigationBar` -> `NavigationRail` -> drawer.
- Use `.adaptive` constructors (Switch, Slider, Dialog) or `CupertinoPageRoute` on iOS for platform feel.

## Custom graphics
- `CustomPainter`: keep `shouldRepaint` accurate, wrap in `RepaintBoundary`, avoid allocating in `paint`.
- Fragment shaders (`FragmentProgram.fromAsset`) for gradients/effects; declare in `pubspec.yaml` under `flutter: shaders:`.

## Animation
- Implicit animations first (`AnimatedContainer`, `TweenAnimationBuilder`), explicit controllers when needed. Respect `MediaQuery.disableAnimations`.
- Rive for interactive state machines, Lottie for one-shot illustrations; keep files small and preload.

## Quality
- Touch targets >= 48dp, contrast >= 4.5:1, `Semantics` labels, scale with text size.
- Golden tests: `matchesGoldenFile` per theme/size via `alchemist` or `golden_toolkit`; run on one OS in CI to avoid font drift.
