// Execute the same source and both generated programs in fresh realms. The observer is
// outside the transform so getters and earlier writes remain visible even to closed-call analysis.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href) : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('object-destructuring-order');
async function outputs(source, method, script = false) {
  const options = { method, version: '4.0', targets: { ie: 11 } };
  const filename = script ? 'input.cjs' : 'input.mjs';
  const babel = await transformAsync(source, { configFile: false, babelrc: false, filename,
    sourceType: script ? 'script' : 'module', plugins: [[babelPlugin, options]] });
  const plugin = createUnplugin(options);
  const first = plugin.transform(source, filename)?.code ?? source;
  return [['native', source], ['babel', babel.code], ['unplugin', first], ['second-pass', plugin.transform(first, filename, 'post')?.code ?? first]];
}

for (const method of ['usage-pure', 'usage-global']) for (const [statement, value] of [
  ['(({ x } = { x: 5 }), 7);', 7],
  ['if (true) (({ x } = { x: 5 }), "done");', 'done'],
  ['(({ x } = { x: 5 }), (({ x } = { x: 9 }), 0));', 0],
  ['(({ x } = { x: 5 }), "use strict"); function sloppy() { return this !== undefined; } sloppy();', true],
]) {
  for (const [host, code] of await outputs(`var x; ${ statement }`, method, true)) {
    check(`completion/${ method }/${ host }/${ statement }`, runInNewContext(code), value);
  }
}

for (const conditional of [false, true]) {
  const write = 'Leaf.C = { groupBy(xs) { return xs; } };';
  const source = 'class Base { static C = Map; } class Leaf extends Base {} '
    + `${ conditional ? 'if (flag) ' : '' }${ write } Leaf.C.groupBy([3], String);`;
  for (const [host, code] of await outputs(source, 'usage-global')) {
    if (host !== 'native') check(`inherited field import/${ conditional }/${ host }`, code.includes('es.map.group-by'), conditional);
  }
}

const cases = [
  ['bodyless computed global', 'const order = []; if (true) var { [(order.push(typeof P), "Promise")]: P } = globalThis; return [order, typeof P];',
    'read()', [['undefined'], 'function']],
  ['computed global', 'const order = []; var { [(order.push(typeof P), "Promise")]: P } = globalThis; return [order, typeof P];',
    'read()', [['undefined'], 'function']],
  ['const in computed key', 'try { const { [(note(typeof P), "Promise")]: P } = globalThis; return P; } catch (e) { return e.name; }',
    'read()', 'ReferenceError', 'globalThis.note = () => {};'],
  ['member address', 'const sink = {}; try { ({ at: sink[key()] } = box.rows); return sink.m.call([5], 0); } catch (e) { return e.name; }',
    'read()', 5, 'globalThis.box = { get rows() { effects.push("rows"); return [3]; } }; globalThis.key = () => (effects.push("key"), "m");',
    ['rows', 'key'], 'delete Array.prototype.at;'],
  ['abrupt source', 'try { ({ at: target[key()] } = box.rows); } catch (e) { return e.name; }',
    'read()', 'RangeError', 'globalThis.box = { get rows() { effects.push("rows"); throw RangeError(); } }; globalThis.key = () => effects.push("key");',
    ['rows']],
  ['nested target', '({ row: { at: holder.slot.method } } = box); return saved.method.call([7], 0);', 'read()', 7,
    'globalThis.saved = {}; globalThis.holder = { get slot() { effects.push("target"); return saved; } }; '
    + 'globalThis.box = { get row() { effects.push("row"); return [3]; } };', ['row', 'target'], 'delete Array.prototype.at;'],
  ['computed nested destination', 'const box = {}; try { ({ row: { at: box[key()] } } = source.value); '
    + 'return box.fn.call([3], 0); } catch (e) { return e.name; }', 'read()', 3,
  'globalThis.source = { get value() { effects.push("source"); return { row: [9] }; } }; '
    + 'globalThis.key = () => (effects.push("key"), "fn");', ['source', 'key'], 'delete Array.prototype.at;'],
  ['stored value', 'let at; ({ items: { at } } = holder.slot = { items: [] }); return at.call([2], 0);', 'read()', 17,
    'globalThis.holder = { set slot(v) { effects.push("set"); v.items.at = () => 17; } };', ['set'], 'delete Array.prototype.at;'],
  ['static between getters', 'let from, of, label; watch(() => [typeof from, typeof of]); ({ from, label, of } = Array); return label;',
    'read()', ['function', 'undefined'], 'globalThis.watch = get => Object.defineProperty(Array, "label", { get });', [], 'delete Array.from; delete Array.of;'],
  ['nested static anchor', 'let g, value; watch(() => typeof g); function mk() { return { k: globalThis }; } '
    + '({ k: { Map: { groupBy: g, 0: value } } = globalThis } = mk()); return [value, typeof g];', 'read()', ['function', 'function'],
  'globalThis.watch = get => Object.defineProperty(Map, 0, { get });', [], 'delete Map.groupBy;'],
  ['written constructor sibling', 'let group, value; function mk() { return { k: globalThis }; } const box = mk(); '
    + 'Object.defineProperty(Map, "orderProbe", { configurable: true, get() { effects.push(typeof group); '
    + 'if (flag) throw RangeError(); return 17; } }); '
    + 'try { return [(({ k: { Map: { groupBy: group, orderProbe: value } } } = box) === box), value]; } '
    + 'catch (e) { return e.name; }', '[read(false), read(true)]', [[true, 17], 'RangeError'], '', ['function', 'function'], 'delete Map.groupBy;'],
  ['written and native constructor siblings', 'let group, first, second; function mk() { return { k: globalThis }; } '
    + 'watch(() => typeof group); Object.defineProperty(Map, "ownedOrder", { get() { return 19; } }); '
    + '({ k: { Map: { groupBy: group, ownedOrder: first, outsideOrder: second } } } = mk()); return [first, second];',
  'read()', [19, 'function'], 'globalThis.watch = get => Object.defineProperty(Map, "outsideOrder", { get });', [], 'delete Map.groupBy;'],
  ['rest after key', 'function key() { effects.push(typeof fromEntries); } watch(() => effects.push(typeof fromEntries)); '
    + 'var { [(key(), "Object")]: { fromEntries }, ...other } = globalThis; return [typeof fromEntries, "Object" in other];',
  'read()', ['function', false], 'globalThis.watch = get => Object.defineProperty(globalThis, "watched", { enumerable: true, get });',
  ['undefined', 'function'], 'delete Object.fromEntries;'],
  ['rest after abrupt nested read', 'let rest, value; try { ({ Object: { missing: { value }, fromEntries: sink.method, ...rest } } = globalThis); } '
    + 'catch (e) { return e.name; }', 'read()', 'TypeError', 'globalThis.sink = { set method(v) { effects.push(typeof v); } };', [], 'delete Object.fromEntries;'],
  ['later argument', 'return (({ entries }) => entries)(flag ? Object : user, after());', 'exercise(read)', [1, 'function'],
    'globalThis.exercise = use => { let n = 0; const user = { get entries() { return n; } }; return [use(false, user, () => ++n), typeof use(true, user, () => ++n)]; };',
    [], 'delete Object.entries;'],
  ['earlier parameter', 'return ((x = after(), { entries }) => entries)(undefined, flag ? Object : user);', 'exercise(read)', [1, 'function'],
    'globalThis.exercise = use => { let n = 0; const user = { get entries() { return n; } }; return [use(false, user, () => ++n), typeof use(true, user, () => ++n)]; };',
    [], 'delete Object.entries;'],
  ['stored selection', 'let assigned; const local = { Array: { from: () => [8] } }; '
    + 'const { Array: { from } } = flag ? (assigned = user || globalThis) : local; return [from([3]), assigned === user];',
  '[read(true, null), read(true, { Array: { from: () => [7] } }), read(false, null)]', [[[3], false], [[7], true], [[8], false]],
  '', [], 'delete Array.from;'],
  ['member beside selected default', 'const sink = {}; let method; const shim = globalThis.orderShim; '
    + '({ held: { Array: { from: method }, Object: { keys: sink.keys } } = (effects.push("default"), shim || globalThis) } = {}); '
    + 'return [method([2])[0], sink.keys({ r: 1 })];',
  'exercise(read)', [[9, ['custom']], [2, ['r']]],
  'globalThis.exercise = use => { globalThis.orderShim = { Array: { from: () => [9] }, Object: { keys: () => ["custom"] } }; '
    + 'const custom = use(); globalThis.orderShim = null; return [custom, use()]; };', ['default', 'default'], 'delete Array.from;'],
  ['native nested read', 'const { from, deep: { x }, later } = globalThis.Array || {}; return [from([1]), x, later];',
    'read()', [[1], 4, 8], 'Object.defineProperty(Array, "deep", { get() { effects.push("deep"); return { get x() { effects.push("x"); return 4; } }; } }); '
    + 'Object.defineProperty(Array, "later", { get() { effects.push("later"); return 8; } });', ['deep', 'x', 'later'], 'delete Array.from;'],
  ['inherited class field', 'class Base { static Collection = Map; } class Derived extends Base {} return Derived.Collection.groupBy([7], String).get("7");',
    'read()', [7], '', [], 'delete Map.groupBy;', 'usage-global'],
  ['conditional inherited class field', 'class Base { static C = Map; } class Leaf extends Base {} '
    + 'if (flag) Leaf.C = { groupBy() { effects.push(this === Leaf.C); return new Map([["k", [19]]]); } }; '
    + 'return Leaf.C.groupBy([4], () => "k").get("k")[0];',
  '[read(false), read(true)]', [4, 19], '', [true], 'delete Map.groupBy;', 'usage-global'],
  ['inherited setter keeps its getter', 'class Base { static get C() { return Map; } static set C(value) { effects.push(value); } } '
    + 'class Leaf extends Base {} Leaf.C = 3; return Leaf.C.groupBy([4], String).get("4");',
  'read()', [4], '', [3], 'delete Map.groupBy;', 'usage-global'],
  ['getter receiver', 'const owner = { collection: Map, get selected() { return this.collection; } }; return owner.selected.groupBy([8], String).get("8");',
    'read()', [8], '', [], 'delete Map.groupBy;', 'usage-global'],
  ['assignment through retained getter', 'let value; const data = { get held() { effects.push("held"); return flag ? Object : Map; } }; '
    + '({ held: value } = data); const result = value.groupBy([5], () => "k"); return flag ? result.k : result.get("k");',
  '[read(false), read(true)]', [[5], [5]], '', ['held', 'held'], 'delete Object.groupBy; delete Map.groupBy;', 'usage-global'],
  ['getter-local owner in an assignment', 'let value; const data = { get held() { const Map = { groupBy() { return 9; } }; '
    + 'effects.push("held"); return flag ? Object : Map; } }; ({ held: value } = data); '
    + 'const result = value.groupBy([3], String); return flag ? result[3][0] : result;',
  '[read(false), read(true)]', [9, 3], '', ['held', 'held'], 'delete Object.groupBy; delete Map.groupBy;', 'usage-global'],
  ['inherited default', 'const base = { group: Object }; const { group: { groupBy } = Map } = { __proto__: base }; return groupBy([9], String)[9];',
    'read()', [9], '', [], 'delete Map.groupBy; delete Object.groupBy;', 'usage-global'],
];

const base = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(base);
const directory = await fs.mkdtemp(path.join(base, 'object-order-'));
try {
  let index = 0;
  for (const [name, body, call, expected, setup = '', effects = [], strip = '', method = 'usage-pure'] of cases) {
    const source = scenarioSource(`export function read(flag, user, after) { ${ body } }`);
    for (const [host, code] of await outputs(source, method)) {
      const file = path.join(directory, `subject-${ index++ }.mjs`);
      await fs.writeFile(file, code);
      for (const removed of host === 'native' || !strip ? [false] : [false, true]) {
        const driver = path.join(directory, `driver-${ index++ }.mjs`);
        // Node initializes fetch through undici, which itself uses Object.fromEntries.
        const warm = strip.includes('Object.fromEntries') ? 'void globalThis.Headers;' : '';
        await fs.writeFile(driver, `export const effects = globalThis.effects = []; ${ warm } ${ removed ? strip : '' }
          ${ setup }
          const { read } = await import(${ JSON.stringify(pathToFileURL(file).href) });
          export const r = ${ call };`);
        check(`${ name }/${ host }/${ removed }`, await runInWorker(driver, { strip: false }),
          `OK|${ JSON.stringify(expected) }|${ JSON.stringify(effects) }`);
      }
    }
  }
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
finish();
