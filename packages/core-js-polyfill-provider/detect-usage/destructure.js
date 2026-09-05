// destructure-receiver detection: build polyfill meta for a destructured property given
// its init node. handles direct identifiers, member chains, sequences, logical / conditional
// fallbacks (with `fromFallback` flag), chain-assignment, string-literal init. exposes
// per-branch viability (`isViableBranchForKey`), branch enumeration for usage-global
// (`enumerateFallbackDestructureBranches`), and the parser-shape gate
// (`canTransformDestructuring`)
import {
  aliasDeclScope,
  arrayLiteralSlotValue,
  arrayWrapSlotValueCandidates,
  asProxyGlobalName,
  assignmentAliasHintSoundAtRead,
  bindingPolyfillHint,
  cachedContainerPaths,
  canHoldBuiltIn,
  computedKeyHasSideEffects,
  createInstanceNodeCache,
  destructureReceiverNode,
  destructureReceiverSlot,
  findArrayWrappedDestructureHost,
  findEnclosingFunctionLikePath,
  findIifeCallSite,
  findObjectKeyBeforeSpread,
  flattenInlineArraySpreads,
  FN_NODE_TYPES,
  followConstIdentifierInit,
  forOfHeadElements,
  forOfHeadIterableElements,
  FUNCTION_LIKE_NODE_TYPES,
  functionScopeBindsVarOrFunction,
  getFallbackBranchSlots,
  isBareUndefinedIdentifier,
  isChainAssignment,
  isDestructurePattern,
  isForXStatement,
  isFunctionParamDestructureParent,
  isMutatedGlobalSlot,
  isNullLiteralNode,
  isPristineProxyGlobal,
  isReassignedBeyondDeclarator,
  isReceiverShapedNode,
  isReplayableSynthKey,
  isRestProperty,
  isValidIdentifierName,
  leadingDiscardedEffectSlots,
  mayHaveSideEffects,
  objectLevelPairedProperty,
  objectLiteralHoldsObservable,
  objectPatternHasNestedValue,
  objectPatternLiteralKeyPath,
  objectPropertyReadValue,
  pairedArrayWrapInitElement,
  paramListReadsName,
  patternBindingCount,
  patternSlotTarget,
  peelFallbackBranchInner,
  peelFallbackReceiver,
  peelNestedSequenceExpressions,
  peelParenAndTSParentPath,
  peelProxyGlobalObject,
  peelSequenceTail,
  peelTransparentWrapperPath,
  peelZeroArgIifeReturn,
  positionalElementPath,
  POSSIBLE_GLOBAL_OBJECTS,
  PRIMITIVE_LITERAL_TYPES,
  propBindingIdentifier,
  pureImportEntryOf,
  reachingContainerValueNode,
  reassignmentBlocksGlobalResolve,
  reassignmentValueEnumeration,
  reassignmentValueNodes,
  receiverCarriesLiveOptional,
  reEvaluationObservable,
  relocatedHeadElement,
  requireCallSource,
  resolveCallArgument,
  resolveCallArgumentCoords,
  resolveFallbackReceiver,
  spelledSlotName,
  statementListOf,
  staticMemberKeyName,
  synthSlotName,
  synthSwapPropKey,
  unwrapCollectingSePrefixes,
  unwrapExpressionChain,
  unwrapRuntimeExpr,
  unwrapSafeSequenceTail,
  varInitDominatesUsage,
  walkAstNodes,
  wksComputedKeyName,
} from '../helpers/ast-patterns.js';
import {
  findNamespaceMemberValue,
  isUsableFallbackReceiverArg,
} from '../helpers/class-walk.js';
import {
  CAPITALISED_IDENT,
  chainSealsAShortCircuit,
  computedKeyWellKnownSymbolName,
  consumableHopSlotName,
  discardRescueNodes,
  globalProxyMemberName,
  inlineCallReturnExpression,
  isCallShape,
  isStaticPlacement,
  isUndefinedNode,
  navValueCanShortCircuit,
  peelChainAssignmentDeep,
  peelRealmLogicalDefault,
  peelReceiverSequenceTail,
  proxyGlobalRootName,
  proxyReceiverValueCanBeUndefined,
  reachableAliasValues,
  resolveKey as sharedResolveKey,
  resolveObjectName,
  resolveSynthKeys,
  seBearingChainRootCall,
  symbolSourcedFoldedKey,
  unwrapTransparentSeq,
} from './resolve.js';
import { identifier, memberFromKeyName, objectExpression, synthProperty } from '../render.js';
import { entryToGlobalHint, resolve as resolveBuiltIn } from '../index.js';
import { staticReceiverHint } from './globals.js';

// build meta for a destructuring property given its resolved init node + key.
// `receiverHint` lets resolveHint reject `const { includes } = Array` (instance method
// that doesn't exist on the constructor) while accepting `Array.from` and inherited
// Function/Object prototype methods like `name`/`toString`.
// the ctor names a dirty binding is WRITTEN with, read off its own reassignment enumeration. the
// alias registry sees only writes that registered an alias; a write whose RHS resolves on its own
// (`M = globalThis.Map`) never does, and its ctor is exactly the one a later read may need. lives
// here (not beside the plan it feeds) because members.js already imports this module
export function aliasWriteCtorNames({ name, scope, adapter, path }) {
  const binding = adapter.getBinding(scope, name, path);
  if (!binding) return [];
  const declarator = binding.node ?? binding.path?.node;
  const names = [];
  const written = reassignmentValueNodes({ binding, usagePath: path, name, ctx: { scope, adapter, path } });
  for (const node of [...declarator?.type === 'VariableDeclarator' && declarator.init ? [declarator.init] : [], ...written]) {
    const objectName = resolveObjectName({ objectNode: node, scope, adapter, path });
    if (objectName && !names.includes(objectName)) names.push(objectName);
  }
  return names;
}

export function buildDestructuringInitMeta({
  initNode, key, scope, adapter, path = null, unionSink = null, resolveStaticKey = null,
}) {
  const meta = buildDestructuringInitMetaCore({ initNode, key, scope, adapter, path, unionSink, resolveStaticKey });
  // a static the user monkey-patches is NOT a polyfillable destructure source: the prop
  // stays raw and the receiver substitutes through the identifier machinery, so the patch
  // and the extraction read the same object
  // ... except the well-known-symbol key: its render (`_getIteratorMethod`) reads THROUGH
  // the receiver, so the patched slot is exactly what it answers
  if (meta?.object && meta.placement === 'static' && meta.key !== 'Symbol.iterator'
    && adapter.isMutatedStatic?.(meta.object, meta.key)) return null;
  return meta;
}

function buildDestructuringInitMetaCore({
  initNode, key, scope, adapter, path = null, unionSink = null, resolveStaticKey = null,
}) {
  if (!initNode) return { kind: 'property', object: null, key, placement: null };
  // oxc-parser preserves ParenthesizedExpression (Babel strips them)
  const unwrapped = unwrapTransparentSeq(initNode);
  // branch handlers for binary / sequence / conditional shapes recurse with the per-branch
  // expression; pure positional resolution falls through to the type-specific cases below.
  // `path` threads through every recursion so downstream `adapter.hasBinding(scope, name,
  // path)` reaches the TS-runtime fallback (`declare const X` / namespace bodies that
  // estree-toolkit's scope tracker doesn't register)
  switch (unwrapped.type) {
    case 'LogicalExpression':
      return resolveLogicalDestructureMeta({ node: unwrapped, key, scope, adapter, path, resolveStaticKey });
    case 'SequenceExpression':
      // `(0, Array)`: sequence evaluates to its last expression
      return buildDestructuringInitMeta({ initNode: unwrapped.expressions.at(-1), key, scope, adapter, path, unionSink, resolveStaticKey });
    case 'ConditionalExpression':
      return resolveConditionalDestructureMeta({ node: unwrapped, key, scope, adapter, path, resolveStaticKey });
    case 'AssignmentExpression':
      // chain `const { from } = foo = cond ? Array : Iterator` evaluates AssignmentExpression
      // to its RHS - recurse on right so meta tracks the actual destructure receiver
      if (isChainAssignment(unwrapped)) {
        return buildDestructuringInitMeta({ initNode: unwrapped.right, key, scope, adapter, path, unionSink, resolveStaticKey });
      }
      break;
    case 'CallExpression':
    case 'OptionalCallExpression': {
      // zero-arg IIFE wrapping a fallback shape: `const { from } = (() => cond ? Array
      // : Iterator)()`. recurse on the IIFE's return expression so per-branch enumeration
      // sees the conditional/logical inside. args-bearing calls preserve their semantics
      // (peel returns null, switch falls through to the `object: null` default)
      const iifeInner = peelZeroArgIifeReturn(unwrapped);
      if (iifeInner) return buildDestructuringInitMeta({ initNode: iifeInner, key, scope, adapter, path, unionSink, resolveStaticKey });
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
  // `const { from } = this` inside a STATIC method of `extends Array`: `this` is the
  // constructor, so the destructure reads the inherited STATIC surface exactly like
  // `this.from` - resolve through the emitter's class-walk hook (same extends resolution
  // and own-static-member shadow gate as the member remap); non-static / shadowed /
  // unresolved supers fall through to the untyped default
  if (unwrapped.type === 'ThisExpression' && path) {
    const inherited = adapter.resolveThisStaticHost?.(path, key);
    if (inherited) return { ...inherited, receiverHint: staticReceiverHint(inherited.placement, inherited.object) };
  }
  // `const { from } = Array` or `const { from } = globalThis.Array`; a member init that names
  // no proxy-global chain still resolves through a const-bound static CONTAINER
  // (`const { from } = w.k` over `const w = { k: Array }`) - the SAME walk fallback the member
  // and nested-destructure reads pair with, so the flat spelling stops under-resolving
  if (isReceiverShapedNode(unwrapped)) {
    const objectName = resolveObjectName({ objectNode: unwrapped, scope, adapter, path, resolveStaticKey })
      ?? staticContainerReceiverName({ node: unwrapped, scope, adapter, path, unionSink });
    const placement = objectName ? isStaticPlacement(objectName) : null;
    // an alias whose ctor-hint could not drive a STATIC narrow (a REFUSED registration - a
    // conditional write, an SE-carrying init) resolves to NOTHING here, and the key then drops
    // entirely: the destructured read goes out raw off a binding the emit already swapped to the
    // pure ctor, so the static is `undefined` where native answers the method. carry the hint like
    // the member channel does - the emitters render the same runtime ctor guard for it
    if (!objectName && unwrapped.type === 'Identifier') {
      const guardedBinding = adapter.getBinding?.(scope, unwrapped.name, path);
      // ... and when NOTHING registered an alias (`let M; if (c) M = globalThis.Map` - the
      // write's RHS resolves on its own, so no alias is ever registered), the write
      // enumeration IS the hint, exactly as the member channel reads it
      const writeCtors = aliasWriteCtorNames({ name: unwrapped.name, scope, adapter, path });
      const hint = guardedBinding?.guardedAliasHint ?? writeCtors[0] ?? null;
      if (hint) {
        return {
          kind: 'property', object: null, key, placement: 'static', receiverHint: null,
          guardedAliasHint: hint,
          // every ctor the slot was written with - the key may live on an EARLIER write's one, and a
          // write whose RHS resolves on its own (`M = globalThis.Map`) registers no alias at all, so
          // the binding's write enumeration is asked too
          guardedAliasHints: guardedBinding?.guardedAliasHints ?? null,
          guardedWriteObjects: writeCtors,
          guardOnly: true,
        };
      }
    }
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
// `fromFallback` marks that the runtime value may come from EITHER branch, which routes the
// emit to per-branch enumeration (see `resolveAndDestructureMeta` below) rather than a single
// whole-init replacement - it does not disable the rewrite. `&&` is always conditional (primary
// only when left truthy, else falsy left), so always flag; `??`/`||` flag only when the fallback
// is the resolved side
function resolveLogicalDestructureMeta({ node, key, scope, adapter, path, resolveStaticKey = null }) {
  return node.operator === '&&'
    ? resolveAndDestructureMeta({ node, key, scope, adapter, path, resolveStaticKey })
    : resolveOrNullishDestructureMeta({ node, key, scope, adapter, path, resolveStaticKey });
}

// `&&`: primary is the RIGHT branch. when both branches resolve to the SAME known object
// the polyfill applies cleanly; otherwise fromFallback flag triggers per-branch enumeration
// (`Array && Map` for `entries` -> `Array && _Map`, `Array && Promise` for `from` ->
// `{from:_Array$from} && _Promise`). `fromFallback` always set when objects differ or left
// doesn't resolve - runtime value depends on the left's truthiness
function resolveAndDestructureMeta({ node, key, scope, adapter, path, resolveStaticKey = null }) {
  // a branch that resolves to a monkey-patched static yields a null meta - guard before reading
  // `.object` (null deref -> build crash), leaving the destructure raw exactly as the conditional
  // path does (the per-identifier receiver substitution handles the mutated static elsewhere)
  const primaryMeta = buildDestructuringInitMeta({ initNode: node.right, key, scope, adapter, path, resolveStaticKey });
  if (!primaryMeta?.object) return primaryMeta;
  const leftMeta = buildDestructuringInitMeta({ initNode: node.left, key, scope, adapter, path, resolveStaticKey });
  if (leftMeta?.object === primaryMeta.object) return primaryMeta;
  if (fallbackArmsDisagreeOnType(primaryMeta, leftMeta)) return { kind: 'property', object: null, key, placement: null };
  return { ...primaryMeta, fromFallback: true };
}

// `||` / `??`: primary is the LEFT branch (taken when truthy / non-nullish). use primary
// when its meta resolves to a real polyfill (static lookup on known receiver, OR instance
// fallback for unknown receiver with instance-method key like `Stub ?? Object` for `keys`
// -> `_keys(...)`). otherwise the fallback (right) carries the actual polyfill - e.g.
// `MyArray || Iterator` for `from` registers `Iterator.from` because `_Iterator`'s
// constructor binding doesn't carry the static method
// a HOP meta (`{ Array: { from } } = globalThis`) names no static of its own - `globalThis.Array`
// is a proxy SURFACE read, not a polyfilled static - so the primary test below discarded it and a
// `||` wrapping a BRANCHING left dropped the whole selection to its unresolvable fallback, leaving
// the pattern raw. only a left that already branches qualifies: it is the shape the per-branch
// machinery owns, and its own enumeration resolves each arm through the surface
function branchingProxySurfacePrimary(meta, adapter) {
  return !!meta?.fromFallback && meta.kind === 'property' && POSSIBLE_GLOBAL_OBJECTS.has(meta.object)
    && isPristineProxyGlobal(adapter, meta.object);
}

function resolveOrNullishDestructureMeta({ node, key, scope, adapter, path, resolveStaticKey = null }) {
  // null meta = monkey-patched static branch; null-guard before `.object` (build crash otherwise)
  const primaryMeta = buildDestructuringInitMeta({ initNode: node.left, key, scope, adapter, path, resolveStaticKey });
  if (primaryMeta?.object && (resolveBuiltIn(primaryMeta) || branchingProxySurfacePrimary(primaryMeta, adapter))) {
    // the left is the unconditional value only while it cannot be nullish: an undefinable
    // probe nav (`globalThis.window?.Array ?? {}`) selects the FALLBACK exactly off-env, so
    // the runtime value depends on the environment like a differing-branch `&&` - flag it
    // for the per-branch machinery instead of binding the polyfill to the left
    return fallbackValueCanBeNullish(node.left, { scope, adapter, path })
      ? { ...primaryMeta, fromFallback: true } : primaryMeta;
  }
  const fallbackMeta = buildDestructuringInitMeta({ initNode: node.right, key, scope, adapter, path, resolveStaticKey });
  if (!fallbackMeta?.object) return fallbackMeta;
  if (fallbackArmsDisagreeOnType(fallbackMeta, primaryMeta)) return { kind: 'property', object: null, key, placement: null };
  return { ...fallbackMeta, fromFallback: true };
}

// may a fallback BRANCH be synth-swapped to a polyfill literal? a logical LEFT operand
// selects by its OWN value (`||` / `??` take the right exactly when the left is falsy /
// nullish): an undefinable branch is nullish precisely where the always-defined synth
// literal is not, so the swap flips which branch runs - that branch stays raw, its nav
// route keeps the value semantics. test-selected branches (ternary arms, a logical RIGHT)
// swap freely. shared by both emitters' per-branch synth walks
export function fallbackBranchSwapKeepsSelection({ hostNode, slot, branchNode, scope, adapter, path }) {
  if (hostNode?.type !== 'LogicalExpression' || slot !== 'left') return true;
  return !fallbackValueCanBeNullish(branchNode, { scope, adapter, path });
}

// can this fallback OPERAND evaluate to nullish - the value question exactly as `||` / `??`
// see it? a short-circuit hidden under a SEAL never hands nullish on: the read above the
// seal THROWS instead (and the probe channel owns that throw), so only a top-reaching
// short-circuit or a bare environment probe counts
function fallbackValueCanBeNullish(node, aliasCtx) {
  const core = unwrapTransparentSeq(node);
  return proxyReceiverValueCanBeUndefined(core, ({ name }) => resolveBuiltIn({ kind: 'global', name }), aliasCtx)
    && !chainSealsAShortCircuit(core, ({ name }) => resolveBuiltIn({ kind: 'global', name }), aliasCtx);
}

// `cond ? Array : Set`: try both branches; flag fromFallback so destructure replacement
// bails (the runtime value depends on `cond`). without this branching, the conditional
// would fall through to the positional case and miss polyfill resolution entirely.
// fromFallback flag is preserved even when consequent/alternate resolve to the same
// constructor name - the runtime values come from different AST paths (`Array` bare vs
// `globalThis.Array` member access; user shim vs core-js import) and per-branch synth
// rewrites each side independently to preserve original receiver semantics
function resolveConditionalDestructureMeta({ node, key, scope, adapter, path, resolveStaticKey = null }) {
  const consequent = buildDestructuringInitMeta({ initNode: node.consequent, key, scope, adapter, path, resolveStaticKey });
  const alternate = buildDestructuringInitMeta({ initNode: node.alternate, key, scope, adapter, path, resolveStaticKey });
  // a branch may be null (a monkey-patched static) - the whole conditional stays raw then,
  // matching the single-receiver mutated path (receiver substitution happens per-identifier)
  if (!consequent || !alternate) return null;
  const resolved = consequent.object ? consequent : alternate.object ? alternate : null;
  if (!resolved) return consequent;
  const other = resolved === consequent ? alternate : consequent;
  if (fallbackArmsDisagreeOnType(resolved, other)) return { kind: 'property', object: null, key, placement: null };
  return { ...resolved, fromFallback: true };
}

// do the arms of a fallback disagree on a TYPE receiver? then NEITHER of them is it: picking one
// injects that family and drops the other's, which is the arm the runtime may take. a NAMED-receiver
// disagreement is enumerable - the union walk reaches both arms by name - but a type one is not, so
// the caller degrades to the typeless meta, whose dispatcher serves whichever arm runs
function fallbackArmsDisagreeOnType(resolved, other) {
  return resolved?.placement === 'prototype' && other?.object !== resolved.object;
}

// SE-bearing receiver policy for the synth literal (`{key: _Branch$key}` swap of `cond ? (() => { c++;
// return Array; })() : Array`, `{from} = IIFE().Array`, `{from} = (eff(), Array) || Set`). the literal
// collapses the receiver, so its observable setup must run EXACTLY once. `callBranch` selects HOW the
// emitter renders that when a key is left UNRESOLVED (an unpolyfilled sibling): with `callBranch` it
// memoizes the receiver through a function-IIFE param (`(function (_ref) { return { ..., other:
// _ref.other }; })(<receiver>)`) so the receiver runs once and unresolved keys read the memo - a
// re-read would otherwise re-run it (the double-eval). when EVERY key resolves there is no re-read, so
// the SE is `rescueSe`-d ahead of the literal instead (`(<receiver>, literal)`); a pure receiver folds
// away. returns { callBranch, rescueSe }
export function classifyCallBranchForSynth({ inner, scope, adapter, path }) {
  if (isCallShape(inner)) {
    return { callBranch: true, rescueSe: seBearingChainRootCall({ node: inner, scope, adapter, path }) };
  }
  // a member receiver whose discarded chain hides observable setup: a buried SE anywhere along the
  // spine OR in a computed key at ANY hop, including the receiver's OWN key (`(eff(), globalThis).Array`,
  // `globalThis[(eff(), 'self')].Array`, `globalThis[(eff(), 'Array')]`), OR a SE-bearing call /
  // chain-assignment at the chain ROOT (`mk().Array`, `IIFE().Array`, `(a = mk()).Array`). the whole
  // receiver VALUE is replaced by the synth literal here, so every computed key's effect is discarded -
  // `collectFoldedReceiverSideEffects` descends the entire receiver (the spine-only prefix walk on
  // `.object` missed computed keys, dropping the effect from the param-default synth)
  if ((inner?.type === 'MemberExpression' || inner?.type === 'OptionalMemberExpression')
    && discardRescueNodes({ node: inner, scope, adapter, path }).length) {
    return { callBranch: true, rescueSe: inner };
  }
  // a fallback-logical receiver (`(eff(), Array) || Set`, `IIFE().Array || Set`) whose resolved LEFT
  // carries discarded SE: the emitter rescues it via the separate leftSe plan when every key resolves,
  // but a mixed key set re-reads the collapsed left, so route through memoization there too. rescueSe
  // stays null - the leftSe plan (suppressed when memoizing) owns the all-resolved rescue
  if (inner?.type === 'LogicalExpression' && inner.operator !== '&&'
    && discardRescueNodes({ node: inner.left, scope, adapter, path }).length) {
    return { callBranch: true, rescueSe: null };
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
  // a bound branch name is the value canon's question, not a bail: a shadow (`function f(Array)
  // { ({from} = cond ? Array : Set) }`) resolves to no global and declines below, while a const
  // ALIAS of one (`const P = Promise; cond ? P : Fallback`) resolves to it and mirrors like the
  // bare name - declining it left the branch reading `.all` off the swapped constructor, which the
  // pure entry never carries
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

// inside a PARAM-DEFAULT host whose winning receiver is the CALL-ARG, an `undefined`-shaped
// branch of that arg is exactly the branch the runtime default fires on: its effective
// receiver IS the default node, so the mirror synths the default's receiver into the arm
// (same branch, same value - the polyfill spelled where the raw arm read `undefined`; the
// raw arm lost the default's polyfill entirely). only an SE-FREE default may substitute -
// the arm otherwise changes WHEN the default's effects run. `null` arms stay out:
// destructuring null throws natively and the runtime default never applies there
export function undefinedArmEffectiveReceiver({ branch, paramDefaultNode }) {
  if (!paramDefaultNode) return null;
  const inner = peelFallbackBranchInner(branch);
  const undefinedShaped = inner && (isBareUndefinedIdentifier(inner)
    || (inner.type === 'UnaryExpression' && inner.operator === 'void' && !mayHaveSideEffects(inner.argument)));
  if (!undefinedShaped || mayHaveSideEffects(paramDefaultNode)) return null;
  return paramDefaultNode;
}

// recursive walk of a fallback-receiver expression collecting per-branch resolved metas.
// `cond1 ? (cond2 ? Array : Iterator) : Set` flattens to [Array, Iterator, Set] - inner
// conditional's both branches reach their own dispatch. each step peels chain-assign /
// paren / TS / safe-SE wrappers; non-fallback shapes resolve via `buildDestructuringInitMeta`.
// exported: the member / `in` producers enumerate a BRANCHING static receiver
// (`(c ? Array : Iterator).from`) through this same walker - the destructure form and the
// member form must agree on what a branch resolves to
export function flattenFallbackBranches({ node, key, scope, adapter, path, followAliasLeaves = false, seen = new Set() }) {
  const peeled = peelFallbackReceiver(node);
  const branchSlots = getFallbackBranchSlots(peeled);
  if (branchSlots) {
    // fork-before-recurse: each sibling branch walks its own copy of the cycle guard, so a name
    // one branch consumed proving its leaf cannot block the SAME name in the next branch
    // (`c ? f() : f()` - the second `f` must still resolve)
    return branchSlots.flatMap(s => flattenFallbackBranches({
      node: peeled[s], key, scope, adapter, path, followAliasLeaves, seen: new Set(seen),
    }));
  }
  // leaf branch: paren/TS-wrapped + safe-SE Identifier / MemberExpression, resolve as a single
  // meta. buildDestructuringInitMeta handles the alias chain + proxy-global / static / global
  // classification. drops branches that didn't resolve to a known global (`object` null)
  const inner = peelFallbackBranchInner(peeled);
  if (!inner) return [];
  const branchMeta = buildDestructuringInitMeta({ initNode: inner, key, scope, adapter, path });
  if (branchMeta?.object) return [branchMeta];
  // alias-to-branching leaf (`const inner = c2 ? Array : Iterator` as a branch of an outer
  // fallback): no single object resolves, but the usage-global union must still reach the
  // aliased branches - follow the same safe indirection the receiver chokes use and flatten
  // the branching value. OPT-IN: the pure-serving viability consumer keeps the plain-leaf
  // contract (pure polyfills branch values in place - following the alias would double-handle).
  // `seen` threads through the whole flatten so mutually-aliased branches terminate
  if (!followAliasLeaves) return [];
  const indirect = resolveIndirectBranchingReceiver({ node: inner, seen, ctx: { scope, adapter, path } });
  return indirect
    ? flattenFallbackBranches({ node: indirect.node, key, scope: indirect.ctx.scope, adapter, path, followAliasLeaves, seen }) : [];
}

// follow SAFE indirection from a receiver expression to a BRANCHING value the canonical
// walker can flatten: a const-init alias chain (`const M = c ? Array : Iterator; M.from`)
// and an inline-eligible zero-arg callee return (`const f = () => c ? A : B; f().from`,
// `function pick() { return c ? A : B; }` - the shared callee inliner's shapes). the
// usage-global method-aware reassignment gate applies (a dominating reassignment bails,
// a reassigned alias stays with the reachable-union machinery); `seen` guards binding
// cycles. returns null for direct / non-branching / unsafe shapes - the caller keeps its
// path; on success the hop standing on the branching value, its `ctx` re-anchored at the scope
// the walk advanced to (its branches resolve where the alias was declared, not at the receiver
// use) and its `readNode` at the site that value was read.
// consumed by the usage-global chokes only: the pure flavor polyfills the branch
// values in place at the init / return site, so following the alias there would double-handle
function resolveIndirectBranchingReceiver({ node, seen = new Set(), ctx }) {
  const { adapter, path } = ctx;
  let { scope } = ctx;
  let cur = unwrapTransparentSeq(node);
  // where the CURRENT hop is read: the receiver use for the first alias, then each prior hop's
  // declarator init (`const captured = src` reads `src` there) - a write AFTER that read site
  // cannot change the captured value, so the dominance check anchors per hop (mirrors
  // `reachableAliasValues`' anchoring; checking every hop against the FINAL use dropped the
  // captured branching value of a source reassigned after capture)
  let readSite = node;
  while (cur) {
    if (cur.type === 'Identifier') {
      const { name } = cur;
      if (seen.has(name) || !adapter.hasBinding(scope, name, path)) return null;
      seen.add(name);
      const binding = adapter.getBinding(scope, name, path);
      if (!binding || reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode: readSite })) return null;
      if (adapter.getBindingNodeType(scope, name, path) !== 'VariableDeclarator' || !binding.node?.init) return null;
      readSite = binding.node.init;
      cur = unwrapTransparentSeq(binding.node.init);
      // advance to the followed binding's own scope, like the sibling const-alias walkers - a
      // later hop reading a name declared in an OUTER scope must resolve it there, not against
      // the receiver-use scope (an inner shadow of that name would swallow the branching value)
      scope = aliasDeclScope(binding, scope);
    } else if (isCallShape(cur)) {
      const ret = inlineCallReturnExpression({ node: cur, seen, ctx: { scope, adapter, path } });
      if (!ret) return null;
      cur = unwrapTransparentSeq(ret.node);
      // the inlined body lives at the callee's declaration site - later hops resolve there
      scope = ret.ctx.scope;
      seen = ret.seen;
    } else return null;
    if (getFallbackBranchSlots(peelFallbackReceiver(cur))) return { node: cur, readNode: readSite, seen, ctx: { ...ctx, scope } };
  }
  return null;
}

// enumerate fromFallback destructure-receiver branches as resolved metas. for usage-global
// dispatch each branch's deps separately so `cond ? Array : Iterator` with `{from}` brings
// in both `es.array.from` and `es.iterator.from` at file level. takes parser-agnostic path
// API (uses .parentPath / .node / .scope) so both babel and estree-toolkit paths work
// a for-x HEAD holds no receiver slot at all: what the pattern reads is an ELEMENT of the iterated
// literal, and a literal with several elements is a BRANCH SET - one value per pass. the union
// consumer wants every one of them, which is exactly what a receiver NAME cannot say and why the
// head's own receiver canon declines a literal whose elements disagree.
// the claim may sit under HOP KEYS (`{ Array: { from } }`), so the climb collects them on the way up
// and each element resolves THROUGH them - the flat shape is this walk with an empty key path
function forOfHeadBranchMetas({ path, key, scope, adapter }) {
  if (typeof key !== 'string') return null;
  const hopKeys = [];
  let cur = path.parentPath;
  for (let depth = 0; depth < STATIC_WALK_DEPTH && cur?.node; depth++) {
    const owner = cur.parentPath;
    const ownerType = owner?.node?.type;
    if (ownerType === 'Property' || ownerType === 'ObjectProperty') {
      // a DEFAULTED hop reads its own value where the slot is absent - not a hop this enumeration
      // may follow; a key that spells no static slot names none the walk could follow either
      if (owner.parentPath?.node?.type === 'AssignmentPattern') return null;
      const hopKey = consumableHopSlotName(owner.node, adapter ? { scope: owner.scope ?? path.scope, adapter, path: owner } : null);
      if (typeof hopKey !== 'string') return null;
      hopKeys.unshift(hopKey);
      cur = owner.parentPath;
      continue;
    }
    if (ownerType !== 'VariableDeclarator') return null;
    const elements = forOfHeadIterableElements(owner);
    if (!elements) return null;
    const metas = [];
    for (const element of elements) {
      if (!hopKeys.length) {
        metas.push(...flattenFallbackBranches({ node: element, key, scope, adapter, path, followAliasLeaves: true }));
        continue;
      }
      const object = walkStaticReceiverChain({ receiverNode: element, walkPath: hopKeys, scope, adapter, path });
      if (object) {
        metas.push({
          kind: 'property', object, key, placement: 'static', receiverHint: staticReceiverHint('static', object),
        });
      }
    }
    return metas.length ? metas : null;
  }
  return null;
}

// the metas a destructure leaf's BRANCHING init hands the per-branch mirror, one per reachable branch:
// a leaf whose meta came from a fallback init (a logical / ternary receiver) or - opted in through
// `followIndirection` - an unresolved property meta whose receiver may alias such a value. walks the
// leaf's pattern chain to the host slot, descends the wrappers the pattern is written under, and
// resolves every branch's value through the hop keys to a static meta; null where the init is not
// that shape, the leaf is no destructure leaf, or a branch names nothing the mirror could bind
export function enumerateFallbackDestructureBranches(meta, path, adapter, { resolvePure = null, followIndirection = false } = {}) {
  if (!path) return null;
  // beyond fromFallback (a DIRECT branching init), the opt-in `followIndirection` admits an
  // unresolved property meta whose receiver may alias a branching value - resolved below
  if (!meta?.fromFallback && !(followIndirection && meta?.kind === 'property' && meta.object === null)) return null;
  const objectPattern = path.parentPath?.node;
  // this walk answers for a DESTRUCTURE leaf, whose receiver stands in the HOST slot two parents
  // up. the indirection backstop hands it every typeless property meta, a MEMBER read included,
  // and there that slot holds the whole init the member merely sits in - resolving it as the
  // receiver injected the statics of a value the member never read (`out = pick(input.from)`)
  if (objectPattern?.type !== 'ObjectPattern') return null;
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
  // a call-site-sourced receiver (IIFE arg) evaluates AT THE CALL SITE - when the arg wins,
  // the branch flatten below resolves it against the call-site scope/path, not the invoked
  // function's inner scope (a param shadowing the arg's name would swallow the branches)
  let receiverScope = null;
  let receiverPath = null;
  if (wrapperNode?.type === 'AssignmentPattern' && wrapperPath.parentPath?.node
      && FN_NODE_TYPES.has(wrapperPath.parentPath.node.type)) {
    // AssignmentPattern is an IIFE param wrapper - prefer the call-arg over the default when it is a
    // usable fallback receiver (a classifiable single receiver OR a conditional / logical enumerated
    // per-branch); a non-receiver arg (notably `undefined`, which makes the runtime apply the default)
    // keeps the default. shared `isUsableFallbackReceiverArg` matches each plugin's usage-pure detect
    const desc = resolveFallbackReceiver(wrapperPath.parentPath, wrapperNode);
    receiverNode = chooseFallbackReceiverNode({
      argNode: desc?.rhsNode, defaultNode: wrapperNode.right, objectPattern, scope: path.scope, adapter, path, resolvePure,
      argScope: desc?.callPath?.scope ?? path.scope, argPath: desc?.callPath ?? path,
    });
    if (desc?.callPath && receiverNode === desc.rhsNode) {
      receiverScope = desc.callPath.scope;
      receiverPath = desc.callPath;
    }
  } else {
    const slot = destructureReceiverSlot(wrapperNode);
    if (slot) receiverNode = wrapperNode[slot];
    else if (wrapperNode && objectPattern) {
      // IIFE-param wrapper without default (`(({p}) => body)(R)`): wrapper is the function;
      // `findIifeCallSite` walks to the call, lifts call-arg at this param's index
      const desc = resolveFallbackReceiver(wrapperPath, objectPattern);
      receiverNode = desc?.rhsNode ?? null;
      if (desc?.callPath && receiverNode) {
        receiverScope = desc.callPath.scope;
        receiverPath = desc.callPath;
      }
    }
  }
  if (!receiverNode) return forOfHeadBranchMetas({ path, key: meta.key, scope: path.scope, adapter });
  let branching = receiverNode;
  let branchingScope = receiverScope ?? path.scope;
  if (!meta.fromFallback) {
    // resolve the indirection against the SAME scope/path the flatten below uses - a winning
    // IIFE call-arg evaluates at the call site, so a param shadowing the arg name must not
    // resolve it in the invoked function's inner scope. the resolved branching value then
    // re-anchors the flatten at the scope the alias walk advanced to
    const indirect = resolveIndirectBranchingReceiver({
      node: receiverNode, ctx: { scope: branchingScope, adapter, path: receiverPath ?? path },
    });
    if (!indirect) return null;
    branching = indirect.node;
    branchingScope = indirect.ctx.scope;
  }
  const out = flattenFallbackBranches({
    node: branching, key: meta.key, scope: branchingScope, adapter,
    path: receiverPath ?? path, followAliasLeaves: true,
  });
  return out.length ? out : null;
}

// literal-resolvable keys reachable through a BRANCHING computed-key node: ternary / logical
// arms, nested arms recursing. a non-branching node contributes its own resolution; an
// unresolvable arm contributes nothing (enumerating only what folds is the safe direction -
// a missed arm under-injects no worse than before, a guessed arm would fabricate a key).
// the fan is a worklist, not a recursion with a budget: arm nesting is the SOURCE's, so a
// budget answered a legal `c ? 'flat' : c2 ? 'flat' : ... : 'at'` exactly as it answered a
// broken tree - past five arms the trailing key stopped being enumerated and usage-global
// silently dropped its polyfill. slots go on the stack in REVERSE so popping keeps the
// depth-first left-to-right order the key list (and the import order behind it) is built in
function flattenBranchKeys({ node, scope, adapter, path }) {
  const keys = [];
  const pending = [node];
  const fanned = new Set();
  while (pending.length) {
    // oxc preserves paren nodes and both parsers keep TS casts - the branch shape must be
    // detected through them (`(cond ? "flat" : "at") in []` arrives paren-wrapped on the
    // estree side and bare on babel); arm wrappers unwrap the same way
    const cur = unwrapRuntimeExpr(pending.pop());
    if (!cur) continue;
    const slots = getFallbackBranchSlots(cur);
    if (!slots) {
      const key = sharedResolveKey({ node: cur, computed: true, scope, adapter, path });
      if (key && !keys.includes(key)) keys.push(key);
      continue;
    }
    // only a cyclic tree can re-reach a fanned node; the fan itself never revisits
    if (fanned.has(cur)) continue;
    fanned.add(cur);
    for (let i = slots.length - 1; i >= 0; i--) pending.push(cur[slots[i]]);
  }
  return keys;
}

// TRUE only when the receiver alias's reaching values are exhaustively enumerable and none can
// dispatch an instance method: every reachable write RHS (plus the declarator init) either
// resolves to a STATIC-placement name or is an instance-inert value - null / undefined only
// (member access and `in` both THROW natively, no polyfill changes that). primitive literals are
// NOT inert - member access auto-boxes (`42..toFixed` dispatches es.number.to-fixed) - and neither
// is a plain object literal: dropping its rows would UNDER-inject in usage-global, the unsafe
// direction. any other value shape (unbound name, call, object / array / string / regexp literal,
// undecomposable write) keeps the typeless
// instance dispatch: inject-if-might stays, but grounded in reachability - `let O = null;
// O ||= Object; 'entries' in O` must not fabricate es.array.entries / web.dom-collections.*
function receiverProvablyInstanceFree({ objectNode, scope, adapter, path }) {
  const alias = objectNode && unwrapTransparentSeq(objectNode);
  if (alias?.type !== 'Identifier') return false;
  const binding = adapter.getBinding(scope, alias.name, path);
  // only a declarator that binds the identifier DIRECTLY enumerates: params / for-x / catch
  // values are open sets, and a PATTERN-bound leaf's value is a property extraction from the
  // init (`const { name } = { name: 'alice' }` binds the string, not the object literal)
  const declarator = binding?.node ?? binding?.path?.node;
  if (!binding || declarator?.type !== 'VariableDeclarator' || declarator.id?.type !== 'Identifier'
    || declarator.id.name !== alias.name) return false;
  const { nodes, complete } = reassignmentValueEnumeration({
    binding, usagePath: path, name: alias.name,
    // the same ctx the sibling enumerations pass: without `resolveKey` an ALIASED computed-key
    // write (`const KK = "x"; ({ [KK]: O } = { x: Object })`) does not decompose, the enumeration
    // reports incomplete, and the receiver stops being provably instance-free - over-inject
    ctx: { scope, adapter, path, resolveKey: sharedResolveKey },
    usageNode: alias,
  });
  if (!complete) return false;
  const values = declarator.init ? [declarator.init, ...nodes] : nodes;
  // an EMPTY enumeration proves nothing: an init-less binding's value comes from elsewhere
  // (TS ambient `declare const`, hoisting, cross-file merging) - stay conservative
  if (!values.length) return false;
  return values.every(valueNode => {
    const value = unwrapTransparentSeq(valueNode);
    if (!value) return false;
    if (isNullLiteralNode(value)) return true;
    // `undefined` is shadowable, so the bare shape ALONE is not proof of nullishness - a shadowed
    // local is an ordinary value that may well dispatch. unlike the sibling nullish canons, whose
    // value node sits at the scope they gate on, the enumerated WRITES here come from anywhere in
    // the binding's subtree: a write in a sibling block that shadows `undefined` reads as the global
    // one from the usage's scope chain, and proving the receiver instance-free off that drops a live
    // instance row. only the INIT arm shares the usage's chain, so only it can be gated
    if (isBareUndefinedIdentifier(value)) {
      return valueNode === declarator.init && !adapter.getBinding(scope, 'undefined', path);
    }
    const objectName = resolveObjectName({ objectNode: value, scope, adapter, path });
    return !!(objectName && isStaticPlacement(objectName));
  });
}

// TRUE when a receiver alias whose declarator RESOLVED can still hold an instance at the use: it is
// a local binding, it is reassigned beyond its declarator, and its reachable value set is not
// provably instance-free. gated on the local reassigned binding so a plain global static receiver
// (`Array.from()`, no binding) and a never-reassigned alias never grow a typeless row
function resolvedAliasMayDispatchInstance({ objectNode, scope, adapter, path }) {
  const alias = objectNode && unwrapTransparentSeq(objectNode);
  if (alias?.type !== 'Identifier') return false;
  const binding = adapter.getBinding(scope, alias.name, path);
  if (!binding || !isReassignedBeyondDeclarator(binding)) return false;
  return !receiverProvablyInstanceFree({ objectNode, scope, adapter, path });
}

// usage-global UNION of reachable member-dispatch targets for a conditionally reassigned receiver
// and/or computed-key. `let K='from'; if(c) K='of'; Array[K]()` can call Array.from OR Array.of;
// `var M={}; if(c) M=Array; M.from()` may dispatch on Array. when BOTH vary the reachable targets
// are the cross product, so each is emitted (over-inject-safe; an impossible pair just resolves to no
// polyfill). returns extra `{ kind:'property', object, key, placement }` metas minus the primary pair
// the caller already emits, empty in the common no-reassignment case. global-only: usage-pure bails
// on any reassignment upstream, so a reassigned alias never reaches a receiver-dropping substitute
// REPOSITIONED-container candidates for the union axis: once an in-place mutator ran on a container
// binding (the census wildcard - queried as the canonical `*` slot), the read slot may hold ANY of
// the literal's values - repositioning permutes positions, never values - so every element that
// resolves to a constructor is a reachable receiver. usage-global injects for each (over-inject
// canon); pure is untouched - its walk bails on the same wildcard, keeping the read native. this is
// why no position analysis is needed here, unlike the slot-WRITE half (see the TASKS record)
function containerRepositionCandidates({ objectNode, scope, adapter, path, resolve }) {
  const member = unwrapRuntimeExpr(objectNode);
  // the receiver may be the wildcard-marked container ITSELF (a destructure host reads `b` directly)
  // or a member off it (`b[0].of`) - both dispatch on values the literal's elements supply
  const owner = member?.type === 'MemberExpression' || member?.type === 'OptionalMemberExpression'
    ? unwrapRuntimeExpr(member.object) : member;
  if (owner?.type !== 'Identifier' || !adapter.isWrittenContainerSlot?.(owner.name, ['*'])) return [];
  const binding = adapter.getBinding(scope, owner.name, path);
  const init = unwrapTransparentSeq(peelChainAssignmentDeep(binding?.path?.node?.init ?? binding?.node?.init ?? null) ?? null);
  if (init?.type !== 'ArrayExpression') return [];
  const names = [];
  for (const element of init.elements) {
    const name = element ? resolve(element) : null;
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

// the usage-global reachable union of a member read as extra metas: every reachable receiver value
// (the alias's writes, its branching values, the container walk's other slot values) crossed with
// every reachable key value, minus the primary pair; each hop of the enumeration resolves at the site
// its value was spelled (the hop's `ctx.scope`) and anchors dominance at its read (`readNode`)
export function collectMemberUnionCandidates(options) {
  const {
    objectNode, computedKeyNode, primaryObject, primaryKey,
    placement: placementOverride = null, receiverInstanceFree = false, scope, adapter, path,
  } = options;
  if (adapter.method !== 'usage-global') return [];
  const objects = reachableAliasValues({
    aliasNode: objectNode, primary: primaryObject, scope, adapter, path,
    // the hop's `readNode` anchors the reassignment-dominance check: an alias hop resolves a source
    // binding's DECLARED value from the alias-read site, so a dead init (unconditionally overwritten
    // before the read) is correctly excluded while a live conditional init survives. its `ctx.scope`
    // re-anchors a write RHS / hop init at the scope it was spelled in (a use-site shadow must not
    // capture it)
    resolve: ({ node, readNode, ctx }) => resolveObjectName({
      objectNode: node, scope: ctx.scope, adapter, path, usageNode: readNode,
    }),
  });
  // an UNRESOLVED receiver (a local instance, an unclassifiable expression) still dispatches every
  // reachable KEY at runtime, so it enumerates as the typeless receiver itself - each union key then
  // earns the same typeless prototype-placement meta the primary key gets (`let k = 'at'; if (c)
  // k = 'flat'; arr[k]` reaches both es.array.at and es.array.flat). without the null entry the
  // cross product is empty and the reachable alternative silently drops (under-injection). the
  // resolved values, when the receiver alias ALSO varies, keep their own static extras beside it.
  // EXCEPT a provably instance-free receiver (the caller computed the flag): its static rows
  // carry the whole injection and the null rows would fabricate instance variants
  // a RESOLVED primary describes the declarator value only - a reassignment can install something
  // else at the use (`let M = Array; if (c) M = makeArr(); M.at()`). when such an alias is not
  // provably instance-free, an unresolvable reachable value may be an instance, and the static-only
  // axis carries nothing for it (`M.at` is no Array static, so the primary meta resolves to no
  // module at all), so the typeless row rides beside the static primary there too - over-inject-safe,
  // and inert for a non-reassigned alias or one whose reachable values are all instance-free
  const typelessRowReachable = primaryObject === null
    ? !receiverInstanceFree
    : resolvedAliasMayDispatchInstance({ objectNode, scope, adapter, path });
  if (typelessRowReachable) objects.unshift(null);
  // a receiver alias whose ctor narrow was REFUSED (guarded registration: conditional
  // placement, SE-carrying init, var redecl, cross-function write) still holds the hinted
  // ctor whenever the refused write actually ran. the alias walk resolves such a binding to
  // nothing, and a STATIC-only key then drops entirely (`M.groupBy` losing es.map.group-by -
  // the typeless instance axis cannot carry it). contribute the hint as an injection-only
  // static candidate: over-inject-safe when the write never ran, and the pure emitters keep
  // their own runtime ctor guard untouched
  if (primaryObject === null && objectNode) {
    let aliasIdent = unwrapTransparentSeq(objectNode);
    if (aliasIdent?.type === 'SequenceExpression') aliasIdent = unwrapTransparentSeq(aliasIdent.expressions.at(-1));
    if (aliasIdent?.type === 'Identifier') {
      // EVERY ctor the slot was written with, not just the one the registration kept: the key may
      // live on an earlier write's ctor (`if (c) M = Map; if (!c) M = Promise` - `groupBy` is Map's),
      // and in usage-global the axis IS the injection - a candidate that never matches at runtime
      // only costs a module the file already loads for its own constructor
      const guardedBinding = adapter.getBinding(scope, aliasIdent.name, path);
      for (const hint of [guardedBinding?.guardedAliasHint, ...guardedBinding?.guardedAliasHints ?? []]) {
        if (hint && !objects.includes(hint)) objects.push(hint);
      }
    }
  }
  for (const candidate of containerRepositionCandidates({
    objectNode, scope, adapter, path,
    resolve: rhs => resolveObjectName({ objectNode: rhs, scope, adapter, path }),
  })) if (!objects.includes(candidate)) objects.push(candidate);
  // pre-resolved receiver names the container-slot walk collected beside its primary descent
  // (written slot values, repositioned elements) - the chain shapes the flat reposition helper
  // above cannot see. already names, so they join the axis directly
  for (const candidate of options.containerWalkObjects ?? []) {
    if (!objects.includes(candidate)) objects.push(candidate);
  }
  // a BRANCHING receiver value - direct or reached through safe indirection - contributes each
  // branch's resolved object to the union axis, so reachable KEYS cross with reachable branch
  // OBJECTS (`const M = c ? Array : Iterator; let k = 'from'; if (c2) k = 'of'; M[k]` reaches
  // all four pairs; the primary-key-only branch extras cannot see the alternative keys).
  // branch-sourced objects pair at STATIC placements only - the branch-extras canon: instance
  // keys stay with the typeless primary, which respects the type-engine's dead-branch folds
  // (a truthy-folded `??` fallback or an isArray-narrowed alternative must not inject)
  const branchObjects = new Set();
  // only when NO primary resolved: a resolved primary means an upstream gate already decided
  // the receiver - a type-engine fold (`definedGlobal ?? Array` folds to its left) or a
  // caller-arg supersede (a real IIFE arg wins over the branching default) - and structurally
  // re-enumerating the raw node would resurrect the dead branch it excluded
  if (objectNode && primaryObject === null) {
    const branching = getFallbackBranchSlots(peelFallbackReceiver(objectNode))
      ? { node: objectNode, ctx: { scope, adapter, path } }
      : resolveIndirectBranchingReceiver({ node: objectNode, ctx: { scope, adapter, path } });
    if (branching) {
      for (const branch of flattenFallbackBranches({
        node: branching.node, key: primaryKey, scope: branching.ctx.scope, adapter, path, followAliasLeaves: true,
      })) {
        if (branch.object && branch.placement === 'static' && !objects.includes(branch.object)) {
          objects.push(branch.object);
          branchObjects.add(branch.object);
        }
      }
    }
  }
  const keys = reachableAliasValues({
    aliasNode: computedKeyNode, primary: primaryKey, scope, adapter, path,
    // `usageNode` anchors the reassignment-dominance check on THIS axis too: without it a key
    // alias resolves its source binding from the binding's own site, so a write that lands AFTER
    // the key was captured (`if (c) k = base; base = "includes"`) both hides the reachable key
    // and offers one that never reaches - the object axis has threaded it all along
    resolve: ({ node, readNode, ctx }) => sharedResolveKey({
      node, computed: true, scope: ctx.scope, adapter, path, usageNode: readNode,
    }),
  });
  // a BRANCHING computed key feeds the key axis the way a branching receiver feeds the object
  // axis: `arr[cond ? "flat" : "at"]()` reaches both arm keys at runtime. with no dominating
  // key the primary is null and the alias walk yields nothing - each literal-resolvable arm
  // joins the axis instead. gated on the null primary for the same reason as the receiver
  // branch block above: a resolved primary means an upstream fold already excluded the arms
  if (computedKeyNode && primaryKey === null) {
    for (const armKey of flattenBranchKeys({ node: computedKeyNode, scope, adapter, path })) {
      if (!keys.includes(armKey)) keys.push(armKey);
    }
  }
  const extras = [];
  for (const object of objects) for (const key of keys) {
    if ((object === primaryObject && key === primaryKey) || key === 'prototype') continue;
    // `placementOverride`: a prototype-navigated producer (`C.prototype[k]`) dispatches EVERY
    // reachable pair as a prototype method of the alternative ctor - the receiver value itself
    // is the ctor, not a static host. other producers derive placement from the value
    const placement = placementOverride ?? (object !== null && isStaticPlacement(object) ? 'static' : 'prototype');
    if (branchObjects.has(object) && placement !== 'static') continue;
    // mirror the primary meta's receiver-type gate so a union key that is an instance method on
    // the constructor (`Array[K]` with K reaching 'concat') bails instead of over-injecting
    extras.push({ kind: 'property', object, key, placement, receiverHint: staticReceiverHint(placement, object) });
  }
  return extras;
}

// the single ATTACH point of the usage-global reachable union: every member / `in` / destructure
// producer that can carry alternatives routes through here, so a producer branch that skips the
// choke is the bug, not a design split. an axis the producer cannot supply is passed null and the
// union enumerates the remaining axis; empty extras leave the meta untouched
export function attachMemberUnionExtras(meta, options) {
  // the instance-free verdict is computed HERE (the one place holding the meta) and threaded
  // down: the union drops its typeless null rows, and the flag on the meta turns the
  // resolver's placement-agnostic instance fallback off for the primary dispatch. gated to
  // usage-global - the enumeration is a union-only concept and pure metas must stay untouched
  // never under a `.prototype`-navigated producer (placement override): its static-resolving
  // alias values ARE instance-method hosts - the axis exists to dispatch them as prototypes
  const receiverInstanceFree = options.adapter?.method === 'usage-global' && options.primaryObject === null
    && options.placement === undefined && receiverProvablyInstanceFree(options);
  if (receiverInstanceFree) meta.receiverInstanceFree = true;
  const extras = collectMemberUnionCandidates({ ...options, receiverInstanceFree });
  if (extras.length) meta.extraCandidates = extras;
  return meta;
}

// may a computed key that resolves to NO single name still ride a null-key carrier into the union?
// usage-global only, for the two key shapes whose written names are enumerable without a primary:
// a BRANCHING literal (`[cond ? "flat" : "at"]` - each arm is reachable) and a REASSIGNED alias with
// no dominating value (a pattern slot default, `[k = "from"] = []`, is default-or-runtime). the
// member producer and the destructure producer ask this ONE question - the carrier is dropped again
// when the enumeration yields nothing
export function unionKeyedCarrierRides({ computedKeyNode, scope, adapter, path }) {
  if (adapter.method !== 'usage-global') return false;
  const keyCore = unwrapRuntimeExpr(computedKeyNode);
  if (getFallbackBranchSlots(keyCore)) return true;
  return keyCore?.type === 'Identifier'
    && isReassignedBeyondDeclarator(adapter.getBinding(scope, keyCore.name, path) ?? {});
}

// destructure twin of the member union: `const { [k]: v } = recv` reads the same reachable
// receiver x key targets a member access does, so each earns its side-effect import too. `path`
// is the ObjectProperty the funnels anchor at - the receiver alias comes from the declarator /
// assignment / param-default host when one exists (the remaining hosts - for-x, catch, nested
// patterns, array elements - bind from a per-element value, not a reassignable receiver alias,
// and enumerate keys only); a per-branch fallback meta keeps its own mirror machinery and is
// excluded here
// the union in TWO phases, because the meta's instance-free verdict has to reach the PRIMARY
// dispatch while the enumeration itself must run after it: `prepare` builds the union options and
// stamps the verdict, `collect` enumerates. the member twin gets the same order for free - its
// producer dispatches after `attachMemberUnionExtras` has already stamped
export function prepareDestructureUnion({
  meta, keyNode, computed, scope, adapter, path, resolvePure = null, containerWalkObjects = null,
}) {
  // a computed key with no single dominating name - a BRANCHING literal (`const { [cond ? "flat" :
  // "at"]: m } = arr`), or a REASSIGNED alias whose only value sits in a pattern slot default - builds
  // NO meta in the producers, yet each written name is reachable exactly like the member-call form.
  // synthesize the same null-key typeless carrier the member path rides so those keys enumerate as
  // usage-global extras (`unionKeyedCarrierRides` is the one gate both producers ask); every other
  // null-meta call stays the no-op it always was
  // the member twin peels the key's sequence tail before it asks anything - both the carrier gate
  // below and the key axis read the peeled node, or an SE-wrapped branching key
  // (`{ [(se(), c ? "flat" : "at")]: f }`) resolves to nothing and not one arm reaches the axis
  const computedKeyNode = computed ? peelReceiverSequenceTail(keyNode) : null;
  if (!meta && computed && unionKeyedCarrierRides({ computedKeyNode, scope, adapter, path })) {
    meta = { kind: 'property', object: null, key: null, placement: 'prototype' };
  }
  if (!meta || meta.kind !== 'property' || meta.fromFallback) return null;
  if (adapter.method !== 'usage-global') return null;
  const hostPath = path?.parentPath?.parentPath;
  const host = hostPath?.node;
  // a NESTED leaf (a hop property, an array wrapper) reads the value its pattern PAIRS with, so that
  // value is the receiver the union enumerates - the flat meta of `{ w: { at } } = { w: g }` already
  // reads `g`, and an instance-free proof asked of the host's literal instead proved nothing, so the
  // typeless rows the flat twin never made were fabricated here
  const nestedHost = host?.type === 'Property' || host?.type === 'ObjectProperty' || host?.type === 'ArrayPattern';
  let hostInitNode = host?.type === 'VariableDeclarator' ? host.init
    : host?.type === 'AssignmentExpression' ? host.right
      : nestedHost ? resolveNestedReceiverNode(path, { adapter }) : null;
  // an AssignmentPattern host routes through the SAME receiver selection as the per-branch
  // synth (`resolveFallbackReceiver` + caller-arg-wins): for an IIFE param-default the LIVE
  // call-arg supersedes the dead default, so the union enumerates the arg's reachables -
  // reading `host.right` structurally enumerated the dead default's instead
  let unionScope = scope;
  let unionPath = path;
  if (host?.type === 'AssignmentPattern') {
    const desc = resolveFallbackReceiver(hostPath.parentPath, host);
    hostInitNode = chooseFallbackReceiverNode({
      argNode: desc?.rhsNode, defaultNode: host.right, objectPattern: path.parentPath?.node,
      scope, adapter, path, resolvePure,
      argScope: desc?.callPath?.scope ?? scope, argPath: desc?.callPath ?? path,
    });
    // a winning call-arg's reachables resolve at the call site (same shadow hazard as the
    // primary meta's resolution)
    if (desc?.callPath && hostInitNode === desc.rhsNode) {
      unionScope = desc.callPath.scope;
      unionPath = desc.callPath;
    }
  } else if (host && FN_NODE_TYPES.has(host.type)) {
    // plain IIFE `(function ({ [cond ? "from" : "of"]: v }) {})(Array)` - the destructure param
    // binds from the caller-arg, resolved at the call site. the AssignmentPattern arm above covers
    // the with-default form; the flat init reads cover declarator / assignment hosts
    const desc = resolveFallbackReceiver(hostPath, path.parentPath?.node);
    if (desc?.rhsNode) {
      hostInitNode = desc.rhsNode;
      if (desc.callPath) {
        unionScope = desc.callPath.scope;
        unionPath = desc.callPath;
      }
    }
  }
  // a branch-synthesized carrier (`{ [cond ? "from" : "of"]: v } = Array`) starts with a null
  // object because the producer resolved no single key and bailed before typing the receiver.
  // recover it from the destructure host so the arm keys cross with the resolved receiver
  // (`Array.from` / `Array.of`) instead of enumerating typeless - mirrors the member path, whose
  // producer resolves the object before building the branch-key carrier. an array-wrappered host
  // (`[{ [cond?...]: v } = {}] = [Array]`) resolves through the same slot-paired peel the static
  // producer uses; the flat declarator / assignment hosts fall back to the plain init read
  let primaryObject = meta.object ?? null;
  if (primaryObject === null && meta.key === null) {
    primaryObject = resolveArrayWrapperedDestructureReceiver(path?.parentPath, adapter)
      ?? (hostInitNode ? resolveObjectName({
        objectNode: peelSequenceTail(unwrapRuntimeExpr(hostInitNode)), scope: unionScope, adapter, path: unionPath,
      }) : null)
      ?? null;
  }
  // the value of a SEQUENCE is its last expression, and the prefix contributes nothing to the object
  // axis: passed raw, the write-enumerating walk below sees a SequenceExpression instead of the
  // binding and finds only the registration's own ctor (`{ groupBy } = (n++, M)` lost Map's module
  // where the member spelling of the same read, which peels before it asks, kept it)
  // oxc keeps the source parens, so the wrapper peel comes FIRST - asked of a
  // ParenthesizedExpression the sequence peel is a no-op, and the wrong order kept losing
  // the module the other leg had already found
  const unionInitNode = hostInitNode ? peelSequenceTail(unwrapRuntimeExpr(hostInitNode)) : hostInitNode;
  const unionOptions = {
    objectNode: unionInitNode,
    computedKeyNode,
    primaryObject,
    primaryKey: meta.key,
    scope: unionScope, adapter, path: unionPath,
    containerWalkObjects,
  };
  // mirror the member funnel's instance-free verdict (this funnel bypasses the attach choke)
  const receiverInstanceFree = unionOptions.primaryObject === null
    && receiverProvablyInstanceFree(unionOptions);
  if (receiverInstanceFree) meta.receiverInstanceFree = true;
  return { ...unionOptions, receiverInstanceFree };
}

export function collectDestructureUnionCandidates(prepared) {
  return prepared ? collectMemberUnionCandidates(prepared) : [];
}

// gate for the "conditional destructure left untouched" warn: it is only meaningful when some branch
// resolves to a GENUINE per-branch-synth candidate for the key, so a real candidate was blocked (by a
// structural pattern issue) from per-branch synth-swap. when NO branch is a real candidate the meta
// is a false positive of the build's permissive object-tagging - `{ from } = cond ? Set : WeakMap`
// (`Set`/`WeakMap` carry no pure static `from`) or `{ banana } = ...` (not a method at all): there was
// no polyfill to leave untouched, so warning "polyfill candidate left untouched" would lie. uses the
// SAME `resolvePure`-static viability the per-branch synth applies (`isViableBranchForKey`: a pure,
// non-instance resolution) so the gate and the registration cannot disagree on what "candidate" means.
// single-sourced so both emitters share the gate (each calls it from its own synth-failure site)
export function fallbackDestructureHasPolyfillableBranch({ meta, path, adapter, resolvePure }) {
  return !!enumerateFallbackDestructureBranches(meta, path, adapter, { resolvePure })?.some(branchMeta => {
    const pure = resolvePure(branchMeta);
    return pure && pure.kind !== 'instance';
  });
}

// extract static destructure key names, or null when any key spells no slot (rest / spread / a
// computed key that folds to nothing) - then the dead-end determination below can't be certain
// and the default is kept
function destructureStaticKeys(objectPattern) {
  const props = objectPattern?.properties;
  if (!props?.length) return null;
  const keys = [];
  for (const prop of props) {
    if (prop.type !== 'ObjectProperty' && prop.type !== 'Property') return null;
    // through the shared resolver: spelling the accepted node types out here made the answer depend on
    // the PARSER (babel numeric keys are `NumericLiteral`, estree `Literal`), so one emitter kept a
    // polyfill-dead default the other superseded - and dropped the polyfill with it
    const name = spelledSlotName(prop);
    if (name === null) return null;
    keys.push(name);
  }
  return keys;
}

// does `node` (a fallback receiver) resolve to a viable - pure, non-instance - polyfill for `key`? mirrors
// `fallbackDestructureHasPolyfillableBranch`'s per-branch viability so the dead-end decision shares the
// SAME "carries a polyfill" notion the per-branch synth uses
function nodeYieldsViablePolyfill({ node, key, scope, adapter, path, resolvePure }) {
  return flattenFallbackBranches({ node, key, scope, adapter, path })
    .some(branchMeta => { const pure = resolvePure(branchMeta); return pure && pure.kind !== 'instance'; });
}

// a resolvable non-Identifier IIFE call-arg (a proxy-global member `globalThis.Array`, an inline-resolvable
// call `(() => Array)()`) supersedes the wrapper param-default ONLY when the default is a polyfill DEAD-END
// for every destructured key (`Object.from` resolves to nothing) AND the arg itself carries a polyfill:
// then the live arg is the only receiver that polyfills. when the default resolves a polyfill for some key
// it stays the synth target - it is the live fallback for the undefined-arg runtime path
// (`globalThis.AsyncIterator` absent on the target -> default `Array` -> `Array.from`). bare Identifiers go
// through `isClassifiableReceiverArg`; conditional / logical args through the per-branch synth (reached
// before this). a CALL arg is NOT excluded: when it inline-resolves to a constructor the synth injects the
// polyfill and the emitter rescues the call's side effect AHEAD of the literal (`(<call>(), { from: _$ })`)
// - excluding it MISSED the polyfill on a live, statically-known receiver. an opaque (non-resolvable) call
// yields nothing and keeps the default. shared by the meta layer + both emitters so detect/emit never disagree
export function resolvableArgSupersedesDeadDefault({
  argNode,
  defaultNode,
  objectPattern,
  scope,
  adapter,
  path,
  resolvePure,
  argScope = scope,
  argPath = path,
}) {
  if (!argNode || argNode.type === 'Identifier') return false;
  const keys = destructureStaticKeys(objectPattern);
  if (!keys) return false;
  // each side is judged WHERE IT EVALUATES: the default in the invoked function's frame, the arg at
  // the call site. judging the arg in the frame lets a same-named parameter shadow it into
  // unresolvable, and the runtime-DEAD default then wins the choice
  function yieldsAny(node, nodeScope, nodePath) {
    return keys.some(key => nodeYieldsViablePolyfill({ node, key, scope: nodeScope, adapter, path: nodePath, resolvePure }));
  }
  return !yieldsAny(defaultNode, scope, path) && yieldsAny(argNode, argScope, argPath);
}

// the IIFE-param fallback receiver choice, single-sourced across the meta layer and both emitters: a
// classifiable arg (or per-branch conditional / logical) wins; else a safe-access proxy-global arg wins
// over a polyfill-DEAD-END default; else the default
export function chooseFallbackReceiverNode({
  argNode,
  defaultNode,
  objectPattern,
  scope,
  adapter,
  path,
  resolvePure,
  argScope = scope,
  argPath = path,
}) {
  if (isUsableFallbackReceiverArg(argNode, argScope, adapter)) return argNode;
  if (resolvableArgSupersedesDeadDefault({
    argNode,
    defaultNode,
    objectPattern,
    scope,
    adapter,
    path,
    resolvePure,
    argScope,
    argPath,
  })) return argNode;
  return defaultNode;
}

// Single source of truth for HOW a polyfillable destructure prop whose computed key has a side effect
// (`{ [(eff(), 'from')]: f } = R`) is emitted on a `var/let/const` declarator. The two bindings render
// the residual at different MOMENTS (babel in traversal, unplugin at its drain) but the strategy
// decision lives here, so a fix lands once. The effect is entangled with the destructure's evaluation order, so the ONE robust
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
// Returns `{ instance, siblingDeclarator, eliminateResidual, memoizeReceiver }` to render the residual,
// or null for an INSTANCE method whose receiver isn't a bare Identifier (re-referencing it would
// double-evaluate) - bail to native.
//   - `eliminateResidual`: the destructure binds NOTHING but the extracted leaf and its init is
//     side-effect-free, so the residual is dead code - drop the whole declaration, leaving only the
//     extracted binding (`const at = _at(<recv>)`). gated to a single declarator (a shared declaration
//     can't drop the slot) outside a for-head. the receiver is referenced once (in the extract), so no memo.
//   - `memoizeReceiver`: the residual SURVIVES (real sibling bindings) and the instance receiver is a
//     CONSTANT array / object literal. re-emitting it beside the residual would duplicate the whole literal
//     (a hundred-element array twice); instead the emitters hoist `const _ref = <recv>` once and reference
//     `_ref` in both the extract and the residual. constant-only (no identifiers / globals / nested calls)
//     keeps it safe: nothing inside needs polyfilling and hoisting a constant can't reorder side effects.
//     a bare-Identifier / primitive receiver is cheap to re-reference, so it is NOT memoized.
//
// (A simpler 'lift' strategy - hoist the effect, drop the receiver, `eff(); const f = _Array$from` - was
// removed: its in-place text surgery made shape assumptions that broke on export / default-with-call /
// nested-sequence keys / array-wrappers. The residual is the single, robust path - so there is no longer
// a strategy enum, only this keep-in-place plan or a bail.)
// does the value an extraction SPELLS perform every effect its init would? then the residual may be
// DROPPED whatever the init's purity - what the dropped read would have evaluated, the dispatch
// evaluates instead, exactly once. that is the question `initIsPure` stands in for, and it answers
// it too narrowly: a LITERAL init whose every OTHER part is effect-free observes nothing when it is
// constructed, so the slot the receiver descends into was the only effect there was
// (`const { y: { at } } = { y: arr.flat() }` - dropping the residual makes `flat` run ONCE, keeping
// it makes it run twice). a computed KEY is an effect the receiver does not spell, and a second
// effect-bearing part means the drop would lose one
// ... a SPREAD part is such a second effect on its own: what it reads is the source's own enumerable
// keys, so a receiver descending into a sibling slot performs none of it
// ... and it reads THROUGH the wrappers a source may spell around any of these: parens and TS
// assertions are erased at runtime, so what they hold performs exactly the effects they do, and one
// leg seeing a wrapper the other's parser drops would answer differently about the same program.
// a SEQUENCE is not such a wrapper - its prefix is an effect the receiver does not spell - which is
// why the peel is `unwrapRuntimeExpr` and never `unwrapExpressionChain`, whose elision would drop
// that prefix out of the accounting
export function receiverPerformsEveryInitEffect(initNode, receiverNode) {
  if (!initNode || !receiverNode) return false;
  if (initNode === receiverNode) return true;
  const init = unwrapRuntimeExpr(initNode);
  const receiver = unwrapRuntimeExpr(receiverNode);
  if (init === receiver) return true;
  const isObject = init.type === 'ObjectExpression';
  if (!isObject && init.type !== 'ArrayExpression') return false;
  if (isObject && init.properties.some(prop => prop.type !== 'SpreadElement'
    && prop.computed && mayHaveSideEffects(prop.key))) return false;
  // a SPREAD stays WHOLE here: what it reads is the source's own enumerable keys, so the effect is
  // the spread itself and not the binding it names - mapping it to its argument read `...spread` as
  // inert and let a receiver that carries none of that pass for one that carries all of it
  const parts = isObject
    ? init.properties.map(prop => prop.type === 'SpreadElement' ? prop : prop.value)
    : init.elements;
  let holder = null;
  for (const part of parts) {
    if (!part) continue;
    if (unwrapRuntimeExpr(part) === receiver || receiverPerformsEveryInitEffect(part, receiver)) {
      if (holder) return false;
      holder = part;
      continue;
    }
    if (mayHaveSideEffects(part)) return false;
  }
  return !!holder;
}

// the receiver an extraction may spell where the residual DIES: past the re-readability gates, which
// exist to protect a second reader that no longer exists. `resolveOptions` is the host's own resolve
// vocabulary and `fallbackNode` what the host hands over when the nested walk names nothing (an array
// wrapper's paired element); the CALLER owns the question of whether its residual dies at all.
// `adapter` folds a BOUND hop key on the way (`{ [k]: { at } }`), as every other resolve of the leaf does.
// a receiver that SPELLS a sequence rides the dispatch as written (`_at((mark(), arr))`), the flat
// spelling's shape - the claims inside it rewrite where they stand
export function carriedInitReceiverNode({ path, initNode, resolveOptions = {}, fallbackNode = null, adapter = null }) {
  const node = resolveNestedReceiverNode(path, { ...resolveOptions, allowInitCarriedEffects: true, adapter })
    ?? fallbackNode;
  if (!node) return null;
  return receiverPerformsEveryInitEffect(initNode, node) ? node : null;
}

// the shared DECISION for a claim extracted beside a destructure RESIDUAL - a kept effectful key, a
// nested instance leaf, a wrapper slot: does the residual die with the extraction
// (`eliminateResidual`), does the receiver memoize into a `_ref` both readers share
// (`memoizeReceiver`), and does the host render the extraction as a sibling declarator
// (`siblingDeclarator`)? the caller hands over the facts it alone can see (binding counts, init
// purity, what its receiver node carries or re-spells); null is the one bail - an instance receiver
// no channel may read twice. both emitters call it, so the residual shape never drifts between them
export function planSideEffectKeyStrategy({
  polyfillKind, isForInit, isMultiDeclarator, receiverNode = null,
  soleBindingInDeclaration = false, initIsPure = false, propKeyIsPure = true,
  memoHoistKeepsOrder = false, slotDropsAlone = false, receiverCarriesInit = false,
  residualKeepsNoReader = false, receiverIsWholeInit = false, receiverReReadable = false,
}) {
  const instance = polyfillKind === 'instance';
  const siblingDeclarator = !!(isForInit || (isMultiDeclarator && instance));
  // dead residual: nothing left to bind, no init effect to preserve, AND the key carries no side effect
  // (`{ [(eff(), 'k')]: f }` keeps the key in place so the effect still runs - dropping it would lose `eff()`).
  // a sibling-declarator host (for-init / multi-declarator) shares its declaration, so the slot can only
  // drop where the host renders one statement per declarator (`slotDropsAlone`) - a loop header cannot
  // ... and an init whose effects RIDE the receiver node - the caller spelled the whole init into the
  // dispatch (`_flat((eff(), Array.prototype))`, the flat canon's own shape) - leaves nothing for the
  // residual to preserve: what the drop discards is a read the extraction now performs itself, in
  // source order, exactly once
  const eliminateResidual = soleBindingInDeclaration && (initIsPure || receiverCarriesInit) && propKeyIsPure
    && (!siblingDeclarator || slotDropsAlone);
  // memoize the receiver into a shared `_ref` read once by both the residual and the extract:
  //   - a CONSTANT array / object literal, so the surviving residual doesn't keep a duplicate of the
  //     (possibly large) literal beside the extract - on a sibling-declarator host as a PRECEDING
  //     declarator at the source slot, the shape the member receiver below takes there. a loop HEAD
  //     re-reads the literal instead, unless a kept effectful key makes the two reads share one ref.
  //   - a side-effect-free MEMBER (`holder.p`) or BRANCHING (`c ? [7] : []`, `a || b`) receiver: a
  //     getter must fire exactly ONCE (like the native single read) and a branch must not re-select,
  //     so the duplicate path is UNSOUND and the memo is the only extraction shape. sibling-declarator
  //     hosts memoize too - the memo joins the declaration as a PRECEDING declarator at the source
  //     slot (`var _ref = holder.p, { ... } = _ref, m = _m(_ref)`), so there is no TDZ and the
  //     for-head needs no statement slot. gated on a side-effect-free WHOLE init: the memo hoists the
  //     receiver read ABOVE the init expression, so a NESTED receiver placed after an effectful slot
  //     (`{ q: se(), p: holder.p }`) would observably reorder
  // a side-effecting computed key is NOT captured by the memo: it stays in the kept key and runs once.
  // receiver classification lives HERE (from the raw node) so both emitters decide identically
  const receiverIsSafe = isReReferenceableReceiver(receiverNode);
  // `memoHoistKeepsOrder`: the caller PROVED the hoist observes nothing out of order even though
  // the whole init is not pure - an ARRAY-WRAPPED slot whose preceding elements are all pure is
  // exactly that shape, and the element itself has already been memoized by the receiver plan,
  // so what reaches here is the re-readable ref
  const orderSafeHoist = initIsPure || memoHoistKeepsOrder;
  // ... and a caller that PROVED the surviving residual reads nothing off this receiver needs no
  // memo at all: the dispatch is the only reader, so it spells the receiver itself and fires its
  // getter exactly once - and it fires it where the extraction stands, which is the placement the
  // caller controls (an effect-bearing wrapper neighbour puts the extraction after the residual)
  // ... and an ARRAY-WRAPPED element whose hoist keeps order memoizes whatever its own shape: the memo
  // evaluates it exactly where native does - reading that element - so the residual the wrapper keeps
  // and the dispatch beside it share the ONE read the source performs. without it an effect-bearing
  // element was refused outright and the claim shipped native (`const [{ at }] = [eff()]`)
  // ... and a RE-READABLE receiver - a binding, a built-in surface nav - needs no memo whatever keeps
  // the residual: the dispatch reads it inline and the residual re-reads it for free, so no `_ref`
  // hoists it ahead of anything (`[{}] = [_globalThis, ...t]; const m = _flat(_globalThis.Array.prototype)`,
  // `const { ...other } = _ref; const a = _at(_ref.Array.prototype)`). a kept EFFECTFUL key is the one
  // reason to memoize such a receiver, since its sentinel residual and the dispatch must share one read
  const memoizeReceiver = instance && !eliminateResidual && !residualKeepsNoReader
    && !(receiverReReadable && propKeyIsPure)
    && ((isConstantLiteralReceiver(receiverNode) && (!isForInit || !propKeyIsPure))
      || ((isSeFreeMemberReceiver(receiverNode) || isSeFreeBranchingReceiver(receiverNode)) && orderSafeHoist)
      // ... a SIBLING-declarator host is no obstacle: the memo joins the declaration as a PRECEDING
      // declarator at the source slot, so it evaluates exactly where the element does. a for-HEAD is,
      // since it has no declarator slot ahead of the pattern
      || (memoHoistKeepsOrder && !isForInit && !receiverIsSafe)
      // ... and a receiver that IS the whole init memoizes whatever its shape: the memo evaluates it
      // exactly where native does - reading the initializer - so nothing can reorder around it, and
      // the residual a kept KEY leaves behind then shares that one read instead of forcing a bail
      // (`const { [(eff(), 'at')]: a } = getArr()` shipped native here while the other leg served it).
      // a for-HEAD takes it as a preceding DECLARATOR, which is where that head keeps its own memos.
      // an ARRAY / OBJECT literal stays out - the literal arms above own it, and memoizing one here
      // served a shape the other leg keeps native
      || (receiverIsWholeInit && !receiverIsSafe
        && receiverNode.type !== 'ArrayExpression' && receiverNode.type !== 'ObjectExpression'));
  // an instance polyfill re-references the receiver beside the SURVIVING residual; bail unless it is safe to
  // read twice (Identifier / side-effect-free literal - see `isReReferenceableReceiver`) or the memo above
  // makes the second read a `_ref` read. when the residual is ELIMINATED the extraction (`const m =
  // _m(recv)`) is the receiver's ONLY read, so a member receiver's getter fires exactly once - same as
  // native - and is sound to extract (`const { y: { at } } = { y: Array.prototype }`)
  // ... and a nav into the BUILT-IN namespace re-spells for free, whatever the memo could not do:
  // the caller proved it through `isReReadableSurfaceNav`, so the extraction may stand beside a
  // surviving residual and read that surface a second time (`[, { Array: { prototype: { flat } } }]
  // = [eff(), globalThis]` - a memo there would hoist the read past the neighbour's own effect)
  if (instance && !receiverIsSafe && !receiverReReadable
    && !eliminateResidual && !memoizeReceiver && !residualKeepsNoReader) return null;
  return { instance, siblingDeclarator, eliminateResidual, memoizeReceiver };
}

// debug-warn message for a conditional-destructure (`{ k } = cond ? A : B` / `= A || B`) whose polyfill
// candidate could NOT be registered as a per-branch synth-swap, so the key is left untouched - whether the
// polyfill applies then depends on which branch the condition selects at runtime. single-sourced so both
// emitters emit the identical diagnostic (babel emitted it inline; unplugin previously stayed silent)
export function conditionalDestructureLeftUntouchedWarning(key) {
  return `conditional destructure with polyfill candidate left untouched ("${ key }" on fallback branch) - runtime availability depends on the selected branch`;
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
  if (functionScopeBindsVarOrFunction(fnPath, localId.name)) return null;
  return { fnPath };
}

// gate for the param-default INSTANCE synth (`function f({ at } = Array.prototype)` -> default replaced
// by `{ at: _atMaybeArray(Array.prototype) }`). the synth is caller-correct by construction (the default
// only evaluates when the caller omits the arg; passed values destructure natively), so the gates are
// about the RECEIVER re-emitted inside the synth literal:
//   - pattern: plain non-computed Identifier / string keys binding Identifiers (a prop default is dead
//     code under polyfill-always-wins, so `{ at = x }` is accepted); rest changes what the synth would
//     have to carry -> bail
//   - re-referenceable receiver (Identifier / this / constant literal): any entry count - each synth
//     entry's read matches native value semantics
//   - side-effect-free MEMBER receiver (`Array.prototype`, `h.g`): single-property pattern only - the
//     synth reads it once, exactly when the native default would (a getter fires once); a second entry
//     (another polyfill or a passthrough `R.other`) would double-read it
//   - the receiver must contain NO unbound identifier that resolves to a pure global (or names a proxy
//     global): the synth re-emits it VERBATIM after the natural visitor is gone, so a rewritable global
//     inside would leak raw (`Iterator.prototype` -> a bare `Iterator`, a ReferenceError off-engine)
export function paramDefaultInstanceSynthAllowed({ objectPatternNode, receiverNode, scope, adapter, path, resolvePure }) {
  if (!receiverNode || !objectPatternNode?.properties?.length) return false;
  // ... but a default the TYPED-NAV dispatch owns is NOT this route's: that one reads the slot's
  // nav once and folds both arms through the instance guard, where a synth over the default alone
  // polyfills the arm that may never run and leaves the LIVE read raw (`{ y: { flat } = list } =
  // src` kept `src.y.flat` native and answered `undefined` off-engine). the two routes disagreed
  // by which ran first, so the ownership question is asked here rather than left to that order
  if (path && typedNavClaimShape(path, { adapter })) return false;
  for (const prop of objectPatternNode.properties) {
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return false;
    // whatever the synth literal can replay is admissible here: the renderers spell a string /
    // numeric key through its resolved name and clone a folded computed one, so none of those
    // loses its binding. a key that resolves to no slot stays native
    if (!isReplayableSynthKey(prop)) return false;
    // a direct wks key renders through the injected pure symbol binding: admissible only
    // where that import resolves and `Symbol` is the real global, not a local shadow
    const wks = prop.computed ? wksComputedKeyName(prop.key) : null;
    if (wks !== null && (adapter.hasBinding(scope, 'Symbol', path)
      || !resolvePure({ kind: 'property', object: 'Symbol', key: wks, placement: 'static' }))) return false;
    if (!propBindingIdentifier(prop.value)) return false;
  }
  function unboundPureGlobal(name) {
    if (adapter.hasBinding(scope, name, path)) return false;
    return POSSIBLE_GLOBAL_OBJECTS.has(name) || !!resolvePure({ kind: 'global', name });
  }
  if (receiverNode.type === 'ThisExpression') return true;
  if (receiverNode.type === 'Identifier') return !unboundPureGlobal(receiverNode.name);
  if (isConstantLiteralNode(receiverNode)) return true;
  // a SELECTING receiver (`nul || arr`, `cond ? a : b`) hands the destructure one of its parts, so it
  // is admissible exactly when EVERY part is - the same question asked of each. a raw global inside
  // still bails (`cond ? Array.prototype : arr`), a re-referenceable pair still passes, and the
  // INSTANCE render spells the selection whole because the arm is chosen at runtime
  if (receiverNode.type === 'LogicalExpression' || receiverNode.type === 'ConditionalExpression') {
    const parts = receiverNode.type === 'LogicalExpression'
      ? [receiverNode.left, receiverNode.right]
      : [receiverNode.test, receiverNode.consequent, receiverNode.alternate];
    // the parts are peeled the way every other receiver question peels: one parser keeps the source
    // parens as nodes and the other strips them, and an unpeeled arm answered no on that alone
    return parts.every(part => paramDefaultInstanceSynthAllowed({
      objectPatternNode, receiverNode: unwrapRuntimeExpr(part), scope, adapter, path, resolvePure,
    }));
  }
  if (receiverNode.type !== 'MemberExpression' && receiverNode.type !== 'OptionalMemberExpression') return false;
  if (objectPatternNode.properties.length !== 1 || mayHaveSideEffects(receiverNode)) return false;
  // walk the chain: literal / plain keys only, Identifier / this root, root not a rewritable global.
  // an OPTIONAL link bails: `host?.x` may be `undefined` at runtime - native then THROWS destructuring
  // it, while the synth literal is always defined (and hands `undefined` to the helper) - a throw-
  // semantics divergence the always-wins contract cannot cover (ambiguous receiver bails to native)
  let cur = receiverNode;
  while (cur.type === 'MemberExpression' || cur.type === 'OptionalMemberExpression') {
    if (cur.type === 'OptionalMemberExpression' || cur.optional) return false;
    if (cur.computed && !adapter.isStringLiteral(cur.property)) return false;
    cur = cur.object;
  }
  if (cur.type === 'ThisExpression') return true;
  return cur.type === 'Identifier' && !unboundPureGlobal(cur.name);
}

// refine an instance entry by TYPING its receiver: the incoming result resolved off the typeless meta
// (a generic receiver-dispatching helper, `_at`); the receiver's type narrows it to the receiver-
// specific variant (`_atMaybeArray`). pure-only by construction (detection stays untyped so
// usage-global keeps its sound over-inject); a failed typing keeps the generic (still correct).
// asked wherever a claim is served with no receiver NAME on its meta - a param default, and the
// per-prop route at large, where the second leg has always refined and this one did not
export function refineInstanceEntryByReceiver({ pureResult, key, receiverPath, resolveNodeType, toHint, resolvePure, path }) {
  // no receiver PATH (a node-only caller) -> no typing; the generic dispatcher stays correct
  const hint = receiverPath ? toHint?.(resolveNodeType?.(receiverPath)) : null;
  const refined = hint ? resolvePure({ kind: 'property', object: hint, key, placement: 'prototype' }, path) : null;
  return refined?.kind === 'instance' ? refined : pureResult;
}

// a receiver SAFE TO REFERENCE TWICE: the residual destructure reads it, and the extracted instance
// polyfill `_m(recv)` reads it again. a bare Identifier / `this` is safe; so is a re-eval-inert literal
// value (array / object / primitive with no nested call, spread, member read, or getter / setter) -
// re-evaluating yields a fresh value of the SAME TYPE, so `_m`'s native-vs-polyfill pick is identical.
// a member / call receiver, or a literal nesting one anywhere in an evaluated position, must NOT be
// re-referenced (a getter / Proxy trap would re-fire on the copy), so they bail. a CONSTANT
// (no-interpolation) template is a string constant, so it parallels a StringLiteral - but an interpolated
// `` `${x}` `` bails (re-evaluating would re-run x's string coercion, a possible effect)
const REFERENCEABLE_LITERAL_TYPES = new Set([
  ...PRIMITIVE_LITERAL_TYPES,
  'ArrayExpression',
  'ObjectExpression',
]);

export function isReReferenceableReceiver(node) {
  if (!node) return false;
  if (node.type === 'Identifier' || node.type === 'ThisExpression') return true;
  if (node.type === 'TemplateLiteral') return node.expressions.length === 0;
  // `reEvaluationObservable` (not `mayHaveSideEffects`): the receiver is EMITTED TWICE, so a
  // member read or accessor definition anywhere in the literal - pure on a single eval - would
  // re-fire a getter / Proxy trap on the copy (`[holder.p]`, `[Set.length + 1]`, `{ get p() {} }`)
  return REFERENCEABLE_LITERAL_TYPES.has(node.type) && !reEvaluationObservable(node);
}

// a side-effect-free MEMBER receiver (`Array.prototype`, `holder.p`): reading it carries no
// call/assignment effect, but a getter would re-fire on a SECOND read - so it can never be
// re-referenced, only MEMOIZED (`_ref = holder.p` read once, both the residual and the
// extraction read `_ref`). drives the memoize arm of the side-effect-key plan
export function isSeFreeMemberReceiver(node) {
  return !!node && (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
    && !mayHaveSideEffects(node);
}

// a nav a SECOND read may spell: every hop names a BUILT-IN surface - a global proxy, a
// constructor-shaped name or `prototype` - which is what the polyfill already models as stable and
// re-spells freely (`globalThis.Array.prototype` stands in the residual and in the dispatch beside
// it). a USER key may be a getter, so a caller that keeps the source's own read next to its own can
// never re-spell one (`recvF.codes` fired twice where the source reads it once, and so would
// `globalThis.navigator`); such a caller has only the MEMO route `isSeFreeMemberReceiver` names
// `allowOptionalHops` answers the same question about a nav the source wrote with `?.`: the hop
// short-circuits the WHOLE chain, so both a residual and a re-spelling read the same value - what
// the flag must never do is let a caller dispatch on a nav it did not otherwise accept
export function isBuiltInSurfaceNav(node, options = undefined) {
  let cur = node;
  let hops = 0;
  while ((cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression')
    && !cur.computed && cur.property?.type === 'Identifier'
    && (cur.property.name === 'prototype' || POSSIBLE_GLOBAL_OBJECTS.has(cur.property.name)
      || CAPITALISED_IDENT.test(cur.property.name))) {
    // an OPTIONAL hop ends the walk unless the caller says it reads the same value twice: the root
    // check below then fails on the member it stopped at, which is the answer this always gave
    if (cur.optional && !options?.allowOptionalHops) break;
    hops++;
    cur = cur.object;
  }
  return hops > 0 && (cur?.type === 'Identifier' || cur?.type === 'ThisExpression');
}

// ... and the SECOND-READ form of the same question: a nav re-spelled BESIDE a surviving residual
// must be rooted in the built-in namespace itself - a plugin-minted alias (`_globalThis`), a global
// proxy or a constructor-shaped name. a capitalised hop off a USER object is a user key, and
// re-reading it fires that object's getter twice (`({ Array: { prototype: { flat: m } } } = src)`
// fired `src`'s `Array` getter twice where the source reads it once)
export function isReReadableSurfaceNav(node, isOwnAlias = null, opts = undefined) {
  if (!isBuiltInSurfaceNav(node, opts)) return false;
  let cur = node;
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') cur = cur.object;
  if (cur?.type !== 'Identifier') return false;
  // the alias this plugin minted in place (`globalThis` -> `_globalThis`) is the built-in namespace
  // under another name; the INJECTOR is what knows it, and that is per-leg state, so the caller
  // brings the lookup and the rule stays here
  return POSSIBLE_GLOBAL_OBJECTS.has(cur.name) || CAPITALISED_IDENT.test(cur.name)
    || !!isOwnAlias?.(cur.name);
}

// ... and the nested INSTANCE surface is that nav ending at `prototype`: the last hop is what makes
// a leaf an instance claim on a REAL surface (`globalThis.Array.prototype`) instead of a name match
// on whatever object the chain happens to reach (`globalThis.Array.keys`, kept native by both legs)
export function isInstanceSurfaceNav(node, opts = undefined) {
  return (node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression')
    && !node.computed && node.property?.type === 'Identifier' && node.property.name === 'prototype'
    && isBuiltInSurfaceNav(node, opts);
}

// the two AST flavors of an object-pattern property - the walk below climbs through either
const PATTERN_PROP_TYPES = new Set(['ObjectProperty', 'Property']);

// ONE climb, three questions. the levels from the consumed prop up to its host, each with what it
// KEEPS - a surviving sibling, a rest - and whether the climb reached the assignment at all. the
// SOLE-element array wrapper is the one transparent step between levels: a wrapper with siblings has
// no way to drop, so the climb ends there like at any other non-hop parent
function consumedAssignmentSlotLevels(propPath) {
  const levels = [];
  let pattern = propPath.parentPath;
  for (;;) {
    if (pattern?.node?.type !== 'ObjectPattern') return { levels, reachesAssignment: false };
    let parent = pattern.parentPath;
    let below = pattern.node;
    while (parent?.node?.type === 'ArrayPattern'
      && parent.node.elements.length === 1 && parent.node.elements[0] === below) {
      below = parent.node;
      parent = parent.parentPath;
    }
    const root = parent?.node?.type === 'AssignmentExpression' && parent.node.left === below;
    levels.push({
      props: pattern.node.properties.length,
      hasRest: pattern.node.properties.some(isRestProperty),
      root,
    });
    if (root) return { levels, reachesAssignment: true };
    if (!PATTERN_PROP_TYPES.has(parent?.node?.type)) return { levels, reachesAssignment: false };
    pattern = parent.parentPath;
  }
}

// the slot an assignment-host OVERWRITE consumes can leave the residual behind: the dispatch re-spells
// what the raw pattern read, so the prop drops, every hop pattern it empties drops with it, and an
// emptied TOP takes the statement. asked BEFORE the dispatch renders, since a pruned slot never runs
// the source default. a level that KEEPS something ends the climb prunable - the prop drops and the
// residual keeps its shape - and so does reaching the assignment. a COMPUTED key keeps its slot
// outright: it is the one part of the pattern the dispatch never re-spells, so the slot runs the key
// ... except a WELL-KNOWN-SYMBOL key with no REST beside it, which the dispatch DOES re-spell -
// `_getIteratorMethod(recv)` performs the very read `[Symbol.iterator]` names - so the slot has
// nothing left to run and drops like a plain one. beside a rest the slot stays named (rest gathers
// what the pattern did not name), and a named slot keeps its own key
export function consumedAssignmentSlotPrunes(propPath) {
  if (propPath?.parentPath?.node?.type !== 'ObjectPattern') return false;
  if (propPath.node.computed
    && (!wksComputedKeyName(propPath.node.key) || mayHaveSideEffects(propPath.node.key)
      || propPath.parentPath.node.properties.some(isRestProperty))) return false;
  const { levels, reachesAssignment } = consumedAssignmentSlotLevels(propPath);
  return levels.some(level => level.props > 1 || level.hasRest) || reachesAssignment;
}

// ... and the sharper question the RECEIVER gate asks: does the residual stop reading the NAV
// altogether? every hop the nav spells has to drop with the slot - a hop kept alive by a surviving
// sibling (`{ y: { flat: m, other } }`) or renamed under a rest leaves the residual reading it beside
// the dispatch, the double read the re-read gate exists to forbid. only the ROOT pattern may keep
// siblings: what they read is the assignment's own receiver, not a hop of the nav
export function consumedAssignmentSlotDropsNav(propPath) {
  if (!consumedAssignmentSlotPrunes(propPath)) return false;
  const { levels, reachesAssignment } = consumedAssignmentSlotLevels(propPath);
  return reachesAssignment && levels.every(level => !level.hasRest && (level.root || level.props === 1));
}

// ... and the last of the three: does the HOST die with the slot? every level up to the assignment
// has to be sole and rest-free, the root included - a surviving sibling keeps the statement, and with
// it the block an unbraced control slot then needs to hold both it and the dispatch
export function consumedAssignmentSlotDropsHost(propPath) {
  if (!consumedAssignmentSlotDropsNav(propPath)) return false;
  return consumedAssignmentSlotLevels(propPath).levels.every(level => level.props === 1);
}

// intermediate slots on the walk from an inner destructure prop up to its host - both AST flavors
// (babel `ObjectProperty` / estree `Property`); `VariableDeclarator` passes through so a declaration
// host terminates the walk at its declaration like the assignment / param hosts do at theirs
const NESTED_PATTERN_WALK_TYPES = new Set([
  'ObjectPattern', 'ObjectProperty', 'Property', 'AssignmentPattern', 'ArrayPattern', 'VariableDeclarator',
]);

// every enclosing ObjectPattern from an inner prop path up to the destructure host - used to CLAIM
// patterns for the proxy-hop-collapse defer, which keys on the ROOT pattern, so a nested prop must
// claim the whole chain. path-API-agnostic (`.parentPath` / `.node` on both emitters)
export function collectEnclosingObjectPatterns(startPath) {
  const patterns = [];
  for (let p = startPath; p && NESTED_PATTERN_WALK_TYPES.has(p.node?.type); p = p.parentPath) {
    if (p.node.type === 'ObjectPattern') patterns.push(p.node);
  }
  return patterns;
}

// a side-effect-free BRANCHING receiver (`cond ? [7, 8] : []`, `a || b`, `x ?? y`): like an SE-free
// member it carries no call/assignment effect, but its value is not stable across reads (branch
// re-selection, operand getters), so it can never be re-referenced - only MEMOIZED (`_ref` read
// once). instance extraction off it stays value-correct on every branch via the Maybe-dispatch
// helpers - the same dispatch that makes a plain union receiver sound
export function isSeFreeBranchingReceiver(node) {
  return !!node && (node.type === 'ConditionalExpression' || node.type === 'LogicalExpression')
    && !mayHaveSideEffects(node);
}

// a literal nesting a member READ in an evaluated position (`[holder.p]`, `[Set.length + 1]`):
// a single evaluation is pure, but emitting a COPY would re-evaluate the read and re-fire its
// getter / Proxy trap - single-read only, exactly like an SE-free member
function isSeFreeRereadLiteral(node) {
  return !!node && REFERENCEABLE_LITERAL_TYPES.has(node.type)
    && !mayHaveSideEffects(node) && reEvaluationObservable(node);
}

// a node built ONLY from literal values (numbers / strings / booleans / null / bigint / regexp / constant
// template, signed numeric, and array / object literals nesting the same). unlike `isReReferenceableReceiver`
// this rejects ANY identifier or member - so the node references no binding and no polyfillable global, can't
// re-run a side effect, and reading it yields a fixed value. that makes it safe to HOIST into a `const _ref`
// without reordering effects or stranding an un-polyfilled global, which is what `memoizeReceiver` needs to
// collapse a large duplicated literal receiver to a single binding. holes / spreads / computed keys / getters
// / methods all bail (a hole has no node; the rest carry identifiers or effects)
function isConstantLiteralNode(node) {
  if (!node) return false;
  if (PRIMITIVE_LITERAL_TYPES.has(node.type)) return true;
  switch (node.type) {
    case 'TemplateLiteral': return node.expressions.length === 0;
    case 'UnaryExpression':
      return (node.operator === '-' || node.operator === '+') && isConstantLiteralNode(node.argument);
    case 'ArrayExpression':
      return node.elements.every(el => el !== null && el.type !== 'SpreadElement' && isConstantLiteralNode(el));
    case 'ObjectExpression':
      return node.properties.every(p => (p.type === 'ObjectProperty' || p.type === 'Property')
        && !p.computed && !p.method && p.kind !== 'get' && p.kind !== 'set' && isConstantLiteralNode(p.value));
    default: return false;
  }
}

// gate for `memoizeReceiver`: a structurally-extensible literal (array / object) whose every nested value is
// also constant. only these can grow large enough that re-emitting beside the residual bloats the output; a
// primitive receiver is atomic, so re-referencing it is never worth a `_ref` binding
export function isConstantLiteralReceiver(node) {
  return !!node && (node.type === 'ArrayExpression' || node.type === 'ObjectExpression') && isConstantLiteralNode(node);
}

// the STATIC a hop names off a constructor, as the pure entry spells it - null where the key is no
// static of it, or an instance member. one resolver for every route spelling such a hop, on either
// leg: `resolvePure` is the leg's own entry resolver, bound to the claim's path where it takes one
export function staticHopPure({ ctorName, key, resolvePure }) {
  const pure = resolvePure({ kind: 'property', object: ctorName, key, placement: 'static' });
  return pure && pure.kind !== 'instance' ? pure : null;
}

// the ROOT a computed init hands the walk, and the keys it reads through. a call, a `new`, `this`
// or a member chain off the user's own object is the value the source computes once - no other
// walk reads through it, so it is the root as written. a nav INTO the built-in namespace is one
// more run of hops: it unfolds onto its own identifier root (`{ of: { name } } = globalThis.Array`
// walks as `{ Array: { of: { name } } } = globalThis`), unless the whole nav still names a built-in
// surface (`globalThis.Array.prototype`), which is the flatten's shape and stays with it. a literal
// is the pairing walk's, which reads through it to the element - null here
function unfoldNestedRoot(root, keys) {
  if (root.type === 'CallExpression' || root.type === 'NewExpression' || root.type === 'ThisExpression') return { root, keys };
  if (root.type !== 'MemberExpression' || root.optional) return null;
  if (!isBuiltInSurfaceNav(root)) return { root, keys };
  if (isBuiltInSurfaceNav(keys.reduce(memberFromKeyName, root))) return null;
  const navKeys = [];
  let cur = root;
  while (cur?.type === 'MemberExpression' && !cur.computed && !cur.optional && cur.property?.type === 'Identifier') {
    navKeys.unshift(cur.property.name);
    cur = cur.object;
  }
  return cur?.type === 'Identifier' ? { root: cur, keys: [...navKeys, ...keys] } : null;
}

// the FACTS of a nested leaf's receiver as a MEMBER CHAIN: the re-referenceable root
// identifier the declarator init spells plus the plain hop keys the pattern descends
// (`{ inner: { [S]: it } } = obj` -> { root: obj, keys: ['inner'] }). where
// `resolveNestedReceiverNode` descends LITERAL inits to a node, this walk answers for the
// identifier-init twin - the consumer renders `root.key...` and reads it once, exactly what
// native destructuring reads. plain hops only: a hop key that EVALUATES something or an inner
// default changes reachability; a BOUND computed key folds to the slot it names through the
// consuming canon when the caller hands over its `adapter`. the BASE that chain reads through -
// proxy-root substitution, mutation gating - is `resolveNestedReceiverBase`'s answer; each leg
// renders it in its own dialect
// eslint-disable-next-line max-statements -- the walk: one arm per pattern level it may stand in
export function resolveNestedReceiverChain(leafPath, {
  soleSlots = false, allowSlotDefault = false, allowLeafSiblings = false, rootMemoized = false, adapter = null,
} = {}) {
  const keys = [];
  let slotDefault = null;
  const leafPattern = leafPath.parentPath;
  let pattern = leafPattern;
  while (pattern?.node?.type === 'ObjectPattern') {
    let owner = pattern.parentPath;
    // a DEFAULT on the way up decides what the claim reads at all: the slot's own value when it is
    // defined, the default when it is not. the caller that asks for it folds BOTH arms through the
    // instance guard (`_at((_ref = src.y) === void 0 ? D : _ref)`) - mirroring the default alone
    // would polyfill the arm that may never run and leave the live read raw. one default per walk:
    // a second would need its own guard around the first, which no caller renders
    if (owner?.node?.type === 'AssignmentPattern' && owner.node.left === pattern.node) {
      if (!allowSlotDefault || slotDefault) return null;
      slotDefault = owner.node.right;
      owner = owner.parentPath;
    }
    const ownerType = owner?.node?.type;
    // a caller dispatching on a USER-owned nav asks for `soleSlots`: re-reading `src.y` is a
    // second getter call, so the extraction is sound only when it OWNS that read - every level
    // it descends must die with it, leaving no residual to spell the same hops again. a
    // built-in surface nav needs none of this: re-reading a known namespace costs nothing.
    // the HOST level is exempt: its siblings name OTHER keys, and the hop this claim empties prunes
    // out of the residual on both legs, so nothing there reads the hop a second time
    // ... and the LEAF's own pattern may keep siblings for the caller that NORMALIZES the shape:
    // it rewrites the declarator into its flat twin (`{ y: { at, other } } = box` -> `{ at, other }
    // = box.y`), where the ordinary memo channel reads the hop once and hands the residual that
    // same identity. every level ABOVE the leaf still has to die with the claim
    // ... and an array WRAPPER standing between that host and its declarator changes nothing about
    // it: the element is still the value the pattern reads, and the emptied hop still prunes.
    // a REST sibling is what takes the exemption back: rest gathers whatever the pattern did not
    // name, so the emptied hop cannot leave - it stays as a sentinel keeping its key excluded, and
    // that sentinel READS the hop a second time, which for a getter is a second call
    if (soleSlots && pattern.node.properties.length !== 1
      && !(allowLeafSiblings && pattern === leafPattern)
      && ((ownerType !== 'VariableDeclarator' && ownerType !== 'ArrayPattern')
        || pattern.node.properties.some(isRestProperty))) return null;
    if (ownerType === 'ObjectProperty' || ownerType === 'Property') {
      const key = consumableHopSlotName(owner.node, adapter ? { scope: owner.scope ?? leafPattern.scope, adapter, path: owner } : null);
      if (typeof key !== 'string' || !isValidIdentifierName(key)) return null;
      keys.unshift(key);
      pattern = owner.parentPath;
      continue;
    }
    if (ownerType === 'VariableDeclarator' && owner.node.id === pattern.node) {
      if (!keys.length) return null;
      // the extraction DISCARDS the init, so a wrapper that carries an effect (a sequence
      // prefix, a chain assignment) must keep the walk out - only pure wrappers peel
      const prefixes = [];
      const root = unwrapCollectingSePrefixes(owner.node.init, prefixes);
      if (prefixes.length || !root) return null;
      // an IDENTIFIER root is free to read twice, which is what lets a host-level sibling keep its
      // own read of it beside the extraction. a root the source COMPUTES - a call, a `new`, a member
      // off the user's own object - it evaluates exactly once, so the extraction may spell it only
      // where it is the root's ONLY reader: the host level sole, the declarator dying whole with the
      // claim (`{ data: { at } } = mk()` reads `mk().data` once, as the source does). and only such
      // an OPAQUE root: a literal is the pairing walk's, which reads through it to the element, and
      // a nav into the built-in namespace is the flatten's, which lands it on the ponyfill
      // ... unless the caller MEMOIZES the root: the memo is then its one evaluation, and a host
      // sibling reads the memo the way it would read an identifier (`{ data: { at }, keys } = mk()`)
      let unfolded = null;
      if (root.type !== 'Identifier') {
        if (!soleSlots || (pattern.node.properties.length !== 1 && !rootMemoized)) return null;
        unfolded = unfoldNestedRoot(root, keys);
        if (!unfolded) return null;
      }
      // the RAW init travels too: a caller that SPELLS this receiver keeps whatever the source
      // wrote around the identifier (a TS cast is the one that matters - `box as any` answers a
      // different type than `box`, and a spelling that drops it resolves against the wrong one)
      // the DECLARATOR travels with the answer: the walk is what proved the way up is patterns all
      // the way, and a caller re-deriving it by its own climb has no such proof - one such climb
      // walked out of an assignment inside an IIFE and handed the rename to the enclosing declaration
      // ... an unfolded nav root is its own identifier, and the keys the nav spelled join the walk's:
      // the spelling it travels with is that identifier, since the init's wrappers wrapped the NAV
      if (unfolded && unfolded.root !== root) {
        return { root: unfolded.root, keys: unfolded.keys, slotDefault, leafPattern, declarator: owner, rootSpelling: unfolded.root };
      }
      return { root, keys, slotDefault, leafPattern, declarator: owner, rootSpelling: owner.node.init };
    }
    // an ARRAY WRAPPER over a literal init is a PAIRING, not a hop: the element the pattern matches
    // is the value the leaf reads through, and the element must be a bare identifier for the
    // dispatch to spell it (`[{ y: { flat: m } }] = [nb]` reads `nb.y`, exactly what the source
    // reads). a SOLE wrapper is discarded whole; one with NEIGHBOURS keeps the literal alive for
    // their coercion, and there the residual re-reads only the ELEMENT - free for an identifier -
    // because the emptied hop prop prunes out of it and leaves the positional `{}` behind
    if (ownerType === 'ArrayPattern') {
      // wrappers NEST (`[[{ y: { flat } }]] = [[nb]]`), and every level asks the same pairing: the
      // pattern's slot picks the literal's element at that level. collect the slot chain up to the
      // declarator, then descend the init by the same slots - one level and five read alike, so the
      // depth is not a rule of its own
      const slots = [];
      let child = pattern;
      let level = owner;
      // wrappers NEST, and a KEY may stand between two of them (`{ pair: [{ y: { at } }] } = { pair:
      // [nb] }`): the pattern's slot picks the literal's element, its key picks the literal's property,
      // and the two steps read alike - what the descent needs is the step chain, not one kind of step
      for (let depth = 0; depth < STATIC_WALK_DEPTH && level?.node; depth++) {
        const levelType = level.node.type;
        if (levelType === 'ArrayPattern') {
          const index = level.node.elements.indexOf(child.node);
          if (index === -1) return null;
          slots.unshift({ index });
          child = level;
          level = level.parentPath;
          continue;
        }
        if ((levelType === 'ObjectProperty' || levelType === 'Property') && level.node.value === child.node) {
          const stepKey = consumableHopSlotName(level.node,
            adapter ? { scope: level.scope ?? leafPattern.scope, adapter, path: level } : null);
          if (typeof stepKey !== 'string') return null;
          slots.unshift({ key: stepKey });
          child = level.parentPath;
          level = child?.parentPath;
          continue;
        }
        break;
      }
      if (level?.node?.type !== 'VariableDeclarator' || level.node.id !== child.node || !keys.length) return null;
      const prefixes = [];
      const levels = [];
      let literal = unwrapCollectingSePrefixes(level.node.init, prefixes);
      for (const step of slots) {
        if (prefixes.length) return null;
        if (step.key === undefined) {
          if (literal?.type !== 'ArrayExpression') return null;
          levels.push({ node: literal, index: step.index });
          literal = unwrapCollectingSePrefixes(literal.elements[step.index], prefixes);
          continue;
        }
        if (literal?.type !== 'ObjectExpression') return null;
        // a SPREAD anywhere could supply the key, so the slot the pattern reads is not this literal's
        const at = literal.properties.findIndex(item => (item.type === 'ObjectProperty' || item.type === 'Property')
          && spelledSlotName(item) === step.key);
        if (at === -1 || literal.properties.some(item => item.type === 'SpreadElement')) return null;
        // ... and a NEIGHBOUR key that carries an effect pins the order: native builds the whole
        // literal before it destructures, so a read moved to the pairing would step over that effect.
        // the array levels leave this to the per-route order questions, which spell it for the host
        // shapes they own; a KEYED level has no such route yet, so the walk itself declines
        if (literal.properties.some((item, itemAt) => itemAt !== at && mayHaveSideEffects(item.value))) return null;
        levels.push({ node: literal, key: step.key, propIndex: at });
        literal = unwrapCollectingSePrefixes(literal.properties[at].value, prefixes);
      }
      if (prefixes.length || literal?.type !== 'Identifier') return null;
      // the pairing FACTS travel too: a caller that rewrites this element into the nav needs the
      // literal and the slot, and it owes the question `wrapperElementNavPlacement` asks - the
      // consumers that only READ through the element owe none of that and ignore them.
      // `wrapper` is the INNERMOST literal (the one holding the element a caller rewrites) and
      // `wrapperRoot` the declarator's own init, which is what a caller checks it against
      return {
        root: literal,
        keys,
        slotDefault,
        leafPattern,
        declarator: level,
        rootSpelling: literal,
        wrapper: levels.at(-1).node,
        wrapperRoot: levels[0].node,
        wrapperKeyed: levels.some(item => item.key !== undefined),
        wrapperLevels: levels,
        elementIndex: levels.at(-1).index,
        hostPattern: pattern,
      };
    }
    // an inner default, an assignment host: reachability or value capture changes - outside this
    // walk's narrow contract
    return null;
  }
  return null;
}

// WHERE does the flatten put the hop read under a wrapper? the element is where the flat twin lives
// there, so writing the nav INTO it makes the read happen when the LITERAL builds - ahead of every
// element after the slot, and ahead of the whole declaration. that is `lead`, and it needs nothing
// standing between: no effect in an element past the slot, and none in a declarator BEFORE this one.
// where something does stand there, the twin TRAILS the residual instead: the literal builds whole,
// the emptied pattern coerces the element, and the read happens after both - which is where the
// source performs it. the element then keeps its own spelling, having nothing to hand the twin
// null = no wrapper at all
export function wrapperElementNavPlacement(walk) {
  if (!walk?.wrapper) return null;
  // ... and the TRAILING form is a STATEMENT after the declaration, so it needs a statement list to
  // stand in: a loop HEAD hosts declarators and an unbraced slot holds one statement, and neither
  // has a place for it. those hosts keep the claim native rather than reorder the read
  const hostSlot = walk.declarator?.parentPath?.parentPath?.node;
  const declarations = walk.declarator?.parentPath?.node?.declarations ?? [];
  const before = declarations.slice(0, declarations.indexOf(walk.declarator.node));
  // ... at EVERY wrapper level, and on BOTH sides of the slot: a neighbour standing after it in
  // an OUTER literal is evaluated after it just the same, so nesting widens what the moved read
  // would reorder past; and one standing BEFORE it is what the memo the twin binds would be
  // hoisted over (`[, { y: { at, findLast } }] = [log.push("n"), nb]` read `y` ahead of `n`)
  return before.every(item => !mayHaveSideEffects(item.init))
    && walk.wrapperLevels.every(level => (level.key === undefined
      ? level.node.elements.filter((element, index) => index !== level.index)
      : level.node.properties.filter((item, index) => index !== level.propIndex).map(item => item.value))
      .every(element => !element || !mayHaveSideEffects(element)))
    ? 'lead' : statementListOf(hostSlot) ? 'trail' : null;
}

// the first PROPERTY path anywhere in a pattern - what a type query about the value the pattern
// destructures has to be asked through, since the resolver answers for a prop and not for a pattern.
// path-API-agnostic like the walks above: both emitters expose `.get` / `.node`, and the object
// property's two spellings (babel `ObjectProperty` / estree `Property`) are accepted either way
export function firstPatternProp(patternPath) {
  const type = patternPath?.node?.type;
  if (type === 'ObjectPattern') {
    for (const prop of patternPath.get('properties')) {
      const propType = prop.node?.type;
      if (propType !== 'Property' && propType !== 'ObjectProperty') continue;
      const valueType = prop.node.value?.type;
      const nested = valueType === 'ObjectPattern' || valueType === 'ArrayPattern'
        ? firstPatternProp(prop.get('value')) : null;
      return nested ?? prop;
    }
    return null;
  }
  if (type === 'ArrayPattern') {
    for (const element of patternPath.get('elements')) {
      const found = firstPatternProp(element);
      if (found) return found;
    }
  }
  return null;
}

// the SHAPE a typed-nav claim resolves on: the leaf reached through the receiver's own type, over
// sole slots, and only where the hops name USER keys. `allowLeafSiblings` is for the callers weighing
// the FLAT TWIN against a mirror - the twin admits siblings at the leaf, so a question that refuses
// them there answers about a route that is not the one being weighed - a nav INTO a built-in namespace is the
// proxy / anchored machinery's shape and the rules there are its own. this is the question about the
// SOURCE, and it is the one the synth gate asks: a fold that takes both arms of a default is the
// synth's business whoever ends up rendering it
export function typedNavClaimShape(leafPath, { allowLeafSiblings = false, rootMemoized = false, adapter = null } = {}) {
  const walk = resolveNestedReceiverChain(leafPath, {
    soleSlots: true, allowSlotDefault: true, allowLeafSiblings, rootMemoized, adapter,
  });
  if (!walk) return null;
  return isBuiltInSurfaceNav(walk.keys.reduce((base, key) => memberFromKeyName(base, key), walk.root))
    ? null : walk;
}

// does the TYPED-NAV dispatch OWN this claim? the shape above, plus what the EXTRACTION can carry -
// so every route that could claim such a shape asks THIS and none can answer it differently
export function typedNavClaimChain(leafPath, options = undefined) {
  const walk = typedNavClaimShape(leafPath, options);
  // a claim whose own KEY carries an effect is not one this dispatch owns: the effect runs where the
  // source wrote it, so the prop cannot leave with the extraction - and a prop that stays reads the
  // hop a SECOND time. the flat twin is where both are answered at once (the memo the residual
  // reads), which the normalization reaches on the hosts it takes; everywhere else the claim stays
  // native, and dropping the prop here would drop the effect with it
  return walk?.leafPattern?.node?.properties?.some(item => item.type !== 'RestElement'
    && computedKeyHasSideEffects(item)) ? null : walk;
}

// the POSITIONAL twin of the chain walk: where an ARRAY pattern element holds the claim, the
// element cannot be spelled as a member - the pattern ITERATES, and `rows[0]` would read a
// property instead of pulling from the iterator. what CAN be spelled is a binding: the element
// slot takes a minted name, the pattern keeps its iteration, and the dispatch reads that name
// (`const [{ y: { at } }] = rows` -> `const [_el] = rows; const at = _at(_el.y);`). the answer is
// the SLOT to rename plus the hop keys below it; the host declaration stays put, so its init runs
// exactly where and as often as the source runs it - nothing is discarded here.
// sole slots all the way from the leaf to the element, for the same reason the member walk asks:
// what the rename drops must bind nothing else. elements BESIDE this one are free - they pull
// their own values from the same iteration
// the declaration a REST-bearing host hangs off, and the value that host pulls from: the
// declarator's own init, or - under an ARRAY WRAPPER - the element the wrapper pairs it with. the
// wrapper is the same host one literal out, and the hop rename reads the paired element the way the
// flat one reads the init (`const [{ y: { at }, ...rest }] = [nb]`)
function restHostCarrier(host) {
  const owner = host.parentPath;
  if (owner?.node?.type === 'VariableDeclarator' && owner.node.id === host.node) {
    return { declarator: owner, value: owner.node.init };
  }
  if (owner?.node?.type !== 'ArrayPattern') return null;
  const declarator = owner.parentPath;
  if (declarator?.node?.type !== 'VariableDeclarator' || declarator.node.id !== owner.node) return null;
  const index = owner.node.elements.indexOf(host.node);
  const init = unwrapRuntimeExpr(declarator.node.init);
  if (index === -1 || init?.type !== 'ArrayExpression') return null;
  // the positional read: a spread no static position survives makes the pairing a POSSIBILITY,
  // never a fact
  const coords = resolveCallArgumentCoords(init.elements, index);
  return coords ? { declarator, value: resolveCallArgument(init.elements, index) } : null;
}

// can the host of this claim take the residual its surviving slots need - a plain statement beside
// the declaration? a loop HEAD hosts declarators, a for-x LEFT binds per iteration, and an
// assignment host binds no declaration at all: in those three the residual has nowhere to stand
function residualHostTakesStatement(leafPath) {
  const host = destructurePatternHostPath(leafPath);
  if (host?.node?.type !== 'VariableDeclarator') return false;
  const declaration = host.parentPath;
  const slot = declaration?.parentPath?.node;
  if (slot?.type === 'ForStatement' && slot.init === declaration.node) return false;
  return !(isForXStatement(slot) && slot.left === declaration.node);
}

// the POSITIONAL element route's decision, one answer for both emitters: which array slot of the
// leaf's pattern takes a minted name, which hop keys the dispatch reads off it, and how the levels
// beside the claim re-emit (`levels`), or - on an assignment host - the statement the pair lands
// after. taken where the pairing routes have nothing to pair - an init that is no array literal,
// or one a SPREAD shifts - and refused for every leaf the rename cannot carry: a defaulted one, a
// computed key beside siblings or one carrying an effect, an outer rest, a host without a
// declarator or statement slot. null = the leaf keeps whatever channel it came from. `adapter`
// folds a BOUND hop key on the way, as every other walk over the leaf's keys does
export function resolvePositionalElementSlot(leafPath, adapter = null) {
  // a DEFAULTED prop keeps an arm this route has no shape for: it binds the DISPATCH in place of the
  // slot, and the dispatch does not stand in for the default - a receiver carrying no such method
  // answers `undefined` where the source answers its own value. the guarded routes fold that arm
  // with a test ref; here the pattern stays native rather than binding the wrong one of the two
  if (leafPath?.node?.value?.type === 'AssignmentPattern') return null;
  const keys = [];
  const levels = [];
  let pattern = leafPath.parentPath;
  let fromNode = leafPath.node;
  while (pattern?.node?.type === 'ObjectPattern') {
    // every OTHER slot of this level rides a RESIDUAL rooted at the value that level reads: the
    // CLAIM's own level survives whole against the minted name, its slot spelled as a sentinel, so
    // a named sibling binds what it bound and a REST goes on gathering, excluding the claim's key
    // exactly as the source did. an OUTER level splits AT the hop instead - what it binds before
    // the hop is read before it, what it binds after is read after the inner level, which is the
    // order the source's own nesting spells
    const props = pattern.node.properties;
    const at = props.indexOf(fromNode);
    if (at === -1) return null;
    const isClaimLevel = pattern.node === leafPath.parentPath.node;
    // that residual costs the host a STATEMENT beside the declaration. two hosts have none - a loop
    // head binds declarators and a for-x LEFT binds per iteration - and neither has an assignment,
    // whose names are already bound: those keep the SOLE-slot rule and stay native. and only for a
    // plain KEY: a computed one is spelled by the claim's own channel (a polyfilled symbol, say),
    // and the residual would re-emit the key the source wrote instead
    if (props.length > 1 && (fromNode.computed || !residualHostTakesStatement(leafPath))) return null;
    // ... and a computed key carrying an EFFECT never rides this route, sole or not: the rename
    // drops the pattern that spells the key, and with it the effect the source runs (the memo
    // channel keeps that key in a sentinel residual beside the dispatch)
    if (isClaimLevel && fromNode.computed && computedKeyHasSideEffects(fromNode)) return null;
    // ... and a REST on an OUTER level keeps that level whole (nothing may split a gather), which
    // is the rest-host route's own shape one branch down - not this one's
    if (!isClaimLevel && props.some(isRestProperty)) return null;
    levels.unshift(isClaimLevel ? { claim: true } : { before: props.slice(0, at), after: props.slice(at + 1) });
    const owner = pattern.parentPath;
    const ownerType = owner?.node?.type;
    if (ownerType === 'ObjectProperty' || ownerType === 'Property') {
      const key = consumableHopSlotName(owner.node, adapter ? { scope: owner.scope ?? leafPath.scope, adapter, path: owner } : null);
      if (typeof key !== 'string') return null;
      // the HOST above may carry a REST, and then nothing prunes: rest gathers what the pattern did
      // not name, so this hop's key has to stay there keeping itself excluded - and a hop that
      // stays is a second reader of it. what CAN leave is the hop's VALUE, renamed to a binding the
      // dispatch reads, which is the array element's own answer one dialect over: the source's read
      // count is unchanged, the key stays where it was, and the claim binds off the name
      const host = owner.parentPath;
      if (host?.node?.type === 'ObjectPattern' && host.node.properties.some(isRestProperty)) {
        const carrier = restHostCarrier(host);
        if (!carrier) return null;
        // ... and only over a plain BOUND receiver: a proxy-global root is the anchored family's
        // shape and it answers a rest host its own way (the surface memo beside a sentinel), so a
        // pair minted here would be the only leg rewriting it
        const root = unwrapCollectingSePrefixes(carrier.value, []);
        if (root?.type !== 'Identifier' || POSSIBLE_GLOBAL_OBJECTS.has(root.name)) return null;
        return { slot: pattern, keys, levels, declarator: carrier.declarator, hopProp: owner };
      }
      keys.unshift(key);
      fromNode = owner.node;
      pattern = owner.parentPath;
      continue;
    }
    // the element itself: an `= default` between the slot and the array changes what the rename
    // would bind (the default fires on a missing element), so only a bare slot renames
    if (ownerType === 'ArrayPattern' && owner.node.elements.includes(pattern.node)) {
      // ... and the host is a DECLARATION reached through patterns alone: the minted name needs a
      // binding site, which only a declarator gives it. an assignment host has none - climbing past
      // it would hand the rename to whatever declaration encloses the statement
      let outer = owner;
      while (outer?.parentPath?.node?.type === 'ArrayPattern'
        || outer?.parentPath?.node?.type === 'ObjectPattern'
        || (outer?.parentPath?.node?.type === 'AssignmentPattern' && outer.parentPath.node.left === outer.node)) {
        outer = outer.parentPath;
      }
      const declarator = outer?.parentPath;
      // an ASSIGNMENT host binds no declaration, but a minted name needs only a BINDING SITE, and a
      // hoisted `var` is one both emitters already mint. the statement keeps its own iteration and
      // the claim's binding takes the dispatcher's answer right after it - the shape this host's
      // overwrite channel already spells for a claim whose receiver it CAN name
      if (declarator?.node?.type === 'AssignmentExpression' && declarator.node.left === outer.node
        && declarator.node.operator === '=' && !keys.length) {
        const statement = nestedAssignmentStatementOf(leafPath);
        const right = statement ? unwrapCollectingSePrefixes(declarator.node.right, []) : null;
        // an ArrayExpression right is the PAIRING routes' shape, exactly as an ArrayExpression init is
        return statement && right?.type !== 'ArrayExpression'
          ? { slot: pattern, keys, levels, assignment: declarator, statement } : null;
      }
      if (declarator?.node?.type !== 'VariableDeclarator' || declarator.node.id !== outer.node) return null;
      // ... and it travels with the answer here too, for the reason the chain walk carries it
      // ... and only where the array pulls from something the PAIRING routes cannot resolve: an
      // ArrayExpression init is their shape, and where they leave a claim native there they have
      // their own reason for it. asking THEM instead would work per case, but the two legs reach
      // that question through different flows, and a rename firing on one leg alone is a divergence
      // - the init is the one fact both read the same way. a SPREAD is the exception: it shifts
      // every position after it by an unknowable amount, so no pairing exists to own the slot
      const init = unwrapCollectingSePrefixes(declarator.node.init, []);
      if (init?.type === 'ArrayExpression'
        && init.elements.every(element => element?.type !== 'SpreadElement')) return null;
      return { slot: pattern, keys, levels, declarator };
    }
    return null;
  }
  return null;
}

// resolve the receiver node for a (possibly nested) destructure leaf: walk the pattern paths up from the
// leaf, collecting the nesting segments (object keys + array indices), then walk the host's RHS literal
// along them. e.g. `flat` of `{ y: { flat: m } } = { y: arr }` resolves to `arr`, and of `[{ y: { flat:
// m } }] = [{ y: arr }]` likewise (object-key `y` AND array-index `0`). returns ONLY a receiver that is
// safe to reference twice (see `isReReferenceableReceiver`); a member / call receiver, a computed or
// non-literal nesting key, a non-matching RHS hop (incl. a spread that shifts array indices), or a missing
// key / hole bails to null.
// `allowSeFreeSingleRead` opens the receiver to a side-effect-free MEMBER (`Array.prototype`),
// BRANCHING (`c ? [7] : []`, `a || b`), or member-nesting LITERAL (`[holder.p]`) node: reading any is
// pure to `mayHaveSideEffects`, but a getter would re-fire (and a branch re-select) on a SECOND read -
// so callers pass it ONLY when the receiver is read exactly ONCE (an `eliminateResidual` extraction or
// the memoized `_ref` channel), where it fires once like native. the double-read assignment-overwrite
// consumer keeps the default (all stay safe-bailed).
// AST-agnostic and path-API-agnostic: both babel and estree paths expose `.parentPath` / `.node`, the
// field names match, and the only divergent node type (object property: babel `ObjectProperty` / estree
// `Property`) is accepted both ways - so ONE implementation serves both emitters. `unwrapExpressionChain`
// peels transparent wrappers (parens / TS casts) off the RHS and each value, so a parenthesized object
// literal or value (`= ({ y: arr })` / `{ y: (arr) }`) resolves the same way - babel folds parens into
// node `extra`, estree keeps a `ParenthesizedExpression`, and without peeling the two would diverge
// `allowSePeeledFragment`: the unwraps below ELIDE sequence prefixes (`(se(), arr)` resolves to
// `arr`). that is sound only for a consumer whose receiver READ runs AFTER the residual evaluated
// the init in place (the assignment overwrite) - an extract-before-residual consumer would read
// the receiver ahead of the prefix effect, reordering it, so the default BAILS when an elided
// prefix carries a side effect (the top-level whole-init memo retry then captures order instead)
// eslint-disable-next-line max-statements -- the walk: one arm per slot shape and per caller promise
export function resolveNestedReceiverNode(leafPath,
  { allowSeFreeSingleRead = false, allowInitCarriedEffects = false,
    allowSePeeledFragment = false, allowNavSegments = false, adapter = null, slot = null } = {}) {
  const elidedPrefixes = [];
  const segs = [];
  let pattern = leafPath.parentPath;
  while (isDestructurePattern(pattern?.node)) {
    let owner = pattern.parentPath;
    // the SLOT the owner pairs is the pattern, or the transparent inner default around it
    // (`[{ at } = {}] = [g]`, `{ w: { at } = {} } = { w: g }`): the paired value is read first and
    // the default fires only where it is undefined, so the pair stays the receiver the leaf reads -
    // the step the array-wrap classification and the mirror host take over the same default
    let slotNode = pattern.node;
    if (owner?.node?.type === 'AssignmentPattern' && owner.node.left === slotNode && isInnerDestructureDefault(owner)) {
      slotNode = owner.node;
      owner = owner.parentPath;
    }
    const ownerType = owner?.node?.type;
    if (ownerType === 'ObjectProperty' || ownerType === 'Property') {
      // through the canonical resolver on BOTH sides of the later match: a raw `.value` compares the
      // number `0` against the string `'0'`, so a pattern and a literal that spell one slot differently
      // failed to pair and the polyfill was lost on a receiver that was fully known. an `adapter`
      // additionally folds a BOUND key here, which is the answer the second leg's climb already gives
      const segKey = consumableHopSlotName(owner.node,
        adapter ? { scope: owner.scope ?? leafPath.scope, adapter, path: owner } : null);
      if (segKey === null) return null;
      segs.unshift({ key: segKey });
      pattern = owner.parentPath;
      continue;
    }
    if (ownerType === 'ArrayPattern') {
      const index = owner.node.elements.indexOf(slotNode);
      if (index === -1) return null;
      segs.unshift({ index });
      pattern = owner;
      continue;
    }
    // the hosts whose value the pattern READS: a declarator, an assignment, a PARAMETER (its default,
    // or the IIFE argument the canon prefers); a RECEIVER-shaped inner default (`{ k: { at } = Array }`)
    // is the routes' own guarded fallback, not a receiver, and stays with them
    const paramOwner = (ownerType === 'AssignmentPattern' && owner.node.left === slotNode
      && FUNCTION_LIKE_NODE_TYPES.has(owner.parentPath?.node?.type))
      || (FUNCTION_LIKE_NODE_TYPES.has(ownerType) && owner.node.params?.includes(slotNode));
    const rhs = ownerType === 'VariableDeclarator' || ownerType === 'AssignmentExpression' || paramOwner
      ? destructureReceiverNode(owner, slotNode) : null;
    if (!rhs) return null;
    // a kept WRITE is a prefix like any other for a caller that keeps it: the residual still performs
    // it (the overwrite hosts) or the render lifts it (the extraction hosts), and the value it stores
    // is the receiver the claim reads. only that caller asks - the flag is its promise. the peel rides
    // EVERY descent step, not just the init: a wrapper slot may hold the write (`[(kw = globalThis)]`)
    // ... and a defensive realm DEFAULT reads as its left here exactly as it does under the walk canon
    // (`{ w: globalThis ?? {} }` names the realm): the discarding peel, since this answer REPLACES the
    // slot for every consumer that resolves through here
    function peelToValue(from) {
      let cur = unwrapCollectingSePrefixes(from, elidedPrefixes);
      if (allowSePeeledFragment) {
        while (cur?.type === 'AssignmentExpression' && cur.operator === '=') {
          elidedPrefixes.push(cur);
          cur = unwrapCollectingSePrefixes(cur.right, elidedPrefixes);
        }
      }
      return peelRealmLogicalDefault(cur, { discarding: true });
    }
    // the slot AS WRITTEN at the deepest step: the carried arm hands it over with its own prefix,
    // since a dispatch that performs the init's effects spells them where the source did
    let raw = rhs;
    let node = peelToValue(rhs);
    // the deepest literal slot the walk reads, for a caller that plans a MEMO of it (`slot`): the
    // value as written, the property holding it, and whether every property and element before it
    // is inert - the source evaluates those first, so a hoisted memo keeps their order only then
    if (slot) Object.assign(slot, { node: null, prop: null, precedersPure: true });
    for (const seg of segs) {
      // an OBJECT-pattern key can still name an array SLOT (`{ 0: { at } } = [[1, 2]]` reads property
      // '0' off the array, exactly as the language does), so ONE canonical index read serves both
      // segment kinds: an array pattern's positional segment and a key that spells that same index
      const element = arrayLiteralSlotValue(node, seg.index === undefined ? seg.key : seg.index);
      if (element) {
        if (slot) {
          const at = node.elements.indexOf(element);
          slot.precedersPure &&= node.elements.slice(0, at)
            .every(item => !item || (item.type !== 'SpreadElement' && !mayHaveSideEffects(item)));
          Object.assign(slot, { node: element, prop: null });
        }
        raw = element;
        node = peelToValue(element);
        continue;
      }
      // a positional segment carries no property name to look up instead; last match wins
      // (duplicate keys), only data properties whose key SPELLS a slot resolve, and a trailing
      // spread that could override the matched key bails (canonical helper)
      const match = seg.index === undefined && node?.type === 'ObjectExpression'
        ? findObjectKeyBeforeSpread(node.properties, p => spelledSlotName(p) === seg.key)
        : null;
      // ... and a key standing AFTER the match that nothing can name could BE this slot at runtime
      // (`{ w: globalThis, [k]: other }`) - the pairing's own rule, asked here too so no consumer
      // reads a value the level may not hold
      const keyCtx = adapter ? { scope: leafPath.scope, adapter, path: leafPath } : null;
      if (match && node.properties.slice(node.properties.indexOf(match) + 1)
        .some(p => consumableHopSlotName(p, keyCtx) === null)) return null;
      const matchRead = match ? objectPropertyReadValue(match) : null;
      if (matchRead) {
        if (slot) {
          slot.precedersPure &&= node.properties.slice(0, node.properties.indexOf(match))
            .every(item => (item.type === 'Property' || item.type === 'ObjectProperty')
              && !item.computed && objectPropertyReadValue(item) && !mayHaveSideEffects(item.value));
          Object.assign(slot, { node: matchRead, prop: match });
        }
        raw = matchRead;
        node = peelToValue(matchRead);
        continue;
      }
      // ... and where no LITERAL holds the slot, a receiver that is a nav is still readable, for a
      // caller that ASKS: an identifier or an SE-free member chain spells the remaining segments as
      // its own member reads, which is what the source itself does (`{ Array: { prototype: { flat } } }
      // = globalThis` reads `globalThis.Array.prototype`). the option is the caller's promise that
      // its render reads that nav ONCE - every other caller keeps the literal-only walk, where the
      // null is what tells it to take another channel
      if (allowNavSegments && (isReReferenceableReceiver(node) || isSeFreeMemberReceiver(node))) {
        if (!allowSePeeledFragment && elidedPrefixes.some(mayHaveSideEffects)) return null;
        let spelled = node;
        for (const rest of segs.slice(segs.indexOf(seg))) {
          spelled = memberFromKeyName(spelled, rest.index === undefined ? rest.key : String(rest.index));
        }
        return spelled;
      }
      return null;
    }
    // ... an effect the peel elided (`{ w: (mark(), arr) }`) rides the CARRIED candidate as the slot
    // was written - the caller's `receiverPerformsEveryInitEffect` decides whether that is every
    // effect the init has, and its dispatch then spells the prefix where the flat form spells it
    // (`_at((mark(), arr))`); every other caller keeps the null that sends it to another channel
    if (elidedPrefixes.some(mayHaveSideEffects)) {
      if (allowInitCarriedEffects) return raw;
      if (!allowSePeeledFragment) return null;
    }
    if (isReReferenceableReceiver(node)) return node;
    // a side-effect-free member (`Array.prototype`, `obj.props`), branching (`c ? [7] : []`, `a || b`),
    // or member-nesting literal (`[holder.p]`) receiver is sound for a single-read extraction: its
    // getter (if any) fires once and its branch selects once, matching native. computed-key / call
    // receivers carry effects and are rejected by `mayHaveSideEffects`
    if (allowSeFreeSingleRead
      && (isSeFreeMemberReceiver(node) || isSeFreeBranchingReceiver(node) || isSeFreeRereadLiteral(node))) return node;
    // ... and an effect-bearing node comes back as a CANDIDATE for a caller that will test it with
    // `receiverPerformsEveryInitEffect`: the effects only matter while a residual survives to
    // re-evaluate them, and that caller's whole question is whether it does
    if (allowInitCarriedEffects) return node;
    return null;
  }
  return null;
}

// does the host pattern bind something OUTSIDE the leaf's own hop chain - a sibling prop at any level
// above the leaf, which keeps the residual (and the init it evaluates) alive once the leaf leaves?
function hostKeepsSiblingBinding(leafPath) {
  const host = destructurePatternHostPath(leafPath);
  const hostPattern = host?.node?.id ?? host?.node?.left ?? null;
  if (!hostPattern) return false;
  let top = leafPath;
  while (top.parentPath && top.parentPath.node !== hostPattern) top = top.parentPath;
  if (!top.parentPath) return false;
  return patternBindingCount(hostPattern) > patternBindingCount(top.node?.value ?? top.node);
}

// what a nested INSTANCE claim dispatches on where no literal holds its slot: the nested walk spells
// the remaining hops as member reads, and what that nav LANDS on picks the channel - a built-in
// SURFACE dispatches as itself, and a nav ending on a polyfillable STATIC of the constructor its
// object names dispatches on that static's ponyfill. asking is the caller's promise that its render
// reads the nav ONCE; the trailing-static arm carries a promise of its own (`allowTrailingStatic`) -
// a leaf sibling keeps a residual that would re-read the static raw. the nav itself comes back
// whatever the verdict: a caller that finds no dispatch here still asks what it navigated
export function resolveNestedNavDispatch(leafPath, { adapter, resolvePure, allowTrailingStatic = false }) {
  // the dispatch READS the nav instead of the host's own init, so what that init spells stops being
  // read at all. an ARRAY wrapper survives that: its own machinery lifts the elements the pattern
  // does not bind. an OBJECT literal has no such channel here, so a property VALUE carrying an
  // effect keeps the claim where the source wrote it (`{ z: (hit(), 1), w: globalThis }`)
  // ... unless a SIBLING binding keeps the residual: the literal still evaluates there, every effect it
  // holds runs where the source ran it, and the extraction ahead reads a pure surface - the shape the
  // shallow twin prints (`{ w: { at: m }, z } = { w: Array.prototype, z: (hit(), 1) }`)
  const hostInit = destructureHostInitNode(leafPath);
  const keepsSibling = hostKeepsSiblingBinding(leafPath);
  if (hostInit?.type === 'ObjectExpression' && objectLiteralHoldsObservable(hostInit) && !keepsSibling) {
    return { nav: null, dispatch: null };
  }
  // ... and with that residual alive, a prefix a LITERAL's slot wears (`w: (hit(), globalThis)`) runs
  // where the source wrote it - the residual evaluates the literal - so the nav peels past it. a
  // prefixed bare init (`(effect(), globalThis)`) keeps its own channel: the lift, then the surface memo
  const literalSlotPrefix = keepsSibling && hostInit?.type === 'ObjectExpression';
  const nav = resolveNestedReceiverNode(leafPath, { allowNavSegments: true, allowSePeeledFragment: literalSlotPrefix, adapter });
  // the surface answer travels as its ROOT and keys as well: a caller that renders through
  // `resolveNestedReceiverBase` needs them to fold the realm root onto its ponyfill, and spelling
  // the nav node verbatim would print the raw name the source wrote
  // a `?.` that cannot short-circuit is dead text on the surface nav (`globalThis?.globalThis.Array
  // .prototype`): the same value canon the pairing asked, so the dispatch reads through those hops
  const allowOptionalHops = receiverCarriesLiveOptional(nav) && !navValueCanShortCircuit(
    nav, ({ name }) => resolveBuiltIn({ kind: 'global', name }), { scope: leafPath.scope, adapter, path: leafPath });
  if (isInstanceSurfaceNav(nav, { allowOptionalHops })) {
    const navKeys = [];
    let cur = nav;
    function hopIsPlain(hop) {
      return hop?.type === 'MemberExpression' && !hop.computed && (allowOptionalHops || !hop.optional)
        && hop.property?.type === 'Identifier';
    }
    while (hopIsPlain(cur)) {
      navKeys.unshift(cur.property.name);
      cur = cur.object;
    }
    const root = cur?.type === 'Identifier' ? cur : null;
    return { nav, dispatch: { kind: 'surface', node: nav, root, keys: navKeys } };
  }
  if (!allowTrailingStatic || nav?.type !== 'MemberExpression' || nav.computed
    || nav.property?.type !== 'Identifier') return { nav, dispatch: null };
  const ctorName = resolveObjectName({ objectNode: nav.object, scope: leafPath.scope, adapter, path: leafPath });
  const pure = ctorName && isStaticPlacement(ctorName) && !POSSIBLE_GLOBAL_OBJECTS.has(ctorName)
    && !adapter.isMutatedStatic?.(ctorName, nav.property.name)
    ? staticHopPure({ ctorName, key: nav.property.name, resolvePure }) : null;
  return { nav, dispatch: pure ? { kind: 'static', entry: pure.entry, hintName: pure.hintName } : null };
}

// unified receiver-resolution DECISION for a destructure leaf - the single place that picks which
// node an extraction dispatches on and through which CHANNEL; emitters only render. previously this
// decision lived twice (babel: inline pre-memo in its emitter; unplugin: resolver + whole-init
// retry), and the two procedures drifted. channels:
//   - 'resolved':        nested / param / no-init host - `resolveNestedReceiverNode` outcome
//                        (node null = bail), including its single-read and SE-peel gates
//   - 'raw':             top-level init that peels (SE-free) to an Identifier, or a sole-prop
//                        pattern - the slot is reused / inlined verbatim
//   - 'raw-ctor':        SE-free whole-chain pure-ctor init (`globalThis.Promise`) - left in
//                        place; the natural visitor substitutes the pure import, which resolves
//                        sibling reads on its own (a memo or hop-collapse would be superfluous)
//   - 'whole-init-memo': any other non-Identifier multi-prop init - memoize the WHOLE init once
//                        at its source slot, so every buried effect and getter runs exactly once
//                        in source order, whatever the expression shape
// AST/path-agnostic (`.node` / `.parentPath` / `.scope` on both emitters); `resolvePureGlobal` is
// the emitter's pure-entry probe (name -> truthy) so the ctor shortcut resolves through the
// caller's own channel. `proxyCtor` rides along for the memo's global-alias registration
// `patternSize` - the pattern's ORIGINAL property count. an emitter that MUTATES the pattern as its
// props emit asks this after the shrink, and a group that started with several props would then be
// read as a sole-prop one: the init inlines into the surviving prop, so an extraction already
// planted ahead of it runs BEFORE the init's own effects, which native runs first. an
// emitter whose walk sees the unshrunk pattern passes nothing
// the element an ARRAY-WRAPPED pattern is paired with, and how its receiver may be spelled:
// `raw` when the element can be read as it stands (a sole-prop pattern reads it once), the
// element-memo channel when several reads need one identity and the hoist keeps source order.
// null when the shape is not a single-element pairing off a literal array
function arrayWrapperElementPlan(patternPath) {
  const wrapper = patternPath?.parentPath;
  if (wrapper?.node?.type !== 'ArrayPattern') return null;
  const declarator = wrapper.parentPath;
  if (declarator?.node?.type !== 'VariableDeclarator' || declarator.node.id !== wrapper.node) return null;
  const init = unwrapExpressionChain(declarator.node.init);
  if (init?.type !== 'ArrayExpression') return null;
  const index = wrapper.node.elements.indexOf(patternPath.node);
  // the positional read: a spread of a binding before the slot makes every later position runtime-
  // determined, so the pattern no longer pairs with a literal element - the pairing is unprovable
  if (index === -1 || !resolveCallArgumentCoords(init.elements, index)) return null;
  // the element may wear wrappers the source spelled (parens the estree parser keeps, TS casts,
  // a SEQUENCE prefix): the peeled view is what CLASSIFIES the receiver, but every emitted node
  // is the element AS WRITTEN - peeling it into the output would drop a sequence prefix's effect
  const rawElement = resolveCallArgument(init.elements, index);
  const element = rawElement && unwrapExpressionChain(rawElement);
  if (!element) return null;
  // a RE-REFERENCEABLE element (a bare binding, a constant literal) needs no memo whatever the
  // reader count - each read spells it, exactly like the flat route's raw receiver; a SOLE prop
  // reads once and takes it raw too
  if (isReReferenceableReceiver(element)) return { channel: 'raw', node: rawElement };
  // several readers of a value that cannot be spelled twice: the memo is the only sound shape,
  // and it may hoist only past pure elements. behind an EFFECTFUL predecessor the memo takes the
  // slot itself instead - a write the literal performs exactly where native evaluates the element
  // (`[n, _ref = X]`), every reader following the declaration
  // ... a predecessor the pattern DISCARDS pins nothing: the lift takes its effect out ahead of the memo
  const lifted = new Set(leadingDiscardedEffectSlots(init, wrapper.node));
  const inSlot = init.elements.slice(0, index).some((item, at) => mayHaveSideEffects(item) && !lifted.has(at));
  // a SOLE prop reads once and takes the element raw - unless the level SURVIVES it (a sibling
  // element, a rest) behind that effectful predecessor: the residual is a second reader there, and
  // nothing may hoist over the predecessor, so the slot itself memoizes for both
  const levelSurvives = wrapper.node.elements.some((item, at) => at !== index && item);
  if (patternPath.node.properties.length <= 1 && !(inSlot && levelSurvives)) {
    return { channel: 'raw', node: rawElement };
  }
  return { channel: 'array-element-memo', node: rawElement, elementIndex: index, inSlot };
}

// the memo an object-hop SLOT takes where its value cannot be spelled twice yet the level stays
// whole (a sibling or a rest keeps the residual): the value moves to a `_ref` the extraction and the
// residual both read. HOISTED ahead of the declaration where every property and element before the
// slot is inert - the source evaluates them first, and nothing they do is observable - and written
// IN the slot (`w: _ref = eff()`) where one of them acts: the array element memo's own two shapes,
// one level of keys down. null off a declaration host, where the residual dies (the carried route
// spells the value in the dispatch), where the plain read already answers, or under an ARRAY slot
// (the wrapper family's), or where no statement slot holds the hoisted memo and the extraction that
// reads it - beside a SIBLING declarator, or in a FOR-INIT header
export function nestedSlotMemoPlan(leafPath, { adapter = null } = {}) {
  const host = destructurePatternHostPath(leafPath);
  if (host?.node?.type !== 'VariableDeclarator' || !host.node.init) return null;
  const declaration = host.parentPath;
  const forHead = declaration?.parentPath?.node;
  // a loop HEADER keeps its declarator native on both legs, the flat twin's own shape there
  if (!declaration?.node?.declarations
    || (forHead?.type === 'ForStatement' && forHead.init === declaration.node)) return null;
  if (patternBindingCount(host.node.id) <= patternBindingCount(leafPath.node.value)) return null;
  if (resolveNestedReceiverNode(leafPath, { adapter })) return null;
  const slot = {};
  // the leaf may NAVIGATE on from the slot (`{ w: { Array: { prototype: { at } } } } = { w: (hit(),
  // globalThis) }`): the walk spells those segments off the slot's value, and the memo carries them as
  // `navKeys` - the dispatch reads `_ref.Array.prototype`, never the slot itself. the sink fills as
  // the walk descends, so a walk that DIED below the slot leaves one that is not the receiver
  const carried = resolveNestedReceiverNode(leafPath,
    { adapter, allowInitCarriedEffects: true, allowNavSegments: true, allowSePeeledFragment: true, slot });
  if (!carried || !slot.node || !slot.prop) return null;
  // ... a slot an earlier leaf's memo already WROTE (`w: _ref = (hit(), globalThis)`) names its value
  // through that write: the walk peels the assignment, and the same write serves this leaf too
  const slotTail = unwrapRuntimeExpr(slot.node);
  const writtenTail = slotTail?.type === 'AssignmentExpression' ? unwrapRuntimeExpr(slotTail.right) : null;
  const slotValues = new Set([slot.node, slotTail, peelNestedSequenceExpressions(slotTail).tail,
    ...writtenTail ? [writtenTail, peelNestedSequenceExpressions(writtenTail).tail] : []]);
  const navKeys = [];
  let cur = carried;
  while (!slotValues.has(cur) && cur?.type === 'MemberExpression' && !cur.computed && cur.property?.type === 'Identifier') {
    navKeys.unshift(cur.property.name);
    cur = cur.object;
  }
  if (!slotValues.has(cur)) return null;
  // ... only a nav INTO a built-in surface: a user object's hop (`{ w: { y: { at } } } = { w: box }`)
  // would be read by the residual a second time, and both legs keep that claim native
  if (navKeys.length && !isInstanceSurfaceNav(carried)) return null;
  // a slot the level CAN spell twice needs no memo, whatever the leaf navigates from it (`{ w:
  // globalThis }` under `{ w: { Array: { prototype: { map } } } }` reads the surface off the slot);
  // a re-readable built-in surface (`Array.prototype`) spells twice for free, and a literal that
  // BEARS a class keeps its evaluation where the source wrote it - both legs leave those as they are
  if (isReReferenceableReceiver(slot.node) || isBuiltInSurfaceNav(unwrapRuntimeExpr(slot.node))
    || literalHoldsClass(slot.node)) return null;
  return { node: slot.node, prop: slot.prop, hoist: slot.precedersPure, navKeys };
}

function literalHoldsClass(node) {
  let found = false;
  walkAstNodes({ root: node, visit: item => {
    if (item.type === 'ClassExpression') found = true;
    return !found;
  } });
  return found;
}

export function resolveDestructureReceiverPlan(leafPath, {
  allowSeFreeSingleRead = false, allowInitCarriedEffects = false,
  adapter = null, resolvePureGlobal = null, patternSize = null,
} = {}) {
  const patternPath = leafPath.parentPath;
  const host = patternPath?.parentPath;
  const hostType = host?.node?.type;
  const initKey = hostType === 'VariableDeclarator' ? 'init'
    : hostType === 'AssignmentExpression' ? 'right' : null;
  if (!initKey) {
    // an ARRAY-WRAPPED pattern pairs with an ELEMENT of a literal array. the element is the
    // receiver, and it memoizes like a whole init would - sound exactly where hoisting the memo
    // keeps source order, i.e. every element BEFORE this slot is pure (native evaluates them
    // left to right, then reads). without this the wrapped form has no memo channel at all and
    // an OBSERVABLE element stays native, losing its polyfill where the flat twin keeps it
    const wrapped = arrayWrapperElementPlan(patternPath);
    if (wrapped) return wrapped;
    // with the adapter: it is what folds a BOUND hop key (`{ [k]: { at } }` with `const k = 'w'`) to
    // the slot it names - without it the walk stops at the computed key and the claim ships native
    const node = resolveNestedReceiverNode(leafPath, { allowSeFreeSingleRead, allowInitCarriedEffects, adapter });
    if (node && isReReferenceableReceiver(node)) return { channel: 'resolved', node };
    // ... and an object slot the plain walk cannot spell twice - an effectful value, or a RELAXED
    // single read (a member, a selection) beside a residual that would read it a second time -
    // takes the slot memo where its level stays whole: the array element memo's twin
    const slotMemo = nestedSlotMemoPlan(leafPath, { adapter });
    return slotMemo ? { channel: 'object-slot-memo', ...slotMemo } : { channel: 'resolved', node };
  }
  const objectNode = host.node[initKey];
  if (!objectNode) return { channel: 'resolved', node: null };
  // a sole-prop pattern reads the receiver once - the extraction inlines the WHOLE init verbatim
  // (SE prefix included), so no memo is ever needed there
  if ((patternSize ?? patternPath.node.properties.length) <= 1) return { channel: 'raw', node: objectNode };
  // an init that peels (parens / TS wrappers, both AST flavors) to a bare Identifier with no
  // SE-bearing prefix elided on the way is freely re-referenceable - reuse the identifier.
  // an SE-crossed peel falls through: only the whole-init memo preserves the prefix's order
  const elided = [];
  const peeled = unwrapCollectingSePrefixes(objectNode, elided);
  if (peeled?.type === 'Identifier' && !elided.some(mayHaveSideEffects)) {
    return { channel: 'raw', node: peeled };
  }
  const proxyCtor = globalProxyMemberName({
    node: peelProxyGlobalObject(objectNode), scope: leafPath.scope, adapter, path: leafPath,
  });
  // a SLOT-mutated ctor member (`globalThis.Map = Shim`) keeps the RAW member as the synth
  // receiver: `globalProxyMemberName` already returns null for a mutated leaf or hop, so a
  // non-null `proxyCtor` is always a clean name - the gate lives in that one walk
  if (proxyCtor
    && peelNestedSequenceExpressions(objectNode).prefix.length === 0 && resolvePureGlobal?.(proxyCtor)) {
    return { channel: 'raw-ctor', node: objectNode, proxyCtor };
  }
  return { channel: 'whole-init-memo', node: objectNode, proxyCtor };
}

// the ExpressionStatement path that hosts a nested destructuring-ASSIGNMENT leaf (`({ y: { m } } = R);`),
// or null when the leaf is NOT in a statement-context assignment - a declaration, a param, or an
// expression-context assignment (`x = ({...} = R)` / a concise arrow body) whose value would need
// preserving. walks the leaf's own pattern chain to the AssignmentExpression, then peels transparent
// parens to the statement: `({...} = R)` at statement start always needs parens, which estree keeps as a
// `ParenthesizedExpression` while babel folds them into node `extra` - peeling unifies the two. callers
// emit the polyfill overwrite (`m = _m(recv)`) after this statement. AST/path-agnostic - serves both emitters
export function nestedAssignmentStatementOf(leafPath) {
  const path = destructurePatternHostPath(leafPath);
  if (path?.node?.type !== 'AssignmentExpression') return null;
  // the CANON peel, not a Paren-only loop: `(({ from } = Array) as any);` wears a TS wrapper
  // between the assignment and its statement, and a peel that stops at parens reads it as a
  // captured value. the same walk `assignmentInStatementPosition` asks, kept as the PATH
  const host = peelParenAndTSParentPath(path);
  return host?.node?.type === 'ExpressionStatement' ? host : null;
}

// the node a pattern leaf's own chain climbs out into - the declarator, assignment, parameter or
// catch clause the destructure belongs to. one climb, several questions asked of its result. NOT a
// `findParent`, which crosses function and assignment boundaries and latches onto an OUTER host
// (`const r = (() => { ({ m } = x) })()` would answer the declarator)
const PATTERN_CHAIN_TYPES = new Set([
  'ArrayPattern',
  'AssignmentPattern',
  'ObjectPattern',
  'ObjectProperty',
  'Property',
  'RestElement',
  // rest's OTHER spelling (`isRestProperty` canon): a sibling-produced babel tree may spell
  // a pattern rest as SpreadElement, and the climb must not latch an inner host there
  'SpreadElement',
]);

export function destructurePatternHostPath(leafPath) {
  let path = leafPath.parentPath;
  while (path && PATTERN_CHAIN_TYPES.has(path.node?.type)) path = path.parentPath;
  return path ?? null;
}

// the VALUE the destructure around this leaf reads: a declarator's init, an assignment's right side,
// peeled to the expression the runtime evaluates. null wherever the host carries no value of its own
// (a parameter, a catch clause, a for-x head)
export function destructureHostInitNode(leafPath) {
  const host = destructurePatternHostPath(leafPath);
  return unwrapExpressionChain(host?.node?.type === 'VariableDeclarator' ? host.node.init
    : host?.node?.type === 'AssignmentExpression' ? host.node.right : null);
}

// does the destructure ASSIGNMENT around this leaf have its value consumed (`host = ({ k } = R)`,
// a `return`, a call argument)? an assignment yields its RHS, so a receiver replaced by a synth
// mirror literal becomes the value the consumer captures - `host === Object` turns false. a
// declarator, parameter or catch host answers false: there is no assignment value to capture
export function destructureAssignmentValueIsCaptured(leafPath) {
  return destructurePatternHostPath(leafPath)?.node?.type === 'AssignmentExpression'
    && !nestedAssignmentStatementOf(leafPath);
}

// the pattern a guarded SPLIT consumed, turned into the residual its REST still needs: every key a
// read took is renamed to a sentinel the caller mints, so the rest goes on gathering exactly what
// the source left it, and the rest element itself is untouched. the pattern node is the SOURCE's
// own - what it keeps is what the source wrote - and each leg wraps the result in its own
// declarator, reading the same receiver the reads read
export function renameSplitPropsToSentinels(patternNode, mintSentinel) {
  for (const propNode of patternNode.properties) {
    if (propNode.type === 'RestElement') continue;
    propNode.value = identifier(mintSentinel());
    propNode.shorthand = false;
  }
  return patternNode;
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

// plugin-rewritten hop substitutions, shared by both spellings the injector mints:
// - a proxy-global alias (`_globalThis`): substitute to the SOURCE proxy-global name so the
//   post-loop mid-chain lift can match - the import binding's init isn't an ObjectExpression
//   and would otherwise bail at the walk's bindingType check
// - a CONSTRUCTOR stub (`_Promise` after an earlier in-place literal rewrite for a SIBLING prop
//   of the shared static-object wrapper): recover the SOURCE constructor name from the injector
//   hint so this prop's statics still resolve - without recovery the dereference bails and the
//   binding silently extracts off the polyfill stub (unbound at runtime where native requires
//   the constructor receiver). the hint's span gate ran against the HOST use; this hop READS at
//   its `readNode` - an assignment-form source written after that capture must not stub-narrow it
function pluginRewrittenHopName(binding, hop) {
  const { node: current, readNode } = hop;
  const { scope, adapter, path = null } = hop.ctx;
  const proxyName = proxyGlobalRootName({ node: current, binding, adapter, scope, path, usageNode: readNode });
  if (proxyName && proxyName !== current.name) return proxyName;
  const ctorHint = bindingPolyfillHint({ binding, scope, name: current.name, adapter });
  if (ctorHint && ctorHint !== current.name
    && assignmentAliasHintSoundAtRead({ binding, adapter, readNode })) return ctorHint;
  // a PRE-EXISTING pure default import on a pass over an emitter's own output: the census
  // prepasses run before any injector registry exists, so the hint derives from the import
  // source itself (`_Iterator` bound by '.../actual/iterator/constructor' names Iterator)
  if (binding?.importKind !== 'type' && (binding?.kind === 'module'
    // ... or the require-style pure binding: THIS binding's own declarator holds the
    // require call (a shadowed local of the same name has a different node and stays out)
    || (binding?.node?.type === 'VariableDeclarator' && requireCallSource(binding.node.init) !== null))) {
    const entry = pureImportEntryOf(path, current.name);
    const hinted = entry ? entryToGlobalHint(entry) : null;
    if (hinted && hinted !== current.name) return hinted;
  }
  return null;
}

const CLEAR_HOP = Symbol('clear-hop');
// the class-hop disposition said "the cursors moved, keep walking" - distinct from a `null` answer,
// which is the walk's own verdict
const CONTINUE_HOP = Symbol('continue-hop');
// combines the dominance gate with the reaching continuation for a variable hop of the walk.
// reassignment is read off `constantViolations`, not `binding.constant`: the latter is adapter-
// dependent (babel computes it lazily, estree-toolkit does not expose it) while both adapters
// surface the violation list, where empty / missing means the shape holds at the use site.
// CLEAR_HOP when no dominating reassignment blocks the flat resolve (the bare binding-alias canon
// on a reassigned CONTAINER binding - a dominating reassignment kills the declared init, but the
// value that reaches the read still walks the remaining path as the primary: the enumerable one
// for usage-global, the single observable one for usage-pure), else the reaching node or null
// (dead end)
// every per-hop disposition below takes `{ hop, binding, name, walk }`: the hop the walk stands on
// (its `node` is the identifier `name` names, bound to `binding`) and the walk's options
function blockedContainerHop({ hop, binding, name, walk }) {
  const { adapter, path } = hop.ctx;
  if (!reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode: hop.readNode })) return CLEAR_HOP;
  return blockedHopContinuation({ hop, binding, name, walk });
}

// the blocked-hop continuation: the SINGLE reaching value keeps the walk alive; otherwise (an
// ambiguous write - a pattern default, a spread-shifted slot, a branching RHS) the enumerable
// written values still union beside the dead primary, mirroring the bare canon's
// reachable-union (over-inject-safe; pure never passes a sink), and the hop dead-ends
function blockedHopContinuation({ hop, binding, name, walk }) {
  const reaching = reachingContainerValueNode(binding, hop);
  if (reaching) return reaching;
  collectReassignedHopUnion({ hop, binding, name, walk });
  return null;
}

// ClassDeclaration hop of the receiver walk: a reassigned class binding follows the reaching
// continuation exactly like a variable hop (the enumerable replacement keeps the global walk
// alive); a clean one returns its own name at the leaf, or descends its STATIC fields - the
// class declaration is where those fields captured their values, so it becomes the read site
// for the descent's reassignment checks (a field-value write after the class definition can't
// change the captured static). null = dead end
function classBindingHop({ hop, binding, name, walk }) {
  if (!binding) return null;
  const { adapter, path } = hop.ctx;
  if (reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode: hop.readNode })) {
    const reaching = blockedHopContinuation({ hop, binding, name, walk });
    return reaching ? { follow: reaching } : null;
  }
  if (walk.walkPath.length === 0) return { leaf: name };
  return { descend: binding.path?.node ?? binding.node };
}

// destructure-leaf binding of the receiver walk: `{Math} = globalThis` binds `Math` to
// `globalThis.Math`, not to `globalThis` - the binding-name maps to a key inside the
// ObjectPattern id, which prepends to walkPath so subsequent dereferences hit `source[key]`
// (shorthand and renamed both). an array-destructure leaf is positional within an array
// literal source - rare for static-method aliasing, so the safe miss beats a false-positive
// constructor. a plain Identifier id keeps walkPath as-is; null = dead end
function destructureLeafWalkPath({ binding, name, scope, adapter, walkPath }) {
  const idNode = binding.path?.node?.id ?? binding.node?.id;
  if (idNode?.type === 'ArrayPattern') return null;
  if (idNode?.type !== 'ObjectPattern') return walkPath;
  const destructureKeys = findShorthandKey(idNode, name, scope, adapter);
  return destructureKeys ? [...destructureKeys, ...walkPath] : null;
}

// the union half of the reassigned-hop continuation: a NON-dominating reassignment leaves the
// init live (the primary keeps walking it), but the read may see any enumerable written value
// too - each walks the SAME remaining path into the union sink (usage-global over-inject; the
// sink is never passed by pure callers)
function collectReassignedHopUnion({ hop, binding, name, walk }) {
  const { adapter, path } = hop.ctx;
  const { unionSink } = walk;
  if (!unionSink || !binding || adapter.method !== 'usage-global' || !isReassignedBeyondDeclarator(binding)) return;
  for (const valueNode of reassignmentValueEnumeration({
    binding, usagePath: path, name, ctx: { ...hop.ctx, resolveKey: sharedResolveKey }, usageNode: hop.readNode,
  }).nodes ?? []) {
    const resolved = walkStaticReceiverStep({ ...hop, node: valueNode, seen: new Set(hop.seen) }, { ...walk, depth: walk.depth + 1 });
    if (resolved && !unionSink.includes(resolved)) unionSink.push(resolved);
  }
}

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
export function walkStaticReceiverChain({
  receiverNode, walkPath, scope, adapter, path = null, usageNode = null, ignoreWrittenSlots = false, unionSink = null,
}) {
  // `usageNode` overrides the walk's initial read site (a wrapper's capture point); the step
  // otherwise anchors at the host `path` node
  return walkStaticReceiverStep(
    { node: receiverNode, readNode: usageNode, ctx: { scope, adapter, path } }, { walkPath, ignoreWrittenSlots, unionSink },
  );
}

// a receiver hidden inside a const-bound static CONTAINER (`const w = { k: Array }; w.k.from(...)`,
// `const box = [Array]; box[0].of(...)`, `const { from } = w.k`) names the constructor the nested
// destructure side already resolves through this very walk - `resolveObjectName` only follows
// PROXY-GLOBAL chains, so member and flat-destructure reads pair with this as their container
// fallback. the container binding has to REACH the use: a hoisted `var` alias declared on a path
// the read escapes is not the value read here, so it goes through the SAME dominance gate the
// key-alias fold applies rather than around it. `unionSink` collects the container-slot union
// (written values, repositioned elements) beside the primary answer
export function staticContainerReceiverName({ node, scope, adapter, path, unionSink = null }) {
  const keys = [];
  let root = node;
  while (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') {
    const key = staticMemberKeyName(root);
    if (key === null) return null;
    keys.unshift(key);
    root = unwrapRuntimeExpr(root.object);
  }
  // a zero-arg call FORWARDING a container (`const plain = () => ({ window: { Array } });
  // plain()?.window?.Array.of(13)`): the callee's single return expression IS the container -
  // descend it like a const-bound literal. a shorthand `Array` there is the real global (an
  // unbound leaf name), while a user literal (`{ of: fn }`) still resolves to nothing. the
  // proof is the strict one - a conditionally-assigned forwarder proves no value
  if (isCallShape(root) && keys.length) {
    const returned = inlineCallReturnExpression(
      { node: root, seen: new Set(), ctx: { scope, adapter, path } }, { rejectConditional: true },
    );
    return returned
      ? walkStaticReceiverStep({ node: returned.node, readNode: root, ctx: returned.ctx }, { walkPath: keys, unionSink }) : null;
  }
  if (root?.type !== 'Identifier' || !keys.length) return null;
  const binding = adapter.getBinding(scope, root.name, path);
  const declaratorNode = binding?.path?.node ?? binding?.node;
  if (!declaratorNode) return null;
  if (!varInitDominatesUsage({ declaratorNode, usagePath: path, usageNode: node, kind: binding.kind })) return null;
  return walkStaticReceiverChain({ receiverNode: root, walkPath: keys, scope, adapter, path, unionSink });
}

// the walk takes the hop standing on the receiver and the walk's OPTIONS beside it: `walkPath`
// (the keys left to descend), `depth`, `ignoreWrittenSlots`, `unionSink` (see `walkStaticReceiverChain`),
// plus where the walk stands relative to the CONTAINER it last dereferenced - the binding's name
// and the keys consumed under it. those two ride the options rather than the step, or the
// recursion into a nested literal would forget which container it is inside and the written-slot
// consult could only ever fire on the first hop
function walkStaticReceiverStep(hop, {
  walkPath, depth = 0, ignoreWrittenSlots = false, unionSink = null, containerName: enteredName = null, containerPath = [],
}) {
  if (depth > STATIC_WALK_DEPTH) return null;
  const { adapter, path = null } = hop.ctx;
  let current = unwrapTransparentSeq(hop.node);
  let currentScope = hop.ctx.scope;
  // where the CURRENT hop is read: the host use for the first alias, then each prior hop's declarator
  // (`const a = b` reads `b` there). the reassignment-dominance check must use this read site - a write
  // to an intermediate hop AFTER its read can't change the captured value (`const a = b; b = 0; { from }
  // = a` keeps Array). the adapter surfaces the declarator at `binding.node` (no path), so thread the
  // NODE; `path` (binding lookup / terminal / scope owner) stays the host so only the textual position moves.
  // a recursive container descent (object-literal value / class static field) hands the CONTAINER's
  // capture site in as the hop's `readNode` - the value was captured when the container literal / class
  // was evaluated, so a write AFTER that (but before the final host read) can't change it either; without
  // this the recursion reset the read site to the host and over-bailed a reassign-after-capture value
  let readNode = hop.readNode ?? path?.node ?? null;
  let hops = 0;
  // per-walk cycle guard: `const a = b; const b = a` (mutually-aliased identifiers) would
  // bounce between names until STATIC_WALK_DEPTH burns out. Set short-circuits at the
  // second visit with O(1) check, complementing the depth cap as a defensive lower bound
  const visited = hop.seen ?? new Set();
  let containerName = enteredName;
  // dereferencing a bound name puts the walk INSIDE that container: the keys consumed above
  // belonged to whatever the name aliased, so the slot path restarts here
  function enterContainer(name) {
    containerName = name;
    containerPath = [];
  }
  // the hop the walk stands on right now, and the walk's options as they stand - for the per-hop
  // dispositions and the terminal
  function standing() {
    return {
      hop: { node: current, readNode, seen: visited, ctx: { scope: currentScope, adapter, path, resolveKey: sharedResolveKey } },
      walk: { walkPath, depth, ignoreWrittenSlots, unionSink, containerName, containerPath },
    };
  }
  // the class-binding disposition, moved out whole: it advances the same three cursors the
  // container arm does, and returns the walk's own answer when the class arm ends it
  let classHopEnded = false;
  function takeClassBindingHop(binding) {
    const step = classBindingHop({ ...standing(), binding, name: current.name });
    if (!step) return null;
    if (step.leaf) return step.leaf;
    if (step.follow) {
      current = unwrapTransparentSeq(step.follow);
      currentScope = aliasDeclScope(binding, currentScope);
      readNode = step.follow;
      return CONTINUE_HOP;
    }
    current = step.descend;
    readNode = current;
    classHopEnded = true;
    return CONTINUE_HOP;
  }
  // dereference const-bound Identifier through its VariableDeclarator initializer,
  // chasing re-aliases (`const Foo = Array; const wrapper = { a: Foo }`) until we
  // either land on an unbound Identifier (the global - leaf name we return) or an
  // ObjectExpression (intermediate hop for further key descent). `path` threads through
  // to `adapter.hasBinding` so unplugin's estree-toolkit scope tracker reaches the
  // TS-runtime fallback (`declare const X` / namespace-body bindings)
  while (current?.type === 'Identifier' && adapter.hasBinding(currentScope, current.name, path)) {
    if (++hops > STATIC_WALK_DEPTH || visited.has(current.name)) return null;
    visited.add(current.name);
    const binding = adapter.getBinding(currentScope, current.name, path);
    const rewritten = pluginRewrittenHopName(binding, standing().hop);
    if (rewritten) {
      current = { type: 'Identifier', name: rewritten };
      break;
    }
    const bindingType = adapter.getBindingNodeType(currentScope, current.name, path);
    // a class binding is REASSIGNABLE (`class Foo {}` then `Foo = X` is legal, unlike const), so a
    // reassignment that dominates the read makes the declared name unreliable - gate the class arms
    // exactly like the VariableDeclarator arm below. absent a dominating reassignment the identifier
    // name reliably identifies the declaration: a class-bound leaf at empty walkPath returns its name
    // (matching the empty-walkPath / unbound-Identifier path below for the canonical-name return
    // contract), and a non-empty walkPath descends the class's STATIC fields. enables `class Foo {};
    // const NS = {Foo}; walkStaticReceiverChain(NS, ['Foo'])` to return 'Foo' (otherwise would bail
    // here since ClassDeclaration isn't VariableDeclarator)
    if (bindingType === 'ClassDeclaration') {
      const step = takeClassBindingHop(binding);
      if (step !== CONTINUE_HOP) return step;
      if (classHopEnded) break;
      continue;
    }
    if (bindingType !== 'VariableDeclarator') return null;
    if (!binding) return null;
    const blocked = blockedContainerHop({ ...standing(), binding, name: current.name });
    if (blocked !== CLEAR_HOP) {
      if (!blocked) return null;
      enterContainer(current.name);
      current = unwrapTransparentSeq(blocked);
      currentScope = aliasDeclScope(binding, currentScope);
      // the reaching value was READ at its write site - the next hop's dominance proofs anchor
      // there (`a = b; b = x; a.k` captured b BEFORE `b = x`, which therefore does not block)
      readNode = blocked;
      continue;
    }
    collectReassignedHopUnion({ ...standing(), binding, name: current.name });
    // adapter divergence: babel exposes the VariableDeclarator at `binding.path.node`,
    // estree-toolkit at `binding.node` directly. fall through both shapes. chain-assignment
    // in init (`const wrapper = (x = {a: Array})`) evaluates to its right operand at runtime -
    // the shared peel alternates paren/chain to fixpoint so nested `(y = (x = Src))` reaches too
    const initNode = peelChainAssignmentDeep(binding.path?.node?.init ?? binding.node?.init);
    if (!initNode) return null;
    walkPath = destructureLeafWalkPath({ binding, name: current.name, scope: currentScope, adapter, walkPath });
    if (!walkPath) return null;
    // the name this container is BOUND to: a write to one of its slots replaces what the literal
    // spells, and the descent has to consult that before trusting the initial member
    enterContainer(current.name);
    current = unwrapTransparentSeq(initNode);
    currentScope = aliasDeclScope(binding, currentScope);
    readNode = (binding.path?.node ?? binding.node) ?? readNode;
  }
  return walkStaticReceiverTerminal(standing());
}

// post-dereference terminal: leaf extraction, proxy mid-chain lift, intermediate member
// resolution, and the static-container descents (object literal / class statics). the container
// the hop stands in rides `walk` - its bound NAME (null off a literal) and the keys consumed
// under it, which together spell the slot this step is about to read
function walkStaticReceiverTerminal({ hop, walk }) {
  const { node: current, readNode, seen: visited } = hop;
  const { scope: currentScope, adapter, path } = hop.ctx;
  const { walkPath, depth, ignoreWrittenSlots, unionSink, containerName, containerPath } = walk;
  // leaf return: walkPath consumed - extract the leaf global name.
  // bare Identifier returns its name directly; proxy-global member access
  // (`globalThis.Array` / `_globalThis.Array` after polyfill-injected rewrite) routes
  // through `resolveObjectName` which handles both raw proxy globals and plugin-injected
  // `_globalThis` bindings via `polyfillHint`. covers
  // `const Array = globalThis.Array; const wrapper = { Array }; ...`
  if (walkPath.length === 0) {
    // a bare global name answers itself; a minted hop never reaches this terminal - the
    // hop recognizer (`pluginRewrittenHopName`) resolves it earlier in the walk
    if (current?.type === 'Identifier') return current.name;
    if (current?.type === 'MemberExpression' || current?.type === 'OptionalMemberExpression') {
      return resolveObjectName({ objectNode: current, scope: currentScope, adapter, path, usageNode: readNode });
    }
    return null;
  }
  // proxy-global mid-chain lift: current is a recognised proxy-global identifier (bare source
  // name or plugin-rewritten alias). for babel the rewritten alias has no scope binding, so
  // the dereference loop above never ran and the alias reaches here verbatim - adapter+scope
  // let the shared root recogniser recover its source name (no binding to read the hint off of).
  // mirror `resolveNestedDestructureReceiver`'s short-circuit: the REMAINING hops must all be
  // proxy-globals with a recognised static-placement leaf (a CONSTRUCTOR key: `const ns =
  // {root: globalThis}; const {root: {self: {Array: A}}} = ns`). without this, such chains bail
  // at the rewritten alias and the constructor polyfill is missed silently. deeper static-METHOD
  // shapes (`{root: {Array: {from}}}`) fail the all-proxy-hops condition here by design - they
  // resolve through the nested-proxy flatten, not this lift
  // a mutated slot anywhere on the lift (a hop or the ctor leaf) holds the user's replacement,
  // so the chain no longer names the pristine built-in
  if (proxyGlobalRootName({ node: current, adapter, scope: currentScope, path, usageNode: readNode })
      && walkPath.slice(0, -1).every(k => isPristineProxyGlobal(adapter, k))
      && isStaticPlacement(walkPath.at(-1))
      && !isMutatedGlobalSlot(adapter, walkPath.at(-1))) {
    return walkPath.at(-1);
  }
  // intermediate MemberExpression value (`wrapper = {a: globalThis.Array}` walking key `a`
  // lands on `globalThis.Array`). resolve the chain to its constructor name and return it
  // as the receiver - caller pairs it with the remaining destructured key for polyfill
  // lookup. only single-hop remaining walkPath is mappable (multi-hop would need
  // descend-through-resolved-constructor which has no AST anchor here)
  if ((current?.type === 'MemberExpression' || current?.type === 'OptionalMemberExpression')
      && walkPath.length === 1) {
    const named = resolveObjectName({ objectNode: current, scope: currentScope, adapter, path, usageNode: readNode });
    // ... and where that chain names the REALM itself, the remaining key is a constructor ON it, not
    // a static OF it: the same lift the bare-name arm above takes, for the nav spelling of the same
    // receiver (`{ w: { Array: { from } } } = { w: globalThis.globalThis }`). without it the leaf
    // answered the realm, no module matched, and only the leg that re-visits its own collapse claimed
    if (named && POSSIBLE_GLOBAL_OBJECTS.has(named) && isStaticPlacement(walkPath[0])
      && !isMutatedGlobalSlot(adapter, walkPath[0])) return walkPath[0];
    return named;
  }
  // class STATIC fields and object-literal properties are both name-indexable static containers;
  // the canonical resolver descends the matching member's value with LAST-wins semantics and bails
  // on an ambiguous computed key / a method-or-accessor winner / a spread that could override
  // an ARRAY literal is the INDEX-indexable member of that same family: a canonical index names one
  // of its slots exactly as a key names an object property. only a slot that can REACH a built-in is
  // the static channel's though - a slot holding data is an instance receiver, and claiming it here
  // would block the receiver channel that resolves it. same predicate the write side counts a
  // container by, so the two sides agree; a dead end still returns null and yields the leaf back
  // a slot REPLACED after the literal (`const w = { k: Object }; w.k = Map`) no longer holds what the
  // literal spells, so descending it resolves a DIFFERENT constructor's static - a wrong value, not a
  // missed one. the class arm already bails on a static block for exactly this reason.
  // method-aware like the binding reassignment canon: pure bails (a write ANYWHERE in the file may
  // reach the read - the record carries no positions, so reach is not disprovable), while global
  // bails only on PROVEN dominance, which the record cannot establish - so it keeps resolving and
  // over-injects the literal's candidate, the safe direction there
  // the MUTATION resolver walks these chains to REGISTER a patch - bailing it on the very record
  // its own writes feed would lose the patch (`const m = NS.M; m.groupBy = shim` must still route
  // reads through the injected constructor), so it opts out of the slot consult
  if (!ignoreWrittenSlots && containerName && adapter.method === 'usage-pure'
    && adapter.isWrittenContainerSlot?.(containerName, [...containerPath, walkPath[0]])) return null;
  // usage-global union of the slot's OTHER reaching values, collected beside the primary descent:
  // the values recorded as written to this slot (including unknown-slot writes, which may land
  // anywhere), and - once an in-place mutator repositioned the container - every literal element
  // (repositioning permutes values across slots, never invents new ones). each alternative walks
  // the REMAINING path exactly like the primary value, so deeper hops and nested containers
  // resolve through the same machinery and feed the same sink. over-inject-safe: the sink only
  // adds side-effect imports, and pure callers never pass one
  if (unionSink && containerName && adapter.method === 'usage-global') {
    const slotPath = [...containerPath, walkPath[0]];
    const alternatives = [...adapter.writtenContainerSlotValues?.(containerName, slotPath) ?? []];
    if (current?.type === 'ArrayExpression' && adapter.isWrittenContainerSlot?.(containerName, [...containerPath, '*'])) {
      for (const element of current.elements) if (canHoldBuiltIn(element)) alternatives.push(element);
    }
    for (const alternative of alternatives) {
      const resolved = walkStaticReceiverStep({ ...hop, node: alternative, seen: new Set(visited) }, {
        ...walk, walkPath: walkPath.slice(1), depth: depth + 1, containerPath: slotPath,
      });
      if (resolved && !unionSink.includes(resolved)) unionSink.push(resolved);
    }
  }
  const arraySlot = arrayLiteralSlotValue(current, walkPath[0]);
  const value = current?.type === 'ClassDeclaration' || current?.type === 'ClassExpression'
    || current?.type === 'ObjectExpression'
    ? findNamespaceMemberValue(current, walkPath[0], currentScope, adapter, sharedResolveKey,
      // method-aware like the written-slot consult above: what a trailing spread could redefine is
      // one more candidate usage-global injects FOR, and over-injection is the safe side there,
      // while pure rewrites the read and needs the literal to be the authority
      { spreadVetoes: adapter.method !== 'usage-global' })
    : (canHoldBuiltIn(arraySlot) ? arraySlot : null);
  // a slot holding an UNDEFINABLE probe nav (`{ a: globalThis.window?.Array }`) hands on a value
  // that is absent exactly off-env: the read a pure claim would erase throws there, so the walk
  // names no defined constructor - the source stays native. method-aware like the written-slot
  // consult above: global keeps resolving and over-injects, the safe direction there
  // ... a bare proxy-global NAME (or an alias to one) is the realm spelling that collapses, exactly
  // as the flat destructure of `window` reads it - only a nav, or an alias holding one, is a probe
  const slotValue = unwrapTransparentSeq(value);
  if (value && adapter.method === 'usage-pure'
    && !(slotValue?.type === 'Identifier' && proxyGlobalRootName({ node: slotValue, ...hop.ctx }))
    && proxyReceiverValueCanBeUndefined(slotValue, ({ name }) => resolveBuiltIn({ kind: 'global', name }), hop.ctx)) return null;
  // a slot the source wrote as a SEQUENCE names its TAIL: the comma run in front is an effect the
  // LITERAL owes (the pairing walk keeps that literal alive for it), and the value this walk is
  // asked about is what the read yields (`{ w: (g(), globalThis) }` names the realm)
  // ... and a defensive realm DEFAULT names its left the same way: a guaranteed realm name is an
  // object, so the right side is dead text (`{ w: globalThis ?? {} }` names the realm too)
  return value ? walkStaticReceiverStep({ ...hop, node: peelRealmLogicalDefault(value) }, {
    ...walk, walkPath: walkPath.slice(1), depth: depth + 1, containerPath: [...containerPath, walkPath[0]],
  }) : null;
}

// find the source-key PATH in an ObjectPattern that produces the binding named `bindingName`.
// shorthand `{Math}` -> ['Math'] (key === value name). renamed `{Math: M}` -> ['Math'] for
// bindingName='M'. nested `{ns: {Math: M}}` -> ['ns', 'Math'] - the binding lives below the
// surface, so the caller descends the source object through every key on the path.
// AssignmentPattern default (`{Math: M = ...}`) peels through .left. computed-key patterns
// resolve via `sharedResolveKey`'s static-binding inspection. returns null when the binding
// isn't reachable or any key on the path is unresolvable
function findShorthandKey(objectPattern, bindingName, scope, adapter) {
  return objectPatternLiteralKeyPath(objectPattern, bindingName, {
    resolveKey: sharedResolveKey, scope, adapter,
  });
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
// peel transparent destructure wrappers. the two transparent shapes - single-element ArrayPattern
// and an inner AssignmentPattern default - each get their own arm above, so nothing else is
// crossable and the tail is a plain break. tracks `arrayDepth` so multi-level ArrayPattern wrappers
// (`[[{a}]] = [[receiver]]`) can step through nested ArrayExpression init
// element-by-element. each ArrayPattern wrapper has exactly one inner element
// (otherwise destructuring would re-bind to a different slot per pattern position),
// so a depth counter is sufficient - no per-level index needed
function peelDestructureWrappers(pattern, throughReceiverBearingDefaults = false) {
  let prev = pattern.node;
  let parent = pattern.parentPath;
  // element index at each ArrayPattern wrapper (outermost-first via unshift) so the init
  // descent picks the matching slot. multi-element ArrayPatterns are see-through HERE (this is
  // read-only receiver resolution, not the flatten emit that must preserve sibling bindings),
  // so `[{Array:{from}}, other] = [globalThis, ...]` resolves `from` to globalThis.Array.from
  const indices = [];
  for (;;) {
    if (!parent) break;
    if (parent.node.type === 'ArrayPattern') {
      const idx = parent.node.elements.indexOf(prev);
      if (idx === -1) break;
      indices.unshift(idx);
    } else if (parent.node.type === 'AssignmentPattern' && parent.node.left === prev) {
      // an INNER default (`[{x} = {}] = [R]`, `{a: {x} = {}} = R`) is transparent - the real
      // receiver lives further up the pattern chain. a parameter default
      // (`function f({ Array: { from } } = globalThis)`) is itself the HOST: nothing above
      // carries a receiver, its right side IS one - stop here so `destructureReceiverSlot`
      // picks the 'right' slot (peeling through it landed on the param slot and dropped
      // the usage-global injection)
      if (!isInnerDestructureDefault(parent)
        && !(throughReceiverBearingDefaults && isNestedDestructureDefault(parent))) break;
    } else break;
    prev = parent.node;
    parent = parent.parentPath;
  }
  return { parent, indices };
}

// an AssignmentPattern wrapping a destructure target is a TRANSPARENT inner default when nested in
// another pattern AND its right side is an empty fallback (`{x} = {}`, `[{x}={}] = R`) - the real
// receiver lives further up. but a receiver-bearing right (`[{x} = Array]`, `{a: {x} = globalThis.X}`,
// `[{x} = (Array)]`, `[{x} = Array || Set]`) makes THIS the value-bearing host, even nested: nothing
// else supplies `x`'s receiver when the outer slot is undefined. a param/declarator default
// (`function f({x} = R)`, grandparent is a function/declarator, not a pattern) is likewise the host.
// shared so the wrapper-peel and the host walk treat inner defaults identically
function isInnerDestructureDefault(assignmentPatternPath) {
  return isNestedDestructureDefault(assignmentPatternPath) && !destructureRightIsReceiver(assignmentPatternPath.node.right);
}

// a default nested inside another pattern (vs a param / declarator default, whose grandparent is a
// function or declarator): the shape gate shared by the transparent-default peel and its
// receiver-bearing resume - the resume peels PAST nested defaults only, a host default still stops
function isNestedDestructureDefault(assignmentPatternPath) {
  const grandType = assignmentPatternPath?.parentPath?.node?.type;
  return grandType === 'ArrayPattern' || grandType === 'Property' || grandType === 'ObjectProperty';
}

// ascend a nested destructure leaf to its OUTERMOST object-pattern + the value-bearing host, peeling
// object-property nesting, ArrayPattern wrappers (collecting array indices outermost-first so an init
// descent picks the matching slot) AND transparent inner defaults. returns { pattern, indices, host }
// or null. one source for the SE-key gate's receiver check and the mirror's array-wrapper descent
// `hops` is every level the leaf pattern sits under, receiver-to-leaf: an array wrapper's `index`,
// an object hop's `key` (a key nothing spells - computed - ends the record, `hops` is then null and
// only `indices` answers), each with the `pattern` standing under it; `indices` keeps the array
// levels alone for the wrapper-only readers
function destructureHostThroughWrappers(leafPattern, adapter = null) {
  let cursor = leafPattern;
  let objectPattern = leafPattern;
  const indices = [];
  let hops = [];
  for (let guard = 0; guard < STATIC_WALK_DEPTH && cursor; guard++) {
    const owner = cursor.parentPath;
    const ownerType = owner?.node?.type;
    if (ownerType === 'Property' || ownerType === 'ObjectProperty') {
      // a bound computed key folds through the consuming canon where an adapter is at hand
      const key = consumableHopSlotName(owner.node, adapter ? { scope: owner.scope ?? leafPattern.scope, adapter, path: owner } : null);
      if (typeof key === 'string') hops?.unshift({ key, pattern: cursor.node });
      else hops = null;
      cursor = owner.parentPath;
      objectPattern = cursor;
      continue;
    }
    if (ownerType === 'ArrayPattern') {
      const idx = owner.node.elements.indexOf(cursor.node);
      if (idx === -1) return null;
      indices.unshift(idx);
      // the element's own pattern - past the transparent inner default the walk stepped through
      hops?.unshift({ index: idx, pattern: patternSlotTarget(cursor.node) });
      cursor = owner;
      continue;
    }
    // a transparent inner default is see-through; a param/declarator default stops here as the host
    if (ownerType === 'AssignmentPattern' && owner.node.left === cursor.node && isInnerDestructureDefault(owner)) {
      cursor = owner;
      continue;
    }
    break;
  }
  return { pattern: objectPattern?.node, indices, hops, host: cursor?.parentPath };
}

// the value an OUTER destructure reads from, for the SE-key gate's "diverging conditional?" check.
// `const [{ Array: { [se]: f } }] = [c ? globalThis : u]` resolves to the TERNARY, not the `[...]`
// wrapper - so the gate sees the divergence that the bare `declarator.init` (an ArrayExpression) misses
export function outerDestructureReceiver(leafPattern, scope = null, adapter = null) {
  const walked = destructureHostThroughWrappers(leafPattern);
  if (!walked) return null;
  const { indices, host } = walked;
  const receiverNode = destructureReceiverNode(host);
  if (!receiverNode) return null;
  const descended = indices.length
    ? descendArrayWrapperInit({ node: receiverNode, ctx: { scope, adapter, path: host, resolveKey: sharedResolveKey } }, indices)?.node
    : receiverNode;
  return descended ? unwrapExpressionChain(peelNestedSequenceExpressions(descended).tail) : null;
}

// shared DECISION for array-wrapped residual-static extraction (`[, { Array: { from } }] = [0, R]`): both
// emitters re-implemented this guard sequence then rendered per-substrate. single-sourced so they can't drift -
// a conditional/logical array element cedes to the receiver-aware mirror, else a static binds unconditionally.
// returns `{ localId, declaration, isExport, declarationKind }` or null; caller injects + renders off `declaration`
export function planArrayWrappedStaticExtract({ propNode, parentPath, scope, adapter, kind }) {
  if (kind === 'instance') return null;
  const localId = propBindingIdentifier(propNode.value);
  if (!localId) return null;
  const recv = outerDestructureReceiver(parentPath, scope, adapter);
  if (recv?.type === 'ConditionalExpression' || recv?.type === 'LogicalExpression') return null;
  // a SOLE wrapper beside an effect-bearing neighbour is not this route's: the flatten plan drops
  // the wrapper and lifts the neighbour, or keeps a sentinel residual where a spread iterates
  const host = findArrayWrappedDestructureHost(parentPath);
  if (!host?.needsResidualExtraction) return null;
  const declaration = host.declarator.parentPath;
  if (declaration?.node?.type !== 'VariableDeclaration') return null;
  const isExport = declaration.parentPath?.node?.type === 'ExportNamedDeclaration';
  return { localId, declaration, isExport, declarationKind: declaration.node.kind };
}

// descend ArrayExpression layers following `indices` (outermost-first) to mirror the
// ArrayPattern wrapper stack on the destructure side - the inner pattern need not sit at
// index 0 of each wrapper (`const [, { from }] = [Set, Array]`). bail (return null) if any
// level isn't an ArrayExpression, the target slot is a hole, or a spread at or before the
// target index shifts runtime positions - any of these means the runtime structure won't
// unwrap to the assumed slot and static resolution would lie.
// takes the hop standing on the host's init and returns the hop standing on the paired slot, or
// null. with a `ctx.scope` and `ctx.adapter`, dereferences const-bound Identifier wrappers via
// `followConstIdentifierInit` so `const wrapper = [Array]; [v] = wrapper` reaches Array: the
// followed scope re-anchors the next level's dereference and the leaf resolution, and the
// returned `readNode` is the innermost followed declarator - the value captured there is what
// the leaf reads, so its reassignment check anchors at that capture, not the destructure host.
// `unionSink` (usage-global) collects the OTHER values a reassigned wrapper alias can hold: each
// written value walks the remaining wrapper levels as a container path (the levels are its slot
// keys), through the same union the container walk unions with - a closure or conditional write
// to the wrapper is still a value the destructure may read
function descendArrayWrapperInit(hop, indices, { maybe = false, unionSink = null } = {}) {
  const { adapter } = hop.ctx;
  let { scope } = hop.ctx;
  let { node: receiverNode, readNode = null } = hop;
  for (const [level, index] of indices.entries()) {
    let cur = unwrapExpressionChain(receiverNode);
    if (scope && adapter) {
      // a deeper level reads its element INSIDE the value the level above captured, so its
      // dereference anchors at that capture (the followed declarator), not at the destructure host:
      // a write to the inner alias between the capture and the host cannot change what was captured
      // (anchored at the host it read as dominating, and the leaf classified as the written value)
      const followed = followConstIdentifierInit({ ...hop, node: cur, readNode, ctx: { ...hop.ctx, scope } }, {
        maybe,
        onReassignedHop: unionSink ? (binding, name, hopAt) => collectReassignedHopUnion({
          hop: hopAt, binding, name, walk: { walkPath: indices.slice(level), depth: 0, unionSink },
        }) : null,
      });
      cur = followed.node;
      scope = followed.ctx.scope;
      ({ readNode } = followed);
    }
    if (cur?.type !== 'ArrayExpression') return null;
    receiverNode = pairedArrayWrapInitElement(cur.elements, index);
    // `maybe` (inject-if-might classification only): a spread-shifted slot has no SOUND pair, but
    // when exactly ONE static candidate can land in it, that candidate is the slot's only
    // enumerable value and the walk may continue through it - a wrong guess over-injects, which
    // is the safe direction. several distinct candidates stay ambiguous and bail as before
    if (!receiverNode && maybe) {
      const candidates = arrayWrapSlotValueCandidates(cur.elements, index);
      receiverNode = candidates.length === 1 ? candidates[0] : null;
    }
    if (!receiverNode) return null;
  }
  return { ...hop, node: receiverNode, readNode, ctx: { ...hop.ctx, scope } };
}

// a RECEIVER-SHAPED inner default in an array wrapper (`[{ from } = Array] = [undefined]`): peeling
// stops at the default because it IS a host, so the outer walk yields no array index. its right is the
// receiver ONLY when the paired array slot is statically `undefined` (then the default provably fires);
// a defined / dynamic / unresolvable slot keeps the native element receiver. resume the wrapper walk
// from the inner default itself to reach the host slot and verify it
function resolveArrayInnerDefaultReceiver(innerDefaultHost, adapter) {
  if (innerDefaultHost?.node?.type !== 'AssignmentPattern') return null;
  const { parent: host, indices } = peelDestructureWrappers(innerDefaultHost);
  if (indices.length === 0) return null;
  const receiverNode = destructureReceiverNode(host);
  if (!receiverNode) return null;
  const slotNode = descendArrayWrapperInit(
    { node: receiverNode, ctx: { scope: host.scope, adapter, path: host, resolveKey: sharedResolveKey } }, indices,
  )?.node;
  if (!isUndefinedNode(slotNode)) return null;
  const resolved = resolveObjectName({
    objectNode: unwrapExpressionChain(innerDefaultHost.node.right), scope: host.scope, adapter, path: host,
  });
  return resolved && isStaticPlacement(resolved) ? resolved : null;
}

// the inline-array spreads in a pattern host's literal levels, flattened for the rewrite: every
// array level a pattern pairs with - the wrapper itself (`[...[Array]]`), one under an object hop
// (`{ y: [...[arr]] }`), a nested wrapper - is spliced before any route edits a level by slot. the
// rewriting flavor's own step (the classification pairs by position without touching the tree),
// once per host from whichever leaf is handled first, and only along the host's own literals: an
// alias keeps the literal where it is declared. a level whose bound slot pairs with a hole stays as
// written, on both legs, and so does every level of a file the routes then claim nothing in
// (`restoreUnclaimedFlattens`)
const flattenedHosts = new WeakSet();
const flattenRecords = new WeakMap();
export function flattenArrayWrapperInits(leafPath) {
  let root = leafPath;
  for (let up = root.parentPath; up?.node; up = root.parentPath) {
    const { type } = up.node;
    if (type === 'ObjectPattern' || type === 'ArrayPattern' || type === 'RestElement'
      || ((type === 'Property' || type === 'ObjectProperty') && up.parentPath?.node?.type === 'ObjectPattern')
      || (type === 'AssignmentPattern' && up.node.left === root.node && isInnerDestructureDefault(up))) root = up;
    else break;
  }
  const host = root.parentPath;
  if (!isDestructurePattern(root.node) || !host?.node || flattenedHosts.has(host.node)) return;
  flattenedHosts.add(host.node);
  let program = host;
  while (program.parentPath?.node) program = program.parentPath;
  if (!flattenRecords.has(program.node)) flattenRecords.set(program.node, []);
  flattenPatternLevels(root.node, destructureReceiverNode(host, root.node), flattenRecords.get(program.node), host.node);
}

// the splices a file's routes then left unclaimed, undone: a file that injects nothing prints as
// written on the leg that reprints its tree, exactly as the leg that hands the source back
export function restoreUnclaimedFlattens(programNode) {
  for (const { host, elements, original } of flattenRecords.get(programNode) ?? []) {
    elements.splice(0, elements.length, ...original);
    // a later pass over the same tree flattens the host again
    flattenedHosts.delete(host);
  }
  flattenRecords.delete(programNode);
}

// one paired level down: an array level splices its inline spreads, then each bound slot descends
// into its element; an object level descends by key into the property it pairs with
function flattenPatternLevels(pattern, init, records, host) {
  const literal = unwrapRuntimeExpr(init);
  if (pattern?.type === 'ArrayPattern' && literal?.type === 'ArrayExpression') {
    const slots = pattern.elements.flatMap((element, index) => element && element.type !== 'RestElement' ? [index] : []);
    if (slots.some(index => !resolveCallArgument(literal.elements, index))) return;
    const original = [...literal.elements];
    flattenInlineArraySpreads(literal.elements);
    if (original.some((element, index) => element !== literal.elements[index])) {
      records.push({ host, elements: literal.elements, original });
    }
    for (const index of slots) flattenPatternLevels(patternSlotTarget(pattern.elements[index]), literal.elements[index], records, host);
  } else if (pattern?.type === 'ObjectPattern' && literal?.type === 'ObjectExpression') {
    for (const prop of pattern.properties) {
      if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
      const key = spelledSlotName(prop);
      const paired = key === null ? null : objectLevelPairedProperty(literal, key);
      if (paired) flattenPatternLevels(patternSlotTarget(prop.value), paired.read, records, host);
    }
  }
}

// resolve receiver for ArrayPattern-rooted nested destructure: `const [...{from}] = wrapper`
// or chained `[[{from}]] = wrapper`. walks up ArrayPattern wrappers from the inner ObjectPattern
// counting depth; descends the host's init slot through Identifier aliases and ArrayExpression
// layers. returns the leaf constructor name when it's a recognised static placement
function resolveArrayWrapperedDestructureReceiver(innerObjectPattern, adapter, unionSink = null) {
  // peel ArrayPattern wrappers (and transparent inner-default AssignmentPattern / single-element
  // wrappers) up to the host, collecting each wrapper's element index outermost-first so the init
  // descent picks the matching slot, not a blind `[0]` - `const [, { from }] = [Set, Array]`
  const peeled = peelDestructureWrappers(innerObjectPattern);
  // peeling stopped at a receiver-shaped inner default rather than walking through a transparent
  // one. its right is the receiver iff the paired slot IS `undefined` (the slot check); in the
  // COMPLEMENTARY cell the paired slot resolves to a known global - always defined, so the default
  // is provably dead - and the resumed peel (past nested receiver-bearing defaults) resolves the
  // PAIR as the receiver, converging with the flatten plan's own defined-pair extraction
  if (peeled.indices.length === 0) {
    return resolveArrayInnerDefaultReceiver(peeled.parent, adapter)
      ?? arrayWrapReceiverFromHost(peelDestructureWrappers(innerObjectPattern, true), adapter, unionSink);
  }
  return arrayWrapReceiverFromHost(peeled, adapter, unionSink);
}

// the descent + leaf-resolution tail shared by the transparent peel and the dead-default resume
function arrayWrapReceiverFromHost({ parent: host, indices }, adapter, unionSink = null) {
  if (indices.length === 0) return null;
  // IDENTIFICATION uses the broad host predicate: an assignment-destructure in for-init / call-arg
  // / arrow-body position and a parameter DEFAULT (AssignmentPattern) all carry a real receiver
  // that usage-global must inject for. the pure flatten re-checks its own narrow host shape at
  // emit - identification gated on the EMIT predicate dropped the import
  const slotNode = destructureReceiverNode(host);
  if (!slotNode) return null;
  // classification feeds usage-global injection AND the pure flatten extraction: only the former
  // may lean on a spread-shifted MAYBE pair (pure substituting a value the runtime may not hold
  // is the unsafe direction), so the maybe walk is flavor-gated
  const descended = descendArrayWrapperInit(
    { node: slotNode, ctx: { scope: host.scope, adapter, path: host, resolveKey: sharedResolveKey } }, indices,
    { maybe: adapter?.method === 'usage-global', unionSink },
  );
  if (!descended) return null;
  // ... through a defensive realm DEFAULT too: a guaranteed realm name is an object, so the right
  // side is dead text and the element names that realm (`[globalThis ?? {}]`), the same reading the
  // flat spelling of the receiver takes
  const leaf = peelRealmLogicalDefault(unwrapExpressionChain(descended.node));
  // any leaf that resolves to a static-placement constructor, through ONE branch: a bare global
  // (`[Array]`), a const-alias (`const A = Array; [A]`), a proxy-global member (`[globalThis.Array]`,
  // same as the non-wrappered `const { from } = globalThis.Array` path), or a babel in-place-
  // substituted polyfill alias (`[_Promise]` - the standalone Identifier visitor rewrote the wrapper
  // init before the destructure prop visited). `resolveObjectName` canonicalizes ALL of these via
  // `resolveBindingToGlobal` (binding-init walk + `polyfillHint` recovery, and it bails a reassigned
  // alias). a raw-name-only Identifier check dropped the const-alias (usage-global both plugins +
  // babel usage-pure; unplugin usage-pure rescued it -> divergence)
  if (isReceiverShapedNode(leaf) || leaf?.type === 'AssignmentExpression' || isCallShape(leaf)) {
    // NO SE policy here - this is mode-free CLASSIFICATION. usage-global keeps the body untouched
    // and must inject for an SE-bearing leaf too; the usage-pure flatten harvests the observable
    // discard (assignment / SE-bearing chain-root call) via `flattenDiscardRescue` and re-emits it
    // ahead of the extraction. an AssignmentExpression leaf (`[a = Array]`) classifies through
    // `resolveObjectName`'s own chain-assignment peel and is rescued WHOLE at emit - bailing it
    // instead would silently lose the polyfill
    const resolved = resolveObjectName({
      objectNode: leaf, scope: descended.ctx.scope, adapter, path: host, usageNode: descended.readNode ?? host.node,
    });
    return resolved && isStaticPlacement(resolved) ? resolved : null;
  }
  return null;
}

// nested / array-wrapped parameter-default SYNTH PLAN: mirror the WHOLE pattern tree into a
// literal that replaces the parameter DEFAULT, so it fires strictly when no argument is passed
// and every caller-supplied object destructures natively. the semantics live here ONCE - the
// emitters render the returned tree.
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
// host node -> the plan verdict, INCLUDING the un-mirrorable outcomes: `buildMirrorTargets` has
// already run `collectValueLeaves` plus a `mirrorPattern` per reachable value leaf (one resolver
// lookup per pattern key) by the time it declines, and every sibling prop of the same pattern asks
// the same question - memoizing only the success made a mixed pattern pay that walk per prop.
// re-asking a DECLINE is real (the emitter prunes consumed props between dispatches), and both
// decline verdicts point the bail-safe way - `null` keeps the sound inline default, `{ bail }`
// leaves the read native - so a verdict that went stale can only under-rewrite, never over-rewrite
const nestedParamSynthPlan = new WeakMap();

// may the host walk stop at `cur`'s direct parent (a param default / declarator / cascade)? always when
// `cur` is ABOVE the trigger leaf's own pattern; at the leaf pattern itself ONLY when it is MIXED (a
// nested value the mirror owns) - so a flat ctor sibling stranded native by the deferral gate is mirrored,
// while a pure-flat pattern keeps its own body-extract / synth-swap fallback (mirror does not fire there)
function selfHostAllowed(cur, leafPatternPath) {
  // ... except on a for-x HEAD, which has no such fallback: both of those need a statement slot, and
  // a head is the one host with none. the relocation that mints one stands down where the mirror can
  // answer (the shared plan decides), so declining here would leave the claim native. the head may
  // sit behind ARRAY wrappers (`for (const [{ from }] of [[Array]])`) - they pair a slot, they do not
  // host anything, so the walk through them ends at the same slot-less declarator
  let head = cur.parentPath;
  while (head?.node?.type === 'ArrayPattern') head = head.parentPath;
  if (head?.node?.type === 'VariableDeclarator' && !head.node.init) return true;
  return cur !== leafPatternPath
    || (cur.node?.type === 'ObjectPattern' && objectPatternHasNestedValue(cur.node));
}

// the one property-level question the mirror asks: can it spell this key statically, exactly once,
// and as a bare identifier? a REST element and any non-Property shape have no key at all; a computed
// key resolves to its VALUE (`const k = 'from'` / `(eff(), 'from')` -> 'from') and the synth literal
// carries that resolved STATIC name, which the pattern's own computed key then reads - the effect
// stays in the UNTOUCHED LHS and runs exactly once, so a side-effecting key is accepted while a
// runtime-unresolvable one is not. a non-identifier key (`'with-dash'`) would make babel throw and
// unplugin emit non-reparsing text, and a key folded from the REAL Symbol has no static string slot
// the literal could carry
export function mirrorAcceptedKey({ prop, scope, adapter, path, seenKeys }) {
  if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return null;
  const key = prop.computed
    ? sharedResolveKey({ node: prop.key, computed: true, scope, adapter, bailOnSideEffectKey: false, keepsKeyNode: true })
    : prop.key?.name ?? prop.key?.value;
  if (typeof key !== 'string' || seenKeys.has(key)) return null;
  if (!isValidIdentifierName(key)) return null;
  if (prop.computed && symbolSourcedFoldedKey({ key, keyNode: prop.key, scope, adapter, path })) return null;
  return key;
}

// the receiver each source hands the mirror: the wrapper descent to the element it pairs with, the
// refusal to leave the host's own span, and the effect-prefix peel. one answer per source, and a
// source that fails any of the three declines the whole plan
// ... through OBJECT hops as well: a literal container in the slot (`= { w: globalThis }`, `of [{ w:
// globalThis }]`) pairs the hop key with its slot value, and that value is what the mirror replaces
// - the container stays as the source wrote it, and the pattern mirrored is the one standing UNDER
// the last key the descent consumed (`patternNode`; null where no key was). the pairing is the
// resolver's own: the slot before any spread, and no key after it that could BE this one at runtime
function mirrorReceiverNodes({ receiverSources, originNode, hops, host, adapter }) {
  const receiverNodes = [];
  let patternNode = null;
  let patternDepth = null;
  function descend(source) {
    let node = source;
    let run = [];
    let depth = 0;
    let pattern = null;
    function flushIndices() {
      if (!run.length) return true;
      node = descendArrayWrapperInit(
        { node, ctx: { scope: host.scope, adapter, path: host, resolveKey: sharedResolveKey } }, run,
      )?.node ?? null;
      run = [];
      return node !== null;
    }
    for (const hop of hops) {
      if (hop.index !== undefined) {
        run.push(hop.index);
        // the pattern under an array level is the element's own, like the one under a key
        pattern = hop.pattern;
        continue;
      }
      if (!flushIndices()) return null;
      const literal = unwrapExpressionChain(peelNestedSequenceExpressions(node).tail);
      // no literal in the slot: the keys left are navs the plan's own context walk descends off
      // this receiver (`= globalThis` mirrors the whole outer pattern) - the descent ends here
      if (literal?.type !== 'ObjectExpression') break;
      const match = findObjectKeyBeforeSpread(literal.properties, prop => spelledSlotName(prop) === hop.key);
      if (!match || literal.properties.slice(literal.properties.indexOf(match) + 1)
        .some(prop => spelledSlotName(prop) === null)) return null;
      node = objectPropertyReadValue(match);
      if (!node) return null;
      depth++;
      pattern = hop.pattern;
    }
    if (!flushIndices()) return null;
    // every source descends to the SAME level, or the plan has no one pattern to mirror
    if (patternDepth !== null && patternDepth !== depth) return null;
    patternDepth = depth;
    patternNode = pattern;
    return node;
  }
  for (const receiverSource of receiverSources) {
    const slotNode = hops ? descend(receiverSource) : null;
    if (!slotNode) return null;
    // a slot the wrapper descent dereferenced OUT of the host's own init (a const-alias element -
    // `[w, eff()]` where `const w = [globalThis]`) is a FOREIGN declaration: mirroring there would
    // rewrite a value other readers of the alias observe, and the natural visitor's own rewrite of
    // that span already fires (un-suppressible - two rewrites would land on one span).
    // decline; the leaf falls through to the inline-default fallback, which stays on the host
    if (typeof slotNode.start === 'number' && typeof originNode.start === 'number'
      && (slotNode.start < originNode.start || slotNode.end > originNode.end)) return null;
    // peel a pure effect PREFIX off a sequence default via the canonical peel (it also unwraps
    // paren / TS wrappers, which oxc keeps as first-class nodes - a manual sequence-only walk
    // left the unplugin side bailing on `(eff(), R)` parsed with a ParenthesizedExpression);
    // the receiver TAIL is dropped, so it must be provably effect-free itself
    receiverNodes.push(peelNestedSequenceExpressions(slotNode).tail);
  }
  return { receiverNodes, patternNode };
}

// ascend to the value-bearing host (any pattern depth), all reached when the declarator / cascade
// flatten bailed on a runtime-conditional receiver (the mirror swaps only the receiver operands so
// the effect / short-circuit keeps running in place):
//   - a param-level AssignmentPattern (default slot)
//   - a VariableDeclarator (init slot), or the LOOP of a for-x head declarator, which holds none
//   - an AssignmentExpression cascade (`({ Array: { from } } = receiver)` - receiver in `.right`)
function mirrorPlanHost(leafPatternPath) {
  let cur = leafPatternPath;
  for (let depth = 0; depth < STATIC_WALK_DEPTH && cur?.node; depth++) {
    const parent = cur.parentPath;
    if (!parent?.node) return null;
    const parentType = parent.node.type;
    // a transparent inner default (`[{ Array: { of } } = {}] = [globalThis]`) is see-through - fall
    // through (keep walking) to the value-bearing host above it (the param default), so the WHOLE
    // receiver is replaced by the mirror (`[{ Array: { of: _Array$of } }]`) instead of leaving the proxy
    // receiver with a leaf inline default (which over-applies the polyfill and TypeErrors an empty arg).
    // a FLAT key trigger whose pattern IS the host's direct child (`{ Math:{floor}, Set } = R` visited
    // through `Set`) reaches the host on the first hop - `selfHostAllowed` permits it ONLY for a MIXED
    // pattern (see the helper); a pure-flat pattern keeps its own body-extract / synth-swap fallback
    if (parentType === 'AssignmentPattern' && parent.node.left === cur.node && selfHostAllowed(cur, leafPatternPath)
      && !isInnerDestructureDefault(parent)) {
      return FUNCTION_LIKE_NODE_TYPES.has(parent.parentPath?.node?.type)
        ? { host: parent, slot: 'right', node: parent.node.right } : null;
    }
    // a PARAMETER pattern of an IIFE: the mirror replaces the call's argument at the parameter's index,
    // the value the pattern reads - the call is the host, the argument slot its `arguments.<i>`
    if (FN_NODE_TYPES.has(parentType) && parent.node.params?.includes(cur.node) && selfHostAllowed(cur, leafPatternPath)) {
      const site = findIifeCallSite(parent, cur.node);
      const node = site ? resolveCallArgument(site.callPath.node.arguments ?? [], site.paramIndex) : null;
      return node ? { host: site.callPath, slot: `arguments.${ site.paramIndex }`, node } : null;
    }
    if (parentType === 'VariableDeclarator' && parent.node.id === cur.node && selfHostAllowed(cur, leafPatternPath)) {
      // a for-x HEAD declarator carries no init of its own: what it destructures is an ELEMENT of
      // the iterated literal. the mirror hosts on the LOOP and swaps that element in place INSIDE
      // the array, so every pass reads its own mirrored value - where a binding lifted out of the
      // head into the body is only ever right while the head runs once
      if (parent.node.init) return { host: parent, slot: 'init', node: parent.node.init };
      const headElements = forOfHeadElements(parent);
      const loop = headElements ? parent.parentPath?.parentPath : null;
      return loop?.node ? { host: loop, slot: 'right', node: loop.node.right, headElements } : null;
    }
    if (parentType === 'AssignmentExpression' && parent.node.left === cur.node && selfHostAllowed(cur, leafPatternPath)) {
      return { host: parent, slot: 'right', node: parent.node.right };
    }
    cur = parent;
  }
  return null;
}

export function buildNestedParamSynthPlan({ leafPatternPath, meta, resolvePure, adapter }) {
  if (!resolvePure || !meta?.object || meta.placement !== 'static') return null;
  if (leafPatternPath?.node?.type !== 'ObjectPattern') return null;
  const planHost = mirrorPlanHost(leafPatternPath);
  const host = planHost?.host;
  const slot = planHost?.slot;
  const headElements = planHost?.headElements ?? null;
  if (!host) return null;
  if (!planHost.node) return null;
  // a destructure-ASSIGNMENT whose VALUE is CAPTURED (`alias = ({ Array: { of } } = globalThis)` - the
  // assignment yields its RHS) must NOT synth-swap the receiver into a mirror literal: that makes the
  // captured value the mirror instead of the receiver (`alias = { Array: { of: _Array$of } }`, wrong).
  // bail to the inline-default fallback, which keeps the receiver (polyfilled to `_globalThis` by the
  // natural visitor) and defaults the leaf to its polyfill on absence - preserving BOTH the captured
  // value AND the leaf polyfill. a statement-context assignment (`({...} = R);`) discards the value, so
  // it keeps synth-swapping; a param default (AssignmentPattern host) is caller-correct, not captured
  if (host.node.type === 'AssignmentExpression' && !nestedAssignmentStatementOf(leafPatternPath)) return null;
  // descend ArrayPattern wrappers: an outer destructure may wrap the consumed object-pattern in
  // arrays (`const [, { Array: { from } }] = [0, R]`). resolve the element's object-pattern and the
  // init slot descended to the matching element, so the mirror swaps the proxy branch INSIDE the
  // array element exactly like a direct receiver - not only the bare `{ Array: { from } } = R` shape
  const walked = destructureHostThroughWrappers(leafPatternPath, adapter);
  if (!walked) return null;
  // a for-x head hands the mirror one receiver PER ELEMENT of the iterated literal: the same pattern
  // destructures each of them on its own pass, so each is mirrored where it is written and no pass
  // reads a value another one installed. every other host holds exactly one receiver
  const receiverSources = headElements ?? [planHost.node];
  const mirrored = mirrorReceiverNodes({
    receiverSources, originNode: planHost.node, hops: walked.hops, host, adapter,
  });
  if (!mirrored) return null;
  const { receiverNodes } = mirrored;
  // one plan per MIRRORED pattern - the one under the last hop the descent consumed: sibling leaves
  // of that pattern share it, while a leaf under another hop of the same host (`{ a: { hasOwn },
  // b: { is } }`) mirrors its own slot. keyed on the host, the second hop read the first one's
  // "done" and stayed raw
  const planKey = mirrored.patternNode ?? walked.pattern;
  if (nestedParamSynthPlan.has(planKey)) return nestedParamSynthPlan.get(planKey);
  // a fallback-logical root collapses LEFT (`globalThis || self` - the left short-circuits
  // the selection wherever it is defined; the literal replaces the WHOLE logical), while `&&`
  // yields its RIGHT side when taken - only the right operand is replaced, so a falsy left
  // keeps selecting natively. the surviving branch drives the context walk
  // every value leaf is classified twice - once by `collectValueLeaves` for the reachability
  // verdict, once by `buildMirrorTargets` for the mirror context - and the answer costs a member
  // spine walk plus a `resolveObjectName` binding chase plus an `adapter.getBinding` probe.
  // declared HERE, above `collectValueLeaves`: `rootContext` hoists, a `const` beside it does not
  const rootContextByNode = new Map();
  const targetLeaves = [];
  // leaves whose OWN value picks a `||` / `??` branch (a logical LEFT, and everything whose
  // value flows into one): swapping such a leaf to an always-defined literal flips which branch
  // runs when the leaf can be nullish, so the mirror skips those below
  const valueSelectingLeaves = new Set();
  // enumerate the REACHABLE value leaves of a fallback tree. `&&` keeps its left selecting
  // natively (only its right is a value leaf, and the result may be falsy); `||` / `??` takes
  // its left leaf, and its right only when the left can be falsy (a guarded left like
  // `m && globalThis` - both sides must then unfold, the runtime picks per call). returns
  // whether the subtree can yield a falsy value
  function collectValueLeaves(node, selects = false) {
    while (true) {
      const { tail } = peelNestedSequenceExpressions(node);
      if (tail?.type === 'CallExpression' || tail?.type === 'OptionalCallExpression') {
        // a transparent IIFE stays CALLED (its body effects and the selection run natively);
        // only the value leaves inside its return expression are mirrored
        const inlined = peelZeroArgIifeReturn(tail);
        if (inlined) {
          node = inlined;
          continue;
        }
      }
      if (tail?.type === 'ConditionalExpression') {
        // both branches are reachable - the runtime test picks per call and stays native
        const consequentFalsy = collectValueLeaves(tail.consequent, selects);
        return collectValueLeaves(tail.alternate, selects) || consequentFalsy;
      }
      if (tail?.type !== 'LogicalExpression') {
        targetLeaves.push(tail);
        if (selects) valueSelectingLeaves.add(tail);
        // a DEFINED proxy operand is truthy, so a `||` / `??` right beside it is dead; an
        // UNDEFINABLE probe nav (`globalThis.window ?? {}` - nullish exactly off-env) reaches
        // its fallback, and any other value may be falsy - both keep the fallback collected
        return rootContext(tail)?.kind !== 'proxy'
          || fallbackValueCanBeNullish(tail, { scope: leafPatternPath.scope, adapter, path: leafPatternPath });
      }
      if (tail.operator === '&&') {
        // only the RIGHT operand is a value leaf; the left is a truthiness gate that stays verbatim
        collectValueLeaves(tail.right, selects);
        return true;
      }
      // `||` / `??`: the LEFT's own value picks the branch, and the RIGHT hands the expression's
      // value on, so it keeps the caller's selection position
      return collectValueLeaves(tail.left, true) ? collectValueLeaves(tail.right, selects) : false;
    }
  }
  let rootCanBeFalsy = false;
  for (const receiverNode of receiverNodes) rootCanBeFalsy = collectValueLeaves(receiverNode) || rootCanBeFalsy;
  // the whole-logical collapse below reads THE receiver, so it only applies where there is one
  const soleReceiver = receiverNodes.length === 1 ? receiverNodes[0] : null;
  // a bare always-defined left keeps the right DEAD: when the whole expression is pure it
  // collapses entirely to the single literal; with an effect anywhere only the left tail is
  // swapped and the dead right stays verbatim
  if (soleReceiver?.type === 'LogicalExpression' && !rootCanBeFalsy && targetLeaves.length === 1
    && !mayHaveSideEffects(soleReceiver)) {
    targetLeaves[0] = soleReceiver;
  }

  function rootContext(node) {
    if (rootContextByNode.has(node)) return rootContextByNode.get(node);
    const ctx = resolveRootContext(node);
    rootContextByNode.set(node, ctx);
    return ctx;
  }

  function resolveRootContext(node) {
    let n = node;
    // a proxy hop is walked through only while it still stands for the pristine surface: a slot the
    // user overwrote (`globalThis.window = fake`) holds the replacement, so descending it mirrors a
    // ponyfill onto an object the source never reads - the two halves travel together everywhere
    while ((n?.type === 'MemberExpression' || n?.type === 'OptionalMemberExpression') && !n.computed
      && n.property?.type === 'Identifier' && isPristineProxyGlobal(adapter, n.property.name)) n = n.object;
    if (n?.type === 'Identifier' && isPristineProxyGlobal(adapter, n.name)) return { kind: 'proxy' };
    // a const-aliased proxy (`const NS = globalThis; ... = NS`) is invisible to the raw-AST name check
    // above - dereference it through the SAME resolveObjectName walk mirrorReceiverDescriptor uses for
    // the emitted receiver, so the mirror CONTEXT and the receiver agree instead of stranding the alias
    const resolved = resolveObjectName({ objectNode: n, scope: leafPatternPath.scope, adapter, path: leafPatternPath });
    if (resolved && isPristineProxyGlobal(adapter, resolved)) return { kind: 'proxy' };
    // a const-bound static-object wrapper (`const w = { a: Array }; ... = w`): each pattern key resolves
    // through the object literal to its constructor (`w.a` -> Array) via the SAME walkStaticReceiverChain
    // the declarator static path uses. distinct from a bare ctor by its ObjectExpression init - carry the
    // receiver + walk path so mirrorPattern descends per key instead of stranding the whole tree native
    if (n?.type === 'Identifier' && adapter.hasBinding(leafPatternPath.scope, n.name, leafPatternPath)) {
      const binding = adapter.getBinding(leafPatternPath.scope, n.name, leafPatternPath);
      const init = binding?.path?.node?.init ?? binding?.node?.init;
      if (init?.type === 'ObjectExpression') return { kind: 'static', receiverNode: n, walkPath: [] };
    }
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
      const key = mirrorAcceptedKey({
        prop, scope: leafPatternPath.scope, adapter, path: leafPatternPath, seenKeys,
      });
      if (key === null) return null;
      seenKeys.add(key);
      if (ctx.kind === 'proxy') {
        const inner = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
        // a non-pattern value (`{ Array }` shorthand / `{ Array: x }` rename) or a child that cannot be
        // mirrored (a wholly non-polyfillable subtree) is PASSED THROUGH - the synth literal reads that
        // key's live value off the receiver, so a polyfillable SIBLING still mirrors. an all-or-nothing
        // bail stranded the polyfill: the receiver fell back to raw `_globalThis` and the native read of
        // the polyfill-needing key threw / mis-valued on ie:11
        if (inner?.type === 'ObjectPattern') {
          const child = mirrorPattern(inner, isPristineProxyGlobal(adapter, key) ? ctx : { kind: 'ctor', name: key });
          // a nested subtree the mirror cannot synthesize (rest / unresolvable / duplicate key) is a
          // BAILED passthrough: its polyfillable leaves go to the leaf fallback, which needs the mirror
          // NOT to fire - so an injecting-ctor-passthrough sibling must not keep the mirror alive here
          entries.push({ key, child: child ?? { kind: 'passthrough', bailed: true } });
        } else {
          // a shorthand / renamed ctor key (`{ Set }`, `{ Set: S }`) renders as a passthrough, but a
          // MISSING-ABLE ctor passthrough INJECTS the pure constructor (`Set` -> `_Set`) - mark it so the
          // mirror owns the flat ctor rather than bailing to raw `_globalThis` and stranding it native
          entries.push({ key, child: { kind: 'passthrough', injects: !!resolvePure({ kind: 'global', name: key }) } });
        }
      } else if (ctx.kind === 'static') {
        // resolve this key through the static-object literal (`w.a` -> Array) via the shared static
        // receiver walk: a proxy-global hop descends as proxy, a leaf constructor descends its statics,
        // a deeper object hop keeps walking, anything unresolvable passes through to the native read
        const resolved = walkStaticReceiverChain({
          receiverNode: ctx.receiverNode, walkPath: [...ctx.walkPath, key], scope: leafPatternPath.scope, adapter, path: leafPatternPath,
        });
        const inner = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
        const childCtx = resolved
          ? isPristineProxyGlobal(adapter, resolved) ? { kind: 'proxy' } : { kind: 'ctor', name: resolved }
          : { kind: 'static', receiverNode: ctx.receiverNode, walkPath: [...ctx.walkPath, key] };
        const child = inner?.type === 'ObjectPattern' ? mirrorPattern(inner, childCtx) : null;
        entries.push({ key, child: child ?? { kind: 'passthrough' } });
      } else {
        const pure = resolvePure({
          kind: 'property', object: ctx.name, key, placement: 'static', receiverHint: meta.receiverHint,
        });
        // a non-polyfillable static (`Math.floor`, an always-present ES method) or an instance-method
        // match (not a static) passes through to the receiver's real value rather than bailing the mirror
        entries.push(!pure || pure.kind === 'instance'
          ? { key, child: { kind: 'passthrough' } }
          : { key, child: { kind: 'polyfill', entry: pure.entry, hintName: pure.hintName } });
      }
    }
    return entries.length ? { kind: 'object', entries } : null;
  }

  // mirror EVERY reachable leaf that resolves (each leaf gets its own root context - a leaf that does
  // not resolve stays verbatim, native semantics preserved on that path); replaced leaves must be
  // effect-free themselves, everything kept stays UN-skipped in the emitters so its inner rewrites still
  // compose (discard-rescue contract). patternNode is always the element's ObjectPattern (the array-
  // wrapper descent above resolved it), so the receiver leaf is mirrored directly in place in the array
  function buildMirrorTargets() {
    const patternNode = mirrored.patternNode ?? walked.pattern;
    const out = [];
    for (const leaf of targetLeaves) {
      if (!leaf || mayHaveSideEffects(leaf)) continue;
      // a value-SELECTING leaf that can be nullish must not become an always-defined literal:
      // the swap would flip which `||` / `??` branch runs (`globalThis.window ?? {}` - native
      // takes the fallback exactly off-env). the leaf stays raw, native semantics preserved
      if (valueSelectingLeaves.has(leaf)
        && fallbackValueCanBeNullish(leaf, { scope: leafPatternPath.scope, adapter, path: leafPatternPath })) continue;
      // a whole-collapse target is the full logical - its context is the LEFTMOST value leaf
      let ctxNode = leaf;
      while (ctxNode?.type === 'LogicalExpression') ctxNode = peelNestedSequenceExpressions(ctxNode.left).tail;
      const tree = mirrorPattern(patternNode, rootContext(ctxNode));
      // an ALL-passthrough tree (no polyfillable leaf) has nothing to inject - leave it native
      const metrics = tree && treeInjectionMetrics(tree);
      if (!metrics?.hasPolyfill) continue;
      const descriptor = mirrorReceiverDescriptor(ctxNode, leafPatternPath, adapter);
      // a passthrough leaf reads its key's live value off the receiver, so the render needs a NAMEABLE
      // receiver (`receiverName.key`). a static-object receiver (`{ g: globalThis }`) has no single name,
      // so a tree mixing a passthrough with polyfills there is un-renderable - bail to native instead of
      // emitting `t.identifier(null)`. an all-polyfill static-object tree needs no receiver and still fires
      if (!descriptor.receiverName && metrics.hasPassthrough) continue;
      out.push({ node: leaf, tree, ...descriptor });
    }
    return out;
  }
  const targets = buildMirrorTargets();
  if (!targets.length) {
    // un-mirrorable pattern (rest / side-effecting or unresolvable computed key / duplicate key):
    // BAIL to native when a reachable value
    // branch is a non-proxy - its legitimate `undefined` must not become the polyfill. a proxy-only
    // receiver keeps the sound inline default (it fires only when the global's static is genuinely
    // absent on the selected proxy, never replacing a user value)
    const declined = receiverSources.every(destructureValueBranchesAllProxy) ? null : { bail: true };
    nestedParamSynthPlan.set(planKey, declined);
    return declined;
  }
  nestedParamSynthPlan.set(planKey, { done: true });
  return { host, slot, targets };
}

// can the WHOLE init be discarded by a flatten? plain inits always; a fallback-logical only
// when its left chain is unconditionally taken (`||` / `??` lefts down to a non-logical leaf -
// no `&&` guard anywhere on the path: a guard can select its falsy LEFT, and that path's
// native TypeError must survive the transform) and every dropped operand is pure.
// `rescueReachable` is false inside a ternary BRANCH: a branch-buried effect (chain assignment,
// sequence prefix, IIFE body) is conditional, and the top-level rescue / verbatim-keep machinery
// would either run it unconditionally or drop it with the whole init - both unsound - so inside
// a branch only effect-free value shapes are discardable
export function fallbackInitWhollyDiscardable(initNode, rescueReachable = true) {
  while (true) {
    const { prefix, tail } = peelNestedSequenceExpressions(initNode);
    if (!rescueReachable && (prefix.length
      || (tail && tail.type !== 'ConditionalExpression' && mayHaveSideEffects(tail)))) return false;
    if (isChainAssignment(tail)) {
      // the assignment itself is rescued WHOLE, but the destructure READ of its value is what
      // the flatten discards - a guarded RHS keeps its falsy-path TypeError
      initNode = tail.right;
      continue;
    }
    if (tail?.type === 'CallExpression' || tail?.type === 'OptionalCallExpression') {
      // a transparent IIFE discards by its RETURN expression: an SE BODY is rescued by the
      // existing discard-rescue harvest, but a guard inside the return keeps its falsy path,
      // and an effectful ARGUMENT (`(g => g)((c++, globalThis))`) is not harvested - the
      // mirror keeps the call and swaps the leaf inside the argument instead
      const inlined = peelZeroArgIifeReturn(tail);
      if (!inlined) return true;
      if ((tail.arguments ?? []).some(arg => mayHaveSideEffects(arg))) return false;
      initNode = inlined;
      continue;
    }
    if (tail?.type === 'ConditionalExpression') {
      // a ternary is discardable only when the dropped test is pure and EACH branch is itself
      // wholly discardable - a guard inside a branch keeps its falsy-path TypeError
      return !mayHaveSideEffects(tail.test)
        && fallbackInitWhollyDiscardable(tail.consequent, false)
        && fallbackInitWhollyDiscardable(tail.alternate, false);
    }
    if (tail?.type !== 'LogicalExpression') return true;
    if (mayHaveSideEffects(tail)) return false;
    for (let node = tail; node?.type === 'LogicalExpression'; node = peelNestedSequenceExpressions(node.left).tail) {
      if (node.operator === '&&') return false;
    }
    return true;
  }
}

// render a synth-plan tree as canonical nodes: the recursion, the leaf dispatch AND the
// passthrough resolution live here once. an emitter supplies only `injectImport` (inject an
// entry, answer the binding NAME it owns) plus the receiver descriptor the passthrough reads
// through - a non-polyfillable key reads its live value at the accumulated key path
// (`_globalThis.Math.floor`, `Array.isArray`), resolved by the same passthrough canon the flat
// renders use, so neither leg depends on a later pass re-resolving a raw member chain
export function renderSynthTree(tree, ctx, keyPath = []) {
  if (tree.kind === 'polyfill') return identifier(ctx.injectImport(tree.entry, tree.hintName));
  if (tree.kind === 'passthrough') {
    const ref = resolvePassthroughRef({
      keyPath,
      receiverName: ctx.receiverName,
      receiverIsProxy: ctx.receiverIsProxy,
      resolveGlobalPolyfill: ctx.resolveGlobalPolyfill,
      adapter: ctx.adapter,
    });
    let base = ref.pure ? identifier(ctx.injectImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
    for (const key of ref.path) base = memberFromKeyName(base, key);
    return base;
  }
  return objectExpression(tree.entries.map(
    ({ key, child }) => synthProperty(key, renderSynthTree(child, ctx, [...keyPath, key]))));
}

// a synth tree worth emitting carries at least one polyfill leaf; an all-passthrough tree would just
// re-read the receiver verbatim, so the caller leaves the destructure native instead of mirroring it.
// a passthrough leaf (`Set` -> `_Set`, `Math.floor` native) additionally reads its key off the
// receiver, so it can only render against a NAMEABLE receiver - a static-object receiver can't supply
// one. ONE walk answers both: the caller needs both flags for the same tree
function collectTreeInjectionFlags(tree, m) {
  switch (tree.kind) {
    case 'polyfill': m.real = true; break;
    case 'passthrough':
      m.passthrough = true;
      if (tree.injects) m.injecting = true;
      if (tree.bailed) m.bailed = true;
      break;
    case 'object': for (const { child } of tree.entries) collectTreeInjectionFlags(child, m); break;
    // no default
  }
  return m;
}

function treeInjectionMetrics(tree) {
  const m = collectTreeInjectionFlags(tree, { real: false, injecting: false, bailed: false, passthrough: false });
  // a BAILED nested subtree (rest / unresolvable key) leaves its polyfillable leaves to the leaf
  // fallback, which needs the mirror NOT to fire - so only a REAL nested polyfill keeps the mirror there
  // (an injecting ctor passthrough alone would strand those leaves). otherwise the injecting ctor
  // passthrough (`Set` -> `_Set`) is itself enough to keep the mirror and own the flat ctor
  return { hasPolyfill: m.bailed ? m.real : m.real || m.injecting, hasPassthrough: m.passthrough };
}

// the receiver name + proxy flag back the passthrough rendering: a proxy reads through the injected
// `_globalThis`, a bare constructor through its own name (`Array.isArray`)
function mirrorReceiverDescriptor(ctxNode, leafPatternPath, adapter) {
  const receiverName = resolveObjectName({ objectNode: ctxNode, scope: leafPatternPath.scope, adapter, path: leafPatternPath });
  return { receiverName, receiverIsProxy: POSSIBLE_GLOBAL_OBJECTS.has(receiverName) };
}

// resolve a passthrough leaf's base reference. both bindings read it from here: the canon resolves
// what babel once left to a second visitor pass over its own re-emitted member access, and the two
// answers coincide by corpus. the resolution mirrors the natural injection: a MISSING-ABLE
// constructor (`Set`/`Map` - it has a pure constructor entry) IS the pure import: read the whole
// binding (`{ Set }` -> `_Set`) or a property off it
// (`{ Set: { union } }` -> `_Set.union`). the property lives on the pure constructor even when not declared
// in the built-in definitions (`_Set.union` is a static), so this INJECTS the polyfill - matching usage-
// pure's own `globalThis.Set.union` -> `_Set.union` resolution. NEVER a native read / optional chain: that
// throws off-engine, mis-values, and emits ES2020 syntax into an (often ES5) target. an ALWAYS-PRESENT ctor
// (`Array`/`Math` - no constructor polyfill) reads natively: a proxy receiver anchors on its pure proxy
// import WHEN it has one (`globalThis`/`self` -> `_globalThis`/`_self`), else stays bare (`window`/`global`
// are not polyfilled in pure -> `window.Array.isArray`); a bare ctor receiver reads through its own name
// (`Array.isArray`). `resolveGlobalPolyfill` is emitter-supplied (`{ entry, hintName }` or null)
export function resolvePassthroughRef({
  keyPath,
  receiverName,
  receiverIsProxy,
  resolveGlobalPolyfill,
  adapter = null,
  resolveStaticPolyfill = null,
}) {
  const path = receiverIsProxy ? keyPath : [receiverName, ...keyPath];
  // a MUTATED ctor slot must render as the raw proxy member (`_globalThis.Set` - the user's
  // shim wins), matching babel's mutation-aware visitor delegation
  const ctorMutated = receiverIsProxy && !!adapter?.isMutatedStatic?.(receiverName, path[0]);
  // ... and a nav ENDING on a polyfillable static of that constructor reads the static's own
  // ponyfill, whether or not the constructor has a pure entry of its own (`globalThis.Array.of`
  // and `Array.of` alike are `_Array$of`, never a raw read off the realm). only a caller SPELLING
  // a nav asks for it - the synth passthrough answers for keys its plan already judged
  // non-polyfillable - and a mutated slot keeps the user's own value on the raw read
  if (resolveStaticPolyfill && !ctorMutated && path.length === 2 && isStaticPlacement(path[0])
    && !adapter?.isMutatedStatic?.(path[0], path[1])) {
    const staticPure = resolveStaticPolyfill(path[0], path[1]);
    if (staticPure) return { pure: staticPure, path: [], static: true };
  }
  const ctorPure = ctorMutated ? null : resolveGlobalPolyfill(path[0]);
  if (ctorPure) return { pure: ctorPure, path: path.slice(1) };
  const proxyPure = receiverIsProxy && resolveGlobalPolyfill(receiverName);
  return proxyPure ? { pure: proxyPure, path } : { name: receiverName, path: keyPath };
}

// the stable per-property SLOT key both emitters register and look polyfills up under: the
// resolved static name where one exists, else the slot notation. asked with scope, so a
// WELL-KNOWN-SYMBOL key answers the same whichever spelling the tree carries at the moment
// (`[Symbol.iterator]` before an emitter's key swap, `[_Symbol$iterator]` after it) - the two
// legs register at different points of that swap and must still meet on one key
export function synthPropDedupKey(prop, { scope, path, adapter }) {
  const wks = prop.computed ? computedKeyWellKnownSymbolName({ keyNode: prop.key, scope, adapter, path }) : null;
  if (wks !== null) return `[@@${ wks }]`;
  const { lookupKey, slotKey } = resolveSynthKeys({ node: prop, scope, adapter, path });
  if (!slotKey || (!lookupKey && !/^\[[$a-z_][\w$]*\]$/i.test(slotKey))) return null;
  // ... a key named by SCOPE alone (no structural slot: a bound identity call) collapses onto the slot
  // its resolved name spells, as a folded string spelling of that name does; a bound-identifier key
  // keeps its own `[k]` slot beside the plain spelling, the literal carrying both
  return synthSlotName(prop) ?? (synthSwapPropKey(prop) === null && typeof lookupKey === 'string' ? lookupKey : slotKey);
}

// the pattern's synth render plan, computed once per pending: one entry per distinct
// SLOT (duplicate spellings of one static name collapse - `{ of, ['of']: x }` reads one
// property), with the first occurrence's spelling and the lookup name for passthrough
export function buildPatternRenderPlan(patternNode, { scope, path, adapter }) {
  const keys = [];
  const seen = new Set();
  for (const prop of patternNode.properties) {
    // both dialects reach this plan: babel spells a destructure prop `ObjectProperty`, estree
    // `Property`; anything else (a rest) has no slot to render
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return null;
    const { lookupKey: resolvedKey, slotKey } = resolveSynthKeys({ node: prop, scope, adapter, path });
    // which well-known symbol the key names, whatever spelling it wears (`[Symbol.iterator]`,
    // a user alias `[s]`, the swapped `[_Symbol$iterator]`) - the value side reads by symbol
    const wks = prop.computed
      ? computedKeyWellKnownSymbolName({ keyNode: prop.key, scope, adapter, path }) : null;
    // ... and only the RAW member spelling has to be re-spelled: the literal cannot clone it
    // (that read throws off-engine where the pattern's own swapped key reads the polyfill),
    // so the slot takes the injected pure symbol binding. every Identifier spelling clones
    // as it stands. a raw member whose `Symbol` is SHADOWED names no symbol - decline whole
    const wksSpelling = prop.computed ? wksComputedKeyName(prop.key) : null;
    if (wksSpelling !== null && wks === null) return null;
    // a BOUND-identifier computed key (`[X]`) never folds, but the literal replays it
    // verbatim and the passthrough reads computed (`[X]: Array[X]`) - the bracket slot
    // is its own lookup marker
    const lookupKey = resolvedKey ?? (slotKey && /^\[[$a-z_][\w$]*\]$/i.test(slotKey) ? slotKey : null);
    if (!lookupKey || !slotKey) return null;
    const dedupKey = synthPropDedupKey(prop, { scope, path, adapter });
    if (!dedupKey) return null;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);
    // an SE-free computed key keeps its SOURCE spelling in the literal (`['from']: _X`);
    // an SE-bearing one folds to the resolved string (the effect cannot re-run); a wks key
    // spells the injected symbol binding, so it carries no source key node
    const sourceKey = prop.computed && (computedKeyHasSideEffects(prop) || wksSpelling !== null) ? null : prop.key;
    keys.push({
      dedupKey,
      lookupKey,
      keyNode: sourceKey,
      slotKey,
      computedKey: prop.computed && !!sourceKey,
      wks,
      wksSpelling,
    });
  }
  return keys;
}

// the BASE a nested hop chain reads through, shared by both emitters' extraction renders:
// a proxy-global root declines when its slot is MUTATED (the bare name holds the user's
// replacement, not the global), drops leading pristine proxy hops (pure navigation into the
// same surface), collapses an all-proxy chain onto the root's own pure import, and otherwise
// resolves through the passthrough canon. a BOUND root shadows the global name and reads raw
export function resolveNestedReceiverBase({
  rootName,
  keys,
  bound = false,
  adapter,
  resolveGlobalPolyfill,
  resolveStaticPolyfill = null,
}) {
  // a bound root is the user's own binding whatever it is named - raw reads only: the
  // passthrough's ctor arm would otherwise resolve a shadowing `self`/`Map` to its pure entry.
  // a root with no name at all (the chain walk's call / `new` / member root) is the user's own
  // value the same way: the caller spells it, and the path is what this answers
  if (bound || typeof rootName !== 'string') return { name: rootName ?? null, path: keys };
  const rootIsProxy = POSSIBLE_GLOBAL_OBJECTS.has(rootName);
  let hopKeys = keys;
  if (rootIsProxy) {
    if (isMutatedGlobalSlot(adapter, rootName)) return null;
    while (hopKeys.length && isPristineProxyGlobal(adapter, hopKeys[0])) hopKeys = hopKeys.slice(1);
    if (!hopKeys.length) {
      const rootPure = resolveGlobalPolyfill(rootName);
      return rootPure ? { pure: rootPure, path: [] } : null;
    }
  }
  return resolvePassthroughRef({
    keyPath: hopKeys,
    receiverName: rootName,
    receiverIsProxy: rootIsProxy,
    resolveGlobalPolyfill,
    adapter,
    resolveStaticPolyfill,
  });
}

// drive a synth plan: iterate the targets, render each tree, and let the emitter swap the
// node and quarantine the dropped subtree (skip AFTER a successful replace only - a bailed
// target must stay live for the ordinary rewrites). the iteration semantics live here ONCE
export function applyNestedParamSynthPlan({ plan, renderTree, replaceTarget, skipSubtree }) {
  if (!plan) return false;
  if (plan.done) return true;
  // un-mirrorable pattern with a non-proxy value branch: handled by leaving the destructure native
  // (no inline default that would corrupt the branch's legitimate undefined). nothing to render
  if (plan.bail) return true;
  let replaced = false;
  for (const { node, tree, receiverName, receiverIsProxy } of plan.targets) {
    if (!replaceTarget(node, renderTree(tree, { receiverName, receiverIsProxy }))) continue;
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
const nestedReceiverCache = createInstanceNodeCache();

// the outer chain declined, but an inner DEFAULT carries a receiver of its own:
// `{ inner: { from } = Array }` reads `Array.from` exactly when the outer slot is undefined, which
// is exactly when a mirror of that default fires - so the receiver is resolvable after all, on any
// host. asked ONLY as a fallback: a chain that resolves means the default is dead code and the
// outer receiver is the real one (`{ Array: { from } = {} } = globalThis`)
function innerDefaultReceiverName(outerProp, adapter) {
  const value = outerProp?.node?.value;
  if (value?.type !== 'AssignmentPattern' || value.left?.type !== 'ObjectPattern') return null;
  const init = unwrapExpressionChain(value.right);
  // a BRANCHY default (`= Array || Iterator`, `= c ? Array : Set`) declines here on purpose: this
  // channel answers with a receiver NAME, and a name cannot say "either branch". picking one and
  // mirroring it emits the wrong branch's static whenever the other one fires - the flat path can
  // afford these shapes only because its meta carries `fromFallback` and the emit enumerates arms
  if (!init || init.type === 'LogicalExpression' || init.type === 'ConditionalExpression') return null;
  return resolveObjectName({
    objectNode: init, scope: outerProp.scope, adapter, path: outerProp, usageNode: outerProp.node,
  });
}

export function resolveNestedDestructureReceiver(outerProp, adapter, unionSink = null) {
  // the cache entry carries the container-slot union beside the name, so a cache hit replays
  // the alternatives into the caller's sink instead of silently dropping them
  const cached = nestedReceiverCache.get(adapter, outerProp.node);
  const union = cached ? cached.union : [];
  const result = cached ? cached.name
    : computeNestedDestructureReceiver(outerProp, adapter, union) ?? innerDefaultReceiverName(outerProp, adapter);
  if (unionSink) for (const name of union) if (!unionSink.includes(name)) unionSink.push(name);
  if (!cached && result) nestedReceiverCache.set(adapter, outerProp.node, { name: result, union });
  return result;
}

// resolve a conditional-receiver BRANCH / operand to the global-proxy name it references, or null.
// peel chain / TS wrappers and any logical operands (the side actually yielded) and report the
// receiver name only when it is a POSSIBLE_GLOBAL_OBJECTS alias. shared predicate, combined per
// caller: the EMIT flatten plan requires it on BOTH ternary branches (agreement -> collapse to a
// single polyfill binding), while the DETECTION accepts it on EITHER (a proxy on any reachable
// branch makes the leaf a polyfill candidate; the mirror then renders per branch).
// `||` / `??` follow the LEFT operand; with `eitherLogicalOperand` (DETECTION only) a non-proxy
// left falls back to the RIGHT - the runtime may yield either operand, so `m || globalThis`
// buried in a ternary branch still marks the leaf. the EMIT plan keeps the strict left-only
// walk: it collapses to a single binding, so a diverging `||` must stay native, not flatten
export function resolveBranchProxyName({ branchNode, scope, adapter, path, eitherLogicalOperand = false }) {
  let branch = unwrapExpressionChain(branchNode);
  while (branch) {
    // a chain assignment evaluates to its RHS - DETECTION follows the value so the leaf is
    // marked (usage-global injects; the pure mirror substitutes the raw global in place,
    // keeping the assignment). the EMIT plan must NOT see through it: its flatten discards
    // the init slot, and a branch-buried assignment is not harvested - agreement through a
    // chain assignment would drop the write, so the strict walk bails to native instead
    if (eitherLogicalOperand && isChainAssignment(branch)) {
      branch = unwrapExpressionChain(branch.right);
      continue;
    }
    if (branch.type !== 'LogicalExpression') break;
    if (eitherLogicalOperand && branch.operator !== '&&') {
      return resolveBranchProxyName({ branchNode: branch.left, scope, adapter, path, eitherLogicalOperand })
        ?? resolveBranchProxyName({ branchNode: branch.right, scope, adapter, path, eitherLogicalOperand });
    }
    branch = unwrapExpressionChain(branch.operator === '&&' ? branch.right : branch.left);
  }
  if (!branch) return null;
  // the branch is READ where it is spelled: anchor the alias-walk's write-dominance checks at the
  // branch node itself, not at whatever the host path happens to be (a write between the two must
  // not flip the captured value)
  return asProxyGlobalName(resolveObjectName({ objectNode: branch, scope, adapter, path, usageNode: branch }));
}

// shared branch-walk: do ALL reachable VALUE branches of a destructure receiver satisfy `isLeaf`? a
// single failing branch (a user-object ternary alternate / `||` operand) means a `= _polyfill` default
// could fire on its legitimate `undefined`, so the caller must bail there. `&&` yields its RIGHT (left
// is a guard), `||` / `??` either operand, a conditional both arms, a chain assignment its RHS value,
// a transparent IIFE its return; parens / sequences are peeled (babel uses `extra.parenthesized` so
// unwrapTransparentSeq is a no-op there - it only makes the oxc ParenthesizedExpression node match babel)
function allDestructureValueBranches(node, isLeaf) {
  while (true) {
    const { tail } = peelNestedSequenceExpressions(unwrapTransparentSeq(node));
    if (tail?.type === 'CallExpression' || tail?.type === 'OptionalCallExpression') {
      const inlined = peelZeroArgIifeReturn(tail);
      if (inlined) {
        node = inlined;
        continue;
      }
    }
    if (isChainAssignment(tail)) {
      node = tail.right;
      continue;
    }
    if (tail?.type === 'ConditionalExpression') {
      return allDestructureValueBranches(tail.consequent, isLeaf) && allDestructureValueBranches(tail.alternate, isLeaf);
    }
    if (tail?.type === 'LogicalExpression') {
      return tail.operator === '&&'
        ? allDestructureValueBranches(tail.right, isLeaf)
        : allDestructureValueBranches(tail.left, isLeaf) && allDestructureValueBranches(tail.right, isLeaf);
    }
    return isLeaf(tail);
  }
}

// a leaf is a PROXY when it is a bare global-object name or a proxy-hop member chain ending in one
// (name-based, mirroring the flatten plan's rootContext)
function isProxyGlobalLeaf(tail) {
  let n = tail;
  while ((n?.type === 'MemberExpression' || n?.type === 'OptionalMemberExpression') && !n.computed
    && n.property?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(n.property.name)) n = n.object;
  return n?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(n.name);
}

// do ALL reachable value branches resolve to a global proxy? a non-proxy branch means a `= _polyfill`
// default could fire on its legitimate `undefined`, so an un-mirrorable pattern must bail there
function destructureValueBranchesAllProxy(node) {
  return allDestructureValueBranches(node, isProxyGlobalLeaf);
}

// is an inner default's right a value-bearing RECEIVER (every branch a bare Identifier / member chain,
// incl. logical / conditional fallbacks `= Array || Set`, `= c ? Array : Set`)? then THIS default is
// the host (`{ from } = Array || Set` reads `from` off whichever arm fires when the slot is undefined),
// not a transparent empty fallback (`{ from } = {}` - the real receiver lives further up the pattern)
export function destructureRightIsReceiver(node) {
  return allDestructureValueBranches(node, isReceiverShapedNode);
}

// the constructor a NESTED destructure leaf reads its static off, climbed from the outer property up
// through pattern keys and array-wrapper levels to the host and resolved down through the init:
// a proxy-global chain, a static container, or an array-wrapper alias followed to its literal
// (`unionSink` collects the other constructors a reassigned alias may hold along the way)
function computeNestedDestructureReceiver(outerProp, adapter, unionSink = null) {
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
      node: cur.node.key, computed: cur.node.computed, scope: pattern.scope, adapter,
      // a key that only folds PAST AN EFFECT still names the hop: the level keeps the hop the way a
      // rest sibling does (the hop retires to a sentinel, the key runs once where it stands), so the
      // fold keeps the key node and every flavor rewrites on the same name
      bailOnSideEffectKey: false, keepsKeyNode: true,
    });
    if (!key) return null;
    keys.unshift(key);
    const { parent, indices } = peelDestructureWrappers(pattern);
    allIndices = [...indices, ...allIndices];
    // IDENTIFICATION uses the broad host predicate (same rationale as the array-wrapper
    // resolver): any assignment-destructure host and parameter defaults carry a receiver;
    // the pure flatten re-checks its own narrow host shape at emit
    // a PARAMETER pattern of an IIFE reads the call's argument at its index: that argument is the
    // slot the walk descends, spelled at the CALL (its scope and path anchor the resolution there)
    // ... through the array wrappers the peel stepped over: the PARAMETER the function lists is the
    // outermost pattern, and that is what the call site is asked about
    let paramPattern = pattern;
    while (paramPattern.parentPath?.node?.type === 'ArrayPattern') paramPattern = paramPattern.parentPath;
    const iifeSite = parent?.node && FN_NODE_TYPES.has(parent.node.type) ? findIifeCallSite(parent, paramPattern.node) : null;
    const hostPath = iifeSite ? iifeSite.callPath : parent;
    const hostScope = hostPath?.scope ?? parent?.scope;
    // the name channel reads a relocated head through to its element (the emit routes key on the
    // init as written and are not handed it)
    const slotNode = relocatedHeadElement(parent) ?? destructureReceiverNode(parent, paramPattern.node);
    // descend the init through each ArrayPattern wrapper at its recorded element index
    // (`[, { from }]` descends index 1, not a blind 0). thread scope/adapter/path so a const-bound
    // array-literal wrapper (`const wrapper = [{ a: Array }]; const [{ a: { from } }] = wrapper`)
    // dereferences to its init, mirroring resolveArrayWrapperedDestructureReceiver
    // the descended hop's `readNode` is the capture, exactly as in `resolveArrayWrapperedDestructureReceiver`:
    // a const-bound wrapper's leaf captured its value at the wrapper's declarator, so the leaf's
    // reassignment check must anchor THERE, not at the destructure host (a source write between
    // capture and destructure cannot change the captured value)
    const descended = allIndices.length
      // thread the usage-global "inject-if-might" flag like the ArrayPattern-rooted sibling
      // (arrayWrapReceiverFromHost): a spread-shifted slot with one static candidate keeps the walk
      // going (over-inject, the safe direction) so this ObjectProperty-rooted nested path matches it
      ? descendArrayWrapperInit(
        { node: slotNode, ctx: { scope: hostScope, adapter, path: hostPath, resolveKey: sharedResolveKey } }, allIndices,
        { maybe: adapter?.method === 'usage-global', unionSink },
      )
      : null;
    const receiverNode = allIndices.length ? descended?.node ?? null : slotNode;
    if (receiverNode !== null) {
      // peel parens / chain / TS wrappers AND SE tail to a fixpoint so `(se(), R) as any`
      // (and nested combinations like `(se(), (R as any))`) all reach the receiver. without
      // this, TS-wrapped nested destructures bail the flatten path entirely even though the
      // runtime value is identical to the unwrapped form
      let init = unwrapExpressionChain(receiverNode);
      // collapse the init for identification, mirroring the flat meta: `&&` takes its RIGHT
      // (the side yielded when taken); `||` / `??` takes whichever operand is a global proxy
      // (left primary, else the right fallback - so `m || globalThis` is recognised); a
      // transparent IIFE call inlines its return expression (`(() => m && globalThis)()`)
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
          if (init.operator === '&&') {
            init = unwrapExpressionChain(init.right);
            continue;
          }
          // `||` / `??`: value is the left (truthy) or the right fallback (falsy). keep the left
          // unless it is a bare non-proxy identifier - only then is the right the reachable
          // receiver (`m || globalThis`). a proxy / logical / ternary / member left may itself
          // carry the proxy, so keep it and let the loop + ternary handling recurse
          const leftBranch = unwrapExpressionChain(init.left);
          init = leftBranch.type === 'Identifier'
            && !resolveBranchProxyName({ branchNode: leftBranch, scope: hostScope, adapter, path: hostPath })
            ? unwrapExpressionChain(init.right) : leftBranch;
          continue;
        }
        break;
      }
      if (!init) return null;
      let receiver;
      if (init.type === 'ConditionalExpression') {
        // DETECTION flags the leaf when EITHER branch resolves to a global proxy: the runtime
        // may select that branch, making the keys global statics on that path, so `from` is a
        // polyfill candidate. the EMIT plan decides the shape - an all-proxy ternary flattens to
        // the polyfill binding (`buildNestedDestructurePlan` agreement), a diverging one mirrors
        // per branch (the proxy branch becomes the synth literal, a non-proxy branch stays native)
        receiver = resolveBranchProxyName({
          branchNode: init.consequent, scope: hostScope, adapter, path: hostPath, eitherLogicalOperand: true,
        }) || resolveBranchProxyName({
          branchNode: init.alternate, scope: hostScope, adapter, path: hostPath, eitherLogicalOperand: true,
        });
        if (!receiver) return null;
      } else {
        receiver = resolveObjectName({
          objectNode: init, scope: descended?.ctx.scope ?? hostScope, adapter, path: hostPath,
          usageNode: descended?.readNode ?? hostPath.node,
        });
      }
      if (receiver && POSSIBLE_GLOBAL_OBJECTS.has(receiver)
          && keys.slice(0, -1).every(k => isPristineProxyGlobal(adapter, k))) {
        // leaf must be a recognised constructor name (`isStaticPlacement` whitelists the
        // capitalised globals dispatch consults). without this gate, `const {window: {foo}}
        // = globalThis` would return `'foo'` to downstream `resolveBuiltIn` which then
        // bails on the unknown name - cleaner to bail here than push noise downstream.
        // a mutated leaf slot holds the user's replacement - not the pristine ctor
        const leaf = keys.at(-1);
        return isStaticPlacement(leaf) && !isMutatedGlobalSlot(adapter, leaf) ? leaf : null;
      }
      // thread `parent` (the destructure host's path) through walkStaticReceiverChain so
      // adapter.hasBinding hits the TS-runtime lookup fallback for declare-bindings that
      // estree-toolkit's scope tracker doesn't register
      return walkStaticReceiverChain({
        receiverNode: init, walkPath: keys, scope: descended?.ctx.scope ?? hostScope, adapter, path: hostPath,
        usageNode: descended?.readNode ?? null, unionSink,
      });
    }
    const parentType = parent?.node?.type;
    if (parentType !== 'Property' && parentType !== 'ObjectProperty') return null;
    cur = parent;
  }
}

// --- the destructure funnel choke: ONE host classification and ONE meta rule for both legs ---

// the HOPS from a nested pattern up to the pattern its host destructures directly, receiver-to-leaf
// (an object hop's `key` - a bound computed key folded where `adapter` is given - an array wrapper's
// `index`), with that host pattern - the levels an instance mirror descends to reach the slot a
// nested leaf reads. null past a key nothing names or an inner default: those levels belong to the
// plan that owns them
export function patternHopKeysToHost(patternPath, adapter = null) {
  const hops = [];
  let cur = patternPath;
  for (let guard = 0; guard < STATIC_WALK_DEPTH && cur?.node; guard++) {
    const owner = cur.parentPath;
    const ownerType = owner?.node?.type;
    if (ownerType === 'ArrayPattern') {
      const index = owner.node.elements.indexOf(cur.node);
      if (index === -1) return null;
      hops.unshift({ index });
      cur = owner;
      continue;
    }
    if (ownerType !== 'Property' && ownerType !== 'ObjectProperty') return hops.length ? { hops, hostPattern: cur } : null;
    // a bound computed key folds through the consuming canon where an adapter is at hand
    const key = consumableHopSlotName(owner.node, adapter ? { scope: owner.scope ?? patternPath.scope, adapter, path: owner } : null);
    if (typeof key !== 'string') return null;
    hops.unshift({ key });
    cur = owner.parentPath;
    if (cur?.node?.type !== 'ObjectPattern') return null;
  }
  return null;
}

// descend a receiver PATH through those hops: every object level a literal PAIRING the key on the
// resolver's terms (the slot before any spread, no key after it that could BE this one), every array
// level a literal holding the element at its runtime position (an inline-array spread expanded, a
// spread of a binding ahead shifts it - null) - the paired VALUE's path, or null. both legs' paths
// answer `get('properties')` / `get('elements')` with a list and `get('value')`
// with the slot, so one descent serves the two emitters; transparent wrappers are stepped through
export function descendReceiverPathByKeys(path, hops) {
  let cur = path;
  for (const hop of hops) {
    cur = peelTransparentWrapperPath(cur);
    const node = cur?.node;
    if (hop.index !== undefined) {
      cur = node?.type === 'ArrayExpression' ? positionalElementPath(cur, hop.index) : null;
      if (!cur) return null;
    } else {
      if (node?.type !== 'ObjectExpression') return null;
      const match = findObjectKeyBeforeSpread(node.properties, prop => spelledSlotName(prop) === hop.key);
      if (!match || node.properties.slice(node.properties.indexOf(match) + 1)
        .some(prop => spelledSlotName(prop) === null)) return null;
      cur = cur.get('properties')[node.properties.indexOf(match)]?.get('value');
    }
    if (!cur?.node) return null;
  }
  cur = peelTransparentWrapperPath(cur);
  return cur?.node ? cur : null;
}

// новая ветка: classifyDestructureLeafHost + buildDestructureLeafMeta; проверен канон:
// buildDestructuringInitMeta (только init-мета), destructure-host-shape.js (эмиссионная
// классификация хоста ДЕКЛАРАЦИИ), resolveNestedDestructureReceiver (одна ось) - ни один
// не классифицирует полный закрытый домен родителей ObjectPattern и не выдаёт единый
// дескриптор; эти двое СХЛОПЫВАЮТ два диспатч-свитча ног.
//
// the closed domain of an ObjectPattern leaf's HOST, enumerated element-wise: declarator
// and assignment inits, the direct param default (the fallback-receiver policy), the
// transparent inner default over a nested prop or an array wrapper, the bare nested prop,
// the array wrapper, the opaque hosts (for-x heads, rest, catch), and the IIFE param.
// both legs' dispatchers call this instead of wiring per-shape branches of their own - a
// shape divergence between the legs was exactly how the funnel lost polyfills on one side
// (a typed receiver's inner leaf). `host: 'none'` tells the dispatcher this path is NOT a
// destructure leaf at all - that gate belongs BEFORE any destructure resolver runs
export function classifyDestructureLeafHost({ objectPattern }) {
  const parent = objectPattern?.parentPath;
  const parentNode = parent?.node;
  if (!parentNode) return { host: 'none' };
  switch (parentNode.type) {
    case 'VariableDeclarator':
      // the RECEIVER through the canon, not the slot: a for-x head declarator holds no init, and what
      // it destructures is an element of the iterated literal. reading `.init` here left the head's
      // every flat claim typeless (`object: null`), which no receiver-shaped route can answer
      return {
        host: 'init',
        initNode: destructureReceiverNode(parent),
        scope: parent.scope ?? objectPattern.scope,
        path: parent,
      };
    case 'AssignmentExpression':
      return { host: 'init', initNode: parentNode.right, scope: parent.scope ?? objectPattern.scope, path: parent };
    case 'AssignmentPattern': {
      // the DIRECT param default routes the fallback-receiver policy; an INNER default is
      // transparent (`{ Array: { from } = {} } = X` - the `{}` never carries the receiver),
      // so the real host is the wrapper above the AssignmentPattern
      if (isFunctionParamDestructureParent(objectPattern) && !isInnerDestructureDefault(parent)) {
        return { host: 'param-default', pattern: parent };
      }
      const outer = parentNode.left === objectPattern.node ? parent.parentPath : null;
      if (outer?.node?.type === 'Property' || outer?.node?.type === 'ObjectProperty') {
        return { host: 'nested', outerProp: outer, objectPattern };
      }
      if (outer?.node?.type === 'ArrayPattern') return { host: 'array', objectPattern };
      return { host: 'opaque' };
    }
    case 'Property':
    case 'ObjectProperty':
      return { host: 'nested', outerProp: parent, objectPattern };
    case 'ArrayPattern':
      return { host: 'array', objectPattern };
    case 'ForOfStatement':
    case 'ForInStatement':
    case 'RestElement':
    case 'CatchClause':
      return { host: 'opaque' };
    default: {
      // IIFE destructuring (`!function({ entries }) {}(Object)`): the shared site finder
      // peels the wrapper chain AND enforces the callee-identity gate, so functions passed
      // as ARGS to another call never classify as IIFEs
      const site = findIifeCallSite(parent, objectPattern.node);
      if (site) return { host: 'iife', callPath: site.callPath, paramIndex: site.paramIndex };
      return { host: 'none' };
    }
  }
}

// the pair the per-branch mirror reads for a wrapped leaf, kept only while it SELECTS: the mirror
// swaps an arm in place and leaves the level whole, so a spread or a key nothing names standing
// beside the slot cannot mislead it - where every other consumer of the pair would drop that level
function selectingMirrorPair(objectPattern) {
  const pair = resolveFallbackReceiver(objectPattern.parentPath, objectPattern.node)?.rhsNode;
  const value = unwrapTransparentSeq(pair);
  return value?.type === 'ConditionalExpression' || value?.type === 'LogicalExpression' ? pair : null;
}

// no constructor NAMED for a nested / array-wrapped leaf: the leaf reads the paired VALUE, and that
// value answers through the flat canon - ONE meta for `{ at } = g` and `{ w: { at } } = { w: g }`
// (the guarded-alias route with its write enumeration, the reachable union, the string literal's
// own type) where a typeless carrier fabricated rows the flat spelling never made. an unpaired
// slot keeps the typeless carrier: the type engine reads those downstream
// the slot is read AS WRITTEN, prefix and all, the way the flat leaf hands its init over: the meta
// funnel owns the selection inside (`[{ from }] = [c ? Array : o]` flags its fallback exactly as
// `{ from } = c ? Array : o` does), and a walk that only answered a settled value left every
// selecting slot typeless - and the mirror unreachable - on both legs
function pairedBindingLeafMeta(objectPattern, { key, adapter, unionSink, resolveStaticKey }) {
  // the resolver climbs from a LEAF's parent, and the pattern is every leaf's parent: any of its
  // property paths is that leaf - a REAL path, since the key canon on the way asks the scope
  // through it (a bare `{ parentPath }` stand-in crashed babel's binding rebuild)
  const leaf = objectPattern ? cachedContainerPaths(objectPattern, 'properties')[0] : null;
  // ... and where that walk declines a level a consumer that DROPS it could not take (a later spread
  // or key), a SELECTING pair still names what the leaf may hold: its only consumer is the per-branch
  // mirror, which keeps the level whole. a settled value stays typeless there - the extraction routes
  // read a named meta as their pairing verdict, and the level is exactly what they would drop
  const paired = (leaf ? resolveNestedReceiverNode(leaf, { adapter, allowInitCarriedEffects: true }) : null)
    ?? (objectPattern ? selectingMirrorPair(objectPattern) : null);
  if (!paired) return { kind: 'property', object: null, key, placement: null };
  return buildDestructuringInitMeta({
    initNode: paired, key, scope: objectPattern.scope, adapter, path: objectPattern, unionSink, resolveStaticKey,
  });
}

// ONE meta rule over the classified host - the same answer on either leg. the canonical
// fallbacks live here once: an unresolvable receiver yields a TYPELESS meta (`object:
// null`, the instance dispatcher's degrade - dropping the leaf instead lost the polyfill
// on one leg), and a mutated static yields NO meta on every host shape (the receiver then
// routes through the identifier machinery, so the patch and the read share one object)
export function buildDestructureLeafMeta({
  descriptor, key, adapter, resolvePure = null, unionSink = null, resolveStaticKey = null,
}) {
  switch (descriptor.host) {
    case 'none':
      return null;
    case 'opaque':
      return key ? { kind: 'property', object: null, key, placement: null } : null;
    case 'init':
      if (!key) return null;
      return buildDestructuringInitMeta({
        initNode: descriptor.initNode, key, scope: descriptor.scope, adapter, path: descriptor.path, unionSink,
        resolveStaticKey,
      });
    case 'param-default': {
      if (!key) return null;
      const { pattern } = descriptor;
      // caller-arg wins over the default when it is a usable fallback receiver; a
      // non-receiver arg (notably `undefined`, where the runtime applies the default)
      // keeps the default. the winning call-arg evaluates AT THE CALL SITE - resolve it
      // against the call-site scope and path, or a param shadowing the arg's name would
      // swallow the receiver
      const site = resolveFallbackReceiver(pattern, pattern.node);
      const argNode = site?.callPath ? unwrapSafeSequenceTail(site.rhsNode) : null;
      const receiverNode = chooseFallbackReceiverNode({
        argNode,
        defaultNode: pattern.node.right,
        objectPattern: pattern.node.left,
        scope: pattern.scope,
        adapter,
        path: pattern,
        resolvePure,
        argScope: site?.callPath?.scope ?? pattern.scope,
        argPath: site?.callPath ?? pattern,
      });
      const argWins = argNode !== null && receiverNode === argNode;
      return buildDestructuringInitMeta({
        initNode: receiverNode,
        key,
        scope: argWins ? site.callPath.scope : pattern.scope,
        adapter,
        path: argWins ? site.callPath : pattern,
        unionSink,
      });
    }
    case 'nested': {
      const constructor = resolveNestedDestructureReceiver(descriptor.outerProp, adapter, unionSink);
      // a BRANCHING inner key rides a null-key carrier keeping the resolved receiver - the
      // union pairs the arm keys with it as statics
      if (!key) {
        return constructor !== null ? {
          kind: 'property', object: constructor, key: null, placement: 'static',
          receiverHint: staticReceiverHint('static', constructor),
        } : null;
      }
      if (constructor !== null && adapter.isMutatedStatic?.(constructor, key)) return null;
      // the receiver HINT rides along, the way the flat init meta carries it: without it a key the
      // resolved receiver does not have falls through to the placement-agnostic instance ladder and
      // the hop claims a dispatcher its flat twin never claims (`{ w: { at } } = { w: globalThis }`
      // answered `instance/at` where `{ at } = globalThis` answers nothing - and in usage-pure that
      // turns a binding the source leaves undefined into a function)
      return constructor !== null
        ? {
          kind: 'property', object: constructor, key, placement: 'static',
          receiverHint: staticReceiverHint('static', constructor),
        }
        : pairedBindingLeafMeta(descriptor.objectPattern, { key, adapter, unionSink, resolveStaticKey });
    }
    case 'array': {
      if (!key) return null;
      const constructor = resolveArrayWrapperedDestructureReceiver(descriptor.objectPattern, adapter, unionSink);
      if (constructor && adapter.isMutatedStatic?.(constructor, key)) return null;
      // the receiver HINT rides along here for the same reason it does in the nested arm above: a key
      // the resolved receiver does not have must not fall through to the instance ladder
      return constructor
        ? {
          kind: 'property', object: constructor, key, placement: 'static',
          receiverHint: staticReceiverHint('static', constructor),
        }
        : pairedBindingLeafMeta(descriptor.objectPattern, { key, adapter, unionSink, resolveStaticKey });
    }
    case 'iife': {
      if (!key) return null;
      const initNode = resolveCallArgument(descriptor.callPath.node.arguments ?? [], descriptor.paramIndex) ?? null;
      return buildDestructuringInitMeta({
        initNode, key, scope: descriptor.callPath.scope, adapter, path: descriptor.callPath, unionSink,
      });
    }
  }
  return null;
}
