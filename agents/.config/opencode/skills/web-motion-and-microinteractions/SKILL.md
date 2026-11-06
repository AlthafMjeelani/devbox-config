---
name: web-motion-and-microinteractions
description: Add polished web motion - Framer Motion layout transitions, scroll-driven animation, bento grids and restrained glassmorphism - while staying performant and accessible.
---

# Web Motion and Microinteractions

## Principles
- Motion explains change (state, hierarchy, causality); never decorative noise.
- Durations 150-300 ms for UI, up to 500 ms for page-level; ease-out for entrances, ease-in for exits.
- Animate `transform` and `opacity` only; avoid layout-triggering properties.
- Honor `prefers-reduced-motion` (`useReducedMotion` in Framer Motion, media query in CSS).

## Framer Motion
- `layout` / `layoutId` for shared-element and reorder transitions; `AnimatePresence` for exits.
- Variants + `staggerChildren` for lists; springs (`stiffness 300, damping 30`) for natural feel.
- `whileHover`/`whileTap` for micro-feedback.

## Scroll-driven
- CSS `animation-timeline: scroll()/view()` where supported, fallback to `useScroll` + `useTransform` or IntersectionObserver.

## Layout and surface
- **Bento grid**: CSS grid with `grid-template-areas`, consistent gap, varied spans, rounded 16-24 px cards.
- **Glassmorphism**: `backdrop-filter: blur(12-20px)`, translucent fill (`rgb(255 255 255 / .08)`), 1 px subtle border; ensure text contrast and provide a solid fallback.

## Checklist
Focus states animated too, no motion on critical-path load, 60 fps verified in DevTools Performance, no layout shift.
