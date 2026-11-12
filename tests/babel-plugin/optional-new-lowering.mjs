// Optional calls used as constructors keep their grouping without obstructing await/yield lowering.
/* eslint-disable max-depth -- Cross the native/host/legacy and lowering runtime axes. */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { traverseFast } = requireBabel('@babel/types');
const { check, checkTruthy, fail, finish } = createChecker('optional-new-lowering');
const lowerings = ['regenerator', 'optional-chaining'].map(name => requireBabel(`@babel/plugin-transform-${ name }`));
const directory = await fs.mkdtemp(path.join(import.meta.dirname, '../transpiler-differential/tmp/optional-new-'));
let serial = 0;
const cases = [
  ['yield-argument', `function* read(arr) { return new (arr.flat?.(yield 1))(7); }
    const g = read([]); effects.push(g.next().value); try { g.next(0); } catch (error) { r = error.name; }`, 'TypeError', [1]],
  ['await-argument', 'async function read(arr) { return new (arr.at?.(await 0))(7); } r = (await read([function C(x) { this.value = x; }])).value;', 7, []],
  ['await-receiver', `async function read(get) { return new ((await get()).at?.(0))(7); }
    r = (await read(async () => { effects.push("get"); return [function C(x) { this.value = x; }]; })).value;`, 7, ['get']],
  ['await-flat-receiver', `async function read(get) { return new ((await get()).flat?.())(); }
    try { await read(async () => { effects.push("get"); return []; }); } catch (error) { r = error.name; }`, 'TypeError', ['get']],
  ['yield-new-argument', `function* read(arr) { return new (arr.flat?.())(yield 1); }
    const g = read([]); effects.push(g.next().value); try { g.next(0); } catch (error) { r = error.name; }`, 'TypeError', [1]],
  ['null-method', `async function read(arr) { return new (arr.at?.(await effects.push("arg")))(effects.push("new")); }
    try { await read({ at: null }); } catch (error) { r = error.name; }`, 'TypeError', ['new']],
  ['receiver-guard', 'async function read(arr) { return new (arr?.at(await 0))(7); } r = (await read([function C(x) { this.value = x; }])).value;', 7, []],
  ['null-receiver', `async function read(arr) { return new (arr?.at(await effects.push("arg")))(effects.push("new")); }
    try { await read(null); } catch (error) { r = error.name; }`, 'TypeError', ['new']],
];
try {
  for (const [name, body, want, effects] of cases) {
    const source = `export const effects = []; let r; ${ body } export { r };`;
    for (const method of ['native', 'usage-global', 'usage-pure', 'legacy-pure']) for (const lowered of [false, true]) {
      const label = `${ name }/${ method }/${ lowered }`;
      try {
        const { code, ast } = await transformAsync(source, {
          configFile: false, babelrc: false, ast: true, filename: 'optional-new.mjs',
          plugins: [
            ...method === 'native' ? [] : [[method === 'legacy-pure'
              ? (api, opts, dirname) => babelPlugin(Object.create(api, { version: { value: '7.29.7' } }), opts, dirname)
              : babelPlugin, { method: method === 'legacy-pure' ? 'usage-pure' : method, version: '4.0', targets: { ie: 11 } }]],
            ...lowered ? lowerings : [],
          ],
        });
        if (method !== 'native') checkTruthy(`${ label }/injection`, code.includes(method.endsWith('pure') ? '@core-js/pure' : 'core-js/modules/'));
        if (method === 'legacy-pure' && !lowered && name !== 'receiver-guard' && name !== 'null-receiver') {
          let restored = false;
          traverseFast(ast, node => { restored ||= node.type === 'NewExpression' && node.callee.type === 'ParenthesizedExpression'; });
          checkTruthy(`${ label }/late constructor seal`, restored);
        }
        const file = path.join(directory, `case-${ serial++ }.mjs`);
        await fs.writeFile(file, code);
        check(`${ label }/runtime`, await runInWorker(file, { strip: false }), `OK|${ JSON.stringify(want) }|${ JSON.stringify(effects) }`);
      } catch (error) { fail(label, error.message); }
    }
  }
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
finish();
