// Reparsed guards preserve native reads, iterator order and dead-value import liveness.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { transformPrePost } from '../unplugin/phase-imports.mjs';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('own-output-guards-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const config = { configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, OPTIONS]] };
const cases = [
  ['guarded native receiver', `const { Map: { customY: r } } = (globalThis.window?.self);
    globalThis.Map = function PatchedMap() {}; export { r }; export const effects = [];`, 'native'],
  ['nested selection', `const { Array: { of } } = globalThis.setTimeout ? globalThis.window : globalThis.window;
    export const r = of(7)[0]; export const effects = [];`, 7],
  ['sequence prefix', 'const w = globalThis.window; export const r = (w.globalThis, 1); export const effects = [];', 1],
  ['sealed prefix', `export const effects = []; const prefix = () => effects.push('prefix');
    export const r = typeof ((prefix(), globalThis.window)?.Array).from;`, 'function', ['prefix']],
  ['discarded read', 'const w = globalThis.window; w.self; export const r = 1; export const effects = [];', 1, [], true],
  ['void read', 'const w = globalThis.window; void w.self; export const r = 1; export const effects = [];', 1, [], true],
  ['void sequence', 'const w = globalThis.window; void (0, w.self); export const r = 1; export const effects = [];', 1, [], true],
  ['discarded sequence', 'const w = globalThis.window; (0, w.self); export const r = 1; export const effects = [];', 1, [], true],
  ['consumed read', 'const w = globalThis.window; export const r = (0, w.self) === w; export const effects = [];', true],
  ['discarded backed run', 'const w = globalThis.window; w.self.self; export const r = 1; export const effects = [];', 1],
  ['discarded static', 'const w = globalThis.window; w.Map.groupBy; export const r = 1; export const effects = [];', 1],
  ['iterator method', `const { [Symbol.iterator]: { name, bind } } = globalThis;
    export const r = [name, typeof bind]; export const effects = [];`, ['realmIter', 'function'], [], false, false],
  ['mapped iterator', `export const effects = []; const row = [[], 0];
    Object.defineProperty(row, 1, { get() { effects.push(typeof method); return 9; } });
    const { w: [{ at: method }, tail] } = { w: row };
    export const r = [method.call([3, 7], -1), tail];`, [7, 9], ['function'], false, false],
  ['guarded native payload', `import root from '@core-js/pure/actual/global-this';
    const { at } = (null == root.window ? void 0 : root).items;
    export const r = at.call(root.items, -1); export const effects = [];`, 7],
];
const directory = await fs.mkdtemp(path.join(import.meta.dirname, '../transpiler-differential/tmp/own-guards-'));
let serial = 0;
try {
  for (const [name, source, value, effects = [], discarded = false, windowSensitive = true] of cases) {
    scenarioSource(source);
    const outputs = [['native', source]];
    for (const host of ['babel', 'unplugin']) {
      async function transform(code) {
        return host === 'babel' ? (await transformAsync(code, config)).code
          : createUnplugin(OPTIONS).transform(code, 'input.mjs')?.code ?? code;
      }
      const first = await transform(source);
      const second = await transform(first);
      const third = await transform(second);
      check(`${ name }/${ host }/second pass`, second, first);
      check(`${ name }/${ host }/third pass`, third, second);
      if (discarded) check(`${ name }/${ host }/no dead self import`, /["']@core-js\/pure\/actual\/self["']/u.test(first), false);
      if (name === 'consumed read') check(`${ name }/${ host }/keeps self import`, first.includes('/actual/self'), true);
      outputs.push([`${ host }/first`, first], [`${ host }/second`, second]);
      if (host === 'unplugin') {
        const post = transformPrePost(createUnplugin(OPTIONS), source, 'input.mjs')?.code ?? source;
        check(`${ name }/pre+post`, post, first);
        outputs.push(['pre+post', post]);
      }
      const lowered = (await transformAsync(second, {
        configFile: false, babelrc: false,
        plugins: [requireBabel.resolve('@babel/plugin-transform-object-rest-spread'),
          requireBabel.resolve('@babel/plugin-transform-destructuring'), requireBabel.resolve('@babel/plugin-transform-optional-chaining')],
      })).code;
      outputs.push([`${ host }/lowered`, lowered]);
    }
    for (const [host, output] of outputs) {
      const file = path.join(directory, `source-${ serial++ }.mjs`);
      await fs.writeFile(file, output);
      for (const present of windowSensitive ? [false, true] : [true]) {
        const wrapper = path.join(directory, `wrapper-${ serial++ }.mjs`);
        await fs.writeFile(wrapper, `import realm from '@core-js/pure/actual/global-this';
          realm.window = ${ present ? 'realm' : 'undefined' }; realm.self = realm;
          realm.items = [3, 7]; realm.Map.customY = 'native';
          realm[Symbol.iterator] = function realmIter() {};
          ${ host !== 'native' && name === 'discarded backed run' ? 'delete realm.self;' : '' }
          const mod = await import(${ JSON.stringify(pathToFileURL(file).href) });
          export const r = mod.r; export const effects = mod.effects;`);
        for (const strip of host === 'native' ? [false] : [false, true]) {
          const expected = present ? `OK|${ JSON.stringify(value) }|${ JSON.stringify(effects) }` : 'ERR|TypeError';
          check(`${ name }/${ host }/window ${ present }/strip ${ strip }`, await runInWorker(wrapper, { strip }), expected);
        }
      }
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
