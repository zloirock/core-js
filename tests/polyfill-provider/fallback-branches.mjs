// Decision tests for the branching-receiver funnel: which branch of a conditional / logical init may
// carry a static (`isViableBranchForKey`), and which PATH the branch enumeration answers for at all
// (`enumerateFallbackDestructureBranches`). both run through both parsers - a decision that differs
// between them is a regression whichever side is wrong
import {
  buildParameterArgumentSynthPlan,
  enumerateFallbackDestructureBranches,
  fallbackBranchSwapKeepsSelection,
  instanceSynthReceiverPure,
  isViableBranchForKey,
  selectionLeftAlwaysTruthy,
  resolveBranchProxyName,
  paramDefaultInstanceSynthAllowed,
  planSynthReceiverGuard,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createDetectionAdapter } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('fallback-branches');

// the plugin-shaped adapter surface these walks consult: the binding lookups the value canon follows
// an alias through, the literal predicates, and the mutation hook (nothing is mutated here)
function pluginAdapter(adapter, method = 'usage-pure') {
  return {
    ...adapter,
    method,
    isStringLiteral(node) { return node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'); },
    getStringValue(node) { return node.value; },
    hasBinding({ scope, name }) { return !!scope?.getBinding?.(name); },
    getBinding({ scope, name }) { return scope?.getBinding?.(name) ?? null; },
    isMutatedStatic() { return false; },
  };
}

const PURE = {
  'Promise.all': { entry: 'promise/all', hintName: 'Promise$all', kind: 'static' },
  'Array.from': { entry: 'array/from', hintName: 'Array$from', kind: 'static' },
  'Object.from': null,
};
function resolvePure(meta) {
  return meta?.kind === 'property' && meta.placement === 'static' ? PURE[`${ meta.object }.${ meta.key }`] ?? null : null;
}

function propType(adapter) {
  return adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
}

// --- isViableBranchForKey ---

// a BOUND branch name is the value canon's question: a const alias of a global resolves to it and
// carries the static like the bare name, so the mirror answers the alias branch too
runBoth('viable/const alias of a global carries the static', 'const P = Promise; const { all } = cond ? P : Fallback;', (adapter, prog, lbl) => {
  const ternary = adapter.pickPath(prog, 'ConditionalExpression');
  const pure = isViableBranchForKey({
    branch: ternary.node.consequent, key: 'all', scope: ternary.scope, adapter: pluginAdapter(adapter), resolvePure, path: ternary,
  });
  check(lbl, pure?.entry, 'promise/all');
});

// ... and the bare name answers the same
runBoth('viable/bare global carries the static', 'const { all } = cond ? Promise : Fallback;', (adapter, prog, lbl) => {
  const ternary = adapter.pickPath(prog, 'ConditionalExpression');
  const pure = isViableBranchForKey({
    branch: ternary.node.consequent, key: 'all', scope: ternary.scope, adapter: pluginAdapter(adapter), resolvePure, path: ternary,
  });
  check(lbl, pure?.entry, 'promise/all');
});

// a SHADOW resolves to no global - the branch is the user's own object and stays raw
runBoth('viable/parameter shadow declines', 'function f(Promise) { const { all } = cond ? Promise : Fallback; }', (adapter, prog, lbl) => {
  const ternary = adapter.pickPath(prog, 'ConditionalExpression');
  const pure = isViableBranchForKey({
    branch: ternary.node.consequent, key: 'all', scope: ternary.scope, adapter: pluginAdapter(adapter), resolvePure, path: ternary,
  });
  check(lbl, pure, null);
});

// an alias of a NON-global is nothing the mirror may swap
runBoth('viable/alias of a user value declines', 'const P = userValue; const { all } = cond ? P : Fallback;', (adapter, prog, lbl) => {
  const ternary = adapter.pickPath(prog, 'ConditionalExpression');
  const pure = isViableBranchForKey({
    branch: ternary.node.consequent, key: 'all', scope: ternary.scope, adapter: pluginAdapter(adapter), resolvePure, path: ternary,
  });
  check(lbl, pure, null);
});

// the branch that carries no such static answers nothing, whatever the other branch carries
runBoth('viable/branch without the static declines', 'const { all } = cond ? Promise : Fallback;', (adapter, prog, lbl) => {
  const ternary = adapter.pickPath(prog, 'ConditionalExpression');
  const pure = isViableBranchForKey({
    branch: ternary.node.alternate, key: 'all', scope: ternary.scope, adapter: pluginAdapter(adapter), resolvePure, path: ternary,
  });
  check(lbl, pure, null);
});

// --- enumerateFallbackDestructureBranches: the walk answers for a DESTRUCTURE leaf only ---

const INDIRECT = 'const cond = 1; function pick() { return cond ? Array : Object; } const out = pick(input.from); const { from } = pick();';

// a MEMBER read handed over by the indirection backstop is no destructure leaf: its grandparent's
// slot holds the whole init the member merely sits in, and resolving that as the receiver named
// statics the member never read
runBoth('enumerate/member path answers nothing', INDIRECT, (adapter, prog, lbl) => {
  const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'from');
  const meta = { kind: 'property', object: null, key: 'from', placement: null };
  const branches = enumerateFallbackDestructureBranches(meta, member, pluginAdapter(adapter, 'usage-global'), { followIndirection: true });
  check(lbl, branches, null);
});

// ... while the destructure leaf of the same call enumerates both branches of the callee's return
runBoth('enumerate/destructure leaf enumerates the branches', INDIRECT, (adapter, prog, lbl) => {
  const prop = adapter.pickPath(prog, propType(adapter), p => p.parent?.type === 'ObjectPattern');
  const meta = { kind: 'property', object: null, key: 'from', placement: null };
  const branches = enumerateFallbackDestructureBranches(meta, prop, pluginAdapter(adapter, 'usage-global'), { followIndirection: true });
  checkDeep(lbl, branches?.map(branch => branch.object), ['Array', 'Object']);
});

// The receiver spelling must not decide whether an instance slot gets its helper. A pure
// constructor navigation can replace the receiver whole; effects, a live guard, or a changed
// global slot cannot be discarded by this flat synth.
for (const [label, source, allowed, pureName, mutated = false] of [
  ['bare constructor', 'function take({ name } = Symbol) {}', true, 'Symbol'],
  ['member constructor', 'function take({ name } = globalThis.Symbol) {}', true, 'Symbol'],
  ['computed constructor', 'function take({ name } = globalThis["Symbol"]) {}', true, 'Symbol'],
  ['realm alias', 'const realm = globalThis; function take({ name } = realm.Symbol) {}', true, 'Symbol'],
  ['proxy hop', 'function take({ name } = globalThis.self.Symbol) {}', true, 'Symbol'],
  ['two slots', 'function take({ name, length } = globalThis.Symbol) {}', true, 'Symbol'],
  ['shadowed root', 'function take(globalThis, { name } = globalThis.Symbol) {}', true, null],
  ['absent probe', 'function take({ name } = globalThis.window?.Symbol) {}', false, null],
  ['sealed probe', 'function take({ name } = (globalThis.window?.self).Symbol) {}', false, null],
  ['key effect', 'function take({ name } = globalThis[(tick(), "Symbol")]) {}', false, null],
  ['root effect', 'function take({ name } = (tick(), globalThis).Symbol) {}', false, null],
  ['changed slot', 'function take({ name } = globalThis.Symbol) {}', false, null, true],
]) runBoth(`instance synth/${ label }`, source, (adapter, prog, lbl) => {
  const assignment = adapter.pickPath(prog, 'AssignmentPattern');
  const receiver = unwrapRuntimeExpr(assignment.node.right);
  const ctx = {
    scope: assignment.scope, path: assignment,
    adapter: {
      ...pluginAdapter(adapter),
      isMutatedStatic(object, key) { return mutated && object === 'globalThis' && key === 'Symbol'; },
    },
    resolvePure(meta) {
      return meta.kind === 'global' && ['Symbol', 'globalThis', 'self'].includes(meta.name)
        ? { kind: 'global', entry: meta.name, hintName: meta.name } : null;
    },
  };
  check(`${ lbl } gate`, paramDefaultInstanceSynthAllowed({
    objectPatternNode: assignment.node.left, receiverNode: receiver, ...ctx,
  }), allowed);
  check(`${ lbl } binding`, instanceSynthReceiverPure(receiver, ctx)?.entry ?? null, pureName);
});

// Static receivers use the same scoped value handoff; uncertain or observable reads stay native.
for (const [label, source, expected, mutated = false] of [
  ['direct static', 'function take(x = Number.MAX_SAFE_INTEGER) {}', 'number/max-safe-integer'],
  ['proxy static', 'function take(x = globalThis.Number.MAX_SAFE_INTEGER) {}', 'number/max-safe-integer'],
  ['typed proxy static', 'function take(x = (globalThis as any).Number.MAX_SAFE_INTEGER) {}', 'number/max-safe-integer'],
  ['constant alias static', 'const N = Number; function take(x = N.MAX_SAFE_INTEGER) {}', 'number/max-safe-integer'],
  ['shadowed static', 'function take(Number, x = Number.MAX_SAFE_INTEGER) {}', null],
  ['getter receiver', 'const box = { get Number() { return Number; } }; function take(x = box.Number.MAX_SAFE_INTEGER) {}', null],
  ['typed getter receiver', 'const box: { Number: NumberConstructor } = { get Number() { return Number; } }; function take(x = (box as any).Number.MAX_SAFE_INTEGER) {}', null],
  ['typed parameter receiver', 'function take(Number: NumberConstructor, x = (Number as any).MAX_SAFE_INTEGER) {}', null],
  ['effectful static key', 'function take(x = Number[(tick(), "MAX_SAFE_INTEGER")]) {}', null],
  ['effectful static receiver', 'function take(x = (tick(), Number).MAX_SAFE_INTEGER) {}', null],
  ['guarded static receiver', 'function take(x = globalThis.window?.Number.MAX_SAFE_INTEGER) {}', null],
  ['sealed static receiver', 'function take(x = (globalThis.window?.self).Number.MAX_SAFE_INTEGER) {}', null],
  ['typed deep sealed receiver', 'function take(x = (globalThis.window?.self as any).Number.MAX_SAFE_INTEGER) {}', null],
  ['mixed static receiver', 'function take(x = (cond ? Number : Other).MAX_SAFE_INTEGER) {}', null],
  ['mutable static alias', 'let N = Number; function write() { N = Other; } function take(x = N.MAX_SAFE_INTEGER) {}', null],
  ['mutated static', 'function take(x = Number.MAX_SAFE_INTEGER) {}', null, true],
]) runBoth(`instance receiver handoff/${ label }`, source, (parser, program, row) => {
  const assignment = parser.pickPath(program, 'AssignmentPattern');
  const adapter = { ...pluginAdapter(parser), isMutatedStatic: () => mutated };
  const pure = instanceSynthReceiverPure(assignment.node.right, {
    adapter,
    scope: assignment.scope,
    path: assignment,
    resolvePure(meta) {
      return meta.kind === 'property' && meta.object === 'Number' && meta.key === 'MAX_SAFE_INTEGER'
        ? { kind: 'static', entry: 'number/max-safe-integer', hintName: 'Number$MAX_SAFE_INTEGER' } : null;
    },
  });
  check(row, pure?.entry ?? null, expected);
});

// A logical left observes the receiver's nullish value even when the logical itself is
// a parameter default. It may synthesize a method only while retaining that selection.

for (const [label, source, selection, guarded, viable, mutated = false] of [
  ['optional nullish left', 'const { from } = globalThis.window?.Array ?? Object;', true, true, true],
  ['parameter default', 'function f({ from } = globalThis.window?.Array ?? Object) {}', true, true, true],
  ['inner default', 'const { x: { from } = globalThis.window?.Array || Object } = {};', true, true, true],
  ['effectful left', 'const { from } = (tick(), globalThis).window?.Array ?? Object;', true, true, true],
  ['bare probe', 'const { from } = globalThis.window ?? Object;', false, false, false],
  ['sealed left', 'const { from } = (globalThis.window?.self).Array ?? Object;', true, false, true],
  ['defined left', 'const { from } = Array ?? Object;', true, false, true],
  ['shadowed root', 'function f(globalThis) { const { from } = globalThis.window?.Array ?? Object; }', true, false, false],
  ['changed static', 'const { from } = globalThis.window?.Array ?? Object;', true, true, false, true],
]) runBoth(`branch guard/${ label }`, source, (adapter, prog, lbl) => {
  const logical = adapter.pickPath(prog, 'LogicalExpression');
  const ctx = {
    scope: logical.scope, path: logical,
    adapter: {
      ...pluginAdapter(adapter),
      isMutatedStatic(object, key) { return mutated && object === 'Array' && key === 'from'; },
    },
    resolvePure(meta) {
      if (meta.kind !== 'global') return resolvePure(meta);
      return ['globalThis', 'self'].includes(meta.name) ? { entry: meta.name, hintName: meta.name } : null;
    },
  };
  check(`${ lbl } selection`, fallbackBranchSwapKeepsSelection({
    hostNode: logical.node, slot: 'left', branchNode: logical.node.left, ...ctx,
  }), selection);
  check(`${ lbl } guard`, !!planSynthReceiverGuard({ receiver: logical.node.left, ...ctx }), guarded);
  check(`${ lbl } static`, !!isViableBranchForKey({ branch: logical.node.left, key: 'from', ...ctx }), viable);
});

// --- selectionLeftAlwaysTruthy ---

// the dead right arm of a `||` / `??` is the plan's own question: its leaf walk over its root
// classification, asked of the left operand - an IIFE handing back a static container and a named call
// proven to yield the realm are truthy exactly as the flat static and the realm are; a falsy binding
// and an unbacked key off the realm keep the right arm live. a constructor read off the realm - directly,
// through an alias, a destructured binding or a call returning such a read - decides only where the build
// serves its global: an engine lacking it reads `undefined` there, while the bare name, or an alias or a call
// returning it, throws before the right could run; a call the inline canon cannot see through decides nothing
const SERVES_ALL = { served: () => ({ substituted: false }) };
for (const [name, source, expected, build = null] of [
  ['empty string', "const { at } = '' || [1];", false],
  ['nonempty string', "const { at } = 'text' || [1];", true],
  ['zero', 'const { at } = 0 || [1];', false],
  ['nonzero number', 'const { at } = 1 || [1];', true],
  ['false', 'const { at } = false || [1];', false],
  ['true', 'const { at } = true || [1];', true],
  ['null', 'const { at } = null || [1];', false],
  ['static container', 'const b = { Array }; const { Array: { of } } = b || globalThis;', true],
  ['iife over a static alias', 'const b = { Array }; const { Array: { of } } = (() => b)() || globalThis;', true],
  ['named call yielding the realm', 'function realm() { return globalThis; } const { Array: { of } } = realm() || globalThis;', true],
  ['the realm', 'const { Array: { of } } = globalThis || shim;', true],
  ['falsy binding', 'let m = 0; const { Array: { of } } = m || globalThis;', false],
  ['unbacked key off the realm', 'const shim = globalThis.shim; const { Array: { of } } = shim || globalThis;', false],
  ['bare constructor', 'const { from } = WeakRef || Array;', true],
  ['constructor off the realm the build lacks', 'const { from } = globalThis.WeakRef || Array;', false, SERVES_ALL],
  ['constructor off the realm the build serves', 'const { from } = globalThis.Map || Array;', true, SERVES_ALL],
  ['constructor off the realm with no build', 'const { from } = globalThis.Map || Array;', false],
  ['global core-js extends in place off the realm', 'const { from } = globalThis.Array || Set;', true, SERVES_ALL],
  ['global without a definition off the realm', 'const { CompileError } = globalThis.WebAssembly || Set;', false, SERVES_ALL],
  ['alias of a realm read', 'const Ref = globalThis.WeakRef; const { from } = Ref || Array;', false, SERVES_ALL],
  ['destructured realm read', 'const { WeakRef: Ref } = globalThis; const { from } = Ref || Array;', false, SERVES_ALL],
  ['alias of a bare name', 'const Ref = WeakRef; const { from } = Ref || Array;', true, SERVES_ALL],
  ['alias of a served realm read', 'const M = globalThis.Map; const { from } = M || Array;', true, SERVES_ALL],
  ['call returning a realm read the build lacks', 'const get = () => globalThis.WeakRef; const { from } = get() || Array;', false, SERVES_ALL],
  ['call returning a bare name', 'const get = () => WeakRef; const { from } = get() || Array;', true, SERVES_ALL],
  ['call returning a served realm read', 'const get = () => globalThis.Map; const { from } = get() || Array;', true, SERVES_ALL],
  ['call the inline canon cannot see through', 'const { from } = make() || Array;', false, SERVES_ALL],
]) {
  runBoth(`truthy left/${ name }`, source, (adapter, prog, lbl) => {
    const logical = adapter.pickPath(prog, 'LogicalExpression');
    check(lbl, selectionLeftAlwaysTruthy({
      node: logical.node.left, scope: logical.scope, adapter: { ...pluginAdapter(adapter), ...build }, path: logical, resolvePure,
    }), expected);
  });
}

// A literal value held by a stable source binding decides a selection through the same shared
// adapter both emitters use. The decision names the operand whose exact VALUE the expression yields:
// a dead right folds to the left node, including a falsy or negative-zero left.
const CONSTANT_SELECTION_VALUES = [
  ['empty', "''", false],
  ['zero', '0', false],
  ['falseValue', 'false', false],
  ['negativeZero', '-0', false],
  ['one', '1', true],
  ['text', "'a'", true],
  ['big', '1n', true],
];
const constantSelectionExpressions = CONSTANT_SELECTION_VALUES.flatMap(([name]) => [
  `${ name } && rhs`,
  `${ name } || rhs`,
  `${ name } ?? rhs`,
]).concat(['yes ? Map : Object', 'no ? Object : Map']);
const constantSelectionSource = `${ CONSTANT_SELECTION_VALUES.map(([name, literal]) => `const ${ name } = ${ literal };`).join('\n') }
const yes = true;
const no = false;
use(${ constantSelectionExpressions.join(', ') });`;

function constantSelectionBridge(parser, method = 'usage-pure') {
  const adapter = createDetectionAdapter({
    method,
    resolveConstantSelection: (...args) => resolver.resolveConstantSelection(...args),
  }, () => pluginAdapter(parser, method));
  const resolver = parser.makeResolver({ getDecisionAdapter: () => adapter });
  return { adapter, resolver };
}

for (const [name, source] of [
  ['literal', "const result = (function ({ includes } = '' && [2]) { return includes; })();"],
  ['stable alias', "const empty = ''; const result = (function ({ includes } = empty && [2]) { return includes; })();"],
]) runBoth(`constant selection/decided non-nullish ${ name } default keeps its sole instance read eager`,
  source, (parser, program, label) => {
    const { adapter, resolver } = constantSelectionBridge(parser);
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath: parser.pickPath(program, 'ObjectPattern'),
      adapter,
      parameterCallSites: resolver.parameterCallSites,
      meta: { kind: 'property', object: 'String', key: 'includes', placement: 'prototype' },
      resolvePure: meta => meta.key === 'includes'
        ? { kind: 'instance', entry: 'string/instance/includes', hintName: 'includesMaybeString' } : null,
    });
    const target = plan?.targets?.[0];
    check(`${ label } planned`, !!target, true);
    check(`${ label } no nullish wrapper`, target?.preserveNullishReceiver, undefined);
    check(`${ label } data property`, target?.tree?.entries?.[0]?.deferred, false);
  });

for (const [name, source] of [
  ['mutated alias', "let empty = ''; empty = getValue(); const result = (function ({ includes } = empty && [2]) { return includes; })();"],
  ['opaque alias', 'const empty = getValue(); const result = (function ({ includes } = empty && [2]) { return includes; })();'],
]) runBoth(`constant selection/undecided ${ name } default preserves its receiver`, source, (parser, program, label) => {
  const { adapter, resolver } = constantSelectionBridge(parser);
  const plan = buildParameterArgumentSynthPlan({
    leafPatternPath: parser.pickPath(program, 'ObjectPattern'),
    adapter,
    parameterCallSites: resolver.parameterCallSites,
    meta: { kind: 'property', object: 'String', key: 'includes', placement: 'prototype' },
    resolvePure: meta => meta.key === 'includes'
      ? { kind: 'instance', entry: 'string/instance/includes', hintName: 'includesMaybeString' } : null,
  });
  const target = plan?.targets?.[0];
  check(`${ label } planned`, !!target, true);
  check(`${ label } keeps the whole logical source`, target?.node.type, 'LogicalExpression');
  check(`${ label } keeps the AND selection`, target?.node.operator, '&&');
  check(`${ label } dispatches on that selected receiver`, target?.receiverNode, target?.node);
  check(`${ label } nullish wrapper`, target?.preserveNullishReceiver, true);
  // The receiver guard runs first. With no preceding pattern work, its sole instance read
  // belongs in a data slot at the source read position.
  check(`${ label } data property after receiver guard`, target?.tree?.entries?.[0]?.deferred, false);
});

runBoth('constant selection/all exact source values', constantSelectionSource, (parser, program, label) => {
  const { adapter } = constantSelectionBridge(parser);
  const paths = [
    ...parser.collectPaths(program, 'LogicalExpression'),
    ...parser.collectPaths(program, 'ConditionalExpression'),
  ].sort((a, b) => a.node.start - b.node.start);
  for (const [index, path] of paths.entries()) {
    const expression = constantSelectionExpressions[index];
    const conditional = expression.includes('?') && !expression.includes('??');
    let fold;
    if (conditional) fold = expression.startsWith('yes') ? 'consequent' : 'alternate';
    else {
      const [name, operator] = expression.split(' ', 2);
      const { 2: truthy } = CONSTANT_SELECTION_VALUES.find(entry => entry[0] === name);
      fold = operator === '&&' ? truthy ? 'right' : 'left'
        : operator === '||' ? truthy ? 'left' : 'right' : 'left';
    }
    checkDeep(`${ label }/${ expression }`, adapter.decidedSelection(path.node, {
      scope: path.scope, adapter, path,
    }), {
      skip: fold === 'left' ? 'right' : fold === 'consequent' ? 'alternate'
        : fold === 'alternate' ? 'consequent' : null,
      fold,
      substituted: false,
    });
  }
});

// The source must provide a runtime initializer which reaches the read. Type-only ambient values,
// uninitialised declarations, forward reads, loop bindings, visible writes and effectful tests retain
// their selection. A stable module const remains decidable inside a deferred function.
for (const [name, source, expected] of [
  ['stable alias chain', 'const base = true; const flag = base; use(flag ? Array : String);', 'consequent'],
  ['stable deferred read', 'const flag = true; function read() { return flag ? Array : String; }', 'consequent'],
  ['mutated binding', 'let flag = true; flag = false; use(flag ? Array : String);', null],
  ['opaque parameter', 'function read(flag) { return flag ? Array : String; }', null],
  ['deferred read after mutation', 'let flag = true; function read() { return flag ? Array : String; } flag = false;', null],
  ['forward TDZ read', 'use(flag ? Array : String); const flag = true;', null],
  ['effectful test', 'use((hit(), true) ? Array : String);', null],
  ['loop binding', 'for (const flag of flags) use(flag ? Array : String);', null],
  ['uninitialised let', 'let flag; use(flag ? Array : String);', null],
  ['uninitialised var loop head', 'for (var flag; flag; ) use(flag ? Array : String);', null],
  ['ambient literal type', 'declare const flag: true; use(flag ? Array : String);', null],
]) runBoth(`constant selection/control ${ name }`, source, (parser, program, label) => {
  const { adapter } = constantSelectionBridge(parser);
  const path = parser.pickPath(program, 'ConditionalExpression');
  check(`${ label }/fold`, adapter.decidedSelection(path.node, { scope: path.scope, adapter, path })?.fold ?? null, expected);
});

// The new read anchor is opt-in. Existing computed-key resolution still reads a literal type
// annotation when no runtime selection asks it to replace the ambient binding's GetValue.
runBoth('constant selection/legacy computed key keeps ambient annotation',
  "declare const key: 'at'; receiver[key];", (parser, program, label) => {
    const { resolver } = constantSelectionBridge(parser);
    const key = parser.pickPath(program, 'Identifier', path => path.node.name === 'key' && path.parent?.computed);
    check(label, resolver.resolveComputedKeyName(key.node, key.scope), 'at');
  });

// A complete literal caller set proves the parameter's initial value, not its value after
// a sloppy mapped-arguments access. Ask at the actual test even through an outer claim path:
// a destructuring RHS runs before its earlier-spelled computed key.
for (const [name, source, expected, sourceType = 'script'] of [
  ['true caller', 'function read(flag) { return flag ? Array : String; } read(true);', ['consequent']],
  ['false caller', 'function read(flag) { return flag ? Array : String; } read(false);', ['alternate']],
  ['nullish caller before effectful key',
    "function read(flag) { const { [(key(), 'at')]: method } = flag ? [1] : null; return method; } read(false);",
    ['alternate']],
  ['empty caller', "function read(flag) { return flag ? Array : String; } read('');", ['alternate']],
  ['bound literal caller', 'const yes = true; function read(flag) { return flag ? Array : String; } read(yes);', ['consequent']],
  ['call pairing', 'function read(flag) { return flag ? Array : String; } read.call(null, true);', ['consequent']],
  ['apply pairing', 'function read(flag) { return flag ? Array : String; } read.apply(null, [false]);', ['alternate']],
  ['spread caller', 'function read(flag) { return flag ? Array : String; } read(...[true]);', [null]],
  ['apply spread caller', 'function read(flag) { return flag ? Array : String; } read.apply(null, [...[true]]);', [null]],
  ['reflect apply spread caller', 'function read(flag) { return flag ? Array : String; } Reflect.apply(read, null, [...[true]]);', [null]],
  ['tag strings array', 'function read(flag) { return flag ? Array : String; } read``;', [null]],
  ['matching callers', 'function read(flag) { return flag ? Array : String; } read(true); read(true);', ['consequent']],
  ['mixed callers', 'function read(flag) { return flag ? Array : String; } read(true); read(false);', [null]],
  ['opaque caller', 'function read(flag) { return flag ? Array : String; } read(input);', [null]],
  ['recursive caller', 'function read(flag) { if (flag) read(flag); return flag ? Array : String; } read(true);', [null]],
  ['handed out binding', 'function read(flag) { return flag ? Array : String; } use(read); read(true);', [null]],
  ['named write', 'function read(flag) { flag = false; return flag ? Array : String; } read(true);', [null]],
  ['mapped prior write', 'function read(flag) { arguments[0] = false; return flag ? Array : String; } read(true);', [null]],
  ['mapped key and later read',
    "function read(flag) { const { [(arguments[0] = false, 'at')]: method } = flag ? [1] : 'text'; return flag ? Array : String; } read(true);",
    ['consequent', null]],
  ['late hidden callee', 'function read(flag) { const result = flag ? Array : String; if (flag) arguments.callee(false); return result; } read(true);', [null]],
  ['late arguments escape', 'function read(flag) { const result = flag ? Array : String; use(arguments); return result; } read(true);', [null]],
  ['duplicate parameters', 'function read(flag, flag) { return flag ? Array : String; } read(false, true);', [null]],
  ['arguments escape', 'function read(flag) { use(arguments); return flag ? Array : String; } read(true);', [null]],
  ['mapped read ceiling', `function read(flag) { const result = flag ? Array : String; ${ 'arguments[0];'.repeat(65) } return result; } read(true);`, [null]],
  ['loop after mapped write', 'function read(flag) { while (again) { use(flag ? Array : String); arguments[0] = false; } } read(true);', [null]],
  ['strict mapped prior write', "function read(flag) { 'use strict'; arguments[0] = false; return flag ? Array : String; } read(true);", ['consequent']],
  ['module mapped prior write', 'function read(flag) { arguments[0] = false; return flag ? Array : String; } read(true);', ['consequent'], 'module'],
]) runBoth(`constant selection/closed parameter ${ name }`, source, (parser, program, label) => {
  const { adapter } = constantSelectionBridge(parser);
  const paths = parser.collectPaths(program, 'ConditionalExpression');
  checkDeep(`${ label }/at test`, paths.map(path => adapter.decidedSelection(path.node, {
    scope: path.scope, adapter, path,
  })?.fold ?? null), expected);
  // A consuming claim commonly asks from the declarator or return, rather than the selection.
  checkDeep(`${ label }/from host`, paths.map(path => adapter.decidedSelection(path.node, {
    scope: path.scope, adapter, path: path.parentPath,
  })?.fold ?? null), expected);
}, undefined, sourceType);

// Proxy classification must agree with the selection the build already decided. Otherwise
// a dead && realm arm steals an outer fallback, which the nested receiver walk then loses.
for (const method of ['usage-global', 'usage-pure']) for (const [name, source, expected] of [
  ['false guard', 'const flag = false; use(flag && globalThis);', [null, null]],
  ['zero guard', 'let flag = 0; use(flag && globalThis);', [null, null]],
  ['empty guard', "const flag = ''; use(flag && globalThis);", [null, null]],
  ['truthy guard', 'const flag = 1; use(flag && globalThis);', ['globalThis', 'globalThis']],
  ['outer fallback', 'const flag = 0; use((flag && globalThis) || globalThis);', [null, 'globalThis']],
  ['conditional false arm', 'const flag = false; use(flag ? globalThis : other);', [null, null]],
  ['conditional true arm', 'const flag = true; use(flag ? globalThis : other);', ['globalThis', 'globalThis']],
  ['unknown guard keeps candidates', 'use(flag && globalThis);', ['globalThis', 'globalThis']],
  ['written guard keeps candidates', 'let flag = 0; flag = input; use(flag && globalThis);', ['globalThis', 'globalThis']],
  ['shadowed realm', 'const globalThis = {}; use(true && globalThis);', [null, null]],
]) runBoth(`decided proxy arm/${ method }/${ name }`, source, (parser, program, label) => {
  const { adapter } = constantSelectionBridge(parser, method);
  const use = parser.pickPath(program, 'CallExpression', path => path.node.callee?.name === 'use');
  checkDeep(label, [false, true].map(eitherLogicalOperand => resolveBranchProxyName({
    branchNode: use.node.arguments[0], scope: use.scope, adapter, path: use, eitherLogicalOperand,
  })), expected);
});

finish();
