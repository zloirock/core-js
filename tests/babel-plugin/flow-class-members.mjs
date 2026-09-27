// Flow is parsed only by Babel. Execute the emitted calls with foreign ambient implementations
// in realms whose native Array/String at methods are absent, after erasing declaration-only syntax.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { runtimeKey } from '../transpiler-differential/serialize.mjs';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('flow-class-members runtime');
const cases = [
  ['instance', 'declare class C { m(): number[] }', 'new C().m().at(0)', 'class C { m() { return [7]; } }', 7],
  ['static', 'declare class C { static m(): string }', 'C.m().at(1)', 'class C { static m() { return "abc"; } }', 'b'],
  ['method receiver', 'declare class C { m(): string }', 'new C().m().at(1)',
    'class C { value = "abc"; m() { return this.value; } }', 'b'],
  ['getter evaluation order', 'declare class C { get items(): string }', 'new C().items.at((reads += 10, 1)) + reads',
    'let reads = 0; class C { get items() { if (++reads !== 1) throw new Error("repeated getter"); return "abc"; } }', 'b11'],
  ['field', 'declare class C { items: string }', 'new C().items.at(1)', 'class C { items = "abc"; }', 'b'],
  ['callable field', 'declare class C { m: () => string }', 'new C().m().at(1)', 'class C { m = () => "abc"; }', 'b'],
  ['getter', 'declare class C { get items(): number[] }', 'new C().items.at(0)', 'class C { get items() { return [7]; } }', 7],
  ['callable getter', 'declare class C { get m(): () => string }', 'new C().m().at(1)', 'class C { get m() { return () => "abc"; } }', 'b'],
  ['generic inheritance', 'declare class B<T> { m(): T } declare class M<U> extends B<U> {} declare class C extends M<number[]> {}',
    'new C().m().at(0)', 'class B { m() { return [7]; } } class M extends B {} class C extends M {}', 7],
  ['prototype callable inheritance', 'declare class B { proto m: () => (number[] | string) } declare class C extends B { m(): string }',
    'new C().m().at(1)', 'class B { m() { return [7]; } } class C extends B { m() { return "abc"; } }', 'b'],
  ['generic rest default', 'declare class C { m<T = number[]>(...xs: T[]): T }',
    'new C().m("abc").at(1)', 'class C { m(...xs) { return xs[0]; } }', 'b'],
  ['overloads', 'declare class C { m(x: string): string; m(x: string, y: number): number[] }',
    'new C().m("abc").at(1)', 'class C { m(x, y) { return y === undefined ? x : [y]; } }', 'b'],
  ['optional callable fallback', 'declare class C { m?: () => number[] }', '(new C().m || "abc").at(0)', 'class C {}', 'a'],
  ['typeof method', 'declare class C { static m(): number[] } function read(m: typeof C.m) { return m().at(0); }',
    'read(C.m)', 'class C { static m() { return [7]; } }', 7],
  ['array inheritance', 'declare class B extends Array<string> {} declare class C extends B {}',
    'new C("abc").at(0)', 'class B extends Array {} class C extends B {}', 'abc'],
  // Deliberately violates the declared return; an observed write must cancel the narrow.
  ['written method', 'declare class C { m(): number[] }', '(C.prototype.m = () => "abc", new C().m().at(1))',
    'class C { m() { return [7]; } }', 'b'],
];

const temporaryRoot = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(temporaryRoot);
const directory = await fs.mkdtemp(path.join(temporaryRoot, 'flow-classes-'));
function eraseDeclarations() {
  return { visitor: {
    DeclareClass(p) { p.remove(); },
    TypeAnnotation(p) { p.remove(); },
  } };
}
const audit = 'export const effects = [typeof Array.prototype.at, typeof String.prototype.at];';
try {
  for (const [name, declaration, expression, implementation, expected] of cases) {
    const options = { configFile: false, babelrc: false, parserOpts: { plugins: ['flow'] } };
    const source = `${ declaration }; export const r = ${ expression };`;
    const original = await transformAsync(source, { ...options, plugins: [eraseDeclarations] });
    const transformed = await transformAsync(source, {
      ...options,
      plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
    });
    // A separate pass preserves the declarations throughout polyfill analysis.
    const { code: executable } = await transformAsync(transformed.code, {
      ...options,
      plugins: [eraseDeclarations],
    });
    const native = path.join(directory, 'native.mjs');
    const emitted = path.join(directory, 'emitted.mjs');
    await fs.writeFile(native, `${ implementation }; ${ original.code }; ${ audit }`);
    await fs.writeFile(emitted, `${ implementation }; ${ executable }; ${ audit }`);
    for (const [file, strip] of [[native, false], [emitted, false], [emitted, true]]) {
      const kind = strip ? 'undefined' : 'function';
      const expectedKey = runtimeKey({ ok: true, r: expected, effects: [kind, kind] });
      check(`${ name }: ${ file === native ? 'source' : 'emitted' } ${ strip ? 'stripped' : 'native' }`,
        await runInWorker(file, { strip, stripGlobals: [] }), expectedKey);
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
