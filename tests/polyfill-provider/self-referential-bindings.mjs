// A binding read inside its own initializer (`const { at } = at`, `const { at } = at()`,
// `const value = value?.at`) holds nothing yet: the read is in its TDZ, or sees the hoisted
// `undefined`. Every walk that follows such a binding to its value comes back to the same binding,
// so it has to stop there and answer as for a value it cannot see - never recurse, never substitute
// one. Each walk is asked through the real plugin adapters, whose `getBinding` itself judges the
// looked-up binding, and each has a control proving a non-cyclic chain still resolves. `tsc` rejects
// the lexical sources (a block-scoped read before its declaration): that invalidity is the form.
import { createChecker } from './harness.mjs';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  proxyReceiverValueCanBeUndefined,
  realmYieldingCallView,
  resolveInlineCalleeFunction,
  resolveObjectName,
  withBindingLookupGuard,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { isSymbolDestructureAliasBinding } from '../../packages/core-js-polyfill-provider/helpers/class-walk.js';

const { check, checkTruthy, runBoth, finish } = createChecker('self-referential-bindings');

// --- the in-flight guard itself ---
// what a question answers, or the name of what it threw: a guard that throws fails its own row
function answer(question) {
  try {
    return question();
  } catch (error) {
    return `threw ${ error.constructor.name }`;
  }
}

// a question re-entered while it runs answers undefined, whatever its owner - none included, since an
// adapter can answer a lookup from the path alone - and the name is released however the question ends
{
  const owner = {};
  check('guard: an ownerless question runs', answer(() => withBindingLookupGuard(undefined, 'at', () => 'answer')), 'answer');
  check('guard: an ownerless re-entry is refused',
    answer(() => withBindingLookupGuard(undefined, 'at', () => withBindingLookupGuard(null, 'at', () => 'inner'))), undefined);
  check('guard: another name under the same owner runs',
    answer(() => withBindingLookupGuard(owner, 'at', () => withBindingLookupGuard(owner, 'flat', () => 'inner'))), 'inner');
  check('guard: the same name under another owner runs',
    answer(() => withBindingLookupGuard(owner, 'at', () => withBindingLookupGuard({}, 'at', () => 'inner'))), 'inner');
  answer(() => withBindingLookupGuard(owner, 'at', () => {
    throw new Error('question failed');
  }));
  check('guard: a name is released after a throw', answer(() => withBindingLookupGuard(owner, 'at', () => 'again')), 'again');
  // the Symbol.X alias judgment asked with no scope: the alias hop's lookup runs ownerless
  const declarator = {
    type: 'VariableDeclarator',
    id: { type: 'ObjectPattern', properties: [{ type: 'Property', key: { type: 'Identifier', name: 'iterator' }, value: { type: 'Identifier', name: 'iterator' } }] },
    init: { type: 'Identifier', name: 'S' },
  };
  check('guard: a scopeless alias hop judges', answer(() => isSymbolDestructureAliasBinding({
    info: { source: 'actual/symbol/iterator' },
    binding: { path: { node: declarator }, constantViolations: [], name: 'iterator' },
    scope: null,
    adapter: { hasBinding: () => false, getBinding: () => null },
    injector: null,
  })), false);
}

function makeAdapter(parser, getInjector, method = 'usage-pure') {
  return (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method, getInjector });
}

function pickNamed(parser, program, types, name) {
  for (const type of types) {
    const found = parser.pickPath(program, type, path => {
      const { node } = path;
      const target = node.callee ?? node.tag ?? node.object ?? node;
      return target?.type === 'Identifier' && target.name === name;
    });
    if (found) return found;
  }
  return null;
}

// --- the Symbol.X alias judgment inside `getBinding` ---
// an instance extraction registers its pattern-bound name with the pure source, and both adapters
// then judge every lookup of that name as a possible Symbol.X alias by walking the init back to
// the same lookup
function registryOf(entries) {
  return () => ({
    getBindingInfo: name => entries[name] ? { source: `@core-js/pure/actual/${ entries[name] }`, hint: name, userNamed: true } : null,
    getBindingAliasInfo: () => null,
  });
}

for (const [source, names] of [
  ['const { at } = at;', ['at']],
  ['let { at } = at;', ['at']],
  ['var { at } = at;', ['at']],
  ['let at; ({ at } = at);', ['at']],
  ['const { at = at } = at;', ['at']],
  ['const { at } = c ? at : [];', ['at']],
  ['const { at: a } = b, { at: b } = a;', ['a', 'b']],
  ['const { at } = at as any;', ['at']],
  ['const { at } = at!;', ['at']],
]) runBoth(`symbol alias judgment: ${ source }`, source, (parser, program, label) => {
  const adapter = makeAdapter(parser, registryOf(Object.fromEntries(names.map(name => [name, 'instance/at']))));
  for (const name of names) {
    const read = pickNamed(parser, program, ['Identifier'], name);
    check(`${ label }: ${ name } is no Symbol.X alias`, adapter.getBinding(read.scope, name, read)?.aliasSymbolSource, null);
  }
});

// ... and a Symbol.X alias registers its name for the scope it serves, so a self-referential SHADOW of
// it in a nested scope is judged against that record too - the shadow is no alias, the outer one stays
runBoth('symbol alias judgment: a self-referential shadow of a Symbol.X alias',
  'const { iterator } = Symbol; { const { iterator } = iterator; x[iterator]; } y[iterator];', (parser, program, label) => {
    const adapter = makeAdapter(parser, registryOf({ iterator: 'symbol/iterator' }));
    const [inner, outer] = parser.collectPaths(program, 'MemberExpression').map(path => path.get('property'));
    check(`${ label }: the shadow`, adapter.getBinding(inner.scope, 'iterator', inner)?.aliasSymbolSource, null);
    check(`${ label }: the alias`, adapter.getBinding(outer.scope, 'iterator', outer)?.aliasSymbolSource, '@core-js/pure/actual/symbol/iterator');
  });

runBoth('symbol alias judgment control: an alias of Symbol still folds',
  'const S = Symbol; const { iterator } = S; x[iterator];', (parser, program, label) => {
    const adapter = makeAdapter(parser, registryOf({ iterator: 'symbol/iterator' }));
    const read = parser.pickPath(program, 'MemberExpression').get('property');
    check(label, adapter.getBinding(read.scope, 'iterator', read)?.aliasSymbolSource, '@core-js/pure/actual/symbol/iterator');
  });

// --- the inline callee walk through a pattern slot ---
// the slot a pattern-bound callee holds is paired from its declarator's init, and a call init naming
// the binding itself pairs through the same callee again
for (const [source, types, name] of [
  ['const { at } = at();', ['CallExpression'], 'at'],
  ['var { at } = at();', ['CallExpression'], 'at'],
  ['const { at } = at?.();', ['OptionalCallExpression', 'CallExpression'], 'at'],
  ['const { at } = at``;', ['TaggedTemplateExpression'], 'at'],
  ['const { at: a } = b(), { at: b } = a();', ['CallExpression'], 'b'],
  ['for (;;) { var { at } = at(); break; }', ['CallExpression'], 'at'],
  ['for (;;) { let { at } = at(); break; }', ['CallExpression'], 'at'],
  ['const { at } = (at as any)();', ['CallExpression'], 'at'],
]) runBoth(`pattern-bound callee: ${ source }`, source, (parser, program, label) => {
  const call = pickNamed(parser, program, types, name) ?? parser.pickPath(program, types[0]);
  const hop = { node: call.node, readNode: call.node, seen: new Set(), ctx: { scope: call.scope, adapter: makeAdapter(parser), path: call } };
  check(label, resolveInlineCalleeFunction(hop), null);
});

for (const [source, type] of [
  ['const { at } = new at();', 'NewExpression'],
  ['async function f() { const { at } = await at(); }', 'AwaitExpression'],
  ['async function f() { async function make() { return at(); } const { at } = await make(); }', 'AwaitExpression'],
]) runBoth(`pattern-bound callee view: ${ source }`, source, (parser, program, label) => {
  const node = parser.pickPath(program, type);
  check(label, realmYieldingCallView(node.node, { scope: node.scope, adapter: makeAdapter(parser), path: node }), null);
});

// ... and usage-global reads a returned call as what ITS callee yields, so a factory returning a call
// of the binding reaches the same slot from the other end
runBoth('pattern-bound callee through a returned call', 'function make() { return at(); } const { at } = make();',
  (parser, program, label) => {
    const call = pickNamed(parser, program, ['CallExpression'], 'make');
    const adapter = makeAdapter(parser, undefined, 'usage-global');
    check(label, resolveObjectName({ objectNode: call.node, scope: call.scope, adapter, path: call }), null);
  });

runBoth('pattern-bound callee control: a factory slot still resolves',
  'function factory() { return { make: () => globalThis }; } const { make } = factory(); make();', (parser, program, label) => {
    const call = pickNamed(parser, program, ['CallExpression'], 'make');
    const hop = { node: call.node, readNode: call.node, seen: new Set(), ctx: { scope: call.scope, adapter: makeAdapter(parser), path: call } };
    check(label, resolveInlineCalleeFunction(hop)?.node.type, 'ArrowFunctionExpression');
  });

// --- the undefinability walk through an alias ---
// the OBJECT of the `?.` read spelling `property` - the question the probe renders ask of it
function pickOptionalObject(parser, program, property) {
  return parser.pickPath(program, parser.name === 'babel' ? 'OptionalMemberExpression' : 'MemberExpression',
    path => path.node.optional && path.node.property?.name === property).get('object');
}

// a build backing no global with a ponyfill: an environment probe stays absent-able
function resolvePure() {
  return null;
}

// an alias is as absent-able as the value it holds, and a held `?.` navigation asks the same
// question of its own object - the alias itself where the value reads its own binding
for (const source of [
  'const value = value?.at;',
  'let value = value?.at;',
  'var value = value?.at;',
  'let value; value = value?.at;',
  'let value; value = value?.x; value?.at;',
  'for (;;) { let value = value?.at; break; }',
  'const value = (value as any)?.at;',
]) runBoth(`held-value undefinability: ${ source }`, source, (parser, program, label) => {
  const read = pickOptionalObject(parser, program, 'at');
  const aliasCtx = { scope: read.scope, adapter: makeAdapter(parser), path: read };
  check(label, proxyReceiverValueCanBeUndefined(read.node, resolvePure, aliasCtx), false);
});

// ... and an alias cycle with no `?.` between its links stays inside one walk's loop, which the same
// entered values end
runBoth('held-value undefinability: an alias cycle', 'const a = b, b = a; a?.at;', (parser, program, label) => {
  const read = pickOptionalObject(parser, program, 'at');
  const aliasCtx = { scope: read.scope, adapter: makeAdapter(parser), path: read };
  check(label, proxyReceiverValueCanBeUndefined(read.node, resolvePure, aliasCtx), false);
});

runBoth('held-value undefinability: mutual aliases', 'const v = w?.at, w = v?.at;', (parser, program, label) => {
  const read = pickOptionalObject(parser, program, 'at');
  const aliasCtx = { scope: read.scope, adapter: makeAdapter(parser), path: read };
  check(label, proxyReceiverValueCanBeUndefined(read.node, resolvePure, aliasCtx), false);
});

runBoth('held-value undefinability control: an alias of an environment probe still counts',
  'let held; held = globalThis.window?.self; held?.at;', (parser, program, label) => {
    const read = pickOptionalObject(parser, program, 'at');
    const aliasCtx = { scope: read.scope, adapter: makeAdapter(parser), path: read };
    checkTruthy(label, proxyReceiverValueCanBeUndefined(read.node, resolvePure, aliasCtx));
  });

finish();
