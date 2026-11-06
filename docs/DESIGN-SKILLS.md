# Shared design and document skills

The canonical packages live in `agents/.config/opencode/skills/`.
They are available through the existing Stow and `agents-sync` setup to Claude Code, Codex, OpenCode, Kimi Code, Amp, CommandCode and Google Antigravity.
Skill discovery does not install the external services or rendering tools mentioned in a package.

## Director and existing skills

`premium-artifact-design-director` routes to the maintained `professional-artifact-design` standards, the relevant format skill and `artifact-quality-review`.
The shared `AGENTS.md` selects this director for polished business artifacts.
Existing narrative, diagram, prototype, review and Flutter skills remain available.
The existing `frontend-design` is preserved; Anthropic's upstream package is installed as `anthropic-frontend-design` with its frontmatter name adjusted.
The original Texol reference PDF is not bundled, so matching it requires supplying and inspecting that actual reference.

## Upstream inventory

Exact source revisions and local adaptations are recorded in [the source manifest](../agents/design-skills.sources.json).
Supporting scripts, references, assets and available upstream license notices are retained.
Their licenses remain those of their publishers, including any source-available document package terms.

| Installed skill | Pinned upstream source |
| --- | --- |
| `anthropic-frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/frontend-design) |
| `pptx` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/pptx) |
| `pdf` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/pdf) |
| `docx` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/docx) |
| `xlsx` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/xlsx) |
| `theme-factory` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/theme-factory) |
| `doc-coauthoring` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/doc-coauthoring) |
| `canvas-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/canvas-design) |
| `brand-guidelines` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/brand-guidelines) |
| `algorithmic-art` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/algorithmic-art) |
| `internal-comms` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/internal-comms) |
| `webapp-testing` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/webapp-testing) |
| `web-artifacts-builder` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/web-artifacts-builder) |
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
| `web-research` | [championswimmer/tech-doc-skills](https://github.com/championswimmer/tech-doc-skills/tree/860bbf9d483deff584f57b09f85072a7b44bb8f9/skills/web-research) |
| `frontend-slides` | [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides/tree/9906a34d640d2111f724544cbc50f7f130569ae1/plugins/frontend-slides/skills/frontend-slides) |
| `agent-browser` | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser/tree/71850a021c5cb694513d720d61c156dd317d63cf/skills/agent-browser) |
| `design-mobile-apps` | [designed-by-ai/skills](https://github.com/designed-by-ai/skills/tree/03c20aec6dcedb5fabfb03dc37982eb52ef19ed6/skills/design-mobile-apps) |
| `slidewright` | [tronghieu/agent-skills](https://github.com/tronghieu/agent-skills/tree/831d1ae5c686a81b10f9c5b9cca04a7b8b97303d/skills/slidewright) |
| `presentation-creator` | [getsentry/skills](https://github.com/getsentry/skills/tree/e94f22214528d69899d09c627b3315ddc3544816/skills/presentation-creator) |
| `ui-design` | [uizze/uizze](https://github.com/uizze/uizze/tree/fc401e9e654cbafe427b0c98142fc8bccd0c4e7e/skills/ui-design) |

## Unavailable source

The exact `ui-taste` package is distributed at `https://uizze.sh/`, which returned HTTP 403 during installation.
It has not been installed or silently renamed.
The separately named `ui-design` package from the same publisher's public `uizze/uizze` repository provides its public design workflow.
The manifest records the unavailable package explicitly.

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
- **Browser checks:** Playwright or `agent-browser` with its browser runtime; prefer the host's already configured browser tools.
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
