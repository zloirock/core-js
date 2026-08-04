// Pipeline stats: size AND time at every stage of the real IE11 build, per (lib x method).
// Rollup + Babel (syntax down-compile) + unplugin (polyfills). Stages:
//   [A] library bundled, NO transforms      — modern syntax, tree-shaken (the library alone)
//   [B] + Babel -> ES5                       — syntax down-compiled, NO polyfills
//   [C] + unplugin                           — + core-js polyfills = the real IE11 bundle
// For usage-* all three stages are measured; for entry-global only [C] (`import 'core-js'` without
// the plugin is pathological). Also captured: injection count, the Babel-vs-unplugin time split of
// [C], and the minified + gzip "wire size" of [C] (what you'd actually ship).
//
// Usage:  node pipeline.mjs [libFilter] [methodFilter]   ->  report/pipeline.md + report/pipeline.json
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { makeBabelPlugin, u, withEntry, recorder, assertES5, assertNoExternals, assertPayload, strictWarn, wireSize, METHODS, HERE } from './build.mjs';
import { runnerArgs } from './args.mjs';
import { librariesIn } from './libraries.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [libFilter, methodFilter, ...surplus] = runnerArgs(import.meta.url);
if (surplus.length) throw new Error(`unexpected argument(s): ${ surplus.join(' ') } — pipeline.mjs takes [libFilter] [methodFilter]`);
const libs = librariesIn('runtime', libFilter);
if (methodFilter && !METHODS.includes(methodFilter)) throw new Error(`no method matches filter '${ methodFilter }'`);

const UMD = { format: 'umd', name: 'E2E', esModule: false };

async function timedBuild(entry, plugins, label = 'stage') {
  const t0 = process.hrtime.bigint();
  const build = await rollup({ input: entry, plugins, onwarn: strictWarn });
  try {
    const { output } = await build.generate(UMD);
    const [chunk] = output;
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    // shared by every stage and by runtimeBuild: nothing this report measures - least of all [C],
    // whose wire size it publishes - may leave a `require(...)` in the UMD header
    assertNoExternals(chunk, label);
    return { bytes: Buffer.byteLength(chunk.code), ms, code: chunk.code, chunk };
  } finally {
    await build.close();
  }
}

// Wrap a plugin's transform hook to accumulate the time spent inside it (handles sync + async).
// Rollup accepts the hook either as a plain function or in object form `{ order, handler }`
// (unplugin emits the object form), so unwrap it and re-wrap in the shape it came in.
// Rollup transforms sibling modules CONCURRENTLY and both wrapped hooks are async, so summing each
// call's wall-clock would double-count overlapping invocations and charge one plugin for time the
// process spent inside the other. Accumulate the union of busy intervals instead: the clock starts
// when the hook goes idle -> in-flight and stops when the last in-flight call settles. That is a
// "window in which this hook was active", not a strict partition of the build.
function timeTransform(plugin, add) {
  const hook = plugin.transform;
  const orig = typeof hook === 'function' ? hook : hook.handler;
  let inFlight = 0;
  let since = 0n;
  async function timed(code, id) {
    if (inFlight++ === 0) since = process.hrtime.bigint();
    try {
      return await orig.call(this, code, id);
    } finally {
      if (--inFlight === 0) add(Number(process.hrtime.bigint() - since) / 1e6);
    }
  }
  plugin.transform = typeof hook === 'function' ? timed : { ...hook, handler: timed };
  return plugin;
}

// [A] and [B] depend on the LIBRARY only. Neither carries unplugin, and `withEntry` emits the same
// entry body for every usage-* method, so building them per method rebuilt identical bytes twice and
// printed the run-to-run spread between the two as if it were a usage-global vs usage-pure signal.
// Measured once per library and shared, keyed by name.
const stagesByLib = new Map();
async function baseStages(lib) {
  if (stagesByLib.has(lib.name)) return stagesByLib.get(lib.name);
  const label = `${ lib.name }/usage-*`;
  const stages = await withEntry(lib.exercise, 'usage-global', 'pipe-base', async entry => {
    let src = 0;
    const counter = {
      name: 'src-count',
      transform(code) {
        src += Buffer.byteLength(code);
        return null;
      },
    };
    const a = await timedBuild(entry, [counter, nodeResolve(), commonjs()], `${ label } [A]`);
    const b = await timedBuild(entry, [makeBabelPlugin(), nodeResolve(), commonjs()], `${ label } [B]`);
    return { src, A: { bytes: a.bytes, ms: +a.ms.toFixed(0) }, B: { bytes: b.bytes, ms: +b.ms.toFixed(0) } };
  });
  stagesByLib.set(lib.name, stages);
  return stages;
}

async function measure(lib, method) {
  const effPhase = method === 'entry-global' ? undefined : 'post';
  const cell0 = `${ lib.name }/${ method }`;
  return withEntry(lib.exercise, method, `pipe-${ method }`, async entry => {
    const cell = { lib: lib.name, method };

    if (method !== 'entry-global') {
      const { src, A, B } = await baseStages(lib);
      cell.src = src;
      cell.A = A;
      cell.B = B;
    }

    // [C]: Babel + unplugin, instrumented for the babel-vs-unplugin split. Injections are recorded
    // INSIDE this build: a separate captureInjections pass runs unplugin without Babel, and the post
    // phase consumes Babel's helper output, so that pass undercounts by up to 16 specifiers here
    // (three/usage-global: 159 captured vs 175 actually injected).
    let babelMs = 0;
    let unpluginMs = 0;
    const sink = new Set();
    const babel = timeTransform(makeBabelPlugin(), ms => { babelMs += ms; });
    const up = timeTransform(u('rollup', method, effPhase), ms => { unpluginMs += ms; });
    const c = await timedBuild(entry, [babel, nodeResolve(), commonjs(), up, recorder(sink)], `${ cell0 } [C]`);
    cell.injections = sink.size;
    // the count alone is a text proxy - see build.mjs::assertPayload for what it misses
    assertPayload(c.chunk, `${ cell0 } [C]`);
    // runtime.mjs refuses this shape for EVERY method, so this must too - an
    // entry-global carve-out would be both weaker than they are and pointless, since entry-global
    // records 318 injections here.
    if (!sink.size) throw new Error(`${ cell0 }: unplugin injected 0 polyfills into [C]`);
    // [B] == [A] with babelMs ~ 0 is the silent shape of a Babel stage that did nothing; assert the
    // premise directly instead of inferring it from the numbers
    assertES5(c.code, `${ cell0 } [C]`);
    const { min, gz } = await wireSize(c.code, `${ cell0 } [C]`);
    cell.C = {
      bytes: c.bytes, ms: +c.ms.toFixed(0), babelMs: +babelMs.toFixed(0), unpluginMs: +unpluginMs.toFixed(0),
      min, gz,
    };
    return cell;
  });
}

// Warm the toolchain before anything is measured: the first build in the process pays the one-off
// cost of rollup + @babel/core + preset-env + unplugin, and that landed entirely on whichever cell
// happened to run first, making the cross-lib [C] column incomparable.
process.stdout.write('warming the toolchain … ');
await withEntry(libs[0].exercise, 'usage-global', 'warmup',
  entry => timedBuild(entry, [makeBabelPlugin(), nodeResolve(), commonjs(), u('rollup', 'usage-global', 'post')]));
console.log('done');

const rows = [];
for (const lib of libs) {
  for (const method of METHODS) {
    if (methodFilter && method !== methodFilter) continue;
    process.stdout.write(`measuring ${ lib.name }/${ method } … `);
    rows.push(await measure(lib, method));
    console.log('done');
  }
}
// belt and braces: `libs` is non-empty (librariesIn throws otherwise) and `methodFilter` is validated
// against METHODS above, so this cannot fire today. It stays so that a future per-library method
// subset — the registry carried one until 58b4010291 — cannot write a green empty report.
if (!rows.length) throw new Error(`no (library × method) cell matches '${ libFilter ?? '' }' '${ methodFilter ?? '' }'`);

// -------- report --------
function kb(b) {
  return `${ (b / 1024).toFixed(0) } KB`;
}
// A filtered run must not be mistakable for a full one: it overwrites the same report file, and the
// method filter in particular just makes sections vanish. throughput.mjs marks its sibling report the
// same way.
const scope = libFilter || methodFilter
  ? `Filtered run (${ libFilter ?? '*' } × ${ methodFilter ?? '*' }): ${ rows.length } cell(s)`
  : `Full matrix: ${ rows.length } cell(s)`;
let md = '# Pipeline: size and time per stage\n\n'
  + `${ scope }. `
  + 'Rollup + Babel (syntax down-compile) + unplugin, single run. '
  + 'Stages: **[A]** library with no transforms '
  + '(modern, tree-shaken) → **[B]** + Babel (ES5, no polyfills) → **[C]** + unplugin '
  + '(polyfills = the real IE11 bundle). For `entry-global`, only [C]. '
  + '**[A] and [B] depend on the library only** — neither carries unplugin, and the entry is identical '
  + 'for both usage-* methods — so they are measured ONCE per library and the two usage-* rows show '
  + 'the same build. Identical [A]/[B] figures across those two rows are one measurement printed '
  + 'twice, not two that agree. Only [C] is per cell.\n\n';
for (const lib of libs) {
  const cells = rows.filter(r => r.lib === lib.name);
  if (!cells.length) continue;
  md += `## ${ lib.name }\n\n`;
  for (const c of cells) {
    md += `### ${ c.method } — injections: ${ c.injections }\n\n`;
    md += '| stage | size (raw) | time |\n| --- | --- | --- |\n';
    if (c.A) {
      md += `| source loaded (pre-tree-shaking) | ${ kb(c.src) } | — |\n`;
      md += `| [A] no transforms (modern) | ${ kb(c.A.bytes) } | ${ c.A.ms } ms |\n`;
      md += `| [B] + Babel (ES5, no polyfills) | ${ kb(c.B.bytes) } | ${ c.B.ms } ms |\n`;
    }
    md += `| [C] + unplugin (IE11) | ${ kb(c.C.bytes) } | ${ c.C.ms } ms (Babel ${ c.C.babelMs } / unplugin ${ c.C.unpluginMs }) |\n\n`;
    md += `**Wire size of [C]:** minified ${ kb(c.C.min) } · gzip **${ kb(c.C.gz) }**`;
    if (c.A) md += ` — Δ size: Babel ${ (c.B.bytes >= c.A.bytes ? '+' : '') + kb(c.B.bytes - c.A.bytes) } / polyfills +${ kb(c.C.bytes - c.B.bytes) }`;
    md += '\n\n';
  }
}
const REPORT = join(HERE, 'report');
await mkdir(REPORT, { recursive: true });
await writeFile(join(REPORT, 'pipeline.md'), md);
await writeFile(join(REPORT, 'pipeline.json'), `${ JSON.stringify({ scope, rows }, null, 2) }\n`);
console.log(`\nreport → ${ join(REPORT, 'pipeline.md') }`);
