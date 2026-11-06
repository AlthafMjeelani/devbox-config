import { expect, test } from "bun:test";
import path from "node:path";
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
  expect(command("codex", "deep", "medium")).toBe("codex -m gpt-6.1-sol -c model_reasoning_effort=medium");
  expect(command("claude", "fast", "low")).toBe("claude --model haiku");
});
test("cli --tier", () => {
  const bin = path.resolve(import.meta.dir, "../scripts/.local/bin/agent-route");
  expect(Bun.spawnSync(["bun", bin, "--tier", "fix typo"]).stdout.toString().trim()).toBe("fast");
});
