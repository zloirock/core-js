// A write through a returned value keeps the return's scope and invoker pairing on every pass.
import { transformAsync } from '@babel/core';
import { createChecker } from './harness.mjs';
import plugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { collectPrePassSites as collectBabelPrePassSites, createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { collectPrePassSites, createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { collectFileCensus, moduleFormatReducer, resolveModuleFormat, unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { moduleDefaultSource, resolveInlineCalleeFunction } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { beginMutationPrePass, mutationShapesReducer, mutationSiteVisitors } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

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
    ? collectBabelPrePassSites(program, adapter, census)
    : collectPrePassSites({ ast: program.node, adapter, census, collectMutations: true });
  check(`${ name }: scoped slot`, mutated?.has('Array.from'), true);
  const coarse = makeAdapter({ method: 'usage-global', getMutationRoots: () => census.mutationRoots });
  check(`${ name }: gate covers slot`, coarse.isMutatedStaticSlot('Array', 'from'), true);
});

// A returned namespace may be unknown to the global census while the property a write
// changes is still known. The resolver must distinguish a patched predicate from a sibling.
for (const [store, expected, constructor = 'Array', predicate = 'isArray'] of [
  ['owner().other = patched;', 'array'],
  ['Array.hasParent = patched;', 'array'],
  ['Array.prototype.hasParent = patched;', 'array'],
  ['const C = Array; C.hasParent = patched;', 'array'],
  ['const P = Array.prototype; P.hasParent = patched;', 'array'],
  ['Array.other = patched; Number.isFinite = patched;', 'array'],
  ['Number.isFinite = patched;', 'number', 'Number', 'isInteger'],
  ['Number.isFinite = patched;', null, 'Number', 'isFinite'],
  ['Number.isArray = patched;', 'array'],
  ['const C = flag ? Array : globalThis; C.isArray = patched;', null],
  ['const { C } = { C: Array }; C.isArray = patched;', null],
  ['const { C } = { C: Array }; Reflect.set(C, "isArray", patched);', null],
  ['function patch(Number) { Number.isArray = patched; } patch(Array);', null],
  ['globalThis.Number = Array; Number.isArray = patched;', null],
  ['owner().isArray = patched;', null],
  ['owner()[key] = patched;', null],
  ['realm().Array = replacement;', null],
  ['Reflect.set(owner(), key, patched);', null],
  ['owner().other = patched;', 'error', 'RangeError', 'isError'],
  ['owner().other = patched; Error.isError = patched;', null, 'RangeError', 'isError'],
]) for (const receiver of [constructor, `globalThis.${ constructor }`]) {
  const source = `function owner() { return Array; } function realm() { return globalThis; } ${ store }
    function read(refs) { return ${ receiver }.${ predicate }(refs) && refs.includes(3); }`;
  runBoth(`guard after ${ store } / ${ receiver }.${ predicate }`, source, (parser, program, name) => {
    const { mutationRoots } = collectFileCensus(program.node, [mutationShapesReducer()]);
    const makeAdapter = parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter;
    const adapter = makeAdapter({ method: 'usage-global', getMutationRoots: () => mutationRoots });
    const resolver = parser.makeResolver({ isMutatedStatic: adapter.isMutatedStaticSlot });
    const member = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'includes');
    check(name, resolver.toHint(resolver.resolvePropertyObjectType(member)), expected);
  });
}
// The stored constructor reaches a mutation through the same function object only.
for (const [label, store, entry] of [
  ['one carrier', 'function C() {} C.prototype = Array; C.prototype.isArray = patch;', 'instance/includes'],
  ['saved outside the carrier scope',
    'const saved = Array; { function C() {} C.prototype = saved; C.prototype.isArray = patch; }', 'instance/includes'],
  ['namesakes', '{ function C() {} C.prototype = Array; } { function C() {} C.prototype.isArray = patch; }', 'array/instance/includes'],
]) for (const [host, transform] of transforms) {
  const output = await transform(`${ store } export function test(x) { return Array.isArray(x) && x.includes(1); }`);
  check(`${ host } / ${ label } / includes`, output.includes(`"@core-js/pure/full/${ entry }"`), true);
}
// A call on a value returned from another function is only a possible store if its
// callee can write. Keep the same argument in the positive and negative controls.
for (const [label, init, prelude, open, filename = 'input.cjs'] of [
  ['fresh exports', '(this && this.read) || function (x) { return x; }', '', false],
  ['classic receiver', '(this && this.read) || function (x) { return x; }', '', true, 'script.js'],
  ['populated exports', '(this && this.read) || function (x) { return x; }', 'this.read = Reflect.set;', true],
  ['separate pattern binding', '(this && this.read) || (x => x)', 'function other(obj, key) { const { [key]: read } = obj; return read; }', false],
  ['inert loader prefix', '(this && this.read) || (x => x)', '(0, require)("core-js/modules/es.object.to-string");', false],
  ['writer before load', '(this && this.read) || (x => x)', '(this.read = Reflect.set, require)("core-js/modules/es.object.to-string");', true],
  ['local alternatives', 'flag ? x => x : x => typeof x', '', false],
  ['externally written script binding', 'flag ? x => x : x => typeof x', 'function replace() { globalThis.read = Reflect.set; }', true, 'script.js'],
  ['argument writer', 'flag ? x => x : (object, key, value) => { object[key] = value; }', '', true],
  ['bound reader', 'flag ? Reflect.get.bind() : (object, key) => object[key]', '', false],
  ['export beside a bound reader', 'flag ? Reflect.get.bind() : (o, k) => o[k]', 'exports.copy = 1;', false],
  ['patched reader', 'flag ? Reflect.get.bind() : (object, key) => object[key]', 'Reflect.get = Reflect.set;', true],
  ['bound store', 'flag ? Object.assign.bind() : x => x', '', true],
]) runBoth(`helper ${ label }`, `${ prelude } var read = ${ init }; function keep(x) { return x; }
  function invoke(x) { var source = keep(x); read(source, "isArray", replacement); }`, (parser, path, name) => {
  const program = path.node;
  const { mutationRoots } = collectFileCensus(program, [
    moduleFormatReducer(moduleFormat => resolveModuleFormat({ id: filename, program, declaredSourceType: 'script', moduleFormat })),
    mutationShapesReducer(),
  ]);
  const create = parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter;
  const adapter = create({ method: 'usage-global', getMutationRoots: () => mutationRoots });
  check(`${ name }: possible predicate write`, adapter.isMutatedStaticSlot('Array', 'isArray', { typeGuard: true }), open);
  check(`${ name }: known static return`, adapter.isMutatedStaticSlot('Object', 'keys'), open);
});
// A second source can supply a writer even when the other assignment selects only readers.
for (const [label, uses] of [
  ['argument', 'function install(read) { read(target, "isArray", patch); } install(Reflect.set);'],
  ['destructured writer', 'function install(obj) { const { read } = obj; read(target, "isArray", patch); } install({ read: Reflect.set });'],
  ['assigned outer writer', '({ write: read } = { write: Reflect.set }); read(target, "isArray", patch);'],
  ['catch', 'try { throw Reflect.set; } catch (read) { read(target, "isArray", patch); }'],
  ['late function', 'read = (object, key, value) => { object[key] = value; }; read(target, "isArray", patch);'],
  ['declared loop head', 'for (var read of readers) {} read(target, "isArray", patch);'],
]) runBoth(`incoming helper / ${ label }`, `var read = flag ? x => x : function () {}; function keep(x) { return x; }
  const target = keep(Array); ${ uses }`, (parser, path, name) => {
  const { mutationRoots } = collectFileCensus(path.node, [mutationShapesReducer()]);
  const create = parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter;
  const adapter = create({ method: 'usage-global', getMutationRoots: () => mutationRoots });
  check(`${ name }: predicate may be replaced`, adapter.isMutatedStaticSlot('Array', 'isArray', { typeGuard: true }), true);
});
// Direct assignments already record their parent. Delete and update also record their
// member path; a target in a pattern or for-head still needs its own member visitor.
for (const [label, source, memberVisits, anchors, writesFrom = true] of [
  ['direct', 'Array.from; Array.from = value;', false, ['AssignmentExpression']],
  ['update', '++Array.from; Array.from--;', false, ['UpdateExpression', 'MemberExpression', 'UpdateExpression', 'MemberExpression']],
  ['delete', 'delete Array.from; void Array.from;', false, ['UnaryExpression', 'MemberExpression']],
  ['pattern', '({ value: Array.from } = source);', true],
  ['default', '[Array.from = fallback] = source;', true],
  ['rest', '[...Array.from] = source;', true],
  ['for-head', 'for (Array.from of source);', true],
  ['for-in', 'for (Array.from in source);', true],
  ['wrapped', '(Array.from as any) = value;', true],
  ['bindings', 'const { [Array.from]: [a = Array.from], ...rest } = source; Array.of = patch;', false, ['AssignmentExpression'], false],
  ['parameters and catch', 'function f({ a: [b] }) { try {} catch ({ message }) {} } Array.of = patch;', false, ['AssignmentExpression'], false],
  ['read-only slots', 'let a, rest; ({ [Array.from]: [a = Array.from], ...rest } = source);', false, ['AssignmentExpression'], false],
  ['loop bindings', 'for (const { a: [v] } of source) {} Array.of = patch;', false, ['ForOfStatement', 'AssignmentExpression'], false],
  ['write in binding default', 'const [v = (Array.from = patch)] = source;', false, ['AssignmentExpression']],
  ['nested default target', '({ a: [, { b: Array.from = fallback }] } = source);', true],
  ['wrapped property target', '({ a: ((Array.from as any)!) } = source);', true],
  ['nested wrapped rest target', 'for ([, { ...((Array.from as any)!) }] of source) {}', true],
  ['wrapped loop target', 'for (((Array.from as any)!) in source) {}', true],
  ['nested target in a binding default', 'function f([v = ([Array.from] = source)]) {}', true],
]) runBoth(`mutation member visits: ${ label }`, source, (parser, program, name) => {
  const census = collectFileCensus(program.node, [mutationShapesReducer()]);
  const babel = parser.name === 'babel';
  const calls = [];
  const visitors = mutationSiteVisitors(path => { calls.push(path.node.type); }, census.needsMemberMutationVisitor, babel);
  check(`${ name }: register member visitor`, 'MemberExpression' in visitors, memberVisits);
  if (anchors) {
    program.traverse(visitors);
    check(`${ name }: write anchors`, calls.join(','), anchors.join(','));
  }
  const adapter = (babel ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const { mutated } = babel ? collectBabelPrePassSites(program, adapter, census)
    : collectPrePassSites({ ast: program.node, adapter, census, collectMutations: true });
  check(`${ name }: scoped slot`, mutated.has('Array.from'), writesFrom);
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
  // Wrapper statics stay native regardless of when the container is handed out.
  for (const [label, source, expected, entry = 'from'] of [
    ['later handout', 'const source = [Array]; const [{ from }] = source; use(source); from([1]);', false],
    ['earlier handout', 'const source = [Array]; use(source); const [{ from }] = source; from([1]);', false],
    ['selected container identity',
      'const source = [Array]; function read([{ from, ...rest }]) { return from([1]); } read(source);'
        + ' const [{ of }] = source; of(2);', false, 'of'],
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
// A direct receiver asks for presence once before reading the binding. A free root
// still names its own slot, while a local shadows that spelling.
for (const [source, name, bound, slot, patched] of [
  ['Array.from = patch;', 'Array', false, 'Array.from', true],
  ['const target = Array; target.from = patch;', 'target', true, 'Array.from', true],
  ['function run(Array) { Array.from = patch; }', 'Array', true, 'Array.from', false],
  ['const target = foreign; target.from = patch;', 'target', true, 'foreign.from', false],
]) runBoth(`mutation receiver: ${ source }`, source, (parser, program, label) => {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const queries = [];
  for (const method of ['hasBinding', 'getBinding']) {
    const lookup = adapter[method];
    adapter[method] = function (ask) {
      if (ask.name === name) queries.push(method);
      return lookup.call(this, ask);
    };
  }
  const site = parser.pickPath(program, 'AssignmentExpression');
  const { mutated, handleSite, finalize } = beginMutationPrePass({ rootNode: program.node, adapter, census: { hasMutationShapes: true } });
  handleSite(site);
  finalize();
  check(`${ label }/queries up to the first binding read`, queries.slice(0, 2).join(','), bound ? 'hasBinding,getBinding' : 'hasBinding');
  check(`${ label }/${ slot }`, mutated.has(slot), patched);
});

// An unbound direct callee cannot resolve to a local body or a pure invoker. Do not copy
// the alias history for that refusal; a bound callee still forks it and keeps the caller's set.
for (const method of ['usage-global', 'usage-pure']) for (const [prefix, invocation, expected, copies] of [
  ['', 'new Int32Array(1)', null, 0],
  ['', 'foreign()', null, 0],
  ['', 'foreign?.()', null, 0],
  ['function Factory() { return Array; }', 'new Factory()', 'FunctionDeclaration', 1],
  ['function Factory() { return Array; } const alias = Factory;', 'new alias()', 'FunctionDeclaration', 1],
  ['function Factory() { return Array; }', 'Factory()', 'FunctionDeclaration', 1],
  ['const Factory = () => Array;', 'Factory?.()', 'ArrowFunctionExpression', 1],
  ['let Factory; Factory = function () { return Array; };', 'new Factory()', 'FunctionExpression', 1],
  ['import invoke from "@core-js/pure/actual/reflect/apply"; function Factory() { return Array; }',
    'invoke(Factory, null, [])', 'FunctionDeclaration', 1],
]) runBoth(`${ method }/callee opening: ${ prefix } ${ invocation }`, `${ prefix } ${ invocation };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'ExpressionStatement', item => item.node.expression.type !== 'AssignmentExpression');
  const node = unwrapRuntimeExpr(path.node.expression);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
  const seen = new Set(['unrelated']);
  const iterate = seen[Symbol.iterator];
  let copied = 0;
  seen[Symbol.iterator] = function * () {
    copied++;
    yield * iterate.call(this);
  };
  const result = resolveInlineCalleeFunction({ node, seen, ctx: { scope: path.scope, adapter, path } });
  check(`${ label }/body`, result?.node.type ?? null, expected);
  check(`${ label }/history copies`, copied, copies);
  check(`${ label }/caller history stays intact`, seen.size, 1);
});

finish();
