# Mermaid diagram types for tech docs and RFCs

These examples are designed to be copied into Markdown docs, RFCs, ADRs, and architecture notes. Start small, then style.

For most work, this file is enough. Only open the deeper per-type references when you are building a more complex diagram or need exact keyword semantics:

- `flowchart` / `graph` -> `references/flowchart-keywords.md`
- `erDiagram` -> `references/er-keywords.md`
- `gantt` -> `references/gantt-keywords.md`

## 1) Flowchart / graph

Use for system context, component overview, request path, or decision tree.

```mermaid
flowchart TD
  subgraph Clients["Clients"]
    A["Developer"] --> B{"Authorized?"}
  end

  subgraph Control["Docs platform"]
    C["RFC service"]
    D["Review workflow"]
  end

  subgraph Data["Persistence"]
    E[("Content DB")]
  end

  B -->|Yes| C
  B -->|No| F["Return 403"]
  C --> D --> E

  classDef actor fill:#E0F2FE,stroke:#0369A1,color:#0C4A6E;
  classDef control fill:#F5F3FF,stroke:#7C3AED,color:#4C1D95;
  classDef data fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D;
  classDef failure fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D;

  class A actor;
  class C,D control;
  class E data;
  class F failure;
```

Notes:
- Great default choice for architecture diagrams.
- Use `subgraph` for trust boundaries, ownership boundaries, or data/control planes.
- Use `classDef` + `class` for semantic grouping.

## 2) Sequence diagram

Use for request lifecycle, review workflow, or cross-service coordination.

```mermaid
sequenceDiagram
  box rgba(224, 242, 254, 0.45) Author
    actor User as RFC author
  end
  box rgba(245, 243, 255, 0.55) Control plane
    participant API as Docs API
    participant Review as Review workflow
  end
  box rgba(220, 252, 231, 0.55) Runtime
    participant Renderer as Preview renderer
  end

  User->>API: Submit draft
  API->>Review: Open review
  rect rgba(254, 243, 199, 0.35)
    Review->>Renderer: Render preview
    Renderer-->>Review: Preview URL
  end
  Review-->>API: Status updated
  API-->>User: Show review status
```

Notes:
- Prefer this for time-ordered interactions.
- `box rgba(...)` groups participants by boundary.
- `rect rgba(...)` highlights a phase.

## 3) State diagram

Use for lifecycle docs: document state, deployment state, approval state, or background-job state.

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Reviewing
  Reviewing --> Approved
  Reviewing --> Rejected
  Approved --> Published
  Published --> [*]

  classDef waiting fill:#FEF3C7,stroke:#D97706,color:#78350F;
  classDef success fill:#DCFCE7,stroke:#16A34A,color:#14532D;
  classDef failure fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D;

  class Draft,Reviewing waiting;
  class Approved,Published success;
  class Rejected failure;
```

Notes:
- Good for approval or rollout status.
- Use yellow for in-progress states, green for stable/success, red for failure.

## 4) Class diagram

Use for conceptual domain models, services, interfaces, or policy engines.

```mermaid
classDiagram
  class Document {
    +string slug
    +string status
  }

  class ReviewWorkflow {
    +requestReview(doc) void
  }

  class PolicyEngine {
    +validate(doc) Result
  }

  ReviewWorkflow --> Document : operates on
  ReviewWorkflow --> PolicyEngine : calls

  classDef artifact fill:#FEF3C7,stroke:#D97706,color:#78350F;
  classDef control fill:#F5F3FF,stroke:#7C3AED,color:#4C1D95;
  classDef policy fill:#E5E7EB,stroke:#4B5563,color:#111827;

  class Document artifact
  class ReviewWorkflow control
  class PolicyEngine policy
```

## 5) ER diagram

Use for schema or persistence design in an RFC.

```mermaid
erDiagram
  RFC ||--o{ COMMENT : has
  RFC ||--o{ APPROVAL : requires
  RFC {
    string id
    string slug
    string status
  }
  COMMENT {
    string id
    string rfc_id
    string author
  }
  APPROVAL {
    string id
    string rfc_id
    string reviewer
  }

  classDef doc fill:#E0F2FE,stroke:#0369A1,color:#0C4A6E;
  classDef review fill:#F5F3FF,stroke:#7C3AED,color:#4C1D95;

  class RFC doc
  class COMMENT,APPROVAL review
```

Notes:
- Keep entity names singular.
- Use cardinality carefully.

## 6) Timeline

Use for pure chronology or phased adoption.

```mermaid
timeline
  title RFC rollout plan
  section Draft
    Week 1 : Write proposal
           : Share first draft
  section Review
    Week 2 : Gather comments
    Week 3 : Resolve concerns
  section Adoption
    Week 4 : Publish approved RFC
```

## 7) Gantt

Use for multi-workstream rollout plans.

```mermaid
gantt
  title Docs platform rollout
  dateFormat  YYYY-MM-DD

  section Authoring
  Draft RFC              :done, draft, 2026-06-01, 2d
  Internal review        :active, review, after draft, 4d

  section Execution
  Build preview support  :preview, after review, 3d
  Publish docs           :milestone, publish, after preview, 1d
```

## Quick chooser

- system overview -> `flowchart`
- ordered interactions -> `sequenceDiagram`
- lifecycle -> `stateDiagram-v2`
- domain model -> `classDiagram`
- schema -> `erDiagram`
- chronology -> `timeline`
- schedule -> `gantt`
