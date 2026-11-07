// Menu bar image: per agent a colored dot, a rounded meter and the percent used. Pure TypeScript PNG
// writer (no dependencies), drawn at 2x and tagged 144 dpi so macOS shows it sharp at 18pt tall.
import zlib from "node:zlib";

export type BarItem = { color: string; used: number | null; letter?: string };

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
  C: "111100100100111", X: "101101010101101", A: "010101111101101", G: "111100101101111", K: "101101110101101", O: "111101101101111",
};
const CELL = 4, GLYPH_W = 3 * CELL, ADVANCE = GLYPH_W + CELL;

const textWidth = (t: string) => t.length * ADVANCE - CELL;

export function renderBar(items: BarItem[]): string {
  const dot = 10 * S, barW = 26 * S, barH = 6 * S, gap = 4 * S, between = 10 * S;
  const labels = items.map((i) => (i.used === null ? "--" : `${Math.round(Math.min(100, Math.max(0, i.used)))}`));
  const itemW = labels.map((l) => dot + gap + barW + gap + textWidth(l));
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
    roundRect(x, cy - dot / 2, dot, dot, dot / 2, c);
    if (item.letter) {
      const ink: RGBA = [20, 20, 26, 255], cell = 2, g = FONT[item.letter] ?? "";
      for (let i = 0; i < g.length; i++) if (g[i] === "1") {
        const gx = x + (dot - 3 * cell) / 2 + (i % 3) * cell, gy = cy - (5 * cell) / 2 + Math.floor(i / 3) * cell;
        for (let dy = 0; dy < cell; dy++) for (let dx = 0; dx < cell; dx++) blend(gx + dx, gy + dy, ink, 1);
      }
    }
    const bx = x + dot + gap;
    roundRect(bx, cy - barH / 2, barW, barH, barH / 2, TRACK);
    const fill = item.used === null ? 0 : Math.max(item.used > 0 ? barH : 0, (Math.min(100, item.used) / 100) * barW);
    roundRect(bx, cy - barH / 2, fill, barH, barH / 2, c);
    drawText(labels[n], bx + barW + gap, cy - (5 * CELL) / 2, c);
    x += itemW[n] + between;
  });

  return encodePng(px, W, H).toString("base64");
}

// ---- minimal PNG encoder ----
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
const crc32 = (buf: Uint8Array) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type: string, data: Uint8Array): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  Buffer.from(data).copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
function encodePng(px: Uint8ClampedArray, w: number, h: number): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const phys = Buffer.alloc(9); phys.writeUInt32BE(5669, 0); phys.writeUInt32BE(5669, 4); phys[8] = 1; // 144 dpi
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(px.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("pHYs", phys), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
