#!/usr/bin/env node

const templates = {
  flowchart: (title = 'Architecture overview') => `---\ntitle: ${title}\n---\nflowchart LR\n  subgraph Users["Users / callers"]\n    U["Author"]\n  end\n\n  subgraph Control["Control plane"]\n    API["Docs API"]\n    WF["Workflow"]\n  end\n\n  subgraph Runtime["Execution"]\n    Worker["Renderer"]\n  end\n\n  subgraph Data["Data"]\n    DB[("Metadata DB")]\n  end\n\n  U --> API --> WF --> Worker --> DB\n\n  classDef actor fill:#E0F2FE,stroke:#0369A1,color:#0C4A6E;\n  classDef control fill:#F5F3FF,stroke:#7C3AED,color:#4C1D95;\n  classDef runtime fill:#DCFCE7,stroke:#16A34A,color:#14532D;\n  classDef data fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D;\n\n  class U actor;\n  class API,WF control;\n  class Worker runtime;\n  class DB data;\n`,
  sequence: (title = 'Request lifecycle') => `---\ntitle: ${title}\n---\nsequenceDiagram\n  box rgba(224, 242, 254, 0.45) User\n    actor Author as RFC author\n  end\n  box rgba(245, 243, 255, 0.55) Control plane\n    participant API as Docs API\n    participant Review as Review workflow\n  end\n  box rgba(220, 252, 231, 0.55) Runtime\n    participant Renderer as Renderer\n  end\n\n  Author->>API: Submit draft\n  API->>Review: Start review\n  Review->>Renderer: Render preview\n  Renderer-->>Review: Preview ready\n  Review-->>API: Status updated\n  API-->>Author: Show review status\n`,
  state: (title = 'Document lifecycle') => `---\ntitle: ${title}\n---\nstateDiagram-v2\n  [*] --> Draft\n  Draft --> Reviewing\n  Reviewing --> Approved\n  Reviewing --> Rejected\n  Approved --> Published\n  Published --> [*]\n\n  classDef waiting fill:#FEF3C7,stroke:#D97706,color:#78350F;\n  classDef success fill:#DCFCE7,stroke:#16A34A,color:#14532D;\n  classDef failure fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D;\n\n  class Draft,Reviewing waiting;\n  class Approved,Published success;\n  class Rejected failure;\n`,
  er: (title = 'RFC data model') => `---\ntitle: ${title}\n---\nerDiagram\n  RFC ||--o{ COMMENT : has\n  RFC ||--o{ APPROVAL : requires\n  RFC {\n    string id\n    string slug\n    string status\n  }\n  COMMENT {\n    string id\n    string rfc_id\n    string author\n  }\n  APPROVAL {\n    string id\n    string rfc_id\n    string reviewer\n  }\n\n  classDef doc fill:#E0F2FE,stroke:#0369A1,color:#0C4A6E;\n  classDef review fill:#F5F3FF,stroke:#7C3AED,color:#4C1D95;\n\n  class RFC doc\n  class COMMENT,APPROVAL review\n`,
  timeline: (title = 'Rollout timeline') => `---\ntitle: ${title}\n---\ntimeline\n  title ${title}\n  section Draft\n    Week 1 : Write problem statement\n           : Circulate initial draft\n  section Review\n    Week 2 : Gather feedback\n    Week 3 : Resolve comments\n  section Ship\n    Week 4 : Approve and publish\n`,
};

function usage() {
  console.log(`Usage:\n  node ./scripts/new-mermaid-template.js <type> [--title \"Custom title\"]\n\nTypes:\n  ${Object.keys(templates).join(', ')}\n`);
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(args.length === 0 ? 1 : 0);
}

const type = args[0];
const titleIndex = args.indexOf('--title');
const title = titleIndex >= 0 ? args[titleIndex + 1] : undefined;

if (!templates[type]) {
  console.error(`Unknown template type: ${type}`);
  usage();
  process.exit(1);
}

process.stdout.write(templates[type](title));
