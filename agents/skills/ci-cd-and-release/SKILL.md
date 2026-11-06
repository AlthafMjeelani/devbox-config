---
name: ci-cd-and-release
description: Use when verifying formatting, linting, builds, test pipelines, migrations, deployment risks, feature flags, and rollback procedures.
---

# CI/CD and Release

## When to use
- Preparing code for deployment to staging or production environments.
- Authoring or updating CI/CD pipeline workflows (GitHub Actions, GitLab CI, etc.).
- Verifying deployment safety, feature flag configurations, and rollback procedures.

## Inputs to gather
- CI configuration files (`.github/workflows/`, CI configs), Dockerfiles, and build scripts.
- Release checklist, environment variables, feature flags, and migration requirements.
- Target deployment platform and rollback mechanisms.

## Procedure
1. Run local pre-flight checks:
   Execute formatting, linting, type-checking, and test suites locally.
   Ensure that all checks pass before pushing code to CI.
2. Verify pipeline definition:
   Ensure CI workflow steps run in proper dependency order with fast-fail stages.
   Check that dependencies are cached effectively to keep pipeline runs fast.
3. Review deployment risks:
   Evaluate database migrations, environment variable changes, and dependency updates.
   Ensure that newly required environment variables are documented and configured.
4. Configure feature flags:
   Gate high-risk functionality behind feature flags for controlled progressive rollouts.
   Verify default flag states for staging and production environments.
5. Define rollback plan:
   Establish clear, tested procedures for reverting application code and database schemas.
   Ensure that previous release artifacts remain accessible for emergency rollback.
6. Require explicit authorization:
   Obtain explicit approval from the user before triggering any production release action.
   Never assume approval for outward-facing deployments.

## Output / handoff
- Pre-release verification report confirming all CI checks pass.
- Release playbook detailing deployment sequence, feature flag toggles, and rollback steps.

## Verification and guardrails
- Never trigger production deployments or tag release commits without explicit user confirmation.
- Do not bypass failing CI checks or disable test stages to force a build to succeed.
- Confirm rollback procedures are viable and tested before initiating releases.
- Monitor application error logs and latency metrics immediately after release.
