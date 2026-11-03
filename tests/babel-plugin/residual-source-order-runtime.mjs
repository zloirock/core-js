// Excluded statics keep their native reads beside a served function property. Foreign
// getters distinguish source order, including throws; setup runs after output imports.
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
const { check, finish } = createChecker('residual-source-order-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, exclude: ['array/from', 'array/of'] };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'residual-source-order-'));
let count = 0;

try {
  for (const shape of ['nested', 'flat', 'member', 'swapped', 'middle', 'default', 'rest', 'multi', 'export', 'for-init', 'bodyless', 'rebuilt']) {
    const keys = shape === 'swapped' ? 'name, from' : shape === 'middle' ? 'from, name, of'
      : shape === 'default' ? 'from = mark("default"), name' : shape === 'rest' ? 'from, name, ...rest' : 'from, name';
    const pattern = shape === 'flat' || shape === 'member' ? `{ ${ keys } }` : `{ Array: { ${ keys } } }`;
    const init = shape === 'flat' ? 'Array' : shape === 'member' ? 'globalThis.Array' : 'globalThis';
    const declaration = `${ shape === 'bodyless' ? 'var' : 'const' } ${ shape === 'multi' ? 'before = mark("before"), ' : '' }${ pattern } = ${ init }${ shape === 'multi' ? ', after = mark("after")' : '' }`;
    const result = `r = [from, name${ shape === 'middle' ? ', of' : shape === 'rest' ? ', rest.extra' : '' }];`;
    const body = shape === 'for-init' ? `for (${ declaration }; true;) { ${ result } break; }`
      : shape === 'bodyless' ? `if (true) ${ declaration }; ${ result }`
      : shape === 'rebuilt' ? `const out = []; out.push((() => { ${ declaration }; ${ result } return 1; })());`
      : `${ declaration }; ${ result }`;
    const source = `export const effects = [];
export let r;
${ shape === 'export' ? `export ${ declaration }; ${ result }` : `try { ${ body } } catch (error) { r = error.name; }` }
restore();`;
    scenarioSource(source);
    const { code: babel } = await transformAsync(source, {
      configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, OPTIONS]],
    });
    const unplugin = createUnplugin(OPTIONS).transform(source, 'input.mjs').code;
    const outputs = [['native', source], ['babel', babel], ['unplugin', unplugin]];
    // Parsing the printed output and lowering its new declarators must keep the same reads.
    for (const [host, output] of outputs.slice(1)) {
      const { code } = await transformAsync(output, {
        configFile: false, babelrc: false,
        plugins: [requireBabel.resolve('@babel/plugin-transform-object-rest-spread'), requireBabel.resolve('@babel/plugin-transform-destructuring')],
      });
      outputs.push([`${ host }/lowered`, code]);
      check(`${ shape }/${ host }/excluded imports`, /from ["'][^"']*\/array\/(?:from|of)["']/.test(output), false);
      if (shape !== 'rest') check(`${ shape }/${ host }/served name`, output.includes('/function/instance/name'), true);
    }
    for (const throws of shape === 'export' ? [false] : [false, true]) {
      const setup = `const saved = ['from', 'name', 'of', 'extra'].map(key => [key, Object.getOwnPropertyDescriptor(Array, key)]);
function restore() { for (const [key, descriptor] of saved) {
  if (descriptor) Object.defineProperty(Array, key, descriptor); else delete Array[key];
} }
function mark(value) { effects.push(value); return 23; }
for (const [key, value] of [['from', ${ shape === 'default' ? 'undefined' : '23' }], ['name', 'own-name'], ['of', 31], ['extra', 41]]) {
  Object.defineProperty(Array, key, { configurable: true, enumerable: key === 'extra', get() {
    effects.push(key); ${ throws ? 'throw new RangeError(key);' : 'return value;' }
  } });
}`;
      let expected;
      for (const [host, output] of outputs) {
        const prepared = output.replace('export const effects = [];', `export const effects = [];\n${ setup }`);
        check(`${ shape }/${ host }/setup inserted`, prepared.includes(setup), true);
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, prepared);
        const actual = await runInWorker(file, { strip: false });
        if (host === 'native') {
          check(`${ shape }/native ran`, actual.startsWith('OK|'), true);
          const order = shape === 'swapped' ? ['name', 'from'] : ['from', ...shape === 'default' ? ['default'] : [], 'name',
            ...shape === 'middle' ? ['of'] : shape === 'rest' ? ['extra'] : []];
          const effects = [...shape === 'multi' ? ['before'] : [], ...throws ? [order[0]] : order,
            ...shape === 'multi' && !throws ? ['after'] : []];
          check(`${ shape }/native effects/${ throws }`, actual.split('|').at(-1), JSON.stringify(effects));
          expected = actual;
        } else {
          check(`${ shape }/${ host }/full/${ throws }`, actual, expected);
          check(`${ shape }/${ host }/stripped/${ throws }`, await runInWorker(file), expected);
        }
      }
    }
  }
  // Canonical computed members keep native optional roots intact across print and lowering.
  for (const shape of ['array', 'array-number', 'navigation', 'optional', 'for-init', 'multi']) {
    const positional = shape.startsWith('array');
    const key = shape === 'array-number' ? '0' : '"m-q"';
    const pattern = positional ? `[{ ${ key }: { at: method, kept: {} } }]` : `{ slot: { ${ key }: { flat: method } } }`;
    const init = positional ? 'input' : `{ slot: ${ shape === 'optional' ? 'input?.value' : 'input' }${ shape === 'for-init' ? ', other: input' : '' } }`;
    const declaration = `const ${ shape === 'multi' ? 'lead = effects.push("lead"), ' : '' }${ pattern } = ${ init }`;
    const result = positional ? 'method.call(rows, -1)' : 'method.call(rows)';
    const body = shape === 'for-init' ? `for (${ declaration };;) return ${ result };` : `${ declaration }; return ${ result };`;
    for (const throws of [false, true]) {
      const source = `export const effects = [];
export let r;
const rows = ${ positional ? '[4, 9]' : '[4, [9]]' };
rows.kept = {};
const box = ${ positional ? `{ ${ key }: rows }` : `{ get [${ key }]() {
  effects.push("hop"); ${ throws ? 'throw new RangeError("hop");' : 'return rows;' }
} }` };
function read(input) { ${ body } }
try { r = read(${ positional ? throws ? 'null' : '[box]' : shape === 'optional' ? '{ value: box }' : 'box' }); }
catch (error) { r = error.name; }`;
      scenarioSource(source);
      const options = { ...OPTIONS, exclude: [] };
      const { code: babel } = await transformAsync(source, {
        configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
      });
      const plugin = createUnplugin(options);
      const unplugin = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
      const post = plugin.transform(unplugin, 'input.mjs', 'post')?.code ?? unplugin;
      const outputs = [['native', source], ['babel', babel], ['unplugin', unplugin], ['pre+post', post]];
      for (const [host, output] of outputs.slice(1)) {
        const { code } = await transformAsync(output, {
          configFile: false,
          babelrc: false,
          plugins: [
            requireBabel.resolve('@babel/plugin-transform-optional-chaining'),
            requireBabel.resolve('@babel/plugin-transform-object-rest-spread'),
            requireBabel.resolve('@babel/plugin-transform-destructuring'),
          ],
        });
        outputs.push([`${ host }/lowered`, code]);
      }
      const resultValue = throws ? positional ? 'TypeError' : 'RangeError' : positional ? 9 : [4, 9];
      const effects = [...shape === 'multi' ? ['lead'] : [], ...positional ? [] : ['hop']];
      const expected = `OK|${ JSON.stringify(resultValue) }|${ JSON.stringify(effects) }`;
      for (const [host, output] of outputs) {
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, output);
        check(`canonical/${ shape }/${ throws }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`canonical/${ shape }/${ throws }/${ host }/stripped`, await runInWorker(file), expected);
      }
    }
  }
  // Requeued patterns must use live paths and plans after a capture moved their host.
  for (const shape of ['split', 'split-twice', 'split-default', 'join', 'join-bodyless', 'stale-rest', 'stale-loop']) {
    const split = shape.startsWith('split');
    const join = shape.startsWith('join');
    const keys = 'NaN: {}, Array: { from, [(effects.push("key"), "of")]: of, [key]: value }';
    const body = split ? `let from, at, rest;
for ({ Array: { from, k: { at${ shape === 'split-default' ? ' = (effects.push("default"), Array.of)' : '' } }, ...rest } } of [globalThis${ shape === 'split-twice' ? ', globalThis' : '' }]) {
  effects.push("body"); r = [from([4, 9])[1], ${ shape === 'split-default' ? 'at(17)[0]' : 'at()' }, rest.extra];
}` : join ? `${ shape === 'join-bodyless' ? 'if (true) var' : 'const' } { ${ keys } } = globalThis;
r = [from([4])[0], of(9)[0], value];`
      : shape === 'stale-loop' ? `for (const { Map, Array: { from }, ...rest } of [globalThis]) {
  r = [new Map([[1, 4]]).get(1), from([9])[0], 'Map' in rest, 'Array' in rest];
}` : `const { Map, Array: { from }, ...rest } = globalThis;
r = [new Map([[1, 4]]).get(1), from([9])[0], 'Map' in rest, 'Array' in rest];`;
    const source = `export const effects = [];
export let r;
const key = String("length");
try { ${ body } } catch (error) { r = error.name; }
restore();`;
    scenarioSource(source);
    const options = { ...OPTIONS, exclude: [] };
    const { code: babel } = await transformAsync(source, {
      configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
    });
    const plugin = createUnplugin(options);
    const unplugin = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
    const post = plugin.transform(unplugin, 'input.mjs', 'post')?.code ?? unplugin;
    const outputs = [['native', source], ['babel', babel], ['unplugin', unplugin], ['pre+post', post]];
    for (const [host, output] of outputs.slice(1)) {
      check(`live-pattern/${ shape }/${ host }/from import`, output.includes('/array/from'), true);
      if (shape === 'split-default') check(`live-pattern/${ shape }/${ host }/live default import`, output.includes('/array/of'), true);
      const { code } = await transformAsync(output, {
        configFile: false, babelrc: false,
        plugins: [requireBabel.resolve('@babel/plugin-transform-object-rest-spread'), requireBabel.resolve('@babel/plugin-transform-destructuring')],
      });
      outputs.push([`${ host }/lowered`, code]);
    }
    // Foreign setup follows the imports, so the stripper cannot erase the observed accessor.
    for (const throws of split ? [false, true] : [false]) {
      const setup = split ? `const saved = ["k", "extra"].map(key => [key, Object.getOwnPropertyDescriptor(Array, key)]);
Object.defineProperty(Array, "k", { configurable: true, get() {
  effects.push("get"); ${ throws ? 'throw new RangeError("k");' : shape === 'split-default' ? 'return {};' : 'return { at() { effects.push("call"); return 17; } };' }
} });
Object.defineProperty(Array, "extra", { configurable: true, enumerable: true, value: 23 });
function restore() { for (const [key, descriptor] of saved) {
  if (descriptor) Object.defineProperty(Array, key, descriptor); else delete Array[key];
} }` : 'function restore() {}';
      const result = split ? throws ? 'RangeError' : [9, 17, 23] : join ? [4, 9, 1] : [4, 9, false, false];
      const events = split ? throws ? ['get'] : shape === 'split-default' ? ['get', 'default', 'body']
        : Array.from({ length: shape === 'split-twice' ? 2 : 1 }, () => ['get', 'body', 'call']).flat()
        : join ? ['key'] : [];
      const expected = `OK|${ JSON.stringify(result) }|${ JSON.stringify(events) }`;
      for (const [host, output] of outputs) {
        const prepared = output.replace('export const effects = [];', `export const effects = [];\n${ setup }`);
        check(`live-pattern/${ shape }/${ host }/setup`, prepared.includes(setup), true);
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, prepared);
        check(`live-pattern/${ shape }/${ throws }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`live-pattern/${ shape }/${ throws }/${ host }/stripped`, await runInWorker(file), expected);
      }
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();
