import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const repo = resolve(import.meta.dir, "..");
const tool = resolve(repo, "scripts/.local/bin/env-check");
const root = mkdtempSync(resolve(tmpdir(), "env-check-"));
afterAll(() => rmSync(root, { recursive: true, force: true }));
const env = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" };
const run = (cmd: string[], cwd: string) => {
  const r = Bun.spawnSync(cmd, { cwd, env, stdout: "pipe", stderr: "pipe" });
  return { code: r.exitCode, out: r.stdout.toString() };
};
function project(files: Record<string, string>) {
  const dir = mkdtempSync(resolve(root, "p-"));
  run(["git", "init", "-q", "."], dir);
  for (const [name, body] of Object.entries(files)) writeFileSync(resolve(dir, name), body);
  return dir;
}

describe("env-check audit", () => {
  test("passes with ignored .env, tracked-able example and placeholders", () => {
    const dir = project({ ".gitignore": ".env\n", ".env": "API_KEY=real123456789abc\nPORT=3000\n", ".env.example": "API_KEY=your-api-key\nPORT=3000\n" });
    const r = run(["bun", tool, dir], dir);
    expect(r.code).toBe(0);
    expect(r.out).toContain("keys are in sync");
  });
  test("fails when .env is not ignored", () => {
    const dir = project({ ".env": "A=1\n", ".env.example": "A=1\n" });
    const r = run(["bun", tool, dir], dir);
    expect(r.code).toBe(1);
    expect(r.out).toContain(".env is not git-ignored");
  });
  test("fails when .env is tracked", () => {
    const dir = project({ ".env": "A=1\n", ".env.example": "A=1\n" });
    run(["git", "add", "-f", ".env"], dir);
    expect(run(["bun", tool, dir], dir).out).toContain("is tracked by git");
  });
  test("fails when the example holds a real-looking secret", () => {
    const dir = project({ ".gitignore": ".env\n", ".env.example": "STRIPE_SECRET=sk_live_abcdefghijklmnop\n" });
    const r = run(["bun", tool, dir], dir);
    expect(r.code).toBe(1);
    expect(r.out).toContain("looks like a real secret");
  });
  test("fails when .env.example itself is ignored", () => {
    const dir = project({ ".gitignore": ".env*\n", ".env.example": "A=1\n" });
    expect(run(["bun", tool, dir], dir).out).toContain("must be tracked");
  });
});

describe("env-check --sync", () => {
  test("adds missing keys with safe samples and never copies secrets", () => {
    const dir = project({ ".gitignore": ".env\n", ".env": "DB_PASSWORD=hunter2hunter2\nPORT=8080\nSERVICE_URL=https://internal.example.corp/x\n" });
    expect(run(["bun", tool, dir, "--sync"], dir).code).toBe(0);
    const example = readFileSync(resolve(dir, ".env.example"), "utf8");
    expect(example).toContain("DB_PASSWORD=your-db-password");
    expect(example).toContain("PORT=8080");
    expect(example).toContain("SERVICE_URL=your-service-url");
    expect(example).not.toContain("hunter2");
    expect(run(["bun", tool, dir], dir).code).toBe(0);
  });
});
