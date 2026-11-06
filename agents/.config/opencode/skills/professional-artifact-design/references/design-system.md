# Design system

## Choose a visual direction

Start with the audience and business context, then adapt one theme from `../assets/themes.json`.
Brand assets and supplied reference documents take precedence.
Use one primary colour, one accent and a restrained neutral scale; charts may add clearly differentiated series colours.
Use dark surfaces selectively for covers, dividers or closing statements and maintain readable contrast.
Do not apply a universal blue gradient or repeat a card grid on every page.

## Typography and spacing

Use an available readable font such as Aptos, Inter or Arial, with explicit fallbacks.
Prefer 16:9 decks and A4 documents unless the user, supplied template or host format skill requires another geometry.
Useful starting sizes are 28-36 pt slide headings, 18-24 pt slide body and 10.5-12 pt document body.
Format-specific minimums take precedence.
Do not confuse CSS pixels with points: at 96 DPI, 1 pt is 4/3 px.
Shorten copy or change layout before shrinking type to fit.

Use an 8-unit spacing scale for screens/slides, consistent document margins, and aligned content edges.
Keep headings with their following content and captions with their visual.
Allow table rows to grow naturally; repeat table headers across pages.
Use tables only for repeated comparable records, not to box up ordinary prose.
Long source identifiers may need wrapped technical styles, not globally smaller body text.

## Reusable visual roles

- Opening: purpose, audience context and one central message.
- Evidence: chart or table with units, scope, source and interpretation.
- Comparison: aligned categories and consistent denominators.
- Process: labelled stages, direction, responsibility and important failure paths.
- Example: question, relevant inputs, computed result and interpretation.
- Closing: application, decision or next action grounded in the content.

Use named styles/tokens rather than ad hoc formatting.
Maintain semantic colours across formats, including positive, caution and unavailable states.
Do not communicate meaning through colour alone.
Aim for WCAG contrast of 4.5:1 for normal text and 3:1 for large text where applicable.

## Multi-format adaptation

A report supplies depth and navigation; a presentation supplies the argument and evidence; a workbook supplies the calculation model; HTML supplies working exploration.
Reuse the same evidence and definitions while adapting the composition, not copying every paragraph into every format.
Keep technical inventories out of the main deck unless they are necessary for the audience's decision.
