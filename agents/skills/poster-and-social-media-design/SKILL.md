---
name: poster-and-social-media-design
description: Create social graphics, OG cards, YouTube thumbnails and print posters with correct dimensions, safe zones and bleed. Outputs SVG/HTML rendered to PNG or PDF.
---

# Poster and Social Media Design

## Sizes
| Asset | Size |
|---|---|
| Instagram square / portrait / story-reel | 1080x1080 / 1080x1350 (4:5) / 1080x1920 (9:16) |
| LinkedIn / X link card, OG image | 1200x630 |
| YouTube thumbnail | 1280x720 (<2 MB) |
| Print A4 / A3 | 210x297 mm / 297x420 mm, +3 mm bleed, 300 dpi |

## Method
1. Get the message, audience, brand colors/fonts. One idea per piece.
2. Hierarchy: headline (largest, 3-7 words) -> visual -> supporting text -> CTA/logo.
3. Build as HTML/SVG at exact pixel size; render with headless Chromium (`page.screenshot`) or `rsvg-convert`; for print, export PDF with bleed and crop marks.
4. Keep text inside safe zones (Stories: ~250 px top/bottom clear; thumbnails: avoid bottom-right timestamp).

## Design rules
- Max 2 typefaces, strong size contrast, contrast ratio >= 4.5:1, generous margins, consistent grid.
- Thumbnails must read at 120 px wide: big text, one focal point.
- Print: CMYK-safe colors, convert text to outlines or embed fonts, rich black for large fills.

## Deliver
PNG (social), PDF (print), plus editable source file.
