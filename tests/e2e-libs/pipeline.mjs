// Pipeline stats: size AND time at every stage of the real IE11 build, per (lib x method).
// Rollup, Babel 7 (7 == 8 byte-for-byte), single run. Stages:
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
import { makeBabelPlugin, u, withEntry, captureInjections, METHODS, HERE } from './build.mjs';
import { runnerArgs } from './args.mjs';
import { librariesIn } from './libraries.mjs';
import { transform as esbuildTransform } from 'esbuild';
import { gzip } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const gzipP = promisify(gzip);

const [libFilter, methodFilter] = runnerArgs(import.meta.url);
const libs = librariesIn('runtime').filter(l => !libFilter || l.name === libFilter);
// a typo'd filter that matches nothing must fail loudly, not write a green empty report
if (!libs.length) throw new Error(`no runtime library matches filter '${ libFilter }'`);
if (methodFilter && !METHODS.includes(methodFilter)) throw new Error(`no method matches filter '${ methodFilter }'`);

const UMD = { format: 'umd', name: 'E2E', esModule: false };

async function timedBuild(entry, plugins) {
  const t0 = process.hrtime.bigint();
  const build = await rollup({ input: entry, plugins, onwarn() { /* ignore bundler warnings */ } });
  try {
    const { output } = await build.generate(UMD);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    return { bytes: Buffer.byteLength(output[0].code), ms, code: output[0].code };
  } finally {
    await build.close();
  }
}

// Wrap a plugin's transform hook to accumulate the time spent inside it (handles sync + async).
// Rollup accepts the hook either as a plain function or in object form `{ order, handler }`
// (unplugin emits the object form), so unwrap it and re-wrap in the shape it came in.
function timeTransform(plugin, add) {
  const hook = plugin.transform;
  const orig = typeof hook === 'function' ? hook : hook.handler;
  async function timed(code, id) {
    const t0 = process.hrtime.bigint();
    try {
      return await orig.call(this, code, id);
    } finally {
      add(Number(process.hrtime.bigint() - t0) / 1e6);
    }
  }
  plugin.transform = typeof hook === 'function' ? timed : { ...hook, handler: timed };
  return plugin;
}

async function measure(lib, method) {
  const effPhase = method === 'entry-global' ? undefined : 'post';
  const injections = (await captureInjections(lib.exercise, method)).length;
  return withEntry(lib.exercise, method, `pipe-${ method }`, async entry => {
    const cell = { lib: lib.name, method, injections };

    if (method !== 'entry-global') {
      let src = 0;
      const counter = {
        name: 'src-count',
        transform(code) {
          src += Buffer.byteLength(code);
          return null;
        },
      };
      const a = await timedBuild(entry, [counter, nodeResolve(), commonjs()]);
      const b = await timedBuild(entry, [makeBabelPlugin('7'), nodeResolve(), commonjs()]);
      cell.src = src;
      cell.A = { bytes: a.bytes, ms: +a.ms.toFixed(0) };
      cell.B = { bytes: b.bytes, ms: +b.ms.toFixed(0) };
    }

    // [C]: Babel + unplugin, instrumented for the babel-vs-unplugin split
    let babelMs = 0;
    let unpluginMs = 0;
    const babel = timeTransform(makeBabelPlugin('7'), ms => { babelMs += ms; });
    const up = timeTransform(u('rollup', method, effPhase), ms => { unpluginMs += ms; });
    const c = await timedBuild(entry, [babel, nodeResolve(), commonjs(), up]);
    const min = (await esbuildTransform(c.code, { minify: true, legalComments: 'none' })).code;
    const minBuf = Buffer.from(min);
    const gz = (await gzipP(minBuf)).length;
    cell.C = {
      bytes: c.bytes, ms: +c.ms.toFixed(0), babelMs: +babelMs.toFixed(0), unpluginMs: +unpluginMs.toFixed(0),
      min: minBuf.length, gz,
    };
    return cell;
  });
}

const rows = [];
for (const lib of libs) {
  for (const method of lib.methods) {
    if (methodFilter && method !== methodFilter) continue;
    process.stdout.write(`measuring ${ lib.name }/${ method } … `);
    rows.push(await measure(lib, method));
    console.log('done');
  }
}

// -------- report --------
function kb(b) {
  return `${ (b / 1024).toFixed(0) } KB`;
}
let md = '# Pipeline: size and time per stage\n\n'
  + 'Rollup, Babel 7 (≡ Babel 8), single run. Stages: **[A]** library with no transforms '
  + '(modern, tree-shaken) → **[B]** + Babel (ES5, no polyfills) → **[C]** + unplugin '
  + '(polyfills = the real IE11 bundle). For `entry-global`, only [C].\n\n';
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
await writeFile(join(REPORT, 'pipeline.json'), `${ JSON.stringify(rows, null, 2) }\n`);
console.log(`\nreport → ${ join(REPORT, 'pipeline.md') }`);
