// Menu bar image: per agent a colored dot, a rounded meter and the percent used. Pure TypeScript PNG
// writer (no dependencies), drawn at 2x and tagged 144 dpi so macOS shows it sharp at 18pt tall.
import { encodePng } from "./draw.ts";

export type BarItem = { color: string; used: number | null; label?: string; labelColor?: string };

const S = 2;                       // pixels per point
const H = 18 * S;
const TRACK: RGBA = [128, 128, 128, 96];
type RGBA = [number, number, number, number];

const hex = (c: string): RGBA => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16), 255];

// 3x5 glyphs, one string of 15 bits per character.
const FONT: Record<string, string> = {
  "0": "111101101101111", "1": "010110010010111", "2": "111001111100111", "3": "111001111001111",
  "4": "101101111001001", "5": "111100111001111", "6": "111100111101111", "7": "111001001010010",
  "8": "111101111101111", "9": "111101111001111", "-": "000000111000000",
  C: "111100100100111", X: "101101010101101", A: "010101111101101", G: "111100101101111", K: "101101110101101", O: "111101101101111", L: "100100100100111",
};
const CELL = 4, GLYPH_W = 3 * CELL, ADVANCE = GLYPH_W + CELL;

const textWidth = (t: string) => t.length * ADVANCE - CELL;

export function renderBar(items: BarItem[]): string {
  const dot = 10 * S, barW = 26 * S, barH = 6 * S, gap = 4 * S, between = 10 * S;
  const labels = items.map((i) => (i.used === null ? "--" : `${Math.round(Math.min(100, Math.max(0, i.used)))}`));
  const PCT_W = 10 + CELL;
  const itemW = labels.map((l, n) => (items[n].label ? textWidth(items[n].label!) + gap : 0) + barW + gap + textWidth(l) + PCT_W);
  const W = itemW.reduce((a, b) => a + b, 0) + between * Math.max(0, items.length - 1) + 2 * S;
  const px = new Uint8ClampedArray(W * H * 4);

  const blend = (x: number, y: number, c: RGBA, cov: number) => {
    if (x < 0 || y < 0 || x >= W || y >= H || cov <= 0) return;
    const i = (y * W + x) * 4, a = (c[3] / 255) * cov, oa = px[i + 3] / 255;
    const outA = a + oa * (1 - a);
    if (outA === 0) return;
    for (let k = 0; k < 3; k++) px[i + k] = (c[k] * a + px[i + k] * oa * (1 - a)) / outA;
    px[i + 3] = outA * 255;
  };
  // Anti-aliased rounded rectangle by 4x4 supersampling.
  const roundRect = (x0: number, y0: number, w: number, h: number, r: number, c: RGBA) => {
    if (w <= 0) return;
    r = Math.min(r, w / 2, h / 2);
    for (let y = Math.floor(y0); y < Math.ceil(y0 + h); y++) for (let x = Math.floor(x0); x < Math.ceil(x0 + w); x++) {
      let hit = 0;
      for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
        const fx = x + (sx + 0.5) / 4 - x0, fy = y + (sy + 0.5) / 4 - y0;
        if (fx < 0 || fy < 0 || fx > w || fy > h) continue;
        const cx = fx < r ? r : fx > w - r ? w - r : fx, cy = fy < r ? r : fy > h - r ? h - r : fy;
        if ((fx - cx) ** 2 + (fy - cy) ** 2 <= r * r) hit++;
      }
      blend(x, y, c, hit / 16);
    }
  };
  const drawText = (t: string, x: number, y: number, c: RGBA) => {
    for (const ch of t) {
      const bits = FONT[ch] ?? FONT["-"];
      for (let i = 0; i < 15; i++) if (bits[i] === "1") {
        const gx = x + (i % 3) * CELL, gy = y + Math.floor(i / 3) * CELL;
        for (let dy = 0; dy < CELL; dy++) for (let dx = 0; dx < CELL; dx++) blend(gx + dx, gy + dy, c, 1);
      }
      x += ADVANCE;
    }
  };

  let x = S;
  items.forEach((item, n) => {
    const c = item.used === null ? ([142, 142, 147, 255] as RGBA) : hex(item.color);
    const cy = H / 2;
    if (item.label) { drawText(item.label, x, cy - (5 * CELL) / 2, item.labelColor ? hex(item.labelColor) : c); x += textWidth(item.label) + gap; }
    const bx = x;
    roundRect(bx, cy - barH / 2, barW, barH, barH / 2, TRACK);
    const fill = item.used === null ? 0 : Math.max(item.used > 0 ? barH : 0, (Math.min(100, item.used) / 100) * barW);
    roundRect(bx, cy - barH / 2, fill, barH, barH / 2, c);
    const tx = bx + barW + gap;
    drawText(labels[n], tx, cy - (5 * CELL) / 2, c);
    if (item.used !== null) {
      const pct = ["11001", "11010", "00010", "00100", "01000", "01011", "10011"], px0 = tx + textWidth(labels[n]) + CELL;
      pct.forEach((row, ry) => [...row].forEach((v, rx) => { if (v === "1") for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) blend(px0 + rx * 2 + dx, cy - 7 + ry * 2 + dy, c, 1); }));
    }
    x += barW + gap + textWidth(labels[n]) + PCT_W + between;
  });

  return encodePng(px, W, H).toString("base64");
}
