// Optional values held by stores or parentheses retain their fallback and throwing
// reads. Lower printed output again to check the meaning of the surviving seals.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transform as lower } from '@swc/core';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('kept-store-seals');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'kept-seals-'));
let count = 0;
const cases = [];

for (const [name, receiver, effects = []] of [
  ['plain', '(globalThis.window?.self)'],
  ['store', '((held = globalThis.window)?.self)'],
  ['nested-store', '((held = other = globalThis.window)?.self)'],
  ['sequence-inside', '(effects.push("prefix"), globalThis.window?.self)', ['prefix']],
  ['sequence-outside', '(effects.push("prefix"), (globalThis.window?.self).self)', ['prefix']],
  ['cast', '(globalThis.window?.self as any)'],
  ['non-null', '(globalThis.window?.self)!'],
  ['satisfies', '(globalThis.window?.self satisfies any)'],
]) {
  const root = name === 'sequence-outside' ? receiver : `${ receiver }.self`;
  cases.push(
    [`${ name }/static`, `return typeof ${ root }?.Promise.resolve;`, 'function', 'TypeError', effects],
    [`${ name }/instance`, `return typeof ${ root }?.Array.prototype.at;`, 'function', 'TypeError', effects],
  );
}
cases.push(
  ['lowered-dispatch', `let memo, value;
const method = (memo = (effects.push("prefix"), ((value = held = globalThis.window) == null ? void 0 : value.self).self))
  == null ? void 0 : memo.Array.prototype.at;
return method.call([3, 5], -1);`, 5, 'TypeError', ['prefix']],
  ['conditional-read', 'return typeof (globalThis.window == null ? void 0 : globalThis).self.Promise.resolve;', 'function', 'TypeError', []],
  ['conditional-reverse', 'return typeof (globalThis.window != null ? globalThis : void 0).self.Promise.resolve;', 'function', 'TypeError', []],
  ['conditional-optional', 'return typeof (globalThis.window == null ? void 0 : globalThis)?.self.Promise.resolve;', 'function', 'undefined', []],
  ['conditional-shadow', `const undefined = { self: { Promise: { resolve: 23 } } };
return typeof (globalThis.window == null ? undefined : globalThis).self.Promise.resolve;`, 'function', 'number', []],
  ['conditional-write', '(globalThis.window == null ? void 0 : globalThis).self = 7; return globalThis[["se", "lf"].join("")];', 7, 'TypeError', []],
  ['conditional-delete', 'return delete (globalThis.window == null ? void 0 : globalThis).self;', true, 'TypeError', []],
  ['conditional-user', 'const user = { self: 23 }; return (globalThis.window == null ? void 0 : user).self;', 23, 'TypeError', []],
  ['window-tail-dispatch', `const rt = () => globalThis;
return (effects.push("prefix"), rt()?.window?.self.window).Array.prototype.includes.call([5], 5);`, true, 'TypeError', ['prefix']],
  ['instance-value', `function use(value) { return typeof value; }
return use((effects.push("prefix"), globalThis.window?.self).self?.Array.prototype.at);`, 'function', 'TypeError', ['prefix']],
  ['sealed-parameter', `function read({ resolve } = ((held = (effects.push("store"), globalThis.window))?.self).Promise) {
  return typeof resolve;
} return read();`, 'function', 'TypeError', ['store']],
  ['store-prototype', 'return typeof ((held = globalThis.window)?.self).Promise.prototype.finally;', 'function', 'TypeError', []],
  ['optional-reader', 'return typeof ((held = globalThis.window)?.self)?.self.Promise.resolve;', 'function', 'undefined', []],
  ['computed-tail', 'return typeof (globalThis.window?.self)[(effects.push("key"), "self")]?.Promise.resolve;', 'function', 'TypeError', ['key']],
  ['argument', '(globalThis.window?.self).self?.Promise.resolve((effects.push("argument"), 1)); return "done";', 'done', 'TypeError', null],
  ['delete', 'return delete (effects.push("prefix"), globalThis.window?.self).self?.Promise.missing;', true, 'TypeError', ['prefix']],
  ['for-of', 'for (const { resolve } of [(effects.push("prefix"), globalThis.window?.self).self?.Promise]) return typeof resolve;', 'function', 'TypeError', ['prefix']],
  ['deep-reader', 'return typeof (globalThis.window?.self).self.self[(effects.push("key"), "guardBoundaryAbsent")];', 'undefined', 'TypeError', null],
  ['window-reader', 'return typeof (globalThis.window?.self).self.window?.[(effects.push("key"), "guardBoundaryAbsent")];', 'undefined', 'TypeError', null],
);
for (const hop of ['', '.self']) cases.push([`lowered-mirror/${ hop || 'direct' }`, `let memo;
const ref = (effects.push("source"), ((memo = globalThis.window) == null ? void 0 : memo.self)${ hop }.Map);
return ref[(effects.push("key"), "groupBy")].length;`, 2, 'TypeError', null]);
for (const operator of ['||', '??']) {
  for (const declaration of ['const { resolve } =', '({ resolve } =']) {
    const close = declaration.startsWith('(') ? ')' : '';
    const body = `${ declaration } (held = (effects.push("store"), globalThis.window))?.Promise ${ operator } (effects.push("fallback"), {})${ close }; return typeof resolve;`;
    cases.push([`fallback/${ operator }/${ declaration }`, body, 'function', 'undefined', null]);
  }
}
// Caller-default slots intentionally synthesize covered keys even on absent hosts.
// Their supplied argument must still win; the default's kept write executes once.
cases.push(['parameter', `function read({ resolve } = (held = (effects.push("store"), globalThis.window))?.self.Promise) {
  return typeof resolve;
} return [read(), read({ resolve: 3 }), held === globalThis.window];`, ['function', 'number', true], ['function', 'number', true], ['store'], true]);

try {
  for (const [name, body, present, absent, effects, callerDefault = false] of cases) {
    const typed = /cast|non-null|satisfies/.test(name);
    const source = scenarioSource(`export const effects = []; let held, other, resolve;
export const r = (() => { try { ${ body } } catch (error) { return error.name; } })();`);
    const filename = typed ? 'input.ts' : 'input.mjs';
    const babel = await transformAsync(source, {
      filename, configFile: false, babelrc: false, parserOpts: { plugins: typed ? ['typescript'] : [] },
      plugins: [[babelPlugin, OPTIONS]],
    });
    const plugin = createUnplugin(OPTIONS);
    const pre = plugin.transform(source, filename, 'pre')?.code ?? source;
    const post = plugin.transform(pre, filename, 'post')?.code ?? pre;
    const outputs = [['native', source], ['babel', babel.code], ['unplugin', pre], ['pre+post', post]];
    for (const [host, output] of outputs) {
      for (const lowered of host === 'native' ? [true] : [false, true]) {
        const code = typed || lowered ? (await lower(output, {
          filename, jsc: { parser: { syntax: typed ? 'typescript' : 'ecmascript' }, target: lowered ? 'es2015' : 'es2022' },
          module: { type: 'es6' },
        })).code : output;
        for (const window of [false, true]) {
          const file = path.join(DIR, `case-${ count++ }.mjs`);
          await fs.outputFile(file, `${ window ? 'global.window = global;' : 'delete global.window;' }\n${ code }`);
          const value = callerDefault && host === 'native' && !window ? 'TypeError' : window ? present : absent;
          const keyReader = name === 'deep-reader' || name === 'window-reader';
          const events = effects ?? (name.startsWith('lowered-mirror/') ? window ? ['source', 'key'] : ['source']
            : keyReader ? window ? ['key'] : []
            : name === 'argument' ? window ? ['argument'] : [] : window ? ['store'] : ['store', 'fallback']);
          // The full source and the stripped, lowered output cover distinct oracles.
          const strip = host !== 'native' && lowered;
          // Effectful realm keys and a selection mixing user/realm objects keep
          // their native reads. A shadowed `undefined` must not erase the user arm.
          // The existing second pass follows its identity guard and serves Promise.
          const nativeRead = name === 'computed-tail' || name === 'conditional-shadow' && host !== 'pre+post';
          const expected = nativeRead && strip && window ? 'TypeError' : value;
          check(`${ name }/${ host }/${ lowered }/${ window }`,
            await runInWorker(file, { strip, nativeAlias: host === 'native' || name === 'computed-tail', stripGlobals: ['Promise', 'Iterator', 'globalThis'] }),
            `OK|${ JSON.stringify(expected) }|${ JSON.stringify(events) }`);
        }
      }
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();
