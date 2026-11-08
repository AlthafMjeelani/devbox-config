---
name: design-handoff-spec
description: Write a developer handoff spec for a screen or component: layout, tokens, props, states, breakpoints, interactions, motion, accessibility, edge cases. Use when design must be built later by a person or another agent.
---

# Design handoff spec

A spec lets someone build the design without asking questions. Save it in `docs/design/<name>.md` and link it from `docs/PLAN.md`.

## Template
- **Purpose and user flow:** what the screen does, entry and exit points.
- **Layout:** structure, grid, spacing (token names), alignment, per breakpoint (360, 768, 1280).
- **Tokens:** colors, type styles, radius, shadow, motion (names, not hex).
- **Components:** each with props, variants and sizes, reusing existing components; list new ones.
- **States:** default, hover, focus, active, disabled, loading, empty, error, success, long text, no data.
- **Interactions and motion:** triggers, durations, easing, what happens on mobile (no hover), reduced-motion fallback.
- **Content:** real copy, character limits, truncation, localization and RTL notes.
- **Data:** fields shown, formats (dates, currency), loading behavior.
- **Accessibility:** headings, landmarks, labels, focus order, keyboard behavior, announcements.
- **Assets:** icons, images, fonts with sources and licenses.
- **Acceptance criteria:** a checklist the builder and reviewer both use (`visual-qa-playwright`, `web-accessibility-audit`).

Pull the facts from Figma with `figma-workflow` (`get_design_context`, `get_variable_defs`) when a file exists, and state anything you assumed.

Related: `design-system`, `tailwind-design-tokens`, `requirement-analysis`.
