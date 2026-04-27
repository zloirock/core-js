// destructure-receiver detection: build polyfill meta for a destructured property given
// its init node. handles direct identifiers, member chains, sequences, logical / conditional
// fallbacks (with `fromFallback` flag), chain-assignment, string-literal init. exposes
// per-branch viability (`isViableBranchForKey`), branch enumeration for usage-global
// (`enumerateFallbackDestructureBranches`), and the parser-shape gate
// (`canTransformDestructuring`)
import {
  destructureReceiverSlot,
  getFallbackBranchSlots,
  isChainAssignment,
  peelFallbackReceiver,
  peelFallbackWrappers,
} from '../helpers/ast-patterns.js';
import { POSSIBLE_GLOBAL_OBJECTS } from '../helpers/class-walk.js';
import { KNOWN_FUNCTION_GLOBALS, KNOWN_NAMESPACE_GLOBALS } from './globals.js';
import { isStaticPlacement, resolveObjectName, unwrapParens } from './resolve.js';

// map a destructure source identifier to its runtime receiver type hint
// unknown identifiers return null so the resolver falls through to its default type-hint fold
function destructureReceiverHint(objectName) {
  if (!objectName) return null;
  if (KNOWN_FUNCTION_GLOBALS.has(objectName)) return 'function';
  if (KNOWN_NAMESPACE_GLOBALS.has(objectName) || POSSIBLE_GLOBAL_OBJECTS.has(objectName)) return 'object';
  return null;
}

// build meta for a destructuring property given its resolved init node + key.
// `receiverHint` lets resolveHint reject `const { includes } = Array` (instance method
// that doesn't exist on the constructor) while accepting `Array.from` and inherited
// Function/Object prototype methods like `name`/`toString`.
export function buildDestructuringInitMeta(initNode, key, scope, adapter) {
  if (!initNode) return { kind: 'property', object: null, key, placement: null };
  // oxc-parser preserves ParenthesizedExpression (Babel strips them)
  const unwrapped = unwrapParens(initNode);
  // branch handlers for binary / sequence / conditional shapes recurse with the per-branch
  // expression; pure positional resolution falls through to the type-specific cases below
  switch (unwrapped.type) {
    case 'LogicalExpression':
      return resolveLogicalDestructureMeta(unwrapped, key, scope, adapter);
    case 'SequenceExpression':
      // `(0, Array)`: sequence evaluates to its last expression
      return buildDestructuringInitMeta(unwrapped.expressions.at(-1), key, scope, adapter);
    case 'ConditionalExpression':
      return resolveConditionalDestructureMeta(unwrapped, key, scope, adapter);
    case 'AssignmentExpression':
      // chain `const { from } = foo = cond ? Array : Iterator` evaluates AssignmentExpression
      // to its RHS - recurse on right so meta tracks the actual destructure receiver
      if (isChainAssignment(unwrapped)) return buildDestructuringInitMeta(unwrapped.right, key, scope, adapter);
      break;
  }
  // `const { from } = Array` or `const { from } = globalThis.Array`
  if (unwrapped.type === 'Identifier' || unwrapped.type === 'MemberExpression'
    || unwrapped.type === 'OptionalMemberExpression') {
    const objectName = resolveObjectName(unwrapped, scope, adapter);
    const placement = objectName ? isStaticPlacement(objectName) : null;
    const receiverHint = placement === 'static' ? destructureReceiverHint(objectName) : null;
    return { kind: 'property', object: objectName, key, placement, receiverHint };
  }
  if (adapter.isStringLiteral(unwrapped)) {
    return { kind: 'property', object: 'string', key, placement: 'prototype' };
  }
  return { kind: 'property', object: null, key, placement: null };
}

// `Array ?? X`, `X ?? Array`, `X && Array`: try both branches, prefer the one
// that resolves to a known global (for `??`/`||` the fallback is usually on the right,
// for `&&` it's always the right).
// `fromFallback` disables the destructure replacement when the runtime value may come
// from either branch - `&&` is always conditional (primary only when left truthy, else
// falsy left), so always flag; `??`/`||` flag only when the fallback is the resolved side
function resolveLogicalDestructureMeta(node, key, scope, adapter) {
  const isAnd = node.operator === '&&';
  const primary = isAnd ? node.right : node.left;
  const meta = buildDestructuringInitMeta(primary, key, scope, adapter);
  if (meta.object) {
    if (!isAnd) return meta;
    // `X && Y` where both sides resolve to the SAME known object - runtime value is Y (which
    // is same as X for this property). no fromFallback needed, polyfill is safe to apply.
    // `X && Y` with different resolved objects still bails - `from = (X && Y).from` depends on
    // X's truthiness to pick between X.from and Y.from, different polyfills per branch
    const leftMeta = buildDestructuringInitMeta(node.left, key, scope, adapter);
    if (leftMeta.object === meta.object) return meta;
    return { ...meta, fromFallback: true };
  }
  // for `&&` both primary and fallback are the same (right), no point retrying
  if (isAnd) return meta;
  const fallback = buildDestructuringInitMeta(node.right, key, scope, adapter);
  return fallback.object ? { ...fallback, fromFallback: true } : fallback;
}

// `cond ? Array : Set`: try both branches; flag fromFallback so destructure replacement
// bails (the runtime value depends on `cond`). without this branching, the conditional
// would fall through to the positional case and miss polyfill resolution entirely
function resolveConditionalDestructureMeta(node, key, scope, adapter) {
  const consequent = buildDestructuringInitMeta(node.consequent, key, scope, adapter);
  const alternate = buildDestructuringInitMeta(node.alternate, key, scope, adapter);
  const resolved = consequent.object ? consequent : alternate.object ? alternate : null;
  return resolved ? { ...resolved, fromFallback: true } : consequent;
}

// per-branch synth-swap viability check: branch is a candidate for `{key: _Branch$key}`
// rewrite when it's a bare global Identifier resolving to a static method with a viable
// pure entry. returns the resolved pure descriptor (with `entry`/`hintName`/`kind`) or null.
// shared between babel-plugin and unplugin so the branch-detection rules stay in lockstep
export function isViableBranchForKey(branch, key, scope, adapter, resolvePure) {
  // peel ParenthesizedExpression / TS expression wrappers around the branch identifier:
  // `cond ? (Array) : (Iterator)` (oxc preserves) / `cond ? Array! : Iterator!` (TS).
  // without the peel the strict Identifier check rejected wrapped branches and the synth
  // swap silently bailed for that side
  const inner = peelFallbackWrappers(branch);
  if (inner?.type !== 'Identifier') return null;
  // user-shadowed (`function f(Array) { ({from} = cond ? Array : Set) }`) - shadow makes
  // `Array` a local binding, not a global polyfill candidate
  if (adapter.hasBinding(scope, inner.name)) return null;
  const meta = buildDestructuringInitMeta(inner, key, scope, adapter);
  if (!meta?.object || meta.kind !== 'property' || meta.placement !== 'static') return null;
  const pure = resolvePure(meta);
  if (!pure || pure.kind === 'instance') return null;
  return pure;
}

// enumerate fromFallback destructure-receiver branches as resolved metas. for usage-global
// dispatch each branch's deps separately so `cond ? Array : Iterator` with `{from}` brings
// in both `es.array.from` and `es.iterator.from` at file level. takes parser-agnostic path
// API (uses .parentPath / .node / .scope) so both babel and estree-toolkit paths work
export function enumerateFallbackDestructureBranches(meta, path, adapter) {
  if (!meta?.fromFallback || !path) return null;
  const wrapperParent = path.parentPath?.parentPath?.node;
  const slot = destructureReceiverSlot(wrapperParent);
  if (!slot) return null;
  // peel chain-assign + paren/TS wrappers down to the conditional/logical. oxc preserves
  // parens; babel strips them. handles `foo = (bar = (cond ? A : B))` (interleaved layers)
  const rhs = peelFallbackReceiver(wrapperParent[slot]);
  const branchSlots = getFallbackBranchSlots(rhs);
  if (!branchSlots) return null;
  const out = [];
  for (const branchSlot of branchSlots) {
    const branch = rhs[branchSlot];
    if (branch?.type !== 'Identifier') continue;
    const branchMeta = buildDestructuringInitMeta(branch, meta.key, path.scope, adapter);
    if (branchMeta?.object) out.push(branchMeta);
  }
  return out.length ? out : null;
}

export function canTransformDestructuring({ parentType, parentInit, grandParentType }) {
  if (parentType === 'VariableDeclarator') {
    if (!parentInit) return false; // for-of/for-in - no init
    if (grandParentType === 'ForInStatement' || grandParentType === 'ForOfStatement') return false;
    return true;
  }
  return parentType === 'AssignmentExpression';
}
