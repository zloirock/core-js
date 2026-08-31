import { discardRescueNodes, navValueCanShortCircuit, vestigialNavOptionals } from '@core-js/polyfill-provider/detect-usage/resolve';
import { planInExpression } from '@core-js/polyfill-provider/helpers/in-expression';
import {
  SYMBOL_ITERATOR_PURE_RESULT,
  isSourcedSymbolIteratorMeta,
  planProxyReceiver,
  resolveSymbolIteratorEntry,
  symbolIteratorHint,
} from '@core-js/polyfill-provider/detect-usage/members';
import {
  claimIsInert,
  deleteHostAboveChain,
  isDeoptedGlobalSlotRead,
  isReusableReceiver,
  isTaggedTemplateTag,
  mayHaveSideEffects,
  mutatedSlotLeftNativeWarning,
  peelParenAndTSParentPath,
  receiverCarriesLiveOptional,
  unwrapRuntimeExpr,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  subtreeContainsNode,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { remapInheritedStaticMeta } from '@core-js/polyfill-provider/helpers/class-walk';
import { ownEmittedNavClaim, ownOutputTests } from '@core-js/polyfill-provider/detect-usage/own-output';
import {
  assignmentExpression,
  callExpression,
  chainExpression,
  cloneNode,
  identifier,
  memberExpression,
  sequenceExpression,
  nullGuardTest,
  nullFirstGuardTest,
  renderInExpressionPlan,
} from './builders.js';
import { receiverCarriesOptional, renderProxyReceiverPlan, withSideEffects } from './emit-shared.js';
import {
  calleeParenWrapped,
  guardProbeUndefinable,
  optionalMemberStaysGuarded,
  replaceGuardedHop,
  sealedClaimThrowProbe,
  sealedThrowRidesTheClaim,
} from './claim-guards.js';
import {
  climbToCallerPath,
  foldPendingReceiverSpineRoot,
  markSubtreeSkipped,
  noteUnbackedHopAliasInit,
  optionalsAreSealed,
  sourceSpanKey,
} from './nav-spine.js';
import { collapseSymbolProxyRoot, emitSealedKeySeConsume, isSealedDirectSymbolCall } from './se-dispatch.js';
import createProxySpineChannel from './proxy-spine.js';
import createOptionalDispatchChannel from './optional-dispatch.js';

// the AST engine's usage-pure emission - a STAGED port of the babel leg's
// `usagePureCallback` (the design's blueprint): the mainstream classes land first and every
// shape the port does not carry yet BAILS to the raw source, where the structural gate
// counts it against the babel baseline. the bail is the honest state: raw source plus a
// missing import is a visible divergence, never a silently wrong rewrite

function claimIsMoot(metaPath, node, { isDisabled, skippedNodes, isInTypeAnnotation }) {
  // DETACHMENT is this leg's own question - estree-toolkit reports it as `removed` on the path,
  // and a claim under a subtree a render RE-EMITS BY IDENTITY stays live: its rewrite lands on
  // the (possibly detached) original, which the re-emission carries into the output
  for (let up = metaPath; up?.node; up = up.parentPath) {
    if (skippedNodes.keepLive?.has(up.node)) break;
    if (up.removed) return true;
  }
  // ... the four SHAPE questions are the shared ones
  return claimIsInert({ node, path: metaPath, isDisabled, skippedNodes, isInTypeAnnotation });
}

function markDeleteHostedSpine(node, marks, storeKeepsShortCircuit) {
  for (let cur = unwrapRuntimeExpr(node); cur;) {
    const key = sourceSpanKey(cur);
    if (key) marks.add(key);
    switch (cur.type) {
      case 'MemberExpression':
        cur = unwrapRuntimeExpr(cur.object);
        break;
      case 'CallExpression':
      case 'NewExpression':
        cur = unwrapRuntimeExpr(cur.callee);
        break;
      // a WRITE stores what stands below it. the navigation ABOVE the write folds freely - the
      // store keeps its own value and the fold only re-reads it - but a stored value with its
      // OWN short-circuit is the source's act: folding that hands the user's variable the
      // ponyfill where native stores undefined, so the erase verdict stops there
      case 'AssignmentExpression':
        if (storeKeepsShortCircuit(unwrapRuntimeExpr(cur.right))) return;
        cur = unwrapRuntimeExpr(cur.right);
        break;
      default:
        return;
    }
  }
}

// an OPTIONAL member with a harvested SE key over a REUSABLE receiver: the receiver is its own
// null test - no memo is owed - and the key effects run INSIDE the branch, because native skips
// the property read entirely when the receiver is nullish (`arr?.[(probe(), 'includes')](42)`)
// the slot-deopt DIAGNOSTIC: a global slot
// the file writes ITSELF keeps its reads native, and the debug report says so once per name
function noteDeoptedSlotRead(meta, { getDebugOutput, adapter, noted }) {
  const debug = getDebugOutput?.();
  if (!debug || noted.has(meta?.name) || !isDeoptedGlobalSlotRead(meta, adapter)) return;
  noted.add(meta.name);
  debug.warn?.(mutatedSlotLeftNativeWarning(meta.name));
}

// does the receiver SPELL its own harvested effects - the prefix of a sequence whose tail
// is the ctor the fallback resolves, the key's effects staying in the key's own subtree?
// then the swap has no erasure to compensate: it lands on the tail and everything else
// keeps running where the source wrote it
function fallbackSwapsSequenceTail(node, meta) {
  const receiver = unwrapRuntimeExpr(node.object);
  if (receiver?.type !== 'SequenceExpression'
    || unwrapRuntimeExpr(receiver.expressions.at(-1))?.type !== 'Identifier') return null;
  const effects = meta.sideEffects ?? [];
  const prefix = receiver.expressions.slice(0, -1);
  const recvHeld = effects.slice(0, meta.receiverEffectCount ?? 0)
    .every(effect => prefix.some(expr => subtreeContainsNode(expr, effect)));
  const keyHeld = effects.slice(meta.receiverEffectCount ?? 0)
    .every(effect => subtreeContainsNode(node.property, effect));
  return recvHeld && keyHeld ? receiver : null;
}

function chainAssignStaged(meta) {
  return meta.chainAssignInsertAt !== null && meta.chainAssignInsertAt !== undefined;
}

export default function createAstUsagePureCallback({
  adapter,
  destructureEmit,
  getDebugOutput = null,
  injector,
  injectorState,
  injectPureImport,
  isDisabled,
  isEntryAvailable,
  isInTypeAnnotation,
  isShadowedByClassOwnMember,
  isThisReceiver,
  isInheritedStaticLookup,
  isMutatedStatics,
  markRewrite,
  resolveStaticInheritedMember,
  memberWritePositionBails,
  resolveGlobalPolyfill,
  resolveNodeType,
  resolvedType,
  resolvePure,
  resolvePureOrGlobalFallback,
  semanticParentNode,
  skippedNodes,
  toHint,
}) {
  // a fold re-queues the membership test it keeps - without the mark it would wrap its own wrap
  const foldedInTests = new WeakSet();
  // the split's comma memos (`(_r = X, _g = _r.m)`): when the raw method read inside one
  // RESOLVES, the lookup absorbs the receiver memo (`_g = _mMaybe(_r = X)`) - the fusion in
  // `replaceInstanceLike` keys on this set
  const guardCommaMemos = new WeakSet();
  const resolvedClaimNodes = new WeakSet();
  // a consumer whose ctor-FALLBACK swap staged renders nothing at all, so a claim below it may
  // not stand down for it: over a proxy-rooted nav the collapse family is otherwise assumed to
  // own the whole read, and the assumption ships the ctor raw when the swap has no slot for
  // what the receiver buries (`(v = gw.window?.self)?.Promise.noSuchStatic`)
  const stagedFallbackHosts = new WeakSet();
  // the VALUE a guard memo holds - a claim rendering inside one is not in a SOURCE value
  // position (the memo re-reads it), so an alias root stays spelled
  const memoValueClones = new WeakSet();
  const probeTestClones = new WeakSet();
  // the delete-hosted spine, keyed by SOURCE SPAN: a receiver memo clones the nodes it
  // holds, so identity does not reach the claims visited inside it - the span does
  const deleteHostedSpines = new Set();
  // the slot-deopt names the debug report already carries - one line per name, like both
  // other emitters. lives HERE, with the rest of the per-transform state: the factory
  // returns above the helper that reads it, so a `const` beside that helper never runs
  const deoptNotedNames = new Set();
  // what the module-scope slot-deopt note needs from this closure
  const deoptCtx = { getDebugOutput, adapter, noted: deoptNotedNames };
  // an optional-spine shape whose babel spelling is not ported yet
  const STAGED_SPLIT = Symbol('staged');
  // what the module-scope sealed-probe render needs from this closure.
  // the channel renders (`buildNavGuardTest`, `substituteProbeProxyRoot`) join after the
  // channel below is created - the two objects cross-reference
  const sealedProbeCtx = {
    adapter,
    resolvePure,
    resolveGlobalPolyfill,
    injectPureImport,
    skippedNodes,
  };
  // what the module-scope inherited-static split needs from it
  const inheritedCtx = {
    adapter,
    isThisReceiver,
    isShadowedByClassOwnMember,
    resolveStaticInheritedMember,
    injectorState,
    isMutatedStatics,
    resolvePure,
    injectPureImport,
  };
  // what the module-scope type-stamp pair needs
  const typeStampCtx = { resolveNodeType, resolvedType };
  // what the module-scope bare-optional SE dispatch needs
  const bareOptionalCtx = {
    isReusableReceiver,
    injectPureImport,
    markRewrite,
    skippedNodes,
    calleeParenWrapped,
    injector,
    assignmentExpression,
  };
  // what the module-scope SE-key read memo needs (the builder rides along:
  // the assignment builder is the one slot this closure owns)
  const seKeyReadCtx = {
    injectPureImport,
    injector,
    markRewrite,
    skippedNodes,
    assignmentExpression,
    resolvePure,
  };
  // what the module-scope pristine-hop peel needs
  const hopPeelCtx = { adapter, resolveGlobalPolyfill };
  // what the module-scope nested-guard value render needs
  const nestedGuardCtx = {
    adapter,
    resolvePure,
    injectPureImport,
    markRewrite,
  };
  // the proxy-spine channel shares this transform's closure state; the ctx objects above get
  // its renders assigned back before anything runs
  const {
    buildNavGuardTest,
    collapseProxyHopSpine,
    deleteHostForClaim,
    deoptionalizeOverSubstituted,
    emitGuardedDestructureNarrow,
    emitGuardedStaticNarrow,
    emitOwnOptionalGuardedClaim,
    emitStaticGlobalClaim,
    emitStaticOverGuardedNav,
    peelNonNullWraps,
    proxyHopKey,
    spineIsNavigated,
    substituteProbeProxyRoot,
  } = createProxySpineChannel({
    adapter,
    deleteHostedSpines,
    destructureEmit,
    hopPeelCtx,
    injectPureImport,
    markRewrite,
    memoValueClones,
    nestedGuardCtx,
    probeTestClones,
    resolveGlobalPolyfill,
    resolvePure,
    resolvedClaimNodes,
    stagedFallbackHosts,
    seKeyReadCtx,
    sealedProbeCtx,
    skippedNodes,
  });
  Object.assign(sealedProbeCtx, { buildNavGuardTest, substituteProbeProxyRoot });
  Object.assign(nestedGuardCtx, { substituteProbeProxyRoot });
  const {
    composeGuardTest,
    emitInheritedStatic,
    emitInstanceWithPeeledSe,
    guardObject,
    holdsProxySurface,
    replaceInstanceLike,
    splitOptionalReceiver,
  } = createOptionalDispatchChannel({
    STAGED_SPLIT,
    adapter,
    bareOptionalCtx,
    guardCommaMemos,
    inheritedCtx,
    injectPureImport,
    injector,
    injectorState,
    isMutatedStatics,
    isShadowedByClassOwnMember,
    markRewrite,
    memoValueClones,
    peelNonNullWraps,
    proxyHopKey,
    resolveGlobalPolyfill,
    resolveNodeType,
    resolvePure,
    resolvePureOrGlobalFallback,
    resolveStaticInheritedMember,
    resolvedType,
    seKeyReadCtx,
    skippedNodes,
    toHint,
    typeStampCtx,
  });
  // the destructure drain owes the same probe reads this callback spells on its claims, and its
  // own emitter has no path to this closure - hand it the bound renders

  // `'at' in arr` - the provider plan decides, four spellings apply it (babel-blueprint arms)
  function handleInExpression(meta, metaPath) {
    if (foldedInTests.has(metaPath.node)) return;
    const plan = planInExpression({
      meta,
      left: metaPath.node.left,
      right: metaPath.node.right,
      isEntryNeeded: isEntryAvailable,
      resolveFallback: m => resolvePureOrGlobalFallback(m, metaPath),
      receiverHint: !meta.object && meta.key && !meta.symbolSourced
        ? toHint(resolveNodeType(metaPath.get('right'))) : null,
      parent: metaPath.parentPath?.node ?? null,
    });
    if (plan.kind === 'noop') return;
    const rendered = renderInExpressionPlan(plan, {
      injectImport: injectPureImport, cloneSource: () => cloneNode(metaPath.node),
    });
    if (rendered.swapLeft) {
      // swap only the LHS in place so the RHS keeps its visited state
      metaPath.get('left').replaceWith(rendered.swapLeft);
      if (rendered.leadingSe.length) {
        metaPath.replaceWith(sequenceExpression([...rendered.leadingSe, metaPath.node]));
      }
      markRewrite();
      return;
    }
    // the kept membership test is re-queued by `replaceWith` - without the mark it would wrap
    // its own wrap on the next visit
    if (plan.kind === 'fold-after-test') foldedInTests.add(rendered.replace.expressions[0]);
    metaPath.replaceWith(rendered.replace);
    markRewrite();
  }

  // `x[S]?.(args)` - the method memo dispatches with its `this` kept:
  // `_getIteratorMethod(x)?.call(x, args)`, receiver memoized when not reusable; the own
  // chain wrapper appears only when the source chain does not continue above
  function emitSymbolIteratorOptionalCall({ metaPath, id, object, parent, memberOptional = false }) {
    // the doubly-optional spelling (`arr?.[S]?.()`) guards the ROOT and keeps the dispatch
    // `?.call` inside the alternate - reusable receivers only, the memo twin is staged
    if (memberOptional && !isReusableReceiver(object)) return;
    let lookupArg;
    let callReceiver;
    if (isReusableReceiver(object)) {
      lookupArg = cloneNode(object);
      callReceiver = cloneNode(object);
    } else {
      const ref = injector.generateDeclaredRef(metaPath);
      lookupArg = assignmentExpression('=', identifier(ref), cloneNode(object));
      callReceiver = identifier(ref);
    }
    const dispatch = callExpression(
      memberExpression(callExpression(identifier(id), [lookupArg]), identifier('call'), { optional: true }),
      [callReceiver, ...parent.arguments.map(argument => cloneNode(argument))],
    );
    const callPath = metaPath.parentPath;
    const upNode = callPath.parentPath?.node;
    const chainContinues = upNode
      && ((upNode.type === 'MemberExpression' && upNode.object === parent)
        || (upNode.type === 'CallExpression' && upNode.callee === parent));
    if (memberOptional) {
      replaceGuardedHop({ hopPath: callPath, test: nullGuardTest(cloneNode(object)), built: dispatch, skippedNodes });
      return;
    }
    let target = callPath;
    if (!chainContinues && target.parentPath?.node?.type === 'ChainExpression') target = target.parentPath;
    const consumed = callPath.node;
    target.replaceWith(chainContinues ? dispatch : chainExpression(dispatch));
    markSubtreeSkipped(skippedNodes, consumed);
  }

  // `obj[Symbol.iterator]()` -> `_getIterator(obj)`; the read form -> `_getIteratorMethod(obj)`.
  // proxy-root collapse, SE threading and the optional spellings are staged
  // a proxy-nav symbol receiver collapses through the shared plan: redundant hops drop, a
  // kept chain-assign root re-emits itself, harvested effects ride the collapsed spine
  // (`(a = globalThis.window).self[S]` -> `_gim(a = _globalThis.window)`), a dropped hop's
  // `?.` re-hangs as the member's own, and dropped-hop key effects precede the root
  function collapseSymbolReceiver(meta, metaPath, state) {
    const { node } = metaPath;
    const { object } = state;
    if (!object || (object.type !== 'MemberExpression' && object.type !== 'SequenceExpression'
      && object.type !== 'ParenthesizedExpression' && object.type !== 'AssignmentExpression')) return;
    const proxyPlan = planProxyReceiver(node, {
      aliasCtx: { scope: metaPath.scope, adapter, path: metaPath },
      throughChainAssign: true, resolvePure: m => resolvePure(m, metaPath),
    });
    // a 'member' plan is a deeper nav under a kept leaf chain (`(() => globalThis)().window
    // .foo[Symbol.iterator]` - the collapse sits below the user hop): the render spells the
    // inner collapse under the kept members, so its `.object` is the same collapsed base
    const rendered = proxyPlan?.kind === 'collapse' || proxyPlan?.kind === 'member'
      ? renderProxyReceiverPlan(proxyPlan, { injectImport: injectPureImport }) : null;
    if (!rendered) return;
    let base = rendered.object;
    if (proxyPlan.keyPrefixSE?.length) {
      base = sequenceExpression([...proxyPlan.keyPrefixSE.map(expr => cloneNode(expr)),
        ...base.type === 'SequenceExpression' ? base.expressions : [base]]);
    }
    state.object = base;
    state.memberOptional ||= !!proxyPlan.optional;
    state.proxyPlanFired = true;
    // effects the plan spelled into its render are consumed - a 'member' plan spells its
    // inner levels' too, so the walk collects every level; the LEAF key's own effects
    // still route through the SE channel over the collapsed receiver
    const planConsumed = new Set();
    for (let level = proxyPlan; level; level = level.inner) {
      for (const expr of [...level.keyPrefixSE ?? [], ...level.harvestedSE ?? []]) planConsumed.add(expr);
    }
    state.pendingEffects = state.pendingEffects.filter(effect => !planConsumed.has(effect));
    state.pendingReceiverOnly = false;
  }

  // SE channel: harvested key / receiver effects re-run as a sequence prefix while the
  // dispatch runs on the peeled reusable tail - `(a(), recv)[S]()` -> `(a(), _getIterator(recv))`.
  // returns false when the shape stays staged
  function routeSymbolReceiverEffects(metaPath, state) {
    const { pendingEffects, pendingReceiverOnly, proxyPlanFired } = state;
    if (state.callOptional) return false; // an optional CALL under SE - staged
    // the member's own `?.` splits the effects by side: the KEY's run inside the alternate,
    // where native order puts them, and the RECEIVER's stay spelled in the memo the guard
    // test builds (`(r(), recv)?.[(k(), S)]()` -> `null == (_ref = (r(), recv)) ? void 0 :
    // (k(), _getIterator(_ref))`). a receiver effect the spelling does NOT carry has no
    // slot before the test - staged
    if (state.memberOptional) {
      const peeled = unwrapRuntimeExpr(state.object);
      const recvSe = pendingEffects.filter(effect => state.receiverSe.has(effect));
      if (!recvSe.length && isReusableReceiver(peeled)) state.object = peeled;
      else if (recvSe.some(effect => !subtreeContainsNode(state.object, effect))) return false;
      state.effects = pendingEffects.filter(effect => !state.receiverSe.has(effect));
      return true;
    }
    let receiver = proxyPlanFired ? state.object : unwrapRuntimeExpr(state.object);
    if (!proxyPlanFired && receiver?.type === 'SequenceExpression') receiver = receiver.expressions.at(-1);

    // a reusable / pure tail rides the helper argument behind the hoisted effects
    if (isReusableReceiver(receiver) || (!pendingReceiverOnly && !mayHaveSideEffects(receiver))) {
      state.effects = pendingEffects;
      state.object = receiver;
    } else if (pendingReceiverOnly) {
      // a PROXY-NAV tail keeps the sequence inside the helper argument: its own claim
      // substitutes in place and the nav collapse renders `(n += 1, _globalThis)`. every
      // other tail hoists the effects ahead of the helper and rides the argument bare
      // (`(n++, [1, 2, 3])[S]()` -> `(n++, _getIterator([1, 2, 3]))`) - receiver-only
      // effects already run first in source order, so no memo is owed
      if (!holdsProxySurface(receiver, metaPath)) {
        state.effects = pendingEffects;
        state.object = receiver;
      }
    } else {
      // a COLLAPSED spine hands its prefix to the effect channel instead: that prefix IS the
      // dropped hop's own effect, it runs ahead of the key effects exactly as native ran it, and
      // the always-defined tail is re-readable, so no memo is owed (`globalThis[(hop(), 'self')]
      // [(key(), S)]` -> `(hop(), key(), _getIterator(_globalThis))`)
      const seqTail = !state.liveOptionalReceiver && receiver?.type === 'SequenceExpression'
        ? unwrapRuntimeExpr(receiver.expressions.at(-1)) : null;
      if (seqTail && isReusableReceiver(seqTail)) {
        state.effects = [...receiver.expressions.slice(0, -1), ...pendingEffects];
        state.object = seqTail;
      } else {
        // an effectful receiver evaluates FIRST (source order): memo ahead of the key
        // effects - `(_ref = getObj(), p(), _getIterator(_ref))`
        const seRef = injector.generateDeclaredRef(metaPath);
        state.effects = [assignmentExpression('=', identifier(seRef), cloneNode(receiver)), ...pendingEffects];
        state.object = identifier(seRef);
      }
    }
    return true;
  }

  function handleSymbolIterator(meta, metaPath) {
    const { node } = metaPath;
    if (node.object?.type === 'Super') return;
    // asked of the PROVIDER, before the collapse erases the span that carried the `?.` - the
    // same flag-based verdict the other two emitters read, so all three route alike
    const proxyRootOptional = meta.symbolReceiverProxyRoot?.isOptionalAccess;
    const proxyRootFired = collapseSymbolProxyRoot(meta, metaPath,
      { resolvePure, injectPureImport, skippedNodes });
    const parent = metaPath.parentPath?.node;
    const state = {
      object: node.object,
      memberOptional: node.optional === true,
      callOptional: parent?.type === 'CallExpression' && parent.callee === node && parent.optional,
      proxyPlanFired: proxyRootFired,
      pendingEffects: meta.sideEffects ?? [],
      pendingReceiverOnly: !!meta.sideEffects?.length && meta.receiverEffectCount === meta.sideEffects.length,
      // asked BEFORE the collapse: a live `?.` anywhere in the receiver keeps the memo (the
      // null-guard replays the hop effect from it), a sealed or absent one takes the flat route
      liveOptionalReceiver: proxyRootFired ? !!proxyRootOptional : receiverCarriesLiveOptional(node.object),
      receiverSe: new Set((meta.sideEffects ?? []).slice(0, meta.receiverEffectCount ?? 0)),
      effects: null,
    };
    if (!proxyRootFired) collapseSymbolReceiver(meta, metaPath, state);
    if (state.pendingEffects.length || (!state.proxyPlanFired && meta.receiverEffectCount)) {
      if (!state.pendingEffects.length) return;
      if (!routeSymbolReceiverEffects(metaPath, state)) return;
    }
    const { callOptional, memberOptional, effects } = state;
    let { object } = state;
    // a PAREN SEAL makes the `?.` moot for the entry decision: a plainly-called sealed
    // lookup (`(arr?.[S])()` / `(x?.y?.[S])()`) consumes as the direct get-iterator, the
    // receiver's own `?.` riding inside the helper argument
    const sealedDirectCall = isSealedDirectSymbolCall(metaPath);
    // inner optional hops: the receiver splits at its last-evaluated `?.` MEMBER hop and
    // the whole consumed shape rides the guard (`foo?.bar[S]()` -> `foo == null ? void 0 :
    // _getIterator(foo.bar)`); call-hop receivers and doubly-optional forms stay staged
    let splitDisjuncts = null;
    if (receiverCarriesOptional(object) && !sealedDirectCall && !optionalsAreSealed(object)) {
      if (callOptional || effects) return;
      // the member's own `?.` guards on the MEMO of the carrier receiver instead of a
      // split (`x?.y?.[S]().next()` -> `null == (_ref = x?.y) ? void 0 : _getIterator(_ref)
      // .next()`) - emitGuardedSymbolConsume's guardObject keeps the inner short-circuit
      if (!memberOptional) {
        const split = splitOptionalReceiver(object, metaPath);
        if (!split || split === STAGED_SPLIT || split.hopKind !== 'member') return;
        splitDisjuncts = split.disjuncts;
        object = split.receiver;
      }
    }
    // the caller ABOVE any seal: the shared resolver peels the callee itself, so the sealed
    // form needs no second spelling of the entry rule here
    const entry = resolveSymbolIteratorEntry(node, climbToCallerPath(metaPath)?.node ?? parent);
    if (!isEntryAvailable(entry)) return;
    // the computed `Symbol.iterator` key must not ALSO take the plain static swap - the
    // helper consumes the whole member
    if (node.computed) markSubtreeSkipped(skippedNodes, node.property);
    const id = injectPureImport(entry, symbolIteratorHint(entry));
    markRewrite();
    if (state.pendingReceiverOnly) {
      object = foldPendingReceiverSpineRoot(object, metaPath, { collapseProxyHopSpine, injectPureImport }) ?? object;
    }
    if (callOptional) return emitSymbolIteratorOptionalCall({ metaPath, id, object, parent, memberOptional });
    const consumesCall = entry === 'get-iterator';
    // extracted from its chain, a carrier receiver takes a wrapper of its own for the print
    function receiverClone() {
      return receiverCarriesOptional(object) ? chainExpression(cloneNode(object)) : cloneNode(object);
    }
    // a PAREN SEAL between the member and its call (`(arr?.[S])()`): the lookup value is
    // read plainly, so the `?.` produces no guard - a nullish receiver throws through the
    // helper exactly like the native `(undefined)()`
    const callerPath = climbToCallerPath(metaPath);
    // a SEAL is a real paren / TS wrapper - the member's own ChainExpression wrapper is the
    // chain itself, not a seal (`x?.[S]` alone must keep its guard)
    let wrapWalk = metaPath.parentPath;
    if (wrapWalk?.node?.type === 'ChainExpression' && wrapWalk.node.expression === node) wrapWalk = wrapWalk.parentPath;
    const sealed = !!wrapWalk?.node
      && TRANSPARENT_EXPR_WRAPPER_TYPES.has(wrapWalk.node.type);
    // the METHOD form consumed by a plain call keeps `this`: `x[S](42)` dispatches
    // `_getIteratorMethod(x).call(x, 42)`; a non-reusable receiver memoizes into the
    // helper argument (`_getIteratorMethod(_ref = getObj()).call(_ref, arg)`)
    const methodCallConsume = !consumesCall
      && callerPath?.node?.type === 'CallExpression' && !callerPath.node.optional
      && unwrapRuntimeExpr(callerPath.node.callee) === node;
    const hopPath = consumesCall || (sealed && memberOptional) || methodCallConsume ? callerPath : metaPath;
    // a SEALED optional lookup with a KEY effect: native short-circuits the `?.` before the key
    // runs, so the effect rides a guard of its own while the helper call stays unconditional -
    // it throws on null exactly like `(undefined)()` (`(arr?.[(log(), S)])()` ->
    // `(arr == null ? void 0 : (log(), void 0), _getIterator(arr))`)
    if (sealedDirectCall && (memberOptional || state.liveOptionalReceiver) && effects?.length) {
      return emitSealedKeySeConsume({ id, object, metaPath, hopPath, callerPath, effects, methodCallConsume }, {
        guardObject,
        composeGuardTest,
        buildSymbolConsumeCore,
        skippedNodes,
      });
    }
    const core = buildSymbolConsumeCore({ id, object, methodCallConsume, callerPath, metaPath, receiverClone });
    const built = withSideEffects(core, effects);
    if (memberOptional && !sealed) {
      emitGuardedSymbolConsume({ metaPath, id, object, effects, methodCallConsume, callerPath, hopPath });
      return;
    }
    if (splitDisjuncts) {
      replaceGuardedHop({ hopPath, test: composeGuardTest(splitDisjuncts, null), built, skippedNodes });
      return;
    }
    const consumed = hopPath.node;
    hopPath.replaceWith(built);
    markSubtreeSkipped(skippedNodes, consumed);
  }

  // `x?.[S]` / `x?.[S]()` - the null test guards the whole consumed shape; a non-reusable
  // receiver memoizes through the shared guard
  // the consume CORE: the helper call, and for the method form its `.call` dispatch -
  // a non-reusable receiver memoizes into the helper argument
  function buildSymbolConsumeCore({ id, object, methodCallConsume, callerPath, metaPath, receiverClone }) {
    if (methodCallConsume && !isReusableReceiver(object)) {
      const recvRef = injector.generateDeclaredRef(metaPath);
      return callExpression(memberExpression(
        callExpression(identifier(id), [assignmentExpression('=', identifier(recvRef), receiverClone())]),
        identifier('call'),
      ), [identifier(recvRef), ...callerPath.node.arguments.map(argument => cloneNode(argument))]);
    }
    let core = callExpression(identifier(id), [receiverClone()]);
    if (methodCallConsume) {
      core = callExpression(memberExpression(core, identifier('call')),
        [cloneNode(object), ...callerPath.node.arguments.map(argument => cloneNode(argument))]);
    }
    return core;
  }

  function emitGuardedSymbolConsume({ metaPath, id, object, effects, methodCallConsume, callerPath, hopPath }) {
    const guard = guardObject(object, metaPath);
    let guardedCore = callExpression(identifier(id), [guard.makeBase()]);
    if (methodCallConsume) {
      guardedCore = callExpression(memberExpression(guardedCore, identifier('call')),
        [guard.makeBase(), ...callerPath.node.arguments.map(argument => cloneNode(argument))]);
    }
    const [check] = guard.disjuncts;
    // the split hands raw CHECKS - the spelling is the canon's, at the render boundary
    // the shared climb absorbs the plain tail into the alternate
    // (`x?.[S]().next()` -> `x == null ? void 0 : _getIterator(x).next()`)
    replaceGuardedHop({ hopPath, test: nullGuardTest(check), built: withSideEffects(guardedCore, effects), skippedNodes });
  }

  // the staged top bails: a conditional / logical destructure receiver routes to the
  // per-branch mirror; a chain-assignment splice point inside the harvested SE stays raw
  // (the effects must interleave at the recorded slot, not append)
  function earlyStagedBail(meta, metaPath) {
    // a HOP prop whose ARRAY-WRAPPED element SELECTS: the meta funnel resolves no receiver
    // for a positional element, so the mirror is reachable only by the host's own shape
    if (metaPath.node.type === 'Property' && metaPath.node.value?.type === 'ObjectPattern' && !meta.fromFallback
      && (destructureEmit.arrayWrappedSelectingHost(metaPath)
        || destructureEmit.inlineCallYieldingProxyHost(metaPath))) {
      destructureEmit.handlePerBranch({ metaPath, meta });
      return true;
    }
    if (meta.fromFallback) {
      if (metaPath.node.type === 'Property') {
        // an ALL-proxy selecting receiver extracts like a plain proxy one - fall through to
        // the ordinary destructure dispatch instead of the per-branch mirror. the ASSIGNMENT
        // host reads it the same way: its own channels own the write
        let host = metaPath.parentPath;
        while (host?.node && (host.node.type === 'ObjectPattern' || host.node.type === 'Property')) {
          host = host.parentPath;
        }
        const selecting = host?.node?.type === 'VariableDeclarator' ? host.node.init
          : host?.node?.type === 'AssignmentExpression' && host.node.operator === '=' ? host.node.right : null;
        if (selecting && destructureEmit.isAllProxySelectingInit(selecting)) return false;
        // a DECLINED mirror leaves the key untouched, and which branch runs then decides whether
        // the polyfill applies at all - the shared diagnostic both other emitters emit
        if (!destructureEmit.handlePerBranch({ metaPath, meta })) {
          destructureEmit.warnConditionalFallbackUntouched(meta, metaPath);
        }
      }
      return true;
    }
    return false;
  }

  return function astUsagePureCallback(meta, metaPath) {
    const { node } = metaPath;
    // the hop-host note is taken BEFORE any render: a guard replaces the whole nav, and the root
    // identifier that would otherwise carry the note lands inside a detached test clone
    // (`{ Math: { floor } } = globalThis.window?.self`)
    noteUnbackedHopAliasInit(metaPath, node, resolvePure, { meta, adapter, destructureEmit });

    // the shadow-alias guard's kept raw read (`h === Ctor ? _X : h.of`) is already ours -
    // and so is a nav whose SE spells a minted pure call (a prior pass's spent claim)
    if (claimIsMoot(metaPath, node, { isDisabled, skippedNodes, isInTypeAnnotation })
      || (node.type === 'MemberExpression' && ownEmittedNavClaim(node, metaPath, ownOutputTests(injectorState)))) return;
    if (node.type === 'MemberExpression' && !deleteHostedSpines.has(sourceSpanKey(node))
      && deleteHostAboveChain(metaPath, node, unwrapRuntimeExpr)) {
      markDeleteHostedSpine(node, deleteHostedSpines, value => navValueCanShortCircuit(value,
        m => resolvePure(m, metaPath), { scope: metaPath.scope, adapter, path: metaPath }));
    }
    const parent = semanticParentNode(metaPath);

    if (meta.kind === 'in') return handleInExpression(meta, metaPath);
    if (meta.guardedAliasHint && (node.type === 'Property'
      ? emitGuardedDestructureNarrow(meta, metaPath)
      : emitGuardedStaticNarrow(meta, metaPath, parent))) return;
    // a guarded alias clouds only the STATIC surface - WHICH object the binding holds. an
    // INSTANCE claim reads off the runtime value either way, so it takes the ordinary
    // dispatch instead of staying raw (`({ Map: M } = globalThis); M = user; M.at(0)`). a
    // DESTRUCTURED prop is not held here at all: the guard above already declined it, and the
    // route below re-asks the whole question - it is the destructure emitter that keeps the static
    // surface with the guard, and stopping here dropped the INSTANCE half of it outright
    // (`for (const e of [Array]) { const { name } = e; }`, which the babel twin dispatches)
    if (meta.guardedAliasHint && node.type === 'MemberExpression' && meta.placement !== 'prototype') return;
    // OUR rest sentinel from a prior pass never re-routes - ahead of every claim route
    if ((node.type === 'Property' && (destructureEmit.sentinelAlreadyProcessed({ metaPath, meta })
      || destructureEmit.overwriteRebindEmitted({ metaPath }))) || earlyStagedBail(meta, metaPath)) return;

    if (meta.kind === 'property') {
      if (node.type === 'Property') {
        // ... and a user-mutated slot wins over the ponyfill in a DESTRUCTURE too: the
        // pattern keeps reading the live binding, as the member path's gate decides for a read
        // - except the SOURCED well-known-symbol prop, whose render (`_getIteratorMethod`)
        // reads THROUGH the receiver and sees the patched slot
        if (chainAssignStaged(meta)
          || (!isSourcedSymbolIteratorMeta(meta) && mutatedSlotWinsOverClaim(meta, node))) return;
        // the destructure pipeline: resolved claims route to the staged emitter, everything
        // else stays raw. a `[Symbol.iterator]` prop resolves to null - its pure resolution
        // IS the shared triple (`_getIteratorMethod`), gated on symbol provenance
        const { result } = resolvePureOrGlobalFallback(meta, metaPath);
        if (result) destructureEmit.handleObjectPropertyResult({ metaPath, meta, ...result });
        else if (isSourcedSymbolIteratorMeta(meta)) {
          destructureEmit.handleObjectPropertyResult({ metaPath, meta, ...SYMBOL_ITERATOR_PURE_RESULT });
        }
        return;
      }
      if (node.type !== 'MemberExpression') return;
      if (memberWritePositionBails(metaPath)) return;
      // the iterator-method read outranks the inherited-static machinery on a `this`
      // receiver (`this[Symbol.iterator]` in a static block -> `_getIteratorMethod(this)`);
      // `super` still bails inside the handler
      if (isSourcedSymbolIteratorMeta(meta) && isThisReceiver(node.object)) {
        if (chainAssignStaged(meta)) return;
        return handleSymbolIterator(meta, metaPath);
      }
      if (isThisReceiver(node.object) || node.object?.type === 'Super') {
        if (isThisReceiver(node.object) && isShadowedByClassOwnMember(metaPath, meta.key)) return;
        if (isInheritedStaticLookup(metaPath)) {
          meta = remapInheritedStaticMeta(injectorState, meta, resolveStaticInheritedMember(metaPath));
          if (!meta || isMutatedStatics(meta)) return;
          return emitInheritedStatic(meta, metaPath);
        }
        // outside a static lookup `this` is an ordinary INSTANCE receiver, reusable like a
        // name (`this.at(0)` -> `_at(this).call(this, 0)`); `super` never is - its dispatch
        // has its own spelling and stays staged
        if (node.object?.type === 'Super') return;
      }
      // a TAGGED-TEMPLATE tag is a plain binding swap for a STATIC claim (`String.raw\`x\``
      // -> `_String$raw\`x\``); an INSTANCE one would need a `.call` dispatch the tag position
      // has no room for, so that stays raw - through the wrappers the tag may wear
      if (isTaggedTemplateTag(peelParenAndTSParentPath(metaPath)?.node, node, meta.placement)) return;
      // a string-spelled key (`arr['Symbol.iterator']`) is a plain property read and stays raw
      if (isSourcedSymbolIteratorMeta(meta)) {
        if (chainAssignStaged(meta)) return;
        return handleSymbolIterator(meta, metaPath);
      }
    }

    // a user-mutated slot wins over the ponyfill everywhere: the claim stays raw and the
    // read keeps flowing through the live binding - the central meta gate
    // (a replaced ctor poisons its statics AND its `.prototype` twin; a written global
    // slot poisons the bare identifier read)
    const { result, fallback } = resolvePureOrGlobalFallback(meta, metaPath);
    // ... but a mutated SLOT wins over a static BIND only: an instance dispatch reads through its
    // receiver, never off the named slot, so a container the file deletes from (`delete box.at`)
    // keeps the ponyfill its receiver still needs
    // ... and the slot-deopt DIAGNOSTIC rides the gate that acts on it: the report names the
    // written slot once, the gate keeps its reads native
    if (result?.kind !== 'instance' && mutatedSlotWinsOverClaim(meta, node)) return noteDeoptedSlotRead(meta, deoptCtx);
    // the traversal is pre-order, so by the time a hop fires every ancestor has had its own
    // verdict: a consumer that resolved will own the render, one that did not renders
    // nothing and must not silence this claim
    if (result) resolvedClaimNodes.add(node);
    if (!result) return handleUnresolvedClaim({ meta, metaPath, node, fallback });
    const { kind, entry, hintName } = result;
    if (kind === 'instance') {
      if (node.type !== 'MemberExpression') return;
      // a chain-assign living INSIDE the receiver rides its memo whole - the split keeps
      // the write in the guard test (`(n = gw)?.WeakSet.name` -> `null == (_ref = n = gw)
      // ? void 0 : ...`); only a HARVESTED assign the render has no slot for stays staged
      if (chainAssignStaged(meta) && meta.sideEffects?.length
        && meta.sideEffects.some(effect => !subtreeContainsNode(node.object, effect))) return;
      if (meta.sideEffects?.length || meta.receiverEffectCount) {
        return emitInstanceWithPeeledSe(meta, metaPath, entry, hintName);
      }
      // a computed key only reaches here FOLDED (the meta resolved through it) with its
      // effects already harvested - the emission consumes the member whole, so the dead key
      // spelling (a discarded `(globalThis, "fl") + "at"`) must not fire its own claims
      if (node.computed) markSubtreeSkipped(skippedNodes, node.property);
      const id = injectPureImport(entry, hintName);
      replaceInstanceLike({ metaPath, id });
      return;
    }
    // an OPTIONAL static member (`X.Promise?.resolve`) substitutes like the plain spelling:
    // the claimed binding is always defined, so the `?.` erases with the member; an object
    // that can genuinely be undefined (an environment probe) keeps its guard routes
    if (node.type === 'MemberExpression' && node.optional
      && optionalMemberStaysGuarded(node, { metaPath, adapter, resolvePure })
      && !sealedThrowRidesTheClaim(node, metaPath, sealedProbeCtx)
      && emitOwnOptionalGuardedClaim({ meta, metaPath, node, parent, kind, entry, hintName })) return;
    // a guarded-nav static under an OPTIONAL call: the `?.()` rides the ternary outside
    // (`(null == (sp = _globalThis.window) ? void 0 : (c++, _Array$from))?.([3])`)
    // (a claimed callee under a plain-receiver `?.()` falls through: the substituted
    // binding is always defined, so the `?.()` erases - `globalThis.Map?.()` -> `_Map()`)
    // ... and a DECLINED plan falls through to the ordinary claim routes, which own the
    // shapes the nav plan cannot model (an opaque call root under two `?.` hops)
    if (parent?.type === 'CallExpression' && parent.optional && parent.callee === node
      && kind !== 'instance' && node.type === 'MemberExpression'
      && receiverCarriesLiveOptional(node.object)
      && emitStaticOverGuardedNav({ meta, metaPath, node, entry, hintName })) return;
    emitStaticGlobalClaim({ meta, metaPath, node, kind, entry, hintName });
  };

  // does an optional member's OBJECT keep the guard routes - a live `?.` inside it, or a
  // value that can genuinely be undefined (read THROUGH a kept write)
  // a claim with NO pure result: the ctor-fallback receiver swap, then the alias-spine
  // drop for hops the declined meta subsumed
  function handleUnresolvedClaim({ meta, metaPath, node, fallback }) {
    // a SEQUENCE receiver spells its own effects, so the static-FALLBACK swap below needs no
    // erasure budget: it replaces the TAIL and the prefix keeps running in place
    const sequenceReceiver = fallback && node.type === 'MemberExpression'
      && node.object?.type !== 'Super' && meta.placement !== 'prototype' && meta.sideEffects?.length
      ? fallbackSwapsSequenceTail(node, meta) : null;
    if (sequenceReceiver) {
      const tail = sequenceReceiver.expressions.at(-1);
      if (!discardRescueNodes({ node: tail, scope: metaPath.scope, adapter, path: metaPath }).length) {
        markRewrite();
        sequenceReceiver.expressions[sequenceReceiver.expressions.length - 1] =
          identifier(injectPureImport(fallback.entry, fallback.hintName));
        markSubtreeSkipped(skippedNodes, tail);
        return;
      }
    }
    // static-FALLBACK swap: a member that is NOT itself polyfilled but whose receiver
    // resolves to a pure ctor (`Promise.noSuchStatic` -> `_Promise.noSuchStatic`).
    // the prototype shape is out of the family; the SE-bearing and observable-burying ones are
    // STAGED - raw source stays there, and the staging is recorded because a claim below reads
    // this consumer's fate to decide whether it owns its own render
    const fallbackSwappable = !!fallback && node.type === 'MemberExpression'
      && node.object?.type !== 'Super' && meta.placement !== 'prototype';
    // the object swap ERASES the receiver spelling - an observable buried in it (a
    // chain-assignment, an SE-bearing root call) has no slot in this shape yet
    const fallbackStaged = fallbackSwappable && (!!meta.sideEffects?.length || !!meta.receiverEffectCount
      || discardRescueNodes({ node: node.object, scope: metaPath.scope, adapter, path: metaPath }).length > 0);
    if (fallbackStaged) stagedFallbackHosts.add(node);
    if (fallbackSwappable && !fallbackStaged) {
      const id = injectPureImport(fallback.entry, fallback.hintName);
      // a LIVE `?.` over an undefinable probe keeps its guard, the fallback riding the
      // alternate (`...window?.self?.Promise.noSuchStatic` -> `null == _globalThis.window
      // ? void 0 : _Promise.noSuchStatic`, babel's guarded fallback)
      if (receiverCarriesLiveOptional(node.object)) {
        let probe = null;
        for (let cur = unwrapRuntimeExpr(node.object); cur?.type === 'MemberExpression';
          cur = unwrapRuntimeExpr(cur.object)) {
          if (!cur.optional) continue;
          // the descent stops at the SHALLOWEST hop whose own object can actually be absent:
          // a deeper one over a provably DEFINED value is not the source of the undefinedness
          // (`f()?.window?.Promise` with `f = () => globalThis` tests `f().window`, not `f()`)
          if (!guardProbeUndefinable(cur.object, { metaPath, adapter, resolvePure })) break;
          probe = cur.object;
        }
        // a provably DEFINED probe leaves the `?.` dead - the plain swap below erases it
        if (probe) {
          markRewrite();
          const probeInner = cloneNode(unwrapRuntimeExpr(probe));
          // the dead `?.` inside the probe spelling erases with it - the canonical verdict
          for (const hop of vestigialNavOptionals(probeInner, m => resolvePure(m, metaPath),
            { scope: metaPath.scope, adapter, path: metaPath })) hop.optional = false;
          const test = nullFirstGuardTest(
            receiverCarriesOptional(probeInner) ? chainExpression(probeInner) : probeInner);
          replaceGuardedHop({
            hopPath: metaPath,
            test,
            built: memberExpression(identifier(id), cloneNode(node.property), { computed: node.computed }),
            skippedNodes,
            navAlternate: true,
          });
          return;
        }
      }
      markRewrite();
      // the read a load-bearing SEAL made observable is the source's own, and this swap
      // erases the receiver spelling - it rides back as a throw probe ahead of the ponyfill.
      const objectProbe = sealedClaimThrowProbe(node.object, metaPath, sealedProbeCtx);
      metaPath.get('object').replaceWith(objectProbe
        ? sequenceExpression([objectProbe.node, identifier(id)]) : identifier(id));
      return;
    }
    // a DECLINED claim over an alias-rooted pristine spine: the hop claims were subsumed
    // under this meta, so the drop lands here - the alias stays spelled and the dead leaf
    // keeps reading through it (`s.window.Array` -> `s.Array`, babel's kept shape)
    // an OPTIONAL member reading this hop owns its probe - the alias drop would eat the
    // load-bearing read (`g.window?.self?.Map` tests `null == g.window`)
    const optionalReader = metaPath.parentPath?.node?.type === 'ChainExpression'
      ? metaPath.parentPath.parentPath?.node : metaPath.parentPath?.node;
    if (optionalReader?.type === 'MemberExpression' && optionalReader.optional
      && unwrapRuntimeExpr(optionalReader.object) === node) return;
    if (node.type === 'MemberExpression' && !meta.sideEffects?.length && !meta.receiverEffectCount) {
      // an OPTIONAL hop joins the fold in two shapes. a `delete` reads nothing over its
      // navigation, so the hop the source wrote optionally folds with the spine below it, exactly
      // as the claim channels fold theirs (`delete ga.window.self?.window.k` -> `delete ga.k`);
      // and over a nav the VALUE canon says cannot short-circuit, the optional hop is the plain
      // one's twin - leaving it out of the fold kept a hop the rest of the run drops
      // (`ga.window.self?.window.k` -> `ga.k`)
      const optionalFolds = deleteHostForClaim(metaPath, node, { forFold: true })
        || !navValueCanShortCircuit(node, m => resolvePure(m, metaPath),
          { scope: metaPath.scope, adapter, path: metaPath });
      // the node that is ITSELF a pristine hop (`g.self.window`, `.window` claimless)
      // collapses whole; a dead leaf (`.Array`) collapses its object spine under it
      const spineNode = proxyHopKey(node, { metaPath, allowOptional: optionalFolds }) ? node
        : node.object?.type === 'MemberExpression' ? node.object : null;
      const collapsed = spineNode && collapseProxyHopSpine(spineNode, metaPath, { allowOptional: optionalFolds });
      // ... and only where something READS through the hop: in VALUE position the drop would
      // change what the expression yields (`t = g.window` stores the window object, not `g`).
      // a dead leaf above the spine is that reader itself
      const navigatedSpine = spineNode !== node || spineIsNavigated(metaPath).navigated;
      if (collapsed?.aliasRoot && !collapsed.effects.length && navigatedSpine) {
        markRewrite();
        const consumed = spineNode;
        const dropped = spineNode === node ? metaPath : metaPath.get('object');
        const aliasNode = cloneNode(collapsed.aliasRoot);
        dropped.replaceWith(aliasNode);
        markSubtreeSkipped(skippedNodes, consumed);
        // the alias binding the drop lands is always defined, so a `?.` reading directly off it
        // guards nothing - the vestigial verdict every substitution channel takes
        deoptionalizeOverSubstituted({ metaPath: dropped, node: consumed, replacement: aliasNode, proxyRoot: true });
      }
    }
  }

  function mutatedSlotWinsOverClaim(meta, node) {
    if (isMutatedStatics(meta)) return true;
    return meta.kind === 'global' && node.type === 'Identifier'
      && isMutatedStatics({ kind: 'property', object: 'globalThis', key: meta.name, placement: 'static' });
  }
}
