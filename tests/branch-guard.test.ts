import { afterAll, describe, expect, test } from "bun:test";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const repo = resolve(import.meta.dir, "..");
const guard = resolve(repo, "scripts/.local/bin/guard-default-branch");
const hooks = resolve(repo, "git/.config/git/hooks");
const root = mkdtempSync(resolve(tmpdir(), "branch-guard-"));
afterAll(() => rmSync(root, { recursive: true, force: true }));

const baseEnv = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", HOME: root };
const sh = (cmd: string, cwd: string, env: Record<string, string> = {}, input?: string) => {
  const r = Bun.spawnSync(["bash", "-c", cmd], { cwd, env: { ...baseEnv, ...env }, stdin: input === undefined ? undefined : new TextEncoder().encode(input), stdout: "pipe", stderr: "pipe" });
  return { code: r.exitCode, out: r.stdout.toString(), err: r.stderr.toString() };
};
function newRepo(branch: string) {
  const dir = mkdtempSync(resolve(root, "r-"));
  sh(`git init -q -b ${branch} . && git config user.email t@t && git config user.name t && git commit -q --allow-empty -m init`, dir);
  return dir;
}

describe("guard-default-branch check", () => {
  test("blocks main, master and develop, allows feature branches", () => {
    for (const b of ["main", "master", "develop"]) expect(sh(`${guard} check .`, newRepo(b)).code).toBe(1);
    expect(sh(`${guard} check .`, newRepo("feat/x")).code).toBe(0);
  });
  test("message tells the agent what to do", () => {
    expect(sh(`${guard} check .`, newRepo("main")).err).toContain("git switch -c feat/");
  });
  test("overrides: env var and per-repo config", () => {
    const dir = newRepo("main");
    expect(sh(`ALLOW_DEFAULT_BRANCH=1 ${guard} check .`, dir).code).toBe(0);
    sh("git config devbox.allowDefaultBranch true", dir);
    expect(sh(`${guard} check .`, dir).code).toBe(0);
  });
  test("non-repos and detached HEAD are allowed", () => {
    expect(sh(`${guard} check .`, mkdtempSync(resolve(root, "plain-"))).code).toBe(0);
    const dir = newRepo("main");
    sh("git checkout -q --detach", dir);
    expect(sh(`${guard} check .`, dir).code).toBe(0);
  });
});

describe("shared branch protection", () => {
  test("check blocks dev and staging, even as the repo's default branch", () => {
    for (const b of ["dev", "staging"]) {
      const dir = newRepo(b);
      sh(`git remote add origin https://example.invalid/r.git && git update-ref refs/remotes/origin/${b} HEAD && git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/${b}`, dir);
      expect(sh(`${guard} check .`, dir).code).toBe(1);
    }
  });
});

describe("claude-push-hook", () => {
  const push = (dir: string, command: string) => sh(`${guard} claude-push-hook`, dir, {}, JSON.stringify({ cwd: dir, tool_input: { command } }));
  test("allows feature branch pushes", () => {
    const dir = newRepo("feat/x");
    for (const c of [ "git push", "git push --force-with-lease origin feat/x", "git push origin --delete feat/x", "git status", "echo push"]) {
      expect([c, push(dir, c).code]).toEqual([c, 0]);
    }
  });
  test("blocks pushes that update or delete protected branches, in any form", () => {
    const dir = newRepo("feat/x");
    for (const c of [
      "git push origin main",
      "git push origin dev",
      "git push -u origin staging",
      "git push origin :",
      "git push origin refs/heads/*:refs/heads/*",
      "git push -f origin master",
      "git push origin HEAD:develop",
      "git push origin +feat/x:main",
      "git push origin --delete main",
      "git push --all origin",
      `git -C ${dir} push origin trunk`,
      "git --no-pager push origin main",
      "cd . && git push origin main",
    ]) {
      expect([c, push(dir, c).code]).toEqual([c, 2]);
    }
    expect(push(dir, "git push origin main").err).toContain("protected branch");
  });
  test("a bare push from a protected branch is blocked", () => {
    expect(push(newRepo("main"), "git push").code).toBe(2);
  });
  test("per-repo override allows protected pushes", () => {
    const dir = newRepo("main");
    sh("git config devbox.allowDefaultBranch true", dir);
    expect(push(dir, "git push origin main").code).toBe(0);
  });
});

describe("claude-hook", () => {
  const call = (dir: string, file: string) => sh(`${guard} claude-hook`, dir, {}, JSON.stringify({ tool_input: { file_path: file } }));
  test("blocks edits on main with exit 2, including new files in new folders", () => {
    const dir = newRepo("main");
    expect(call(dir, resolve(dir, "a.ts")).code).toBe(2);
    expect(call(dir, resolve(dir, "new/deeper/a.ts")).code).toBe(2);
  });
  test("allows edits on a feature branch, outside repos, and tool calls without a path", () => {
    expect(call(newRepo("feat/x"), "a.ts").code).toBe(0);
    expect(call(mkdtempSync(resolve(root, "p-")), "/tmp/whatever.txt").code).toBe(0);
    expect(sh(`${guard} claude-hook`, root, {}, JSON.stringify({ tool_input: { command: "ls" } })).code).toBe(0);
  });
});

describe("git hooks", () => {
  function withHooks(branch: string) {
    const dir = newRepo(branch);
    const bin = resolve(root, "bin");
    mkdirSync(bin, { recursive: true });
    if (!existsSync(resolve(bin, "guard-default-branch"))) symlinkSync(guard, resolve(bin, "guard-default-branch"));
    sh(`git config core.hooksPath ${hooks}`, dir);
    return { dir, env: { PATH: `${bin}:${process.env.PATH}` } };
  }
  test("pre-commit refuses commits on main and allows them on a feature branch", () => {
    const main = withHooks("main");
    expect(sh("git commit -q --allow-empty -m x", main.dir, main.env).code).not.toBe(0);
    const feat = withHooks("feat/y");
    expect(sh('git commit -q --allow-empty -m "chore: x"', feat.dir, feat.env).code).toBe(0);
  });
  test("a repo's own hook still runs through the global runner", () => {
    const { dir, env } = withHooks("feat/z");
    const local = resolve(dir, ".git/hooks/commit-msg");
    writeFileSync(local, '#!/bin/sh\necho ran > "$(git rev-parse --show-toplevel)/chained.txt"\n');
    chmodSync(local, 0o755);
    expect(sh('git commit -q --allow-empty -m "chore: x"', dir, env).code).toBe(0);
    expect(readFileSync(resolve(dir, "chained.txt"), "utf8").trim()).toBe("ran");
  });
  test("commit-msg requires a Conventional Commits subject", () => {
    const { dir, env } = withHooks("feat/msg");
    for (const ok of ["feat: add x", "fix(auth): reject expired sessions", "chore!: drop node 18", "Revert \"feat: add x\"", "fixup! feat: add x"]) {
      expect([ok, sh(`git commit -q --allow-empty -m '${ok}'`, dir, env).code]).toEqual([ok, 0]);
    }
    const bad = sh("git commit -q --allow-empty -m 'updated stuff'", dir, env);
    expect(bad.code).not.toBe(0);
    expect(bad.err).toContain("Conventional Commit");
    sh("git config devbox.allowAnyCommitMessage true", dir);
    expect(sh("git commit -q --allow-empty -m 'updated stuff'", dir, env).code).toBe(0);
  });
  test.skipIf(!Bun.which("gitleaks"))("pre-commit blocks staged secrets when gitleaks is installed", () => {
    const { dir, env } = withHooks("feat/leak");
    writeFileSync(resolve(dir, "config.ts"), 'export const key = "AKIA' + 'Z7QK3LMN4PQR8STU";\nexport const secret = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY9x";\n');
    sh("git add config.ts", dir);
    const r = sh('git commit -q -m "feat: add config"', dir, { ...env, PATH: `${env.PATH}:${Bun.which("gitleaks")!.replace(/\/gitleaks$/, "")}` });
    expect(r.code).not.toBe(0);
    expect(r.err).toContain("gitleaks");
  });
});

describe("install-claude-hook", () => {
  test("merges into existing settings, keeps them, and is idempotent", () => {
    const home = mkdtempSync(resolve(root, "home-"));
    mkdirSync(resolve(home, ".claude"));
    const file = resolve(home, ".claude/settings.json");
    writeFileSync(file, JSON.stringify({ theme: "dark", hooks: { Stop: [{ hooks: [{ type: "command", command: "echo hi" }] }] } }));
    for (let i = 0; i < 2; i++) expect(sh(`${guard} install-claude-hook`, root, { HOME: home }).code).toBe(0);
    const s = JSON.parse(readFileSync(file, "utf8"));
    expect(s.theme).toBe("dark");
    expect(s.hooks.Stop).toHaveLength(1);
    expect(s.hooks.PreToolUse).toHaveLength(2);
    expect(s.hooks.PreToolUse[0].matcher).toContain("Edit");
    expect(s.hooks.PreToolUse[1].matcher).toBe("Bash");
    expect(s.hooks.PreToolUse[1].hooks[0].command).toContain("claude-push-hook");
  });
});
