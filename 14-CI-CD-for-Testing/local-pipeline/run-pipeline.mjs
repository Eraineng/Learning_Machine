// A pipeline you can run on your own machine — the same idea CI uses:
// ordered stages, fail fast, timing, and a summary report.
//
//   node run-pipeline.mjs            run the default stages
//   node run-pipeline.mjs --all      include the slow stages (browsers)
//   node run-pipeline.mjs --list     just show the plan
import { spawn } from 'node:child_process';
import path from 'node:path';
import { existsSync } from 'node:fs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

/** Stages run in order; everything inside a stage runs in parallel (like CI jobs). */
const PIPELINE = [
  {
    stage: '1 · Fast feedback',
    jobs: [
      { name: 'unit tests', dir: '08-Unit-Testing/unit-project', cmd: 'npx vitest run' },
      { name: 'test data tests', dir: '09-Test-Data-Management/data-project', cmd: 'npx vitest run' },
    ],
  },
  {
    stage: '2 · Service level',
    jobs: [
      { name: 'integration tests', dir: '04-Integration-Testing/integration-project', cmd: 'npx vitest run' },
      { name: 'contract tests', dir: '10-Contract-Testing/contract-project', cmd: 'npx vitest run' },
      { name: 'security tests', dir: '05-Security-Testing/security-project', cmd: 'npx vitest run' },
      { name: 'sql data checks', dir: '02-SQL-for-QA/sql-project', cmd: 'npx vitest run' },
      { name: 'flight booking lab', dir: '03-Interview-Prep/flight-booking-lab', cmd: 'npx vitest run' },
      { name: 'postman (newman)', dir: '01-API-Testing/05-Postman-and-Newman', cmd: 'npx newman run collections/qa-practice.postman_collection.json -e collections/qa-practice.postman_environment.json' },
    ],
  },
  {
    stage: '3 · Browser (slow)',
    slow: true,
    jobs: [
      { name: 'api tests', dir: '01-API-Testing/03-Playwright-API-Tests', cmd: 'npx playwright test' },
      { name: 'a11y tests', dir: '11-Accessibility-Testing/a11y-project', cmd: 'npx playwright test' },
      { name: 'visual tests', dir: '12-Visual-Regression-Testing/visual-project', cmd: 'npx playwright test' },
      { name: 'e2e tests', dir: '07-Playwright-UI-Automation/playwright-project', cmd: 'npx playwright test' },
    ],
  },
];

const args = process.argv.slice(2);
const runSlow = args.includes('--all');

function runJob(job) {
  const cwd = path.join(ROOT, job.dir);
  const start = Date.now();

  if (!existsSync(path.join(cwd, 'node_modules'))) {
    return Promise.resolve({ ...job, status: 'skipped', reason: 'npm install not run in this folder', ms: 0 });
  }

  return new Promise((resolve) => {
    const child = spawn(job.cmd, { cwd, shell: true, stdio: 'pipe' });
    let output = '';
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('close', (code) =>
      resolve({ ...job, status: code === 0 ? 'passed' : 'failed', ms: Date.now() - start, output }),
    );
  });
}

if (args.includes('--list')) {
  for (const { stage, jobs, slow } of PIPELINE) {
    console.log(`\n${stage}${slow ? ' (needs --all)' : ''}`);
    jobs.forEach((j) => console.log(`   • ${j.name.padEnd(20)} ${j.dir}`));
  }
  process.exit(0);
}

const results = [];
const pipelineStart = Date.now();

for (const { stage, jobs, slow } of PIPELINE) {
  if (slow && !runSlow) {
    console.log(`\n⏭  ${stage} — skipped (run with --all to include browser tests)`);
    continue;
  }

  console.log(`\n▶ ${stage}`);
  // Jobs inside a stage run in PARALLEL, exactly like CI jobs without `needs`
  const stageResults = await Promise.all(jobs.map(runJob));

  for (const r of stageResults) {
    const icon = { passed: '✅', failed: '❌', skipped: '⏭ ' }[r.status];
    console.log(`   ${icon} ${r.name.padEnd(20)} ${(r.ms / 1000).toFixed(1)}s ${r.reason ?? ''}`);
    results.push(r);
  }

  // FAIL FAST: a broken stage stops the pipeline — no point running slow tests
  if (stageResults.some((r) => r.status === 'failed')) {
    console.log(`\n🛑 Stage "${stage}" failed — stopping the pipeline (fail fast).`);
    for (const r of stageResults.filter((x) => x.status === 'failed')) {
      console.log(`\n──── ${r.name} output (last 25 lines) ────`);
      console.log(r.output.trim().split('\n').slice(-25).join('\n'));
    }
    break;
  }
}

// ── Summary report (what CI shows at the top of a run) ────────────────────────
const passed = results.filter((r) => r.status === 'passed').length;
const failed = results.filter((r) => r.status === 'failed').length;
const skipped = results.filter((r) => r.status === 'skipped').length;

console.log('\n' + '═'.repeat(56));
console.log(`PIPELINE ${failed ? '❌ FAILED' : '✅ PASSED'}   ` +
  `${passed} passed · ${failed} failed · ${skipped} skipped · ${((Date.now() - pipelineStart) / 1000).toFixed(1)}s total`);
console.log('═'.repeat(56));
console.table(results.map((r) => ({ job: r.name, status: r.status, seconds: (r.ms / 1000).toFixed(1) })));

process.exit(failed ? 1 : 0);
