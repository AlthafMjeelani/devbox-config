---
name: monorepo-and-build-tooling
description: Structure and speed up monorepos and builds (workspaces, Turborepo, Nx, caching, shared packages). Use for multi-package repos, slow builds, or sharing code across apps.
---

# Monorepo and build tooling

## Structure
- `apps/*` deployable, `packages/*` shared libraries. One root lockfile. Use pnpm or npm workspaces.
- Shared config packages for TypeScript, ESLint and Tailwind. Internal packages expose a clear entry point.
- Enforce dependency direction: apps depend on packages, never the reverse; no cycles.

## Speed
- Task runner with a dependency graph and caching (Turborepo or Nx). Declare inputs and outputs precisely.
- Run only affected tasks in CI (`--filter` / `affected`). Enable remote cache when available.
- Incremental TypeScript (`composite`, project references) and parallel lint and test.

## Rules
- Version and release with changesets when publishing packages.
- Keep scripts consistent across packages (`build`, `test`, `lint`, `typecheck`).
- Do not hoist-hack around missing dependencies; declare them in the package that uses them.

Related: `fullstack-type-safety`, `github-actions-ci`, `dependency-upgrade`.
