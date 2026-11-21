import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repo = resolve(import.meta.dir, "..");
const read = (file: string) => readFileSync(resolve(repo, file), "utf8");

describe("agent policy files", () => {
  test("Claude settings deny shared branch pushes, and install the guards and statusline", () => {
    const s = JSON.parse(read("agents/.claude/settings.json"));
    expect(s.permissions.deny).toContain("Bash(git push origin main)");
    expect(s.permissions.deny).not.toContain("Bash(git push:*)");
    expect(s.permissions.deny).toContain("Bash(git push origin dev)");
    expect(s.permissions.allow).not.toContain("Bash(git push origin dev)");
    expect(s.permissions.deny).toContain("Bash(git push origin staging)");
    expect(s.permissions.allow).not.toContain("Bash(git push origin staging)");
    expect(JSON.stringify(s.hooks)).toContain("guard-default-branch claude-hook");
    expect(JSON.stringify(s.hooks)).toContain("guard-default-branch claude-push-hook");
    expect(s.statusLine.command).toBe("~/.local/bin/claude-statusline");
  });

  test("Claude settings protect secrets from reads", () => {
    const deny: string[] = JSON.parse(read("agents/.claude/settings.json")).permissions.deny;
    expect(deny).toContain("Read(./.env)");
  });

  test("Codex rules forbid shared branch pushes, and carry no machine-specific paths", () => {
    const rules = read("agents/.codex/rules/default.rules");
    expect(rules).toMatch(/"dev", "staging"[^\]]*\]\],\s*decision = "forbidden"/);
    expect(rules).toMatch(/pattern = \["git", "push", "origin", \["main"[^\]]*\]\],\s*decision = "forbidden"/);
    expect(rules).not.toMatch(/pattern = \["git", "push"\],/);
    expect(rules).not.toMatch(/\/private\/tmp|\/Users\//);
  });

  test("Amp rejects shared branch pushes and asks for the rest (first match wins)", () => {
    const perms: { matches: { cmd: string }; action: string }[] = JSON.parse(read("amp/.config/amp/settings.json"))["amp.permissions"];
    const at = (cmd: string, action: string) => perms.findIndex((p) => p.matches.cmd === cmd && p.action === action);
    const ask = at("git push*", "ask");
    expect(at("git push* dev", "reject")).toBeGreaterThanOrEqual(0);
    expect(at("git push* dev", "reject")).toBeLessThan(ask);
    expect(at("git push* main", "reject")).toBeGreaterThanOrEqual(0);
    expect(at("git push* main", "reject")).toBeLessThan(ask);
  });

  test("OpenCode asks for pushes, denies shared branch pushes (last match wins)", () => {
    const bash: Record<string, string> = JSON.parse(read("opencode/.config/opencode/opencode.json")).agent.build.permission.bash;
    const keys = Object.keys(bash);
    expect(bash["git push*"]).toBe("ask");
    expect(bash["git push* main"]).toBe("deny");
    expect(bash["git push* dev"]).toBe("deny");
    expect(keys.indexOf("git push*")).toBeLessThan(keys.indexOf("git push* main"));
    expect(keys.indexOf("git push*")).toBeLessThan(keys.indexOf("git push* staging"));
  });

  test("generated Claude agents start with frontmatter so Claude Code loads them", () => {
    const dir = resolve(repo, "agents/.claude/agents");
    const files = readdirSync(dir).filter((file) => file.endsWith(".md"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) expect([file, read(`agents/.claude/agents/${file}`).startsWith("---\nname: ")]).toEqual([file, true]);
  });

  test("personal-context templates exist for the files AGENTS.md reads", () => {
    expect(existsSync(resolve(repo, "agents/OPINIONS.md.example"))).toBe(true);
    expect(existsSync(resolve(repo, "agents/VOICE.md.example"))).toBe(true);
  });
});
