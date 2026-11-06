# Format contracts

## PowerPoint

Use a coherent opening, cumulative narrative and purposeful close.
Give each slide one main message and a title that communicates it.
Vary composition between evidence, examples, comparisons and processes instead of repeating identical panels.
Keep charts, tables and simple diagrams editable where feasible.
Place detailed citations or implementation references in notes when they would crowd visible content.
Inspect every final slide individually, including the exported file's text wrapping and element positions.

## PDF

Use consistent page geometry, readable body typography, running headers/footers and page numbering.
Long reports need a useful contents page and bookmarks/internal links when supported.
Distinguish a concise management narrative from complete technical appendices.
Check table continuation, heading orphans, page breaks, diagram resolution and clickable navigation.
Render the final PDF and inspect all pages; text extraction alone does not validate layout.

## Word

Use real heading styles, real lists, editable tables, captions and cross-references.
Generate contents from heading structure where useful.
Preserve the supplied template and document semantics when editing.
Avoid fake headings, image-only body pages, fixed-height table rows and manual space-based alignment.
Render the final DOCX and verify pagination; do not assume a clean XML file looks correct in Word.

## Excel

Separate source data, assumptions, calculations and presentation when that distinction helps auditability.
Use formulas for derived values; preserve dates, numeric types, currencies and units.
Avoid hardcoded result cells where a formula should express the calculation.
Recalculate and check cached formula results, missing values, division by zero and error cells.
Make dashboards traceable to the underlying ranges and label filters, scope and freshness.
Verify chart ranges, totals, print area, freeze panes and number formats; inspect rendered or opened sheets.
Never treat missing values as zero without a justified business rule.

## HTML and prototypes

Use responsive typography, keyboard-accessible navigation and visible focus states.
Every visible button/filter/navigation control must work or be clearly marked unavailable.
Test deep links, empty states, narrow layouts and print/export behaviour when promised.
Use actual supplied screenshots; disclose fictional data and simulated integrations.
Prefer a self-contained artifact for a portable report, and a framework only when its interactions justify one.
Do not publish or connect real accounts merely because the prototype has a submit button.
