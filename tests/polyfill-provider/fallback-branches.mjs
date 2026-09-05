// Decision tests for the branching-receiver funnel: which branch of a conditional / logical init may
// carry a static (`isViableBranchForKey`), and which PATH the branch enumeration answers for at all
// (`enumerateFallbackDestructureBranches`). both run through both parsers - a decision that differs
// between them is a regression whichever side is wrong
import {
  enumerateFallbackDestructureBranches,
  isViableBranchForKey,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
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

finish();
