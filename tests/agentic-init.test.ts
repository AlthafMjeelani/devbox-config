import { expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BIN = path.resolve(import.meta.dir, "../scripts/.local/bin/agentic-init");
const run = (...a: string[]) => Bun.spawnSync(["bun", BIN, ...a]);

test("scaffolds files, links CLAUDE.md, never overwrites", () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-"));
  fs.writeFileSync(path.join(d, "README.md"), "mine");
  expect(run(d, "--dry-run").exitCode).toBe(0);
  expect(fs.existsSync(path.join(d, "AGENTS.md"))).toBe(false);
  run(d);
  expect(fs.readFileSync(path.join(d, "README.md"), "utf8")).toBe("mine");
  expect(fs.readlinkSync(path.join(d, "CLAUDE.md"))).toBe("AGENTS.md");
  for (const f of ["docs/ARCHITECTURE.md", "docs/DECISIONS.md", "docs/SKILLS.md", "docs/PLAN.md", ".env.example"]) {
    expect(fs.existsSync(path.join(d, f))).toBe(true);
  }
  expect(run(d, "--check").exitCode).toBe(0);
  fs.rmSync(path.join(d, "docs/PLAN.md"));
  expect(run(d, "--check").exitCode).toBe(1);
  expect(run(d).stdout.toString()).toContain("docs/PLAN.md");
});
