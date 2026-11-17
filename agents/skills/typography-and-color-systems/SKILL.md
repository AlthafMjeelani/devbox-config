---
name: typography-and-color-systems
description: Choose type scales, font pairings, color palettes and contrast-safe tokens. Use when defining or fixing the visual foundation of a UI, brand or document.
---

# Typography and color systems

## Typography
- One or two families. Define a modular scale (for example 1.2 or 1.25) and map to roles: display, heading, body, caption, code.
- Body 16px minimum on web, line height 1.4-1.6, line length 45-75 characters. Limit weights.
- Use `rem` and fluid `clamp()` for responsive sizes. Load fonts with `font-display: swap` and subset them.

## Color
- Build from a neutral ramp (9-11 steps) plus one primary, plus semantic colors (success, warning, danger, info).
- Define tokens by role (`--color-bg`, `--color-text`, `--color-primary`), not by hue name. Provide light and dark.
- Contrast: text 4.5:1 (3:1 large), UI components 3:1. Never rely on color alone to convey meaning.
- Check with a contrast tool and show the ratios.

## Output
- Tokens as CSS variables or the project's token format (see `tailwind-design-tokens`), plus a small specimen page.

Related: `design-system`, `brand`, `web-accessibility-audit`, `tailwind-design-tokens`.
