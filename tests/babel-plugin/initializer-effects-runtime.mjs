// Discarded sources keep getter effects at their original binding position.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transform as lower } from '@swc/core';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('initializer-effects-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'initializer-effects-'));
const cases = [];

for (const throwing of [false, true]) for (const [name, statement, events] of [
  ['sole', 'const { A: { from } } = holder.box; result = from([7])[0];', ['get']],
  ['siblings', 'const before = note("before"), { A: { from } } = holder.box, after = note("after"); result = from([7])[0];', ['before', 'get', 'after']],
  ['header', 'for (const { A: { from } } = holder.box; ;) { result = from([7])[0]; break; }', ['get']],
  ['header-prefix', 'for (const { A: { from } } = (note("prefix"), holder.box); ;) { result = from([7])[0]; break; }', ['prefix', 'get']],
  ['header-two', 'for (const { A: { from }, O: { keys } } = holder.box; ;) { result = from([keys({ a: 1 })[0]])[0]; break; }', ['get']],
  ['bodyless', 'let from; if (true) ({ A: { from } } = holder.box); result = from([7])[0];', ['get']],
  ['bodyless-prefix', 'let from; if (true) ({ A: { from } } = (note("prefix"), holder.box)); result = from([7])[0];', ['prefix', 'get']],
  ['bodyless-two', 'let from, keys; if (true) ({ A: { from }, O: { keys } } = holder.box); result = from([keys({ a: 1 })[0]])[0];', ['get']],
  ['bodyless-false', 'let from; if (false) ({ A: { from } } = holder.box); result = typeof from;', []],
  ['sequence', 'let from; (note("before"), ({ A: { from } } = holder.box), note("after")); result = from([7])[0];', ['before', 'get', 'after']],
]) {
  const runs = events.includes('get');
  cases.push([`${ name }/${ throwing }`, `
    function note(value) { effects.push(value); return value; }
    const holder = { get box() { note('get'); ${ throwing ? 'throw new RangeError();' : '' } return { A: Array, O: Object }; } };
    let result;
    try { ${ statement } } catch (error) { result = error.name; }
    return result;
  `, throwing && runs ? 'RangeError' : !runs ? 'undefined' : name.endsWith('two') ? 'a' : 7,
  throwing && runs ? events.slice(0, events.indexOf('get') + 1) : events]);
}

for (const [name, statement, events] of [
  ['statement', '({ Map: { custom } } = realm.g);', ['get']],
  ['optional', '({ Map: { custom } } = realm?.g);', ['get']],
  ['sequence', '(note("before"), ({ Map: { custom } } = realm.g), note("after"));', ['before', 'get', 'after']],
  ['mixed', '({ Array: { from }, Map: { custom } } = realm.g);', ['get']],
  ['stored', '({ Map: { custom } } = held = realm.g);', ['get']],
  ['prefixed', '({ Map: { custom } } = (note("prefix"), realm.g));', ['prefix', 'get']],
  ['prefixed-sequence', '(note("before"), ({ Map: { custom } } = (note("prefix"), realm.g)), note("after"));', ['before', 'prefix', 'get', 'after']],
]) cases.push([`reanchor/${ name }`, `
  function note(value) { effects.push(value); }
  const realm = { get g() { note('get'); return globalThis; } };
  let custom, from, held;
  ${ statement }
  return typeof custom;
`, 'undefined', events]);

for (const kind of ['const', 'let', 'var']) for (const wrapper of [false, true]) cases.push([
  `partial/${ kind }/${ wrapper }`, `
    function note(value) { effects.push(value); return value; }
    ${ kind } before = note('before'), ${ wrapper ? '[' : '' }{ [note('Array')]: { from }, other }${ wrapper ? ']' : '' }
      = ${ wrapper ? '[' : '' }(note('prefix'), globalThis)${ wrapper ? ']' : '' }, after = note('after');
    return [before, from([7])[0], after, typeof other];
  `, ['before', 7, 'after', 'undefined'], ['before', 'prefix', 'Array', 'after'],
]);

for (const rest of [false, true]) cases.push([`tdz/${ rest }`, `
  let seen;
  function observe() { try { seen = typeof isInteger; } catch (error) { seen = error.name; } }
  const { Number: { isInteger${ rest ? ', ...numbers' : '' } }, WeakMap: W } = (observe(), globalThis);
  return [seen, isInteger(7), typeof W];
`, ['ReferenceError', true, 'function']]);

// A carried dispatch already evaluates its source; rescue must not call the getter twice.
cases.push(['instance-owner', `
  const holder = { get box() { effects.push('get'); return [7]; } };
  for (const { at } = holder.box; ;) return at.call([8], 0);
`, 8, ['get']]);
for (const name of ['siblings/false', 'bodyless/false', 'reanchor/mixed', 'partial/const/false']) {
  const [, body, expected, events] = cases.find(row => row[0] === name);
  cases.push([`rebuilt/${ name }`, `const values = []; values.push((() => { ${ body } })()); return values[0];`, expected, events]);
}

let index = 0;
try {
  for (const [name, body, expected, events = []] of cases) {
    const source = `export const effects = []; export const r = (() => { ${ body } })();`;
    const babel = (await transformAsync(source, {
      filename: 'input.mjs', configFile: false, babelrc: false, plugins: [[babelPlugin, OPTIONS]],
    })).code;
    const plugin = createUnplugin(OPTIONS);
    const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
    const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
    for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', pre], ['pre+post', post]]) {
      for (const lowered of host === 'native' ? [false] : [false, true]) {
        const code = lowered ? (await lower(output, {
          jsc: { parser: { syntax: 'ecmascript' }, target: 'es2015' }, module: { type: 'es6' },
        })).code : output;
        const file = path.join(DIR, `case-${ index++ }.mjs`);
        await fs.outputFile(file, code);
        // Realm statics under a partial array wrapper keep their native form by contract.
        const nativeOnly = name.startsWith('partial/') && name.endsWith('/true');
        for (const strip of host === 'native' || nativeOnly ? [false] : [false, true]) {
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
