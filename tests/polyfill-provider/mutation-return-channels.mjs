// A write through a returned value keeps the return's scope and invoker pairing on every pass.
import { transformAsync } from '@babel/core';
import { createChecker } from './harness.mjs';
import plugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { collectMutationPrePass, createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { collectPrePassSites, createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { collectFileCensus } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { moduleDefaultSource, resolveInlineCalleeFunction } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, runBoth, finish } = createChecker('mutation-return-channels');
const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, mode: 'full' };
const transforms = [
  ['babel', async source => (await transformAsync(source, {
    filename: 'input.mjs', configFile: false, babelrc: false, plugins: [[plugin, options]],
  })).code],
  ['unplugin', source => createUnplugin(options).transform(source, 'input.mjs')?.code ?? source],
];
const rows = [];
for (const params of ['', 'ignored']) for (const [value, tail] of [
  ['Array', ''], ['[Array]', '[0]'], ['{ value: Array }', '.value'],
]) for (const call of [
  'pick()', 'pick.call(null)', 'pick.apply(null, args)', 'Reflect.apply(pick, null, args)',
  'pick.bind(null)()', 'pick``',
]) rows.push([`${ params || 'no params' }: ${ value }: ${ call }`,
  `function pick(${ params }) { return ${ value }; } ${ call }${ tail }.from = patched; Array.from([1]);`]);

for (const [value, tail] of [['value', ''], ['[value]', '[0]'], ['{ value }', '.value']]) {
  for (const prefix of [
    'import invoke from "@core-js/pure/actual/reflect/apply";',
    'const invoke = require("@core-js/pure/actual/reflect/apply");',
  ]) rows.push([`${ prefix }: ${ value }`,
    `${ prefix } function pick(value) { return ${ value }; } invoke(pick, null, [Array])${ tail }.from = patched; Array.from([1]);`]);
}
rows.push(
  ['selected argument inside a returned container',
    'function box(value) { return [value]; } box(flag ? Array : Object)[0].from = patched; Array.from([1]);'],
  ['caller shadow does not capture a free return',
    'function pick() { return Array; } function run(Array) { pick.apply(null, []).from = patched; } run({}); Array.from([1]);'],
  ['nested return keeps declaration scope',
    'function pick() { return Array; } function next() { return pick(); }'
      + ' function run(Array) { next.call(null).from = patched; } run({}); Array.from([1]);'],
);
// Lowering block functions creates var initializers; mutation reachability keeps their possible return.
for (const [value, tail] of [['Array', ''], ['[Array]', '[0]'], ['{ value: Array }', '.value']]) {
  for (const call of ['pick.call(null)', 'pick.apply(null, [])', 'Reflect.apply(pick, null, [])']) {
    rows.push([`conditional var: ${ value }: ${ call }`,
      `try { var pick = function () { return ${ value }; };`
        + ` var install = function (Array) { ${ call }${ tail }.from = patched; }; install({}); } finally {}`
        + ' Array.from([1]);']);
  }
}
for (const [value, tail] of [['value', ''], ['[value]', '[0]'], ['{ value }', '.value']]) {
  rows.push([`conditional var parameter: ${ value }`,
    `try { var pick = function (value) { return ${ value }; };`
      + ` var install = function () { pick.call(null, Array)${ tail }.from = patched; }; install(); } finally {}`
      + ' Array.from([1]);']);
}
// Module lowering carries the same invoker in an interop wrapper's default slot.
for (const helper of ['_interopRequireDefault', '_interopRequireWildcard', '_interop_require_default', '_interop_require_wildcard']) {
  rows.push([`lowered invoker: ${ helper }`,
    `var invoke = ${ helper }(require("@core-js/pure/actual/reflect/apply"));`
      + ' function pick(value) { return { value }; } (0, invoke.default)(pick, null, [Array]).value.from = patched; Array.from([1]);']);
}
rows.push(['namespace invoker',
  'import * as invoke from "@core-js/pure/actual/reflect/apply";'
    + ' function pick(value) { return value; } invoke.default(pick, null, [Array]).from = patched; Array.from([1]);']);
// The pure Reflect namespace binding invokes through its `apply` member like the entry does.
for (const [value, tail] of [['value', ''], ['[value]', '[0]'], ['{ value }', '.value']]) {
  rows.push([`Reflect namespace import: ${ value }`,
    'import Reflect from "@core-js/pure/actual/reflect";'
      + ` function pick(value) { return ${ value }; } Reflect.apply(pick, null, [Array])${ tail }.from = patched; Array.from([1]);`]);
}
// Invoker identity follows aliases at their declarations, including the lowered default slot.
for (const [prefix, value] of [
  ['import invoke from "@core-js/pure/actual/reflect/apply";', 'invoke'],
  ['const invoke = require("@core-js/pure/actual/reflect/apply");', 'invoke'],
  ['var invoke = _interopRequireDefault(require("@core-js/pure/actual/reflect/apply"));', 'invoke.default'],
  ['import * as invoke from "@core-js/pure/actual/reflect/apply";', 'invoke.default'],
]) for (const aliases of [`const alias = ${ value };`, `const first = ${ value }; const next = first; const alias = next;`]) {
  rows.push([`invoker alias: ${ prefix }: ${ aliases }`,
    `${ prefix } ${ aliases } function pick(value) { return { value }; }`
      + ' function run(invoke) { alias(pick, null, [Array]).value.from = patched; } run({}); Array.from([1]);']);
}
for (const [label, source] of rows) runBoth(label, source, (parser, program, name) => {
  const census = collectFileCensus(program.node, [mutationShapesReducer()]);
  const makeAdapter = parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter;
  const adapter = makeAdapter({ method: 'usage-pure' });
  const { mutated } = parser.name === 'babel'
    ? collectMutationPrePass(program, adapter, census)
    : collectPrePassSites({ ast: program.node, adapter, census, collectMutations: true });
  check(`${ name }: scoped slot`, mutated?.has('Array.from'), true);
  const coarse = makeAdapter({ method: 'usage-global', getMutationRoots: () => census.mutationRoots });
  check(`${ name }: gate covers slot`, coarse.isMutatedStaticSlot('Array', 'from'), true);
});
// A failed call cannot patch a return, including an alias that captured undefined earlier.
const unavailableCallees = [
  'try { pick().from = patched; } catch {} var pick = function () { return Array; };',
  'var alias = pick; var pick = function () { return Array; }; try { alias().from = patched; } catch {}',
  'var alias = pick; var pick = function () { return Array; }; function run() { alias().from = patched; } try { run(); } catch {}',
];
for (const [emitter, transform] of transforms) {
  for (const [index, source] of unavailableCallees.entries()) {
    let output = `${ source } Array.from([1]);`;
    for (let pass = 1; pass <= 2; pass++) {
      output = await transform(output);
      check(`${ emitter }: unavailable callee ${ index }: pass ${ pass }`, output.includes('/array/from'), true);
    }
  }

  check(`${ emitter }: untouched static is injected`, (await transform('Array.from([1]);')).includes('/array/from'), true);
  for (const [label, source, expected, entry = 'from'] of [
    ['later handout', 'const source = [Array]; const [{ from }] = source; use(source); from([1]);', true],
    ['earlier handout', 'const source = [Array]; use(source); const [{ from }] = source; from([1]);', false],
    ['selected container identity',
      'const source = [Array]; function read([{ from, ...rest }]) { return from([1]); } read(source);'
        + ' const [{ of }] = source; of(2);', true, 'of'],
    ['selected leaf can replace a deeper slot',
      'const source = [{ w: Array }]; function install([held]) { held.w = {}; } install(source);'
        + ' const [{ w: { from } }] = source; from([1]);', false],
    ['arguments retains the container',
      'const source = [Array]; function install([{}]) { arguments[0][0] = {}; } install(source);'
        + ' const [{ from }] = source; from([1]);', false],
  ]) check(`${ emitter }: container read ${ label }`, (await transform(source)).includes(`/array/${ entry }`), expected);
  for (const [label, source] of rows) {
    let output = source;
    for (let pass = 1; pass <= 2; pass++) {
      output = await transform(output);
      check(`${ emitter }: pass ${ pass }: ${ label }`, output.includes('/array/from'), false);
    }
  }
  // An unknown actual argument is not the free global sharing the parameter's spelling.
  check(`${ emitter }: opaque parameter stays unknown`,
    (await transform('function pick(Array) { return Array; } pick.apply(null, args).from = patched; Array.from([1]);'))
      .includes('/array/from'), true);
  for (const shadow of [
    'function invoke() { return {}; }',
    'const invoke = () => ({});',
  ]) {
    const source = 'import invoke from "@core-js/pure/actual/reflect/apply"; function pick(value) { return value; }'
      + ` { ${ shadow } invoke(pick, null, [Array]).from = patched; } Array.from([1]);`;
    const first = await transform(source);
    check(`${ emitter }: local invoker shadow: ${ shadow }`, first.includes('/array/from'), true);
    check(`${ emitter }: invoker shadow survives pass 2: ${ shadow }`, (await transform(first)).includes('/array/from'), true);
  }
}
// A namespace wrapper and its default value are distinct: a second default hop stays opaque.
for (const [prefix, expression, expected] of [
  ['import value from "@core-js/pure/actual/reflect/apply";', 'value', true],
  ['import value from "@core-js/pure/actual/reflect/apply"; const alias = (effect(), value);', 'alias', true],
  ['import * as ns from "@core-js/pure/actual/reflect/apply";', 'ns', false],
  ['import * as ns from "@core-js/pure/actual/reflect/apply";', 'ns.default', true],
  ['import * as ns from "@core-js/pure/actual/reflect/apply"; const value = ns.default;', 'value.default', false],
  ['const value = { default: function () {} };', 'value.default', false],
  ['let first = second; let second = first;', 'first', false],
  ['var alias = value; var value = require("@core-js/pure/actual/reflect/apply"); function read() { alias; }', 'alias', false],
  ['if (true) { var alias = value; } var value = require("@core-js/pure/actual/reflect/apply"); function read() { alias; }', 'alias', false],
  ['var alias = value; var value = require("@core-js/pure/actual/reflect/apply");', 'alias', false],
  ['var alias = value; var value = _interopRequireDefault(require("@core-js/pure/actual/reflect/apply"));', 'alias.default', false],
]) runBoth(`module default source: ${ expression }`, `${ prefix } ${ expression };`, (parser, program, name) => {
  const statement = parser.pickPath(program, 'ExpressionStatement');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  check(name, moduleDefaultSource({ node: statement.node.expression, scope: statement.scope, adapter, path: statement }),
    expected ? '@core-js/pure/actual/reflect/apply' : null);
});
// A read proof still requires definite initialization; only mutation reachability opts out.
runBoth('conditional var callee authority',
  'function read() { return pick(); } try { var pick = function () { return Array; }; } finally {}',
  (parser, program, name) => {
    const call = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'pick');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const hop = { node: call.node, readNode: call.node, seen: new Set(), ctx: { scope: call.scope, adapter, path: call } };
    check(`${ name }: strict read declines`, resolveInlineCalleeFunction(hop), null);
    check(`${ name }: possible mutation callee`,
      resolveInlineCalleeFunction(hop, { allowUninitializedCallee: true })?.node.type, 'FunctionExpression');
  });
for (const source of unavailableCallees) runBoth(`unavailable callee: ${ source }`, source, (parser, program, name) => {
  const call = parser.pickPath(program, 'CallExpression', path => ['pick', 'alias'].includes(path.node.callee.name));
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const hop = { node: call.node, readNode: call.node, seen: new Set(), ctx: { scope: call.scope, adapter, path: call } };
  check(`${ name }: read declines`, resolveInlineCalleeFunction(hop), null);
  check(`${ name }: mutation declines`, resolveInlineCalleeFunction(hop, { allowUninitializedCallee: true }), null);
});
finish();
