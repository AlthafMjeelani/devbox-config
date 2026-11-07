// Pure logic for the AI usage SwiftBar plugin: severity, burn-rate forecast, menu bar selection and alerts.

export type Row = { agent: string; account: string; pool: string; limit: string; used: number | null; resetAt: number | null; note?: string };
export type Pool = {
  agent: string; account: string; pool: string; left: number | null; usageIncomplete: boolean;
  nextResetAt: number | null; status: "usable" | "blocked" | "unknown"; rows: Row[];
};
export type Sev = "ok" | "warn" | "crit";

export const GREEN = "#30D158", ORANGE = "#FF9F0A", RED = "#FF453A", GRAY = "#8E8E93";
export const SEV_COLOR: Record<Sev, string> = { ok: GREEN, warn: ORANGE, crit: RED };

// Thresholds on quota LEFT: ok > 30%, warn 11-30%, crit <= 10%.
export const LOW = 30, CRITICAL = 10;

export const leftOf = (row: Row): number | null => (row.used === null ? null : 100 - row.used);

export function until(ms: number | null, now = Date.now()): string {
  if (!ms) return "";
  const diff = ms - now;
  if (diff <= 0) return "now";
  const m = Math.floor(diff / 60_000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

// Burn-rate forecast for fixed windows (5h, 7d): assumes usage continues at the pace seen so far.
export const WINDOW_MS: Record<string, number> = { "5h": 5 * 3_600_000, "7d": 7 * 86_400_000 };
export type Forecast = { rate: number; unit: string; breachInMs: number | null; endLeft: number; safe: number };

export function forecast(row: Row, now = Date.now()): Forecast | null {
  const window = WINDOW_MS[row.limit];
  if (!window || row.used === null || !row.resetAt) return null;
  const remaining = row.resetAt - now;
  const elapsed = window - remaining;
  if (remaining <= 0 || elapsed < window * 0.04) return null; // too early in the window to project
  const perMs = row.used / elapsed;
  const unitMs = row.limit === "5h" ? 3_600_000 : 86_400_000;
  const projectedUsed = row.used + perMs * remaining;
  return {
    rate: perMs * unitMs,
    unit: row.limit === "5h" ? "h" : "d",
    breachInMs: projectedUsed >= 100 && perMs > 0 ? (100 - row.used) / perMs : null,
    endLeft: Math.max(0, 100 - projectedUsed),
    safe: ((100 - row.used) / remaining) * unitMs,
  };
}

export const breaches = (row: Row | undefined, now = Date.now()): boolean => {
  const f = row ? forecast(row, now) : null;
  return !!f && f.breachInMs !== null;
};

export function severity(left: number | null, burning = false): Sev | null {
  if (left === null) return null;
  return left <= CRITICAL ? "crit" : left <= LOW || burning ? "warn" : "ok";
}

export const connected = (pool: Pool): boolean =>
  pool.left !== null || pool.rows.some((r) => r.used !== null || /connected|cached|rate limited|running|left$/.test(r.note ?? ""));
export const hasQuota = (pool: Pool): boolean => pool.rows.some((r) => r.used !== null);

/** Worst window of a set of rows (least quota left), ignoring rows without data. */
export function worstRow(rows: Row[]): Row | null {
  const known = rows.filter((r) => r.used !== null);
  return known.length ? known.reduce((a, b) => (100 - b.used! < 100 - a.used! ? b : a)) : null;
}

export function poolSeverity(pool: Pool, now = Date.now()): Sev | null {
  if (pool.status === "blocked") return "crit";
  const w = worstRow(pool.rows);
  if (!w) return pool.left === null ? null : severity(pool.left);
  return severity(leftOf(w), pool.rows.some((r) => breaches(r, now)));
}

export type AgentSummary = { agent: string; sev: Sev | null; left: number | null; row: Row | null; usable: boolean };

export function summarizeAgents(pools: Pool[], now = Date.now()): AgentSummary[] {
  const names = [...new Set(pools.filter(connected).map((p) => p.agent))];
  return names.map((agent) => {
    const mine = pools.filter((p) => p.agent === agent);
    const row = worstRow(mine.flatMap((p) => p.rows));
    const left = row ? leftOf(row) : null;
    const sevs = mine.map((p) => poolSeverity(p, now)).filter((s): s is Sev => s !== null);
    const sev = sevs.includes("crit") ? "crit" : sevs.includes("warn") ? "warn" : sevs.length ? "ok" : null;
    return { agent, sev, left, row, usable: mine.some((p) => p.status === "usable") };
  });
}

const SEV_RANK: Record<string, number> = { crit: 0, warn: 1, ok: 2, none: 3 };

/** Attention items first (worst first), then healthy agents with the most quota left. */
export function byUrgency(items: AgentSummary[]): AgentSummary[] {
  return [...items].sort(
    (a, b) => SEV_RANK[a.sev ?? "none"] - SEV_RANK[b.sev ?? "none"] || (a.left ?? 101) - (b.left ?? 101) || a.agent.localeCompare(b.agent),
  );
}

/**
 * Which agents appear in the menu bar. Everything needing attention is shown (up to `max`);
 * if there is room, the best agent to spend first fills the remainder. The rest collapse into "+N".
 */
export function selectMenubar(items: AgentSummary[], bestAgent: string | undefined, max = 3) {
  const ordered = byUrgency(items);
  const attention = ordered.filter((i) => i.sev === "crit" || i.sev === "warn");
  const healthy = ordered.filter((i) => i.sev !== "crit" && i.sev !== "warn");
  const shown = attention.slice(0, max);
  const best = healthy.find((i) => i.agent === bestAgent) ?? [...healthy].sort((a, b) => (b.left ?? -1) - (a.left ?? -1))[0];
  if (shown.length < max && best) shown.push(best);
  for (const h of healthy) {
    if (shown.length >= max) break;
    if (!shown.includes(h)) shown.push(h);
  }
  const hidden = items.filter((i) => !shown.includes(i));
  return { shown, hidden: hidden.length, hiddenAttention: hidden.filter((i) => i.sev === "crit" || i.sev === "warn").length };
}

export const poolKey = (p: Pool) => `${p.agent}|${p.account}|${p.pool}`;

export function poolSeverities(pools: Pool[], now = Date.now()): Record<string, Sev> {
  const out: Record<string, Sev> = {};
  for (const p of pools) {
    const s = poolSeverity(p, now);
    if (s) out[poolKey(p)] = s;
  }
  return out;
}

/** Notifications for transitions only. No previous state means no alerts, so the first run is silent. */
export function diffAlerts(prev: Record<string, Sev> | null, pools: Pool[], now = Date.now()): { title: string; body: string }[] {
  if (!prev) return [];
  const alerts: { title: string; body: string }[] = [];
  for (const p of pools) {
    const was = prev[poolKey(p)];
    const is = poolSeverity(p, now);
    if (!was || !is || was === is) continue;
    const name = p.pool !== "default" && p.pool !== p.account ? `${p.agent} · ${p.pool}` : p.agent;
    const w = worstRow(p.rows);
    const left = w ? Math.round(leftOf(w)!) : p.left === null ? null : Math.round(p.left);
    if (is === "crit" && was !== "crit") {
      alerts.push({ title: `${name} is almost out`, body: p.status === "blocked" ? "Limit reached." : `${left ?? "?"}% left${w && w.limit !== "-" ? ` (${w.limit})` : ""}${w?.resetAt ? `, resets in ${until(w.resetAt, now)}` : ""}.` });
    } else if (was === "crit" && is !== "crit") {
      alerts.push({ title: `${name} is available again`, body: `${left ?? "?"}% left.` });
    }
  }
  return alerts;
}

/**
 * Which pool to spend first: among usable pools that are not nearly exhausted, the one that resets soonest
 * (use it before it refills). Falls back to the least-exhausted usable pool, never recommends a blocked one.
 */
export function pickBest(pools: Pool[], now = Date.now()): Pool | undefined {
  const usable = pools.filter((p) => p.status === "usable");
  const healthy = usable.filter((p) => poolSeverity(p, now) !== "crit");
  const soonest = (a: Pool, b: Pool) => (a.nextResetAt ?? Infinity) - (b.nextResetAt ?? Infinity);
  if (healthy.length) return [...healthy].sort(soonest)[0];
  return [...usable].sort((a, b) => (b.left ?? -1) - (a.left ?? -1))[0];
}

// Per-agent icons: a text glyph for the menu bar title (which can only carry text) and an SF Symbol for the
// dropdown. Generic shapes only, so every agent is recognizable at a glance without copying anyone's logo.
export const AGENT_GLYPH: Record<string, string> = {
  Codex: "⌘", Claude: "✺", Amp: "ϟ", Antigravity: "△", Kimi: "☾", CommandCode: "❯", OpenCode: "{}",
};
export const AGENT_SYMBOL: Record<string, string> = {
  Codex: "chevron.left.forwardslash.chevron.right", Claude: "sparkle", Amp: "bolt.fill", Antigravity: "arrow.up.forward.circle.fill",
  Kimi: "moon.stars.fill", CommandCode: "terminal.fill", OpenCode: "curlybraces",
};
export const glyphOf = (agent: string): string => AGENT_GLYPH[agent] ?? "◆";
export const symbolOf = (agent: string): string => AGENT_SYMBOL[agent] ?? "circle.fill";

// ---- usage bar with a pace tick, and the one-line context under it --------------------------
// Fraction of the window already elapsed (0..1), or null when it is unknown.
export function elapsedOf(row: Row, now = Date.now()): number | null {
  const window = WINDOW_MS[row.limit];
  if (!window || !row.resetAt) return null;
  const remaining = row.resetAt - now;
  if (remaining <= 0) return null;
  return Math.max(0, Math.min(1, 1 - remaining / window));
}

// Filled = used. The tick │ marks where you would be if you spent evenly across the window.
// Left of the tick when you are under pace, right of it when you are ahead.
export function paceBar(used: number | null, elapsed: number | null, width = 28): string {
  const u = Math.max(0, Math.min(1, (used ?? 0) / 100));
  const fill = Math.round(u * width);
  if (elapsed === null) return "█".repeat(fill) + "░".repeat(width - fill);
  const tick = Math.min(width - 1, Math.round(elapsed * width));
  let out = "";
  for (let i = 0; i < width; i++) out += i === tick ? "│" : i < fill ? "█" : "░";
  return out;
}

// "34% used · 12% ahead of pace · limit in ~2d 0h"  (or "resets in 3h 10m" when no breach is coming)
export function detailText(row: Row, now = Date.now()): string {
  if (row.used === null) return "no data";
  const parts = [`${Math.round(row.used)}% used`];
  const elapsed = elapsedOf(row, now);
  if (elapsed !== null) {
    const pts = Math.round(Math.abs(row.used / 100 - elapsed) * 100);
    parts.push(pts < 2 ? "on pace" : `${pts}% ${row.used / 100 > elapsed ? "ahead of" : "under"} pace`);
  }
  const f = forecast(row, now);
  if (row.used >= 100) parts.push("limit reached");
  else if (f && f.breachInMs !== null) parts.push(`limit in ~${until(now + f.breachInMs, now)}`);
  else if (row.resetAt) parts.push(`resets in ${until(row.resetAt, now)}`);
  return parts.join(" · ");
}

// ---- bar: one tiny meter per live Claude / Codex account (session window), like the dotfiles widget ----
export const miniMeter = (used: number | null, cells = 5): string => {
  const f = used === null ? 0 : Math.max(used > 0 ? 1 : 0, Math.round((Math.min(100, used) / 100) * cells));
  return "▰".repeat(f) + "▱".repeat(cells - f);
};
export type BarMeter = { agent: string; left: number | null; sev: Sev | null; meter: string };
// Values are "% left", the same number the dropdown shows, so header and menu never disagree.
export function barMeters(pools: Pool[], now = Date.now()): BarMeter[] {
  const out: BarMeter[] = [];
  for (const agent of ["Claude", "Codex"]) {
    const mine = pools.filter((p) => p.agent === agent && connected(p));
    if (!mine.length) continue;
    const rows = mine.flatMap((p) => p.rows).filter((r) => r.used !== null);
    const session = rows.find((r) => r.limit === "5h") ?? rows[0];
    const left = session ? leftOf(session) : null;
    out.push({ agent, left, sev: severity(left, breaches(session, now)), meter: miniMeter(left) });
  }
  return out;
}

// Short status word for a pool, as in the dropdown table.
export function statusWord(pool: Pool, now = Date.now()): { text: string; sev: Sev | null } {
  if (pool.status === "blocked") return { text: "LIMIT", sev: "crit" };
  const sev = poolSeverity(pool, now);
  if (sev === "crit") return { text: "CRITICAL", sev };
  if (sev === "warn") {
    const left = worstRow(pool.rows) ? leftOf(worstRow(pool.rows)!) : pool.left;
    return { text: pool.rows.some((r) => breaches(r, now)) && (left ?? 0) > LOW ? "HIGH BURN" : "LOW", sev };
  }
  return { text: sev === "ok" ? "OPTIMAL" : "--", sev };
}
