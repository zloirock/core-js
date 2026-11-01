// An unclaimed hop retains its source default, getters and throws. Foreign setup runs
// after imports; transformed source cannot mistake these runtime values for mutation facts.
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
} finally {
  await fs.remove(DIR);
}
finish();
