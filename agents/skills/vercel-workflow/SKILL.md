---
name: vercel-workflow
description: Deploy and operate projects on Vercel through the Vercel MCP: deployments, build and runtime logs, env vars, domains, rollbacks, previews. Use for any Vercel deploy, production error, env or domain task.
---

# Vercel workflow (Vercel MCP)

The Vercel MCP server (`https://mcp.vercel.com`, OAuth) covers deployments, logs, projects, env vars, domains and more. Use it instead of guessing from memory or asking the user to paste logs.

## Find the scope first
1. `list_teams`, then `list_projects` (or read `.vercel/project.json` in the repo for `orgId` and `projectId`).
2. Reuse the team and project ids once known. Never guess them. If the target is ambiguous, ask.

## Common jobs
| Task | Do |
|---|---|
| Deploy failed | `list_deployments` then `get_deployment` and the build events/logs. Read the error before changing code. |
| Production error | `get_runtime_errors`, then `get_runtime_logs` with a time filter. |
| Preview for a branch | The Git integration deploys pushes. Find it with `list_deployments` filtered by branch; do not create manual deployments unless asked. |
| Env var | `filter_project_envs` to look, `create_project_env` / `edit_project_env` to change. Redeploy for it to apply. |
| Domain | `get_domain_config`, `verify_project_domain`, `add_project_domain`. |
| Bad release | `request_rollback` (confirm with the user first). |
| Docs question | `search_vercel_documentation`. |

## Rules
- Work on a feature branch; production changes (promote, rollback, env edits on production, domain or DNS changes) need the user's explicit go-ahead.
- Never print or request secrets. Do not decrypt env values unless asked. Put variable names in `.env.example` and values only in Vercel (see `env-and-secrets`).
- Distinguish what you observed (a log line, a status) from what you suspect. Verify a fix with a new deployment's state and logs before saying it is done.
- For `requires_user_action`, give the dashboard URL and leave it pending.
- If the MCP lacks an operation, use the CLI fallback from the error (`vercel api`, with the team id) or `vercel logs` / `vercel env`.

## Frameworks
- React or Next.js performance and patterns: `vercel-react-best-practices`.
- React Native on Vercel is not the target; mobile apps use Flutter.

## If the MCP is not connected
- Claude Code: `claude mcp add --scope user --transport http vercel https://mcp.vercel.com`, then `/mcp` to sign in.
- Codex: `codex mcp login vercel`. OpenCode: `opencode mcp auth vercel`.

Related skills: `aws-deploy`, `env-and-secrets`, `ship-gate`, `branch-cleanup`.
