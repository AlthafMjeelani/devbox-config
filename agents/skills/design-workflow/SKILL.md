---
name: design-workflow
description: The standard end-to-end process for any UI or design task, from brief to handoff, using the right design skill at each step. Use at the start of every UI, screen, landing page, dashboard or design-system task.
---

# Design workflow

Follow this order. Skip a step only when it clearly does not apply, and say so.

1. **Brief.** Goal, audience, platform, brand, constraints, success check. If a figma.com link exists, use `figma-workflow`. Read the project's `AGENTS.md` and design docs first.
2. **Direction.** Run `ui-ux-pro-max` (`--design-system`) for style, palette, type and patterns. For brand work add `brand` or `brand-guidelines`. For dashboards add `admin-panel-dashboard-design`; for mobile use Flutter (`flutter-ui-ux-design`).
3. **Tokens.** Define or reuse color, type, spacing, radius and motion tokens (`tailwind-design-tokens`, `design-system`). No hardcoded one-off values.
4. **Build.** Reuse existing components first (`ui-styling`, shadcn). Cover all states: empty, loading, error, disabled, hover, focus, dark mode, long text. Responsive at 360, 768 and 1280 wide.
5. **Motion.** Only where it explains change (`web-motion-and-microinteractions`); respect reduced motion.
6. **Check.** `web-accessibility-audit` (WCAG 2.2 AA), then `visual-qa-playwright` (screenshots at 3 widths, compare to the design).
7. **Critique.** `design-critique` on the screenshots; fix the top issues.
8. **Handoff.** `design-handoff-spec` for anything developers or other agents build later. Update `docs/` and record decisions in `docs/DECISIONS.md`.

Done means: matches the design, passes the accessibility checks, looks right at all three widths, and is documented.
