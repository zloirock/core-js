/* eslint-disable max-depth -- Cross the emitter, method, host and stripped-realm boundaries. */
// A discarded realm read keeps its exception and every effect in source order.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';
import { importSet } from '../transpiler-differential/harness.mjs';
import { serialize } from '../transpiler-differential/serialize.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('realm-probe-effects-runtime');
const cases = [
  ['read', 'return typeof (effects.push("prefix"), globalThis).window.Promise.resolve;', 'function', ['prefix']],
  ['declaration', 'const { resolve } = (effects.push("prefix"), globalThis).window.Promise; return typeof resolve;', 'function', ['prefix']],
  ['assignment', 'let resolve; ({ resolve } = (effects.push("prefix"), globalThis).window.Promise); return typeof resolve;', 'function', ['prefix']],
  ['store', 'let held; return typeof (held = globalThis.self).window.Promise.resolve;', 'function'],
  ['store-declaration', 'let held; const { resolve } = (held = globalThis.self).window.Promise; return typeof resolve;', 'function'],
  ['user-argument', 'function id(value) { return value; } return typeof id((effects.push("prefix"), globalThis).window.Promise.resolve);', 'function', ['prefix']],
  ['new-argument',
    'class Box { constructor(value) { this.value = value; } } return typeof new Box((effects.push("prefix"), globalThis).window.Promise.resolve).value;', 'function', ['prefix']],
  ['user-prototype-call', 'return (x => globalThis)(Number.parseFloat("1.5")).window.Set.prototype.has.call(new Set([1]), 1);', true],
  ['user-imported-helper', 'return typeof name((effects.push("prefix"), globalThis).window.Promise);', 'string', ['prefix'], 'TypeError',
    'import name from "@core-js/pure/actual/function/instance/name";'],
  ['inline-backed-member', 'return typeof (() => { effects.push("prefix"); return globalThis.self; })().window.Map.name;', 'string', ['prefix']],
  ['user-member', 'return typeof ((effects.push("prefix"), globalThis).window.Promise.resolve).name;', 'string', ['prefix']],
  ['instance-call', 'return (effects.push("prefix"), globalThis).window.Array.from([3]).at(-1);', 3, ['prefix']],
  ['nested-prefix', 'const { resolve } = (effects.push("a"), (effects.push("b"), globalThis.window))?.Promise; return typeof resolve;', 'function', ['a', 'b']],
  ['nested-prefix-read', 'return typeof ((effects.push("a"), (effects.push("b"), globalThis.window))?.Promise).resolve;', 'function', ['a', 'b']],
  ['nested-prefix-assignment', 'let resolve; ({ resolve } = (effects.push("a"), (effects.push("b"), globalThis.window))?.Promise); return typeof resolve;', 'function', ['a', 'b']],
  ['alias-prefix', 'const held = globalThis.window; return typeof ((effects.push("prefix"), held).Promise).resolve;', 'function', ['prefix']],
  ['quiet-call-key', 'function key() { return "self"; } return typeof globalThis[key()].Promise.resolve;', 'function', [], 'function'],
  ['quiet-identity-key', 'const key = value => value; return globalThis[key("self")].Array.from([3]);', [3], [], [3]],
  ['quiet-optional-key', 'function key() { return "self"; } return typeof globalThis[key()]?.Promise;', 'function', [], 'function'],
  ['shadow', 'const globalThis = { window: { Promise: { resolve: 31 } } }; return globalThis.window.Promise.resolve;', 31, [], 31],
  ['effectful-key', 'function key() { effects.push("key"); return "self"; } return globalThis[key()].Math.abs(-3);', 3, ['key'], 3],
  ['throwing-key', 'function key() { effects.push("key"); throw new RangeError(); } return globalThis[key()].Math.abs(-3);', 'RangeError', ['key'], 'RangeError'],
  ['changed-key', 'let key = () => "self"; key = () => "Math"; return globalThis[key()].abs(-3);', 3, [], 3],
  ['observed-store',
    'let held; try { const { resolve } = (held = globalThis.self).window.Promise; '
    + 'return [typeof resolve, held === globalThis.self]; } catch (error) { return [error.name, held === globalThis.self]; }', ['function', true], [], ['TypeError', true]],
  ['two-prefix-levels', 'const held = globalThis.window; return typeof ((effects.push("a"), (effects.push("b"), held).self).Promise).resolve;', 'function', ['a', 'b']],
];
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const directory = await fs.mkdtemp(path.join(tmp, 'realm-probe-effects-'));
let serial = 0;
try {
  for (const [name, body, present, events = [], absent = 'TypeError', setup = ''] of cases) {
    const source = scenarioSource(`${ setup } export const effects = []; export function read() { ${ body } }`);
    for (const method of ['usage-global', 'usage-pure']) {
      const options = { method, version: '4.0', targets: { ie: 11 } };
      const outputs = [['native', source]];
      for (const host of ['babel', 'unplugin', 'pre+post']) {
        let code = source;
        if (host === 'babel') code = (await transformAsync(source, {
          configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
          parserOpts: { createParenthesizedExpressions: true },
        })).code;
        else {
          const plugin = createUnplugin(options);
          for (const pass of host === 'pre+post' ? ['pre', 'post'] : ['single']) code = plugin.transform(code, 'input.mjs', pass)?.code ?? code;
        }
        outputs.push([host, code]);
      }
      check(`${ name }/${ method }/imports`, JSON.stringify([...importSet(outputs[1][1])].sort()), JSON.stringify([...importSet(outputs[2][1])].sort()));
      check(`${ name }/${ method }/phase imports`, JSON.stringify([...importSet(outputs[2][1])].sort()), JSON.stringify([...importSet(outputs[3][1])].sort()));
      for (const [host, output] of outputs) {
        const module = path.join(directory, `case-${ serial++ }.mjs`);
        await fs.writeFile(module, output);
        for (const hasWindow of [false, true]) {
          const file = path.join(directory, `case-${ serial++ }.mjs`);
          await fs.writeFile(file, `const root = Function('return this')();
            root.self = root;
            ${ hasWindow ? 'root.window = root;' : 'delete root.window;' }
            const mod = await import(${ JSON.stringify(pathToFileURL(module).href) });
            export const effects = mod.effects;
            export let r;
            try { r = mod.read(); } catch (error) { r = error.name; }`);
          for (const strip of host === 'native' ? [false] : [false, true]) {
            const wanted = `OK|${ serialize(hasWindow ? present : absent) }|${ serialize(events) }`;
            check(`${ name }/${ method }/${ host }/${ hasWindow }/${ strip }`,
              await runInWorker(file, { strip, stripGlobals: ['Promise', 'globalThis'] }), wanted);
          }
        }
      }
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
