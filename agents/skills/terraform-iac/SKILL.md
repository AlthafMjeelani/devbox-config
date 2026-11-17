---
name: terraform-iac
description: Write and change infrastructure as code with Terraform or OpenTofu safely (state, modules, plans, drift). Use for any .tf change, state problem, or cloud provisioning task.
---

# Terraform / OpenTofu

## Rules
- Always `fmt`, `validate`, then `plan`; read the whole plan. Apply only a saved plan the user approved.
- Remote state with locking and encryption. Never commit state or `.tfvars` with secrets.
- Pin provider and module versions. Commit `.terraform.lock.hcl`.
- Separate environments by directory or workspace with distinct state; no shared prod and dev state.
- Use `prevent_destroy` on stateful resources. Treat any plan line with destroy or replace as a stop sign.

## Structure
- Small, single-purpose modules with typed variables, descriptions and outputs. Avoid deep nesting.
- Prefer `for_each` over `count` for stable addressing. Use `moved` blocks for refactors, not state surgery.
- Tag every resource. Keep IAM least privilege (see `aws-deploy`).

## Checks
- `tflint`, `checkov` or `trivy config` when installed; report findings by severity.
- Drift: scheduled `plan -detailed-exitcode` in CI.
- State commands (`state rm`, `import`, `force-unlock`) only with explicit approval.

Related: `aws-deploy`, `github-actions-ci`, `secrets-and-supply-chain`.
