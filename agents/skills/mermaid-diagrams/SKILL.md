---
name: mermaid-diagrams
description: Use this skill when asked to create, fix, review, or validate Mermaid diagrams in technical docs, RFCs, ADRs, architecture notes, or Markdown. Helps choose the right Mermaid diagram type, apply consistent semantic colors and groups, and validate diagrams before finalizing.
license: MIT
compatibility: Requires Node.js. Validation requires Mermaid CLI (`mmdc`) on PATH; the skill degrades to syntax-first authoring if `mmdc` is unavailable.
metadata:
  category: docs
  tags: [mermaid, diagrams, rfc, architecture, markdown]
---

Use this skill for any Mermaid work in technical writing.

## When to use it

- Writing or editing Mermaid in `README.md`, design docs, RFCs, ADRs, runbooks, or onboarding notes
- Turning prose architecture into a diagram
- Choosing between flowchart, sequence, state, ER, timeline, or gantt
- Adding semantic colors, subgraphs, lanes, and grouping
- Validating Mermaid before shipping docs

## Default workflow

1. Identify the doc's purpose: overview, interaction, lifecycle, data model, rollout plan, or chronology.
2. Pick the simplest diagram type that communicates that purpose.
3. Draft the smallest correct diagram first.
4. Add semantic grouping with subgraphs / boxes / sections.
5. Add a restrained color palette only after the structure is correct.
6. Validate the exact file you changed.
7. If validation is unavailable, keep syntax conservative and call out that rendering was not verified locally.

## Diagram chooser

- `flowchart` / `graph` — architecture overview, process flow, request pipeline, ownership boundaries
- `sequenceDiagram` — time-ordered service interactions or control flow
- `stateDiagram-v2` — lifecycle/state machine
- `classDiagram` — domain model, interfaces, component relationships
- `erDiagram` — tables/entities and cardinality
- `timeline` — chronology or milestone history
- `gantt` — execution plan, migration plan, rollout schedule
- `mindmap` — scope decomposition or brainstorming
- `journey` — end-user workflow scoring
- `gitGraph` — release flow or branch strategy

## Semantic color guidance

Prefer one consistent palette across the document:

- users / external actors: blue
- authoring or control plane: purple
- runtime / compute / workers: green
- networking / edge / ingress: orange
- data stores / queues / persistence: red
- storage / artifacts / object stores: yellow
- observability / policy / meta systems: gray
- success states: green
- warning / pending states: amber
- failure states: red

Use reusable styles instead of one-off colors wherever possible.

### Flowchart pattern

```mermaid
flowchart LR
  subgraph Clients["Clients"]
    U["Developer"]
  end

  subgraph Control["Control plane"]
    API["Docs API"]
    WF["RFC workflow"]
  end

  subgraph Data["Persistence"]
    DB[("Metadata DB")]
  end

  U --> API --> WF --> DB

  classDef actor fill:#E0F2FE,stroke:#0369A1,color:#0C4A6E;
  classDef control fill:#F5F3FF,stroke:#7C3AED,color:#4C1D95;
  classDef data fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D;

  class U actor;
  class API,WF control;
  class DB data;
```

### Sequence pattern

```mermaid
sequenceDiagram
  box rgba(224, 242, 254, 0.45) User
    actor Author as RFC author
  end
  box rgba(245, 243, 255, 0.55) Control plane
    participant Docs as Docs service
    participant Review as Review workflow
  end
  box rgba(220, 252, 231, 0.55) Runtime
    participant Store as Content store
  end

  Author->>Docs: Submit draft
  Docs->>Review: Start review
  Review->>Store: Persist version
  Store-->>Review: Saved
  Review-->>Docs: Review requested
  Docs-->>Author: Show status
```

## Mermaid gotchas

- Every Mermaid block starts with a diagram type declaration.
- Prefer quoted labels when they contain punctuation.
- Avoid lowercase `end` as an unquoted label.
- In flowcharts, `linkStyle` indexes edges by declaration order.
- Keep the first draft minimal, then style.
- Validate after edits because small typos can break the whole diagram.

## Validation

Always validate Mermaid if `mmdc` is available.

Run the bundled validator from the skill directory:

```bash
node ./scripts/validate-mermaid.js path/to/file.md
node ./scripts/validate-mermaid.js path/to/diagram.mmd
node ./scripts/validate-mermaid.js docs/
node ./scripts/validate-mermaid.js --self-test-styles
```

The validator:
- extracts Mermaid fences from Markdown and MDX
- validates standalone `.mmd` and `.mermaid` files
- reports failing block numbers and approximate source lines
- can self-test styled flowchart, sequence, class, state, and ER examples

## Optional scaffolding helper

Use the template generator when you want a fast, styled starting point:

```bash
node ./scripts/new-mermaid-template.js flowchart
node ./scripts/new-mermaid-template.js sequence --title "RFC review lifecycle"
```

## Finishing rule

Before finalizing Mermaid changes:

1. save the file
2. validate the changed file(s)
3. fix any parse issues
4. re-run validation
5. only then return the final diagram or patch

## References

Read these as needed:
- `references/diagram-types.md` — small working examples for major Mermaid diagram types; use the deeper per-type docs only when a flowchart, ER, or gantt diagram gets complex
- `references/flowchart-keywords.md` — flowchart / graph keywords, edge operators, subgraphs, shapes, and gotchas
- `references/er-keywords.md` — ER relationship syntax, cardinality markers, attributes, keys, and layout
- `references/gantt-keywords.md` — gantt task metadata, dates, dependencies, sections, tags, and exclusions
- `references/rfc-diagram-patterns.md` — doc/RFC-friendly patterns with colors, groups, and recommended use cases
- `references/official-sources.md` — official Mermaid docs and validation notes
