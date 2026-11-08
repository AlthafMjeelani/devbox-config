---
name: visual-qa-playwright
description: Verify a built UI by opening it in a real browser with Playwright, taking screenshots at several widths and comparing them with the design. Use after building or changing any UI, and for visual regression checks.
---

# Visual QA with Playwright

Never claim a UI is done from code alone. Look at it.

## Steps
1. Start the app (`npm run dev` or the repo's command; see `AGENTS.md`). Wait until it responds.
2. With the Playwright MCP (or `npx playwright`), open the page and take full-page screenshots at **360, 768 and 1280** px wide, in light and dark if the app has both.
3. Compare with the design: the Figma screenshot (`get_screenshot` via `figma-workflow`), a mockup, or the previous version.
4. Check each: spacing and alignment on the grid, type scale and weights, colors from tokens, icon size and alignment, truncation and wrapping with long text, empty/loading/error states, hover and focus, no horizontal scroll, no overlapping or clipped content.
5. Check the console and network for errors and failed requests.
6. Fix the differences, re-shoot, repeat until clean. Then run `web-accessibility-audit`.

## Regression
For a stable UI, add Playwright screenshot tests (`expect(page).toHaveScreenshot()`) with a fixed viewport, disabled animations and masked dynamic content. Commit the baselines; update them only on intended changes.

## Report
List what you checked and at which widths, what you fixed, and what still differs. Attach or reference the final screenshots.

Related: `webapp-testing`, `design-critique`, `design-review`.
