import { describe, expect, test } from "bun:test";
import {
  diffAlerts, forecast, pickBest, poolSeverities, poolSeverity, selectMenubar, severity, summarizeAgents, until, worstRow, type Pool, type Row,
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
