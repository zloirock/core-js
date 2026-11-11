// Rebuilt pattern hosts keep child claims, residual reads and initializer effects.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transform as lower } from '@swc/core';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('destructure-plan-runtime', { tsc: 'Destructuring user-valued, missing and written builtin slots exercises runtime coercions.' });
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'destructure-plan-'));
const cases = [
  ['realm-hop', 'const { globalThis: { Array: { prototype: { at } }, Object: o } } = globalThis; return [at.call([7, 8], -1), typeof o];', [8, 'function']],
  ['realm-hop-reverse', 'const { globalThis: { Object: o, Array: { prototype: { at } } } } = globalThis; return [at.call([7, 8], -1), typeof o];', [8, 'function']],
  ['realm-hop-assignment', 'let at, o; ({ globalThis: { Array: { prototype: { at } }, Object: o } } = globalThis); return [at.call([7, 8], -1), typeof o];', [8, 'function']],
  ['realm-hop-iterator', 'let it; ({ globalThis: { Array: { prototype: { [Symbol.iterator]: it } } } } = globalThis); return it.call([7]).next().value;', 7],
  ['realm-hop-iterator-default', 'let it; ({ globalThis: { Array: { prototype: { [Symbol.iterator]: it = null } } } } = globalThis); return it.call([7]).next().value;', 7],
  ['realm-hop-iterator-target', 'const box = {}; ({ globalThis: { Array: { prototype: { [Symbol.iterator]: box.it } } } } = globalThis); return box.it.call([7]).next().value;', 7],
  ['realm-hop-map', 'let it; ({ globalThis: { Map: { prototype: { [Symbol.iterator]: it } } } } = globalThis); return it.call(new Map([[7, 8]])).next().value;', [7, 8]],
  [
    'realm-hop-alias',
    'const realm = globalThis; const { globalThis: { Array: { prototype: { at, includes } } } } = realm; return '
      + '[at.call([7], 0), includes.call([7], 7)];',
    [7, true],
  ],
  [
    'realm-hop-loop-alias',
    'for (const realm of [globalThis]) { const { globalThis: { Array: { prototype: { at, includes } } } } = realm; return '
      + '[at.call([7], 0), includes.call([7], 7)]; }',
    [7, true],
  ],
  [
    'realm-hop-iterator-stored-declaration',
    'let held; const { globalThis: { Array: { prototype: { [Symbol.iterator]: it } }, Object: o } } = '
      + '(effects.push(["init"].at(0)), held = globalThis); return [it.call([7]).next().value, typeof o, held === globalThis];',
    [7, 'function', true], ['init'],
  ],
  [
    'realm-hop-iterator-stored-siblings',
    'let held; const before = effects.push("before"), { globalThis: { Array: { prototype: { [Symbol.iterator]: it } }, Object: o } } = '
      + '(effects.push("init"), held = globalThis), after = effects.push("after"); '
      + 'return [it.call([7]).next().value, typeof o, held === globalThis, before, after];',
    [7, 'function', true, 1, 3], ['before', 'init', 'after'],
  ],
  [
    'realm-hop-iterator-stored-for-init',
    'let held; for (const { globalThis: { Array: { prototype: { [Symbol.iterator]: it } }, Object: o } } = '
      + '(effects.push("init"), held = globalThis);;) return [it.call([7]).next().value, typeof o, held === globalThis];',
    [7, 'function', true], ['init'],
  ],
  [
    'stored-realm-prefix-throws',
    'let held; function fail() { effects.push("init"); throw new RangeError(); } try { '
      + 'const { globalThis: { Array: { prototype: { [Symbol.iterator]: it } }, Object: o } } = (fail(), held = globalThis); '
      + 'return [it, o]; } catch (error) { return [error.name, held === undefined]; }',
    ['RangeError', true], ['init'],
  ],
  [
    'realm-hop-iterator-sibling',
    'let it, o; ({ globalThis: { Array: { prototype: { [Symbol.iterator]: it } }, Object: o } } = globalThis); return '
      + '[it.call([7]).next().value, typeof o];',
    [7, 'function'],
  ],
  ['array-split', 'function read(obj) { const { list: [{ at }], y } = obj; return [at.call([7, 8], -1), y]; } return read({ list: [[7, 8]], y: 1 });', [8, 1]],
  ['array-split-deep', 'function read(obj) { let { a: { list: [{ at }] }, y } = obj; return [at.call([7, 8], -1), y]; } return read({ a: { list: [[7, 8]] }, y: 1 });', [8, 1]],
  ['array-split-before', 'function read(obj) { const { y, list: [{ at }] } = obj; return [at.call([7, 8], -1), y]; } return read({ list: [[7, 8]], y: 1 });', [8, 1]],
  ['array-split-for-init', 'function read(obj) { for (const { list: [{ at }], y } = obj; y;) return at.call([7, 8], -1); } return read({ list: [[7, 8]], y: 1 });', 8],
  ['array-split-bodyless', 'function read(obj) { if (obj) var { list: [{ at }], y } = obj; return [at.call([7, 8], -1), y]; } return read({ list: [[7, 8]], y: 1 });', [8, 1]],
  ['array-split-assignment', 'function read(obj) { let at, y; ({ list: [{ at }], y } = obj); return [at.call([7, 8], -1), y]; } return read({ list: [[7, 8]], y: 1 });', [8, 1]],
  ['array-default', 'function read(obj) { const { list: [{ at } = [7, 8]], y } = obj; return [at.call([7, 8], -1), y]; } return read({ list: [undefined], y: 1 });', [8, 1]],
  ['fallback-parameter', 'function pick() { return true; } function read({ w: { Array: { from } } = pick() ? globalThis : {} } = {}) { return from([7])[0]; } return read();', 7],
  ['fallback-iife', 'function pick() { return true; } return (({ w: { Array: { from } } = pick() ? globalThis : {} }) => from([7])[0])({});', 7],
  [
    'fallback-missing',
    'function pick() { return false; } function read({ w: { Array: { from } } = pick() ? globalThis : {} } = {}) { return from([7]); } '
      + 'try { return read(); } catch (error) { return error.name; }',
    'TypeError',
  ],
  [
    'fallback-supplied',
    'function pick() { effects.push("default"); return true; } function read({ w: { Array: { from } } = pick() ? globalThis : {} } = {}) '
      + '{ return from([7]); } return read({ w: { Array: { from() { return 23; } } } });',
    23,
  ],
  ['static-pattern-parameter', 'function read({ groupBy: { length } } = Map) { return length; } return read();', 2],
  ['static-pattern-iife', 'return (({ groupBy: { length } }) => length)(Map);', 2],
  ['static-pattern-assignment', 'let length; ({ from: { length = 9 } } = Array); return length;', 1],
  ['static-pattern-member', 'const box = {}; ({ from: { length: box.length = 9 } } = Array); return box.length;', 1],
  ['static-pattern-default', 'let value; ({ from: { absent: value = (effects.push("default"), 9) } } = Array); return value;', 9, ['default']],
  ['static-pattern-written', 'Array.from = { length: 19 }; let length; ({ from: { length = 9 } } = Array); return length;', 19],
  ['static-pattern-local', 'const Array = { from: { length: 21 } }; let length; ({ from: { length = 9 } } = Array); return length;', 21],
  ['opaque-instance', 'const get = () => globalThis; const { Array: { prototype: { flat }, isArray } } = get(); return [flat.call([[7]])[0], isArray([])];', [7, true]],
  ['opaque-instance-length', 'const get = () => globalThis; const { Array: { prototype: { flat }, length } } = get(); return [flat.call([[7]])[0], length];', [7, 1]],
  [
    'opaque-instance-prefix',
    'const get = () => globalThis; const { Array: { prototype: { flat }, isArray } } = (effects.push("init"), get()); return '
      + '[flat.call([[7]])[0], isArray([])];',
    [7, true], ['init'],
  ],
  [
    'opaque-instance-call-effects',
    'function get() { effects.push("call"); return globalThis; } const { Array: { prototype: { flat }, isArray } } = get(); return '
      + '[flat.call([[7]])[0], isArray([])];',
    [7, true], ['call'],
  ],
  [
    'opaque-instance-written',
    'function get() { Array.prototype.flat = function () { effects.push("user"); return [23]; }; return globalThis; } const { Array: { '
      + 'prototype: { flat }, isArray } } = get(); return [flat.call([[7]])[0], isArray([])];',
    [23, true], ['user'],
  ],
  [
    'opaque-instance-throw',
    'function get() { effects.push("call"); throw new RangeError(); return globalThis; } try { const { Array: { prototype: { flat }, '
      + 'isArray } } = get(); return [flat, isArray]; } catch (error) { return error.name; }', 'RangeError',
    ['call'],
  ],
  [
    'opaque-user-receiver',
    'function get() { effects.push("call"); return { Array: { prototype: { flat() { effects.push("user"); return [23]; } }, isArray() { '
      + 'return false; } } }; } const { Array: { prototype: { flat }, isArray } } = get(); return [flat.call([[7]])[0], isArray([])];',
    [23, false], ['call', 'user'],
  ],
  [
    'opaque-written-realm-slot',
    'function get() { effects.push("call"); globalThis.Array = { prototype: { flat() { effects.push("user"); return [23]; } }, isArray() '
      + '{ return false; } }; return globalThis; } const { Array: { prototype: { flat }, isArray } } = get(); return [flat.call([[7]])[0], '
      + 'isArray([])];',
    [23, false], ['call', 'user'],
  ],
];

for (const forInit of [false, true]) for (const before of [false, true]) cases.push([
  `static-pattern-sibling/${ forInit }/${ before }`,
  `function read(key) {
    ${ forInit ? 'for (' : '' }const { ${ before ? '[key]: other, ' : '' }from: { length }${ before ? '' : ', [key]: other' } } = globalThis.Array${ forInit ? '; ;)' : ';' }
    return [length, other];
  } return read('missing');`,
  [1, '__undefined__'],
]);

for (const name of ['realm-hop', 'array-split-assignment', 'opaque-instance-call-effects']) {
  const [, body, expected, events] = cases.find(item => item[0] === name);
  cases.push([`parenthesized/${ name }`, body.replace('= globalThis;', '= (globalThis);').replace('= get();', '= (get());'), expected, events]);
}

for (const stored of [false, true]) for (const bodyless of [false, true]) {
  const [, body, expected] = cases.find(item => item[0] === 'realm-hop-iterator-sibling');
  const init = `(effects.push(["init"].at(0)), ${ stored ? 'held = ' : '' }globalThis)`;
  const statement = body.replace('= globalThis)', `= ${ init })`).replace('({ globalThis:', `${ bodyless ? 'if (true) ' : '' }({ globalThis:`);
  cases.push([`realm-hop-iterator-effects/${ stored }/${ bodyless }`, `let held; ${ statement }`, expected, ['init']]);
}

for (const name of ['realm-hop', 'array-split', 'array-split-assignment', 'opaque-instance-call-effects']) {
  const [, body, expected, events] = cases.find(item => item[0] === name);
  cases.push([`rebuilt/${ name }`, `const results = []; results.push((() => { ${ body } })()); return results[0];`, expected, events]);
}

for (const assignment of [false, true]) for (const before of [false, true]) for (const throws of [false, true]) cases.push([
  `array-order/${ assignment }/${ before }/${ throws }`,
  `function read(obj) { ${ assignment ? 'let at, y; (' : 'const ' }{ ${ before ? 'y, ' : '' }list: [{ at }]${ before ? '' : ', y' } } = obj${ assignment ? ')' : '' }; return [at.call([7, 8], -1), y]; }
   const obj = { get y() { effects.push('y'); return 1; }, get list() {
     effects.push('list'); return { [Symbol.iterator]() { effects.push('iterator'); return {
       next() { effects.push('next'); ${ throws ? 'throw new RangeError();' : 'return { value: [7, 8], done: false };' } },
       return() { effects.push('close'); return {}; }
     }; } };
   } };
   try { return read(obj); } catch (error) { return error.name; }`,
  throws ? 'RangeError' : [8, 1],
  [...before ? ['y'] : [], 'list', 'iterator', 'next', ...throws ? [] : ['close', ...before ? [] : ['y']]],
]);

for (const method of ['entry-global', 'usage-global', 'usage-pure']) {
  for (const directive of ['file', 'line', 'next-line']) {
    const body = 'const { globalThis: { Array: { prototype: { at } }, Object: o } } = globalThis;';
    const source = directive === 'line' ? `${ body } // core-js-disable-line`
      : `// core-js-disable-${ directive }\n${ body }`;
    const options = { ...OPTIONS, method };
    const babel = (await transformAsync(source, {
      filename: 'input.mjs', configFile: false, babelrc: false, plugins: [[babelPlugin, options]],
    })).code;
    const plugin = createUnplugin(options);
    const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
    const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
    for (const [host, output] of [['babel', babel], ['unplugin', pre], ['pre+post', post]]) {
      check(`opt-out/${ method }/${ directive }/${ host }`, output.includes('@core-js/'), false);
    }
  }
}

let index = 0;
try {
  for (const [name, body, expected, events = []] of cases) {
    const source = scenarioSource(`export const effects = []; export const r = (() => { ${ body } })();`);
    const babel = (await transformAsync(source, {
      filename: 'input.mjs', configFile: false, babelrc: false, plugins: [[babelPlugin, OPTIONS]],
      parserOpts: { createParenthesizedExpressions: name.startsWith('parenthesized/') },
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
        for (const strip of host === 'native' ? [false] : [false, true]) {
          check(`${ name }/${ host }/${ lowered }/${ strip }`, await runInWorker(file, { strip }),
            // Instance entries retain core-js after a prototype patch; the native control observes the patch.
            name === 'opaque-instance-written' && host !== 'native' ? 'OK|[7,true]|[]'
              : `OK|${ JSON.stringify(expected) }|${ JSON.stringify(events) }`);
        }
        if (name.startsWith('realm-hop-iterator')) {
          const wrapper = path.join(DIR, `case-${ index++ }.mjs`);
          await fs.outputFile(wrapper, `globalThis.Symbol = undefined;
            const result = await import(${ JSON.stringify(pathToFileURL(file).href) });
            export const r = result.r; export const effects = result.effects;`);
          check(`${ name }/${ host }/${ lowered }/without-symbol`, await runInWorker(wrapper, { strip: false }),
            host === 'native' ? 'ERR|TypeError' : `OK|${ JSON.stringify(expected) }|${ JSON.stringify(events) }`);
        }
      }
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();
