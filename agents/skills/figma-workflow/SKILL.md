---
name: figma-workflow
description: Work with Figma through the official Figma MCP: implement a Figma design as code, push UI into Figma, build design systems and Code Connect, read variables and tokens. Use whenever a figma.com URL appears or the user mentions Figma.
---

# Figma workflow (official Figma MCP)

The Figma MCP server (`https://mcp.figma.com/mcp`, OAuth) serves Figma's own skills. Do not rely on memory for the tool flow: load the matching skill from the server first, every time, because it changes.

## Load the right Figma skill first
Use the MCP tool `get_figma_skill` with a `skill://` URI (or the agent's Figma plugin skill if installed):

| Task | Load first |
|---|---|
| Implement a design as code | `skill://figma/figma-design-to-code/SKILL.md` (mandatory before `get_design_context`) |
| Create or edit anything in a Figma file | `skill://figma/figma-use/SKILL.md` (mandatory before `use_figma`) |
| Push an app page or screen into Figma | `figma-generate-design` together with `figma-use` |
| Build a design system or components in Figma | `figma-generate-library` together with `figma-use` |
| Map Figma components to code | `skill://figma/figma-code-connect/SKILL.md` |
| Implement animation from Figma | `skill://figma/figma-implement-motion/SKILL.md` |
| Diagram in FigJam | `skill://figma/figma-generate-diagram/SKILL.md` |
| New file | `skill://figma/figma-create-new-file/SKILL.md` |
Full list: read `skill://index.json`.

## Session steps
1. Parse the URL: `figma.com/design/:fileKey/...?node-id=1-2` gives fileKey and nodeId `1:2` (dashes become colons). On a branch URL use the branch key.
2. `create_session` with the fileKey and a one-line task before any other file tool.
3. Read: `get_design_context` (primary), `get_screenshot`, `get_variable_defs`, `get_metadata`.
4. Treat `get_design_context` output as a reference to adapt, not final code.

## Our rules when implementing
- Read the project's `AGENTS.md` first and work on a feature branch.
- Reuse the repo's existing components, tokens and spacing; map Figma variables to the project's tokens instead of hardcoding values.
- Mobile apps use Flutter (`mobile-app-development`, `flutter-ui-ux-design`); do not generate SwiftUI or React Native unless the project already does.
- Compare the result with `get_screenshot` at the design's width, then check accessibility (contrast, focus, tap targets) with `web-design-guidelines` or `design-review`.
- No secrets in files. The MCP uses OAuth; never paste a Figma token into the repo (see `env-and-secrets`).

## If the MCP is not connected
- Claude Code: `claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp`, then `/mcp` to sign in.
- Codex: `codex mcp login figma` (after the entry in `~/.codex/config.toml`, see `agents/codex-config.toml.example`).
- OpenCode: `opencode mcp auth figma`.
- Free alternative without the official server: Framelink `figma-developer-mcp` with a personal access token in an env var.

Related skills: `ui-ux-pro-max`, `design-system`, `ui-styling`, `design-review`, `web-motion-and-microinteractions`.
