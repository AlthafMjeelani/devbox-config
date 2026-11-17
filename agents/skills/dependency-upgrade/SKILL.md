---
name: dependency-upgrade
description: Upgrade dependencies and runtimes safely in small verified steps. Use for outdated packages, major version bumps, framework or Node/Python/Flutter upgrades.
---

# Dependency upgrades

## Process
1. Baseline: tests, lint and build pass before touching anything. Record versions.
2. List outdated (`npm outdated`, `pip list --outdated`, `flutter pub outdated`, `go list -u -m all`).
3. Group: patch and minor together; one PR per major bump or framework.
4. Read the changelog and migration guide; search for breaking changes that touch your code.
5. Upgrade, regenerate the lockfile with the tool, run the full test suite and a build.
6. Fix deprecations introduced by the bump, not unrelated code.

## Rules
- Never hand-edit lockfiles. Never mix upgrades with feature work.
- If tests were thin, add a characterization test around the affected area first.
- Keep a rollback path: one revertable commit per upgrade.
- Report what could not be upgraded and why.

Related: `safe-refactoring`, `regression-testing`, `secrets-and-supply-chain`.
