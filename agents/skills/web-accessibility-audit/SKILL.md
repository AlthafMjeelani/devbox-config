---
name: web-accessibility-audit
description: Audit and fix web UI against WCAG 2.2 AA: contrast, keyboard, focus, labels, semantics, motion, touch targets. Use before shipping any UI and when reviewing design or code for accessibility.
---

# Web accessibility audit (WCAG 2.2 AA)

Audit the running page when you can (Playwright, see `visual-qa-playwright`); otherwise audit the code. Report findings as: severity, where, rule, fix. Then fix the critical and serious ones.

## Checklist
- **Contrast:** text 4.5:1 (large text 3:1), UI components and focus rings 3:1. Check in dark mode too. Never rely on color alone for meaning.
- **Keyboard:** everything reachable and operable with Tab, Enter, Space, Esc and arrows; logical order; no keyboard traps; visible focus (not removed with `outline: none` unless replaced); skip link on pages with navigation.
- **Semantics:** one `h1`, no skipped heading levels, landmarks (`header`, `nav`, `main`, `footer`), real `button` and `a` elements, lists and tables for lists and tables.
- **Names:** every input has a visible `label`; icon-only buttons have `aria-label`; images have meaningful `alt` (empty `alt=""` for decoration); links make sense out of context.
- **Forms:** errors are text, tied to the field (`aria-describedby`), announced; do not clear input on error; required fields marked.
- **Targets:** touch targets at least 24x24 CSS px (aim for 44); spacing between small targets.
- **Motion and media:** respect `prefers-reduced-motion`; no autoplay with sound; nothing flashes more than 3 times a second; captions on video.
- **Responsive:** works at 320 px wide and 200% zoom without horizontal scroll; text can be resized; orientation not locked.
- **Dynamic UI:** modals trap and return focus, close on Esc; status messages use `role="status"` or `aria-live`; route changes move focus or announce.
- **Language:** `lang` on `html`.

## Tools
Playwright with axe-core (`@axe-core/playwright`) for automated checks, which catch roughly a third of issues; the rest need the manual pass above. Test with a screen reader (VoiceOver on Mac) for key flows.

Related: `design-review`, `web-design-guidelines`, `visual-qa-playwright`.
