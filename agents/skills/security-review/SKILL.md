---
name: security-review
description: Use when conducting security reviews of code, configuration, dependencies, APIs, auth flows, and data handling for vulnerabilities.
---

# Security Review

## When to use
- Reviewing authentication, authorization, token handling, or session management changes.
- Introducing new external inputs, file uploads, database queries, or command executions.
- Auditing dependencies, secrets handling, container configurations, and CI/CD pipelines.

## Inputs to gather
- Code diff, architecture diagrams, and entry point handlers.
- Data classification: sensitive customer data, PII, financial information, tokens.
- Threat model: untrusted external users, authenticated users, internal service callers.

## Procedure
1. Audit authentication and authorization:
   Verify access controls are enforced on every route and object reference (IDOR checks).
   Ensure authorization checks occur server-side, not solely on client interfaces.
2. Check injection vectors:
   Examine SQL queries, shell executions, HTML templates, and regexes for injection flaws.
   Verify that parameterized queries and safe escaping libraries are employed.
3. Inspect secrets and credentials:
   Verify no API keys, private certificates, or passwords are hardcoded or logged.
   Ensure secrets are loaded strictly from environment variables or secret vaults.
4. Review sensitive data exposure:
   Ensure PII and tokens are redacted from log statements and error messages.
   Check that sensitive payloads are encrypted in transit and at rest.
5. Verify input validation:
   Check boundary lengths, types, and sanitization for all external payloads.
   Confirm rate limits, CSRF/CORS controls, and audit trails are configured.
6. Evaluate dependency risks:
   Check for known vulnerabilities in newly introduced libraries or container base images.
   Avoid pinning to deprecated or unmaintained packages.
7. Format findings:
   List issues ordered by exploitability and impact with clear remediation steps.
   Separate confirmed exploitable vulnerabilities from defense-in-depth hardening suggestions.

## Output / handoff
- Security review report detailing confirmed vulnerabilities, affected assets, attack paths, and remediations.
- Statement of residual risk and components not covered by the review.

## Verification and guardrails
- Never display real secret values, passwords, or customer PII in the security report.
- Distinguish between confirmed exploitable vulnerabilities and defense-in-depth hardening suggestions.
- Do not edit source files during security review; maintain independent read-only evaluation.
- Always report confirmed critical vulnerabilities immediately.
