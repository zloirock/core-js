// Nested-destructure flatten decisions, shared by both emitters: classify a declaration's
// property occurrences and array positions into a parser-agnostic plan. Array branches
// describe paired receiver reads and positional captures; the object branch describes
// proxy-global / bare-constructor / static-object receivers. Both bindings render the plan in their
// dialect - keys, sentinel names and import bindings are render concerns and stay out of it.
// plan node kinds:
//   - { kind: 'verbatim', prop }               keep the prop untouched (residual)
//   - { kind: 'consumed', prop, extractions }  drop the prop, bind extractions instead
//     (under a rest sibling the renderer keeps a `key: <throwaway>` sentinel so rest
//     exclusion survives)
//   - { kind: 'symbol-iterator-key', prop }    keep the prop, polyfilling only its computed
//     `[Symbol.iterator]` key text (non-binding value - the synth extraction can't fire,
//     but a raw `Symbol.iterator` key would throw on engines without `Symbol`)
//   - { kind: 'rebuilt', prop, pattern, extractions, children }
//     partially-consumed nested pattern: one child plan per inner prop, survivors re-render
// extraction records: { entry, hint, localName } resolved pure entries, or
// { synth: 'symbol-iterator', localName } for the `_getIteratorMethod(receiver)` shape.
// a 'rebuilt' node's `extractions` already aggregates its children's - consumers read
// extractions at the OUTER level only and use child lists for residual rendering
import {
  aliasEscaped,
  aliasSlotWritten,
  arrayLiteralIterableElements,
  arrayWrapperResidualDroppable,
  arrayWrapperResidualTrailingShed,
  arrayWrapperNeighbourEffect,
  discardedWrapperEffects,
  catchPropRewriteObservable,
  computedKeyHasSideEffects,
  createInstanceNodeCache,
  followConstIdentifierInit,
  followConstLiteralAlias,
  forOfHeadIterableElements,
  forEachPatternWriteMember,
  isChainAssignment,
  isDestructurePattern,
  isEffectfulKeyHop,
  identifierReferencedInSubtree,
  isPropertyNode,
  isMirrorablePatternValue,
  isRestProperty,
  isReassignedBeyondDeclarator,
  isReusableReceiver,
  leadingDiscardedEffectSlots,
  patternHasAnyDefault,
  patternHasRestReadBeforeNestedBinding,
  pairedArrayWrapInitElement,
  patternBindingCount,
  mayHaveSideEffects,
  noteRenderRetiredWrites,
  observableSequenceElements,
  objectInitSpreadSurvives,
  objectLevelPairedProperty,
  objectLiteralHoldsObservable,
  objectLiteralPrototypeValue,
  patternKeepsEffectfulHop,
  patternRootKeyPathsFor,
  patternSlotTarget,
  soleChainToProp,
  stmtRebindNames,
  peelNestedSequenceExpressions,
  peelTransparentExpr,
  peelZeroArgIifeReturn,
  peelToExpressionStatement,
  plainSynthKeyName,
  POSSIBLE_GLOBAL_OBJECTS,
  propBindingIdentifier,
  propertyKeyName,
  receiverCarriesLiveOptional,
  relocatedHeadElement,
  ownRelocatedHeadElement,
  resolveCallArgument,
  spelledSlotName,
  statementListOf,
  walkPatternIdentifiers,
  hostsExportList,
  hasRestSiblingExcept,
  seKeyKeepsReceiverRead,
  patternLevelKeepsEffectfulHop,
  unwrapCollectingSePrefixes,
  unwrapExpressionChain,
  unwrapRuntimeExpr,
  isUndefinedNode,
  invocationNode,
} from '../helpers/ast-patterns.js';
import {
  callExpression,
  chainExpression,
  cloneNode,
  identifier,
  memberFromKeyName,
  objectExpression,
  objectPattern,
  renderClaimProbe,
  renderProxyReceiverPlan,
  renderSynthEntryKey,
  renderSynthProperty,
  renderSynthSlotRead,
  renderSynthActivation,
  sequenceExpression,
} from '../render.js';
import { literalNodeValue, nodeRangeContains } from '../resolve-node-type/base.js';
import {
  classifyVariableDeclarationHost,
  deadDefaultElementPattern,
  isBodylessStatementSlot,
  planArrayWrapperCapture,
  planNestedLeafHost,
  planNestedKeyedPatternCapture,
  reusableArrayCaptureReceiver,
} from '../destructure-host-shape.js';
import { resolve as resolveBuiltIn } from '../index.js';
import {
  computedPropKeyHostsMachinery, harvestDiscardedReceiverSE, planMemoReadTarget, planProxyReceiver, shouldDropRescueReceiver,
} from './members.js';
import { SYMBOL_ITERATOR_PURE_RESULT } from './globals.js';
import {
  chainSealsAShortCircuit,
  computedKeyIsWellKnownSymbol,
  decidedRunningPart,
  directClaimProbeEffects,
  discardRescueNodes,
  computedKeyWellKnownSymbolName,
  consumableHopSlotName,
  globalProxyMemberName,
  guardedNavPassthroughPlan,
  proxyGlobalMemberCtorPure,
  decidedSelectionValue,
  guaranteedRealmObjectName,
  isStaticPlacement,
  navValueCanShortCircuit,
  peelReceiverSequenceTail,
  peelRealmLogicalDefault,
  realmSelectionCollapseOperand,
  realmSelectionLeafKind,
  proxyReceiverValueCanBeUndefined,
  resolveKey as sharedResolveKey,
  memberTargetTakesExtraction,
  resolveObjectName,
  resolveSynthKeys,
  callYieldedLiteral,
  realmLevelNamesCtor,
  yieldedSlotValue,
} from './resolve.js';
import {
  instanceHopDispatch,
  resolvePassthroughRef,
  staticHopPure,
  instanceSynthReceiverPure,
  isConstantLiteralReceiver,
  isReReferenceableReceiver,
  namedDefaultReceiver,
  nearestInnerDefaultDead,
  paramDefaultInstanceSynthAllowed,
  refineInstanceEntryByReceiver,
  resolveNestedDestructureReceiver,
  synthPropDedupKey,
  destructureAssignmentValueIsCaptured,
  planSideEffectKeyStrategy,
  planSynthReceiverGuard,
  nestedSlotMemoPlan,
  receiverPerformsEveryInitEffect,
  carriedInitReceiverNode,
  consumedAssignmentSlotDropsHost,
  consumedAssignmentSlotDropsNav,
  dispatchMayReadNav,
  resolveNestedNavDispatch,
  resolveNestedReceiverBase,
  typedNavClaimChain,
  resolveDestructureReceiverPlan,
  destructureHostThroughWrappers,
  STATIC_WALK_DEPTH,
  claimUnderSharedHopSlot,
  mirrorAcceptedKey,
  passthroughOutrunsEffect,
  buildDestructuringInitMeta,
  claimWriteOrderBound,
  destructureHostInitNode,
  destructurePropLeafMeta,
  firstPatternProp,
  isReReferenceableAcrossReads,
  isReReadableSurfaceNav,
  isBuiltInSurfaceNav,
  isInstanceSurfaceNav,
  residualInitRunsEffects,
  liftedInitElements,
  liftedRealmNavEffect,
  destructurePatternHostPath,
  destructureRightIsReceiver,
  discardRescueNodesWithReads,
  decidingFallbackLeft,
  observablePrefixElements,
  outerDestructureReceiver,
  fallbackInitWhollyDiscardable,
  importedStaticReadMeta,
  resolveBranchProxyName,
  resolveNestedReceiverNode,
  resolvePositionalElementSlot,
  slotReadsWhenBound,
  typedNavClaimShape,
  staticContainerReceiverName,
  walkStaticReceiverChain,
  decidedRunningOperand,
  decidedRunningValue,
  constructorRestIndex,
} from './destructure.js';

// A discarded proxy receiver owes its harvested effects, or null when its read must stay.
// Ask on the source initializer: a rewritten root no longer carries the navigation proof.
// An empty list is a successful drop, distinct from an unproved drop (null).
export function discardedReceiverEffects(init, ctx) {
  const node = unwrapRuntimeExpr(init);
  const { tail } = peelNestedSequenceExpressions(node);
  if (!shouldDropRescueReceiver(unwrapRuntimeExpr(tail), ctx)) return null;
  return harvestDiscardedReceiverSE(node, ctx);
}

// An extracted static/global import is always defined. Only an instance dispatch can
// return undefined and need a captured read plus the source default. Borrow the pattern,
// not its right child: a deferred binding must render later rewrites of that live slot.
export function liveDestructureDefault(value, kind) {
  return kind === 'instance' && value?.type === 'AssignmentPattern' ? value : null;
}

// A default or paired argument can carry an instance synth only as a whole receiver.
// Both bindings ask the same admission, slot identity and receiver-specific entry question;
// locating the live path and registering the replacement remain native. A paired slot minted
// by this pass already holds its ponyfill value and must not be mirrored again.
export function planDestructureInstanceSynth({
  path, receiverPath, pureResult, adapter, resolvePure, resolveNodeType, toHint, isOwnPassBinding = null,
}) {
  const receiver = receiverPath?.node;
  if (!receiver || !propBindingIdentifier(path.node.value) || (receiver.type === 'Identifier' && isOwnPassBinding?.(receiver.name))
    || !paramDefaultInstanceSynthAllowed({
      objectPatternNode: path.parentPath.node, receiverNode: receiver, scope: path.scope, adapter, path,
      resolvePure: meta => resolvePure(meta, path),
    })) return null;
  const key = synthPropDedupKey(path.node, { scope: path.scope, path, adapter });
  if (!key) return null;
  const { lookupKey } = resolveSynthKeys({ node: path.node, scope: path.scope, adapter, path });
  const pure = refineInstanceEntryByReceiver({
    pureResult, key: lookupKey, receiverPath, resolveNodeType, toHint, resolvePure, path,
  });
  return { key, entry: pure.entry, hintName: pure.hintName };
}

// The outer read that can feed a nested default's extraction. A static import is defined;
// an instance dispatch still needs the live default guard. Typeless receivers keep the generic
// dispatch, but an instance of a substituted constructor already reads its ponyfill prototype.
function nestedDefaultHopPure({ defaultPath, receiverPath, path }, {
  adapter, resolvePure, resolveNodeType, toHint, hasSubstitutedConstructor,
}) {
  const outerProp = defaultPath?.parentPath;
  const keyNode = isPropertyNode(outerProp?.node) && !outerProp.node.computed ? outerProp.node.key : null;
  const key = keyNode?.name ?? (typeof literalNodeValue(keyNode) === 'string' ? literalNodeValue(keyNode) : null);
  if (!receiverPath?.node || typeof key !== 'string') return null;
  const hopPattern = outerProp.parentPath;
  let owner = hopPattern?.parentPath;
  if (owner?.node?.type === 'AssignmentPattern' && owner.node.left === hopPattern.node) owner = owner.parentPath;
  function resolveStatic(ctorName) {
    return staticHopPure({ ctorName, key, resolvePure: meta => resolvePure(meta, path) });
  }
  if (isPropertyNode(owner?.node)) {
    const container = resolveNestedDestructureReceiver(owner, adapter);
    return container ? resolveStatic(container) : null;
  }
  const ctorName = resolveObjectName({ objectNode: receiverPath.node, scope: path.scope, adapter, path });
  if (ctorName && isStaticPlacement(ctorName)) {
    const pure = resolveStatic(ctorName);
    if (pure) return pure;
  }
  const type = resolveNodeType?.(receiverPath);
  const hint = type && toHint ? toHint(type) : null;
  if (!type?.primitive && type?.constructor && hasSubstitutedConstructor?.(type.constructor)) return null;
  const pure = resolvePure({ kind: 'property', object: hint ?? undefined, key, placement: 'prototype' }, hint ? path : null);
  return pure?.kind === 'instance' ? pure : null;
}

// Source shape, not ownership of the eventual rewrite: a typed navigation or an outer
// dispatch takes BOTH default arms. Mirroring only the fallback would leave the live read raw.
function nestedDefaultHasExtraction(options, ctx) {
  return (options.kind === 'instance' && typedNavClaimShape(options.path, { allowLeafSiblings: true, adapter: ctx.adapter }))
    || nestedDefaultHopPure(options, ctx);
}

// Whether the climb must stop at a default's own receiver. Pairing and named outer slots
// can prove that receiver dead. With no outer source receiver, keep the default route;
// Native host discovery is lazy: an empty or proven-dead default needs no outer walk.
export function destructureDefaultCarriesReceiver({ defaultPath, path, getReceiverPath, kind, slotStatic }, ctx) {
  if (!destructureRightIsReceiver(defaultPath.node.right) || slotStatic
    || nearestInnerDefaultDead(path.parentPath, ctx.adapter)) return false;
  if (isPropertyNode(defaultPath.parentPath?.node)
    && resolveNestedDestructureReceiver(defaultPath.parentPath, ctx.adapter, null, { innerDefault: false })) return false;
  const receiverPath = getReceiverPath(defaultPath);
  return !receiverPath?.node || !nestedDefaultHasExtraction({ defaultPath, receiverPath, path, kind }, ctx);
}

// After sibling normalization declined, the remaining mirror may serve a literal default.
// A captured assignment or sibling claims prevent the whole-hop fold; otherwise the same
// two-arm extraction question used by the climb owns it. Named defaults were settled there.
export function shouldMirrorNestedDestructureDefault({ path, receiverPath, kind }, ctx) {
  const patternPath = path.parentPath;
  const pattern = patternPath.node;
  const defaultPath = patternPath.parentPath;
  if (defaultPath?.node?.type !== 'AssignmentPattern' || defaultPath.node.left !== pattern
    || namedDefaultReceiver(defaultPath.node.right)) return false;
  return (kind === 'instance' && pattern.properties.length > 1 && hopPatternLeafClaims({
    pattern, resolvePure: ctx.resolvePure, keyCtx: { scope: path.scope, adapter: ctx.adapter, path },
  })) || destructureAssignmentValueIsCaptured(path)
    || !nestedDefaultHasExtraction({ defaultPath, receiverPath, path, kind }, ctx);
}

// The composed outer-read/leaf-dispatch product keeps the source DEFAULT SLOT, not its
// current right child. Deferred rendering must observe child rewrites made after this decision.
// Consuming the pattern also needs a sole plain binding: rest and effectful hops retain reads.
export function planNestedDefaultHop({ chain, kind, entry, path, receiverPath }, ctx) {
  const patternPath = path.parentPath;
  const defaultPath = patternPath?.parentPath;
  const defaultHost = chain.length && defaultPath?.node?.left === patternPath.node
    && entry !== 'get-iterator-method' && liveDestructureDefault(defaultPath.node, kind);
  const pure = defaultHost ? nestedDefaultHopPure({ defaultPath, receiverPath, path }, ctx) : null;
  return {
    pure,
    defaultHost: defaultHost || null,
    consumesPattern: !!pure && patternPath.node.properties.length === 1 && path.node.value.type === 'Identifier'
      && !hasRestSiblingExcept(patternPath.node.properties, null)
      && !patternLevelKeepsEffectfulHop(patternPath.node, { scope: path.scope, path, adapter: ctx.adapter }),
  };
}

// Choose the receiver of a nested assignment extraction, without importing or editing nodes.
// A pending host still has source children: it can capture them and anchor a kept surface,
// but must not save navigation across a root that will be replaced before drain. A rendered
// host instead reads its current navigation; its anchors/defaults have already had first refusal.
// These are source lifetimes, independent of parser dialect. The result owns the read policy;
// the binding only applies a capture or renders the selected root and keys at that lifetime.
export function planNestedAssignmentReceiver({ path, assignment, entry, chain = [], pending = false }, ctx) {
  const { adapter, isOwnAlias, resolvePure, resolveGlobalPolyfill, resolveStaticPolyfill, injectorState } = ctx;
  const prop = path.node;
  const resolveOptions = { allowSePeeledFragment: true, allowNavSegments: !pending };
  const copy = resolveNestedReceiverNode(path, { ...resolveOptions, adapter });
  const plain = pending && !isReReferenceableReceiver(copy) ? null : copy;
  const carried = !plain && consumedAssignmentSlotDropsHost(path) ? carriedInitReceiverNode({
    path,
    initNode: assignment.right,
    resolveOptions,
    adapter,
  }) : null;
  const node = plain ?? carried;
  const surfaceOptions = { allowOptionalHops: true, ctx, isOwnAlias };
  if (!pending) {
    if (seKeyKeepsReceiverRead({
      prop,
      ctx,
      receiver: assignment.right,
      nested: isPropertyNode(path.parentPath?.parentPath?.node),
      restSibling: hasRestSiblingExcept(path.parentPath.node.properties, prop),
    }) || (node && isBuiltInSurfaceNav(node, surfaceOptions) && !isInstanceSurfaceNav(node, surfaceOptions))) return null;
    // Positional destructuring pulls an iterator; spelling its index as a property is not equivalent.
    for (let hop = node; hop?.type === 'MemberExpression'; hop = hop.object) {
      if (hop.property?.type === 'Literal') return null;
    }
  }
  // A carried slot is read once because its host dies. Pending children are borrowed and
  // refreshed at drain; a copied bare token has no navigation whose root rewrite can be missed.
  const direct = node && { kind: 'receiver', node, keys: [], carriesInit: !!carried, refresh: pending && !!carried, rebind: pending };
  if (pending && direct) return direct;
  if (pending && !copy) {
    const singleRead = resolveNestedReceiverNode(path, { allowSeFreeSingleRead: true, allowSePeeledFragment: true, adapter });
    if (singleRead && !isReReferenceableAcrossReads(singleRead, ctx)) {
      const capture = planNestedKeyedPatternCapture({
        pattern: assignment.left,
        init: assignment.right,
        force: true,
        plansLeaf: true,
        prop,
        kind: 'instance',
        entry,
        ctx,
        ancestors: chain.toReversed().map(level => ({ pattern: level.outerPattern, prop: level.hopProp })),
      });
      if (capture) return { kind: 'capture', capture };
    }
  }
  const surface = pending && peelTransparentExpr(assignment.right)?.type === 'ObjectExpression'
    ? resolveNestedNavDispatch(path, { adapter, resolvePure }).dispatch : null;
  if (surface?.kind === 'surface' && surface.root && dispatchMayReadNav(path, surface.node,
    { isOwnAlias, adapter, allowOptionalHops: surface.allowOptionalHops })) {
    return { kind: 'receiver', node: surface.root, keys: surface.keys, rebind: true };
  }
  // Pending residual anchors can serve leaf siblings and built-in surfaces. A slot default
  // still belongs to their consume route. Once rendered, a static ponyfill is already defined.
  const typed = typedNavClaimChain(path, { adapter, allowAssignmentHost: true, allowLeafSiblings: pending, allowSurfaceBase: pending });
  const base = typed && resolveNestedReceiverBase({
    rootName: typed.root.name,
    keys: typed.keys,
    binding: adapter.getBinding({ scope: path.scope, name: typed.root.name, path, read: typed.root }),
    adapter,
    resolveGlobalPolyfill,
    resolveStaticPolyfill,
    read: pending ? { node: typed.root, path } : null,
  });
  if (base?.static && (!pending || !typed.slotDefault)) {
    return { kind: 'receiver', pure: base.pure, keys: [] };
  }
  const nav = typed && typed.keys.reduce(memberFromKeyName, typed.root);
  const surfaceRead = pending && base?.pure && !typed.slotDefault
    && !(entry === 'get-iterator-method' && prop.value?.type === 'AssignmentPattern')
    && dispatchMayReadNav(path, nav, { isOwnAlias, adapter });
  const ownedRead = base && !base.ctor && !typed.slotDefault && consumedAssignmentSlotDropsHost(path)
    && (!pending || !isBuiltInSurfaceNav(nav, { ctx, isOwnAlias }));
  if (surfaceRead || ownedRead) {
    return {
      kind: 'receiver',
      pure: base.pure,
      node: pending && typeof base.name === 'string' ? identifier(base.name) : typed.rootSpelling,
      keys: base.path,
      carriesInit: !!ownedRead,
    };
  }
  // Only a generated alias may be saved across pending root rewrites. A rendered nav may
  // also read a proven surface, or a surface whose residual the extraction consumes whole.
  const fallback = pending ? resolveNestedReceiverNode(path, { ...resolveOptions, allowNavSegments: true, adapter }) : node;
  if (fallback && (carried || (!pending && isReReferenceableReceiver(fallback))
    || isReReadableSurfaceNav(fallback, name => !!injectorState?.getBindingInfo?.(name),
      { ownAliasRoot: pending, allowOptionalHops: !pending, ctx })
    || (!pending && consumedAssignmentSlotDropsNav(path, isOwnAlias, ctx) && isInstanceSurfaceNav(fallback, surfaceOptions)))) {
    return pending ? { kind: 'receiver', node: fallback, keys: [], rebind: true } : direct;
  }
  return null;
}

// Classify reads before consuming their source properties. A detached guard, nested hop or
// effectful kept key needs the residual first; unrelated flat reads retain their own slot.
// In one declarator group, a nested receiver read orders the whole group after its residual.
// A deferred group keeps its pristine key proof (`seKey`); independent reads ask the live key.
// The returned lists borrow the caller's records and carry no rendered nodes or native edits.
export function partitionDestructureReads(reads, frameOf, { grouped = false } = {}) {
  const before = [];
  const after = [];
  let keyFirst = false;
  for (const read of reads) {
    const keyed = read.sentinel && (grouped && read.seKey !== undefined
      ? read.seKey : read.prop?.computed && computedKeyHasSideEffects(read.prop, frameOf(read)));
    const nested = read.chain?.length && (!grouped || read.readsReceiver);
    if (keyed || (grouped && nested)) keyFirst = true;
    (read.guardDetach === 'after' || (!grouped && nested) || keyed ? after : before).push(read);
  }
  return grouped && keyFirst ? { before: reads, after: [], keyFirst } : { before, after, keyFirst };
}

// Does this live residual have to run before the extraction group? A kept key or a capture
// written IN the residual is a prerequisite. An uncaptured initializer runs before binding
// writes. Re-anchored source slots keep their original order. `reads` are the still-pending
// read records; already composed native groups carry only their surviving capture obligation.
// `initRuns` may be a pristine proof retained across child rewrites; otherwise ask the live init.
export function destructureResidualFirst(reads, {
  init,
  scope,
  adapter,
  path,
  initRuns,
  captured = false,
  keyFirst = false,
  anchored = false,
  pattern = null,
  sourceProps = null,
} = {}) {
  return keyFirst || reads.some(read => read.captureInResidual)
    || (!captured && (initRuns ?? residualInitRunsEffects({ init, scope, adapter, path })))
    || (anchored && residualPrecedesExtractions(pattern,
      reads.map(read => read.source ?? read.chain?.at(-1)?.hopProp ?? read.prop), sourceProps));
}

// Order the live residual and its extractions. Anchored residuals are independent source
// slots and join the extractions in source order, as does a full consume. A kept key or
// residual-owned capture still precedes its lookup; synthetic slots follow known source slots.
// Records keep their native payload; source/sourceProps describe only their original slot.
export function orderDestructureParts(partition, residuals, {
  sourceProps = null, captured = false, initRuns = false,
} = {}) {
  const { before, after, keyFirst } = partition;
  const reads = [...before, ...after];
  const anchored = !residuals.length || residuals.every(part => part.anchored);
  if (residuals.length && destructureResidualFirst(reads, { keyFirst, captured, initRuns: !anchored && initRuns })) {
    return [...residuals, ...reads];
  }
  if (anchored) {
    const positions = new Map(sourceProps?.map((prop, index) => [prop, index]));
    function at(part) {
      if (part.sourceProps) return Math.min(...part.sourceProps.map(prop => positions.get(prop) ?? Infinity));
      return positions.get(part.source ?? part.chain?.at(-1)?.hopProp ?? part.prop) ?? Infinity;
    }
    return [...reads, ...residuals].sort((left, right) => at(left) - at(right));
  }
  return [...before, ...residuals, ...after];
}

// A name can be read by several destructure claims only where intervening getters
// cannot rebind it. A realm selection must yield the same namespace on every live arm.
// This does not release an acquired navigation: its source capture has a separate owner.
function canRepeatDestructureReceiver(node, ctx) {
  if (node?.type === 'Identifier' || node?.type === 'ThisExpression') return isReReferenceableAcrossReads(node, ctx);
  return !!(ctx && realmSelectionCollapseOperand(node, ctx));
}

// A whole-init capture whose residual has died may release its sequence prefix and let
// every remaining extraction read the stable tail. Only this completed capture can also
// release a pristine built-in navigation; a newly acquired receiver keeps its native memo.
// Return the borrowed tail, leaving prefix relocation and reference replacement to the binding.
export function releasedDestructureCaptureTail(init, ctx) {
  if (init?.type !== 'SequenceExpression') return null;
  const tail = init.expressions.at(-1);
  return canRepeatDestructureReceiver(tail, ctx)
    || isReReadableSurfaceNav(tail, name => !!ctx?.injectorState?.getBindingInfo?.(name), { ctx }) ? tail : null;
}

// A live assignment residual and every extraction share one receiver evaluation. A lifted
// prefix leaves the tail to these readers. Stable names/this, a proven realm selection, or
// literal overwrites which keep their own native read require no shared capture. This query
// runs after consumption and never allocates the ref the binding may need for its answer.
export function assignmentNeedsReceiverMemo(assignment, reads, ctx = null) {
  if (reads.every(read => !read.readsReceiver)) return false;
  const whole = peelTransparentExpr(assignment.right);
  const right = reads.some(read => read.seqPrefix?.length) ? peelNestedSequenceExpressions(whole).tail : whole;
  const [{ metaPath }] = reads;
  if (canRepeatDestructureReceiver(right, { ...ctx, scope: metaPath?.scope, path: metaPath })) return false;
  if (reads.every(read => read.keepSentinelBinding) && isConstantLiteralReceiver(right)) return false;
  const residualSurvives = assignment.left?.type !== 'ObjectPattern' || assignment.left.properties.length !== 0;
  return reads.length + (residualSurvives ? 1 : 0) > 1;
}

// What a fully consumed initializer leaves at its original evaluation position. Both bindings
// use this order: the running operand, observable reads, an accepted source probe, a dropped
// navigation, then the remaining live value. A probe already owns its read and carried writes;
// only its captured residual effects remain. No generated guard is re-analyzed here.
// `replay` retains a source value (whole or trimmed), including stores that need the binding's
// normal relocation treatment. Harvested nodes keep their existing ownership instead. Nodes
// are borrowed, never mutated; bindings clone/move them and choose their native insertion slot.
// A deferred caller can retain a source-proven whole read. Its live spelling may now be a
// generated guard; analyzing that guard again would discard the read the source still owes.
// Conversely, a source-proven dropped receiver stays dropped after its root is rewritten;
// only its live effects survive. Re-proving that drop from a minted alias invents a read.
export function planDiscardedInit(init, ctx, probe = null, sourceFacts = null) {
  if (init && sourceFacts?.readWhole && !probe) return { effects: [unwrapRuntimeExpr(init)], replay: true };
  if (init && sourceFacts?.dropReceiver && !probe) {
    return { effects: harvestDiscardedReceiverSE(unwrapRuntimeExpr(init), ctx), replay: false, dropReceiver: true };
  }
  const node = unwrapRuntimeExpr(decidedRunningPart(init, ctx));
  if (!node) return { effects: [], replay: false };
  if (!mayHaveSideEffects(node)) {
    return { effects: discardRescueNodesWithReads({ node, ...ctx }), replay: false };
  }
  if (probe) {
    return { effects: directClaimProbeEffects(probe, probe.effects).filter(effect => effect !== probe.node), replay: false };
  }
  const discarded = discardedReceiverEffects(node, ctx);
  if (discarded?.length === 0) return { effects: [], replay: false, dropReceiver: true };
  const realmNav = liftedRealmNavEffect(node, ctx);
  if (realmNav) return { effects: realmNav.effects, replay: false, ...discarded ? { dropReceiver: true } : {} };
  // A getter read owns every effect buried in it; lifting the harvest as well would run them twice.
  if (discardRescueNodesWithReads({ node, ...ctx })[0] === node) return { effects: [node], replay: true };
  if (discarded) return { effects: discarded, replay: false, dropReceiver: true };
  const effects = liftedInitElements(node, ctx);
  // An unchanged sequence keeps its own source span and comments, not just its children.
  const keptWhole = node.type === 'SequenceExpression' && effects.length === node.expressions.length
    && effects.every((effect, index) => effect === node.expressions[index]);
  return { effects: keptWhole ? [node] : effects, replay: true };
}

// A consumed loop initializer cannot lift statements out of its header. A decided
// fallback/probe may leave no sink; a dropped navigation keeps its effects alone.
// Otherwise the sink reads the shared memo target, retaining the source plan when
// child rewrites have already replaced its root. Null effects mean a value sink.
export function planForInitSink(init, ctx, { probe = null, dropReceiver = false, memo = null } = {}) {
  if (probe || decidingFallbackLeft(peelNestedSequenceExpressions(init).tail, ctx)) {
    return planDiscardedInit(init, ctx, probe);
  }
  const effects = dropReceiver ? discardRescueNodesWithReads({ node: init, ...ctx }) : discardedReceiverEffects(init, ctx);
  if (effects?.length) return { effects, replay: false };
  return { effects: null, memo: memo ?? planMemoReadTarget(init, { aliasCtx: ctx, resolvePure: ctx.resolvePure }) };
}

// collapse a fallback init (logical / ternary / chain-assignment / transparent IIFE) to the
// operand the flatten binds to, exactly like the flat meta - see the call site's contract
// comments. `fallbackDropped` reports a REACHABLE branch was discarded: the fallback rescues
// the nullish path there, so the full-consume throw probe stays off
function collapseFallbackInit({ init, scope, adapter, path, resolveGlobalPolyfill }) {
  let fallbackDropped = false;
  if (init?.type === 'LogicalExpression' || init?.type === 'ConditionalExpression'
    || isChainAssignment(init)
    || ((init?.type === 'CallExpression' || init?.type === 'OptionalCallExpression') && peelZeroArgIifeReturn(
      init,
      { staticIsMutated: adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic },
    ))) {
    if (!fallbackInitWhollyDiscardable(init, true, { scope, adapter, path })) init = null;
    else for (let guard = 0; guard < 8 && init; guard++) {
      // a selection the build decides is the operand it always yields: the rest never runs
      const live = decidedSelectionValue(init, { scope, adapter, path });
      const inlined = live === init && peelZeroArgIifeReturn(
        init,
        { staticIsMutated: adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic },
      );
      if (live !== init) init = unwrapExpressionChain(live);
      else if (inlined) init = unwrapExpressionChain(inlined);
      // a chain assignment evaluates to its RHS; the harvest rescues it WHOLE
      else if (isChainAssignment(init)) init = unwrapExpressionChain(init.right);
      // a ternary collapses to its consequent ONLY when the alternate agrees on a global proxy
      // (the shared predicate the identification resolver uses); a diverging alternate means
      // the runtime may pick a receiver the polyfill is wrong for, so bail and stay native
      else if (init.type === 'ConditionalExpression') {
        // ... and agrees on DEFINABILITY too. naming the same proxy is not the same claim: an arm
        // the environment may not have is the PROBE, and in a ternary the TEST picks the arm, so
        // keeping one moves WHEN the value is undefined. only arms of the same kind may collapse -
        // both guaranteed, or both probes (`c ? globalThis.window : globalThis.window` still throws
        // on a full consume, which is why the probe question stays with the collapsed operand and
        // no `fallbackDropped` is reported here)
        const { alternate, consequent } = init;
        const kindCtx = { scope, adapter, path };
        init = resolveBranchProxyName({ branchNode: consequent, scope, adapter, path })
          && resolveBranchProxyName({ branchNode: alternate, scope, adapter, path })
          && realmSelectionLeafKind(consequent, kindCtx) === realmSelectionLeafKind(alternate, kindCtx)
          ? unwrapExpressionChain(consequent) : null;
      } else if (init.type === 'LogicalExpression') {
        const collapsed = collapseLogicalInitOperand({ init, scope, adapter, path, resolveGlobalPolyfill });
        fallbackDropped ||= collapsed.dropped;
        init = collapsed.value;
      } else break;
    }
  }
  return { init, fallbackDropped };
}

// one step of the fallback-init collapse over a `||` / `??`: those select their RIGHT operand
// exactly when the left value is nullish / falsy - and a short-circuit hidden under a SEAL
// never hands nullish on (the read above the seal THROWS instead), so a sealed-read left keeps
// its fallback DEAD and collapses like a plain init. a genuinely nullish-able left makes the
// fallback reachable: the flatten may bind the polyfill to the left only when the fallback
// agrees on the same receiver (`nav ?? Array`); a diverging fallback (`nav ?? {}`) keeps the
// source native - its legitimate value must not become the polyfill. `&&` never reaches this
// arm: `fallbackInitWhollyDiscardable` refuses it. `dropped` reports a REACHABLE fallback was
// discarded - the probe question stays off there, the fallback rescues the nullish path
function collapseLogicalInitOperand({ init, scope, adapter, path, resolveGlobalPolyfill }) {
  const left = unwrapExpressionChain(init.left);
  const aliasCtx = { scope, adapter, path };
  if (!proxyReceiverValueCanBeUndefined(left, ({ name }) => resolveGlobalPolyfill(name), aliasCtx)
    || chainSealsAShortCircuit(left, ({ name }) => resolveGlobalPolyfill(name), aliasCtx)) {
    return { value: left, dropped: false };
  }
  // ... and a probed left is still no reason to keep the selection when EVERY value it can yield is
  // the REALM: the probe reads undefined off-host and the fallback behind it is that same object, so
  // the collapse binds a receiver no branch disagrees with and the whole selection drops. the shared
  // answer, which the unplugin's own mirror gate asks in the same spelling
  const realmOperand = realmSelectionCollapseOperand(init, { adapter, scope, path });
  if (realmOperand) return { value: realmOperand, dropped: true };
  const leftName = resolveObjectName({ objectNode: left, scope, adapter, path });
  return {
    value: leftName && leftName === resolveObjectName({
      objectNode: unwrapExpressionChain(init.right), scope, adapter, path,
    }) ? left : null,
    dropped: true,
  };
}

// an SE-bearing init joins the ANCHORED family only when every effect rides a channel the
// anchored renders re-emit: a sequence prefix (collected into `anchorSe` - the residual
// render replays it, the full-consume path lifts it standalone, and the assignment-cascade
// hosts null it in favor of their OWN standalone prefix lift) or a chain-assignment
// rescued WHOLE by the discard harvest. deeper effects (a ternary branch, an IIFE body)
// keep the nested handling - folding those would change the receiver shape the SE-lift
// machinery expects
function anchoredSeAccounting(declarator, peeledInit, ctx) {
  const prefixes = [];
  const seTail = unwrapCollectingSePrefixes(peeledInit, prefixes);
  // ... and a prefix READ only a getter answers is observable too, though `mayHaveSideEffects` calls it pure
  if (!mayHaveSideEffects(declarator.init) && !observablePrefixElements(prefixes, ctx).length) {
    return { accounted: true, anchorSe: null };
  }
  const accounted = !mayHaveSideEffects(seTail, ctx) || isChainAssignment(seTail);
  return { accounted, anchorSe: accounted && prefixes.length ? prefixes : null };
}

// does the literal this leaf reads THROUGH outlive the pairing? the walk that pairs the level owns
// the answer, and a slot over a surviving literal stays NAMED: it leaves a sentinel instead of
// dropping, so the husk keeps the key the residual still reads and every effect the literal owes
// `adapter` lets the pairing walk fold a BOUND or effectful hop key the way the plan's own walk does
function destructureHostLiteralSurvives(leafPath, adapter = null) {
  const host = destructurePatternHostPath(leafPath);
  // a DECLARATION host only: an assignment keeps its literal as a statement of its own
  // (`({ v: (se(), arr) });` - the pattern goes, the read stays), which is its own channel
  const pattern = host?.node?.type === 'VariableDeclarator' ? host.node.id : null;
  const init = destructureHostInitNode(leafPath);
  // asked of an OBJECT init only: an array wrapper answers the same flag for its own spread, and the
  // routes that own that shape already read it off the plan - re-deciding it here would move them
  return !!pattern && init?.type === 'ObjectExpression'
    && peelArrayWrapperPair({ pattern, init, scope: leafPath.scope, adapter, path: leafPath, liftTrailing: true }).wrapperSurvives;
}

// A kept key owns rest exclusion or a key effect. A surviving literal also owns its
// source slot unless the instance dispatch can carry every initializer effect itself.
export function destructureReadKeepsKey(path, kind, ctx) {
  if (hasRestSiblingExcept(path.parentPath.node.properties, null)
    || patternLevelKeepsEffectfulHop(path.parentPath.node, ctx) || computedKeyHasSideEffects(path.node, ctx)) return true;
  return destructureHostLiteralSurvives(path, ctx.adapter)
    && !(kind === 'instance' && carriedInitReceiverNode({ path, initNode: destructureHostInitNode(path), adapter: ctx.adapter }));
}

// Peel a single-element array pattern or sole nested object hop with its paired literal value.
// Return the remaining pattern/init and the prefixes, levels and residual obligations consumed
// so far. With scope/adapter, follow fixed aliases in their declaration context.
// Inner defaults unwrap; a receiver default paired with explicit undefined becomes the source.
// `liftTrailing` permits inline array neighbours with effects: harvest replayable effects in
// `trailingEffects`, or keep the wrapper when a spread must still iterate. The same lift lets the
// peel step through a CALL yielding a literal - one no crossed sequence prefix precedes, which would
// lift through another channel and run after it; the calls it steps through return in `steppedCalls`.
// eslint-disable-next-line max-statements -- the peel: one arm per wrapper shape a level may take
export function peelArrayWrapperPair({ pattern, init, scope = null, adapter = null, path = null, liftTrailing = false }) {
  // the capture the levels consumed so far anchor at - the host use first, then the innermost
  // followed alias declarator (the detect side's `descendArrayWrapperInit` threads the same hop)
  let readNode = null;
  // sequence prefixes peeled off CONSUMED wrapper levels, source order. the flatten discards
  // those levels, so their effects must surface to the caller's lift - silently peeling them
  // lost the outer effect on the unplugin (`(outer(), [(inner(), R)])` kept only `inner`)
  // while babel's own descent lost the inner one: both sides re-emit from THIS list.
  // a bail level's prefixes are NOT committed - the returned `init` keeps them in place.
  // `firstArray` / `lastArray` bracket the consumed ArrayExpression chain (null when no level
  // was consumed): babel re-anchors `init` at the first and swaps the leaf element
  // of the last, so its re-visit guard needs no descent of its own
  const peeledPrefixes = [];
  // committed consumed levels, outermost first: `wrapper` is the level's raw init (its text /
  // AST includes the sequence prefixes lifted from that level), `array` the effective
  // ArrayExpression after the unwrap. residual renders strip each INLINE level's wrapper down
  // to its array - a kept `(mid(), [R])` would re-run the lifted effect (double-exec)
  const consumedLevels = [];
  // SE-bearing elements the pattern does not bind, per consumed INLINE level (outermost first).
  // native evaluates them AFTER the paired element and everything below it, so a full consume
  // re-emits them innermost level first, behind the element's own effects; a partial consume
  // keeps the level's array, where they still stand
  const trailingByLevel = [];
  // a SPREAD extra iterates its argument, which no statement re-emits: the level is still consumed
  // (the pattern below it plans), but its array has to SURVIVE the render - a sentinel keeps the
  // consumed slot and the residual runs the iteration where the source did
  let wrapperSurvives = false;
  // ... and whether a REST beside a hop is what keeps it: the render then EMPTIES the consumed hop and
  // binds the hop itself to a sentinel (`{ w: _unused, ...rest }`), the flat rest shape one level down,
  // where a spread's survivor keeps the leaf sentinel inside the hop
  let restKeepsLevel = false;
  let firstArray = null;
  let lastArray = null;
  // STICKY across levels: once a level dereferenced a const-bound alias, every DEEPER level
  // also lives in the alias's own init (outside the destructure host), so the trailing-extra
  // rule below never applies to them either
  let dereferenced = false;
  // the CALLS the peel stepped through, source order: each is a value the flatten discards with the
  // consumed level, and the plan replays it ahead of the extractions so it still runs where it stood
  const steppedCalls = [];
  // the parameters of the call the peel stepped into, each holding the argument the call passes: a
  // slot naming one reads that argument, at the call site (`callScope`), where the peel goes on
  let paramArgs = null;
  let callScope = null;
  // the context a HOP KEY folds in: the pattern never leaves the host, so its keys read in the
  // host's scope however deep the INIT side has followed an alias out of it (the follow rebinds
  // `scope` below to the alias declaration's - a shadowing `k` there must not answer for the
  // pattern's own)
  const hopKeyCtx = adapter ? { scope, adapter, path } : null;
  // the peel's answer at whatever level the walk stopped: the pattern and init it reached plus
  // everything the consumed levels committed
  function done(peeledPattern, peeledInit) {
    return {
      pattern: peeledPattern,
      init: peeledInit,
      initScope: scope,
      peeledPrefixes,
      firstArray,
      lastArray,
      consumedLevels,
      trailingEffects: trailingByLevel.toReversed().flat(),
      wrapperSurvives,
      restKeepsLevel,
      steppedCalls,
    };
  }
  // the value a consumed level hands the next one: the slot's own node, or - where that node names a
  // parameter of the call the peel stepped into - the argument the call passes, read at the call site.
  // a slot reading a parameter the call proves nothing for (`yieldedSlotValue`) keeps its level whole
  function slotValue(child) {
    const read = yieldedSlotValue(paramArgs, child);
    if (read === child) return child;
    scope = callScope;
    paramArgs = null;
    return read;
  }
  for (;;) {
    if (pattern?.type === 'ObjectPattern' && pattern.properties.some(isRestProperty)) return done(pattern, init);
    // strip AssignmentPattern wrapper on the destructure side - init has no AssignmentPattern
    // equivalent (defaults sit on the LHS slot), so we only peel pattern here. EXCEPTION: a
    // receiver-shaped inner default whose paired slot is literally `undefined` fires the default, so
    // ITS right is the receiver (`[{ from } = Array] = [undefined]` -> from off Array) - surface it
    // (the identification's resolveArrayInnerDefaultReceiver agrees, so both emitters stay consistent)
    if (pattern?.type === 'AssignmentPattern') {
      if (isUndefinedNode(init) && destructureRightIsReceiver(pattern.right)) return done(pattern.left, pattern.right);
      pattern = pattern.left;
      continue;
    }
    // a level is a single-slot wrapper on both sides: an array's SOLE element, or an object's SOLE
    // property naming a slot whose value is one more pattern (`{ w: { Map } } = { w: globalThis }`
    // pairs exactly as `[{ Map }] = [globalThis]` does). a wider level is the plan's own shape and
    // stops the peel, and so does a leaf value - the flat routes own that. the slot is asked through
    // the CONSUMING canon, so a bound computed key (`{ [k]: { Map } }`) names its level like a literal.
    // a REST beside the hop (`{ w: { Map }, ...rest }`) pairs the same slot and keeps the level ALIVE
    // exactly as a spread in the literal does: rest gathers what the pattern did not name, so the
    // consumed hop stays as a sentinel keeping its key excluded, and the residual runs where it stood
    const hopCandidates = pattern?.type === 'ObjectPattern' ? pattern.properties.filter(prop => !isRestProperty(prop)) : [];
    // ... and a hop whose KEY carries an effect keeps its level exactly like a rest beside it
    const hopRest = hopCandidates.length === 1 && (pattern.properties.length === 2 || isEffectfulKeyHop(hopCandidates[0], hopKeyCtx));
    const hopProp = hopCandidates.length === 1 && (pattern.properties.length === 1 || hopRest)
      && isDestructurePattern(patternSlotTarget(hopCandidates[0].value))
      && consumableHopSlotName(hopCandidates[0], hopKeyCtx) !== null ? hopCandidates[0] : null;
    if (!hopProp && (pattern?.type !== 'ArrayPattern' || pattern.elements.length !== 1)) {
      return done(pattern, init);
    }
    // peel SE-tail / paren / TS wrappers first (`(se(), [Array])` descends into the tail's
    // array); the crossed sequence prefixes are collected and committed only when this level's
    // wrapper is actually consumed, so a bail below leaves the original init (effects in place)
    const levelPrefixes = [];
    let effectiveInit = unwrapCollectingSePrefixes(init, levelPrefixes);
    // dereference const-bound Identifier (`= wrapper` where `const wrapper = [Array]`).
    // flow-sensitive bail mirrors the object-wrapper static-receiver walk: only a reassignment
    // that reaches the use aborts (a `wrapper = []` strictly AFTER the read leaves the read's
    // value provably `[Array]`), instead of bailing on every constantViolation
    // ... to a fixpoint: a call may return an alias, an alias may hold a call
    for (let step = 0; step < STATIC_WALK_DEPTH; step++) {
      if (!scope || !adapter) break;
      // the detect side's own alias follow, so the plan consumes exactly the levels detection
      // classified: the pattern-gated init, each hop re-anchored in the followed binding's own
      // declaration scope, and the read site carried from the capture the level above recorded (a
      // write to the inner alias after that capture cannot change what the outer literal holds).
      // this plan feeds the pure flatten, so the inject-if-might relaxation never applies. the
      // followed value is EFFECTIVE - the alias's own paren / cast / sequence spelling evaluates at
      // ITS declaration, so only the value flows here
      const followed = followConstIdentifierInit({
        node: effectiveInit, readNode, ctx: { scope, adapter, path, resolveKey: sharedResolveKey },
      });
      // a dereferenced alias is only as good as its SLOTS: a container this file writes into, or
      // lets escape, may no longer hold what its literal spelled, and the level below binds a
      // polyfill to that literal. asked of the OBJECT level alone: its key names the slot, so the
      // question has an answer, while an array level's slot is positional and the census - keyed by
      // NAME, per file - would bail every common wrapper name a file also uses elsewhere
      if (followed.node !== effectiveInit && hopProp) {
        // Peeling the outer level also forgets the owner of nested slots. Check known paths
        // against the declaration the alias follow reached; opaque inner keys keep the outer check.
        const keys = patternRootKeyPathsFor(pattern, null, hopKeyCtx) ?? [[spelledSlotName(hopProp)]];
        const ownerNode = followed.readNode?.type === 'VariableDeclarator' ? followed.readNode : null;
        if (aliasEscaped(effectiveInit, adapter, path)
          || keys.some(key => aliasSlotWritten(effectiveInit, key, adapter, { scope, path, ownerNode }))) return done(pattern, init);
      }
      if (followed.node !== effectiveInit) dereferenced = true;
      effectiveInit = followed.node;
      ({ readNode } = followed);
      scope = followed.ctx.scope;
      // a CALL in the slot yields the value the callee built (the same step the detect side's
      // descent takes): the peel goes on inside that value, in the callee's scope, dereferenced
      // exactly like an alias - the callee keeps the literal, only the value flows here. the call
      // itself is a value the consumed level discards, so only a host that LIFTS such effects
      // (`liftTrailing`) may step through it; any other keeps the level whole. so does a call that
      // runs AFTER a prefix the peel already crossed (`(log(), f())`, or one an outer level spelled):
      // the prefixes lift through their own channel and the call through the discard replay, which
      // the renders emit first - stepping would run the call ahead of the effect it follows
      if (!liftTrailing || peeledPrefixes.length || levelPrefixes.length
        || !invocationNode(effectiveInit)) break;
      const yielded = callYieldedLiteral({ node: effectiveInit, readNode, seen: new Set(), ctx: { scope, adapter, path } });
      if (!yielded) return done(pattern, init);
      steppedCalls.push(effectiveInit);
      ({ paramArgs } = yielded);
      callScope = scope;
      readNode = effectiveInit;
      effectiveInit = yielded.literal;
      scope = yielded.scope;
      dereferenced = true;
    }
    if (hopProp) {
      // the object level harvests nothing of its own - what keeps it whole is `objectHopPairedValue`'s
      // to decide - so it commits an empty trailing list and rides the same level bookkeeping
      // the hop key through the CONSUMING canon: a bound computed key folds to the slot it names
      // (`{ [k]: { Map } }` with `const k = 'w'`), the way the other leg's consume already read it
      const paired = objectHopPairedValue(effectiveInit, consumableHopSlotName(hopProp, hopKeyCtx), dereferenced,
        adapter ? { scope, adapter, path } : null);
      if (!paired || (paired.read && !yieldedSlotValue(paramArgs, paired.read))) return done(pattern, init);
      if (paired.survives || hopRest) wrapperSurvives = true;
      if (hopRest) restKeepsLevel = true;
      // an OBJECT hop level holds its child at the property its key names, not at an element: the
      // `array` contract below belongs to the ARRAY levels, and a renderer re-linking this one by
      // position wrote `.elements` on an object literal and threw on perfectly ordinary source
      consumedLevels.push({ wrapper: init, array: effectiveInit, hopSlot: paired.match });
      trailingByLevel.push([]);
      pattern = patternSlotTarget(hopProp.value);
      init = slotValue(paired.read);
      continue;
    }
    if (effectiveInit?.type !== 'ArrayExpression') return done(pattern, init);
    const [innerPattern] = pattern.elements;
    const [innerInit] = effectiveInit.elements;
    if (!innerPattern || !innerInit || !yieldedSlotValue(paramArgs, innerInit)) return done(pattern, init);
    // an INLINE trailing init element is evaluated-then-discarded by the destructure at
    // runtime; its effect would vanish with the consumed wrapper level, so an SE-bearing extra
    // bails the consume - the init stays whole and every effect runs verbatim - unless the
    // caller lifts, where it is harvested for the host to re-emit. a SPREAD extra iterates,
    // which no statement re-emits: a lifting host keeps that level's ARRAY alive instead
    // (`wrapperSurvives`), with nothing harvested off it, and any other host bails. a pure
    // extra stays peelable - dropping a value-dead pure element is silent. a DEREFERENCED
    // wrapper is exempt: the alias's own declaration keeps the whole array (only the VALUE
    // flows here), so its effects were never at risk - and bailing mid-follow desynced the
    // peel from the detect pass
    const extras = dereferenced ? [] : effectiveInit.elements.slice(1).filter(Boolean);
    const spread = extras.some(el => el.type === 'SpreadElement');
    if (!liftTrailing && (spread || extras.some(mayHaveSideEffects))) return done(pattern, init);
    if (spread) wrapperSurvives = true;
    peeledPrefixes.push(...levelPrefixes);
    consumedLevels.push({ wrapper: init, array: effectiveInit });
    trailingByLevel.push(spread ? [] : extras.filter(mayHaveSideEffects));
    firstArray ??= effectiveInit;
    lastArray = effectiveInit;
    pattern = innerPattern;
    init = slotValue(innerInit);
  }
}

// the value an object level's sole pattern property pairs with, or null when the level has to stay
// whole: a SPREAD anywhere in the literal (it could override the key, and its read of the source's
// own enumerable keys is an effect of its own), an unnameable key standing after the match that could
// BE it at runtime (last wins), an accessor or method whose read runs a body the consumed level
// would drop, a sibling effect with no re-emit channel here, and a value whose live `?.` belongs to
// the probe channel. a DEREFERENCED level skips the sibling rule: the alias's own declaration keeps
// the literal, so its siblings were never at risk
function objectHopPairedValue(objectNode, key, dereferenced, keyCtx) {
  // the key fold's scope is the literal's own: every "does this slot run?" question below asks it
  // ... a key standing after the match is dangerous only where NOTHING can name it: the same
  // scope-aware fold the hop's own key rides (`{ [K]: v }` with `const K = 'q'` names `q`), so a
  // bound key that provably spells another slot leaves the match standing
  const paired = objectLevelPairedProperty(objectNode, key, prop => consumableHopSlotName(prop, keyCtx));
  if (!paired) return null;
  const { match, read } = paired;
  // ... a `?.` that cannot short-circuit is dead text (`globalThis?.globalThis` - the object is a
  // guaranteed realm name): the value canon that every seal-aware channel asks answers here too, so
  // the level pairs with the nav the way the walk already resolves it for a static claim
  if (receiverCarriesLiveOptional(read) && (!keyCtx || navValueCanShortCircuit(
    unwrapRuntimeExpr(read), ({ name }) => resolveBuiltIn({ kind: 'global', name }), keyCtx))) return null;
  // ... and a value the level SELECTS between arms is not one value to pair with: which arm answers
  // is the selecting-receiver channel's question, asked where the source wrote the branch
  // ... EXCEPT the defensive realm default, where nothing selects: a guaranteed realm name is an
  // object, so the right side is dead text and the level pairs with the name (`(globalThis ?? {})`
  // names the realm, exactly as the flat spelling of the same receiver does)
  // ... at every depth of the default (`(globalThis ?? {}) ?? {}`), the way the walk canon reads it -
  // the discarding peel, since the level pairs with the name in place of the slot
  const realmPeeled = read.type === 'LogicalExpression' ? peelRealmLogicalDefault(read, { discarding: true }) : null;
  const realmNamed = realmPeeled?.type === 'Identifier' && guaranteedRealmObjectName(realmPeeled.name)
    ? realmPeeled : null;
  if (!realmNamed && (read.type === 'ConditionalExpression' || read.type === 'LogicalExpression')) return null;
  if (dereferenced) return { match, read };
  // a sibling's effect and a SPREAD's read of its source's own keys have no re-emit channel here -
  // the array level's harvest rides `peeledPrefixes` / `trailingEffects`, which the renders read off
  // the innermost consumed ARRAY - so a level holding either PAIRS AND SURVIVES, the way a
  // spread-bearing array wrapper does: the claim is still spelled from the slot its key names, and
  // the literal stays with its sentinels so every effect runs where the source wrote it
  // ... and a SEQUENCE around a value the dispatch COLLAPSES owes its prefix: a realm name is
  // re-spelled as its ponyfill (`_globalThis`), never as the comma run in front of it, so the
  // literal keeps that prefix. every other value rides INSIDE the dispatch, prefix and all
  // (`_at((log.push('c'), arr))`), which is the carry the corpus locks - asked through the wrappers
  // a source may spell (one parser keeps parens as nodes), but never through the sequence itself
  // ... read through the canon peel, so a NESTED run (`(f(), (g(), globalThis))`) and a realm default
  // on the tail (`(f(), globalThis ?? {})`) owe their prefix exactly like the flat spelling - read by
  // the outer level alone, the tail was no name, the level consumed, and the prefix vanished
  const { prefix: readPrefix, tail: readTailRaw } = peelNestedSequenceExpressions(unwrapRuntimeExpr(read));
  const readTail = readPrefix.length ? peelRealmLogicalDefault(unwrapRuntimeExpr(readTailRaw), { discarding: true }) : null;
  const seqPrefixOwed = !!readTail && readPrefix.some(expression => mayHaveSideEffects(expression, keyCtx))
    && readTail.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(readTail.name);
  return {
    match, read: realmNamed ?? read, survives: seqPrefixOwed || objectLiteralHoldsObservable(objectNode, match, keyCtx),
  };
}

// does this pattern LEAF carry a claim of ITS OWN - a member read whose own route renders it off the
// same ponyfill - so a consume around it would read that member raw off the pattern instead? ONE
// answer for both bindings, parameterized by the receiver the leaf reads through: a WELL-KNOWN-SYMBOL
// key carries a render of its own whatever it folds to, a key nothing folds stays unknowable (which
// counts as a claim), and a folded one is asked of the registry. `foldsComputedKey` is the caller's
// promise that the render KEEPS the key node where the source wrote it - the ctor-pattern re-anchor
// does, so its effect still runs once in place; a caller that cannot keep it treats a computed key as
// unknowable instead
export function leafCarriesOwnClaim({ leaf, receiver, resolvePure, keyCtx, foldsComputedKey = false }) {
  if (!isPropertyNode(leaf)) return true;
  if (leaf.computed && !foldsComputedKey) return true;
  if (computedKeyIsWellKnownSymbol({ keyNode: leaf.key, ...keyCtx })) return true;
  const key = leaf.computed
    ? sharedResolveKey({ node: leaf.key, computed: true, ...keyCtx, bailOnSideEffectKey: false, keepsKeyNode: true })
    : plainSynthKeyName(leaf.key);
  if (key === null) return true;
  const { object, placement } = receiver;
  return !!resolvePure({ kind: 'property', object, key, placement },
    placement === 'prototype' ? null : keyCtx.path);
}

// does a hop's pattern (its default's target included) hold a leaf with a claim of its own - by key
// name, the question a leg walking its own output again asks of the pattern once the hop is extracted
// (`const { name } = _at(arr)`)? neither leg extracts such a hop: the other leg would bind that leaf
// raw off the result, and the funnel keeps the leaf native under an instance hop anyway
export function hopPatternLeafClaims({ pattern, resolvePure, keyCtx }) {
  return pattern?.type === 'ObjectPattern' && pattern.properties.some(leaf => !isRestProperty(leaf) && leafCarriesOwnClaim({
    leaf, receiver: { object: undefined, placement: 'prototype' }, resolvePure, keyCtx,
  }));
}

// ... and the flat twin's own limit: does the leaf pattern hold, beside the claim, a hop whose pattern
// has leaves the claim funnel claims (`{ name, company: { name: companyName } }`)? both legs leave such a
// level nested and its claims native: twinned, the hop's own claims would be served only where a leg can
// memoize the hop eagerly, which unplugin cannot on a loop head or an unbraced `var`. asked of the funnel,
// not of key names: a leaf it keeps native (under an instance hop, `{ at, flat: { name } }`) claims
// nothing, and the twin still serves `at`
export function leafPatternHoldsClaimedHop({ leafPattern, claimProp, scope, adapter, resolvePure }) {
  return leafPattern.get('properties').some(item => {
    if (!isPropertyNode(item.node) || item.node === claimProp) return false;
    const slot = item.get('value');
    const hopPattern = slot.node?.type === 'AssignmentPattern' ? slot.get('left') : slot;
    return hopPattern.node?.type === 'ObjectPattern' && hopPattern.get('properties').some(leaf => {
      const { meta } = isPropertyNode(leaf.node) ? destructurePropLeafMeta({
        prop: leaf.node, objectPattern: hopPattern, scope, path: hopPattern, adapter, resolvePure,
      }) : {};
      return !!meta && !!resolvePure(meta, hopPattern);
    });
  });
}

// does outerProp spell a computed key naming the real `Symbol.iterator`? asked of the key's scoped fold
// with its provenance (`computedKeyWellKnownSymbolName`), the answer the claim's own key takes, so an
// alias, a bracket spelling or a TS assertion around the key names the symbol its dotted spelling does
// and a shadowed `Symbol` names none. an effect-bearing key is no such key here: it runs in place, on
// its claim's own route. true for both extractable shape (`[Symbol.iterator]: ident`) and
// non-extractable shape (`[Symbol.iterator]: {nestedPattern}` / spread / etc.) - the plan kind decides
function isSymbolIteratorComputedKey(outerProp, ctx) {
  return isPropertyNode(outerProp) && outerProp.computed && !computedKeyHasSideEffects(outerProp, ctx)
    && computedKeyWellKnownSymbolName({ keyNode: outerProp.key, ...ctx }) === 'iterator';
}

// narrowed to extractable shape: value must be a BARE binding Identifier. a defaulted
// value (`[Symbol.iterator]: it = fb`) is NOT extractable here - unlike a static polyfill
// import, the synth helper's result can be undefined (a non-iterable receiver), so the
// default is live; peeling it would drop it entirely. defaults keep the key-swap
// (see `planSymbolIteratorProp`). returns the local binding name when extractable
function symbolIteratorLocalName(outerProp, ctx) {
  if (!isSymbolIteratorComputedKey(outerProp, ctx)) return null;
  return outerProp.value?.type === 'Identifier' ? outerProp.value.name : null;
}

// A member write of the iterator result joins the same ordered extraction as a named
// binding. Defaults and effectful keys retain their raw-read slot; computed targets require a sole chain,
// so moving the write cannot overtake another key or receiver read.
export function symbolIteratorMemberTarget(prop, entry, { ctx = null, ...options } = {}) {
  return entry === 'get-iterator-method' && prop.value?.type !== 'AssignmentPattern' && !computedKeyHasSideEffects(prop, ctx)
    ? memberTargetTakesExtraction(prop.value, { ...options, prop }) : null;
}

// pattern-valued `[Symbol.iterator]` prop - the shape both emitters extract by destructuring
// the get-iterator-method RESULT. the plan's predicate, and every trigger asking whether the plan
// consumes such a prop
export function isSymbolIteratorPatternProp(propNode, ctx) {
  return !!propNode && propNode.value?.type === 'ObjectPattern' && isSymbolIteratorComputedKey(propNode, ctx);
}

// ... and the same shape asked of a CLAIM, the one question every claim route of both emitters asks:
// the claim resolved to the iterator helper (its key folded to the real symbol) and its value is a
// pattern. the fold already saw through an alias, a bracket spelling or a TS assertion around the
// key, so the spelling is never asked again; an effect-bearing key is one too, read behind its effect
export function isSymbolIteratorPatternClaim(propNode, entry) {
  return entry === SYMBOL_ITERATOR_PURE_RESULT.entry && propNode?.value?.type === 'ObjectPattern';
}

function hasExtractions(planNode) {
  return !!planNode.extractions?.length;
}

// resolve a destructure property to its polyfillable STATIC entry off `receiverName`, or null when it
// is NOT a consumable static: a computed / non-Identifier-value / rest / default-only key, an
// instance-kind member, an unresolved key, or a disabled leaf. shared by the flatten plan (which builds
// extractions from the entry) and the babel collapse gate (which needs only the yes/no to know whether a
// surviving sibling will be EXTRACTED - emptying the pattern and dropping a SE init's receiver tail).
// the bare `resolveBuiltIn` instance pre-filter is required: a pathless `resolvePure` crashes on
// `enhanceMeta`'s member-like check for instance resolutions
export function resolvePolyfillableStaticProp({
  prop, receiverName, resolvePure, isDisabled = null, keyName = null,
}) {
  if (isDisabled?.(prop)) return null;
  // caller may pre-resolve a scope-aware key (an Identifier computed key `[K]` folds to its binding
  // value); structural propertyKeyName only reads literals, so without it an `[K]` residual reads an
  // unimported static off the pure ctor (undefined at runtime)
  const name = keyName ?? (isPropertyNode(prop) ? propertyKeyName(prop) : null);
  if (name === null) return null;
  const valueNode = propBindingIdentifier(prop.value);
  // ... and a MEMBER target is a slot like any binding; every gate below still answers for it, which
  // is what keeps a PROTOTYPE member (`Set.union`) out of the slot
  const targetNode = valueNode ? null : memberTargetTakesExtraction(prop.value);
  if (!valueNode && !targetNode) return null;
  const meta = { kind: 'property', object: receiverName, key: name, placement: 'static' };
  if (resolveBuiltIn(meta)?.kind === 'instance') return null;
  const pure = resolvePure(meta);
  if (!pure || pure.kind === 'instance') return null;
  return { pure, localName: valueNode?.name ?? null, targetNode };
}

// the extracted value IS the iterator method - a FUNCTION - so a leaf pulled out of it is an
// INSTANCE member of that function. only the plan can say so: the extracted pattern's properties
// are claimed (the re-visit must not re-enter the destructure pipeline on them), and that claim
// equally silences the member dispatch that would otherwise resolve the leaf. a shorthand leaf is
// not a member read either, so nothing downstream asks the question.
// ONE leaf only, and that bound is load-bearing rather than incidental: each polyfilled leaf needs
// the receiver again, and the receiver here is the synth CALL - re-running it would re-read the
// source's `Symbol.iterator` a second time (a getter would fire twice). two leaves therefore need
// a memo contract, which stays out of this plan
export function symbolIteratorInstanceLeaf({ value, resolvePure, isDisabled, keyNameOf }) {
  const inner = patternSlotTarget(value);
  if (inner?.type !== 'ObjectPattern' || inner.properties.length !== 1) return null;
  const [leaf] = inner.properties;
  if (!isPropertyNode(leaf) || leaf.computed || isDisabled?.(leaf)) return null;
  // a DEFAULTED leaf stays on the destructure: the dispatcher result would have to be guarded
  // (`(ref = _m(x)) === void 0 ? <default> : ref`), which is the instance-default channel's shape,
  // and binding it directly here would drop the user's default outright
  if (leaf.value?.type === 'AssignmentPattern') return null;
  const key = keyNameOf(leaf);
  const bound = key === null ? null : propBindingIdentifier(leaf.value);
  if (!bound) return null;
  const pure = resolvePure({ kind: 'property', object: 'function', key, placement: 'prototype' });
  return pure?.kind === 'instance'
    ? { localName: bound.name, instanceEntry: pure.entry, instanceHint: pure.hintName } : null;
}

// the KEY a full-consume throw probe re-reads off the guarded PROBED value: native
// destructuring of the probe value throws BEFORE any key read (CoerceToObject), so a read of
// the source's own first key off the guard reproduces the TypeError ahead of the extractions.
// the anchored hop IS that first key; a flat plan reads its first prop's recorded scoped key
// name - which KIND the prop planned as ('consumed' extraction, 'anchored' re-homed residual)
// is a render concern, not a probe one, and a plan that keeps a residual never asks. returns
// `{ name }` for a nameable key, `{ symbolIterator: true }` for a computed `[Symbol.iterator]`
// first key (the probe reads through the polyfilled symbol binding), or null (no probe)
export function probedNavProbeKey(plan) {
  if (!plan?.probedNav) return null;
  if (plan.anchor) return { name: plan.anchor };
  const first = plan.outerProps?.[0];
  if (!first || (first.kind !== 'consumed' && first.kind !== 'anchored')) return null;
  if (first.keyName) return { name: first.keyName };
  return first.extractions?.[0]?.synth === 'symbol-iterator' ? { symbolIterator: true } : null;
}

// Plan cache for the static declaration/assignment cascade. Its synthetic host must
// keep the first plan, including the discardSe adjustment made before rendering.
// Array plans apply immediately; declined hosts may change before the next claim.
const planCache = createInstanceNodeCache();

// A binding that rewrites a host's pattern in place - a nested leaf's flat twin, a hop split, a keyed
// capture - retires the plan cached for the pattern it replaced; the next claim plans the host as it
// now stands. A plan's own render keeps its entry: the host's later claims read what it rendered.
export function forgetDestructurePlan(adapter, declarator) {
  planCache.delete(adapter, declarator);
}

// does a pattern HOP name a ctor the targets may lack - one the pure flavor ships as its own entry
// (`Map`, `Iterator`, `AggregateError`)? a sentinel or a raw residual read under such a hop reads the
// native ctor off the realm, which is what the stripped realm lacks; the anchor asks the same question
export function hopNamesMissingAbleCtor(hopProp, resolveGlobalPolyfill) {
  const name = propertyKeyName(hopProp);
  return !!name && !POSSIBLE_GLOBAL_OBJECTS.has(name) && !!resolveGlobalPolyfill(name);
}

// does the host's LEVEL survive a consume, keeping every consumed leaf as a sentinel? an init whose
// object literal spreads (the spread reads the source's own keys), an array wrapper the pairing walk
// keeps (`peeled: false` asks it here; a caller that already peeled passes its own verdict), or a
// pattern HOP whose key carries an effect (the key has to run once where it stands). one answer for
// the plan and for the render that re-asks it
export function hostLevelSurvives(declarator, { peeled = true, ctx = null } = {}) {
  return objectInitSpreadSurvives(declarator.init) || patternKeepsEffectfulHop(declarator.id, ctx)
    || (peeled && peelArrayWrapperPair({
      pattern: declarator.id,
      init: declarator.init,
      liftTrailing: true,
      scope: ctx?.scope,
      adapter: ctx?.adapter,
      path: ctx?.path,
    }).wrapperSurvives);
}

// A positional extraction reads the element captured by native iteration. Its outer
// levels split around the selected hop; only rest keeps the claimed key as an exclusion.
// Host placement admits statement, bodyless and for-init declarations, and statement
// assignments. Exports retain source names while capture bindings stay private.
function positionalDestructurePlan({ prop, pattern, slot, keys, levels = [], host = null, collectExports = true }) {
  const targetNode = propBindingIdentifier(prop.value);
  if (!targetNode) return null;
  let placement = null;
  if (host?.assignment) {
    if (!statementListOf(host.statement?.parentPath?.node)) return null;
    placement = { assignment: true };
  } else if (host) {
    // A namespace hop names a method, but only an instance surface can supply its receiver. Its hop
    // names answer alone: an identifier element roots the nav here only as a realm capture the caller proved.
    const slotIndex = host.slot.parentPath?.node?.elements?.indexOf(host.slot.node) ?? -1;
    const init = unwrapRuntimeExpr(host.declarator?.node?.init);
    const paired = slotIndex >= 0 && init?.type === 'ArrayExpression'
      ? pairedArrayWrapInitElement(init.elements, slotIndex) : null;
    const nav = paired && keys.length ? keys.reduce(memberFromKeyName, unwrapRuntimeExpr(paired)) : null;
    const navOptions = { allowOptionalHops: true };
    if (nav && isBuiltInSurfaceNav(nav, navOptions) && !isInstanceSurfaceNav(nav, navOptions)) return null;
    const declaration = host.declarator?.parentPath;
    if (declaration?.node?.type !== 'VariableDeclaration') return null;
    placement = classifyVariableDeclarationHost({ declaration: declaration.node, declarationParent: declaration.parentPath?.node });
    const anchor = placement.isExport ? declaration.parentPath : declaration;
    if (!placement.isForInit && !placement.isBodyless && !statementListOf(anchor.parentPath?.node)) return null;
    const exportedSiblings = [];
    if (placement.isExport && collectExports) for (const item of declaration.node.declarations) walkPatternIdentifiers(item.id, id => {
      if (id.name !== targetNode.name) exportedSiblings.push(id.name);
    });
    placement.exportedSiblings = exportedSiblings;
  }
  const residual = pattern.properties.filter(item => item !== prop);
  const keepsClaimKey = residual.some(isRestProperty);
  const residualBinds = patternBindingCount({ type: 'ObjectPattern', properties: residual }) > 0;
  const outer = levels.slice(0, -1);
  const outerBinds = outer.some(level => level.before.length || level.after.length);
  return {
    pattern,
    outerProps: [{ kind: 'consumed', prop, extractions: [{ targetNode, localName: targetNode.name }] }],
    positional: {
      placement,
      slot,
      keys,
      outer,
      residual,
      keepsClaimKey,
      residualBinds,
      memoizeHop: !!keys.length && (residualBinds || outerBinds),
    },
  };
}

// Can this planned property render off its captured element? Its own extraction does; a declined
// plain binding stays a native fragment there, re-detected as the flat twin.
function readsOffCapturedElement(child) {
  return child?.kind === 'consumed' || (child?.kind === 'verbatim' && !!propBindingIdentifier(child.prop.value));
}

// The array plan renders a declaration host's reads as declarators in the declarator's place when
// the declaration binds other names too, or stands where no statement list can take statements of
// their own (a loop head, an unbraced slot). `host` is the declaration or the export around it.
function rendersInDeclaration(declaration, host) {
  return declaration.node.declarations.length !== 1 || !statementListOf(host.parentPath?.node);
}

// One array property occurrence owns one independent instance/iterator read. Receiver
// sharing belongs to the host; this record retains the target and its live default.
// Static leaves keep their native slots. Instance slots beside rest and already
// claimed leaves remain native. Other owners decline.
function arrayReadingPropPlan(propPath, {
  adapter,
  resolvePure,
  isDisabledProp,
  isClaimedProp,
  receiver = null,
  defaults = true,
  rest = false,
  capturedRoot = false,
  capturedKey = false,
  singleRead = false,
}) {
  const prop = propPath.node;
  const ctx = { scope: propPath.scope, adapter, path: propPath };
  if (isRestProperty(prop)) return rest ? { kind: 'verbatim', prop } : null;
  if (!isPropertyNode(prop)) return null;
  const targetNode = prop && propBindingIdentifier(prop.value);
  if (!targetNode) {
    // Sibling hops are planned independently in source order. A shared leaf or an
    // effectful key uses the native keyed capture, retaining each leaf's decision.
    const leaf = receiver && !rest && prop.value?.type === 'ObjectPattern' && firstPatternProp(propPath.get('value'));
    const walk = leaf && (capturedRoot || soleChainToProp(prop.value, leaf.node)) && typedNavClaimShape(leaf, {
      adapter,
      rootMemoized: capturedRoot,
      allowLeafSiblings: capturedRoot,
      allowAssignmentHost: capturedRoot,
      allowSurfaceBase: capturedRoot,
      allowInlineSpread: capturedRoot,
    });
    const pairedRoot = capturedRoot ? peelNestedSequenceExpressions(unwrapRuntimeExpr(receiver)).tail
      : unwrapRuntimeExpr(receiver);
    if (!walk?.wrapper || walk.slotDefault || walk.root !== pairedRoot) return { kind: 'verbatim', prop };
    // a consumed prop leaves with only its leaf level's reads: a hop level between them with siblings
    // would lose those siblings' bindings
    const hopLevels = walk.climbed.slice(1, walk.climbed.findIndex(level => level.prop === prop) + 1);
    if (hopLevels.some(level => level.pattern.properties.length !== 1)) return { kind: 'verbatim', prop };
    const effectful = walk.climbed.some(level => level.prop && computedKeyHasSideEffects(level.prop, ctx));
    const sharedLeaf = capturedRoot && leaf.parentPath.node.properties.length > 1;
    const keyedCapture = (effectful || sharedLeaf) && capturedRoot
      && planNestedKeyedPatternCapture({ pattern: objectPattern([prop]), init: receiver, force: true, plansLeaf: true, ctx });
    if ((effectful || sharedLeaf) && (!keyedCapture || keyedCapture.leafPattern !== leaf.parentPath.node)) {
      return { kind: 'verbatim', prop };
    }
    const binding = walk.root.type === 'Identifier' && adapter.getBinding({
      scope: propPath.scope,
      name: walk.root.name,
      path: propPath,
      read: walk.root,
    });
    if (!capturedRoot && binding && isReassignedBeyondDeclarator(binding)) return { kind: 'verbatim', prop };
    const nestedReceiver = resolveNestedReceiverNode(leaf, { allowNavSegments: true, allowSeFreeSingleRead: singleRead, adapter })
      ?? (capturedRoot && walk.keys.reduce(memberFromKeyName, walk.root));
    if (!nestedReceiver) return { kind: 'verbatim', prop };
    const children = (keyedCapture ? leaf.parentPath.get('properties') : [leaf]).map(item => arrayReadingPropPlan(item, {
      adapter,
      resolvePure,
      isDisabledProp,
      isClaimedProp,
      receiver: nestedReceiver,
      defaults: capturedRoot,
      capturedRoot,
    }));
    const extractions = children.flatMap(child => child?.extractions ?? []);
    // A leaf kept native for its effectful key is still served: the capture moves it onto the
    // captured value, where the flat keyed-read route takes it in source order.
    const keyedLeafServed = !!keyedCapture
      && children.some(child => child?.kind === 'verbatim' && computedKeyHasSideEffects(child.prop, ctx));
    if ((!extractions.length && !keyedLeafServed)
      || children.some(child => !child || child.kind === 'unhandled')) return { kind: 'verbatim', prop };
    return {
      kind: 'consumed',
      prop,
      nested: true,
      nestedKeys: walk.keys,
      extractions,
      keyedCapture,
      children: keyedCapture ? children : null,
    };
  }
  const iterator = isSymbolIteratorComputedKey(prop, ctx);
  const nativeKey = prop.computed && (!iterator || prop.value.type !== 'Identifier') && !capturedKey;
  const { meta } = destructurePropLeafMeta({
    prop,
    objectPattern: propPath.parentPath,
    scope: propPath.scope,
    path: propPath.get('key'),
    adapter,
    resolvePure,
  });
  // A neighbouring claim can revisit a residual containing a generated sentinel.
  if (isClaimedProp?.(propPath, meta)) return { kind: 'verbatim', prop };
  const pure = meta && !isDisabledProp?.(prop) ? iterator ? SYMBOL_ITERATOR_PURE_RESULT : resolvePure(meta, propPath) : null;
  if (!pure || pure.kind !== 'instance') return { kind: 'verbatim', prop };
  // A constructor guard and a computed static sibling need their per-property capture.
  // Moving them onto an anonymous element first hides the source needed by that route.
  if (meta.guardedAliasHint) return { kind: 'unhandled', prop };
  if (nativeKey) return { kind: 'verbatim', prop };
  if (prop.computed && !iterator && !capturedKey) return { kind: 'verbatim', prop };
  if (capturedKey && !computedKeyHasSideEffects(prop, ctx)) return { kind: 'verbatim', prop };
  if (rest) return { kind: 'verbatim', prop };
  if (!defaults && prop.value.type !== 'Identifier') return { kind: 'verbatim', prop };
  return {
    kind: 'consumed',
    prop,
    sentinel: capturedKey,
    extractions: [{
      kind: 'instance',
      entry: pure.entry,
      hint: pure.hintName,
      targetNode,
      localName: targetNode.name,
      receiver,
      prop,
      defaultNode: prop.value.type === 'AssignmentPattern' ? prop.value.right : null,
    }],
  };
}

// A positional host's init and the array level its plan collects: the host pattern itself, or the
// one a keyed chain above it reaches through its nested hops and their defaults. The capture keeps
// those levels as written; the slot climb decides which of them may stand above a renamed position.
// A claim beside a hop belongs to its own route: capturing it native would preempt that route for
// whichever claim asks first, so such a chain declines, whoever asks.
function positionalArrayRoot(path, { adapter, resolvePure }) {
  const assignment = path.node.type === 'AssignmentExpression';
  // a value the build decides is the operand of it that runs (`decidedRunningOperand`)
  const init = decidedRunningOperand(assignment ? path.node.right : path.node.init, { scope: path.scope, adapter, path });
  if (!init || (!assignment && path.parentPath?.node?.type !== 'VariableDeclaration')) return null;
  function claims(leaf) {
    const { meta } = destructurePropLeafMeta({
      prop: leaf.node,
      objectPattern: leaf.parentPath,
      scope: leaf.scope,
      path: leaf.get('key'),
      adapter,
      resolvePure,
    });
    return !!meta && !!resolvePure(meta, leaf);
  }
  const keyed = new Set();
  let level = path.get(assignment ? 'left' : 'id');
  if (level.node.type === 'ObjectPattern') {
    const chain = planNestedKeyedPatternCapture({ pattern: level.node, init, allowArray: true, ctx: { scope: path.scope, adapter, path } });
    if (chain?.leafPattern?.type !== 'ArrayPattern') return null;
    for (const { pattern, prop, defaultValue } of chain.ancestors) {
      keyed.add(pattern);
      const siblings = level.get('properties').filter(item => item.node !== prop);
      if (siblings.some(item => {
        if (!isPropertyNode(item.node)) return false;
        if (!isDestructurePattern(patternSlotTarget(item.node.value))) return claims(item);
        const value = item.get('value');
        return !!firstPatternProp(value.node.type === 'AssignmentPattern' ? value.get('left') : value, claims);
      })) return null;
      level = level.get('properties')[pattern.properties.indexOf(prop)].get('value');
      if (defaultValue) {
        keyed.add(defaultValue);
        level = level.get('left');
      }
    }
  }
  return { init, level, keyed };
}

// A closed keyed literal can serve a first-yield instance claim without moving the later
// iterator step before that binding. Iterator.map owns abrupt closing around the claimed read;
// the native patterns bind the first step and continue the same helper for the tail.
function interleavedIteratorClaimPlan({ assignment, position, arrayRoot, element, propPath, pattern, init, path, leafPlans }) {
  if (assignment || position.length !== 1 || position[0] !== 0
    || arrayRoot.node.elements.length !== 2 || arrayRoot.node.elements[0] !== element.node
    || arrayRoot.node.elements[1]?.type !== 'Identifier'
    || element.node.properties.length !== 1 || element.node.properties[0] !== propPath.node
    || propPath.node.computed || propPath.node.value?.type !== 'Identifier') return null;
  const sourceObject = unwrapRuntimeExpr(init);
  const [patternHop] = pattern.type === 'ObjectPattern' ? pattern.properties : [];
  const [sourceHop] = sourceObject?.type === 'ObjectExpression' ? sourceObject.properties : [];
  const sourceKey = isPropertyNode(sourceHop) && !sourceHop.computed ? propertyKeyName(sourceHop) : null;
  const patternKey = isPropertyNode(patternHop) && !patternHop.computed ? propertyKeyName(patternHop) : null;
  const declaration = path.parentPath;
  const placement = declaration?.node?.type === 'VariableDeclaration' && classifyVariableDeclarationHost({
    declaration: declaration.node,
    declarationParent: declaration.parentPath?.node,
  });
  const child = leafPlans.get(propPath.node);
  const extraction = child?.kind === 'consumed' && child.extractions.length === 1
    && child.extractions[0].kind === 'instance' ? child.extractions[0] : null;
  const receiver = isPropertyNode(sourceHop) ? unwrapRuntimeExpr(sourceHop.value) : null;
  if (!placement || placement.isExport || placement.isForInit || placement.isBodyless || placement.isMultiDecl
    || pattern.type !== 'ObjectPattern' || pattern.properties.length !== 1
    || !isPropertyNode(patternHop) || patternHop.value !== arrayRoot.node
    || sourceObject?.type !== 'ObjectExpression' || sourceObject.properties.length !== 1
    || objectLiteralPrototypeValue(sourceObject) || sourceKey === null || sourceKey !== patternKey
    || receiver?.type !== 'Identifier' || !extraction) return null;
  return {
    pattern,
    extractions: [extraction],
    array: {
      interleavedIterator: {
        receiver,
        extraction,
        claimPattern: element.node,
        tailPattern: arrayRoot.node,
        tail: arrayRoot.node.elements[1],
        claimIndex: position[0],
      },
      exportFrom: null,
    },
  };
}

// Decide positional siblings on the original host, from the last slot backwards.
// A planned capture releases earlier slots without mutating or requeueing the tree.
// The selected slots then render in source order through the same native capture.
function positionalArrayDestructurePlan({ path, adapter, resolvePure, isDisabledProp, isClaimedProp }) {
  const assignment = path.node.type === 'AssignmentExpression';
  const pattern = assignment ? path.node.left : path.node.id;
  const { init, level: arrayRoot, keyed } = positionalArrayRoot(path, { adapter, resolvePure }) ?? {};
  if (!arrayRoot) return null;
  const slots = [];
  const capturedSlots = new Set();
  const lastReadingSlots = new Map();
  function collectSlots(level, position = [], parents = []) {
    const levels = [level.node, ...parents];
    let last = -1;
    for (const [index, element] of level.get('elements').entries()) {
      if (element.node?.type === 'ArrayPattern') collectSlots(element, [...position, index], levels);
      else if (element.node) {
        const defaultValue = element.node.type === 'AssignmentPattern'
          && element.node.left.type === 'ObjectPattern' ? element.node.right : null;
        slots.push({ element: defaultValue ? element.get('left') : element, defaultValue, position: [...position, index], levels });
      }
      if (slotReadsWhenBound(element.node, capturedSlots, lastReadingSlots)) last = index;
    }
    lastReadingSlots.set(level.node, last);
  }
  // A native neighbour can use the same capture as a claim. Releasing its read
  // permits earlier claims; the final slice leaves every earlier native slot in place.
  function releaseSlot({ element, levels }) {
    capturedSlots.add(element.node);
    for (const level of levels) {
      let last = lastReadingSlots.get(level);
      while (last >= 0 && !slotReadsWhenBound(level.elements[last], capturedSlots, lastReadingSlots)) last--;
      lastReadingSlots.set(level, last);
    }
  }
  collectSlots(arrayRoot);
  const leafPlans = new Map();
  let placement = null;
  let statement = null;
  for (let index = slots.length - 1; index >= 0; index--) {
    const { element, position, defaultValue } = slots[index];
    if (element.node.type !== 'ObjectPattern') continue;
    const receiver = outerDestructureReceiver(element, path.scope, adapter) ?? init;
    const propPath = firstPatternProp(element, candidate => {
      const planned = arrayReadingPropPlan(candidate, {
        adapter,
        resolvePure,
        isDisabledProp,
        isClaimedProp,
        receiver,
        defaults: false,
      });
      leafPlans.set(candidate.node, planned);
      return planned?.kind === 'consumed';
    });
    if (!propPath) {
      if (element.get('properties').some(child => leafPlans.get(child.node)?.kind === 'unhandled')) continue;
      slots[index].planned = { kind: 'verbatim', node: element.node, defaultValue, index: position[0], path: position };
      releaseSlot(slots[index]);
      continue;
    }
    const interleaved = interleavedIteratorClaimPlan({
      assignment, position, arrayRoot, element, propPath, pattern, init, path, leafPlans,
    });
    if (interleaved || resolveNestedReceiverNode(propPath, { adapter })) return interleaved;
    const surface = resolveNestedReceiverNode(propPath, { allowSePeeledFragment: true, allowNavSegments: true, adapter });
    const positional = resolvePositionalElementSlot(propPath, adapter, { lastReadingSlots });
    if (!positional || positional.slot.node !== element.node) continue;
    const paired = !keyed.size && position.length === 1 && unwrapRuntimeExpr(init)?.type === 'ArrayExpression'
      ? pairedArrayWrapInitElement(unwrapRuntimeExpr(init).elements, position[0]) : null;
    const plan = positionalDestructurePlan({
      prop: propPath.node,
      pattern: propPath.parentPath.node,
      slot: element.node,
      keys: positional.keys,
      levels: positional.levels,
      host: positional,
      collectExports: false,
    });
    if (!plan) continue;
    // Ordinary declarations retain their paired surface spelling. A loop header
    // already uses the positional reference to keep the spread and read together.
    if (!plan.positional.placement.isForInit && ((surface
      && isInstanceSurfaceNav(surface, { ctx: { scope: propPath.scope, adapter, path: propPath } }))
      || (paired && isReReadableSurfaceNav(
        unwrapRuntimeExpr(paired),
        name => !!adapter.getBinding({ scope: propPath.scope, name, path: propPath })?.polyfillHint,
        { ctx: { scope: propPath.scope, adapter, path: propPath } },
      )))) return null;
    const children = propPath.parentPath.get('properties').map(child => child.node.value?.type === 'AssignmentPattern'
      ? arrayReadingPropPlan(child, { adapter, resolvePure, isDisabledProp, isClaimedProp })
      : leafPlans.get(child.node) ?? arrayReadingPropPlan(child, {
        adapter,
        resolvePure,
        isDisabledProp,
        isClaimedProp,
        receiver,
      }));
    if (children.some(child => !child || child.kind === 'unhandled')) return null;
    placement = plan.positional.placement;
    statement = positional.statement?.node ?? null;
    slots[index].planned = {
      kind: 'rebuilt',
      node: element.node,
      defaultValue,
      nestedKeys: positional.keys,
      nested: !!positional.keys.length,
      index: position[0],
      path: position,
      children,
      positional: plan.positional,
      pattern: plan.pattern,
    };
    releaseSlot(slots[index]);
  }
  if (!placement) return null;
  // Later plain bindings must wait for the captured read too: its getter can
  // observe their old values. Earlier native bindings remain in their source slot.
  const elements = slots.slice(slots.findIndex(slot => slot.planned?.kind === 'rebuilt'))
    .flatMap(({ element, position, planned }) => {
      if (planned) return [planned];
      return element.node.type === 'Identifier' || element.node.type === 'RestElement' && element.node.argument.type === 'Identifier'
        ? [{ kind: 'verbatim', node: element.node, index: position[0], path: position }] : [];
    });
  const extractions = elements.flatMap(element => element.children?.flatMap(child => child.extractions ?? []) ?? []);
  const exportedSiblings = [];
  const hasFollowing = placement.isMultiDecl && path.parentPath.node.declarations.at(-1) !== path.node;
  const inDeclaration = placement.isForInit || placement.isBodyless || (placement.isMultiDecl && placement.isExport) || hasFollowing;
  const inlineExport = placement.isExport && !inDeclaration ? extractions.at(-1).localName : null;
  if (placement.isExport) {
    walkPatternIdentifiers(
      pattern,
      id => { if (id.name !== inlineExport) exportedSiblings.push(id.name); },
    );
  }
  return {
    pattern,
    extractions,
    array: {
      elements,
      positional: true,
      assignment,
      statement,
      inDeclaration,
      inlineExport,
      splitDeclaration: hasFollowing && !placement.isExport && !placement.isForInit && !placement.isBodyless,
      capture: {
        pattern,
        init,
        elements: elements.map(element => ({
          pattern: element.node, defaultValue: element.defaultValue, index: element.index, path: element.path,
        })),
        keyed,
      },
      exportFrom: null,
      exportedSiblings,
    },
  };
}

// Collect sequence prefixes from the shared wrapper peel and the innermost array element.
// If the peel continues through an object hop, keep that array element whole: its nested
// effects belong to the object capture. Return its `tail`, `arr` and outermost `unwrappedInit`,
// plus consumed levels; null if no array was consumed or no prefix can lift.
// `liftTrailing` admits observable neighbours; `includeTrailing` adds their effects after
// the element's prefix and `between`. Partial consumption leaves those neighbours in place.
// `strip` applies the decided replacements to a caller-owned tree. Shared planners pass a clone.
// Intermediate arrays link through their parent's first element or paired object property.
// This peel follows source literals only: following aliases would require an ownership proof
// before rewriting those links. Dropping a wrapper also removes the neighbours just replayed.
export function descendArrayWrapperToSE(declaratorNode, {
  liftTrailing = false,
  includeTrailing = false,
  between = [],
  strip = false,
} = {}) {
  const { init: leaf, peeledPrefixes, firstArray, lastArray, consumedLevels, trailingEffects } = peelArrayWrapperPair({
    pattern: declaratorNode.id,
    init: declaratorNode.init,
    liftTrailing,
  });
  if (!lastArray) return null;
  // the leaf's own prefix is the ARRAY level's to lift only where the leaf IS that level's element.
  // a peel that stepped through an OBJECT hop below the innermost array stops on the hop's slot
  // VALUE, and the plan harvests that value itself - its rescue asks exactly this question the other
  // way round, skipping a leaf that is an element - so lifting it here too ran the effect TWICE. the
  // element swap in the caller stands on the same identity: past a hop, `elements[0]` holds the
  // literal the hop reads off, not the leaf
  const leafIsElement = lastArray.elements[0] === leaf;
  const { prefix: leafPrefix, tail } = leafIsElement
    ? peelNestedSequenceExpressions(leaf) : { prefix: [], tail: lastArray.elements[0] };
  const prefix = [...peeledPrefixes, ...leafPrefix, ...between, ...includeTrailing ? trailingEffects : []];
  if (!prefix.length) return null;
  if (strip) {
    lastArray.elements[0] = tail;
    if (includeTrailing) lastArray.elements.length = 1;
    for (let index = 1; index < consumedLevels.length; index++) {
      const parent = consumedLevels[index - 1];
      if (parent.hopSlot) parent.hopSlot.value = consumedLevels[index].array;
      else parent.array.elements[0] = consumedLevels[index].array;
    }
    declaratorNode.init = firstArray;
  }
  return { prefix, tail, arr: lastArray, unwrappedInit: firstArray, consumedLevels };
}

// Plan the reading leaves of a paired array before any property is consumed. Element
// identity holds iterator positions; extraction identity holds independent getter reads.
// `captureFor` asks the existing normalization phase: capture the complete array host
// before re-detecting its native element patterns. The ordinary phase plans its reads.
// eslint-disable-next-line max-statements -- one source host owns its captures, reads and residual
function pairedArrayDestructurePlan({ path, adapter, resolvePure, isDisabledProp, isClaimedProp, captureFor, injectorState }) {
  const assignment = path.node.type === 'AssignmentExpression';
  const pattern = assignment ? path.node.left : path.node.id;
  // a value the build decides is the operand of it that runs (`decidedRunningOperand`)
  const sourceInit = decidedRunningOperand(assignment ? path.node.right : path.node.init, { scope: path.scope, adapter, path });
  if (captureFor) {
    if (assignment || pattern?.type !== 'ArrayPattern'
      || captureFor.kind !== 'instance') return null;
    const declaration = path.parentPath;
    if (declaration?.node?.type !== 'VariableDeclaration') return null;
    const placement = classifyVariableDeclarationHost({ declaration: declaration.node, declarationParent: declaration.parentPath?.node });
    const capture = planArrayWrapperCapture({
      pattern,
      init: sourceInit,
      force: true,
      restPattern: captureFor.pattern,
      adapter,
      injectorState,
      ctx: { scope: path.scope, adapter, path },
    })
      ?? planArrayWrapperCapture({ pattern, init: sourceInit, nestedOnly: !placement.isForInit });
    return capture ? { pattern, extractions: [], array: { capture } } : null;
  }
  // The outer object key selects the array before its iterator selects the method receiver.
  // Keep both native selections in the ordered capture; only the element's method reads are pure.
  if (pattern?.type === 'ObjectPattern' && pattern.properties.length === 1) {
    const [outer] = pattern.properties;
    const inner = outer.value;
    // the selected array's ONE object element, wherever it stands: its neighbours are plain
    // bindings the ordered capture keeps native in their own positions
    const at = inner?.type === 'ArrayPattern' ? inner.elements.findIndex(item => item?.type === 'ObjectPattern') : -1;
    const element = inner?.elements?.[at];
    const sourceRoot = unwrapRuntimeExpr(sourceInit);
    const source = followConstLiteralAlias(sourceRoot, { scope: path.scope, adapter, path });
    const [outerPath] = path.get(assignment ? 'left' : 'id').get('properties');
    const key = consumableHopSlotName(outer, { scope: outerPath.scope, adapter, path: outerPath });
    if (source !== sourceRoot && (aliasSlotWritten(sourceRoot, [key, 0], adapter, { scope: path.scope, path })
      || aliasEscaped(sourceRoot, adapter, path))) return null;
    const paired = key === null ? null : objectLevelPairedProperty(source, key);
    // the slot's value, through a value the build decides to the operand of it that runs (`decidedRunningOperand`)
    const array = paired ? unwrapRuntimeExpr(decidedRunningOperand(paired.read, { scope: path.scope, adapter, path })) : undefined;
    const declaration = path.parentPath;
    const host = declaration?.parentPath?.node?.type === 'ExportNamedDeclaration' ? declaration.parentPath : declaration;
    const statement = assignment && peelToExpressionStatement(path)?.exprStmt;
    const bodyless = statement && isBodylessStatementSlot(statement.parentPath?.node, statement.node);
    const placement = assignment ? statement && (bodyless || statementListOf(statement.parentPath?.node))
      : declaration?.node?.type === 'VariableDeclaration';
    const inDeclaration = !assignment && placement && rendersInDeclaration(declaration, host);
    if (inner?.type === 'ArrayPattern' && inner.elements.every((item, index) => index === at || !item || item.type === 'Identifier')
      && element?.type === 'ObjectPattern' && element.properties.length
      && !element.properties.some(isRestProperty) && key !== null && placement
      && (source?.type === 'Identifier' || source?.type === 'ObjectExpression'
        && source.properties.length === 1 && paired && paired.match.value === paired.read
        && array?.type === 'ArrayExpression')) {
      const elementPath = outerPath.get('value').get('elements')[at];
      const receiver = array ? pairedArrayWrapInitElement(array.elements, at)
        : outerDestructureReceiver(elementPath, path.scope, adapter);
      const objectCapture = planNestedKeyedPatternCapture({
        pattern,
        init: sourceInit,
        force: true,
        allowArray: true,
        ctx: { scope: path.scope, adapter, path },
      });
      const capture = objectCapture?.leafPattern === inner
        && planArrayWrapperCapture({ pattern: inner, init: array ?? sourceInit, force: true });
      const children = capture && receiver ? elementPath.get('properties').map(prop => arrayReadingPropPlan(prop, {
        adapter,
        resolvePure,
        isDisabledProp,
        isClaimedProp,
        receiver,
        capturedRoot: true,
      })) : [];
      if (children.some(child => child?.kind === 'consumed') && children.every(readsOffCapturedElement)) {
        return {
          pattern,
          extractions: children.flatMap(child => child.extractions ?? []),
          array: {
            // The selected array is only forwarded into its native pattern. Keep
            // that pattern under its original key instead of storing the array.
            capture: { ...capture, pattern, init: sourceInit, keyed: new Set(objectCapture.ancestors.map(level => level.pattern)) },
            assignment,
            bodyless,
            inDeclaration,
            statement: statement?.node,
            elements: capture.elements.map(item => item.pattern === element
              ? { kind: 'rebuilt', node: element, sourceNode: element, index: at, children }
              : { kind: 'verbatim', node: item.pattern, sourceNode: item.pattern, index: item.index }),
            exportFrom: 1,
          },
        };
      }
    }
  }
  if (pattern?.type !== 'ArrayPattern') {
    return pattern?.type === 'ObjectPattern'
      ? positionalArrayDestructurePlan({ path, adapter, resolvePure, isDisabledProp, isClaimedProp }) : null;
  }
  const sourceLiteral = unwrapRuntimeExpr(sourceInit);
  const expandedElements = arrayLiteralIterableElements(sourceInit);
  const sourceElements = expandedElements ?? (sourceLiteral?.type === 'ArrayExpression' ? sourceLiteral.elements : null);
  const planCtx = { scope: path.scope, adapter, path };
  // the path an element plans through: its own, or its default's left where the paired value
  // rules the default out - that element reads the value exactly as its flat twin does
  function plannedElementPath(slotPath, index) {
    return deadDefaultElementPattern(slotPath.node, pairedArrayWrapInitElement(sourceElements, index), planCtx)
      ? slotPath.get('left') : slotPath;
  }
  const singletonPath = pattern.elements.length === 1
    ? plannedElementPath(path.get(assignment ? 'left' : 'id').get('elements')[0], 0) : null;
  const singleton = !!singletonPath && singletonPath.node;
  // A folded but effectful key remains a native read before its pure binding.
  // Capturing the whole literal also keeps trailing spread iteration ahead of that key.
  if (!assignment && sourceLiteral?.type === 'ArrayExpression' && singleton?.type === 'ObjectPattern'
    && singleton.properties.length === 1 && computedKeyHasSideEffects(singleton.properties[0], planCtx)) {
    const declaration = path.parentPath;
    const host = declaration?.parentPath?.node?.type === 'ExportNamedDeclaration' ? declaration.parentPath : declaration;
    const receiver = pairedArrayWrapInitElement(sourceElements, 0);
    const capture = receiver && declaration?.node?.type === 'VariableDeclaration'
      && declaration.node.declarations.length === 1 && statementListOf(host.parentPath?.node)
      && planArrayWrapperCapture({ pattern, init: sourceInit, force: true, trailingSpread: true, ctx: planCtx });
    const child = capture && arrayReadingPropPlan(singletonPath.get('properties')[0], {
      adapter,
      resolvePure,
      isDisabledProp,
      isClaimedProp,
      receiver,
      capturedKey: true,
    });
    if (child?.kind === 'consumed' && child.extractions.every(read => read.kind === 'instance')) {
      const [element] = capture.elements;
      return {
        pattern,
        extractions: child.extractions,
        array: {
          capture,
          elements: [{ kind: 'rebuilt', node: element.pattern, sourceNode: element.pattern, index: element.index, children: [child] }],
          capturedKey: true,
          inDeclaration: host !== declaration,
          exportFrom: 1,
        },
      };
    }
  }
  // One object position inside inner array levels reads off its captured element. Declarations
  // and statement assignments share the capture; `host` carries only their placement fields.
  function nestedArrayElementPlan(capture, host) {
    const nested = capture?.elements.filter(element => element.pattern.type === 'ObjectPattern');
    if (nested?.length !== 1 || nested[0].path.length < 2
      || capture.elements.some(element => element !== nested[0] && element.pattern.type !== 'Identifier')) return null;
    // ... each level read as the value of it that runs, through a sequence to its tail and every decision on
    // either side of it (`decidedRunningValue`): the capture evaluates the prefix where the source wrote it
    let receiver = sourceInit;
    for (const index of nested[0].path) {
      receiver = arrayLiteralIterableElements(decidedRunningValue(receiver, { scope: path.scope, adapter, path }))?.[index];
    }
    if (!receiver) return null;
    let objectPath = path.get(assignment ? 'left' : 'id');
    for (const index of nested[0].path) objectPath = objectPath.get('elements')[index];
    const children = objectPath.get('properties').map(child => arrayReadingPropPlan(child, {
      adapter,
      resolvePure,
      isDisabledProp,
      isClaimedProp,
      receiver,
      capturedRoot: true,
    }));
    const extractions = children.flatMap(child => child?.extractions ?? []);
    if (!extractions.length || extractions.some(read => read.kind !== 'instance')
      || children.some(child => !readsOffCapturedElement(child))) return null;
    const elements = capture.elements.map(element => element === nested[0]
      ? { kind: 'rebuilt', node: element.pattern, sourceNode: element.pattern, index: element.index, children }
      : { kind: 'verbatim', node: element.pattern, sourceNode: element.pattern, index: element.index });
    return { pattern, extractions, array: { capture, elements, ...host, exportFrom: 1 } };
  }
  if (!sourceElements) return positionalArrayDestructurePlan({ path, adapter, resolvePure, isDisabledProp, isClaimedProp });
  if (assignment || pattern.elements.some(element => element?.type === 'ObjectPattern'
    && element.properties.some(isRestProperty) && element.properties.some(prop => prop.value?.type === 'ObjectPattern'))) {
    const statement = assignment && peelToExpressionStatement(path)?.exprStmt;
    let memberTarget = false;
    if (assignment) forEachPatternWriteMember(path.get('left'), () => { memberTarget = true; });
    const bodyless = statement && isBodylessStatementSlot(statement.parentPath?.node, statement.node);
    const declaration = !assignment && path.parentPath;
    const host = declaration?.parentPath?.node?.type === 'ExportNamedDeclaration' ? declaration.parentPath : declaration;
    const inDeclaration = !assignment && rendersInDeclaration(declaration, host);
    const capture = (assignment ? statement && !memberTarget && (bodyless || statementListOf(statement.parentPath?.node))
      : declaration?.node?.type === 'VariableDeclaration')
      && planArrayWrapperCapture({ pattern, init: sourceInit, force: true, ctx: planCtx });
    const elementPaths = path.get(assignment ? 'left' : 'id').get('elements').map(plannedElementPath);
    if (capture && elementPaths.every(({ node }) => !node || node.type === 'Identifier' || node.type === 'ObjectPattern')) {
      const elements = [];
      const extractions = [];
      for (const [index, elementPath] of elementPaths.entries()) {
        const element = elementPath.node;
        const receiver = element?.type === 'ObjectPattern' && pairedArrayWrapInitElement(sourceElements, index);
        const children = receiver ? elementPath.get('properties').map(child => arrayReadingPropPlan(child, {
          adapter,
          resolvePure,
          isDisabledProp,
          isClaimedProp,
          receiver,
          capturedRoot: true,
        })) : null;
        if (element?.type === 'ObjectPattern' && !children?.every(readsOffCapturedElement)) break;
        if (children?.some(child => child.extractions?.some(read => read.kind !== 'instance'))) break;
        extractions.push(...children?.flatMap(child => child.extractions ?? []) ?? []);
        elements.push(children?.some(child => child.kind === 'consumed')
          ? { kind: 'rebuilt', node: element, sourceNode: element, index, children }
          : { kind: 'verbatim', node: element, sourceNode: element, index, children });
      }
      if (elements.length === pattern.elements.length
        && extractions.length) return {
        pattern,
        extractions,
        array: { capture, elements, assignment, bodyless, statement: statement?.node, inDeclaration, exportFrom: 1 },
      };
    }
    const nestedPlan = assignment && capture && pattern.elements.some(element => element?.type === 'ArrayPattern')
      && nestedArrayElementPlan(capture, { assignment, bodyless, statement: statement?.node, inDeclaration });
    if (nestedPlan) return nestedPlan;
    if (assignment) return expandedElements ? null
      : positionalArrayDestructurePlan({ path, adapter, resolvePure, isDisabledProp, isClaimedProp });
  }
  const init = { ...unwrapRuntimeExpr(sourceInit), elements: [...sourceElements] };
  const declaration = path.parentPath;
  if (declaration?.node?.type !== 'VariableDeclaration') return null;
  const host = declaration.parentPath?.node?.type === 'ExportNamedDeclaration' ? declaration.parentPath : declaration;
  const inDeclaration = rendersInDeclaration(declaration, host);
  if (!inDeclaration && pattern.elements.some(element => element?.type === 'ArrayPattern')) {
    const nestedPlan = nestedArrayElementPlan(planArrayWrapperCapture({ pattern, init: sourceInit, force: true }), { inDeclaration });
    if (nestedPlan) return nestedPlan;
  }
  const elements = [];
  const extractions = [];
  const emptied = new Set();
  for (const slotPath of path.get('id').get('elements')) {
    const index = elements.length;
    const sourcePath = plannedElementPath(slotPath, index);
    let elementPath = sourcePath;
    let element = elementPath.node;
    if (element?.type !== 'ObjectPattern') {
      if (element && element.type !== 'Identifier' && element.type !== 'RestElement'
        && element.type !== 'AssignmentPattern') return expandedElements ? null
        : positionalArrayDestructurePlan({ path, adapter, resolvePure, isDisabledProp, isClaimedProp });
      elements.push({ kind: 'verbatim', node: element, index });
      continue;
    }
    let receiver = pairedArrayWrapInitElement(init.elements, index);
    // A spread can expose a hole rather than a paired receiver. The positional
    // admission owns that slot and retains the source's iteration and throw.
    if (!receiver) return positionalArrayDestructurePlan({ path, adapter, resolvePure, isDisabledProp, isClaimedProp });
    // A sole keyed chain has the same leaf as its flat spelling. Use the shared
    // placement proof before putting that receiver into the original array slot.
    const first = firstPatternProp(elementPath);
    const nested = first && first.parentPath.node !== element;
    let nestedKeys = null;
    let trailing = false;
    // A sole reading leaf and sole literal value have no receiver read or neighbour
    // to cross. Its dispatch performs the source read once, including an unbound name.
    const singleRead = !!sourceLiteral && patternBindingCount(pattern) === 1
      && sourceElements.filter(Boolean).length === 1 && pattern.elements.filter(Boolean).length === 1;
    const nestedChildren = nested && element.properties.length > 1
      ? elementPath.get('properties').map(child => arrayReadingPropPlan(
        child,
        { adapter, resolvePure, isDisabledProp, isClaimedProp, receiver, singleRead },
      )) : null;
    const compactNested = nestedChildren?.every(child => child?.kind === 'consumed' && child.nested);
    if (nested && !compactNested) {
      const walk = typedNavClaimShape(first, { allowLeafSiblings: true, adapter });
      // the element's residual keeps only the leaf level, so every level above it must be sole
      const shape = walk && !walk.slotDefault && walk.hostPattern?.node === element
        && walk.climbed.every(level => !level.prop?.computed)
        && walk.climbed.slice(1).every(level => level.pattern.properties.length === 1);
      const hostPlan = shape ? planNestedLeafHost(walk, null, { pairing: true }) : null;
      const nestedReceiver = hostPlan?.navPlacement
        && resolveNestedReceiverNode(first, { allowNavSegments: true, allowSeFreeSingleRead: singleRead, adapter });
      if (!nestedReceiver || receiver?.type === 'Identifier'
        && isReassignedBeyondDeclarator(adapter.getBinding({ scope: path.scope, name: receiver.name, path }) ?? {})) {
        // The original element can carry its own receiver computation. Keep its
        // iteration and every RHS effect before reading the captured object; the
        // capture then plans every element off its own position.
        const captured = planArrayWrapperCapture({
          pattern,
          init: sourceInit,
          force: true,
          trailingSpread: !inDeclaration && !!sourceLiteral?.elements?.some(item => item?.type === 'SpreadElement'),
        });
        const capturedChildren = captured ? elementPath.get('properties').map(child => arrayReadingPropPlan(child, {
          adapter,
          resolvePure,
          isDisabledProp,
          isClaimedProp,
          receiver,
          capturedRoot: true,
        })) : null;
        const capturedReads = capturedChildren?.flatMap(child => child?.extractions ?? []);
        if (captured && capturedChildren.every(child => child?.kind === 'consumed' || child?.kind === 'verbatim')
          && capturedReads.length && capturedReads.every(read => read.kind === 'instance')) {
          // Other top-level elements are planned as the assignment capture plans them; an
          // element holding a claim no read can take stays native.
          const capturedElements = captured.elements.map(item => {
            if (item.pattern === sourcePath.node) {
              return { kind: 'rebuilt', node: item.pattern, sourceNode: item.pattern, index: item.index, children: capturedChildren };
            }
            const otherPath = item.path.length === 1 && item.pattern.type === 'ObjectPattern'
              ? path.get('id').get('elements')[item.index] : null;
            const otherReceiver = otherPath && pairedArrayWrapInitElement(sourceElements, item.index);
            const children = otherReceiver ? otherPath.get('properties').map(child => arrayReadingPropPlan(child, {
              adapter,
              resolvePure,
              isDisabledProp,
              isClaimedProp,
              receiver: otherReceiver,
              capturedRoot: true,
            })) : null;
            const planned = !!children?.every(child => child?.kind === 'consumed' || child?.kind === 'verbatim');
            if (planned) capturedReads.push(...children.flatMap(child => child.extractions ?? []));
            return {
              kind: planned && children.some(child => child.kind === 'consumed') ? 'rebuilt' : 'verbatim',
              node: item.pattern,
              sourceNode: item.pattern,
              index: item.index,
              children: planned ? children : undefined,
            };
          });
          return {
            pattern,
            extractions: capturedReads,
            array: { capture: captured, elements: capturedElements, inDeclaration, exportFrom: 1 },
          };
        }
        return expandedElements ? null : positionalArrayDestructurePlan({ path, adapter, resolvePure, isDisabledProp, isClaimedProp });
      }
      receiver = nestedReceiver;
      nestedKeys = walk.keys;
      trailing = hostPlan.navPlacement === 'trail';
      elementPath = first.parentPath;
      element = elementPath.node;
      if (element.properties.length > 1) init.elements[index] = receiver;
    }
    const children = [];
    const rest = element.properties.some(isRestProperty);
    for (const [at, propPath] of elementPath.get('properties').entries()) {
      const planned = compactNested ? nestedChildren[at]
        : arrayReadingPropPlan(propPath, { adapter, resolvePure, isDisabledProp, isClaimedProp, receiver, rest, singleRead });
      if (!planned || planned.kind === 'unhandled') return null;
      children.push(planned);
      if (planned.extractions) extractions.push(...planned.extractions);
    }
    if (children.every(item => item.kind === 'verbatim')) {
      init.elements[index] = sourceElements[index];
      elements.push({ kind: 'verbatim', node: sourcePath.node, index, children });
    } else {
      const residual = { ...element,
        properties: children.filter(item => item.kind === 'verbatim' || item.sentinel).map(item => item.prop) };
      elements.push({
        kind: 'rebuilt',
        node: element,
        sourceNode: sourcePath.node,
        index,
        children,
        residual,
        nested,
        nestedKeys,
        compactNested,
        trailing,
        receiver,
      });
      emptied.add(residual);
    }
  }

  if (!extractions.length) return null;
  const compactNested = elements.every(item => item.compactNested
    || (item.kind === 'verbatim' && !patternBindingCount(item.node)));
  const hasCompactNested = elements.some(item => item.compactNested);
  // Only plain neighbouring bindings ride this capture. Another object pattern
  // may own a static or disabled claim that still needs its original route.
  const compactWithBindings = hasCompactNested && !compactNested && elements.every(item => item.compactNested
    || (item.kind === 'verbatim' && item.node?.type === 'Identifier'));
  const sourceSpread = sourceLiteral?.elements?.some(element => element?.type === 'SpreadElement');
  // These sole-hop groups consume their entire element. A retained neighbour or
  // shared-hop memo is still owned by the capture/placement plan, not this shortcut.
  if (hasCompactNested && ((!compactNested && !compactWithBindings)
    || (!expandedElements && !sourceSpread)
    || !statementListOf(host.parentPath?.node))) return null;
  // A residual getter or a live default cannot cross an extraction. Capture the
  // original positions before splitting each element in source property order.
  // Receiver evaluations precede every property read, including getters in neighbouring
  // elements. A binding that a getter can replace also needs its original value.
  const readContext = { scope: path.scope, adapter, path };
  const firstClaim = elements.findIndex(item => item.kind === 'rebuilt');
  const lastClaim = elements.findLastIndex(item => item.kind === 'rebuilt');
  const nativeBindings = elements.filter(item => item.kind === 'verbatim'
    && (patternBindingCount(item.node) || isDestructurePattern(item.node)));
  const bindsBefore = nativeBindings.some(item => item.index < lastClaim);
  const bindsAfter = nativeBindings.some(item => item.index > firstClaim);
  const firstRead = elements.findIndex(item => item.node?.type === 'ObjectPattern');
  const capturesReceivers = init.elements.some((receiver, index) => index > firstRead && receiver
    && !isReReferenceableAcrossReads(unwrapRuntimeExpr(receiver), readContext));
  const compactCapture = hasCompactNested && (compactWithBindings || sourceSpread
    || inDeclaration && elements.some(item => item.kind === 'rebuilt'
    && arrayWrapperNeighbourEffect(init, item.index, pattern)));
  const needsCapture = compactCapture || (!compactNested && (!expandedElements
    || capturesReceivers || (bindsBefore && bindsAfter)
    || elements.some(item => item.kind === 'rebuilt'
    && (item.trailing || (item.residual.properties.length
    && (!item.nested || item.children.some((child, index) => child.kind === 'consumed'
      && item.children.slice(0, index).some(before => before.kind === 'verbatim'))))
    || item.children.some(child => child.extractions?.some(extraction => extraction.defaultNode))
    || arrayWrapperNeighbourEffect(init, item.index, pattern)))));
  // An opaque spread stays in the original literal; only its proven prefix pairs.
  // These source positions have already passed the paired-host proof. Retain all
  // native bindings in the capture, including the argument of an array rest slot.
  const capture = needsCapture ? {
    pattern,
    init: sourceInit,
    elements: elements
      .filter(item => item.sourceNode ?? item.node)
      .map(item => ({ pattern: item.sourceNode ?? item.node, index: item.index, path: [item.index] })),
  } : null;
  if (capture) return {
    pattern,
    array: { elements, capture, normalize: compactNested && sourceSpread, inDeclaration, exportFrom: 1 },
    extractions: compactNested && sourceSpread ? [] : extractions,
  };
  // The capture above owns the full source. Only a compact plan lifts discarded
  // leading slots, before its receiver memos and any residual binding writes.
  const leading = leadingDiscardedEffectSlots(init, pattern).map(index => {
    const effect = init.elements[index];
    init.elements[index] = null;
    return effect;
  });
  if (leading.length && !statementListOf(host.parentPath?.node)) return null;
  const residualPattern = { ...pattern, elements: elements.map(item => item.residual ?? item.node) };
  const shed = arrayWrapperResidualTrailingShed(residualPattern, emptied);
  if (shed && shed < residualPattern.elements.length) residualPattern.elements.length -= shed;
  const effects = residualInitRunsEffects({ init, scope: path.scope, adapter, path });
  // Consumed elements are evaluated by their extraction or shared memo. Only the
  // other positions can still owe a discarded effect when the wrapper disappears.
  const readElements = new Set(elements.filter(item => item.kind === 'rebuilt').map(item => item.index));
  let discarded = !patternBindingCount(residualPattern) && arrayWrapperResidualDroppable(residualPattern, emptied)
    ? discardedWrapperEffects({
      ...init,
      elements: init.elements.map((node, index) => readElements.has(index) ? null : node),
    }, residualPattern)
    : null;
  const dropsResidual = !!discarded && !(pattern.elements.filter(Boolean).length > 1
    && elements.some(item => item.nested && item.children.length === 1));
  // Reusing a name removes its capture, not initial reads before another RHS element.
  // Preserve their throws before any getter; property receivers keep their memo.
  if (dropsResidual && (discarded.length || readElements.size > 1)) {
    const discardedEffects = new Set(discarded);
    const lastEvaluation = readElements.size > 1 ? init.elements.length
      : init.elements.findLastIndex(node => discardedEffects.has(node));
    discarded = init.elements.flatMap((node, index) => discardedEffects.has(node) ? [node]
      : index < lastEvaluation && readElements.has(index) && unwrapRuntimeExpr(node)?.type === 'Identifier'
        ? observableSequenceElements([node], readContext, { preserveSourceReads: true }) : []);
  }
  if (inDeclaration && (discarded?.length || (dropsResidual && leading.length))) return null;
  if (!dropsResidual && inDeclaration && !statementListOf(host.parentPath?.node)) return null;
  const memos = elements.filter(item => item.kind === 'rebuilt').flatMap(item => {
    const { receiver } = item;
    return !isReReferenceableAcrossReads(unwrapRuntimeExpr(receiver), readContext)
      && ((!dropsResidual && !item.nested) || item.children.length > 1 || mayHaveSideEffects(receiver)) ? [receiver] : [];
  });
  if (!dropsResidual && memos.some(receiver => init.elements.slice(0, init.elements.indexOf(receiver))
    .some(node => node && !isReReferenceableAcrossReads(unwrapRuntimeExpr(node), readContext)))) return null;
  const after = !dropsResidual && (bindsBefore || effects || elements.some(item => item.kind === 'rebuilt'
    && arrayWrapperNeighbourEffect(init, item.index, pattern)));
  const splitDeclaration = inDeclaration && dropsResidual && !compactNested
    && host === declaration && !!statementListOf(host.parentPath?.node);
  // A surviving memoized slot keeps the established declaration groups: preceding
  // declarators, private memos, then ordered residual/reads and following declarators.
  const at = declaration.node.declarations.indexOf(path.node);
  const joinResidual = !dropsResidual && inDeclaration ? {
    before: declaration.node.declarations.slice(0, at),
    after: declaration.node.declarations.slice(at + 1),
    exported: host !== declaration,
  } : null;
  return {
    pattern,
    array: {
      elements,
      residualPattern,
      dropsResidual,
      after,
      leading,
      discarded,
      memos,
      inDeclaration: inDeclaration && !joinResidual,
      joinResidual,
      splitDeclaration,
      initElements: init.elements,
      exportFrom: joinResidual ? null : leading.length + (discarded?.length ?? 0) + memos.length,
    },
    extractions,
  };
}

// Plan instance reads from an array host, or a direct declaration/assignment over a realm or constructor.
// Return null when no supported extraction or anchor exists; an anchor may have zero extractions.
// Fallback selection must satisfy the shared collapse proof. `discardSe` and probe fields retain
// receiver effects and throws. Literal wrappers retain their source containers; their independent
// instance reads use the array/capture plans. Residual flags preserve reads, keys, rest and iteration.
// eslint-disable-next-line max-statements -- sequential plan-building steps of one pattern
export function buildNestedDestructurePlan({
  declarator,
  scope,
  adapter,
  path = null,
  resolvePure,
  resolveGlobalPolyfill,
  isDisabledProp = null,
  isClaimedProp = null,
  positional = null,
  arrayPath = null,
  arrayProp = null,
  captureFor = null,
  injectorState = null,
}) {
  if (patternHasRestReadBeforeNestedBinding(arrayPath?.node?.id ?? arrayPath?.node?.left ?? declarator?.id, adapter)) return null;
  if (positional) return positionalDestructurePlan(positional);
  if (arrayPath) {
    let plan = pairedArrayDestructurePlan({
      path: arrayPath,
      adapter,
      resolvePure,
      isDisabledProp,
      isClaimedProp,
      captureFor,
      injectorState,
    });
    // A declined nested instance read can still use its existing object-host route.
    // Capture the array positions first, preserving RHS effects before those reads.
    // Only the original trigger asks for normalization; supported ordered plans win.
    if (!plan && arrayProp && arrayPath.node.type === 'VariableDeclarator'
      && arrayPath.node.id.type === 'ArrayPattern'
      && (arrayProp.parentPath.parentPath?.node?.type !== 'ArrayPattern'
        || isDestructurePattern(patternSlotTarget(arrayProp.node.value)))
      && (isDestructurePattern(patternSlotTarget(arrayProp.node.value))
        || typedNavClaimShape(arrayProp, { adapter, rootMemoized: true, allowLeafSiblings: true, allowInlineSpread: true }))) {
      // The trigger may itself claim an instance read, including a pattern-valued method.
      // Otherwise a proxy hop can trigger this plan before its instance leaf is visited.
      function isInstanceRead(prop) {
        const { meta } = destructurePropLeafMeta({
          prop: prop.node,
          objectPattern: prop.parentPath,
          scope: prop.scope,
          path: prop.get('key'),
          adapter,
          resolvePure,
        });
        return meta && !meta.guardedAliasHint && resolvePure(meta, prop)?.kind === 'instance';
      }
      const capture = (isInstanceRead(arrayProp) || firstPatternProp(arrayProp.get('value'), isInstanceRead))
        && planArrayWrapperCapture({ pattern: arrayPath.node.id, init: arrayPath.node.init, force: true, trailingSpread: true });
      if (capture) plan = {
        pattern: arrayPath.node.id,
        extractions: [],
        array: {
          capture,
          normalize: true,
          inDeclaration: true,
          splitDeclaration: !!statementListOf(arrayPath.parentPath.parentPath?.node),
        },
      };
    }
    // Native fragments may introduce private bindings anywhere in the emitted list.
    // Export source names explicitly instead of assigning visibility by statement index;
    // an export no list may replace (a TS namespace body) keeps the host native.
    const exportPath = arrayPath.parentPath?.parentPath;
    if (plan?.array.capture && !plan.array.inDeclaration && !plan.array.positional
      && exportPath?.node?.type === 'ExportNamedDeclaration') {
      if (!hostsExportList(exportPath.parentPath?.node)) return null;
      plan.array.exportFrom = null;
      plan.array.exportedSiblings = [];
      walkPatternIdentifiers(plan.pattern, id => plan.array.exportedSiblings.push(id.name));
    }
    // Retain RHS evaluation and sibling binding order without capturing a stable name.
    // Navigations still keep one property read, and source writes invalidate name reuse.
    if (plan?.array.capture && !plan.array.positional) {
      const ctx = { path: arrayPath, scope: arrayPath.scope, adapter };
      for (const element of plan.array.capture.elements) {
        if (element.receiverUnused || element.nativeBinding || !plan.array.normalize
          && !plan.array.elements?.some(item => item.kind === 'rebuilt'
            && (item.sourceNode ?? item.node) === element.pattern)) continue;
        const receiver = reusableArrayCaptureReceiver(plan.array.capture, element, ctx);
        if (receiver) element.receiver = receiver;
      }
    }
    return plan;
  }
  if (planCache.has(adapter, declarator)) return planCache.get(adapter, declarator);

  // a disable directive on a LEAF prop's line blocks that leaf's extraction (the prop plans
  // verbatim - native semantics, the natural visitor honors the same directive on the
  // residual). gated at extraction-producing leaves ONLY, matching the per-leaf dispatch
  // gate (a directive on an OUTER `Map: {` line with leaves on other lines does not block
  // them - the dispatch gate checks the leaf node's line). without this, the plan resolves
  // a disabled SIBLING leaf the dispatch gate never visited and the directive is silently
  // bypassed
  // ... and so does a leaf under a hop slot another reader shares, or one the write-order gate keeps
  // native: the claim funnel keeps it native, and the plan, which consumes statics its dispatch never
  // asked for, asks the funnel's own verdicts
  function leafDisabled(prop) {
    if (isDisabledProp?.(prop)) return true;
    return adapter?.method === 'usage-pure' && !!declarator?.id
      && (claimUnderSharedHopSlot({ top: declarator.id, receivers: [declarator.init], prop, scope, adapter, path })
        || claimWriteOrderBound({ prop, top: declarator.id, path, adapter, resolvePure }));
  }

  // inner prop (static method on the nested global): `{ Array: { from } }` - `from` on `Array`. accepts
  // `{ from }`, `{ from: alias }`, `{ from = default }`, `{ from: alias = default }`; rest / default-only /
  // computed / instance / unresolved / disabled fall back to verbatim. user's default is dropped: the
  // polyfill is always defined, so the user's default fires only on undefined property (dead code)
  // a prop's key as a static name, scope-aware: an Identifier computed key `[K]` folds to its binding
  // value like a literal `["from"]`, so the static extracts + imports its module rather than staying a
  // residual reading the static off the pure ctor (unimported -> undefined at runtime, the unplugin
  // break vs babel). a SIDE-EFFECTING key bails to null - it must stay a residual so its effect runs
  // once in place (consuming would drop the key node). non-computed keys read structurally
  // ... a HOP's key folds even with an effect (`keepsKey`): the level survives the render with the key
  // in place (`hostLevelSurvives`), so nothing drops the effect - the leaves below it retire to sentinels
  function propKeyNameScoped(prop, keepsKey = false) {
    if (!isPropertyNode(prop)) return null;
    return prop.computed
      ? sharedResolveKey({
        node: prop.key, computed: true, scope, adapter, path, bailOnSideEffectKey: !keepsKey, keepsKeyNode: keepsKey,
      })
      // through the synth namer, which also names a NUMERIC key: it addresses an array SLOT and the
      // static descent reads that slot like any other container member. the narrower namer stays for
      // the mutation pre-pass, which tracks NAMED statics a numeric slot can never be
      : plainSynthKeyName(prop.key);
  }

  function planInnerProp(prop, receiverName, source = null) {
    const keyName = propKeyNameScoped(prop);
    if (source) {
      const meta = importedStaticReadMeta({ ...source, scope, adapter, path,
        meta: { kind: 'property', object: receiverName, key: keyName, placement: 'static' } });
      if (!meta?.object || meta.placement !== 'static') return { kind: 'verbatim', prop };
    }
    const resolved = resolvePolyfillableStaticProp({
      prop, receiverName, resolvePure, isDisabled: leafDisabled, keyName,
    });
    if (!resolved) {
      // ... a STATIC whose slot holds a PATTERN with no claim of its own (`{ of: { length: arity } }`):
      // the residual would read the static raw off the realm - undefined where the ponyfill is the
      // point, and the pattern then throws - so the pattern destructures the ponyfill instead, the
      // way a symbol-iterator pattern leaf does. a default, a rest or a disabled leaf keeps the source
      const patternStatic = patternValuedStaticProp(prop, receiverName, keyName);
      if (!patternStatic) return { kind: 'verbatim', prop };
      return {
        kind: 'consumed', prop, keyName,
        extractions: [{ entry: patternStatic.pure.entry, hint: patternStatic.pure.hintName, pattern: patternStatic.pattern }],
      };
    }
    return {
      kind: 'consumed', prop, keyName,
      extractions: [{
        entry: resolved.pure.entry,
        hint: resolved.pure.hintName,
        localName: resolved.localName,
        targetNode: resolved.targetNode,
        defaultNode: leafDefaultNode(prop),
      }],
    };
  }

  // ... a leaf that carries a claim of ITS own (`name` off the static) keeps the pattern out: the
  // leaf's own route renders that claim off the SAME ponyfill, and a consume here would read it raw
  // off the pattern instead. the key is asked through the level's own namer, which folds a COMPUTED
  // spelling like any other and names a NUMERIC slot on both dialects (`keepsKey`: the re-anchored
  // pattern keeps the key node where the source wrote it, so an effect-bearing key still runs once
  // in place). a key nothing folds stays unknowable, which counts as a claim; a folded one naming no
  // prototype member rides, the way the assignment host already rides every leaf - refusing over it
  // left the residual reading the static raw off the realm, where the ponyfill is the point
  function leafMayClaim(leaf) {
    return leafCarriesOwnClaim({
      leaf,
      receiver: { object: undefined, placement: 'prototype' },
      resolvePure,
      keyCtx: { scope, adapter, path },
      foldsComputedKey: true,
    });
  }

  // does a residual leaf whose key NAMES one of this ctor's polyfillable statics belong to the MIRROR
  // rather than to the anchor? the anchor reads that member off the bare `*/constructor` binding,
  // which installs none of the ctor's own statics, so the slot answers `undefined` unless some
  // unrelated module happens to import the same static and decorate the shared binding - an
  // UNDER-inject that depends on the rest of the bundle. The mirror spells the member's own ponyfill
  // into a literal right where the pattern reads it, which needs neither that shared decoration nor
  // the index entry (an OVER-inject). Asked through the key's SECOND spelling, the one that folds
  // THROUGH an effect: an effect-bearing key still names the member it names, and such a prop is
  // exactly the one the flatten could not consume
  function residualLeafBelongsToMirror(leafProp, ctorName) {
    const leafKey = propKeyNameScoped(leafProp, true);
    if (leafKey === null || adapter?.isMutatedStatic?.(ctorName, leafKey)) return false;
    const leafMeta = { kind: 'property', object: ctorName, key: leafKey, placement: 'static' };
    if (resolveBuiltIn(leafMeta)?.kind === 'instance') return false;
    const leafPure = resolvePure(leafMeta);
    return !!leafPure && leafPure.kind !== 'instance';
  }

  // ... on the ASSIGNMENT host (the cascade's synthetic `{ id, init }`) a claiming leaf rides
  // along: that host renders every leaf claim it consumed off the extraction (the overwrite
  // channel), where a declaration's flatten keeps it for the hop split. that host is also the one
  // the lift takes WHOLE, so it is asked for a sole chain - every wider shape belongs to the
  // mirror, whose slot serves the static with the statement standing and nothing moved
  function patternValuedStaticProp(prop, receiverName, keyName) {
    if (keyName === null || !isPropertyNode(prop) || leafDisabled(prop)) return null;
    const pattern = prop.value;
    const claimsRide = declarator.type !== 'VariableDeclarator';
    if (claimsRide && !soleChainToProp(declarator.id, prop)) return null;
    if (pattern?.type !== 'ObjectPattern' || !pattern.properties.length
      || pattern.properties.some(item => isRestProperty(item) || patternHasAnyDefault(item.value) || leafDisabled(item)
        || (!claimsRide && leafMayClaim(item)))) return null;
    if (adapter?.isMutatedStatic?.(receiverName, keyName)) return null;
    const meta = { kind: 'property', object: receiverName, key: keyName, placement: 'static' };
    if (resolveBuiltIn(meta)?.kind === 'instance') return null;
    const pure = resolvePure(meta);
    return pure && pure.kind !== 'instance' ? { pure, pattern } : null;
  }

  // the user's own default on a consumed leaf (`{ from: alias = d }`): the polyfill is always defined,
  // so it is dead text at runtime - the render canon's static guard drops it on both legs; the plan
  // still carries it so a renderer can spell the guard where the read is a memo rather than the import
  function leafDefaultNode(prop) {
    return prop.value?.type === 'AssignmentPattern' ? prop.value.right : null;
  }

  // fold an ObjectPattern-valued outer prop: plan each child, aggregate extractions, pick
  // the node kind. no extraction anywhere -> the whole prop stays verbatim; every child
  // consumed -> the prop is consumed whole; otherwise 'rebuilt' with per-child plans.
  // Native rest keeps exclusion sentinels for static reads; receiver helpers cannot repeat a read.
  function foldNestedPattern(outerProp, pattern, planChild) {
    // Assignment captures keep the nested static write ahead of the rest copy.
    // An eager host flatten would consume the leaf before that ordered capture can run.
    if (declarator.type !== 'VariableDeclarator' && pattern.properties.some(isRestProperty)) {
      return { kind: 'verbatim', prop: outerProp };
    }
    const children = pattern.properties.map(planChild);
    const extractions = children.flatMap(c => c.extractions ?? []);
    if (pattern.properties.some(isRestProperty) && extractions.some(item => item.synth)) {
      return { kind: 'verbatim', prop: outerProp };
    }
    if (!extractions.length) return { kind: 'verbatim', prop: outerProp };
    if (children.every(c => c.kind === 'consumed')) {
      return { kind: 'consumed', prop: outerProp, keyName: propKeyNameScoped(outerProp), extractions };
    }
    return { kind: 'rebuilt', prop: outerProp, pattern, extractions, children };
  }

  // `[Symbol.iterator]`-keyed prop, shared by the proxy-outer level and the single-ctor-key
  // ANCHOR hop (where the synth receiver is the anchored constructor): a binding value
  // consumes into the synth extraction `ident = _getIteratorMethod(receiver)`; a nested
  // ObjectPattern value consumes the same way, destructuring the helper RESULT
  // (`{ next } = _getIteratorMethod(receiver)`) - value-correct on modern engines (the helper
  // returns the same method a raw read yields) and polyfill-visible on engines without native
  // Symbol, where a raw `receiver[_Symbol$iterator]` read misses the iterators the helper's
  // fallbacks cover. a prop-level DEFAULT (`[Symbol.iterator]: {...} = fb`) keeps the key-swap
  // instead: the helper result is defined where the raw read is undefined, so extracting would
  // flip which side of the default runs. a disabled leaf stays verbatim (the directive-honoring
  // natural visitor owns the key then). null for non-symbol keys
  function planSymbolIteratorProp(prop) {
    if (!isSymbolIteratorComputedKey(prop, { scope, adapter, path })) return null;
    // A native rest residual already reads each excluded symbol slot. Extracting its
    // receiver helper beside that residual would run a user getter twice.
    if (pattern.properties?.includes(prop) && pattern.properties.some(isRestProperty)) {
      return { kind: 'verbatim', prop };
    }
    if (leafDisabled(prop)) return { kind: 'verbatim', prop };
    const localName = symbolIteratorLocalName(prop, { scope, adapter, path });
    if (localName !== null) {
      return { kind: 'consumed', prop, extractions: [{ synth: 'symbol-iterator', localName }] };
    }
    // An assignment to a member observes write order through its setter. It belongs
    // in this ordered plan, not in an independent extraction ahead of the residual.
    const targetNode = symbolIteratorMemberTarget(prop, 'get-iterator-method', {
      hostPattern: declarator.id, ctx: { scope, adapter, path },
    });
    if (targetNode) return { kind: 'consumed', prop, extractions: [{ synth: 'symbol-iterator', targetNode }] };
    if (isSymbolIteratorPatternProp(prop, { scope, adapter, path })) {
      // The ordinary capture retains the live declarator for a relocated rest binding.
      if (declarator.id.properties?.length === 1 && prop.value.properties.some(isRestProperty)) {
        return { kind: 'verbatim', prop };
      }
      const leaf = symbolIteratorInstanceLeaf({
        value: prop.value, resolvePure, isDisabled: leafDisabled, keyNameOf: propKeyNameScoped,
      });
      if (leaf) return { kind: 'consumed', prop, extractions: [{ synth: 'symbol-iterator', ...leaf }] };
      return { kind: 'consumed', prop, extractions: [{ synth: 'symbol-iterator', pattern: prop.value }] };
    }
    return { kind: 'symbol-iterator-key', prop };
  }

  // the resolved proxy receiver name, mirrored to function scope for the closures above the
  // resolution block (the mutation bail in `planOuterProp` reads it lazily at plan time)
  let planReceiverName = null;

  // proxy-global outer prop: five shapes
  //   - `{ Foo: { bar, ... } }` where Foo is a real global - inner pattern holds static methods
  //   - `{ Self: { ... } }` where Self is itself a proxy-global - alias hop, recurse keeping
  //     the chain transparent. enables N-level nests like `{ self: { window: { Array: { from } } } } = globalThis`
  //   - `{ Foo }` shorthand / `{ Foo: alias }` aliased - polyfill Foo as a global
  //   - `{ [Symbol.iterator]: ident }` computed Symbol.iterator key - synth extraction
  //     `ident = _getIteratorMethod(receiver)`
  //   - `{ [Symbol.iterator]: {nested} }` non-binding value - keep the prop, polyfill the key
  function planOuterProp(outerProp) {
    const symbolPlanned = planSymbolIteratorProp(outerProp);
    if (symbolPlanned) return symbolPlanned;
    const name = propKeyNameScoped(outerProp, isDestructurePattern(patternSlotTarget(outerProp.value)));
    if (name === null) return { kind: 'verbatim', prop: outerProp };
    // a MUTATED slot (`globalThis.Promise = Shim` / `window.self = fake` in-file) must read off
    // the patched native binding, not the pure import - the user's replacement wins for the
    // VALUE leaf, for every static behind a mutated ctor key, and for every hop behind a
    // mutated proxy key. mirrors the single-ctor anchor's `anchorSlotMutated` bail and the
    // flat-path meta gate. `planReceiverName` is the function-scope mirror of the block-scoped
    // receiver (canonical at every fold depth - the hops alias the one global object)
    if (adapter.isMutatedStatic?.(planReceiverName, name, path && { node: outerProp, path })) {
      return { kind: 'verbatim', prop: outerProp };
    }
    const value = patternSlotTarget(outerProp.value);
    if (value?.type === 'ObjectPattern') {
      // The retained capture reads the whole pattern from the constructor index.
      // Extracting a leaf here would split its source from the rest that follows it.
      if (constructorRestIndex({ name, patternNode: value, resolveGlobalPolyfill })) return { kind: 'verbatim', prop: outerProp };
      // A retained iterator sentinel would repeat the read; let the capture own rest.
      if (value.properties.some(isRestProperty)
        && value.properties.some(item => isSymbolIteratorComputedKey(item, { scope, adapter, path }))) {
        return { kind: 'verbatim', prop: outerProp };
      }
      const planChild = POSSIBLE_GLOBAL_OBJECTS.has(name)
        ? planOuterProp
        : innerProp => planInnerProp(innerProp, name);
      return foldNestedPattern(outerProp, value, planChild);
    }
    if (value?.type === 'Identifier') {
      if (leafDisabled(outerProp)) return { kind: 'verbatim', prop: outerProp };
      // resolved by NAME with no node of its own, and needing none: the ctor a destructured slot
      // hands out carries its statics exactly as a spelled-out member read of the same surface
      // does, because the ENTRY is one file-wide answer per ctor name
      const pure = resolveGlobalPolyfill(name);
      if (!pure) return { kind: 'verbatim', prop: outerProp };
      return {
        kind: 'consumed', prop: outerProp, keyName: name,
        // `kind: 'global'` lets renderers register the binding as a GLOBAL alias (member
        // reads through the local must keep resolving: `const { Symbol } = globalThis;
        // Symbol.iterator` -> `_Symbol$iterator`), unlike static-method extractions which
        // register a body-extract alias
        extractions: [{
          kind: 'global', entry: pure.entry, hint: pure.hintName, localName: value.name, defaultNode: leafDefaultNode(outerProp),
        }],
      };
    }
    return { kind: 'verbatim', prop: outerProp };
  }

  // Anchor a nested constructor residual on its pure binding while retaining planned extractions.
  // Rest, proxy-global hops, disabled or mutated slots, residual defaults and realm writes keep
  // the existing plan. Residual polyfillable statics belong to the mirror: the constructor entry
  // alone does not supply them.
  function anchorMissingAbleResidual(planned, outerPattern, receiver) {
    if (planned.kind !== 'verbatim' && planned.kind !== 'rebuilt') return planned;
    // a `core-js-disable`d prop opts out of polyfilling: keep it on the native residual
    if (leafDisabled(planned.prop)) return planned;
    if (outerPattern.properties.some(isRestProperty)) return planned;
    const name = propKeyNameScoped(planned.prop);
    if (name === null || POSSIBLE_GLOBAL_OBJECTS.has(name)) return planned;
    // a MUTATED ctor (`globalThis.Map = Shim` in-file) must read off the PATCHED native binding, not the
    // pure import - the user's replacement wins. mirror the single-ctor anchor's `anchorSlotMutated` bail
    if (adapter.isMutatedStatic?.(receiver, name, path && { node: planned.prop, path })) return planned;
    const anchorPure = resolveGlobalPolyfill(name);
    if (!anchorPure) return planned;
    const inner = patternSlotTarget(planned.prop.value);
    if (inner?.type !== 'ObjectPattern' || inner.properties.some(isRestProperty)) return planned;
    // Assignment extraction reads the iterator helper from its own constructor anchor.
    // Declaration residuals retain the raw symbol slot; the key still receives its polyfill.
    const anchorWks = [];
    const residualProps = (planned.kind === 'verbatim'
      ? inner.properties
      : planned.children.filter(c => c.kind !== 'consumed').map(c => c.prop)).filter(item => {
      const localName = declarator.type === 'VariableDeclarator' || leafDisabled(item)
        ? null : symbolIteratorLocalName(item, { scope, adapter, path });
      if (localName === null) return true;
      anchorWks.push({ synth: 'symbol-iterator', localName, anchorPure });
      return false;
    });
    // a TOP-LEVEL default on a residual leaf bails: the two bindings split there - one re-visits the
    // residual and polyfills the default, the other leaves it native - and that split is a binding
    // fact, not this plan's to decide. a DISABLED leaf likewise stays native.
    // A NESTED default does NOT bail: the render was what dropped its polyfill, and by the canon a
    // render silences only what it ANSWERS - a default's own claim is not this pattern's receiver
    // question, so the seeding rescues that value's subtree and the anchor stands
    if (residualProps.some(p => p.value?.type === 'AssignmentPattern' || leafDisabled(p))) return planned;
    // ... and a leaf whose key NAMES one of this ctor's polyfillable statics belongs to the MIRROR,
    // not to the anchor: the anchor reads that member off the bare `*/constructor` binding, which
    // installs none of the ctor's own statics, so the slot answers `undefined` unless some unrelated
    // module happens to import the same static and decorate the shared binding - an UNDER-inject that
    // depends on the rest of the bundle. The mirror spells the member's own ponyfill into a literal
    // right where the pattern reads it, which needs neither the shared decoration nor the index entry
    // (an OVER-inject). Asked through the key's SECOND spelling, the one that folds THROUGH an effect:
    // an effect-bearing key still names the member it names, and that prop is exactly the one the
    // flatten could not consume
    if (residualProps.some(p => residualLeafBelongsToMirror(p, name))) return planned;
    return { kind: 'anchored',
      prop: planned.prop,
      keyName: name,
      anchorPure,
      residualProps,
      extractions: [...planned.extractions ?? [], ...anchorWks] };
  }

  // Follow this nested property's folded key through the container path. A constructor plans
  // its statics; a proxy global plans realm properties; an unresolved intermediate descends again.
  // Unfoldable keys and values other than ObjectPattern stay verbatim.
  function planOuterPropStatic(outerProp, hostInit, walkPath) {
    const name = propKeyNameScoped(outerProp, isDestructurePattern(patternSlotTarget(outerProp.value)));
    if (name === null) return { kind: 'verbatim', prop: outerProp };
    const value = patternSlotTarget(outerProp.value);
    if (value?.type !== 'ObjectPattern') return { kind: 'verbatim', prop: outerProp };
    const newPath = [...walkPath, name];
    // `path` (the declaration / assignment site) lets the usage-pure reassignment gate inside
    // walkStaticReceiverStep prove a reassigned RECEIVER (`w = {}` after `{Arr:{from}} = w`) is
    // written AFTER the read - so the flatten resolves and collapses to `const from = _Array$from`
    // (polyfill-always-wins) instead of bailing to the native-wins default-injection
    const constructor = walkStaticReceiverChain({
      receiverNode: hostInit, walkPath: newPath, scope, adapter, path,
      // a DECLARATION and an ASSIGNMENT host both replay a discarded receiver read on both legs -
      // the emptied-init rescue and the emptied-pattern one - so a value only an object-literal
      // GETTER could name is answerable under either. the cascade's assignment host plans through a
      // SYNTHETIC declarator carrying no type of its own, so the host is read off the path there
      rescuesReceiverRead,
    });
    if (constructor && !POSSIBLE_GLOBAL_OBJECTS.has(constructor)) {
      return foldNestedPattern(outerProp, value, innerProp => planInnerProp(innerProp, constructor,
        { node: hostInit, walkPath: newPath }));
    }
    // a slot holding the REALM itself (`{ w: globalThis }`) is a proxy level: its ctor leaves consume
    // like the ones read off a proxy-global init (`{ w: { Map } } = { w: globalThis }` -> `const Map
    // = _Map`), and its ctor hops descend the same way - the static walk's own proxy lift, one level up
    if (constructor && POSSIBLE_GLOBAL_OBJECTS.has(constructor)) return foldNestedPattern(outerProp, value, planOuterProp);
    return foldNestedPattern(outerProp, value, innerProp => planOuterPropStatic(innerProp, hostInit, newPath));
  }

  // Strict source containment: equal or unknown spans cannot prove a duplicate rescue.
  function spanStrictlyContains(outer, inner) {
    return nodeRangeContains(outer, inner) && (outer.start !== inner.start || outer.end !== inner.end);
  }
  // Unknown spans stay eligible: a synthesized node's effect must not disappear from the harvest.
  function spanWithinSlot(node, host) {
    if (typeof node?.start !== 'number' || typeof host?.start !== 'number') return true;
    return node.start >= host.start && node.end <= host.end;
  }
  // a DECLARATION and an ASSIGNMENT host both replay a receiver read the render discards (the
  // emptied-init rescue and the emptied-pattern one), which is what lets a value only a getter can
  // name be resolved at all; the cascade's synthetic host carries no type, so it reads off the path
  const rescuesReceiverRead = declarator.type === 'VariableDeclarator'
    || path?.node?.type === 'AssignmentExpression';
  let plan = null;
  const pattern = declarator.id;
  if (pattern?.type === 'ObjectPattern' && pattern.properties.length) {
    // peel parens / chain / TS wrappers AND SE tail to a fixpoint so `(se(), R) as any`
    // (and nested forms like `(se(), (R as any))`) reach the receiver. without this,
    // TS-wrapped destructure inits bail the flatten path and the SE prefix never lifts
    let init = unwrapExpressionChain(declarator.init);
    // a RELOCATED loop head's pattern reads the iterated literal's element, not the minted name the
    // head now binds (the name channel's rule, `relocatedHeadElement`): the static-object descent
    // walks that element, and the render still prunes the pattern where it stands
    let declaratorPath = path;
    while (declaratorPath?.node && declaratorPath.node !== declarator) declaratorPath = declaratorPath.parentPath;
    const receiverPath = path?.node?.type === 'AssignmentExpression' ? path
      : declaratorPath?.node === declarator ? declaratorPath : null;
    const headElement = ownRelocatedHeadElement(receiverPath) ?? relocatedHeadElement(receiverPath);
    if (headElement) init = unwrapExpressionChain(headElement);
    // the discard-rescue harvest below must see the PRE-collapse node (a rescued IIFE call,
    // a chain assignment) - the collapse rewrites `init` to the resolution representative
    const initBeforeCollapse = init;
    // a fallback init collapses for identification like the flat meta (left for `||` / `??`,
    // right for `&&`, the consequent for an AGREEING ternary, the inlined return for a
    // transparent IIFE) - but the flatten BINDS the polyfill to the collapsed operand, so that
    // operand must be unconditionally taken: the init has to be wholly discardable (pure test,
    // no `&&` guard - a guard can select its falsy LEFT and that path's native short-circuit /
    // TypeError must survive). this holds for the cascade too - keeping the RHS tail verbatim
    // does not make a conditionally-evaluated receiver safe to bind unconditionally
    // A guarded realm element with sibling constructor branches is an accepted pure boundary:
    // existing mirrors or extractions may serve it; dropping its guard to recover statics may not.
    const fallback = collapseFallbackInit({ init, scope, adapter, path, resolveGlobalPolyfill });
    init = fallback.init;
    const { fallbackDropped } = fallback;
    // observable node in the init the flatten DISCARDS: a chain-assignment (rescued WHOLE - it
    // updates a binding and may contain an SE-bearing call) or an SE-bearing chain-root call.
    // harvested into the plan so the emit re-runs it once ahead of the extraction (full consume)
    // or keeps it verbatim in the residual init (partial consume).
    // span guard: `peelArrayWrapperPair` may have DEREFERENCED a const-alias wrapper
    // (`const w = [(IIFE)()]; [{x}] = w`) whose init lives OUTSIDE the discarded slot - its
    // setup already runs at the alias declaration, so harvesting it would double-run - and so
    // would a RELOCATED head's element, evaluated by the loop head the body declarator reads
    const probed = init && !headElement
      ? discardRescueNodesWithReads({ node: initBeforeCollapse, scope, adapter, path }) : [];
    const inSlot = declarator.init
      ? probed.filter(n => spanWithinSlot(n, declarator.init)) : [];
    const discardSe = inSlot.length ? inSlot : null;
    // `resolveObjectName` follows PROXY-GLOBAL chains only, so a receiver read off a static CONTAINER
    // (`({ w: Array }).w`, `[Array][0]`) names nothing there and the plan fell through to the static
    // descent, which plans only ObjectPattern-valued props - a peeled FLAT prop stayed verbatim and its
    // leaf lost the ponyfill its flat twin extracts. a PROXY name is not this fallback's to give: the
    // name resolver declines those deliberately (a mutated `globalThis.self` holds the user's own
    // object) and handing one back would open the proxy branch on the receiver it refused
    const proxyReceiver = init ? resolveObjectName({ objectNode: init, scope, adapter, path }) : null;
    // ... asked with the SAME rescue permission the static descent below gets: a declaration and an
    // assignment host both replay a receiver read they discard - the harvest above already names this
    // very read - so a container only an object-literal GETTER can name is answerable on them too.
    // refused here, a sole hop peeled down to that read resolved no receiver at all and every leaf
    // under it stayed native, where its effect-free twin extracts
    const containerReceiver = init && !proxyReceiver
      ? staticContainerReceiverName({ node: init, scope, adapter, path, rescuesReceiverRead }) : null;
    const receiver = proxyReceiver
      ?? (containerReceiver && !POSSIBLE_GLOBAL_OBJECTS.has(containerReceiver) ? containerReceiver : null);
    planReceiverName = receiver;
    // an UNDEFINABLE probe nav as the init (`globalThis.window?.self`, `globalThis.window?.Array`,
    // their sealed paren spellings): destructuring THROWS where the probe yields undefined, so an
    // anchored / flattened render reading an always-defined binding would erase that throw (and
    // run computed-key effects the source never reaches). asked of the init's VALUE - not its leaf
    // NAME - so every receiver shape (proxy global, constructor leaf, static object) carries the
    // verdict. a collapse that dropped a `||` / `??` / ternary fallback rescues the nullish path
    // by construction - the fallback IS the value there - so the probe stays off
    const probedNav = !!init && !fallbackDropped && proxyReceiverValueCanBeUndefined(init,
      ({ name }) => resolveGlobalPolyfill(name), { scope, adapter, path });
    // the PROBED value is the collapsed init - a fallback logical hands its selected operand
    // on (`(nav).Array ?? {}` probes `(nav).Array`), and the renders must not re-derive the
    // nav from the raw declarator slot, whose logical shape no guard render owns
    const probedNavNode = probedNav ? init : null;
    if (receiver && POSSIBLE_GLOBAL_OBJECTS.has(receiver)) {
      // single-key proxy-hop ANCHOR: `{ K: <pattern> } = <proxy>` on a value-discarded host
      // (the callers' contract - declarator inits are never read, the cascade gates on
      // statement context) plans like its flat twin `<pattern> = <proxy>.K`: inner props are
      // K's statics, and a residual re-anchors to the CONSTRUCTOR binding instead of reading
      // the native key off the proxy root (patch-visible for mutated statics, defined on
      // missing-global targets). qualification mirrors the retired normalize pre-passes:
      // exactly one Property, a non-proxy key naming a known built-in, non-empty (default-peeled)
      // inner ObjectPattern, effect-free init, no array wrapper. the anchored plan exists
      // even with ZERO extractions - the re-anchored residual is the point (a slot-mutated
      // ctor's patch lands on the routed binding). an SE-bearing init keeps the nested
      // handling: a member synthesized off a sequence would change the receiver shape the
      // SE-lift machinery expects; a side-effecting computed key keeps its in-place run
      // a disabled host line opts out of the reshaping (cascade callers stamp loc/start
      // onto their synthetic host so the per-line check reaches the real statement)
      // single-key ctor ANCHOR plan over `hostPattern` (`{ K: <inner> }` on the proxy receiver):
      // inner props are K's statics, and a residual re-anchors to the CONSTRUCTOR binding. a
      // `[Symbol.iterator]` leaf under the anchor extracts like its proxy-outer twin, with the
      // ANCHORED constructor as the synth receiver (`x = _getIteratorMethod(_Map)` /
      // `(_globalThis.Array)`) - the emitters' synth renders read the anchor base. a SLOT-mutated
      // ctor pair (`globalThis.Map = Shim` anywhere in the file) keeps the residual on the RAW
      // member read - a user-installed replacement must win there, so `anchorPure` stays null and
      // the renders emit `<proxyBinding>.<K>` instead of the ctor binding. extractions stay
      // leaf-gated (a mutated LEAF already planned verbatim upstream). null when the key names no
      // known non-proxy built-in (a capitalised user global is an unknown slot whose default stays
      // live), the inner is not a non-empty ObjectPattern, an opt-out
      // covers the hop or a leaf under it, a residual leaf's write would land the ponyfill in the
      // realm, or the MIRROR can spell that leaf with the member's own ponyfill
      function planCtorKeyAnchor(hostPattern) {
        const prop = hostPattern.properties.length === 1 && isPropertyNode(hostPattern.properties[0])
          ? hostPattern.properties[0] : null;
        const key = prop ? propKeyNameScoped(prop) : null;
        // a DEFAULT on the key's level stays live where the slot may be empty (`realmLevelNamesCtor`), and the
        // anchor would discard it (`{ WeakRef: { of } = Array }` read `of` off an empty slot)
        const inner = key && !POSSIBLE_GLOBAL_OBJECTS.has(key) && realmLevelNamesCtor(key, prop.value, adapter)
          ? patternSlotTarget(prop.value) : null;
        if (inner?.type !== 'ObjectPattern' || !inner.properties.length) return null;
        const restPure = constructorRestIndex({ name: key, patternNode: inner, resolveGlobalPolyfill });
        if (!restPure && inner.properties.some(isRestProperty)) return null;
        // an opt-out on the hop or on any leaf under it keeps the residual the user's own raw read:
        // anchored on the ponyfill constructor, a leaf the directive kept from importing its static
        // reads `undefined` off it (`{ groupBy } = _Map` without `map/group-by`) where the realm
        // object still carries the native - the unplugin's re-anchor render answers the same
        if (leafDisabled(prop) || inner.properties.some(leafDisabled)) return null;
        // a SLOT-mutated anchor holds the user's replacement: its STATICS are the shim's own,
        // so static leaves stay verbatim on the raw residual instead of extracting pure
        // statics. a `[Symbol.iterator]` leaf still extracts - the synth is receiver-based
        // and reads off the RAW anchor member, so the replacement stays visible through it
        const anchorSlotMutated = !!adapter.isMutatedStatic?.(receiver, key, path && { node: prop, path });
        const outerProps = inner.properties.map(p => restPure ? { kind: 'verbatim', prop: p } : planSymbolIteratorProp(p)
          ?? (anchorSlotMutated ? { kind: 'verbatim', prop: p } : planInnerProp(p, key)));
        const anchorPure = anchorSlotMutated ? null : resolveGlobalPolyfill(key);
        // ... and a residual leaf the MIRROR can spell with the member's own ponyfill declines the anchor
        if (anchorPure && !restPure && outerProps.some(p => p.kind === 'verbatim'
          && residualLeafBelongsToMirror(p.prop, key))) return null;
        // the level's dead default leaves with the pattern the anchored render replaces, the writes in it too
        if (prop.value.type === 'AssignmentPattern') noteRenderRetiredWrites(prop.value.right);
        return {
          receiver, anchor: key, probedNav, probedNavNode, anchorPure,
          outerProps, pattern: inner, discardSe, anchorSe,
        };
      }
      const { accounted: anchoredSeAccounted, anchorSe } = anchoredSeAccounting(declarator, declarator.init,
        { scope, adapter, path });
      const hopHostEligible = anchoredSeAccounted
        && !isDisabledProp?.(declarator) && pattern.properties.length === 1
        && isPropertyNode(pattern.properties[0]);
      if (hopHostEligible) plan = planCtorKeyAnchor(pattern);
      if (!plan) {
        const planned = pattern.properties.map(planOuterProp);
        // re-anchor missing-able ctor residuals only in the CLEAN case: an SE-free init where EVERY prop is
        // already consumed or anchorable. a verbatim sibling (always-present ctor / global alias / disabled
        // leaf) or an SE init routes through native-residual / proxy-hop handling that does not split per-
        // ctor, so those stay on the native residual (current behavior - bounded, no regression).
        // the SE that matters is the init's TAIL: a sequence prefix lifts to its own statement on every
        // host ahead of the render, so what the anchored residual would read is the quiet tail - the
        // same init the prefix-less twin anchors on (`{ Array: { from }, Set: { union } } = (eff(),
        // globalThis)` left `Set` on the proxy while its twin anchored `{ union } = _Set`). a chain
        // ASSIGNMENT tail is accounted the same way the single-key anchor accounts it: the discard
        // harvest rescues the write whole, and the residual reads the value it stored
        // ... and a wrapper a SPREAD keeps alive changes nothing here: the anchored prop leaves the
        // pattern for a declarator of its own like anywhere else, and the emitters keep the wrapper
        // standing as a husk for the iteration (the native residual would read the missing ctor)
        const initTail = unwrapCollectingSePrefixes(declarator.init, []);
        const reanchored = mayHaveSideEffects(initTail) && !isChainAssignment(initTail)
          ? planned : planned.map(p => anchorMissingAbleResidual(p, pattern, receiver));
        // require at least one CONSUMED (extracting) prop alongside the anchored one: babel's flatten
        // dispatch is usage-driven (it fires on a polyfillable leaf), so an ALL-anchored multi-ctor
        // declarator with no poly leaf never triggers babel while the shape-driven unplugin would - those
        // stay on the native residual (current behavior). a verbatim/rebuilt sibling also bails
        const outerProps = reanchored.every(p => p.kind === 'consumed' || p.kind === 'anchored')
          && reanchored.some(p => p.kind === 'anchored') && reanchored.some(p => p.kind === 'consumed')
          ? reanchored : planned;
        if (outerProps.some(hasExtractions)) {
          plan = { receiver, probedNav, probedNavNode, outerProps, pattern, discardSe };
        }
      }
      // a pattern hop that is ITSELF a proxy-global alias (`{ self: { x } } = globalThis`, deeper
      // `{ self: { window: { y } } }`, `{ globalThis: { Map: {...} } }`) binds nothing at the hop
      // levels: without a resolvable leaf it falls between the recursive fold (all-verbatim, no
      // plan) and the missing-able re-anchor (proxy names bail), and the raw residual reads the
      // hop off the pure root - undefined off-engine, destructure TypeError. peel consecutive
      // single-prop proxy hops like the member-chain prefix walk (`globalThis.self.x` ->
      // `_globalThis.x`), then re-try the ctor anchor on the peeled pattern (`{ globalThis:
      // { Map: { x } } }` -> `({ x } = _Map)`) or anchor the remainder on the receiver's own
      // always-defined binding. a slot-mutated hop, an opted-out one or an un-importable receiver
      // keeps the raw residual (patch visibility / the user's own read / no binding to anchor on)
      function planPeeledProxyHop() {
        const receiverPure = resolveGlobalPolyfill(receiver);
        if (!receiverPure) return null;
        let effPattern = pattern;
        let lastHop = null;
        while (effPattern.properties.length === 1 && isPropertyNode(effPattern.properties[0])) {
          const [prop] = effPattern.properties;
          const key = propKeyNameScoped(prop);
          if (!key || !POSSIBLE_GLOBAL_OBJECTS.has(key) || adapter.isMutatedStatic?.(receiver, key, path && { node: prop, path })
            || leafDisabled(prop)) break;
          const inner = patternSlotTarget(prop.value);
          if (inner?.type !== 'ObjectPattern' || !inner.properties.length
            || inner.properties.some(isRestProperty)) break;
          effPattern = inner;
          lastHop = key;
        }
        if (!lastHop) return null;
        return planCtorKeyAnchor(effPattern) ?? {
          receiver, anchor: lastHop, anchorPure: receiverPure, probedNav, probedNavNode,
          outerProps: effPattern.properties.map(planOuterProp),
          pattern: effPattern, discardSe, anchorSe,
        };
      }
      if (!plan && hopHostEligible) plan = planPeeledProxyHop();
    } else if (receiver && isStaticPlacement(receiver)) {
      // receiver is a known constructor (`Array` / `Map` / ...): pattern's properties
      // are direct method extractions. an ArrayPattern wrapper (with or without a rest
      // sibling) survives the residual render - the rebuilt pattern is spliced back into
      // the original LHS text
      const outerProps = pattern.properties.map(p => planInnerProp(p, receiver, { node: init }));
      if (outerProps.some(hasExtractions)) {
        plan = { receiver, probedNav, probedNavNode, outerProps, pattern, discardSe };
      }
    } else if (init) {
      // Indirect heap/class/call roots keep the existing common fallback. Literal
      // wrappers, including fixed aliases, no longer pay for static synthesis.
      const source = followConstIdentifierInit({ node: init, ctx: { scope, adapter, path } });
      const value = unwrapRuntimeExpr(decidedRunningOperand(source.node, source.ctx));
      if (value?.type !== 'ObjectExpression' && value?.type !== 'ArrayExpression') {
        const outerProps = pattern.properties.map(p => planOuterPropStatic(p, init, []));
        if (outerProps.some(hasExtractions)) {
          plan = { receiver: null, probedNav, probedNavNode, outerProps, pattern, discardSe };
        }
      }
    }
  }
  // a harvested node replays ONCE: the same node taken by two collectors (a call the host init IS,
  // rescued as the init and again as the call the peel stepped through) keeps its first entry, and a
  // node that CONTAINS another replays it - the peeled-hop rescue takes `<call>.w` where the discard
  // rescue already took the `<call>` it reads off, nodes identity cannot match - so the containing
  // span wins. asked once, BELOW every harvest, since the collectors reach one effect independently
  if (plan?.discardSe?.length > 1) {
    const harvested = plan.discardSe;
    plan.discardSe = harvested.filter((node, index) => harvested.indexOf(node) === index && harvested
      .every((other, otherIndex) => otherIndex === index || !spanStrictlyContains(other, node)));
  }
  if (plan && hostLevelSurvives(declarator, { peeled: false, ctx: { scope, adapter, path } })) {
    plan.wrapperSurvives = true;
  }
  // an effectful hop key keeps its level the way a rest does: the hop retires to a sentinel
  if (plan && patternKeepsEffectfulHop(pattern, { scope, adapter, path })) {
    plan.restKeepsLevel = true;
  }
  if (plan) {
    // These source decisions precede pattern pruning and are shared by every apply
    // of this plan. An anchored residual still reads a constructor, but not the init.
    const keepsRest = plan.pattern.properties.some(isRestProperty);
    const consumesPattern = !keepsRest && plan.outerProps.every(outer => outer.kind === 'consumed' || outer.kind === 'anchored');
    plan.evaluation = {
      consumesPattern,
      consumesAll: !keepsRest && !plan.restKeepsLevel && plan.outerProps.every(outer => outer.kind === 'consumed'),
      discardsInit: consumesPattern && !plan.restKeepsLevel,
    };
  }
  planCache.set(adapter, declarator, plan);
  return plan;
}

// --- catch-clause relocation ---

// whether `catch ({ pattern })` has to become `catch (_ref) { let { pattern } = _ref;` - the
// receiver a key lookup and a defaulted key both rewrite against. the answer is per PATTERN
// but composed of per-prop ones: a computed key hosting machinery forces the relocation on
// its own, and a plainly-resolvable key earns it only where the body actually READS what it
// binds - an unread one would buy an import plus a dead dispatcher call for nothing. those
// unread props come back so the caller can skip them, keeping them native reads in the
// residual. shallow by design: a nested pattern without outer-level machinery destructures
// in place, and its leaf bindings are catch-local, not polyfill candidates. an ARRAY pattern asks
// none of these questions - its bindings are positional, so there is no key to rewrite against a
// named receiver - and takes the single question its own branch asks instead
// does a leaf ANYWHERE below this pattern name a polyfillable member? this is the relocation's own
// question - what it buys is a DECLARATION HOST, and every claim below takes it, whatever else the
// pattern binds. the positional walk beside it answers a different one (may this element be RENAMED
// to a minted binding), and its sole-slot and bare-leaf rules exist because a rename drops what the
// pattern's other slots bind - restrictions with no bearing here, which is why a leaf with a
// SIBLING (`{ y: { flat, keep } }`) or under a DEFAULT (`{ y: { flat = x } }`) stayed native
// `undefaultedOnly`: the ELEMENT routes bind the dispatch IN PLACE of the slot, which leaves a
// default no arm to run - they decline it, so a pattern whose only claim carries one buys nothing
// from the relocation. the direct hosts fold that arm with a test ref and keep counting it
function patternHoldsClaim(node, resolvePure, undefaultedOnly = false, keyCtx = null) {
  const pattern = patternSlotTarget(node);
  if (pattern?.type === 'ArrayPattern') {
    return (pattern.elements ?? []).some(element => patternHoldsClaim(element, resolvePure, undefaultedOnly, keyCtx));
  }
  if (pattern?.type !== 'ObjectPattern' || pattern.properties.some(isRestProperty)) return false;
  return (pattern.properties ?? []).some(prop => {
    if (!isPropertyNode(prop)) return false;
    const key = consumableHopSlotName(prop, keyCtx);
    const defaulted = prop.value?.type === 'AssignmentPattern';
    const value = defaulted ? prop.value.left : prop.value;
    if (key !== null && (value?.type === 'Identifier' || memberTargetTakesExtraction(prop.value)) && !(undefaultedOnly && defaulted)
      && resolvePure({ kind: 'property', object: null, key, placement: null })) return true;
    return patternHoldsClaim(prop.value, resolvePure, undefaultedOnly, keyCtx);
  });
}

// the receiver a level hands the claim below it: the slot the literal pairs, or - where that slot
// holds `undefined` and the level spells a receiver-bearing DEFAULT (`[{ from } = Array]`,
// `{ k: { from } = Array }`) - the default, which the mirror then swaps in place of it. an unpaired
// slot with no such default stays null: nothing the head spells answers for it
function slotOrInnerDefault(elementNode, slotNode) {
  const fallback = elementNode?.type === 'AssignmentPattern' && destructureRightIsReceiver(elementNode.right)
    ? elementNode.right : null;
  return fallback && (slotNode === null || slotNode === undefined || isUndefinedNode(unwrapRuntimeExpr(slotNode))) ? fallback : slotNode;
}

// the literal a LEVEL of a head element holds, as the mirror reaches it: an inline one, a bound
// one, the one a transparent IIFE returns (descended in its body), the one a CALL yields - bound or
// not - spelled whole ahead of the call, with the slots the callee fills from its PARAMETERS mapped to
// the call's arguments (`paramArgs`); any other element passes through as written
function headLevelLiteral(receiver, ctx) {
  let node = unwrapRuntimeExpr(receiver);
  for (let inlined = peelZeroArgIifeReturn(
    node,
    { staticIsMutated: ctx.adapter.isMutatedStaticSlot ?? ctx.adapter.isMutatedStatic },
  ); inlined; inlined = peelZeroArgIifeReturn(
      node,
      { staticIsMutated: ctx.adapter.isMutatedStaticSlot ?? ctx.adapter.isMutatedStatic },
    )) node = unwrapRuntimeExpr(inlined);
  let hop = { node, readNode: node, seen: new Set(), ctx };
  if (node?.type === 'Identifier') {
    const followed = followConstIdentifierInit(hop);
    const value = followed.node;
    if (value?.type === 'ArrayExpression' || value?.type === 'ObjectExpression') return { literal: value, paramArgs: null };
    if (invocationNode(value)) hop = followed;
  }
  if (!invocationNode(hop.node)) return { literal: hop.node, paramArgs: null };
  const yielded = callYieldedLiteral(hop);
  const literal = yielded?.literal;
  return literal?.type === 'ArrayExpression' || literal?.type === 'ObjectExpression'
    ? { literal, paramArgs: yielded.paramArgs } : { literal: node, paramArgs: null };
}

// the slots a callee's literal fills from PARAMETERS, read as the call's arguments at EVERY depth
// (`x => [{ k: x }]`): a clone of the literal with those names replaced, for the predicate's
// descent - it reads the shape and resolves names, and never emits the clone
function substituteParamSlots(node, paramArgs) {
  if (!paramArgs?.args.size) return node;
  const value = unwrapRuntimeExpr(node);
  if (value?.type === 'Identifier') return yieldedSlotValue(paramArgs, node) ?? node;
  if (value?.type === 'ArrayExpression') {
    return { ...value, elements: value.elements.map(element => element && substituteParamSlots(element, paramArgs)) };
  }
  if (value?.type === 'ObjectExpression') {
    return { ...value, properties: value.properties.map(prop => isPropertyNode(prop) && !prop.computed
      ? { ...prop, value: substituteParamSlots(prop.value, paramArgs) } : prop) };
  }
  return node;
}

// the value a level's SLOT holds for the predicate: the element or property of that level's literal,
// a parameter-filled one read as the call's argument, at any depth below it - none where it reads a
// parameter the call proves nothing for (`yieldedSlotValue`)
function headLevelSlot(receiver, step, ctx) {
  const { literal, paramArgs } = headLevelLiteral(receiver, ctx);
  const slot = step.index !== undefined
    ? literal?.type === 'ArrayExpression' ? resolveCallArgument(
      literal.elements,
      step.index,
      ctx?.adapter?.isMutatedStaticSlot ?? ctx?.adapter?.isMutatedStatic,
    ) : null
    : literal?.type === 'ObjectExpression' ? objectLevelPairedProperty(literal, step.key)?.read ?? null : null;
  return slot && yieldedSlotValue(paramArgs, slot) && substituteParamSlots(slot, paramArgs);
}

// a leaf's claim off a level's receivers: a monkey-patched static has no meta, so it claims nothing there and
// its read stays native
function leafClaimOff({ key, receivers, ctx, resolvePure }) {
  const metas = receivers.map(receiver => buildDestructuringInitMeta({ initNode: receiver, key, ...ctx }));
  const claims = resolvePure({ kind: 'property', object: null, key, placement: null })
    || receivers.some((receiver, at) => {
      const candidates = [];
      const object = walkStaticReceiverChain({ receiverNode: receiver, walkPath: [], ...ctx, unionSink: candidates });
      return (metas[at] && resolvePure(metas[at]))
        || [object, ...candidates].some(name => name && resolvePure({ kind: 'property', object: name, key, placement: 'static' }));
    });
  return { metas, claims };
}

// does the mirror's literal serve a leaf's claim? only a polyfillable static of the constructor each
// receiver names through the init-meta canon the flat head asks too (`globalThis.Array`, `(e(), Array)`, a
// selection) - an instance claim passes through the literal natively, and a call's value is no slot for
// it: its mirror would respell the callee's return or argument
function mirrorServesLeaf({ prop, key, receivers, claim, resolvePure }) {
  return !!claim.claims && receivers.length > 0 && receivers.every((receiver, at) => {
    const meta = claim.metas[at];
    return !invocationNode(peelNestedSequenceExpressions(unwrapRuntimeExpr(receiver)).tail)
      && meta?.placement === 'static' && !!meta.object
      && !!resolvePolyfillableStaticProp({ prop, receiverName: meta.object, resolvePure, keyName: key });
  });
}

// does a bare level's mirror literal read a native leaf out of order (`passthroughOutrunsEffect`)? the
// literal reads every key it does not serve (`literalServes`) natively, whatever the slot's target - a
// key holding a pattern aside, whose own level is asked. a defaulted level is the default capture's,
// which keeps its reads in order (`planRetainedDefaultCapture`)
function levelPassthroughOutruns({ node, pattern, literalServes, ctx }) {
  if (node?.type === 'AssignmentPattern') return false;
  const passthroughs = pattern.properties.filter(prop => {
    if (!isPropertyNode(prop) || isDestructurePattern(patternSlotTarget(prop.value))) return false;
    const key = consumableHopSlotName(prop, ctx);
    return key === null || !literalServes(prop, key);
  });
  return passthroughs.length > 0 && passthroughOutrunsEffect({
    patternNode: pattern, isPassthrough: prop => passthroughs.includes(prop), ctx,
  });
}

// Does a nested claim need relocation beyond what the receiver mirror can serve?
// A static paired with every pristine receiver stays in the mirror, including supported
// pattern-valued statics. An unproven receiver leaves a binding claim to relocation, and so does
// a level the mirror's literal cannot carry (`unmirrored`: a rest, a key it cannot spell, or such a
// level above it). A claim under a hop slot another reader shares stays native
// (`claimUnderSharedHopSlot`) and needs no host.
function nestedClaimBeyondMirror(node, receivers, {
  scope,
  adapter,
  path,
  resolvePure,
  nestedOnly = false,
  sharedTop = node,
  sharedReceivers = receivers,
  unmirrored = false,
}) {
  const pattern = patternSlotTarget(node);
  if (pattern?.type === 'ArrayPattern') {
    const arrayUnmirrored = unmirrored || (pattern.elements ?? []).some(element => element?.type === 'RestElement');
    return (pattern.elements ?? []).some((element, index) => element && element.type !== 'RestElement'
      && nestedClaimBeyondMirror(element, receivers.map(receiver => slotOrInnerDefault(element,
        headLevelSlot(receiver, { index }, { scope, adapter, path }))),
      { scope, adapter, path, resolvePure, sharedTop, sharedReceivers, unmirrored: arrayUnmirrored }));
  }
  if (pattern?.type !== 'ObjectPattern') return false;
  const ctx = { scope, adapter, path };
  const leafClaims = new Map();
  function leafClaim(prop, key) {
    if (!leafClaims.has(prop)) leafClaims.set(prop, leafClaimOff({ key, receivers, ctx, resolvePure }));
    return leafClaims.get(prop);
  }
  function literalServes(prop, key) {
    return mirrorServesLeaf({ prop, key, receivers, claim: leafClaim(prop, key), resolvePure });
  }
  const levelUnmirrored = unmirrored || !patternKeysMirrorable({ paramNode: pattern, ...ctx })
    || levelPassthroughOutruns({ node, pattern, literalServes, ctx });
  return (pattern.properties ?? []).some(prop => {
    if (!isPropertyNode(prop)) return false;
    const key = consumableHopSlotName(prop, { scope, adapter, path });
    const value = patternSlotTarget(prop.value);
    if (key !== null && (value?.type === 'Identifier' || memberTargetTakesExtraction(prop.value))) {
      if (nestedOnly) return false;
      if (claimUnderSharedHopSlot({ top: sharedTop, receivers: sharedReceivers, prop, scope, adapter, path })) return false;
      if (!leafClaim(prop, key).claims) return false;
      return levelUnmirrored || !literalServes(prop, key);
    }
    // A pattern reading a static's own members is served by that static's mirror. Descending
    // the built-in as though it were a literal loses its value and needlessly relocates the head.
    if (key !== null && isMirrorablePatternValue(prop.value) && receivers.length
      && receivers.every(receiver => {
        const meta = buildDestructuringInitMeta({ initNode: receiver, key, scope, adapter, path });
        const pure = meta && resolvePure(meta);
        return pure?.kind === 'static';
      })) return false;
    // a level no mirror hosts, under a receiver the head names without spelling a literal (`[globalThis]`),
    // is handed that receiver's member read: a static-only key there (`of`) is then asked of the
    // constructor, as `values` already is by name - and that read is what the child's passthroughs are
    // asked off too
    const child = patternSlotTarget(prop.value);
    const unmirroredBelow = key === null ? [] : receivers.map(receiver => slotOrInnerDefault(prop.value,
      headLevelSlot(receiver, { key }, ctx) ?? (receiver ? memberFromKeyName(unwrapRuntimeExpr(receiver), key) : null)));
    const childUnmirrored = levelUnmirrored || (child?.type === 'ObjectPattern'
      && (!patternKeysMirrorable({ paramNode: child, ...ctx }) || levelPassthroughOutruns({
        node: prop.value,
        pattern: child,
        literalServes: (item, itemKey) => mirrorServesLeaf({
          prop: item,
          key: itemKey,
          receivers: unmirroredBelow,
          claim: leafClaimOff({ key: itemKey, receivers: unmirroredBelow, ctx, resolvePure }),
          resolvePure,
        }),
        ctx,
      })));
    const below = key === null ? [] : childUnmirrored ? unmirroredBelow : receivers.map(receiver => slotOrInnerDefault(prop.value,
      headLevelSlot(receiver, { key }, ctx)));
    return nestedClaimBeyondMirror(prop.value, below,
      { scope, adapter, path, resolvePure, sharedTop, sharedReceivers, unmirrored: childUnmirrored });
  });
}

// Read the source loop head and receiver proof before either binding relocates it. A
// declaration preserves its kind; a bare pattern assigns its existing targets each iteration.
// Receiver typing is primed before the catch/head admission query, including refused mirrors.
export function planLoopHeadExtraction(path, {
  adapter, resolvePure, walkNode, primeDestructureReceiverTypes,
  resolveForOfResolvedElement, resolvePropertyObjectType, toHint,
}) {
  const left = path.get('left');
  const assignment = isDestructurePattern(left.node);
  if (!assignment && (left.node?.type !== 'VariableDeclaration' || left.node.declarations.length !== 1)) return null;
  const declarator = assignment ? { id: left.node } : left.node.declarations[0];
  if (declarator.init || !declarator.id || declarator.id.type === 'Identifier') return null;
  const host = assignment ? left : left.get('declarations')[0];
  const typeProbe = firstPatternProp(assignment ? left : host.get('id'));
  if (typeProbe) primeDestructureReceiverTypes?.(typeProbe);
  const elementType = path.node.type === 'ForOfStatement' ? resolveForOfResolvedElement?.(path) ?? null
    : typeProbe ? resolvePropertyObjectType?.(typeProbe) ?? null : null;
  const plan = planCatchClauseExtraction({
    paramNode: declarator.id, bodyNode: path.node.body, scope: path.scope, adapter, path,
    resolvePure, walkNode, objectHint: toHint?.(elementType) ?? null,
    iterableNode: path.node.right, mirrorHosts: !!forOfHeadIterableElements(host), assignment,
  });
  return plan ? { ...plan, left, declarator, assignment, elementType } : null;
}

export function planCatchClauseExtraction({
  paramNode,
  bodyNode,
  scope,
  adapter,
  path,
  resolvePure,
  walkNode,
  objectHint = null,
  iterableNode = null,
  mirrorHosts = false,
  assignment = false,
}) {
  // The relocated pattern lands at the top of the body block, among that block's own lexical
  // names: one the pattern binds or reads there would redeclare it or resolve to it instead.
  // A labelled function declaration is lexical to the block too.
  const bodyNames = new Set();
  for (let stmt of bodyNode?.type === 'BlockStatement' ? bodyNode.body : []) {
    while (stmt?.type === 'LabeledStatement') stmt = stmt.body;
    for (const name of stmtRebindNames(stmt, [])) bodyNames.add(name);
  }
  if (bodyNames.size) {
    let binds = false;
    walkPatternIdentifiers(paramNode, id => { binds ||= bodyNames.has(id.name); });
    if (binds || identifierReferencedInSubtree(paramNode, bodyNames)) return null;
  }
  // an ARRAY param relocates for a claim under any of its elements: they bind by ITERATION, so the
  // per-prop questions below (which key is resolvable, which rewrite is observable) have no subject
  // here - what the relocation buys is a DECLARATION HOST, and the element rename takes it from
  // there, with everything the pattern binds beside the claim riding the residual that host can now
  // hold. the rename's own walk re-asks the narrower questions (plain key, statement slot) at emit
  const elementNodes = arrayLiteralIterableElements(iterableNode)?.filter(Boolean) ?? [];
  if (paramNode?.type === 'ArrayPattern') {
    // ... unless every claim below is the receiver mirror's, like the object pattern's below
    if (mirrorHosts) return nestedClaimBeyondMirror(paramNode, elementNodes, { scope, adapter, path, resolvePure })
      ? { unobservable: [] } : null;
    return (paramNode.elements ?? []).some(element => patternHoldsClaim(element, resolvePure, true, { scope, adapter, path }))
      ? { unobservable: [] } : null;
  }
  if (paramNode?.type !== 'ObjectPattern' || !paramNode.properties?.length) return null;
  // An opaque catch receiver with rest has no static proof; relocating buys no safe read.
  if (!iterableNode && paramNode.properties.some(isRestProperty)) return null;
  // WHICH channel answers decides whether the relocation is needed at all. the type channel buys a
  // DECLARATION HOST its dispatch cannot do without; a static off an element the source SPELLS is
  // something the receiver mirror puts in that element instead - no host, no minted name, no guard,
  // and it survives a later for-of lowering, which the relocated shape does not
  const viaElement = [];
  const resolvableProps = paramNode.properties.filter(prop => {
    if (!isPropertyNode(prop)) return false;
    // through the consuming canon: a bound computed key (`{ [k]: { at } }`) names the slot its
    // fold spells, so the relocation buys that claim its host like the literal spelling's
    const key = consumableHopSlotName(prop, adapter ? { scope, adapter, path } : null);
    if (key === null) return false;
    // Ask the same receiver question as the mirror before the instance fallback. A constructor
    // reached through a call, alias, container or selection still supplies its static in the
    // iterated element; relocating it first loses the only host the mirror can replace.
    const spelled = elementNodes.length > 0 && elementNodes.every(element => {
      const meta = buildDestructuringInitMeta({ initNode: element, key, scope, adapter, path });
      return meta?.placement === 'static' && resolvePure(meta)?.kind === 'static';
    });
    if (!spelled && resolvePure(objectHint
      ? { kind: 'property', object: objectHint, key, placement: 'prototype' }
      : { kind: 'property', object: null, key, placement: null })) return true;
    if (spelled) viaElement.push(prop);
    return spelled;
  });
  const hasMachinery = paramNode.properties.some(prop => computedPropKeyHostsMachinery({
    propNode: prop, scope, adapter, path, resolvePure,
  }));
  // ... and a prop whose VALUE is a nested pattern buys the same thing the array param buys: the
  // key here names no member, the claim sits below it, and what it lacks is a declaration host -
  // the relocation gives it one and its own route takes it from there (`catch ({ y: { flat } })`
  // stayed native while both its neighbours in this host - the flat prop and the array element -
  // claimed)
  // ... under a key the consume can NAME: a bound computed one folds, an evaluating one stays out
  const nestedClaim = paramNode.properties.some(prop => isPropertyNode(prop)
    && consumableHopSlotName(prop, adapter ? { scope, adapter, path } : null) !== null
    && patternHoldsClaim(prop.value, resolvePure, false, { scope, adapter, path }));
  // ... and a nested claim the mirror answers on every element is the mirror's, not a host's
  const nestedBeyondMirror = mirrorHosts
    ? nestedClaimBeyondMirror(paramNode, elementNodes, { scope, adapter, path, resolvePure, nestedOnly: true }) : nestedClaim;
  if (!hasMachinery && !nestedClaim && !nestedBeyondMirror && !resolvableProps.length) return null;
  // ... so a pattern the mirror HOSTS, whose every claim came from the element channel and whose
  // every key the literal can carry, is left to it: a rest gathers what no read names, a duplicate
  // key would need one property twice, and a key with no static spelling has no slot to sit in
  // ... and whose passthroughs the literal reads in order (`levelPassthroughOutruns`)
  if (mirrorHosts && !hasMachinery && !nestedBeyondMirror && viaElement.length === resolvableProps.length
    && patternKeysMirrorable({ paramNode, scope, adapter, path })
    && !levelPassthroughOutruns({
      node: paramNode, pattern: paramNode, literalServes: prop => resolvableProps.includes(prop), ctx: { scope, adapter, path },
    })) return null;
  // Assignment targets can be read outside the loop, beyond the body this plan sees.
  const unobservable = assignment ? [] : resolvableProps.filter(prop => !catchPropRewriteObservable({
    propNode: prop,
    patternNode: paramNode,
    bodyNode,
    localName: prop.value?.type === 'Identifier' ? prop.value.name : null,
    walkNode,
  }));
  if (!hasMachinery && !nestedClaim && !nestedBeyondMirror && unobservable.length === resolvableProps.length) return null;
  return { unobservable };
}

// can the mirror's literal carry EVERY key this pattern binds? the render spells one property per
// SLOT - a key the pattern REPEATS is one slot both readers read - so a shape its key predicate
// refuses is one the literal cannot stand in for at all, and a repeat is not such a shape
function patternKeysMirrorable({ paramNode, scope, adapter, path }) {
  const seenKeys = new Map();
  for (const prop of paramNode.properties) {
    if (mirrorAcceptedKey({ prop, scope, adapter, path, seenKeys }) === null) return false;
  }
  return true;
}

// does the climbed chain step through a NAMED inner default? the climb goes through one only where the
// outer chain names the receiver, so the default is dead and the pair the descent reaches is what the
// leaf reads (`{ k: { from } = Array } = { k: Array }`)
export function chainThroughNamedDefaults(chain) {
  return chain.some(level => {
    const value = level.hopProp?.value;
    return namedDefaultReceiver(value?.type === 'AssignmentPattern' ? value.right : level.defaultNode);
  });
}

// Choose the literal source, readers and capture before native insertion changes the host.
// A sole consumer may carry every initializer effect; a surviving literal owns its
// prefix, and a second reader shares one capture. Immediate insertion may apply that
// capture now; deferred insertion uses slotMemo only when the slot must be rewritten,
// and otherwise allocates the same capture through the residual plan.
// sourceBindingCount preserves the original readers when earlier edits shrank the pattern.
export function planLiteralRoute({
  metaPath, prop, kind, sentinel, chain, declarator, declaration, pureNav, forInit = false, adapter = null,
  entry = null, typedNavChain, allProxyInit = false, sourceBindingCount = patternBindingCount(declarator.id),
  patternCtx = { scope: metaPath.scope, adapter, path: metaPath },
}) {
  chain ??= destructureHostThroughWrappers(metaPath.parentPath, adapter, true)?.hops ?? [];
  sentinel ??= destructureReadKeepsKey(metaPath, kind, patternCtx);
  typedNavChain ??= entry === 'get-iterator-method' ? typedNavClaimChain(metaPath, { adapter }) : null;
  const declaratorConsumedWhole = sourceBindingCount === patternBindingCount(prop.value);
  const soleBinding = declaration.declarations.length === 1 && declaratorConsumedWhole;
  let literalReceiver = null;
  let relaxedReceiver = false;
  let carriedLive = null;
  const throughNamedDefaults = chainThroughNamedDefaults(chain);
  if (kind === 'instance' && !pureNav && chain.length > 0) {
    const receiverPlan = declaratorConsumedWhole && !sentinel && !throughNamedDefaults
      && resolveDestructureReceiverPlan(metaPath, {
        allowSeFreeSingleRead: true, adapter,
      });
    literalReceiver = receiverPlan?.channel === 'resolved' ? receiverPlan.node
      : resolveNestedReceiverNode(metaPath, { adapter, throughNamedDefaults }) ?? null;
    if (!literalReceiver) {
      const relaxed = resolveNestedReceiverNode(metaPath, {
        allowSeFreeSingleRead: true, adapter, throughNamedDefaults,
      }) ?? null;
      // a SENTINEL leaves a residual that reads the fragment a second time, so only a
      // value-SELECTING one qualifies for the relaxation: its memo is what makes the branch
      // select once for both readers. where the residual dies with the extraction, the slot must
      // also perform every effect the init would - a spread or getter beside it runs nowhere else
      if (relaxed && (!sentinel
        || relaxed.type === 'ConditionalExpression' || relaxed.type === 'LogicalExpression')
        && (!declaratorConsumedWhole || receiverPerformsEveryInitEffect(declarator.init, relaxed,
          adapter ? { scope: metaPath.scope, adapter, path: metaPath } : null))) {
        literalReceiver = relaxed;
        relaxedReceiver = true;
      }
      // ... and an EFFECT-bearing slot answers for itself through the shared canon: the effects only
      // matter while a residual survives to re-evaluate them, and a receiver that performs every
      // effect its init would leaves that residual nothing to do - the dispatch is the one read
      // ... asked of THIS DECLARATOR's own pattern, not of the declaration: a sibling declarator
      // keeps its own binding, and the consumed one splits off beside it - the split the other leg
      // already performs (`const { y: { at } } = { y: nb.y }, zn = 1`)
      // ... and only where the residual DIES: a level an effectful hop key keeps would run the
      // carried effect a second time beside the dispatch
      if (!literalReceiver && declaratorConsumedWhole && !sentinel) {
        const carried = carriedInitReceiverNode({ path: metaPath, initNode: declarator.init,
          resolveOptions: { throughNamedDefaults }, adapter });
        if (carried) {
          literalReceiver = carried;
          relaxedReceiver = true;
          // the slot is re-resolved at DRAIN: a claim INSIDE it renders by replacing its node, and
          // this plan-time copy predates that rewrite
          carriedLive = () => resolveNestedReceiverNode(metaPath, {
            allowInitCarriedEffects: true, adapter, throughNamedDefaults,
          }) ?? carried;
        }
      }
    }
  }
  // ... and a slot the plain walk cannot spell twice while the level stays WHOLE takes the slot
  // memo (`slotMemo`) shared with the other binding
  // ... a RELAXED single read (a member, a selection) beside a residual takes it too where an
  // observable property stands BEFORE the slot: hoisting the read would fire its getter ahead of
  // that property, so the memo is written in the slot instead
  // ... a level an effectful hop key keeps is a residual beside the claim exactly like a rest's
  const memoCandidate = kind === 'instance' && (!literalReceiver || relaxedReceiver)
    && (!declaratorConsumedWhole || hostLevelSurvives(declarator, { ctx: patternCtx }))
    && chain.length > 0 ? nestedSlotMemoPlan(metaPath, { adapter }) : null;
  const slotMemo = memoCandidate && (!literalReceiver || !memoCandidate.hoist) ? memoCandidate : null;
  if (slotMemo) {
    literalReceiver = slotMemo.node;
    relaxedReceiver = true;
  }
  const receiverCarriesInit = declaratorConsumedWhole && !sentinel && !!literalReceiver
    && receiverPerformsEveryInitEffect(declarator.init, literalReceiver,
      adapter ? { scope: metaPath.scope, adapter, path: metaPath } : null);
  let sentinelMemoEligible = sentinel && sentinelMemoInitShape(unwrapRuntimeExpr(declarator.init), allProxyInit || kind !== 'instance');
  // A surviving literal owns its prefix; the dispatch reads only the value it yields.
  // A consumed literal instead carries the whole sequence through the single read above.
  if (sentinel && chain.length > 0 && destructureHostLiteralSurvives(metaPath, adapter)) {
    literalReceiver = resolveNestedReceiverNode(metaPath, { adapter, allowSePeeledFragment: true })
      ?? (literalReceiver?.type === 'SequenceExpression' ? peelReceiverSequenceTail(literalReceiver) : literalReceiver);
  }
  // A sole constant literal has no second binding reader. A sibling keeps the shared capture.
  if (sentinel && !literalReceiver && !pureNav && !chain.length && !forInit
    && declaration.declarations.length === 1 && declarator.id.properties?.length === 1
    && (declarator.init?.type === 'ArrayExpression' || declarator.init?.type === 'ObjectExpression')
    && isReReferenceableReceiver(declarator.init)) {
    literalReceiver = declarator.init;
    sentinelMemoEligible = false;
  }
  // An anchored iterator read retains its raw default/key; a typed user navigation or
  // captured literal owns the slot instead. A host sibling cannot add a second hop read.
  const admitted = !chain.length || entry !== 'get-iterator-method'
    || !((prop.value.type === 'AssignmentPattern' && !typedNavChain) || computedKeyHasSideEffects(prop, patternCtx)
      || (declarator.id?.properties?.length > 1 && !typedNavChain && !slotMemo && !literalReceiver));
  // A loop header can carry the initializer in its dispatch; its other readers are
  // captured by forInitNeedsReceiverMemo. A receiverless claim may not discard effects.
  const forInitLiteral = !sentinel && !literalReceiver && !pureNav && forInit && !chain.length
    && (declaratorConsumedWhole || kind === 'instance')
    && (kind === 'instance' || !mayHaveSideEffects(declarator.init));
  if (forInitLiteral) literalReceiver = declarator.init;
  return {
    soleBinding,
    declaratorConsumedWhole,
    literalReceiver,
    relaxedReceiver,
    carriedLive,
    receiverCarriesInit,
    receiverConsumesInit: forInit && receiverCarriesInit,
    slotMemo,
    capture: memoCandidate,
    sentinelMemoEligible,
    memoSibling: sentinelMemoEligible,
    admitted,
    forInitLiteral,
  };
}

// A sentinel's residual and its extraction share one evaluation of a member, call,
// sequence or literal. A selection needs that capture unless both arms name the same
// realm surface. The caller unwraps the live source at its own evaluation boundary.
export function sentinelMemoInitShape(init, allProxyInit) {
  return init?.type === 'MemberExpression' || init?.type === 'CallExpression'
    || init?.type === 'SequenceExpression'
    || ((init?.type === 'ConditionalExpression' || init?.type === 'LogicalExpression') && !allProxyInit)
    || isConstantLiteralReceiver(init);
}

// Split native key reads immediately after each claimed property. An extraction/default
// then runs before the next segment's keys. Rest retains the entire exclusion set, and
// a nested claim belongs to its own level, so neither can split this pattern.
export function planDestructureKeySegments(pattern, claims) {
  if (pattern?.type !== 'ObjectPattern' || pattern.properties.some(isRestProperty)
    || claims.some(prop => !pattern.properties.includes(prop))) return null;
  const claimed = new Set(claims);
  const segments = [];
  let properties = [];
  for (const prop of pattern.properties) {
    properties.push(prop);
    if (!claimed.has(prop)) continue;
    segments.push({ properties, claim: prop });
    properties = [];
  }
  if (properties.length) segments.push({ properties, claim: null });
  return segments;
}

// does the surviving residual sit ahead of every extraction in SOURCE order? `sharedHop`
// admits the extraction's own hop as "ahead": a DECLARATION splits the hop into its own
// statement and the extraction leads it, while an ASSIGNMENT cascade keeps the nested
// extraction behind the residual it came out of - babel's own asymmetry between the two
export function residualPrecedesExtractions(pattern, claimedProps, sourceProps, { sharedHop = false } = {}) {
  const props = pattern?.type === 'ObjectPattern' ? pattern.properties : null;
  if (!props?.length || !sourceProps || !claimedProps.length) return false;
  const consumedAt = Math.min(...claimedProps.map(outer => {
    const index = sourceProps.indexOf(outer);
    return index === -1 ? sourceProps.length : index;
  }));
  return props.every(item => {
    const index = sourceProps.indexOf(item);
    return index !== -1 && (sharedHop ? index <= consumedAt : index < consumedAt);
  });
}

// the for-init memo verdict, per declarator. a SENTINEL residual re-reads the receiver:
// anything but a bare identifier / `this` memoizes first (`_ref = getArr(), findIndex =
// _f(_ref), { ..._unused } = _ref`) - but only where the extraction READS it too: a
// receiverless static leaves the residual as the only reader, and that read happens in
// place (the block-hosted rule). SEVERAL plain dispatches - or one beside a SURVIVING
// residual - must read ONE evaluation of the init the same way: the memo is a sibling
// declarator and every reader spells the ref (babel's head shape)
export function forInitNeedsReceiverMemo(declarator, claims, ctx) {
  const init = declarator?.init;
  const reusableInit = init?.type === 'ThisExpression' || init?.type === 'Identifier'
    && isReReferenceableAcrossReads(init, ctx);
  if (!init || reusableInit || claims.some(claim => claim.chain?.length)) return false;
  const readers = claims.filter(claim => claim.readsReceiver).length;
  const consumed = claims.reduce((total, claim) => total + patternBindingCount(claim.prop.value), 0);
  const residualLives = patternBindingCount(declarator.id) !== consumed;
  return claims.some(claim => claim.sentinel && claim.readsReceiver) || readers > 1
    || (readers === 1 && residualLives && claims.every(claim => !claim.sentinel))
    || (readers === 1 && claims.length > 1 && mayHaveSideEffects(init));
}

// Decide whether a literal receiver keeps a native residual read and whether the
// extraction shares a captured value with it. Claims provide source facts, not host
// operations. The binding allocates the selected ref and applies export/statement edits.
// A slot memo keeps its source evaluation point; a deferred memo keeps sibling numbering.
export function planLiteralResidual({
  kind, entry, prop, pattern, sentinel, declarator, declaration, soleBinding, literalReceiver, relaxedReceiver,
  declaratorConsumedWhole = false, carried = false, receiverConsumesInit = false,
  slotMemo = null, symbolPatternResidual = false, allProxyInit = false, forInit = false,
  ctx = {}, injectorState = null,
}) {
  // the key is kept when the residual still needs it. a SOLE binding leaves none, and
  // there the extraction may carry the init whole - including its effects, when the
  // receiver IS that init (`{ flat } = (c++, gt.self).Array.prototype || {}`)
  const carriesInitWhole = !!literalReceiver && literalReceiver === declarator.init;
  // ... spelled twice only where no getter of the pattern can rebind it (a name a function writes
  // is a single read, which the memo below serves like a relaxed member's)
  const reReadable = !!literalReceiver && (ctx.path
    ? isReReferenceableAcrossReads(literalReceiver, ctx)
    : isReReferenceableReceiver(literalReceiver));
  // a symbol-PATTERN sibling leaves a residual that still spells the key, so the memo
  // decision below must see the kept key - not learn about it after the fact
  // ... and a FOR-INIT host keeps the residual whatever the binding count: babel never
  // drops the loop-header declarator, the extraction appends as a sibling after it
  const keepKey = sentinel || symbolPatternResidual
    // the kept residual preserves ORDER in a MULTI-declarator - a preceding extraction could
    // TDZ-fault a receiver bound earlier in the same declaration - so a shared declaration keeps
    // it, and a for-INIT header keeps its own. unless keeping it would READ the receiver a SECOND
    // time: that is a defect, not a reorder risk, and the consumed declarator empties instead
    // (`const { y: { at } } = { y: nb.y }, zn = 1` fired the `y` getter twice). a receiver proven
    // to perform the complete init is not that case in a header: the dispatch is the init's one read
    // ... a SYMBOL leaf under a hop beside a SIBLING prop keeps its sentinel: the residual binds
    // the sibling, and the helper reads the slot the extraction spells (`{ w: { [S]: _unused }, z }`)
    || (entry === 'get-iterator-method' && !!literalReceiver && declarator.id?.properties?.length > 1)
    || (!receiverConsumesInit && kind === 'instance' && entry !== 'get-iterator-method' && !!literalReceiver
      && ((forInit && (carried || reReadable))
        || !((soleBinding || (declaratorConsumedWhole && !reReadable))
          && (relaxedReceiver || carriesInitWhole
            || !mayHaveSideEffects(declarator.init, ctx.path && ctx)))));
  // a MULTI-declarator host keeps the one declaration and appends the extraction as a
  // sibling declarator - the receiver is spelled twice there, so the memo never applies
  // (`const z = 1, { ..._unused } = R, m = _f(R);`)
  // ... and a SLOT memo keeps that join: the memo stands ahead (behind the leading siblings, whose
  // own inits run first) or is written in its slot, and the extraction is appended after the
  // residual either way - the shape the flat channel takes beside a sibling
  // ... and an SE-KEY sentinel takes the same join: its key runs in the residual, and the extraction
  // follows as a declarator like any other - the source reads the claim after the key
  const siblingAppend = keepKey && !!literalReceiver && declaration.declarations.length > 1;
  let memoizeReceiver = false;
  // a SENTINEL's residual re-reads its receiver, so a value-SELECTING one may not stay
  // spelled - the branch would be taken twice. the fragment memoizes and both readers take
  // the ref (`{ y: { [(k(), 'values')]: v } } = { y: c ? [1] : [] }`); an ALL-PROXY selection
  // re-reads for free and keeps its own shape
  const branchingReceiver = !allProxyInit && !!literalReceiver
    && (literalReceiver.type === 'ConditionalExpression' || literalReceiver.type === 'LogicalExpression');
  // ... and a CONSTANT LITERAL in a SLOT behind a sentinel memoizes too: spelling `[1, 2]` twice builds
  // two arrays where the source built one, and the other leg hands both readers one `_ref`. the whole
  // init stays the drain's sentinel-memo channel, which numbers its ref where babel does
  const slotLiteral = !!literalReceiver && literalReceiver !== unwrapRuntimeExpr(declarator.init)
    && isConstantLiteralReceiver(literalReceiver);
  if (keepKey && (!sentinel || branchingReceiver || slotLiteral || slotMemo)
    && literalReceiver && (literalReceiver.type !== 'Identifier' || !reReadable)) {
    // ... and a RE-READABLE built-in surface (`Array.prototype`) spells twice instead of memoizing:
    // the second read is free, and the other leg's residual keeps the source spelling. it overrides
    // every memo arm: a surface enters this block only under a pure key and no rest (no sentinel arm
    // admits one), which is where the shared key strategy exempts it as well
    const surfaceReRead = isReReadableSurfaceNav(literalReceiver, name => !!injectorState?.getBindingInfo?.(name),
      { ctx: ctx.path ? ctx : null });
    const relaxedMemoizable = relaxedReceiver
      && literalReceiver.type !== 'ArrayExpression' && literalReceiver.type !== 'ObjectExpression';
    memoizeReceiver = !surfaceReRead && (relaxedMemoizable || branchingReceiver
      || isConstantLiteralReceiver(literalReceiver) || !!slotMemo || !isReReferenceableReceiver(literalReceiver))
      // ... and a sibling join over a receiver it cannot spell twice memoizes it like a slot memo
      && (!siblingAppend || !!slotMemo || !isReReferenceableReceiver(literalReceiver)) && !forInit;
    if (!memoizeReceiver && !reReadable && !surfaceReRead) return null;
  }
  const consumeResidualRead = memoizeReceiver && !!planSideEffectKeyStrategy({
    polyfillKind: kind, entry, prop, pattern, hostPattern: declarator.id,
    sourceBindingCount: patternBindingCount(declarator.id), receiverNode: literalReceiver,
    capturedReceiverNode: literalReceiver, propKeyIsPure: !computedKeyHasSideEffects(prop, ctx),
  })?.consumeResidualRead;
  return { keepKey, siblingAppend, memoizeReceiver, consumeResidualRead, deferMemo: branchingReceiver || sentinel };
}

// A covered synth needs no receiver reader: each key resolves to a static value.
// Instance dispatch still needs that reader. A fallback resolves only its live left;
// the binding asks this before allocating any memo name.
export function synthPlanFullyCovered(plan, receiver, { contextFor, resolvePure }) {
  const value = unwrapRuntimeExpr(receiver);
  const named = value?.type === 'LogicalExpression' ? value.left : receiver;
  const objectName = named ? resolveObjectName({ objectNode: named, ...contextFor(named) }) : null;
  return !!objectName && plan.every(entry => typeof entry.lookupKey === 'string' && resolvePure({
    kind: 'property', object: objectName, key: entry.lookupKey, placement: 'static',
  })?.kind === 'static');
}

// Capture the guarded receiver's landing together with its source guard. Every accepted
// synth, including a selection arm, must read unresolved slots through that same proof.
// Rescue ownership is a source fact too: child rewrites can collapse the navigation
// before the queued render reads its live effects.
export function planSynthReceiverActivation({ receiver, scope, adapter, path, resolvePure }) {
  const synthGuard = planSynthReceiverGuard({ receiver, scope, adapter, path, resolvePure });
  return {
    synthGuard,
    dropRescueReceiver: shouldDropRescueReceiver(receiver.type === 'LogicalExpression' ? receiver.left : receiver),
    guardedReceiverPlan: synthGuard ? planProxyReceiver(unwrapRuntimeExpr(synthGuard.fallback?.left ?? receiver), {
      aliasCtx: { scope, adapter, path }, guardedProbe: synthGuard.probe, resolvePure,
    }) : null,
  };
}

// A synth consumes its receiver once. Partial call receivers use a stable tail or an
// activation parameter; full coverage keeps only the source probe or discarded effects.
// Guards own their effects and leave fallback evaluation outside the activation. Native
// bindings render saved read/probe plans and bind live slots, but do not select this order.
export function renderSynthReplacement(entries, {
  receiver,
  callBranch = false,
  rescueSe = null,
  guard = null,
  aliasCtx,
  dropRescueReceiver = shouldDropRescueReceiver(receiver.type === 'LogicalExpression' ? receiver.left : receiver),
  slotFor = entry => entry.polyfill,
  renderLiteral,
  renderMemoArgument,
  renderProbe,
  createMemo,
  cloneHost = cloneNode,
  embed = node => node,
}) {
  const source = receiver.type === 'LogicalExpression' ? receiver.left : receiver;
  const partial = callBranch && entries.some(entry => !slotFor(entry));
  let probe;
  function readProbe() { return probe ??= renderProbe?.() ?? false; }
  const argument = partial ? guard ? cloneHost(guard.fallback?.left ?? receiver)
    : renderMemoArgument?.() ?? readProbe()?.node ?? cloneHost(source) : null;
  const tail = argument && !guard ? peelNestedSequenceExpressions(argument).tail : null;
  const reusable = !!tail && isReusableReceiver(tail, { interveningEffects: true, ctx: aliasCtx });
  const memo = partial && !reusable ? createMemo() : null;
  const value = renderLiteral({ receiver: reusable ? tail : receiver, memo });
  if (!value) return null;
  if (guard || partial) return renderSynthActivation(embed(value), {
    guard, memo: memo ?? (reusable ? tail : null), argument, reusable,
  }, { embed });
  const savedProbe = readProbe();
  if (savedProbe) return sequenceExpression([...savedProbe.effects.map(embed), embed(value)]);
  // An instance slot already spells its receiver. A logical collapse discards only
  // its left; the dead right must neither run nor gain imports during re-traversal.
  const effects = rescueSe && !dropRescueReceiver ? [source]
    : entries.some(entry => slotFor(entry)?.instance) && receiver.type !== 'LogicalExpression' ? []
    : discardRescueNodes({ node: source, ...aliasCtx });
  return effects.length ? sequenceExpression([...effects.map(node => embed(cloneHost(node))), embed(value)]) : embed(value);
}

// A flat synthesized receiver reads statics through its selected constructor, while
// an instance entry reads the complete runtime selection. A memo parameter, if any,
// replaces both reads at apply time. This query resolves entries without injecting them.
export function planSynthLiteralReceiver(receiver, { aliasCtx, resolvePure }) {
  const readReceiver = receiver.type === 'LogicalExpression'
    ? peelNestedSequenceExpressions(receiver.left).tail : receiver;
  const globalPure = readReceiver.type === 'Identifier'
    ? resolvePure({ kind: 'global', name: readReceiver.name }) : null;
  const pure = globalPure && globalPure.kind !== 'instance' ? globalPure
    : proxyGlobalMemberCtorPure({ receiver: readReceiver, aliasCtx, resolvePure });
  return {
    readReceiver,
    pure,
    receiverCtorName: readReceiver.type === 'Identifier' && isStaticPlacement(readReceiver.name) ? readReceiver.name
      : aliasCtx && pure ? globalProxyMemberName({ node: readReceiver, ...aliasCtx }) : null,
    selectsInstance: receiver.type === 'LogicalExpression' || receiver.type === 'ConditionalExpression',
  };
}

// A flat synth has one value selection per source property: a resolved static, an instance
// dispatch on the runtime receiver, or a retained read. The saved entries own classification;
// native bindings supply imported names and cloning only. A captured receiver replaces every
// read, while a selection must stay whole for instance dispatch.
export function renderSynthLiteral(entries, {
  receiver,
  memo = null,
  aliasCtx = null,
  guardedReceiverPlan = null,
  sealedReceiverPlan = null,
  resolvePure,
  injectImport,
  slotFor = entry => entry.polyfill,
  cloneHost = cloneNode,
  cloneKey = cloneHost,
  embed = node => node,
  markSkipped = null,
  receiverPath = null,
  requireCoverage = false,
  resolvedSpelling = false,
  adapter = aliasCtx?.adapter,
}) {
  function imported(slot) { return identifier(slot.name ?? injectImport(slot.entry, slot.hintName)); }
  let receiverPlan;
  function planReceiver() {
    return receiverPlan ??= planSynthLiteralReceiver(receiver, { aliasCtx, resolvePure });
  }
  let reference;
  function receiverRef() {
    if (reference) return cloneNode(reference);
    const { readReceiver, pure } = planReceiver();
    if (memo) reference = embed(cloneHost(memo));
    else if (pure) reference = imported(pure);
    else {
      const plan = guardedReceiverPlan ?? planProxyReceiver(readReceiver, { aliasCtx, resolvePure });
      const collapsed = plan && renderProxyReceiverPlan(plan, { injectImport, embed, cloneHost });
      const guarded = !collapsed && aliasCtx && guardedNavPassthroughPlan(
        readReceiver,
        ({ name }) => resolvePure({ kind: 'global', name }),
        aliasCtx,
      );
      const sealed = !collapsed && !guarded && sealedReceiverPlan;
      const probe = sealed?.kind === 'passthrough' && aliasCtx ? guardedNavPassthroughPlan(
        sealed.boundary.inner,
        ({ name }) => resolvePure({ kind: 'global', name }),
        aliasCtx,
      ) : null;
      reference = collapsed ?? (guarded || sealed && (sealed.kind !== 'passthrough' || probe)
        ? renderClaimProbe(
          guarded ?? (probe ? { ...probe, boundary: sealed.boundary, key: sealed.key } : sealed),
          { injectImport, embed, cloneHost },
        ) : embed(cloneHost(readReceiver)));
      if (collapsed ? plan.kind === 'member' || plan.optional : receiverCarriesLiveOptional(readReceiver)) {
        reference = chainExpression(reference);
      }
    }
    return cloneNode(reference);
  }
  const properties = [];
  for (const entry of entries) {
    const spelled = renderSynthEntryKey(
      entry,
      { resolvedSpelling, resolvePure, injectImport, embed, cloneHost: node => cloneKey(node, entry) },
    );
    if (!spelled) return null;
    const { key, computed } = spelled;
    let slot = entry.optedOut ? null : slotFor(entry);
    if (slot?.unresolved || requireCoverage && !slot) return null;
    const receiverCtorName = !slot && !receiverPath && !entry.optedOut && !entry.raw && !computed
      ? planReceiver().receiverCtorName : null;
    if (!receiverPath && !slot && !entry.optedOut && !computed && receiverCtorName) {
      const candidate = resolvePure({ kind: 'property', object: receiverCtorName, key: entry.lookupKey, placement: 'static' });
      if (candidate?.kind === 'static') slot = candidate;
    }
    const dispatch = !slot && !entry.optedOut && entry.wks !== 'iterator' && !computed && receiverCtorName
      ? instanceHopDispatch({ ctorName: receiverCtorName, key: entry.lookupKey, resolvePure }) : null;
    function pathRead() {
      const ref = resolvePassthroughRef(
        {
          keyPath: [...receiverPath.keys, entry.lookupKey],
          receiverName: receiverPath.name,
          receiverIsProxy: receiverPath.proxy,
          adapter,
          resolveGlobalPolyfill: name => resolvePure({ kind: 'global', name }),
          resolveStaticPolyfill: (ctorName, slotKey) => staticHopPure({ ctorName, key: slotKey, resolvePure }),
          raw: entry.optedOut || entry.raw,
        },
      );
      let base = ref.pure ? imported(ref.pure) : identifier(ref.name);
      const pathDispatch = !ref.static && !computed && key.type !== 'Literal' && ref.path.length === 1
        && ref.path[0] === entry.lookupKey && aliasCtx ? instanceHopDispatch(
          { ctorName: ref.pure ? ref.ctor : ref.name, key: entry.lookupKey, resolvePure },
        ) : null;
      if (pathDispatch) return callExpression(imported(pathDispatch), [base]);
      for (const hop of ref.path) base = hop === entry.lookupKey
        ? renderSynthSlotRead({ base, key, computed, lookupKey: hop }) : memberFromKeyName(base, hop);
      return base;
    }
    let value;
    if (slot?.instance) {
      const source = slot.receiver;
      const sourcePure = source && aliasCtx && instanceSynthReceiverPure(source, { ...aliasCtx, resolvePure });
      const argument = source ? sourcePure ? imported(sourcePure) : embed(cloneHost(source))
        : planReceiver().selectsInstance ? embed(cloneHost(memo ?? receiver)) : receiverRef();
      value = callExpression(imported(slot), [argument]);
    } else if (slot) value = imported(slot);
    else if (!receiverPath && (dispatch || entry.wks === 'iterator' && !entry.optedOut)) {
      value = callExpression(imported(dispatch ?? SYMBOL_ITERATOR_PURE_RESULT), [receiverRef()]);
    } else {
      value = receiverPath ? pathRead() : renderSynthSlotRead({ base: receiverRef(), key, computed, lookupKey: entry.lookupKey });
      if (entry.wks === 'iterator' && !entry.optedOut && value.type === 'MemberExpression') {
        value = callExpression(imported(SYMBOL_ITERATOR_PURE_RESULT), [value.object]);
      }
    }
    if (entry.optedOut || entry.raw) markSkipped?.(value);
    properties.push(renderSynthProperty(key, value, { computed }));
  }
  return objectExpression(properties);
}
