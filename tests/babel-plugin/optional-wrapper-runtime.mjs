/* eslint-disable max-depth -- Independent dialect, phase and realm axes. */
// Source parentheses seal optional chains; erased type wrappers do not.
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
const tsStrip = requireBabel('@babel/plugin-transform-typescript').default;
const { check, finish } = createChecker('optional-wrapper-runtime', {
  tsc: 'Dynamic realm fixtures exercise erased wrappers, not annotated type inference.',
});
const cases = [
  ['stored-non-null', 'let held; return (held = globalThis.window)?.self!.box;'],
  ['stored-plain', 'let held; return (held = globalThis.window)?.self.box;'],
  ['stored-sealed', 'let held; return ((held = globalThis.window)?.self)!.box;'],
  ['stored-cast-sealed', 'let held; return ((held = globalThis.window)?.self as any).box;'],
  ['stored-key-effects', 'let held; return (effects.push("prefix"), held = globalThis.window)?.self![(effects.push("key"), "box")];'],
  ['alias-live-window', 'const g = globalThis; return g?.window?.self.box;'],
  ['alias-alias-live-window', 'const first = globalThis; const g = first; return g?.window?.self.box;'],
  ['alias-selection-live-window', 'const g = typeof self === "object" ? self : globalThis; return g?.window?.self.box;'],
  ['alias-plain-window', 'const g = globalThis; return g.window?.self.box;'],
  ['alias-second-optional', 'const g = globalThis; return g?.window?.self?.box;'],
  ['narrow-non-null-call', 'const w: any = typeof window !== "undefined" ? window : undefined; return w?.Array.of((effects.push("arg"), 3))!.length;'],
  ['narrow-non-null-member', 'let w: any = globalThis; if (choice) w = null; return w?.Map!.groupBy([1], (x: number) => x).size;'],
  ['narrow-sealed-call', 'const w: any = typeof window !== "undefined" ? window : undefined; return (w?.Array.of((effects.push("arg"), 3)))!.length;'],
  ['narrow-paren-base', 'let w: any = globalThis; if (choice) w = null; return (w)?.Array.of((effects.push("arg"), 3))[0];'],
  ['narrow-double-paren-base', 'let w: any = globalThis; if (choice) w = null; return ((w))?.Array.from((effects.push("arg"), [3]))[0];'],
  ['narrow-rebuilt-call', 'const w: any = typeof window !== "undefined" ? window : undefined; const values = []; '
    + 'values.push(w?.Array.of((effects.push("arg"), 3))!.length); return values[0];'],
  ['unbound-optional-call', 'let f: any; return f?.()?.self.box;'],
];
const directory = await fs.mkdtemp(path.join(import.meta.dirname, '../transpiler-differential/tmp/optional-wrappers-'));
let serial = 0;
try {
  for (const [name, body] of cases) {
    const source = scenarioSource(`export const effects = []; export function read(choice) { ${ body } }`);
    for (const method of ['usage-global', 'usage-pure']) {
      const options = { method, version: '4.0', targets: { ie: 11 } };
      const outputs = [['native', source]];
      for (const host of ['babel', 'babel-parens', 'unplugin', 'pre+post']) {
        let code = source;
        if (host.startsWith('babel')) code = (await transformAsync(source, {
          filename: 'input.ts', configFile: false, babelrc: false, plugins: [[babelPlugin, options]],
          parserOpts: { plugins: ['typescript'], createParenthesizedExpressions: host === 'babel-parens' },
        })).code;
        else {
          const plugin = createUnplugin(options);
          for (const phase of host === 'pre+post' ? ['pre', 'post'] : ['single']) code = plugin.transform(code, 'input.ts', phase)?.code ?? code;
        }
        outputs.push([host, code]);
      }
      const imports = JSON.stringify([...importSet(outputs[1][1])].sort());
      for (const [host, code] of outputs.slice(2)) check(`${ name }/${ method }/${ host }/imports`,
        JSON.stringify([...importSet(code)].sort()), imports);
      for (const present of [false, true]) {
        let expected;
        for (const [host, output] of outputs) {
          const module = path.join(directory, `module-${ serial++ }.mjs`);
          const { code } = await transformAsync(output, {
            filename: 'input.ts', configFile: false, babelrc: false, plugins: [tsStrip],
          });
          await fs.writeFile(module, code);
          for (const strip of host === 'native' ? [false] : [false, true]) {
            const file = path.join(directory, `case-${ serial++ }.mjs`);
            await fs.writeFile(file, `const root = Function('return this')();
              root.self = root; root.box = 23;
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
