#!/usr/bin/env node
// Creates GitHub issues from plan/issues.json. Dry run unless --apply.
// Usage: GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo node scripts/create-github-issues.mjs [--apply]
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const apply = process.argv.includes('--apply');
const repo = process.env.GITHUB_REPOSITORY || 'assistmarquis-cyber/pattern-audit';
const token = process.env.GITHUB_TOKEN;
const issues = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../plan/issues.json'), 'utf8'));

if (apply && !token) { console.error('GITHUB_TOKEN required with --apply'); process.exit(1); }
for (const i of issues) {
  if (!apply) { console.log(`[dry-run] ${repo}: ${i.title}`); continue; }
  const r = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(i),
  });
  console.log(r.ok ? `created: ${i.title}` : `FAILED (${r.status}): ${i.title}`);
}
