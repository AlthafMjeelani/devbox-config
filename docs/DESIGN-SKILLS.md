# Shared design and document skills

The canonical packages live in `agents/skills/`.
They are available through the existing Stow and `agents-sync` setup to Claude Code, Codex, OpenCode, Kimi Code, Amp, CommandCode and Google Antigravity.
Skill discovery does not install the external services or rendering tools mentioned in a package.

## Director and existing skills

`premium-artifact-design-director` routes to the maintained `professional-artifact-design` standards, the relevant format skill and `artifact-quality-review`.
The shared `AGENTS.md` selects this director for polished business artifacts.
Existing narrative, diagram, prototype, review and Flutter skills remain available.
Anthropic's upstream `frontend-design` package replaces the earlier generic skill of the same name.
The original Texol reference PDF is not bundled, so matching it requires supplying and inspecting that actual reference.

## Upstream inventory

Exact source revisions and local adaptations are recorded in [the source manifest](../agents/design-skills.sources.json).
Supporting scripts, references, assets and available upstream license notices are retained.
Their licenses remain those of their publishers, including any source-available document package terms.

| Installed skill | Pinned upstream source |
| --- | --- |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/frontend-design) |
| `pptx` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/pptx) |
| `pdf` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/pdf) |
| `docx` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/docx) |
| `xlsx` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/xlsx) |
| `webapp-testing` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/webapp-testing) |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/web-design-guidelines) |
| `vercel-react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/react-best-practices) |
| `vercel-composition-patterns` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/composition-patterns) |
| `vercel-react-native-skills` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/react-native-skills) |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/b7d5353e0130feb8c5574ef1251f8a1db1873ccb/.claude/skills/ui-ux-pro-max) |
| `design-system` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/b7d5353e0130feb8c5574ef1251f8a1db1873ccb/.claude/skills/design-system) |
| `slides` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/b7d5353e0130feb8c5574ef1251f8a1db1873ccb/.claude/skills/slides) |
| `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable/tree/c3bb418ee38ee49a6b999b7752c1368f3123a2bd/plugin/skills/impeccable) |
| `shadcn` | [shadcn-ui/ui](https://github.com/shadcn-ui/ui/tree/d549251bab2e57dbf72f7c909d6458c02c43f529/skills/shadcn) |
| `mermaid-diagrams` | [championswimmer/tech-doc-skills](https://github.com/championswimmer/tech-doc-skills/tree/860bbf9d483deff584f57b09f85072a7b44bb8f9/skills/mermaid-diagrams) |
| `frontend-slides` | [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides/tree/9906a34d640d2111f724544cbc50f7f130569ae1/plugins/frontend-slides/skills/frontend-slides) |
| `design-mobile-apps` | [designed-by-ai/skills](https://github.com/designed-by-ai/skills/tree/03c20aec6dcedb5fabfb03dc37982eb52ef19ed6/skills/design-mobile-apps) |

## Runtime requirements

Use the host's bundled format tools first when required by that host.
For shared standalone workflows, check the selected skill's own prerequisites before authoring.
Upstream statements that a library is preinstalled describe the publisher's environment, not every devbox machine.
Resolve relative script paths against the loaded skill directory and keep project outputs in the requested workspace.
UI/UX Pro Max's Claude plugin-root examples are adapted to a `<skill-directory>` placeholder for all hosts.
For Impeccable, resolve `CLAUDE_SKILL_DIR` to the loaded skill directory on hosts that do not populate it.

- **UI/UX Pro Max:** Python 3; its local search data and scripts are bundled.
- **Impeccable:** ships a launcher that may download its platform engine on first use.
- **PowerPoint / Word:** Node packages such as `pptxgenjs` or `docx`, Python helper libraries, and LibreOffice/Poppler for the relevant rendering operations.
- **PDF / Excel:** Python packages selected by the workflow, with LibreOffice when spreadsheet recalculation is needed.
- **Browser checks:** Playwright (`browser`, `webapp-testing` or `visual-qa-playwright`); prefer the host's already configured browser tools.
- **Mobile via Sleek:** a configured Sleek account/API authorization and available credits.
- **Uizze:** local design guidance works without an account; optional connected reference services require separate access.
- **HTML presentation projects:** their own Node dependencies when using React-based authoring; inspect the chosen package's workflow.

No API keys, paid accounts, MCP connections or system-wide runtime packages are provisioned by adding these skills.

## Install and refresh

```bash
make agents-sync
make restow-agents
make verify-agent-workflow
```

Start a new session or refresh the skill inventory in each agent after installation.
The cross-agent installation test reads the source manifest and checks every imported skill through all seven host paths in an isolated home directory.
The existing safety and account workflow tests also run through the verification target.
These checks validate package discovery and shared wiring; they do not claim that every external authoring service has been exercised.

## Update a package

Inspect upstream changes and prerequisites before replacing a package.
Download the complete skill directory at a chosen commit, retaining its scripts, assets, references and applicable license notices.
Preserve the original `frontend-design` skill, reapply the documented portability adaptations and update the source manifest revision and local change notes.
Then run the install and refresh commands above and review the resulting diff.
Do not commit or push unless requested.

## Full-Stack Engineering Skills
- `senior-backend-engineer` - Node/NestJS/Fastify, Go, Python/FastAPI, PHP/Laravel
- `auth-and-identity` - OAuth2/OIDC, JWT rotation, RBAC/ABAC, secure token storage
- `fullstack-type-safety` - OpenAPI codegen, tRPC, GraphQL, freezed + Zod
- `react-state-and-query` - TanStack Query, Zustand, RHF + Zod, Next.js caching
- `flutter-native-and-release` - MethodChannels, FCM/APNs, deep links, Fastlane

## Design Skills
- `flutter-ui-ux-design` - Material 3 tokens, adaptive UI, painters/shaders, golden tests
- `poster-and-social-media-design` - social sizes, OG cards, thumbnails, print bleed
- `svg-logo-and-icon-design` - logos, icon sets, app icons and splash
- `web-motion-and-microinteractions` - Framer Motion, scroll animation, bento, glass
- `print-and-publication-documents` - Typst/LaTeX/WeasyPrint invoices, brochures, reports
- `admin-panel-dashboard-design` - admin panels, dashboards and control centers with modern look and feel

## Agent workflow skills
- `agent-orchestration` - split goals into tasks, dispatch workers in worktrees, review and merge
- `agent-communication` - handoff files, status signals, terminal messaging, ask-or-decide rules
- `rex-terminal` - drive the Rex terminal from an agent (`rex run --wait`, send, capture, status, events)

## Mobile and config skills
- `mobile-app-development` - entry point for any mobile app request; always routes to the Flutter skills first
- `env-and-secrets` - `.env.example` with safe samples, `.gitignore` rules, secrets handling; stack templates included

## Models and context skills
- `model-routing` - newest model and effort per task and per agent
- `context-management` - compact, start fresh, hand off through files, read less
- `project-agents-md` - write a short, accurate AGENTS.md for any repository

## Figma

`figma-workflow` wraps the official Figma MCP (`https://mcp.figma.com/mcp`). The server serves Figma's own skills, and the skill tells every agent to load the right one first with `get_figma_skill` instead of copying them here, so they stay current.

- **Claude Code:** `setup.sh` runs `claude mcp add --scope user --transport http figma ...`; sign in with `/mcp`.
- **Codex:** the `[mcp_servers.figma]` block in `agents/codex-config.toml.example`; sign in with `codex mcp login figma`.
- **OpenCode:** the `mcp.figma` entry in `opencode.json`; sign in with `opencode mcp auth figma`.

## Vercel

`vercel-workflow` uses the Vercel MCP (`https://mcp.vercel.com`) for deployments, logs, env vars, domains and rollbacks. Claude Code gets it from `setup.sh` (sign in with `/mcp`), Codex from `[mcp_servers.vercel]` (`codex mcp login vercel`) and OpenCode from `mcp.vercel` (`opencode mcp auth vercel`).

## Professional design process

`design-workflow` is the standard order for any UI task, and `AGENTS.md` tells every agent to follow it:
brief, direction (`ui-ux-pro-max`), tokens (`tailwind-design-tokens`), build, accessibility (`web-accessibility-audit`, WCAG 2.2 AA), visual QA (`visual-qa-playwright`), critique (`design-critique`), handoff (`design-handoff-spec`).

MCPs for all agents: Playwright (screenshots), shadcn (components), Context7 (library docs), plus Figma and Vercel above. Claude Code gets them from `setup.sh`, Codex from `codex-config.toml.example`, OpenCode from `opencode.json`.
