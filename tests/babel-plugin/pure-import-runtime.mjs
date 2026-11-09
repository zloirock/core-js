// Source ownership and import flavor survive printing, reparsing and a fresh plugin instance.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('pure-import-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'pure-import-'));
let count = 0;

async function transform(source, host, options = {}, filename = path.join(DIR, 'input.mjs')) {
  scenarioSource(source);
  const config = { ...OPTIONS, ...options };
  if (host === 'babel') return (await transformAsync(source, {
    configFile: false, babelrc: false, filename, plugins: [[babelPlugin, config]],
  })).code;
  return createUnplugin(config).transform(source, filename)?.code ?? source;
}

try {
  await fs.outputFile(path.join(DIR, 'features/array.mjs'), 'export default { from(value) { return ["foreign", value[0]]; } };');
  await fs.outputFile(path.join(DIR, 'features/list/get-list.mjs'), 'export default function getList() { return [3, 9]; }');
  await fs.outputFile(path.join(DIR, 'vendor/@core-js/pure/actual/map/constructor.js'), 'export default [3, 9];');
  await fs.outputFile(path.join(DIR, 'consume.mjs'), 'export default function consume(value) { return value; }');
  for (const pkg of ['my-pure', '@vendor/pure']) {
    await fs.outputFile(path.join(DIR, `node_modules/${ pkg }/actual/promise.js`),
      'module.exports = { resolve: function resolve(value) { return ["custom", value]; }, token: 17 };');
    await fs.outputFile(path.join(DIR, `node_modules/${ pkg }/actual/reflect/apply.js`), 'module.exports = Reflect.apply;');
  }
  const cases = [
    ['foreign-static', 'import array from "./features/array.mjs"; export const r = array.from([7]);', ['foreign', 7]],
    ['foreign-call', 'import getList from "./features/list/get-list.mjs"; export const r = getList().at(-1);', 9],
    ['foreign-package-segment', `import C from './vendor/@core-js/pure/actual/map/constructor.js';
const { at } = C; export const r = at.call(C, -1);`, 9],
    ['absolute-write', 'globalThis.Array.from = () => \'patched\'; export const r = globalThis.Array.from([1]);', 'patched',
      { absoluteImports: true }],
    ['absolute-delete', 'delete globalThis.Array.from; export const r = typeof globalThis.Array.from;', 'undefined',
      { absoluteImports: true }],
    ['absolute-ctor', 'globalThis.Map = function Map() { this.value = 23; }; export const r = new globalThis.Map().value;', 23,
      { absoluteImports: true }],
    ['custom-index', `import P from 'my-pure/actual/promise.js'; const { resolve, ...rest } = P;
export const r = [resolve === P.resolve, resolve(8), rest.token];`, [true, ['custom', 8], 17], { package: 'my-pure' }],
    ['additional-index', `import P from '@vendor/pure/actual/promise.js'; const { resolve, ...rest } = P;
export const r = [resolve === P.resolve, resolve(8), rest.token];`, [true, ['custom', 8], 17], { additionalPackages: ['@vendor/pure'] }],
    ['additional-invoker', `import invoke from '@vendor/pure/actual/reflect/apply.js';
function receiver() { return Array; }
invoke(receiver, null, []).from = () => 17;
export const r = Array.from([1]);`, 17, { additionalPackages: ['@vendor/pure'] }],
    ['shadowed-hint', `import C from '@core-js/pure/actual/map/constructor';
export function read(C) { const target = C ?? ['fallback']; return target.at(-1); }
export const r = [read([7]), read('ab'), typeof C];`, [7, 'b', 'function']],
    ['local-hint', `import C from '@core-js/pure/actual/map/constructor';
function read() { const C = { prototype: [7] }; const { at } = C.prototype; return at.call([9], -1); }
export const r = [read(), typeof C];`, [9, 'function']],
    ['other-flavor', `import M from '@core-js/pure/stable/map/constructor'; const m = new M([[3, 7]]);
export const r = m.keys().next().value;`, 3],
    ['captured-index', `import consume from './consume.mjs'; consume(Promise);
const { Promise: Captured } = globalThis;
const { all } = Captured;
export const r = all === Captured.all;`, true, { mode: 'full' }],
    ['hoisted-symbol', `{ var { iterator: key } = Symbol; }
export const r = [7][key]().next().value;`, 7],
  ];
  for (const [name, source, expected, options] of cases) {
    const nativeFile = path.join(DIR, `native-${ count++ }.mjs`);
    const input = `${ source }\nexport const effects = [];`;
    await fs.outputFile(nativeFile, input);
    const native = await runInWorker(nativeFile, { strip: false });
    check(`${ name }/native`, native, `OK|${ JSON.stringify(expected) }|[]`);
    for (const host of ['babel', 'unplugin']) {
      const first = await transform(input, host, options);
      const second = await transform(first, host, options);
      const stages = [['first', first], ['reparse', second]];
      if (name.startsWith('absolute-') && host === 'unplugin') {
        const plugin = createUnplugin({ ...OPTIONS, ...options });
        const filename = path.join(DIR, 'staged.mjs');
        const pre = plugin.transform(input, filename, 'pre')?.code ?? input;
        stages.push(['pre+post', plugin.transform(pre, filename, 'post')?.code ?? pre]);
      }
      for (const [phase, output] of stages) {
        // absoluteImports emits filesystem paths for bundlers, including Windows drive paths.
        // Node's ESM loader treats a drive letter as a URL scheme; lower only for execution,
        // after the untouched output has passed through the fresh-plugin and pre+post checks.
        const script = options?.absoluteImports;
        const executable = script ? (await transformAsync(output, {
          configFile: false, babelrc: false,
          plugins: [requireBabel('@babel/plugin-transform-modules-commonjs')],
        })).code : output;
        const file = path.join(DIR, `${ count++ }.${ script ? 'cjs' : 'mjs' }`);
        await fs.outputFile(file, executable);
        const sourceType = script ? 'script' : 'module';
        check(`${ name }/${ host }/${ phase }/full`, await runInWorker(file, { strip: false, sourceType }), native);
        check(`${ name }/${ host }/${ phase }/stripped`, await runInWorker(file, { sourceType }), native);
      }
      switch (name) {
        case 'other-flavor':
          check(`${ name }/${ host }/no generic helper`, /\/instance\//.test(first), false);

          break;
        case 'custom-index':
        case 'additional-index':
          check(`${ name }/${ host }/no foreign static`, /promise\/resolve/.test(first), false);

          break;
        case 'captured-index':
          check(`${ name }/${ host }/full index owns its static`, /promise\/all/.test(first), false);

          break;
      // No default
      }
    }
  }

  // These existing snapshot deltas remove helpers for a proven constructor surface.
  // Check both the selected constructor and the live fallback/throw paths.
  const controls = [
    ['promise-alias', `const base = Promise; const P = base ?? AggregateError;
export const r = typeof P.withResolvers().resolve;`, 'function'],
    ['promise-chain-nullish', `const base = Promise; const Q = base ?? Iterator; const C = Q ?? AggregateError;
export const r = await C.try(() => 17);`, 17],
    ['promise-chain-truthy', `const base = Promise; const Q = base || Iterator; const C = Q || AggregateError;
export const r = await C.try(() => 19);`, 19],
    ['promise-chain-import', `import base from '@core-js/pure/actual/promise';
const Q = base ?? Iterator; const C = Q ?? AggregateError;
export const r = await C.try(() => 23);`, 23],
    ['promise-chain-effects', `const order = [];
const base = Promise; const Q = (order.push('base'), base) ?? Iterator; const C = Q ?? AggregateError;
export const r = [await C[(order.push('key'), 'try')]?.((order.push('arg'), () => 29)), order];`,
    [29, ['base', 'key', 'arg']]],
    ['promise-reassigned', `const base = Promise; let Q = base ?? Iterator;
Q = { try(fn) { return [this === Q, fn()]; } }; const C = Q ?? AggregateError;
export const r = C.try(() => 31);`, [true, 31]],
    ['promise-captured-before-init', `var C = Q ?? { try() { return 37; } }; var Q = Promise;
export const r = C.try(() => 0);`, 37],
    ['promise-patched', `const base = Promise; const Q = base ?? Iterator; const C = Q ?? AggregateError;
C.try = function (fn) { return [this === C, fn()]; };
export const r = C.try(() => 41);`, [true, 41]],
    ['promise-shadow', `const base = Promise; const Q = base ?? Iterator;
function read(Q) { const C = Q ?? AggregateError; return C.try(() => 43); }
export const r = read({ try(fn) { return fn(); } });`, 43],
    ['promise-narrow', `import base from '@core-js/pure/actual/promise/constructor';
const Q = base ?? Iterator; const C = Q ?? AggregateError;
export const r = await C.try(() => 47);`, 47],
    ['map-selected', `const M = Map ?? Object;
export const r = M.groupBy([1, 2], value => value % 2).get(0);`, [2]],
    ['iterator-selected', `const I = Iterator || Array;
export const r = I.from([53]).next().value;`, 53],
    ['reassigned-static-owner', `let Q = Iterator ?? Object; Q = Array;
const C = Q ?? AggregateError; export const r = C.from([59])[0];`, 59],
    ['conditional-container', `function read(on) {
  if (on) { var box = { I: Iterator }; }
  return () => box.I.concat;
}
let missing;
try { read(false)(); } catch (error) { missing = error.name; }
export const r = [typeof read(true)(), missing];`, ['function', 'TypeError']],
    ['conditional-write', `let held = Set;
function write(on) { if (on) { var box = { I: Iterator }; } held = box.I; }
const before = typeof held.concat;
let missing;
try { write(false); } catch (error) { missing = error.name; }
write(true);
export const r = [before, missing, typeof held.concat];`, ['undefined', 'TypeError', 'function']],
  ];
  for (const [name, source, expected] of controls) {
    for (const host of ['babel', 'unplugin']) {
      const output = await transform(`${ source }\nexport const effects = [];`, host);
      if (name.startsWith('promise-chain-')) {
        check(`${ name }/${ host }/full index owns try`, /promise\/try/.test(output), false);
        check(`${ name }/${ host }/no identity guard`, /===/.test(output), false);
      }
      if (name === 'promise-narrow') check(`${ name }/${ host }/narrow index needs try`, /promise\/try/.test(output), true);
      const file = path.join(DIR, `${ count++ }.mjs`);
      await fs.outputFile(file, output);
      for (const strip of [false, true]) {
        check(`${ name }/${ host }/${ strip }`, await runInWorker(file, { strip }), `OK|${ JSON.stringify(expected) }|[]`);
      }
    }
  }

  for (const family of ['iterator', 'map']) {
    for (const body of [
      'const { map, forEach } = C.prototype; use(map, forEach);',
      'const { prototype: { map, forEach } } = C; use(map, forEach);',
      'const selected = flag ? C : { at: 8 }; use(selected.at);',
    ]) {
      for (const host of ['babel', 'unplugin']) {
        const entry = `@core-js/pure/stable/${ family }/constructor`;
        const esm = await transform(`import C from '${ entry }'; ${ body }`, host);
        const cjs = await transform(`const C = require('${ entry }'); ${ body }`, host);
        check(`${ family }/${ host }/${ body }/ESM`, /\/instance\//.test(esm), false);
        check(`${ family }/${ host }/${ body }/CJS`, /\/instance\//.test(cjs), false);
      }
    }
  }

  for (const host of ['babel', 'unplugin']) {
    const different = await transform('import M from \'@core-js/pure/stable/map/constructor\'; use(M, new Map());', host);
    check(`${ host }/dedup keeps flavor`, different.includes('actual/map/constructor'), true);
    const same = await transform('import M from \'@core-js/pure/actual/map/constructor\'; use(M, new Map());', host);
    check(`${ host }/same flavor dedup`, (same.match(/actual\/map\/constructor/g) ?? []).length, 1);
    for (const pkg of ['my-pure', '@vendor/pure']) {
      for (const method of ['usage-pure', 'usage-global', 'entry-global']) {
        const input = method === 'entry-global' ? 'import "core-js/actual";' : 'module.exports = Object.hasOwn;';
        const output = await transform(input, host, { method, package: 'my-pure', additionalPackages: ['@vendor/pure'] },
          path.join(DIR, `node_modules/${ pkg }/internals/check.js`));
        check(`${ host }/${ method }/${ pkg }/self exclusion`, /(?:my-pure|@vendor\/pure|core-js)\/modules\//.test(output), false);
        check(`${ host }/${ method }/${ pkg }/no helper`, output.includes('object/has-own'), false);
        check(`${ host }/${ method }/${ pkg }/retains input read`, output.includes(method === 'entry-global' ? 'core-js/actual' : 'Object.hasOwn'), true);
      }
    }
  }
} finally {
  await fs.remove(DIR);
}

finish();
