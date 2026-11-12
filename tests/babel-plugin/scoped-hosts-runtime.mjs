// Finalization keeps opt-outs on surviving hosts and preserves default/selection effects.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';
import { importSources } from '../unplugin/phase-imports.mjs';
import { parse } from 'oxc-parser';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parseAsync, transformAsync, transformFromAstAsync } = requireBabel('@babel/core');
const { isFunction, traverseFast } = requireBabel('@babel/types');
const { check, checkTruthy, fail, finish } = createChecker('scoped-hosts-runtime');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
// Babel AST input can omit function spans while keeping the surrounding source nodes.
async function transformBabel(source, spanless) {
  const options = { configFile: false, babelrc: false,
    filename: 'input.ts', parserOpts: { plugins: ['typescript'] }, plugins: [[babelPlugin, OPTIONS]] };
  if (!spanless) return (await transformAsync(source, options)).code;
  const ast = await parseAsync(source, { configFile: false, babelrc: false });
  traverseFast(ast, node => {
    if (!isFunction(node)) return;
    delete node.start;
    delete node.end;
    delete node.loc;
  });
  return (await transformFromAstAsync(ast, source, options)).code;
}

const cases = [];
for (const [name, head] of [
  ['catch', 'try { throw JSON.parse("[7]"); } catch ({\n// core-js-disable-next-line\nat\n}) { r = typeof at; }'],
  ['catch-line', 'try { throw JSON.parse("[7]"); } catch ({\nat // core-js-disable-line\n}) { r = typeof at; }'],
  ['for-of', 'for (const {\n// core-js-disable-next-line\nat\n} of [JSON.parse("[7]")]) { r = typeof at; }'],
  ['bodyless-for-of', 'for (const {\n// core-js-disable-next-line\nat\n} of [JSON.parse("[7]")]) r = typeof at;'],
  ['for-in', 'for (const {\n// core-js-disable-next-line\nat\n} in { abc: 1 }) { r = typeof at; }'],
]) cases.push({ name, source: `let r; ${ head } export { r }; export const effects = [];`,
  want: 'function', stripped: 'undefined', optedOut: true });
for (const signature of ['(...xs: number[]) => void', '([x]: number[]) => void', '({ x }: { x: number }) => void']) {
  const setup = 'const o: { p?: number[] } | undefined = JSON.parse(\'{"p":[4,8]}\'); const cb = (..._args: unknown[]) => {};';
  const value = `[o?.p?.at(-1), cb as ${ signature }]`;
  cases.push(
    { name: `field/${ signature }`, source: `${ setup } class A { f = ${ value }; } export const r = new A().f[0]; export const effects = [];`, want: 8, requiresAt: true },
    { name: `parameter/${ signature }`, source: `${ setup } function read(value = ${ value }) { return value[0]; } export const r = read(); export const effects = [];`, want: 8, requiresAt: true },
  );
}
for (const flag of [false, true]) for (const host of ['assignment', 'declaration']) for (const effectful of [false, true]) {
  const pattern = '{ Promise: { allSettled: a }, Map: { groupBy: g } }';
  const value = `(${ effectful ? `(effects.push('test'), ${ flag })` : 'flag' } ? globalThis : G)`;
  const statement = host === 'assignment' ? `let a, g; const held = (${ pattern } = ${ value });`
    : `const ${ pattern } = ${ value }; const held = G;`;
  cases.push({ name: `selection/${ host }/${ flag }/${ effectful }`,
    source: `export const effects = []; const flag = JSON.parse('${ flag }'); const G = globalThis; ${ statement } export const r = [typeof a, typeof g, held === G];`,
    want: ['function', 'function', true], effects: effectful ? ['test'] : [],
    // A captured assignment with several realm hops and an effectful selection retains
    // native reads. Its supported collapse requires an effect-free selection test.
    nativeOnly: effectful && host === 'assignment' });
}
for (const host of ['class', 'function', 'expression']) for (const supplied of [false, true]) {
  const body = '([{ from, [(effects.push("key"), "extra")]: extra } = Array]) { effects.push(from([7])[0]); }';
  const callable = host === 'class' ? `class A { constructor${ body } }`
    : host === 'function' ? `function A${ body }` : `const A = function ${ body };`;
  cases.push({ name: `constructor/${ host }/${ supplied }`,
    source: `export const effects = []; ${ callable } new A([${ supplied ? '{ from: () => [9] }' : 'void 0' }]); export const r = effects.length;`,
    want: 2, effects: ['key', supplied ? 9 : 7] });
}
for (const member of ['m() { effects.push("body"); }', 'get m() { effects.push("get"); return () => {}; }']) {
  cases.push({ name: `nonconstructor/${ member }`,
    source: `export const effects = []; const o = { ${ member } }; let r; try { new o.m(); } catch (error) { r = error.name; } export { r };`,
    want: 'TypeError', effects: member.startsWith('get') ? ['get'] : [] });
}
for (const [name, callable] of [
  ['method', 'const owner = { m({ from } = (effects.push("default"), Array)) { effects.push(from([7])[0]); } }; const A = owner.m;'],
  ['generator', 'const A = function* ({ from } = (effects.push("default"), Array)) { effects.push(from([7])[0]); };'],
  ['async', 'const A = async function ({ from } = (effects.push("default"), Array)) { effects.push(from([7])[0]); };'],
  ['arrow', 'const A = ({ from } = (effects.push("default"), Array)) => { effects.push(from([7])[0]); };'],
]) cases.push({ name: `nonconstructor-default/${ name }`,
  source: `export const effects = []; ${ callable } let r;
    try { new A((effects.push('argument'), void 0)); } catch (error) { r = error.name; } export { r };`,
  want: 'TypeError', effects: ['argument'] });
for (const [name, callable, want] of [
  ['method', 'const owner = { make() { return globalThis; } }; const A = owner.make;', 'TypeError'],
  ['static-method', 'class Owner { static make() { return globalThis; } } const A = Owner.make;', 'TypeError'],
  ['function-property', 'const owner = { make: function () { return globalThis; } }; const A = owner.make;', 'function'],
  ['declaration', 'function A() { return globalThis; }', 'function'],
  ['expression', 'const A = function () { return globalThis; };', 'function'],
  ['named-expression-alias', 'const maker = function createRealm() { return globalThis; }; const A = maker;', 'function'],
]) cases.push({ name: `constructed-realm/${ name }`,
  source: `export const effects = []; ${ callable } let r;
    try { r = typeof new A().Array.from; } catch (error) { r = error.name; } export { r };`, want });
const directory = await fs.mkdtemp(path.join(import.meta.dirname, '../transpiler-differential/tmp/scoped-hosts-'));
let serial = 0;
try {
  for (const item of cases) {
    const { name, source, want, effects = [], optedOut } = item;
    scenarioSource(source);
    const outputs = [['native', source]];
    const hosts = ['babel', 'single', 'pre', 'post', 'pre+post'];
    if (name.startsWith('constructed-realm/')) hosts.push('babel-spanless');
    for (const host of hosts) {
      try {
        let code = source;
        if (host === 'babel' || host === 'babel-spanless') code = await transformBabel(source, host === 'babel-spanless');
        else {
          const plugin = createUnplugin(OPTIONS);
          // eslint-disable-next-line max-depth -- Exercise each phase inside the source/host matrix.
          for (const pass of host === 'pre+post' ? ['pre', 'post'] : [host]) code = plugin.transform(code, 'input.ts', pass)?.code ?? code;
        }
        const imports = importSources((await parse('input.ts', code)).program);
        check(`${ name }/${ host }/at injection`, imports.some(entry => entry.endsWith('/at')), !!item.requiresAt);
        if (optedOut) checkTruthy(`${ name }/${ host }/directive retained`, code.includes('core-js-disable'));
        outputs.push([host, code]);
      } catch (error) {
        fail(`${ name }/${ host }/transform`, error.stack);
      }
    }
    for (const [host, code] of outputs) {
      for (const lower of host === 'native' ? [false] : [false, true]) {
        const plugins = [requireBabel.resolve('@babel/plugin-transform-typescript')];
        if (lower) plugins.push(requireBabel.resolve('@babel/plugin-transform-object-rest-spread'),
          requireBabel.resolve('@babel/plugin-transform-destructuring'), requireBabel.resolve('@babel/plugin-transform-optional-chaining'),
          requireBabel.resolve('@babel/plugin-transform-class-properties'));
        const output = (await transformAsync(code, { configFile: false, babelrc: false, filename: 'input.ts', plugins })).code;
        const file = path.join(directory, `case-${ serial++ }.mjs`);
        await fs.writeFile(file, output);
        for (const strip of host === 'native' || item.nativeOnly ? [false] : [false, true]) {
          const value = strip && Object.hasOwn(item, 'stripped') ? item.stripped : want;
          const expected = `OK|${ JSON.stringify(value) }|${ JSON.stringify(effects) }`;
          check(`${ name }/${ host }/${ lower }/${ strip }/runtime`, await runInWorker(file, { strip }), expected);
        }
      }
    }
  }
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
finish();
