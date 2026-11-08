---
name: design-critique
description: Critique a design or built UI against hierarchy, spacing, typography, color, consistency and usability, and return a ranked list of fixes. Use after building a screen, or when asked to review or improve a design.
---

# Design critique

Look at screenshots (`visual-qa-playwright`), not just code. Judge against the brief and the product's users.

## Review in this order
1. **Purpose:** is the main action obvious within 3 seconds? One primary action per screen.
2. **Hierarchy:** size, weight, color and position tell the reading order. Too many equal-weight items is the most common fault.
3. **Layout and spacing:** a consistent grid and spacing scale; related items grouped, unrelated ones separated; alignment on shared edges; enough whitespace.
4. **Typography:** limited sizes and weights; line length 45 to 80 characters; line height 1.4 to 1.6 for body; real contrast.
5. **Color:** a restrained palette, one accent for actions, status colors used only for status.
6. **Components and consistency:** the same thing looks and behaves the same everywhere; states complete (empty, loading, error, disabled).
7. **Usability:** labels clear, errors helpful, no dead ends, mobile thumb reach, forms short.
8. **Polish:** icon style consistent, image quality, alignment of icons with text, no placeholder text.

## Output
A ranked list: **Must fix**, **Should fix**, **Nice to have**. For each: what, why it matters, the concrete change (value or token). Then apply the Must-fix items, re-shoot, and say what changed. Do not rewrite the design from scratch unless asked.

Related: `design-review`, `ui-ux-pro-max`, `frontend-design`, `web-accessibility-audit`.
