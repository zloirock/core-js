/* eslint-disable max-depth -- Cross parser, target and isolated-realm boundaries. */
// A helper consumes one source read; optional boundaries and Symbol selections stay live.
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
const { check, finish } = createChecker('iterator-receivers-runtime');
const cases = [
  [
    'nullable-symbol-selection',
    'return (choice ? Symbol : globalThis.window?.Symbol).iterator in [3];',
    true, false, false,
  ],
  [
    'sealed-symbol-selection',
    'return (choice ? Symbol : (globalThis.window?.self).Symbol).iterator in [3];',
    true, true, false,
  ],
  [
    'stored-member-key',
    'globalThis.box = [3]; const box = {}; return (box.w = globalThis.window).self?.[(effects.push("key"), "box")].at(0);',
    true, false, false,
  ],
  [
    'stored-setter-key',
    `globalThis.box = [3]; const box = { get w() { throw new Error("getter"); }, set w(value) { effects.push("write"); } };
      return (box.w = globalThis.window).self?.[(effects.push("key"), "box")].at(0);`,
    true, false, false,
  ],
  [
    'probe-native',
    'const { [Symbol.iterator]: it } = globalThis.window; return typeof it;',
    true, false, true,
  ],
  [
    'probe-optional',
    'const { [Symbol.iterator]: it } = globalThis.window?.self; return typeof it;',
    true, false, true,
  ],
  [
    'probe-assign',
    'let it; ({ [Symbol.iterator]: it } = globalThis.window?.self); return typeof it;',
    true, false, true,
  ],
  [
    'probe-loop',
    'for (const { [Symbol.iterator]: it } of [globalThis.window]) return typeof it;',
    true, false, true,
  ],
  [
    'probe-nested',
    'let name; ({ [Symbol.iterator]: { name } } = globalThis.window); return name;',
    true, false, true,
  ],
  [
    'probe-nested-declaration',
    'const { [Symbol.iterator]: { name } } = globalThis.window?.self; return name;',
    true, false, true,
  ],
  [
    'probe-rest',
    'const { [Symbol.iterator]: it, ...rest } = globalThis.window; return [typeof it, typeof rest];',
    true, false, true,
  ],
  [
    'symbol-selection',
    'return ((effects.push("test"), choice) ? Symbol : Symbol).iterator in [3];',
    false, true, false,
  ],
  [
    'symbol-presence',
    'return (typeof Symbol === "function" ? Symbol : {}).iterator in [3];',
    false, true, false,
  ],
  [
    'symbol-defined',
    'return (typeof Symbol !== "undefined" ? Symbol : {}).iterator in [3];',
    false, true, false,
  ],
  [
    'symbol-nested',
    'return (choice ? (choice ? Symbol : Symbol) : Symbol).iterator in [3];',
    false, true, false,
  ],
  [
    'realm-conditional-store',
    'const g = globalThis; let w; return (w = choice ? g : globalThis).window?.Array.from([3]);',
    true, false, false,
  ],
  [
    'realm-alias',
    'const w = choice ? globalThis : self; return w.Symbol.iterator in [3];',
    false, true, false,
  ],
  [
    'realm-mixed',
    'const w = choice ? globalThis : { Symbol: { iterator: "slot" } }; const list = [3]; return w.Symbol.iterator in list;',
    false, true, false,
  ],
  [
    'realm-mixed-right-effect',
    'const w = choice ? globalThis : null; const box = { get value() { effects.push("rhs"); return [3]; } }; return w.Symbol.iterator in box.value;',
    false, true, false,
  ],
  [
    'realm-mixed-null',
    'const w = choice ? globalThis : null; return w.Symbol.iterator in [3];',
    false, true, false,
  ],
  [
    'symbol-sequence',
    'return (effects.push("a"), (effects.push("b"), Symbol.iterator)) in [3];',
    false, true, false,
  ],
  [
    'symbol-prefix-throw',
    'return (effects.push("a"), missingPrefix, Symbol.iterator) in [3];',
    false, true, false,
  ],
  [
    'symbol-selection-throw',
    'return (missingChoice ? Symbol : Symbol).iterator in [3];',
    false, true, false,
  ],
  [
    'symbol-shadow',
    'const Symbol = { iterator: "slot" }; return (effects.push("prefix"), Symbol.iterator) in { slot: 7 };',
    false, true, false,
  ],
  [
    'symbol-mixed',
    'const S = { iterator: "slot" }; return (choice ? Symbol : S).iterator in [3];',
    false, false, false,
  ],
  [
    'optional-call',
    'globalThis.box = choice ? { list: [3] } : null; return globalThis.box?.list[Symbol.iterator]().next().value;',
    false, true, false,
  ],
  [
    'optional-read',
    'globalThis.box = choice ? { list: [3] } : null; return typeof globalThis.box?.list[Symbol.iterator];',
    false, true, false,
  ],
  [
    'optional-alias',
    'globalThis.box = choice ? { list: [3] } : null; const g = globalThis; return g.box?.list[Symbol.iterator]().next().value;',
    false, true, false,
  ],
  [
    'optional-destructure',
    'globalThis.box = choice ? { list: [3] } : null; const { at } = globalThis.self.box?.list ?? []; return at.call([3], 0);',
    false, false, false,
  ],
  [
    'optional-key-effect',
    'globalThis.box = choice ? { list: [3] } : null; return globalThis.box?.[(effects.push("key"), "list")][Symbol.iterator]().next().value;',
    false, true, false,
  ],
  [
    'optional-sealed',
    'globalThis.box = choice ? { list: [3] } : null; return (globalThis.box?.list)[Symbol.iterator]();',
    false, false, false,
  ],
  [
    'store-dead',
    'globalThis.box = [3, 4]; let w; return (w = globalThis.window).self?.box.at(0);',
    true, false, false,
  ],
  [
    'store-live',
    'globalThis.box = [3, 4]; let w; return (w = globalThis.window)?.self?.box.at(0);',
    true, false, false,
  ],
  [
    'store-unknown-key',
    'globalThis.box = [3, 4]; Array.prototype.extra = 1; const key = ["b", "o", "x"].join(""); let w; return (w = globalThis.window).self?.[key].at(0);',
    true, false, false,
  ],
  [
    'store-live-key',
    'globalThis.box = [3, 4]; Array.prototype.extra = 1; const key = ["b", "o", "x"].join(""); let w; return (w = globalThis.window)?.self?.[key].at(0);',
    true, false, false,
  ],
  [
    'store-mutated-self',
    'globalThis.self = choice ? { box: [7] } : null; let w; return (w = globalThis.window).self?.box.at(0);',
    true, false, false,
  ],
  [
    'store-lowered-test',
    'globalThis.box = [3]; let w, ref; return (ref = (effects.push("prefix"), w = globalThis.window).self) == null ? void 0 : ref[(effects.push("key"), "box")].at(0);',
    true, false, false,
  ],
  [
    'store-lowered-setter-test',
    `globalThis.box = [3]; const box = { get w() { throw new Error("getter"); }, set w(value) { effects.push("write"); } };
      let ref; return (ref = (box.w = globalThis.window).self) == null ? void 0 : ref[(effects.push("key"), "box")].at(0);`,
    true, false, false,
  ],
  [
    'store-effects',
    'globalThis.box = [3]; let w; return (effects.push("prefix"), (w = globalThis.window)).self?.[(effects.push("key"), "box")].at((effects.push("arg"), 0));',
    true, false, false,
  ],
];
const directory = await fs.mkdtemp(path.join(import.meta.dirname, '../transpiler-differential/tmp/iterator-receivers-'));
let serial = 0;
try {
  for (const [name, body, window, noSymbol, nativeTargets] of cases) {
    const source = scenarioSource(`export const effects = []; export function read(choice) { ${ body } }`);
    for (const targets of nativeTargets ? [{ ie: 11 }, { chrome: 100 }] : [{ ie: 11 }]) {
      for (const method of ['usage-global', 'usage-pure']) {
        const options = { method, version: '4.0', targets };
        const outputs = [['native', source]];
        for (const host of ['babel', 'babel-parens', 'unplugin', 'pre+post']) {
          let code = source;
          if (host.startsWith('babel')) code = (await transformAsync(source, {
            configFile: false, babelrc: false, plugins: [[babelPlugin, options]],
            parserOpts: { createParenthesizedExpressions: host === 'babel-parens' },
          })).code;
          else {
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
            // Removing only the Symbol binding is a narrow helper oracle: array iteration
            // survives through core-js's internal iterator registry. The native reference
            // remains full; no suite-wide strip policy or symbol-producing API is changed.
            for (const realm of host === 'native' ? ['full'] : noSymbol ? ['full', 'stripped', 'no-symbol'] : ['full', 'stripped']) {
              const file = path.join(directory, `case-${ serial++ }.mjs`);
              await fs.writeFile(file, `const root = Function('return this')();
                root.self = root;
                ${ targets.chrome ? 'root.globalThis = root;' : '' }
                ${ present ? 'root.window = root;' : 'delete root.window;' }
                const reads = [];
                ${ nativeTargets ? `Object.defineProperty(root, Symbol.iterator, {
                  configurable: true, get() { reads.push('iterator'); return function iterate() {}; }
                });` : '' }
                ${ realm === 'no-symbol' ? 'delete root.Symbol;' : '' }
                const mod = await import(${ JSON.stringify(pathToFileURL(module).href) });
                export const r = [false, true].map(choice => {
                  try { return mod.read(choice); } catch (error) { return error.name; }
                });
                export const effects = [mod.effects, reads];`);
              const actual = await runInWorker(file, { strip: realm === 'stripped', stripGlobals: STRIP_GLOBALS });
              if (host === 'native') {
                check(`${ name }/${ present }/native runs`, actual.startsWith('OK|'), true);
                expected = actual;
              } else check(`${ name }/${ method }/${ host }/${ JSON.stringify(targets) }/${ present }/${ realm }`, actual, expected);
            }
          }
        }
      }
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
