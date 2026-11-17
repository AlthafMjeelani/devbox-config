# Flutter and FVM command resolution

# Flutter and FVM Command Resolution

Resolve the Flutter command once at the beginning of the task and use the same SDK for every Flutter and Dart operation.

## Resolution Priority

### 1. Project Uses FVM

Treat the project as FVM-managed when `.fvmrc` or a valid `.fvm/flutter_sdk` exists.

When FVM is available, use:

```sh
fvm flutter <command>
fvm dart <command>
```

Do this even when a separate global `flutter` executable is available, because the project-pinned SDK has priority.

If `.fvmrc` exists but its SDK is not installed, run:

```sh
fvm install
```

Then retry the original operation with `fvm flutter` or `fvm dart`.

Do not replace, remove, or modify `.fvmrc` unless the user explicitly asks to change the project's Flutter version.

### 2. No Project FVM Configuration

Try the normal SDK:

```sh
flutter --version
dart --version
```

When successful, use normal `flutter` and `dart` commands consistently.

### 3. Flutter Is Not Found

When `flutter` is unavailable, check FVM:

```sh
fvm --version
fvm flutter --version
```

If FVM can resolve a project or global SDK, use:

```sh
fvm flutter <command>
fvm dart <command>
```

If the repository contains `.fvmrc`, run `fvm install` before retrying.

### 4. New Flutter Project

For a genuinely new project where no SDK version has been selected, prefer a pinned stable SDK:

```sh
fvm use stable --pin
fvm flutter create .
```

Do not apply `fvm use stable --pin` to an existing application merely because its Flutter executable is missing.

### 5. Neither Flutter Nor FVM Is Available

Do not pretend that validation succeeded.

Report the missing tooling and provide the exact installation or PATH action required for the detected operating system. Do not install global software or edit shell profiles unless the user explicitly authorizes it.

## Command Substitution Rule

Whenever this skill mentions a command beginning with `flutter` or `dart`, substitute the resolved runner:

| Operation | Normal SDK | FVM SDK |
|---|---|---|
| Version | `flutter --version` | `fvm flutter --version` |
| Doctor | `flutter doctor -v` | `fvm flutter doctor -v` |
| Dependencies | `flutter pub get` | `fvm flutter pub get` |
| Analyze | `flutter analyze` | `fvm flutter analyze` |
| Test | `flutter test` | `fvm flutter test` |
| Run | `flutter run` | `fvm flutter run` |
| Build | `flutter build ...` | `fvm flutter build ...` |
| Format | `dart format .` | `fvm dart format .` |
| Fix | `dart fix --apply` | `fvm dart fix --apply` |
| Code generation | `dart run build_runner build` | `fvm dart run build_runner build` |

Never mix global Flutter with FVM Dart, or global Dart with FVM Flutter, within the same task.

