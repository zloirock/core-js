// destructure-receiver detection: build polyfill meta for a destructured property given
// its init node. handles direct identifiers, member chains, sequences, logical / conditional
// fallbacks (with `fromFallback` flag), chain-assignment, string-literal init. exposes
// per-branch viability (`isViableBranchForKey`), branch enumeration for usage-global
// (`enumerateFallbackDestructureBranches`), and the parser-shape gate
// (`canTransformDestructuring`)
import {
  collectBuriedChainSePrefixes,
  staticStringKey,
  unwrapRuntimeExpr,
  isReceiverShapedNode,
  peelNestedSequenceExpressions,
  FUNCTION_LIKE_NODE_TYPES,
  FN_NODE_TYPES,
  findEnclosingFunctionLikePath,
  functionScopeBindsVarOrFunction,
  paramListReadsName,
  destructureReceiverSlot,
  flattenableHostSlot,
  getFallbackBranchSlots,
  isChainAssignment,
  isTransparentDestructureWrapper,
  mayHaveSideEffects,
  peelFallbackReceiver,
  peelFallbackBranchInner,
  peelZeroArgIifeReturn,
  reassignmentBlocksGlobalResolve,
  resolveFallbackReceiver,
  unwrapExpressionChain,
} from '../helpers/ast-patterns.js';
import { isClassifiableReceiverArg, POSSIBLE_GLOBAL_OBJECTS } from '../helpers/class-walk.js';
import { resolve as resolveBuiltIn } from '../index.js';
import { staticReceiverHint } from './globals.js';
import { discardRescueNode, seBearingChainRootCall } from './members.js';
import {
  isCallShape,
  isStaticPlacement,
  peelChainAssignmentDeep,
  resolveKey as sharedResolveKey,
  resolveObjectName,
  unwrapParens,
} from './resolve.js';

// build meta for a destructuring property given its resolved init node + key.
// `receiverHint` lets resolveHint reject `const { includes } = Array` (instance method
// that doesn't exist on the constructor) while accepting `Array.from` and inherited
// Function/Object prototype methods like `name`/`toString`.
export function buildDestructuringInitMeta({ initNode, key, scope, adapter, path = null }) {
  const meta = buildDestructuringInitMetaCore({ initNode, key, scope, adapter, path });
  // a static the user monkey-patches is NOT a polyfillable destructure source: the prop
  // stays raw and the receiver substitutes through the identifier machinery, so the patch
  // and the extraction read the same object
  if (meta?.object && meta.placement === 'static' && adapter.isMutatedStatic?.(meta.object, meta.key)) return null;
  return meta;
}

function buildDestructuringInitMetaCore({ initNode, key, scope, adapter, path = null }) {
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
      // an inline-resolvable call init (`(() => { c++; return Promise; })()`): classify through
      // resolveObjectName's call inlining, same as the direct flatten path. without this, the
      // conditional / fallback branch enumeration treats the branch as opaque and the per-branch
      // synth leaves NATIVE statics on the taken branch (undefined on targets without them)
      const callObjectName = resolveObjectName({ objectNode: unwrapped, scope, adapter, path });
      if (callObjectName) {
        const callPlacement = isStaticPlacement(callObjectName);
        return {
          kind: 'property', object: callObjectName, key, placement: callPlacement,
          receiverHint: staticReceiverHint(callPlacement, callObjectName),
        };
      }
      break;
    }
  }
  // `const { from } = Array` or `const { from } = globalThis.Array`
  if (isReceiverShapedNode(unwrapped)) {
    const objectName = resolveObjectName({ objectNode: unwrapped, scope, adapter, path });
    const placement = objectName ? isStaticPlacement(objectName) : null;
    return { kind: 'property', object: objectName, key, placement, receiverHint: staticReceiverHint(placement, objectName) };
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
  // a branch may be null (a monkey-patched static) - the whole conditional stays raw then,
  // matching the single-receiver mutated path (receiver substitution happens per-identifier)
  if (!consequent || !alternate) return null;
  const resolved = consequent.object ? consequent : alternate.object ? alternate : null;
  return resolved ? { ...resolved, fromFallback: true } : consequent;
}

// call-shaped branch policy for the per-branch synth (`cond ? (() => { c++; return Array; })()
// : Array`): the synth literal replaces the call, so a key left UNRESOLVED at apply time cannot
// re-read through the receiver (that would re-run the call) - the emitters memoize the call
// result through a function-IIFE param (`(function (_ref) { return { ..., custom: _ref.custom };
// })(<call>)`) so the call runs exactly once and unresolved keys read the memo. an SE-bearing
// fully-resolved call is rescued ahead of the literal instead (`(<call>, literal)`), a pure one
// folds away. returns { callBranch, rescueSe }
export function classifyCallBranchForSynth({ inner, scope, adapter, path }) {
  if (isCallShape(inner)) {
    return { callBranch: true, rescueSe: seBearingChainRootCall({ node: inner, scope, adapter, path }) };
  }
  // a member receiver with SE buried along its spine (`(eff(), globalThis).Array`) rescues
  // the original ahead of the literal too - the synth literal alone would drop the effect
  // (and a queued inner rewrite would have no needle to compose into)
  if ((inner?.type === 'MemberExpression' || inner?.type === 'OptionalMemberExpression')
    && collectBuriedChainSePrefixes(inner.object).length) {
    return { callBranch: false, rescueSe: inner };
  }
  return { callBranch: false, rescueSe: null };
}

// per-branch synth-swap viability check: branch is a candidate for `{key: _Branch$key}`
// rewrite when it resolves to a static method on a known global with a viable pure entry.
// accepts:
//   - bare Identifier (`Array`) - direct global reference
//   - MemberExpression (`globalThis.Array`, `window.Array`) - proxy-global member chain;
//     `buildDestructuringInitMeta` -> `resolveObjectName` walks the chain to the actual
//     constructor name. without this, an Identifier-only check would leave member-form branches
//     to a side-channel rewrite (`globalThis` -> `_globalThis`), making Identifier and
//     MemberExpression branches asymmetric in the same conditional
// returns the resolved pure descriptor (with `entry`/`hintName`/`kind`) or null.
// shared between babel-plugin and unplugin so the branch-detection rules stay in lockstep
export function isViableBranchForKey({ branch, key, scope, adapter, resolvePure, path = null }) {
  // peel ParenthesizedExpression / TS expression wrappers AND safe SE tail around the branch:
  // `cond ? (Array) : (Iterator)` (oxc preserves parens), `cond ? Array! : Iterator!` (TS),
  // `cond ? (0, Array) : Iterator` (SE-prefixed). without the SE-tail peel, comma-prefixed
  // branches would resolve to SequenceExpression -> the strict-shape check would bail and per-branch
  // synth would drop that side, leaving native `Array.from` -> a "polyfill always wins" violation
  const inner = peelFallbackBranchInner(branch);
  if (inner?.type !== 'Identifier'
    && inner?.type !== 'MemberExpression'
    && inner?.type !== 'OptionalMemberExpression'
    // an inline-resolvable call branch (`cond ? (() => { c++; return Array; })() : Array`)
    // classifies via the CallExpression arm of `buildDestructuringInitMeta`; the emitters gate
    // it to a single fully-polyfilled key and rescue its setup ahead of the synth literal
    && !isCallShape(inner)) return null;
  // user-shadowed (`function f(Array) { ({from} = cond ? Array : Set) }`) - shadow makes
  // `Array` a local binding, not a global polyfill candidate. only meaningful for the
  // bare Identifier shape; MemberExpression's binding hop is handled inside resolveObjectName.
  // `path` threads into hasBinding so TS-runtime bindings (`declare const Array: any` in a
  // .d.ts-shadow scope) propagate through unplugin's estree-toolkit scope tracker
  if (inner.type === 'Identifier' && adapter.hasBinding(scope, inner.name, path)) return null;
  const meta = buildDestructuringInitMeta({ initNode: inner, key, scope, adapter, path });
  // `fromFallback` means the branch's runtime value is NOT pinned to one constructor (an IIFE
  // wrapping a conditional - `(() => cond ? Array : Iterator)()`): swapping it to a single
  // synth literal would discard the other branch. leave it raw - the identifier visitor still
  // substitutes the polyfillable constructors inside
  if (!meta?.object || meta.kind !== 'property' || meta.placement !== 'static' || meta.fromFallback) return null;
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
      && FN_NODE_TYPES.has(wrapperPath.parentPath.node.type)) {
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

// Single source of truth for HOW a polyfillable destructure prop whose computed key has a side effect
// (`{ [(eff(), 'from')]: f } = R`) is emitted on a `var/let/const` declarator. The two emitters render
// differently (babel mutates the AST, unplugin rewrites text) but the strategy decision lives here, so
// a fix lands once. The effect is entangled with the destructure's evaluation order, so the ONE robust
// strategy keeps the key IN PLACE (its value renamed to a throwaway, so the effect runs exactly once and
// in source order) and binds the polyfill separately - this handles every shape uniformly (sole / multi
// / nested / rest / for-init / default / export / array-wrapper / nested-sequence key).
// `siblingDeclarator` binds the polyfill as a trailing declarator in the SAME declaration instead of a
// preceding statement. it is set when a preceding statement is impossible or unsafe:
//   - for-init: a loop header can't host a preceding statement.
//   - multi-declarator INSTANCE: `_m(recv)` references the receiver, which may be bound earlier in the
//     SAME declaration (`const r = x, { [k]: m } = r`); a preceding `const m = _m(r)` would TDZ-fault. a
//     trailing sibling runs after the receiver's declarator, so it's safe. (a static binding is receiver-
//     free, so its multi-declarator stays a preceding statement - no need to change that shape.)
// Returns `{ instance, siblingDeclarator }` to render the residual, or null for an INSTANCE method whose
// receiver isn't a bare Identifier (re-referencing it would double-evaluate) - bail to native.
//
// (A simpler 'lift' strategy - hoist the effect, drop the receiver, `eff(); const f = _Array$from` - was
// removed: its in-place text surgery made shape assumptions that broke on export / default-with-call /
// nested-sequence keys / array-wrappers. The residual is the single, robust path - so there is no longer
// a strategy enum, only this keep-in-place plan or a bail.)
export function planSideEffectKeyStrategy({ polyfillKind, isForInit, isMultiDeclarator, receiverIsSafe }) {
  const instance = polyfillKind === 'instance';
  // an instance polyfill re-references the receiver beside the residual; bail unless it is safe to read
  // twice (Identifier / side-effect-free literal - see `isReReferenceableReceiver`)
  if (instance && !receiverIsSafe) return null;
  return { instance, siblingDeclarator: !!(isForInit || (isMultiDeclarator && instance)) };
}

// param body-extract qualification (the DECISION half of the body-extract fallback both
// emitters render: `let <local> = _polyfill;` at function-body top + the prop removed /
// sentineled). returns `{ fnPath }` (the enclosing function-like to host the binding) or
// null when extraction is unsound:
//   - caller-lossiness containment: body-extract IGNORES a caller-passed value (the
//     documented cost), acceptable only for a prop of the param-level pattern itself
//     (`function f({ x } = R)`, IIFE caller-arg patterns). a NESTED prop
//     (`{ Array: { from } } = globalThis`) or an array-wrapped one (`[{ from }] = [Array]`)
//     keeps the caller-passed argument via the inline default instead
//   - the body-top `let <name>` SHADOWS a parameter binding (valid - the prop and its
//     binding are removed together), but a name bound by an OUTER declaration that stays
//     (an assignment-form target reaching this fallback through a non-flattenable host)
//     would be redeclared by the body `let` (SyntaxError) - only extract when the name is
//     bound by the pattern itself
//   - no block body (expression-body arrow): no statement slot to host the binding
//   - a sibling param / in-pattern default that reads this binding (`{ of, dflt = of }`,
//     `({ of } = R, y = of)`) evaluates in param scope; relocating the binding into a body
//     `let` would strand that read - the inline default keeps the binding instead
//   - a function-scoped `var <name>` / `function <name>(){}` in the body legally redeclares
//     a parameter; emitting our body-top `let <name>` alongside it is a SyntaxError
// adapter-agnostic: babel exposes the binding's identifier at `binding.identifier`,
// estree-toolkit at `binding.identifierPath.node` - fall through both shapes
export function qualifiesForParamBodyExtract({ propPath, localId }) {
  const patternParentType = propPath.parentPath?.parentPath?.node?.type;
  if (patternParentType === 'Property' || patternParentType === 'ObjectProperty'
    || patternParentType === 'ArrayPattern') return null;
  const existingBinding = propPath.scope.getBinding(localId.name);
  if (existingBinding && (existingBinding.identifier ?? existingBinding.identifierPath?.node) !== localId) return null;
  const fnPath = findEnclosingFunctionLikePath(propPath);
  if (!fnPath || fnPath.node.body?.type !== 'BlockStatement') return null;
  if (paramListReadsName(fnPath.node.params, localId.name)) return null;
  if (functionScopeBindsVarOrFunction(fnPath.node, localId.name)) return null;
  return { fnPath };
}

// a receiver SAFE TO REFERENCE TWICE: the residual destructure reads it, and the extracted instance
// polyfill `_m(recv)` reads it again. a bare Identifier / `this` is safe; so is a side-effect-free literal
// value (array / object / primitive with no nested call or spread) - re-evaluating yields a fresh value of
// the SAME TYPE, so `_m`'s native-vs-polyfill pick is identical. a member (`obj.x` - `mayHaveSideEffects`
// treats a property read as pure, but a getter would re-fire on the second read) or a call must NOT be
// re-referenced, so they bail. `mayHaveSideEffects` recursively rejects `[fn()]` / `[...a]` literals; a
// CONSTANT (no-interpolation) template is a string constant, so it parallels a StringLiteral - but an
// interpolated `` `${x}` `` bails (re-evaluating would re-run x's string coercion, a possible side effect)
const REFERENCEABLE_LITERAL_TYPES = new Set([
  'ArrayExpression',
  'ObjectExpression',
  'StringLiteral',
  'NumericLiteral',
  'BooleanLiteral',
  'NullLiteral',
  'BigIntLiteral',
  'RegExpLiteral',
  'Literal',
]);

export function isReReferenceableReceiver(node) {
  if (!node) return false;
  if (node.type === 'Identifier' || node.type === 'ThisExpression') return true;
  if (node.type === 'TemplateLiteral') return node.expressions.length === 0;
  return REFERENCEABLE_LITERAL_TYPES.has(node.type) && !mayHaveSideEffects(node);
}

// resolve the receiver node for a (possibly nested) destructure leaf: walk the pattern paths up from the
// leaf, collecting the nesting segments (object keys + array indices), then walk the host's RHS literal
// along them. e.g. `flat` of `{ y: { flat: m } } = { y: arr }` resolves to `arr`, and of `[{ y: { flat:
// m } }] = [{ y: arr }]` likewise (object-key `y` AND array-index `0`). returns ONLY a receiver that is
// safe to reference twice (see `isReReferenceableReceiver`); a member / call receiver, a computed or
// non-literal nesting key, a non-matching RHS hop (incl. a spread that shifts array indices), or a missing
// key / hole bails to null.
// AST-agnostic and path-API-agnostic: both babel and estree paths expose `.parentPath` / `.node`, the
// field names match, and the only divergent node type (object property: babel `ObjectProperty` / estree
// `Property`) is accepted both ways - so ONE implementation serves both emitters. `unwrapExpressionChain`
// peels transparent wrappers (parens / TS casts) off the RHS and each value, so a parenthesized object
// literal or value (`= ({ y: arr })` / `{ y: (arr) }`) resolves the same way - babel folds parens into
// node `extra`, estree keeps a `ParenthesizedExpression`, and without peeling the two would diverge
export function resolveNestedReceiverNode(leafPath) {
  const segs = [];
  let pattern = leafPath.parentPath;
  while (pattern?.node?.type === 'ObjectPattern' || pattern?.node?.type === 'ArrayPattern') {
    const owner = pattern.parentPath;
    const ownerType = owner?.node?.type;
    if (ownerType === 'ObjectProperty' || ownerType === 'Property') {
      const { key, computed } = owner.node;
      if (computed) return null;
      if (key?.type === 'Identifier') segs.unshift({ key: key.name });
      else if (key?.type === 'StringLiteral' || key?.type === 'NumericLiteral' || key?.type === 'Literal') segs.unshift({ key: key.value });
      else return null;
      pattern = owner.parentPath;
      continue;
    }
    if (ownerType === 'ArrayPattern') {
      const index = owner.node.elements.indexOf(pattern.node);
      if (index === -1) return null;
      segs.unshift({ index });
      pattern = owner;
      continue;
    }
    const rhs = ownerType === 'VariableDeclarator' ? owner.node.init
      : ownerType === 'AssignmentExpression' ? owner.node.right : null;
    if (!rhs) return null;
    let node = unwrapExpressionChain(rhs);
    for (const seg of segs) {
      if (seg.index === undefined) {
        if (node?.type !== 'ObjectExpression') return null;
        // last match wins (duplicate keys); only plain non-computed data properties resolve
        const match = node.properties.findLast(p => (p.type === 'ObjectProperty' || p.type === 'Property')
          && !p.computed && (p.key?.type === 'Identifier' ? p.key.name === seg.key : p.key?.value === seg.key));
        if (!match) return null;
        node = unwrapExpressionChain(match.value);
      } else {
        // a spread anywhere shifts the static index mapping; a hole / out-of-bounds element has no node
        if (node?.type !== 'ArrayExpression' || node.elements.some(e => e?.type === 'SpreadElement')) return null;
        const element = node.elements[seg.index];
        if (!element) return null;
        node = unwrapExpressionChain(element);
      }
    }
    return isReReferenceableReceiver(node) ? node : null;
  }
  return null;
}

// the ExpressionStatement path that hosts a nested destructuring-ASSIGNMENT leaf (`({ y: { m } } = R);`),
// or null when the leaf is NOT in a statement-context assignment - a declaration, a param, or an
// expression-context assignment (`x = ({...} = R)` / a concise arrow body) whose value would need
// preserving. walks the leaf's own pattern chain to the AssignmentExpression, then peels transparent
// parens to the statement: `({...} = R)` at statement start always needs parens, which estree keeps as a
// `ParenthesizedExpression` while babel folds them into node `extra` - peeling unifies the two. callers
// emit the polyfill overwrite (`m = _m(recv)`) after this statement. AST/path-agnostic - serves both emitters
export function nestedAssignmentStatementOf(leafPath) {
  let path = leafPath.parentPath;
  while (path && (path.node?.type === 'ObjectPattern' || path.node?.type === 'ArrayPattern'
    || path.node?.type === 'ObjectProperty' || path.node?.type === 'Property'
    || path.node?.type === 'AssignmentPattern' || path.node?.type === 'RestElement')) {
    path = path.parentPath;
  }
  if (path?.node?.type !== 'AssignmentExpression') return null;
  let host = path.parentPath;
  while (host?.node?.type === 'ParenthesizedExpression') host = host.parentPath;
  return host?.node?.type === 'ExpressionStatement' ? host : null;
}

export function canTransformDestructuring({ parentType, parentInit }) {
  if (parentType === 'VariableDeclarator') {
    // a for-in / for-of HEAD binding (`for (var { from } of arr)`) has no init - bail. an init-bearing
    // declarator under a for-x grandparent is the unbraced BODY slot (`for (k in obj) var { from } =
    // Array`), a normal substitutable destructure (the head-with-init form is a syntax error for a pattern)
    return !!parentInit;
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
    const binding = adapter.getBinding(currentScope, current.name, path);
    // plugin-rewritten proxy-global alias (`_globalThis`): substitute current to the SOURCE
    // proxy-global name so the post-loop mid-chain lift can match, then break - the import
    // binding's init isn't an ObjectExpression and would otherwise bail at the bindingType
    // check below. pass binding + adapter + scope so both hint shapes are reachable
    const proxyName = proxyGlobalNameOf({ node: current, binding, adapter, scope: currentScope });
    if (proxyName && proxyName !== current.name) {
      current = { type: 'Identifier', name: proxyName };
      break;
    }
    // plugin-rewritten CONSTRUCTOR stub (`_Promise` after an earlier in-place literal rewrite
    // for a SIBLING prop of the shared static-object wrapper): recover the SOURCE constructor
    // name from the injector hint so this prop's statics still resolve - without recovery the
    // dereference bails and the binding silently extracts off the polyfill stub (unbound at
    // runtime where native requires the constructor receiver)
    const ctorHint = binding?.polyfillHint ?? adapter?.getBindingPolyfillHint?.(currentScope, current.name);
    if (ctorHint && ctorHint !== current.name) {
      current = { type: 'Identifier', name: ctorHint };
      break;
    }
    const bindingType = adapter.getBindingNodeType(currentScope, current.name, path);
    // class-bound leaf at empty walkPath: classes are stable bindings (no reassignment
    // legal), so the identifier name reliably identifies the declaration. accept as the
    // leaf without further dereferencing - matches the empty-walkPath / unbound-Identifier
    // path below for the canonical-name return contract. enables `class Foo {}; const NS =
    // {Foo}; walkStaticReceiverChain(NS, ['Foo'])` to return 'Foo' (otherwise would bail
    // here since ClassDeclaration isn't VariableDeclarator)
    if (walkPath.length === 0 && bindingType === 'ClassDeclaration') return current.name;
    if (bindingType === 'ClassDeclaration') {
      // remaining walkPath descends the class's STATIC fields - hand the declaration node to
      // the container branch below
      current = binding.path?.node ?? binding.node;
      break;
    }
    if (bindingType !== 'VariableDeclarator') return null;
    // `binding.constant` may be undefined depending on adapter (babel computes it lazily,
    // estree-toolkit doesn't expose it). use the underlying `constantViolations` list which
    // both adapters surface; empty / missing means no reassignment - shape holds at use site.
    // method-aware: usage-global keeps resolving the static receiver when the reassignment
    // does not dominate the use; usage-pure / narrowing keep the flat bail
    if (!binding || reassignmentBlocksGlobalResolve({ binding, adapter, path })) return null;
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
  return walkStaticReceiverTerminal({ current, walkPath, currentScope, adapter, depth, path, visited });
}

// post-dereference terminal: leaf extraction, proxy mid-chain lift, intermediate member
// resolution, and the static-container descents (object literal / class statics)
function walkStaticReceiverTerminal({ current, walkPath, currentScope, adapter, depth, path, visited }) {
  // leaf return: walkPath consumed - extract the leaf global name.
  // bare Identifier returns its name directly; proxy-global member access
  // (`globalThis.Array` / `_globalThis.Array` after polyfill-injected rewrite) routes
  // through `resolveObjectName` which handles both raw proxy globals and plugin-injected
  // `_globalThis` bindings via `polyfillHint`. covers
  // `const Array = globalThis.Array; const wrapper = { Array }; ...`
  if (walkPath.length === 0) {
    if (current?.type === 'Identifier') return current.name;
    if (current?.type === 'MemberExpression' || current?.type === 'OptionalMemberExpression') {
      return resolveObjectName({ objectNode: current, scope: currentScope, adapter, path });
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
    return resolveObjectName({ objectNode: current, scope: currentScope, adapter, path });
  }
  // class STATIC fields are a member container too (`class NS { static M = Map }`); descend
  // the matching field's value exactly like an object-literal property
  if (current?.type === 'ClassDeclaration' || current?.type === 'ClassExpression') {
    const field = classStaticField(current, walkPath[0]);
    return field ? walkStaticReceiverStep({
      node: field.value, walkPath: walkPath.slice(1), scope: currentScope, adapter, depth: depth + 1, path, seen: visited,
    }) : null;
  }
  if (current?.type !== 'ObjectExpression') return null;
  // LAST matching key wins, per JS duplicate-literal-key semantics (the same reverse order
  // findNamespaceMemberValue uses) - a first-match walk resolved the dead first value and
  // substituted the WRONG constructor's static
  for (const prop of current.properties.toReversed()) {
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
    // shared `resolveKey` covers Identifier / StringLiteral / Literal directly AND walks
    // computed-key bindings (`const k = 'a'; { [k]: Array }`) + StringLiteral / `+`-concat
    // folds to a static string. unresolvable computed keys (dynamic expressions) return null
    // and the prop is correctly skipped
    const keyName = sharedResolveKey({ node: prop.key, computed: prop.computed, scope: currentScope, adapter, bailOnSideEffectKey: true });
    if (keyName !== walkPath[0]) continue;
    return walkStaticReceiverStep({
      node: prop.value, walkPath: walkPath.slice(1), scope: currentScope, adapter, depth: depth + 1, path, seen: visited,
    });
  }
  return null;
}

// the class's static FIELD (value-bearing) matching `key`; methods / accessors are dynamic
// values and stay out (mutual bail with findNamespaceMemberValue's container rules)
function classStaticField(classNode, key) {
  for (const member of classNode.body?.body ?? []) {
    if (!member.static || member.computed) continue;
    if (member.type !== 'ClassProperty' && member.type !== 'PropertyDefinition') continue;
    const keyName = member.key?.type === 'Identifier' ? member.key.name : staticStringKey(member.key);
    if (keyName === key && member.value) return member;
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
    const keyName = sharedResolveKey({ node: prop.key, computed: prop.computed, scope, adapter, bailOnSideEffectKey: true });
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
  // element index at each ArrayPattern wrapper (outermost-first via unshift) so the init
  // descent picks the matching slot. multi-element ArrayPatterns are see-through HERE (this is
  // read-only receiver resolution, not the flatten emit that must preserve sibling bindings),
  // so `[{Array:{from}}, other] = [globalThis, ...]` resolves `from` to globalThis.Array.from
  const indices = [];
  let sawMultiElementArray = false;
  for (;;) {
    if (!parent) break;
    if (parent.node.type === 'ArrayPattern') {
      const idx = parent.node.elements.indexOf(prev);
      if (idx === -1) break;
      if (parent.node.elements.length > 1) sawMultiElementArray = true;
      indices.unshift(idx);
    } else if (parent.node.type === 'AssignmentPattern' && parent.node.left === prev) {
      // an INNER default (`[{x} = {}] = [R]`, `{a: {x} = {}} = R`) is transparent - the real
      // receiver lives further up the pattern chain. a parameter default
      // (`function f({ Array: { from } } = globalThis)`) is itself the HOST: nothing above
      // carries a receiver, its right side IS one - stop here so `destructureReceiverSlot`
      // picks the 'right' slot (peeling through it landed on the param slot and dropped
      // the usage-global injection)
      const grandType = parent.parentPath?.node?.type;
      if (grandType !== 'ArrayPattern' && grandType !== 'Property' && grandType !== 'ObjectProperty') break;
    } else if (!isTransparentDestructureWrapper(parent.node, prev)) break;
    prev = parent.node;
    parent = parent.parentPath;
  }
  return { parent, indices, sawMultiElementArray };
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
    const binding = adapter.getBinding(scope, cur.name, path);
    // method-aware reassignment bail: usage-global keeps following the const-init chain
    // when the reassignment does not dominate the use; usage-pure / narrowing keep the flat bail
    if (!binding || reassignmentBlocksGlobalResolve({ binding, adapter, path })) break;
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
  // peel ArrayPattern wrappers (and transparent inner-default AssignmentPattern / single-element
  // wrappers) up to the host, collecting each wrapper's element index outermost-first so the init
  // descent picks the matching slot, not a blind `[0]` - `const [, { from }] = [Set, Array]`
  const { parent: host, indices } = peelDestructureWrappers(innerObjectPattern);
  if (indices.length === 0) return null;
  // IDENTIFICATION uses the broad host predicate: an assignment-destructure in for-init / call-arg
  // / arrow-body position and a parameter DEFAULT (AssignmentPattern) all carry a real receiver
  // that usage-global must inject for. the pure flatten re-checks its own narrow host shape at
  // emit (`flattenableHostSlot`) - identification gated on the EMIT predicate dropped the import
  const slot = destructureReceiverSlot(host?.node);
  if (!slot) return null;
  const slotNode = host.node[slot];
  if (!slotNode) return null;
  const descended = descendArrayWrapperInit(slotNode, indices, host.scope, adapter, host);
  if (!descended) return null;
  const leaf = unwrapExpressionChain(descended);
  // any leaf that resolves to a static-placement constructor, through ONE branch: a bare global
  // (`[Array]`), a const-alias (`const A = Array; [A]`), a proxy-global member (`[globalThis.Array]`,
  // same as the non-wrappered `const { from } = globalThis.Array` path), or a babel in-place-
  // substituted polyfill alias (`[_Promise]` - the standalone Identifier visitor rewrote the wrapper
  // init before the destructure prop visited). `resolveObjectName` canonicalizes ALL of these via
  // `resolveBindingToGlobal` (binding-init walk + `polyfillHint` recovery, and it bails a reassigned
  // alias). a raw-name-only Identifier check dropped the const-alias (usage-global both plugins +
  // babel usage-pure; unplugin usage-pure rescued it -> divergence)
  if (isReceiverShapedNode(leaf) || leaf?.type === 'AssignmentExpression' || isCallShape(leaf)) {
    // NO SE policy here - this is mode-free CLASSIFICATION. usage-global keeps the text verbatim
    // and must inject for an SE-bearing leaf too; the usage-pure flatten harvests the observable
    // discard (assignment / SE-bearing chain-root call) via `flattenDiscardRescue` and re-emits it
    // ahead of the extraction. an AssignmentExpression leaf (`[a = Array]`) classifies through
    // `resolveObjectName`'s own chain-assignment peel and is rescued WHOLE at emit - bailing it
    // instead would silently lose the polyfill
    const resolved = resolveObjectName({ objectNode: leaf, scope: host.scope, adapter, path: host });
    return resolved && isStaticPlacement(resolved) ? resolved : null;
  }
  return null;
}

// observable node under the init slot a pure flatten would DISCARD: a chain-assignment (rescued
// WHOLE - it updates a binding and may contain an SE-bearing call) or an SE-bearing chain-root
// call. walks the same pattern-wrapper / Property-hop / array-layer descent the classification
// resolvers walk, then probes the effective leaf. the pure emitters re-emit the returned node
// ahead of the extraction (`const from = ((a = _globalThis), _Array$from)`) so the setup survives
// the discard in native order; usage-global never discards, so it has no use for this.
// depth cap shares the resolvers' walk bound - a deeper chain bails to null (no harvest,
// callers keep their conservative path)
export function flattenDiscardRescue(innerObjectPattern, adapter) {
  let pattern = innerObjectPattern;
  let allIndices = [];
  for (let depth = 0; depth < STATIC_WALK_DEPTH; depth++) {
    const { parent, indices } = peelDestructureWrappers(pattern);
    allIndices = [...indices, ...allIndices];
    const slot = flattenableHostSlot(parent?.node, parent);
    if (slot) {
      const slotNode = parent.node[slot];
      if (!slotNode) return null;
      // NO scope/adapter for the descent: a const-alias wrapper (`const w = [(IIFE)()]; [{x}] = w`)
      // dereferences to an init that lives OUTSIDE the discarded slot - its setup already runs at
      // the alias declaration, so harvesting it would double-run. only nodes physically inside the
      // slot text are candidates; the span guard backs this up against any other escape
      const descended = allIndices.length
        ? descendArrayWrapperInit(slotNode, allIndices)
        : slotNode;
      if (!descended) return null;
      const leaf = unwrapExpressionChain(descended);
      if (!leaf) return null;
      const rescue = discardRescueNode({ node: leaf, scope: parent.scope, adapter, path: parent });
      return rescue && rescue.start >= slotNode.start && rescue.end <= slotNode.end ? rescue : null;
    }
    const parentType = parent?.node?.type;
    if (parentType !== 'Property' && parentType !== 'ObjectProperty') return null;
    pattern = parent.parentPath;
  }
  return null;
}

// nested / array-wrapped parameter-default SYNTH PLAN: mirror the WHOLE pattern tree into a
// literal that replaces the parameter DEFAULT, so it fires strictly when no argument is passed
// and every caller-supplied object destructures natively. the semantics live here ONCE - the
// emitters render the returned tree (babel as AST, unplugin as source text).
//   - the receiver tail drives the context walk: a global-proxy root (`globalThis`, chains of
//     proxy hops) descends per key - a proxy-named key recurses, any other key becomes the
//     CONSTRUCTOR whose children resolve as statics; a bare-constructor root starts there
//   - EVERY branch is mirrored (a one-branch literal would TypeError the sibling on the no-arg
//     call); an unresolvable static key bails the whole plan
//   - a pattern-valued leaf (`of: { name }`) gets the polyfill VALUE and destructures it
//     natively - reading the polyfill's own properties is ordinary polyfill-wins behavior
//   - a sequence default keeps its effect PREFIX (re-emitted ahead of the literal); the
//     receiver tail itself must be effect-free since the literal replaces it
//   - rest bails anywhere: it collects the receiver's REMAINING enumerable keys (an
//     app-extended `Array.myHelper = x` legitimately feeds it) - unknown keys cannot be mirrored
const nestedParamSynthPlanned = new WeakSet();
export function buildNestedParamSynthPlan({ leafPatternPath, meta, resolvePure }) {
  if (!resolvePure || !meta?.object || meta.placement !== 'static') return null;
  if (leafPatternPath?.node?.type !== 'ObjectPattern') return null;
  // ascend to the value-bearing host (any pattern depth): a param-level AssignmentPattern
  // (default slot) or a VariableDeclarator (init slot - reached when the declarator flatten
  // bailed, e.g. an effectful logical init that the flatten cannot discard; the mirror swaps
  // only the receiver node so the effect keeps running in place)
  let cur = leafPatternPath;
  let host = null;
  let slot = null;
  for (let depth = 0; depth < STATIC_WALK_DEPTH && cur?.node; depth++) {
    const parent = cur.parentPath;
    if (!parent?.node) return null;
    const parentType = parent.node.type;
    if (parentType === 'AssignmentPattern' && parent.node.left === cur.node && cur !== leafPatternPath) {
      if (!FUNCTION_LIKE_NODE_TYPES.has(parent.parentPath?.node?.type)) return null;
      host = parent;
      slot = 'right';
      break;
    }
    if (parentType === 'VariableDeclarator' && parent.node.id === cur.node && cur !== leafPatternPath) {
      host = parent;
      slot = 'init';
      break;
    }
    cur = parent;
  }
  if (!host?.node[slot]) return null;
  if (nestedParamSynthPlanned.has(host.node)) return { done: true };
  // peel a pure effect PREFIX off a sequence default via the canonical peel (it also unwraps
  // paren / TS wrappers, which oxc keeps as first-class nodes - a manual sequence-only walk
  // left the unplugin side bailing on `(eff(), R)` parsed with a ParenthesizedExpression);
  // the receiver TAIL is dropped, so it must be provably effect-free itself
  const { tail: receiverNode } = peelNestedSequenceExpressions(host.node[slot]);
  // a fallback-logical root collapses LEFT (`globalThis || self` - the left short-circuits
  // the selection wherever it is defined; the literal replaces the WHOLE logical), while `&&`
  // yields its RIGHT side when taken - only the right operand is replaced, so a falsy left
  // keeps selecting natively. the surviving branch drives the context walk
  // enumerate the REACHABLE value leaves of a fallback tree. `&&` keeps its left selecting
  // natively (only its right is a value leaf, and the result may be falsy); `||` / `??` takes
  // its left leaf, and its right only when the left can be falsy (a guarded left like
  // `m && globalThis` - both sides must then unfold, the runtime picks per call). returns
  // whether the subtree can yield a falsy value
  const targetLeaves = [];
  // arrows whose WHOLE expression body becomes a target: a text replacement with an object
  // literal there needs wrapping parens (block ambiguity); AST printers add them automatically
  const expressionBodyLeaves = new Set();
  function collectValueLeaves(node) {
    const { tail } = peelNestedSequenceExpressions(node);
    if (tail?.type === 'CallExpression' || tail?.type === 'OptionalCallExpression') {
      // a transparent IIFE stays CALLED (its body effects and the selection run natively);
      // only the value leaves inside its return expression are mirrored
      const inlined = peelZeroArgIifeReturn(tail);
      if (inlined) {
        let calleeNode = unwrapRuntimeExpr(tail.callee);
        while (calleeNode?.type === 'SequenceExpression') calleeNode = unwrapRuntimeExpr(calleeNode.expressions.at(-1));
        if (calleeNode?.type === 'ArrowFunctionExpression' && calleeNode.body === inlined) {
          expressionBodyLeaves.add(inlined);
        }
        return collectValueLeaves(inlined);
      }
    }
    if (tail?.type === 'ConditionalExpression') {
      // both branches are reachable - the runtime test picks per call and stays native
      const consequentFalsy = collectValueLeaves(tail.consequent);
      return collectValueLeaves(tail.alternate) || consequentFalsy;
    }
    if (tail?.type !== 'LogicalExpression') {
      targetLeaves.push(tail);
      return false;
    }
    if (tail.operator === '&&') {
      collectValueLeaves(tail.right);
      return true;
    }
    return collectValueLeaves(tail.left) ? collectValueLeaves(tail.right) : false;
  }
  const rootCanBeFalsy = collectValueLeaves(receiverNode);
  // a bare always-defined left keeps the right DEAD: when the whole expression is pure it
  // collapses entirely to the single literal; with an effect anywhere only the left tail is
  // swapped and the dead right stays verbatim
  if (receiverNode.type === 'LogicalExpression' && !rootCanBeFalsy && targetLeaves.length === 1
    && !mayHaveSideEffects(receiverNode)) {
    targetLeaves[0] = receiverNode;
  }

  function rootContext(node) {
    let n = node;
    while ((n?.type === 'MemberExpression' || n?.type === 'OptionalMemberExpression') && !n.computed
      && n.property?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(n.property.name)) n = n.object;
    if (n?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(n.name)) return { kind: 'proxy' };
    // a bare-constructor root is only trusted because the visited leaf's identification
    // already resolved through this very default (meta gate above)
    if (n === node && node.type === 'Identifier') return { kind: 'ctor', name: node.name };
    return null;
  }

  function mirrorPattern(patternNode, ctx) {
    if (patternNode?.type !== 'ObjectPattern' || !ctx) return null;
    const entries = [];
    // duplicate keys bail: the literal would need duplicate properties (ES5-strict invalid)
    // or a subtree-merge policy - the established fallbacks handle the exotic shape soundly
    const seenKeys = new Set();
    for (const prop of patternNode.properties) {
      if (prop.type === 'RestElement') return null;
      if ((prop.type !== 'Property' && prop.type !== 'ObjectProperty') || prop.computed) return null;
      const key = prop.key?.name ?? prop.key?.value;
      if (typeof key !== 'string' || seenKeys.has(key)) return null;
      seenKeys.add(key);
      if (ctx.kind === 'proxy') {
        const inner = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
        if (inner?.type !== 'ObjectPattern') return null;
        const child = mirrorPattern(inner, POSSIBLE_GLOBAL_OBJECTS.has(key) ? ctx : { kind: 'ctor', name: key });
        if (!child) return null;
        entries.push({ key, child });
      } else {
        const pure = resolvePure({
          kind: 'property', object: ctx.name, key, placement: 'static', receiverHint: meta.receiverHint,
        });
        if (!pure || pure.kind === 'instance') return null;
        entries.push({ key, child: { kind: 'polyfill', entry: pure.entry, hintName: pure.hintName } });
      }
    }
    return entries.length ? { kind: 'object', entries } : null;
  }

  const patternNode = slot === 'right' ? host.node.left : host.node.id;
  // mirror EVERY reachable leaf that resolves (each leaf gets its own root context - a leaf
  // that does not resolve stays verbatim, native semantics preserved on that path); replaced
  // leaves must be effect-free themselves, everything kept stays UN-skipped in the emitters
  // so its inner rewrites still compose (discard-rescue contract)
  const targets = [];
  for (const leaf of targetLeaves) {
    if (!leaf || mayHaveSideEffects(leaf)) continue;
    let tree = null;
    if (patternNode.type === 'ObjectPattern') {
      // a whole-collapse target is the full logical - its context is the LEFTMOST value leaf
      let ctxNode = leaf;
      while (ctxNode?.type === 'LogicalExpression') ctxNode = peelNestedSequenceExpressions(ctxNode.left).tail;
      tree = mirrorPattern(patternNode, rootContext(ctxNode));
    } else if (patternNode.type === 'ArrayPattern' && patternNode.elements.length === 1
      && leaf.type === 'ArrayExpression' && leaf.elements.length === 1) {
      const element = mirrorPattern(patternNode.elements[0], rootContext(leaf.elements[0]));
      if (element) tree = { kind: 'array', element };
    }
    if (tree) targets.push({ node: leaf, tree, needsParens: expressionBodyLeaves.has(leaf) });
  }
  if (!targets.length) return null;
  nestedParamSynthPlanned.add(host.node);
  return { host, slot, targets };
}

// can the WHOLE init be discarded by a flatten? plain inits always; a fallback-logical only
// when its left chain is unconditionally taken (`||` / `??` lefts down to a non-logical leaf -
// no `&&` guard anywhere on the path: a guard can select its falsy LEFT, and that path's
// native TypeError must survive the transform) and every dropped operand is pure
export function fallbackInitWhollyDiscardable(initNode) {
  const { tail } = peelNestedSequenceExpressions(initNode);
  if (isChainAssignment(tail)) {
    // the assignment itself is rescued WHOLE, but the destructure READ of its value is what
    // the flatten discards - a guarded RHS keeps its falsy-path TypeError
    return fallbackInitWhollyDiscardable(tail.right);
  }
  if (tail?.type === 'CallExpression' || tail?.type === 'OptionalCallExpression') {
    // a transparent IIFE discards by its RETURN expression: an SE BODY is rescued by the
    // existing discard-rescue harvest, but a guard inside the return keeps its falsy path,
    // and an effectful ARGUMENT (`(g => g)((c++, globalThis))`) is not harvested - the
    // mirror keeps the call and swaps the leaf inside the argument instead
    const inlined = peelZeroArgIifeReturn(tail);
    if (!inlined) return true;
    if ((tail.arguments ?? []).some(arg => mayHaveSideEffects(arg))) return false;
    return fallbackInitWhollyDiscardable(inlined);
  }
  if (tail?.type === 'ConditionalExpression') {
    // a ternary is discardable only when the dropped test is pure and EACH branch is itself
    // wholly discardable - a guard inside a branch keeps its falsy-path TypeError
    return !mayHaveSideEffects(tail.test)
      && fallbackInitWhollyDiscardable(tail.consequent)
      && fallbackInitWhollyDiscardable(tail.alternate);
  }
  if (tail?.type !== 'LogicalExpression') return true;
  if (mayHaveSideEffects(tail)) return false;
  for (let node = tail; node?.type === 'LogicalExpression'; node = peelNestedSequenceExpressions(node.left).tail) {
    if (node.operator === '&&') return false;
  }
  return true;
}

// render a synth-plan tree through emitter-supplied constructors: the recursion structure and
// the leaf dispatch live here ONCE; an emitter provides only `polyfill` (inject + return a
// binding), `object` and `array` value constructors (babel builds AST nodes, unplugin source text)
export function renderSynthTree(tree, constructors) {
  if (tree.kind === 'polyfill') return constructors.polyfill(tree.entry, tree.hintName);
  if (tree.kind === 'array') return constructors.array(renderSynthTree(tree.element, constructors));
  return constructors.object(tree.entries.map(
    ({ key, child }) => ({ key, value: renderSynthTree(child, constructors) })));
}

// drive a synth plan: iterate the targets, render each tree, and let the emitter swap the
// node and quarantine the dropped subtree (skip AFTER a successful replace only - a bailed
// target must stay live for the ordinary rewrites). the iteration semantics live here ONCE
export function applyNestedParamSynthPlan({ plan, renderTree, replaceTarget, skipSubtree }) {
  if (!plan) return false;
  if (plan.done) return true;
  let replaced = false;
  for (const { node, tree, needsParens } of plan.targets) {
    if (!replaceTarget(node, renderTree(tree), needsParens === true)) continue;
    skipSubtree(node);
    replaced = true;
  }
  return replaced;
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
  // ArrayPattern wrapper indices accumulate across iterations (outermost-first) - a wrapper at an
  // outer Property hop is more outer than one at an inner hop, so its indices go in front. without
  // accumulation an inner-iteration wrapper would be dropped when `cur = parent` advances to the
  // next outer Property, and the host descent would lie about the runtime structure
  let allIndices = [];
  for (;;) {
    const pattern = cur.parentPath;
    if (pattern?.node?.type !== 'ObjectPattern') return null;
    const key = sharedResolveKey({
      node: cur.node.key, computed: cur.node.computed, scope: pattern.scope, adapter, bailOnSideEffectKey: true,
    });
    if (!key) return null;
    keys.unshift(key);
    const { parent, indices } = peelDestructureWrappers(pattern);
    allIndices = [...indices, ...allIndices];
    // IDENTIFICATION uses the broad host predicate (same rationale as the array-wrapper
    // resolver): any assignment-destructure host and parameter defaults carry a receiver;
    // the pure flatten re-checks its own narrow host shape at emit
    const slot = destructureReceiverSlot(parent?.node);
    const slotNode = slot ? parent.node[slot] : null;
    // descend the init through each ArrayPattern wrapper at its recorded element index
    // (`[, { from }]` descends index 1, not a blind 0). thread scope/adapter/path so a const-bound
    // array-literal wrapper (`const wrapper = [{ a: Array }]; const [{ a: { from } }] = wrapper`)
    // dereferences to its init, mirroring resolveArrayWrapperedDestructureReceiver
    const receiverNode = allIndices.length
      ? descendArrayWrapperInit(slotNode, allIndices, parent.scope, adapter, parent)
      : slotNode;
    if (receiverNode !== null) {
      // peel parens / chain / TS wrappers AND SE tail to a fixpoint so `(se(), R) as any`
      // (and nested combinations like `(se(), (R as any))`) all reach the receiver. without
      // this, TS-wrapped nested destructures bail the flatten path entirely even though the
      // runtime value is identical to the unwrapped form
      let init = unwrapExpressionChain(receiverNode);
      // collapse the init for identification, mirroring the flat meta: a fallback-logical
      // takes its LEFT (`&&` its RIGHT - the side yielded when taken), and a transparent
      // IIFE call inlines its return expression (`(() => m && globalThis)()`)
      for (let guard = 0; guard < 8 && init; guard++) {
        const inlined = peelZeroArgIifeReturn(init);
        if (inlined) {
          init = unwrapExpressionChain(inlined);
          continue;
        }
        if (isChainAssignment(init)) {
          // a chain assignment evaluates to its RHS; the flatten rescues the assignment
          // WHOLE, so the RHS is never discarded - identification just follows the value
          init = unwrapExpressionChain(init.right);
          continue;
        }
        if (init.type === 'LogicalExpression') {
          init = unwrapExpressionChain(init.operator === '&&' ? init.right : init.left);
          continue;
        }
        break;
      }
      if (!init) return null;
      let receiver;
      if (init.type === 'ConditionalExpression') {
        // a ternary identifies only when BOTH branches resolve to a global-proxy receiver
        // (`c ? globalThis : self` - different ALIASES of the same global object) - the
        // runtime picks per call, the per-leaf mirror emits per branch, and usage-global
        // injects the shared modules. a non-proxy branch (diverging constructors) bails
        const branchProxyName = branchNode => {
          let branch = unwrapExpressionChain(branchNode);
          while (branch?.type === 'LogicalExpression') {
            branch = unwrapExpressionChain(branch.operator === '&&' ? branch.right : branch.left);
          }
          if (!branch) return null;
          const name = resolveObjectName({ objectNode: branch, scope: parent.scope, adapter, path: parent });
          return name && POSSIBLE_GLOBAL_OBJECTS.has(name) ? name : null;
        };
        const consequentName = branchProxyName(init.consequent);
        receiver = consequentName && branchProxyName(init.alternate) ? consequentName : null;
        if (!receiver) return null;
      } else {
        receiver = resolveObjectName({ objectNode: init, scope: parent.scope, adapter, path: parent });
      }
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
