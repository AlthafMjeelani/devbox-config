import { afterAll, expect, test } from "bun:test";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = mkdtempSync(join(tmpdir(), "orchestrator-git-"));
const repo = resolve(import.meta.dir, "..");
const bin = join(repo, "scripts/.local/bin");
const hooks = join(repo, "git/.config/git/hooks");
afterAll(() => rmSync(root, { recursive: true, force: true }));

function run(cwd: string, command: string, env: Record<string, string> = {}) {
  const result = Bun.spawnSync(["bash", "-c", command], {
    cwd,
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_CONFIG_SYSTEM: "/dev/null",
      CREW_MANAGED: "0",
      ...env,
    },
  });
  return { code: result.exitCode, out: result.stdout.toString().trim(), err: result.stderr.toString() };
}

function checkout() {
  const dir = mkdtempSync(join(root, "repo-"));
  expect(run(dir, "git init -q -b task/142 && git -c user.name=test -c user.email=test@example.invalid commit -qm init --allow-empty").code).toBe(0);
  return dir;
}

test("git-wt reports setup failure and retains the worktree for inspection", () => {
  const dir = checkout();
  writeFileSync(join(dir, ".worktrees-setup"), "#!/bin/sh\nexit 9\n", { mode: 0o755 });
  const create = run(dir, "git wt new agent/142-api");
  expect(create.code).toBe(1);
  expect(create.err).toContain("post-create hook failed");
  expect(run(dir, "git wt path agent/142-api").code).toBe(0);
});

test("cleanup preserves dirty or unintegrated work and refuses branch path collisions", () => {
  const dir = checkout();
  expect(run(dir, "git wt new agent/142-api --no-setup").code).toBe(0);
  const wt = run(dir, "git wt path agent/142-api").out;
  expect(run(dir, "git wt path agent-142-api").code).not.toBe(0);
  writeFileSync(join(wt, "work.txt"), "unfinished");
  expect(run(dir, "git wt rm agent/142-api -D --force").code).not.toBe(0);
  expect(run(dir, "git wt rm agent/142-api -D").code).not.toBe(0);
  expect(existsSync(join(wt, "work.txt"))).toBe(true);
  expect(run(wt, "git add work.txt && git -c user.name=test -c user.email=test@example.invalid commit -qm 'feat: worker change'").code).toBe(0);
  expect(run(dir, "git wt rm agent/142-api -D").code).not.toBe(0);
  expect(run(dir, "git merge --ff-only agent/142-api && git wt rm agent/142-api -D").code).toBe(0);
});

test("pre-push rejects protected destinations and all managed worker pushes", () => {
  const dir = checkout();
  expect(run(dir, `git init --bare -q remote.git && git remote add origin ./remote.git && git config core.hooksPath '${hooks}'`).code).toBe(0);
  for (const branch of ["main", "dev", "staging"]) {
    expect(run(dir, `git push origin HEAD:refs/heads/${branch}`).err).toContain("protected branch");
  }
  expect(run(dir, "git push origin HEAD:refs/heads/feat/142", { CREW_MANAGED: "1" }).err).toContain("workers cannot push");
  expect(run(dir, "git push origin HEAD:refs/heads/feat/142").code).toBe(0);
});

test("Gate requires committed checks, retains failures, and runs locally by default", () => {
  const dir = checkout();
  const configure = (lint: string) => {
    writeFileSync(join(dir, ".gate.sh"), `GATE_TEST=true\nGATE_LINT=${lint}\nGATE_REVIEW_CMD=''\n`);
    expect(run(dir, "git add .gate.sh && git -c user.name=test -c user.email=test@example.invalid commit -qm 'test: configure gate'").code).toBe(0);
  };
  expect(run(dir, "gate run").err).toContain("commit .gate.sh");
  configure("");
  expect(run(dir, "gate run").err).toContain("GATE_TEST and GATE_LINT");
  configure("true");
  expect(run(dir, "gate run").out).toContain("all gates passed");
  configure("false");
  expect(run(dir, "gate run").err).toContain("verification blocked");
  expect(run(dir, "git wt path gate/task/142").code).toBe(0);
});

test("crew stop rejects its former destructive flag", () => {
  expect(run(checkout(), "crew stop agent/142-api -D").err).toContain("use crew cleanup separately");
});

test("Gate publishes the verified commit and requests a draft only with --ship", () => {
  const dir = checkout();
  const remote = mkdtempSync(join(root, "remote-"));
  const stub = mkdtempSync(join(root, "cli-"));
  const calls = join(stub, "gh-calls");
  writeFileSync(join(stub, "gh"), `#!/bin/sh\nprintf '%s\\n' "$*" >> '${calls}'\n[ "$2" = create ]\n`, { mode: 0o755 });
  writeFileSync(join(dir, ".gate.sh"), "GATE_TEST=true\nGATE_LINT=true\nGATE_REVIEW_CMD=''\n");
  expect(run(dir, `git init --bare -q '${remote}' && git remote add origin '${remote}' && git add .gate.sh && git -c user.name=test -c user.email=test@example.invalid commit -qm 'test: configure gate'`).code).toBe(0);
  const env = { PATH: `${stub}:${bin}:${process.env.PATH}` };
  expect(run(dir, "gate run", env).code).toBe(0);
  expect(existsSync(calls)).toBe(false);
  expect(run(dir, "gate run --ship", env).code).toBe(0);
  expect(run(remote, "git rev-parse refs/heads/task/142").out).toBe(run(dir, "git rev-parse HEAD").out);
  expect(run(stub, "cat gh-calls").out).toContain("pr create --fill --head task/142 --draft");
});
