// Folded pattern keys and literal defaults keep their values, scopes and read order.
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
const { check, finish } = createChecker('computed-pattern-keys-runtime', {
  tsc: 'Runtime keys, deliberate TDZ reads and custom methods exercise dynamic destructuring.',
});
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const cases = [
  ['parameter/prototype-slot-default',
    'export const g = (function ({ __proto__: p, at, missing = 0 } = [1, 2]) { return [p, at, missing]; })();',
    '[g[0] === Array.prototype, g[1].call([1, 2], -1), g[2]]', [true, 2, 0]],
  ['parameter/prototype-slot-mirror',
    'function fallback() { effects.push("default"); return 0; } export const g = (function ({ __proto__: p, at, missing = fallback() } = [1, 2]) { return [p, at, missing]; })();',
    '[g[0] === Array.prototype, g[1].call([1, 2], -1), g[2]]', [true, 2, 0], ['default']],
  ['parameter/array-leaf-default-mirror', '', '(([{ at = null }]) => at.call([3, 7], -1))([[3, 7]])', 7],
  ['parameter/symbol', 'const K = Symbol.iterator; export function f({ [K]: it, at }) { return [it(), at()]; }',
    'f({ [Symbol.iterator]: () => 7, at: () => 9 })', [7, 9]],
  ['parameter/symbol-hop', 'const K = Symbol.iterator; export function f({ [K]: { at } }) { return at(); }',
    'f({ [Symbol.iterator]: { at: () => 9 } })', 9],
  ['parameter/symbol-string', "const K = 'Symbol.iterator'; export function f({ [K]: { at } }) { return at.call([3, 7], -1); }",
    "f({ 'Symbol.iterator': [3, 7] })", 7],
  ['parameter/punctuation', "const K = 'x-y'; export function f({ [K]: { at } }) { return at.call([3, 7], -1); }", "f({ 'x-y': [3, 7] })", 7],
  ['parameter/literal', "export function f({ ['at']: at }) { return at.call([3, 7], -1); }", 'f([3, 7])', 7],
  ['parameter/shadow', "const K = 'at'; export function f({ [K]: at }) { const K = 'length'; return at.call([3, 7], -1); }", 'f([3, 7])', 7],
  ['parameter/hop', "const K = 'row'; export function f([{ [K]: { at } }]) { let K; return at.call([3, 7], -1); }", 'f([{ row: [3, 7] }])', 7],
  ['parameter/number', 'const K = 0; export function f({ [K]: { at } }) { return at.call([3, 7], -1); }', 'f([[3, 7]])', 7],
  ['parameter/default', 'export function f({ at = null }) { return at === null ? "default" : at.call([3, 7], -1); }', '[f([3, 7]), f({})]', [7, 'default']],
  ['parameter/default-key', "const K = 'at'; export function f({ [K]: at = null }) { return at; }", 'f({})', null],
  ['parameter/default-getter', 'export function f({ at = null }) { return at; }', 'f({ get at() { effects.push("get"); return undefined; } })', null, ['get']],
  ['parameter/default-null', 'export function f({ at = 9 }) { return at; }', 'f({ get at() { effects.push("get"); return null; } })', null, ['get']],
  ['parameter/default-user',
    'export function f({ at = null }) { return at.call([3, 7], -1); }', 'f({ get at() { effects.push("get"); return function () { return this[0]; }; } })', 3, ['get']],
  ['parameter/default-supplied-receiver', 'const K = "at"; export function f({ [K]: at } = [3, 7]) { return at; }',
    '[f().call([3, 7], -1), f("abc").call("abc", -1), f({ at: () => 9 })()]', [7, 'c', 9]],
  ['parameter/default-retained-read', 'const K = "length"; export function f({ at, [K]: length } = [7]) { return [at, length]; }',
    '(() => { const [at, length] = f({ get at() { effects.push("at"); return () => 9; }, get length() { effects.push("length"); return 2; } }); return [at(), length]; })()',
    [9, 2], ['at', 'length']],
  ['nested/numeric-after-mutation', '', '(() => { const rows = [Object]; rows.splice(0, 1, Map); const { 0: { entries } } = rows; return typeof entries; })()', 'undefined'],
  ['nested/punctuated-null', '', '(() => { try { const { ["A.b"]: { at } } = null; return at; } catch (error) { return error.name; } })()', 'TypeError'],
  ['parameter/default-nested', 'export function f({ row: { at = 9 }, marker }) { return [at, marker]; }', 'f({ row: {}, marker: 7 })', [9, 7]],
  ['parameter/key-effect',
    'export function f({ [(effects.push("key"), "at")]: at }) { return at(); }', 'f({ get at() { effects.push("get"); return () => 9; } })', 9, ['key', 'get']],
  ['parameter/key-coercion',
    'const K = { toString() { effects.push("key"); return "at"; } }; export function f({ [K]: at }) { return at(); }',
    'f({ get at() { effects.push("get"); return () => 9; } })', 9, ['key', 'get']],
  ['parameter/key-mutation',
    'let K = "at"; export function f({ first, [K]: method }) { return [first, method]; }',
    'f({ get first() { effects.push("first"); K = "length"; return 9; }, length: 2 })', [9, 2], ['first']],
  ['parameter/key-tdz',
    'export function f({ [K]: at }, K = "at") { return at; }', '(() => { try { return f({ at: 9 }); } catch (error) { return error.name; } })()', 'ReferenceError'],
  ['parameter/early-key-array',
    `let value; try { value = f([3, 7]); } catch (error) { value = error.name; }
     const K = 'at'; function f({ [K]: at }) { return at.call([3, 7], -1); }`, 'value', 'ReferenceError'],
  ['member/early-key-after-lowering',
    `const receiver = { at: () => 7, undefined: () => 11 }; const early = read(receiver);
     var key = 'at'; function read(value) { return value[key](); }`, '[early, read(receiver)]', [11, 7]],
  ['member/early-key-call',
    `const receiver = { at: () => 7, undefined: () => 11 }; const early = read(receiver);
     var key = 'at'; function read(value) { return value[(() => key)()](); }`, '[early, read(receiver)]', [11, 7]],
  ['member/early-key-effectful-call',
    `const receiver = { at: () => 7, undefined: () => 11 }; const early = read(receiver);
     var key = 'at'; function read(value) { return value[(() => { effects.push('key'); return key; })()](); }`,
    '[early, read(receiver)]', [11, 7], ['key', 'key']],
  ['member/export-deferred-key',
    'export function read(value) { return value[key](-1); } const key = "at";', 'read([3, 7])', 7],
  ['member/default-export-deferred-key',
    'export default function read(value) { return value[key](-1); } const key = "at";', 'read([3, 7])', 7],
  ['member/combined-bound-call', 'const hop = "map";', '[[3, 7]].flat?.()[hop](value => value)?.at(-1)', 7],
  ['member/combined-bound-read', 'const arr = [[[3, 7]]]; const hop = "flat";', 'arr.at?.(0)[hop].name', 'flat'],
  ['member/combined-early-key',
    `let early; try { early = read(); } catch (error) { early = error.name; }
     var hop = 'map'; function read() { return [[3, 7]].flat?.()[hop](value => value)?.at(-1); }`,
    '[early, read()]', ['TypeError', 7]],
  ['parameter/getter-throws', "const K = 'at'; export function f({ [K]: at }, tail) { effects.push('body'); return at; }",
    '(() => { try { return f({ get at() { effects.push("get"); throw new RangeError(); } }); } catch (error) { return error.name; } })()',
    'RangeError', ['get']],
  ['parameter/nullable', "const K = 'at'; export function f({ [K]: at }) { effects.push('body'); return at; }",
    '(() => { try { return f(null); } catch (error) { return error.name; } })()',
    'TypeError'],
  ['parameter/arguments', "const K = 'at'; export function f({ [K]: at }) { return [at.call([3, 7], -1), arguments[0].length]; }", 'f([3, 7])', [7, 2]],
  ['parameter/arrow', "const K = 'at'; export const f = ({ [K]: at }) => at.call([3, 7], -1);", 'f([3, 7])', 7],
  ['parameter/clone', "const K = 'at'; export function f({ [K]: at }) { const K = 'length'; return at.call([3, 7], -1); }",
    '(() => { const out = []; out.push(f([3, 7])); return out; })()', [7]],
  ['capture/inner', "const K = 'row'; export function f(source) { const [{ [K]: { at }, marker }] = source; return [at.call([3, 7], -1), marker]; }",
    'f([{ row: [3, 7], marker: 9 }])', [7, 9]],
  ['capture/outer', "const K = 'rows'; export function f(source) { const { [K]: [{ at }], marker } = source; return [at.call([3, 7], -1), marker]; }",
    'f({ rows: [[3, 7]], marker: 9 })', [7, 9]],
  ['capture/assignment', "const K = 'row'; const source = [{ row: [3, 7] }]; let at; [{ [K]: { at } }] = source;", 'at.call([3, 7], -1)', 7],
  ['capture/paired-sibling', "const K = 'row'; const [{ [K]: { at } }, { includes }] = [{ row: [3, 7] }, [3, 7]];",
    '[at.call([3, 7], -1), includes.call([3, 7], 7)]', [7, true]],
  ['nested/iterator', 'export function f(source) { const { row: { [Symbol.iterator]: it } } = source; return it.call([3, 7]).next().value; }',
    'f({ row: [3, 7] })', 3],
];
for (const kind of ['const', 'let', 'var']) for (const wrapped of [false, true]) {
  const call = wrapped ? 'invoke()' : 'f(source)';
  cases.push([`parameter/early-${ kind }/${ wrapped }`,
    `const source = { at: () => 7, undefined: () => 11 }; let value;
     try { value = ${ call }; } catch (error) { value = error.name; }
     ${ kind } K = 'at';
     function f({ [K]: at }) { return at(); }
     function invoke() { return f(source); }`,
    'value', kind === 'var' ? 11 : 'ReferenceError']);
}
cases.push(['parameter/late-call-alias',
  `function f({ [K]: at }) { return at.call([3, 7], -1); }
   const A = 'at', K = A; const invoke = f;`, 'invoke([3, 7])', 7]);
for (const [host, key, call, body] of [
  ['parameter-hop', 'row', 'read({ row: [3, 7] })', 'function read({ [K]: { at } }) { return at.call([3, 7], -1); }'],
  ['positional', 'at', 'read()', 'function read() { const [{ [K]: at }] = gen(); return at.call([3, 7], -1); }'],
  ['positional-sibling', 'at', 'read()', 'function read() { const [{ [K]: at, length }] = gen(); return at.call([3, 7], length - 3); }'],
  ['capture', 'row', 'read([{ row: [3, 7], marker: 1 }])', 'function read(source) { const [{ [K]: { at }, marker }] = source; return at.call([3, 7], -marker); }'],
]) cases.push([`early-key/${ host }`,
  `let value; try { value = ${ call }; } catch (error) { value = error.name; }
   const K = '${ key }'; function* gen() { yield [3, 7]; } ${ body }`, 'value', 'ReferenceError']);
for (const sibling of [false, true]) for (const host of ['const', 'let', 'assignment', 'for-init', 'bodyless']) {
  const pattern = `{ [K]: at${ sibling ? ', length' : '' } }`;
  const read = `[${ pattern }] = gen([3, 7])`;
  const result = sibling ? '[at.call([3, 7], -1), length]' : 'at.call([3, 7], -1)';
  const statement = host === 'assignment' ? `let at, length; (${ read }); return ${ result };`
    : host === 'for-init' ? `for (const ${ read };;) return ${ result };`
      : host === 'bodyless' ? `if (true) var ${ read }; return ${ result };` : `${ host } ${ read }; return ${ result };`;
  cases.push([`positional/${ host }/${ sibling }`,
    "const K = 'at'; function* gen(value) { try { effects.push('next'); yield value; } finally { effects.push('close'); } }",
    `(() => { ${ statement } })()`, sibling ? [7, 2] : 7, ['next', 'close']]);
}
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const directory = await fs.mkdtemp(path.join(tmp, 'computed-keys-'));
let serial = 0;
try {
  for (const [name, setup, expression, want, effects = []] of cases) {
    const source = scenarioSource(`export const effects = []; ${ setup } export const r = ${ expression };`);
    const outputs = [['native', source]];
    for (const host of ['babel', 'unplugin', 'pre+post']) {
      let code = source;
      if (host === 'babel') code = (await transformAsync(code, {
        configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, OPTIONS]],
      })).code;
      else {
        const plugin = createUnplugin(OPTIONS);
        for (const pass of host === 'pre+post' ? ['pre', 'post'] : ['single']) code = plugin.transform(code, 'input.mjs', pass)?.code ?? code;
      }
      outputs.push([host, code]);
    }
    for (const [host, code] of outputs) for (const lower of host === 'native' ? [false] : [false, true]) {
      const output = lower ? (await transformAsync(code, {
        configFile: false, babelrc: false,
        plugins: ['transform-object-rest-spread', 'transform-destructuring', 'transform-parameters'].map(pluginName => requireBabel.resolve(`@babel/plugin-${ pluginName }`)),
      })).code : code;
      const file = path.join(directory, `case-${ serial++ }.mjs`);
      await fs.writeFile(file, output);
      for (const strip of host === 'native' ? [false] : [false, true]) {
        check(`${ name }/${ host }/${ lower }/${ strip }`, await runInWorker(file, { strip }),
          `OK|${ JSON.stringify(want) }|${ JSON.stringify(effects) }`);
      }
    }
  }
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
finish();
