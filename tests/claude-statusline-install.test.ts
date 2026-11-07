import { expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BIN = path.resolve(import.meta.dir, "../scripts/.local/bin/claude-statusline-install");
const run = (f: string, ...a: string[]) => Bun.spawnSync(["bash", BIN, ...a], { env: { ...process.env, CLAUDE_SETTINGS: f } });

test.skipIf(!Bun.which("jq"))("sets statusLine, keeps other keys, respects existing", () => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cs-")), "settings.json");
  fs.writeFileSync(f, JSON.stringify({ theme: "dark" }));
  run(f);
  let j = JSON.parse(fs.readFileSync(f, "utf8"));
  expect(j.theme).toBe("dark");
  expect(j.statusLine.command).toBe("~/.local/bin/claude-statusline");
  expect(run(f).stdout.toString()).toContain("already set");
  fs.writeFileSync(f, JSON.stringify({ statusLine: { type: "command", command: "mine" } }));
  run(f);
  expect(JSON.parse(fs.readFileSync(f, "utf8")).statusLine.command).toBe("mine");
  run(f, "--force");
  expect(JSON.parse(fs.readFileSync(f, "utf8")).statusLine.command).toBe("~/.local/bin/claude-statusline");
});
