// destructure-receiver detection: build polyfill meta for a destructured property given
// its init node. handles direct identifiers, member chains, sequences, logical / conditional
// fallbacks (with `fromFallback` flag), chain-assignment, string-literal init. exposes
// per-branch viability (`isViableBranchForKey`), branch enumeration for usage-global
// (`enumerateFallbackDestructureBranches`), and the parser-shape gate
// (`canTransformDestructuring`)
import {
  destructureReceiverSlot,
  flattenableHostSlot,
  getFallbackBranchSlots,
  isChainAssignment,
  isTransparentDestructureWrapper,
  peelFallbackReceiver,
  peelFallbackBranchInner,
  peelZeroArgIifeReturn,
  resolveFallbackReceiver,
  unwrapExpressionChain,
} from '../helpers/ast-patterns.js';
import { isClassifiableReceiverArg, POSSIBLE_GLOBAL_OBJECTS } from '../helpers/class-walk.js';
import { resolve as resolveBuiltIn } from '../index.js';
import { KNOWN_FUNCTION_GLOBALS, KNOWN_NAMESPACE_GLOBALS } from './globals.js';
import {
  isStaticPlacement,
  peelChainAssignmentDeep,
  resolveKey as sharedResolveKey,
  resolveObjectName,
  unwrapParens,
} from './resolve.js';

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
export function buildDestructuringInitMeta({ initNode, key, scope, adapter, path = null }) {
  if (!initNode) return { kind: 'property', object: null, key, placement: null };
  // oxc-parser preserves ParenthesizedExpression (Babel strips them)
  const unwrapped = unwrapParens(initNode);
  // branch handlers for binary / sequence / conditional shapes recurse with the per-branch
  // expression; pure positional resolution falls through to the type-specific cases below.
  // `path` threads through every recursion so downstream `adapter.hasBinding(scope, name,
  // path)` reaches the TS-runtime fallback (`declare const X` / namespace bodies that
  // estree-toolkit's scope tracker doesn't register)
  switch (unwrapped.type) {
    case 'LogicalExpression':
      return resolveLogicalDestructureMeta({ node: unwrapped, key, scope, adapter, path });
    case 'SequenceExpression':
      // `(0, Array)`: sequence evaluates to its last expression
      return buildDestructuringInitMeta({ initNode: unwrapped.expressions.at(-1), key, scope, adapter, path });
    case 'ConditionalExpression':
      return resolveConditionalDestructureMeta({ node: unwrapped, key, scope, adapter, path });
    case 'AssignmentExpression':
      // chain `const { from } = foo = cond ? Array : Iterator` evaluates AssignmentExpression
      // to its RHS - recurse on right so meta tracks the actual destructure receiver
      if (isChainAssignment(unwrapped)) {
        return buildDestructuringInitMeta({ initNode: unwrapped.right, key, scope, adapter, path });
      }
      break;
    case 'CallExpression':
    case 'OptionalCallExpression': {
      // zero-arg IIFE wrapping a fallback shape: `const { from } = (() => cond ? Array
      // : Iterator)()`. recurse on the IIFE's return expression so per-branch enumeration
      // sees the conditional/logical inside. args-bearing calls preserve their semantics
      // (peel returns null, switch falls through to the `object: null` default)
      const iifeInner = peelZeroArgIifeReturn(unwrapped);
      if (iifeInner) return buildDestructuringInitMeta({ initNode: iifeInner, key, scope, adapter, path });
      break;
    }
  }
  // `const { from } = Array` or `const { from } = globalThis.Array`
  if (unwrapped.type === 'Identifier' || unwrapped.type === 'MemberExpression'
    || unwrapped.type === 'OptionalMemberExpression') {
    const objectName = resolveObjectName({ objectNode: unwrapped, scope, adapter, path });
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
function resolveLogicalDestructureMeta({ node, key, scope, adapter, path }) {
  return node.operator === '&&'
    ? resolveAndDestructureMeta({ node, key, scope, adapter, path })
    : resolveOrNullishDestructureMeta({ node, key, scope, adapter, path });
}

// `&&`: primary is the RIGHT branch. when both branches resolve to the SAME known object
// the polyfill applies cleanly; otherwise fromFallback flag triggers per-branch enumeration
// (`Array && Map` for `entries` -> `Array && _Map`, `Array && Promise` for `from` ->
// `{from:_Array$from} && _Promise`). `fromFallback` always set when objects differ or left
// doesn't resolve - runtime value depends on the left's truthiness
function resolveAndDestructureMeta({ node, key, scope, adapter, path }) {
  const primaryMeta = buildDestructuringInitMeta({ initNode: node.right, key, scope, adapter, path });
  if (!primaryMeta.object) return primaryMeta;
  const leftMeta = buildDestructuringInitMeta({ initNode: node.left, key, scope, adapter, path });
  if (leftMeta.object === primaryMeta.object) return primaryMeta;
  return { ...primaryMeta, fromFallback: true };
}

// `||` / `??`: primary is the LEFT branch (taken when truthy / non-nullish). use primary
// when its meta resolves to a real polyfill (static lookup on known receiver, OR instance
// fallback for unknown receiver with instance-method key like `Stub ?? Object` for `keys`
// -> `_keys(...)`). otherwise the fallback (right) carries the actual polyfill - e.g.
// `MyArray || Iterator` for `from` registers `Iterator.from` because `_Iterator`'s
// constructor binding doesn't carry the static method
function resolveOrNullishDestructureMeta({ node, key, scope, adapter, path }) {
  const primaryMeta = buildDestructuringInitMeta({ initNode: node.left, key, scope, adapter, path });
  if (primaryMeta.object && resolveBuiltIn(primaryMeta)) return primaryMeta;
  const fallbackMeta = buildDestructuringInitMeta({ initNode: node.right, key, scope, adapter, path });
  return fallbackMeta.object ? { ...fallbackMeta, fromFallback: true } : fallbackMeta;
}

// `cond ? Array : Set`: try both branches; flag fromFallback so destructure replacement
// bails (the runtime value depends on `cond`). without this branching, the conditional
// would fall through to the positional case and miss polyfill resolution entirely.
// fromFallback flag is preserved even when consequent/alternate resolve to the same
// constructor name - the runtime values come from different AST paths (`Array` bare vs
// `globalThis.Array` member access; user shim vs core-js import) and per-branch synth
// rewrites each side independently to preserve original receiver semantics
function resolveConditionalDestructureMeta({ node, key, scope, adapter, path }) {
  const consequent = buildDestructuringInitMeta({ initNode: node.consequent, key, scope, adapter, path });
  const alternate = buildDestructuringInitMeta({ initNode: node.alternate, key, scope, adapter, path });
  const resolved = consequent.object ? consequent : alternate.object ? alternate : null;
  return resolved ? { ...resolved, fromFallback: true } : consequent;
}

// per-branch synth-swap viability check: branch is a candidate for `{key: _Branch$key}`
// rewrite when it resolves to a static method on a known global with a viable pure entry.
// accepts:
//   - bare Identifier (`Array`) - direct global reference
//   - MemberExpression (`globalThis.Array`, `window.Array`) - proxy-global member chain;
//     `buildDestructuringInitMeta` -> `resolveObjectName` walks the chain to the actual
//     constructor name. without this, Identifier-only check left member-form branches
//     to a side-channel rewrite (`globalThis` -> `_globalThis`) that asymmetric'd Identifier
//     and MemberExpression branches in the same conditional
// returns the resolved pure descriptor (with `entry`/`hintName`/`kind`) or null.
// shared between babel-plugin and unplugin so the branch-detection rules stay in lockstep
export function isViableBranchForKey({ branch, key, scope, adapter, resolvePure, path = null }) {
  // peel ParenthesizedExpression / TS expression wrappers AND safe SE tail around the branch:
  // `cond ? (Array) : (Iterator)` (oxc preserves parens), `cond ? Array! : Iterator!` (TS),
  // `cond ? (0, Array) : Iterator` (SE-prefixed). without the SE-tail peel, comma-prefixed
  // branches resolved to SequenceExpression -> strict-shape check bailed and per-branch synth
  // dropped that side, leaving native `Array.from` -> "polyfill always wins" violation
  const inner = peelFallbackBranchInner(branch);
  if (inner?.type !== 'Identifier'
    && inner?.type !== 'MemberExpression'
    && inner?.type !== 'OptionalMemberExpression') return null;
  // user-shadowed (`function f(Array) { ({from} = cond ? Array : Set) }`) - shadow makes
  // `Array` a local binding, not a global polyfill candidate. only meaningful for the
  // bare Identifier shape; MemberExpression's binding hop is handled inside resolveObjectName.
  // `path` threads into hasBinding so TS-runtime bindings (`declare const Array: any` in a
  // .d.ts-shadow scope) propagate through unplugin's estree-toolkit scope tracker
  if (inner.type === 'Identifier' && adapter.hasBinding(scope, inner.name, path)) return null;
  const meta = buildDestructuringInitMeta({ initNode: inner, key, scope, adapter, path });
  if (!meta?.object || meta.kind !== 'property' || meta.placement !== 'static') return null;
  const pure = resolvePure(meta);
  if (!pure || pure.kind === 'instance') return null;
  return pure;
}

// recursive walk of a fallback-receiver expression collecting per-branch resolved metas.
// `cond1 ? (cond2 ? Array : Iterator) : Set` flattens to [Array, Iterator, Set] - inner
// conditional's both branches reach their own dispatch. each step peels chain-assign /
// paren / TS / safe-SE wrappers; non-fallback shapes resolve via `buildDestructuringInitMeta`
function flattenFallbackBranches({ node, key, scope, adapter, path }) {
  const peeled = peelFallbackReceiver(node);
  const branchSlots = getFallbackBranchSlots(peeled);
  if (branchSlots) {
    return branchSlots.flatMap(s => flattenFallbackBranches({ node: peeled[s], key, scope, adapter, path }));
  }
  // leaf branch: paren/TS-wrapped + safe-SE Identifier / MemberExpression, resolve as a single
  // meta. buildDestructuringInitMeta handles the alias chain + proxy-global / static / global
  // classification. drops branches that didn't resolve to a known global (`object` null)
  const inner = peelFallbackBranchInner(peeled);
  if (!inner) return [];
  const branchMeta = buildDestructuringInitMeta({ initNode: inner, key, scope, adapter, path });
  return branchMeta?.object ? [branchMeta] : [];
}

// enumerate fromFallback destructure-receiver branches as resolved metas. for usage-global
// dispatch each branch's deps separately so `cond ? Array : Iterator` with `{from}` brings
// in both `es.array.from` and `es.iterator.from` at file level. takes parser-agnostic path
// API (uses .parentPath / .node / .scope) so both babel and estree-toolkit paths work
export function enumerateFallbackDestructureBranches(meta, path, adapter) {
  if (!meta?.fromFallback || !path) return null;
  const objectPattern = path.parentPath?.node;
  // ObjectPattern's parent can be:
  //   - direct host (VariableDeclarator / AssignmentExpression) - read slot
  //   - AssignmentPattern default-wrapper - read 'right' (default) UNLESS the AP is itself
  //     an IIFE param, in which case the call-arg supersedes the default
  //   - function-like (IIFE-param without default) - lift the call-arg via `findIifeCallSite`
  // shared `resolveFallbackReceiver` handles AssignmentPattern + IIFE-param uniformly so
  // both wrapper-default and IIFE call-arg can drive per-branch synth-swap
  const wrapperPath = path.parentPath?.parentPath;
  const wrapperNode = wrapperPath?.node;
  let receiverNode = null;
  if (wrapperNode?.type === 'AssignmentPattern' && wrapperPath.parentPath?.node
      && FN_TYPES_FOR_IIFE.has(wrapperPath.parentPath.node.type)) {
    // AssignmentPattern is an IIFE param wrapper - prefer the call-arg over the default ONLY
    // when it is a classifiable receiver; a non-classifiable arg (notably `undefined`, which
    // makes the runtime apply the default) keeps the default so its branches are enumerated.
    // mirrors the meta-build receiver choice in each plugin's detect-usage
    const desc = resolveFallbackReceiver(wrapperPath.parentPath, wrapperNode);
    receiverNode = desc?.rhsNode && isClassifiableReceiverArg(desc.rhsNode, path.scope, adapter) ? desc.rhsNode : wrapperNode.right;
  } else {
    const slot = destructureReceiverSlot(wrapperNode);
    if (slot) receiverNode = wrapperNode[slot];
    else if (wrapperNode && objectPattern) {
      // IIFE-param wrapper without default (`(({p}) => body)(R)`): wrapper is the function;
      // `findIifeCallSite` walks to the call, lifts call-arg at this param's index
      const desc = resolveFallbackReceiver(wrapperPath, objectPattern);
      receiverNode = desc?.rhsNode ?? null;
    }
  }
  if (!receiverNode) return null;
  const out = flattenFallbackBranches({
    node: receiverNode, key: meta.key, scope: path.scope, adapter, path,
  });
  return out.length ? out : null;
}

// IIFE-callable shapes (arrow / FunctionExpression) - the only function shapes that can
// appear as the callee of an immediately-invoked expression. mirrors `FN_NODE_TYPES` in
// helpers; declarations / methods can't sit at the callee position so they're excluded
const FN_TYPES_FOR_IIFE = new Set([
  'ArrowFunctionExpression',
  'FunctionExpression',
]);

export function canTransformDestructuring({ parentType, parentInit, grandParentType }) {
  if (parentType === 'VariableDeclarator') {
    if (!parentInit) return false; // for-of/for-in - no init
    if (grandParentType === 'ForInStatement' || grandParentType === 'ForOfStatement') return false;
    return true;
  }
  return parentType === 'AssignmentExpression';
}

const STATIC_WALK_DEPTH = 64;

// resolve a destructure receiver chain through static const-bound ObjectExpression hops:
// `{ a: { from } } = wrapper` where `wrapper = { a: Array }` walks `wrapper.a` to
// `Array`. complements the proxy-global path (`{ Array: { from } } = globalThis` reads
// the constructor name directly from the destructure chain) - here the constructor is
// HIDDEN inside a const-bound static object literal, walk its ObjectExpression structure.
// returns the leaf Identifier name or null when any hop bails:
//   - non-const binding (reassignable) - shape may not hold at destructure site
//   - non-VariableDeclarator pattern (param, catch, loop) - no literal init to walk
//   - non-ObjectExpression intermediate
//   - missing / computed / shorthand-mismatched property
//   - non-Identifier leaf - need a constructor name to dispatch polyfill
// depth-bounded against pathological alias chains (`a -> b -> c -> ...`)
export function walkStaticReceiverChain({ receiverNode, walkPath, scope, adapter, path = null }) {
  return walkStaticReceiverStep({ node: receiverNode, walkPath, scope, adapter, depth: 0, path });
}

// proxy-global recognition for `walkStaticReceiverStep`: returns the source proxy-global
// name when `node` is an Identifier - bare (`globalThis`/`self`/...) or a plugin-rewritten
// alias (`_globalThis`) whose source name only survives on the injector side-channel
// because the in-place `globalThis` -> `_globalThis` rewrite already ran by this walk. the
// hint arrives two ways (mirrors `isProxyGlobalIdentifierNode`): unplugin pre-stamps
// `binding.polyfillHint`; babel exposes it through `adapter.getBindingPolyfillHint`. pass
// whichever a call site has - both default to null so either suffices on its own
function proxyGlobalNameOf({ node, binding = null, adapter = null, scope = null }) {
  if (node?.type !== 'Identifier') return null;
  if (POSSIBLE_GLOBAL_OBJECTS.has(node.name)) return node.name;
  const hint = binding?.polyfillHint ?? adapter?.getBindingPolyfillHint?.(scope, node.name);
  return hint && POSSIBLE_GLOBAL_OBJECTS.has(hint) ? hint : null;
}

function walkStaticReceiverStep({ node, walkPath, scope, adapter, depth, path = null, seen = null }) {
  if (depth > STATIC_WALK_DEPTH) return null;
  let current = unwrapParens(node);
  let currentScope = scope;
  let hops = 0;
  // per-walk cycle guard: `const a = b; const b = a` (mutually-aliased identifiers) would
  // bounce between names until STATIC_WALK_DEPTH burns out. Set short-circuits at the
  // second visit with O(1) check, complementing the depth cap as a defensive lower bound
  const visited = seen ?? new Set();
  // dereference const-bound Identifier through its VariableDeclarator initializer,
  // chasing re-aliases (`const Foo = Array; const wrapper = { a: Foo }`) until we
  // either land on an unbound Identifier (the global - leaf name we return) or an
  // ObjectExpression (intermediate hop for further key descent). `path` threads through
  // to `adapter.hasBinding` so unplugin's estree-toolkit scope tracker reaches the
  // TS-runtime fallback (`declare const X` / namespace-body bindings)
  while (current?.type === 'Identifier' && adapter.hasBinding(currentScope, current.name, path)) {
    if (++hops > STATIC_WALK_DEPTH) return null;
    if (visited.has(current.name)) return null;
    visited.add(current.name);
    const binding = adapter.getBinding(currentScope, current.name);
    // plugin-rewritten proxy-global alias (`_globalThis`): substitute current to the SOURCE
    // proxy-global name so the post-loop mid-chain lift can match, then break - the import
    // binding's init isn't an ObjectExpression and would otherwise bail at the bindingType
    // check below. pass binding + adapter + scope so both hint shapes are reachable
    const proxyName = proxyGlobalNameOf({ node: current, binding, adapter, scope: currentScope });
    if (proxyName && proxyName !== current.name) {
      current = { type: 'Identifier', name: proxyName };
      break;
    }
    const bindingType = adapter.getBindingNodeType(currentScope, current.name);
    // class-bound leaf at empty walkPath: classes are stable bindings (no reassignment
    // legal), so the identifier name reliably identifies the declaration. accept as the
    // leaf without further dereferencing - matches the empty-walkPath / unbound-Identifier
    // path below for the canonical-name return contract. enables `class Foo {}; const NS =
    // {Foo}; walkStaticReceiverChain(NS, ['Foo'])` to return 'Foo' (otherwise would bail
    // here since ClassDeclaration isn't VariableDeclarator)
    if (walkPath.length === 0 && bindingType === 'ClassDeclaration') return current.name;
    if (bindingType !== 'VariableDeclarator') return null;
    // `binding.constant` may be undefined depending on adapter (babel computes it lazily,
    // estree-toolkit doesn't expose it). use the underlying `constantViolations` list which
    // both adapters surface; empty / missing means no reassignment - shape holds at use site
    if (!binding || binding.constantViolations?.length) return null;
    // adapter divergence: babel exposes the VariableDeclarator at `binding.path.node`,
    // estree-toolkit at `binding.node` directly. fall through both shapes
    let initNode = binding.path?.node?.init ?? binding.node?.init;
    if (!initNode) return null;
    // peel chain-assignment in init (`const wrapper = (x = {a: Array})` - the assignment
    // evaluates to its right operand at runtime). shared `peelChainAssignmentDeep`
    // alternates paren/chain peel to fixpoint so nested `(y = (x = Src))` shapes also reach
    initNode = peelChainAssignmentDeep(initNode);
    // destructure-leaf binding: `{Math} = globalThis` binds `Math` to `globalThis.Math`,
    // not to `globalThis`. id is ObjectPattern; the binding-name maps to a key inside.
    // walk the pattern to find which key produces this binding (shorthand / renamed both)
    // and prepend it to walkPath so subsequent dereferences hit `source[key]` correctly
    const idNode = binding.path?.node?.id ?? binding.node?.id;
    if (idNode?.type === 'ObjectPattern') {
      const destructureKeys = findShorthandKey(idNode, current.name, currentScope, adapter);
      if (!destructureKeys) return null;
      walkPath = [...destructureKeys, ...walkPath];
    } else if (idNode?.type === 'ArrayPattern') {
      // array-destructure-leaf - positional within an array literal source. rare for
      // static-method aliasing; safe miss preferred over false-positive constructor
      return null;
    }
    current = unwrapParens(initNode);
    currentScope = binding.scope ?? currentScope;
  }
  // leaf return: walkPath consumed - extract the leaf global name.
  // bare Identifier returns its name directly; proxy-global member access
  // (`globalThis.Array` / `_globalThis.Array` after polyfill-injected rewrite) routes
  // through `resolveObjectName` which handles both raw proxy globals and plugin-injected
  // `_globalThis` bindings via `polyfillHint`. covers
  // `const Array = globalThis.Array; const wrapper = { Array }; ...`
  if (walkPath.length === 0) {
    if (current?.type === 'Identifier') return current.name;
    if (current?.type === 'MemberExpression' || current?.type === 'OptionalMemberExpression') {
      return resolveObjectName({ objectNode: current, scope: currentScope, adapter });
    }
    return null;
  }
  // proxy-global mid-chain lift: current is a recognised proxy-global identifier (bare source
  // name or plugin-rewritten alias). for babel the rewritten alias has no scope binding, so
  // the dereference loop above never ran and the alias reaches here verbatim - adapter+scope
  // let `proxyGlobalNameOf` recover its source name (no binding to read the hint off of).
  // mirror `resolveNestedDestructureReceiver`'s short-circuit: intermediate hops must also be
  // proxy-globals (chained `globalThis.self.Array.from` shapes), leaf must be a recognised
  // static-placement name. without this, nested static-receiver chains like
  // `const ns = {root: globalThis}; const {root: {Array: {from}}} = ns` bail at the inner
  // `globalThis` hop and downstream `Array.from` polyfill is missed silently
  if (proxyGlobalNameOf({ node: current, adapter, scope: currentScope })
      && walkPath.slice(0, -1).every(k => POSSIBLE_GLOBAL_OBJECTS.has(k))
      && isStaticPlacement(walkPath.at(-1))) {
    return walkPath.at(-1);
  }
  // intermediate MemberExpression value (`wrapper = {a: globalThis.Array}` walking key `a`
  // lands on `globalThis.Array`). resolve the chain to its constructor name and return it
  // as the receiver - caller pairs it with the remaining destructured key for polyfill
  // lookup. only single-hop remaining walkPath is mappable (multi-hop would need
  // descend-through-resolved-constructor which has no AST anchor here)
  if ((current?.type === 'MemberExpression' || current?.type === 'OptionalMemberExpression')
      && walkPath.length === 1) {
    return resolveObjectName({ objectNode: current, scope: currentScope, adapter });
  }
  if (current?.type !== 'ObjectExpression') return null;
  for (const prop of current.properties) {
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
    // shared `resolveKey` covers Identifier / StringLiteral / Literal directly AND walks
    // computed-key bindings (`const k = 'a'; { [k]: Array }`) + StringLiteral / `+`-concat
    // folds to a static string. unresolvable computed keys (dynamic expressions) return null
    // and the prop is correctly skipped
    const keyName = sharedResolveKey({ node: prop.key, computed: prop.computed, scope: currentScope, adapter });
    if (keyName !== walkPath[0]) continue;
    return walkStaticReceiverStep({
      node: prop.value, walkPath: walkPath.slice(1), scope: currentScope, adapter, depth: depth + 1, path, seen: visited,
    });
  }
  return null;
}

// find the source-key PATH in an ObjectPattern that produces the binding named `bindingName`.
// shorthand `{Math}` -> ['Math'] (key === value name). renamed `{Math: M}` -> ['Math'] for
// bindingName='M'. nested `{ns: {Math: M}}` -> ['ns', 'Math'] - the binding lives below the
// surface, so the caller descends the source object through every key on the path.
// AssignmentPattern default (`{Math: M = ...}`) peels through .left. computed-key patterns
// resolve via `sharedResolveKey`'s static-binding inspection. returns null when the binding
// isn't reachable or any key on the path is unresolvable
function findShorthandKey(objectPattern, bindingName, scope, adapter) {
  for (const prop of objectPattern.properties) {
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
    const keyName = sharedResolveKey({ node: prop.key, computed: prop.computed, scope, adapter });
    if (!keyName) continue;
    const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
    if (value?.type === 'Identifier') {
      if (value.name === bindingName) return [keyName];
    } else if (value?.type === 'ObjectPattern') {
      const nested = findShorthandKey(value, bindingName, scope, adapter);
      if (nested) return [keyName, ...nested];
    }
  }
  return null;
}

// walks the outer-prop chain (Property / ObjectProperty -> ObjectPattern -> ...) up to
// the destructure host (VariableDeclarator / AssignmentExpression-in-ExpressionStatement).
// returns the constructor name for the inner prop's receiver across two complementary
// shapes:
//   - proxy-global descent: receiver is a known global (`globalThis`, `self`, ...) and
//     every intermediate key is itself a proxy-global hop. constructor = deepest key
//     (`{Array: {from}} = globalThis` -> 'Array')
//   - static-object descent: receiver is a const-bound Identifier whose initializer is an
//     ObjectExpression, and the keys path resolves to a leaf Identifier of a known
//     constructor (`{a: {from}} = wrapper` where `wrapper = {a: Array}` -> 'Array')
// path-API agnostic: works with both babel's NodePath (`.parentPath`, `.scope`, `.node`)
// and estree-toolkit's. accepts both 'Property' (estree) and 'ObjectProperty' (babel)
// outer-prop type names. AssignmentPattern host (function param default) is intentionally
// excluded - inline-default would pick native first when present, contradicting
// usage-pure's "polyfill always wins" contract
// peel transparent destructure wrappers via shared `isTransparentDestructureWrapper`
// predicate. tracks `arrayDepth` so multi-level ArrayPattern wrappers
// (`[[{a}]] = [[receiver]]`) can step through nested ArrayExpression init
// element-by-element. each ArrayPattern wrapper has exactly one inner element
// (otherwise destructuring would re-bind to a different slot per pattern position),
// so a depth counter is sufficient - no per-level index needed
function peelDestructureWrappers(pattern) {
  let prev = pattern.node;
  let parent = pattern.parentPath;
  let arrayDepth = 0;
  while (parent && isTransparentDestructureWrapper(parent.node, prev)) {
    if (parent.node.type === 'ArrayPattern') arrayDepth++;
    prev = parent.node;
    parent = parent.parentPath;
  }
  return { parent, arrayDepth };
}

// follow const-bound Identifier through its init at each hop, peeling parens / chain / TS /
// chain-assignment between hops. `visited` Set guards against `const a = b; const b = a`
// cycles. returns the terminal node when chain stops (non-Identifier, unbound name,
// reassigned binding, or no init). `adapter.hasBinding(scope, name, path)` gates on
// user-declared bindings so built-ins like `Array` exit the loop with cur = Array.
// updates `scope` to follow the binding's own scope (closure-captured outer bindings)
function followConstIdentifierInit(cur, scope, adapter, path) {
  const visited = new Set();
  while (cur?.type === 'Identifier' && adapter.hasBinding(scope, cur.name, path) && !visited.has(cur.name)) {
    visited.add(cur.name);
    const binding = adapter.getBinding(scope, cur.name);
    if (!binding || binding.constantViolations?.length) break;
    const initNode = binding.path?.node?.init ?? binding.node?.init;
    if (!initNode) break;
    cur = unwrapExpressionChain(peelChainAssignmentDeep(initNode));
    scope = binding.scope ?? scope;
  }
  return cur;
}

// descend ArrayExpression layers following `indices` (outermost-first) to mirror the
// ArrayPattern wrapper stack on the destructure side - the inner pattern need not sit at
// index 0 of each wrapper (`const [, { from }] = [Set, Array]`). bail (return null) if any
// level isn't an ArrayExpression, the target slot is a hole, or a spread at or before the
// target index shifts runtime positions - any of these means the runtime structure won't
// unwrap to the assumed slot and static resolution would lie.
// when scope/adapter are passed, dereferences const-bound Identifier wrappers via
// `followConstIdentifierInit` so `const wrapper = [Array]; [v] = wrapper` reaches Array
function descendArrayWrapperInit(receiverNode, indices, scope = null, adapter = null, path = null) {
  for (const index of indices) {
    let cur = unwrapExpressionChain(receiverNode);
    if (scope && adapter) cur = followConstIdentifierInit(cur, scope, adapter, path);
    if (cur?.type !== 'ArrayExpression') return null;
    for (let i = 0; i <= index; i++) {
      if (cur.elements[i]?.type === 'SpreadElement') return null;
    }
    receiverNode = cur.elements[index];
    if (!receiverNode) return null;
  }
  return receiverNode;
}

// resolve receiver for ArrayPattern-rooted nested destructure: `const [...{from}] = wrapper`
// or chained `[[{from}]] = wrapper`. walks up ArrayPattern wrappers from the inner ObjectPattern
// counting depth; descends the host's init slot through Identifier aliases and ArrayExpression
// layers. returns the leaf constructor name when it's a recognised static placement
export function resolveArrayWrapperedDestructureReceiver(innerObjectPattern, adapter) {
  let cur = innerObjectPattern;
  // record the element index at each ArrayPattern wrapper (innermost-first) so the init
  // descent picks the matching slot, not a blind `[0]` - `const [, { from }] = [Set, Array]`
  const innerFirstIndices = [];
  while (cur.parentPath?.node?.type === 'ArrayPattern') {
    const index = cur.parentPath.node.elements.indexOf(cur.node);
    if (index === -1) return null;
    innerFirstIndices.push(index);
    cur = cur.parentPath;
  }
  if (innerFirstIndices.length === 0) return null;
  const host = cur.parentPath;
  const slot = flattenableHostSlot(host?.node, host);
  if (!slot) return null;
  const slotNode = host.node[slot];
  if (!slotNode) return null;
  // descent runs outermost-first; the walk-up collected innermost-first, so reverse
  const descended = descendArrayWrapperInit(slotNode, innerFirstIndices.toReversed(), host.scope, adapter, host);
  if (!descended) return null;
  const leaf = unwrapExpressionChain(descended);
  if (leaf?.type !== 'Identifier') return null;
  if (isStaticPlacement(leaf.name)) return leaf.name;
  // polyfill-substituted alias (`_Promise` for `Promise` after the standalone Identifier
  // visitor ran ahead of destructure dispatch): use the binding's `polyfillHint` to
  // recover the original constructor name. babel-plugin needs this because AST mutation
  // happens in-place during visitor traversal - by the time the destructure prop visits,
  // the wrapper's binding init has already been rewritten from `[Promise]` to `[_Promise]`
  const hint = adapter.getBinding(host.scope, leaf.name)?.polyfillHint;
  return hint && isStaticPlacement(hint) ? hint : null;
}

// per-outerProp memoization: sibling inner-Property visits under the same outer Property
// (`{X: {from, of, isArray}} = R` - 3 inner keys all walk through the same outer X) collapse
// from O(siblings*depth) to O(1) after the first. WeakMap keyed on outerProp.node auto-GCs
// with the program. positive results ONLY - transient null surfaces mid-rewrite (upstream
// polyfill import not yet flushed into the injector's hint table, so resolveObjectName fails
// on `_globalThis` and the leaf walk bails), then a later visit on the same outerProp
// resolves correctly; caching the null would lock in the bail. positive resolutions are
// stable - once the chain bottoms out on a real global, AST mutations don't reverse it
const nestedReceiverCache = new WeakMap();

export function resolveNestedDestructureReceiver(outerProp, adapter) {
  const cached = nestedReceiverCache.get(outerProp.node);
  if (cached) return cached;
  const result = computeNestedDestructureReceiver(outerProp, adapter);
  if (result) nestedReceiverCache.set(outerProp.node, result);
  return result;
}

function computeNestedDestructureReceiver(outerProp, adapter) {
  const keys = [];
  let cur = outerProp;
  // arrayDepth accumulates across iterations - ArrayPattern wrappers between
  // intermediate Property hops contribute to the host-level descent. without accumulation,
  // an inner-iteration ArrayPattern wrapper would be silently dropped when `cur = parent`
  // advances to the next outer Property, and the host descent would lie about the
  // runtime structure
  let totalArrayDepth = 0;
  for (;;) {
    const pattern = cur.parentPath;
    if (pattern?.node?.type !== 'ObjectPattern') return null;
    const key = sharedResolveKey({ node: cur.node.key, computed: cur.node.computed, scope: pattern.scope, adapter });
    if (!key) return null;
    keys.unshift(key);
    const { parent, arrayDepth } = peelDestructureWrappers(pattern);
    totalArrayDepth += arrayDepth;
    // shared `flattenableHostSlot` returns 'init' for VariableDeclarator,
    // 'right' for AssignmentExpression-in-ExpressionStatement, null otherwise
    const slot = flattenableHostSlot(parent?.node, parent);
    const slotNode = slot ? parent.node[slot] : null;
    // transparent ArrayPattern wrappers are single-element (isTransparentDestructureWrapper),
    // so every level descends index 0 - pass a zeros vector for descendArrayWrapperInit's index list
    const receiverNode = totalArrayDepth
      ? descendArrayWrapperInit(slotNode, Array.from({ length: totalArrayDepth }, () => 0))
      : slotNode;
    if (receiverNode !== null) {
      // peel parens / chain / TS wrappers AND SE tail to a fixpoint so `(se(), R) as any`
      // (and nested combinations like `(se(), (R as any))`) all reach the receiver. without
      // this, TS-wrapped nested destructures bail the flatten path entirely even though the
      // runtime value is identical to the unwrapped form
      const init = unwrapExpressionChain(receiverNode);
      if (!init) return null;
      const receiver = resolveObjectName({ objectNode: init, scope: parent.scope, adapter, path: parent });
      if (receiver && POSSIBLE_GLOBAL_OBJECTS.has(receiver)
          && keys.slice(0, -1).every(k => POSSIBLE_GLOBAL_OBJECTS.has(k))) {
        // leaf must be a recognised constructor name (`isStaticPlacement` whitelists the
        // capitalised globals dispatch consults). without this gate, `const {window: {foo}}
        // = globalThis` would return `'foo'` to downstream `resolveBuiltIn` which then
        // bails on the unknown name - cleaner to bail here than push noise downstream
        const leaf = keys.at(-1);
        return isStaticPlacement(leaf) ? leaf : null;
      }
      // thread `parent` (the destructure host's path) through walkStaticReceiverChain so
      // adapter.hasBinding hits the TS-runtime lookup fallback for declare-bindings that
      // estree-toolkit's scope tracker doesn't register
      return walkStaticReceiverChain({ receiverNode: init, walkPath: keys, scope: parent.scope, adapter, path: parent });
    }
    const parentType = parent?.node?.type;
    if (parentType !== 'Property' && parentType !== 'ObjectProperty') return null;
    cur = parent;
  }
}
