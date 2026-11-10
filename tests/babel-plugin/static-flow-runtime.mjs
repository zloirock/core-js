// Fresh workers keep constructor namespaces independent across rows and emitters.
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
const { check, finish } = createChecker('static-flow-runtime');
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'static-flow-'));
let count = 0;

// Independent realms prevent another static import from filling a narrow constructor.
const cases = [
  ['fallback sealed', 'const { resolve } = (globalThis.window?.self).Promise ?? {}; r = typeof resolve;', 'function', true],
  ['nested length', 'const { of: { length } } = (globalThis.window?.self).Array; r = length;', 0, true],
  ['nested name', 'const { allSettled: { name } } = (globalThis.window?.self).Promise; r = name;', 'allSettled', true],
  ['direct name', 'const { allSettled: { name } } = globalThis.window?.Promise; r = name;', 'allSettled', true],
  ['for-init length', 'for (const { of: { length } } = (globalThis.window?.self).Array; !r;) { r = [length]; break; }', [0], true],
  ['for-init name',
    'for (const { allSettled: { name } } = (globalThis.window?.self).Promise; !r;) { r = name; break; }',
    'allSettled', true],
  ['nested map', 'const { groupBy: { length } } = (globalThis.window?.self).Map; r = length;', 2, true],
  ['stored root',
    'let held; const { Array: { of: { length } } } = (held = globalThis.window); r = [length,held === globalThis];',
    [0, true], true],
  ['custom receiver', 'const source = { of: { length: 23 } }; const { of: { length } } = source; r = length;', 23, false],
  ['grouped iterator',
    'const a = Iterator.from, b = Iterator[(effects.push(\'key\'), \'from\')]; r = [typeof a,typeof b];',
    ['function', 'function'], false, ['key']],
  ['grouped promise',
    'const a = Promise.resolve, b = Promise[(effects.push(\'key\'), \'reject\')]; r = [typeof a,typeof b];',
    ['function', 'function'], false, ['key']],
  ['flow string',
    'function f(c) { let x = [1]; if (c) x = \'ab\'.padStart(3); else x = [2]; return x.at(-1); } r = [f(true),f(false)];',
    ['b', 2], false],
  ['flow array',
    'function f(c) { let x = \'\'; if (c) x = [1,[7]].flat(); else x = \'str\'; return x.at(-1); } r = [f(true),f(false)];',
    [7, 'r'], false],
  ['flow join',
    'function f(c) { let x = []; if (c) x = [1,2].join(\'-\'); else x = []; return x.includes(\'1\'); } r = [f(true),f(false)];',
    [true, false], false],
  ['flow iterator',
    'function f(c) { let x = []; if (c) x = [1,7].values(); else x = [2]; return Array.from(x.map(v => v)); } r = [f(true),f(false)];',
    [[1, 7], [2]], false],
  ['flow ternary',
    'function f(c,d) { let x; if (c) x = d ? [1,[7]].flat() : \'ab\'.padStart(3); else x = \'str\'; return x.at(-1); } r = [f(true,true),f(true,false),f(false,false)];',
    [7, 'b', 'r'], false],
  ['flow stale',
    'function f(c) { let x = [9].flat(); if (c) x = \'ab\'; else x = \'cd\'; return x.at(-1); } r = [f(true),f(false)];',
    ['b', 'd'], false],
  ['flow partial',
    'function f(c) { let x = [9].flat(); if (c) x = \'ab\'.padStart(3); return x.at(-1); } r = [f(true),f(false)];',
    ['b', 9], false],
  ['for-init source order',
    'try { for (const before = (effects.push("before"), 0), { groupBy: { length } } = (globalThis.window?.self).Map; !r;)'
      + ' { r = length; break; } } catch (error) { r = error.name; }',
    2, false, ['before'], 'TypeError', ['before']],
  ['source prefix once',
    'try { const { groupBy: { length } } = (effects.push("source"), (globalThis.window?.self).Map); r = length; }'
      + ' catch (error) { r = error.name; }',
    2, false, ['source'], 'TypeError', ['source']],
  ['key after seal',
    'try { const { [(effects.push("key"), "groupBy")]: { length } } = (globalThis.window?.self).Map; r = length; }'
      + ' catch (error) { r = error.name; }',
    2, false, ['key'], 'TypeError', []],
  ['residual sibling',
    'const { groupBy: { length }, size } = (globalThis.window?.self).Map; r = [length,typeof size];',
    [2, 'undefined'], true],
  ['assignment length', 'let length; ({ of: { length } } = (globalThis.window?.self).Array); r = length;', 0, true],
  ['grouped alias',
    'const C = Iterator; const a = C.from, b = C[(effects.push("key"), "from")]; r = [typeof a,typeof b];',
    ['function', 'function'], false, ['key']],
  ['live fallback',
    'const { resolve } = globalThis.window?.Promise ?? { resolve: "fallback" }; r = typeof resolve;',
    'function', false, [], 'string'],
  ['mutated static',
    'Promise.resolve = function own() {}; const { resolve: { name } } = (globalThis.window?.self).Promise; r = name;',
    'own', true],
  ['shadowed realm',
    'const globalThis = { window: { self: { Map: { groupBy: { length: 23 } } } } };'
      + ' const { groupBy: { length } } = (globalThis.window?.self).Map; r = length;',
    23, false],
];

async function runCases() {
  for (const [name, body, result, throwsAbsent = false, effects = [], absent = result, absentEffects = effects] of cases) {
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
      check(`${ name }/${ method }/host imports`, JSON.stringify([...importSet(babel)].sort()), JSON.stringify([...importSet(single)].sort()));
      check(`${ name }/${ method }/phase imports`, JSON.stringify([...importSet(post)].sort()), JSON.stringify([...importSet(single)].sort()));
      for (const present of [false, true]) {
        const value = present ? result : absent;
        const expected = !present && throwsAbsent ? 'ERR|TypeError'
          : `OK|${ JSON.stringify(value === undefined ? '__undefined__' : value) }|${ JSON.stringify(present ? effects : absentEffects) }`;
        for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', single], ['pre+post', post]]) {
          if (host === 'native' && method === 'usage-pure') continue;
          const file = path.join(DIR, `case-${ count++ }.mjs`);
          // The setup is outside the transformed program. It supplies no static or claim.
          await fs.outputFile(file, `${ present ? 'global.window = global;' : 'delete global.window;' }\n${ output }`);
          check(`${ name }/${ method }/${ present }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
          if (host !== 'native') check(`${ name }/${ method }/${ present }/${ host }/stripped`,
            await runInWorker(file, { stripGlobals: ['Promise', 'Iterator'] }), expected);
        }
      }
    }
  }
}

try {
  await runCases();
} finally {
  await fs.remove(DIR);
}

finish();
