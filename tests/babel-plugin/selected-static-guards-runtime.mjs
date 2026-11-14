/* eslint-disable max-depth -- Parser, target and fresh-realm boundaries. */
// Selected constructors remain candidates after capture; guards preserve the native fallback.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { STRIP_GLOBALS } from '../transpiler-differential/strip-manifest.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';
import { importSet } from '../transpiler-differential/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const lowerOptional = requireBabel('@babel/plugin-transform-optional-chaining').default;
const { check, finish } = createChecker('selected-static-guards-runtime');
const cases = [
  ['alias-nullable', 'const O = choice ? Object : null; return O?.fromEntries([["x", 3]]);'],
  ['alias-array-tail', 'const A = choice ? Array : null; return A?.from([3]).length;'],
  ['alias-optional-call', 'const A = choice ? Array : {}; return A.from?.((effects.push("arg"), [3]));'],
  ['alias-both-optional', 'const A = choice ? Array : null; return A?.from?.([3]);'],
  ['alias-sealed', 'const A = choice ? Array : null; return (A?.from)((effects.push("arg"), [3]));'],
  ['inline-array', 'return (choice ? Array : null)?.from([3]).at(0);'],
  ['inline-of', 'return (choice ? Array : null)?.of(3).at(0);'],
  ['inline-object', 'return (choice ? Object : null)?.entries({ x: 3 }).at(0);'],
  ['inline-custom', `const custom = { value: 7, get entries() { effects.push("get"); return function () {
    effects.push(this === custom ? "this" : "wrong-this"); return [["x", this.value]];
  }; } }; return (choice ? Object : custom)?.entries((effects.push("arg"), { x: 3 })).at(0);`],
  ['inline-noncallable', `const custom = { get entries() { effects.push("get"); return 3; } };
    return (choice ? Object : custom)?.entries((effects.push("arg"), {})).at(0);`],
  ['inline-throw', `const custom = { get entries() { effects.push("get"); throw new RangeError(); } };
    return (choice ? Object : custom)?.entries((effects.push("arg"), {})).at(0);`],
  ['inline-shadow', `function take(Object) { return (choice ? Object : null)?.entries({}).at(0); }
    return take({ entries() { effects.push("custom"); return [7]; } });`],
  ['stored-alias', 'const A = choice ? Array : Set; let held; return (held = A).from([3]);'],
  ['stored-nullable', 'const A = choice ? Array : null; let held; return (held = A)?.from([3]);'],
  ['stored-live', 'const A = choice ? Array : null; let held; const value = (held = A)?.from([3]); return [value, held === A];'],
  ['stored-setter', `const A = choice ? Array : null; let held;
    const box = { set value(v) { effects.push("write"); held = v; }, get value() { throw new Error("getter"); } };
    const value = (box.value = A)?.from((effects.push("arg"), [3])); return [value, held === A];`],
  ['stored-prefix', 'const A = choice ? Array : null; let held; return (effects.push("prefix"), held = A)?.from((effects.push("arg"), [3]));'],
  ['realm-probe', 'return (typeof window !== "undefined" ? window : undefined)?.Array.from([3]);', true],
  ['realm-selection', 'return (choice ? globalThis : null)?.Object.fromEntries([["x", 3]]);'],
  ['realm-two-hops', 'return (choice ? globalThis : null)?.Array?.from([3]);'],
  ['realm-prefix', 'return ((effects.push("prefix"), choice) ? globalThis : null)?.Array.from((effects.push("arg"), [3]));'],
  ['realm-custom', `const custom = { get Array() { effects.push("Array"); return { from() { effects.push("from"); return [7]; } }; } };
    return (choice ? globalThis : custom)?.Array.from([3]);`],
  ['realm-missing-slot', 'return (choice ? globalThis : {})?.Array.from((effects.push("arg"), [3]));'],
  ['realm-missing-slot-optional', 'return (choice ? globalThis : {})?.Array?.from((effects.push("arg"), [3]));'],
  ['realm-sealed', 'return ((choice ? globalThis : null)?.Array).from((effects.push("arg"), [3]));'],
  ['private-tail', 'class A { #x = 3; read() { return globalThis.window?.self.#x; } } return new A().read();', true],
  ['private-call', 'class A { #read() { return 3; } read() { return globalThis.window?.self.#read(); } } return new A().read();', true],
  ['private-guard', 'class F { static #sel = choice ? Map : Object; static read() { return F?.#sel.groupBy([3], String); } } return typeof F.read();'],
  ['private-guard-call', 'class F { static #sel = choice ? Map : Object; static read() { return F?.#sel.groupBy?.([3], String); } } return typeof F.read();'],
  ['sealed-user', `const custom = { value: 7, from() { effects.push(this === custom ? "this" : "wrong-this"); return [this.value]; } };
    const A = choice ? Array : custom; return (A?.from)((effects.push("arg"), [3]));`],
  ['sealed-optional-call', 'const A = choice ? Array : null; return (A?.from)?.((effects.push("arg"), [3]));'],
  ['sealed-delete-tail', 'const A = choice ? Array : null; return delete (A?.from)((effects.push("arg"), [3])).value;'],
  ['sealed-delete-optional', 'const A = choice ? Array : null; return delete (A?.from)?.((effects.push("arg"), [3])).value;'],
  ['optional-call-tail', 'const A = choice ? Array : {}; return A.from?.((effects.push("arg"), [3])).length;'],
  ['optional-call-tail-noncallable', 'const A = choice ? Array : { from: 3 }; return A.from?.((effects.push("arg"), [3])).length;'],
  ['optional-call-delete-target', `const target = { value: 3 };
    const A = choice ? Array : { from() { effects.push(this === A ? "this" : "wrong-this"); return target; } };
    return [delete A.from?.([3]).value, "value" in target];`],
  ['stored-wrapper', 'const A = choice ? Object : null; let one, two; return (one = (two = A))?.entries({ x: 3 }).at(0);'],
  ['private-written', `class F { static #owner = Map; static set(value) { F.#owner = value; }
    static read() { return F.#owner.groupBy([3], String); } }
    if (choice) F.set({ groupBy() { effects.push("custom"); return 7; } }); return F.read();`],
  ['private-public-key', `class F { static #owner = Map; static ["#owner"] = Map;
    static read() { return F["#owner"].groupBy([3], String); } }
    if (choice) Function('C', 'C["#owner"] = { groupBy() { return 7; } }')(F); return F.read();`],
  ['private-last-public-read', 'class F { static ["#owner"] = Map; static #owner = Object; static read() { return F["#owner"].groupBy([3], String).get("3"); } } return F.read();'],
  ['public-last-public-read', 'class F { static #owner = Object; static ["#owner"] = Map; static read() { return F["#owner"].groupBy([3], String).get("3"); } } return F.read();'],
  ['public-last-private-read', 'class F { static #owner = Map; static ["#owner"] = Object; static read() { return F.#owner.groupBy([3], String).get("3"); } } return F.read();'],
  ['private-last-private-read', 'class F { static ["#owner"] = Object; static #owner = Map; static read() { return F.#owner.groupBy([3], String).get("3"); } } return F.read();'],
  ['missing-public-key', 'class F { static #owner = Map; static read() { return F["#owner"].groupBy([3], String); } } return F.read();'],
  ['public-key-getter', 'class F { static #owner = Object; static get ["#owner"]() { effects.push("get"); return Map; } '
    + 'static read() { return F["#owner"].groupBy([3], String).get("3"); } } return F.read();'],
  ['public-key-unknown', 'const key = choice ? "#owner" : "other"; class F { static #owner = Object; static [key] = Map; '
    + 'static read() { return F["#owner"].groupBy([3], String).get("3"); } } return F.read();'],
  ['object-private-first', 'class F { static #owner = Object; static ["#owner"] = Map; '
    + 'static read() { return F.#owner.groupBy([3], String)["3"]; } } return F.read();'],
  ['object-private-last', 'class F { static ["#owner"] = Map; static #owner = Object; '
    + 'static read() { return F.#owner.groupBy([3], String)["3"]; } } return F.read();'],
  ['private-alias', 'class F { static #owner = Object; static ["#owner"] = Map; '
    + 'static read() { const held = F.#owner; return held.groupBy([3], String)["3"]; } } return F.read();'],
  ['public-pattern', 'class F { static #owner = Object; static ["#owner"] = Map; } '
    + 'const { ["#owner"]: { groupBy } } = F; return groupBy([3], String).get("3");'],
  ['public-nested-pattern', 'class F { static #box = { ["#owner"]: Map }; '
    + 'static read() { const { ["#owner"]: { groupBy } } = F.#box; return groupBy([3], String).get("3"); } } return F.read();'],
  ['private-then-public-class', 'class Inner { static ["#owner"] = Object; } class Outer { static #owner = Inner; '
    + 'static read() { const { ["#owner"]: { groupBy } } = Outer.#owner; return groupBy([3], String)["3"]; } } return Outer.read();'],
  ['private-then-public-self', 'class F { static #owner = F; static ["#owner"] = Object; '
    + 'static read() { const { ["#owner"]: { groupBy } } = F.#owner; return groupBy([3], String)["3"]; } } return F.read();'],
  ['private-value-escaped', 'class Inner { static C = Object; } class Outer { static #value = Inner; '
    + 'static take() { return Outer.#value; } } '
    + 'Function("C", "v", "C.C = { groupBy() { return {3: [v]}; } };")(Outer.take(), choice ? 7 : 9); '
    + 'const { C: { groupBy } } = Inner; return groupBy([3], String)["3"];'],
  ['private-this-value-escaped', 'class Inner { static C = Object; } class Outer { static #value = Inner; '
    + 'static take() { return this.#value; } } '
    + 'Function("C", "v", "C.C = { groupBy() { return {3: [v]}; } };")(Outer.take(), choice ? 7 : 9); '
    + 'const { C: { groupBy } } = Inner; return groupBy([3], String)["3"];'],
  ['private-shadowed-this-value-escaped', 'class Inner { static C = Object; } class Outer { static #value = Inner; '
    + 'static take(Outer) { return this.#value; } } '
    + 'Function("C", "v", "C.C = { groupBy() { return {3: [v]}; } };")(Outer.take(), choice ? 7 : 9); '
    + 'const { C: { groupBy } } = Inner; return groupBy([3], String)["3"];'],
  ['private-anonymous-this-value-escaped', 'class Inner { static C = Object; } const Outer = class { static #value = Inner; '
    + 'static take() { return this.#value; } }; '
    + 'Function("C", "v", "C.C = { groupBy() { return {3: [v]}; } };")(Outer.take(), choice ? 7 : 9); '
    + 'const { C: { groupBy } } = Inner; return groupBy([3], String)["3"];'],
  ['private-inline-this-value-escaped', 'class Inner { static C = Object; } const escaped = (class { static #value = Inner; '
    + 'static take() { return this.#value; } }).take(); '
    + 'Function("C", "v", "C.C = { groupBy() { return {3: [v]}; } };")(escaped, choice ? 7 : 9); '
    + 'const { C: { groupBy } } = Inner; return groupBy([3], String)["3"];'],
  ['private-this-write', `class F { static #owner = Map; static set(value) { this.#owner = value; }
    static read() { return F.#owner.groupBy([3], String); } }
    if (choice) F.set({ groupBy() { effects.push("custom"); return 7; } }); return F.read();`],
  ['private-exported', `export const effects = [];
    export class F { static #owner = Map; static read() { return F.#owner.groupBy([3], String).get("3"); } }
    export function read() { return F.read(); }`],
  ['private-escaped', `class F { static #owner = Map; static read() { return F.#owner.groupBy([3], String).get("3"); } }
    const root = Function('return this')(); root.selectedStaticReader = F;
    try { return F.read(); } finally { delete root.selectedStaticReader; }`],
];
const directory = await fs.mkdtemp(path.join(import.meta.dirname, '../transpiler-differential/tmp/selected-static-'));
let serial = 0;
try {
  for (const [name, body, window] of cases) {
    const source = scenarioSource(body.startsWith('export ') ? body
      : `export const effects = []; export function read(choice) { ${ body } }`);
    for (const method of ['usage-global', 'usage-pure']) {
      const options = { method, version: '4.0', targets: { ie: 11 } };
      const outputs = [['native', source]];
      for (const host of ['babel', 'babel-parens', 'unplugin', 'pre+post', 'babel-lowered']) {
        let code = source;
        if (host.startsWith('babel')) {
          code = (await transformAsync(source, {
            configFile: false, babelrc: false, plugins: [[babelPlugin, options]],
            parserOpts: { createParenthesizedExpressions: host === 'babel-parens' },
          })).code;
          if (host === 'babel-lowered') code = (await transformAsync(code, {
            configFile: false, babelrc: false, plugins: [lowerOptional],
          })).code;
        } else {
          const plugin = createUnplugin(options);
          for (const phase of host === 'pre+post' ? ['pre', 'post'] : ['single']) code = plugin.transform(code, 'input.mjs', phase)?.code ?? code;
        }
        outputs.push([host, code]);
      }
      const imports = JSON.stringify([...importSet(outputs[1][1])].sort());
      for (const [host, code] of outputs.slice(2)) check(`${ name }/${ method }/${ host }/imports`,
        JSON.stringify([...importSet(code)].sort()), imports);
      for (const present of window ? [false, true] : [false]) {
        let expected;
        for (const [host, output] of outputs) {
          const module = path.join(directory, `module-${ serial++ }.mjs`);
          await fs.writeFile(module, output);
          for (const strip of host === 'native' ? [false] : [false, true]) {
            const file = path.join(directory, `case-${ serial++ }.mjs`);
            await fs.writeFile(file, `const root = Function('return this')();
              root.self = root;
              ${ present ? 'root.window = root;' : 'delete root.window;' }
              const mod = await import(${ JSON.stringify(pathToFileURL(module).href) });
              export const r = [false, true].map(choice => {
                try { return mod.read(choice); } catch (error) { return error.name; }
              });
              export const effects = mod.effects;`);
            const actual = await runInWorker(file, { strip, stripGlobals: STRIP_GLOBALS });
            if (host === 'native') {
              check(`${ name }/${ present }/native runs`, actual.startsWith('OK|'), true);
              expected = actual;
            } else check(`${ name }/${ method }/${ host }/${ present }/${ strip ? 'stripped' : 'full' }`, actual, expected);
          }
        }
      }
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
