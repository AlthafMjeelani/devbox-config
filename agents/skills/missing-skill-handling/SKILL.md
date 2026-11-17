---
name: missing-skill-handling
description: What to do when a task needs expertise no installed skill covers. Search existing skills, then install or create a new one, validate it, and sync it to every agent.
---

# Missing skill handling

Use when a task needs a domain, tool or workflow and no listed skill clearly fits.

## Steps
1. **Check first.** Re-read the skill list and descriptions. Run `find-skills` to search installed and published skills. Prefer an existing skill, or combine two, over creating a new one.
2. **Do the task anyway.** A missing skill is not a blocker. Use the repo's own docs and `grounding` to verify facts, and finish the work.
3. **Decide if a skill is worth it.** Create one only if the need will recur, the procedure has non-obvious steps, and no existing skill can be extended. Otherwise note the gap in the final report.
4. **Create or extend it.** Use `skill-creator`. Work on a feature branch in the devbox-config repo (`~/.claude/skills` resolves to `agents/skills/`), never on `main`.
   - Folder `agents/skills/<kebab-name>/SKILL.md` with `name` equal to the folder, and a `description` that says what it does and when to use it.
   - Keep `SKILL.md` under 500 lines; put detail in `references/`.
   - No secrets, no machine-specific paths, no em dashes.
   - Link related skills that exist.
5. **Validate.** Run `make verify-agent-workflow`, then `make agents-sync && make restow-agents`. Tell the user to start a new session to load it.
6. **Ask before publishing.** Commit on the branch only if asked. Do not push, merge or open a PR without approval. Tell the user the skill's name and why it was added.

Related: `find-skills`, `skill-creator`, `verify-task`, `grounding`.
