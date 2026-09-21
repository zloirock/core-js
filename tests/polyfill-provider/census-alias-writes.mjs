// Assignment sources belong to their target's binding, including writes before declarations and
// writes from closures. The coarse mutation gate unions call sources without sharing sinks.
import { adapters, createChecker } from './harness.mjs';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  collectFileCensus,
  ESCAPED_CONTAINER_NAMES,
  ESCAPED_CTOR_REFS,
  CENSUS_STATIC_RECEIVERS,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { handleMemberExpressionNode, planGuardedStaticNarrow } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { collectMemberUnionCandidates } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { resolve } from '../../packages/core-js-polyfill-provider/index.js';
import {
  escapedCtorReferencesReducer,
  mutationShapesReducer,
} from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, checkDeep, checkTruthy, finish } = createChecker('census-alias-writes');

const sibling = 'function sibling() { var a = {}; a = Set; void a.name; }';
const rows = [
  ['plain assignment', 'function expose() { var a = {}; a = Map; hand(a); }'],
  ['logical assignment', 'function expose() { var a; a ||= Map; hand(a); }'],
  ['object assignment', 'function expose() { var a; ({ value: a } = { value: Map }); hand(a); }'],
  ['array assignment', 'function expose() { var a; [a] = [Map]; hand(a); }'],
  ['nested pattern assignment', 'function expose() { var a; ({ value: [a] } = { value: [Map] }); hand(a); }'],
  ['nested block writes its outer binding', 'function expose() { var a; { a = Map; } hand(a); }'],
  ['closure writes its outer binding', 'function expose() { var a; function install() { a = Map; } hand(a); }'],
  ['hoisted declaration after the write', 'function expose() { a = Map; hand(a); var a; }'],
  ['valueless lexical shadow owns the write', 'function expose() { let a = Number; { let a; a = Map; hand(a); } }'],
  ['same-name parameter owns the write', 'function expose(a) { a = Map; hand(a); }'],
  ['catch binding owns the write', 'function expose() { try { work(); } catch (a) { a = Map; hand(a); } }'],
  ['default evaluates outside body bindings', 'let a; function expose(value = (a = Map)) { var a = Number; } hand(a);'],
  ['computed method key evaluates outside body bindings', 'let a; const box = { [a = Map]() { var a = Number; } }; hand(a);'],
  ['unknown target keeps its conservative sources', 'a = Map; hand(a);'],
  ['loop assignment reaches its outer binding', 'function expose() { var a; { for ([a] of [[Map]]) {} } hand(a); }'],
  ['loop assignment from a closure', 'function expose() { var a; function install() { for ({ value: a } of [{ value: Map }]) {} } hand(a); }'],
  ['plain loop binding carries its element', 'function expose() { for (const a of [Map]) hand(a); }'],
  ['plain loop assignment carries its element', 'function expose() { var a; { for (a of [Map]) {} } hand(a); }'],
  ['var loop binding survives the loop', 'function expose() { for (var [a] of [[Map]]) {} hand(a); }'],
  ['lexical loop binding shadows its outer namesake', 'function expose() { let a = Set; for (let [a] of [[Map]]) hand(a); }'],
  ['lexical loop binding stays inside the loop', 'function expose() { let a = Set; for (const [a] of [[Map]]) {} hand(a); }', false, true],
  ['empty iterable adds no source', 'function expose() { for (const a of []) hand(a); }', false],
  ['for-in hands out keys', 'function expose() { for (const a in { value: Map }) hand(a); }', false],
  ['effectful iterable keeps its elements', 'function expose() { for (const a of (effect(), [Map])) hand(a); }'],
  ['effectful iterable with a local head stays narrow', 'function expose() { for (const a of (effect(), [Map])) void a.name; }', false],
  ['assigned iterable keeps its elements', 'function expose() { let list; for (const [a] of (list = [[Map]])) hand(a); }'],
  ['awaited iteration keeps its possible sources', 'async function expose() { for await (const a of [Map]) hand(a); }'],
  ['spread iterable keeps its possible sources', 'function expose() { for (const a of [...[Map]]) hand(a); }'],
  ['sparse iterable keeps its possible sources', 'function expose() { for (const a of [, Map]) if (a) hand(a); }'],
  ['aliased iterable keeps its possible sources', 'function expose() { const values = [Map]; for (const a of values) hand(a); }'],
  ['member head exposes its written value', 'function expose() { const box = {}; for (box.value of [Map]) {} hand(box.value); }'],
  ['pattern member head exposes its written value', 'function expose() { const box = {}; for ({ value: box.value } of [{ value: Map }]) {} hand(box.value); }'],
  ['a member in a pattern key is not a target', 'function expose() { for (const { [box.key]: a } of [{ value: Map }]) void a.name; }', false],
  ['awaited head is unused', 'async function expose() { for await (const a of [Map]) {} }', false],
  ['awaited head reads an intrinsic property', 'async function expose() { for await (const a of [Map]) void a.name; }', false],
  ['awaited alias stays local', 'async function expose() { for await (const a of [Map]) { const b = a; void b.name; } }', false],
  ['awaited source keeps its lexical owner', 'async function expose() { for await (const a of [Map]) {} } function other(a) { hand(a); }', false],
  ['spread head stays local', 'function expose() { for (const a of [...[Map]]) void a.name; }', false],
  ['sparse head stays local', 'function expose() { for (const a of [, Map]) void a; }', false],
  ['named iterable stays local', 'function expose() { const values = [Map]; for (const a of values) {} }', false],
  ['returned iterable stays local', 'function values() { return [Map]; } function expose() { for (const a of values()) void a.name; }', false],
  ['returned iterable reaches an escaping head', 'function values() { return [Map]; } function expose() { for (const a of values()) hand(a); }'],
  ['awaited alias escapes', 'async function expose() { for await (const a of [Map]) { const b = a; hand(b); } }'],
  ['awaited member escapes', 'async function expose() { for await (const a of [{ value: Map }]) hand(a.value); }'],
  ['awaited pattern alias escapes', 'async function expose() { for await (const a of [{ value: Map }]) { const { value: b } = a; hand(b); } }'],
  ['nested opaque iterations escape', 'async function expose() { for await (const a of [[Map]]) for (const b of a) hand(b); }'],
  ['awaited static is held only in pure', 'async function expose() { for await (const a of [Map]) a.groupBy([], x => x); }', true, false, false],
  ['awaited nested static is held only in pure', 'async function expose() { for await (const a of [{ value: Map }]) a.value.groupBy([], x => x); }', true, false, false],
  ['awaited destructured static is held only in pure',
    'async function expose() { for await (const a of [Map]) { const { groupBy } = a; groupBy([], x => x); } }', true, false, false],
  ['awaited dynamic read keeps the whole family', 'async function expose() { for await (const a of [Map]) hand(a[key]); }'],
  ['unused member head stays local', 'function expose() { const box = {}; for (box.value of [Map]) {} }', false],
  ['unused pattern member head stays local', 'function expose() { const box = {}; for ({ value: box.value } of [{ value: Map }]) {} }', false],
  ['member head static is held only in pure', 'function expose() { const box = {}; for (box.value of [Map]) {} box.value.groupBy([], x => x); }', true, false, false],
];
const orders = [
  () => [escapedCtorReferencesReducer()],
  () => [escapedCtorReferencesReducer(), mutationShapesReducer()],
  () => [mutationShapesReducer(), escapedCtorReferencesReducer()],
];
let checked = 0;
for (const adapter of adapters) {
  for (const [name, code, mapEscapes = true, setEscapes = false, globalMap = mapEscapes] of rows) for (const [order, reducers] of orders.entries()) {
    const program = adapter.parseAndScope(`${ code } ${ sibling }`).node;
    const { escapedCtorNames } = collectFileCensus(program, reducers());
    const label = `${ adapter.name }: ${ name }: order ${ order }`;
    check(`${ label }: Map escape`, escapedCtorNames.has('Map', true), mapEscapes);
    check(`${ label }: Set escape`, escapedCtorNames.has('Set', true), setEscapes);
    check(`${ label }: global Map escape`, escapedCtorNames.has('Map'), globalMap);
    checked++;
  }

  for (const [name, code, expected, absent = []] of [
    ['all call alternatives', 'function f(a) { a.x = 0; } f(Object); f(Array); f(Reflect);', ['Object', 'Array', 'Reflect']],
    ['repeated selecting arguments', 'function f(a) { a.x = 0; } f(Object || Array); f(Object || Array);', ['Object', 'Array']],
    ['parameter defaults and callers', 'function f(a = Object) { a.x = 0; } f(Array);', ['Object', 'Array']],
    ['pattern bindings keep separate sinks', 'function f({ a, b }) { a.x = 0; } f(Object); function g(b) {} g(Array);',
      ['Object'], ['Array']],
    ['foreign member adds no namespace', 'function f(a) { a.x = 0; } f(unknown[key]); f(Object);', ['Object']],
    ['dynamic global source stays open', 'function f(a) { a.x = 0; } f(globalThis[key]); f(Object);', null],
  ]) {
    const program = adapter.parseAndScope(code).node;
    const { mutationRoots } = collectFileCensus(program, [mutationShapesReducer()]);
    const label = `${ adapter.name }: ${ name }`;
    check(`${ label }: opacity`, mutationRoots.open, expected === null);
    for (const root of expected ?? []) checkTruthy(`${ label }: keeps ${ root }`, mutationRoots.names.has(root));
    for (const root of absent) check(`${ label }: excludes ${ root }`, mutationRoots.names.has(root), false);
    checked++;
  }
}
check('all rows were checked', checked, adapters.length * (rows.length * orders.length + 6));
checkTruthy('coverage floor', checked >= 96);

// Speculatively asking which families an opaque head may hold must not make its source escape.
for (const parser of adapters) {
  const program = parser.parseAndScope('const values = [Map]; for (const value of values) {}');
  const head = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'value').node.id;
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
  const containers = [...ESCAPED_CONTAINER_NAMES.get(program.node)];
  const stamps = [...ESCAPED_CTOR_REFS.get(program.node)];
  const query = CENSUS_STATIC_RECEIVERS.get(program.node);
  checkDeep(`${ parser.name }: opaque head's possible family`, [...query(head)], ['Map']);
  checkDeep(`${ parser.name }: query leaves container escape facts unchanged`, [...ESCAPED_CONTAINER_NAMES.get(program.node)], containers);
  checkDeep(`${ parser.name }: query leaves position stamps unchanged`, [...ESCAPED_CTOR_REFS.get(program.node)], stamps);
  check(`${ parser.name }: query leaves pure family narrow`, escapedCtorNames.has('Map', true), false);
}

// A possible native namespace becomes an identity guard, never an unconditional static rewrite.
for (const parser of adapters) for (const [name, source, capture, mutated = false, candidate = true] of [
  ['awaited binding', 'async function f() { for await (const value of [Array]) value.of(3); }', false],
  ['member target', 'const box = {}; for (box.value of [Array]) {} box.value.of(3);', true],
  ['foreign alternative', 'async function f() { for await (const value of [Array, custom]) value.of(3); }', false],
  ['patched static', 'async function f() { for await (const value of [Array]) value.of(3); }', false, true, false],
  ['effectful key', 'async function f() { for await (const value of [Array]) value[(effect(), "of")](3); }', false, false, false],
]) {
  const program = parser.parseAndScope(source);
  collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
  const usage = parser.pickPath(program, 'MemberExpression', path => path.parentPath?.node.type === 'CallExpression');
  const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
  adapter.isMutatedStatic = (object, key) => mutated && object === 'Array' && key === 'of';
  const meta = handleMemberExpressionNode({
    node: usage.node, path: usage, scope: usage.scope, adapter, resolvePure: resolve,
    handledObjects: new WeakSet(), suppressProxyGlobals: new WeakSet(),
  });
  check(`${ parser.name }: ${ name }: guarded candidate`, meta?.guardedAliasHint === 'Array', candidate);
  if (!candidate) continue;
  const plan = planGuardedStaticNarrow({
    memberNode: usage.node, parent: usage.parentPath.node, meta, path: usage, adapter, resolvePure: resolve,
  });
  check(`${ parser.name }: ${ name }: captured receiver`, Boolean(plan.captureReceiver), capture);
  check(`${ parser.name }: ${ name }: one identity test`, plan.branches.length, 1);
}

// Only a possible static key needs the opaque family's walk. Unknown and branching global keys
// retain it, while ordinary instance and user keys must not pay for a query whose result is unused.
for (const parser of adapters) for (const method of ['usage-global', 'usage-pure']) {
  for (const [member, key, globalQuery, pureQuery] of [
    ['at', 'at', false, false],
    ['custom', 'custom', false, false],
    ['of', 'of', true, true],
    ['[flag ? "at" : "of"]', null, true, false],
    ['[key]', null, true, false],
  ]) {
    const spelling = member.startsWith('[') ? member : `.${ member }`;
    const program = parser.parseAndScope(`async function f() { for await (const value of [Array]) value${ spelling }(0); }`);
    collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
    const usage = parser.pickPath(program, 'MemberExpression', path => path.parentPath?.node.type === 'CallExpression');
    const query = CENSUS_STATIC_RECEIVERS.get(program.node);
    let queries = 0;
    CENSUS_STATIC_RECEIVERS.set(program.node, receiver => {
      queries++;
      return query(receiver);
    });
    const adapter = parser.name === 'babel' ? createBabelAdapter({ method }) : createEstreeAdapter({ method });
    if (method === 'usage-global') {
      collectMemberUnionCandidates({
        objectNode: usage.node.object, computedKeyNode: usage.node.computed ? usage.node.property : null,
        primaryObject: null, primaryKey: key, scope: usage.scope, adapter, path: usage,
      });
    } else {
      handleMemberExpressionNode({
        node: usage.node, path: usage, scope: usage.scope, adapter, resolvePure: resolve,
        handledObjects: new WeakSet(), suppressProxyGlobals: new WeakSet(),
      });
    }
    check(`${ parser.name }: ${ method }: ${ member }: needs family query`, queries > 0, method === 'usage-global' ? globalQuery : pureQuery);
  }
}
for (const parser of adapters) {
  const program = parser.parseAndScope('const box = {}; export const result = Object.assign(box, { M: Map });').node;
  const { escapedCtorNames } = collectFileCensus(program, [escapedCtorReferencesReducer()]);
  check(`${ parser.name }/retained mutator result carries installed statics`, escapedCtorNames.has('Map', true), true);
}

// One unknown alias disproves a builtin callee. Expanding later cyclic alternatives
// eagerly turns this small graph into an exponential walk before the depth limit.
for (const parser of adapters) {
  const program = parser.parseAndScope('let fn = unknown; fn = fn.next; fn = fn.other; fn(Map);');
  let reads = 0;
  for (const path of parser.collectPaths(program, 'Identifier')) {
    const { name } = path.node;
    Object.defineProperty(path.node, 'name', { configurable: true, get() {
      if (++reads > 2000) throw new Error('Cyclic builtin candidates expanded after an unknown alternative');
      return name;
    } });
  }
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
  check(`${ parser.name }/unknown cyclic callee keeps argument escape`, escapedCtorNames.has('Map', true), true);
  checkTruthy(`${ parser.name }/builtin candidate walk stays bounded`, reads < 2000);
}

// Known property-writing builtins retain exactly the same constructor values as assignment.
for (const parser of adapters) for (const store of [
  'box.M = Map',
  'Object.defineProperty(box, "M", { value: Map })',
  'Object.defineProperties(box, { M: { value: Map } })',
  'Object.assign(box, { M: Map })',
  'Reflect.defineProperty(box, "M", { value: Map })',
  'Reflect.set(box, "M", Map)',
  'Reflect.set({}, "M", Map, box)',
  'Object.defineProperty.call(null, box, "M", { value: Map })',
  'Reflect.apply(Object.assign, null, [box, { M: Map }])',
  'const install = Object.defineProperty; install(box, "M", { value: Map })',
]) for (const reducers of orders) {
  const program = parser.parseAndScope(`function swap(box) { ${ store }; return box; } swap({}).M.groupBy;`).node;
  const { escapedCtorNames } = collectFileCensus(program, reducers());
  check(`${ parser.name }/${ store } carries installed statics`, escapedCtorNames.has('Map', true), true);
}
for (const parser of adapters) for (const call of [
  'Object.keys(Map)', 'Object.is(Map, Map)', 'Object.assign({}, { M: Map })',
  'Object.defineProperty({}, "M", { value: Map })',
  'const box = {}; Object.assign(box, { M: Map })',
  'const box = {}; Object.defineProperty(box, "M", { value: Map })',
]) {
  const program = parser.parseAndScope(`${ call };`).node;
  const { escapedCtorNames } = collectFileCensus(program, [escapedCtorReferencesReducer()]);
  check(`${ parser.name }/${ call } does not retain a namespace`, escapedCtorNames.has('Map', true), false);
}

finish();
