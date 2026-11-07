// Tiny software canvas: anti-aliased rounded rects, Inter text from the glyph atlas, PNG output.
import zlib from "node:zlib";
import { ATLAS_B64 } from "./fontatlas.ts";

export type RGBA = [number, number, number, number];
export const rgb = (h: string, a = 255): RGBA => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), a];

type Glyph = { adv: number; w: number; h: number; bx: number; by: number; d: string };
type FontSet = { asc: number; desc: number; glyphs: Record<string, Glyph> };
let atlas: Record<string, FontSet> | null = null;
const bitmaps = new Map<Glyph, Uint8Array>();
function font(name: string): FontSet {
  atlas ??= JSON.parse(zlib.inflateSync(Buffer.from(ATLAS_B64, "base64")).toString());
  return atlas![name];
}

export class Canvas {
  px: Uint8ClampedArray;
  constructor(public w: number, public h: number) { this.px = new Uint8ClampedArray(w * h * 4); }

  blend(x: number, y: number, c: RGBA, cov: number) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || cov <= 0) return;
    const i = (y * this.w + x) * 4, a = (c[3] / 255) * cov, oa = this.px[i + 3] / 255, outA = a + oa * (1 - a);
    if (outA === 0) return;
    for (let k = 0; k < 3; k++) this.px[i + k] = (c[k] * a + this.px[i + k] * oa * (1 - a)) / outA;
    this.px[i + 3] = outA * 255;
  }

  roundRect(x0: number, y0: number, w: number, h: number, r: number, c: RGBA) {
    if (w <= 0 || h <= 0) return;
    r = Math.min(r, w / 2, h / 2);
    for (let y = Math.floor(y0); y < Math.ceil(y0 + h); y++) for (let x = Math.floor(x0); x < Math.ceil(x0 + w); x++) {
      let hit = 0;
      for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
        const fx = x + (sx + 0.5) / 4 - x0, fy = y + (sy + 0.5) / 4 - y0;
        if (fx < 0 || fy < 0 || fx > w || fy > h) continue;
        const cx = fx < r ? r : fx > w - r ? w - r : fx, cy = fy < r ? r : fy > h - r ? h - r : fy;
        if ((fx - cx) ** 2 + (fy - cy) ** 2 <= r * r) hit++;
      }
      this.blend(x, y, c, hit / 16);
    }
  }
  circle(cx: number, cy: number, r: number, c: RGBA) { this.roundRect(cx - r, cy - r, 2 * r, 2 * r, r, c); }

  measure(set: string, text: string): number {
    const f = font(set);
    return [...text].reduce((s, ch) => s + (f.glyphs[ch] ?? f.glyphs["?"]).adv, 0);
  }
  // y is the top of the line box (ascent line). Returns the x after the text.
  text(set: string, text: string, x: number, y: number, c: RGBA): number {
    const f = font(set);
    for (const ch of text) {
      const g = f.glyphs[ch] ?? f.glyphs["?"];
      if (g.w) {
        let bm = bitmaps.get(g);
        if (!bm) { bm = new Uint8Array(Buffer.from(g.d, "base64")); bitmaps.set(g, bm); }
        for (let j = 0; j < g.h; j++) for (let i = 0; i < g.w; i++) this.blend(Math.round(x) + g.bx + i, y + g.by + j, c, bm[j * g.w + i] / 255);
      }
      x += g.adv;
    }
    return x;
  }
  lineHeight(set: string) { const f = font(set); return f.asc + f.desc; }

  png(): Buffer { return encodePng(this.px, this.w, this.h); }
}

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
const crc32 = (buf: Uint8Array) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type: string, data: Uint8Array): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0); out.write(type, 4, "ascii"); Buffer.from(data).copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
export function encodePng(px: Uint8ClampedArray, w: number, h: number): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const phys = Buffer.alloc(9); phys.writeUInt32BE(5669, 0); phys.writeUInt32BE(5669, 4); phys[8] = 1; // 144 dpi = 2x
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) Buffer.from(px.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("pHYs", phys), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
