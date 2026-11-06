import { describe, expect, test } from "bun:test";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const repo = resolve(import.meta.dir, "..");
const script = resolve(repo, "scripts/.local/bin/rex-agents");

// A fake rex that records its arguments, one call per line.
function withFakeRex(run: (call: (...args: string[]) => { code: number; log: string[]; err: string }) => void) {
  const dir = mkdtempSync(resolve(tmpdir(), "rex-agents-"));
  const log = resolve(dir, "calls.log");
  const fake = resolve(dir, "rex");
  writeFileSync(fake, `#!/bin/sh\nprintf '%s\\n' "$*" >> "${log}"\n`);
  chmodSync(fake, 0o755);
  try {
    run((...args) => {
      writeFileSync(log, "");
      const r = Bun.spawnSync(["bash", script, ...args], { env: { ...process.env, REX_BIN: fake }, stdout: "pipe", stderr: "pipe" });
      return { code: r.exitCode, log: readFileSync(log, "utf8").split("\n").filter(Boolean), err: r.stderr.toString() };
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("rex-agents", () => {
  test("send types the message then presses enter, folding newlines", () => {
    withFakeRex((call) => {
      const r = call("send", "worker", "line one\nline two", "-b", "b7");
      expect(r.code).toBe(0);
      expect(r.log).toEqual(["send -s worker -b b7 line one line two", "send-key -s worker -b b7 enter"]);
    });
  });

  test("read, key, status, kill and ls map to documented rex commands", () => {
    withFakeRex((call) => {
      expect(call("read", "w").log).toEqual(["capture -s w --trim"]);
      expect(call("key", "w", "down", "enter").log).toEqual(["send-key -s w down enter"]);
      expect(call("status", "b7").log).toEqual(["block call -b b7 program_status"]);
      expect(call("kill", "w").log).toEqual(["session kill w"]);
      expect(call("ls").log).toEqual(["ls"]);
    });
  });

  test("spawn passes the command through, with an optional working directory", () => {
    withFakeRex((call) => {
      expect(call("spawn", "w", "--", "claude", "--model", "x").log).toEqual(["new w -- claude --model x"]);
      const r = call("spawn", "w", "-C", "/tmp", "--", "codex");
      expect(r.log[0]).toContain("new w -- bash -lc cd /tmp && exec codex");
    });
  });

  test("usage errors exit non-zero", () => {
    withFakeRex((call) => {
      expect(call("send", "only-name").code).not.toBe(0);
      expect(call("bogus").code).not.toBe(0);
    });
  });
});
