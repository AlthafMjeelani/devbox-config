---
name: technical-documentation
description: Build explanatory system reports, architecture guides and integration documentation grounded in implementation evidence, with workflows and practical examples.
---
# Technical Documentation

Use `documentation` for repository conventions and `professional-artifact-design` for a shareable business/technical artifact.
Read the relevant implementation before claiming a capability.
For API work, compose with the installed API engineering skill rather than inventing request or response contracts.

- Explain purpose and audience first, then the system boundary, major components and data flow.
- Separate source systems, application metadata, transformation layers, reporting stores and document stores where applicable.
- Describe connection, authentication, discovery, configuration, validation, publication and refresh as distinct stages.
- Put module purpose, data inputs, facts, dimensions, metrics and example questions/answers together.
- Explain table grain and supported joins; identify fan-out and snapshot-versus-flow interpretation risks.
- Use tested examples or explicitly labelled illustrations and preserve useful error/limitation responses.
- Document the failure and recovery behaviour supported by the implementation; do not invent retries or failover.
- Keep complete schemas, inventories and source references navigable in appendices.

Distinguish repository capability from deployed capability and successful live verification.
Do not expose credentials or internal-only details to an external audience.
