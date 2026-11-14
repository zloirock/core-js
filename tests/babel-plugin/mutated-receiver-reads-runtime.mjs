// A consumed navigation reads its live source once; later writes cannot widen an earlier read.
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
const { check, finish } = createChecker('mutated-receiver-reads-runtime');
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'mutated-receiver-reads-'));
let count = 0;

const foreign = `const flag = false; const other = {}; const runtimeRealm = Function('return this')();
  const foreign = { get Array() { effects.push('Array'); return {
    get prototype() { effects.push('prototype'); return Array.prototype; }
  }; } };
  const custom = { get Array() { effects.push('Array'); return { get prototype() { effects.push('prototype'); return {
    get at() { effects.push('at'); runtimeRealm.self = {}; return function () { return 17; }; },
    get includes() { effects.push('includes'); return function () { return 23; }; },
    get extra() { effects.push('extra'); return 31; }
  }; } }; } };`;
const cases = [
  ['declaration', 'globalThis.self = foreign; const { prototype: { at } } = self.Array; r = at.call([3, 4], -1);', 4, ['Array', 'prototype']],
  ['assignment', 'globalThis.self = foreign; let at; ({ prototype: { at } } = self.Array); r = at.call([3, 4], -1);', 4, ['Array', 'prototype']],
  ['identifier-root', 'globalThis.self = foreign; const { Array: { prototype: { at } } } = self; '
    + 'r = at.call([3, 4], -1);', 4, ['Array', 'prototype']],
  ['rewritten-rhs', 'globalThis.self = foreign; let at; ({ prototype: { at } } = (effects.push("prefix"), globalThis.self.Array)); '
    + 'r = at.call([3, 4], -1);', 4, ['prefix', 'Array', 'prototype']],
  ['bodyless', 'globalThis.self = foreign; let at; if (!flag) ({ prototype: { at } } = self.Array); r = at.call([3, 4], -1);', 4, ['Array', 'prototype']],
  ['sequence', 'globalThis.self = foreign; let at; (({ prototype: { at } } = self.Array), effects.push("after")); '
    + 'r = at.call([3, 4], -1);', 4, ['Array', 'prototype', 'after']],
  ['default', 'globalThis.self = foreign; const { prototype: { at = () => 17 } } = self.Array; r = at.call([3, 4], -1);', 4, ['Array', 'prototype']],
  ['for-init', 'globalThis.self = foreign; for (const { prototype: { at } } = self.Array; !r;) r = at.call([3, 4], -1);', 4, ['Array', 'prototype']],
  ['cloned-body', 'globalThis.self = foreign; const out = []; for (const value of [3]) { const { prototype: { at } } = self.Array; '
    + 'out.push(at.call([value], 0)); } r = out;', [3], ['Array', 'prototype']],
  ['null-receiver', 'globalThis.self = null; try { const { prototype: { at } } = self.Array; r = at; } catch (error) { r = error.name; }', 'TypeError', []],
  ['assignment-null', 'globalThis.self = null; let at; try { ({ prototype: { at } } = self.Array); } catch (error) { r = error.name; }', 'TypeError', []],
  ['iterator-null', 'globalThis.self = { inner: null }; try { const { inner: { [Symbol.iterator]: method } } = self; r = method; } '
    + 'catch (error) { r = error.name; }', 'TypeError', []],
  ['iterator-assignment-null', 'globalThis.self = { inner: null }; let method; try { ({ inner: { [Symbol.iterator]: method } } = self); } '
    + 'catch (error) { r = error.name; }', 'TypeError', []],
  ['sibling-getter', 'globalThis.self = custom; const { prototype: { at, includes, extra } } = self.Array; r = [at(), includes(), extra];',
    [17, 23, 31], ['Array', 'prototype', 'at', 'includes', 'extra']],
  ['sibling-assignment', 'globalThis.self = custom; let at, includes, extra; ({ prototype: { at, includes, extra } } = self.Array); '
    + 'r = [at(), includes(), extra];', [17, 23, 31], ['Array', 'prototype', 'at', 'includes', 'extra']],
  ['computed-hop', 'globalThis.self = custom; const { [(effects.push("key"), "prototype")]: { at } } = self.Array; r = at();',
    17, ['Array', 'key', 'prototype', 'at']],
  ['prefix-assignment', 'globalThis.self = foreign; let at; ({ prototype: { at } } = (effects.push("prefix"), self.Array)); '
    + 'r = at.call([3, 4], -1);', 4, ['prefix', 'Array', 'prototype']],
  ['early-keys', 'r = Object.keys({ a: 1 }).at(0); if (flag) globalThis.Object = other;', 'a', [], 'array/instance/at'],
  ['early-inert', 'const box = { read() { return [3]; } }; Object.keys(box); r = box.read().at(0); '
    + 'if (flag) globalThis.Object = other;', 3, [], 'array/instance/at'],
  ['early-atob', 'r = atob("YWI=").at(-1); if (flag) globalThis.atob = other;', 'b', [], 'string/instance/at'],
  ['early-alias', 'const from = Array.from; r = from([3]).at(0); if (flag) globalThis.Array = other;', 3, [], 'array/instance/at'],
  ['early-pattern-alias', 'const { from } = Array; r = from([3]).at(0); if (flag) globalThis.Array = other;', 3, [], 'array/instance/at'],
  ['early-property', 'r = Number.MAX_SAFE_INTEGER.toString().at(0); if (flag) globalThis.Number = other;', '9', [], 'string/instance/at'],
  ['early-prototype', 'const proto = { at: 13 }; r = Object.create(proto).at; if (flag) globalThis.Object = other;', 13, []],
  ['deferred', 'function read() { return Object.keys({ a: 1 }).at(0); } globalThis.Object = { keys() { return "bc"; } }; '
    + 'r = read();', 'b', [], 'instance/at'],
  ['shadow', 'const self = foreign; const { prototype: { at } } = self.Array; r = at.call([3, 4], -1);', 4, ['Array', 'prototype']],
  ['rebound-local', 'let list = [3]; Object.defineProperty(list, "at", { get() { effects.push("at"); list = []; return () => 17; } }); '
    + 'Object.defineProperty(list, "flat", { get() { effects.push("flat"); return () => 23; } }); '
    + 'const { at, flat } = list; r = [at(), flat()];', [17, 23], ['at', 'flat']],
];

try {
  for (const [name, body, result, effects, typedEntry] of cases) {
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
      check(`${ name }/${ method }/phase imports`, JSON.stringify([...importSet(post)].sort()), JSON.stringify([...importSet(single)].sort()));
      for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', single], ['pre+post', post]]) {
        if (host === 'native' && method === 'usage-pure') continue;
        if (host !== 'native' && method === 'usage-pure' && typedEntry) {
          check(`${ name }/${ host }/receiver type`, [...importSet(output)].some(entry => entry.endsWith(`/${ typedEntry }`)), true);
        }
        if (name === 'early-prototype') {
          check(`${ host }/${ method }/known own value`, [...importSet(output)].some(entry => entry.endsWith('/instance/at')), false);
        }
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, `${ foreign }\n${ output }`);
        const expected = `OK|${ JSON.stringify(result) }|${ JSON.stringify(effects) }`;
        check(`${ name }/${ method }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`${ name }/${ method }/${ host }/stripped`, await runInWorker(file), expected);
      }
    }
  }
} finally {
  await fs.remove(DIR);
}

finish();
