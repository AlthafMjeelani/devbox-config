import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repo = resolve(import.meta.dir, "..");
const read = (file: string) => readFileSync(resolve(repo, file), "utf8");

describe("agent policy files", () => {
  test("Claude settings allow dev/staging pushes, deny protected pushes, and install the guards and statusline", () => {
    const s = JSON.parse(read("agents/.claude/settings.json"));
    expect(s.permissions.deny).toContain("Bash(git push origin main)");
    expect(s.permissions.deny).not.toContain("Bash(git push:*)");
    expect(s.permissions.allow).toContain("Bash(git push origin dev)");
    expect(s.permissions.allow).toContain("Bash(git push origin staging)");
    expect(JSON.stringify(s.hooks)).toContain("guard-default-branch claude-hook");
    expect(JSON.stringify(s.hooks)).toContain("guard-default-branch claude-push-hook");
    expect(s.statusLine.command).toBe("~/.local/bin/claude-statusline");
  });

  test("Claude settings protect secrets from reads", () => {
    const deny: string[] = JSON.parse(read("agents/.claude/settings.json")).permissions.deny;
    expect(deny).toContain("Read(./.env)");
  });

  test("Codex rules allow dev/staging pushes, forbid protected pushes, and carry no machine-specific paths", () => {
    const rules = read("agents/.codex/rules/default.rules");
    expect(rules).toMatch(/pattern = \["git", "push", "origin", \["dev", "staging"[^\]]*\]\],\s*decision = "allow"/);
    expect(rules).toMatch(/pattern = \["git", "push", "origin", \["main"[^\]]*\]\],\s*decision = "forbidden"/);
    expect(rules).not.toMatch(/pattern = \["git", "push"\],/);
    expect(rules).not.toMatch(/\/private\/tmp|\/Users\//);
  });

  test("Amp allows dev/staging pushes, rejects protected pushes and asks for the rest (first match wins)", () => {
    const perms: { matches: { cmd: string }; action: string }[] = JSON.parse(read("amp/.config/amp/settings.json"))["amp.permissions"];
    const at = (cmd: string, action: string) => perms.findIndex((p) => p.matches.cmd === cmd && p.action === action);
    const ask = at("git push*", "ask");
    expect(at("git push origin dev", "allow")).toBeGreaterThanOrEqual(0);
    expect(at("git push origin dev", "allow")).toBeLessThan(ask);
    expect(at("git push* main", "reject")).toBeGreaterThanOrEqual(0);
    expect(at("git push* main", "reject")).toBeLessThan(ask);
  });

  test("OpenCode asks for pushes, denies protected ones and allows dev/staging (last match wins)", () => {
    const bash: Record<string, string> = JSON.parse(read("opencode/.config/opencode/opencode.json")).agent.build.permission.bash;
    const keys = Object.keys(bash);
    expect(bash["git push*"]).toBe("ask");
    expect(bash["git push* main"]).toBe("deny");
    expect(bash["git push origin dev"]).toBe("allow");
    expect(keys.indexOf("git push*")).toBeLessThan(keys.indexOf("git push* main"));
    expect(keys.indexOf("git push*")).toBeLessThan(keys.indexOf("git push origin staging"));
  });

  test("personal-context templates exist for the files AGENTS.md reads", () => {
    expect(existsSync(resolve(repo, "agents/OPINIONS.md.example"))).toBe(true);
    expect(existsSync(resolve(repo, "agents/VOICE.md.example"))).toBe(true);
  });
});
