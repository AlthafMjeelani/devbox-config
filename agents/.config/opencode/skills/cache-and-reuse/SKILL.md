---
name: cache-and-reuse
description: Use when structuring instructions and context to maximize provider prompt caching and reusing verified findings across session steps.
---

# Cache and Reuse

## When to use
- Authoring system prompts, subagent prompts, or recurring instruction blocks.
- Structuring long-running conversations to benefit from prefix caching.
- Storing and reusing verified investigation findings across subagents or sequential tasks.

## Inputs to gather
- Static versus dynamic context components.
- Verified codebase findings, architecture rules, and dependency manifests.
- Repetitive prompt elements used across task turns.

## Procedure
1. Separate static from dynamic context:
   Place immutable guidelines, repository rules, and reference docs at the prompt prefix.
   Ensure that shared instructions remain identical across requests.
2. Keep prefixes stable:
   Avoid interleaving volatile timestamps or dynamic scratch notes at the top of instructions.
   Keep prompt ordering consistent across turns.
3. Append dynamic work at the end:
   Place user requests, current diffs, and immediate task goals after the stable prefix.
   This maximizes prompt cache hit rates on supported providers.
4. Record verified facts:
   Maintain a structured scratchpad of verified file paths, interface signatures, and findings.
   Document dependencies and tested behaviors explicitly.
5. Reuse verified facts:
   Consult the verified facts scratchpad rather than re-reading unchanged files in subsequent steps.
   Avoid re-discovering truths already established in the session.
6. Invalidate stale cache:
   Re-verify facts immediately if file modifications or branch switches occur.
   Do not rely on cached assumptions after modifying code.

## Output / handoff
- Structured prompt or task specification designed for prefix cache stability.
- Verified findings cache for use in subsequent session steps.

## Verification and guardrails
- Do not invent artificial cache control headers or claim provider caching capabilities that do not exist.
- Always invalidate cached assumptions when code changes occur on disk.
- Never sacrifice prompt clarity or correctness solely to force cache hits.
- Verify that cached information remains accurate before acting on it.
