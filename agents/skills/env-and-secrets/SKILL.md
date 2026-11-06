---
name: env-and-secrets
description: Manage environment variables and secrets in any project - keep a committed .env.example with safe samples, git-ignore the real .env files, never commit secrets. Covers Flutter, Node, Python, Go, Laravel and Docker. Use when adding config, API keys or env files.
---

# Env files and secrets

Rule: **real values never enter git; the shape of the config always does.**

## Every project gets
1. A tracked `.env.example` listing every variable with a safe sample value and a one-line comment. Keys only, no real secrets.
2. A `.gitignore` that ignores the real files and keeps the example:
   ```gitignore
   .env
   .env.*
   !.env.example
   *.pem
   *.key
   ```
3. A README line: "Copy `.env.example` to `.env` and fill in your values."

Templates for common stacks are in `templates/` next to this file: flutter, node, python, laravel, go and docker-compose.

## Workflow when you add a config value
1. Add the variable to the code through one config module that validates it at startup (missing required value = clear error).
2. Add it to `.env.example` in the same change, with a placeholder (`your-stripe-secret-key`), not a real or default-secret value.
3. Run `env-check` (it audits ignore rules, tracked files, secret-looking values in the example, and key drift). `env-check --sync` adds missing keys from `.env` to `.env.example` safely.
4. Never print or log secret values. Never paste them in chat, commits or issues.

## If a secret was committed
Treat it as leaked: rotate it first, then remove it from git (`git rm --cached`), then consider history cleanup. Deleting the file in a new commit is not enough.

## Flutter specifics
- Prefer `flutter run --dart-define-from-file=env/dev.json` (add `env/*.json` to `.gitignore`, commit `env/dev.example.json`) and read values with `String.fromEnvironment`.
- Anything compiled into an app (including `flutter_dotenv` assets) can be extracted by users. Only put public client config there (API base URL, public keys). Real secrets belong on a server.
- Use flavors for dev/staging/prod, each with its own example file.
- Do not commit `key.properties`, keystores, `google-services.json`, `GoogleService-Info.plist` unless the team deliberately does; keep samples as `*.example`.

## Other stacks
- Node: validate with Zod (`z.object({...}).parse(process.env)`); Next.js: only `NEXT_PUBLIC_*` reaches the browser.
- Python: `pydantic-settings`. Go: `envconfig` or `os.LookupEnv` with explicit required checks. Laravel: `config()` never `env()` outside config files.
- Docker/CI: pass secrets through the platform's secret store, not image layers or committed compose files.
