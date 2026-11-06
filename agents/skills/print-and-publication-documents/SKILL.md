---
name: print-and-publication-documents
description: Generate print-quality documents programmatically - invoices, quotations, brochures and multi-column reports - with Typst, LaTeX or WeasyPrint.
---

# Print and Publication Documents

## Pick the engine
- **Typst**: fastest, modern syntax, great for invoices/reports from JSON (`sys.inputs`, `json("data.json")`). Default choice.
- **LaTeX**: complex math, journals, bibliographies (`latexmk -pdf`).
- **WeasyPrint**: HTML/CSS to PDF; reuse web templates, `@page` rules, CSS paged media.

## Workflow
1. Separate data (JSON/YAML) from template. Template renders any data set.
2. Define page: size (A4), margins, header/footer, page numbers, fonts (embed them).
3. Build reusable components: letterhead, line-item table, totals, signature block, multi-column body.
4. Render in CI/Makefile: `typst compile invoice.typ out.pdf --input data=data.json`.

## Document types
- **Invoice/quotation**: number, dates, bill-to, line items (qty, unit, tax), subtotal/tax/total, payment terms, validity period. Compute totals in code, round once, show currency.
- **Brochure**: bleed 3 mm, image 300 dpi, consistent grid, 2-3 columns.
- **Report**: title page, TOC, numbered headings, figure/table captions, running headers.

## Checks
Open the PDF and inspect every page; fonts embedded (`pdffonts`); totals match source data; no overflowed tables or orphaned headings.
