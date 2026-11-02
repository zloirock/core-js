// An unclaimed hop retains its source default, getters and throws. Foreign setup runs
// after imports; transformed source cannot mistake these runtime values for mutation facts.
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
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
const runChild = promisify(execFile);
const { check, finish } = createChecker('anchor-activation-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, exclude: ['self'] };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'anchor-activation-'));
let count = 0;

async function transformOutputs(source, options = OPTIONS, parserOpts = {}) {
  const { code: babel } = await transformAsync(source, {
    configFile: false, babelrc: false, filename: 'input.mjs', parserOpts, plugins: [[babelPlugin, options]],
  });
  const unplugin = createUnplugin(options).transform(source, 'input.mjs')?.code ?? source;
  const outputs = [['native', source], ['babel', babel], ['unplugin', unplugin]];
  for (const [host, output] of outputs.slice(1)) {
    const { code } = await transformAsync(output, {
      configFile: false, babelrc: false,
      plugins: [
        requireBabel.resolve('@babel/plugin-transform-optional-chaining'),
        requireBabel.resolve('@babel/plugin-transform-object-rest-spread'),
        requireBabel.resolve('@babel/plugin-transform-destructuring'),
      ],
    });
    outputs.push([`${ host }/lowered`, code]);
  }
  return outputs;
}

try {
  // The loader must survive without Promise, while the source and cold ponyfill imports
  // still see its absence. Loading a polyfill before the strip would make this vacuous.
  const loaderState = path.join(DIR, 'loader-state.cjs');
  await fs.outputFile(loaderState, 'exports.r = [typeof Promise, typeof globalThis, typeof self];');
  const loaderProbe = path.join(DIR, 'loader-probe.mjs');
  await fs.outputFile(loaderProbe, `import state from './loader-state.cjs';
export const r = state.r;
export const effects = [];`);
  const stripped = { nativeAlias: false, stripGlobals: ['Promise', 'globalThis', 'Iterator'] };
  check('loader/full', await runInWorker(loaderProbe, { strip: false, nativeAlias: false }), 'OK|["function","object","undefined"]|[]');
  check('loader/stripped', await runInWorker(loaderProbe, stripped), 'OK|["undefined","undefined","undefined"]|[]');
  const promiseProbe = path.join(DIR, 'promise-probe.mjs');
  await fs.outputFile(promiseProbe, `import PurePromise from '@core-js/pure/actual/promise';
import state from './loader-state.cjs';
export const r = [state.r, await new PurePromise(resolve => resolve(17))];
export const effects = [];`);
  check('loader/cold ponyfill', await runInWorker(promiseProbe, stripped), 'OK|[["undefined","undefined","undefined"],17]|[]');
  await fs.outputFile(promiseProbe, 'export const r = Promise.resolve(17); export const effects = [];');
  check('loader/missed import', await runInWorker(promiseProbe, stripped), 'ERR|ReferenceError');
  for (const shape of [
    'declaration', 'assignment', 'captured', 'for-init', 'prefix', 'stored', 'guarded', 'rest',
    'constructor', 'guarded-constructor', 'computed-constructor', 'nested-computed-constructor',
    'used-constructor', 'used-computed-constructor',
  ]) {
    const constructor = shape.endsWith('constructor');
    const computed = shape.endsWith('computed-constructor');
    const used = shape.startsWith('used-');
    const guarded = shape === 'guarded' || shape === 'guarded-constructor';
    // Map is a runtime prerequisite; these rows isolate the assignment's result value.
    const pattern = shape === 'nested-computed-constructor' ? '{ globalThis: { [proxyKey]: { [ctorKey]: { prototype } } } }'
      : computed ? '{ [proxyKey]: { [ctorKey]: { prototype } } }'
      : used ? '{ self: { Map: { prototype } } }'
      : constructor ? '{ Promise: { prototype } }'
      : `{ Array: { unknown${ shape === 'rest' ? ', ...rest' : '' } } = fallback() }`;
    const init = shape === 'prefix' ? '(effects.push("prefix"), globalThis)'
      : shape === 'stored' ? '(held = globalThis)'
      : guarded ? `(held = globalThis.window?.${ constructor ? 'globalThis' : 'self' })` : 'globalThis';
    const declaration = `const ${ pattern } = ${ init }`;
    const result = shape === 'captured' ? '[held === globalThis, unknown]' : used ? '[held === globalThis, typeof prototype.get]' : constructor ? 'typeof prototype.then'
      : `[unknown${ shape === 'rest' ? ', rest.extra' : '' }]`;
    const body = shape === 'captured' ? `let unknown; held = (${ pattern } = ${ init }); r = ${ result };`
      : used ? `let prototype; held = (${ pattern } = ${ init }); r = ${ result };`
      : shape === 'assignment' ? `let unknown; (${ pattern } = ${ init }); r = ${ result };`
      : shape === 'for-init' ? `for (${ declaration }; true;) { r = ${ result }; break; }`
      : `${ declaration }; r = ${ result };`;
    const keys = computed ? `const proxyKey = '${ used ? 'self' : 'globalThis' }';\n`
      + `const ctorKey = '${ used ? 'Map' : 'Promise' }';\n` : '';
    const source = `${ keys }export const effects = [];
export let r;
let held;
try { ${ body } } catch (error) { r = error.name; } finally { restore(); }`;
    scenarioSource(source);
    const outputs = await transformOutputs(source);
    for (const state of [...constructor ? ['value'] : ['value', 'default', 'throw'], ...guarded ? ['null'] : []]) {
      const setup = `const realm = Function('return this')();
const saved = ['Array', 'window', 'self'].map(key => [key, Object.getOwnPropertyDescriptor(realm, key)]);
function restore() { for (const [key, descriptor] of saved) {
  if (descriptor) Object.defineProperty(realm, key, descriptor); else delete realm[key];
} }
function value(n) { return { get unknown() { effects.push('unknown'); return n; },
  get extra() { effects.push('extra'); return 41; } }; }
function fallback() { effects.push('default'); return value(31); }
${ constructor ? '' : `Object.defineProperty(realm, 'Array', { configurable: true, get() {
  effects.push('Array'); ${ state === 'throw' ? 'throw new RangeError("Array");' : `return ${ state === 'default' ? 'undefined' : 'value(23)' };` }
} });` }
Object.defineProperty(realm, 'window', { configurable: true, get() { effects.push('window'); return ${ state === 'null' ? 'null' : 'realm' }; } });
Object.defineProperty(realm, 'self', { configurable: true, get() { ${ used ? '' : "effects.push('self'); " }return realm; } });`;
      const expectedEffects = [...shape === 'prefix' ? ['prefix'] : [],
        ...guarded ? state === 'null' || constructor ? ['window'] : ['window', 'self'] : [],
        ...constructor || state === 'null' ? [] : ['Array', ...state === 'throw' ? [] : [
          ...state === 'default' ? ['default'] : [], 'unknown', ...shape === 'rest' ? ['extra'] : [],
        ]]];
      const expectedValue = state === 'null' ? 'TypeError' : used ? [true, 'function'] : constructor ? 'function' : state === 'throw' ? 'RangeError'
        : [...shape === 'captured' ? [true] : [], state === 'default' ? 31 : 23, ...shape === 'rest' ? [41] : []];
      const expected = `OK|${ JSON.stringify(expectedValue) }|${ JSON.stringify(expectedEffects) }`;
      for (const [host, output] of outputs) {
        const prepared = output.replace('export const effects = [];', `export const effects = [];\n${ setup }`);
        check(`${ shape }/${ host }/foreign setup`, prepared.includes(setup), true);
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, prepared);
        check(`${ shape }/${ state }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`${ shape }/${ state }/${ host }/stripped`, await runInWorker(file,
          constructor ? { stripGlobals: ['Promise', 'globalThis', 'Iterator'] } : {}), expected);
      }
    }
  }
  // A guarded anchor keeps its stored value through the surviving claim and its siblings.
  // Foreign getters distinguish a receiver replacement from an import-only mismatch.
  for (const shape of [
    'declaration', 'assignment', 'prefix', 'deep-prefix', 'for-init', 'sibling',
    'default', 'computed', 'used', 'outer-default', 'used-default', 'chained-store', 'excluded-assignment',
  ]) {
    const pattern = `{ Map: { ${ shape === 'computed' ? '[key]: name' : 'name' }${ shape === 'default'
      ? ' = (effects.push("default"), "fallback")' : shape === 'sibling' ? ', prototype' : '' } }${ shape.endsWith('-default') ? ' = ([1].at(0), fallback())' : '' } }`;
    const init = shape === 'deep-prefix' ? '(effects.push("prefix"), (effects.push("inner"), saved = globalThis.window?.self))'
      : shape === 'chained-store' ? '(other = saved = globalThis.window?.self)'
      : `(${ shape === 'prefix' ? 'effects.push("prefix"), ' : '' }saved = globalThis.window?.self)`;
    const used = shape.startsWith('used');
    const value = `[name, saved === foreign${ shape === 'sibling' ? ', prototype === foreign.Map.prototype' : '' }${ used
      ? ', result === foreign' : shape === 'chained-store' ? ', other === saved' : '' }]`;
    const body = shape.endsWith('assignment') ? `let name; (${ pattern } = ${ init }); r = ${ value };`
      : used ? `let name; const result = (${ pattern } = ${ init }); r = ${ value };`
      : shape === 'for-init' ? `for (const ${ pattern } = ${ init };;) { r = ${ value }; break; }`
      : `const ${ pattern } = ${ init }; r = ${ value };`;
    const source = `export const effects = [];
export let r;
let saved, other;
const key = 'name';
try { ${ body } } catch (error) { r = error.name; } finally { restore(); }`;
    scenarioSource(source);
    const outputs = await transformOutputs(source, shape === 'excluded-assignment' ? { ...OPTIONS, exclude: ['self', 'map/constructor'] } : OPTIONS,
      { createParenthesizedExpressions: true });
    check(`surviving/${ shape }/imports`, [...importSet(outputs[1][1])].sort().join(','), [...importSet(outputs[2][1])].sort().join(','));
    for (const state of ['declaration', 'prefix', 'deep-prefix', 'assignment', 'used', 'outer-default', 'used-default', 'chained-store', 'excluded-assignment'].includes(shape)
      ? ['value', 'null', 'throw'] : ['value']) {
      const setup = `const realm = Function('return this')();
const descriptor = Object.getOwnPropertyDescriptor(realm, 'window');
function restore() { if (descriptor) Object.defineProperty(realm, 'window', descriptor); else delete realm.window; }
const ctor = { prototype: {}, get name() { effects.push('name'); ${ state === 'throw' ? 'throw new RangeError("name");' : `return ${ shape === 'default' ? 'undefined' : '"own-name"' };` } } };
function fallback() { effects.push('default'); return ctor; }
const foreign = { get Map() { effects.push('Map'); return ${ shape.endsWith('-default') ? 'undefined' : 'ctor' }; } };
Object.defineProperty(realm, 'window', { configurable: true, get() {
  effects.push('window'); return ${ state === 'null' ? 'null' : '{ get self() { effects.push("self"); return foreign; } }' };
} });`;
      const expectedValue = state === 'null' ? 'TypeError' : state === 'throw' ? 'RangeError'
        : [shape === 'default' ? 'fallback' : 'own-name', true, ...shape === 'sibling' || shape === 'chained-store' || used ? [true] : []];
      const expectedEffects = [...shape === 'deep-prefix' ? ['prefix', 'inner'] : shape === 'prefix' ? ['prefix'] : [], 'window', ...state === 'null' ? [] : [
        'self', 'Map', ...shape.endsWith('-default') ? ['default'] : [], 'name',
        ...shape === 'default' ? ['default'] : [], ...shape === 'sibling' ? ['Map'] : [],
      ]];
      const expected = `OK|${ JSON.stringify(expectedValue) }|${ JSON.stringify(expectedEffects) }`;
      for (const [host, output] of outputs) {
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, output.replace('export const effects = [];', `export const effects = [];\n${ setup }`));
        check(`surviving/${ shape }/${ state }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`surviving/${ shape }/${ state }/${ host }/stripped`, await runInWorker(file), expected);
      }
    }
  }
  // Cold imports must see an engine without Function#name. A raw surviving read returns
  // undefined here; the instance helper recovers the source function's actual name.
  const namedSource = 'let saved; const { Map: { name } } = (saved = globalThis.window?.self); export const r = [name, saved === foreign];';
  for (const [host, output] of await transformOutputs(namedSource)) {
    const file = path.join(DIR, `name-${ count++ }.mjs`);
    await fs.outputFile(file, `const ctor = function OldMap() {}; ${ host === 'native' ? '' : 'delete ctor.name;' }
const foreign = { Map: ctor }; globalThis.window = { self: foreign };
${ output }`);
    const script = `${ host === 'native' ? '' : 'delete Function.prototype.name;' }
const result = await import(${ JSON.stringify(pathToFileURL(file).href) }); process.stdout.write(JSON.stringify(result.r));`;
    const { stdout } = await runChild(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8' });
    check(`surviving/${ host }/missing native name`, stdout, '["OldMap",true]');
  }
  // No self alias is installed for either transformed leg. Promise is stripped too, so
  // a native constructor cannot hide a missed claim after the result-preserving split.
  for (const [name, pattern, init, value, expectedEffects] of [
    ['direct', '{ Promise: { prototype } }', 'globalThis', '[held === globalThis, typeof prototype.then]', []],
    ['proxy', '{ self: { Promise: { prototype } } }', 'globalThis', '[held === globalThis, typeof prototype.then]', []],
    ['computed', '{ [proxyKey]: { [ctorKey]: { prototype } } }', 'globalThis', '[held === globalThis, typeof prototype.then]', []],
    ['effects', '{ [(effects.push("proxy"), proxyKey)]: { [(effects.push("ctor"), ctorKey)]: { prototype } } }',
      '(effects.push("init"), globalThis)', '[held === globalThis, typeof prototype.then]', ['init', 'proxy', 'ctor']],
    ['imported', '{ [proxyKey]: { [(effects.push("ctor"), ctorKey)]: { prototype } } }', 'realm',
      '[held === globalThis, typeof prototype.then]', ['ctor']],
    ['stored', '{ self: { Promise: { prototype } } }', '(saved = globalThis)', '[held === saved, typeof prototype.then]', []],
    ['sibling', '{ self: { Promise: { prototype } }, Array: { unknown } }', 'globalThis',
      '[held === globalThis && unknown === undefined, typeof prototype.then]', []],
    ['default', '{ self: { Promise: { prototype } = (effects.push("default"), {}) } }', 'globalThis',
      '[held === globalThis, typeof prototype.then]', []],
    ['unused-result', '{ globalThis: { Array: { unknown } } }', 'globalThis', 'typeof unknown', []],
  ]) {
    const source = `${ name === 'imported' ? 'import realm from "@core-js/pure/actual/global-this";\nimport proxy from "@core-js/pure/actual/self";\n' : '' }export const effects = [];
const proxyKey = 'self', ctorKey = 'Promise';
let prototype, unknown, saved;
const held = (${ pattern } = ${ init });
export const r = ${ value };`;
    scenarioSource(source);
    const outputs = await transformOutputs(source, { ...OPTIONS, exclude: [] }, { createParenthesizedExpressions: true });
    check(`missing-global/${ name }/imports`, [...importSet(outputs[1][1])].sort().join(','), [...importSet(outputs[2][1])].sort().join(','));
    const expected = `OK|${ JSON.stringify(name === 'unused-result' ? 'undefined' : [true, 'function']) }|${ JSON.stringify(expectedEffects) }`;
    for (const [host, output] of outputs) {
      const file = path.join(DIR, `case-${ count++ }.mjs`);
      await fs.outputFile(file, output);
      check(`missing-global/${ name }/${ host }/full`,
        await runInWorker(file, { strip: false, nativeAlias: host === 'native' }), expected);
      if (host !== 'native') check(`missing-global/${ name }/${ host }/stripped`,
        await runInWorker(file, { nativeAlias: false, stripGlobals: ['Promise', 'globalThis', 'Iterator'] }), expected);
    }
  }
  // Keep this exact no-proxy case before lowering. A post-only transform sees effectful
  // member keys instead of a pattern, a spelling outside that lane's proxy-collapse contract.
  const capturedSource = `export const effects = [];
export const r = 'passed';
QUnit.test('a consumed realm assignment serves nested constructors without native proxies', assert => {
  const proxy = 'self';
  const ctor = 'Promise';
  const events = [];
  let prototype;
  let unknown;
  const result = { [(events.push('proxy'), proxy)]: { [(events.push('ctor'), ctor)]: { prototype } } }
    = (events.push('init'), globalThis);
  assert.same(result, globalThis);
  assert.isFunction(prototype.then);
  assert.deepEqual(events, ['init', 'proxy', 'ctor']);
  const kept = { globalThis: { Array: { unknown } } } = globalThis;
  assert.same(kept, globalThis);
  assert.same(unknown, undefined);
});`;
  const assertionSetup = `const QUnit = { test(name, body) { body({
  same(actual, expected) { if (actual !== expected) throw new Error(name + ': identity'); },
  isFunction(value) { if (typeof value !== 'function') throw new Error(name + ': function'); },
  deepEqual(actual, expected) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(name + ': effects');
  }
}); } };`;
  for (const [host, output] of await transformOutputs(capturedSource, { ...OPTIONS, exclude: [] })) {
    const file = path.join(DIR, `case-${ count++ }.mjs`);
    await fs.outputFile(file, `${ assertionSetup }\n${ output }`);
    check(`captured-e2e-source/${ host }/full`,
      await runInWorker(file, { strip: false, nativeAlias: host === 'native' }), 'OK|"passed"|[]');
    if (host !== 'native') check(`captured-e2e-source/${ host }/stripped`,
      await runInWorker(file, { nativeAlias: false, stripGlobals: ['Promise', 'globalThis', 'Iterator'] }), 'OK|"passed"|[]');
  }
  // A declined child still receives the realm ponyfill. Native siblings read at their
  // pattern slots, after preceding keys (including a TDZ), rather than during the mirror.
  for (const shape of ['parameter', 'supplied', 'level-default', 'tdz', 'ordered', 'throwing-key', 'key-claim']) {
    const parameter = ['parameter', 'supplied', 'level-default', 'key-claim'].includes(shape);
    const supplied = shape === 'supplied';
    const levelDefault = shape === 'level-default';
    const key = shape === 'key-claim' ? '(effects.push("abc".at(-1)), key)' : 'key';
    const body = parameter ? `let key = 'Promise';
function read({ globalThis: { [${ key }]: { prototype = (effects.push('leaf'), [17]) } }${ levelDefault
  ? ' = (effects.push("level"), { Promise: { prototype: [31] } })' : '' } } = (effects.push('rhs'), key = 'Array', globalThis)) {
  return ${ supplied || levelDefault ? 'prototype[0]' : 'Array.isArray(prototype)' };
}
r = read(${ supplied ? '{ globalThis: { Promise: {} } }' : levelDefault ? '{}' : '' });`
      : shape === 'tdz' ? 'const { globalThis: { [key]: { prototype } }, key, declinedAfter: after } = globalThis; r = prototype;'
        : `const { declinedBefore: before, globalThis: { [unknownKey()]: { prototype } }, declinedAfter: after }
  = (effects.push('rhs'), globalThis); r = [before, Array.isArray(prototype), after];`;
    const source = `export const effects = []; export let r;
try { ${ body } } catch (error) { r = error.name; } finally { restore(); }`;
    scenarioSource(source);
    const setup = `const realm = Function('return this')();
const saved = ['declinedBefore', 'declinedAfter'].map(key => [key, Object.getOwnPropertyDescriptor(realm, key)]);
function restore() { for (const [key, descriptor] of saved) {
  if (descriptor) Object.defineProperty(realm, key, descriptor); else delete realm[key];
} }
Object.defineProperty(realm, 'declinedBefore', { configurable: true, get() { effects.push('before'); return 11; } });
Object.defineProperty(realm, 'declinedAfter', { configurable: true, get() { effects.push('after'); return 23; } });
function unknownKey() { effects.push('key'); ${ shape === 'throwing-key' ? 'throw new RangeError("key");' : 'return "Array";' } }`;
    const value = shape === 'tdz' ? 'ReferenceError' : shape === 'throwing-key' ? 'RangeError'
      : supplied ? 17 : levelDefault ? 31 : parameter ? true : [11, true, 23];
    const events = shape === 'tdz' ? [] : supplied ? ['leaf'] : levelDefault ? ['level']
      : shape === 'key-claim' ? ['rhs', 'c'] : parameter ? ['rhs']
        : shape === 'throwing-key' ? ['rhs', 'before', 'key'] : ['rhs', 'before', 'key', 'after'];
    const expected = `OK|${ JSON.stringify(value) }|${ JSON.stringify(events) }`;
    const outputs = await transformOutputs(source, { ...OPTIONS, exclude: [] }, { createParenthesizedExpressions: true });
    check(`declined/${ shape }/imports`, [...importSet(outputs[1][1])].sort().join(','), [...importSet(outputs[2][1])].sort().join(','));
    for (const [host, output] of outputs) {
      const file = path.join(DIR, `case-${ count++ }.mjs`);
      await fs.outputFile(file, `${ setup }\n${ output }`);
      check(`declined/${ shape }/${ host }/full`,
        await runInWorker(file, { strip: false, nativeAlias: false }), expected);
      if (host !== 'native') check(`declined/${ shape }/${ host }/stripped`,
        await runInWorker(file, { nativeAlias: false, stripGlobals: ['globalThis'] }), expected);
    }
  }
  // Pure serves the constructor itself, even while a native sibling requires a receiver memo.
  // The foreign import is the identity oracle and does not influence source analysis.
  for (const [name, constructorSibling, expected] of [
    ['memo', `export const effects = [];
let key = 'Promise';
const { globalThis: { [key]: { prototype } }, Map: M, missing } = (key = 'Array', globalThis);
export const r = [Array.isArray(prototype), M === expectedMap, missing];`, 'OK|[true,true,"__undefined__"]|[]'],
    ['retained-default', `export const effects = [];
function read({ Array: { from }, Map: M, missing: a, missing: b } = globalThis) {
  return [from([7])[0], M === expectedMap, a, b];
}
export const r = read();`, 'OK|[7,true,"__undefined__","__undefined__"]|[]'],
  ]) {
    scenarioSource(constructorSibling);
    for (const [host, output] of (await transformOutputs(constructorSibling, { ...OPTIONS, exclude: [] })).slice(1)) {
      check(`declined/constructor/${ name }/${ host }/import`, importSet(output).has('core-js/actual/map/constructor'), true);
      const file = path.join(DIR, `case-${ count++ }.mjs`);
      await fs.outputFile(file, `import expectedMap from '@core-js/pure/actual/map/constructor';\n${ output }`);
      for (const strip of [false, true]) check(`declined/constructor/${ name }/${ host }/${ strip ? 'stripped' : 'full' }`,
        await runInWorker(file, { strip, nativeAlias: false, stripGlobals: ['globalThis'] }), expected);
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();
