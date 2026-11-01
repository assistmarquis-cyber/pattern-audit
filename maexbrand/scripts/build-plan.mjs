#!/usr/bin/env node
// Reads plan/tasks.json -> docs/execution-plan.md, plan/maexbrand.ics, plan/issues.json
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const plan = JSON.parse(readFileSync(join(root, 'plan/tasks.json'), 'utf8'));
const start = new Date(plan.start + 'T00:00:00Z');
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
const iso = d => d.toISOString().slice(0, 10);
const ics = d => iso(d).replaceAll('-', '');

const tasks = plan.tasks.map(t => ({ ...t, from: addDays(start, t.startDay), to: addDays(start, t.startDay + t.days) }));

let md = `# ${plan.project} - Execution Plan\n\n_Generated from plan/tasks.json. Do not edit by hand._\n`;
for (const phase of [...new Set(tasks.map(t => t.phase))]) {
  md += `\n## ${phase}\n\n| ID | Task | Owner | Start | Due | Deliverable |\n|---|---|---|---|---|---|\n`;
  for (const t of tasks.filter(x => x.phase === phase))
    md += `| ${t.id} | ${t.title} | ${t.owner} | ${iso(t.from)} | ${iso(addDays(t.to, -1))} | ${t.deliverable} |\n`;
}
writeFileSync(join(root, 'docs/execution-plan.md'), md);

const cal = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MAExbrand//Plan//EN'];
for (const t of tasks)
  cal.push('BEGIN:VEVENT', `UID:${t.id}@maexbrand`, `DTSTAMP:${ics(new Date())}T000000Z`,
    `DTSTART;VALUE=DATE:${ics(t.from)}`, `DTEND;VALUE=DATE:${ics(t.to)}`,
    `SUMMARY:${t.id} ${t.title}`, `DESCRIPTION:${t.deliverable}`, 'END:VEVENT');
cal.push('END:VCALENDAR');
writeFileSync(join(root, 'plan/maexbrand.ics'), cal.join('\r\n') + '\r\n');

writeFileSync(join(root, 'plan/issues.json'), JSON.stringify(tasks.map(t => ({
  title: `${t.id} ${t.title}`,
  body: `**Phase:** ${t.phase}\n**Window:** ${iso(t.from)} to ${iso(addDays(t.to, -1))}\n**Deliverable:** ${t.deliverable}`,
  labels: ['maexbrand', t.phase],
})), null, 2) + '\n');

console.log(`Built plan: ${tasks.length} tasks, ${iso(tasks[0].from)} -> ${iso(addDays(tasks.at(-1).to, -1))}`);
