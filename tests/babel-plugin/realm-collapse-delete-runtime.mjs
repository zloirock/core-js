/* eslint-disable max-depth -- Cross parser, phase and realm boundaries. */
// Mutation guards retain the source receiver, exceptions and effect order.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';
import { importSet } from '../transpiler-differential/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('realm-collapse-delete-runtime');
const cases = [
  ['sequence-delete', 'return delete (effects.push("prefix"), globalThis.window)?.window.slotD;'],
  ['declined-sequence', 'return delete (effects.push("prefix"), globalThis?.window)?.slotD;'],
  ['quiet-sequence', 'return delete (0, globalThis.window)?.slotD;'],
  ['nested-sequence', 'return delete (effects.push("a"), (effects.push("b"), globalThis.window))?.["slotD"];'],
  ['outer-guard', 'return delete globalThis.self.window?.window.slotD;'],
  ['outer-guard-sequence', 'return delete (effects.push("prefix"), globalThis.self.window)?.window.slotD;'],
  ['outer-guard-update', 'return (globalThis.self.window?.window).slotD++;'],
  ['outer-guard-write', 'return (globalThis.self.window?.window).slotD = (effects.push("rhs"), 31);'],
  ['outer-guard-pattern', 'let source = [31]; [ (globalThis.self.window?.window).slotD ] = source; return true;'],
  ['outer-guard-loop', 'for ((globalThis.self.window?.window).slotD of [31]) effects.push("body"); return true;'],
  ['branch-consequent', 'const x = { window: { slotD: 23 } }; const d = delete (choice ? globalThis : x).window.slotD; return [d, x.window.slotD];'],
  ['branch-alternate', 'const x = { window: { slotD: 23 } }; const d = delete (choice ? x : globalThis).window.slotD; return [d, x.window.slotD];'],
  ['null-test', 'return delete (globalThis == null).window.slotD;'],
  ['nonnull-test', 'return delete (globalThis != null).window.slotD;'],
  ['logical-control', 'return delete (choice && globalThis).window.slotD;'],
  ['stored-guard', 'let held; const d = delete (held = globalThis.window)?.slotD; return [d, typeof held];'],
  ['sealed-read', 'return typeof (globalThis.window?.Promise)[(effects.push("key"), "noSuchStatic")];'],
  ['sealed-delete', 'return delete (globalThis.window?.Promise)[(effects.push("key"), "noSuchStatic")];'],
  ['double-sealed', 'return typeof ((globalThis.window?.Promise))[(effects.push("key"), "noSuchStatic")];'],
  ['dynamic-key', 'const key = () => "resolve"; return typeof (globalThis.window?.Promise)[key()];'],
  ['effectful-key', 'const key = () => (effects.push("key"), "resolve"); return typeof (globalThis.window?.Promise)[key()];'],
  ['throwing-key', 'const key = () => { effects.push("key"); throw new RangeError(); }; return typeof (globalThis.window?.Promise)[key()];'],
  ['instance', 'return (effects.push("prefix"), globalThis).window?.globalThis.items?.at(-1);'],
  ['optional-instance-call', 'return (effects.push("prefix"), globalThis).window?.globalThis.items?.at?.(-1);'],
  ['terminal', 'return typeof (effects.push("prefix"), globalThis.window)?.self;'],
  ['claimed-delete', 'return delete globalThis.self?.window?.window?.Reflect.slot;'],
  ['claimless-delete', 'return delete globalThis.self?.window?.window?.self.slotD;'],
  ['vestigial-delete', 'const g = globalThis; return delete g.window?.Reflect?.slot;'],
  ['vestigial-read', 'const g = globalThis; return g.window?.Reflect?.slot;'],
  ['excluded-store', 'let held; return [delete (held = (effects.push("prefix"), globalThis)).self.slotD, typeof held];', { exclude: ['web.self'] }],
];
// Export rewriting must not mutate a shared identifier used by the kept store.
for (const createParenthesizedExpressions of [false, true]) {
  const source = 'export let held; export const deleted = delete (held = globalThis).self.customProp;';
  const { code } = await transformAsync(source, {
    configFile: false, babelrc: false, filename: 'input.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, exclude: ['web.self'] }],
      requireBabel('@babel/plugin-transform-modules-commonjs')],
    parserOpts: { createParenthesizedExpressions },
  });
  const exports = {};
  Function('require', 'exports', code)(requireBabel, exports);
  check(`exported-store/${ createParenthesizedExpressions }/value`, exports.held === globalThis, true);
  check(`exported-store/${ createParenthesizedExpressions }/delete`, exports.deleted, true);
}
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const directory = await fs.mkdtemp(path.join(tmp, 'realm-collapse-delete-'));
let serial = 0;
try {
  for (const [name, body, extra = {}] of cases) {
    const source = scenarioSource(`export const effects = []; export function read(choice) { ${ body } }`);
    for (const method of ['usage-global', 'usage-pure']) {
      const options = { method, version: '4.0', targets: { ie: 11 }, ...extra };
      const outputs = [['native', source]];
      for (const host of ['babel', 'babel-parens', 'unplugin', 'pre+post']) {
        let code = source;
        if (host.startsWith('babel')) code = (await transformAsync(source, {
          configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
          parserOpts: { createParenthesizedExpressions: host === 'babel-parens' },
        })).code;
        else {
          const plugin = createUnplugin(options);
          for (const pass of host === 'pre+post' ? ['pre', 'post'] : ['single']) code = plugin.transform(code, 'input.mjs', pass)?.code ?? code;
        }
        outputs.push([host, code]);
      }
      const imports = JSON.stringify([...importSet(outputs[1][1])].sort());
      for (const [host, code] of outputs.slice(2)) check(`${ name }/${ method }/${ host }/imports`,
        JSON.stringify([...importSet(code)].sort()), imports);
      for (const present of [false, true]) {
        let wanted;
        for (const [host, output] of outputs) {
          const module = path.join(directory, `case-${ serial++ }.mjs`);
          await fs.writeFile(module, output);
          const file = path.join(directory, `case-${ serial++ }.mjs`);
          await fs.writeFile(file, `const root = Function('return this')();
            root.self = root;
            ${ present ? 'root.window = root;' : 'delete root.window;' }
            root.slotD = 17; root.items = [1, 3];
            const mod = await import(${ JSON.stringify(pathToFileURL(module).href) });
            export const effects = mod.effects;
            let value;
            try { value = mod.read(false); } catch (error) { value = error.name; }
            export const r = [value, root.slotD];`);
          for (const strip of host === 'native' ? [false] : [false, true]) {
            const actual = await runInWorker(file, { strip, stripGlobals: ['Promise', 'globalThis'] });
            if (host === 'native') {
              check(`${ name }/${ present }/native runs`, actual.startsWith('OK|'), true);
              wanted = actual;
            } else check(`${ name }/${ method }/${ host }/${ present }/${ strip }`, actual, wanted);
          }
        }
      }
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
