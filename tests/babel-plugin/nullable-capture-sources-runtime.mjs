// A named constructor behind an alias still carries the source's absence and throws.
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
const { check, finish } = createChecker('nullable-capture-sources-runtime', {
  tsc: 'The cases deliberately read absent realm properties and destructure their values.',
});
const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const cases = [];
for (const [host, statement] of [
  ['declaration', 'const { [(effects.push("key"), "from")]: from } = held; return typeof from;'],
  ['assignment', 'let from; ({ [(effects.push("key"), "from")]: from } = held); return typeof from;'],
  ['value', 'let from; const result = ({ [(effects.push("key"), "from")]: from } = held); return [typeof from, result === held];'],
  ['for-init', 'for (const { [(effects.push("key"), "from")]: from } = held;;) return typeof from;'],
  ['bodyless', 'let from; for (; ({ [(effects.push("key"), "from")]: from } = held), false;); return typeof from;'],
]) cases.push([`keyed/${ host }`, `const held = globalThis.window?.Array; ${ statement }`,
  host === 'value' ? ['function', true] : 'function', ['key']]);
for (const [name, source] of [
  ['direct', 'globalThis.window?.Array.prototype'],
  ['alias', 'held.prototype'],
]) cases.push([`prototype/${ name }`, `const held = globalThis.window?.Array;
  const { [(effects.push('key'), 'includes')]: includes } = ${ source }; return typeof includes;`, 'function', ['key']]);
for (const source of ['missing ?? held', 'missing || held', 'typeof Symbol !== "undefined" ? held : Array']) {
  cases.push([`keyed-selection/${ source }`, `const held = globalThis.window?.Array; const missing = undefined;
    const { [(effects.push('key'), 'from')]: from } = ${ source }; return typeof from;`, 'function', ['key']]);
}
for (const [name, statement] of [
  ['nested', 'const { resolve: { length } } = source; return typeof length;'],
  ['sibling', 'const { resolve, unknown: { value } = {} } = source; return typeof resolve;'],
  ['for-of', 'for (const { resolve } of [source]) return typeof resolve;'],
  ['for-assignment', 'let resolve; for ({ resolve } of [source]) return typeof resolve;'],
  ['iife', 'return (({ resolve }) => typeof resolve)(source);'],
  ['nested-iife', 'return (({ resolve: { length } }) => typeof length)(source);'],
]) for (const [origin, source] of [
  ['stored', '(saved = globalThis.window)?.Promise'],
  ['alias-read', 'held.Promise'],
]) cases.push([`mirror/${ origin }/${ name }`, `let saved; const held = globalThis.window;
  ${ statement.replaceAll('source', source) }`, name.includes('nested') ? 'number' : 'function', []]);
for (const [name, setup, invocation] of [
  ['arrow', 'const held = globalThis.window?.Array;', '(({ from }) => typeof from)(held)'],
  ['function', 'const held = globalThis.window?.Array;', '(function ({ from }) { return typeof from; })(held)'],
  ['let-init', 'let held = globalThis.window?.Array;', '(({ from }) => typeof from)(held)'],
  ['write', 'let held; held = globalThis.window?.Array;', '(({ from }) => typeof from)(held)'],
  ['alias', 'const source = globalThis.window?.Array; const held = source;', '(({ from }) => typeof from)(held)'],
  ['prefix', 'const held = globalThis.window?.Array;', '(({ from }) => typeof from)((effects.push("prefix"), held))'],
  ['second', 'const held = globalThis.window?.Array;', '((unused, { from }) => typeof from)(1, held)'],
  ['named', 'const held = globalThis.window?.Array; function read({ from }) { return typeof from; }', 'read(held)'],
  ['nested-direct', '', '(({ Array: { from } }) => typeof from)(globalThis.window?.self)'],
  ['nested-alias', 'const held = globalThis.window?.self;', '(({ Array: { from } }) => typeof from)(held)'],
  ['nested-named', 'const held = globalThis.window?.self; function read({ Array: { from } }) { return typeof from; }', 'read(held)'],
]) cases.push([`argument/${ name }`, `${ setup } return ${ invocation };`, 'function', name === 'prefix' ? ['prefix'] : [],
  name === 'prefix' ? ['prefix'] : []]);
for (const [name, setup, invocation, presentEvents, absentEvents] of [
  ['nested-late', '', '(({ Array: { from } }, last) => typeof from)(globalThis.window?.self, (effects.push("last"), 1))', ['last'], ['last']],
  ['alias-late', 'const held = globalThis.window?.Array;', '(({ from }, last) => typeof from)(held, (effects.push("last"), 1))', ['last'], ['last']],
  ['key-late', 'const held = globalThis.window?.Array;',
    '(({ [(effects.push("key"), "from")]: from }, last) => typeof from)(held, (effects.push("last"), 1))', ['last', 'key'], ['last']],
  ['read-late', 'const held = globalThis.window;', '(({ resolve }, last) => typeof resolve)(held.Promise, (effects.push("last"), 1))', ['last'], []],
]) cases.push([`argument-order/${ name }`, `${ setup } return ${ invocation };`, 'function', presentEvents, absentEvents]);
for (const [name, statement, absent] of [
  ['declaration', 'const { from } = source; return typeof from;', 'TypeError'],
  ['assignment', 'let from; ({ from } = source); return typeof from;', 'TypeError'],
  ['member', 'return typeof (source).from;', 'TypeError'],
  ['optional', 'return typeof (source)?.from;', 'undefined'],
  ['alias-member', 'const held = source; return typeof held.from;', 'TypeError'],
  ['alias-pattern', 'const held = source; const { from } = held; return typeof from;', 'TypeError'],
]) cases.push([`selection/${ name }`, statement.replaceAll('source', "(typeof Symbol !== 'undefined' ? globalThis.window?.Array : Set)"),
  'function', [], [], absent]);
cases.push(
  ['fallback', 'const held = globalThis.window?.Array; return (({ from }) => typeof from)(held ?? Array);', 'function', [], [], 'function'],
  ['defined', 'const held = Array; const { [(effects.push("key"), "from")]: from } = held; return typeof from;', 'function', ['key'], ['key'], 'function'],
  ['user-value', 'const held = { from: () => 23 }; return (({ from }) => from())(held);', 23, [], [], 23],
  ['reassigned', 'let held = globalThis.window?.Array; held = { from: () => 31 }; return (({ from }) => from())(held);', 31, [], [], 31],
);
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const directory = await fs.mkdtemp(path.join(tmp, 'nullable-captures-'));
let serial = 0;
try {
  for (const [name, body, present, events, absentEvents = [], absent = 'TypeError'] of cases) {
    const source = scenarioSource(`export const effects = []; export const r = (() => {
      try { ${ body } } catch (error) { return error.name; }
    })();`);
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
    for (const [host, output] of outputs) {
      const file = path.join(directory, `case-${ serial++ }.mjs`);
      await fs.writeFile(file, output);
      for (const hasWindow of [false, true]) {
        const wrapper = path.join(directory, `case-${ serial++ }.mjs`);
        await fs.writeFile(wrapper, `${ hasWindow ? 'self.window = self;' : '' }
          const result = await import(${ JSON.stringify(pathToFileURL(file).href) });
          export const r = result.r; export const effects = result.effects;`);
        // A separate write inside try keeps the native parameter route; its absent-host throw is still tested stripped.
        for (const strip of host === 'native' || name === 'argument/write' && hasWindow ? [false] : [false, true]) {
          check(`${ name }/${ host }/${ hasWindow }/${ strip }`, await runInWorker(wrapper, { strip }),
            `OK|${ JSON.stringify(hasWindow ? present : absent) }|${ JSON.stringify(hasWindow ? events : absentEvents) }`);
        }
      }
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
