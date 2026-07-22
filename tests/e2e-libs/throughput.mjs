// Tier-1 runner: measure how fast each bundler processes a library WITH unplugin vs a plugin-less
// baseline, across method x phase. Emits report/throughput.md + report/throughput.json.
//
// Metric per cell = one total-bundle-ms WITH the plugin, minus the per-bundler baseline
// (plugin-less bundle of the usage entry). An internal parse-vs-inject split would need to
// instrument unplugin's transform hook and is intentionally out of scope here.
//
// SINGLE RUN PER CELL. There is no repeat/median axis: the differences this suite looks for are
// whole seconds, run-to-run noise is tens of ms, and the repeats cost more than they buy. Read the
// numbers as indicative magnitudes, not as a benchmark.
//
// ONE PROFILE - the whole matrix, every bundler x every phase, ~3.5 min for 147 cells. There used
// to be a `--full` flag guarding it behind a trimmed `smoke` default, because the matrix once cost
// ~50 min; that was almost entirely three's usage-mode scan, and v4 made it ~40x cheaper. The two
// claims the trimming rested on did not survive being re-measured either: overhead is NOT
// bundler-invariant (up to 14x spread on rxjs) and pre+post is ~1.3x a single phase, not ~2x. Only
// `pre ~= post` held. So there is nothing left to justify dropping dimensions - run them all.
//
// Usage:  node throughput.mjs [libFilter] [bundlerFilter]
import { throughputBuilders, THROUGHPUT_BUNDLERS, METHODS, phasesFor, withEntry, u, captureInjections, HERE } from './build.mjs';
import { runnerArgs } from './args.mjs';
import { librariesIn } from './libraries.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [libFilter, bundlerFilter] = runnerArgs(import.meta.url);

const libs = librariesIn('throughput').filter(l => !libFilter || l.name === libFilter);
// a typo'd filter that matches nothing must fail loudly, not write a green empty report
if (!libs.length) throw new Error(`no throughput library matches filter '${ libFilter }'`);
if (bundlerFilter && !THROUGHPUT_BUNDLERS.includes(bundlerFilter)) {
  throw new Error(`no bundler matches filter '${ bundlerFilter }'`);
}

const bundlers = bundlerFilter ? [bundlerFilter] : THROUGHPUT_BUNDLERS;

console.log(`matrix: ${ libs.length } lib(s) x ${ bundlers.length } bundler(s) x every method/phase`);

async function timed(fn) {
  const t0 = process.hrtime.bigint();
  const out = await fn();
  return { ms: Number(process.hrtime.bigint() - t0) / 1e6, out };
}

const rows = [];
let captureFailures = 0; // baseline / inject-capture failures are logged but don't produce a row
for (const lib of libs) {
  // per-(bundler) baseline: plugin-less bundle of the usage entry (no core-js import)
  const baseline = {};
  for (const name of bundlers) {
    try {
      const { ms } = await withEntry(lib.exercise, 'usage-global', `base-${ name }`, e => timed(() => throughputBuilders[name](e, null)));
      baseline[name] = ms;
    } catch (err) {
      baseline[name] = null;
      captureFailures++;
      console.log(`baseline ${ name }: ERROR ${ (err.message || String(err)).slice(0, 120) }`);
    }
  }

  // injection count is bundler-invariant (captureInjections always builds via rollup), but NOT
  // phase-invariant (e.g. usage-pure/pre+post injects one extra module), so capture it once per
  // (method, phase) and reuse across bundlers rather than per cell - each capture is a full
  // rollup+unplugin build. A failed capture is null.
  const injByCell = {};
  for (const method of lib.methods) {
    for (const phase of phasesFor(method)) {
      const key = `${ method }|${ phase ?? '' }`;
      try {
        injByCell[key] = (await captureInjections(lib.exercise, method, phase)).length;
      } catch (err) {
        injByCell[key] = null;
        captureFailures++;
        console.log(`inject-capture ${ method }${ phase ? `/${ phase }` : '' }: ERROR ${ (err.message || String(err)).slice(0, 120) }`);
      }
    }
  }

  for (const name of bundlers) {
    for (const method of lib.methods) {
      for (const phase of phasesFor(method)) {
        const label = `${ lib.name }/${ name }/${ method }${ phase ? `/${ phase }` : '' }`;
        try {
          const injections = injByCell[`${ method }|${ phase ?? '' }`];
          const { ms, out } = await withEntry(lib.exercise, method, `${ name }-${ method }-${ phase ?? 'x' }`,
            e => timed(() => throughputBuilders[name](e, u(name, method, phase))));
          const base = baseline[name];
          const overhead = base === null ? null : +(ms - base).toFixed(1);
          rows.push({
            lib: lib.name, bundler: name, method, phase: phase ?? '',
            ms: +ms.toFixed(1), baseline: base === null ? null : +base.toFixed(1),
            overhead, bytes: out.bytes, injections,
          });
          console.log(`✓ ${ label }: ${ ms.toFixed(0) }ms (overhead ${ overhead ?? '?' }ms, ${ out.bytes }b, ${ injections } inj)`);
        } catch (err) {
          const reason = (err.message || String(err)).split('\n', 1)[0].slice(0, 160);
          rows.push({ lib: lib.name, bundler: name, method, phase: phase ?? '', error: reason });
          console.log(`✗ ${ label }: ${ reason }`);
        }
      }
    }
  }
}

// -------- report --------
const REPORT = join(HERE, 'report');
await mkdir(REPORT, { recursive: true });
await writeFile(join(REPORT, 'throughput.json'), `${ JSON.stringify({ rows }, null, 2) }\n`);

const cells = METHODS.flatMap(m => phasesFor(m).map(p => [m, p ?? '']));
const head = ['bundler', 'entry', 'ug:pre', 'ug:post', 'ug:p+p', 'up:pre', 'up:post', 'up:p+p'];
function find(ln, b, m, p) {
  return rows.find(r => r.lib === ln && r.bundler === b && r.method === m && r.phase === p);
}
function fmt(c) {
  return !c ? '—' : c.error ? 'ERR' : `${ c.overhead ?? c.ms }`;
}
let md = '# Throughput (overhead ms over baseline, single run per cell)\n\n';
md += `Full matrix: ${ libs.length } lib(s) × ${ bundlers.length } bundler(s) × every method/phase.\n\n`;
for (const lib of libs) {
  md += `## ${ lib.name }\n\n| ${ head.join(' | ') } |\n| ${ head.map(() => '---').join(' | ') } |\n`;
  for (const b of bundlers) {
    md += `| ${ b } | ${ cells.map(([m, p]) => fmt(find(lib.name, b, m, p))).join(' | ') } |\n`;
  }
  md += '\n_Cells show unplugin overhead (bundle-with-plugin − plugin-less baseline), in ms. '
    + 'See throughput.json for absolute ms, bytes, injections._\n\n';
}
await writeFile(join(REPORT, 'throughput.md'), md);
console.log(`\nreport → ${ join(REPORT, 'throughput.md') }`);
if (rows.some(r => r.error) || captureFailures) process.exitCode = 1;
