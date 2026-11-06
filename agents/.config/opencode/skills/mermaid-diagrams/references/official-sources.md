# Official Mermaid sources and validation notes

Primary references used to build this skill:

- Syntax reference: https://mermaid.js.org/intro/syntax-reference.html
- Flowchart: https://mermaid.js.org/syntax/flowchart.html
- Sequence diagram: https://mermaid.js.org/syntax/sequenceDiagram.html
- Class diagram: https://mermaid.js.org/syntax/classDiagram.html
- State diagram: https://mermaid.js.org/syntax/stateDiagram.html
- Entity relationship diagram: https://mermaid.js.org/syntax/entityRelationshipDiagram.html
- Gantt: https://mermaid.js.org/syntax/gantt.html
- Timeline: https://mermaid.js.org/syntax/timeline.html
- Pie: https://mermaid.js.org/syntax/pie.html
- Mindmap: https://mermaid.js.org/syntax/mindmap.html
- User journey: https://mermaid.js.org/syntax/userJourney.html
- Git graph: https://mermaid.js.org/syntax/gitgraph.html
- Theming and colors: https://mermaid.js.org/config/theming.html

Validation notes:

- Prefer local validation with Mermaid CLI (`mmdc`) when available.
- All Mermaid diagrams begin with a diagram type declaration.
- Unknown words and small syntax mistakes can break rendering.
- Flowchart `linkStyle` indexes edges in declaration order.
- `timeline` and `mindmap` are still documented as experimental in official docs.
- ER diagrams can be picky about extra punctuation; simple `class` lines are safest.
- Keep first drafts minimal; add colors and grouping after the structure parses.
