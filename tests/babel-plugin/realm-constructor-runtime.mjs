// Fresh workers keep constructor namespaces independent across rows and emitters.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { importSet } from '../transpiler-differential/harness.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('realm-constructor-runtime');
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'realm-constructor-'));
let count = 0;

// Each row has one constructor source; unrelated imports must not repair its namespace.
const cases = [
  ['selected realm', 'var root = typeof window !== "undefined" ? window : undefined; r = typeof root.Promise.resolve;', 'function', true],
  ['selected map', 'var root = typeof window !== "undefined" ? window : undefined; r = typeof root.Map.groupBy;', 'function', true],
  ['selected fallback', 'var root = typeof window === "object" && window || typeof global === "object" && global || this; r = typeof root.Map.groupBy;', 'function'],
  ['stored optional', 'const held = globalThis.window; let w; r = (w = held).self?.box;', undefined, true],
  ['stored computed', 'const held = globalThis.window; let w; const key = String("Array"); r = typeof (w = held).self[key];', 'function', true],
  ['stored optional key', 'const held = globalThis.window; let w; const key = String("Array"); r = typeof (w = held).self?.[key];', 'function', true],
  ['kept assignment', 'const held = globalThis.window; let v; r = typeof (v = held.self);', 'object', true],
  ['kept member', 'const held = globalThis.window; const box = {}; r = typeof (box.value = held.self);', 'object', true],
  ['kept chain', 'const held = globalThis.window; let v, w; r = typeof (v = w = held.self);', 'object', true],
  ['stored alias', 'const held = globalThis.window; let x; const alias = (x = held); r = alias.self.Array.of(1);', [1], true],
  ['stored call', 'const held = globalThis.window; let w, v; r = (w = v = held).self.Array.of(3);', [3], true],
  ['stored call once',
    'const held = globalThis.window; let count = 0, w; const box = { set value(x) { count++; } }; let value;'
      + 'try { value = (box.value = w = held).self.Array.of(3); } catch (error) { value = error.name; } r = [value, count, w === held];',
    [[3], 1, true], false, [], ['TypeError', 1, true]],
  ['stored pattern', 'const held = globalThis.window; let w, v; const { of } = (w = v = held).self.Array; r = of(1);', [1], true],
  ['literal alias', 'const w = globalThis.window; const [{ resolve }] = [w.Promise]; r = typeof resolve;', 'function', true],
  ['optional element', 'for (const { resolve } of [globalThis.window?.Promise]) r = typeof resolve;', 'function', true],
  ['nested IIFE', 'const w = globalThis.window; r = (({ resolve: { length } }) => typeof length)(w.Promise);', 'number', true],
  ['nested IIFE default', 'const w = globalThis.window; r = (({ resolve: { length = 9 } }) => typeof length)(w.Promise);', 'number', true],
  ['parameter default', 'function f({ Promise } = globalThis) { return typeof Promise.resolve; } r = f();', 'function'],
  ['renamed parameter', 'function f({ Promise: P } = globalThis) { return typeof P.allSettled; } r = f();', 'function'],
  ['aliased parameter', 'function f({ Promise: P } = globalThis) { const C = P; return typeof C.resolve; } r = f();', 'function'],
  ['IIFE parameter', 'r = (({ Promise }) => typeof Promise.resolve)(globalThis);', 'function'],
  ['closed caller', 'function f({ Promise }) { return typeof Promise.resolve; } r = f(globalThis);', 'function'],
  ['parameter map', 'function f({ Map } = globalThis) { return typeof Map.groupBy; } r = f();', 'function'],
  ['parameter nested static', 'function f({ Array: { of: { name } } } = globalThis) { return name; } r = f();', 'of'],
  ['parameter static default', 'function f({ from: { name } = {} } = Array) { return name; } r = f();', 'from'],
  ['parameter custom static', 'function f({ from: { name } = {} } = Array) { return name; } r = f({ from: { name: "own-name" } });', 'own-name'],
  ['literal default', 'function f({ P } = { P: Promise }) { return typeof P.resolve; } r = f();', 'function'],
  ['head assignment', 'let P; for ({ Promise: P } of [(undefined || globalThis)]) r = typeof P.allSettled;', 'function'],
  ['head declaration', 'for (const { Promise: P } of [globalThis]) r = typeof P.resolve;', 'function'],
  ['head selecting call',
    'const on = [1].length > 0; let n = 0; function pick() { return on ? URL : Set; } for (const { canParse } of [(n++, pick())]) r = [typeof canParse, n];',
    ['function', 1]],
  ['head constructor return', 'class K { constructor() { return Map; } } for (const { groupBy } of [new K()]) r = typeof groupBy;', 'function'],
  ['catch parameter', 'try { throw Promise; } catch ({ resolve }) { r = typeof resolve; }', 'function'],
  ['nested assignment default', 'let length, other; ({ groupBy: { length = 9 }, other } = Map); r = typeof length;', 'number'],
  ['for init default', 'let allSettled, i; for (i = 0, { Promise: { allSettled } = {} } = (undefined || globalThis); i < 1; i++) r = typeof allSettled;', 'function'],
  ['class field default', 'let allSettled; class C { field = ({ Promise: { allSettled } = {} } = (undefined || globalThis)); } new C(); r = typeof allSettled;', 'function'],
  ['custom parameter', 'function f({ Promise: P } = globalThis) { return P.resolve(3); } r = f({ Promise: { resolve: x => x + 4 } });', 7],
  ['custom nested IIFE', 'const w = { Promise: { resolve: { length: 23 } } }; r = (({ resolve: { length } }) => length)(w.Promise);', 23],
  ['custom window', 'const globalThis = { window: { self: { box: 17 } } }; const held = globalThis.window; let w; r = (w = held).self?.box;', 17],
  ['optional delete', 'const held = globalThis.window; let w; r = delete (w = held)?.self.Array.realmTemporary;', true],
  ['optional delete key', 'const held = globalThis.window; let w; r = delete (w = held)?.self.Array[(effects.push("key"), "realmTemporary")];', true, false, ['key']],
  ['optional method', 'const held = globalThis.window; let w; r = typeof (w = held)?.self.Array.isArray;', 'function', false, [], 'undefined'],
  ['optional alias', 'const held = globalThis.window; let w; r = typeof (w = held)?.self.Array;', 'function', false, [], 'undefined'],
  ['guarded alias', 'const held = globalThis.window; let w; r = held ? typeof (w = held).self.Array : "absent";', 'function', false, [], 'absent'],
];

// Catch only the read, after the alias is initialized: a try-wrapped var declaration
// would itself change the guarded-alias analysis and hide the selected-realm regression.
for (const [name, read, after] of [
  ['computed order', '(w = held).self[(effects.push("key"), "Array")]', ['key']],
  ['optional computed order', '(w = held).self?.[(effects.push("key"), "Array")]', ['key']],
  ['setter order', '(box.value = held.self)', ['set']],
  ['nested mirror order', '(({ resolve: { length } }) => length)(w = held.Promise, effects.push("arg"))', ['arg']],
]) cases.push([name, `const held = globalThis.window; let w; const box = { set value(x) { effects.push("set"); } };
  try { ${ read }; r = "ok"; } catch (error) { r = error.name; }`, 'ok', false, after, 'TypeError']);

async function runCases() {
  for (const [name, body, result, throwsAbsent = false, effects = [], absent = result] of cases) {
    const source = scenarioSource(`export let r; export const effects = []; ${ body }`);
    for (const method of ['usage-global', 'usage-pure']) {
      const options = { method, version: '4.0', targets: { ie: 11 } };
      const babel = (await transformAsync(source, {
        filename: 'input.mjs', configFile: false, babelrc: false, plugins: [[babelPlugin, options]],
      })).code;
      const plugin = createUnplugin(options);
      const single = createUnplugin(options).transform(source, 'input.mjs')?.code ?? source;
      const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
      const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
      check(`${ name }/${ method }/host imports`, JSON.stringify([...importSet(babel)].sort()), JSON.stringify([...importSet(single)].sort()));
      check(`${ name }/${ method }/phase imports`, JSON.stringify([...importSet(post)].sort()), JSON.stringify([...importSet(single)].sort()));
      for (const present of [false, true]) {
        const value = present ? result : absent;
        const expected = !present && throwsAbsent ? 'ERR|TypeError'
          : `OK|${ JSON.stringify(value === undefined ? '__undefined__' : value) }|${ JSON.stringify(present ? effects : []) }`;
        for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', single], ['pre+post', post]]) {
          if (host === 'native' && method === 'usage-pure') continue;
          const file = path.join(DIR, `case-${ count++ }.mjs`);
          // The setup is outside the transformed program and uses the realm name even
          // in the lexical-shadowing negative. It neither supplies a static nor a claim.
          await fs.outputFile(file, `${ present ? 'global.window = global;' : 'delete global.window;' }\n${ output }`);
          check(`${ name }/${ method }/${ present }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
          if (host !== 'native') check(`${ name }/${ method }/${ present }/${ host }/stripped`,
            await runInWorker(file, { stripGlobals: [] }), expected);
        }
      }
    }
  }
}

try {
  await runCases();
} finally {
  await fs.remove(DIR);
}

finish();
