---
name: secrets-and-supply-chain
description: Secure secrets, dependencies and build pipelines (rotation, scanning, SBOM, pinning). Use for leaked keys, dependency risk, or hardening CI and release supply chain.
---

# Secrets and supply chain

## Secrets
- Store in a manager (cloud secret store, Vault, SOPS); inject at runtime. Never commit real values (see `env-and-secrets`).
- If a secret leaked: revoke and rotate first, then clean history. Assume it is compromised.
- Scan with `gitleaks` or `trufflehog` in pre-commit and CI.

## Dependencies
- Commit lockfiles. Pin versions; review upgrade diffs and changelogs.
- Run `npm audit`, `pip-audit`, `govulncheck` or equivalent; triage by reachability and severity.
- Prefer few, maintained dependencies. Watch for typosquats and new maintainers.

## Build and release
- Pin CI actions and base images by digest. Least-privilege tokens, short-lived credentials.
- Generate an SBOM (`syft`) and sign artifacts (`cosign`) for published images.
- Protect default branches; require review and passing checks.

Related: `github-actions-ci`, `docker-containerization`, `dependency-upgrade`, `security-review`.
