---
name: flutter-native-and-release
description: Flutter platform integration and release - Kotlin/Swift MethodChannels, FCM/APNs push notifications, deep links, and Fastlane signing and store release.
---

# Flutter Native and Release

## MethodChannel
- Define one channel per feature, name `com.example.app/feature`. Wrap in a Dart service class; never call channels from widgets.
- Android: handle in `MainActivity.configureFlutterEngine` (Kotlin); iOS: `FlutterMethodChannel` in `AppDelegate` (Swift). Return `FlutterError` for failures; run heavy work off the main thread.
- Prefer Pigeon for typed, generated bindings on larger surfaces. Use EventChannel for streams.

## Push notifications
- `firebase_messaging` + FCM; iOS uses APNs key (.p8) uploaded to Firebase.
- Handle three states: foreground (show local notification), background, terminated (`getInitialMessage`). Background handler must be a top-level `@pragma('vm:entry-point')` function.
- Android 13+: request `POST_NOTIFICATIONS`. Create notification channels.

## Deep links
- Android App Links (`assetlinks.json`), iOS Universal Links (`apple-app-site-association`, Associated Domains).
- Route with `go_router`; parse and validate link params; handle cold start and warm start.

## Fastlane release
- `fastlane match` for iOS certs/profiles; Android keystore from CI secrets, never committed.
- Lanes: `beta` (TestFlight / Play internal), `release`. Bump version/build from CI, `flutter build appbundle|ipa --release --obfuscate --split-debug-info=build/symbols`.
- Upload debug symbols to Crashlytics/Sentry.

## Pre-release checklist
Flavors/envs set, permissions strings (Info.plist), privacy manifest, minSdk/target SDK current, ProGuard rules verified in a release build, test on real devices.
