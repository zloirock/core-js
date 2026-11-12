// Repeated passes preserve captures, evaluation order and already extracted bindings.
// Foreign Babel temporaries must still receive their missing instance polyfills.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { transformPrePost } from '../unplugin/phase-imports.mjs';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('own-output-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const config = { configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, OPTIONS]] };
const cases = [
  ['foreign temporary', 'var _ref; _ref = [3, 7]; export const r = _ref.at(-1); export const effects = [];', 7],
  ['foreign destructured temporary', 'var _ref; _ref = [3, 7]; const { at } = _ref; export const r = at.call(_ref, -1); export const effects = [];', 7],
  ['foreign array temporary', 'var _ref; [, _ref] = [null, [3, 7]]; export const r = _ref.at(-1); export const effects = [];', 7],
  ['captured native neighbour', `export const effects = []; const second = [3, 7]; let includes, of;
    ([{ includes }, { of }] = [second, globalThis.ownCaptureFlag ? Array : { of: value => value }]);
    export const r = [includes.call(second, 3), of(5)];`, [true, 5]],
  ['lowered optional', 'var _ref; const rows = [3, 7]; export const r = (_ref = rows || []) === null || _ref === void 0 ? void 0 : _ref.at(-1); export const effects = [];', 7],
  ['local guarded receiver', `export const effects = []; export const r = (() => {
    const options = { root: { self: { items: [4, 9] } } }; return (options.root ??= globalThis)?.self.items.at(-1);
  })();`, 9],
  ['parameter overwrite', `export const effects = [];
    function f([{ from, [(effects.push("key"), "k")]: x } = Array]) { return from([9])[0]; }
    export const r = f([void 0]);`, 9, ['key']],
  ['two parameter overwrites', `export const effects = [];
    function f([{ of, from, [(effects.push("key"), "k")]: x } = Array]) { return [of(4)[0], from([9])[0]]; }
    export const r = f([void 0]);`, [4, 9], ['key']],
  ['capture beside an intrinsic', `export const effects = []; export const r = (() => {
    let name, groupBy; const value = ({ name, groupBy } = globalThis.zz || Map);
    return [typeof name, typeof groupBy, value === Map];
  })();`, ['string', 'function', true]],
];
const hosts = [
  expression => `if (${ expression }) effects.push('body');`,
  expression => `while (${ expression }) { effects.push('body'); break; }`,
  expression => `do { effects.push('body'); } while ((${ expression }, false));`,
  expression => `for (${ expression }; false;) {}`,
  expression => `for (; ${ expression };) { effects.push('body'); break; }`,
  expression => `for (let i = 0; i < 1; i++, ${ expression }) {}`,
  expression => `switch (${ expression }) { default: effects.push('body'); }`,
  expression => `consume(${ expression });`,
  expression => `new Consume(${ expression });`,
  expression => `true && (${ expression });`,
  expression => `const values = [${ expression }];`,
  expression => `const box = { value: (${ expression }) };`,
  expression => `export default (${ expression });`,
];
for (const [index, host] of hosts.entries()) {
  const body = host('({ from, ...rest } = Array)');
  const effects = index === 2 ? ['body', 'receiver']
    : [0, 1, 4, 6].includes(index) ? ['receiver', 'body'] : ['receiver'];
  cases.push([`expression host ${ index }`, `export const effects = []; let from, rest;
    function consume(value) { return value; } function Consume(value) { this.value = value; }
    ${ body.replace('({ from, ...rest } = Array)', '(effects.push("receiver"), { from, ...rest } = Array)') }
    export const r = from([5])[0];`, 5, effects]);
}
const directory = await fs.mkdtemp(path.join(import.meta.dirname, '../transpiler-differential/tmp/own-output-'));
let serial = 0;
try {
  for (const [name, source, value, effects = []] of cases) {
    const expected = `OK|${ JSON.stringify(value) }|${ JSON.stringify(effects) }`;
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
      const variants = [['second', second]];
      if (host === 'unplugin') {
        const post = transformPrePost(createUnplugin(OPTIONS), source, 'input.mjs')?.code ?? source;
        check(`${ name }/pre+post`, post, first);
        variants.push(['pre+post', post]);
      }
      const lowered = (await transformAsync(second, {
        configFile: false, babelrc: false,
        plugins: [requireBabel.resolve('@babel/plugin-transform-parameters'),
          requireBabel.resolve('@babel/plugin-transform-object-rest-spread'),
          requireBabel.resolve('@babel/plugin-transform-destructuring')],
      })).code;
      variants.push(['lowered', lowered]);
      for (const [variant, output] of variants) {
        const file = path.join(directory, `case-${ serial++ }.mjs`);
        await fs.writeFile(file, output);
        for (const strip of [false, true]) check(`${ name }/${ host }/${ variant }/strip ${ strip }`,
          await runInWorker(file, { strip }), expected);
      }
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
