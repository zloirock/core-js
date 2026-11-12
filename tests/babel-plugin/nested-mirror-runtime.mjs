// Nested mirrors keep relocated slots, live defaults and deferred instance reads.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transform as lower } from '@swc/core';
import { parse } from 'oxc-parser';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { strip as structural } from '../unplugin/structural.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('nested-mirror-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'nested-mirror-'));
const cases = [];

for (const kind of ['const', 'assign']) for (const first of [false, true]) {
  const pattern = first ? '{ userList: { at }, Map: M }' : '{ Map: M, userList: { at } }';
  cases.push([`loop-user/${ kind }/${ first }`, `
    globalThis.userList = [1, 7];
    function read(user) {
      ${ kind === 'assign' ? 'let at, M;' : '' }
      for (${ kind === 'assign' ? '' : kind } ${ pattern } of [user || globalThis]) return [at.call(globalThis.userList, -1), typeof M];
    }
    const result = read(undefined);
    delete globalThis.userList;
    return result;
  `, [7, 'function']]);
}

for (const pattern of [
  '{ globalThis: { [key]: value, Array: { from } } }',
  '{ globalThis: { Array: { prototype: { at } } }, Object: o }',
  '{ globalThis: { Array: { prototype: { at }, from } } }',
]) {
  const result = pattern.includes('value') ? '[typeof value, from([7])[0]]'
    : pattern.includes('Object:') ? '[at.call([7], 0), typeof o]' : '[at.call([7], 0), from([8])[0]]';
  cases.push([`loop-realm/${ cases.length }`, `
    function read(key) { for (const ${ pattern } of [globalThis]) return ${ result }; }
    return read('Object');
  `, pattern.includes('value') ? ['function', 7] : pattern.includes('Object:') ? [7, 'function'] : [7, 8]]);
}

for (const value of ['undefined', 'null', '[9]']) for (const caller of [false, true]) cases.push([
  `default/${ value }/${ caller }`, `
    function fallback() { effects.push('default'); return [7]; }
    function read(box) {
      function use({ y: { at } = fallback() }${ caller ? '' : ' = { y: box.list }' }) { return at.call([11], 0); }
      try { return use(${ caller ? '{ y: box.list }' : '' }); } catch (error) { return error.name; }
    }
    return read({ get list() { effects.push('slot'); return ${ value }; } });
  `, value === 'null' ? 'TypeError' : 11, value === 'undefined' ? ['slot', 'default'] : ['slot'],
]);

cases.push(['lazy/key-order', `
  function read(source) {
    function use({ y: { [(effects.push('key'), 'at')]: at } } = { y: source }) { return at; }
    return use();
  }
  return read({ get at() { effects.push('read'); return 17; } });
`, 17, ['key', 'read']]);

for (const first of [false, true]) for (const host of ['iife', 'default', 'caller']) {
  const pattern = first ? '{ userList: { at }, Map: M }' : '{ Map: M, userList: { at } }';
  const body = 'return [at.call(globalThis.userList, -1), typeof M];';
  cases.push([`parameter/${ host }/${ first }`, `
    globalThis.userList = [1, 7];
    function read(user) {
      ${ host === 'iife' ? `return ((${ pattern }) => { ${ body } })(user || globalThis);`
    : `function use(${ pattern }${ host === 'default' ? ' = user || globalThis' : '' }) { ${ body } }
      return use(${ host === 'caller' ? 'user || globalThis' : '' });` }
    }
    const result = read(undefined);
    delete globalThis.userList;
    return result;
  `, [7, 'function']]);
}

for (const kind of ['let', 'var', 'assign']) for (const count of [1, 2]) {
  const pattern = '{ globalThis: { Array: { prototype: { at }, from } } }';
  cases.push([`repeated-head/${ kind }/${ count }`, `
    const out = [];
    ${ kind === 'assign' ? 'let at, from;' : '' }
    for (${ kind === 'assign' ? '' : kind } ${ pattern } of [${ Array(count).fill('globalThis').join(', ') }]) out.push(at.call(from([7]), 0));
    return out;
  `, Array(count).fill(7)]);
}

for (const host of ['loop', 'iife', 'default']) cases.push([`receiver-read-turn/${ host }`, `
  let list = [7];
  Object.defineProperty(globalThis, 'userList', { configurable: true, get() { effects.push('slot'); return list; } });
  function later() { effects.push('later'); list = [9]; return 1; }
  function read(user) {
    ${ host === 'loop' ? 'for (const { userList: { at }, Map: M } of (later(), [user || globalThis])) return [at.call(list, 0), typeof M];'
  : host === 'iife' ? 'return (({ userList: { at }, Map: M }, other) => [at.call(list, 0), typeof M])(user || globalThis, later());'
    : 'function use({ userList: { at }, Map: M } = user || globalThis, other = later()) { return [at.call(list, 0), typeof M]; } return use();' }
  }
  const result = read(undefined);
  delete globalThis.userList;
  return result;
`, [9, 'function'], host === 'default' ? ['slot', 'later'] : ['later', 'slot']]);

for (const depth of [1, 2]) cases.push([`lazy/imported/${ depth }`, `
  reset(effects);
  function read(${ depth === 1 ? '{ y: { [(key(), "at")]: at } } = { y: source }'
    : '{ y: { z: { [(key(), "at")]: at } } } = { y: { z: source } }' }) { return at; }
  return read();
`, 17, ['key', 'read'], 'import { source, key, reset } from \'./mirror-data.mjs\';']);

for (const value of ['undefined', 'null', '[7]']) cases.push([`user-slot-default/${ value }`, `
  Object.defineProperty(globalThis, 'userList', { configurable: true, get() { effects.push('slot'); return ${ value }; } });
  function fallback() { effects.push('default'); return [9]; }
  function use({ userList: { at, includes } = fallback(), Map: M } = globalThis, other = effects.push('later')) {
    return [at.call([7], 0), includes.call([7], 7), typeof M];
  }
  try { return use(); } catch (error) { return error.name; } finally { delete globalThis.userList; }
`, value === 'null' ? 'TypeError' : [7, true, 'function'],
value === 'null' ? ['slot'] : value === 'undefined' ? ['slot', 'default', 'later'] : ['slot', 'later']]);

cases.push(['user-slot-iterations', `
  let list = [7];
  Object.defineProperty(globalThis, 'userList', { configurable: true, get() { effects.push('slot'); return list; } });
  const out = [];
  try {
    for (const { userList: { at, includes }, Map: M } of [globalThis, globalThis]) {
      out.push([at.call(list, 0), includes.call(list, 7), typeof M]);
      effects.push('body'); list = [9];
    }
    return out;
  } finally { delete globalThis.userList; }
`, [[7, true, 'function'], [9, false, 'function']], ['slot', 'body', 'slot', 'body']]);

for (const receiver of ['own', 'globalThis']) cases.push([`supplied-user/${ receiver }`, `
  const list = [7];
  globalThis.userList = list;
  const own = { get userList() { effects.push('own-slot'); return { at() { return 23; } }; }, Map: 41 };
  function read(user) { return (({ userList: { at }, Map: M }) => [at.call(list, 0), typeof M])(user); }
  try { return read(${ receiver }); } finally { delete globalThis.userList; }
`, receiver === 'own' ? [23, 'number'] : [7, 'function'], receiver === 'own' ? ['own-slot'] : []]);

cases.push(['literal-head', `
  for (const { w: { prototype: { at, includes } } } of [{ w: Array }]) return [at.call([7], 0), includes.call([7], 7)];
`, [7, true]], ['native-static-miss', `
  return (({ Promise: P, Array: { at } } = globalThis) => [typeof P, typeof at])();
`, ['function', 'undefined']]);

for (const host of ['iife', 'loop']) cases.push([`foreign-user-slot/${ host }`, `
  install(effects);
  function read(user) {
    ${ host === 'iife'
    ? 'return (({ userList: { at }, Map: M }, other) => [at, typeof M, other])(user || globalThis, later());'
    : 'for (const { userList: { at }, Map: M } of (later(), [user || globalThis])) return [at, typeof M, 1];' }
  }
  try { return read(); } finally { cleanup(); }
`, [17, 'function', 1], ['later', 'slot', 'read'], 'import { install, later, cleanup } from \'./mirror-data.mjs\';']);

for (const throwing of ['slot', 'default']) cases.push([`nested-throw/${ throwing }`, `
  function fallback() { effects.push('default'); throw new RangeError('fallback'); }
  function read(box) {
    function use({ y: { at, includes } = fallback() } = { y: box.list }, later = effects.push('later')) {
      return [at, includes, later];
    }
    try { return use(); } catch (error) { return error.name; }
  }
  return read({ get list() { effects.push('slot'); ${ throwing === 'slot' ? "throw new SyntaxError('slot');" : '' } } });
`, throwing === 'slot' ? 'SyntaxError' : 'RangeError', throwing === 'slot' ? ['slot'] : ['slot', 'default']]);

// Native getters stay at each binding's turn, including repeated reads of one slot.
for (const [pattern, result, expected, events] of [
  ['Array: { of }, nativeSlot: value', '[of(7)[0], value]', [7, 17], ['slot']],
  ['Array: { of }, [(hit(), "with-dash")]: other, nativeSlot: value', '[of(7)[0], other, value]', [7, 19, 17], ['key', 'dash', 'slot']],
  ['nativeSlot: value, [(hit(), "Array")]: { of }', '[of(7)[0], value]', [7, 17], ['slot', 'key']],
  ['Array: { [(hit(), "of")]: of }, nativeSlot: value', '[of(7)[0], value]', [7, 17], ['key', 'slot']],
  ['Array: { of }, nativeSlot: value, nativeSlot: again', '[of(7)[0], value, again]', [7, 17, 18], ['slot', 'slot']],
]) cases.push([`native-mirror-order/${ pattern }`, `
  const cleanup = installOrder(effects);
  function hit() { effects.push('key'); }
  try { const [{ ${ pattern } } = globalThis] = []; return ${ result }; } finally { cleanup(); }
`, expected, events, 'import { installOrder } from \'./mirror-data.mjs\';']);

for (const assign of [false, true]) cases.push([`native-binding-order/${ assign }`, `
  let cleanup;
  ${ assign ? 'let of, value;' : '' }
  try {
    cleanup = installOrder(effects, () => typeof of);
    ${ assign ? '([{ Array: { of }, nativeSlot: value } = globalThis] = []);' : 'const [{ Array: { of }, nativeSlot: value } = globalThis] = [];' }
    return [of(7)[0], value];
  } finally { cleanup(); }
`, [7, 17], ['slot', 'function'], "import { installOrder } from './mirror-data.mjs';"]);

// Only the outer data read is movable. Its nested getter observes the preceding
// binding write; a real outer accessor must observe that write too.
for (const assign of [false, true]) for (const accessor of [false, true]) cases.push([
  `data-slot/${ assign }/${ accessor }`, `
    ${ assign ? 'let C = 0, value;' : '' }
    const slot = { get x() { effects.push('inner'); return typeof C; } };
    Object.defineProperty(globalThis, 'mirrorDataSlot', { configurable: true,
      ${ accessor ? 'get() { effects.push(typeof C); return slot; }' : 'value: slot' }
    });
    ${ assign ? '({ Set: C, mirrorDataSlot: { x: value } } = globalThis);'
    : 'const { Set: C, mirrorDataSlot: { x: value } } = globalThis;' }
    delete globalThis.mirrorDataSlot;
    return [typeof C, value];
  `, ['function', 'function'], accessor ? ['function', 'inner'] : ['inner'],
]);

for (const prefix of ['key', 'default', 'setter']) cases.push([`data-slot-effects/${ prefix }`, `
  let C, value, ignored;
  const sink = { set value(v) { change(); } };
  function change() { effects.push('change'); globalThis.mirrorDataSlot = { x: 19 }; return 'mirrorDataSlot'; }
  Object.defineProperty(globalThis, 'mirrorDataSlot', { configurable: true, writable: true, value: { x: 17 } });
  ${ prefix === 'key' ? '({ Set: C, [(change(), "mirrorDataSlot")]: { x: value } } = globalThis);'
  : prefix === 'default' ? '({ Set: C, undefined: ignored = change(), mirrorDataSlot: { x: value } } = globalThis);'
    : '({ Set: sink.value, mirrorDataSlot: { x: value } } = globalThis);' }
  delete globalThis.mirrorDataSlot;
  return value;
`, 19, ['change']]);

await fs.outputFile(path.join(DIR, 'mirror-data.mjs'), `
import realm from '@core-js/pure/actual/global-this';
let events;
export function reset(value) { events = value; }
export function key() { events.push('key'); }
export const source = { get at() { events.push('read'); return 17; } };
export function install(value) {
  events = value;
  Object.defineProperty(realm, 'userList', { configurable: true, get() { events.push('slot'); return source; } });
}
export function later() { events.push('later'); return 1; }
export function cleanup() { delete realm.userList; }
export function installOrder(log, peek) {
  let reads = 17;
  Object.defineProperty(realm, 'nativeSlot', { configurable: true, get() { log.push('slot'); if (peek) log.push(peek()); return reads++; } });
  Object.defineProperty(realm, 'with-dash', { configurable: true, get() { log.push('dash'); return 19; } });
  return () => { delete realm.nativeSlot; delete realm['with-dash']; };
}
`);
let index = 0;
try {
  for (const [name, body, expected, events = [], prelude = ''] of cases) {
    const source = ` ${ prelude } export const effects = []; export const r = (() => { ${ body } })();`;
    const babel = (await transformAsync(source, {
      filename: 'input.mjs', configFile: false, babelrc: false, plugins: [[babelPlugin, OPTIONS]],
    })).code;
    const plugin = createUnplugin(OPTIONS);
    const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
    const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
    if (name.startsWith('lazy/imported/')) {
      check(`${ name }/stable lazy claims`, JSON.stringify(structural((await parse('input.mjs', post)).program)),
        JSON.stringify(structural((await parse('input.mjs', pre)).program)));
    }
    for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', pre], ['pre+post', post]]) {
      for (const lowered of host === 'native' ? [false] : [false, true]) {
        const code = lowered ? (await lower(output, {
          jsc: { parser: { syntax: 'ecmascript' }, target: 'es2015' }, module: { type: 'es6' },
        })).code : output;
        const file = path.join(DIR, `case-${ index++ }.mjs`);
        await fs.outputFile(file, code);
        for (const strip of host === 'native' ? [false] : [false, true]) {
          check(`${ name }/${ host }/${ lowered }/${ strip }`, await runInWorker(file, { strip }),
            `OK|${ JSON.stringify(expected) }|${ JSON.stringify(events) }`);
        }
      }
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();
