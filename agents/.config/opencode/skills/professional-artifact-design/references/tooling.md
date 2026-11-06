# Tooling and optional foundations

This pack adds original, portable design and review guidance.
It does not bundle third-party document engines or assume a particular agent vendor.
Use the installed host's format skills and required libraries first; preserve existing skills rather than overwriting names such as `frontend-design`.

Anthropic's official repository documents these optional foundations:

- [PPTX](https://github.com/anthropics/skills/tree/main/skills/pptx)
- [PDF](https://github.com/anthropics/skills/tree/main/skills/pdf)
- [DOCX](https://github.com/anthropics/skills/tree/main/skills/docx)
- [XLSX](https://github.com/anthropics/skills/tree/main/skills/xlsx)
- [Theme Factory](https://github.com/anthropics/skills/tree/main/skills/theme-factory)
- [Canvas Design](https://github.com/anthropics/skills/tree/main/skills/canvas-design)
- [Frontend Design](https://github.com/anthropics/skills/tree/main/skills/frontend-design)
- [Web Artifacts Builder](https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder)

The repository distinguishes source-available document skills from its open-source examples.
Keep original licensing/notices if importing upstream material; this pack links to it instead of copying it.

For a user-authorised Claude Code installation, the documented marketplace commands are:

```text
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

These are Claude Code commands, not shell commands and not a cross-agent installation mechanism.
The devbox shared skills are distributed through the repository's existing `make agents-sync` and `make restow-agents` workflow.
Installed skills become discoverable on the host's next skill refresh or new session.
Loading this pack does not itself install or activate a third-party plugin.
