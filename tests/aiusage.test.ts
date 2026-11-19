import { describe, expect, test } from "bun:test";
import {
  diffAlerts, forecast, glyphOf, symbolOf, pickBest, poolSeverities, poolSeverity, selectMenubar, severity, summarizeAgents, until, worstRow, type Pool, type Row,
} from "../swiftbar/.config/swiftbar/lib/aiusage";

const NOW = 1_700_000_000_000;
const H = 3_600_000;
const row = (over: Partial<Row> = {}): Row => ({ agent: "Codex", account: "a", pool: "default", limit: "5h", used: 20, resetAt: NOW + 2.5 * H, ...over });
const pool = (agent: string, used: number | null, over: Partial<Pool> = {}): Pool => ({
  agent, account: "a", pool: "default", left: used === null ? null : 100 - used, usageIncomplete: false, nextResetAt: NOW + 2 * H,
  status: "usable", rows: [row({ agent, used })], ...over,
});

describe("severity", () => {
  test("thresholds", () => {
    expect(severity(null)).toBeNull();
    expect(severity(50)).toBe("ok");
    expect(severity(30)).toBe("warn");
    expect(severity(10)).toBe("crit");
    expect(severity(80, true)).toBe("warn");
  });
  test("blocked pool is critical, worst window decides", () => {
    expect(poolSeverity(pool("Codex", 10, { status: "blocked" }), NOW)).toBe("crit");
    const p = pool("Claude", 10, { rows: [row({ used: 10 }), row({ limit: "7d", used: 95, resetAt: NOW + 86_400_000 })] });
    expect(poolSeverity(p, NOW)).toBe("crit");
    expect(worstRow(p.rows)?.limit).toBe("7d");
  });
});

describe("forecast", () => {
  test("projects a breach when burning fast", () => {
    // 3h into a 5h window with 80% used -> 26.7%/h, runs out in ~45m
    const f = forecast(row({ used: 80, resetAt: NOW + 2 * H }), NOW)!;
    expect(f.breachInMs).not.toBeNull();
    expect(f.breachInMs!).toBeLessThan(H);
  });
  test("no projection too early in the window or without a window", () => {
    expect(forecast(row({ used: 5, resetAt: NOW + 5 * H - 60_000 }), NOW)).toBeNull();
    expect(forecast(row({ limit: "-" }), NOW)).toBeNull();
  });
});

describe("menu bar selection", () => {
  const pools = [pool("Codex", 20), pool("Claude", 85), pool("Amp", 5), pool("Kimi", 40), pool("OpenCode", 0), pool("CommandCode", 95)];
  test("attention first, capped, remainder collapsed", () => {
    const s = summarizeAgents(pools, NOW);
    const sel = selectMenubar(s, "Codex", 3);
    expect(sel.shown.map((i) => i.agent)).toEqual(["CommandCode", "Claude", "Codex"]);
    expect(sel.shown[0].sev).toBe("crit");
    expect(sel.hidden).toBe(3);
    expect(sel.hiddenAttention).toBe(0);
  });
  test("all healthy shows the best agent first and collapses the rest", () => {
    const s = summarizeAgents([pool("Codex", 10), pool("Claude", 20), pool("Amp", 30), pool("Kimi", 40)], NOW);
    const sel = selectMenubar(s, "Claude", 2);
    expect(sel.shown[0].agent).toBe("Claude");
    expect(sel.shown).toHaveLength(2);
    expect(sel.hidden).toBe(2);
    expect(sel.hiddenAttention).toBe(0);
  });
});

describe("alerts", () => {
  test("silent on first run and when nothing changed", () => {
    const pools = [pool("Codex", 95)];
    expect(diffAlerts(null, pools, NOW)).toEqual([]);
    expect(diffAlerts(poolSeverities(pools, NOW), pools, NOW)).toEqual([]);
  });
  test("alerts when a pool becomes critical and when it recovers", () => {
    const low = [pool("Codex", 95)];
    const fine = [pool("Codex", 20)];
    const down = diffAlerts(poolSeverities(fine, NOW), low, NOW);
    expect(down).toHaveLength(1);
    expect(down[0].title).toContain("almost out");
    const up = diffAlerts(poolSeverities(low, NOW), fine, NOW);
    expect(up[0].title).toContain("available again");
  });
});

describe("until", () => {
  test("formats", () => {
    expect(until(NOW + 90 * 60_000, NOW)).toBe("1h 30m");
    expect(until(NOW + 26 * H, NOW)).toBe("1d 2h");
    expect(until(NOW - 1, NOW)).toBe("now");
    expect(until(null, NOW)).toBe("");
  });
});

describe("pickBest", () => {
  test("prefers the soonest reset among healthy pools and skips nearly exhausted ones", () => {
    const nearlyOut = pool("Claude", 95, { nextResetAt: NOW + H });
    const later = pool("Codex", 20, { nextResetAt: NOW + 4 * H });
    const sooner = pool("Amp", 30, { nextResetAt: NOW + 2 * H });
    expect(pickBest([nearlyOut, later, sooner], NOW)?.agent).toBe("Amp");
  });
  test("falls back to the least exhausted usable pool, ignores blocked", () => {
    const a = pool("Claude", 95), b = pool("Codex", 92), blocked = pool("Amp", 100, { status: "blocked" });
    expect(pickBest([a, b, blocked], NOW)?.agent).toBe("Codex");
    expect(pickBest([blocked], NOW)).toBeUndefined();
  });
});

describe("agent icons", () => {
  test("every known agent has a distinct glyph and symbol, unknown agents fall back", () => {
    const agents = ["Codex", "Claude", "Amp", "Antigravity", "Kimi", "CommandCode", "OpenCode"];
    expect(new Set(agents.map(glyphOf)).size).toBe(agents.length);
    expect(new Set(agents.map(symbolOf)).size).toBe(agents.length);
    expect(glyphOf("Mystery")).toBe("◆");
    expect(symbolOf("Mystery")).toBe("circle.fill");
  });
});

import { paceBar, detailText, elapsedOf } from "../swiftbar/.config/swiftbar/lib/aiusage.ts";
describe("pace bar and detail line", () => {
  const H = 3_600_000;
  const now = 1_000_000_000_000;
  const row = (used: number, hoursLeft: number) => ({ agent: "Claude", account: "a", pool: "p", limit: "5h", used, resetAt: now + hoursLeft * H });
  test("tick sits at the elapsed share", () => {
    expect(paceBar(20, 0.5, 10)).toBe("██░░░│░░░░");
    expect(paceBar(80, 0.5, 10)).toBe("█████│██░░");
  });
  test("no window means no tick", () => expect(paceBar(50, null, 10)).toBe("█████░░░░░"));
  test("elapsed from reset time", () => expect(elapsedOf(row(10, 2.5), now)).toBeCloseTo(0.5));
  test("ahead of pace with forecast", () => {
    const t = detailText(row(80, 2.5), now);
    expect(t).toContain("80% used");
    expect(t).toContain("30% ahead of pace");
    expect(t).toContain("limit in");
  });
  test("under pace shows reset", () => expect(detailText(row(10, 2.5), now)).toMatch(/40% under pace · resets in 2h 30m/));
});

import { clockAt, resetsText, creditsSummary } from "../swiftbar/.config/swiftbar/lib/aiusage.ts";
describe("reset date and time", () => {
  const now = new Date(2026, 10, 19, 13, 0).getTime(); // Thu 19 Nov 2026 13:00 local
  test("today, tomorrow and later dates", () => {
    expect(clockAt(new Date(2026, 10, 19, 15, 9).getTime(), now)).toBe("today 15:09");
    expect(clockAt(new Date(2026, 10, 20, 1, 5).getTime(), now)).toBe("tomorrow 01:05");
    expect(clockAt(new Date(2026, 10, 24, 9, 30).getTime(), now)).toBe("Tue 24 Nov 09:30");
    expect(clockAt(null, now)).toBe("");
  });
  test("time left plus clock", () => {
    expect(resetsText(new Date(2026, 10, 19, 15, 30).getTime(), now)).toBe("in 2h 30m (today 15:30)");
    expect(resetsText(null, now)).toBe("");
  });
  test("detail line carries the reset clock", () => {
    const row = { agent: "Claude", account: "a", pool: "p", limit: "5h", used: 10, resetAt: new Date(2026, 10, 19, 15, 30).getTime() };
    expect(detailText(row, now)).toContain("resets in 2h 30m (today 15:30)");
  });
});

describe("codex reset credits", () => {
  const now = new Date(2026, 10, 19, 13, 0).getTime();
  const iso = (d: number, h = 9) => new Date(2026, 11, d, h, 0).toISOString();
  test("sums accounts and picks the soonest future expiry", () => {
    const s = creditsSummary([
      { account: "a", available: 2, credits: [{ grantedAt: null, expiresAt: iso(12) }, { grantedAt: null, expiresAt: iso(2) }] },
      { account: "b", available: 1, credits: [{ grantedAt: null, expiresAt: iso(5) }] },
      { account: "c", available: null, credits: [], error: "reset request failed (401)" },
    ], now);
    expect(s.available).toBe(3);
    expect(s.text).toMatch(/^3 left · next expires in 12d \d+h \(Wed 02 Dec 09:00\)$/);
  });
  test("no credits and all errors", () => {
    expect(creditsSummary([{ account: "a", available: 0, credits: [] }], now)).toEqual({ text: "0 left", available: 0 });
    expect(creditsSummary([{ account: "a", available: null, credits: [], error: "x" }], now).text).toBe("unavailable");
    expect(creditsSummary([], now).text).toBe("no accounts");
  });
});
