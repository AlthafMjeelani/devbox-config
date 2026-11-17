---
name: github-actions-ci
description: Author and debug GitHub Actions workflows (caching, matrices, permissions, OIDC, reusable workflows). Use for any .github/workflows change or failing CI run.
---

# GitHub Actions CI

## Workflow baseline
- Set top-level `permissions: contents: read` and widen per job only when required.
- Pin third-party actions to a commit SHA. Prefer official actions.
- Use `concurrency` with `cancel-in-progress` for PRs. Set `timeout-minutes` on every job.
- Cache dependencies via the setup action's cache or `actions/cache` keyed on the lockfile hash.
- Matrix only what matters; use `fail-fast: false` when results are independent.
- Cloud auth with OIDC and short-lived roles, not stored keys.

## Safety
- Never run untrusted PR code with secrets: avoid `pull_request_target` with checkout of the PR head.
- Do not echo secrets; pass inputs through `env`, not inline `${{ }}` in `run` (script injection).
- Gate deploys with protected environments and required reviewers.

## Debugging a red run
1. Read the first failing step, not the last error. Reproduce locally with the same command.
2. Compare runner OS, tool versions and env with local.
3. Re-run with debug logging only if needed; fix, then confirm green on a clean run.

Related: `ci-cd-and-release`, `secrets-and-supply-chain`, `docker-containerization`.
