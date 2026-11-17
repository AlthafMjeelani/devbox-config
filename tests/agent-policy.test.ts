import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repo = resolve(import.meta.dir, "..");
const read = (file: string) => readFileSync(resolve(repo, file), "utf8");

describe("agent policy files", () => {
  test("Claude settings deny push and install the branch guard and statusline", () => {
    const s = JSON.parse(read("agents/.claude/settings.json"));
    expect(s.permissions.deny).toContain("Bash(git push:*)");
    expect(JSON.stringify(s.hooks)).toContain("guard-default-branch claude-hook");
    expect(s.statusLine.command).toBe("~/.local/bin/claude-statusline");
  });

  test("Claude settings protect secrets from reads", () => {
    const deny: string[] = JSON.parse(read("agents/.claude/settings.json")).permissions.deny;
    expect(deny).toContain("Read(./.env)");
  });

  test("Codex rules forbid push and carry no machine-specific paths", () => {
    const rules = read("agents/.codex/rules/default.rules");
    expect(rules).toMatch(/pattern = \["git", "push"\],\s*decision = "forbidden"/);
    expect(rules).not.toMatch(/\/private\/tmp|\/Users\//);
  });

  test("Amp rejects git push", () => {
    const amp = JSON.parse(read("amp/.config/amp/settings.json"));
    expect(amp["amp.permissions"]).toContainEqual({ tool: "Bash", matches: { cmd: "git push*" }, action: "reject" });
  });

  test("personal-context templates exist for the files AGENTS.md reads", () => {
    expect(existsSync(resolve(repo, "agents/OPINIONS.md.example"))).toBe(true);
    expect(existsSync(resolve(repo, "agents/VOICE.md.example"))).toBe(true);
  });
});
