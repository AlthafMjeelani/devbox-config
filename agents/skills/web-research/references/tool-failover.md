# Tool failover guide

Preferred stack:
1. `exa:web_search_exa`
2. `parallel-search:web_search`
3. `exa:web_fetch_exa` / `parallel-search:web_fetch`
4. `perplexity:perplexity_ask`
5. `context7:resolve-library-id` + `context7:query-docs` for library docs

## If a tool is missing

| Missing | Use instead | Adjustment |
| --- | --- | --- |
| Exa | `perplexity:perplexity_search` or multiple `parallel-search:web_search` queries | Be more explicit; verify which result is official |
| Parallel Search | 3-5 manual Exa or Perplexity searches | Write the angle list first |
| Perplexity | Exa/Parallel + manual synthesis | Quote URLs directly |
| Context7 | Official docs + source repo + release notes | Be explicit about library version |
| Page extraction | alternate fetch path, browser fallback, raw docs, GitHub mirror | Do not cite unread snippets as final evidence |

Minimum fallback path:
1. official docs
2. source repo
3. read top 2-5 pages fully
4. capture links for every non-obvious claim
5. lower confidence when evidence is thin
