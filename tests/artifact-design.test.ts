import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const repo = resolve(import.meta.dir, "..");
const skills = resolve(repo, "agents/.config/opencode/skills");
const pack = [
  "professional-artifact-design", "content-storytelling", "data-visualization",
  "infographic-diagram", "technical-documentation", "screenshot-documentation",
  "interactive-prototyping", "artifact-quality-review", "business-presentation", "educational-content",
];

function luminance(hex: string) {
  const channels = hex.slice(1).match(/../g)!.map((value) => {
    const channel = parseInt(value, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("professional artifact design pack", () => {
  test("theme text roles meet normal-text contrast on the canvas", () => {
    const themes = JSON.parse(readFileSync(resolve(skills, pack[0], "assets/themes.json"), "utf8"));
    for (const [name, theme] of Object.entries(themes.themes) as [string, Record<string, string>][]) {
      for (const role of ["ink", "muted", "accent"]) {
        expect(contrast(theme[role], theme.canvas), `${name}.${role}`).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast("#FFFFFF", theme.primary), `${name}.dark-surface`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("Stow and agent sync expose all pack skills through all seven hosts", () => {
    const target = realpathSync(mkdtempSync(resolve(tmpdir(), "artifact-design-install-")));
    try {
      const stow = Bun.spawnSync(["stow", "-d", repo, "-t", target, "agents"], { stdout: "pipe", stderr: "pipe" });
      expect(stow.exitCode, stow.stderr.toString()).toBe(0);
      const sync = Bun.spawnSync([resolve(repo, "scripts/.local/bin/agents-sync")], {
        cwd: repo, env: { ...process.env, HOME: target }, stdout: "pipe", stderr: "pipe",
      });
      expect(sync.exitCode, sync.stderr.toString()).toBe(0);
      const hosts = {
        Claude: ".claude/skills", Codex: ".agents/skills", OpenCode: ".config/opencode/skills",
        Kimi: ".kimi-code/skills", Amp: ".claude/skills", CommandCode: ".commandcode/skills",
        Antigravity: ".gemini/antigravity-cli/skills",
      };
      for (const [host, directory] of Object.entries(hosts)) {
        for (const name of pack) {
          const installed = resolve(target, directory, name, "SKILL.md");
          expect(realpathSync(installed), `${host}/${name}`).toBe(realpathSync(resolve(skills, name, "SKILL.md")));
        }
      }
    } finally {
      rmSync(target, { recursive: true, force: true });
    }
  });
});
