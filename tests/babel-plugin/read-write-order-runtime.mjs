// Captured values and loop slots are ordered by evaluation, not by their eventual reader.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { importSet } from '../transpiler-differential/harness.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('read-write-order-runtime');
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'read-write-order-'));
let count = 0;
const stripIterators = path.join(DIR, 'strip-array-methods.mjs');
await fs.outputFile(stripIterators, 'delete Array.prototype.entries; delete Array.prototype.keys; delete Array.prototype.values;');

const cases = [
  ['written-default', 'const src = {}; src.list = [1, 2]; const { list: { entries } = Object } = src; r = entries.call(src.list).next().value;', [0, 1]],
  [
    'escaped-default', 'const src = {}; const fill = Function("o", "o.list = [1, 2]"); '
    + 'fill(src); const { list: { entries } = Object } = src; r = entries.call(src.list).next().value;', [0, 1],
  ],
  ['pristine-default', 'const src = {}; const { list: { entries } = Object } = src; r = entries({ a: 1 });', [['a', 1]]],
  ['opaque-default', 'const src = Function("return {}")(); const { list: { entries } = Object } = src; r = entries({ a: 1 });', [['a', 1]]],
  [
    'supplied-static-default', 'const src = Function("return { list: Object }")(); '
    + 'const { list: { entries } = Object } = src; r = entries({ a: 1 });', [['a', 1]],
  ],
  [
    'multiple-default', 'const src = Function("return { list: [1, 2] }")(); '
    + 'const { list: { entries, keys } = Object } = src; r = [entries.call(src.list).next().value, keys.call(src.list).next().value];', [[0, 1], 0],
  ],
  [
    'custom-default', 'const log = []; const receiver = { get entries() { log.push("entries"); return function () { return this === receiver; }; } }; '
    + 'const src = { get list() { log.push("list"); return receiver; } }; const { list: { entries } = Object } = src; '
    + 'r = [entries.call(receiver), log];', [true, ['list', 'entries']],
  ],
  [
    'null-default', 'const src = { get list() { return null; } }; '
    + 'try { const { list: { entries } = Object } = src; r = entries; } catch (error) { r = error.name; }', 'TypeError',
  ],
  [
    'throw-default', 'const src = { get list() { throw new RangeError(); } }; '
    + 'try { const { list: { entries } = Object } = src; r = entries; } catch (error) { r = error.name; }', 'RangeError',
  ],
  [
    'key-default', 'const log = []; const src = { get list() { log.push("slot"); return [3]; } }; '
    + 'const { [(log.push("key"), "list")]: { entries } = (log.push("default"), Object) } = src; '
    + 'r = [entries.call([3]).next().value, log];', [[0, 3], ['key', 'slot']],
  ],
  [
    'leaf-default', 'const src = Function("return { list: { entries: undefined } }")(); '
    + 'const { list: { entries = () => 23 } = Object } = src; r = entries();', 23,
  ],
  [
    'kept-default', 'const src = Function("return { list: [3] }")(); let entries; '
    + 'const held = ({ list: { entries } = Object } = src); r = [held === src, entries.call(src.list).next().value];', [true, [0, 3]],
  ],
  [
    'bodyless-default', 'const src = Function("return { list: [3] }")(); '
    + 'if (true) var { list: { entries } = Object } = src; r = entries.call(src.list).next().value;', [0, 3],
  ],
  [
    'nested-default', 'const src = Function("return { outer: { list: [3] } }")(); '
    + 'const { outer: { list: { entries } = ((Object)) } } = ((src)); r = entries.call(src.outer.list).next().value;', [0, 3],
  ],
  [
    'shadow-default', '{ const Object = { entries() { return 23; } }; const src = Function("return {}")(); '
    + 'const { list: { entries } = Object } = src; r = entries(); }', 23,
  ],
  [
    'loop-default', 'for (const { list: { entries } = Object } of [Function("return {}")()]) r = entries({ a: 3 });', [['a', 3]],
  ],
  [
    'parameter-default', 'function read({ list: { entries } = Object }) { return entries; } r = read({})({ a: 3 });', [['a', 3]],
  ],
  ['captured-alias', 'let cur = "ab"; const prev = cur; cur = Map; r = prev.at(0);', 'a'],
  ['captured-pattern', 'let cur = "ab"; const prev = cur; cur = Map; const { at } = prev; r = at.call(prev, 0);', 'a'],
  ['captured-optional', 'let cur = "ab"; const prev = cur; cur = Map; r = prev?.at(0);', 'a'],
  ['written-slot', 'const w = { k: Object }; const make = Function("return [1, 2]"); w.k = make(); r = w.k.at(-1);', 2],
  ['escaped-slot', 'const w = { k: Object }; const fill = Function("o", "o.k = [1, 2]"); fill(w); r = w.k.at(-1);', 2],
  ['conditional-slot', 'const w = { k: Object }; const fill = Function("o", "o.k = [1, 2]"); if (true) fill(w); r = w.k.at(-1);', 2],
  ['known-slot', 'const w = { k: Object }; w.k = "ab"; r = w.k.at(0);', 'a'],
  ['hoisted-write', 'let P = null; init(); P.resolve(1); r = typeof P.resolve; function init() { P = Promise; }', 'function'],
  ['hoisted-patch', 'let M = null; init(); M.groupBy = Function("return 17"); r = Map.groupBy([]); function init() { M = Map; }', 17],
  [
    'for-update', 'const Shim = function Shim() {}; const out = []; for (let i = 0; '
    + 'i < 1; out[out.length] = Promise === Shim, i++) { globalThis.Promise = Shim; } r = out;', [true],
  ],
  [
    'for-test-control', 'const Shim = function Shim() {}; const out = []; for (let i = 0; i < 1 && (out[out.length] = Promise === Shim, true); '
    + 'i++) { globalThis.Promise = Shim; } r = out;', [false],
  ],
  ['capture-block-shadow', 'let cur = "ab"; const prev = cur; cur = Map; { const cur = Object; r = prev.at(0); }', 'a'],
  ['capture-before-init', 'const prev = cur; var cur = Map; r = prev?.at(0) === undefined;', true],
  ['written-slot-late', 'const w = { k: Object }; r = w.k.keys({ a: 1 }); w.k = Function("return [1, 2]")();', ['a']],
  ['written-slot-shadow', 'const w = { k: Object }; { const w = { k: [1] }; w.k = [2]; } r = w.k.keys({ a: 1 });', ['a']],
  ['hoisted-write-shadow', 'let P = null; init(); r = P; function init() { let P; P = Promise; }', null],
  ['hoisted-block-write', 'let P = null; init(); r = typeof P.resolve; function init() { { P = Promise; } }', 'function'],
  ['late-write', 'let P = "ab"; r = P.at(0); P = Promise;', 'a'],
  [
    'for-body-control', 'const Shim = function Shim() {}; const out = []; for (let i = 0; '
    + 'i < 1; globalThis.Promise = Shim, i++) { out[out.length] = Promise === Shim; } r = out;', [false],
  ],
  [
    'for-update-read-first', 'const Shim = function Shim() {}; const out = []; for (let i = 0; '
    + 'i < 1; out[out.length] = Promise === Shim, globalThis.Promise = Shim, i++) {} r = out;', [false],
  ],
  [
    'for-update-write-first', 'const Shim = function Shim() {}; const out = []; for (let i = 0; '
    + 'i < 1; globalThis.Promise = Shim, out[out.length] = Promise === Shim, i++) {} r = out;', [true],
  ],
  [
    'for-continue', 'const Shim = function Shim() {}; const out = []; for (let i = 0; i < 1; '
    + 'out[out.length] = Promise === Shim, i++) { globalThis.Promise = Shim; continue; } r = out;', [true],
  ],
  [
    'deferred-loop-body', 'const Shim = function Shim() {}; let read; for (let i = 0; i < 1; '
    + 'globalThis.Promise = Shim, i++) { read = () => Promise; } r = read() === Shim;', true,
  ],
  [
    'deferred-loop-update', 'const Shim = function Shim() {}; let read; for (let i = 0; i < 1; '
    + 'read = () => Promise, i++) { globalThis.Promise = Shim; } r = read() === Shim;', true,
  ],
  [
    'assigned-capture-block', 'let prev = null; { let cur = "ab"; prev = cur; cur = Map; } r = prev.at(0);', 'a',
  ],
  [
    'assigned-capture-hoisted', 'let prev = null; init(); r = prev.at(0); function init() { let cur = "ab"; prev = cur; cur = Map; }', 'a',
  ],
];

// Import assertions observe default branches that the stripped manifest deliberately retains.
function checkGlobalImports(name, host, imports) {
  if (['written-default', 'escaped-default', 'pristine-default'].includes(name)) {
    check(`${ name }/${ host }/possible instance`, imports.has('core-js/modules/es.array.entries'), name !== 'pristine-default');
    check(`${ name }/${ host }/possible static`, imports.has('core-js/modules/es.object.entries'), true);
  }
  if (name === 'hoisted-write') check(`${ host }/reaching static`, imports.has('core-js/modules/es.promise.resolve'), true);
  else if (name === 'written-slot-late' || name === 'written-slot-shadow') {
    check(`${ name }/${ host }/still a static`, imports.has('core-js/modules/es.array.keys'), false);
  }
}

try {
  for (const [name, body, result] of cases) {
    const source = scenarioSource(`export let r; export const effects = []; ${ body }`);
    for (const method of ['usage-global', 'usage-pure']) {
      const options = { method, version: '4.0', targets: { ie: 11 } };
      const babel = (await transformAsync(source, {
        filename: 'input.mjs', configFile: false, babelrc: false, plugins: [[babelPlugin, options]],
      })).code;
      const plugin = createUnplugin(options);
      const single = createUnplugin(options).transform(source, 'input.mjs')?.code ?? source;
      const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
      const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
      check(`${ name }/${ method }/phase imports`, JSON.stringify([...importSet(post)].sort()), JSON.stringify([...importSet(single)].sort()));
      for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', single], ['pre+post', post]]) {
        if (host === 'native' && method === 'usage-pure') continue;
        const imports = importSet(output);
        if (host !== 'native' && method === 'usage-global') checkGlobalImports(name, host, imports);
        if (method === 'usage-pure' && (name === 'loop-default' || name === 'parameter-default')) {
          check(`${ name }/${ host }/static default import`, imports.has('@core-js/pure/actual/object/entries'), true);
        }
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, output);
        const expected = `OK|${ JSON.stringify(result) }|[]`;
        check(`${ name }/${ method }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host === 'native') continue;
        check(`${ name }/${ method }/${ host }/stripped`, await runInWorker(file), expected);
        // The general strip set keeps Symbol and its iterator methods together. This
        // separate realm exposes missing instance injection even on a modern Node.
        if (name.endsWith('default')) {
          const isolated = path.join(DIR, `missing-iterator-${ count }.mjs`);
          await fs.outputFile(isolated, `import ${ JSON.stringify(pathToFileURL(stripIterators).href) };\n`
            + `export * from ${ JSON.stringify(pathToFileURL(file).href) };`);
          check(`${ name }/${ method }/${ host }/missing iterator`, await runInWorker(isolated), expected);
        }
      }
    }
  }
} finally {
  await fs.remove(DIR);
}

finish();
