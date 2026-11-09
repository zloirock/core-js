// Declining a surrounding claim must leave its live realm root available for rewriting.
// Anchored patterns own their receiver independently of a claim on that root.
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
const { check, finish } = createChecker('realm-claim-runtime');
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'realm-claim-'));
let count = 0;

try {
  for (const [name, targets, body, expected, events, globals = ['globalThis'], extra = {}] of [
    ['native-symbol-key', { node: 18 }, 'return [3][self.Symbol.iterator]().next().value;', 3, [], ['self']],
    ['native-symbol-tag', { firefox: 64 }, 'return ({ [Symbol.toStringTag]: "tag" })[globalThis.Symbol.toStringTag];', 'tag', []],
    ['native-symbol-write', { node: 18 }, 'const box = {}; box[self.Symbol.iterator] = () => 3; return box[Symbol.iterator]();', 3, [], ['self']],
    ['native-symbol-tag-call', { node: 18 }, 'const box = { [Symbol.iterator]() { return this === box; } }; return box[self.Symbol.iterator]`tag`;', true, [], ['self']],
    ['native-symbol-delete', { firefox: 64 }, `const box = { [Symbol.toStringTag]: "tag" };
      delete box[globalThis.Symbol.toStringTag]; return Symbol.toStringTag in box;`, false, []],
    ['excluded-iterator', { ie: 11 }, 'return [3][self.Symbol.iterator]().next().value;', 3, [], ['self'], { exclude: ['get-iterator', 'get-iterator-method'] }],
    ['included-iterator-tag', { node: 18 }, `const box = { [Symbol.iterator]() { return this === box; } };
      return box[self.Symbol.iterator]\`tag\`;`, true, [], ['self'], { include: ['get-iterator-method'] }],
    ['included-iterator-super', { node: 18 }, `class Base { [Symbol.iterator]() { return this instanceof Child ? 31 : 0; } }
      class Child extends Base { read() { return super[self.Symbol.iterator](); } }
      return new Child().read();`, 31, [], ['self'], { include: ['get-iterator'] }],
    ['native-root-symbol-receiver', { node: 18 }, 'return globalThis.self[Symbol.iterator]();', 17, ['iterator'], ['self']],
    ['call-standdown', { firefox: 64 }, 'return (() => globalThis)().window?.self?.Promise.race;', 'undefined', []],
    ['sequence-standdown', { firefox: 64 }, 'return (effects.push("prefix"), globalThis).window?.self?.Object.groupBy;', 'undefined', ['prefix']],
    ['sealed-root', { ie: 11 }, 'return (globalThis?.window).document;', 23, []],
    ['sealed-prefix', { ie: 11 }, 'return ((effects.push("prefix"), globalThis)?.window).document;', 23, ['prefix']],
    ['dead-middle-guard', { ie: 11 }, 'return globalThis.self?.window.document;', 23, []],
    ['dead-repeated-guard', { ie: 11 }, 'return globalThis.self?.self.document;', 23, []],
    ['native-root-constructor', { chrome: 100 }, 'const { Set: { prototype: { union } } } = globalThis; return union.call(new Set([1]), new Set([2])).size;', 2, [], []],
    ['native-root-iterator', { node: 18 }, `const { Iterator: { prototype: { flatMap } } } = globalThis;
      return flatMap.call([1].values(), x => [x, x + 1]).next().value;`, 1, [], ['Iterator']],
    ['native-root-weak-map', { node: 18 }, 'const { WeakMap: { prototype: { has } } } = globalThis; const key = {}; return has.call(new WeakMap([[key, 1]]), key);', true, [], []],
    ['alias-pattern', { ie: 11 }, `const realm = globalThis;
      const { globalThis: { Array: { prototype: { at, includes } } } } = realm;
      return [at.call([3, 4], -1), includes.call([3], 3)];`, [4, true], []],
    ['loop-pattern', { ie: 11 }, `const result = []; for (const realm of [globalThis]) {
      const { globalThis: { Array: { prototype: { at, includes } } } } = realm;
      result.push(at.call([3, 4], -1), includes.call([3], 3)); } return result;`, [4, true], []],
    ['prefixed-pattern', { ie: 11 }, `const realm = globalThis;
      const { globalThis: { Array: { prototype: { at, includes } } } } = (effects.push("prefix"), realm);
      return [at.call([3, 4], -1), includes.call([3], 3)];`, [4, true], ['prefix']],
    ['assigned-pattern', { ie: 11 }, `const realm = globalThis; let at, includes;
      ({ globalThis: { Array: { prototype: { at, includes } } } } = realm);
      return [at.call([3, 4], -1), includes.call([3], 3)];`, [4, true], []],
    ['shadowed-pattern', { ie: 11 }, 'const globalThis = { Set: { prototype: { union: () => 9 } } }; const { Set: { prototype: { union } } } = globalThis; return union();', 9, []],
    ['disabled-pattern', { ie: 11 }, `// core-js-disable-next-line
      const { Set: { prototype: { union } } } = globalThis;
      return union === Function("return this")().Set.prototype.union;`, true, [], []],
  ]) {
    const source = `export function read() { ${ body } }`;
    scenarioSource(source);
    const options = { method: 'usage-pure', version: '4.0', targets, ...extra };
    const { code: babel } = await transformAsync(source, {
      configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
    });
    const plugin = createUnplugin(options);
    const unplugin = plugin.transform(source, 'input.mjs')?.code ?? source;
    const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
    const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
    for (const [host, output] of [['babel', babel], ['unplugin', unplugin], ['pre+post', post]]) {
      const { code: lowered } = await transformAsync(output, {
        configFile: false, babelrc: false, plugins: [requireBabel.resolve('@babel/plugin-transform-optional-chaining')],
      });
      for (const [stage, code] of [['printed', output], ['lowered', lowered]]) {
        // Set up the host outside the transformed source, so these writes do not disable
        // the claim. Each worker has its own module cache and realm.
        const exercise = `
export const effects = [];
const root = Function("return this")();
root.window = ${ name.includes('standdown') ? 'null' : 'root' };
root.document = 23;
root[Symbol.iterator] = function () { effects.push(this === root ? "iterator" : "wrong-this"); return 17; };
const value = read();
export const r = value === undefined ? "undefined" : value;`;
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, code + exercise);
        const wanted = `OK|${ JSON.stringify(expected) }|${ JSON.stringify(events) }`;
        check(`${ name }/${ host }/${ stage }/full`, await runInWorker(file, { strip: false, nativeAlias: false }), wanted);
        // Only globals missing on this target are removed. The manifest also removes
        // method natives, exposing an unserved constructor/prototype receiver.
        check(`${ name }/${ host }/${ stage }/stripped`, await runInWorker(file, {
          stripGlobals: globals, nativeAlias: false,
        }), wanted);
      }
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();
