#!/usr/bin/env node
// Checks a static site dir: required files, titles, local links/assets, leftover TODOs (warning only).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dir = resolve(process.argv[2] || 'site');
let errors = 0, warns = 0;
const err = m => { console.error('ERROR ' + m); errors++; };
const pages = readdirSync(dir).filter(f => f.endsWith('.html'));
if (!pages.includes('index.html')) err('missing index.html');

for (const p of pages) {
  const html = readFileSync(join(dir, p), 'utf8');
  if (!/<title>[^<]+<\/title>/.test(html)) err(`${p}: missing <title>`);
  if (!/<meta name="viewport"/.test(html)) err(`${p}: missing viewport meta`);
  for (const m of html.matchAll(/(?:href|src|action)="([^"#?]+)[^"]*"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:)/.test(u)) continue;
    const target = join(dir, u === '/' ? 'index.html' : u.replace(/^\//, ''));
    if (!existsSync(target)) err(`${p}: broken local reference ${u}`);
  }
  const todos = (html.match(/TODO/g) || []).length;
  if (todos) { console.warn(`WARN  ${p}: ${todos} TODO placeholder(s)`); warns++; }
}
console.log(`${pages.length} page(s), ${errors} error(s), ${warns} warning(s)`);
process.exit(errors ? 1 : 0);
