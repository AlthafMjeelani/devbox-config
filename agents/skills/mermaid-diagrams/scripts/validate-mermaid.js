#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const SUPPORTED_TEXT = new Set(['.md', '.markdown', '.mdx']);
const SUPPORTED_DIAGRAM = new Set(['.mmd', '.mermaid']);
const IGNORED_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build', '.turbo']);

const STYLE_SELF_TESTS = [
  {
    name: 'colored-flowchart',
    code: `flowchart LR
  A[User] --> B[Docs API]
  B --> C[(Document store)]
  classDef actor fill:#E0F2FE,stroke:#0369A1,color:#0C4A6E;
  classDef control fill:#F5F3FF,stroke:#7C3AED,color:#4C1D95;
  classDef data fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D;
  class A actor;
  class B control;
  class C data;
  style B stroke-width:2px
`,
  },
  {
    name: 'colored-sequence',
    code: `sequenceDiagram
    box rgba(224, 242, 254, 0.45) Author
        actor Writer as RFC author
    end
    box rgba(245, 243, 255, 0.55) Docs system
        participant Docs as Docs API
    end
    rect rgba(220, 252, 231, 0.35)
        Writer->>Docs: Submit draft
        Docs-->>Writer: Review started
    end
`,
  },
  {
    name: 'colored-class',
    code: `classDiagram
  class Document {
    +string slug
    +string status
  }
  class ReviewWorkflow {
    +requestReview(doc) void
  }
  class PolicyEngine {
    +validate(doc) Result
  }
  ReviewWorkflow --> Document : operates on
  ReviewWorkflow --> PolicyEngine : calls
  classDef control fill:#F5F3FF,stroke:#7C3AED,color:#4C1D95;
  classDef policy fill:#E5E7EB,stroke:#4B5563,color:#111827;
  classDef artifact fill:#FEF3C7,stroke:#D97706,color:#78350F;
  class ReviewWorkflow control
  class PolicyEngine policy
  class Document artifact
`,
  },
  {
    name: 'colored-state',
    code: `stateDiagram-v2
    [*] --> Draft
    Draft --> Reviewing
    Reviewing --> Approved
    Reviewing --> Rejected
    classDef waiting fill:#FEF3C7,stroke:#D97706,color:#78350F;
    classDef success fill:#DCFCE7,stroke:#16A34A,color:#14532D;
    classDef failure fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D;
    class Draft,Reviewing waiting;
    class Approved success;
    class Rejected failure;
`,
  },
  {
    name: 'colored-er',
    code: `erDiagram
    RFC ||--o{ COMMENT : has
    RFC ||--o{ APPROVAL : requires
    RFC {
        string id
        string slug
    }
    COMMENT {
        string id
    }
    APPROVAL {
        string id
        string reviewer
    }
    classDef doc fill:#E0F2FE,stroke:#0369A1,color:#0C4A6E;
    classDef review fill:#F5F3FF,stroke:#7C3AED,color:#4C1D95;
    class RFC doc
    class COMMENT,APPROVAL review
`,
  },
];

function usage() {
  console.log(`Usage:
  node ./scripts/validate-mermaid.js <path> [more paths...]

Validates Mermaid diagrams in:
- Markdown files (.md, .markdown, .mdx) by extracting mermaid code fences
- Mermaid source files (.mmd, .mermaid)
- Directories recursively

Examples:
  node ./scripts/validate-mermaid.js README.md
  node ./scripts/validate-mermaid.js docs/ architecture/
  node ./scripts/validate-mermaid.js --self-test-styles
  node ./scripts/validate-mermaid.js --self-test-styles references/

Options:
  --self-test-styles  Also render built-in diagrams that exercise semantic colors,
                      boxes, rects, and class/state/ER styling.
`);
}

function hasMmdc() {
  const result = spawnSync('mmdc', ['-V'], { encoding: 'utf8' });
  return result.status === 0;
}

function listFiles(inputPath) {
  const stat = fs.statSync(inputPath);
  if (stat.isFile()) return [inputPath];
  if (!stat.isDirectory()) return [];

  const files = [];
  for (const entry of fs.readdirSync(inputPath, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      files.push(...listFiles(path.join(inputPath, entry.name)));
      continue;
    }
    if (!entry.isFile()) continue;
    files.push(path.join(inputPath, entry.name));
  }
  return files;
}

function isSupported(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_TEXT.has(ext) || SUPPORTED_DIAGRAM.has(ext);
}

function extractMermaidBlocks(markdown, filePath) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^```\s*mermaid(?:\s+.*)?$/.test(trimmed)) {
      const startLine = i + 1;
      const contentLines = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        contentLines.push(lines[i]);
        i += 1;
      }
      blocks.push({
        filePath,
        kind: 'markdown-fence',
        startLine,
        code: contentLines.join('\n').trimEnd() + '\n',
      });
      i += 1;
      continue;
    }

    if (/^:::\s*mermaid(?:\s+.*)?$/.test(trimmed)) {
      const startLine = i + 1;
      const contentLines = [];
      i += 1;
      while (i < lines.length && !/^:::\s*$/.test(lines[i].trim())) {
        contentLines.push(lines[i]);
        i += 1;
      }
      blocks.push({
        filePath,
        kind: 'markdown-directive',
        startLine,
        code: contentLines.join('\n').trimEnd() + '\n',
      });
      i += 1;
      continue;
    }

    i += 1;
  }

  return blocks;
}

function runMmdc(code, nameHint) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mermaid-validate-'));
  const inputPath = path.join(tmpDir, `${nameHint}.mmd`);
  const outputPath = path.join(tmpDir, `${nameHint}.svg`);
  fs.writeFileSync(inputPath, code, 'utf8');

  const result = spawnSync('mmdc', ['-q', '-i', inputPath, '-o', outputPath], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });

  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (_) {}

  return result;
}

function formatSnippet(code) {
  return code
    .split(/\r?\n/)
    .slice(0, 12)
    .map((line, index) => `${String(index + 1).padStart(2, ' ')} | ${line}`)
    .join('\n');
}

function trimError(stderr) {
  if (!stderr) return 'Unknown Mermaid CLI error';
  const lines = stderr.split(/\r?\n/);
  const kept = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.startsWith('Parser.parseError')) break;
    if (line.includes('puppeteer-core')) break;
    if (line.includes('file:///')) break;
    kept.push(line);
    if (kept.length >= 8) break;
  }
  return kept.join('\n') || stderr.trim();
}

function validateMarkdownFile(filePath) {
  const markdown = fs.readFileSync(filePath, 'utf8');
  const blocks = extractMermaidBlocks(markdown, filePath);
  const errors = [];

  if (blocks.length === 0) {
    return { ok: true, checked: 0, errors };
  }

  blocks.forEach((block, index) => {
    const result = runMmdc(block.code, `block-${index + 1}`);
    if (result.status !== 0) {
      errors.push({
        filePath,
        block: index + 1,
        startLine: block.startLine,
        snippet: formatSnippet(block.code),
        error: trimError(result.stderr),
      });
    }
  });

  return {
    ok: errors.length === 0,
    checked: blocks.length,
    errors,
  };
}

function validateDiagramFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const result = runMmdc(code, path.basename(filePath, path.extname(filePath)));
  if (result.status === 0) {
    return { ok: true, checked: 1, errors: [] };
  }

  return {
    ok: false,
    checked: 1,
    errors: [
      {
        filePath,
        block: 1,
        startLine: 1,
        snippet: formatSnippet(code),
        error: trimError(result.stderr),
      },
    ],
  };
}

function validateStyleSelfTests() {
  const errors = [];

  STYLE_SELF_TESTS.forEach((test, index) => {
    const result = runMmdc(test.code, test.name);
    if (result.status !== 0) {
      errors.push({
        filePath: '<style-self-test>',
        block: index + 1,
        startLine: 1,
        name: test.name,
        snippet: formatSnippet(test.code),
        error: trimError(result.stderr),
      });
    }
  });

  return {
    ok: errors.length === 0,
    checked: STYLE_SELF_TESTS.length,
    errors,
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    usage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const runStyleSelfTests = args.includes('--self-test-styles');
  const inputPaths = args.filter((arg) => arg !== '--self-test-styles');

  if (inputPaths.length === 0 && !runStyleSelfTests) {
    usage();
    process.exit(1);
  }

  if (!hasMmdc()) {
    console.error('Error: `mmdc` (Mermaid CLI) is not available on PATH.');
    process.exit(2);
  }

  const filePaths = [];
  for (const input of inputPaths) {
    if (!fs.existsSync(input)) {
      console.error(`Missing path: ${input}`);
      process.exitCode = 2;
      continue;
    }
    for (const filePath of listFiles(input)) {
      if (isSupported(filePath)) filePaths.push(filePath);
    }
  }

  const uniqueFiles = [...new Set(filePaths)].sort();
  if (uniqueFiles.length === 0 && inputPaths.length > 0) {
    console.error('No supported Markdown or Mermaid files found.');
    process.exit(2);
  }

  let totalBlocks = 0;
  let failed = 0;

  if (runStyleSelfTests) {
    const result = validateStyleSelfTests();
    totalBlocks += result.checked;

    if (result.ok) {
      console.log(`OK  <style-self-test> (${result.checked} colored Mermaid block${result.checked === 1 ? '' : 's'})`);
    } else {
      failed += result.errors.length;
      console.log('FAIL <style-self-test>');
      for (const err of result.errors) {
        console.log(`  Block ${err.block} (${err.name})`);
        console.log('  Error:');
        console.log(err.error.split('\n').map((line) => `    ${line}`).join('\n'));
        console.log('  Snippet:');
        console.log(err.snippet.split('\n').map((line) => `    ${line}`).join('\n'));
      }
    }
  }

  for (const filePath of uniqueFiles) {
    const ext = path.extname(filePath).toLowerCase();
    const result = SUPPORTED_TEXT.has(ext)
      ? validateMarkdownFile(filePath)
      : validateDiagramFile(filePath);

    totalBlocks += result.checked;

    if (result.ok) {
      if (result.checked > 0) {
        console.log(`OK  ${filePath} (${result.checked} Mermaid block${result.checked === 1 ? '' : 's'})`);
      }
      continue;
    }

    failed += result.errors.length;
    console.log(`FAIL ${filePath}`);
    for (const err of result.errors) {
      console.log(`  Block ${err.block} starting near line ${err.startLine}`);
      console.log('  Error:');
      console.log(err.error.split('\n').map((line) => `    ${line}`).join('\n'));
      console.log('  Snippet:');
      console.log(err.snippet.split('\n').map((line) => `    ${line}`).join('\n'));
    }
  }

  const checkedTargets = uniqueFiles.length + (runStyleSelfTests ? 1 : 0);

  if (failed > 0) {
    console.error(`\nValidation failed: ${failed} Mermaid block${failed === 1 ? '' : 's'} failed across ${checkedTargets} target${checkedTargets === 1 ? '' : 's'}.`);
    process.exit(1);
  }

  console.log(`\nValidation passed: checked ${totalBlocks} Mermaid block${totalBlocks === 1 ? '' : 's'} across ${checkedTargets} target${checkedTargets === 1 ? '' : 's'}.`);
}

main();
