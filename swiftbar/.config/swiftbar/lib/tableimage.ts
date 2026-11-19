// The dropdown "AI USAGE" card as one image: one block per agent with its 5h and 7d limits side by side
// (bar, % left, time to reset and the local reset date/time), then a Codex reset credits panel.
import { Canvas, rgb, type RGBA } from "./draw.ts";

/** One limit window. `detail` is the reset line, e.g. "2h 4m · today 15:09". */
export type Window = { label: string; left: number | null; color: string; detail: string };
export type CardRow = { name: string; status: string; statusColor: string; windows: Window[] };
export type Credits = { available: number; next: string; chips: string[] };
export type Card = { connected: number; attention: number; rows: CardRow[]; credits: Credits | null };

const S = 2, W = 412, PAD = 16, GAP = 24;
const BG = rgb("#1C1E25"), PANEL = rgb("#22252D"), TRACK = rgb("#FFFFFF", 30), LINE = rgb("#FFFFFF", 26);
const WHITE = rgb("#F2F2F7"), SOFT = rgb("#C7C9D1"), GRAY = rgb("#8E8E93");
const GREEN = "#30D158", YELLOW = "#FFD60A";

const HEAD_H = 72, ROW_H = 100, CREDITS_H = 132;
/** Size in points; SwiftBar needs it (width=/height=) or it shrinks dropdown images to icon size. */
export function cardSize(rows: number, credits: boolean) {
  return { width: W, height: HEAD_H + Math.max(1, rows) * ROW_H + (credits ? CREDITS_H + 12 : 0) + 8 };
}

export function renderCard(card: Card): string {
  const { width, height } = cardSize(card.rows.length, !!card.credits);
  const c = new Canvas(width * S, height * S);
  const lh = (set: string) => c.lineHeight(set);
  // Positions are in points; text is placed by its vertical center. Returns the x (points) after the text.
  const text = (set: string, s: string, x: number, cy: number, col: RGBA) => c.text(set, s, Math.round(x * S), Math.round(cy * S - lh(set) / 2), col) / S;
  const textR = (set: string, s: string, right: number, cy: number, col: RGBA) => text(set, s, right - c.measure(set, s) / S, cy, col);
  const rect = (x: number, y: number, w: number, h: number, r: number, col: RGBA) => c.roundRect(x * S, y * S, w * S, h * S, r * S, col);
  const hline = (y: number) => rect(PAD, y, W - 2 * PAD, 1, 0, LINE);
  const fit = (set: string, s: string, max: number) => {
    while (s.length > 1 && c.measure(set, s) / S > max) s = s.slice(0, -2) + "…";
    return s;
  };

  rect(0, 0, width, height, 14, BG);

  // header
  text("semi22", "AI USAGE", PAD, 20, GRAY);
  c.circle((PAD + 5) * S, 44 * S, 4.5 * S, rgb(GREEN));
  const x1 = text("semi26", `${card.connected} Connected`, PAD + 16, 44, WHITE);
  c.circle((x1 + 22) * S, 44 * S, 4.5 * S, rgb(card.attention ? YELLOW : "#8E8E93"));
  text("semi26", `${card.attention} Needing Attention`, x1 + 33, 44, WHITE);
  hline(HEAD_H - 8);

  // A small flame: orange teardrop with a yellow core, built from stacked circles.
  const flame = (x: number, cy: number) => {
    const drop = (r: number, col: string, dy: number) => {
      c.circle((x + 5) * S, (cy + 2 + dy) * S, r * S, rgb(col));
      for (let k = 1; k <= 6; k++) c.circle((x + 5) * S, (cy + 2 + dy - k * 1.3) * S, Math.max(0.6, r * (1 - k / 6.5)) * S, rgb(col));
    };
    drop(4, "#FF6A00", 0);
    drop(2, "#FFD60A", 1);
  };

  const colW = (W - 2 * PAD - GAP) / 2;
  const limit = (win: Window | undefined, x: number, top: number) => {
    if (!win) return;
    text("semi24", win.label, x, top + 8, SOFT);
    textR("semi24", win.left === null ? "--" : `${Math.round(win.left)}%`, x + colW, top + 8, win.left === null ? GRAY : WHITE);
    rect(x, top + 21, colW, 6, 3, TRACK);
    if (win.left !== null && win.left > 0) rect(x, top + 21, Math.max(6, (Math.min(100, win.left) / 100) * colW), 6, 3, rgb(win.color));
    text("reg22", fit("reg22", win.detail, colW), x, top + 40, GRAY);
  };

  card.rows.forEach((r, i) => {
    const top = HEAD_H + i * ROW_H;
    const statusW = c.measure("semi22", r.status) / S + (r.status === "HIGH BURN" ? 16 : 0);
    text("semi30", fit("semi30", r.name, W - 2 * PAD - statusW - 12), PAD, top + 16, WHITE);
    const sx = textR("semi22", r.status, W - PAD, top + 16, rgb(r.statusColor));
    if (r.status === "HIGH BURN") flame(sx - statusW - 2, top + 16);
    limit(r.windows[0], PAD, top + 34);
    if (r.windows[1]) {
      rect(W / 2, top + 36, 1, 50, 0, LINE);
      limit(r.windows[1], PAD + colW + GAP, top + 34);
    }
    if (i < card.rows.length - 1 || card.credits) hline(top + ROW_H - 4);
  });

  if (card.credits) {
    const cr = card.credits, top = HEAD_H + card.rows.length * ROW_H + 8, h = CREDITS_H;
    rect(PAD - 4, top, W - 2 * PAD + 8, h, 12, LINE);
    rect(PAD - 3, top + 1, W - 2 * PAD + 6, h - 2, 11, PANEL);
    const x = PAD + 10;
    text("semi22", "CODEX RESET CREDITS", x, top + 20, GRAY);
    const nx = text("bold64", String(cr.available), x, top + 50, WHITE);
    text("reg28", "available", nx + 8, top + 54, WHITE);
    text("reg24", fit("reg24", cr.next, W - 2 * PAD - 20), x, top + 82, cr.available ? SOFT : GRAY);
    let cx = x;
    for (const chip of cr.chips) {
      const w = c.measure("reg22", chip) / S + 20;
      if (cx + w > W - PAD - 6) break;
      rect(cx, top + 98, w, 22, 6, rgb("#FFFFFF", 70));
      rect(cx + 1, top + 99, w - 2, 20, 5, PANEL);
      text("reg22", chip, cx + 10, top + 109, SOFT);
      cx += w + 8;
    }
  }
  return c.png().toString("base64");
}
