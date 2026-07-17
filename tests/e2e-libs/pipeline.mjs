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
import { makeBabelPlugin, u, withEntry, captureInjections, HERE } from './build.mjs';
import { librariesIn } from './libraries.mjs';
import { transform as esbuildTransform } from 'esbuild';
import { gzip } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const gzipP = promisify(gzip);

const [libFilter, methodFilter] = process.argv.slice(2);
const libs = librariesIn('runtime').filter(l => !libFilter || l.name === libFilter);
if (!libs.length) throw new Error(`no runtime library matches filter '${ libFilter }'`);

const UMD = { format: 'umd', name: 'E2E', esModule: false };

async function timedBuild(entry, plugins) {
  const t0 = process.hrtime.bigint();
  const build = await rollup({ input: entry, plugins, onwarn() { /* ignore bundler warnings */ } });
  const { output } = await build.generate(UMD);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  await build.close();
  return { bytes: output[0].code.length, ms, code: output[0].code };
}

// wrap a plugin's transform hook to accumulate the time spent inside it (handles sync + async)
function timeTransform(plugin, add) {
  const orig = plugin.transform;
  plugin.transform = async function transform(code, id) {
    const t0 = process.hrtime.bigint();
    try {
      return await orig.call(this, code, id);
    } finally {
      add(Number(process.hrtime.bigint() - t0) / 1e6);
    }
  };
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
          src += code.length;
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
  return `${ (b / 1024).toFixed(0) } КБ`;
}
let md = '# Pipeline: размер и время по стадиям\n\n'
  + 'Rollup, Babel 7 (≡ Babel 8), single-run. Стадии: **[A]** библиотека без трансформаций '
  + '(модерн, tree-shaken) → **[B]** + Babel (ES5, без полифиллов) → **[C]** + unplugin '
  + '(полифиллы = реальный IE11-бандл). Для `entry-global` — только [C].\n\n';
for (const lib of libs) {
  const cells = rows.filter(r => r.lib === lib.name);
  if (!cells.length) continue;
  md += `## ${ lib.name }\n\n`;
  for (const c of cells) {
    md += `### ${ c.method } — инъекций: ${ c.injections }\n\n`;
    md += '| стадия | размер (raw) | время |\n| --- | --- | --- |\n';
    if (c.A) {
      md += `| исходники загружено (до tree-shaking) | ${ kb(c.src) } | — |\n`;
      md += `| [A] без трансформаций (модерн) | ${ kb(c.A.bytes) } | ${ c.A.ms } ms |\n`;
      md += `| [B] + Babel (ES5, без полифиллов) | ${ kb(c.B.bytes) } | ${ c.B.ms } ms |\n`;
    }
    md += `| [C] + unplugin (IE11) | ${ kb(c.C.bytes) } | ${ c.C.ms } ms (Babel ${ c.C.babelMs } / unplugin ${ c.C.unpluginMs }) |\n\n`;
    md += `**Доставка [C]:** minified ${ kb(c.C.min) } · gzip **${ kb(c.C.gz) }**`;
    if (c.A) md += ` — Δ размера: Babel ${ (c.B.bytes >= c.A.bytes ? '+' : '') + kb(c.B.bytes - c.A.bytes) } / полифиллы +${ kb(c.C.bytes - c.B.bytes) }`;
    md += '\n\n';
  }
}
const REPORT = join(HERE, 'report');
await mkdir(REPORT, { recursive: true });
await writeFile(join(REPORT, 'pipeline.md'), md);
await writeFile(join(REPORT, 'pipeline.json'), `${ JSON.stringify(rows, null, 2) }\n`);
console.log(`\nreport → ${ join(REPORT, 'pipeline.md') }`);
