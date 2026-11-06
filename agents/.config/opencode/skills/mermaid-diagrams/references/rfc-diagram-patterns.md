# RFC-friendly Mermaid patterns

These patterns are especially useful in technical docs, architecture docs, ADRs, and RFCs.

## 1) System context with ownership groups

Use when the reader first needs to understand boundaries.

```mermaid
flowchart LR
  subgraph External["External actors"]
    User["Developer"]
    CI["CI system"]
  end

  subgraph Control["Control plane"]
    API["RFC API"]
    Review["Review workflow"]
  end

  subgraph Runtime["Execution"]
    Render["Renderer"]
    Index["Indexer"]
  end

  subgraph Data["Persistence"]
    DB[("Metadata DB")]
    Blob[("Object storage")]
  end

  User --> API
  CI --> API
  API --> Review --> Render
  Render --> Blob
  Review --> DB
  Index --> DB

  classDef actor fill:#E0F2FE,stroke:#0369A1,color:#0C4A6E;
  classDef control fill:#F5F3FF,stroke:#7C3AED,color:#4C1D95;
  classDef runtime fill:#DCFCE7,stroke:#16A34A,color:#14532D;
  classDef data fill:#FEF3C7,stroke:#D97706,color:#78350F;

  class User,CI actor;
  class API,Review control;
  class Render,Index runtime;
  class DB,Blob data;
```

Why it works:
- shows ownership and trust boundaries fast
- uses color semantically instead of decoratively
- works well near the top of an RFC

## 2) Request / control flow

Use when the RFC proposes orchestration logic.

```mermaid
sequenceDiagram
  box rgba(224, 242, 254, 0.45) Caller
    actor User as Developer
  end
  box rgba(245, 243, 255, 0.55) Control plane
    participant API as RFC API
    participant Review as Review workflow
  end
  box rgba(220, 252, 231, 0.55) Runtime
    participant Render as Renderer
  end
  box rgba(254, 226, 226, 0.55) Data
    participant DB as Metadata DB
  end

  User->>API: Submit draft
  API->>Review: Validate metadata
  rect rgba(254, 243, 199, 0.35)
    Review->>Render: Render preview
    Render-->>Review: Preview URL
  end
  Review->>DB: Persist state
  DB-->>Review: Ack
  Review-->>API: Review requested
  API-->>User: Show updated status
```

## 3) Lifecycle / state machine

Use when reviewing transitions is the main design risk.

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Reviewing: request review
  Reviewing --> NeedsChanges: reviewer requests changes
  Reviewing --> Approved: reviewer approves
  NeedsChanges --> Draft: author revises
  Approved --> Published: publish
  Published --> [*]

  classDef waiting fill:#FEF3C7,stroke:#D97706,color:#78350F;
  classDef success fill:#DCFCE7,stroke:#16A34A,color:#14532D;
  classDef failure fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D;

  class Draft,Reviewing,NeedsChanges waiting;
  class Approved,Published success;
```

## 4) Data model / approval graph

Use when data ownership and review structure matter.

```mermaid
erDiagram
  RFC ||--o{ RFC_VERSION : has
  RFC ||--o{ COMMENT : has
  RFC ||--o{ APPROVAL : requires
  RFC_VERSION {
    string id
    string rfc_id
    int version
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
    string status
  }
```

## 5) Migration / rollout timeline

Use when the RFC describes phased adoption.

```mermaid
timeline
  title Mermaid adoption plan
  section Phase 1
    Week 1 : Add skill package
           : Validate representative diagrams
  section Phase 2
    Week 2 : Migrate active RFC templates
    Week 3 : Add CI validation
  section Phase 3
    Week 4 : Roll out to wider engineering org
```

## Authoring rules for RFC diagrams

- Prefer one diagram per question. Do not overload a single graphic.
- Put the broadest diagram first, then the deeper ones.
- Keep labels short enough to scan in rendered Markdown.
- Use subgraphs / boxes for ownership, not for decoration.
- If a diagram encodes status, use green/yellow/red consistently across the doc.
- If you need more than ~15 nodes, split the diagram.
