#!/usr/bin/env node
// Usage: node scripts/utm.mjs <url> <source> <campaign> [medium=social]
const [url, source, campaign, medium = 'social'] = process.argv.slice(2);
if (!url || !source || !campaign) { console.error('usage: utm.mjs <url> <source> <campaign> [medium]'); process.exit(1); }
const u = new URL(url);
u.searchParams.set('utm_source', source);
u.searchParams.set('utm_medium', medium);
u.searchParams.set('utm_campaign', campaign);
console.log(u.toString());
