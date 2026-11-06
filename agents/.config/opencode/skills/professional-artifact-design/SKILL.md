---
name: professional-artifact-design
description: Create or redesign polished business deliverables across PPTX, PDF, DOCX, XLSX and HTML with a shared visual system, meaningful content and rendered quality checks.
---
# Professional Artifact Design

Use this as the design and communication layer over the host's installed format-specific skills.
Preserve the requested formats, audience, source evidence and editability.
For an existing artifact, inspect its content and rendering before deciding whether to refine or redesign it.

## Ground and structure

- Establish who will read or present the result and what they should understand or do.
- Read the actual sources; keep verified facts, assumptions, illustrative figures and unavailable capabilities distinct.
- Organise content around the audience's questions, not a source-file dump.
- For capability reports, group each module's purpose, facts, dimensions, metrics, questions and sample answers together.
- Put detailed inventories and implementation references in navigable appendices; the main narrative must explain their significance.
- Use `content-storytelling` for substantial narrative work, `business-presentation` for decks, or `educational-content` for training.

## Design deliberately

Read [references/design-system.md](references/design-system.md) and select a coherent theme before authoring.
Use the user's brand or reference design when supplied; otherwise select a palette from [assets/themes.json](assets/themes.json).
Record the chosen font, colour, type scale, spacing, table, chart and page-furniture tokens in the task workspace.
Apply the same semantic colours and terms across all requested formats.
Adapt density to the medium: a slide is not a reduced report page.
Colour and decoration alone do not create hierarchy or explain a business insight.

- Use a small set of layout families: opening, evidence, comparison, process, example and closing.
- Prefer editable native tables, charts, headings and simple diagrams when supported by the format skill.
- Use diagrams to explain relationships or workflows, and charts to communicate supported data; do not fill space with invented graphics.
- Use `data-visualization`, `infographic-diagram` or `screenshot-documentation` only when their content is actually needed.
- Keep examples close to the concept they explain; label all fictional values at the point of use.

## Build in the right format

Read only the relevant sections of [references/formats.md](references/formats.md).
Discover the installed PPTX, PDF, document, spreadsheet and frontend skills before choosing a library.
Follow the host's required authoring tools and runtime; this pack does not override them.
Use `technical-documentation` for technical content and `interactive-prototyping` for functioning web interactions.
An unavailable library is a tooling problem to report or resolve, not permission to rename an HTML file to .pdf or .pptx.
Optional upstream resources are documented in [references/tooling.md](references/tooling.md); do not assume plugins are installed.

## Review the final artifact

Apply `artifact-quality-review` to the exact final files.
Render every page or slide, inspect readability and layout, validate calculations and test navigation or interaction where present.
Re-render after any layout-sensitive change.
Distinguish structural checks from visual review and actual product acceptance tests.
If a required check cannot run, state the limitation without implying it passed.

Return the requested files with a short description of contents and material validation limits.
Keep builders, previews, source notes and review logs in the task workspace rather than attaching them by default.
