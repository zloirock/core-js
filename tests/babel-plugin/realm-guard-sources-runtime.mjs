/* eslint-disable max-depth -- Enumerate independent method, emitter, host and stripped-realm axes. */
// Keep environment guards while serving the leaf; a user property is no realm.
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
const { check, finish } = createChecker('realm-guard-sources-runtime');
const cases = [
  ['call', 'function get() { effects.push("call"); return globalThis.window; } return get()?.Array?.from([3]);', [3], ['call']],
  ['call-store',
    'function get() { effects.push("call"); return globalThis.window; } let held; const value = (held = get())?.Object?.hasOwn({ x: 1 }, "x"); return [value, held === undefined];',
    [true, false], ['call'], [undefined, true]],
  ['call-probe', 'function get() { effects.push("call"); return globalThis; } return get().window?.Array?.from([3]);', [3], ['call']],
  ['iife', 'return (() => globalThis.window)()?.Array?.from([3]);', [3]],
  ['conditional', 'return (choice ? globalThis : self).window?.Array.from([3]);', [3]],
  ['conditional-alias', 'const g = globalThis; const held = choice ? g : globalThis; return held.window?.Array.from([3]);', [3]],
  ['conditional-effect', 'return ((effects.push("test"), choice) ? globalThis : self).window?.Array.from([3]);', [3], ['test']],
  ['conditional-alias-chain', 'const g = globalThis; const held = choice ? g : globalThis; const copied = held; return copied.window?.Array.from([3]);', [3]],
  ['conditional-store', 'const g = globalThis; let held; return (held = choice ? g : globalThis).window?.Array.from([3]);', [3], [], undefined, undefined, [], {}, true],
  ['call-return-read', 'return typeof (() => globalThis)().window?.self?.Promise.race;', 'function', [], 'undefined'],
  ['sequence-root', 'return typeof (effects.push("prefix"), globalThis).window?.self?.Object.groupBy;', 'function', ['prefix'], 'undefined'],
  ['entryless', 'return typeof globalThis.window?.global?.Object.groupBy;', 'function', [], 'undefined'],
  ['entryless-optional-owner', 'return typeof globalThis.window?.global?.Object?.groupBy;', 'function', [], 'undefined'],
  ['entryless-optional-constructor', 'return typeof globalThis.window?.global?.Iterator?.from;', 'function', [], 'undefined'],
  ['sealed', 'return typeof (globalThis.window?.self)?.Object?.groupBy;', 'function', [], 'undefined'],
  ['sealed-native', 'return typeof (globalThis.window?.self)?.Object?.groupBy;', 'function', [], 'undefined', { chrome: '100' }],
  ['native-hop', 'return typeof globalThis.window?.self?.Object.groupBy;', 'function', [], 'undefined', { chrome: '100' }],
  ['call-native-constructor', 'function get() { return globalThis.window; } return typeof get()?.Promise?.withResolvers;', 'function', [], 'undefined', { chrome: '100' }],
  ['leaf-effects',
    'function get() { effects.push("call"); return globalThis.window; } return get()?.Array?.[(effects.push("key"), "from")]((effects.push("argument"), [3]));',
    [3], ['call'], undefined, undefined, ['key', 'argument']],
  ['user-static', 'function get() { effects.push("call"); return globalThis.lib; } return get().self.Array.from([3]);', ['user', 3], ['call', 'self', 'from'], ['user', 3]],
  ['user-window', 'function get() { effects.push("call"); return globalThis.lib; } return get().window.X;', 41, ['call', 'window'], 41],
  ['user-static-direct', 'function get() { return globalThis.lib; } return get().self.Array.from([3]);', ['user', 3], ['self', 'from'], ['user', 3]],
  ['user-window-direct', 'function get() { return globalThis.lib; } return get().window.X;', 41, ['window'], 41],
  ['real-realm', 'function get() { effects.push("call"); return globalThis.self; } return get().Array.from([3]);', [3], ['call'], [3]],
  ['excluded-self-seal', 'return (globalThis.self?.Array).from([3]);', [3], [], 'TypeError', undefined, [], { exclude: ['self'] }],
  ['excluded-self-optional', 'return globalThis.self?.Array?.from([3]);', [3], [], undefined, undefined, [], { exclude: ['self'] }],
];
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const directory = await fs.mkdtemp(path.join(tmp, 'realm-guard-sources-'));
let serial = 0;
try {
  for (const [name, body, present, events = [], absent, targets = { ie: 11 }, branchEvents = [], extra = {}, nativeStore = false] of cases) {
    const source = scenarioSource(`export const effects = []; export function read(choice) { ${ body } }`);
    for (const method of ['usage-global', 'usage-pure']) {
      const options = { method, version: '4.0', targets, ...extra };
      if (extra.exclude && method === 'usage-global') options.exclude = ['web.self'];
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
            ${ hasWindow ? 'root.window = root;' : 'delete root.window;' }
            const mod = await import(${ JSON.stringify(pathToFileURL(module).href) });
            ${ extra.exclude ? `root.self = ${ hasWindow ? 'root' : 'undefined' };` : '' }
            root.lib = { get self() { mod.effects.push('self'); return { Array: { from(xs) { mod.effects.push('from'); return ['user', xs[0]]; } } }; },
              get window() { mod.effects.push('window'); return { X: 41 }; } };
            export const effects = mod.effects;
            export let r;
            try { r = mod.read(${ hasWindow }); } catch (error) { r = error.name; }`);
          // A stored conditional remains a native read in pure; retain its full
          // semantics and its absent-host stripped control, without claiming support.
          for (const strip of host === 'native' || nativeStore && method === 'usage-pure' && hasWindow ? [false] : [false, true]) {
            const expected = hasWindow ? present : absent;
            const wanted = `OK|${ serialize(expected) }|${ serialize(hasWindow ? [...events, ...branchEvents] : events) }`;
            check(`${ name }/${ method }/${ host }/${ hasWindow }/${ strip }`,
              await runInWorker(file, { strip, stripGlobals: targets.chrome ? [] : ['Iterator', 'globalThis'] }), wanted);
          }
        }
      }
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
