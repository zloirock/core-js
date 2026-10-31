// The bundled e2e suite and differential corpus use fixed, non-excluding options. This
// oracle keeps exclusion active, with setup outside the transformed compilation unit.
// Fresh realms compare native behavior with both outputs, including stripped builtins.
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
const { check, finish } = createChecker('excluded-residual-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, exclude: ['self'] };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'excluded-residual-'));
let count = 0;

try {
  for (const [shape, init, prefix] of [
    ['plain', 'globalThis.window?.self', []],
    ['prefix', '(record(), globalThis.window?.self)', ['prefix']],
    ['stored', 'held = (record(), globalThis.window?.self)', ['prefix']],
    ['stored-symbol', 'held = (record(), globalThis.window?.self)', ['prefix']],
    ['stored-static', 'held = (record(), globalThis.window?.self)', ['prefix']],
    ['stored-constructor', 'held = (record(), globalThis.window?.Map)', ['prefix']],
    ['stored-for-init', 'held = (record(), globalThis.window?.self)', ['prefix']],
    ['for-init', '(record(), globalThis.window?.self)', ['prefix']],
    ['sealed', '(record(), (globalThis.window?.self))', ['prefix']],
    ['typed', '(record(), (globalThis.window as any)?.self)', ['prefix']],
  ]) for (const state of ['null-window', 'undefined-self', 'absent-self', 'present']) {
    const stored = shape.startsWith('stored');
    const symbol = shape === 'stored-symbol';
    const constructor = shape === 'stored-constructor';
    const staticClaim = shape === 'stored-static' || constructor;
    const inner = `{ ${ symbol ? '[Symbol.iterator]: iterator,' : staticClaim ? 'groupBy,' : '' } missing = fallback() }`;
    const declaration = `const ${ constructor ? inner : `{ Map: ${ inner } }` } = ${ init }`;
    const result = symbol ? '[typeof iterator, missing, held === globalThis]'
      : staticClaim ? `[groupBy([1], x => x).get(1)[0], missing, held === ${ constructor ? 'Map' : 'globalThis' }]`
      : stored ? '[missing, held === globalThis]' : 'missing';
    const source = `export const effects = [];
export let r;
try {
  ${ stored ? 'let held;' : '' }
  ${ shape.endsWith('for-init') ? `for (${ declaration }; true;) { r = ${ result }; break; }`
    : `${ declaration }; r = ${ result };` }
} catch (error) { r = error.name; }`;
    scenarioSource(source);
    const setup = `const realm = Function('return this')();
function record() { effects.push('prefix'); }
function fallback() { effects.push('default'); return 'ok'; }
Object.defineProperty(realm, 'window', { configurable: true,
  get() { effects.push('window'); return ${ state === 'null-window' ? 'null' : 'realm' }; } });
${ state === 'absent-self' ? 'delete realm.self;' : `Object.defineProperty(realm, 'self', { configurable: true,
  get() { effects.push('self'); return ${ state === 'undefined-self' ? 'undefined' : 'realm' }; } });` }
${ stored ? '' : `Object.defineProperty(realm, 'Map', { configurable: true,
  get() { effects.push('Map'); return { get missing() { effects.push('missing'); } }; } });` }`;
    const expectedEffects = [...prefix, 'window',
      ...!constructor && (state === 'undefined-self' || state === 'present') ? ['self'] : [],
      ...state === 'present' || constructor && state !== 'null-window' ? [...stored ? [] : ['Map', 'missing'], 'default'] : []];
    const value = state === 'present' || constructor && state !== 'null-window'
      ? (symbol ? ['undefined', 'ok', true] : staticClaim ? [1, 'ok', true] : stored ? ['ok', true] : 'ok') : 'TypeError';
    const expected = `OK|${ JSON.stringify(value) }|${ JSON.stringify(expectedEffects) }`;
    const { code: babel } = await transformAsync(source, {
      configFile: false, babelrc: false, filename: 'input.ts',
      parserOpts: { plugins: ['typescript'] }, plugins: [[babelPlugin, OPTIONS]],
    });
    const unplugin = createUnplugin(OPTIONS).transform(source, 'input.ts').code;
    for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', unplugin]]) {
      const { code } = await transformAsync(output, {
        configFile: false, babelrc: false, filename: 'input.ts',
        plugins: [requireBabel.resolve('@babel/plugin-transform-typescript'), requireBabel.resolve('@babel/plugin-transform-optional-chaining')],
      });
      // Output imports run before the foreign setup, so getters measure only the source read.
      const prepared = code.replace('export const effects = [];', `export const effects = [];\n${ setup }`);
      check(`${ shape }/${ state }/${ host }/setup inserted`, prepared.includes(setup), true);
      const file = path.join(DIR, `case-${ count++ }.mjs`);
      await fs.outputFile(file, prepared);
      check(`${ shape }/${ state }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
      if (host === 'native') continue;
      check(`${ shape }/${ state }/${ host }/stripped`, await runInWorker(file), expected);
      check(`${ shape }/${ state }/${ host }/excluded self import`, /from ["'][^"']*\/self["']/.test(output), false);
      if (stored) continue;
      check(`${ shape }/${ state }/${ host }/no unconditional constructor`, /from ["'][^"']*\/map\/constructor["']/.test(output), false);
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();
