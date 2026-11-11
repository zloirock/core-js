// Residual keys and defaults observe extracted bindings at their original source slots.
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
const { check, finish } = createChecker('residual-extraction-order-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'residual-extraction-order-'));
const cases = [];

for (const kind of ['const', 'let', 'var', 'assign', 'multi', 'header']) for (const keyed of [false, true]) {
  const pattern = keyed ? '{ from, [key(typeof from)]: of }' : '{ from, make = from }';
  const result = keyed ? 'of(7)[0]' : 'make([7])[0]';
  const statement = kind === 'assign' ? `let from, ${ keyed ? 'of' : 'make' }; (${ pattern } = holder.A); return ${ result };`
    : kind === 'multi' ? `const before = note('before'), ${ pattern } = holder.A, after = note('after'); return ${ result };`
    : kind === 'header' ? `for (const ${ pattern } = holder.A;;) return ${ result };`
    : `${ kind } ${ pattern } = holder.A; return ${ result };`;
  cases.push([`static/${ kind }/${ keyed }`, `
    function note(value) { effects.push(value); return value; }
    function key(value) { note(value); return 'of'; }
    const holder = { get A() { note('init'); return Array; } };
    ${ statement }
  `, 7, [...kind === 'multi' ? ['before'] : [], 'init', ...keyed ? ['function'] : [], ...kind === 'multi' ? ['after'] : []]]);
}

for (const kind of ['const', 'let', 'var', 'assign', 'multi']) {
  const pattern = '{ Array: { from }, make = from }';
  cases.push([`realm/${ kind }`, `
    const holder = { get realm() { effects.push('init'); return globalThis; } };
    ${ kind === 'assign' ? `let from, make; (${ pattern } = holder.realm);`
    : kind === 'multi' ? `const before = effects.push('before'), ${ pattern } = holder.realm, after = effects.push('after');`
    : `${ kind } ${ pattern } = holder.realm;` }
    return make([7])[0];
  `, 7, [...kind === 'multi' ? ['before'] : [], 'init', ...kind === 'multi' ? ['after'] : []]]);
}

for (const kind of ['const', 'var', 'multi', 'header']) for (const trailing of [false, true]) {
  const pattern = `{ y: { u: { x } = fallback(), at = defaultAt(typeof x)${ trailing ? ', [key(at)]: after = at' : '' } } }`;
  const result = trailing ? '[x, at, after]' : '[x, at]';
  cases.push([`default/${ kind }/${ trailing }`, `
    function note(value) { effects.push(value); return value; }
    function fallback() { note('u'); return { x: 7 }; }
    function defaultAt(value) { note('at:' + value); return 8; }
    function key(value) { note(value); return 'after'; }
    function read(source) {
      ${ kind === 'header' ? `for (const ${ pattern } = { y: source };;) return ${ result };`
    : `${ kind === 'multi' ? "const before = note('before')," : kind } ${ pattern } = { y: source }; return ${ result };` }
    }
    return read({});
  `, trailing ? [7, 8, 8] : [7, 8], [...kind === 'multi' ? ['before'] : [], 'u', 'at:number', ...trailing ? [8] : []]]);
}

for (const kind of ['const', 'var']) for (const trailing of [false, true]) cases.push([`rest/${ kind }/${ trailing }`, `
  function readLater() { try { effects.push(typeof W); } catch (error) { effects.push(error.name); } return 7; }
  function readInitialized() { effects.push(typeof W); return 8; }
  Object.defineProperty(Number, 'orderProbe', { enumerable: true, configurable: true, get: readLater });
  ${ trailing ? "Object.defineProperty(Math, 'orderProbe', { enumerable: true, configurable: true, get: readInitialized });" : '' }
  ${ kind } { Number: { isInteger, ...numbers }, WeakMap: W${ trailing ? ', Math: { trunc, ...math }' : '' } } = (effects.push('prefix'), globalThis);
  delete Number.orderProbe;
  ${ trailing ? 'delete Math.orderProbe;' : '' }
  return [isInteger(7), numbers.orderProbe, typeof W${ trailing ? ', trunc(1.9), math.orderProbe' : '' }];
`, trailing ? [true, 7, 'function', 1, 8] : [true, 7, 'function'],
  ['prefix', kind === 'const' ? 'ReferenceError' : 'undefined', ...trailing ? ['function'] : []]]);

for (const kind of ['const', 'let', 'var', 'assign', 'multi']) cases.push([`instance/${ kind }`, `
  const holder = { get list() { effects.push('init'); return [7]; } };
  ${ kind === 'assign' ? 'let at, last; ({ at, last = at } = holder.list);'
    : kind === 'multi' ? "const before = effects.push('before'), { at, last = at } = holder.list, after = effects.push('after');"
    : `${ kind } { at, last = at } = holder.list;` }
  return last.call([8], 0);
`, 8, [...kind === 'multi' ? ['before'] : [], 'init', ...kind === 'multi' ? ['after'] : []]]);

for (const imported of [false, true]) cases.push([`binding/${ imported }`, `
  ${ imported ? '' : 'let rows = []; function rebind() { rows = { at: () => 99 }; return {}; }' }
  const before = effects.push('before'), { y: { 0: { first } = rebind(), at } } = { y: rows };
  return [typeof first, at.call([8], 0)];
`, ['undefined', 8], ['before'], imported
  ? "import { rows, rebind } from 'data:text/javascript,export let rows=[];export function rebind(){rows={at:()=>99};return {}}';" : '']);

cases.push(['native-tdz', `
  const holder = { get A() { effects.push('init'); return Array; } };
  try { const { custom = of, of } = holder.A; return typeof custom; } catch (error) { return error.name; }
`, 'ReferenceError', ['init']], ['throwing-init', `
  const holder = { get A() { effects.push('init'); throw new RangeError(); } };
  try { const { from, make = from } = holder.A; return make([7]); } catch (error) { return error.name; }
`, 'RangeError', ['init']], ['direct-default-before-key', `
  function read(held) {
    const { at: method = (effects.push('default'), Array.from), [(effects.push('key'), 'other')]: other } = held;
    return [method([7])[0], other];
  }
  return read({ get at() { effects.push('get'); }, other: 3 });
`, [7, 3], ['get', 'default', 'key']]);
for (const instance of [false, true]) cases.push([`partial-memo/${ instance }`, `
  function observe() { try { effects.push(typeof read); } catch (error) { effects.push(error.name); } return 7; }
  const { other = observe(), ${ instance ? 'at' : 'keys' }: read } = ${ instance ? '[1, 2]' : "(effects.push('prefix'), globalThis.Object)" };
  return [other, ${ instance ? 'read.call([8], 0)' : 'read({ a: 1 })[0]' }];
`, instance ? [7, 8] : [7, 'a'], [...instance ? [] : ['prefix'], 'ReferenceError']]);
cases.push(['rest-null-before-write', `
  function read(enabled) {
    let of = 'old', rest;
    try { ({ Array: { of, ...rest } } = enabled && globalThis); } catch (error) { effects.push(error.name); }
    return of;
  }
  return read(false);
`, 'old', ['TypeError']], ['empty-sibling-throws', `
  try { const {} = null, { at, other } = [1, 2]; return typeof at + other; }
  catch (error) { return error.name; }
`, 'TypeError']);
for (const name of ['static/const/false', 'realm/assign', 'default/multi/true']) {
  const [, body, expected, events] = cases.find(row => row[0] === name);
  cases.push([`rebuilt/${ name }`, `const values = []; values.push((() => { ${ body } })()); return values[0];`, expected, events]);
}

for (const kind of ['const', 'var', 'assign', 'header']) for (const trailing of [false, true]) cases.push([`symbol-default/${ kind }/${ trailing }`, `
  function read(source) {
    ${ kind === 'assign' ? 'let before, iterator, after;' : '' }
    ${ kind === 'header' ? 'for (const ' : kind === 'assign' ? '(' : kind }
      { y: { before = (effects.push('before'), 1), [Symbol.iterator]: iterator = (effects.push('default'), 7)${ trailing ? ', after = (effects.push(typeof iterator), iterator)' : '' } } } = { y: source }
    ${ kind === 'header' ? ';;)' : kind === 'assign' ? ');' : ';' }
    return [before, iterator${ trailing ? ', after' : '' }];
  }
  return read({});
`, trailing ? [1, 7, 7] : [1, 7], ['before', 'default', ...trailing ? ['number'] : []]]);

for (const host of ['if', 'while', 'for']) for (const first of [false, true]) for (const mutate of [false, true]) {
  const pattern = `{ y: { ${ first ? 'other: { q }, at, includes' : 'at, other: { q }, includes' } } }`;
  const loop = host === 'if' ? 'if (true)' : host === 'while' ? 'while (turns--)' : 'for (; turns--;)';
  cases.push([`native-sibling/${ host }/${ first }/${ mutate }`, `
    const make = new Function('events', 'observe', 'mutate', ${ JSON.stringify(`
      let value = 1;
      return { y: {
        get other() { events.push('other:' + observe()); if (mutate) value = 2; return { q: 7 }; },
        get at() { events.push('at'); const saved = value; return () => saved; },
        get includes() { events.push('includes'); return () => true; }
      } };
    `) });
    const box = make(effects, () => typeof at, ${ mutate });
    let turns = 1;
    ${ loop } var ${ pattern } = { y: box.y }, end = effects.push('end');
    return [q, at(), includes(), end];
  `, [7, first && mutate ? 2 : 1, true, 4], first
    ? ['other:undefined', 'at', 'includes', 'end'] : ['at', 'other:function', 'includes', 'end']]);
}

for (const wrapped of [false, true]) for (const leading of [false, true]) for (const mode of ['fallback', 'mutate', 'throw']) {
  const pattern = `{ ${ leading ? 'includes: inc, ' : '' }y: { other: { q }, at } }`;
  const assignment = `(${ pattern } = box)`;
  const body = `
    const make = new Function('events', 'observe', ${ JSON.stringify(`
      let value = 1;
      const row = [8];
      Object.defineProperty(row, 'other', { get() {
        events.push('other:' + observe());
        ${ mode === 'throw' ? 'throw new RangeError();' : 'value = 2; return { q: 7 };' }
      } });
      ${ mode === 'mutate' ? "Object.defineProperty(row, 'at', { get() { events.push('at'); const saved = value; return () => saved; } });" : '' }
      return { get includes() { events.push('includes'); return () => true; }, get y() { events.push('y'); return row; } };
    `) });
    function read() {
      let inc, q, at;
      const box = make(effects, () => typeof inc);
      try { ${ wrapped ? `(${ assignment })` : assignment }; }
      catch (error) { return [error.name, typeof at]; }
      return [q, at.call([8], 0)];
    }
    return read();
  `;
  const expected = mode === 'throw' ? ['RangeError', 'undefined'] : [7, mode === 'mutate' ? 2 : 8];
  const events = [...leading ? ['includes'] : [], 'y', `other:${ leading ? 'function' : 'undefined' }`, ...mode === 'mutate' ? ['at'] : []];
  cases.push([`assignment-native-sibling/${ wrapped }/${ leading }/${ mode }`, body, expected, events]);
}

for (const mode of ['result', 'result-sole', 'prefix', 'call', 'rebind']) {
  const used = mode.startsWith('result');
  const leading = mode !== 'result-sole';
  cases.push([`assignment-capture/${ mode }`, `
    const make = new Function('events', 'observe', ${ JSON.stringify(`
      const row = [8];
      Object.defineProperty(row, 'other', { get() { events.push('other'); return { q: 7 }; } });
      return {
        get includes() { events.push('includes'); observe(); return () => true; },
        get y() { events.push('y'); return row; }
      };
    `) });
    let inc, q, at;
    let box = make(effects, () => { ${ mode === 'rebind' ? 'box = { y: null };' : '' } });
    const original = box;
    ${ used ? 'const held = ' : '' }({ ${ leading ? 'includes: inc, ' : '' }y: { other: { q }, at } } = ${ mode === 'prefix'
      ? "(effects.push('prefix'), box)" : mode === 'call' ? "(() => { effects.push('call'); return box; })()" : 'box' });
    return [q, at.call([8], 0)${ used ? ', held === original' : '' }];
  `, [7, 8, ...used ? [true] : []], [...mode === 'prefix' || mode === 'call' ? [mode] : [], ...leading ? ['includes'] : [], 'y', 'other']]);
}

let index = 0;
try {
  for (const [name, body, expected, events = [], prelude = ''] of cases) {
    const source = ` ${ prelude } export const effects = []; export const r = (() => { ${ body } })();`;
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
        for (const strip of host === 'native' ? [false] : [false, true]) {
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
