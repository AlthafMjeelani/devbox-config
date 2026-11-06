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

## Premium PowerPoint standard

Apply this section to every presentation, whether it is new or being revised.
Do not treat a plain white slide with text as a finished professional presentation.
Give every slide an intentional composition that fits its message and audience.

- Match backgrounds to the business context and brand.
- Alternate light and dark sections deliberately, use subtle texture or shapes only when they support the content, and maintain strong contrast.
- Choose visual forms that explain the information: connected diagrams for processes, layered diagrams for architecture, comparisons for alternatives, charts for supported measures, timelines for milestones, and annotated steps for instructions.
- Vary the layouts across a deck. Use editorial openings, split screens, full-width evidence, process views, comparison layouts, examples, and section transitions where appropriate.
- Do not repeat a generic card grid or turn every subject into bullets.
- Use relevant diagrams, illustrations, icons, or screenshots when they improve understanding. Avoid decorative stock imagery and invented evidence.
- Use a consistent font system, strong headline hierarchy, readable body text, concise labels, and balanced whitespace. Fix wrapping and crowding by shortening copy or changing the layout before reducing type size.
- Use brand-aligned colour and restrained visual texture without reducing legibility. Colour must not be the only way information is distinguished.

### Mandatory visual review for presentations

Do not deliver a presentation before reviewing the exported deck visually.

1. Render every slide from the final exported file.
2. Create and inspect a contact sheet for deck-level rhythm and repeated layouts.
3. Inspect every slide at full size for hierarchy, readability, tiny text, unused space, wrapping, clipping, overlap, contrast, and diagram accuracy.
4. Identify and improve slides that look repetitive, sparse without purpose, crowded, or like a document page pasted into PowerPoint.
5. Render again after layout changes and inspect the revised slides and contact sheet.
6. Run the format-specific overflow or structural checks available, and report any check that could not run.

The final deck must be professional, brand-consistent, easy to understand, client-ready, and free of unintended clipping and overlap.
Keep sample data clearly labelled and distinct from verified live results.

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
