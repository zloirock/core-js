// Pipeline stats: size AND time at every stage of the real IE11 build, per (lib x method).
// Rollup + Babel (syntax down-compile) + unplugin (polyfills). Stages:
//   [A] library bundled, NO transforms      - modern syntax, tree-shaken (the library alone; for a
//                                             TS-source library, types erased and nothing else - see
//                                             makeTsStripPlugin in build.mjs)
//   [B] + Babel -> ES5                       - syntax down-compiled, NO polyfills
//   [C] + unplugin                           - + core-js polyfills = the real IE11 bundle
// For usage-* all three stages are measured; for entry-global only [C] (`import 'core-js'` without
// the plugin is pathological). Also captured: injection count, how long each transform hook of [C]
// had work in flight, and the minified + gzip "wire size" of [C] (what you'd actually ship).
//
// Usage:  npm run e2e-libs-pipeline [libFilter [methodFilter]]  ->  report/pipeline.{md,json}
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {
  makeBabelPlugin, makeTsStripPlugin, tsSources, u, withEntry, recorder, isLibraryModule, describeInput,
  assertNoExternals, assertPayload, strictWarn, wireSize, METHODS, TS_EXTENSION, UMD_OUTPUT, HERE,
} from './build.mjs';
import { positionals } from './cli.mjs';
import { errorReason } from './diagnostics.mjs';
import { librariesMatching } from './libraries.mjs';

const { mkdir, writeFile } = fs;
const { join } = path;

// the same net the other two runners carry, for the same reason: node dumps an unclaimed rejection
// raw, which for anything without a `message` is `[object Object]`, and the original travels on as
// `cause` so the stack survives the line
process.on('unhandledRejection', reason => {
  throw new Error(`unhandled rejection - ${ errorReason(reason) }`, { cause: reason });
});

const [libFilter, methodFilter] = positionals(argv,
  { names: ['libFilter', 'methodFilter'], usage: 'pipeline.mjs takes [libFilter] [methodFilter]' });
const libs = librariesMatching(libFilter);
if (methodFilter !== undefined && !METHODS.includes(methodFilter)) throw new Error(`no method matches filter '${ methodFilter }'`);

async function timedBuild(entry, plugins, label = 'stage') {
  const t0 = process.hrtime.bigint();
  const build = await rollup({ input: entry, plugins, onwarn: strictWarn });
  try {
    const { output } = await build.generate(UMD_OUTPUT);
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

// Rollup takes the hook as a plain function or as `{ order, handler }` (unplugin emits the latter),
// so it is unwrapped and re-wrapped in the shape it came in.
//
// Sibling modules transform CONCURRENTLY and both hooks are async, so summing each call's wall-clock
// would charge one plugin for time spent inside the other. This accumulates the union of busy
// intervals - the clock runs from idle -> in-flight until the last in-flight call settles - which is a
// window in which the hook was active, not a partition of the build.
function timeTransform(plugin, add) {
  // `pre+post` hands back an ARRAY of sub-plugins, which rollup flattens - and a plugin with no
  // transform hook has nothing to time. Neither shape may be indexed into blindly, or a phase this
  // report does not measure today would fail on a property of `undefined`. Note what the array branch
  // does to the number: each sub-plugin accumulates its own busy window into one sink, so two phases
  // active at once are summed rather than unioned. Nothing here measures `pre+post` - the stage below
  // pins `post` - and no number this report prints is asserted, but a caller that does needs the union.
  if (Array.isArray(plugin)) return plugin.map(sub => timeTransform(sub, add));
  const hook = plugin?.transform;
  if (!hook) return plugin;
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

// [A] and [B] depend on the LIBRARY only: neither carries unplugin, and `withEntry` emits the same
// entry body for every usage-* method. Measured once per library and shared, or the run-to-run spread
// between two identical builds reads as a usage-global vs usage-pure difference.
const stagesByLib = new Map();
async function baseStages(lib) {
  if (stagesByLib.has(lib.name)) return stagesByLib.get(lib.name);
  const label = `${ lib.name }/usage-*`;
  const stages = await withEntry(lib.exercise, 'usage-global', 'pipe-base', async entry => {
    let src = 0;
    // `ts` changes what `src` MEANS: this counter sits before type erasure, so a TS-source library is
    // counted with its annotations and does not compare with the JS rows. The report labels it.
    let ts = false;
    const counter = {
      name: 'src-count',
      // never rewrites anything - `transform` is only how a plugin gets shown every module
      transform(code, id) {
        // the same predicate the Babel plugin admits modules by: rollup's interop shims and commonjs
        // proxies are the bundler's own code, and counting them here reports them as library source
        if (isLibraryModule(id)) {
          src += Buffer.byteLength(code);
          if (TS_EXTENSION.test(id)) ts = true;
        }
        return null;
      },
    };
    const a = await timedBuild(entry, [tsSources(), counter, makeTsStripPlugin(), nodeResolve(), commonjs()], `${ label } [A]`);
    const b = await timedBuild(entry, [tsSources(), makeBabelPlugin(), nodeResolve(), commonjs()], `${ label } [B]`);
    return { src, ts, A: { bytes: a.bytes, ms: +a.ms.toFixed(0) }, B: { bytes: b.bytes, ms: +b.ms.toFixed(0) } };
  });
  stagesByLib.set(lib.name, stages);
  return stages;
}

async function measure(lib, method) {
  const effPhase = method === 'entry-global' ? undefined : 'post';
  const cell0 = `${ lib.name }/${ method }`;
  return withEntry(lib.exercise, method, `pipe-${ method }`, async entry => {
    const cell = { lib: lib.name, method };
    const cellC = `${ cell0 } [C]`;

    if (method !== 'entry-global') {
      const { src, ts, A, B } = await baseStages(lib);
      cell.src = src;
      cell.ts = ts;
      cell.A = A;
      cell.B = B;
    }

    // injections are recorded INSIDE this build: a separate pass without Babel in front of unplugin
    // would undercount, since the post phase consumes what Babel's helpers emit
    let babelBusyMs = 0;
    let unpluginBusyMs = 0;
    const sink = new Set();
    const babel = timeTransform(makeBabelPlugin(), ms => { babelBusyMs += ms; });
    const up = timeTransform(u('rollup', method, effPhase), ms => { unpluginBusyMs += ms; });
    const c = await timedBuild(entry, [tsSources(), babel, nodeResolve(), commonjs(), up, recorder(sink)], cellC);
    cell.injections = sink.size;
    // the count alone is a text proxy - see build.mjs::assertPayload for what it misses
    assertPayload(c.chunk, cellC);
    // runtime.mjs refuses this shape for EVERY method, so this must too - an entry-global carve-out
    // would be both weaker than it is there and pointless, since entry-global injects the most of all.
    if (!sink.size) throw new Error(`${ cell0 }: unplugin injected 0 polyfills into [C]`);
    // [B] == [A] with babelBusyMs ~ 0 is the silent shape of a Babel stage that did nothing, so the
    // ES5 premise is asserted directly rather than inferred from the numbers - `wireSize` parses
    // exactly what it is about to measure, which is this stage's output.
    const { min, gz } = await wireSize(c.code, cellC);
    cell.C = {
      bytes: c.bytes, ms: +c.ms.toFixed(0), babelBusyMs: +babelBusyMs.toFixed(0), unpluginBusyMs: +unpluginBusyMs.toFixed(0),
      min, gz,
    };
    return cell;
  });
}

// Warm the toolchain first: the one-off cost of loading rollup, Babel and unplugin would otherwise
// land entirely on whichever cell ran first and make the cross-library [C] column incomparable. Which
// library it warms with does not matter - what is being warmed is the toolchain, not a module graph.
// this tier builds each cell three times over and gates nothing, so the wait is longer than the
// runtime one's and buys a report rather than a verdict - say so before the first build, and say how
// many cells that wait covers
const measured = libs.length * (methodFilter ? 1 : METHODS.length);
const filterNote = libFilter || methodFilter ? ` filtered by ${ chalk.cyan(`${ libFilter ?? '*' } x ${ methodFilter ?? '*' }`) }` : '';
echo(chalk.green(`pipeline report: ${ chalk.cyan(libs.length) } librar${ libs.length === 1 ? 'y' : 'ies' }`
  + ` x ${ chalk.cyan(methodFilter ? 1 : METHODS.length) } method(s) = ${ chalk.cyan(measured) } cell(s)${ filterNote },`
  + ' each built at every stage it has - this measures, it gates nothing'));

process.stdout.write(chalk.green('warming the toolchain ... '));
await withEntry(libs[0].exercise, 'usage-global', 'warmup',
  entry => timedBuild(entry, [tsSources(), makeBabelPlugin(), nodeResolve(), commonjs(), u('rollup', 'usage-global', 'post')]));
echo(chalk.green('done'));

const rows = [];
for (const lib of libs) {
  for (const method of METHODS) {
    if (methodFilter && method !== methodFilter) continue;
    process.stdout.write(chalk.green(`measuring ${ chalk.cyan(`${ lib.name }/${ method }`) } ... `));
    rows.push(await measure(lib, method));
    echo(chalk.green('done'));
  }
}
// cannot fire today - `librariesMatching` throws on an empty match and `methodFilter` is validated above -
// but it stays so that a future per-library method subset cannot write a green empty report.
if (!rows.length) throw new Error(`no (library x method) cell matches '${ libFilter ?? '' }' '${ methodFilter ?? '' }'`);

// -------- report --------
function kb(b) {
  return `${ (b / 1024).toFixed(0) } KB`;
}
// A filtered run must not be mistakable for a full one: it overwrites the same report file, and the
// method filter in particular just makes sections vanish.
const scope = libFilter || methodFilter
  ? `Filtered run (${ libFilter ?? '*' } x ${ methodFilter ?? '*' }): ${ rows.length } cell(s)`
  : `Full matrix: ${ rows.length } cell(s)`;
let md = '# Pipeline: size and time per stage\n\n'
  + `${ scope }. `
  + 'Rollup + Babel (syntax down-compile) + unplugin, single run. The usage-* cells are measured at '
  + 'the `post` phase, the one the runtime tier gates on; `entry-global` carries no phase at all. '
  + 'Stages: **[A]** library with no down-compile '
  + '(modern, tree-shaken; a TypeScript-source library has its types erased here and nothing else, '
  + 'since rollup cannot parse `.ts` at all - erasure is not a down-compile, so the whole cost of the '
  + 'ES5 lowering is still in the [A] -> [B] delta) -> **[B]** + Babel (ES5, no polyfills) -> '
  + '**[C]** + unplugin (polyfills = the real IE11 bundle). For `entry-global`, only [C]. '
  + '**[A] and [B] depend on the library only** - neither carries unplugin, and the entry is identical '
  + 'for both usage-* methods - so they are measured ONCE per library and the two usage-* rows show '
  + 'the same build. Identical [A]/[B] figures across those two rows are one measurement printed '
  + 'twice, not two that agree. Only [C] is per cell.\n\n';
for (const lib of libs) {
  const cells = rows.filter(r => r.lib === lib.name);
  if (!cells.length) continue;
  md += `## ${ lib.name }\n\n`;
  for (const c of cells) {
    md += `### ${ c.method } - injections: ${ c.injections }\n\n`;
    md += '| stage | size (raw) | time |\n| --- | --- | --- |\n';
    if (c.A) {
      md += `| source loaded (pre-tree-shaking${ c.ts ? ', TypeScript' : '' }) | ${ kb(c.src) } | - |\n`;
      md += `| [A] ${ c.ts ? 'types erased' : 'no transforms' } (modern) | ${ kb(c.A.bytes) } | ${ c.A.ms } ms |\n`;
      md += `| [B] + Babel (ES5, no polyfills) | ${ kb(c.B.bytes) } | ${ c.B.ms } ms |\n`;
    }
    md += `| [C] + unplugin (IE11) | ${ kb(c.C.bytes) } | ${ c.C.ms } ms |\n\n`;
    // NOT printed as `total (Babel x / unplugin y)`: that form promises a partition, and these two
    // are overlapping windows - modules transform concurrently, both hooks are async, so the clocks
    // run at the same time and their sum may exceed the row above.
    md += `**Hooks busy during [C]:** Babel ${ c.C.babelBusyMs } ms, unplugin ${ c.C.unpluginBusyMs } ms`
      + ' - each is the span in which that hook had work in flight, so the two overlap and neither'
      + ' divides the [C] time above.\n\n';
    md += `**Wire size of [C]:** minified ${ kb(c.C.min) } / gzip **${ kb(c.C.gz) }**`;
    if (c.A) md += ` - size delta: Babel ${ (c.B.bytes >= c.A.bytes ? '+' : '') + kb(c.B.bytes - c.A.bytes) } / polyfills +${ kb(c.C.bytes - c.B.bytes) }`;
    md += '\n\n';
  }
}
const REPORT = join(HERE, 'report');
await mkdir(REPORT, { recursive: true });
await writeFile(join(REPORT, 'pipeline.md'), md);
// the report is what outlives the run, and `scope` describes the REQUEST rather than the input - two
// reports with the same scope can be measurements of different trees. `input` is the same derived
// identity the gating tier prints, so the two products answer "was this the same input?" alike
await writeFile(join(REPORT, 'pipeline.json'), `${ JSON.stringify({ input: await describeInput(), scope, rows }, null, 2) }\n`);
echo(chalk.green(`\nreport -> ${ chalk.cyan(join(REPORT, 'pipeline.md')) }`));
