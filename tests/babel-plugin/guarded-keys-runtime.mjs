/* eslint-disable max-depth -- Cross parser, phase and realm boundaries. */
// Optional keys, nested receiver effects and delete references retain native semantics.
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
const { check, finish } = createChecker('guarded-keys-runtime');
const cases = [
  [
    'optional-symbol-read',
    'const list = { undefined: 23, [Symbol.iterator]() { return 31; } }; return typeof list[globalThis.window?.Symbol.iterator];',
    true,
  ],
  [
    'optional-symbol-call',
    'const list = { undefined: 23, [Symbol.iterator]() { return 31; } }; return list[globalThis.window?.Symbol.iterator]();',
    true,
  ],
  [
    'optional-symbol-declaration',
    'const list = { undefined: 23, [Symbol.iterator]() { return 31; } }; const { [globalThis.window?.Symbol.iterator]: it } = list; return typeof it;',
    true,
  ],
  [
    'optional-symbol-assignment',
    'const list = { undefined: 23, [Symbol.iterator]() { return 31; } }; let it; ({ [globalThis.window?.Symbol.iterator]: it } = list); return typeof it;',
    true,
  ],
  [
    'optional-symbol-parameter',
    'const list = { undefined: 23, [Symbol.iterator]() { return 31; } }; function pick({ [globalThis.window?.Symbol.iterator]: it }) { return typeof it; } return pick(list);',
    true,
  ],
  [
    'optional-symbol-in',
    'const list = { undefined: 23 }; return globalThis.window?.Symbol.iterator in list;',
    true,
  ],
  [
    'nested-symbol-effects',
    'const list = [1]; const it = list[(effects.push(1), (effects.push(2), Symbol)).iterator]; return it.call(list).next().value;',
    false,
  ],
  [
    'nested-symbol-hop-effects',
    'const list = [1]; const it = list[(effects.push(1), (effects.push(2), globalThis[(effects.push(3), "Symbol")])).iterator]; return it.call(list).next().value;',
    false,
  ],
  [
    'nested-symbol-call-effects',
    `const list = [1];
      const get = () => (effects.push(3), globalThis);
      const it = list[(effects.push(1), (effects.push(2), get()))[(effects.push(4), "Symbol")].iterator];
      return it.call(list).next().value;`,
    false,
  ],
  [
    'nested-symbol-pattern-effects',
    'const list = [1]; const { [(effects.push(1), (effects.push(2), Symbol)).iterator]: it } = list; return it.call(list).next().value;',
    false,
  ],
  [
    'nested-guarded-read',
    'let C = Map; if (choice) C = Set; return typeof (effects.push(1), (effects.push(2), C)).groupBy;',
    false,
  ],
  [
    'nested-guarded-call',
    'let C = Map; if (choice) C = Set; return (effects.push(1), (effects.push(2), C)).groupBy([1, 2], x => x % 2).size;',
    false,
  ],
  [
    'nested-guarded-pattern',
    'let C = Map; if (choice) C = Set; const { groupBy } = (effects.push(1), (effects.push(2), C)); return typeof groupBy;',
    false,
  ],
  [
    'nested-guarded-throw',
    'let C = Map; if (choice) C = Set; return (effects.push(1), (missingPrefix, C)).groupBy;',
    false,
  ],
  [
    'guarded-delete-tail',
    'const obj = { k: 1 }; const result = delete (choice ? Object : null)?.fromEntries([["k", obj]]).k.k; return [result, "k" in obj];',
    false,
  ],
  [
    'guarded-delete-parentheses',
    'const obj = { k: 1 }; const result = delete ((choice ? Object : null)?.fromEntries([["k", obj]]).k.k); return [result, "k" in obj];',
    false,
  ],
  [
    'guarded-delete-sealed',
    'const obj = { k: 1 }; const result = delete ((choice ? Object : null)?.fromEntries([["k", obj]])).k.k; return [result, "k" in obj];',
    false,
  ],
  [
    'guarded-delete-key',
    `const obj = { k: 1 };
      const result = delete (choice ? Object : null)?.fromEntries((effects.push("args"), [["k", obj]])).k[(effects.push("key"), "k")];
      return [result, "k" in obj];`,
    false,
  ],
  [
    'guarded-delete-optional-tail',
    'const obj = { k: 1 }; const result = delete (choice ? Object : null)?.fromEntries([["k", obj]]).k?.k; return [result, "k" in obj];',
    false,
  ],
  [
    'guarded-delete-argument',
    `const obj = { k: 1 };
      const target = { take(x) { effects.push(typeof x);
      return obj;
      } };
      const result = delete target.take((choice ? Object : null)?.fromEntries([])).k;
      return [result, "k" in obj];`,
    false,
  ],
  [
    'nested-symbol-throw',
    'const list = [1]; return list[(effects.push(1), (missingPrefix, Symbol)).iterator];',
    false,
  ],
  [
    'selected-symbol',
    'const list = [1]; return ((effects.push("choose"), choice) ? globalThis : self).Symbol.iterator in list;',
    false,
  ],
  [
    'shadow-symbol',
    'const Symbol = { iterator: "slot" }; const list = { slot: 17 }; return list[(effects.push(1), (effects.push(2), Symbol)).iterator];',
    false,
  ],
  [
    'guarded-delete-nonnull',
    'const obj = { k: 1 }; const result = delete (choice ? Object : null)?.fromEntries([["k", obj]])!.k.k; return [result, "k" in obj];',
    false,
    true,
  ],
  [
    'guarded-delete-cast',
    'const obj = { k: 1 }; const result = delete ((choice ? Object : null)?.fromEntries([["k", obj]]) as any).k.k; return [result, "k" in obj];',
    false,
    true,
  ],
  [
    'guarded-delete-optional-call',
    'return delete (choice ? Object : null).fromEntries?.([]);',
    false,
  ],
  [
    'guarded-delete-double-optional',
    'return delete (choice ? Object : null)?.fromEntries?.([]);',
    false,
  ],
  [
    'guarded-delete-key-claim',
    `const obj = { k: 1 };
      const result = delete (choice ? Object : null)?.fromEntries([["k", obj]]).k[(effects.push([7].at(-1)), "k")];
      return [result, "k" in obj];`,
    false,
  ],
  [
    'nested-guarded-siblings',
    `let C = Map;
      if (choice) C = Set;
      const { groupBy, name } = (effects.push(1), (effects.push(2), C));
      return [typeof groupBy, typeof name];`,
    false,
  ],
];
const directory = await fs.mkdtemp(path.join(import.meta.dirname, '../transpiler-differential/tmp/guarded-keys-'));
let serial = 0;
try {
  for (const [name, body, window, ts = false] of cases) {
    const source = scenarioSource(`export const effects = []; export function read(choice) { ${ body } }`);
    for (const method of ['usage-global', 'usage-pure']) {
      const options = { method, version: '4.0', targets: { ie: 11 } };
      const outputs = [['native', source]];
      for (const host of ['babel', 'babel-parens', 'unplugin', 'pre+post']) {
        let code = source;
        if (host.startsWith('babel')) code = (await transformAsync(source, {
          configFile: false, babelrc: false, filename: ts ? 'input.ts' : 'input.mjs', plugins: [[babelPlugin, options]],
          parserOpts: { plugins: ts ? ['typescript'] : [], createParenthesizedExpressions: host === 'babel-parens' },
        })).code;
        else {
          const plugin = createUnplugin(options);
          for (const phase of host === 'pre+post' ? ['pre', 'post'] : ['single']) code = plugin.transform(code, ts ? 'input.ts' : 'input.mjs', phase)?.code ?? code;
        }
        outputs.push([host, code]);
      }
      const imports = JSON.stringify([...importSet(outputs[1][1])].sort());
      for (const [host, code] of outputs.slice(2)) check(`${ name }/${ method }/${ host }/imports`,
        JSON.stringify([...importSet(code)].sort()), imports);
      for (const present of window ? [false, true] : [false]) {
        let expected;
        for (const [host, output] of outputs) {
          const module = path.join(directory, `case-${ serial++ }.mjs`);
          await fs.writeFile(module, ts ? (await transformAsync(output, {
            configFile: false, babelrc: false, filename: 'input.ts',
            plugins: [requireBabel('@babel/plugin-transform-typescript')],
          })).code : output);
          const file = path.join(directory, `case-${ serial++ }.mjs`);
          await fs.writeFile(file, `const root = Function('return this')();
            root.self = root;
            ${ present ? 'root.window = root;' : 'delete root.window;' }
            const mod = await import(${ JSON.stringify(pathToFileURL(module).href) });
            export const effects = mod.effects;
            export const r = [false, true].map(choice => {
              try { return mod.read(choice); } catch (error) { return error.name; }
            });`);
          for (const strip of host === 'native' ? [false] : [false, true]) {
            const actual = await runInWorker(file, { strip, stripGlobals: STRIP_GLOBALS });
            if (host === 'native') {
              check(`${ name }/${ present }/native runs`, actual.startsWith('OK|'), true);
              expected = actual;
            } else check(`${ name }/${ method }/${ host }/${ present }/${ strip }`, actual, expected);
          }
        }
      }
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
