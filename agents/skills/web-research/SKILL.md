---
name: web-research
description: Use this skill for current, source-backed technical research for docs, RFCs, ADRs, release notes, API usage, benchmarks, comparisons, or ecosystem questions. Best when Exa, Parallel Search, Perplexity, and Context7 MCP tools are available.
license: MIT
compatibility: Best with MCP servers `exa`, `parallel-search`, `perplexity`, and `context7`. `allowed-tools` is experimental and mainly useful in Claude Code-style runtimes.
allowed-tools:
  - mcp__exa__*
  - mcp__parallel-search__*
  - mcp__perplexity__*
  - mcp__context7__*
metadata:
  category: docs
  tags: [research, rfc, docs, exa, perplexity, context7, parallel, mcp]
---

Use this skill for current technical research with citations.

## Tool map

Prefer these MCP tools by name when available:

- `exa:web_search_exa` — first-pass semantic discovery; best for official docs, product pages, release notes, and likely canonical URLs
- `exa:web_fetch_exa` — read chosen URLs as markdown
- `parallel-search:web_search` — run 3-4 distinct query angles in parallel for breadth
- `parallel-search:web_fetch` — fetch full text for URLs found via parallel search
- `perplexity:perplexity_search` — ranked URL discovery when Exa is weak or unavailable
- `perplexity:perplexity_ask` — quick synthesis or cross-check with citations after discovery
- `context7:resolve-library-id` -> `context7:query-docs` — library/framework/API docs and code examples

For Claude Code permission syntax, the same tools are usually named `mcp__server__tool`, for example `mcp__exa__web_search_exa`.

## Default loop

1. Restate the research goal in one sentence.
2. Write 3-5 search angles: official docs, source repo, release notes, comparison, caveats.
3. Start with `exa:web_search_exa`.
4. Use `parallel-search:web_search` when one phrasing may miss results.
5. Read real pages with `exa:web_fetch_exa` or `parallel-search:web_fetch`; do not rely only on snippets.
6. Use `perplexity:perplexity_ask` only after reading enough sources to synthesize or cross-check.
7. If the question is library-specific, call `context7:resolve-library-id` then `context7:query-docs`.
8. Cite every non-obvious claim and mark uncertainty.

## Routing rules

- library or API usage -> Context7 first, then web sources for release notes or ecosystem context
- official docs / changelogs / vendor pages -> Exa first
- broad comparisons or ecosystem scans -> Parallel Search first, then fetch
- quick factual cross-check -> Perplexity ask
- code-heavy topic -> add source repo and API docs; prefer implementation over blogs

## Minimum evidence standard

- consequential claim -> 1 official source + 1 corroborating source or implementation reference
- freshness-sensitive claim -> include version or date
- disagreement -> show both sides; do not average them away

## References

Load only as needed:
- `references/query-patterns.md`
- `references/tool-failover.md`
- `references/source-quality.md`
- `references/rfc-research-output-template.md`
