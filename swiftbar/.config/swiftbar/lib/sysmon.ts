// Pure parsers and formatters for the macOS system-monitor SwiftBar plugin.
// Kept separate from the plugin (and outside the plugins folder) so they can be unit tested.

export type Level = "ok" | "warn" | "crit";

export const COLORS = { ok: "#30D158", warn: "#FF9F0A", crit: "#FF453A", dim: "#8E8E93" } as const;

export function level(value: number, warn: number, crit: number): Level {
  return value >= crit ? "crit" : value >= warn ? "warn" : "ok";
}

/** Lower is worse (battery, free disk). */
export function levelLow(value: number, warn: number, crit: number): Level {
  return value <= crit ? "crit" : value <= warn ? "warn" : "ok";
}

export const worst = (...levels: Level[]): Level => (levels.includes("crit") ? "crit" : levels.includes("warn") ? "warn" : "ok");

export function bar(pct: number, cells = 10): string {
  const filled = Math.max(0, Math.min(cells, Math.round((pct / 100) * cells)));
  return "▰".repeat(filled) + "▱".repeat(cells - filled);
}

export function fmtBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value >= 100 || i === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[i]}`;
}

export const fmtRate = (bytesPerSec: number) => `${fmtBytes(bytesPerSec)}/s`;

export function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

export function parseTopCpu(text: string): { user: number; sys: number; idle: number } | null {
  const matches = [...text.matchAll(/CPU usage:\s*([\d.]+)% user,\s*([\d.]+)% sys,\s*([\d.]+)% idle/g)];
  const last = matches.at(-1);
  return last ? { user: Number(last[1]), sys: Number(last[2]), idle: Number(last[3]) } : null;
}

export function parseLoadAvg(text: string): [number, number, number] | null {
  const m = text.match(/([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

export function parseVmStat(text: string): { pageSize: number; pages: Record<string, number> } | null {
  const pageSize = Number(text.match(/page size of (\d+) bytes/)?.[1]);
  if (!pageSize) return null;
  const pages: Record<string, number> = {};
  for (const m of text.matchAll(/^(?:Pages )?([^:\n]+):\s+(\d+)\./gm)) pages[m[1].trim().toLowerCase()] = Number(m[2]);
  return { pageSize, pages };
}

export function memoryBreakdown(vm: { pageSize: number; pages: Record<string, number> }, totalBytes: number) {
  const p = vm.pages;
  const bytes = (key: string) => (p[key] ?? 0) * vm.pageSize;
  const wired = bytes("wired down");
  const compressed = bytes("occupied by compressor");
  const app = bytes("active") + bytes("inactive") - bytes("file-backed pages") - bytes("purgeable");
  const used = Math.min(totalBytes, Math.max(0, app) + wired + compressed);
  return { used, wired, compressed, app: Math.max(0, app), cached: bytes("file-backed pages") + bytes("purgeable"), free: Math.max(0, totalBytes - used) };
}

export function parseSwap(text: string): { total: number; used: number } | null {
  const m = text.match(/total = ([\d.]+)M\s+used = ([\d.]+)M/);
  return m ? { total: Number(m[1]) * 1048576, used: Number(m[2]) * 1048576 } : null;
}

export function parseMemFreePct(text: string): number | null {
  const m = text.match(/free percentage:\s*(\d+)%/);
  return m ? Number(m[1]) : null;
}

export function parseDf(text: string): { total: number; used: number; avail: number; mount: string } | null {
  for (const line of text.split("\n").slice(1)) {
    const m = line.match(/^(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)%\s+(.+)$/);
    if (m) {
      const total = Number(m[2]) * 1024;
      const avail = Number(m[4]) * 1024;
      return { total, used: total - avail, avail, mount: m[6] };
    }
  }
  return null;
}

export function parsePmset(text: string): { source: string; percent: number; state: string; remaining: string | null; charging: boolean } | null {
  const pct = text.match(/(\d+)%;/);
  if (!pct || !/InternalBattery/.test(text)) return null;
  const state = text.match(/%;\s*([^;]+?);/)?.[1].trim() ?? "unknown";
  return {
    source: text.match(/Now drawing from '([^']+)'/)?.[1] ?? "",
    percent: Number(pct[1]),
    state,
    remaining: text.match(/(\d+:\d+) remaining/)?.[1] ?? null,
    charging: state !== "discharging",
  };
}

export function parseBatteryHealth(text: string): { cycles: number | null; health: number | null } {
  const num = (key: string) => {
    const m = text.match(new RegExp(`"${key}"\\s*=\\s*(\\d+)`));
    return m ? Number(m[1]) : null;
  };
  const raw = num("AppleRawMaxCapacity");
  const design = num("DesignCapacity");
  const max = num("MaxCapacity");
  const health = raw && design ? Math.round((raw / design) * 100) : max !== null && max <= 100 ? max : null;
  return { cycles: num("CycleCount"), health };
}

export function parseNetstat(text: string, iface: string): { rx: number; tx: number } | null {
  const lines = text.split("\n").filter(Boolean);
  const header = lines[0]?.trim().split(/\s+/);
  if (!header) return null;
  const iIdx = header.indexOf("Ibytes");
  const oIdx = header.indexOf("Obytes");
  if (iIdx < 0 || oIdx < 0) return null;
  for (const line of lines.slice(1)) {
    const cols = line.trim().split(/\s+/);
    if (cols[0] !== iface || !cols[2]?.startsWith("<Link")) continue;
    const offset = cols.length - header.length; // rows without a hardware address have one fewer column
    const rx = Number(cols[iIdx + offset]);
    const tx = Number(cols[oIdx + offset]);
    if (Number.isFinite(rx) && Number.isFinite(tx)) return { rx, tx };
  }
  return null;
}

export function parseDefaultIface(text: string): string | null {
  return text.match(/interface:\s*(\S+)/)?.[1] ?? null;
}

export function parsePs(text: string, limit = 5): { pid: number; cpu: number; rssKb: number; name: string }[] {
  const rows: { pid: number; cpu: number; rssKb: number; name: string }[] = [];
  for (const line of text.split("\n").slice(1)) {
    const m = line.trim().match(/^(\d+)\s+([\d.]+)\s+(\d+)\s+(.+)$/);
    if (m) rows.push({ pid: Number(m[1]), cpu: Number(m[2]), rssKb: Number(m[3]), name: m[4].trim() });
    if (rows.length >= limit) break;
  }
  return rows;
}

export function parseBootTime(text: string): number | null {
  const m = text.match(/sec = (\d+)/);
  return m ? Number(m[1]) : null;
}
