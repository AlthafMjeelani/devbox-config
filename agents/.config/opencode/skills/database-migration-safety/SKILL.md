---
name: database-migration-safety
description: Use when reviewing and authoring database schema changes for table locks, backfills, transactions, reversibility, and deployment sequencing.
---

# Database Migration Safety

## When to use
- Adding, altering, or dropping tables, columns, constraints, or indexes.
- Performing data backfills or schema migrations in relational or document databases.
- Planning deployment sequencing for application releases requiring database changes.

## Inputs to gather
- Proposed SQL migration files or ORM migration scripts.
- Target database engine and version (PostgreSQL, MySQL, SQLite, MongoDB).
- Table size estimates, active query patterns, and locking characteristics.

## Procedure
1. Analyze locking behavior:
   Verify whether adding columns, indexes, or constraints locks the target table.
   Check lock levels (e.g., AccessExclusiveLock in PostgreSQL) and duration.
2. Use concurrent operations:
   Use `CREATE INDEX CONCURRENTLY` or equivalent non-blocking syntax where supported.
   Avoid blocking read and write traffic during schema updates.
3. Apply expand-and-contract:
   Phase 1: Add new nullable columns or tables; update code to write to both old and new shapes.
   Phase 2: Backfill historical data in bounded batches.
   Phase 3: Switch code reads to new shape; deprecate old shape.
   Phase 4: Drop old columns or tables in a subsequent release.
4. Verify transactional safety:
   Wrap migrations in transactions when supported; handle non-transactional DDL carefully.
   Ensure that a failed migration does not leave the database in an inconsistent state.
5. Provide rollback scripts:
   Ensure every migration has a corresponding, tested down/rollback script.
   Test both forward migration and rollback in a local test environment.
6. Test on staging data:
   Run migration against representative volumes to measure execution time.
   Verify that migration completes within acceptable deployment windows.

## Output / handoff
- Safe migration script with rollback instructions and execution time estimates.
- Deployment sequencing plan specifying code deploy steps relative to migration runs.

## Verification and guardrails
- Never run destructive operations (`DROP TABLE`, `DROP COLUMN`) in the same deploy that modifies application code.
- Destructive migrations require explicit user confirmation before execution.
- Backfill scripts must run in small, sleep-throttled batches to avoid overwhelming replication lag.
- Always verify that database backups exist prior to applying migrations in production.
