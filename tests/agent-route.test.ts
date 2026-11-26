import { expect, test } from "bun:test";
import path from "node:path";

process.env.AGENT_TIERS = path.resolve(import.meta.dir, "fixtures/tiers.json");
import { route, command } from "../scripts/.local/bin/agent-route";

test("small mechanical tasks go fast and low", () => {
  expect(route("fix typo in README")).toMatchObject({ tier: "fast", effort: "low" });
});
test("normal feature work stays standard and low", () => {
  expect(route("add a settings page with a toggle")).toMatchObject({ tier: "standard", effort: "low" });
});
test("risky work escalates", () => {
  expect(route("debug race condition in auth token refresh").tier).toBe("deep");
  expect(route("migrate payment schema, security review", 12).effort).toBe("high");
});
test("file count escalates", () => {
  expect(route("update imports", 8).tier).toBe("standard");
  expect(route("refactor module", 20).tier).toBe("deep");
});
test("commands per engine", () => {
  expect(command("codex", "deep", "medium")).toBe("codex -m test-codex-deep -c model_reasoning_effort=medium");
  expect(command("claude", "fast", "low")).toBe("claude --model test-claude-fast");
});
test("cli --tier", () => {
  const bin = path.resolve(import.meta.dir, "../scripts/.local/bin/agent-route");
  expect(Bun.spawnSync(["bun", bin, "--tier", "fix typo"]).stdout.toString().trim()).toBe("fast");
});
test("pi and opencode commands come from the tier file", () => {
  expect(command("pi", "standard", "low")).toBe("pi --model test-pi-standard:low");
  expect(command("opencode", "deep", "low")).toBe("opencode --model test-opencode-deep");
});
test("no model name is hard-coded in the router", () => {
  const src = require("node:fs").readFileSync(path.resolve(import.meta.dir, "../scripts/.local/bin/agent-route"), "utf8");
  expect(src).not.toMatch(/gpt-\d|gemini-\d|claude-[a-z]+-\d|deepseek|kimi-code|Qwen/);
});
