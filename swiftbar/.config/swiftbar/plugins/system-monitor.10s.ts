#!/opt/homebrew/bin/bun
// <xbar.title>System Monitor</xbar.title>
// <xbar.desc>CPU, memory, disk, battery and network capacity at a glance, with top processes and attention colors.</xbar.desc>
// <xbar.dependencies>bun</xbar.dependencies>
// <swiftbar.hideAbout>true</swiftbar.hideAbout>
// <swiftbar.hideRunInTerminal>true</swiftbar.hideRunInTerminal>
// <swiftbar.hideDisablePlugin>true</swiftbar.hideDisablePlugin>

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  COLORS, bar, fmtBytes, fmtDuration, fmtRate, level, levelLow, memoryBreakdown, parseBatteryHealth, parseBootTime,
  parseDefaultIface, parseDf, parseLoadAvg, parseMemFreePct, parseNetstat, parsePmset, parsePs, parseSwap, parseTopCpu,
  parseVmStat, worst, type Level,
} from "../lib/sysmon.ts";

const env = { ...process.env, PATH: `/usr/sbin:/usr/bin:/bin:/sbin:/opt/homebrew/bin:${process.env.PATH ?? ""}` };
const sh = (cmd: string, args: string[] = [], timeout = 5000): string => {
  const r = spawnSync(cmd, args, { env, encoding: "utf8", timeout });
  return r.status === 0 ? r.stdout : "";
};

const FONT = "font=Menlo size=12";
const color = (l: Level) => COLORS[l];
const pad = (text: string, width: number) => text.padEnd(width);
const line = (text: string, extra = "") => console.log(`${text} | ${FONT}${extra ? ` ${extra}` : ""}`);
const header = (text: string) => console.log(`${text} | size=11 color=${COLORS.dim}`);
const sub = (text: string, extra = "") => console.log(`--${text} | ${FONT}${extra ? ` ${extra}` : ""}`);

// ---- collect -------------------------------------------------------------------------------
const cores = os.cpus().length;
const cpu = parseTopCpu(sh("top", ["-l", "2", "-n", "0", "-s", "1"], 8000));
const cpuPct = cpu ? Math.round(100 - cpu.idle) : null;
const load = parseLoadAvg(sh("sysctl", ["-n", "vm.loadavg"]));

const totalMem = os.totalmem();
const vm = parseVmStat(sh("vm_stat"));
const mem = vm ? memoryBreakdown(vm, totalMem) : null;
const memPct = mem ? Math.round((mem.used / totalMem) * 100) : null;
const freePct = parseMemFreePct(sh("memory_pressure", ["-Q"]));
const pressure = freePct === null ? null : 100 - freePct;
const swap = parseSwap(sh("sysctl", ["-n", "vm.swapusage"]));

const disk = parseDf(sh("df", ["-Pk", "/System/Volumes/Data"])) ?? parseDf(sh("df", ["-Pk", "/"]));
const diskPct = disk ? Math.round((disk.used / disk.total) * 100) : null;

const batt = parsePmset(sh("pmset", ["-g", "batt"]));
const health = batt ? parseBatteryHealth(sh("ioreg", ["-rn", "AppleSmartBattery"])) : null;

const iface = parseDefaultIface(sh("route", ["-n", "get", "default"])) ?? "en0";
const net = parseNetstat(sh("netstat", ["-ib", "-I", iface]), iface);
const ip = os.networkInterfaces()[iface]?.find((a) => a.family === "IPv4")?.address;
let rates: { rx: number; tx: number } | null = null;
const stateFile = path.join(os.tmpdir(), "devbox-sysmon-net.json");
if (net) {
  try {
    const prev = JSON.parse(fs.readFileSync(stateFile, "utf8")) as { t: number; iface: string; rx: number; tx: number };
    const dt = (Date.now() - prev.t) / 1000;
    if (prev.iface === iface && dt > 0 && dt < 120 && net.rx >= prev.rx && net.tx >= prev.tx) {
      rates = { rx: (net.rx - prev.rx) / dt, tx: (net.tx - prev.tx) / dt };
    }
  } catch {}
  try {
    fs.writeFileSync(stateFile, JSON.stringify({ t: Date.now(), iface, ...net }));
  } catch {}
}

const topCpu = parsePs(sh("ps", ["-Aceo", "pid,pcpu,rss,comm", "-r"]));
const topMem = parsePs(sh("ps", ["-Aceo", "pid,pcpu,rss,comm", "-m"]));
const boot = parseBootTime(sh("sysctl", ["-n", "kern.boottime"]));

// ---- levels (logic: color only when something needs attention) ----------------------------
const cpuLevel: Level = cpuPct === null ? "ok" : level(cpuPct, 70, 90);
// Memory pressure is a better signal than raw "used", which macOS keeps high on purpose.
const memLevel: Level = worst(pressure === null ? "ok" : level(pressure, 50, 75), swap && swap.used > 4 * 1024 ** 3 ? "warn" : "ok");
const diskLevel: Level = disk && diskPct !== null ? worst(level(diskPct, 80, 90), levelLow(disk.avail / 1024 ** 3, 30, 10)) : "ok";
const battLevel: Level = batt && !batt.charging ? levelLow(batt.percent, 20, 10) : "ok";
const overall = worst(cpuLevel, memLevel, diskLevel, battLevel);

// ---- menu bar title -----------------------------------------------------------------------
const parts = [cpuPct === null ? "CPU n/a" : `${cpuPct}%`, memPct === null ? "" : `${memPct}%`].filter(Boolean);
if (batt && !batt.charging && battLevel !== "ok") parts.push(`🪫${batt.percent}%`);
const tint = overall === "ok" ? "" : ` color=${color(overall)}`;
console.log(`${parts.join(" ")} | sfimage=cpu${tint} size=12 font=Menlo`);
console.log("---");

// ---- dropdown -----------------------------------------------------------------------------
header("PROCESSOR");
if (cpu && cpuPct !== null) {
  line(`${pad("CPU", 7)}${bar(cpuPct)} ${String(cpuPct).padStart(3)}%`, `color=${color(cpuLevel)}`);
  sub(`User ${cpu.user.toFixed(1)}%   System ${cpu.sys.toFixed(1)}%   Idle ${cpu.idle.toFixed(1)}%`);
  if (load) sub(`Load ${load.map((n) => n.toFixed(2)).join("  ")}  (${cores} cores)`, load[0] / cores >= 1 ? `color=${COLORS.warn}` : "");
  if (topCpu.length) {
    sub("---");
    sub("Top by CPU", `color=${COLORS.dim}`);
    for (const p of topCpu) sub(`${pad(p.name.slice(0, 24), 25)}${p.cpu.toFixed(1).padStart(5)}%`);
  }
} else line("CPU data unavailable (macOS only)", `color=${COLORS.dim}`);

console.log("---");
header("MEMORY");
if (mem && memPct !== null) {
  line(`${pad("RAM", 7)}${bar(memPct)} ${String(memPct).padStart(3)}%  ${fmtBytes(mem.used)} / ${fmtBytes(totalMem)}`, `color=${color(memLevel)}`);
  if (pressure !== null) sub(`Pressure ${pressure}% (${memLevel === "ok" ? "healthy" : memLevel === "warn" ? "elevated" : "critical"})`, `color=${color(memLevel)}`);
  sub(`App ${fmtBytes(mem.app)}   Wired ${fmtBytes(mem.wired)}   Compressed ${fmtBytes(mem.compressed)}`);
  sub(`Cached ${fmtBytes(mem.cached)}   Free ${fmtBytes(mem.free)}`);
  if (swap) sub(`Swap ${fmtBytes(swap.used)} / ${fmtBytes(swap.total)}`, swap.used > 4 * 1024 ** 3 ? `color=${COLORS.warn}` : "");
  if (topMem.length) {
    sub("---");
    sub("Top by memory", `color=${COLORS.dim}`);
    for (const p of topMem) sub(`${pad(p.name.slice(0, 24), 25)}${fmtBytes(p.rssKb * 1024).padStart(8)}`);
  }
} else line("Memory data unavailable (macOS only)", `color=${COLORS.dim}`);

console.log("---");
header("STORAGE");
if (disk && diskPct !== null) {
  line(`${pad("Disk", 7)}${bar(diskPct)} ${String(diskPct).padStart(3)}%  ${fmtBytes(disk.avail)} free`, `color=${color(diskLevel)}`);
  sub(`Used ${fmtBytes(disk.used)} of ${fmtBytes(disk.total)}`);
  if (diskLevel !== "ok") sub("Open Storage settings", "bash=/usr/bin/open param1=x-apple.systempreferences:com.apple.settings.Storage terminal=false");
} else line("Disk data unavailable", `color=${COLORS.dim}`);

if (batt) {
  console.log("---");
  header("POWER");
  line(`${pad("Battery", 8)}${bar(batt.percent)} ${String(batt.percent).padStart(3)}%${batt.charging ? " ⚡︎" : ""}`, `color=${color(battLevel)}`);
  sub(`${batt.state}${batt.remaining ? `, ${batt.remaining} remaining` : ""}  (${batt.source.replace(/ Power$/, "")})`);
  if (health?.health !== null && health?.health !== undefined) {
    sub(`Health ${health.health}%${health.cycles !== null ? `   Cycles ${health.cycles}` : ""}`, health.health < 80 ? `color=${COLORS.warn}` : "");
  }
}

console.log("---");
header("NETWORK");
if (net) {
  line(`${pad(iface, 7)}↓ ${rates ? fmtRate(rates.rx) : "…"}   ↑ ${rates ? fmtRate(rates.tx) : "…"}`);
  if (ip) sub(`IP ${ip}`);
  sub(`Total ↓ ${fmtBytes(net.rx)}   ↑ ${fmtBytes(net.tx)}`);
} else line("Network data unavailable", `color=${COLORS.dim}`);

console.log("---");
if (boot) line(`Uptime ${fmtDuration(Math.floor(Date.now() / 1000) - boot)}`, `color=${COLORS.dim}`);
console.log(`Open Activity Monitor | bash=/usr/bin/open param1=-a param2="Activity Monitor" terminal=false`);
console.log("Refresh | refresh=true");
