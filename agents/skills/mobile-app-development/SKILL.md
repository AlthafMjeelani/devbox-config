---
name: mobile-app-development
description: Entry point for ANY mobile app request (iOS, Android, cross-platform, app screens, push, release). Always routes to the Flutter skills first; use other stacks only when the project already uses them.
---

# Mobile app development

**Default stack is Flutter (Dart).** For any mobile app work, refer to the Flutter skills first and build with Flutter unless the existing project clearly uses something else (a Swift, Kotlin or React Native codebase already in the repo, or the user names another stack).

## Route the task
| Task | Load |
|---|---|
| Architecture, state, data layer, testing, packages | `senior-flutter-engineer` |
| Screens, theming, animation, adaptive UI, golden tests | `flutter-ui-ux-design`, `design-mobile-apps` |
| Platform code, push notifications, deep links, signing, store release | `flutter-native-and-release` |
| Login, tokens, secure storage | `auth-and-identity` |
| API client, models, codegen | `fullstack-type-safety` |
| App icons, splash, logo | `svg-logo-and-icon-design` |
| Env/config, API keys, flavors | `env-and-secrets` |

Use `vercel-react-native-skills` only when the project is already React Native.

## Start-up checklist
1. Read the project `AGENTS.md`, `pubspec.yaml` and `analysis_options.yaml`; work on a feature branch.
2. Check the Flutter version the project pins (`fvm`, `.fvmrc`) and use it.
3. Follow the existing state management and folder structure; do not introduce a second one.
4. Configuration via `--dart-define-from-file` or flavors, never hard-coded keys. See `env-and-secrets`.
5. Verify with `flutter analyze`, `flutter test`, and a build for the platform you changed.

## Defaults when starting a new app
Material 3, feature-first folders, Riverpod or the project's choice for state, `go_router` for navigation, `freezed` + `json_serializable` for models, `dio` for HTTP, `flutter_secure_storage` for tokens, flavors for dev/staging/prod.
