// A printed pre-pass must retain its receiver decisions, live defaults and source effects.
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
const { check, finish } = createChecker('phase-rewrite-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'phase-rewrite-'));
let count = 0;

const cases = [
  ['nested rest proxy', `function observe() { effects.push(typeof method); }
installRestProxy(observe);
const { Array: { from: method }, ...rest } = globalThis.window;
r.push(method([7])[0], rest.__proto__, Object.getPrototypeOf(rest) === Object.prototype, Object.hasOwn(rest, 'removed'));`,
  [7, 19, true, false], ['get Array', 'ownKeys', 'descriptor __proto__', 'get __proto__', 'function', 'descriptor removed'],
  `function installRestProxy(observe) {
  const source = { Array, get ['__proto__']() { observe(); delete this.removed; return 19; }, removed: 23 };
  self.window = new Proxy(source, {
    get(object, key) { effects.push('get ' + key); return object[key]; },
    ownKeys(object) { effects.push('ownKeys'); return Reflect.ownKeys(object); },
    getOwnPropertyDescriptor(object, key) { effects.push('descriptor ' + key); return Object.getOwnPropertyDescriptor(object, key); },
  });
}`],
  ['computed key changes constructor', `let method, custom; const sink = {};
({ Array: { isArray: sink.test, [(changeOwner(), 'fromAsync')]: method, custom } } = globalThis.window);
r.push(custom, typeof method);`, [11, 'function'], ['owner', 'key'],
  `const first = { isArray: Array.isArray, fromAsync: Array.fromAsync, custom: 11 };
const second = { ...first, custom: 29 };
let owner = first;
Object.defineProperty(self, 'window', { configurable: true, value: { get Array() { effects.push('owner'); return owner; } } });
function changeOwner() { effects.push('key'); owner = second; }`],
  ['single source for member target', `const sink = {}; ({ at: sink.method } = listSource);
r.push(sink.method.call([7], 0));`, [7], ['source'],
  `let reads = 0;
Object.defineProperty(self, 'listSource', { configurable: true, get() {
  effects.push('source');
  if (++reads > 1) throw new RangeError();
  return [3];
} });`],
  ['computed target', `let next;
const sink = { set method(value) { effects.push('write'); r.push(value({ a: 1 })[0][1]); } };
function key() { effects.push(typeof next); return 'method'; }
({ entries: sink[key()], values: next } = Object); r.push(next({ a: 2 })[0]);`, [1, 2], ['undefined', 'write']],
  ['computed target TS', `const sink: any = { set method(value) { effects.push('write'); r.push(value({ a: 1 })[0][1]); } };
let next; function key() { effects.push(typeof next); return 'method'; }
({ entries: (sink[key()] as any), values: next } = Object); r.push(next({ a: 2 })[0]);`, [1, 2], ['undefined', 'write']],
  ['native read after target', `let custom;
const sink = { set method(value) { effects.push('write'); r.push(value({ a: 1 })[0][1]); } };
function key() { effects.push('key'); return 'method'; }
({ entries: sink[key()], custom } = Object); r.push(custom);`, [1, 37], ['key', 'write', 'get'],
  'Object.defineProperty(Object, \'custom\', { configurable: true, get() { effects.push(\'get\'); return 37; } });'],
  ['native read before target', `let custom;
const sink = { set method(value) { effects.push('write'); r.push(value({ a: 1 })[0][1]); } };
function key() { effects.push('key'); return 'method'; }
({ custom, entries: sink[key()] } = Object); r.push(custom);`, [1, 37], ['get', 'key', 'write'],
  'Object.defineProperty(Object, \'custom\', { configurable: true, get() { effects.push(\'get\'); return 37; } });'],
  ['nested target retains constructor', `let from; const box = {};
({ Array: { [(effects.push('key'), 'from')]: from },
  Object: { keys: box[(effects.push('target'), 'value')] } }
  = (effects.push('source'), globalThis.window?.self));
r.push(from([7])[0], box.value({ x: 1 })[0]);`, [7, 'x'], ['source', 'key', 'function', 'target'],
  `self.window = self;
const nativeObject = Object;
Object.defineProperty(self, 'Object', { configurable: true, get() {
  effects.push(typeof from); return nativeObject;
} });`],
  ['nested target inside try', `function read(present) {
  setWindow(present);
  const dest = {}; let from;
  try {
    ({ Array: { [(effects.push('key'), 'from')]: from }, Object: { keys: dest[(effects.push('target'), 'key')] } }
      = (effects.push('source'), globalThis.window?.self));
    r.push(from([7])[0], dest.key({ x: 1 })[0]);
  } catch (error) { r.push(error.name); }
}
read(false); read(true);`, ['TypeError', 7, 'x'], ['source', 'source', 'key', 'target'],
  'function setWindow(present) { self.window = present ? self : undefined; }'],
  ['symbol receiver effects', 'r.push([4, 9][(effects.push(\'outer\'), Symbol)[(effects.push(\'inner\'), \'iterator\')]]().next().value);',
    [4], ['outer', 'inner']],
  ['symbol leaf default', `const { [Symbol.iterator]: { name: value = (effects.push('default'), [7].at(0)) } } = receiver;
r.push(value);`, [7], ['name', 'default'], `const receiver = {};
const method = function () {};
Object.defineProperty(method, 'name', { get() { effects.push('name'); return undefined; } });
receiver[Symbol.iterator] = method;`],
  ['symbol leaf multi declaration', `const before = 1, { [Symbol.iterator]: { name: value = (effects.push('default'), [7].at(0)) } } = receiver, after = 2;
r.push(before, value, after);`, [1, 7, 2], ['name', 'default'], `const receiver = {};
const method = function () {};
Object.defineProperty(method, 'name', { get() { effects.push('name'); return undefined; } });
receiver[Symbol.iterator] = method;`],
  ['IIFE supplied argument', 'r.push((({ from } = Array) => typeof from)(Set));', ['undefined'], []],
  ['IIFE supplied argument with default', 'r.push((({ from = [] } = Array) => typeof from)(Set));', ['object'], []],
  ['bound array key', `const KEY = 'at'; function read({ [KEY]: at } = [4, 9]) { return at.call([4, 9], -1); }
r.push(read(), read({ at() { return 23; } }));`, [9, 23], []],
  ['bound string key', `const KEY = 'at'; function read({ [KEY]: at } = 'ab') { return at.call('ab', -1); }
r.push(read(), read({ at() { return 'own'; } }));`, ['b', 'own'], []],
  ['loop nested default', 'for (const realm of [globalThis]) { const { Array: { prototype: { at } = fallback() } } = realm; r.push(typeof at); }',
    ['function'], [], '', ['undefined']],
  ['dead nested default', `const holder = { list: [1, 2] };
const { w: { y: { flat } } = (effects.push('default'), { y: [1] }), other } = { w: { y: holder.list }, other: 3 };
r.push(typeof flat, other);`, ['function', 3], [], '', ['undefined', 3]],
  ['native residual constructor', `let groupBy, own;
function make() { effects.push('call'); return { k: globalThis }; }
({ k: { Map: { groupBy, 0: own } } = globalThis || {} } = make());
r.push(typeof groupBy, own);`, ['function', 37], ['call', 'own'],
  'Object.defineProperty(Map, \'0\', { configurable: true, get() { effects.push(\'own\'); return 37; } });'],
  ['iterator return', `const array = Array.from([1, 2]); const iterator = array.entries();
r.push(iterator.filter(item => item[1] > 1).toArray());`, [[[1, 2]]], []],
  ['mixed lazy mirror', `function read({ fromAsync, name } = (() => globalThis)().self?.Array) { return [typeof fromAsync, name]; }
r.push(read());`, [['function', 'Array']], []],
  ['rest from a string with an inherited constructor', `const observe = () => typeof method;
const { Array: { from: method }, ...rest } = globalThis.window;
r.push(observe(), method([7])[0], rest[0], rest[1], Object.hasOwn(rest, 'Array'));`,
  ['function', 7, 'a', 'b', false], ['constructor'],
  `self.window = 'ab';
Object.defineProperty(String.prototype, 'Array', { configurable: true, get() { effects.push('constructor'); return Array; } });`],
];
const nativeReads = cases.filter(([name]) => name.startsWith('native read '));
for (const kind of ['var', 'let', 'const', 'assignment', 'computed leaf']) for (const throws of [false, true]) {
  const assignment = kind === 'assignment';
  const prior = assignment ? 'number' : kind === 'var' ? 'undefined' : 'ReferenceError';
  const outer = kind === 'computed leaf' ? 'Array' : "[(observe('key'), 'Array')]";
  const inner = assignment || kind === 'computed leaf' ? "[(observe('inner'), 'from')]" : 'from';
  const pattern = `{ ${ outer }: { ${ inner }: method }, ...rest }`;
  cases.push([`rest constructor order/${ kind }/${ throws }`, `let restore;
try {
  ${ assignment ? 'let method = 13, rest;' : '' }
  function observe(tag) {
    try { effects.push(tag + ':' + typeof method); }
    catch (error) { effects.push(tag + ':' + error.name); }
  }
  restore = installOwner(observe);
  ${ assignment ? `(${ pattern } = globalThis);` : `${ kind === 'computed leaf' ? 'const' : kind } ${ pattern } = globalThis;` }
  r.push(method([7])[0], Object.hasOwn(rest, 'Array'), rest[restSymbol], Object.hasOwn(rest, 'removedDuringCopy'));
} catch (error) { r.push(error.name); } finally { restore?.(); }`,
  throws ? ['RangeError'] : [7, false, 19, false],
  [...outer === 'Array' ? [] : [`key:${ prior }`], `get:${ prior }`,
    ...!throws && inner !== 'from' ? [`inner:${ prior }`] : [], ...throws ? [] : ['rest:function']],
  `const restSymbol = Symbol('rest');
function installOwner(observe) {
  const root = self;
  for (const key of Object.keys(root)) {
    if (Object.getOwnPropertyDescriptor(root, key).configurable) Object.defineProperty(root, key, { enumerable: false });
  }
  const original = Object.getOwnPropertyDescriptor(root, 'Array');
  Object.defineProperty(root, 'Array', { configurable: true, enumerable: true, get() {
    observe('get'); ${ throws ? 'throw new RangeError();' : 'return original.value;' }
  } });
  Object.defineProperty(root, 'firstDuringCopy', { configurable: true, enumerable: true, get() {
    observe('rest'); delete root.removedDuringCopy; return 11;
  } });
  root.removedDuringCopy = 17;
  root[restSymbol] = 19;
  return () => Object.defineProperty(root, 'Array', original);
}`]);
}
for (const [label, body, result, effects, setup] of nativeReads) {
  cases.push([`${ label }/plain target`, body.replace('sink[key()]', 'sink.method'), result, effects.filter(effect => effect !== 'key'), setup]);
}
for (const value of ['null', 'undefined', 'present']) {
  cases.push([`stored guard/${ value }`, `let held;
const answer = (held = globalThis.self.window?.Promise)?.resolve(1);
r.push(held === expected, typeof answer);`, [true, value === 'present' ? 'object' : 'undefined'], [],
  `const expected = ${ value === 'present' ? 'Promise' : 'undefined' };
Object.defineProperty(self, 'window', { configurable: true, value: ${ value === 'null' ? 'null' : '{ Promise: expected }' } });`]);
}
for (const selected of [false, true]) {
  cases.push([`prototype install/${ selected }`, `const receiver = { 0: 4, 1: 9, length: 2 };
(flag ? Object : Reflect).setPrototypeOf(receiver, Array.prototype);
r.push(receiver.at(-1));`, [9], [], `const flag = ${ selected };`], [`realm selection/${ selected }`, `let isInteger;
({ Number: { isInteger } = {} } = ${ selected } && globalThis); r.push(typeof isInteger);`,
  [selected ? 'function' : 'undefined'], []], [`opaque realm selection/${ selected }`, `let isInteger;
({ Number: { isInteger } = {} } = flag && globalThis); r.push(typeof isInteger);`,
  [selected ? 'function' : 'undefined'], [], `const flag = ${ selected };`], [`consumed realm selection/${ selected }`, `let isInteger;
const consumed = ({ Number: { isInteger } = {} } = flag && globalThis);
r.push(typeof isInteger, typeof consumed);`, [selected ? 'function' : 'undefined', selected ? 'object' : 'boolean'], [],
  `const flag = ${ selected };`, ['undefined', selected ? 'object' : 'boolean']]);
}

try {
  for (const [name, body, result, effects, setup = '', strippedResult = result] of cases) {
    const source = `export const r = [], effects = []; ${ body }`;
    scenarioSource(source);
    const options = name.startsWith('prototype install/') ? { ...OPTIONS, targets: { firefox: 30 } } : OPTIONS;
    const filename = name.endsWith('TS') ? 'input.ts' : 'input.mjs';
    const erase = filename.endsWith('.ts') ? [requireBabel.resolve('@babel/plugin-transform-typescript')] : [];
    function transform(code, plugins) {
      return transformAsync(code, { configFile: false, babelrc: false, filename, plugins });
    }
    const babel = (await transform(source, [[babelPlugin, options], ...erase])).code;
    const plugin = createUnplugin(options);
    const pre = plugin.transform(source, filename, 'pre')?.code ?? source;
    const pair = plugin.transform(pre, filename, 'post')?.code ?? pre;
    const outputs = [
      ['native', (await transform(source, erase)).code],
      ['babel', babel],
      ['babel twice', (await transform(babel, [[babelPlugin, options], ...erase])).code],
      ['unplugin', pre], ['unplugin pre+post', pair],
      ['unplugin fresh', createUnplugin(options).transform(pre, filename)?.code ?? pre],
    ];
    check(`${ name }/phase imports`, JSON.stringify([...importSet(pair)].sort()), JSON.stringify([...importSet(pre)].sort()));
    // Lower the printed pair, so both a fresh parse and downstream destructuring/optional
    // transforms see exactly the program a bundler receives.
    outputs.push(['unplugin lowered', (await transform(pair, [
      ...erase, requireBabel.resolve('@babel/plugin-transform-optional-chaining'),
      requireBabel.resolve('@babel/plugin-transform-destructuring'),
    ])).code]);
    for (const [host, output] of outputs) {
      const code = host === 'unplugin' || host === 'unplugin pre+post' || host === 'unplugin fresh'
        ? (await transform(output, erase)).code : output;
      const file = path.join(DIR, `case-${ count++ }.mjs`);
      await fs.outputFile(file, `${ setup }\n${ code }`);
      // Babel's standalone destructuring lowering moves this target key before the
      // constructor getter. Keep its count and preceding write observable here;
      // every output before that external lowering retains the exact native order.
      // https://github.com/babel/babel/issues/18359
      const externalTargetOrder = name === 'nested target retains constructor' && host === 'unplugin lowered';
      function observed(key) {
        if (!externalTargetOrder || !key.startsWith('OK|')) return key;
        const [status, value, observedEffects] = key.split('|', 3);
        const events = JSON.parse(observedEffects);
        return `${ status }|${ value }|${ JSON.stringify([
          ...events.filter(effect => effect !== 'target'), ...events.filter(effect => effect === 'target'),
        ]) }`;
      }
      check(`${ name }/${ host }/full`, observed(await runInWorker(file, { strip: false })),
        `OK|${ JSON.stringify(result) }|${ JSON.stringify(effects) }`);
      if (host !== 'native') check(`${ name }/${ host }/stripped`, observed(await runInWorker(file)),
        `OK|${ JSON.stringify(strippedResult) }|${ JSON.stringify(effects) }`);
    }
  }
} finally {
  await fs.remove(DIR);
}
// Deferred entry removal must not leave await/import syntax dependencies behind.
// Independent user awaits and effects in the entry prefix still own their imports.
for (const [name, source, promise] of [
  ['entry await', "await import('core-js/modules/es.array.from'); Array.from([]);", false],
  ['user await', "await import('./user.mjs'); Array.from([]);", true],
  ['two owned awaits', "await import('core-js/modules/es.array.from'); await import('core-js/modules/es.array.of');", false],
  ['owned and user await', "await import('core-js/modules/es.array.from'); await import('./user.mjs');", true],
  ['live prefix', "await (Promise.resolve(1), import('core-js/modules/es.array.from')); Array.from([]);", true],
]) {
  const options = { ...OPTIONS, method: 'usage-global' };
  const plugin = createUnplugin(options);
  const pre = plugin.transform(source, 'entry.mjs', 'pre')?.code ?? source;
  const post = plugin.transform(pre, 'entry.mjs', 'post')?.code ?? pre;
  const single = createUnplugin(options).transform(source, 'entry.mjs')?.code ?? source;
  check(`${ name }/final imports`, JSON.stringify([...importSet(post)].sort()), JSON.stringify([...importSet(single)].sort()));
  check(`${ name }/promise dependency`, /modules\/es\.promise\.constructor/.test(post), promise);
}

finish();
