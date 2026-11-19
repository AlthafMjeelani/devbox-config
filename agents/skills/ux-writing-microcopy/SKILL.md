---
name: ux-writing-microcopy
description: Write clear interface text: buttons, labels, errors, empty states, onboarding and confirmations. Use when copy in a UI is vague, inconsistent or unhelpful.
---

# UX writing and microcopy

## Principles
- Clear over clever. Say what happens, in the user's words, in as few words as possible.
- Buttons are verb plus object ("Save changes", "Delete project"), never "OK" or "Submit".
- Sentence case. Consistent terms: one name per concept across the product.
- Active voice, present tense, no jargon, no blame.

## Patterns
- Errors: what went wrong, why if useful, how to fix it. Never show raw codes alone.
- Empty states: explain the value, give one primary action.
- Destructive confirmations: name the thing and the consequence; the button repeats the action.
- Placeholders are examples, not labels. Help text appears before the error, not after.
- Loading and success: tell users what is happening and what changed.

## Check
- Read every string out of context. Cut words until meaning breaks, then add one back.
- Keep strings externalized for i18n; avoid concatenated sentences.

Related: `design-critique`, `web-accessibility-audit`.
