// Default branches and generated capture reads preserve values, order and claim ownership.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href) : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('destructure-default-claims-runtime', {
  tsc: 'Unknown computed slots and deliberately absent constructors exercise runtime defaults.',
});
async function transform(source, host, method) {
  const options = { method, version: '4.0', targets: { ie: 11 } };
  if (host === 'babel') return (await transformAsync(source, {
    configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
    parserOpts: { createParenthesizedExpressions: true },
  })).code;
  const plugin = createUnplugin(options);
  for (const pass of host === 'pre+post' ? ['pre', 'post'] : ['single']) source = plugin.transform(source, 'input.mjs', pass)?.code ?? source;
  return source;
}
const cases = [];
for (const name of ['AggregateError', 'Map']) for (const host of ['declaration', 'assignment', 'for-init']) {
  const pattern = `{ ${ name }: C = fallback(), other }`;
  const init = '(effects.push("init"), globalThis)';
  const source = host === 'assignment' ? `let C, other; (${ pattern } = ${ init });`
    : host === 'for-init' ? `for (var ${ pattern } = ${ init };;) break;` : `const ${ pattern } = ${ init };`;
  cases.push([`global/${ name }/${ host }`, `function fallback() { effects.push('default'); return function replacement() {}; } ${ source } return typeof C;`, 'function', ['init'], ['usage-global', 'usage-pure']]);
}
for (const name of ['Map', 'Object']) for (const host of ['declaration', 'assignment', 'parameter']) {
  const pattern = `{ [key()]: { groupBy } = (effects.push('default'), ${ name }) }`;
  const read = name === 'Map' ? 'groupBy([1, 2], value => value % 2).get(1)[0]' : 'groupBy([1, 2], value => value % 2)[1][0]';
  const source = host === 'assignment' ? `let groupBy; (${ pattern } = {}); return ${ read };`
    : host === 'parameter' ? `function run(${ pattern }) { return ${ read }; } return run({});`
      : `const ${ pattern } = {}; return ${ read };`;
  // Object has no pure constructor substitution beneath an opaque key; global still owes its static.
  cases.push([`key/${ name }/${ host }`, `function key() { effects.push('key'); return String(Math.random()); } ${ source }`, 1,
    ['key', 'default'], name === 'Map' ? ['usage-global', 'usage-pure'] : ['usage-global']]);
}
for (const key of ['values', 'entries']) for (const nested of [false, true]) {
  const slot = nested ? '{ entries: { at } }' : '{ at }';
  const value = nested ? '{ entries: [7] }' : '[7]';
  cases.push([`capture/${ key }/${ nested }`, `let from, at;
    ({ C: { from }, ${ key }: ${ slot } } = { C: Array, ${ key }: (effects.push('slot'), ${ value }) });
    return at.call([7], 0);`, 7, ['slot'], ['usage-global', 'usage-pure']]);
}
cases.push(['capture/string', `let from, at;
  ({ C: { from }, values: { at } } = { C: Array, values: 'ab' }); return at.call('ab', -1);`,
'b', [], ['usage-global', 'usage-pure']], ['capture/live-child', `let from, at;
  ({ C: { from }, values: { at } } = { C: Array, values: [Array.of(7)] }); return at.call([[7]], 0)[0];`,
7, [], ['usage-global', 'usage-pure']], ['null slot', `const key = String(Math.random());
  try { const { [(effects.push('key'), key)]: { groupBy } = (effects.push('default'), Map) } = { [key]: null };
    return groupBy; } catch (error) { return error.name; }`,
'TypeError', ['key'], ['usage-global', 'usage-pure']], ['throwing getter', `const key = String(Math.random());
  const source = { get [key]() { effects.push('get'); throw new RangeError('slot'); } };
  try { const { [(effects.push('key'), key)]: { groupBy } = (effects.push('default'), Map) } = source;
    return groupBy; } catch (error) { return error.name; }`,
'RangeError', ['key', 'get'], ['usage-global', 'usage-pure']], ['present user slot', `function key() { effects.push('key'); return 'present'; }
  const source = { present: { groupBy() { effects.push('custom'); return 23; } } };
  const { [key()]: { groupBy } = (effects.push('default'), Map) } = source; return groupBy();`,
23, ['key', 'custom'], ['usage-global', 'usage-pure']], ['iterator close on first property', `const row = {
    [Symbol.iterator]() {
      return {
        next() { effects.push('next'); return { value: { get at() { effects.push('at'); throw new RangeError(); } } }; },
        return() { effects.push('return'); return {}; },
      };
    },
  };
  try { const [{ at }, tail] = row; return [at, tail]; } catch (error) { return error.name; }`,
'RangeError', ['next', 'at', 'return'], ['usage-pure']]);
for (const abrupt of [false, true]) {
  const effects = ['spread', 'source', 1, 'iterator', 1];
  if (!abrupt) effects.push('other', 1);
  cases.push([`nested iterator order/${ abrupt }`, `let count = 0;
    function read() {
      const id = ++count;
      effects.push('source', id);
      return {
        get [Symbol.iterator]() { effects.push('iterator', id); ${ abrupt ? 'throw new RangeError();' : 'return () => id;' } },
        get other() { effects.push('other', id); return id; }
      };
    }
    try {
      const extra = { get before() { effects.push('spread'); return 0; } };
      const { w: { [Symbol.iterator]: method, other } } = { ...extra, w: read() };
      return [method(), other];
    } catch (error) { return error.name; }`,
  abrupt ? 'RangeError' : [1, 1], effects, ['usage-pure']]);
}
cases.push(['missing iterator before sibling', `const receiver = new Proxy({
    other: 41,
    get [Symbol.toStringTag]() { effects.push('tag'); this.other = 99; },
  }, {
    get(object, key) { effects.push(key === Symbol.iterator ? 'iterator' : String(key)); return object[key]; },
    has() { throw new RangeError('has'); },
  });
  const { w: { [Symbol.iterator]: it, other } } = { w: receiver };
  return [typeof it, other];`, ['undefined', 41], ['iterator', 'other'], ['usage-pure'],
[['undefined', 99], ['iterator', 'Symbol(Symbol.toStringTag)', 'tag', 'other']]], ['missing iterator in parameter', `function read(value) {
    const { w: { [Symbol.iterator]: it, other } } = { w: value };
    return [typeof it, other];
  }
  return read({ other: 41, get [Symbol.toStringTag]() { effects.push('tag'); this.other = 99; } });`,
['undefined', 41], [], ['usage-pure'], [['undefined', 99], ['tag']]]);
for (const [name, body, expected, effects] of [
  ['own null', 'return ({ [Symbol.iterator]: null })[Symbol.iterator];', null, []],
  ['own iterator in a rebuilt call', `const flag = JSON.parse('true');
    const key = Symbol.iterator;
    const selected = flag ? key : key;
    const source = { [Symbol.iterator]: null, 'Symbol.iterator': 7 };
    const out = [];
    out.push(source[(effects.push('key'), selected)]);
    return out[0];`, null, ['key']],
  ['own assignment', 'let m; ({ [Symbol.iterator]: m } = { [Symbol.iterator]: null }); return m;', null, []],
  ['nested false', 'const { w: { [Symbol.iterator]: { n = 3 } } } = { w: { [Symbol.iterator]: false } }; return n;', 3, []],
  ['getter before sibling', `const { [Symbol.iterator]: method, next } = {
    get [Symbol.iterator]() { effects.push('iterator'); return false; },
    get [Symbol.toStringTag]() { throw new RangeError(); },
    get next() { effects.push('next'); return 41; }
  }; return [method, next];`, [false, 41], ['iterator', 'next']],
  ['written optional call', `const a = []; a[Symbol.iterator] = false;
    try { a[Symbol.iterator]?.(); } catch (error) { return error.name; }`, 'TypeError', []],
]) cases.push([name, body, expected, effects, ['usage-pure', 'usage-global']]);
cases.push(['iterator before and after write', `const a = [];
  const before = typeof a[Symbol.iterator];
  a[Symbol.iterator] = false;
  return [before, a[Symbol.iterator]];`, ['function', false], [], ['usage-pure']]);
const arrayFixture = await fs.readFile(new URL('../transpiler-fixtures/usage-pure/iterator-assignment-captures-replaced-global/input.mjs', import.meta.url), 'utf8');
cases.push(['iterator assignment on a replaced array', `${ arrayFixture.replace('export function', 'function') }
  const expose = rows => Object.defineProperty(self, 'window', { configurable: true, value: rows });
  return first(expose, () => { effects.push('default'); return function * () { yield 77; }; });`, 3, [], ['usage-pure']],
['iterator assignment key TDZ', `Object.defineProperty(self, 'window', { value: [3], configurable: true });
  try {
    let method;
    ({ [(effects.push('key'), later, Symbol.iterator)]: method } = window);
    const later = 1;
    return method.call(window).next().value + later;
  } catch (error) { return error.name; }`, 'ReferenceError', ['key'], ['usage-pure']]);
for (const mode of ['array', 'getter', 'missing', 'null', 'throw']) {
  const receiver = mode === 'null' ? 'null' : mode === 'missing' ? '{}' : '[3]';
  const getter = mode === 'getter' ? `let count = 0;
    Object.defineProperty(rows, Symbol.iterator, { get() {
      effects.push('get'); const n = ++count; return function * () { yield n; };
    } });` : '';
  const expected = { array: [3, true], getter: [1, true], missing: [77, true], null: 'TypeError', throw: 'RangeError' };
  const trace = { array: ['key'], getter: ['key', 'get'], missing: ['key', 'default'], null: [], throw: ['key'] };
  cases.push([`keyed iterator assignment/${ mode }`, `const rows = ${ receiver };
    ${ getter }
    Object.defineProperty(self, 'window', { configurable: true, value: rows });
    function key() {
      effects.push('key');
      ${ mode === 'throw' ? 'throw new RangeError();' : "Object.defineProperty(self, 'window', { value: [9] });" }
    }
    function fallback() { effects.push('default'); return function * () { yield 77; }; }
    let method;
    try {
      const source = ({ [(key(), Symbol.iterator)]: method = fallback() } = window);
      return [method.call(source).next().value, source === rows];
    } catch (error) { return error.name; }`, expected[mode], trace[mode], ['usage-pure']]);
}
for (const assignment of [false, true]) {
  const pattern = '{ Map: { groupBy, name }, [effects.push(typeof groupBy)]: other }';
  const statement = assignment ? `let groupBy, name, other; (${ pattern } = globalThis);` : `const ${ pattern } = globalThis;`;
  cases.push([`captured Map/${ assignment ? 'assignment' : 'declaration' }`, `${ statement } return [name, typeof groupBy];`,
    ['Map', 'function'], ['function'], ['usage-pure']]);
}

const directory = await fs.mkdtemp(path.join(import.meta.dirname, '../transpiler-differential/tmp/default-claims-'));
let serial = 0;
try {
  await fs.writeFile(path.join(directory, 'missing-iterator.mjs'), 'delete Array.prototype[Symbol.iterator];');
  for (const [name, body, expected, effects, methods, helperResult] of cases) {
    const source = scenarioSource(`export const effects = []; export const r = (() => { ${ body } })();`);
    const nativeFile = path.join(directory, `case-${ serial++ }.mjs`);
    await fs.writeFile(nativeFile, source);
    const want = `OK|${ JSON.stringify(expected) }|${ JSON.stringify(effects) }`;
    check(`${ name }/native`, await runInWorker(nativeFile, { strip: false }), want);
    // On opaque receivers the public helper also looks up a legacy iterator.
    const transformed = helperResult ? `OK|${ JSON.stringify(helperResult[0]) }|${ JSON.stringify(helperResult[1]) }` : want;
    for (const method of methods) for (const host of ['babel', 'unplugin', 'pre+post']) {
      const output = await transform(source, host, method);
      if (name.startsWith('capture/') && method === 'usage-pure') {
        check(`${ name }/${ host }/no generated navigation helper`, /actual\/instance\/(?:entries|values)["']/u.test(output), false);
      }
      const file = path.join(directory, `case-${ serial++ }.mjs`);
      // The runtime initializes its collection helpers with native Map. Remove the ambient
      // constructor after imports, before the generated pattern first accesses its receiver.
      await fs.writeFile(file, name.startsWith('captured Map/') ? `delete self.Map;\n${ output }` : output);
      for (const strip of [false, true]) check(`${ name }/${ method }/${ host }/${ strip }`, await runInWorker(file, { strip,
        stripGlobals: name.startsWith('global/AggregateError/') ? ['Iterator', 'globalThis', 'AggregateError'] : undefined }), transformed);
      if (['iterator before and after write', 'iterator assignment on a replaced array', 'keyed iterator assignment/array'].includes(name)) {
        const legacy = path.join(directory, `legacy-${ serial++ }.mjs`);
        await fs.writeFile(legacy, `import './missing-iterator.mjs';\nexport * from ${ JSON.stringify(pathToFileURL(file).href) };`);
        check(`${ name }/${ host }/missing array iterator at startup`, await runInWorker(legacy, { strip: false }), want);
      }
    }
  }
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
finish();
