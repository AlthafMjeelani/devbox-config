---
name: interactive-prototyping
description: Create functional clickable HTML or React prototypes, interactive reports and web presentations with realistic navigation and clearly labelled sample data.
---
# Interactive Prototyping

Use `frontend-design` for implementation conventions and `professional-artifact-design` for visual consistency with related documents.
Choose a self-contained HTML report for portable read/filter/navigation tasks; use a framework when state and interactions justify it.

- Define the user flow, screen states and what is simulated before implementing controls.
- Make every presented navigation link, filter, tab and primary button work or visibly mark it unavailable.
- Keep sample data deterministic and labelled; distinguish prototype state from live integrations.
- Support keyboard operation, visible focus, meaningful labels and responsive layouts.
- Test empty results, long labels, invalid inputs and back/forward or deep-link behaviour where relevant.
- Verify printed/exported output when print or export is offered.
- Avoid embedding secrets, enabling external writes or sending real messages as part of a prototype.

Test the actual interactions in the available browser and inspect desktop and narrow viewports.
Do not call a static mockup a working integration or publish it without the user's authorization.
