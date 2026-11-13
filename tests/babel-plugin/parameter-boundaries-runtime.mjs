// Enabled leaves may cross only inert parameter work; opted-out reads keep their own slot.
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
const { check, finish } = createChecker('parameter-boundaries-runtime', {
  tsc: 'Dynamic parameters, deliberate TDZ reads and opt-outs exercise runtime boundaries.',
});
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const cases = [];
for (const [name, tail, want] of [
  ['object', 'value = {}', {}], ['array', 'value = []', []], ['null', 'value = null', null],
  ['number', 'value = -1', -1], ['nested', 'value = { xs: [1, -2, null] }', { xs: [1, -2, null] }],
  ['rest', '...value', []],
]) for (const nested of [false, true]) {
  cases.push([`tail/${ name }/${ nested }`, `
    export function read(${ nested ? '{ row: { at } }' : '{ at }' }, ${ tail }) { return [at.call([3, 7], -1), value]; }
    export const r = [read(${ nested ? '{ row: [3, 7] }' : '[3, 7]' }), read.length];`, [[7, want], 1]]);
}
for (const before of [false, true]) {
  const off = '// core-js-disable-next-line\n flat';
  const pattern = before ? `${ off },\n at` : `at,\n ${ off }`;
  cases.push([`disabled/instance/${ before }`, `
    export function read({ ${ pattern } }) { return [at.call([3, 7], -1), flat]; }
    const source = [3, 7]; Object.defineProperty(source, 'flat', { get() { effects.push('flat'); return 9; } });
    export const r = read(source);`, [7, 9], ['flat']],
  [`disabled/getter-order/${ before }`, `
    export function read({ ${ pattern } }) { effects.push('body'); return [at(), flat]; }
    export const r = read({ get at() { effects.push('at'); return () => 7; }, get flat() { effects.push('flat'); return 9; } });`,
  [7, 9], before ? ['flat', 'at', 'body'] : ['at', 'flat', 'body']],
  [`disabled/realm/${ before }`, `
    const realm = globalThis;
    // core-js-disable-next-line
    const nativeSet = realm.Set;
    export function read({ ${ before ? '// core-js-disable-next-line\n Set: S,\n Array: { from }'
      : 'Array: { from },\n // core-js-disable-next-line\n Set: S' } } = globalThis) { return [from([3]), S === nativeSet]; }
    export const r = read();`, [[3], true]]);
}
cases.push(
  ['disabled/constructor-order', `
    Object.defineProperty(Array, 'marker', { configurable: true, get() { effects.push('marker'); return 11; } });
    Object.defineProperty(Array, 'of', { configurable: true, get() { effects.push('of'); return 9; } });
    export function read({ from, marker,
      // core-js-disable-next-line
      of
    } = Array) { return [from([3]), marker, of]; }
    export const r = read();`, [[3], 11, 9], ['marker', 'of']],
  ['disabled/whole-parameter', `
    // core-js-disable-next-line
    export function read({ at, flat }) { return [at(), flat]; }
    export const r = read({ at: () => 7, flat: 9 });`, [7, 9]],
  ['disabled/nested-leaf', `
    export function read({ row: { at,
      // core-js-disable-next-line
      flat
    }, marker }) { return [at.call([3, 7], -1), flat, marker]; }
    const source = [3, 7]; Object.defineProperty(source, 'flat', { value: 9 });
    export const r = read({ row: source, marker: 11 });`, [7, 9, 11]],
  ['disabled/default-before-read', `
    export function read({ at, missing = (effects.push('default'), 1),
      // core-js-disable-next-line
      flat
    } = [3, 7]) { return [at.call([3, 7], -1), missing, flat]; }
    Object.defineProperty(Array.prototype, 'flat', { configurable: true, get() { effects.push('flat'); return 9; } });
    export const r = read();`, [7, 1, 9], ['default', 'flat']],
  ['rest/arguments', `
    export function read({ at }, value, ...tail) { value = 9; return [at.call([3, 7], -1), arguments[1], tail, read.length]; }
    export const r = read([3, 7], 5, 11);`, [7, 5, [11], 2]],
  ['rest/supplied', `
    export function read({ at }, ...tail) { return [at.call([3, 7], -1), tail]; }
    export const r = read([3, 7], 11, 13);`, [7, [11, 13]]],
  ['default/supplied', `
    export function read({ includes }, options = {}) { return [includes.call([3, 7], 7), options]; }
    export const r = read([3, 7], 9);`, [true, 9]],
  ['default/effects', `
    export function read({ at }, value = (effects.push('default'), 9)) { effects.push('body'); return [at(), value]; }
    export const r = read({ get at() { effects.push('get'); return () => 7; } });`, [7, 9], ['get', 'default', 'body']],
  ['default/throw', `
    export function read({ at }, value = (() => { effects.push('default'); throw new RangeError(); })()) { return at; }
    export let r; try { read({ get at() { effects.push('get'); throw new TypeError(); } }); } catch (error) { r = error.name; }`, 'TypeError', ['get']],
  ['default/coercion', `
    Array.prototype.valueOf = function () { effects.push('coerce'); return 9; };
    export function read({ at }, tail = +[]) { return [at(), tail]; }
    export const r = read({ get at() { effects.push('get'); return () => 7; } });`, [7, 9], ['get', 'coerce']],
  ['default/nested-coercion', `
    Array.prototype.valueOf = function () { effects.push('coerce'); return 9; };
    export function read({ at }, tail = { value: +[] }) { return [at(), tail.value]; }
    export const r = read({ get at() { effects.push('get'); return () => 7; } });`, [7, 9], ['get', 'coerce']],
  ['default/nested-pattern-coercion', `
    Array.prototype.valueOf = function () { effects.push('coerce'); return 9; };
    export function read({ at, row: { value } = { value: +[] } }) { return [at(), value]; }
    export const r = read({ get at() { effects.push('get'); return () => 7; } });`, [7, 9], ['get', 'coerce']],
  ['default/fresh', `
    export function read({ at }, value = {}) { return [at.call([3, 7], -1), value]; }
    const first = read([3, 7]), second = read([3, 7]);
    export const r = [first[0], second[0], first[1] !== second[1]];`, [7, 7, true]],
  ['selection/native-constructors', `
    const values = []; for (const C of [Array, String, null]) {
      (function ({ W: { concat } } = { W: C || Array }) { values.push(typeof concat); })();
    } export const r = values;`, ['undefined', 'undefined', 'undefined']],
);
for (const before of [false, true]) {
  const nested = 'row: { value } = { value: +[] }';
  cases.push([`default/nested-pattern-array/${ before }`, `
    Array.prototype.valueOf = function () { effects.push('coerce'); return 9; };
    export function read({ ${ before ? `${ nested }, at` : `at, ${ nested }` } }) { return [at.call([3, 7], -1), value]; }
    export const r = read([3, 7]);`, [7, 9], ['coerce']]);
}
for (const tail of ['tail = {}', '...tail']) for (const read of ['tail', 'tail = []', '++tail']) {
  cases.push([`tdz/${ tail }/${ read }`, `
    export function run(probe = () => (${ read }), { at } = { get at() { effects.push('get'); return probe(); } }, ${ tail }) { return at; }
    export let r; try { run(); } catch (error) { r = error.name; }`, 'ReferenceError', ['get']]);
}
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const directory = await fs.mkdtemp(path.join(tmp, 'parameter-boundaries-'));
let serial = 0;
try {
  for (const [name, body, want, effects = []] of cases) {
    const source = scenarioSource(`export const effects = []; ${ body }`);
    const outputs = [['native', source]];
    for (const host of ['babel', 'unplugin', 'pre+post']) {
      let code = source;
      if (host === 'babel') code = (await transformAsync(code, {
        configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, OPTIONS]],
      })).code;
      else {
        const plugin = createUnplugin(OPTIONS);
        for (const pass of host === 'pre+post' ? ['pre', 'post'] : ['single']) code = plugin.transform(code, 'input.mjs', pass)?.code ?? code;
      }
      outputs.push([host, code]);
    }
    for (const [host, code] of outputs) for (const lower of [false, true]) {
      const output = lower ? (await transformAsync(code, {
        configFile: false, babelrc: false,
        plugins: ['transform-object-rest-spread', 'transform-destructuring', 'transform-parameters'].map(pluginName => requireBabel.resolve(`@babel/plugin-${ pluginName }`)),
      })).code : code;
      const file = path.join(directory, `case-${ serial++ }.mjs`);
      await fs.writeFile(file, output);
      for (const strip of host === 'native' ? [false] : [false, true]) {
        // Babel lowers rest bindings to var even without core-js. The raw leg keeps strict TDZ.
        const expected = lower && name.startsWith('tdz/...') ? '__undefined__' : want;
        check(`${ name }/${ host }/${ lower }/${ strip }`, await runInWorker(file, { strip }),
          `OK|${ JSON.stringify(expected) }|${ JSON.stringify(effects) }`);
      }
    }
  }
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
finish();
