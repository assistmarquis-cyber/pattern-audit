#!/usr/bin/env node
// plan/video-topics.json -> docs/video-scripts/<slug>.txt (teleprompter-ready, ~30-45s)
// Usage: node scripts/make-scripts.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(root, 'plan/video-topics.json'), 'utf8'));
const out = join(root, 'docs/video-scripts');
mkdirSync(out, { recursive: true });

for (const t of cfg.topics) {
  const body = [t.hook, '', ...t.points.flatMap(p => [p, '']), cfg.cta].join('\n');
  const words = body.split(/\s+/).filter(Boolean).length;
  const secs = Math.round(words / 2.5); // ~150 wpm
  writeFileSync(join(out, `${t.slug}.txt`), body + '\n');
  console.log(`${t.slug}: ${words} words, ~${secs}s${secs > 60 ? '  (long: trim for short-form)' : ''}`);
}
