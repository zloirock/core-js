// Captures preserve iterator positions, source coercions and each key's evaluation.
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
const { check, finish } = createChecker('destructure-capture-ownership-runtime', {
  tsc: 'Destructuring intentionally reads absent realm slots and arbitrary iterator values.',
});
const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const cases = [];
for (const assignment of [false, true]) for (const prefix of [false, true]) {
  const pattern = '{ Array: { from, prototype: { [Symbol.iterator]: it } } }';
  const init = prefix ? '(effects.push("init"), globalThis)' : 'globalThis';
  cases.push([`prototype/${ assignment }/${ prefix }`, `${ assignment ? `let from, it; (${ pattern } = ${ init });`
    : `const ${ pattern } = ${ init };` } return [from([7])[0], it.call([8]).next().value];`, [7, 8], prefix ? ['init'] : []]);
}
for (const [name, pattern, source, key, expected] of [
  ['iterator', '[{ [key()]: method }]', 'values([7, 8])', 'at', 8],
  ['second', '[, { [key()]: method }]', 'values(0, [7, 8])', 'at', 8],
  ['nested', '[[{ [key()]: method }]]', 'values([[7, 8]])', 'at', 8],
  ['sibling', '[{ [key()]: method, length }]', 'values([7, 8])', 'at', 8],
  ['default', '[{ [key()]: method = () => 9 }]', 'values([7, 8])', 'at', 8],
  ['element-default', '[{ [key()]: method } = [7, 8]]', 'values(undefined)', 'at', 8],
  ['string', '[{ [key()]: method }]', 'values("ab")', 'at', 'b'],
]) {
  cases.push([`array/${ name }`, `function key() { effects.push('key'); return '${ key }'; }
    function* values(...items) { effects.push('start'); try { yield* items; } finally { effects.push('close'); } }
    const ${ pattern } = ${ source }; return method.call(${ name === 'string' ? '"ab"' : '[7, 8]' }, -1);`, expected,
  // Positional extraction intentionally reads after native iteration; the key stays after close.
  ['start', 'key', 'close']]);
}
for (const [name, expression] of [
  ['value', 'const result = ({ of } = globalThis.window?.Array); return result;'],
  ['call', 'return ((value) => value)(({ of } = globalThis.window?.Array));'],
  ['arrow', 'return (() => ({ of } = globalThis.window?.Array))();'],
  ['statement', '({ of } = globalThis.window?.Array); return of;'],
]) cases.push([`nullish/${ name }`, `let of = 'unchanged'; try { ${ expression } }
  catch (error) { return [error.name, of]; }`, ['TypeError', 'unchanged'], []]);
for (const [name, body, expected, effects] of [
  ['iterator-write', `Array.prototype[Symbol.iterator] = function () { effects.push('iterator'); throw new RangeError('iterator'); };
    const { Array: { from, prototype: { [Symbol.iterator]: it } } } = globalThis;
    try { it.call([]); } catch (error) { return [typeof from, error.name]; }`, ['function', 'RangeError'], ['iterator']],
  ['iterator-default', `const { Array: { from, prototype: { [Symbol.iterator]: it = (() => { effects.push('default'); })() } } } = globalThis;
    return [from([7])[0], it.call([8]).next().value];`, [7, 8], []],
  ['iterator-alias', `const K = Symbol.iterator; const { Array: { from, prototype: { [K]: it } } } = globalThis;
    return [from([7])[0], it.call([8]).next().value];`, [7, 8], []],
  ['null-element', `function key() { effects.push('key'); return 'at'; } function* values() { yield null; }
    try { const [{ [key()]: at }] = values(); return at; } catch (error) { return error.name; }`, 'TypeError', []],
  ['throwing-key', `function key() { effects.push('key'); throw new RangeError('key'); } function* values() { yield [7]; }
    try { const [{ [(key(), 'at')]: at }] = values(); return at; } catch (error) { return error.name; }`, 'RangeError', ['key']],
  ['result-identity', `let of; const source = globalThis.Array;
    const value = ({ of } = (effects.push('init'), source)); return [value === source, of(7)];`, [true, [7]], ['init']],
  ['result-target-order', `const sink = { set value(value) { effects.push('write'); } };
    try { return ({ of: sink.value } = (effects.push('init'), globalThis.window?.Array)); }
    catch (error) { return error.name; }`, 'TypeError', ['init']],
  ['namespace-prototype', `try { const { Math: { trunc, prototype: { [Symbol.iterator]: it } } } = globalThis;
    return [typeof trunc, typeof it]; } catch (error) { return error.name; }`, 'TypeError', []],
  ['namespace-parameter', `function read({ JSON: { stringify, prototype: { [Symbol.iterator]: it } } } = globalThis) {
    return [typeof stringify, typeof it]; } try { return read(); } catch (error) { return error.name; }`, 'TypeError', []],
]) cases.push([`boundary/${ name }`, body, expected, effects]);
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const directory = await fs.mkdtemp(path.join(tmp, 'capture-ownership-'));
let serial = 0;
try {
  for (const [name, body, want, effects] of cases) {
    const source = scenarioSource(`export const effects = []; export const r = (() => { ${ body } })();`);
    const outputs = [['native', source]];
    for (const host of ['babel', 'unplugin', 'pre+post']) {
      let code = source;
      if (host === 'babel') code = (await transformAsync(code, {
        configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
        parserOpts: { createParenthesizedExpressions: true },
      })).code;
      else {
        const plugin = createUnplugin(options);
        for (const pass of host === 'pre+post' ? ['pre', 'post'] : ['single']) code = plugin.transform(code, 'input.mjs', pass)?.code ?? code;
      }
      outputs.push([host, code]);
    }
    for (const [host, output] of outputs) for (const lowered of host === 'native' || name.startsWith('array/') ? [false] : [false, true]) {
      const code = lowered ? (await transformAsync(output, { configFile: false, babelrc: false,
        plugins: ['transform-destructuring', 'transform-optional-chaining'].map(plugin => requireBabel.resolve(`@babel/plugin-${ plugin }`)) })).code : output;
      const file = path.join(directory, `case-${ serial++ }.mjs`);
      await fs.writeFile(file, code);
      for (const strip of host === 'native' ? [false] : [false, true]) {
        check(`${ name }/${ host }/${ lowered }/${ strip }`, await runInWorker(file, { strip }),
          `OK|${ JSON.stringify(want) }|${ JSON.stringify(host !== 'native' && name.startsWith('array/') ? ['start', 'close', 'key'] : effects) }`);
      }
      if (name.startsWith('prototype/')) {
        const wrapper = path.join(directory, `case-${ serial++ }.mjs`);
        await fs.writeFile(wrapper, `globalThis.Symbol = undefined;
          const value = await import(${ JSON.stringify(pathToFileURL(file).href) });
          export const r = value.r; export const effects = value.effects;`);
        check(`${ name }/${ host }/${ lowered }/without-symbol`, await runInWorker(wrapper, { strip: false }),
          host === 'native' ? 'ERR|TypeError' : `OK|${ JSON.stringify(want) }|${ JSON.stringify(effects) }`);
      }
    }
  }
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
finish();
