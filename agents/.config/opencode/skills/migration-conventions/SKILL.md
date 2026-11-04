---
name: migration-conventions
description: Use when adding or changing Flutter database migrations, especially files under lib/db/migrate_db/.
---

# Migration Conventions

- Do not edit `lib/db/create_db/create_table.dart` for schema changes after the initial schema definition.
- Add every schema change as a new migration file under `lib/db/migrate_db/migrations/`.
- Add the migration import to `lib/db/migrate_db/db_migrations.dart`.
- Append the migration's spread entry as the final item in `DbMigrations.migrationScripts`.
- Preserve existing migrations and never reorder previously registered migration entries.
