// Defect metrics calculator — the numbers a test lead reports at the end of a release.
// Run: node defect-metrics.mjs   (uses sample-defects.json)
import { readFileSync } from 'node:fs';
import path from 'node:path';

const file = process.argv[2] ?? path.join(import.meta.dirname, 'sample-defects.json');
const defects = JSON.parse(readFileSync(file, 'utf8'));

const days = (from, to) => Math.max(0, Math.round((new Date(to) - new Date(from)) / 86_400_000));
const pct = (n, total) => (total ? ((n / total) * 100).toFixed(1) + '%' : '—');
const count = (fn) => defects.filter(fn).length;

const open = defects.filter((d) => !['Closed', 'Rejected', 'Duplicate', 'Deferred'].includes(d.status));
const closed = defects.filter((d) => d.status === 'Closed');
const foundInProd = count((d) => d.foundIn === 'production');
const foundInTest = count((d) => d.foundIn !== 'production');
const rejected = count((d) => d.status === 'Rejected' || d.status === 'Duplicate');
const reopened = count((d) => d.reopenCount > 0);

console.log('\n══════════ DEFECT REPORT ══════════\n');

console.log(`Total defects        : ${defects.length}`);
console.log(`Open                 : ${open.length}  (${pct(open.length, defects.length)})`);
console.log(`Closed               : ${closed.length}`);

// ── By severity and priority ─────────────────────────────────────────────────
const by = (field) =>
  defects.reduce((acc, d) => ((acc[d[field]] = (acc[d[field]] ?? 0) + 1), acc), {});
console.log('\nBy severity:'); console.table(by('severity'));
console.log('By priority:'); console.table(by('priority'));

// ── Open critical/major = the release blocker list ───────────────────────────
const blockers = open.filter((d) => ['Critical', 'Major'].includes(d.severity));
console.log(`\n🚨 Release blockers (open Critical/Major): ${blockers.length}`);
blockers.forEach((d) => console.log(`   ${d.id}  [${d.severity}/${d.priority}]  ${d.title}`));

// ── Defect Detection Percentage: did WE find them, or did users? ─────────────
const ddp = (foundInTest / (foundInTest + foundInProd)) * 100;
console.log(`\nDefect Detection Percentage (DDP): ${ddp.toFixed(1)}%`);
console.log(`   found by testing: ${foundInTest} · escaped to production: ${foundInProd}`);
console.log(`   → ${ddp >= 90 ? '✅ good' : '⚠️  too many escapes — where are the gaps?'}`);

// ── Process quality ──────────────────────────────────────────────────────────
console.log(`\nRejected/duplicate reports : ${rejected} (${pct(rejected, defects.length)})` +
  `${rejected / defects.length > 0.15 ? '  ⚠️ high — report quality or requirements clarity problem' : ''}`);
console.log(`Reopened at least once     : ${reopened} (${pct(reopened, defects.length)})` +
  `${reopened / defects.length > 0.1 ? '  ⚠️ high — fixes are not verified before "done"' : ''}`);

// ── Ageing and fix time ──────────────────────────────────────────────────────
const fixTimes = closed.filter((d) => d.closedDate).map((d) => days(d.reportedDate, d.closedDate));
const avgFix = fixTimes.length ? (fixTimes.reduce((a, b) => a + b, 0) / fixTimes.length).toFixed(1) : '—';
console.log(`\nAverage time to close      : ${avgFix} days`);

const today = new Date().toISOString().slice(0, 10);
const ageing = open
  .map((d) => ({ id: d.id, severity: d.severity, ageDays: days(d.reportedDate, today), title: d.title.slice(0, 40) }))
  .sort((a, b) => b.ageDays - a.ageDays);
console.log('\nOldest open defects:'); console.table(ageing.slice(0, 5));

// ── Clustering: where are the bugs? (folder 00, principle 4) ─────────────────
const byModule = defects.reduce((acc, d) => ((acc[d.module] = (acc[d.module] ?? 0) + 1), acc), {});
const sorted = Object.entries(byModule).sort((a, b) => b[1] - a[1]);
console.log('\nDefect clustering by module:');
sorted.forEach(([m, c]) => console.log(`   ${m.padEnd(14)} ${'█'.repeat(c)} ${c}  (${pct(c, defects.length)})`));
console.log(`   → focus extra testing on "${sorted[0][0]}" (defect clustering principle)`);

// ── Release recommendation ───────────────────────────────────────────────────
console.log('\n─────────── RECOMMENDATION ───────────');
if (blockers.length > 0) {
  console.log(`❌ NO-GO: ${blockers.length} open Critical/Major defect(s) must be fixed or formally accepted.`);
} else if (open.length > defects.length * 0.3) {
  console.log('⚠️  GO WITH CAUTION: no blockers, but many open minor defects — agree a fix plan.');
} else {
  console.log('✅ GO: no open Critical/Major defects. Monitor the modules listed above after release.');
}
console.log('');
