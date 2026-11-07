#!/opt/homebrew/bin/bun
// <xbar.title>AI Usage</xbar.title>
// <xbar.desc>Quota left, burn-rate forecast and reset times for Codex, Claude, Amp, Antigravity, Kimi, CommandCode and OpenCode, via `ai-usage --json`.</xbar.desc>
// <xbar.dependencies>bun, ai-usage (devbox-config scripts package)</xbar.dependencies>
// <swiftbar.hideAbout>true</swiftbar.hideAbout>
// <swiftbar.hideRunInTerminal>true</swiftbar.hideRunInTerminal>
// <swiftbar.hideDisablePlugin>true</swiftbar.hideDisablePlugin>

import { renderBar } from "../lib/barimage.ts";
import { renderTable, type Cell } from "../lib/tableimage.ts";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  GRAY, ORANGE, RED, SEV_COLOR, glyphOf, symbolOf, breaches, connected, diffAlerts, forecast, hasQuota, leftOf, pickBest, poolSeverities, poolSeverity,
  barMeters, statusWord, severity, summarizeAgents, paceBar, elapsedOf, detailText, until, worstRow, type Pool, type Row, type Sev,
} from "../lib/aiusage.ts";

const bin = path.join(os.homedir(), ".local/bin");
const env = { ...process.env, PATH: `${bin}:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH ?? ""}` };
const cacheDir = path.join(os.homedir(), ".cache/ai-usage");
const lastGood = path.join(cacheDir, "menubar-last.json");
const stateFile = path.join(cacheDir, "menubar-state.json");

// Optional colored icons: ~/.config/swiftbar/icons/<agent>.png (see agent-icons). Falls back to SF Symbols.
const iconDir = path.join(os.homedir(), ".config/swiftbar/icons");
const iconCache = new Map<string, string | null>();
function iconB64(agent: string): string | null {
  if (!iconCache.has(agent)) {
    try { iconCache.set(agent, fs.readFileSync(path.join(iconDir, `${agent.toLowerCase()}.png`)).toString("base64")); } catch { iconCache.set(agent, null); }
  }
  return iconCache.get(agent)!;
}
const iconParams = (agent: string) => { const b = iconB64(agent); return b ? `image=${b}` : `sfimage=${symbolOf(agent)} sfcolor=${brand(agent)}`; };

const clean = (text: string) => text.replace(/[|\n\r]/g, " ").trim();
const readJson = <T>(file: string): T | null => { try { return JSON.parse(fs.readFileSync(file, "utf8")) as T; } catch { return null; } };
const writeJson = (file: string, value: unknown) => { try { fs.mkdirSync(cacheDir, { recursive: true }); fs.writeFileSync(file, JSON.stringify(value)); } catch {} };

// Each agent has its own identity color; attention states override it.
const BRAND: Record<string, string> = { Codex: "#5E9BFF", Claude: "#C084FC", Amp: "#22D3EE", Antigravity: "#E5E7EB", Kimi: "#2DD4BF", CommandCode: "#A3E635", OpenCode: "#94A3B8" };
const brand = (agent: string) => BRAND[agent] ?? "#C7C9D1";
// SwiftBar only renders basic ANSI colors in the menu bar, so map each hex to the nearest basic code.
const ANSI: Record<string, number> = { "#5E9BFF": 94, "#C084FC": 95, "#22D3EE": 96, "#2DD4BF": 36, "#A3E635": 92, "#94A3B8": 37, "#30D158": 92, "#FF9F0A": 93, "#FF453A": 91, "#8E8E93": 90, "#E5E7EB": 97 };
const paint = (hex: string, text: string) => `\u001b[${ANSI[hex] ?? 97}m${text}\u001b[0m`;

const SHORT: Record<string, string> = { Codex: "Cx", Claude: "Cl", Amp: "Amp", Antigravity: "AG", Kimi: "Km", CommandCode: "CC", OpenCode: "OC" };
const LOGIN: Record<string, string> = { Kimi: "kimi login", Claude: "claude /login", CommandCode: "nvm install 22 && nvm use 22 && cmd login" };
const LIMIT_NAME: Record<string, string> = { "5h": "5-hour limit", "7d": "Weekly limit" };
const order = (limit: string) => (limit === "5h" ? 0 : limit === "7d" ? 1 : 2);
const poolName = (pool: Pool) => clean([pool.agent, pool.pool !== "default" && pool.pool !== pool.account ? pool.pool : ""].filter(Boolean).join(" · "));

// ---- load data (fall back to the last good snapshot so a transient failure never blanks the bar) ----
let pools: Pool[] = [];
let staleSince: number | null = null;
let failure = "";
const result = spawnSync(path.join(bin, "ai-usage"), ["--json"], { env, encoding: "utf8", timeout: 60_000 });
try {
  if (result.status !== 0) throw new Error(result.stderr || "ai-usage failed");
  pools = JSON.parse(result.stdout);
  writeJson(lastGood, { at: Date.now(), pools });
} catch (error) {
  failure = clean(String((error as Error).message)).slice(0, 120);
  const snapshot = readJson<{ at: number; pools: Pool[] }>(lastGood);
  if (snapshot) {
    pools = snapshot.pools;
    staleSince = snapshot.at;
  } else {
    console.log("AI ⚠︎ | sfimage=exclamationmark.triangle");
    console.log("---");
    console.log(`ai-usage failed: ${failure} | color=${RED}`);
    console.log("Retry | refresh=true");
    process.exit(0);
  }
}

// ---- alerts: notify only on transitions (low -> critical, critical -> available again) ----
if (!staleSince) {
  const previous = readJson<Record<string, Sev>>(stateFile);
  if (process.platform === "darwin") {
    for (const alert of diffAlerts(previous, pools)) {
      const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      spawnSync("osascript", ["-e", `display notification "${esc(alert.body)}" with title "${esc(alert.title)}"`]);
    }
  }
  writeJson(stateFile, poolSeverities(pools));
}

const live = pools.filter(connected);
const quotaPools = live.filter(hasQuota);
const infoPools = live.filter((p) => !hasQuota(p));
const offline = pools.filter((p) => !connected(p));
const best = pickBest(pools);
const blockedAll = pools.length > 0 && !best && pools.some((p) => p.status === "blocked");

// ---- menu bar: a tiny session meter per live Claude / Codex account ----
const summaries = summarizeAgents(pools);
const meters = barMeters(pools);
if (meters.length) {
  const png = renderBar(meters.map((m) => ({ used: m.left, label: m.agent === "Claude" ? "CL" : "CX", labelColor: brand(m.agent), color: m.sev === "crit" ? RED : m.sev === "warn" ? ORANGE : m.sev === "ok" ? SEV_COLOR.ok : GRAY })));
  console.log(`${staleSince ? "⟳" : ""} | image=${png}`);
} else {
  console.log(`AI -- | sfimage=gauge.with.dots.needle.0percent color=${blockedAll ? RED : GRAY}`);
}

// ---- dropdown ----
console.log("---");
const attentionCount = summaries.filter((s) => s.sev === "crit" || s.sev === "warn").length;
if (staleSince) console.log(`⚠ Showing data from ${until(Date.now() + (Date.now() - staleSince))} ago (${failure}) | color=${ORANGE} size=11`);

const SEV_ORDER: Record<string, number> = { crit: 0, warn: 1, ok: 2 };
const sortedPools = [...quotaPools].sort(
  (a, b) => (SEV_ORDER[poolSeverity(a) ?? "ok"] ?? 2) - (SEV_ORDER[poolSeverity(b) ?? "ok"] ?? 2) || (a.left ?? 101) - (b.left ?? 101),
);

// The card is one image (green / orange / red bars, colored percentages and status); details stay native below.
const cellOf = (row: Row | undefined): Cell => {
  if (!row || row.used === null) return null;
  const left = Math.max(0, Math.min(100, 100 - row.used));
  const sev = severity(left, breaches(row));
  return { left, color: sev ? SEV_COLOR[sev] : GRAY };
};
const nameOf = (pool: Pool) => poolName(pool).replace(/^Antigravity · /, "AG · ");
const tableRows = sortedPools.map((pool) => {
  const five = pool.rows.find((r) => r.limit === "5h");
  const seven = pool.rows.find((r) => r.limit === "7d");
  const single = !five && !seven ? worstRow(pool.rows) ?? undefined : undefined;
  const st = statusWord(pool);
  return { name: nameOf(pool), nameColor: "#F2F2F7", five: cellOf(five ?? single), seven: cellOf(seven), status: st.text, statusColor: st.sev ? SEV_COLOR[st.sev] : GRAY };
});
if (tableRows.length) console.log(` | image=${renderTable({ connected: live.length, attention: attentionCount, rows: tableRows })}`);
console.log("---");
for (const pool of sortedPools) {
  console.log(`${nameOf(pool)}  ·  details | size=12 color=${GRAY}`);
  if (pool.account !== "default") console.log(`--${clean(pool.account)} | color=${GRAY} size=11`);
  const rows: Row[] = [...pool.rows].sort((a, b) => order(a.limit) - order(b.limit));
  for (const row of rows) {
    const l = leftOf(row);
    const f = forecast(row);
    const will = !!f && f.breachInMs !== null;
    const rowSev: Sev | null = l === null ? null : l <= 10 ? "crit" : l <= 30 || will ? "warn" : "ok";
    const rowHex = rowSev ? SEV_COLOR[rowSev] : GRAY;
    const name = LIMIT_NAME[row.limit] ?? (row.limit === "-" ? "Quota" : row.limit);
    const note = row.note ? clean(row.note) : "";
    console.log(`--${name.padEnd(13)} ${l === null ? "no data" : `${Math.round(l)}% left`}${row.resetAt ? `  ·  resets in ${until(row.resetAt)}` : ""}${note ? `  ·  ${note}` : ""} | font=Menlo size=12 color=${rowHex} trim=false`);
    console.log(`--${paceBar(row.used, elapsedOf(row))} | font=Menlo size=12 color=${rowHex} trim=false`);
    console.log(`--${detailText(row)} | font=Menlo size=11 color=${GRAY} trim=false`);
    if (f) {
      const fmt = (n: number) => (n < 10 ? n.toFixed(1) : String(Math.round(n)));
      console.log(`--${fmt(f.rate)}%/${f.unit} burn  ·  safe ≤ ${fmt(f.safe)}%/${f.unit} | font=Menlo size=11 color=${will ? ORANGE : GRAY} trim=false`);
    }
  }
}
if (sortedPools.length) console.log("---");

if (offline.length) {
  console.log(`NEEDS LOGIN | color=${RED} size=11`);
  for (const pool of offline) {
    const reason = clean(pool.rows[0]?.note ?? "no data");
    const fix = /rate limited/.test(reason) ? undefined : LOGIN[pool.agent];
    const action = fix ? ` shell=/bin/zsh param1=-lc param2='${fix}' terminal=true` : "";
    console.log(`${pool.agent}  -  ${reason}${fix ? "     🔑 Login" : ""} | sfimage=chevron.right sfcolor=${RED} size=13${action}`);
  }
  console.log("---");
}

if (infoPools.length) {
  console.log("Connected Services | size=13");
  for (const pool of infoPools) {
    const who = pool.account !== "default" ? clean(pool.account.replace(/\s*\(.*$/, "")) : "";
    const detail = clean(pool.rows[0]?.note ?? "connected");
    const credits = detail.match(/\$[\d.,]+\s*left/i)?.[0];
    if (who) console.log(`${who} | sfimage=envelope size=13`);
    console.log(`${credits ? `Credits: ${credits}` : `${poolName(pool)}  ·  ${detail}`} | sfimage=creditcard color=${GRAY} size=13`);
  }
  console.log("---");
}

console.log("Codex reset credits | sfimage=arrow.counterclockwise.circle shell=/bin/zsh param1=-lc param2=codex-resets terminal=true");
console.log("Full report | sfimage=terminal shell=/bin/zsh param1=-lc param2='ai-usage; read -k1' terminal=true");
console.log(`Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} | color=${GRAY} size=11`);
console.log("Refresh | sfimage=arrow.clockwise refresh=true");

