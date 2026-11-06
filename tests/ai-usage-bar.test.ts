import { describe, expect, test } from "bun:test";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const repo = resolve(import.meta.dir, "..");
const bar = resolve(repo, "scripts/.local/bin/ai-usage-bar");

function run(json: string | null, ...args: string[]) {
  const home = mkdtempSync(resolve(tmpdir(), "usage-bar-"));
  try {
    mkdirSync(resolve(home, ".local/bin"), { recursive: true });
    const stub = resolve(home, ".local/bin/ai-usage");
    writeFileSync(stub, json === null ? "#!/bin/sh\nexit 1\n" : `#!/bin/sh\ncat <<'J'\n${json}\nJ\n`);
    chmodSync(stub, 0o755);
    const r = Bun.spawnSync(["bun", bar, ...args], { env: { ...process.env, HOME: home, XDG_CACHE_HOME: resolve(home, ".cache") }, stdout: "pipe", stderr: "pipe" });
    return { code: r.exitCode, out: r.stdout.toString().trim() };
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

const now = Date.now();
const pool = (agent: string, used: number, status = "usable") => ({
  agent, account: "a", pool: "default", left: 100 - used, usageIncomplete: false, nextResetAt: now + 9_000_000, status,
  rows: [{ agent, account: "a", pool: "default", limit: "5h", used, resetAt: now + 9_000_000 }],
});
const data = JSON.stringify([pool("Claude", 92), pool("Amp", 10), pool("Codex", 20)]);

describe("ai-usage-bar", () => {
  test("plain text puts the agent needing attention first", () => {
    const { out, code } = run(data);
    expect(code).toBe(0);
    expect(out.startsWith("✺ Cl 8%▲")).toBe(true);
    expect(out).toContain("ϟ Amp 90%");
  });

  test("waybar output is valid JSON with a severity class and tooltip", () => {
    const j = JSON.parse(run(data, "--format", "waybar").out);
    expect(j.class).toBe("critical");
    expect(j.tooltip).toContain("Use first:");
    expect(j.percentage).toBe(8);
  });

  test("tmux output carries color codes", () => {
    expect(run(data, "--format", "tmux").out).toContain("#[fg=red]");
  });

  test("failure with no cache prints a safe placeholder", () => {
    expect(run(null).out).toBe("AI --");
    expect(JSON.parse(run(null, "--format", "waybar").out).class).toBe("unknown");
  });

  test("rejects an unknown format", () => {
    expect(run(data, "--format", "bogus").code).toBe(2);
  });
});
