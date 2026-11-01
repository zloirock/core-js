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
} finally {
  await fs.remove(DIR);
}
finish();
