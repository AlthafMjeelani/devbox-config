import { describe, expect, test } from "bun:test";
import {
  bar, fmtBytes, fmtDuration, level, levelLow, memoryBreakdown, parseBatteryHealth, parseBootTime, parseDefaultIface,
  parseDf, parseMemFreePct, parseNetstat, parsePmset, parsePs, parseSwap, parseTopCpu, parseVmStat, worst,
} from "../swiftbar/.config/swiftbar/lib/sysmon";

describe("sysmon parsers", () => {
  test("top CPU uses the last sample", () => {
    const text = "CPU usage: 50.0% user, 10.0% sys, 40.0% idle\nCPU usage: 8.5% user, 3.5% sys, 88.0% idle\n";
    expect(parseTopCpu(text)).toEqual({ user: 8.5, sys: 3.5, idle: 88 });
    expect(parseTopCpu("nothing")).toBeNull();
  });

  test("vm_stat and memory breakdown", () => {
    const vm = parseVmStat(
      "Mach Virtual Memory Statistics: (page size of 16384 bytes)\nPages free:                 1000.\nPages active:               4000.\nPages inactive:             2000.\nPages wired down:           1500.\nPages purgeable:             500.\nFile-backed pages:          1000.\nPages occupied by compressor: 500.\n",
    )!;
    expect(vm.pageSize).toBe(16384);
    const m = memoryBreakdown(vm, 100_000 * 16384);
    expect(m.wired).toBe(1500 * 16384);
    expect(m.app).toBe((4000 + 2000 - 1000 - 500) * 16384);
    expect(m.used).toBe((4500 + 1500 + 500) * 16384);
    expect(parseVmStat("garbage")).toBeNull();
  });

  test("swap, pressure, boot time, default interface", () => {
    expect(parseSwap("vm.swapusage: total = 2048.00M  used = 1024.50M  free = 1023.50M  (encrypted)")?.used).toBe(1024.5 * 1048576);
    expect(parseMemFreePct("System-wide memory free percentage: 56%")).toBe(56);
    expect(parseBootTime("{ sec = 1700000000, usec = 0 } Tue Nov 14")).toBe(1700000000);
    expect(parseDefaultIface("   route to: default\n interface: en0\n")).toBe("en0");
  });

  test("df", () => {
    const d = parseDf("Filesystem 1024-blocks Used Available Capacity Mounted on\n/dev/disk3s1 976490576 600000000 300000000 67% /System/Volumes/Data\n")!;
    expect(d.avail).toBe(300000000 * 1024);
    expect(d.mount).toBe("/System/Volumes/Data");
  });

  test("pmset and battery health", () => {
    const b = parsePmset("Now drawing from 'Battery Power'\n -InternalBattery-0 (id=1)\t87%; discharging; 4:12 remaining present: true\n")!;
    expect(b).toMatchObject({ percent: 87, state: "discharging", remaining: "4:12", charging: false });
    const c = parsePmset("Now drawing from 'AC Power'\n -InternalBattery-0 (id=1)\t98%; charging; (no estimate) present: true\n")!;
    expect(c.charging).toBe(true);
    expect(c.remaining).toBeNull();
    expect(parsePmset("Now drawing from 'AC Power'\n")).toBeNull();
    expect(parseBatteryHealth('"CycleCount" = 212\n"DesignCapacity" = 6000\n"AppleRawMaxCapacity" = 5400\n"MaxCapacity" = 100')).toEqual({ cycles: 212, health: 90 });
  });

  test("netstat handles rows with and without hardware address", () => {
    const text =
      "Name  Mtu   Network       Address            Ipkts Ierrs     Ibytes    Opkts Oerrs     Obytes  Coll\n" +
      "en0   1500  <Link#6>    aa:bb:cc:dd:ee:ff   100     0     5000     90     0     3000     0\n" +
      "utun0 1380  <Link#9>                         10     0      700      9     0      600     0\n";
    expect(parseNetstat(text, "en0")).toEqual({ rx: 5000, tx: 3000 });
    expect(parseNetstat(text, "utun0")).toEqual({ rx: 700, tx: 600 });
    expect(parseNetstat(text, "en9")).toBeNull();
  });

  test("ps rows", () => {
    const rows = parsePs("  PID  %CPU    RSS COMM\n  123  45.2  204800 Google Chrome\n  9   0.1   100 launchd\n", 5);
    expect(rows[0]).toEqual({ pid: 123, cpu: 45.2, rssKb: 204800, name: "Google Chrome" });
    expect(rows).toHaveLength(2);
  });
});

describe("sysmon helpers", () => {
  test("levels", () => {
    expect(level(95, 70, 90)).toBe("crit");
    expect(level(75, 70, 90)).toBe("warn");
    expect(level(10, 70, 90)).toBe("ok");
    expect(levelLow(8, 20, 10)).toBe("crit");
    expect(levelLow(50, 20, 10)).toBe("ok");
    expect(worst("ok", "warn", "ok")).toBe("warn");
    expect(worst("warn", "crit")).toBe("crit");
  });

  test("formatting", () => {
    expect(bar(50)).toBe("▰▰▰▰▰▱▱▱▱▱");
    expect(bar(150, 4)).toBe("▰▰▰▰");
    expect(fmtBytes(1536)).toBe("1.5 KB");
    expect(fmtBytes(0)).toBe("0 B");
    expect(fmtDuration(90_000)).toBe("1d 1h");
    expect(fmtDuration(300)).toBe("5m");
  });
});
