// Source facts survive cloned call slots; private and public method keys remain distinct.
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
const { check, finish } = createChecker('callee-source-facts-runtime');
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'callee-source-facts-'));
let count = 0;

const cases = [
  ['private-array-parameter', 'class F { static #c(C) { return C.from([3]); } static run() { return F.#c(Array); } } r = F.run();', [], '', [3]],
  ['private-iterator', 'class K { static #iterator() { return Iterator; } static run() { return K.#iterator().from([1]); } } r = [...K.run()];', [], '', [1]],
  ['private-method',
    'class F { static #c() { effects.push("callee"); return Promise; } static run() { return typeof F.#c().withResolvers; } } r = F.run();', ['callee'], '', 'function'],
  ['private-field',
    'class F { static #c = () => Promise; static run() { return typeof F.#c().withResolvers; } } r = F.run();', [], '', 'function'],
  ['private-field-written',
    'class F { static #c = () => Array; static run() { F.#c = () => ({ from() { effects.push("custom"); return 17; } }); '
    + 'return F.#c().from([3]); } } r = F.run();', ['custom'], '', 17],
  ['private-parameter-alias',
    'class F { static #c(C) { return C.from([3]); } static run() { const Alias = F; return Alias.#c(Array); } } r = F.run();', [], '', [3]],
  ['private-parameter',
    'class F { static #c(P) { return typeof P.allSettled; } static run() { return F.#c(Promise); } } r = F.run();', [], '', 'function'],
  ['private-pattern',
    'class F { static #c({ C }) { return typeof C.allSettled; } static run() { return F.#c({ C: Promise }); } } r = F.run();', [], '', 'function'],
  ['private-in-push',
    'const out = []; class F { static #c() { effects.push("callee"); return Array; } static run() { '
    + 'out.push(F.#c().from((effects.push("arg"), [3]))); } } F.run(); r = out;', ['callee', 'arg'], '', [[3]]],
  ['public-private-same-key',
    'class F { static #c() { return { withResolvers: 17 }; } static ["#c"]() { return Promise; } static run() { return '
    + '[F.#c().withResolvers, typeof F["#c"]().withResolvers]; } } r = F.run();', [], '', [17, 'function']],
  ['private-public-same-key',
    'class F { static ["#c"]() { return { withResolvers: 17 }; } static #c() { return Promise; } static run() { return [typeof '
    + 'F.#c().withResolvers, F["#c"]().withResolvers]; } } r = F.run();', [], '', ['function', 17]],
  ['private-wrong-brand',
    'class F { static #c() { return Promise; } static run() { return G.#c().withResolvers; } } class G extends F {} try { F.run(); } catch '
    + '(error) { r = error.name; }', [], '', 'TypeError'],
  ['member-push',
    'const out = []; const o = { make() { effects.push("callee"); return Array; } }; out.push(o.make().from((effects.push("arg"), [3]))); r '
    + '= out;', ['callee', 'arg'], '', [[3]]],
  ['member-map',
    'const o = { make() { effects.push("callee"); return Array; } }; r = [3, 4].map(x => o.make().from([x]));', ['callee', 'callee'], '', [[3], [4]]],
  ['member-spread',
    'const out = []; const o = { make() { effects.push("callee"); return Array; } }; out.push(...o.make().from([3])); r = out;', ['callee'], '', [3]],
  ['member-loop',
    'const out = []; const o = { make() { return Array; } }; for (const x of [3, 4]) out.push(o.make().from([x])); r = out;', [], '', [[3], [4]]],
  ['member-optional',
    'const out = []; const o = { make() { return Array; } }; out.push(o.make()?.from([3])); r = out;', [], '', [[3]]],
  ['member-write',
    'const out = []; const o = { make() { return Array; } }; o.make = () => ({ from() { effects.push("custom"); return 17; } }); '
    + 'out.push(o.make().from([3])); r = out;', ['custom'], '', [17]],
  ['parameter-push',
    'const out = []; out.push(((C) => C.from((effects.push("arg"), [3])))(Array)); r = out;', ['arg'], '', [[3]]],
  ['parameter-narrow',
    'const out = []; out.push(((P) => P.allSettled)(Promise)); r = typeof out[0];', [], '', 'function'],
  // Literal-wrapper destructuring stays native; the missing native method still throws.
  ['parameter-pattern',
    'const out = []; out.push((({ C }) => C.from([3]))({ C: Array })); r = out;', [], '', [[3]], '', 'native-pattern'],
  ['parameter-written',
    'const out = []; out.push(((C) => { C = { from() { effects.push("custom"); return 17; } }; return C.from([3]); })(Array)); r = out;', ['custom'], '', [17]],
  ['parameter-shadow',
    'const out = []; out.push(((C) => { function read(C) { return C.from(); } return read({ from() { effects.push("custom"); return 17; } '
    + '}); })(Array)); r = out;', ['custom'], '', [17]],
];

try {
  for (const [name, body, effects = [], setup = '', result = 'function', consumer = '', pureStripped = result] of cases) {
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
      if (name === 'private-parameter' && method === 'usage-pure') {
        for (const [host, output] of [['babel', babel], ['unplugin', single], ['pre+post', post]]) {
          check(`${ name }/${ host }/narrow constructor`, [...importSet(output)].some(entry => entry.endsWith('/promise/constructor')), true);
          check(`${ name }/${ host }/no redundant namespace`, [...importSet(output)].some(entry => entry.endsWith('/promise')), false);
        }
      }
      check(`${ name }/${ method }/phase imports`, JSON.stringify([...importSet(post)].sort()), JSON.stringify([...importSet(single)].sort()));
      for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', single], ['pre+post', post]]) {
        if (host === 'native' && method === 'usage-pure') continue;
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, `${ setup }\n${ output }\n${ consumer }`);
        const expected = `OK|${ JSON.stringify(result) }|${ JSON.stringify(effects) }`;
        check(`${ name }/${ method }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`${ name }/${ method }/${ host }/stripped`, await runInWorker(file),
          method === 'usage-pure' && pureStripped === 'native-pattern' ? 'ERR|TypeError'
            : `OK|${ JSON.stringify(method === 'usage-pure' ? pureStripped : result) }|${ JSON.stringify(effects) }`);
      }
    }
  }
} finally {
  await fs.remove(DIR);
}

finish();
