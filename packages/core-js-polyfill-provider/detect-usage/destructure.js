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
import { resolve as resolveBuiltIn } from '../index.js';
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
// that resolves to a known global (for `??`/`||` the primary is left side; for `&&` it's
// the right side - the branch taken when the left/right gate is truthy).
// `fromFallback` disables the destructure replacement when the runtime value may come
// from either branch - `&&` is always conditional (primary only when left truthy, else
// falsy left), so always flag; `??`/`||` flag only when the fallback is the resolved side
function resolveLogicalDestructureMeta(node, key, scope, adapter) {
  return node.operator === '&&'
    ? resolveAndDestructureMeta(node, key, scope, adapter)
    : resolveOrNullishDestructureMeta(node, key, scope, adapter);
}

// `&&`: primary is the RIGHT branch. when both branches resolve to the SAME known object
// the polyfill applies cleanly; otherwise fromFallback flag triggers per-branch enumeration
// (`Array && Map` for `entries` -> `Array && _Map`, `Array && Promise` for `from` ->
// `{from:_Array$from} && _Promise`). `fromFallback` always set when objects differ or left
// doesn't resolve - runtime value depends on the left's truthiness
function resolveAndDestructureMeta(node, key, scope, adapter) {
  const primaryMeta = buildDestructuringInitMeta(node.right, key, scope, adapter);
  if (!primaryMeta.object) return primaryMeta;
  const leftMeta = buildDestructuringInitMeta(node.left, key, scope, adapter);
  if (leftMeta.object === primaryMeta.object) return primaryMeta;
  return { ...primaryMeta, fromFallback: true };
}

// `||` / `??`: primary is the LEFT branch (taken when truthy / non-nullish). use primary
// when its meta resolves to a real polyfill (static lookup on known receiver, OR instance
// fallback for unknown receiver with instance-method key like `Stub ?? Object` for `keys`
// -> `_keys(...)`). otherwise the fallback (right) carries the actual polyfill - e.g.
// `MyArray || Iterator` for `from` registers `Iterator.from` because `_Iterator`'s
// constructor binding doesn't carry the static method
function resolveOrNullishDestructureMeta(node, key, scope, adapter) {
  const primaryMeta = buildDestructuringInitMeta(node.left, key, scope, adapter);
  if (primaryMeta.object && resolveBuiltIn(primaryMeta)) return primaryMeta;
  const fallbackMeta = buildDestructuringInitMeta(node.right, key, scope, adapter);
  return fallbackMeta.object ? { ...fallbackMeta, fromFallback: true } : fallbackMeta;
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

// recursive walk of a fallback-receiver expression collecting per-branch resolved metas.
// `cond1 ? (cond2 ? Array : Iterator) : Set` flattens to [Array, Iterator, Set] - inner
// conditional's both branches reach their own dispatch. each step peels chain-assign /
// paren / TS / safe-SE wrappers; non-fallback shapes resolve via `buildDestructuringInitMeta`
function flattenFallbackBranches(node, key, scope, adapter) {
  const peeled = peelFallbackReceiver(node);
  const branchSlots = getFallbackBranchSlots(peeled);
  if (branchSlots) {
    return branchSlots.flatMap(s => flattenFallbackBranches(peeled[s], key, scope, adapter));
  }
  // leaf branch: paren/TS-wrapped Identifier / MemberExpression, resolve as a single meta.
  // buildDestructuringInitMeta handles the alias chain + proxy-global / static / global
  // classification. drops branches that didn't resolve to a known global (`object` null)
  const inner = peelFallbackWrappers(peeled);
  if (!inner) return [];
  const branchMeta = buildDestructuringInitMeta(inner, key, scope, adapter);
  return branchMeta?.object ? [branchMeta] : [];
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
  const out = flattenFallbackBranches(wrapperParent[slot], meta.key, path.scope, adapter);
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
