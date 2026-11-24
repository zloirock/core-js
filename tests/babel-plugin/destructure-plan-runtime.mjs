// Rebuilt pattern hosts keep child claims, residual reads and initializer effects.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { parse } from 'oxc-parser';
import { importSources } from '../unplugin/phase-imports.mjs';
import { transform as lower } from '@swc/core';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, checkDeep, finish } = createChecker('destructure-plan-runtime', {
  tsc: 'Destructuring user-valued, missing and written builtin slots exercises runtime coercions.',
});
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

// Shared captures replaced the old emitter-specific carrier ladder. These hosts must
// retain initializer order even when their patterns consume every method.
for (const placement of ['declaration', 'siblings', 'for-init', 'bodyless']) {
  const pattern = '{ Array: { prototype: { at, includes } }, Object: C }';
  const init = '(effects.push("init"), globalThis)';
  const read = 'return [at.call([3, 7], -1), includes.call([3, 7], 7), typeof C];';
  const body = placement === 'siblings'
    ? `const lead = effects.push("lead"), ${ pattern } = ${ init }, tail = effects.push("tail"); ${ read }`
    : placement === 'for-init' ? `for (const ${ pattern } = ${ init };;) { ${ read } }`
      : placement === 'bodyless' ? `if (true) var ${ pattern } = ${ init }; ${ read }`
        : `const ${ pattern } = ${ init }; ${ read }`;
  cases.push([`carrier/${ placement }`, body, [7, true, 'function'], placement === 'siblings' ? ['lead', 'init', 'tail'] : ['init']]);
}
cases.push([
  'carrier/sibling-memo',
  'const rows = [3, 7]; function makeRows() { effects.push("make"); return rows; } '
    + 'if (true) { const first = effects.push("lead"), { y: { at } } = { y: rows }, { at: other, length } = makeRows(); '
    + 'return [first, at.call(rows, -1), other.call(rows, -1), length]; }',
  [1, 7, 7, 2], ['lead', 'make'],
]);
for (const placement of ['init', 'update']) cases.push([
  `carrier/rest-${ placement }`,
  `let from, rest, index = 0; const result = [];
   for (${ placement === 'init' ? '({ from, ...rest } = Array)' : '' }; index < 2;
     index++${ placement === 'update' ? ', ({ from, ...rest } = Array)' : '' }) {
     result.push(typeof from === 'function' ? from([index])[0] : -1);
   }
   return [result, typeof rest, Object.prototype.hasOwnProperty.call(rest, "from")];`,
  [placement === 'init' ? [0, 1] : [-1, 1], 'object', false],
]);

for (const active of [false, true]) {
  cases.push([
    `carrier/bodyless-realm-call/${ active }`,
    `function realm() { return globalThis; }
     if (${ active }) var { Array: { prototype: { flat }, isArray } } = (effects.push('prefix'), realm());
     return typeof flat === 'function' && isArray(flat.call([[7]]));`, active, active ? ['prefix'] : [],
  ], [
    `carrier/bodyless-navigation/${ active }`,
    `function read(source) {
       if (${ active }) var { slot: { items: { at } } } = { slot: source };
       return typeof at === 'function' && at.call([7], 0);
     }
     return read({ get items() { effects.push('items'); return [7]; } });`, active && 7, active ? ['items'] : [],
  ]);
}
cases.push([
  'carrier/header-realm-call',
  `function realm() { return globalThis; }
   for (var before = effects.push('before'), { Array: { prototype: { flat }, isArray } } = (effects.push('prefix'), realm()),
     after = effects.push('after');;) return [before, flat.call([[7]])[0], isArray([]), after];`,
  [1, 7, true, 3], ['before', 'prefix', 'after'],
], [
  'carrier/update-rest-on-realm',
  `let from, rest;
   for (let i = 0; i < 1; i++, (({ globalThis: { Array: { from } }, ...rest } = globalThis), 0)) effects.push('body');
   return [from([7])[0], Object.prototype.hasOwnProperty.call(rest, 'globalThis')];`,
  [7, false], ['body'],
]);

for (const assign of [false, true]) {
  function wrap(pattern) { return assign ? `let m; (${ pattern });` : `const ${ pattern };`; }
  for (const fallback of ["(effects.push('default'), flag) ? globalThis : user", "(effects.push('default'), flag ? globalThis : user)"]) {
    cases.push([
      `level-default/present-outer/${ assign }/${ fallback }`,
      `const flag = true, user = {}; try { ${ wrap(`{ Map: { Map: { groupBy: m } } = ${ fallback } } = globalThis`) } return typeof m; } catch (error) { return error.name; }`,
      'TypeError',
    ]);
  }
  for (const supplied of [false, true]) cases.push([
    `level-default/user/${ assign }/${ supplied }`,
    `function read(source, flag) { const user = { Map: { groupBy: () => 23 } };
       ${ wrap("{ slot: { Map: { groupBy: m } } = (effects.push('default'), flag) ? globalThis : user } = source") }
       return m(); }
     return read(${ supplied ? '{ slot: { Map: { groupBy: () => 7 } } }' : '{}' }, false);`,
    supplied ? 7 : 23, supplied ? [] : ['default'],
  ]);
}

// Two defaulted nested catch bindings may need more than one declaration beside
// their shared source. Reading the neighbouring key must not replay either getter.
for (const reverse of [false, true]) {
  const codes = 'codes: { at: m = () => -1, keys: k }';
  const other = 'other: { toFixed: t = () => 0 }';
  cases.push([
    `carrier/catch-siblings/${ reverse }`,
    `const src = { codes: { get at() { effects.push('at'); return () => 7; }, keys: 17 },
       other: { get toFixed() { effects.push('fixed'); return () => 8; } } };
     try { throw src; } catch ({ ${ (reverse ? [other, codes] : [codes, other]).join(', ') } }) { return [m(), k, t()]; }`,
    [7, 17, 8], reverse ? ['fixed', 'at'] : ['at', 'fixed'],
  ]);
}
cases.push([
  'carrier/captured-computed-sibling',
  `const { Map: { groupBy: g, [(effects.push('key'), 'name')]: name }, other } = globalThis;
   return [g([7], x => x).get(7)[0], name, typeof other];`,
  [7, 'Map', 'undefined'], ['key'],
], [
  'carrier/header-user-receiver',
  `function get() { effects.push('call'); return { Array: { prototype: { flat() { return [23]; } }, isArray: () => false } }; }
   for (var before = effects.push('before'), { Array: { prototype: { flat }, isArray } } = (effects.push('prefix'), get()),
     after = effects.push('after');;) return [before, flat()[0], isArray([]), after];`,
  [1, 23, false, 4], ['before', 'prefix', 'call', 'after'],
]);

for (const throws of [false, true]) cases.push([
  `sparse-spread/${ throws }`,
  `let seen = '', end = 0, after = 0, result;
   function read(flag) { return (([{ from }]) => typeof from)([...[flag ? Array : Set, , ++end], after = end]); }
   const proto = Object.getPrototypeOf([]), length = proto.length;
   const saved = Object.getOwnPropertyDescriptor(proto, '1');
   Object.defineProperty(proto, '1', { configurable: true, get() {
     seen += this.length + ':' + end; ${ throws ? 'throw new RangeError();' : 'return 17;' }
   } });
   try { result = read(true); } catch (error) { result = error.name; } finally {
     if (saved) Object.defineProperty(proto, '1', saved); else delete proto[1];
     proto.length = length;
   }
   return [seen, end, after, result];`,
  ['3:1', 1, throws ? 0 : 1, throws ? 'RangeError' : 'function'],
]);

// A constructor can be polyfilled while the excluded realm name remains native.
// A plain read beyond the closing parenthesis still evaluates its key and throws.
for (const rootState of ['missing', 'undefined', 'present']) for (const outcome of ['read', 'throw', 'supplied']) {
  const supplied = outcome === 'supplied';
  cases.push([
    `sealed-passthrough/${ rootState }/${ outcome }`,
    `const root = Function('return this')();
     const previous = Object.getOwnPropertyDescriptor(root, 'self'), win = Object.getOwnPropertyDescriptor(root, 'window');
     try {
       ${ rootState === 'missing' ? 'delete root.self;'
        : `Object.defineProperty(root, 'self', { configurable: true, value: ${ rootState === 'present' ? 'root' : 'undefined' } });` }
       Object.defineProperty(root, 'window', { configurable: true, value: root });
       function key() { effects.push('key'); ${ outcome === 'throw' ? 'throw new RangeError();' : '' } }
       function read({ from: m } = (self?.globalThis.window)[(key(), 'Array')]) { return m([3])[0]; }
       try { return ${ supplied ? 'read({ from() { return [7]; } })' : 'read()' }; } catch (error) { return error.name; }
     } finally {
       if (previous) Object.defineProperty(root, 'self', previous); else delete root.self;
       if (win) Object.defineProperty(root, 'window', win); else delete root.window;
     }`,
    supplied ? 7 : rootState === 'missing' ? 'ReferenceError' : outcome === 'throw' ? 'RangeError'
      : rootState === 'undefined' ? 'TypeError' : 3, supplied || rootState === 'missing' ? [] : ['key'],
      { ...OPTIONS, exclude: ['self'] },
  ]);
}

for (const method of ['entry-global', 'usage-global', 'usage-pure']) {
  for (const directive of ['file', 'line', 'next-line', 'active']) {
    const entry = 'core-js/actual/array/at';
    const body = method === 'entry-global' ? `import "${ entry }";` : 'const { globalThis: { Array: { prototype: { at } }, Object: o } } = globalThis;';
    const source = directive === 'active' ? body : directive === 'line' ? `${ body } // core-js-disable-line`
      : `// core-js-disable-${ directive }\n${ body }`;
    const options = { ...OPTIONS, method };
    const babel = (await transformAsync(source, {
      filename: 'input.mjs', configFile: false, babelrc: false, plugins: [[babelPlugin, options]],
    })).code;
    const plugin = createUnplugin(options);
    const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
    const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
    for (const [host, output] of [['babel', babel], ['unplugin', pre], ['pre+post', post]]) {
      const expected = directive !== 'active' ? method === 'entry-global' ? [entry] : []
        : method === 'entry-global' ? ['core-js/modules/es.array.at']
          : method === 'usage-pure' ? ['@core-js/pure/actual/array/instance/at', '@core-js/pure/actual/global-this']
            : host === 'unplugin' ? [] : ['core-js/modules/es.array.at', 'core-js/modules/es.global-this'];
      const parsed = await parse('input.mjs', output);
      checkDeep(`opt-out/${ method }/${ directive }/${ host }`, importSources(parsed.program), expected);
    }
  }
}

let index = 0;
try {
  for (const [name, body, expected, events = [], options = OPTIONS] of cases) {
    const source = scenarioSource(`export const effects = []; export const r = (() => { ${ body } })();`);
    const babel = (await transformAsync(source, {
      filename: 'input.mjs', configFile: false, babelrc: false, plugins: [[babelPlugin, options]],
      parserOpts: { createParenthesizedExpressions: name.startsWith('parenthesized/') },
    })).code;
    const plugin = createUnplugin(options);
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
// A later parameter keeps this pattern native. A sibling plugin can still rewrite a
// following array element between spread preparation and core-js's Program.exit.
for (const spread of ['...[]', '...[x, y]']) {
  const source = `function read([{ y: { at: method } }] = [seed, ${ spread }, tail], b = method) { return b; }`;
  const { ast } = await transformAsync(source, {
    babelrc: false, configFile: false, ast: true, code: false,
    plugins: [[babelPlugin, OPTIONS], ({ types: t }) => ({ visitor: {
      Identifier(id) {
        if (id.node.name === 'tail' && id.parentPath.isArrayExpression()) id.replaceWith(t.identifier('changed'));
      },
    } })],
  });
  const { body } = ast.program;
  check(`unclaimed spread/${ spread }/no import`, body.length, 1);
  const { elements } = body[0].params[0].right;
  check(`unclaimed spread/${ spread }/restored list`, elements.length, 3);
  check(`unclaimed spread/${ spread }/spread`, elements[1].type, 'SpreadElement');
  check(`unclaimed spread/${ spread }/sibling edit`, elements[2].name, 'changed');
}

finish();
