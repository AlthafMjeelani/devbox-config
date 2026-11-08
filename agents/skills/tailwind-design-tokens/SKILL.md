---
name: tailwind-design-tokens
description: Set up and use a design-token system with Tailwind (v4 CSS variables or v3 config): color, type, spacing, radius, shadow, motion, light and dark. Use when starting a design system or when UI uses hardcoded values.
---

# Tailwind design tokens

Tokens are the single source of truth. Components use token names, never raw values.

## Layers
1. **Primitive:** raw scale (`--blue-500`, `--space-4`).
2. **Semantic:** meaning (`--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-danger`, `--color-border`, `--color-focus`).
3. **Component:** only when needed (`--button-radius`).

## Tailwind v4
Define in CSS with `@theme`:
```css
@theme {
  --color-bg: oklch(99% 0 0);
  --color-text: oklch(20% 0 0);
  --color-primary: oklch(55% 0.2 260);
  --radius-md: 0.5rem;
  --font-sans: "Inter", system-ui, sans-serif;
}
.dark { --color-bg: oklch(16% 0 0); --color-text: oklch(96% 0 0); }
```
Use `bg-bg text-text`, `rounded-md`. Tailwind v3: map the same variables in `theme.extend.colors` (`bg: "var(--color-bg)"`).

## Rules
- Dark mode by swapping semantic variables, not by duplicating classes everywhere.
- Spacing on a 4 px scale; a modular type scale (for example 12, 14, 16, 18, 20, 24, 30, 36); at most two font families.
- Contrast checked on every text/background pair (`web-accessibility-audit`).
- Motion tokens: durations 120, 200, 320 ms; one or two easings.
- Map Figma variables to these names (`figma-workflow`, `get_variable_defs`) instead of hardcoding hex values.
- Document tokens in `docs/` or a `design-tokens` file so agents reuse them.

Related: `design-system`, `ui-styling`, `ui-ux-pro-max`.
