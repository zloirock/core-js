// A live optional owns every following plain link until a source grouping boundary.
// Print/parse/lowering must keep that boundary, argument order and the method receiver.
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
const { check, finish } = createChecker('optional-continuation-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'optional-continuation-'));
let count = 0;

try {
  for (const [name, expression, expected] of [
    ['guard-tail', 'a?.at(0).foo?.(effects.push("arg")).bar', ['undefined', 'undefined', 23]],
    ['guard-call-tail', 'a?.at(0).foo?.(effects.push("arg")).next().bar', ['undefined', 'undefined', 23]],
    ['sealed-tail', '(a?.at(0).foo?.()).bar', ['TypeError', 'TypeError', 23]],
    ['combined-tail', 'a.flat?.().at(0).foo?.(effects.push("arg")).bar', ['TypeError', 'undefined', 23]],
    ['lift-tail', 'globalThis.window?.Array.from([a[0]])[0].foo?.(effects.push("arg")).bar', ['undefined', 'undefined', 23]],
    ['lift-call', 'globalThis.window?.Array.from([a[0]])[0].foo?.().next().bar', ['undefined', 'undefined', 23]],
    ['derived-call', 'globalThis?.Array.from([a[0]])[0].foo?.(effects.push("arg"))', ['TypeError', 'undefined', 'object']],
    ['argument', 'o?.foo(window?.Map.length)', ['undefined', 'undefined', 23]],
    ['computed-key', 'o?.[window?.Map.length](effects.push("arg"))', ['undefined', 'undefined', 23]],
    ['delete-tail', 'delete a?.at(0).foo?.().bar', [true, true, true]],
    ['sequence-tail', '(effects.push("prefix"), a)?.at(0).foo?.().bar', ['undefined', 'undefined', 23]],
    ['stored-probe-tail', '(held = globalThis.window?.self.Array.missing?.next.other)?.includes(1)', ['undefined', 'undefined', 'undefined']],
    ['stored-tail', '(held = globalThis.window.self.Array.missing?.next.other)?.includes(1)', ['TypeError', 'undefined', 'undefined']],
    ['guard-tail-ts', 'a?.at(0)!.foo?.(effects.push("arg")).bar', ['undefined', 'undefined', 23]],
    ['narrow-direct-plain', 'R?.Map.groupBy([1], x => x)', ['TypeError', 'TypeError', 'TypeError']],
    ['narrow-selection', '(a ? Array : null)?.from(a).foo?.().length', ['undefined', 'undefined', 'undefined']],
    ['narrow-plain', 'R?.Map.groupBy([1], x => x).size', ['undefined', 'TypeError', 1]],
    ['narrow-optional', 'R?.Map.groupBy?.([1], x => x).size', ['undefined', 'undefined', 1]],
    ['narrow-sealed', '(R?.Map.groupBy?.([1], x => x)).size', ['TypeError', 'TypeError', 1]],
  ]) {
    expected.push(...name === 'narrow-direct-plain' ? ['TypeError', 'TypeError']
      : name === 'narrow-selection' || name.startsWith('stored') ? ['undefined', 'undefined']
        : name.startsWith('narrow') ? [1, 1]
          : name === 'argument' || name === 'computed-key' ? [23, 23] : ['RangeError', 'TypeError']);
    const ts = name.endsWith('-ts');
    const plugins = ts ? [requireBabel.resolve('@babel/plugin-transform-typescript')] : [];
    const filename = ts ? 'input.ts' : 'input.mjs';
    const direct = name === 'narrow-direct-plain';
    const source = direct ? `let R = globalThis;
      if (globalThis.__flag !== false) R = { Map: {} };
      let result;
      try { result = ${ expression }; } catch (error) { result = error.name; }
      export function read() { return result; }` : `export function read(a${ ts ? ': any' : '' }, o${ ts ? ': any' : '' }) {
      ${ name.startsWith('stored') ? 'let held;' : '' }
      ${ name.startsWith('narrow') && !direct ? 'let R = globalThis; if (globalThis.__state === 0) R = null; else if (globalThis.__state === 1) R = { Map: {} };' : '' }
      return ${ expression };
    }`;
    scenarioSource(source);
    const { code: native } = await transformAsync(source, { configFile: false, babelrc: false, filename, plugins });
    const outputs = [['native', native]];
    for (const method of ['usage-pure', 'usage-global']) {
      const options = { ...OPTIONS, method };
      const { code: babel } = await transformAsync(source, {
        configFile: false, babelrc: false, filename, plugins: [[babelPlugin, options], ...plugins],
      });
      const plugin = createUnplugin(options);
      const unplugin = plugin.transform(source, filename).code;
      const pre = plugin.transform(source, filename, 'pre')?.code ?? source;
      const post = plugin.transform(pre, filename, 'post')?.code ?? pre;
      for (const [host, output] of [['babel', babel], ['unplugin', unplugin], ['pre+post', post]]) {
        const erased = ts ? (await transformAsync(output, { configFile: false, babelrc: false, filename, plugins })).code : output;
        outputs.push([`${ method }/${ host }`, erased]);
        const { code } = await transformAsync(erased, {
          configFile: false, babelrc: false, plugins: [requireBabel.resolve('@babel/plugin-transform-optional-chaining')],
        });
        outputs.push([`${ method }/${ host }/lowered`, code]);
      }
    }
    let reference;
    for (const [host, output] of outputs) {
      const file = path.join(DIR, `case-${ count++ }.mjs`);
      // The environment is installed AFTER transformation so its mutations cannot disable the
      // read under test. Imports initialize first; every execution gets a fresh worker realm.
      const exercise = `
export const effects = [];
export const r = [];
const realm = Function("return this")();
for (let state = 0; state < 5; state++) {
  realm.__state = state;
  realm.window = state === 0 ? null : realm;
  const item = state === 1 ? {} : { foo(value) {
    effects.push(this === item ? "this" : "wrong-this");
    return { bar: 23, next() { effects.push(this.bar); return this; } };
  } };
  if (state === 3) Object.defineProperty(item, "foo", { get() { effects.push("getter"); throw new RangeError("method"); } });
  if (state === 4) item.foo = 1;
  const a = state === 0 ? null : [item];
  const o = state < 2 ? null : { foo() { effects.push("outer"); return 23; }, 0() { effects.push("key"); return 23; } };
  try {
    const value = read(a, o);
    r.push(value === undefined ? "undefined" : value && typeof value === "object" ? "object" : value);
  } catch (error) { r.push(error.name); }
}`;
      await fs.outputFile(file, output + exercise);
      const actual = await runInWorker(file, { strip: false });
      if (host === 'native') {
        check(`${ name }/native`, actual.split('|', 2)[1], JSON.stringify(expected));
        reference = actual;
      } else {
        // The provider contract permits an all-plain window navigation to collapse onto self.
        // Its pure twin returns undefined when window is absent; a guarded navigation above
        // is NOT that price and must match native, including its remaining optional tail.
        const wanted = name === 'stored-tail' && host.startsWith('usage-pure/')
          ? 'OK|["undefined","undefined","undefined","undefined","undefined"]|[]' : reference;
        check(`${ name }/${ host }/full`, actual, wanted);
        check(`${ name }/${ host }/stripped`, await runInWorker(file), wanted);
      }
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();
