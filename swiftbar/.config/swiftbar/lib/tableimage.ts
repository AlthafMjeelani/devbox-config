// The dropdown "AI USAGE" card as one image: green / orange / red bars, colored percentages and status.
import { Canvas, rgb } from "./draw.ts";

export type Cell = { left: number; color: string } | null;
export type TableRow = { name: string; nameColor: string; five: Cell; seven: Cell; status: string; statusColor: string };
export type Table = { connected: number; attention: number; rows: TableRow[] };

const S = 2, W = 412;
const BG = rgb("#1E2028"), TRACK = rgb("#FFFFFF", 40), WHITE = rgb("#F2F2F7"), GRAY = rgb("#8E8E93"), LINE = rgb("#FFFFFF", 28);
const GREEN = "#30D158", YELLOW = "#FFD60A";

const ROWS_H = 28, TOP = 98;
/** Size in points; SwiftBar needs it (width=/height=) or it shrinks dropdown images to icon size. */
export const tableSize = (rows: number) => ({ width: W, height: TOP + Math.max(1, rows) * ROWS_H + 12 });

export function renderTable(t: Table): string {
  const rowsH = ROWS_H, top = TOP, H = tableSize(t.rows.length).height;
  const c = new Canvas(W * S, H * S);
  const lh = (set: string) => c.lineHeight(set);
  // y values are in points; text is positioned by its vertical center.
  const textC = (set: string, s: string, x: number, cy: number, col = WHITE) => c.text(set, s, Math.round(x * S), Math.round(cy * S - lh(set) / 2), col);

  c.roundRect(0, 0, W * S, H * S, 14 * S, BG);
  textC("reg22", "AI USAGE", 16, 20, GRAY);
  c.circle(22 * S, 44 * S, 4.5 * S, rgb(GREEN));
  const x1 = textC("semi26", `${t.connected} Connected`, 32, 44) / S;
  c.circle((x1 + 22) * S, 44 * S, 4.5 * S, rgb(t.attention ? YELLOW : "#8E8E93"));
  textC("semi26", `${t.attention} Needing Attention`, x1 + 32, 44);
  c.roundRect(16 * S, 62 * S, (W - 32) * S, 1 * S, 0, LINE);

  const colName = 16, col5 = 150, col7 = 230, colSt = 316, barW = 36, barH = 6;
  textC("reg22", "Agent", colName, 78, GRAY);
  textC("reg22", "5h Limit", col5, 78, GRAY);
  textC("reg22", "7d Limit", col7, 78, GRAY);
  textC("reg22", "Status", colSt, 78, GRAY);
  c.roundRect(16 * S, 90 * S, (W - 32) * S, 1 * S, 0, LINE);

  const bar = (x: number, cy: number, cell: Cell) => {
    c.roundRect(x * S, (cy - barH / 2) * S, barW * S, barH * S, (barH / 2) * S, TRACK);
    if (!cell) { textC("semi26", "--", x + barW + 6, cy, GRAY); return; }
    const col = rgb(cell.color);
    c.roundRect(x * S, (cy - barH / 2) * S, Math.max(cell.left > 0 ? barH : 0, (cell.left / 100) * barW) * S, barH * S, (barH / 2) * S, col);
    textC("semi26", `${Math.round(cell.left)}%`, x + barW + 6, cy, col);
  };

  // A small flame: orange teardrop with a yellow core, built from stacked circles.
  const flame = (x: number, cy: number) => {
    const teardrop = (r: number, col: string, dy: number) => {
      c.circle((x + 5) * S, (cy + 2 + dy) * S, r * S, rgb(col));
      for (let k = 1; k <= 6; k++) c.circle((x + 5) * S, (cy + 2 + dy - k * 1.3) * S, Math.max(0.6, r * (1 - k / 6.5)) * S, rgb(col));
    };
    teardrop(4, "#FF6A00", 0);
    teardrop(2, "#FFD60A", 1);
  };

  t.rows.forEach((r, i) => {
    const cy = top + i * rowsH + rowsH / 2 - 4;
    let name = r.name;
    while (name.length > 1 && c.measure("semi26", name) > (col5 - colName - 8) * S) name = name.slice(0, -2) + "…";
    textC("semi26", name, colName, cy, rgb(r.nameColor));
    bar(col5, cy, r.five);
    bar(col7, cy, r.seven);
    const sx = textC("semi22", r.status, colSt, cy, rgb(r.statusColor)) / S;
    if (r.status === "HIGH BURN") flame(sx + 4, cy);
  });
  return c.png().toString("base64");
}
