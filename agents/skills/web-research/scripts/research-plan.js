#!/usr/bin/env node

function usage() {
  console.log(`Usage:
  node ./scripts/research-plan.js "<research question>" [--queries N]
  node ./scripts/research-plan.js --self-test

Generates a compact research plan with:
- subquestions
- query angles
- suggested tools and failovers
- evidence checklist
`);
}

function normalizeQuestion(input) {
  return input.replace(/\s+/g, ' ').trim();
}

function pickSubject(question) {
  return question
    .replace(/^how\s+/i, '')
    .replace(/^what\s+/i, '')
    .replace(/^why\s+/i, '')
    .replace(/^when\s+/i, '')
    .replace(/^where\s+/i, '')
    .replace(/^which\s+/i, '')
    .replace(/^is\s+/i, '')
    .replace(/^are\s+/i, '')
    .replace(/^do\s+/i, '')
    .replace(/^does\s+/i, '')
    .replace(/[?]+$/g, '')
    .trim() || 'the topic';
}

function inferType(question) {
  const q = question.toLowerCase();
  if (/(release|changelog|version|what changed|new in)/.test(q)) return 'release';
  if (/(compare|comparison|vs\.?|versus|alternative|build vs buy)/.test(q)) return 'comparison';
  if (/(api|sdk|library|framework|implementation|usage|code)/.test(q)) return 'implementation';
  if (/(rfc|adr|design|architecture|protocol|distributed|distribution|deploy|mcp|plugin|skill)/.test(q)) return 'architecture';
  return 'general';
}

function subquestions(subject, type) {
  const base = [
    `What are the primary definitions and scope of ${subject}?`,
    `Which official sources or repositories are authoritative for ${subject}?`,
    `What important caveats, version constraints, or recency issues affect ${subject}?`,
  ];

  const extras = {
    release: [
      `What changed recently in ${subject}, and when was it published?`,
      `What migration or compatibility notes matter for ${subject}?`,
    ],
    comparison: [
      `How do the main options differ for ${subject}?`,
      `What trade-offs, costs, or risks separate the options in ${subject}?`,
    ],
    implementation: [
      `What APIs, commands, or code patterns are recommended for ${subject}?`,
      `What examples or source references best demonstrate ${subject}?`,
    ],
    architecture: [
      `How is ${subject} packaged, installed, or distributed?`,
      `What interoperability or compatibility constraints matter for ${subject}?`,
    ],
    general: [
      `What evidence supports the main claims about ${subject}?`,
      `What gaps or open questions remain around ${subject}?`,
    ],
  };

  return [...base, ...(extras[type] || extras.general)];
}

function queryAngles(subject, type, count) {
  const variants = {
    architecture: [
      `official documentation for ${subject}`,
      `${subject} distribution installation plugin repository format`,
      `${subject} source repository docs examples`,
      `${subject} compatibility with Claude Code Codex OpenCode Pi`,
      `${subject} release notes or spec updates`,
      `${subject} blog post architecture overview`,
    ],
    implementation: [
      `official API docs for ${subject}`,
      `${subject} source repository examples`,
      `${subject} changelog breaking changes`,
      `${subject} best practices tutorial`,
      `${subject} GitHub issues edge cases`,
      `${subject} benchmark or performance analysis`,
    ],
    comparison: [
      `${subject} official documentation`,
      `${subject} comparison trade-offs`,
      `${subject} migration guide alternatives`,
      `${subject} case study benchmark`,
      `${subject} pricing or operational model`,
      `${subject} independent review analysis`,
    ],
    release: [
      `${subject} release notes`,
      `${subject} changelog official docs`,
      `${subject} migration guide`,
      `${subject} breaking changes`,
      `${subject} GitHub releases`,
      `${subject} community upgrade notes`,
    ],
    general: [
      `official documentation for ${subject}`,
      `${subject} source repository docs`,
      `${subject} recent updates`,
      `${subject} technical overview`,
      `${subject} independent deep dive`,
      `${subject} caveats limitations`,
    ],
  };

  return (variants[type] || variants.general).slice(0, Math.max(1, Math.min(count, 8)));
}

function renderPlan(question, count) {
  const normalized = normalizeQuestion(question);
  const subject = pickSubject(normalized);
  const type = inferType(normalized);
  const questions = subquestions(subject, type);
  const angles = queryAngles(subject, type, count);

  return `# Research plan

## Goal
${normalized}

## Suggested subquestions
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

## Query set
${angles.map((q, i) => `${i + 1}. ${q}`).join('\n')}

## Tool order
1. Exa for semantic discovery and official-source finding
2. Parallel search or batched multi-query search for breadth
3. Perplexity for synthesis and cross-checking
4. Page fetch/read for exact details and citations
5. Code/doc search if implementation details matter

## Failover
- No Exa -> use Perplexity search or batched web search, then fetch exact pages
- No parallel search -> run 3-6 distinct queries manually; avoid near-duplicates
- No Perplexity -> synthesize from Exa + fetched pages and cite exact URLs
- Code-heavy topic -> add code/doc search and official API docs

## Evidence checklist
- Prefer official docs, specs, repos, release notes
- Capture publication date when recency matters
- Separate facts from interpretation
- Use at least two sources for consequential claims
- Track open questions instead of guessing
`;
}

function selfTest() {
  const sample = renderPlan('How are Claude plugins, Codex skills, OpenCode skills, Pi skills, and MCP servers distributed?', 5);
  const required = [
    '# Research plan',
    '## Goal',
    '## Query set',
    'Exa',
    'Perplexity',
    'Failover',
    'Evidence checklist',
  ];

  const missing = required.filter((text) => !sample.includes(text));
  if (missing.length > 0) {
    console.error(`Self-test failed. Missing: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log('research-plan.js self-test passed');
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    usage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  if (args.includes('--self-test')) {
    selfTest();
    return;
  }

  const countIndex = args.indexOf('--queries');
  const count = countIndex >= 0 ? Number(args[countIndex + 1]) : 5;
  const question = args.filter((arg, index) => index !== countIndex && index !== countIndex + 1).join(' ').trim();

  if (!question) {
    usage();
    process.exit(1);
  }

  process.stdout.write(renderPlan(question, Number.isFinite(count) ? count : 5));
}

main();
