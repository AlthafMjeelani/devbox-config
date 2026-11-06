---
name: codebase-navigation
description: Use when exploring unfamiliar repositories via package manifests, entry points, symbol searches, call sites, and test fixtures without reading entire files.
---

# Codebase Navigation

## When to use
- First interaction with an unfamiliar repository, submodule, or service.
- Tracing data flow or execution flow across multiple modules or layers.
- Locating where a specific feature, configuration flag, or error originates.

## Inputs to gather
- Root directory structure and dependency manifests (`package.json`, `go.mod`, `pubspec.yaml`, etc.).
- Entry point files (`main`, `index`, `app`, routing tables).
- Target symbol, endpoint, or error message to trace.

## Procedure
1. Map technology stack:
   View top-level manifests, build scripts, and configuration files to identify frameworks and versions.
   Check language version, package manager, and dependencies.
2. Identify architectural patterns:
   Locate primary folders (e.g. `src/`, `lib/`, `controllers/`, `services/`, `models/`).
   Identify how layers communicate and where boundaries lie.
3. Targeted symbol lookup:
   Search for symbol declarations using case-sensitive grep before reading full files.
   Identify the primary definition and interface contracts.
4. Trace call hierarchy:
   Find call sites and usages using targeted grep searches with line limits.
   Determine upstream callers and downstream dependencies.
5. Inspect test fixtures:
   Check test files to understand intended usage, expected inputs, and expected outputs.
   Tests often provide the clearest usage examples.
6. Document navigation path:
   Trace the request or data flow through components and note entry and exit boundaries.
   Record verified file paths and line ranges.

## Output / handoff
- Architectural trace: chronological list of files and functions in the execution path.
- Summary of integration boundaries, dependencies, and test coverage seams.

## Verification and guardrails
- Do not use recursive file listing commands that traverse `node_modules`, `.git`, or build outputs.
- Limit search results and inspect targeted line ranges rather than full files.
- Distinguish between production implementations and mock or test fixtures.
- Verify that every discovered symbol matches current repository HEAD.
