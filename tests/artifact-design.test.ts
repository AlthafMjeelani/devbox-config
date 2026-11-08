import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const repo = resolve(import.meta.dir, "..");
const skills = resolve(repo, "agents/skills");
const upstream = JSON.parse(readFileSync(resolve(repo, "agents/design-skills.sources.json"), "utf8")).skills as { name: string; revision: string; repository: string; path: string }[];
const pack = [
  "professional-artifact-design", "content-storytelling", "data-visualization",
  "infographic-diagram", "technical-documentation", "screenshot-documentation",
  "interactive-prototyping", "artifact-quality-review", "business-presentation", "educational-content",
  "proposal-writing", "prototyping-proposals", "premium-artifact-design-director",
  "senior-backend-engineer", "auth-and-identity", "fullstack-type-safety", "react-state-and-query",
  "flutter-native-and-release", "flutter-ui-ux-design", "poster-and-social-media-design",
  "svg-logo-and-icon-design", "web-motion-and-microinteractions", "print-and-publication-documents",
  "admin-panel-dashboard-design", "rex-terminal", "agent-orchestration", "agent-communication",
  "mobile-app-development", "env-and-secrets", "model-routing", "context-management", "project-agents-md", "repo-agentic-setup", "aws-deploy", "figma-workflow", "vercel-workflow", "design-workflow", "web-accessibility-audit", "visual-qa-playwright", "tailwind-design-tokens", "design-critique", "design-handoff-spec", "design", "ui-styling", "brand", "banner-design", "slides", "openai-docs", "skill-creator",
  ...upstream.map((skill) => skill.name),
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
  test("upstream packages have pinned provenance and matching portable entry points", () => {
    expect(upstream.length).toBeGreaterThanOrEqual(29);
    expect(new Set(upstream.map((skill) => skill.name)).size).toBe(upstream.length);
    for (const skill of upstream) {
      expect(skill.revision).toMatch(/^[a-f0-9]{40}$/);
      const entry = readFileSync(resolve(skills, skill.name, "SKILL.md"), "utf8");
      expect(entry).toContain(`name: ${skill.name}`);
      expect(entry).toMatch(/\ndescription:/);
    }
  });
  test("theme text roles meet normal-text contrast on the canvas", () => {
    const themes = JSON.parse(readFileSync(resolve(skills, pack[0], "assets/themes.json"), "utf8"));
    for (const [name, theme] of Object.entries(themes.themes) as [string, Record<string, string>][]) {
      for (const role of ["ink", "muted", "accent"]) {
        expect(contrast(theme[role], theme.canvas), `${name}.${role}`).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast("#FFFFFF", theme.primary), `${name}.dark-surface`).toBeGreaterThanOrEqual(4.5);
    }
  });

  // Needs GNU Stow on PATH; skipped (not failed) on machines without it.
  test.skipIf(!Bun.which("stow"))("Stow and agent sync expose all pack skills through all seven hosts", () => {
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
