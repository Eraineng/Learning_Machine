// Pairwise (all-pairs) test case generator.
// Covers every PAIR of parameter values at least once — usually ~10% of the full grid,
// while catching the large majority of defects (most bugs depend on 1 or 2 factors).
//
//   node pairwise.mjs                 run the built-in example
//   node pairwise.mjs params.json     use your own parameters
import { readFileSync } from 'node:fs';

const example = {
  browser: ['Chrome', 'Firefox', 'Safari'],
  os: ['Windows', 'macOS', 'Linux', 'Android'],
  payment: ['Card', 'PayPal', 'Bank transfer', 'Gift card', 'Crypto'],
  currency: ['EUR', 'USD'],
  loggedIn: ['yes', 'no'],
};

const params = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], 'utf8')) : example;
const keys = Object.keys(params);

// ── All pairs that must be covered ───────────────────────────────────────────
const requiredPairs = new Set();
for (let i = 0; i < keys.length; i++) {
  for (let j = i + 1; j < keys.length; j++) {
    for (const a of params[keys[i]]) {
      for (const b of params[keys[j]]) requiredPairs.add(`${keys[i]}=${a}|${keys[j]}=${b}`);
    }
  }
}

const pairsOf = (testCase) => {
  const out = [];
  for (let i = 0; i < keys.length; i++)
    for (let j = i + 1; j < keys.length; j++)
      out.push(`${keys[i]}=${testCase[keys[i]]}|${keys[j]}=${testCase[keys[j]]}`);
  return out;
};

// ── Greedy algorithm: repeatedly pick the candidate covering the most new pairs ──
const uncovered = new Set(requiredPairs);
const testCases = [];
const CANDIDATES_PER_ROUND = 300;

while (uncovered.size > 0) {
  let best = null;
  let bestScore = -1;

  for (let n = 0; n < CANDIDATES_PER_ROUND; n++) {
    const candidate = Object.fromEntries(
      keys.map((k) => [k, params[k][Math.floor(Math.random() * params[k].length)]]),
    );
    const score = pairsOf(candidate).filter((p) => uncovered.has(p)).length;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  if (bestScore <= 0) break; // safety net
  pairsOf(best).forEach((p) => uncovered.delete(p));
  testCases.push(best);
}

// ── Report ───────────────────────────────────────────────────────────────────
const fullGrid = keys.reduce((total, k) => total * params[k].length, 1);

console.log('\nParameters:');
keys.forEach((k) => console.log(`  ${k.padEnd(10)} ${params[k].length} values: ${params[k].join(', ')}`));

console.log('\nGenerated pairwise test cases:');
console.table(testCases);

console.log(`Full combinatorial grid : ${fullGrid} test cases`);
console.log(`Pairwise set            : ${testCases.length} test cases`);
console.log(`Reduction               : ${(100 - (testCases.length / fullGrid) * 100).toFixed(1)}%`);
console.log(`Pairs to cover          : ${requiredPairs.size}`);
console.log(`Pairs covered           : ${requiredPairs.size - uncovered.size}${uncovered.size ? ` (${uncovered.size} missed!)` : ' ✅ all'}`);
console.log('\n⚠️  Pairwise assumes defects come from single values or pairs. Add cases by hand for');
console.log('   known risky combinations (e.g. Safari + Apple Pay) and for business-critical paths.\n');
