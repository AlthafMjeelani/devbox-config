# Architecture and preferred stack

# Architecture

## Existing Applications

Respect the architecture already in use.

Do not introduce Clean Architecture, Riverpod, BLoC, GetIt, Dio, Freezed, GoRouter, or another framework into an established project solely because it is personally preferred.

Add new code in the same architectural style unless:

- the current approach creates a concrete defect,
- the requested feature cannot be implemented safely within it, or
- the user explicitly requests architectural modernization.

When improving architecture, migrate incrementally by feature or boundary. Avoid application-wide rewrites.

## Greenfield Default

For a new production application, default to feature-first Clean Architecture with clear boundaries:

```text
lib/
├── app/
│   ├── app.dart
│   ├── bootstrap.dart
│   ├── router/
│   └── theme/
├── core/
│   ├── config/
│   ├── errors/
│   ├── network/
│   ├── persistence/
│   ├── logging/
│   ├── utils/
│   └── widgets/
└── features/
    └── feature_name/
        ├── data/
        │   ├── datasources/
        │   ├── dto/
        │   ├── mappers/
        │   └── repositories/
        ├── domain/
        │   ├── entities/
        │   ├── repositories/
        │   └── usecases/
        └── presentation/
            ├── controllers/
            ├── pages/
            ├── state/
            └── widgets/
```

Adapt this structure to project size. Small applications do not need ceremonial layers with no real responsibility.

## Dependency Direction

Dependencies must point inward:

```text
presentation -> domain
data -> domain
domain -> no Flutter UI, database, or HTTP implementation dependency
```

Rules:

- Domain repository contracts belong in the domain layer.
- Repository implementations belong in the data layer.
- Widgets must not parse JSON or execute SQL.
- Data sources must not contain presentation logic.
- API DTOs must not leak into domain or UI layers unless the application intentionally uses a simpler architecture.
- Map transport and persistence models at boundaries.
- Keep business rules independent of widgets and plugins.
- Wrap third-party SDKs behind interfaces when they represent important external dependencies.

# Preferred Greenfield Stack

Use the repository's existing stack first. For a new project with no declared preference, sensible defaults are:

- State and dependency composition: Riverpod
- Routing: GoRouter
- HTTP: Dio or `package:http`, selected according to requirements
- Immutable models: Freezed when its value exceeds code-generation cost
- JSON: `json_serializable`
- Local structured persistence: Drift or Isar based on data and query needs
- Secure secrets: platform-backed secure storage
- Logging: structured logging with release-safe redaction
- Testing mocks: Mocktail when test doubles are needed

Do not add all of these automatically. Add only what the application actually requires.

