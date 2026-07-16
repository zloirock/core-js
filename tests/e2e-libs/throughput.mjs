// Tier-1 runner: measure how fast each bundler processes a library WITH unplugin vs a plugin-less
// baseline, across method x phase. Emits report/throughput.md + report/throughput.json.
//
// Metric per cell = median of N total-bundle-ms WITH the plugin, minus the per-bundler baseline
// (plugin-less bundle of the usage entry). An internal parse-vs-inject split would need to
// instrument unplugin's transform hook and is intentionally out of scope here.
//
// Usage:  node throughput.mjs [libFilter] [bundlerFilter]     (N via env N=, default 5)
import { throughputBuilders, THROUGHPUT_BUNDLERS, METHODS, phasesFor, withEntry, u, captureInjections, HERE } from './build.mjs';
import { librariesIn } from './libraries.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const N = Number(process.env.N ?? 5);
const [libFilter, bundlerFilter] = process.argv.slice(2);
const libs = librariesIn('throughput').filter(l => !libFilter || l.name === libFilter);
const bundlers = THROUGHPUT_BUNDLERS.filter(b => !bundlerFilter || b === bundlerFilter);
// a typo'd filter that matches nothing must fail loudly, not write a green empty report
if (!libs.length) throw new Error(`no throughput library matches filter '${ libFilter }'`);
if (!bundlers.length) throw new Error(`no bundler matches filter '${ bundlerFilter }'`);

async function median(fn) {
  const times = [];
  let out;
  for (let i = 0; i < N; i++) {
    const t0 = process.hrtime.bigint();
    out = await fn();
    times.push(Number(process.hrtime.bigint() - t0) / 1e6);
  }
  times.sort((a, b) => a - b);
  return { ms: times[Math.floor(times.length / 2)], out };
}

const rows = [];
for (const lib of libs) {
  // per-(bundler) baseline: plugin-less bundle of the usage entry (no core-js import)
  const baseline = {};
  for (const name of bundlers) {
    try {
      const { ms } = await withEntry(lib.exercise, 'usage-global', `base-${ name }`, e => median(() => throughputBuilders[name](e, null)));
      baseline[name] = ms;
    } catch (err) {
      baseline[name] = null;
      console.log(`baseline ${ name }: ERROR ${ (err.message || err).slice(0, 120) }`);
    }
  }

  // injection count is bundler-invariant (captureInjections always builds via rollup), but NOT
  // phase-invariant (e.g. usage-pure/pre+post injects one extra module), so capture it once per
  // (method, phase) and reuse across bundlers. A failed capture is recorded (null), not fatal.
  const injByCell = {};
  for (const method of lib.methods) {
    for (const phase of phasesFor(method)) {
      const key = `${ method }|${ phase ?? '' }`;
      try {
        injByCell[key] = (await captureInjections(lib.exercise, method, phase)).length;
      } catch {
        injByCell[key] = null;
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
            e => median(() => throughputBuilders[name](e, u(name, method, phase))));
          const base = baseline[name];
          const overhead = base === null ? null : +(ms - base).toFixed(1);
          rows.push({
            lib: lib.name, bundler: name, method, phase: phase ?? '',
            ms: +ms.toFixed(1), baseline: base === null ? null : +base.toFixed(1),
            overhead, bytes: out.bytes, injections,
          });
          console.log(`✓ ${ label }: ${ ms.toFixed(0) }ms (overhead ${ overhead ?? '?' }ms, ${ out.bytes }b, ${ injections } inj)`);
        } catch (err) {
          rows.push({ lib: lib.name, bundler: name, method, phase: phase ?? '', error: (err.message || String(err)).split('\n', 1)[0].slice(0, 160) });
          console.log(`✗ ${ label }: ${ (err.message || err).split('\n', 1)[0].slice(0, 160) }`);
        }
      }
    }
  }
}

// -------- report --------
const REPORT = join(HERE, 'report');
await mkdir(REPORT, { recursive: true });
await writeFile(join(REPORT, 'throughput.json'), `${ JSON.stringify({ N, rows }, null, 2) }\n`);

const cells = METHODS.flatMap(m => phasesFor(m).map(p => [m, p ?? '']));
const head = ['bundler', 'entry', 'ug:pre', 'ug:post', 'ug:p+p', 'up:pre', 'up:post', 'up:p+p'];
function find(ln, b, m, p) {
  return rows.find(r => r.lib === ln && r.bundler === b && r.method === m && r.phase === p);
}
function fmt(c) {
  return !c ? '—' : c.error ? 'ERR' : `${ c.overhead ?? c.ms }`;
}
let md = `# Throughput (overhead ms over baseline, median of ${ N })\n\n`;
for (const lib of libs) {
  md += `## ${ lib.name }\n\n| ${ head.join(' | ') } |\n| ${ head.map(() => '---').join(' | ') } |\n`;
  for (const b of bundlers) {
    md += `| ${ b } | ${ cells.map(([m, p]) => fmt(find(lib.name, b, m, p))).join(' | ') } |\n`;
  }
  md += '\n_Cells show unplugin overhead (bundle-with-plugin − plugin-less baseline), in ms. See throughput.json for absolute ms, bytes, injection counts._\n\n';
}
await writeFile(join(REPORT, 'throughput.md'), md);
console.log(`\nreport → ${ join(REPORT, 'throughput.md') }`);
if (rows.some(r => r.error)) process.exitCode = 1;
