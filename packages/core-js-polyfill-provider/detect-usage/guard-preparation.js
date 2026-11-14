import {
  isCallShape,
  chainSealsAShortCircuit,
  chainReadsThroughSeal,
  navValueCanShortCircuit,
  descendToChainRoot,
  callYieldCanBeUndefined,
  inlineCallProxyGlobalRoot,
  inlineCallReturnExpression,
  proxyGlobalRootName,
  proxyReceiverValueCanBeUndefined,
  planKeptSequenceTail,
  planProvenNavGuardCollapse,
  composableNavGuardPlan,
  inlineCallHasObservableEffects,
  peelChainRootValue,
  maximalProxyGlobalPrefix,
  navHasUnresolvableProxyHop,
  peelReceiverSequenceTail,
  resolveObjectName,
  pristineRealmHopKey,
  realmHopKeyName,
  unwrapParensCollectingEffects,
  undefinableOptionalGuard,
  peelPristineProxyHops,
  claimReceiverEvaluationMayThrow,
  keySideEffectsOnly,
  deleteHostAboveCarriedChain,
  unbackedProxyHopKey,
  sealedLayerBetween,
  receiverSideEffectsOnly,
  prependChainAssignmentEffect,
  discardRescueNodes,
  probeRenderedReceiver,
  ownChainOptionalObjects,
  staticMayEraseReceiver,
  directClaimProbePlan,
  directClaimProbeEffects,
  sealedChainBoundary,
  aliasRootedReadMayThrow,
} from './resolve.js';
import {
  isChainAssignment,
  isMemberAccessNode,
  observableSequenceElements,
  peelNestedSequenceExpressions,
  peelChainAssignment,
  peelChainAssignmentDeep,
  POSSIBLE_GLOBAL_OBJECTS,
  isPristineProxyGlobal,
  isReusableReceiver,
  staticMemberKeyName,
  kebabToCamel,
  receiverCarriesLiveOptional,
  isRenderedStoredValue,
  definedBranchOfGuardConditional,
  isNullLiteralNode,
  singleSequenceTail,
  unwrapRuntimeExpr,
  receiverContainsOptional,
  memberProxyHopName,
  migratableClaimSe,
  nodeSpan,
  openContinuationEnd,
  climbTransparentWrapperPath,
  invocationCalleeOf,
  nestedSequenceValueSpelling,
  mayHaveSideEffects,
  subtreeContainsNode,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  reEvaluationObservable,
  CHAIN_HOP_WRAPPER_TYPES,
  deleteHostAboveChain,
  staticFallbackSwapRedundant,
} from '../helpers/ast-patterns.js';
import { instanceSynthReceiverPure, isConstantLiteralReceiver } from './destructure.js';
import { identifier, memberFromKeyName, planReceiverMemo, sequenceExpression } from '../render.js';

// A guard may absorb the source continuation only while it owns its reads. A
// sealed callee keeps its reference outside: its first retained tail member must
// remain optional on the short-circuited value. Delete keeps the member operand.
// A realm hop can fold onto a defined alternate without changing that
// reference. Paths are live slots, read synchronously; all edits remain with the binding.
export function planGuardedClaimTail(path, { alwaysDefined = false, resolvePure = null } = {}) {
  let sealedTail = null;
  let first = null;
  let sealed = false;
  for (let cur = path, up = path.parentPath; up?.node; up = cur.parentPath) {
    const { node } = up;
    sealed ||= !!cur.node.extra?.parenthesized;
    if (CHAIN_HOP_WRAPPER_TYPES.has(node.type) && node.expression === cur.node) {
      cur = up;
      continue;
    }
    if (node.type === 'ParenthesizedExpression' && node.expression === cur.node) {
      sealed = true;
      cur = up;
      continue;
    }
    if (isMemberAccessNode(node) && node.object === cur.node) {
      if (!sealed) {
        if (node.optional) break;
        first ??= node;
      }
      cur = up;
      continue;
    }
    if (sealed && (isCallShape(node) && node.callee === cur.node
      || node.type === 'TaggedTemplateExpression' && node.tag === cur.node)) sealedTail = first;
    break;
  }
  if (sealedTail && alwaysDefined && !sealedTail.computed && resolvePure && unbackedProxyHopKey(sealedTail, resolvePure)) {
    sealedTail = null;
  }
  const deleteHost = deleteHostAboveChain(path, path.node, unwrapRuntimeExpr) || deleteHostAboveCarriedChain(path);
  const parent = path.parentPath;
  const call = isCallShape(parent?.node) && parent.node.callee === path.node && !parent.node.optional
    && !sealedLayerBetween(path.node, unwrapRuntimeExpr(path.node)) ? parent : null;
  return { sealedTail, deleteHost, call, absorb: !sealedTail && !deleteHost };
}

// A missed static still needs its backed constructor. The source receiver slot, its
// effects and its throw/optional boundary are one decision. A prototype keeps its
// `.prototype` hop; a surviving computed key keeps its own effects. Pending source
// is a native traversal fact: a binding that cannot revisit a moved receiver leaves
// its uncarried reads and live guard with the child visits, and records that owner.
// No import or render is committed while this question may still refuse the swap.
export function planStaticFallbackReceiver(node, meta, fallback, ctx, {
  resolvePure, resolveGlobal = resolvePure, mintedAliasRef, pendingReceiver = null,
}) {
  if (!fallback || !isMemberAccessNode(node) || node.object?.type === 'Super') return null;
  const reader = meta.placement === 'prototype' ? unwrapRuntimeExpr(node.object) : node;
  const receiver = reader.object;
  const definedReceiverRead = reader.optional ? reader : null;
  const receiverEffects = receiverSideEffectsOnly(meta.receiverEffectCount, meta.sideEffects) ?? [];
  const sequence = unwrapRuntimeExpr(receiver);
  if (meta.placement !== 'prototype' && meta.sideEffects?.length && sequence?.type === 'SequenceExpression'
    && unwrapRuntimeExpr(sequence.expressions.at(-1))?.type === 'Identifier'
    && receiverEffects.every(effect => sequence.expressions.slice(0, -1).some(prefix => subtreeContainsNode(prefix, effect)))
    && (meta.sideEffects ?? []).slice(meta.receiverEffectCount ?? 0).every(effect => subtreeContainsNode(node.property, effect))) {
    const tail = sequence.expressions.at(-1);
    if (!discardRescueNodes({ ...ctx, node: tail }).length) {
      return { kind: 'replace', receiver: tail, sequence, fallback, effects: [], hadChainAssign: false, definedReceiverRead };
    }
  }
  if (probeRenderedReceiver(node.object, ctx)) return { kind: 'retain' };
  const redundant = staticFallbackSwapRedundant(node.object, meta.sideEffects, { mintedAliasRef });
  if (pendingReceiver && (meta.placement === 'prototype'
    || discardRescueNodes({ ...ctx, node: pendingReceiver })
      .some(source => receiverEffects.every(effect => !subtreeContainsNode(effect, source)))
    || redundant || receiverEffects.length && receiverCarriesLiveOptional(pendingReceiver))) {
    return { kind: 'stage', receiver: pendingReceiver };
  }
  if (redundant) return { kind: 'retain' };
  const ordered = meta.protoCtorReceiverSE ? [...meta.protoCtorReceiverSE, ...receiverEffects] : receiverEffects;
  const effects = prependChainAssignmentEffect(receiver, ordered,
    meta.protoCtorChainAssignAt ?? meta.chainAssignInsertAt ?? ordered.length) ?? [];
  const hadChainAssign = effects.length > ordered.length;
  const guardAssigns = effects.filter(effect => !ordered.includes(effect));
  const optional = undefinableOptionalGuard(node, resolvePure, ctx);
  // The canonical probe can include a second read above the kept store. A root-only
  // assignment guard is a fallback, never a substitute for that observed read.
  const readAboveStore = optional.kind === 'guard' && isMemberAccessNode(unwrapRuntimeExpr(optional.object))
    && guardAssigns.some(assignment => subtreeContainsNode(optional.object, assignment));
  let guard = !readAboveStore && guardAssigns.length === 1 && effects.length === 1
    && !chainReadsThroughSeal(node, resolvePure, ctx)
    && !staticMayEraseReceiver(node, resolveGlobal, ctx) ? guardAssigns[0] : null;
  if (!guard) {
    const sequenceGuard = ownChainOptionalObjects(node).find(nestedSequenceValueSpelling) ?? null;
    guard = optional.kind === 'guard'
      ? (sequenceGuard && subtreeContainsNode(sequenceGuard, optional.object) ? sequenceGuard : optional.object)
      : optional.kind === 'erase' ? sequenceGuard : null;
  }
  if (guard) {
    // A sealed callee or template tag still reads a reference. Leave its member
    // in place; the constructor's guard supplies the receiver of that reference.
    const end = openContinuationEnd(node, ctx.path?.parentPath) ?? ctx.path;
    const slot = end && isMemberAccessNode(end.node) && climbTransparentWrapperPath(end);
    if (slot?.parentPath?.node && invocationCalleeOf(slot.parentPath.node) === slot.node) return { kind: 'retain', release: receiver };
    const lifted = effects.filter(effect => !guardAssigns.includes(effect) && !subtreeContainsNode(guard, effect));
    const orderedEffects = migratableClaimSe({ sideEffects: lifted, rootNode: guard, end: nodeSpan(node)?.end, node });
    if (!orderedEffects) return { kind: 'retain', release: receiver };
    return {
      kind: 'guard', receiver, fallback, guard, target: end, hadChainAssign, definedReceiverRead,
      prefix: orderedEffects.leading,
      effects: orderedEffects.migrated,
    };
  }
  const boundary = sealedChainBoundary(node);
  const probe = directClaimProbePlan(node.object, resolveGlobal, ctx)
    ?? (boundary?.member === node && (!node.computed || !mayHaveSideEffects(node.property))
      ? directClaimProbePlan(node, resolveGlobal, ctx) : null);
  // An unnameable computed read cannot be replaced by a named throw probe. Keep
  // the source member: its key still runs before a null receiver throws, once.
  // A fallback replaces only the receiver, so an effectful key is not its probe to replay.
  if (!probe && boundary?.member === node && chainReadsThroughSeal(node, resolveGlobal, ctx)) {
    return { kind: 'retain', release: boundary.inner };
  }
  // A bare alias has no erased receiver read to respell; its surviving member owns
  // the possible throw. Replacing that value would silently erase the exception.
  if (!probe && !node.optional && aliasRootedReadMayThrow(node.object, resolveGlobal, ctx)) return { kind: 'retain' };
  const emitted = probe ? directClaimProbeEffects({ decision: probe, node: probe }, effects) : effects;
  return {
    kind: 'replace', receiver, fallback, probe, effects: emitted,
    // Prepare only a standalone write. Mutating a probe's retained source here
    // would invalidate the paths it already recorded for the original value.
    hadChainAssign: hadChainAssign && (!probe || guardAssigns.some(write => emitted.includes(write))),
    // This replacement ends in the constructor itself, after every throw/effect.
    // Only the member reading that value is defined, not a method above it.
    definedReceiverRead,
  };
}

// A symbol receiver's collapsed root owns its dropped prefix. A later key effect
// takes that prefix through the replay channel; an optional access keeps it inside
// the receiver tested by the guard. A kept root can still be absent. This query
// retains source slots and resolves an import only when no kept value supplies them.
export function planSymbolReceiverRoot(proxyRoot, { sideEffects, receiverEffectCount = 0, resolvePure }) {
  if (!proxyRoot) return null;
  const pure = proxyRoot.keepRoot ? null : resolvePure({ kind: 'global', name: proxyRoot.rootName });
  if (!proxyRoot.keepRoot && !pure) return null;
  const lift = proxyRoot.droppedSe.length && sideEffects?.length && !proxyRoot.isOptionalAccess;
  return {
    receiver: proxyRoot.keepRoot,
    pure,
    prefixEffects: lift ? proxyRoot.droppedSe : [],
    receiverEffects: lift ? [] : proxyRoot.droppedSe,
    sideEffects,
    receiverEffectCount: receiverEffectCount + (lift ? proxyRoot.droppedSe.length : 0),
    optional: !!proxyRoot.keepRoot && !!proxyRoot.isOptionalAccess,
  };
}

// Order the first receiver evaluation before key effects, retaining quiet reads
// that can throw. A prepared guard already owns that first evaluation; otherwise
// a whole receiver can carry its own prefix, and only a stable value may be read
// again after a key. Capture is an application request, never an allocation here.
// sourceReceiver retains the source identity when native preparation cloned the first read.
// All slots belong to this synchronous question and remain in their source frame.
export function planReceiverEffects({
  receiver,
  firstReceiver = receiver,
  sourceReceiver = firstReceiver,
  sideEffects,
  receiverEffectCount = 0,
  guarded = false,
  seMode = null,
  receiverReads = 2,
  ctx = null,
}) {
  if (guarded && receiverEffectCount > 0) {
    return { receiver, effects: seMode === 'suppress' ? sideEffects : keySideEffectsOnly(receiverEffectCount, sideEffects) };
  }
  if (!guarded) receiver = firstReceiver;
  if (!sideEffects?.length) return { receiver, effects: sideEffects };
  const keyEffects = keySideEffectsOnly(receiverEffectCount, sideEffects);
  if (seMode === 'peel' && !keyEffects.length) return { receiver, effects: keyEffects };
  if (receiverReads === 1 && (seMode !== 'peel' && !keyEffects.length
    || !guarded && isConstantLiteralReceiver(unwrapRuntimeExpr(receiver)))) {
    return { receiver, effects: sideEffects.filter(effect => !subtreeContainsNode(sourceReceiver, effect)) };
  }
  const interveningEffects = keyEffects.length > 0;
  const prefixEffects = seMode === 'peel' && !guarded ? [] : sideEffects.slice(0, receiverEffectCount)
    .filter(effect => !subtreeContainsNode(sourceReceiver, effect));
  if (!reEvaluationObservable(receiver)
    && !(ctx?.adapter && ctx.scope && ctx.path && ctx.resolvePure
      && claimReceiverEvaluationMayThrow(receiver, ctx.resolvePure, ctx))
    && (!interveningEffects || isReusableReceiver(receiver, { interveningEffects, ctx }))) {
    return {
      receiver,
      effects: interveningEffects && !guarded ? [
        ...prefixEffects,
        ...observableSequenceElements([receiver], ctx, { preserveSourceReads: true }),
        ...keyEffects,
      ] : sideEffects,
    };
  }
  // A split may have put its generated capture inside the lookup. Evaluate that
  // write once before the key and reuse its private binding after the key runs.
  const source = unwrapRuntimeExpr(receiver);
  const memo = !guarded && source?.type === 'AssignmentExpression' && source.operator === '='
    && source.left.type === 'Identifier' && ctx?.injectorState?.isOwnPassGeneratedName?.(source.left.name)
    ? { firstReceiver: receiver, receiver: source.left, capture: false }
    : planReceiverMemo(receiver, { interveningEffects, ctx });
  return {
    ...memo,
    ordered: true,
    prefixEffects,
    keyEffects,
    interveningEffects,
  };
}

// does a nav (or bare identifier) bottom out on a realm root the binding-aware canon proves -
// a pristine proxy-global name or an alias of one, shadow bail included
function realmRootProves(node, aliasCtx) {
  const { root: cur } = descendToChainRoot(node, true);
  if (cur?.type !== 'Identifier') return false;
  const name = proxyGlobalRootName({ node: cur, ...aliasCtx });
  return !!name && POSSIBLE_GLOBAL_OBJECTS.has(name);
}

// Nullability of a canon-owned realm probe: a kept value and navigation through it
// have different guards. Inline calls answer for their yield; a known nullish or
// initless callee keeps its optional call guard. Opaque calls stay with the caller.
export function guardProbeUndefinable(probe, {
  path,
  scope = path?.scope,
  adapter,
  resolvePure,
  observableRead = false,
  nestedSeqUnproven = false,
}) {
  if (isCallShape(probe)) {
    const aliasCtx = { scope, adapter, path };
    const probeCallee = unwrapRuntimeExpr(probe.callee);
    // an INLINE-resolvable call answers with its YIELD, not its callee: a body navigating to
    // an environment probe (`() => globalThis.window`) is absent-able however defined the
    // callee is, and the `?.` above the call is the only thing standing between the collapse
    // and a read off `undefined`. the canonical question, the one the detection itself asks
    if (inlineCallProxyGlobalRoot({ callNode: probe, ...aliasCtx, rejectConditional: true })) {
      return callYieldCanBeUndefined(probe, aliasCtx, resolvePure);
    }
    if (probeCallee?.type === 'ArrowFunctionExpression' || probeCallee?.type === 'FunctionExpression') return false;
    if (proxyReceiverValueCanBeUndefined(probeCallee, resolvePure,
      { scope, adapter, path }, { throughChainAssign: true })) return true;
    // an INIT-LESS declaration (`let condFn;` + conditional assigns) is nullish on the
    // unassigned path - the callee canon only follows kept proxy writes
    if (probeCallee?.type === 'Identifier') {
      const calleeBinding = adapter.getBinding({ scope, name: probeCallee.name, path });
      if (calleeBinding?.node?.type === 'VariableDeclarator' && !calleeBinding.node.init) return true;
    }
    return false;
  }
  // a KEPT WRITE holds its VALUE: the canon judges what the write yields, while the
  // test clones the write whole (`null == (w = _globalThis.window)`). the write makes
  // the read OBSERVABLE, so a proxy spine below the probe hop counts as one surface
  const peeledProbe = unwrapRuntimeExpr(probe);
  let probeValue = peelChainAssignmentDeep(peeledProbe);
  // ... and it is the WRITE that makes it observable, not the peel: a sequence hands its tail's
  // value on and observes nothing, so a plain nav under one is judged by the value canon exactly
  // like its bare twin (`(eff(), globalThis.window.self)?.Promise.k` folds where the bare form does)
  let storeObserved = probeValue !== peeledProbe;
  // effectful sequence tails peel manually - the SE-bailing canon stops at them
  // (`(s = (e++, globalThis.self))` proves through the tail)
  for (;;) {
    if (probeValue?.type === 'SequenceExpression') {
      // ... ONE level for the routes that ASK it: a NESTED sequence is where the value canon
      // stops, so its value stays unproven and the guard over it lives
      // (`(d++, (c++, globalThis))?.Map.name`). a whole-swap claim reads no value through the
      // sequence and keeps the ordinary peel (`(d++, (c++, globalThis))?.Array.of` erases)
      const tail = singleSequenceTail(probeValue);
      if (!tail) {
        const deepTail = singleSequenceTail(probeValue, { nested: true });
        // ... but a tail carrying its OWN `?.` renders that guard itself - already rendered by an
        // earlier claim or still spelled - and a second one over it tests a value the first
        // already answered for
        const selfGuarded = receiverContainsOptional(deepTail)
          || (deepTail?.type === 'ConditionalExpression' && deepTail.consequent?.type === 'UnaryExpression'
            && deepTail.consequent.operator === 'void');
        // ... and the boundary speaks only for a spine the realm canon owns: a root the
        // binding-aware canon cannot prove (a SHADOWED realm name, a user binding) is the
        // user's value, and this verdict may not call it a probe - the ordinary walk decides
        if (nestedSeqUnproven && !selfGuarded
          && realmRootProves(deepTail, { scope, adapter, path })) return true;
        probeValue = deepTail;
        continue;
      }
      probeValue = tail;
      continue;
    }
    const dechained = peelChainAssignmentDeep(probeValue);
    if (dechained === probeValue) break;
    storeObserved = true;
    probeValue = unwrapRuntimeExpr(dechained);
  }
  // a bare ALIAS answers through the value canon like every other probe: an alias of an
  // entry-backed surface (`const g = globalThis`) holds the realm object and proves defined
  // there, an alias of a probe read (`const w = globalThis.window`) or of a rendered guard
  // (`null == _globalThis.window ? void 0 : _self`) holds a value that can be absent and keeps
  // its `?.`. asked of the NAME the alias resolves to instead, the guard render's alias read as
  // `self` - the defined branch the value canon classifies through - and the guard over a value
  // the other leg still tests was dropped
  return proxyReceiverValueCanBeUndefined(
    probeValue, resolvePure,
    { scope, adapter, path },
    { throughChainAssign: true, observableRead: observableRead || storeObserved });
}

// Locate a decided source, or the deepest raw slot, on this probe's member spine.
// A sequence owns its prefix and a store owns its whole value. Keep crossed hops
// so capturing a call can prove that the replaced span drops only realm navigation.
function optionalProbeSourceSlot(probe, source = null) {
  const target = unwrapRuntimeExpr(source);
  const hops = [];
  let slot = probe;
  let spine = unwrapRuntimeExpr(slot);
  for (;;) {
    if (source && spine === target) return { source: hops.length ? source : probe, hops };
    const hop = source ? spine : unwrapRuntimeExpr(peelReceiverSequenceTail(spine));
    if (!isMemberAccessNode(hop)) break;
    hops.push(hop);
    slot = hop.object;
    spine = unwrapRuntimeExpr(slot);
  }
  if (!source) return { source: slot, hops };
  return spine?.type === 'SequenceExpression' && target?.type !== 'AssignmentExpression'
    && unwrapRuntimeExpr(peelReceiverSequenceTail(spine)) === target ? { source: spine, hops } : null;
}

// A sealed or sequence-held navigation renders its own guard. The outer test reads
// that guard's source, with its prefix kept ahead of the guard rather than replayed.
function ownOptionalProbe(probe, ctx) {
  const sealed = TRANSPARENT_EXPR_WRAPPER_TYPES.has(probe?.type);
  let inner = sealed ? unwrapRuntimeExpr(probe) : null;
  for (let seq = inner ?? unwrapRuntimeExpr(probe); seq?.type === 'SequenceExpression';) {
    inner = unwrapRuntimeExpr(seq.expressions.at(-1));
    seq = inner;
  }
  if (!sealed && inner === null || chainReadsThroughSeal(inner, ctx.resolvePure, ctx)) return null;
  for (let hop = inner; isMemberAccessNode(hop); hop = unwrapRuntimeExpr(hop.object)) {
    if (hop.optional) return guardProbeUndefinable(hop.object, ctx) ? hop.object : null;
  }
  return null;
}

// A call below a constructor hop can be the guard's source. Strict local containers
// prove their intervening slots; a conditional inline yield retains its own void arm.
// Member reads keep the whole-chain guard verdict instead of being guessed from a key.
function callIsOptionalProbe(node, claimCtor, readNode, ctx) {
  const call = unwrapRuntimeExpr(node);
  if (!isCallShape(call) || call.optional) return false;
  const returned = claimCtor && inlineCallReturnExpression({ node: call, readNode, seen: new Set(), ctx },
    { rejectConditional: true });
  if (returned && unwrapRuntimeExpr(returned.node)?.type === 'ObjectExpression'
    && !inlineCallProxyGlobalRoot({ callNode: call, ...ctx, rejectConditional: true })) return true;
  const callee = unwrapRuntimeExpr(call.callee);
  const body = callee?.type === 'ArrowFunctionExpression' ? unwrapRuntimeExpr(callee.body) : null;
  if (body?.type === 'ConditionalExpression' && body.consequent?.type === 'UnaryExpression'
    && body.consequent.operator === 'void') return true;
  return proxyReceiverValueCanBeUndefined(call, ctx.resolvePure, ctx, { throughChainAssign: true });
}

// Choose the live optional's source and evaluation slots before either binding edits
// them. A claim reads its ponyfill past the probe; an instance reader still observes
// the call/sequence value. Effects are partitioned against the FINAL source, after
// constructor and seal descent. A memo captures a realm-only call span, including its
// sequence prefix. It tests the CALL yield even if the enclosing realm hop is backed:
// a claim's guard can erase there without proving that the captured call is defined.
// A memo request declines non-realm/computed hops before asking the value resolver.
// eslint-disable-next-line max-statements -- Source selection and effect ownership form one shared query.
export function planOptionalProbe(node, ctx, {
  hintName = null, reader = null, effects = [], receiverEffectCount, memoize = false, guardObject = null,
} = {}) {
  if (!ctx?.adapter || !ctx.resolvePure || !isMemberAccessNode(node)) return null;
  if (memoize) {
    if (!node.optional || node.computed || !memberProxyHopName(node)) return null;
    const { source, hops } = optionalProbeSourceSlot(node.object);
    const call = unwrapRuntimeExpr(peelReceiverSequenceTail(source));
    if (!isCallShape(call) || call.optional || hops.some(hop => hop.computed || !memberProxyHopName(hop))
      || !inlineCallProxyGlobalRoot({ callNode: call, ...ctx, rejectConditional: true })
      || !guardProbeUndefinable(call, ctx)) return null;
    return { probe: source, source, prefix: [], keySe: null, keepSequence: unwrapRuntimeExpr(source).type === 'SequenceExpression' };
  }
  function resolveGlobal(name) {
    return ctx.resolvePure({ kind: 'global', name });
  }
  // A supplied guard names the value, but its source slot may also carry a
  // sequence prefix. Keep that slot for the shared prefix-placement decision.
  let probe = node.optional && (!guardObject
    || unwrapRuntimeExpr(peelReceiverSequenceTail(node.object)) === unwrapRuntimeExpr(guardObject))
    ? node.object : guardObject;
  let cur = unwrapRuntimeExpr(node.object);
  let plainHops = true;
  while (!probe && isMemberAccessNode(cur)) {
    if (cur.optional) {
      probe = cur.object;
      break;
    }
    if (typeof realmHopKeyName(cur, ctx, { allowSideEffectKeys: true }) !== 'string') plainHops = false;
    cur = unwrapRuntimeExpr(cur.object);
  }
  if (!probe && isCallShape(cur) && cur.optional) probe = cur;
  if (!probe) return null;
  const navigated = isMemberAccessNode(reader) && unwrapRuntimeExpr(reader.object) === node;
  const call = unwrapRuntimeExpr(probe);
  const instanceRead = navigated && isCallShape(call) && !call.optional
    && ctx.resolvePure({ kind: 'property', object: 'function', placement: 'prototype',
      key: reader.computed ? null : reader.property?.name })?.kind === 'instance';
  let undefinable = !!guardObject || instanceRead || guardProbeUndefinable(probe, { ...ctx, nestedSeqUnproven: navigated });
  const claimCtor = hintName?.includes('$') ? hintName.split('$', 1)[0] : null;
  for (let inner = unwrapRuntimeExpr(probe); isMemberAccessNode(inner) && inner.optional && !inner.computed;
    inner = unwrapRuntimeExpr(probe)) {
    if (resolveGlobal(inner.property?.name) || inner.property?.name === claimCtor
      || callIsOptionalProbe(inner.object, claimCtor, node, ctx)) probe = inner.object;
    // Repeating the same realm probe adds no new absence condition. Different
    // environment names and stores still own their independent source reads.
    else if (pristineRealmHopKey(inner, ctx) === inner.property?.name
      && realmHopKeyName(unwrapRuntimeExpr(inner.object), ctx) === inner.property.name
      && guardProbeUndefinable(inner.object, { ...ctx, observableRead: true })) {
      probe = inner.object;
      undefinable = true;
    } else break;
  }
  const guarded = guardObject ?? undefinableOptionalGuard(node, ctx.resolvePure, ctx).object;
  const sourceSlot = guarded && optionalProbeSourceSlot(probe, guarded);
  if (sourceSlot) probe = sourceSlot.source;
  const descended = ownOptionalProbe(probe, ctx);
  if (descended) probe = descended;
  if (!undefinable || !plainHops) return null;

  const migration = migratableClaimSe({ sideEffects: effects, receiverEffectCount, rootNode: probe, end: node.end, node });
  if (!migration && effects?.length) return null;
  const keySe = migration?.migrated?.length ? migration.migrated : null;
  const navSe = migration ? migration.leading : effects;
  let source = unwrapRuntimeExpr(probe);
  const tail = source?.type === 'SequenceExpression' ? unwrapRuntimeExpr(source.expressions.at(-1)) : null;
  // A realm navigation keeps the source read and its prefix in the test, as the
  // navigation renderer does. Bare/alias roots still carry their effects outside.
  const keepSequence = !descended && (tail?.type === 'AssignmentExpression' || nestedSequenceValueSpelling(source)
    || isMemberAccessNode(tail) && POSSIBLE_GLOBAL_OBJECTS.has(hintName));
  const dropped = [];
  for (;;) {
    if (source?.type === 'SequenceExpression' && !keepSequence) {
      dropped.push(...source.expressions.slice(0, -1));
      source = unwrapRuntimeExpr(source.expressions.at(-1));
      continue;
    }
    // The probe owns a plain read above a sealed optional, including its throw.
    if (chainReadsThroughSeal(source, ctx.resolvePure, ctx)) break;
    const peeled = peelPristineProxyHops(source, { adapter: ctx.adapter, resolveGlobalPolyfill: resolveGlobal });
    if (peeled === source) break;
    source = peeled;
  }
  const effectsAreProbe = !navSe?.length || (navSe.length === 1
    && (navSe[0] === probe || unwrapRuntimeExpr(navSe[0]) === unwrapRuntimeExpr(probe)));
  return {
    probe, source,
    prefix: [
      ...!effectsAreProbe && navSe?.some(effect => !subtreeContainsNode(source, effect)) ? navSe : [],
      ...dropped.filter(effect => mayHaveSideEffects(effect) && !(navSe ?? []).includes(effect)),
    ],
    keySe, keepSequence,
  };
}

// Apply a kept-value decision to its native slot. The binding substitutes/embeds a
// detached probe before insertion; the decision and the chosen slot stay shared.
export function prepareKeptMemoTail(node, ctx, { prepareProbe = probe => probe, renderKeptTail }) {
  const plan = planKeptSequenceTail(unwrapRuntimeExpr(node), {
    adapter: ctx.adapter, aliasCtx: ctx,
    resolveGlobalPolyfill: name => ctx.resolvePure({ kind: 'global', name }),
  });
  if (plan) plan.holder[plan.key] = renderKeptTail({ ...plan, probe: plan.probe && prepareProbe(plan.probe) });
}

// A previously rendered guard and a still-source navigation describe the same
// composition: test its existing probe once, then read its defined value. A user
// conditional is not a rendered guard and keeps its own evaluation boundary.
export function planGuardComposition(value, ctx, { readThrough = true, readerKey = null } = {}) {
  const defined = isRenderedStoredValue(value) && definedBranchOfGuardConditional(value);
  if (defined && value.test?.type === 'BinaryExpression' && isNullLiteralNode(value.test.left)) {
    return { probe: value.test.right, receiver: defined };
  }
  return composableNavGuardPlan(value, { ...ctx, readThrough, readerKey });
}

// A prepared VALUE retains its kept sequence before navigation collapses. This is an
// application, not a speculative query: native slot writes occur only here, and the
// binding owns conversion/clone/re-entry bookkeeping for the rendered nodes.
export function prepareMemoReceiver(node, ctx, bindings) {
  if (!ctx?.adapter || !ctx.path || !ctx.resolvePure) return node;
  if (bindings.renderKeptTail) prepareKeptMemoTail(node, ctx, bindings);
  if (chainReadsThroughSeal(node, ctx.resolvePure, ctx)) return node;
  const nav = planProvenNavGuardCollapse({
    rootNode: node, ...ctx, allowSequenceRoot: true, descendSequenceTail: true,
  });
  // A nested navigation owns a live test; the guarded reader composes it at the read site.
  return nav && nav.kind !== 'nested' && !nav.topAssign && (nav.kind === 'sequence' || !nav.call || !guardProbeUndefinable(nav.call, ctx))
    ? bindings.renderNav(nav) : node;
}

// A dispatch can substitute a proven static receiver while keeping the effects of
// its source object and computed keys in evaluation order. The quiet proof view
// cannot erase a live optional, a sealed throw or an effectful realm hop. Application
// owns imports and cloning; a declined preparation returns the source unchanged.
export function prepareStaticReceiver(node, ctx, { injectImport, embed = source => source }) {
  if (!ctx?.adapter || !ctx.path || !ctx.resolvePure) return node;
  const receiverSequence = peelNestedSequenceExpressions(node);
  const receiver = receiverSequence.tail;
  const objectSequence = isMemberAccessNode(receiver) ? peelNestedSequenceExpressions(receiver.object) : null;
  const keySequence = isMemberAccessNode(receiver) && receiver.computed ? peelNestedSequenceExpressions(receiver.property) : null;
  const objectTail = objectSequence?.tail;
  const objectKeySequence = isMemberAccessNode(objectTail) && objectTail.computed
    ? peelNestedSequenceExpressions(objectTail.property) : null;
  const objectKey = objectKeySequence && staticMemberKeyName({ ...objectTail, property: objectKeySequence.tail });
  const quietObject = typeof objectKey === 'string' && !POSSIBLE_GLOBAL_OBJECTS.has(objectKey)
    ? memberFromKeyName(unwrapRuntimeExpr(objectTail.object), objectKey, { optional: objectTail.optional === true }) : objectTail;
  const staticKey = objectSequence && staticMemberKeyName(keySequence ? { ...receiver, property: keySequence.tail } : receiver);
  if (keySequence?.prefix.length && POSSIBLE_GLOBAL_OBJECTS.has(staticKey)) return node;
  const pureView = typeof staticKey === 'string'
    ? memberFromKeyName(quietObject, staticKey, { optional: receiver.optional === true }) : receiver;
  const pure = !navValueCanShortCircuit(node, ctx.resolvePure, ctx)
    && !chainSealsAShortCircuit(node, ctx.resolvePure, ctx)
    && !aliasRootedReadMayThrow(node, ctx.resolvePure, ctx)
    && instanceSynthReceiverPure(pureView, ctx);
  if (!pure) return node;
  const effects = observableSequenceElements([
    ...receiverSequence.prefix, ...objectSequence?.prefix ?? [], ...objectKeySequence?.prefix ?? [], ...keySequence?.prefix ?? [],
  ], ctx, { preserveSourceReads: true });
  const value = identifier(injectImport(pure.entry, pure.hintName));
  return effects.length ? sequenceExpression([...effects.map(effect => embed(effect)), value]) : value;
}

// A generated realm binding already has a canonical import source. Read that native
// injector fact without resolving the generated identifier as a user declaration.
export function mintedProxyGlobalName(name, injectorState) {
  const source = [...injectorState?.pureImports ?? []].find(([, minted]) => minted === name)?.[0];
  const global = source && kebabToCamel(source.split('/').at(-1));
  return POSSIBLE_GLOBAL_OBJECTS.has(global) ? global : null;
}

// A bare identifier or nonoptional call can hold a realm value. Scope remains
// authoritative even without a source path; optional calls keep their own guard.
function resolvedRealmValueName(value, ctx) {
  if (value?.type === 'Identifier') {
    if (POSSIBLE_GLOBAL_OBJECTS.has(value.name)) {
      return isPristineProxyGlobal(ctx.adapter, value.name)
        && !(ctx.scope && ctx.adapter.getBinding?.({ scope: ctx.scope, name: value.name, path: ctx.path })) ? value.name : null;
    }
  } else if (!isCallShape(value) || value.optional) return null;
  const name = ctx.scope && resolveObjectName({ objectNode: value, ...ctx });
  return name && POSSIBLE_GLOBAL_OBJECTS.has(name) && isPristineProxyGlobal(ctx.adapter, name) ? name : null;
}

// Realm navigation can contain stores made earlier in the SAME sequence. This is
// local evaluation order, not a flow proof of writes across a surrounding function.
export function holdsProxySurface(objectNode, ctx) {
  const prefix = [];
  let value = unwrapRuntimeExpr(objectNode);
  for (;;) {
    if (value?.type === 'SequenceExpression') {
      prefix.push(...value.expressions.slice(0, -1).map(unwrapRuntimeExpr));
      value = unwrapRuntimeExpr(value.expressions.at(-1));
    } else if (value?.type === 'Identifier' && prefix.length) {
      const at = prefix.findLastIndex(expr => expr.type === 'AssignmentExpression' && expr.left.name === value.name
        || expr.type === 'UpdateExpression' && expr.argument.name === value.name);
      if (at === -1) break;
      const write = prefix[at];
      // The RHS belongs to the instant of this store. A later conditional write, update
      // or effect that could change the binding defeats the surface proof.
      if (!isChainAssignment(write) || prefix.slice(at + 1).some(expr => {
        // A different local assignment can interfere only through its RHS.
        const local = isChainAssignment(expr) && expr.left.type === 'Identifier' && ctx.scope
          && ctx.adapter?.hasBinding?.({ scope: ctx.scope, name: expr.left.name, path: ctx.path });
        return mayHaveSideEffects(local ? expr.right : expr, ctx);
      })) return false;
      prefix.length = at;
      value = unwrapRuntimeExpr(write.right);
    } else if (isChainAssignment(value)) {
      value = unwrapRuntimeExpr(value.right);
    } else if (isMemberAccessNode(value)) {
      if (!pristineRealmHopKey(value, ctx)) break;
      value = unwrapRuntimeExpr(value.object);
    } else break;
  }
  return !!resolvedRealmValueName(value, ctx);
}

// The value a memo holds: a pristine realm surface, or a resolved constructor value.
// Decided selections and kept stores name the same constructor as their carried value.
// User properties, shadowed roots and mutated slots never acquire generated aliases.
export function memoReceiverGlobalName(objectNode, ctx, { constructors = false } = {}) {
  const value = peelChainRootValue(objectNode);
  const member = isMemberAccessNode(value);
  if (member) {
    const key = staticMemberKeyName(value);
    if (key && POSSIBLE_GLOBAL_OBJECTS.has(key) && holdsProxySurface(objectNode, ctx)) return key;
  }
  if (constructors && ctx.scope) {
    const name = resolveObjectName({ objectNode: value, ...ctx });
    if (name && /^[A-Z]/u.test(name) && !POSSIBLE_GLOBAL_OBJECTS.has(name)
      && !ctx.adapter.isMutatedStatic?.('globalThis', name)) {
      if (!member) return name;
      const host = resolveObjectName({ objectNode: peelChainRootValue(value.object), ...ctx });
      return host && POSSIBLE_GLOBAL_OBJECTS.has(host) && isPristineProxyGlobal(ctx.adapter, host) ? name : null;
    }
  }
  if (value?.type === 'Identifier' && !POSSIBLE_GLOBAL_OBJECTS.has(value.name)) {
    const minted = mintedProxyGlobalName(value.name, ctx.injectorState);
    if (minted) return minted;
  }
  return resolvedRealmValueName(value, ctx);
}

// Source provenance for re-entry differs from the held value above: a call yielding
// globalThis.window originates at globalThis, even when window is absent. This name
// does not prove definedness. Ordinary identifiers retain their existing provenance;
// generated pure bindings and captured expressions need an explicit memo alias.
export function memoReceiverOriginName(node, ctx) {
  const value = peelChainRootValue(node);
  if (isCallShape(value)) {
    const root = inlineCallProxyGlobalRoot({ callNode: value, ...ctx });
    return root && proxyGlobalRootName({ node: root, ...ctx });
  }
  if (value?.type === 'Identifier') {
    return ctx.injectorState?.isOwnPassPureBinding?.(value.name)
      ? proxyGlobalRootName({ node: value, ...ctx }) : null;
  }
  return memoReceiverGlobalName(node, ctx, { constructors: true });
}

// A pristine dotted realm hop can disappear from a guard's memo. Its unbacked
// sibling is the environment probe itself and must remain in the first read.
function backedMemoHop(node, ctx) {
  return isMemberAccessNode(node) && !node.computed && POSSIBLE_GLOBAL_OBJECTS.has(node.property?.name)
    && isPristineProxyGlobal(ctx.adapter, node.property.name)
    && ctx.resolvePure({ kind: 'global', name: node.property.name });
}

// A wholly backed realm spine reads the value of its kept root. Capture that root,
// not a navigation that would collapse to an always-defined ponyfill in the test.
// Unbacked hops are probes themselves and keep the whole receiver. Source wrappers
// and sequence prefixes belong to the captured slot; this query never rewrites it.
export function planGuardRootMemo(node, ctx) {
  if (!ctx?.adapter || !ctx.scope || !ctx.resolvePure || !isMemberAccessNode(node)) return null;
  if (maximalProxyGlobalPrefix(node, ctx, { throughChainAssign: true }) !== node
    || chainReadsThroughSeal(node, ctx.resolvePure, ctx)
    || navHasUnresolvableProxyHop(node, ctx.resolvePure, ctx)) return null;
  const spine = [];
  let holder = null;
  let root = node;
  while (isMemberAccessNode(root)) {
    spine.push(root);
    holder = root;
    root = unwrapRuntimeExpr(root.object);
  }
  return peelReceiverSequenceTail(root)?.type === 'AssignmentExpression'
    ? { spine, holder, source: holder.object } : null;
}

// A stored navigation already proved defined needs no outer value guard. A user's
// bare alias keeps its read; only a generated pure binding stands for a collapsed nav.
export function storedMemoProvesGuard(node, ctx) {
  const stored = peelChainAssignment(node);
  if (!stored.outer) return false;
  const nav = unwrapRuntimeExpr(peelChainRootValue(stored.value));
  return (isMemberAccessNode(nav)
    || nav?.type === 'Identifier' && !!ctx.injectorState?.isOwnPassPureBinding?.(nav.name))
    && maximalProxyGlobalPrefix(nav, ctx, { throughChainAssign: true }) === nav
    && !proxyReceiverValueCanBeUndefined(stored.value, ctx.resolvePure, ctx);
}

// A guard prepares its observed VALUE before allocating any ref. Whole source
// navigation owns effects before trailing hops are peeled; kept stores and calls
// yielding an environment probe retain their nullish branch. Bindings only render,
// clone and deoptionalize decided nodes; scope/type registration follows this result.
export function prepareGuardReceiver(objectNode, ctx, bindings, {
  bareMemo = false, mutatedLeaf = false, readerKey = null, interveningEffects = false,
} = {}) {
  const receiverPure = !mutatedLeaf && instanceSynthReceiverPure(objectNode, ctx);
  if (receiverPure) objectNode = bindings.pure(receiverPure);
  if (isReusableReceiver(objectNode, { interveningEffects, ctx })) {
    return { firstReceiver: objectNode, receiver: objectNode, capture: false, source: objectNode, surface: null };
  }
  const surface = memoReceiverGlobalName(objectNode, ctx);
  let memoSource = mutatedLeaf ? objectNode : prepareMemoReceiver(objectNode, ctx, { renderNav: bindings.renderNav });
  // Peeling cannot cross a sealed read. Prove this once for the whole spine,
  // not once per hop of the same shrinking source.
  if (memoSource === objectNode && surface && !chainReadsThroughSeal(memoSource, ctx.resolvePure, ctx)) {
    const rootMemo = planGuardRootMemo(objectNode, ctx);
    if (rootMemo) memoSource = rootMemo.source;
    for (let hop = unwrapRuntimeExpr(memoSource), pure; pure = backedMemoHop(hop, ctx);
      hop = unwrapRuntimeExpr(memoSource)) {
      if (hop.optional && !peelChainAssignment(unwrapRuntimeExpr(hop.object)).outer) {
        const effects = [];
        const call = unwrapParensCollectingEffects(hop.object, effects);
        const proven = isCallShape(call) && !call.optional
          && inlineCallProxyGlobalRoot({ callNode: call, ...ctx, rejectConditional: true })
          && !guardProbeUndefinable(call, ctx);
        if (proven && inlineCallHasObservableEffects({ callNode: call, ...ctx })) effects.push(call);
        memoSource = proven ? bindings.folded(pure, effects) : bindings.guarded(hop.object, pure);
        break;
      }
      memoSource = hop.object;
    }
    const call = unwrapRuntimeExpr(memoSource);
    if (isCallShape(call) && !call.optional && unwrapRuntimeExpr(call.callee)?.type === 'Identifier'
      && !guardProbeUndefinable(call, ctx) && !inlineCallHasObservableEffects({ callNode: call, ...ctx })) {
      const pure = ctx.resolvePure({ kind: 'global', name: surface });
      if (pure) memoSource = bindings.pure(pure);
    }
  }
  const peeled = bindings.cloneMemo(memoSource, bareMemo);
  const core = unwrapRuntimeExpr(peeled);
  if (core?.type === 'SequenceExpression'
    && !receiverCarriesLiveOptional(singleSequenceTail(core, { nested: true }))) {
    prepareKeptMemoTail(core, ctx, bindings);
  }
  const memo = planReceiverMemo(peeled, { interveningEffects, ctx });
  if (!memo.capture) return { ...memo, source: objectNode, surface };
  const composed = planGuardComposition(objectNode, ctx, { readerKey });
  if (composed) return { firstReceiver: composed.probe, receiver: composed.receiver ?? bindings.pure(composed.pure),
    capture: false, source: objectNode, surface };

  // A plain backed hop already throws before a later optional. A kept call yield
  // proves no definedness on its own; inside our rendered test that read is observed.
  const rendered = peeled.type === 'ConditionalExpression';
  const spine = rendered ? unwrapRuntimeExpr(peeled.test?.right) : peeled;
  for (let hop = spine; isMemberAccessNode(hop); hop = unwrapRuntimeExpr(hop.object)) {
    let base = unwrapRuntimeExpr(hop.object);
    let crossedHop = false;
    while (backedMemoHop(base, ctx) && !base.optional) {
      base = unwrapRuntimeExpr(base.object);
      crossedHop = true;
    }
    const written = base?.type === 'AssignmentExpression' ? unwrapRuntimeExpr(peelChainAssignmentDeep(base)) : null;
    const proven = (written ? rendered || !isCallShape(written) : false)
      || (rendered && isCallShape(base) && !base.optional
        && !!inlineCallProxyGlobalRoot({ callNode: base, ...ctx, rejectConditional: true }));
    if (hop.optional && proven && (crossedHop || !guardProbeUndefinable(base, ctx))) bindings.deoptionalize(hop);
  }
  return { ...memo, source: objectNode, surface };
}

// an optional STATIC member keeps its guard routes when its OBJECT can genuinely be undefined -
// a live `?.` inside it, or a value read THROUGH a kept write
export function optionalMemberStaysGuarded(node, { path, adapter, resolvePure, observableRead = false }) {
  // the INSTANCE route reads a VALUE through the sequence, so a nested one leaves it unproven
  const seqOpts = { path, adapter, resolvePure, nestedSeqUnproven: true };
  // a `?.` inside the receiver guards only when its PROBE can genuinely be undefined -
  // a chain of always-defined reads erases whole (`globalThis?.Array?.from` -> `_Array$from`).
  // the inner probe being defined answers only for the hops BELOW: the hop's own READ can
  // still be the environment probe, and that value is what OUR `?.` tests
  // (`globalThis?.window?.self` - `globalThis` is defined, `window` is not backed, the guard stays)
  let cur = unwrapRuntimeExpr(node.object);
  while (isMemberAccessNode(cur)) {
    if (cur.optional) {
      if (guardProbeUndefinable(cur.object, seqOpts)) return true;
      // The extended value question needs a proven realm root, including a source alias.
      // Its spelling alone cannot distinguish a realm alias from an unrelated binding.
      const { root } = descendToChainRoot(cur);
      if (!proxyGlobalRootName({ node: root, scope: path.scope, adapter, path })) return false;
      // ... asked of the RECEIVER, which is the value OUR `?.` tests - not of this link. hops
      // standing between them are realm self-references the collapse assumption defines, so the
      // link's own verdict guarded a run whose plain twin folds whole
      // (`globalThis?.window.window?.self` reads the realm exactly like `globalThis.window.window?.self`)
      break;
    }
    cur = unwrapRuntimeExpr(cur.object);
  }
  if (isCallShape(cur) && cur.optional) return guardProbeUndefinable(cur, seqOpts);
  let probeObject = unwrapRuntimeExpr(node.object);
  let sawWrite = false;
  while (probeObject?.type === 'AssignmentExpression') {
    sawWrite = true;
    probeObject = unwrapRuntimeExpr(probeObject.right);
  }
  // a BARE call value guards even proven (the strict opaque-root canon: `(() =>
  // globalThis)()?.self...` keeps its test); a KEPT WRITE of it erases (the write observes)
  if (!sawWrite && isCallShape(probeObject) && !probeObject.optional) return true;
  return proxyReceiverValueCanBeUndefined(probeObject, resolvePure,
    { scope: path.scope, adapter, path }, { throughChainAssign: true, observableRead });
}
