// Tier-1 runner: measure how fast each bundler processes a library WITH unplugin vs a plugin-less
// baseline, across method x phase. Emits report/throughput.md + report/throughput.json.
//
// Metric per cell = one total-bundle-ms WITH the plugin, minus the per-bundler baseline
// (plugin-less bundle of the usage entry). READ IT AS THE COST OF PRODUCING A POLYFILLED BUILD, not
// as unplugin's own processing time: most of the delta is the bundler resolving, parsing and
// rendering the core-js modules unplugin injected, not the injection itself. pipeline.mjs is where
// the isolated figure lives - it wraps the transform hook itself and reports `unpluginMs` beside
// `babelMs`. Instrumenting the hook here is not possible for the webpack-family adapters anyway, so
// this runner stays a whole-build comparison across bundlers.
//
// SINGLE RUN PER CELL. There is no repeat/median axis - the repeats cost more than they buy. What
// they cannot buy back is the machine's own background load, which is the dominant source of spread
// here: a cell measured while the box is busy reads high, and no amount of in-process repetition
// fixes that. So read a cell as an order of magnitude, and take a RATIO between cells seriously only
// when it is large. Ratios quoted in prose go stale for exactly this reason; the live numbers are in
// report/throughput.{md,json}.
//
// ONE PROFILE - the whole matrix, every bundler x every phase. Overhead is not bundler-invariant and
// pre+post is not a fixed multiple of a single phase, so no dimension here is derivable from another.
//
// Usage:  npm run e2e-libs-throughput [libFilter [bundlerFilter]]
import { throughputBuilders, THROUGHPUT_BUNDLERS, METHODS, phasesFor, withEntry, u, captureInjections, errorReason, HERE } from './build.mjs';
import { librariesIn } from './libraries.mjs';

const { mkdir, writeFile } = fs;
const { join } = path;

const [libFilter, bundlerFilter, ...surplus] = argv._;
if (surplus.length) throw new Error(`unexpected argument(s): ${ surplus.join(' ') } - throughput.mjs takes [libFilter] [bundlerFilter]`);

const libs = librariesIn('throughput', libFilter);
if (bundlerFilter && !THROUGHPUT_BUNDLERS.includes(bundlerFilter)) {
  throw new Error(`no bundler matches filter '${ bundlerFilter }'`);
}

const bundlers = bundlerFilter ? [bundlerFilter] : THROUGHPUT_BUNDLERS;

echo(`matrix: ${ libs.length } lib(s) x ${ bundlers.length } bundler(s) x every method/phase`);

// Warm each bundler before anything is timed. The adapters import their bundler lazily, so the FIRST
// call into one pays that import plus cold JIT - and that first call would otherwise be its BASELINE.
// Subtracting a cold baseline from warm cells understates every overhead and can invert its sign. The
// bias is one-directional and far larger than the run-to-run noise noted above.
async function warmBundlers() {
  for (const name of bundlers) {
    try {
      await withEntry(libs[0].exercise, 'usage-global', `warm-${ name }`,
        e => throughputBuilders[name](e, [u(name, 'usage-global', 'post')]));
    } catch { /* a genuinely broken bundler resurfaces in its baseline below, with a real message */ }
  }
}
await warmBundlers();

// `rollupInjections` is captured via ROLLUP and reused across every bundler's row, so it says nothing
// about what THIS bundler emitted. Without a size check, a bundler whose unplugin adapter stopped
// injecting altogether still reports a plausible overhead and a healthy count - and since the runtime
// tier is rollup-only, nothing else in the suite would notice.
//
// Two things make the comparison trustworthy. First, EQUAL-LENGTH temp-entry labels: webpack, rspack
// and rsbuild embed the entry path in their output, so a longer cell label alone grows the bundle
// enough to satisfy a bare `bytes > baseline` and leave the gate inert. Second, a real MARGIN rather
// than `>`: the margin below sits an order of magnitude under the smallest genuine payload in the
// matrix, so it only has to clear a label-length wobble. Raising it towards a real payload would
// trade a false pass for a false failure.
//
// The size check applies to EVERY method, entry-global included: the baseline is always built from
// the `usage-global` entry (below), which carries no `import 'core-js'`, so the delta against it is
// the whole core-js payload and can collapse to zero when the injection stops happening.
//
// What the size delta cannot catch for entry-global is a bundler-specific dead adapter: there
// `import 'core-js'` survives untransformed and drags the whole library in, so the bundle stays
// large. The count check below covers the plugin-produced-nothing case; neither covers a dead
// adapter on entry-global, and nothing in this runner can - see the report footer.
const LABEL_WIDTH = 32; // longest is `rolldown-usage-global-pre+post` (30); pad both sides of the compare
const MIN_PAYLOAD_BYTES = 10_000;
// one definition for the injByCell key: writing it out at both the producer and the consumer
// invites a typo that would silently yield `undefined` on lookup
function cellKey(method, phase) {
  return `${ method }|${ phase ?? '' }`;
}
// Reported timings are rounded to this, the resolution a single un-repeated cell actually supports.
function round10(n) {
  return Math.round(n / 10) * 10;
}
function assertBundled(bytes, baseBytes, method, rollupInjections) {
  // null means the capture itself threw; 0 means it ran and found nothing - different diagnoses
  if (method === 'entry-global' && !rollupInjections) {
    throw new Error(`rollup capture ${ rollupInjections === null ? 'failed' : 'found 0 injections' } for entry-global`);
  }
  // A missing baseline is not a pass - this gate cannot run without one - but it is not this cell's
  // failure either: the with-plugin build succeeded and its absolute time is worth reporting. Return
  // false so the caller marks the row UNGATED; erroring the cell would throw that measurement away.
  if (baseBytes === undefined) return false;
  if (bytes - baseBytes < MIN_PAYLOAD_BYTES) {
    throw new Error(`no polyfills bundled: ${ bytes }b vs plugin-less baseline ${ baseBytes }b`);
  }
  return true;
}

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
  const baselineBytes = {};
  for (const name of bundlers) {
    try {
      const { ms, out } = await withEntry(lib.exercise, 'usage-global', `base-${ name }`.padEnd(LABEL_WIDTH, '_'), e => timed(() => throughputBuilders[name](e)));
      baseline[name] = ms;
      baselineBytes[name] = Buffer.byteLength(out.code);
    } catch (err) {
      baseline[name] = null;
      captureFailures++;
      echo(`baseline ${ name }: ERROR ${ errorReason(err) }`);
    }
  }

  // injection count is captured via ROLLUP and reused across bundlers - it is not a measurement of
  // what each bundler emitted (the `bytes > baseline` check above is what covers that). So capture it
  // once per (method, phase) and reuse across bundlers rather than per cell - each capture is a full
  // rollup+unplugin build. Keyed by phase too: no fixture currently shows a phase difference, but
  // unplugin does not guarantee phase-invariance and the extra captures are cheap. Failure -> null.
  const injByCell = {};
  for (const method of METHODS) {
    for (const phase of phasesFor(method)) {
      const key = cellKey(method, phase);
      try {
        injByCell[key] = (await captureInjections(lib.exercise, method, phase)).length;
      } catch (err) {
        injByCell[key] = null;
        captureFailures++;
        echo(`inject-capture ${ method }${ phase ? `/${ phase }` : '' }: ERROR ${ errorReason(err) }`);
      }
    }
  }

  for (const name of bundlers) {
    for (const method of METHODS) {
      for (const phase of phasesFor(method)) {
        const label = `${ lib.name }/${ name }/${ method }${ phase ? `/${ phase }` : '' }`;
        try {
          const rollupInjections = injByCell[cellKey(method, phase)];
          const { ms, out } = await withEntry(lib.exercise, method, `${ name }-${ method }-${ phase ?? 'x' }`.padEnd(LABEL_WIDTH, '_'),
            e => timed(() => throughputBuilders[name](e, [u(name, method, phase)])));
          const bytes = Buffer.byteLength(out.code);
          const base = baseline[name];
          // rounded ONCE and then subtracted, so a consumer's `ms - baseline` equals the reported
          // `overhead` (see round10 for why the resolution is 10 ms)
          const roundedMs = round10(ms);
          const roundedBase = base === null ? null : round10(base);
          const overhead = roundedBase === null ? null : roundedMs - roundedBase;
          const gated = assertBundled(bytes, baselineBytes[name], method, rollupInjections);
          rows.push({
            lib: lib.name, bundler: name, method, phase: phase ?? '',
            ms: roundedMs, baseline: roundedBase,
            overhead, gated, bytes, rollupInjections,
          });
          echo(`ok ${ label }: ${ ms.toFixed(0) }ms (overhead ${ overhead ?? '?' }ms, ${ bytes }b, ${ rollupInjections } inj via rollup)`);
        } catch (err) {
          const reason = errorReason(err);
          rows.push({ lib: lib.name, bundler: name, method, phase: phase ?? '', error: reason });
          echo(`FAIL ${ label }: ${ reason }`);
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
  if (!c) return '-';
  if (c.error) return 'ERR';
  // the baseline for this bundler failed, so `ms` is an ABSOLUTE build time. Never let it sit
  // unmarked in a column captioned "overhead" - the only other signal is a log line long scrolled off
  return c.overhead === null ? `${ c.ms }*` : `${ c.overhead }`;
}
let md = '# Throughput (polyfilled-build cost over a plugin-less baseline, ms, single run per cell)\n\n';
md += `${ libFilter || bundlerFilter ? 'Filtered run' : 'Full matrix' }: ${ libs.length } lib(s) x ${ bundlers.length } bundler(s) x every method/phase.\n\n`;
for (const lib of libs) {
  md += `## ${ lib.name }\n\n| ${ head.join(' | ') } |\n| ${ head.map(() => '---').join(' | ') } |\n`;
  for (const b of bundlers) {
    md += `| ${ b } | ${ cells.map(([m, p]) => fmt(find(lib.name, b, m, p))).join(' | ') } |\n`;
  }
  md += '\n_Cells show the POLYFILLED-BUILD COST: bundle-with-plugin minus plugin-less baseline, in ms. '
    + 'That delta is not unplugin\'s own processing time - most of it is the bundler resolving, parsing '
    + 'and rendering the core-js modules unplugin injected (measured on rollup/rxjs/usage-global: '
    + 'unplugin\'s own transform was ~25% of the delta). For unplugin\'s isolated cost see the '
    + '`unpluginMs` field of each row\'s `C` stage in report/pipeline.json, which instruments the '
    + 'transform hook directly. '
    + '`*` = that bundler\'s baseline failed, so the cell is an ABSOLUTE build time, not an overhead - '
    + 'and, since the size gate is a comparison against that same baseline, such a cell is also UNGATED '
    + '(`gated: false` in the JSON): nothing verified that its bundle actually contains the polyfills. '
    + 'The `entry` column shares the usage-entry baseline, so it also carries the cost of bundling the '
    + 'core-js graph that `import \'core-js\'` pulls in - an end-to-end figure, not comparable with the '
    + 'usage columns. See throughput.json for absolute ms, bytes, and `rollupInjections` - captured '
    + 'once via rollup and reused across bundlers, so it is NOT what this bundler emitted; the size '
    + 'gate covers that for every column, though on `entry` it cannot distinguish a dead adapter '
    + '(the entry\'s own `import \'core-js\'` keeps the bundle large either way)._\n\n';
}
await writeFile(join(REPORT, 'throughput.md'), md);
echo(`\nreport -> ${ join(REPORT, 'throughput.md') }`);
if (rows.some(r => r.error) || captureFailures) process.exitCode = 1;
