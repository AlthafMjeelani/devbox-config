---
name: svg-logo-and-icon-design
description: Design clean vector SVG logos, custom icon sets, and app icons/splash screens for web and Flutter. Original designs only.
---

# SVG Logo and Icon Design

## Logo
- Start from concept words, sketch a simple geometric mark on a grid; it must work in one color at 16 px.
- Deliver: full-color, mono, reversed, icon-only, and horizontal lockup variants.
- Original marks only; do not imitate existing brands.

## SVG hygiene
- `viewBox` set, no fixed width/height in source; shapes use `<path>`/primitives, strokes converted to outlines for logos.
- Round coordinates to 1-2 decimals; `fill="currentColor"` for themable icons; minimize with `svgo`.
- Include `<title>` for accessibility; no embedded raster or external fonts (convert text to paths).

## Icon sets
- 24x24 grid, 2 px stroke, 2 px padding, consistent corner radius and caps/joins across all icons.
- Name by meaning (`arrow-left`), export as sprite or individual files.

## App icons
- Master 1024x1024, no transparency for iOS, no pre-rounded corners.
- Android adaptive: foreground + background layers in 108 dp with a 66 dp safe zone.
- Generate with `flutter_launcher_icons`; splash with `flutter_native_splash`. Web: favicon.svg, 192/512 PNG, maskable icon, `manifest.webmanifest`.
