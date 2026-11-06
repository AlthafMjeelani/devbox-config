# Source quality rules for technical research

## Evidence ranking

Prefer sources in roughly this order:

1. Official specs and official documentation
2. Source repositories and code comments
3. Release notes, changelogs, migration guides
4. Vendor engineering blogs
5. High-quality third-party deep dives
6. Community Q&A, forums, or social posts

## What counts as a strong citation

Strong:
- official documentation page
- spec section
- release note entry
- GitHub source file or issue comment from maintainers

Weaker:
- secondary blog without direct citations
- AI-generated summary without linked sources
- forum thread with no maintainer confirmation

## Recency rules

Recency matters for:
- installation steps
- CLI flags
- transport recommendations
- version-specific behavior
- pricing, limits, availability

When recency matters, record:
- source date if available
- version number if available
- whether the advice is current or historical

## Writing rules for RFC inputs

- Separate facts, inferences, and recommendations.
- Use exact product / protocol names.
- Call out where sources disagree.
- Preserve uncertainty instead of smoothing it away.
- Record open questions that need validation.

## Minimal evidence standard

Before making a consequential recommendation, have at least:
- one official source, and
- one corroborating source or direct implementation reference
