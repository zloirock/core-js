// Namespace lowering must export only source names; private captures still preserve
// effects and supplied values. AST ownership is checked before print/parse/lowering.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transform as lower } from '@swc/core';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { renderRetainedObjectCapture } from '../../packages/core-js-polyfill-provider/destructure-host-shape.js';
import { hostSlot } from '../../packages/core-js-polyfill-provider/render.js';
import estreeToBabel from '../../packages/core-js-babel-plugin/internals/estree-to-babel.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync, types: t } = requireBabel('@babel/core');
const { check, finish } = createChecker('private-destructure-bindings');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'private-bindings-'));
let count = 0;

function sharedNodes(root) {
  const seen = new WeakSet();
  const shared = [];
  function visit(node) {
    if (!node) return;
    if (seen.has(node)) {
      shared.push(node.type);
      return;
    }
    seen.add(node);
    for (const key of t.VISITOR_KEYS[node.type] ?? []) {
      const child = node[key];
      if (Array.isArray(child)) child.forEach(visit);
      else visit(child);
    }
  }
  visit(root);
  return shared.join(',');
}

// A deliberately shared node proves that the detector visits binding and read slots.
const shared = t.identifier('shared');
check('ownership detector positive control', sharedNodes(t.program([
  t.variableDeclaration('var', [t.variableDeclarator(shared)]), t.expressionStatement(shared),
])), 'Identifier');

// The retained-head renderer can be used while the original parameter is live.
// Test its ownership contract directly, independently of caller-census admission.
const binding = t.identifier('from');
const prop = t.objectProperty(t.identifier('from'), binding);
const rendered = renderRetainedObjectCapture({ defaultCapture: {
  retainedHead: true, target: { staticBindings: new Map([[prop, 'array/from']]) },
} }, { embed: hostSlot, injectImport: () => 'fromImport' });
const statement = estreeToBabel(rendered.statements[0]);
check('retained head/independent write node', statement.expression.left === binding, false);
check('retained head/preserved name', statement.expression.left.name, 'from');

const cases = [];
for (const kind of ['const', 'let', 'var']) {
  for (const present of [false, true]) cases.push([
    `default/${ kind }/${ present }`,
    `function select() { effects.push('select'); return ${ present ? '{ k: { of: x => x + 7, missing: 19 } }' : '{}' }; }
namespace N { export ${ kind } before = effects.push('before'),
  { k: { of, [(effects.push('key'), 'missing')]: value } = Array } = select(), after = effects.push('after'); }
r = [Object.keys(N).sort().join(','), N.of(3), N.value === ${ present ? '19' : 'undefined' }];`,
    ['after,before,of,value', present ? 10 : [3], true], ['before', 'select', 'key', 'after'],
  ]);
  cases.push([
    `array/${ kind }`,
    `function pick() { effects.push('pick'); return [4, 9]; }
export namespace N { export ${ kind } q = effects.push('q'), [{ at, keys }] = [pick()], end = effects.push('end'); }
r = [Object.keys(N).sort().join(','), N.at.call([4, 9], -1), N.keys.call([4, 9]).next().value];`,
    ['at,end,keys,q', 9, 0], ['q', 'pick', 'end'],
  ]);
}
for (const flag of [false, true]) cases.push([
  `guarded/${ flag }`,
  `const flag = JSON.parse('${ flag }'); const user = { entries: () => 31 };
export namespace N { export const { w: { entries } } = { w: flag ? Object : user }; }
r = [Object.keys(N).join(','), N.entries({ a: 2 })];`,
  ['entries', flag ? [['a', 2]] : 31], [],
]);
cases.push([
  'keyed',
  `const cnd = JSON.parse('true');
export namespace N { export const { Array: { [(effects.push('key'), 'of')]: a, from: b } } = cnd && { Array }; }
r = [Object.keys(N).sort().join(','), N.b([3])];`,
  ['a,b', [3]], ['key'],
]);
for (const kind of ['const', 'let', 'var']) cases.push([
  `symbol/${ kind }`,
  `namespace N { export ${ kind } before = effects.push('before'),
  { Set: { [(effects.push('key'), Symbol.iterator)]: method } } = globalThis as any,
  { WeakMap: { [(effects.push('default-key'), Symbol.iterator)]: fallback = null } } = globalThis as any; }
r = [Object.keys(N).sort().join(','), typeof N.method, N.fallback];`,
  ['before,fallback,method', 'undefined', null], ['before', 'key', 'default-key'],
]);
cases.push([
  'guarded-after-dispatch',
  `namespace N { export const { array: { at: first }, realm: { WeakSet: Value }, tail } = {
  array: [41], get realm() { effects.push(typeof first); return globalThis; },
  get tail() { effects.push(typeof Value); return 3; },
}; } r = [Object.keys(N).sort().join(','), N.first.call([41], -1), typeof N.Value, N.tail];`,
  ['Value,first,tail', 41, 'function', 3], ['function', 'function'],
], [
  'source-generated-looking-names',
  `namespace N { export const _ref = 17, _unused = 19, [{ at, keys }] = [[4, 9]]; }
r = [Object.keys(N).sort().join(','), N._ref, N._unused, N.at.call([4, 9], -1), N.keys.call([4]).next().value];`,
  ['_ref,_unused,at,keys', 17, 19, 9, 0], [],
]);
for (const [name, declaration, names, read] of [
  ['rest-static', '{ Array: { from }, ...rest } = globalThis', 'from,rest', 'Object.hasOwn(N.rest, "Array")'],
  ['rest-constructor', '{ Map: M, ...rest } = globalThis', 'M,rest', 'Object.hasOwn(N.rest, "Map")'],
  ['rest-mixed', '{ Map: M, Array: { from }, ...rest } = globalThis', 'M,from,rest', 'Object.hasOwn(N.rest, "Map") || Object.hasOwn(N.rest, "Array")'],
]) cases.push([name, `namespace N { export const ${ declaration }; } r = [Object.keys(N).sort().join(','), ${ read }];`, [names, false], []]);
cases.push([
  'nested-namespace',
  `const flag = JSON.parse('true'); const user = { entries: () => 31 };
namespace Outer.Inner { export const { w: { entries } } = { w: flag ? Object : user }; }
r = [Object.keys(Outer).join(','), Object.keys(Outer.Inner).join(','), Outer.Inner.entries({ a: 2 })];`,
  ['Inner', 'entries', [['a', 2]]], [],
]);

try {
  for (const [name, body, result, effects] of cases) {
    const source = `export let r; export const effects = []; ${ body }`;
    const outputs = [['native', source]];
    try {
      const babel = await transformAsync(source, {
        filename: 'input.ts', ast: true, configFile: false, babelrc: false,
        parserOpts: { plugins: ['typescript'] }, plugins: [[babelPlugin, OPTIONS]],
      });
      check(`${ name }/AST ownership`, sharedNodes(babel.ast), '');
      const single = createUnplugin(OPTIONS).transform(source, 'input.ts')?.code ?? source;
      const plugin = createUnplugin(OPTIONS);
      const pre = plugin.transform(source, 'input.ts', 'pre')?.code ?? source;
      const post = plugin.transform(pre, 'input.ts', 'post')?.code ?? pre;
      outputs.push(['babel', babel.code], ['unplugin', single], ['pre+post', post]);
    } catch (error) {
      check(`${ name }/transform`, error.message, null);
      continue;
    }
    for (const [host, output] of outputs) {
      // Lower the printed TS, not the plugin's in-memory AST: namespace exports
      // are observable properties only after a downstream compiler has run.
      const { code } = await lower(output, {
        filename: 'input.ts', jsc: { parser: { syntax: 'typescript' }, target: 'es2022' }, module: { type: 'es6' },
      });
      const file = path.join(DIR, `case-${ count++ }.mjs`);
      await fs.outputFile(file, code);
      for (const strip of host === 'native' ? [false] : [false, true]) check(`${ name }/${ host }/${ strip }`,
        await runInWorker(file, { strip }), `OK|${ JSON.stringify(result) }|${ JSON.stringify(effects) }`);
    }
  }
  for (const kind of ['const', 'let', 'var']) {
    const source = scenarioSource(`export const effects = []; ${ kind } held = globalThis.window?.Array;
let from, other; let result;
try { ({ from, other } = held); result = typeof from; } catch (error) { result = error.name; }
export const r = result;`);
    const { code, ast } = await transformAsync(source, {
      filename: 'input.mjs', ast: true, configFile: false, babelrc: false, plugins: [[babelPlugin, OPTIONS]],
    });
    check(`probe/${ kind }/AST ownership`, sharedNodes(ast), '');
    // A parser rejects a hoisted var accidentally renamed to the source const/let.
    const lowered = await transformAsync(code, {
      configFile: false, babelrc: false, plugins: [requireBabel.resolve('@babel/plugin-transform-destructuring')],
    });
    for (const present of [false, true]) {
      const file = path.join(DIR, `case-${ count++ }.mjs`);
      await fs.outputFile(file, `${ present ? 'global.window = global;' : 'delete global.window;' }\n${ lowered.code }`);
      check(`probe/${ kind }/${ present }`, await runInWorker(file, { strip: true }),
        `OK|"${ present ? 'function' : 'TypeError' }"|[]`);
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();
