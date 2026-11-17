---
name: web-performance-optimization
description: Measure and improve web performance (Core Web Vitals, bundle size, rendering, caching, images). Use for slow pages, poor Lighthouse scores, or large bundles.
---

# Web performance

## Measure first
- Lighthouse or WebPageTest for lab data; real-user data (CrUX, RUM) for truth. Record a baseline.
- Targets: LCP under 2.5s, INP under 200ms, CLS under 0.1.

## Fix in order of impact
- Images: modern formats (AVIF/WebP), correct sizes, `srcset`, lazy-load below the fold, explicit width and height.
- JavaScript: analyze the bundle, code-split by route, drop unused deps, defer non-critical scripts.
- Rendering: avoid layout shift, preload the LCP resource, inline critical CSS, avoid long main-thread tasks.
- Network: HTTP caching with immutable hashed assets, CDN, compression (Brotli), preconnect to key origins.
- Data: avoid request waterfalls, cache and dedupe queries (see `react-state-and-query`).

## Verify
- Re-measure with the same method and report before and after. Do not claim a win without numbers.

Related: `vercel-react-best-practices`, `performance-review`, `observability-and-monitoring`.
