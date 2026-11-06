#!/opt/homebrew/bin/bun
// <xbar.title>AI Usage</xbar.title>
// <xbar.desc>Quota left and reset times for Codex, Claude, Amp, Antigravity, Kimi, CommandCode and OpenCode, via `ai-usage --json`.</xbar.desc>
// <xbar.dependencies>bun, ai-usage (devbox-config scripts package)</xbar.dependencies>
// <swiftbar.hideAbout>true</swiftbar.hideAbout>
// <swiftbar.hideRunInTerminal>true</swiftbar.hideRunInTerminal>
// <swiftbar.hideDisablePlugin>true</swiftbar.hideDisablePlugin>

import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

type Row = { agent: string; account: string; pool: string; limit: string; used: number | null; resetAt: number | null; note?: string };
type Pool = { agent: string; account: string; pool: string; left: number | null; usageIncomplete: boolean; nextResetAt: number | null; status: "usable" | "blocked" | "unknown"; rows: Row[] };

const bin = path.join(os.homedir(), ".local/bin");
const env = { ...process.env, PATH: `${bin}:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH ?? ""}` };

const GREEN = "#30D158", ORANGE = "#FF9F0A", RED = "#FF453A", GRAY = "#8E8E93";
// Thresholds on quota LEFT: green > 30%, orange 11-30%, red <= 10%.
const hue = (left: number | null) => left === null ? GRAY : left <= 10 ? RED : left <= 30 ? ORANGE : GREEN;
const dot = (left: number | null) => left === null ? "⚪" : left <= 10 ? "🔴" : left <= 30 ? "🟠" : "🟢";
const level = (left: number | null) => left === null ? "" : left <= 0 ? "LIMIT" : left <= 10 ? "CRITICAL" : left <= 30 ? "LOW" : "OK";
const clean = (text: string) => text.replace(/[|\n\r]/g, " ").trim();
const ansi = (code: number, text: string) => `\u001b[${code}m${text}\u001b[0m`;

// Each agent has its own identity color; low quota overrides it with orange (<= 30%) or red (<= 10%).
const BRAND: Record<string, string> = { Codex: "#5E9BFF", Claude: "#C084FC", Amp: "#22D3EE", Antigravity: "#E5E7EB", Kimi: "#2DD4BF", CommandCode: "#A3E635", OpenCode: "#94A3B8" };
// SwiftBar only renders basic ANSI colors, so map each hex to the nearest basic code.
const ANSI: Record<string, number> = { "#5E9BFF": 94, "#C084FC": 95, "#22D3EE": 96, "#2DD4BF": 36, "#A3E635": 92, "#94A3B8": 37, "#30D158": 92, "#FF9F0A": 93, "#FF453A": 91, "#8E8E93": 90, "#E5E7EB": 97 };
const brand = (agent: string) => BRAND[agent] ?? "#C7C9D1";
const tint = (agent: string, left: number | null) => left !== null && left <= 30 ? hue(left) : brand(agent);
const paint = (hex: string, text: string) => `\u001b[${ANSI[hex] ?? 97}m${text}\u001b[0m`;

function until(ms: number | null): string {
  if (!ms) return "";
  const diff = ms - Date.now();
  if (diff <= 0) return "now";
  const m = Math.floor(diff / 60_000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}


const result = spawnSync(path.join(bin, "ai-usage"), ["--json"], { env, encoding: "utf8", timeout: 60_000 });
let pools: Pool[];
try {
  if (result.status !== 0) throw new Error(result.stderr || "ai-usage failed");
  pools = JSON.parse(result.stdout);
} catch (error) {
  console.log("AI ⚠︎ | sfimage=exclamationmark.triangle");
  console.log("---");
  console.log(`ai-usage failed: ${clean(String((error as Error).message)).slice(0, 120)} | color=${RED}`);
  console.log("Retry | refresh=true");
  process.exit(0);
}

const SHORT: Record<string, string> = { Codex: "Cx", Claude: "Cl", Amp: "Amp", Antigravity: "AG", Kimi: "Km", CommandCode: "CC", OpenCode: "OC" };
const LOGIN: Record<string, string> = { Kimi: "kimi login", Claude: "claude /login", CommandCode: "nvm install 22 && nvm use 22 && cmd login" };
const order = (limit: string) => limit === "5h" ? 0 : limit === "7d" ? 1 : 2;
const connected = (pool: Pool) => pool.left !== null || pool.rows.some((r) => r.used !== null || /connected|cached|rate limited|running|left$/.test(r.note ?? ""));
const poolName = (pool: Pool) => clean([pool.agent, pool.pool !== "default" && pool.pool !== pool.account ? pool.pool : ""].filter(Boolean).join(" · "));
const leftOf = (row: Row) => row.used === null ? null : 100 - row.used;

// Burn-rate forecast for fixed windows (5h, 7d): assumes usage continues at the pace seen so far in the window.
const WINDOW_MS: Record<string, number> = { "5h": 5 * 3_600_000, "7d": 7 * 86_400_000 };
type Forecast = { rate: number; unit: string; breachInMs: number | null; endLeft: number; safe: number } | null;
function forecast(row: Row): Forecast {
  const window = WINDOW_MS[row.limit];
  if (!window || row.used === null || !row.resetAt) return null;
  const remaining = row.resetAt - Date.now();
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
const breaches = (row: Row | undefined) => { const f = row ? forecast(row) : null; return !!f && f.breachInMs !== null; };

const hasQuota = (pool: Pool) => pool.rows.some((r) => r.used !== null);
const live = pools.filter(connected);
const quotaPools = live.filter(hasQuota);
const infoPools = live.filter((p) => !hasQuota(p));
const offline = pools.filter((pool) => !connected(pool));
const usable = pools.filter((p) => p.status === "usable").sort((a, b) => (a.nextResetAt ?? Infinity) - (b.nextResetAt ?? Infinity));
const best = usable[0];
const blockedAll = pools.length > 0 && usable.length === 0 && pools.some((p) => p.status === "blocked");

// ---- Menu bar: one colored dot + 5h quota left + reset per agent ----
const agents = [...new Set(live.map((p) => p.agent))];
// Overview status follows whichever window (5h or 7d) has less left.
const segments = agents.map((agent) => {
  const rows = pools.filter((p) => p.agent === agent).flatMap((p) => p.rows).filter((r) => r.used !== null);
  const name = SHORT[agent] ?? agent.slice(0, 3);
  if (!rows.length) return `${paint(GRAY, "●")} ${name} --`;
  const worst = rows.reduce((a, b) => (100 - b.used! < 100 - a.used! ? b : a));
  const left = 100 - worst.used!;
  // Traffic light for the whole segment: green OK, orange low / on pace to run out, red critical.
  const sev = left <= 10 ? RED : left <= 30 || rows.some(breaches) ? ORANGE : GREEN;
  const mark = paint(sev, sev === GREEN ? "●" : "▲");
  const win = worst.limit === "-" ? "" : ` ${worst.limit}`;
  const reset = worst.resetAt ? ` ↻${until(worst.resetAt)}` : "";
  return `${mark} ${paint(sev, name)} ${paint(sev, `${Math.round(left)}%`)}${win}${reset}`;
});
console.log(segments.length
  ? `${segments.join("   ")} | ansi=true size=12`
  : `AI -- | sfimage=gauge.with.dots.needle.0percent color=${blockedAll ? RED : GRAY}`);


// ---- Dropdown ----
console.log("---");
console.log(`AI USAGE  ·  ${live.length} connected | color=${GRAY} size=11`);
if (best) {
  const reset = best.nextResetAt ? `  ·  resets in ${until(best.nextResetAt)}` : "";
  console.log(`Use first: ${best.agent}  ·  ${Math.round(best.left ?? 0)}% left${reset} | color=${tint(best.agent, best.left)} size=13 sfimage=bolt.fill sfcolor=${brand(best.agent)}`);
} else if (blockedAll) {
  console.log(`All limits reached | color=${RED} size=13 sfimage=exclamationmark.octagon.fill sfcolor=${RED}`);
}
console.log("---");

// Thin continuous bar (single color per line, so it stays visible in any SwiftBar theme).
const line = (left: number | null, width = 30) => {
  const filled = left === null ? 0 : Math.round(Math.max(0, Math.min(100, left)) / 100 * width);
  return "━".repeat(filled) + "─".repeat(width - filled);
};
const statusIcon = (left: number | null, will: boolean) => left === null ? "questionmark.circle" : left <= 10 ? "xmark.octagon.fill" : left <= 30 || will ? "exclamationmark.triangle.fill" : "checkmark.circle.fill";
const LIMIT_NAME: Record<string, string> = { "5h": "5-hour limit", "7d": "Weekly limit" };

for (const pool of quotaPools) {
  const left = pool.left;
  const sev = pool.status === "blocked" ? RED : brand(pool.agent);
  const word = level(left);
  const known = pool.rows.filter((r) => r.used !== null);
  const worst = known.length ? known.reduce((x, y) => (100 - y.used! < 100 - x.used! ? y : x)) : null;
  const via = worst && worst.limit !== "-" ? ` (${worst.limit})` : "";
  const badge = word && word !== "OK" ? `   ⚠ ${word}${via}` : pool.rows.some(breaches) ? `   ⚠ HIGH BURN` : "";
  const who = pool.account !== "default" ? `  ·  ${clean(pool.account)}` : "";
  console.log(`${poolName(pool)}${badge} | color=${sev} size=14 sfimage=circle.fill sfcolor=${brand(pool.agent)}`);
  if (who) console.log(`${who.slice(5)} | color=${GRAY} size=11`);
  const rows = [...pool.rows].sort((a, b) => order(a.limit) - order(b.limit));
  if (!rows.some((r) => r.limit === "5h")) rows.unshift({ ...pool.rows[0]!, limit: "5h", used: null, resetAt: null, note: undefined });
  for (const row of rows) {
    const l = leftOf(row);
    const f = forecast(row);
    const will = !!f && f.breachInMs !== null;
    const bad = l !== null && l <= 30;
    // Row color is the standard traffic light: green OK, orange low or on pace to run out, red critical.
    const hex = l === null ? GRAY : l <= 10 ? RED : bad || will ? ORANGE : GREEN;
    const name = LIMIT_NAME[row.limit] ?? (row.limit === "-" ? "Quota" : row.limit);
    const pct = l === null ? "no data" : `${Math.round(l)}% left`;
    const reset = row.resetAt ? `resets in ${until(row.resetAt)}` : "";
    const note = row.note ? clean(row.note) : "";
    console.log(`${name.padEnd(13)} ${pct}${reset ? `  ·  ${reset}` : ""}${note ? `  ·  ${note}` : ""} | font=Menlo size=12 color=${hex} sfimage=${statusIcon(l, will)} sfcolor=${hex} trim=false`);
    console.log(`${line(l)} | font=Menlo size=12 color=${hex} trim=false`);
    if (f) {
      const per = `${f.rate < 10 ? f.rate.toFixed(1) : Math.round(f.rate)}%/${f.unit}`;
      const safe = `safe ≤ ${f.safe < 10 ? f.safe.toFixed(1) : Math.round(f.safe)}%/${f.unit}`;
      const msg = will ? `⚠ at ${per} you hit the limit in ${until(Date.now() + f.breachInMs!)}  ·  ${safe}` : `${per} burn  ·  ~${Math.round(f.endLeft)}% left at reset  ·  ${safe}`;
      console.log(`${msg} | font=Menlo size=11 color=${will ? ORANGE : GRAY} trim=false`);
    }
  }
  console.log("---");
}

if (infoPools.length) {
  console.log(`CONNECTED · NO QUOTA DATA | color=${GRAY} size=11`);
  for (const pool of infoPools) {
    const detail = clean(pool.rows[0]?.note ?? "connected");
    const who = pool.account !== "default" ? `  ·  ${clean(pool.account.replace(/\s*\(.*$/, ""))}` : "";
    console.log(`⚪ ${poolName(pool)}${who}  ·  ${detail} | size=12 color=${GRAY}`);
  }
  console.log("---");
}

if (offline.length) {
  console.log(`NEEDS LOGIN | color=${ORANGE} size=11`);
  for (const pool of offline) {
    const reason = clean(pool.rows[0]?.note ?? "no data");
    const fix = /rate limited/.test(reason) ? undefined : LOGIN[pool.agent];
    const action = fix ? ` shell=/bin/zsh param1=-lc param2='${fix}' terminal=true` : "";
    console.log(`${pool.agent}  ·  ${reason}${fix ? `   (click: ${fix})` : ""} | sfimage=exclamationmark.circle sfcolor=${ORANGE} color=${GRAY} size=12${action}`);
  }
  console.log("---");
}

console.log("Codex reset credits | sfimage=arrow.counterclockwise.circle shell=/bin/zsh param1=-lc param2=codex-resets terminal=true");
console.log("Full report | sfimage=terminal shell=/bin/zsh param1=-lc param2='ai-usage; read -k1' terminal=true");
console.log(`Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} | color=${GRAY} size=11`);
console.log("Refresh | sfimage=arrow.clockwise refresh=true");
