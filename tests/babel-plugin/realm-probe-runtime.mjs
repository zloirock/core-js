// Realm probes keep their source receiver, independent of key spelling and local names.
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
const { check, checkTruthy, finish } = createChecker('realm-probe-runtime', { tsc: 'Type assertions wrap dynamic realm probes; runtime is checked after stripping types.' });
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'realm-probe-'));
let count = 0;

const cases = [
  ['wrapped-root-cast', 'return (({ entries, other }) => [typeof entries, typeof other])((globalThis as any).window?.self.Object);', ['function', 'undefined'], true],
  ['wrapped-root-nonnull', 'return (({ entries, other }) => [typeof entries, typeof other])((globalThis!).window?.self.Object);', ['function', 'undefined'], true],
  ['wrapped-root-satisfies',
    'return (({ entries, other }) => [typeof entries, typeof other])((globalThis satisfies any).window?.self.Object);', ['function', 'undefined'], true],
  ['wrapped-root-parens', 'return (({ entries, other }) => [typeof entries, typeof other])((globalThis).window?.self.Object);', ['function', 'undefined']],
  ['wrapped-root-sequence',
    'return (({ entries, other }) => [typeof entries, typeof other])((note(), globalThis as any).window?.self.Object);', ['function', 'undefined'], true, ['prefix']],
  ['alias-dotted', 'const w = globalThis.window; return typeof w.Promise.resolve;', 'function'],
  ['alias-literal', 'const w = globalThis.window; return typeof w["Promise"].resolve;', 'function'],
  ['alias-const', 'const P = "Promise"; const w = globalThis.window; return typeof w[P].resolve;', 'function'],
  ['alias-hop-literal', 'const w = globalThis.window; return typeof w["self"]["Promise"].resolve;', 'function'],
  ['alias-hop-template', 'const w = globalThis.window; return typeof w[`self`][`Promise`].resolve;', 'function'],
  ['alias-hop-const', 'const S = "self", P = "Promise"; const w = globalThis.window; return typeof w[S][P].resolve;', 'function'],
  ['sealed-native-const', 'const A = "Array"; const { from } = globalThis.window?.[A]; return from([3])[0];', 3],
  ['sealed-const-leaf', 'const P = "Promise"; return typeof (globalThis.window?.[P]).resolve;', 'function'],
  ['sealed-const-reader', 'const P = "Promise"; return typeof (globalThis.window?.self)[P]?.resolve;', 'function'],
  ['sealed-literal-reader', 'return typeof (globalThis.window?.self)["Promise"]?.resolve;', 'function'],
  ['shadowed-array', 'function f(Array) { return (globalThis.window?.Array).from([3])[0]; } return f();', 3],
  ['shadowed-number', 'let Number; return (globalThis.window?.Number).isInteger(3);', true],
  ['shadowed-math', 'function f(Math) { return (globalThis.window?.Math).trunc(3.5); } return f();', 3],
  ['shadowed-destructure', 'function f(Array) { const { from } = globalThis.window?.Array; return from([3])[0]; } return f();', 3],
  ['shadowed-prefix', 'function f(Array) { return ((note(), globalThis.window)?.Array).from([3])[0]; } return f();', 3, false, ['prefix']],
  ['shadowed-constructor-control', 'function f(Promise) { return typeof (globalThis.window?.Promise).resolve; } return f();', 'function'],
  ['shadowed-hop', 'function f(Array) { return (globalThis.window?.self.Array).from([3])[0]; } return f();', 3],
  ['effectful-key', 'function f(Array) { const { from } = globalThis.window?.[(note(), "Array")]; return from([3])[0]; } return f();', 3, false, [], ['prefix']],
  ['literal-line-separator', 'const { Array: { from, "x\\u2028y": other } } = globalThis.window; return [from([3])[0], typeof other];', [3, 'undefined']],
  ['literal-paragraph-separator', 'const { Array: { from, "x\\u2029y": other } } = globalThis.window; return [from([3])[0], typeof other];', [3, 'undefined']],
];

async function runCase([name, body, expected, typescript = false, events = [], branchEvents = []]) {
  const source = scenarioSource(`export function read() { ${ body } }`);
  const filename = typescript ? 'input.ts' : 'input.mjs';
  for (const method of ['usage-global', 'usage-pure']) {
    const options = { method, version: '4.0', targets: { ie: 11 } };
    const outputs = [['native', source]];
    try {
      outputs.push(['babel', (await transformAsync(source, {
        filename, configFile: false, babelrc: false,
        parserOpts: { createParenthesizedExpressions: true, plugins: typescript ? ['typescript'] : [] },
        plugins: [[babelPlugin, options]],
      })).code]);
      const plugin = createUnplugin(options);
      outputs.push(['unplugin', createUnplugin(options).transform(source, filename)?.code ?? source]);
      const pre = plugin.transform(source, filename, 'pre')?.code ?? source;
      outputs.push(['pre+post', plugin.transform(pre, filename, 'post')?.code ?? pre]);
    } catch (error) {
      check(`${ name }/${ method }/transform`, error.message, 'no error');
      continue;
    }
    check(`${ name }/${ method }/import parity`, JSON.stringify([...importSet(outputs[2][1])].sort()),
      JSON.stringify([...importSet(outputs[1][1])].sort()));
    check(`${ name }/${ method }/phase imports`, JSON.stringify([...importSet(outputs[3][1])].sort()),
      JSON.stringify([...importSet(outputs[2][1])].sort()));
    checkTruthy(`${ name }/${ method }/polyfill present`, importSet(outputs[1][1]).size > 0);
    for (const [host, printed] of outputs) {
      check(`${ name }/${ method }/${ host }/legacy string spelling`, /[\u2028\u2029]/.test(printed), false);
      // Print, parse, strip types and lower optionals before executing the actual output.
      const { code } = await transformAsync(printed, {
        filename, configFile: false, babelrc: false,
        plugins: [
          ...typescript ? [requireBabel.resolve('@babel/plugin-transform-typescript')] : [],
          requireBabel.resolve('@babel/plugin-transform-optional-chaining'),
        ],
      });
      for (const present of [false, true]) {
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, `${ code }
const root = Function('return this')();
${ present ? 'root.window = root;' : 'delete root.window;' }
export const effects = [];
function note() { effects[effects.length] = 'prefix'; }
export let r;
try { r = read(); } catch (error) { r = error.name; }`);
        const wanted = `OK|${ JSON.stringify(present ? expected : 'TypeError') }|${ JSON.stringify(present ? [...events, ...branchEvents] : events) }`;
        check(`${ name }/${ method }/${ host }/${ present }/full`, await runInWorker(file, { strip: false }), wanted);
        if (host === 'native') continue;
        check(`${ name }/${ method }/${ host }/${ present }/stripped`, await runInWorker(file, {
          stripGlobals: ['Promise', 'globalThis', 'self'], nativeAlias: false,
        }), wanted);
      }
    }
  }
}
try {
  for (const item of cases) await runCase(item);
} finally {
  await fs.remove(DIR);
}
finish();
