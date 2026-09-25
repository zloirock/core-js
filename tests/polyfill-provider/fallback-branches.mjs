// Decision tests for the branching-receiver funnel: which branch of a conditional / logical init may
// carry a static (`isViableBranchForKey`), and which PATH the branch enumeration answers for at all
// (`enumerateFallbackDestructureBranches`). both run through both parsers - a decision that differs
// between them is a regression whichever side is wrong
import {
  enumerateFallbackDestructureBranches,
  fallbackBranchSwapKeepsSelection,
  instanceSynthReceiverPure,
  isViableBranchForKey,
  selectionLeftAlwaysTruthy,
  paramDefaultInstanceSynthAllowed,
  planSynthReceiverGuard,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
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
    hasBinding(scope, name) { return !!scope?.getBinding?.(name); },
    getBinding(scope, name) { return scope?.getBinding?.(name) ?? null; },
    getBindingNodeType(scope, name) { return scope?.getBinding?.(name)?.path?.node?.type ?? null; },
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
// and an unbacked key off the realm keep the right arm live
for (const [name, source, expected] of [
  ['static container', 'const b = { Array }; const { Array: { of } } = b || globalThis;', true],
  ['iife over a static alias', 'const b = { Array }; const { Array: { of } } = (() => b)() || globalThis;', true],
  ['named call yielding the realm', 'function realm() { return globalThis; } const { Array: { of } } = realm() || globalThis;', true],
  ['the realm', 'const { Array: { of } } = globalThis || shim;', true],
  ['falsy binding', 'let m = 0; const { Array: { of } } = m || globalThis;', false],
  ['unbacked key off the realm', 'const shim = globalThis.shim; const { Array: { of } } = shim || globalThis;', false],
]) {
  runBoth(`truthy left/${ name }`, source, (adapter, prog, lbl) => {
    const logical = adapter.pickPath(prog, 'LogicalExpression');
    check(lbl, selectionLeftAlwaysTruthy({
      node: logical.node.left, scope: logical.scope, adapter: pluginAdapter(adapter), path: logical, resolvePure,
    }), expected);
  });
}

finish();
