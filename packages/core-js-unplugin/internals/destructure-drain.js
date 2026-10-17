// the drain half of the destructure emitter: the per-host ledger drains that run once over
// the final tree - pattern surgery, memo declarations, residual re-anchoring and the
// literal renders. created per transform over the visit half's shared context
import { ORPHAN_REF_PATTERN } from '@core-js/polyfill-provider/injector-base';
import {
  destructureKeyReadPlan,
  firstPatternProp,
  instanceSynthReceiverPure,
  isBuiltInSurfaceNav,
  isInstanceSurfaceNav,
  destructurePatternHostPath,
  dispatchMayReadNav,
  isReReferenceableAcrossReads,
  isSeFreeMemberReceiver,
  liftedInitElements,
  liftedPrefixSplit,
  liftedRealmNavEffect,
  planSynthReceiverGuard,
  resolveNestedReceiverBase,
  resolvePassthroughRef,
  staticHopPure,
  instanceHopDispatch,
  provenRealmCallRoot,
  discardRescueNodesWithReads,
  observablePrefixElements,
  residualHuskIsDead,
  residualInitRunsEffects,
  noteRelocation,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  bodylessSlotReplacement,
} from '@core-js/polyfill-provider/destructure-host-shape';
import { hostLevelSurvives, planCatchClauseExtraction } from '@core-js/polyfill-provider/detect-usage/destructure-plan';
import {
  planMemoReadTarget,
  shouldDropRescueReceiver,
} from '@core-js/polyfill-provider/detect-usage/members';
import {
  decidedRunningPart,
  discardRescueNodes,
  partitionEffectsAtProbe,
  navValueCanShortCircuit,
  proxyGlobalMemberCtorPureSwap,
  proxyGlobalRootName,
  resolveObjectName,
  realmLevelNamesCtor,
  isCallShape,
} from '@core-js/polyfill-provider/detect-usage/resolve';

import {
  bindingDeclaratorNode,
  computedKeyHasSideEffects,
  exportedSentinelSplit,
  forOfHeadDeclarationOf,
  forOfHeadIterableElements,
  invalidateScopeVarIndex,
  isDestructurePattern,
  isPristineProxyGlobal,
  isReusableReceiver,
  isTopLevelThisContext,
  mayHaveSideEffects,
  noteRelocatedHeadName,
  noteRenderRetiredTargets,
  patternBindingCount,
  patternDead,
  patternFullyConsumed,
  patternSlotTarget,
  peelNestedSequenceExpressions,
  peelTransparentExpr,
  POSSIBLE_GLOBAL_OBJECTS,
  pruneEmptiedHopProps,
  receiverCarriesLiveOptional,
  statementListOf,
  unwrapRuntimeExpr,
  unwrapParens,
  walkAstNodes,
  allProxySelectingInit,
  firstProxyBranch,
  invocationNode,
  proxySurfaceIdentifier,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { replaceNodeInTree } from './emit-shared.js';
import {
  literal,
  assignmentExpression,
  callExpression,
  chainExpression,
  cloneNode,
  expressionStatement,
  identifier,
  memberExpression,
  objectExpression,
  objectProperty,
  sequenceExpression,
  variableDeclaration,
  variableDeclarator,
  renderKeyedDestructureRead,
  renderSynthReceiverGuard,
  renderStaticDefaultGuard,
  renderSynthSlotRead,
  synthEntryKey,
  synthKeyMustBeComputed,
  memberFromKeyName,
  renderProxyReceiverPlan,
} from '@core-js/polyfill-provider/render';
import {
  anchorAssignmentResidual,
  anchorLeadingStatement,
  assignmentMemoRef,
  buildInstanceDefaultGuard,
  bareProxyGlobalPure,
  buildMemoArg,
  carriedInitPrefix,
  carryForInitPrefixIntoFirst,
  takeForInitPrefix,
  carryInitPrefix,
  chainAssignOverPureNav,
  discardedSinkSlot,
  drainBodylessAssignment,
  drainBodylessMultiMemo,
  drainBodylessWrapKinds,
  drainSequenceAssignments,
  duplicateReceiver,
  emitDeclaratorMemo,
  splitDeclaratorMemo,
  emitLiteralReceiverMemos,
  exportWrap,
  foldSinkPrefixIntoResidual,
  forInitMemoVerdicts,
  guardedNavPassthrough,
  guardedPureBinding,
  hopChainKeys,
  insideParamPosition,
  interleavedSeKeySegments,
  isMintedOrProxyName,
  isPureNavReceiver,
  jobHostSiblingDeclarators,
  joinBodylessSiblingExtractions,
  joinSeKeySiblingDeclarator,
  keptSymbolSentinelResidual,
  keptWriteRidesValue,
  liftableInitPrefix,
  liftAssignInitPrefix,
  liftedPrefixStatements,
  liftSurvivingInitPrefix,
  literalContainerRescue,
  liveHostStatement,
  liveTailOf,
  groupMemoExtractions,
  jobOuterProp,
  memoJobBindingTarget,
  orderDeclaratorJobs,
  orderResidualDeclarators,
  patternHasPolyfillableDefault,
  probeCarriesWrite,
  probeNavStartOf,
  jobBindingTarget,
  propBindingTarget,
  reanchoredInit,
  renderDiscardedInitProbe,
  renderSealedNavProbe,
  residualKeepsSibling,
  residualPrecedesExtractions,
  sealedNavProbeRead,
  seKeySegmentedDeclarators,
  sentinelMemoInitShape,
  spellsSameSource,
  splitMultiDeclaratorHost,
  substituteProxyRootsInClone,
  withoutCtorHopJobsWithLiveSiblings,
} from './destructure-helpers.js';
import { cloneStamped, markSubtreeSkipped, nodeSite } from './nav-spine.js';
import { SYMBOL_ITERATOR_PURE_RESULT, symbolStaticMeta } from '@core-js/polyfill-provider/detect-usage/globals';

// the host patterns the emptied-hop prune has already walked: it runs once per host, whichever
// job's removal reaches it first
const prunedHosts = new WeakSet();

// an uncovered STATIC slot off a CONSTRUCTOR receiver is that static's polyfill, not a raw read
// (`{ [Symbol.iterator]: it, hasOwn }` over `Object` spells `hasOwn: _Object$hasOwn`, the other
// leg's mirror): pushed where it resolves, so the fresh-read fallback never spells `Object.hasOwn`
function pushConstructorStaticSlot({ receiverNode, key, metaPath, resolvePure, injectPureImport, pushSlot }) {
  if (receiverNode?.type !== 'Identifier' || typeof key !== 'string') return false;
  const pure = resolvePure({ kind: 'property', object: receiverNode.name, key, placement: 'static' }, metaPath);
  if (pure?.kind !== 'static') return false;
  pushSlot(identifier(injectPureImport(pure.entry, pure.hintName)));
  return true;
}

// the receiver spelling an instance synth hands its helper: the shared rule answers which bare
// globals arrive as their injected pure binding, and everything else is a clone of the source node -
// the synth literal is re-emitted where no visitor reaches it again, so a raw name would stay raw
function synthInstanceReceiver(receiver, metaPath, { adapter, resolvePure, injectPureImport }) {
  const pure = metaPath && instanceSynthReceiverPure(receiver, {
    adapter, scope: metaPath.scope, path: metaPath, resolvePure: m => resolvePure(m, metaPath),
  });
  return pure ? identifier(injectPureImport(pure.entry, pure.hintName)) : cloneNode(receiver);
}

export default function createDestructureDrains(ctx) {
  const {
    adapter,
    capturedSiblingHosts,
    hopHosts,
    injectPureImport,
    injector,
    injectorState,
    isDisabled,
    ledger,
    markRewrite,
    mintRefName,
    mintUnusedName,
    pendingBranchSynths,
    pendingSplits,
    probeRenderCtx,
    program,
    resolveGlobalPolyfill,
    resolvePropertyObjectType,
    primeDestructureReceiverTypes,
    resolveForOfResolvedElement,
    resolveProxyNavReceiver,
    resolveProxyNavStatic,
    resolvePure,
    resolvedType,
    seqDrainedSlots,
    skippedNodes,
    synthLedger,
    toHint,
  } = ctx;
  // the aliases this leg minted for a global (`_globalThis`): the re-read question's per-leg lookup
  function isOwnPureAlias(name) {
    return !!injector?.getBindingInfo?.(name);
  }

  // the PASSTHROUGH render: the resolution consumed the RECEIVER's keys, not the pattern's, so a
  // nested leaf under `prototype` still reads through the pattern's own hops
  // (`({ prototype: { flat: x } } = globalThis.Array)` dispatches on `_globalThis.Array.prototype`,
  // not on the ctor - the ctor spelling bound undefined and threw at the first call). the passthrough
  // exists because the in-place substitution may have been SUPPRESSED for this nav; where the tree
  // shows it DID run (a claim on the leaf rendered its own dispatch), that rewrite is the
  // authoritative spelling and re-rendering would ship the raw member instead
  function proxyNavPassthroughValue({
    entry,
    hintName,
    kind,
    chainKeys,
    proxyNav,
    liveReceiver,
    receiverNode,
    guarded,
    typedNavChain,
    metaPath,
  }) {
    const id0 = injectPureImport(entry, hintName);
    const patternHops = passthroughPatternHops(chainKeys);
    // ... and the SURFACE rule is asked here too, of the hops this render is about to spell: an
    // INSTANCE leaf off the object the hops merely REACH is a name match (`{ Array: { keys: k } }`),
    // which every other path keeps native - the nested arm asks it of the receiver's own spelling,
    // and a receiver that resolved as a proxy nav reaches the render through here. A typed user
    // chain owns its one read and dispatches on the unknown value those keys hold instead.
    if (kind === 'instance' && entry !== 'get-iterator-method' && !typedNavChain
      && !passthroughHopsNameSurface(patternHops)) return null;
    function passthroughBase(override) {
      if (override) return identifier(override);
      return liveReceiver && liveReceiver() !== receiverNode ? cloneNode(liveReceiver()) : proxyNav();
    }
    return guarded(override => {
      const base = patternHops.reduce(memberFromKeyName, passthroughBase(override));
      if (!typedNavChain?.slotDefault) return callExpression(identifier(id0), [base]);
      // The passthrough owns the same slot default as the nested channel, before method lookup.
      const slotRef = injector.generateDeclaredRef(metaPath);
      return callExpression(identifier(id0), [buildInstanceDefaultGuard({
        assignedRef: identifier(slotRef), call: base, defaultValue: typedNavChain.slotDefault, reread: identifier(slotRef),
      })]);
    });
  }

  // the pattern's OWN hop keys as the passthrough spells them: a LEADING pristine proxy hop drops,
  // exactly as it does for the receiver's own keys - it navigates into the same surface
  function passthroughPatternHops(chainKeys) {
    return (chainKeys ?? []).filter((key, index, keys) => {
      return !(index === 0 && keys.length > 1 && isPristineProxyGlobal(adapter, key));
    });
  }

  // ... and do those hops NAME an instance surface? a leaf off the object they merely REACH is a name
  // match, which every other path keeps native. hopless claims dispatch on the receiver itself and
  // answer yes - the question is about the hops
  function passthroughHopsNameSurface(patternHops) {
    return !patternHops.length
      || isInstanceSurfaceNav(patternHops.reduce(memberFromKeyName, identifier('_')));
  }

  // the extracted binding's value: a static / global claim is the import binding itself;
  // an instance claim is the method lookup over the (reusable) receiver. a DEFAULT on the
  // prop keeps native-miss semantics at the top level (`_Symbol === void 0 ? d : _Symbol`,
  // the instance form through a memo ref); a default under the nested flatten drops - the
  // extracted static always wins there, exactly babel's split
  // eslint-disable-next-line max-statements -- per-kind value dispatch, one arm per receiver shape
  function buildValue({
    kind,
    entry,
    hintName,
    receiverNode,
    prop,
    nested,
    chainKeys,
    metaPath,
    memoJoin = false,
    literalRoute = false,
    liveReceiver = null,
    reusedReceiver = false,
    typedHop = null,
    typedNavChain = null,
    guardCtx = null,
    carriesInit = false,
  }) {
    const defaulted = prop.value.type === 'AssignmentPattern';
    const hopDefault = typedHop?.defaultHost;
    if (hopDefault) hopDefault.defaultCommentsAt ??= unwrapParens(hopDefault.right).start;
    // the STATIC ponyfill an extraction binds is always defined, so a leaf's default is dead text at
    // runtime and drops at every depth (`{ Array: { from = [] } } = globalThis` -> `_Array$from`);
    // the guard survives only where the read is a memo of a hop rather than the import itself
    const withDefault = defaulted;
    // the guard a DEFAULT owes wherever the dispatch spells its own receiver: the pure entry answers
    // `it.method` VERBATIM off a surface that is not the polyfilled one, so it may be undefined and the
    // source's default has to fire (`({ navigator: { flat: c = null } } = globalThis.globalThis)` bound
    // undefined where the source binds null). the flat-depth canon renders exactly this guard
    function guarded(build) {
      if (!defaulted) return build;
      // a CATCH-BORN host (`memoJoin`) cannot hoist a `var` past its own binding: the ref is
      // block-scoped and leads the extraction as its own `let` (the drain's lead declaration, the
      // shape the other leg prints); a hoistable host takes the declared ref
      const ref = memoJoin ? mintRefName() : injector.generateDeclaredRef(metaPath);
      const fold = leafDefaultFold(ref);
      function thunk(override) {
        return fold(build(override));
      }
      if (memoJoin) thunk.leadDecl = ref;
      return thunk;
    }
    // the leaf's own default folded around a dispatch through `ref`. `.right` is read LAZILY, like the
    // guard path below: the walker's later in-place rewrites replace the default THROUGH that slot
    function leafDefaultFold(ref) {
      const valueNode = prop.value;
      return call => buildInstanceDefaultGuard({
        assignedRef: identifier(ref),
        call,
        defaultValue: valueNode.right,
        defaultPattern: valueNode,
        defaultName: valueNode.left?.name,
        reread: identifier(ref),
      });
    }
    if (kind === 'instance') {
      let receiver = peelTransparentExpr(receiverNode);
      // a lifted SE prefix leaves the TAIL as the nav (the prefix runs as its own statement) -
      // unless this dispatch CARRIES the init, which means no residual survives to run it
      if (!carriesInit && receiver?.type === 'SequenceExpression') {
        receiver = peelNestedSequenceExpressions(receiver).tail;
      }
      // the receiver as a dispatch spells it: the LIVE node where the route offers one (a claim
      // INSIDE the receiver renders by REPLACING its node, and a copy taken before that carries
      // the source read with its own polyfill lost), and a bare proxy global as its pure binding -
      // a node the route LIFTED out of a consumed literal is one the walk never revisits
      // ... and a NAV rooted in one resolves through the same passthrough the raw-init arm takes:
      // a lifted `globalThis.self` names the ponyfill that nav stands for, never a member read off
      // the realm object (`_globalThis.self` is undefined wherever the engine lacks `self`)
      function spelledReceiverNode() {
        const node = liveReceiver?.() ?? receiverSpelling;
        const peeled = peelTransparentExpr(node);
        const pure = bareProxyGlobalPure(peeled, metaPath, { adapter, resolveGlobalPolyfill });
        if (pure) return identifier(injectPureImport(pure.entry, pure.hintName));
        const nav = resolveProxyNavReceiver(peeled, guardCtx);
        return nav ? nav() : duplicateReceiver(node, injector);
      }

      // the SPELLED receiver keeps its TS cast (`_atMaybeArray(arr as number[])` - babel's
      // memo canon); only parens are printer trivia
      let receiverSpelling = receiverNode;
      while (receiverSpelling?.type === 'ParenthesizedExpression') receiverSpelling = receiverSpelling.expression;
      // ... and where the RESIDUAL re-reads it, an init that peels to a bare identifier is
      // freely re-referenceable: both reads spell the identifier, not the wrapper the source
      // put around it (`{ [(k(), 'at')]: a, other } = arr as any` - one lone read keeps it)
      if (reusedReceiver && (receiver?.type === 'Identifier' || receiver?.type === 'ThisExpression')) {
        receiverSpelling = receiver;
      }
      // the TYPED single hop: the receiver's own type dispatches the hop key as an instance
      // method, so the leaf composes through it - the hop dispatch feeds the leaf dispatch, the
      // inner default folding through the canonical guard. this is the composed two-step both legs
      // print (`_name((_ref = _at(src)) === void 0 ? <default> : _ref)`), retiring the dead-mirror
      // suppression for this shape.
      // it is asked AHEAD of every receiver gate below: the hop step spells the receiver ONCE,
      // inside its own dispatch, so a CALL or a literal is as good a receiver as a binding - those
      // gates are for the nav spellings under them, which read the token a second time
      // ... a STATIC hop step spells an import binding and needs no receiver at all, so it composes
      // behind further hops too (`{ Array: { of: { name } = {} } } = globalThis`)
      if (typedHop && (chainKeys?.length === 1 || typedHop.pure.kind !== 'instance')) {
        const leafId = injectPureImport(entry, hintName);
        const hopId = injectPureImport(typedHop.pure.entry, typedHop.pure.hintName);
        const { defaultHost } = typedHop;
        // a STATIC outer step spells an import binding: always defined, so its default is dead text
        // and the leaf dispatches on the binding alone - no memo, and no receiver to dispatch on
        if (typedHop.pure.kind !== 'instance') {
          return () => callExpression(identifier(leafId), [renderStaticDefaultGuard({
            read: identifier(hopId), defaultValue: defaultHost.right, reread: identifier(hopId), alwaysDefined: true,
          })]);
        }
        // the leaf's OWN default folds around the composition: its ref mints first and hoists, the
        // other leg's numbering and declarations
        const leafFold = defaulted ? leafDefaultFold(injector.generateDeclaredRef(metaPath)) : call => call;
        // a CATCH-BORN host cannot hoist a `var` past its own binding: the ref is block-scoped and
        // stands as its own declaration ahead of the extraction, which is what the other leg prints
        const guardRef = memoJoin ? mintRefName() : injector.generateDeclaredRef(metaPath);
        function composedGuard(override) {
          return leafFold(callExpression(identifier(leafId), [buildInstanceDefaultGuard({
            assignedRef: identifier(guardRef),
            call: callExpression(identifier(hopId), [override ? identifier(override) : spelledReceiverNode()]),
            defaultValue: defaultHost.right,
            defaultPattern: defaultHost,
            reread: identifier(guardRef),
          })]));
        }
        if (memoJoin) composedGuard.leadDecl = guardRef;
        return composedGuard;
      }
      // a literal-route receiver was already proved single-read / re-referenceable by the
      // shared canon walk - the nav gate below is for raw declarator inits
      if (literalRoute) {
        const literalId = injectPureImport(entry, hintName);
        // the MEMO route already reads live - its `_ref` is built from the rewritten init
        return guarded(override => callExpression(identifier(literalId),
          [override ? identifier(override) : spelledReceiverNode()]));
      }
      // a pure member nav qualifies like a bare name: the lookup reads it once. a nav off a
      // PROXY-GLOBAL root renders through the canonical passthrough resolution - the pure
      // ctor when one exists (`_Promise`), else the proxy member read (`_globalThis.navigator`) -
      // because the detection may have claimed the nav for the destructure and suppressed the
      // in-place substitution the clone would otherwise carry
      // ... asked WITH the guard context: a receiver wearing a dead chain marker is a provable
      // nav all the same, and the predicate is the one that judges its `?.` (peeling the marker
      // ahead of it would strip the wrapper and leave the hop flags saying the opposite)
      // ... and a TYPED nav off a root with no NAME is not a nav at all - a call, a `new` - yet the
      // walk granted it for the sole read, and the nested branch below spells it once
      if (!literalRoute && !typedNavChain && !isPureNavReceiver(receiver, guardCtx)) return null;
      // ... asked WITH the guard context for the same reason: the resolution WALKS the hops, and
      // past a dead marker their `?.` flags are trivia. without it the nav resolved for the flat
      // twin and not for the marked one, and the claim shipped native
      // (`({ Array: { prototype: { flat: c } } } = globalThis?.globalThis)`)
      // ... and a nav that ENDS on a polyfillable static once the pattern's own hops are read through
      // it dispatches on that static's ponyfill - an import binding, always defined, so the leaf's own
      // default guard is all it owes (`{ of: { name } } = globalThis.Array` -> `_name(_Array$of)`)
      if (nested && entry !== 'get-iterator-method') {
        const navStatic = resolveProxyNavStatic(receiver, chainKeys, guardCtx, metaPath);
        if (navStatic) {
          const staticId = injectPureImport(navStatic.entry, navStatic.hintName);
          const leafId = injectPureImport(entry, hintName);
          return guarded(() => callExpression(identifier(leafId), [identifier(staticId)]));
        }
      }
      const proxyNav = resolveProxyNavReceiver(receiver, guardCtx);
      // a DEFAULTED prop over a proxy-global receiver takes the GUARD path below, with the
      // passthrough as its dispatch receiver: the guard reads that receiver exactly once, which
      // is what the source's own read does. leaving it in the residual shipped the claim native,
      // and on a target without the method the source's default won over the ponyfill
      if (proxyNav && (nested || !defaulted)) {
        return proxyNavPassthroughValue({
          entry, hintName, kind, chainKeys, proxyNav, liveReceiver, receiverNode, guarded, typedNavChain, metaPath,
        });
      }
      // a BARE pristine proxy-global receiver substitutes its pure binding: the clone is
      // built after the traversal, so the ordinary identifier claim never reaches it
      // (!nested: hop chains resolve through the passthrough below, keys intact)
      const barePure = nested ? null : bareProxyGlobalPure(receiver, metaPath, { adapter, resolveGlobalPolyfill });
      if (barePure) {
        if (withDefault) return null;
        const id1 = injectPureImport(entry, hintName);
        const recvId = injectPureImport(barePure.entry, barePure.hintName);
        return override => callExpression(identifier(id1), [identifier(override ?? recvId)]);
      }
      const id = injectPureImport(entry, hintName);
      if (nested) {
        // the symbol leaf under hop props: its receiver is the RESOLVED hop nav - the pure
        // ctor when one exists (`_Map`), else the proxy member read (`_globalThis.Array`);
        // leading pristine proxy hops are pure navigation into the same surface and drop
        // (`{ self: { [S]: it } } = globalThis` reads `_gim(_globalThis)`)
        if (!chainKeys?.length) return null;
        // a TYPED nav off a root with no NAME - a call, a `new`, a member - spells that root inside
        // its own dispatch: the walk granted the chain only where the declarator dies whole with the
        // claim, so this is the source's one read of it (`{ data: { at } } = mk()` -> `_at(mk().data)`).
        // read LIVE, like every receiver this dispatch spells itself
        // Top-level this is a stable realm root even beside a surviving host sibling. Its spelling
        // stays this, so the dispatch retains the source's receiver and ESM rejection behavior.
        const realmThis = receiver?.type === 'ThisExpression' && isTopLevelThisContext(metaPath);
        const namelessRoot = receiver?.type !== 'Identifier';
        if (namelessRoot && !realmThis && (!typedNavChain || entry === 'get-iterator-method')) return null;
        // an INSTANCE surface the chain NAMES dispatches on itself; everything else is the shared
        // walk's to grant, and it grants a chain only when every slot it descends dies with it,
        // leaving no residual to call the same getter a second time. so a leaf off the object the
        // hops merely REACH stays native for want of a chain (`{ Array: { keys: k } } = globalThis`
        // -> `_keys(_globalThis.Array)`, a name match), and a USER nav dispatches on the read the
        // source performs (`{ y: { at } } = src` -> `_at(src.y)`) - a capitalised key off it too, its
        // root naming no surface (`{ Data: { prototype: { at } } } = src`). the SYMBOL leaf keeps its
        // own rule above: its receiver IS the hop surface, prototype or not
        const navSpelling = namelessRoot && !realmThis ? null : chainKeys.reduce(memberFromKeyName, receiver);
        const surfaceOptions = { ctx: { scope: metaPath.scope, adapter, path: metaPath }, isOwnAlias: isOwnPureAlias };
        if (navSpelling && entry !== 'get-iterator-method' && !isInstanceSurfaceNav(navSpelling, surfaceOptions)
          && !typedNavChain) return null;
        // ... and a USER ALIAS of the realm is the realm, not a user object: the alias canon names it
        // through the init peel (`const g = globalThis`), and without that the dispatch kept the
        // source's raw read and lost the ponyfill outright - the other binding dispatches
        // `_nameMaybeFunction(_Promise)` for the same source.
        // An effect in a USER alias's init ran once at its declaration and settles nothing about the
        // reads after it, so it takes no say here.
        // A name OUR ref generator minted answers the realm the same way, but only for the
        // RESOLUTION: a memo's point is its spelling, and a pure base REPLACES that spelling outright
        // while a raw read through the realm would merely re-spell it. So where the realm read
        // resolves no ponyfill, the memo keeps the read it stands for (`_ref.Array.prototype`), and
        // where it does, the leaf dispatches on it. A loop head keeps its bound element
        // when the pure base only names the same realm - a constructor or static still replaces it.
        // A typed user chain also keeps its capture: replacing a captured this with the realm
        // would read another object's user slot in CommonJS.
        const receiverSite = namelessRoot ? null : nodeSite(receiver, metaPath);
        const receiverBinding = namelessRoot ? null
          : adapter.getBinding({ scope: receiverSite.scope, name: receiver.name, path: receiverSite.path, read: receiver });
        const aliasedRealm = receiverBinding && !receiverBinding.polyfillHint
          ? proxyGlobalRootName({ node: receiver, scope: receiverSite.scope, adapter, path: receiverSite.path }) : null;
        const rootIsAlias = aliasedRealm !== null && aliasedRealm !== receiver.name;
        const mintedMemo = rootIsAlias && ORPHAN_REF_PATTERN.test(receiver.name);
        const resolvedBase = namelessRoot ? { path: chainKeys } : resolveNestedReceiverBase({
          rootName: rootIsAlias ? aliasedRealm : receiver.name,
          keys: chainKeys,
          binding: rootIsAlias ? null : receiverBinding,
          adapter,
          resolveGlobalPolyfill,
          // a nav ending on a polyfillable STATIC dispatches on the static's own ponyfill, never on
          // the raw static off the realm (`{ Array: { of: { name } } } = globalThis`)
          resolveStaticPolyfill: (ctor, key) => staticHopPure({ ctorName: ctor, key, resolvePure: m => resolvePure(m, metaPath) }),
          // the chain is read where its receiver is
          read: receiverSite && { node: receiver, path: receiverSite.path },
        });
        const ref = (mintedMemo && !resolvedBase?.pure) || (POSSIBLE_GLOBAL_OBJECTS.has(resolvedBase?.pure?.hintName)
          && ((rootIsAlias && typedNavChain && !isBuiltInSurfaceNav(navSpelling, surfaceOptions))
            || forOfHeadDeclarationOf(receiver.name, { ...receiverSite, adapter })))
          ? { name: receiver.name, path: chainKeys } : resolvedBase;
        if (!ref) return null;
        // ... and a surface off a USER root is a getter each other reader of its hops - a sibling
        // leaf, the residual - would fire again: the shared re-read question, unless this dispatch is
        // the nav's only reader. it is asked of what the dispatch SPELLS: an alias the realm canon
        // proves holds the realm at this read is spelled as the realm, so the alias is not read again.
        // the SYMBOL leaf asks it too: its surface rule above says what it dispatches on, not how often
        const hostPath = rootIsAlias && ref === resolvedBase ? destructurePatternHostPath(metaPath) : null;
        const realmAtRead = hostPath
          && resolveObjectName({ objectNode: receiver, scope: hostPath.scope, adapter, path: hostPath }) === aliasedRealm;
        const spelledNav = realmAtRead ? chainKeys.reduce(memberFromKeyName, identifier(aliasedRealm)) : navSpelling;
        if (navSpelling && !typedNavChain && !dispatchMayReadNav(metaPath, spelledNav, {
          isOwnAlias: isOwnPureAlias, adapter, symbolLeaf: entry === 'get-iterator-method',
        })) return null;
        // ... and a nav ending ON a built-in surface dispatches off that surface's own PURE binding:
        // the leaf reads THROUGH the surface, which the anchored residual re-homing onto it never
        // does, so without this the claim shipped native beside the anchor (`{ Promise: { name } } =
        // globalThis` bound `_Promise.name`, undefined on a floor without it, where the other leg
        // dispatches `_nameMaybeFunction(_Promise)`). the root is asked with the hops: a capitalised
        // key off the user's own object merely LOOKS like that surface (`{ Object: { keys } } = src`),
        // and it dispatches through its own type, as on the other leg
        if (navSpelling && entry !== 'get-iterator-method' && !ref.pure && !isInstanceSurfaceNav(navSpelling, surfaceOptions)
          && isBuiltInSurfaceNav(navSpelling, surfaceOptions)) {
          return null;
        }
        const navValue = guarded(() => {
          let base = namelessRoot ? duplicateReceiver(liveReceiver?.() ?? receiverSpelling, injector)
            : ref.pure ? identifier(injectPureImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
          for (const key of ref.path) base = memberFromKeyName(base, key);
          // a DEFAULT on the way up folds BOTH arms into the receiver: the slot's own value when it
          // is defined, the default when it is not - one read of the nav, and the default evaluated
          // only where the source evaluates it (mirroring the default alone leaves the live arm raw)
          if (!typedNavChain?.slotDefault) return callExpression(identifier(id), [base]);
          const slotRef = injector.generateDeclaredRef(metaPath);
          return callExpression(identifier(id), [buildInstanceDefaultGuard({
            assignedRef: identifier(slotRef),
            call: base,
            defaultValue: typedNavChain.slotDefault,
            reread: identifier(slotRef),
          })]);
        });
        // the nameless root is the init itself, so this dispatch is its one evaluation: a channel
        // keeping the discarded init for its effects would run it again
        navValue.spellsInit = namelessRoot;
        return navValue;
      }
      if (!withDefault) {
        return override => callExpression(identifier(id),
          [override ? identifier(override) : duplicateReceiver(receiverSpelling, injector)]);
      }
      // a literal-route receiver is single-read (the residual died): the dispatch may hold
      // any expression; other receivers must be re-readable tokens - or a RESOLVED proxy nav,
      // whose passthrough spelling is one the guard reads once
      if (receiver?.type !== 'Identifier' && receiver?.type !== 'ThisExpression'
        && !literalRoute && !proxyNav && !isSeFreeMemberReceiver(receiver)) return null;
      const ref = memoJoin ? mintRefName() : injector.generateDeclaredRef(metaPath);
      // the VALUE node is captured (a sentinel rename detaches it from the prop before the
      // drain), but `.right` reads LAZILY: the walker's later in-place rewrites replace the
      // default THROUGH that slot, and the moved node must carry them - never a clone
      const valueNode = prop.value;
      function thunk(override) {
        const recv = override ? identifier(override)
          : proxyNav ? proxyNav() : duplicateReceiver(receiverSpelling, injector);
        return buildInstanceDefaultGuard({
          assignedRef: identifier(ref),
          call: callExpression(identifier(id), [recv]),
          defaultValue: valueNode.right,
          defaultPattern: valueNode,
          defaultName: valueNode.left?.name,
          reread: identifier(ref),
        });
      }
      if (memoJoin) thunk.leadRef = ref;
      return thunk;
    }
    const id = injectPureImport(entry, hintName);
    const staticValueNode = prop.value;
    const value = withDefault ? () => renderStaticDefaultGuard({
      read: identifier(id),
      defaultValue: staticValueNode.right,
      reread: identifier(id),
      alwaysDefined: true,
    }) : () => identifier(id);
    value.moduleSource = injectorState.getBindingInfo(id)?.source;
    return value;
  }

  // what the shared canons answer of a host's init, asked on the PRISTINE tree when the host records
  // its first job: by drain time the walk has respelled that init (a realm memo, a collapsed call
  // read) into a synthesized shape that no longer shows what it runs. `runs` is the residual canon's
  // question - does the init RUN code before the pattern binds? - and `readWhole` the rescue canon's:
  // does a discard keep the WHOLE init, a receiver read only a getter answers?
  const pristineInitFacts = new WeakMap();

  // babel's discarded-receiver sink rule: a read off an EFFECTFUL sequence spine stays whole unless
  // the shared drop gate calls it a droppable proxy nav - asked of the raw init, as babel asks it -
  // or the spine leads to a call the census resolves to a realm, whose nav keeps the call alone
  function keepsWholeDiscardedRead(init, at) {
    const leaf = init && unwrapRuntimeExpr(init);
    if (leaf?.type !== 'MemberExpression' || !mayHaveSideEffects(leaf)) return false;
    let spine = leaf;
    while (spine?.type === 'MemberExpression') spine = peelTransparentExpr(spine.object);
    return spine?.type === 'SequenceExpression'
      && !shouldDropRescueReceiver(leaf, { ...at, resolvePure: (meta, path) => resolvePure(meta, path) })
      && !liftedRealmNavEffect(leaf, at);
  }

  function residualRuns(host) {
    return pristineInitFacts.get(host)?.runs ?? false;
  }

  // the frame a claim's own pattern answers in, with the adapter: the ctx the shared prefix canon
  // (`observablePrefixElements`) asks its getter question in
  function patternFrame(metaPath) {
    return { ...nodeSite(null, metaPath), adapter };
  }

  function recordJob({ hostPath, job }) {
    const key = hostPath.node;
    if (!ledger.has(key)) ledger.set(key, { hostPath, jobs: [] });
    ledger.get(key).jobs.push(job);
    const residualHost = job.declarator ?? job.assignment;
    if (residualHost && !pristineInitFacts.has(residualHost)) {
      const init = residualHost.init ?? residualHost.right;
      const at = { scope: job.metaPath?.scope, adapter, path: job.metaPath };
      pristineInitFacts.set(residualHost, {
        runs: residualInitRunsEffects({ init, ...at }),
        readWhole: !!init && discardRescueNodesWithReads({ node: init, ...at })[0] === init,
        keepsWholeRead: keepsWholeDiscardedRead(init, at),
      });
    }
    // Babel exposes the replacement initializer immediately. Publish the same
    // module source only after this deferred declaration extraction is committed.
    const binding = job.value?.moduleSource && adapter.getBinding({ scope: job.metaPath?.scope, name: job.local, path: job.metaPath });
    if (job.declarator && bindingDeclaratorNode(binding) === job.declarator) {
      adapter.recordEmittedBindingSource(job.declarator, job.local, job.value.moduleSource);
    }
  }

  // the RAW passthrough of a whole hop the branch literal keeps as the source read it (a wks leaf
  // or an instance member below it): the value at the hop chain off the branch root - never
  // through a ctor's pure binding - and skipped for the later passes
  // `raw`: a WHOLE-hop passthrough keeps the source's own read (a member target the mirror left as
  // written), so it never reads through a constructor's pure binding. an instance slot's DISPATCH
  // receiver is the opposite case - nothing of the ponyfill lands in the user's object - and reads
  // it the way every other resolved nav does (`_Set`, not `_globalThis.Set`), the babel leg's canon
  function renderWholeHopPassthrough(tree, receiver, { raw = true } = {}) {
    if (receiver?.type !== 'Identifier') return null;
    const ref = resolvePassthroughRef({
      keyPath: tree.chainKeys,
      receiverName: receiver.name,
      receiverIsProxy: POSSIBLE_GLOBAL_OBJECTS.has(receiver.name),
      resolveGlobalPolyfill,
      adapter,
      raw,
    });
    let read = ref.pure ? identifier(injectPureImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
    for (const hop of ref.path) read = memberFromKeyName(read, hop);
    markSubtreeSkipped(skippedNodes, read);
    return read;
  }

  // render one pattern's synth literal over a receiver: polyfilled slots take their import,
  // the rest read through the receiver (its pure proxy import when it has one) - the
  // caller's own value still wins, the literal only serves the defaulted path. a RAW slot (a
  // member target the mirror keeps as written) reads raw through the receiver - never the ctor's
  // pure binding, which carries no statics - and the later passes leave that read alone
  // the one synth prop constructor: the canon's `__proto__` rule rides every entry - the
  // key re-spells as a STRING literal (a bare `[__proto__]` would read a binding)
  function synthProp(key, value, { computed = false } = {}) {
    if (!computed && synthKeyMustBeComputed(key)) {
      return objectProperty(literal('__proto__'), value, { computed: true });
    }
    return objectProperty(key, value, { computed });
  }

  // eslint-disable-next-line max-statements -- one ordered render pass over every slot class
  function renderPatternLiteral({
    plan,
    receiver,
    baseName = null,
    baseIsProxy = false,
    passthroughPrefix = null,
    slots,
    rawSlots = null,
    requireFullCoverage = false,
    // the RESOLVED key spelling (`from:` for a folded `[k]`) is the nested mirror's canon
    // whether or not coverage is required; the flat routes keep the source spelling
    resolvedSpelling = requireFullCoverage,
    memoBaseName = null,
    instanceReceiver = null,
    metaPath = null,
    sealedProbePlan = null,
    guardedReceiverPlan = null,
    passthroughBase = null,
  }) {
    // the read one slot passes through: the branch root's own name (its pure proxy import where the
    // canon names one) walked down the accumulated key path. `asRef` hands back the unwalked
    // resolution the generic render spells its own key hops onto; null where the receiver has no name
    function passthroughSlotRef(planEntry, { asRef = false } = {}) {
      const passthroughName = baseName ?? (receiver?.type === 'Identifier' ? receiver.name : null);
      if (!passthroughName) return null;
      const ref = resolvePassthroughRef({
        keyPath: [...passthroughPrefix ?? [], planEntry.lookupKey],
        receiverName: passthroughName,
        // the MINTED spelling of a proxy global answers this like its source name does: the alias IS
        // that realm, and reading it as an ordinary receiver left every key under it unresolved -
        // a static below a hop then rendered raw off `_self` where its source-spelled twin resolved
        receiverIsProxy: baseIsProxy || isMintedOrProxyName(passthroughName, injectorState),
        resolveGlobalPolyfill,
        adapter,
        // ... and a slot REACHING a polyfillable static takes that static's own ponyfill, which is
        // the shared tree's answer for the same slot: what a literal puts there is a VALUE, so the
        // target writes it exactly as a binding target would. without the resolver this leg read the
        // static raw off the realm (`_globalThis.Object.keys`) beside a sibling slot carrying its own
        // ponyfill in the same literal - a lost polyfill, and a leg split once the tree stopped bailing
        resolveStaticPolyfill: (ctorName, key) => staticHopPure({
          ctorName, key, resolvePure: meta => resolvePure(meta, metaPath ?? null),
        }),
        raw: planEntry.optedOut || !!rawSlots?.has(planEntry.dedupKey),
      });
      if (asRef) return ref;
      let read = ref.pure ? identifier(injectPureImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
      for (const hop of ref.path) read = memberFromKeyName(read, hop);
      return read;
    }

    const entries = [];
    for (const planEntry of plan) {
      const spelled = synthEntryKey(planEntry, { resolvedSpelling });
      // a CARRIED key is the pattern's own node - clone it, or the literal and the residual
      // share one object and every later mutation lands in both
      let key = spelled.fromSource ? cloneNode(spelled.key) : spelled.key;
      let { computed } = spelled;
      // a direct wks key spells the INJECTED pure symbol binding (`[_Symbol$iterator]:`) -
      // the raw member clone would throw off-engine where the pattern's swapped key reads
      // the polyfill; an unresolvable symbol static has no spelling, so the literal declines
      if (planEntry.wksSpelling) {
        if (!metaPath) return null;
        const symbolPure = resolvePure(symbolStaticMeta(planEntry.wksSpelling), metaPath);
        if (!symbolPure) return null;
        key = identifier(injectPureImport(symbolPure.entry, symbolPure.hintName));
        computed = true;
      }
      // ... and an UNCOVERED `Symbol.iterator` slot reads through the method-lookup helper,
      // the one spelling both emitters print for that read anywhere else - a raw
      // `receiver[_Symbol$iterator]` answers undefined off-engine
      const gimPassthrough = !planEntry.optedOut && planEntry.wks === 'iterator' && !slots.get(planEntry.dedupKey);
      function slotRead(base) {
        return renderSynthSlotRead({ base, key, computed, lookupKey: planEntry.lookupKey });
      }
      function pushSlot(value) {
        entries.push(synthProp(key, gimPassthrough && value.type === 'MemberExpression'
          ? callExpression(identifier(injectPureImport(SYMBOL_ITERATOR_PURE_RESULT.entry,
            SYMBOL_ITERATOR_PURE_RESULT.hintName)), [value.object])
          : value, { computed }));
      }
      const binding = planEntry.optedOut ? null : slots.get(planEntry.dedupKey);
      // an instance slot whose hop read the passthrough could not name (a branch root that is no
      // identifier) has nothing to dispatch on - the literal declines rather than spell a bare hop
      if (binding?.instanceHop) return null;
      // a DESCENDED static slot spells the pattern's own keys off the ponyfill, the claiming ones
      // through their dispatch - the pattern above it then binds off this literal, as it bound off
      // the flat ponyfill before
      if (binding?.descended) {
        pushSlot(objectExpression(binding.descended.map(leaf => synthProp(identifier(leaf.key), leaf.helper
          ? callExpression(identifier(leaf.helper), [identifier(binding.base)])
          : memberExpression(identifier(binding.base), identifier(leaf.key))))));
        continue;
      }
      // a DESCENDED HOP - a slot the constructor polyfills no static for - has no ponyfill to spell
      // off, so its keys read through the hop's own value at the branch root, the claiming ones
      // through their dispatch on that read. the other leg reaches the same shape by re-traversing
      // the flat passthrough it emitted, a second pass this drain does not have
      if (binding?.descendedHop) {
        const hopBase = passthroughSlotRef(planEntry);
        if (!hopBase) return null;
        pushSlot(objectExpression(binding.descendedHop.map(leaf => synthProp(identifier(leaf.key), leaf.helper
          ? callExpression(identifier(leaf.helper), [cloneNode(hopBase)])
          : memberFromKeyName(cloneNode(hopBase), leaf.key)))));
        continue;
      }
      if (binding) {
        // an INSTANCE slot dispatches on a CLONE of the receiver the literal replaces
        // (`{ at } = [1, 2]` -> `{ at: _atMaybeArray([1, 2]) }`) - through the receiver's own pure
        // binding where the shared rule names one, since this literal is re-emitted where no visitor
        // reaches it again and a bare `Iterator` there would read the name the pass replaces
        pushSlot(typeof binding === 'string' ? identifier(binding)
          : callExpression(identifier(binding.helper),
            [synthInstanceReceiver(binding.receiver, metaPath, { adapter, resolvePure, injectPureImport })]));
        continue;
      }
      // a memoized receiver: unresolved slots read the memo param (`other: _ref.other`)
      if (memoBaseName) {
        const literalKey = planEntry.keyNode?.type === 'Literal';
        const read = memberExpression(identifier(memoBaseName),
          literalKey ? cloneNode(planEntry.keyNode) : computed ? cloneNode(key) : identifier(planEntry.lookupKey),
          { computed: computed || literalKey });
        pushSlot(read);
        continue;
      }
      // an uncovered STATIC slot off a constructor receiver is that static's polyfill, not a raw
      // read (`{ [Symbol.iterator]: it, hasOwn }` over `Object` spells `hasOwn: _Object$hasOwn`,
      // the other leg's mirror) - asked before the fresh-read fallback below
      if (!computed && !planEntry.optedOut && pushConstructorStaticSlot({
        receiverNode: instanceReceiver, key: planEntry.lookupKey, metaPath, resolvePure, injectPureImport, pushSlot,
      })) continue;
      // an INSTANCE-synth receiver is re-readable by construction, so an uncovered slot
      // reads through a clone of it (`other: [1, 2].other` - a fresh read, matching the
      // native fresh-value semantics)
      if (instanceReceiver) {
        pushSlot(slotRead(cloneNode(instanceReceiver)));
        continue;
      }
      // a `this` receiver is re-readable by construction: an uncovered slot reads through a
      // fresh clone of it (`custom: this.custom` - the static-`this` synth's own passthrough)
      if (receiver?.type === 'ThisExpression') {
        pushSlot(slotRead({ type: 'ThisExpression' }));
        continue;
      }
      // Inside a synthesized guard's live branch its probe is already known to be defined.
      // Read unresolved siblings through the pristine collapse plan captured before traversal.
      if (guardedReceiverPlan) {
        const guardedBase = renderProxyReceiverPlan(guardedReceiverPlan, { injectImport: injectPureImport });
        if (guardedBase) {
          pushSlot(slotRead(guardedBase));
          continue;
        }
      }
      // a receiver whose navigation SHORT-CIRCUITS cannot be re-read off the collapsed root:
      // that answers a defined value where the source answers undefined. re-read through the
      // SOURCE nav instead, its own root substituted (`(_globalThis.window?.Array).other`)
      // ... unless the LEAF whole-swaps to a pure ctor: that binding is always defined and the
      // read goes through it (`globalThis.window?.Map` -> `_Map.other`)
      const navAliasCtx = metaPath ? { ...nodeSite(receiver, metaPath), adapter } : null;
      // ... and only a `?.` that can GENUINELY short-circuit: one over a proven root is dead
      // text and the nav collapses like its plain twin
      const navPassthrough = navAliasCtx && receiver && receiverCarriesLiveOptional(receiver)
        && navValueCanShortCircuit(receiver, m => resolvePure(m, metaPath), navAliasCtx)
        && !proxyGlobalMemberCtorPureSwap({
          receiver, aliasCtx: navAliasCtx, resolvePure: m => resolvePure(m, metaPath),
        });
      if (navPassthrough) {
        // the GUARDED collapse when the live `?.` sits over an erasable hop: its object is the
        // probe, its own ponyfill the alternate, the tail hanging back on
        // (`globalThis.window?.self.Object` -> `(null == _globalThis.window ? void 0 : _self.Object)`)
        const navRead = guardedNavPassthrough(receiver, metaPath,
          { adapter, resolveGlobalPolyfill, injectPureImport }) ?? (() => {
          const clone = substituteProxyRootsInClone(cloneStamped(receiver), metaPath,
            { adapter, resolveGlobalPolyfill, injectPureImport });
          // the read sits OUTSIDE the chain the nav carries: fused in, it would short-circuit too
          return chainExpression(clone);
        })();
        pushSlot(slotRead(navRead));
        continue;
      }
      // a nested mirror has no passthrough base (the hop nav was consumed) - every slot
      // must be a polyfill
      if (requireFullCoverage) return null;
      // a SEALED receiver reads through the guard the source's own read performs: the collapsed
      // root would answer a defined value where the seal throws. the plan is the PRISTINE one -
      // by drain time the walk has erased the `?.` this passthrough is about
      // (`customK: (null == _g.window ? void 0 : _self).Object.customK`)
      const sealedBase = sealedProbePlan ? renderSealedNavProbe(sealedProbePlan, metaPath, probeRenderCtx) : null;
      if (sealedBase) {
        pushSlot(slotRead(sealedBase));
        continue;
      }
      // passthrough needs a NAMED base to read through; a bare member receiver without one
      // serves only a fully-covered pattern, and so does the left a collapsed fallback re-spells
      // (`passthroughBase`: `{ groupBy: _Map$groupBy, prototype: mkM().prototype }` for `mkM() || Object`).
      // a `?.` it carries is a dead one (a live one took the nav branch above), sealed off from the
      // read past it all the same, as the other leg prints the chain (`(box?.U).prototype`)
      const spelledBase = passthroughBase ?? (receiver?.type === 'MemberExpression' ? receiver : null);
      if (!baseName && spelledBase) {
        const clone = cloneStamped(spelledBase);
        const read = metaPath ? substituteProxyRootsInClone(clone, metaPath,
          { adapter, resolveGlobalPolyfill, injectPureImport }) : clone;
        pushSlot(slotRead(receiverCarriesLiveOptional(read) ? chainExpression(read) : read));
        continue;
      }
      const ref = passthroughSlotRef(planEntry, { asRef: true });
      if (!ref) return null;
      let base = ref.pure ? identifier(injectPureImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
      // ... a slot the constructor base - raw or its pure binding - answers through an INSTANCE
      // dispatch reads through it (`instanceHopDispatch`)
      const dispatch = !ref.static && !computed && key.type !== 'Literal' && ref.path.length === 1
        && ref.path[0] === planEntry.lookupKey && metaPath ? instanceHopDispatch({
          ctorName: ref.pure ? ref.ctor : ref.name, key: ref.path[0], resolvePure: m => resolvePure(m, metaPath),
        }) : null;
      if (dispatch) {
        pushSlot(callExpression(identifier(injectPureImport(dispatch.entry, dispatch.hintName)), [base]));
        continue;
      }
      // a string-spelled source key reads back computed with the same literal
      // (`"z": Array["z"]`), and a `[k]`-slot passthrough reads through the same computed
      // identifier (`[k]: Array[k]`) - the babel spellings
      for (const hop of ref.path) {
        if (hop === planEntry.lookupKey && (computed || key.type === 'Literal')) {
          base = memberExpression(base, cloneNode(key), { computed: true });
        } else base = memberFromKeyName(base, hop);
      }
      if (planEntry.optedOut || rawSlots?.has(planEntry.dedupKey)) markSubtreeSkipped(skippedNodes, base);
      pushSlot(base);
    }
    return objectExpression(entries);
  }

  // canonical re-read target for a MEMOIZED receiver, peeled to its SE tail - the babel
  // `buildMemoArg` twin: a pure-ctor leaf whole-swaps (the erased navigation's harvested
  // effects re-run ahead of the binding), an alias / proxy chain collapses through the
  // shared plan. resolved at REGISTRATION (pristine tree); null leaves the receiver live
  function planMemoArg(memoReceiver, metaPath) {
    const aliasCtx = { ...nodeSite(memoReceiver, metaPath), adapter };
    const plan = planMemoReadTarget(memoReceiver, { aliasCtx, resolvePure: m => resolvePure(m, metaPath) });
    if (!plan) return null;
    let target = plan.pure
      ? identifier(injectPureImport(plan.pure.entry, plan.pure.hintName))
      : renderProxyReceiverPlan(plan.plan, { injectImport: injectPureImport });
    if (!target) return null;
    // the plan's clones detach from the walk before their own claims land: a pristine
    // proxy-global root inside a harvested effect substitutes its pure binding here
    // (`(() => (n++, globalThis))()` -> `(() => (n++, _globalThis))()`)
    target = substituteProxyRootsInClone(target, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport });
    // the harvested se nodes stay LIVE - the keepLive span the registration marks lets
    // their claims land in place during the walk - and the DRAIN clones them, so the memo
    // argument carries the rewritten spelling instead of a pre-claim snapshot (a
    // registration-time clone froze `getObj().at(0)` raw and dropped the claim)
    return { prefix: plan.prefix, liveSe: plan.se, target, tail: plan.tail };
  }

  // the memo argument: the planned canonical target behind the receiver's own LIVE prefix
  // effects (their claims landed during the walk), or the live receiver when no plan held
  // markRewrite fires ONLY on a landed mutation: a registration whose drain drops (partial
  // coverage, a failed replace) must leave the engine's ABSTAIN untouched - a spurious mark
  // turns the abstain into a reprint the structural gate then compares strictly
  // every key resolved: no re-read, so the receiver's observable setup rescues AHEAD of the
  // plain literal instead of the memo (`(_at(...), { from: _Array$from })`); harvested from
  // the LIVE tree - the walk's in-place rewrites already landed. true when it rendered
  function renderFlatRescueLiteral(pending) {
    const { plan, receiver, slots, metaPath, branchMirror } = pending;
    const flatLiteral = renderPatternLiteral({
      plan, receiver, slots, guardedReceiverPlan: pending.guardedReceiverPlan ?? null,
    });
    if (!flatLiteral) return false;
    const synthGuard = planSynthReceiverGuard({ receiver, ...nodeSite(receiver, metaPath), adapter,
      resolvePure: meta => resolvePure(meta, metaPath) });
    if (synthGuard) {
      let guarded = renderSynthReceiverGuard(synthGuard, flatLiteral);
      guarded = substituteProxyRootsInClone(guarded, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport });
      if (replaceNodeInTree(program, receiver, guarded)) {
        markRewrite();
        markSubtreeSkipped(skippedNodes, receiver);
      }
      return true;
    }
    const rescueSource = receiver.type === 'LogicalExpression' ? receiver.left : receiver;
    // ... and in a per-BRANCH mirror a hop whose object is not a bare binding drops too: the
    // literal REPLACES the branch value, so re-emitting the read adds a member access off the
    // ponyfilled root that nothing consumes (`(e(), globalThis).Array` sinks to `e()` alone).
    // a PARAM-default host keeps it - babel spells the read there
    const rescueOverBinding = rescueSource?.type === 'MemberExpression'
      && peelTransparentExpr(rescueSource.object)?.type === 'Identifier';
    // a SEALED left is an observable read the swap erases - it re-emits whole, the way the
    // non-logical twin does (`((null == _globalThis.window ? void 0 : (c5++, _self)).Object, ...)`);
    // every other logical left keeps the harvest, its value being one the literal replaces
    const sealedLeft = receiver.type === 'LogicalExpression' || branchMirror
      ? renderSealedNavProbe(pending.sealedProbePlan, metaPath, probeRenderCtx) : null;
    // the multi-hop proxy drop and the per-branch mirror both ERASE the read instead of keeping it
    const dropRescueReceiver = shouldDropRescueReceiver(rescueSource)
      || (branchMirror && !insideParamPosition(metaPath)
        && rescueSource?.type === 'MemberExpression' && !rescueOverBinding);
    // `rescueSe` is the provider's verdict that the receiver's own READ has to run - re-emitted
    // WHOLE, the way babel's swap spells it, because a navigation the literal replaces is
    // observable beyond the effects it buries (it throws off an absent host). everything else asks
    // the rescue canon, which owns what a DISCARD silently drops
    const rescue = sealedLeft ? [sealedLeft]
      : pending.rescueSe && !dropRescueReceiver ? [cloneStamped(rescueSource)]
      : discardRescueNodes({ node: rescueSource, ...nodeSite(rescueSource, metaPath), adapter })
        .map(node => cloneStamped(node));
    // the clone is built at DRAIN time, past the walk: a proxy root the registration
    // suppressed (its spine was the memo plan's tail) would ship raw, so the clone
    // substitutes it here (`(() => { eff(); return globalThis; })().self.Array`)
    rescue.forEach((node, at) => {
      rescue[at] = substituteProxyRootsInClone(node, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport });
    });
    const resolved = rescue.length ? sequenceExpression([...rescue, flatLiteral]) : flatLiteral;
    if (replaceNodeInTree(program, receiver, resolved)) {
      markRewrite();
      markSubtreeSkipped(skippedNodes, receiver);
    }
    return true;
  }

  // eslint-disable-next-line max-statements -- flat and nested mirrors share the receiver rescue and final replacement lifecycle
  function drainSynthLiterals() {
    // both ledgers are Maps - the entry iteration yields [key, pending] pairs
    for (const [, pending] of [...synthLedger, ...pendingBranchSynths]) {
      const { plan, receiver, baseName, baseIsProxy, leadingEffects, passthroughPrefix, slots, nestedOnly } = pending;
      // the call-branch memo channel: `function (_ref) { return { g: _G$g, other: _ref.other }; }(<recv>)`
      // - the receiver (already claimed in place) runs once as the argument
      if (pending.callBranch) {
        // every key resolved: no re-read, so the receiver's observable setup rescues AHEAD
        // of the plain literal instead of the memo (`(_at(...), { from: _Array$from })`);
        // harvested from the LIVE tree - the walk's in-place rewrites already landed
        if (plan.every(entry => slots.has(entry.dedupKey)) && renderFlatRescueLiteral(pending)) continue;
        // the memo arg RE-PLANS at DRAIN time: an in-place claim REPLACES its node, so a
        // registration-time render (or captured se refs) re-emits pre-claim snapshots -
        // `log.push(...)` reached the arg raw and its injected import died unreferenced
        // with the discarded original. a re-plan that no longer matches (the walk already
        // substituted the roots past its shape checks) keeps the registration target and
        // re-harvests only the LIVE se off the surviving container
        if (pending.memoArgPlan && pending.metaPath) {
          const replanned = planMemoArg(pending.memoReceiver, pending.metaPath);
          if (replanned) pending.memoArgPlan = replanned;
          else if (pending.memoArgPlan.liveSe?.length) {
            pending.memoArgPlan.liveSe = discardRescueNodes({
              node: pending.memoArgPlan.tail,
              ...nodeSite(pending.memoArgPlan.tail, pending.metaPath),
              adapter,
            });
          }
        }
        // the param name MINTS at registration (see `registerSimpleSynthSlot`): the pattern is
        // visited before its own init, and babel numbers by that order
        const synthGuard = planSynthReceiverGuard({ receiver, ...nodeSite(receiver, pending.metaPath), adapter,
          resolvePure: meta => resolvePure(meta, pending.metaPath) });
        const memoArg = synthGuard ? cloneStamped(synthGuard.fallback?.left ?? receiver) : buildMemoArg(pending);
        const memoTail = !synthGuard && peelNestedSequenceExpressions(memoArg).tail;
        const reusableMemo = memoTail?.type === 'Identifier' && isReusableReceiver(memoTail, {
          interveningEffects: true, ctx: { ...nodeSite(memoTail, pending.metaPath), adapter, injectorState },
        });
        const memoName = reusableMemo ? memoTail.name : pending.memoName ?? mintRefName();
        const synthLiteral = renderPatternLiteral({
          plan, receiver, slots, memoBaseName: memoName,
          guardedReceiverPlan: pending.guardedReceiverPlan ?? null,
        });
        if (!synthLiteral) continue;
        const value = synthGuard ? renderSynthReceiverGuard({ probe: identifier(memoName) }, synthLiteral) : synthLiteral;
        let iife = reusableMemo ? sequenceExpression([memoArg, synthLiteral]) : callExpression({
          type: 'FunctionExpression', id: null, params: [identifier(memoName)], generator: false, async: false,
          body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: value }] },
        }, [memoArg]);
        if (synthGuard) iife = renderSynthReceiverGuard({ fallback: synthGuard.fallback }, iife);
        if (replaceNodeInTree(program, receiver, iife)) markRewrite();
        continue;
      }
      // merged nested mirrors: one literal per subtree, wrapped up its own hop chain and
      // joined at the top level - rendered only when every outer hop prop registered
      if (pending.nestedTrees) {
        const [{ outerPattern }] = pending.nestedTrees;
        // a literal that will not render - a hop the mirror declined after a sibling registered, a
        // subtree with no spelling, no ponyfill in any subtree - leaves the branch as the source
        // wrote it, its proxy roots substituted: the registration's skip kept the later passes off
        // that read, so `globalThis` would otherwise stay raw where every other read is `_globalThis`
        function restoreBranch() {
          const restored = substituteProxyRootsInClone(cloneStamped(receiver), pending.metaPath,
            { adapter, resolveGlobalPolyfill, injectPureImport });
          if (restored !== receiver && replaceNodeInTree(program, receiver, restored)) markRewrite();
        }
        // the arity is counted in OUTER props, not in subtrees: one outer prop may reach several hops
        // under a shared proxy step, each registering a subtree of its own, and only the step a
        // subtree enters the pattern by says which outer prop it covers
        // ... and an INSTANCE slot alone is no reason to mirror: it spells the ponyfill's dispatch on
        // a read the source already performs, so a tree set with no real polyfill leaf leaves the
        // branch as written - the shared plan's `hasPolyfill` metric, asked across the merged subtrees
        // ... and neither is a ctor SLOT: it is a key the literal OWES once some hop has earned that
        // literal, never the reason to mint one (`{ Set: S, Promise: { customZ } }` keeps the realm
        // on both legs; the same slot beside a polyfilled hop rides the literal that hop earned)
        if ((outerPattern && outerPattern.properties.length > 1
          && new Set(pending.nestedTrees.map(tree => tree.chainKeys[0])).size !== outerPattern.properties.length)
          || pending.nestedTrees.every(tree => tree.ctorSlot || [...tree.slots ?? []]
            .every(([, slot]) => slot?.instanceHop || slot?.descendedHop))) {
          restoreBranch();
          continue;
        }
        const topProps = [];
        // the object a hop's key path hangs its subtree on, minted once per PATH: two hops sharing a
        // leading proxy step land in the one object that step spells (`{ self: { Map: {}, Array: {} } }`),
        // where a second same-named prop would hide the first - the pattern reads the literal by key
        const hopLevels = new Map();
        function hopContainer(keys) {
          if (!keys.length) return null;
          const path = keys.join('.');
          const held = hopLevels.get(path);
          if (held) return held;
          const level = objectExpression([]);
          hopLevels.set(path, level);
          const host = hopContainer(keys.slice(0, -1));
          (host ?? { properties: topProps }).properties.push(objectProperty(identifier(keys.at(-1)), level));
          return level;
        }
        for (const tree of pending.nestedTrees) {
          // an instance slot's receiver is the hop's OWN passthrough read, resolved here where the
          // branch root is known (`_globalThis.Object`) - one fresh node per slot, never shared
          for (const [slotKey, slot] of tree.slots ?? []) {
            if (!slot?.instanceHop) continue;
            const hopRead = renderWholeHopPassthrough(tree, receiver, { raw: false });
            if (hopRead) tree.slots.set(slotKey, { helper: slot.helper, receiver: hopRead });
          }
          // a ctor SLOT is the whole subtree: the constructor's own ponyfill under the key the
          // pattern reads it by (`Set: _Set` beside `Map: { groupBy: _Map$groupBy }`)
          const sub = tree.ctorSlot ? identifier(tree.ctorSlot)
            : tree.wholeHop ? renderWholeHopPassthrough(tree, receiver) : renderPatternLiteral({
              plan: tree.plan,
              receiver,
              slots: tree.slots,
              rawSlots: tree.rawSlots ?? null,
              passthroughPrefix: tree.chainKeys,
              resolvedSpelling: true,
            });
          if (!sub) {
            topProps.length = 0;
            break;
          }
          const host = hopContainer(tree.chainKeys.slice(0, -1));
          (host ?? { properties: topProps }).properties.push(
            objectProperty(identifier(tree.chainKeys.at(-1)), sub));
        }
        if (!topProps.length) {
          restoreBranch();
          continue;
        }
        const consumedBranch = receiver;
        if (replaceNodeInTree(program, receiver, objectExpression(topProps))) {
          markRewrite();
          markSubtreeSkipped(skippedNodes, consumedBranch);
        }
        continue;
      }
      let rendered = renderPatternLiteral({
        plan,
        receiver,
        baseName,
        baseIsProxy,
        passthroughPrefix,
        slots,
        requireFullCoverage: nestedOnly,
        instanceReceiver: pending.instanceReceiver ?? null, metaPath: pending.metaPath ?? null,
        sealedProbePlan: pending.sealedProbePlan ?? null,
        guardedReceiverPlan: pending.guardedReceiverPlan ?? null,
        passthroughBase: pending.passthroughBase ?? null,
      });
      if (!rendered) continue;
      const synthGuard = pending.metaPath && planSynthReceiverGuard({
        receiver, ...nodeSite(receiver, pending.metaPath), adapter,
        resolvePure: meta => resolvePure(meta, pending.metaPath),
      });
      if (synthGuard) {
        rendered = renderSynthReceiverGuard(synthGuard, rendered);
        rendered = substituteProxyRootsInClone(rendered, pending.metaPath, { adapter, resolveGlobalPolyfill, injectPureImport });
      } else {
        // a SEALED receiver read is observable - the source paren ends the chain, so the read past
        // it throws off-engine where the swapped literal just answers. it re-emits as a discarded
        // throw probe ahead of the literal, which is the source's own spelling of what the swap erases
        const sealedProbe = pending.sealedProbePlan
          ? renderSealedNavProbe(pending.sealedProbePlan, pending.metaPath, probeRenderCtx)
          : sealedNavProbeRead(receiver, pending.metaPath, probeRenderCtx);
        if (sealedProbe) rendered = sequenceExpression([sealedProbe, rendered]);
        // a collapsed logical re-runs its left sequence prefix ahead of the literal - what of it runs something,
        // the shared trim canon's cut (a dead `0,` is a comma the source wrote)
        const leading = leadingEffects && pending.metaPath ? observablePrefixElements(leadingEffects.expressions.slice(0, -1),
          { ...nodeSite(receiver, pending.metaPath), adapter }) : leadingEffects?.expressions.slice(0, -1) ?? [];
        if (leading.length) rendered = sequenceExpression([...leading, rendered]);
      }
      if (replaceNodeInTree(program, receiver, rendered)) {
        markRewrite();
        markSubtreeSkipped(skippedNodes, receiver);
      }
    }
    synthLedger.clear();
    pendingBranchSynths.clear();
  }

  // Land the shared sole-key template in each original declarator slot. The source
  // receiver and key stayed live until the traversal finished rewriting their claims.
  function drainKeyedReads(declaration, jobs) {
    for (const job of jobs) {
      const exportBody = job.keyReadPlan.exported
        ? statementListOf(job.declarationPath.parentPath.parentPath.node) : null;
      const exported = exportBody?.find(node => node.type === 'ExportNamedDeclaration'
        && node.declaration?.declarations?.includes(job.declarator));
      if (exported) declaration = exported.declaration;
      const running = job.receiverSlot ? job.receiverSlot.owner[job.receiverSlot.key] : job.declarator.init;
      const receiver = unwrapRuntimeExpr(running);
      const discarded = job.discardedSlots?.map(({ owner, key }) => owner[key]);
      const inlineReceiver = job.proven && job.keyReadPlan.inlineReceiver;
      const reuseReceiver = inlineReceiver || job.keyReadPlan.reuseReceiver && receiver?.type === 'Identifier';
      const receiverRef = reuseReceiver ? receiver.name : discarded ? null : job.receiverName ?? mintRefName();
      const liveKeys = destructureKeyReadPlan({
        node: job.prop,
        parentPath: { node: job.declarator.id },
      }, patternFrame(job.metaPath))?.keys ?? [];
      const rendered = renderKeyedDestructureRead({
        receiverName: receiverRef,
        receiver: running,
        binding: job.collapseLeafName ? identifier(job.collapseLeafName) : propBindingTarget(job.prop),
        keys: liveKeys.map(key => cloneNode(key)),
        read: job.value(inlineReceiver ? null : receiverRef),
        storeReceiver: job.keyReadPlan.exported && !reuseReceiver && !discarded,
        reuseReceiver,
        proven: !!job.proven,
        discarded,
      });
      const slot = declaration.declarations.indexOf(job.declarator);
      declaration.declarations.splice(slot, 1, ...rendered);
    }
  }

  // eslint-disable-next-line max-statements -- one flush pass dispatches every host kind
  function drain() {
    drainSynthLiterals();
    drainSequenceAssignments(ledger, { program, drainAssignment, drainAssignOverwrite, markRewrite, seqDrainedSlots });
    for (const [, { hostPath, jobs }] of ledger) {
      const hostNode = hostPath.node;
      // one host may collect jobs of DIFFERENT kinds (a plain destructure declarator next
      // to an opaque-init one) - each drain sees only its own, and the body index is
      // re-taken between them (each splices)
      const declNode = hostNode.type === 'ExportNamedDeclaration' ? hostNode.declaration : hostNode;
      const kinds = new Map();
      for (const job of jobs) {
        if (!kinds.has(job.host)) kinds.set(job.host, []);
        kinds.get(job.host).push(job);
      }
      // memo-decl and plain declaration jobs drain TOGETHER, per declarator in source
      // order - separate passes lost the statement order across sibling declarators
      if (kinds.has('memo-decl')) {
        const merged = [...kinds.get('declaration') ?? [], ...kinds.get('memo-decl')];
        kinds.delete('memo-decl');
        kinds.set('declaration', merged);
      }
      // These reads replace declarators in place. Land them before another kind splits the
      // host into new declarations; afterwards declNode may no longer belong to the program.
      if (kinds.has('key-read')) {
        drainKeyedReads(declNode, kinds.get('key-read'));
        kinds.delete('key-read');
      }
      for (const [kind, kindJobs] of kinds) {
        if (kind === 'for-init') {
          drainForInit({ hostNode: declNode, jobs: kindJobs });
          continue;
        }
        if (kind === 'assignment' && kindJobs[0]?.bodyless) {
          drainAssignment({ hostNode, body: null, at: -1, jobs: kindJobs });
          continue;
        }
        if (kind === 'bodyless-decl') {
          drainBodylessDeclaration({ hostNode: declNode, jobs: kindJobs });
          continue;
        }
        if (drainBodylessWrapKinds({ kind, kindJobs, hostNode }, { program, consumedAssignmentRemains })) continue;
        const body = statementListOf(hostPath.parentPath?.node);
        if (!body) continue;
        // the statement this kind was recorded against may be GONE - another kind's drain rewrote
        // the declaration around its own declarator - so the jobs land on whatever now holds theirs
        const live = liveHostStatement(body, hostNode, kindJobs[0]?.declarator);
        if (!live) continue;
        const { at } = live;
        switch (kind) {
          case 'assign-overwrite':
            drainAssignOverwrite({ body, at, jobs: kindJobs });
            break;

          case 'declaration':
            drainDeclaration({ hostNode: live.declaration ?? declNode, body, at, jobs: kindJobs });
            break;
          default: drainAssignment({ hostNode, body, at, jobs: kindJobs });
        }
      }
    }
    // Keep shared declaration nodes alive until every sibling's queued job has drained.
    for (const [declaration, body] of pendingSplits) {
      // A live native capture keeps its group. User bindings extracted from a fully
      // consumed capture do not keep the retired receiver's declaration joined.
      if (declaration.declarations.every(node => !capturedSiblingHosts.has(node)
        || !patternBindingCount(node.id)
        || node.id.type === 'Identifier' && !injectorState.isOwnPassGeneratedName(node.id.name))) {
        splitMultiDeclaratorHost({ declaration, body, markRewrite });
      }
    }
    pendingSplits.clear();
    const jobHostSiblings = jobHostSiblingDeclarators(ledger);
    // the hop-host notes drain AFTER the jobs: a host an extraction entered leaves a RESIDUAL
    // behind (`{ Array: { junk } } = _globalThis` beside the claims it consumed), and that residual
    // re-anchors the way an untouched host does (`{ junk } = _globalThis.Array`, the babel canon) -
    // asked first, the note would anchor a pattern the drain still has to prune, and asked only
    // of hosts no job owned, the leftover stayed on the proxy root where the other leg anchors.
    // a residual the drain anchored itself no longer reads as a surface hop, so the note is inert there
    for (const [host, options] of hopHosts) {
      // an ASSIGNMENT host holds the same shape under different field names - the re-anchor
      // reads a view of it and the result writes back
      if (!options.assignHost) {
        if (reanchorSoleCtorHopResidual(host, options) && !jobHostSiblings.has(host) && !capturedSiblingHosts.has(host)) {
          splitMultiDeclaratorHost({ program, declarator: host, markRewrite });
        }
        continue;
      }
      const view = { id: host.left, init: host.right };
      // the prefix a lift may take is the SOURCE's own sequence: a kept-write re-read the
      // re-anchor synthesises stays INSIDE the assignment, where the value it stored is what
      // the pattern reads (`({ cr } = (q2 = _globalThis, _globalThis))`). asked before the
      // re-anchor rewrites the init - after it, the two spellings are the same node type
      // ... and a CALL init the re-anchor turned into one: the prefix it minted is the source's own
      // call, which belongs ahead of the assignment as its own statement (the other leg's flatten),
      // not inside the value the pattern reads
      const sourceSeqInit = peelTransparentExpr(host.right)?.type === 'SequenceExpression'
        || isCallShape(peelTransparentExpr(host.right));
      if (reanchorSoleCtorHopResidual(view, options)) {
        host.left = view.id;
        host.right = view.init;
        if (sourceSeqInit) liftAssignInitPrefix(host, options.metaPath, program);
      }
    }
    ledger.clear();
    // the shared sentinel-export rule, applied to the finished program: a private sentinel stays local
    for (let index = program.body.length - 1; index >= 0; index--) {
      const split = exportedSentinelSplit(program.body[index], id => injectorState.isOwnPassUnusedName(id.name));
      if (!split) continue;
      const list = split.specifiers
        ?? split.publicNames.map(name => ({ type: 'ExportSpecifier', local: identifier(name), exported: identifier(name) }));
      program.body.splice(index, 1, ...split.declaration ? [split.declaration] : [], ...list.length ? [{
        type: 'ExportNamedDeclaration', declaration: null, source: null, attributes: [], specifiers: list,
      }] : []);
    }
  }

  // the ctor-pattern re-anchor arm of the memo declarator, extracted for its size
  function emitCtorPatternReanchor({ hostNode, declarator, soleJob, rescues, statements, exported }) {
    // a HOP over a GUARD-shaped init reads off the guarded VALUE, never off a ctor binding: the
    // ponyfill would answer where the source's own probe yields undefined and its read throws
    // (`{ Map: { customY } } = (globalThis.window?.self)` -> `{ customY } = (guard).Map`)
    const guardInfo = surfaceInitInfo(declarator);
    if (guardInfo?.shape === 'guard') {
      const guardRead = memberExpression(cloneNode(guardInfo.tail), cloneNode(soleJob.prop.key),
        { computed: soleJob.prop.computed });
      statements.push(exportWrap(
        variableDeclaration(hostNode.kind, [variableDeclarator(soleJob.prop.value, guardRead)]), exported));
      markSubtreeSkipped(skippedNodes, soleJob.prop.key);
      return 'consumed';
    }
    const id = injectPureImport(soleJob.entry, soleJob.hintName);
    const init = rescues.length
      ? sequenceExpression([...rescues, identifier(id)]) : identifier(id);
    statements.push(exportWrap(variableDeclaration(hostNode.kind,
      [variableDeclarator(soleJob.prop.value, init)]), exported));
    markSubtreeSkipped(skippedNodes, soleJob.prop.key);
    return 'consumed';
  }

  // the default-guard test ref of a memo job: a CATCH-BORN host cannot hoist a `var` past its own
  // binding, so its ref is block-scoped - minted in the other leg's order (the first claim's ahead
  // of the memo, the rest at their turn) and declared as its own `let` ahead of the extraction
  // (`memoJobStatements`), the shape that leg prints; a hoistable host takes the declared ref
  function mintMemoGuardRef(job) {
    return job.catchBorn ? mintRefName() : injector.generateDeclaredRef(job.metaPath);
  }

  // the extraction a memo job binds, led by its block-`let` guard ref where the host is catch-born
  function memoJobStatements({ job, value, guardRefs, kind, exported }) {
    const scopedRef = job.value?.leadDecl ?? (job.catchBorn && guardRefs.get(job));
    const lead = scopedRef ? [variableDeclaration('let', [variableDeclarator(identifier(scopedRef))])] : [];
    const declarators = [
      ...job.value?.leadRef ? [variableDeclarator(identifier(job.value.leadRef))] : [],
      variableDeclarator(memoJobBindingTarget(job), value),
    ];
    return [...lead, exportWrap(variableDeclaration(kind, declarators), exported)];
  }

  // one extracted binding's VALUE off the whole-init memo. a DEFAULTED prop keeps
  // native-miss semantics through the guard ternary; a STATIC re-reads its import
  // directly (`_Array$from === void 0 ? [] : _Array$from`), an instance dispatch
  // memoizes through a ref (recorded in `guardRefs`, so the caller can lead with it)
  function memoJobValue({ job, refName, guardRefs, receiver = identifier(refName) }) {
    if (job.value) return job.value(refName ?? receiver.name);
    const id = injectPureImport(job.entry, job.hintName);
    // a CHAINED instance job dispatches on the surface its hops NAME, read off the memo the init
    // holds (`const _ref = (eff(), _globalThis); const a = _flat(_ref.Array.prototype)`)
    let value = job.kind === 'instance'
      ? callExpression(identifier(id), [job.chain?.length
        ? hopChainKeys(job.chain).reduce(memberFromKeyName, receiver)
        : receiver])
      : identifier(id);
    // the collapsed symbol leaf dispatches on what the extraction just built
    if (job.collapseLeaf) {
      value = callExpression(
        identifier(injectPureImport(job.collapseLeaf.instanceEntry, job.collapseLeaf.instanceHint)), [value]);
    }
    if (job.prop.value?.type !== 'AssignmentPattern') return value;
    if (job.kind === 'instance') {
      const guardRef = guardRefs.get(job) ?? mintMemoGuardRef(job);
      guardRefs.set(job, guardRef);
      return buildInstanceDefaultGuard({
        assignedRef: identifier(guardRef),
        call: value,
        defaultValue: job.prop.value.right,
        defaultPattern: job.prop.value,
        defaultName: job.prop.value.left?.name,
        reread: identifier(guardRef),
      });
    }
    return renderStaticDefaultGuard({
      read: identifier(id),
      defaultValue: job.prop.value.right,
      reread: identifier(id),
      alwaysDefined: true,
    });
  }

  // the receiverless-STATIC rescue arm of the memo declarator, extracted for its size:
  // the discard rescues, the seq-callee keep, the ctor-pattern re-anchor and the lift.
  // returns 'consumed' when the re-anchor took the declarator whole
  function emitStaticMemoRescues({ hostNode, declarator, declJobs, statements, exported, seqRescues, consumeProbe }) {
    const [{ metaPath }] = declJobs;
    // the extraction's own probe re-emits the discarded READ whole, buried effects included, so a
    // lift of the same nodes would run them twice - babel spells the rule at its swap, where the
    // rescue keeps only what the probe does not already carry
    // the probe re-emits the discarded READ whole, buried effects included, so a lift of the same
    // nodes would run them twice - the rescue keeps only what the probe does NOT carry, split on
    // the offset that read starts at. no offset means nothing precedes it: the harvest is not even
    // asked, the way this channel has always answered a probe-carried init
    const probeOffset = probeNavStartOf(consumeProbe);
    const rescues = consumeProbe && !probeOffset ? [] : partitionEffectsAtProbe(discardRescueNodesWithReads({
      node: declarator.init,
      scope: metaPath.scope,
      adapter,
      path: metaPath,
    }), consumeProbe ? probeOffset : null).ahead;
    // the collapse rewrote the init in place, so what the spine bottoms out on NOW is what
    // survived it: a call the nav read THROUGH but could not erase (`wrap(g()).Object`), or a
    // pure binding it folded onto (`mk().self.Array` -> `_self.Array`)
    const initSpine = peelTransparentExpr(declarator.init);
    let spineRoot = initSpine;
    while (spineRoot?.type === 'MemberExpression') spineRoot = peelTransparentExpr(spineRoot.object);
    // a CALL the collapse left standing stays as a statement: the receiver resolution reads
    // THROUGH it (an inline fold), so dropping it would drop the call the source performs
    // (`const { from } = (a => a)(Array)` keeps `(a => a)(Array);`). the one exception is a
    // BARE call whose argument list is nothing but ERASABLE proxy surfaces - those reads
    // collapse everywhere else too, and the call goes with them (`(g => g)(globalThis)`); a
    // nav hop ABOVE the call reads its RESULT, and that read is the source's own
    // the walk may already have substituted the surface, so the minted spelling counts as
    // the proxy read it replaced
    function erasableProxyArgument(argument) {
      const value = peelTransparentExpr(argument);
      return value?.type === 'Identifier' && isMintedOrProxyName(value.name, injectorState)
        && !adapter.getBinding({ scope: metaPath.scope, name: value.name, path: metaPath })?.node;
    }
    const erasableCall = spineRoot === initSpine && spineRoot?.type === 'CallExpression'
      && spineRoot.arguments.length > 0 && spineRoot.arguments.every(erasableProxyArgument);
    // a SEQUENCE root carrying a kept WRITE keeps its READ too: the write is the source's own
    // effect and the member above it is the read the source performed
    // (`const { isInteger } = (a5 = Array.from('ab'), globalThis).Number`)
    const seqWriteRoot = (spineRoot !== initSpine || declJobs.some(job => job.seqRootWrite))
      && spineRoot?.type === 'SequenceExpression'
      && spineRoot.expressions.some(expr => {
        const stored = peelTransparentExpr(expr);
        return stored?.type === 'AssignmentExpression' && stored.operator === '=';
      });
    // ... and only where the collapse actually FOLDED that key into a claim binding: a key the
    // claim never resolved is still a raw member read, and re-emitting it spells a read the
    // source's own effects already carried (`_globalThis[(a = f(), 'Array')]` keeps `a = f()`)
    // ... or where the key stayed a raw computed read off the ROOT: that read is the one the
    // source performed, and lifting only its key effect drops it
    // (`globalThis[(e++, 'Object')]` lifts `_globalThis[(e++, 'Object')]`)
    const buriedKeyInit = declJobs.some(job => job.keyClaimInit && !job.chain?.length
      && (spineRoot === initSpine || job.rawKeyRootInit));
    const seqClaimInit = spineRoot === initSpine && spineRoot?.type === 'SequenceExpression'
      && declJobs.some(job => job.seqDirectClaimInit && !job.chain?.length);
    // a KEPT WRITE at the spine ROOT with LATER harvested effects re-emits the read whole
    // too: the split channels would lift those effects AHEAD of the write that led them in
    // the source (`{ of } = (r = globalThis)[(se(), 'Array')]` - the write runs first)
    const keptWriteRootAhead = spineRoot !== initSpine && spineRoot?.type === 'AssignmentExpression'
      && rescues.length > 1;
    // ... but a REBUILT spine (the collapse minted the sequence - no source span) is not a
    // read the source performed: its effect prefix splices as ONE ordered unit, and a
    // resolvable ctor LEAF leaves its pure binding as the probe (`a6 = ..., _Symbol;` -
    // the throw-probe canon); a probe-less leaf drops with the read (babel's
    // `r = _globalThis, c++;`). the source's OWN sequence re-emits whole, read included
    // (the a5-case right above)
    if (seqWriteRoot && typeof spineRoot.start !== 'number') {
      // the collapse folds a resolvable ctor leaf into the seq TAIL (`..., _Symbol`) - that
      // binding read IS the throw probe and stays; an environment-root tail (`_globalThis`)
      // reads nothing the claim still needs and drops with the rebuilt read above it
      const tail = spineRoot.expressions.at(-1);
      const keepTail = !(tail?.type === 'Identifier' && isMintedOrProxyName(tail.name, injectorState));
      const spliced = keepTail ? [...spineRoot.expressions] : spineRoot.expressions.slice(0, -1);
      rescues.length = 0;
      rescues.push(sequenceExpression(spliced));
    } else if (seqWriteRoot || buriedKeyInit || seqClaimInit || keptWriteRootAhead
      || (spineRoot?.type === 'CallExpression' && !erasableCall)
      || (pristineInitFacts.get(declarator)?.keepsWholeRead && spineRoot !== initSpine && spineRoot?.type === 'SequenceExpression')) {
      // the whole read re-emits verbatim, so every effect harvested out of it rides inside
      // it already - keeping both would run them twice. a read off an effectful sequence SPINE the
      // pristine init keeps whole (`keepsWholeRead`, babel's sink rule) re-emits the same way
      rescues.length = 0;
      rescues.push(declarator.init);
    } else if (spineRoot === initSpine && spineRoot?.type === 'SequenceExpression'
      && isCallShape(peelTransparentExpr(peelNestedSequenceExpressions(spineRoot).tail))) {
      // ... and so does a SEQUENCE init ending in a call the collapse left standing - less the comma
      // elements nothing observes (the shared trim babel's lift takes)
      rescues.length = 0;
      const flatLift = flattenLift(declarator.init);
      const observedLift = observablePrefixElements(flatLift, { scope: metaPath.scope, adapter, path: metaPath });
      rescues.push(...observedLift.length ? observedLift : flatLift.slice(-1));
    }
    // ... a nav INTO the built-in namespace off a call the census resolves to a realm keeps the call
    // alone (the shared rule): its hops are dead reads, and a pure call leaves nothing - the babel
    // lift's answer, where the whole read printed `realm().Array;` for the value the extraction took
    const realmNav = spineRoot?.type === 'CallExpression'
      ? liftedRealmNavEffect(declarator.init, { scope: metaPath.scope, adapter, path: metaPath }) : null;
    if (realmNav) {
      rescues.length = 0;
      rescues.push(...realmNav.effects);
    }
    // the ctor-pattern re-anchor: a PATTERN-valued sole job reads the pure ctor whole,
    // the harvested rescues riding the init seq (`{ customB } = (eff(), _Set)`)
    const [soleJob] = declJobs;
    if (declJobs.length === 1 && soleJob.kind !== 'instance' && soleJob.prop.value?.type === 'ObjectPattern') {
      return emitCtorPatternReanchor({ hostNode, declarator, soleJob, rescues, statements, exported });
    }
    // the discarded init READ that a kept write sits under: the whole member chain when the write
    // is its root, else null (a write that IS the init has no read of its own to keep)
    function discardedReadOverWrite(initNode, write) {
      const init = unwrapRuntimeExpr(initNode);
      if (init?.type !== 'MemberExpression' || !write || write.type !== 'AssignmentExpression') return null;
      // through a SEQUENCE carrying the write: the collapse spells a kept store as the prefix of the
      // value the read stands on (`((w = _globalThis), _globalThis).Array`), and a peel that stops at
      // the wrapper reads that as "no store below" - the verdict then flips on a spelling
      // every pass either answers or stands on a member, whose object is always a node
      for (let probe = unwrapRuntimeExpr(init.object); ; probe = unwrapRuntimeExpr(probe.object)) {
        if (probe === write) return init;
        if (probe.type === 'SequenceExpression') {
          if (probe.expressions.some(expr => unwrapRuntimeExpr(expr) === write)) return init;
          probe = unwrapRuntimeExpr(probe.expressions.at(-1));
          if (probe === write) return init;
          if (probe?.type !== 'MemberExpression') return null;
          continue;
        }
        if (probe.type !== 'MemberExpression') return null;
      }
    }

    // a KEPT WRITE of a pure NAV rides the first extraction's own seq (`const from =
    // (a = _globalThis, _Array$from)` - babel's rescue slot); every other effect,
    // fallback writes included, lifts ahead - joined into ONE comma statement
    // (`x++, y++;`, babel's lift spelling)
    const liftedRescues = [];
    for (const rescue of rescues) {
      const rescueAssign = peelTransparentExpr(rescue);
      // Calls discarded with the receiver stay ahead as statements. A KEY effect
      // buried in a CHAINED consume's spine rides the value: the source ran it
      // inside the read the extraction replaced (`{ Symbol: { iterator } } = globalThis[(c++,
      // 'self')]` -> `const iterator = (c++, _Symbol$iterator)`)
      // ... and only a SPELLABLE store rides it: a window-terminated value has no pure of its
      // own, so the write is its own statement and the extraction reads nothing off it
      // (`const { of } = (d = globalThis.window).self.Array` lifts `d = _globalThis.window;`)
      // ... and only where the write IS the whole discarded init: a READ standing over it is one
      // the source performed, so it lifts WITH the write - which still runs exactly once, inside
      // it (`const { fromEntries } = (u = globalThis).Object` -> `(u = _globalThis).Object;`, the
      // babel leg's shape). riding the value there dropped that read
      const spellableStore = keptWriteRidesValue(rescueAssign, { adapter, injectorState, resolveGlobalPolyfill });
      // ... and the read standing over a store is the DISCARD PROBE's wherever that channel takes
      // it - respelled from the seal boundary, carrying the holder - so lifting it here too would
      // run the write twice. where the probe DECLINED, this lift carries that read instead
      const storeRead = discardedReadOverWrite(declarator.init, rescueAssign);
      // asked of what the probe this host RENDERED actually carries: a probe holding the store
      // already spells this read, where one rendered from another arm carries no write at all and
      // the read is still owed - the existence of a probe is not the question, its content is
      // ... and where the collapse has already folded that key away, the read is rebuilt off the
      // LIVE store (its own value is rewritten by now) plus the key the source spelled
      const storeReadKey = declJobs.find(job => job.absentableStoreReadKey)?.absentableStoreReadKey ?? null;
      const readOverWrite = !probeCarriesWrite(consumeProbe, rescueAssign) && storeReadKey !== null
        ? storeRead ?? (rescueAssign?.type === 'AssignmentExpression'
          ? memberFromKeyName(cloneNode(rescueAssign), storeReadKey) : null)
        : null;
      // ... and the write rides the extraction's own slot only where the init IS the store: nothing
      // is read off it, so the write is the whole value the extraction takes (`{ Array: { from } }
      // = (a = globalThis)`). with a read standing over it, that read is the discarded one and the
      // write lifts as its own statement ahead of the extraction
      const ridesTheValue = (!readOverWrite && !storeRead && spellableStore
        && declJobs.some(job => job.kind !== 'global'))
        || declJobs.some(job => job.buriedKeyEffect && job.chain?.length);
      if (ridesTheValue) seqRescues.push(rescue);
      else liftedRescues.push(readOverWrite ?? rescue);
    }
    // the CHANNEL decides the grouping: the nested-flatten chain lifts per statement
    // (`new _Set(arr); new _Map();`), the chainless consume joins as one comma
    // nested seq/paren layers flatten first (`a++, b++, c++;`, babel's flat spelling)
    function flattenLift(expr) {
      const peeledLift = peelTransparentExpr(expr);
      if (peeledLift?.type === 'SequenceExpression') return peeledLift.expressions.flatMap(flattenLift);
      return [peeledLift];
    }
    // ... and a slot the SEQUENCE drain folded keeps a statement per extraction: babel wrote
    // those as statements and only the comma grouping was ours
    const drainedSlot = liftedRescues.some(rescue => seqDrainedSlots.has(peelTransparentExpr(rescue)));
    const flatLift = liftedRescues.flatMap(flattenLift);
    const joinLift = flatLift.length > 1 && !drainedSlot && declJobs.every(job => !job.chain?.length);
    const liftedAt = statements.length;
    if (joinLift) statements.push(expressionStatement(sequenceExpression(flatLift)));
    else for (const rescue of flatLift) statements.push(expressionStatement(rescue));
    reanchorLiftedAssignments(statements, liftedAt);
    return null;
  }

  // Render one opaque-init declarator into the statement sink. Partial patterns delegate
  // to emitPartialMemo; whole patterns share one receiver evaluation when needed, or
  // preserve discarded effects for receiver-less statics. Return 'consumed' when the
  // declarator dissolved, true when statements landed with a residual, false otherwise.
  function emitMemoDeclarator({ hostNode, declarator, declJobs, statements, exported }) {
    const consumed = new Set(declJobs.map(job => job.prop));
    const patternCtx = patternFrame(declJobs[0].metaPath);
    // full consumption reaches through hop levels: a hop prop counts consumed when its
    // nested pattern does
    // ... a key that EVALUATES something keeps its level whatever it binds; a bound computed one
    // is as plain as a literal
    // ... and an init whose LITERAL still owes something is never consumed WHOLE, however empty the
    // pattern gets: a spread reads the source's own enumerable keys, a sibling value runs its effect,
    // and nothing here re-emits either - so the declarator stays with its sentinels, the partial
    // shape the other leg's plan prints. the pairing walk owns the rule (`wrapperSurvives`)
    if (!patternFullyConsumed(declarator.id, item => consumed.has(item), patternCtx)
      || hostLevelSurvives(declarator, { ctx: patternCtx })) {
      return emitPartialMemo({ hostNode, declarator, declJobs, consumed, statements, exported });
    }
    const needsValue = declJobs.some(job => job.kind === 'instance');
    let refName = null;
    const seqRescues = [];
    // a chain-assignment init with a pure-nav RHS inlines: the WRITE is the receiver the dispatch
    // takes, so it rides inside the call and evaluates exactly once, where the source evaluated it
    // (`{ [S]: it } = (g = globalThis)` -> `const it = _gim(g = _globalThis)`) - one rule with the
    // hop-bearing spelling, whose receiver carries the write the same way
    const chainAssignInline = needsValue && declJobs.length === 1
      ? chainAssignOverPureNav(declarator.init) : null;
    // a SOLE instance extraction reads the init exactly once inside its dispatch, so it
    // inlines with no memo slot (`const at = _atMaybeArray((foo(), [1]))`, babel's inline
    // consume) - the memo exists for the SECOND read, and there is none
    // ... and a SYMBOL-pattern value is that same single read: the extracted pattern binds off
    // the helper result, so the receiver rides inside the dispatch with no memo of its own.
    // a COLLAPSED leaf is not that shape - its dispatch reads the memo, like the plain route's
    const singleReadInline = needsValue && declJobs.length === 1 && !declJobs[0].collapseLeaf
      && (declJobs[0].prop.value?.type !== 'ObjectPattern' || declJobs[0].symbolPattern);
    if (chainAssignInline || singleReadInline) {
      const [job] = declJobs;
      const guardRefs = new Map();
      const value = memoJobValue({ job, guardRefs, receiver: chainAssignInline ?? duplicateReceiver(declarator.init, injector) });
      statements.push(...memoJobStatements({ job, value, guardRefs, kind: hostNode.kind, exported }));
      markSubtreeSkipped(skippedNodes, job.prop);
      return 'consumed';
    }
    // an SE-prefixed re-readable receiver needs no memo of its own: the prefix lifts as its
    // own statements and the tail IS the token every extraction reads (`(se(), globalThis)`
    // -> `se(); const it = _gim(_globalThis)`, babel's lift)
    // ... and a kept WRITE lifts whole the same way - the statement performs the store, and the tail
    // every extraction reads is what it stored (`(kw = (se(), globalThis))` -> `kw = (se(), _globalThis);`)
    // The whole pattern was consumed above: a bare binding is re-readable by the
    // adjacent extractions, as in the other binding's whole-init memo demotion.
    const lift = liftableInitPrefix(declarator.init);
    // ... and a tail that is a CALL the inline canon proves to yield a proxy global lifts the same
    // way: the prefix as statements, the call dropped for the global it stands for (its run has no
    // effect) - the shape the realm-spelled twin takes, and the other leg's fold
    const provenTail = lift && provenRealmCallRoot(lift.tail, declJobs[0].metaPath, adapter);
    const provenPure = provenTail && bareProxyGlobalPure(provenTail, declJobs[0].metaPath, { adapter, resolveGlobalPolyfill });
    const liftTail = provenPure ? identifier(injectPureImport(provenPure.entry, provenPure.hintName)) : lift?.tail;
    if (needsValue && liftTail?.type === 'Identifier'
      && isReReferenceableAcrossReads(liftTail, { scope: declJobs[0].metaPath.scope, adapter, path: declJobs[0].metaPath })) {
      const lifted = observablePrefixElements(lift.prefix, patternFrame(declJobs[0].metaPath));
      for (const expr of lifted) statements.push(expressionStatement(expr));
      declarator.init = liftTail;
      refName = liftTail.name;
    }
    // a GUARDED init the walk collapsed onto a pure BINDING needs no memo of its own: the
    // binding is re-readable, and the guarded read the consume discards re-emits as the
    // extraction's own probe (`((null == _globalThis.window ? void 0 : _self)[_S], _gim(_self))`)
    const guardedPureTail = !refName && needsValue && guardedPureBinding(declarator.init, injectorState);
    if (guardedPureTail) refName = guardedPureTail;
    // the probe the full consume owes for the read it discards, decided BEFORE the rescue harvest:
    // the harvest asks whether this probe is coming, and the extraction below reuses the same node
    // (`guardedPureTail` is a needsValue-only refName, so the full consume asks only about refName)
    const consumeProbe = !needsValue && !refName ? renderDiscardedInitProbe(declJobs, probeRenderCtx) : null;
    const guardRefs = new Map();
    if (needsValue && !refName) {
      // ref order mirrors babel's requeue: the FIRST claim's guard ref mints before the
      // memo, later guards after it (`var _ref, _ref3; const _ref2 = getObj();`)
      if (declJobs[0].prop.value?.type === 'AssignmentPattern') guardRefs.set(declJobs[0], mintMemoGuardRef(declJobs[0]));
      refName = mintRefName();
      // the memo binds nothing the source named and stands as a statement of its own, so it takes
      // `const` - the host's kind belongs to the declarators that carry the source's own bindings
      statements.push(variableDeclaration('const', [variableDeclarator(identifier(refName), declarator.init)]));
    } else if (!needsValue) {
      const consumedCtor = emitStaticMemoRescues({
        hostNode, declarator, declJobs, statements, exported, seqRescues, consumeProbe,
      });
      if (consumedCtor) return consumedCtor;
    }
    // the pattern consumed WHOLE leaves nothing to carry the read native performs off the init's
    // value: an init that can be undefined THROWS there while the extracted bindings just answer.
    // the first extraction leads with that read, rebuilt off the rendered init. a MEMO'd init is
    // already read by its own slot and owes nothing here
    const probePrefix = refName && !guardedPureTail ? null
      : consumeProbe ?? renderDiscardedInitProbe(declJobs, probeRenderCtx);
    const extracted = [];
    for (const job of declJobs) {
      let value = memoJobValue({ job, refName, guardRefs });
      // a probe carrying the init's own sequence prefix joins this list FLAT: one comma run is what
      // the source wrote and what the other leg prints, where a nested tuple is a shape of its own
      const probeParts = probePrefix && job === declJobs[0]
        ? (probePrefix.type === 'SequenceExpression' ? probePrefix.expressions : [probePrefix]) : [];
      if (seqRescues.length || probeParts.length) {
        value = sequenceExpression([...seqRescues.map(expr => cloneNode(expr)), ...probeParts, value]);
        seqRescues.length = 0;
      }
      extracted.push({ job, list: memoJobStatements({ job, value, guardRefs, kind: hostNode.kind, exported }) });
      markSubtreeSkipped(skippedNodes, job.prop);
    }
    statements.push(...groupMemoExtractions(extracted, exported));
    return keptSymbolSentinelResidual(declarator, declJobs, refName, mintUnusedName) ? true : 'consumed';
  }

  // PARTIAL consumption still memoizes when the group READS the receiver: the memo holds
  // one eval, the residual re-anchors on it (`export const { at, other } = getArr()` ->
  // `const _ref = getArr(); export const at = _at(_ref); export const { other } = _ref;`)
  function emitPartialMemo({ hostNode, declarator, declJobs, consumed, statements, exported }) {
    // the receiver-LESS half: each claim extracts its own pure, the leftover residual keeps the init
    // (its SE runs there once) and re-anchors when ctor hops remain
    function emitPartialStaticMemo() {
      const surface = surfaceInitInfo(declarator);
      const extracted = [];
      for (const job of declJobs) {
        const extractedId = identifier(injectPureImport(job.entry, job.hintName));
        extracted.push(exportWrap(variableDeclaration(hostNode.kind,
          [variableDeclarator(propBindingTarget(job.prop), extractedId)]), exported));
        markSubtreeSkipped(skippedNodes, job.prop);
      }
      removeConsumedProps(declJobs);
      const initBeforeReanchor = declarator.init;
      if (surface) reanchorSoleCtorHopResidual(declarator, { metaPath: declJobs[0]?.metaPath ?? null });
      // the prefix lifts FIRST - source order, the init runs and then the extractions bind
      // (`log(); const from = _Array$from; ...`) - but only off a RE-READABLE identifier
      // tail: a residual left on a NAV keeps the sequence, where its effect runs
      // (`(se(), _globalThis.Array)`)
      const peeledInit = peelTransparentExpr(declarator.init);
      const seqTail = peeledInit?.type === 'SequenceExpression'
        ? peelTransparentExpr(peeledInit.expressions.at(-1)) : null;
      // ... a residual that evaluates its own KEY effects keeps the read those effects were
      // written around, prefix included - the source ordered the two inside that one read
      // (`{ Promise: { resolve }, other } = globalThis[(d++, 'self')]` keeps `(d++, _self)`)
      // ... and not off a RE-ANCHORED residual: that init is one the drain rebuilt onto the hop's
      // own pure, and the prefix rides the rebuild where the source wrote it
      // (`{ Promise: { try: tryFn, customP } } = (eff(), globalThis)` -> `const tryFn =
      // _Promise$try; const { customP } = (eff(), _Promise);`). a residual left at the SOURCE
      // level re-reads the receiver the prefix fed, and there the lift is the single run
      // ... and not off a residual whose init RUNS code: the extractions follow it, and its prefix
      // stays with it (the shared residual canon)
      const init = seqTail && declarator.init === initBeforeReanchor && !residualRuns(declarator)
        && declJobs.every(job => !(job.buriedKeyEffect && job.chain?.length))
        ? peeledInit : null;
      // ... every prefix that runs before the value, a decided selection's live arm's own included (`liftedPrefixSplit`)
      if (init?.type === 'SequenceExpression') {
        const frame = { scope: declJobs[0]?.metaPath?.scope, adapter, path: declJobs[0]?.metaPath };
        const { prefix, tail } = liftedPrefixSplit(init, frame);
        statements.push(...observablePrefixElements(prefix, frame).map(expr => expressionStatement(expr)));
        declarator.init = tail;
      }
      // ... and a residual whose init RUNS code leads its extractions: natively that init evaluates
      // before the pattern binds anything (the shared residual canon)
      if (residualRuns(declarator)) {
        statements.push(exportWrap(variableDeclaration(hostNode.kind, [declarator]), exported), ...extracted);
        return 'consumed';
      }
      statements.push(...extracted);
      return true;
    }
    // ... and the reading half: the memo holds one eval, the residual re-anchors on it
    function emitPartialInstanceMemo() {
      const refName = mintRefName();
      // a statement of its own, so it binds nothing the source named and takes `const` whatever
      // the host declares (the other leg's kind for a memo standing apart)
      statements.push(variableDeclaration('const', [variableDeclarator(identifier(refName), declarator.init)]));
      // the SAME value the fully-consumed memo builds - dispatch, collapsed symbol leaf and
      // defaulted guard alike, grouped alike; a partial residual changes what SURVIVES, not what binds
      const extracted = [];
      for (const job of declJobs) {
        const guardRefs = new Map();
        const value = memoJobValue({ job, refName, guardRefs });
        extracted.push({
          job, list: memoJobStatements({ job, value, guardRefs, kind: hostNode.kind, exported }),
        });
        markSubtreeSkipped(skippedNodes, job.prop);
      }
      statements.push(...groupMemoExtractions(extracted, exported));
      // a CHAINED leaf LEAVES with its claim and takes the levels it empties with it, whatever its
      // hops name: a user key may be a getter the source fires once, and a built-in surface hop left
      // as a sentinel would only re-read for nothing (`{ other } = _ref`, the other leg's shape). a
      // symbol pattern never reaches this partial memo: beside siblings the nested keyed capture splits
      // it into a `_getIteratorMethod(_ref)` ref whose leaves extract flat
      for (const job of declJobs) {
        if (!job.chain?.length) continue;
        consumed.delete(job.prop);
        removeConsumedProps([{ prop: job.prop, pattern: job.pattern, chain: job.chain }]);
      }
      declarator.id.properties = declarator.id.properties.filter(item => !consumed.has(item));
      declarator.init = identifier(refName);
      return true;
    }
    // receiverless STATICS need no memo: each extracts pure, the leftover residual keeps
    // the init (its SE runs there once) and re-anchors when a sole ctor hop remains
    // (`tryFn = _Promise$try; { customP } = (eff(), _Promise);` - babel's lift-not-replay)
    // a GLOBAL claim is receiverless the same way a static is: it substitutes its own binding
    // and the leftover residual keeps the init (`{ Map, parseInt } = (eff(), globalThis)`)
    if (declJobs.every(job => job.kind === 'static' || job.kind === 'global')) {
      return emitPartialStaticMemo();
    }
    // ... and a receiver-less claim BESIDE the reading ones binds its own pure off no memo, the way
    // it does in the full-consume memo: what the memo serves is the readers and the residual
    if (declJobs.every(job => job.kind !== 'instance')) return false;
    return emitPartialInstanceMemo();
  }

  // does the discarded init STORE into a binding? a kept write is not a droppable effect - what it
  // fills is read back, and the source fills it BEFORE the pattern binds
  function sinkStoresBinding(node) {
    const core = peelTransparentExpr(node);
    return core?.type === 'AssignmentExpression'
      || (core?.type === 'SequenceExpression'
        && peelTransparentExpr(core.expressions.at(-1))?.type === 'AssignmentExpression');
  }

  // for-init: consumed declarators are replaced IN PLACE by the extracted siblings, and an
  // effect-bearing consumed init stays live as an `_unused` dummy declarator
  // eslint-disable-next-line max-statements -- one loop-header drain preserves receiver, key and residual declaration order
  function drainForInit({ hostNode, jobs }) {
    jobs = withoutCtorHopJobsWithLiveSiblings(jobs);
    if (!jobs.length) return;
    const byDeclarator = new Map();
    for (const job of jobs) {
      if (!byDeclarator.has(job.declarator)) byDeclarator.set(job.declarator, []);
      byDeclarator.get(job.declarator).push(job);
      // the extraction's binding target is the SOURCE spelling (a ctor-pattern re-anchor
      // moves its whole pattern), captured before the removal pass
      job.bindingTarget = job.collapseLeafName ? identifier(job.collapseLeafName) : propBindingTarget(job.prop);
    }
    // sentinel-kept declarators with an unre-readable init memoize like the block-hosted
    // twin: `var _ref = <init>, { ..._unused } = _ref, f = _flat(_ref), i = 0;`
    const memoRefs = forInitMemoVerdicts(byDeclarator, mintRefName, { adapter, injectorState });
    removeConsumedProps(jobs);
    const declarations = [];
    for (const declarator of hostNode.declarations) {
      const declJobs = byDeclarator.get(declarator);
      if (!declJobs) {
        declarations.push(declarator);
        continue;
      }
      const memoRef = memoRefs.get(declarator);
      if (memoRef) {
        const memoDeclarator = variableDeclarator(identifier(memoRef), declarator.init);
        declarator.init = identifier(memoRef);
        const seKeyJobs = declJobs.filter(job => job.sentinel && job.seKey);
        function declare(list) {
          return list.map(job => variableDeclarator(job.bindingTarget, job.value(memoRef)));
        }
        // the SE-KEY residual runs its key before the extraction reads the slot; every other
        // one follows the extraction it left behind, and a PLAIN sibling keeps its place
        // ahead of the residual (its slot read owes the key nothing)
        // ... SEVERAL keys interleave, each segment ahead of the extraction reading it
        if (seKeyJobs.length) {
          declarations.push(memoDeclarator, ...declare(declJobs.filter(job => !seKeyJobs.includes(job))),
            ...seKeySegmentedDeclarators(declarator, orderDeclaratorJobs(seKeyJobs), memoRef, adapter));
        } else {
          declarations.push(memoDeclarator, ...declare(declJobs));
          if (!patternDead(declarator.id) && !residualDies(declarator, declJobs)) declarations.push(declarator);
        }
        continue;
      }
      const emptied = patternDead(declarator.id) || residualDies(declarator, declJobs);
      // an init only the PROBE proved absent-able keeps its own read: the consume discards it,
      // and off-env that read is what throws (the block-hosted rule, same shape here)
      const probeRead = emptied && declJobs.every(job => !job.readsReceiver && !job.seCarried)
        ? renderDiscardedInitProbe(declJobs, probeRenderCtx) : null;
      const extracted = declJobs.map((job, at) => variableDeclarator(job.bindingTarget,
        at === 0 && probeRead ? sequenceExpression([probeRead, job.value()]) : job.value()));
      if (!emptied) {
        // residual keeps the init: extracted siblings go ahead of it - except under an
        // SE-KEY sentinel, whose key effect must run before the extraction reads the slot.
        // SEVERAL such keys interleave, each segment ahead of the extraction reading it
        if ((declJobs.length > 1 || isReReferenceableAcrossReads(declarator.init,
          { ...patternFrame(declJobs[0].metaPath), injectorState, path: declJobs[0].metaPath?.parentPath?.parentPath }))
          && declJobs.every(job => job.sentinel && job.seKey)) {
          declarations.push(...seKeySegmentedDeclarators(declarator, orderDeclaratorJobs(declJobs), null, adapter));
        } else if (declJobs.some(job => (job.sentinel && job.seKey) || (job.chain?.length && job.readsReceiver))
          || residualRuns(declarator)) {
          // ... and a residual whose init RUNS code leads too: that code could read a binding written ahead
          declarations.push(declarator, ...extracted);
        } else {
          carryForInitPrefixIntoFirst(extracted, takeForInitPrefix(declarator, declJobs, extracted, patternFrame(declJobs[0].metaPath)));
          declarations.push(...extracted.filter((item, index) => declJobs[index].guardDetach !== 'after'), declarator,
            ...extracted.filter((item, index) => declJobs[index].guardDetach === 'after'));
        }
        continue;
      }
      // the init's SOURCE prefix runs before its tail: it leads the slot the discarded tail keeps, and
      // rides the first extraction where the tail keeps none (carried there, a slot planted ahead of
      // that extraction ran the tail first)
      const carried = declJobs.every(job => !job.initRidesValue && !job.seCarried)
        ? takeForInitPrefix(declarator, declJobs, extracted, patternFrame(declJobs[0].metaPath)) : [];
      // ... unless the init needs no slot of its own: it already RIDES its own extraction (the
      // for-init opaque route puts it at the head of the extraction's sequence, where the source
      // evaluated it - a second slot would run it twice), or it is quiet and the sink says so.
      // the sink question is the PRISTINE init's: a receiver that carried a call collapses to a
      // quiet spelling, and babel still keeps the loop-header slot for it
      // (`(() => globalThis)().self.Promise` -> `_ref = _Promise`)
      if (declJobs.every(job => job.initRidesValue)
        || (declJobs.every(job => !job.sinkKeep)
          && (declJobs.some(job => job.readsReceiver)
            || !mayHaveSideEffects(declarator.init, patternFrame(declJobs[0].metaPath))))) {
        carryForInitPrefixIntoFirst(extracted, carried);
        declarations.push(...extracted);
        continue;
      }
      // a SOLE instance extraction reads the SE init exactly once inside its dispatch -
      // no memo slot needed (`var at = _at(getObj())`, babel's inline consume)
      if (declJobs.length === 1 && declJobs[0].readsReceiver && !declJobs[0].chain?.length) {
        carryForInitPrefixIntoFirst(extracted, carried);
        declarations.push(...extracted);
        continue;
      }
      // the discarded SE init keeps a declarator slot; its ORDER splits on the CHANNEL:
      // the nested flatten route rides AFTER the extractions as `_unused` (its sink's
      // accepted reorder), flat claims memoize FIRST as `_ref` (source order - the effect
      // runs before the bindings it fed)
      // the discarded init respells bare - a TS wrapper around it has nothing left to
      // assert (`(se(), _globalThis) as any` -> `(se(), _globalThis)`, babel's peel)
      if (declJobs.some(job => job.chain?.length)) {
        carryForInitPrefixIntoFirst(extracted, carried);
        pushChainedSinkSlot({ declarator, extracted, declarations, declJobs });
      } else {
        const slot = discardedSinkSlot(peelTransparentExpr(declarator.init),
          {
            metaPath: declJobs[0]?.metaPath, sinkDrop: declJobs.some(job => job.sinkDrop),
            sinkPlan: declJobs.find(job => job.sinkPlan)?.sinkPlan ?? null, planMemoArg, adapter,
          });
        if (slot && !foldSinkPrefixIntoResidual(extracted, slot)) {
          declarations.push(variableDeclarator(identifier(mintRefName()), sequenceExpression([...carried, slot])));
        } else carryForInitPrefixIntoFirst(extracted, carried);
        declarations.push(...extracted);
      }
    }
    hostNode.declarations = declarations;
  }

  // remove every consumed prop - or, under a rest sibling, RENAME its binding to an
  // `_unused` sentinel (the key stays, so rest keeps excluding it) - then cascade: a hop
  // prop whose nested pattern emptied is itself consumed, up the recorded chain
  function removeConsumedProps(jobs) {
    // Only a level changed by these claims can retire. Source-written empty siblings
    // still perform their property Get and coercion, including a later throw.
    const consumedPatterns = new Set(jobs.map(job => job.pattern));
    // an ASSIGNMENT host's target leaves with its slot, and the write a record names there with it - not a
    // pattern, which its extraction takes over whole, nor a declaration's binding, which is no write
    const retired = [];
    function retire(job) {
      const target = patternSlotTarget(job.prop.value);
      if (job.assignment && !isDestructurePattern(target)) retired.push(target);
    }
    for (const job of jobs) {
      const mint = job.mintSentinel ?? mintUnusedName;
      // The dispatch performs this captured literal's sole method Get. Keep its native
      // enclosing pattern for wrapper effects and coercion, without a second leaf read.
      if (job.consumeResidualRead) {
        retire(job);
        job.pattern.properties = job.pattern.properties.filter(item => item !== job.prop);
        markSubtreeSkipped(skippedNodes, job.prop);
        prunedHosts.add(job.assignment?.left ?? job.declarator.id);
        continue;
      }
      if (job.sentinel) {
        if (!job.keepSentinelBinding) {
          retire(job);
          markSubtreeSkipped(skippedNodes, job.prop.value);
          job.prop.value = identifier(mint());
          job.prop.shorthand = false;
        }
        continue;
      }
      retire(job);
      job.pattern.properties = job.pattern.properties.filter(item => item !== job.prop);
      markSubtreeSkipped(skippedNodes, job.prop);
      for (const { hopProp, outerPattern, outerRest } of job.chain ?? []) {
        const hopPatternNode = patternSlotTarget(hopProp.value);
        // A preceding sibling may already have retained this hop under a sentinel.
        if (hopPatternNode.type !== 'ObjectPattern' || hopPatternNode.properties.length) break;
        if (outerRest) {
          markSubtreeSkipped(skippedNodes, hopProp.value);
          hopProp.value = identifier(mint());
          hopProp.shorthand = false;
          break;
        }
        outerPattern.properties = outerPattern.properties.filter(item => item !== hopProp);
      }
    }
    // ... and the levels the removals emptied leave with them, on every host the jobs name: an
    // ARRAY level under a hop key is not in a chain (the climb stops at it), so the cascade above
    // never reaches the key it stands under (`({ w: [{}] } = { w: [arr] })` kept a husk)
    for (const job of jobs) {
      const host = job.assignment?.left ?? job.declarator?.id;
      if (!host || prunedHosts.has(host)) continue;
      prunedHosts.add(host);
      // through the JOB's own minter where it has one: an assignment host plants a `var` for
      // every sentinel it mints, and a name minted past it would write an undeclared binding
      pruneEmptiedHopProps(host, {
        mint: () => identifier((job.mintSentinel ?? mintUnusedName)()),
        onDrop: node => markSubtreeSkipped(skippedNodes, node),
        ctx: patternFrame(job.metaPath),
        consumedPatterns,
      });
    }
    noteRenderRetiredTargets(retired);
  }

  // the SE-KEY sentinel memo keeps one declaration: `const _ref = <init>, { [k]: _unused, z } = _ref,
  // s = _at(_ref), q = 2;` - memo first, residual, extractions after, trailing siblings (the other
  // leg's shape). the memo stands as a statement of its own instead where the residual holds the
  // sentinel alone (a sole prop, unless a DEFAULTED claim reads the ref beside it) and ahead of an
  // EXPORTED host (the export must not carry it); a residual kept by a REST alone takes the split shape -
  // memo, extraction, residual. a declarator memo only ever stands beside sibling declarators: a sole
  // declarator's sentinel claims memoize their receiver themselves
  function drainSentinelMemoSiblings({ hostNode, body, at, jobs, jobsByDeclarator, memoByDeclarator, memoDeclJobs }) {
    if (!memoByDeclarator.size
      || memoDeclJobs.keys().some(declarator => jobsByDeclarator.has(declarator))
      || jobs.some(job => memoByDeclarator.has(job.declarator) && !job.memoSibling)
      // a HOP-anchored sibling renders its own declarator whole (the flatten's slots), so the
      // comma join would bake this memo into a declaration that emitter is about to replace
      || jobs.some(job => !memoByDeclarator.has(job.declarator) && job.chain?.length)
      // a residual kept by a REST alone splits per statement instead - the memo, the extraction,
      // then the residual (`var _ref = holder.p; var m = _flat(_ref); var { ..._unused } = _ref;`),
      // on a sole and a sibling host alike; an SE-KEY sentinel joins - its key runs in the residual,
      // behind the memo and ahead of the extraction
      || jobs.every(job => !job.seKey)) {
      return false;
    }
    const exported = jobs.some(job => job.exported);
    // an EXPORTED host whose SIBLING was consumed whole splits per statement instead: that
    // sibling's extraction is its own export, and the join would put the memo behind it
    if (exported && hostNode.declarations.some(item => item.id?.type === 'ObjectPattern'
      && !item.id.properties.length)) return false;
    // an EXPORTED host keeps the comma join, and every memo lifts out ahead of it as a plain
    // statement (the export must not carry a `_ref`): the declarators written ahead of the memo
    // split off before it, so its receiver read still runs after their inits
    const ahead = [];
    let declarators = [];
    for (const declarator of hostNode.declarations) {
      const memoJobs = memoDeclJobs.get(declarator);
      if (memoJobs) {
        const rendered = [];
        const emitted = emitMemoDeclarator({ hostNode, declarator, declJobs: memoJobs, statements: rendered, exported });
        // A single consumed declaration keeps its original comma group. Extra statements
        // still separate earlier slots from this sibling's memo and reads.
        if (emitted === 'consumed' && rendered.length === 1
          && rendered[0].type === 'VariableDeclaration' && rendered[0].kind === hostNode.kind) {
          declarators.push(...rendered[0].declarations);
        } else {
          if (declarators.length) ahead.push(exportWrap(variableDeclaration(hostNode.kind, declarators), exported));
          declarators = [];
          ahead.push(...rendered);
          if (emitted !== 'consumed') ahead.push(exportWrap(variableDeclaration(hostNode.kind, [declarator]), exported));
        }
        continue;
      }
      const declJobs = jobsByDeclarator.get(declarator) ?? [];
      const refName = memoByDeclarator.get(declarator);
      if (refName) {
        const memoDeclarator = variableDeclarator(identifier(refName), splitDeclaratorMemo({ refName, declarator, declJobs }));
        // the memo joins as the leading declarator where the residual keeps a SIBLING prop; where the
        // sentinel is all the residual holds, it stands as a statement of its own behind the
        // declarators written ahead of it (which split off before it) - and so does an EXPORTED
        // host's memo, which the export must not carry
        // ... a DEFAULTED claim keeps the memo declarator whatever the residual holds: its guard reads
        // the ref inside the same declaration, the shape the other leg's live-default arm prints
        // ... a SINGLE sentinel that is all the residual holds: several keys interleave with the memo
        // declarator leading, whatever else the residual keeps
        // ... and a NESTED element's memo stands apart however many claims read it: the residual reads
        // the ref in that element's slot, the shape the other leg's slot memo prints
        if (exported || declJobs.some(job => job.nestedMemoNode)
          || (declJobs.length === 1 && !residualKeepsSibling(declarator, declJobs) && !declJobs[0].defaulted)) {
          if (declarators.length) ahead.push(exportWrap(variableDeclaration(hostNode.kind, declarators), exported));
          declarators = [];
          // ... standing apart beside SIBLINGS it binds nothing the source named: `const`, the split's
          // kind for it
          ahead.push(variableDeclaration('const', [memoDeclarator]));
        } else declarators.push(memoDeclarator);
        // the claims on a memo declarator are its SE-key sentinels alone (a claim without a key effect
        // never joins the memo): they follow the residual whose key runs first
        declarators.push(...seKeySegmentedDeclarators(declarator, orderDeclaratorJobs(declJobs), refName, adapter));
        continue;
      }
      const emptiedHere = declarator.id.type === 'ObjectPattern' && declarator.id.properties.length === 0;
      // a DEFAULTED job reads its slot PAST the key effect, so the residual runs first - the
      // same order the sole-declarator join spells (`{ [(e(), 'k')]: _unused } = [4], s = ...`)
      const residualFirst = !emptiedHere && declJobs.some(job => job.defaulted && job.sentinel);
      if (residualFirst) declarators.push(declarator);
      for (const job of orderDeclaratorJobs(declJobs)) {
        declarators.push(variableDeclarator(job.bindingTarget, job.value()));
      }
      if (!emptiedHere && !residualFirst) declarators.push(declarator);
    }
    hostNode.declarations = declarators;
    if (ahead.length) body.splice(at, declarators.length ? 0 : 1,
      ...anchorLeadingStatement({ statements: ahead, hostNode, statementNode: body[at] }));
    markRewrite();
    return true;
  }

  // partition drain jobs per declarator; a sentinel-kept declarator whose init cannot be
  // re-read raw takes a shared memo ref, and every job captures its binding target before
  // the sentinel rename mutates the prop
  function partitionDeclarationJobs(jobs) {
    const memoByDeclarator = new Map();
    const jobsByDeclarator = new Map();
    const memoDeclJobs = new Map();
    for (const job of jobs) {
      if (job.host === 'memo-decl') {
        if (!memoDeclJobs.has(job.declarator)) memoDeclJobs.set(job.declarator, []);
        memoDeclJobs.get(job.declarator).push(job);
        continue;
      }
      const init = unwrapRuntimeExpr(job.declarator?.init);
      // the memo exists to give TWO readers one identity: a job that does not read the
      // receiver leaves the residual as its only reader, and that read happens in place
      // (`{ [(k(), 'freeze')]: _unused } = (guard).Object` + `freeze = _Object$freeze`)
      // ... an SE-bearing SEQUENCE / CALL init would otherwise re-run its effects in the
      // residual, and a value-SELECTING one would take its branch twice - the same rule
      // ... asked of the receiver the job dispatches on: an element resolved inside the init (`{ y: 'ab' }`)
      // memoizes as that element would, not as the literal holding it
      if (job.sentinel && !job.memoRecv && job.readsReceiver
        && sentinelMemoInitShape(job.nestedMemoNode ? unwrapRuntimeExpr(job.nestedMemoNode) : init, job.allProxyInit)
        && !memoByDeclarator.has(job.declarator)) {
        // the name was minted during the WALK, ahead of this claim's own guard ref: babel
        // allocates the receiver memo before the default guard of the claim that reads it
        memoByDeclarator.set(job.declarator, job.eagerMemoName ?? mintRefName());
      }
      if (!jobsByDeclarator.has(job.declarator)) jobsByDeclarator.set(job.declarator, []);
      jobsByDeclarator.get(job.declarator).push(job);
      // the sentinel rename mutates the prop in place - the extraction's binding target is
      // the SOURCE spelling, captured before the removal pass
      job.bindingTarget = job.collapseLeafName ? identifier(job.collapseLeafName) : propBindingTarget(job.prop);
    }
    return { memoByDeclarator, jobsByDeclarator, memoDeclJobs };
  }

  // multi-declarator SE-key sentinels stay ONE declaration: each declarator keeps its
  // residual (the key effect runs in place) and the extraction follows as a sibling
  // declarator (`{ [(e1(), 'at')]: _unused } = arr, a = _at(arr), ...` - babel's shape);
  // a single declarator splits with the extraction ahead instead
  function drainSeKeySentinelSiblings({ hostNode, jobsByDeclarator, memoDeclJobs }) {
    // an EXPORT host keeps the same shape - the declaration is rewritten in place and its
    // wrapper rides along, so every binding stays exported from the one statement
    if (hostNode.declarations.length <= 1 || !jobsByDeclarator.size) return false;
    // a MEMO-DECL sibling owns its own emission (a hoisted `_ref` and the extractions off it):
    // rewriting the declaration in place here would leave that declarator raw, its claim lost
    if (memoDeclJobs?.size) return false;
    if (jobsByDeclarator.values().some(list => list.some(job => !job.sentinel || !job.seKey
      || job.catchBorn || job.chain?.length
      // a receiverless STATIC splits its extraction out instead (`const from = _Array$from;`
      // first, the residual keeps its own statement - babel's known-global shape)
      || !job.readsReceiver))) return false;
    if (jobsByDeclarator.keys().some(declarator => declarator.init?.type !== 'Identifier')) return false;
    const declarators = [];
    for (const declarator of hostNode.declarations) {
      // a declarator here holds at most one flat SE-key claim: the only instance claim off a realm read is
      // the iterator lookup, and a defaulted one does not extract
      const declJobs = orderDeclaratorJobs(jobsByDeclarator.get(declarator) ?? []);
      declarators.push(declarator, ...declJobs.map(job => variableDeclarator(job.bindingTarget, job.value())));
    }
    hostNode.declarations = declarators;
    markRewrite();
    return true;
  }

  // a lifted SE-prefix statement may itself be a destructure ASSIGNMENT whose hop the anchor
  // owns: the lift is what puts it in statement position, so the trigger re-fires here
  function reanchorLiftedAssignments(statements, from) {
    for (let at = from; at < statements.length; at++) {
      const lifted = statements[at]?.type === 'ExpressionStatement'
        ? peelTransparentExpr(statements[at].expression) : null;
      if (lifted?.type !== 'AssignmentExpression' || lifted.left?.type !== 'ObjectPattern') continue;
      const view = { id: lifted.left, init: lifted.right };
      if (reanchorSoleCtorHopResidual(view)) {
        lifted.left = view.id;
        lifted.right = view.init;
      }
      // ... and the lift is also the statement slot a buried host never had: the effects riding
      // ahead of the anchored read spell what the source ran, so they land as statements of
      // their own (`c++; ({ customW } = _Map);` - `liftAssignInitPrefix`'s shape off a slot it
      // could not reach). a kept WRITE is not one of them - it rides the value it stored
      const initSeq = peelTransparentExpr(lifted.right);
      if (initSeq?.type !== 'SequenceExpression'
        || initSeq.expressions.slice(0, -1)
          .some(expr => keptWriteRidesValue(expr, { adapter, injectorState, resolveGlobalPolyfill }))) continue;
      lifted.right = initSeq.expressions.at(-1);
      const prefix = initSeq.expressions.slice(0, -1).map(expr => expressionStatement(expr));
      statements.splice(at, 0, ...prefix);
      at += prefix.length;
    }
  }

  function rescueEmptiedDeclaratorInit({ declarator, declJobsHere, statements, insertAt = -1 }) {
    // an SE-LIFTED nav already re-emitted its prefix ahead of the extraction
    if (declJobsHere.some(job => job.seCarried)) return;
    // the emptied declarator's init keeps its observables (the discard-rescue harvest, a
    // kept call with a claim-bearing body included)
    // an extraction that READS the receiver already spells the init inside its own dispatch
    // (`at = _at((sideEffect(), getObj()))`) - rescuing it again would run the effects twice
    if (declJobsHere.some(job => job.readsReceiver)) return;
    const dropMetaPath = declJobsHere[0].metaPath;
    // a nav off a call the census resolves to a realm keeps the call alone (the shared rule): its
    // hops are dead reads, and a pure call leaves nothing - the babel lift's answer
    const realmNav = dropMetaPath
      ? liftedRealmNavEffect(declarator.init, { scope: dropMetaPath.scope, adapter, path: dropMetaPath }) : null;
    // ... and a receiver read the PRISTINE init rescued whole replays whole, in the spelling the walk
    // left it (a realm memo's selection included) - the babel lift's replay
    let dropExprs = [];
    if (realmNav) dropExprs = realmNav.effects;
    else if (pristineInitFacts.get(declarator)?.readWhole) dropExprs = [declarator.init];
    else if (dropMetaPath) {
      // A decided selection owes its running arm's accessor read, like the assignment sink.
      const frame = patternFrame(dropMetaPath);
      dropExprs = discardRescueNodesWithReads({ node: decidedRunningPart(declarator.init, frame), ...frame });
    }
    // a value-SELECTING init re-emits WHOLE - an effect buried in an operand (a proxy-hop KEY) has
    // no slot of its own, so the rescue canon answers with the selection itself. the POSITION is the
    // separate half: whatever the rescue keeps LEADS the extraction where the caller knows its slot,
    // because the source evaluates the init before it binds anything - a trailing statement would
    // move an observable getter (or a realm memo's write of one) past the binding it fed
    const rescued = dropExprs.map(expr => expressionStatement(expr));
    if (insertAt >= 0) statements.splice(insertAt, 0, ...rescued);
    else statements.push(...rescued);
  }

  // what a consumed ASSIGNMENT host leaves behind: the pruned props go first, and a pattern left dead
  // takes the host with it - only what its receiver still OWES stays, as a statement of its own.
  // answers null while the host survives, so the caller keeps it and appends
  function consumedAssignmentRemains(jobs) {
    const pruned = jobs.filter(job => job.prunesSlot);
    removeConsumedProps(pruned);
    const { assignment } = pruned[0] ?? {};
    if (!assignment || !patternDead(assignment.left)) return null;
    // a job whose dispatch CARRIES the init performs the right's effects itself, so re-emitting the
    // right beside it would run them a second time - the dead host takes its right with it
    if (pruned.some(job => job.carriesInit)) return [];
    const [{ metaPath }] = pruned;
    // ... and a right `mayHaveSideEffects` calls pure may still hold a receiver READ whose value only
    // an object-literal getter could name: a plain member read looks inert to that predicate, so the
    // rescue channel is where such a read reaches this host
    if (!mayHaveSideEffects(assignment.right)) {
      return discardRescueNodesWithReads({ node: assignment.right, scope: metaPath.scope, adapter, path: metaPath })
        .map(expressionStatement);
    }
    // a nav off a call the census resolves to a realm keeps the call alone (the shared rule): its
    // hops are dead reads, and their fold would print a bare ponyfill read
    const site = { scope: metaPath.scope, adapter, path: metaPath };
    const realmNav = liftedRealmNavEffect(assignment.right, site);
    if (realmNav) return realmNav.effects.map(expressionStatement);
    // ... and the rest lifts as one statement less its dead tail, the other leg's lift (`liftedInitElements`),
    // of the part of a right the build decides that runs (`decidedRunningPart`)
    const kept = liftedInitElements(decidedRunningPart(assignment.right, site), site);
    return [expressionStatement(kept.length === 1 ? kept[0] : sequenceExpression(kept))];
  }

  // the statement-position OVERWRITE host: the dispatches land after the destructure, and a slot the
  // claim consumed leaves with it
  function drainAssignOverwrite({ body, at, jobs }) {
    const overwrites = jobs.map(job => expressionStatement(
      assignmentExpression('=', jobBindingTarget(job), job.value())));
    const remains = consumedAssignmentRemains(jobs);
    // a sentinel minted into the kept residual (a hop emptied beside a REST) writes an undeclared
    // name in assignment position: its `var` lands ahead of the statement, babel's shape
    const mintedNames = jobs.flatMap(job => job.mintedSentinels ?? []);
    const varDecl = mintedNames.length
      ? [variableDeclaration('var', mintedNames.map(name => variableDeclarator(identifier(name))))] : [];
    const statements = [...varDecl, ...remains ?? [body[at]], ...overwrites];
    body.splice(at, 1, ...anchorLeadingStatement({ statements, hostNode: body[at] }));
  }

  // A fully consumed nested loop initializer carries its write, or its sequence prefix,
  // in the sole extraction's dispatch. Other hosts retain a sink before their extractions.
  function pushChainedSinkSlot({ declarator, extracted, declarations, declJobs }) {
    const sinkValue = peelTransparentExpr(declarator.init);
    const prefix = sinkStoresBinding(sinkValue) ? [sinkValue]
      : declJobs.length === 1 && declJobs[0].carriesPrefix
        ? observablePrefixElements(peelNestedSequenceExpressions(sinkValue).prefix, patternFrame(declJobs[0].metaPath)) : [];
    if (prefix.length && extracted.length === 1) {
      extracted[0].init = carryInitPrefix(extracted[0].init, prefix);
      declarations.push(...extracted);
      return;
    }
    const sink = variableDeclarator(identifier(mintUnusedName()), sinkValue);
    declarations.push(sink, ...extracted);
  }

  // the shared dead-residual rule, asked of a declarator its claims left behind - the sentinels are
  // the names this leg minted
  function residualDies(declarator, declJobs) {
    const at = declJobs[0]?.metaPath;
    return declJobs.length > 0 && residualHuskIsDead({
      pattern: declarator.id,
      init: declarator.init,
      isSentinel: id => injectorState.hasGeneratedUnusedName(id.name),
      scope: at?.scope,
      adapter,
      path: at,
    });
  }

  // Append extractions beside each surviving residual in source order. A fully consumed host
  // splits its extractions and following declarators into statements; captured siblings keep
  // their shared declaration group until the sibling drain finishes.
  function drainSiblingAppend({ hostNode, body, at, jobs, jobsByDeclarator, sourceProps, memoDeclJobs }) {
    if (jobs.every(job => !job.siblingAppend)
      || memoDeclJobs.keys().some(declarator => jobsByDeclarator.has(declarator))) return false;
    const appendExported = jobs.some(job => job.exported);
    const appendStatements = [];
    const capturedGroup = hostNode.declarations.some(declarator => capturedSiblingHosts.has(declarator)
      && patternBindingCount(declarator.id) > 0
      && (declarator.id.type !== 'Identifier' || injectorState.isOwnPassGeneratedName(declarator.id.name)));
    let group = [];
    let splitRemaining = false;
    function flushGroup() {
      if (group.length) appendStatements.push(...(splitRemaining ? group.map(item => [item]) : [group])
        .map(items => exportWrap(variableDeclaration(hostNode.kind, items), appendExported)));
      group = [];
    }
    for (const declarator of hostNode.declarations) {
      const memoJobs = memoDeclJobs.get(declarator);
      if (memoJobs) {
        flushGroup();
        const emitted = emitMemoDeclarator({
          hostNode, declarator, declJobs: memoJobs, statements: appendStatements, exported: appendExported,
        });
        if (emitted !== 'consumed') {
          appendStatements.push(exportWrap(variableDeclaration(hostNode.kind, [declarator]), appendExported));
        }
        continue;
      }
      const declJobsHere = jobsByDeclarator.get(declarator) ?? [];
      // a slot memo lands at ITS declarator: an in-slot write goes into the residual, a hoisted memo
      // stands as a statement right behind the leading siblings (their inits run first) - the join
      // resumes after it with the residual, its extractions and the trailing siblings
      const memoStatements = [];
      emitLiteralReceiverMemos({ declarator, jobs: declJobsHere, statements: memoStatements, kind: hostNode.kind, mintRefName });
      if (memoStatements.length) {
        flushGroup();
        appendStatements.push(...memoStatements);
      }
      const extractions = declJobsHere.map(job => variableDeclarator(job.bindingTarget, job.value()));
      // a declarator the extraction consumed WHOLE splits off as its own statement, its
      // emptied residual dropped (`const { Array: { from } } = globalThis, <rest>` ->
      // `const from = _Array$from;` ahead of the rest) - babel's shape
      if (declarator.id.type === 'ObjectPattern' && !declarator.id.properties.length) {
        if (capturedGroup && declJobsHere.some(job => job.capturedSibling)) {
          group.push(...extractions);
          continue;
        }
        flushGroup();
        splitRemaining = true;
        appendStatements.push(...extractions.map(item => exportWrap(variableDeclaration(hostNode.kind, [item]), appendExported)));
        if (declJobsHere.length) rescueEmptiedDeclaratorInit({ declarator, declJobsHere, statements: appendStatements });
        continue;
      }
      // a leaf the join does not append (a consumed static beside it) stands AHEAD of its residual
      const residualFirst = residualPrecedesExtractions(declarator, declJobsHere, sourceProps.get(declarator));
      const leading = extractions.filter((item, index) => !declJobsHere[index].siblingAppend
        || declJobsHere[index].capturedSibling && !residualFirst);
      // ... and a residual left reading only what the claims read leaves the join
      group.push(...leading, ...residualDies(declarator, declJobsHere) ? [] : [declarator],
        ...extractions.filter(item => !leading.includes(item)));
    }
    flushGroup();
    markRewrite();
    body.splice(at, 1, ...anchorLeadingStatement({ statements: appendStatements, hostNode, statementNode: body[at] }));
    return true;
  }

  // eslint-disable-next-line max-statements -- per-form drain dispatch sequence
  function drainDeclaration({ hostNode, body, at, jobs }) {
    jobs = withoutCtorHopJobsWithLiveSiblings(jobs);
    if (!jobs.length) return;
    const { memoByDeclarator, jobsByDeclarator, memoDeclJobs } = partitionDeclarationJobs(jobs);
    // the SOURCE prop order, taken before the consumed ones leave: a re-anchored residual
    // is emitted at the position its surviving hop was written in
    const sourceProps = new Map(hostNode.declarations
      .filter(declarator => declarator.id?.type === 'ObjectPattern')
      .map(declarator => [declarator, [...declarator.id.properties]]));
    removeConsumedProps(jobs.filter(job => job.host !== 'memo-decl'));
    if (drainSentinelMemoSiblings({ hostNode, body, at, jobs, jobsByDeclarator, memoByDeclarator, memoDeclJobs })) return;
    if (drainSeKeySentinelSiblings({ hostNode, jobsByDeclarator, memoDeclJobs })) return;
    // sibling-declarator mode: the declaration stays ONE statement, each extraction appended
    // as a declarator after its residual (babel's multi-declarator kept-key shape)
    if (drainSiblingAppend({ hostNode, body, at, jobs, jobsByDeclarator, sourceProps, memoDeclJobs })) return;
    // statement-per-declarator split, in SOURCE order: each declarator's extractions land
    // ahead of its own residual, and untouched siblings keep their own statements
    const exported = jobs.some(job => job.exported);
    const statements = [];
    let touched = jobsByDeclarator.size > 0;
    let joinsFollowing = null;
    for (const declarator of hostNode.declarations) {
      const previous = joinsFollowing;
      joinsFollowing = null;
      const declMemoJobs = memoDeclJobs.get(declarator);
      if (previous && declarator.id.type === 'Identifier' && !declMemoJobs && !jobsByDeclarator.has(declarator)) {
        previous.declarations.push(declarator);
        joinsFollowing = previous;
        continue;
      }
      if (declMemoJobs) {
        const sourceOrder = sourceProps.get(declarator) ?? [];
        // Ordinary claims share the memo route in source order. Dispatches read its receiver;
        // receiverless statics still need their own binding beside those reads.
        const otherJobs = orderDeclaratorJobs(jobsByDeclarator.get(declarator) ?? []);
        const readers = otherJobs.filter(job => !job.sentinel);
        const routeJobs = [...declMemoJobs, ...readers]
          .sort((left, right) => sourceOrder.indexOf(jobOuterProp(left)) - sourceOrder.indexOf(jobOuterProp(right)));
        const emitted = emitMemoDeclarator({ hostNode, declarator, declJobs: routeJobs, statements, exported });
        touched ||= emitted;
        // the route's readers are every other claim the declarator carries: an SE-key or rest sentinel
        // over the same opaque init takes the retained capture instead, so the residual alone remains
        if (emitted !== 'consumed') statements.push(exportWrap(variableDeclaration(hostNode.kind, [declarator]), exported));
        continue;
      }
      const declJobsHere = jobsByDeclarator.get(declarator) ?? [];
      // the memo lands FIRST: the join reads a re-readable identifier init, which is what
      // the memo just made this one (`const _ref = getArr(), { ..._unused } = _ref, fl = ...`)
      // the node that memo HOLDS: a literal-receiver plan naming the same read joins this
      // binding instead of declaring a second copy of it
      const refName = memoByDeclarator.get(declarator);
      const memoisedInit = emitDeclaratorMemo({
        refName,
        declarator,
        statements,
        declJobs: jobsByDeclarator.get(declarator) ?? [],
        // the memo binds nothing the source named, so it takes `const` wherever it stands alone. an
        // SE-KEY group is the exception both legs share: there the memo joins the host's own
        // declaration rather than standing apart, and a joined declarator carries that host's kind
        kind: hostNode.declarations.length > 1 || declJobsHere.every(job => !job.seKey)
          ? 'const' : hostNode.kind,
      });
      if (joinSeKeySiblingDeclarator({ hostNode, declarator, declJobsHere, exported, statements, markRewrite, refName, adapter })) {
        touched = true;
        continue;
      }
      // where the literal receiver memos start: the init's sequence prefix, lifted below, runs ahead of them
      const literalMemoAt = statements.length;
      emitLiteralReceiverMemos({
        declarator,
        jobs: jobsByDeclarator.get(declarator) ?? [],
        statements,
        kind: hostNode.kind,
        mintRefName,
        hostRef: refName,
        hostInit: memoisedInit,
      });
      // ... and a pattern the SOURCE already wrote empty is not ours to drop: nothing consumed it, so
      // its init is a read the source performs and the declaration owes (`const {} = eff(), { at } = eff()`
      // lost one `eff()` call). the snapshot above is taken before any prop leaves, which is what
      // separates "we emptied it" from "it came that way"
      const emptied = declarator.id.type === 'ObjectPattern' && declarator.id.properties.length === 0
        && (declJobsHere.length > 0 || (sourceProps.get(declarator) ?? []).length > 0);
      const emptiedAt = statements.length;
      // a LITERAL CONTAINER's discarded siblings evaluate BEFORE the slot the extraction
      // read, so they ride the value as a sequence prefix (`{ 1: { keys } } = [bump(),
      // Object]` -> `const keys = (bump(), _Object$keys)`); every other rescued init lifts
      // as its own statement ahead of the extraction, which is the sequence-init canon
      const containerPrefix = emptied ? literalContainerRescue(declarator, declJobsHere, adapter) : [];
      // ... and an init only the PROBE proved absent-able keeps its own read: the consume
      // discards it, and off-env that read is what throws
      // (`{ Array: { of } } = globalThis.window` leads with `(null == _globalThis.window
      // ? void 0 : _globalThis.window).Array`)
      const probeRead = emptied && !containerPrefix.length
              && declJobsHere.every(job => !job.readsReceiver && !job.seCarried)
              ? renderDiscardedInitProbe(declJobsHere, probeRenderCtx) : null;
      const extractedHere = [];
      // the init's own prefix is placed ONCE per declarator: it rides the FIRST extraction's value
      // where that claim spells a dispatch to hold it, and lifts to a statement ahead otherwise (a
      // receiver-less static or symbol leaf binds its pure directly). deciding it per JOB ran the
      // prefix once per claim - measured as a doubled effect log on a mixed instance+static pattern
      const jobsHere = orderDeclaratorJobs(jobsByDeclarator.get(declarator) ?? []);
      const initPrefix = carriedInitPrefix(declarator, declJobsHere, patternFrame(declJobsHere[0]?.metaPath));
      // carried only into a SOLE extraction: several readers of one init cannot each hold the
      // prefix, so it lifts ahead of them all (the shape the babel leg prints there too)
      const carryIntoFirst = initPrefix.length > 0 && jobsHere.length === 1 && !!jobsHere[0]?.carriesPrefix;
      for (const job of jobsHere) {
        const leading = extractedHere.length !== 0 ? []
          : [...containerPrefix.map(expr => cloneNode(expr)), ...probeRead ? [probeRead] : []];
        const carried = extractedHere.length !== 0 || !carryIntoFirst ? [] : initPrefix;
        const carriedValue = carryInitPrefix(job.value(refName), carried);
        const value = leading.length ? sequenceExpression([...leading, carriedValue]) : carriedValue;
        const declarators = [variableDeclarator(job.bindingTarget, value)];
        if (job.value.leadRef) declarators.unshift(variableDeclarator(identifier(job.value.leadRef)));
        // ... and a lead DECLARATION is its own statement ahead of the extraction: a block-scoped
        // ref the born host cannot hoist a `var` for, and which the extraction does not carry as a
        // declarator of its own - the shape the other leg prints for this composition
        if (job.value.leadDecl) {
          extractedHere.push(variableDeclaration('let', [variableDeclarator(identifier(job.value.leadDecl))]));
        }
        extractedHere.push(exportWrap(variableDeclaration(hostNode.kind, declarators), exported));
      }
      if (!emptied) {
        // the residual SURVIVES, so it keeps the receiver and the extraction stands ahead of it -
        // but the source ran the receiver's sequence prefix before either. lift it to where the
        // source ran it, or the effect observes the write the extraction has already made.
        // asked AFTER the re-anchor below: an anchored residual replays the prefix inside its
        // rebuilt init (`{ customP } = (eff(), _Promise)`, the shape both legs lock), and that
        // minted sequence carries no span for the lift to take
        // ... and ahead of the literal receiver memos too: they read a slot of the literal the prefix
        // evaluates before
        function survivingPrefixLift() {
          const lifted = initPrefix.length ? []
            : liftSurvivingInitPrefix(declarator, declJobsHere, patternFrame(declJobsHere[0]?.metaPath));
          statements.splice(literalMemoAt, 0, ...lifted);
          return [];
        }
        // the re-anchor serves a residual the extraction LEFT BEHIND; an untouched
        // sibling declarator keeps its raw pattern (babel anchors only what it consumed)
        // ... and it keeps its own SOURCE slot: a hop written before every consumed one is
        // emitted first (`{ [S]: kept } = _Map; const fe = _Object$fromEntries;`). asked
        // BEFORE the re-anchor, which swaps the pattern for the hop's own inner one
        const residualFirst = residualPrecedesExtractions(declarator, declJobsHere, sourceProps.get(declarator));
        const anchored = declJobsHere.length > 0
          && reanchorSoleCtorHopResidual(declarator, { metaPath: declJobsHere[0]?.metaPath ?? null });
        if (anchored) touched = true;
        const survivingPrefix = survivingPrefixLift();
        // ... and a residual left reading only what the claims read dies with them, its prefix lifted
        // above, where what it still evaluates runs nothing
        if (residualDies(declarator, declJobsHere)) {
          statements.push(...survivingPrefix, ...extractedHere);
          continue;
        }
        const residual = exportWrap(variableDeclaration(hostNode.kind, [declarator]), exported);
        // A guard detached from the remaining pattern keeps its declarator beside that
        // residual. Earlier queued instance writes retain their separate source slots.
        for (const [index, job] of jobsHere.entries()) {
          if (!job.guardDetach) continue;
          const extracted = extractedHere[index];
          const joined = exported ? residual.declaration : residual;
          const guard = exported ? extracted.declaration : extracted;
          joined.declarations.splice(job.guardDetach === 'before' ? 0 : joined.declarations.length, 0, ...guard.declarations);
          extractedHere[index] = null;
        }
        const standalone = extractedHere.filter(Boolean);
        // only an ANCHORED residual re-homes: a raw one stays where the extraction left it
        // ... and a residual that WRITES a slot memo stands ahead of the extraction reading it, as does
        // one whose init RUNS code that could read a binding the extraction writes
        if ((residualFirst && anchored) || declJobsHere.some(job => job.extractAfterResidual)
          || (declJobsHere.length && residualRuns(declarator))) {
          statements.push(...survivingPrefix, residual, ...standalone);
        } else statements.push(...survivingPrefix, ...standalone, residual);
      } else {
        statements.push(
          ...initPrefix.length && !carryIntoFirst
            ? observablePrefixElements(initPrefix, { scope: declJobsHere[0].metaPath?.scope, adapter, path: declJobsHere[0].metaPath })
              .map(expr => expressionStatement(expr)) : [],
          ...extractedHere,
        );
        if (declJobsHere.length && !containerPrefix.length) {
          rescueEmptiedDeclaratorInit({ declarator, declJobsHere, statements, insertAt: emptiedAt });
        }
        // Only a sole defaulted consume retains the untouched tail of this source host.
        if (jobs.length === 1 && jobsHere[0]?.defaulted && extractedHere.length === 1
          && extractedHere[0].type === 'VariableDeclaration' && extractedHere[0].kind === hostNode.kind) {
          [joinsFollowing] = extractedHere;
        }
      }
    }
    if (!touched) return;
    markRewrite();
    // a declaration binds through declarations: its leading expression statements are the lifted effects
    const lifted = statements.findIndex(statement => statement.type !== 'ExpressionStatement');
    body.splice(at, 1, ...anchorLeadingStatement({ statements, hostNode, statementNode: body[at], lifted }));
  }

  // the init's SURFACE view: a bare identifier, a sequence whose tail reads the surface,
  // or a kept write storing it - each re-anchors by swapping only the VALUE slot
  // `metaPath`, when the caller has one: a CALL tail the inline canon proves to yield a proxy global
  // reads as that global's pure binding - dropped where it runs no effect, kept ahead of the value
  // as a sequence prefix where it does (the other leg lifts it as a statement)
  function surfaceInitInfo(declarator, metaPath = null) {
    let init = peelTransparentExpr(declarator.init);
    // a CHAIN wrapper the collapse EMPTIED is a husk for THIS question: the substitution took its
    // `?.` with it, so the surface the init names is the one its inner names
    // (`({ Array: { k } } = globalThis?.globalThis)` holds `(_globalThis)` by now). asking the husk
    // answered "not a surface" and left the sole hop in the pattern, where the other leg re-anchors
    // it. the peel stays HERE and not in `peelDeadChainMarker`: that one answers whether a `?.` is
    // dead, and its callers keep the wrapper wherever it cannot - measured, moving it there moves
    // 254 fixtures
    if (init?.type === 'ChainExpression' && !receiverCarriesLiveOptional(init.expression)) {
      init = peelTransparentExpr(init.expression);
    }
    let tail = init;
    let shape = 'ident';
    if (tail?.type === 'SequenceExpression') {
      shape = 'seq';
      tail = peelTransparentExpr(tail.expressions.at(-1));
    }
    if (tail?.type === 'AssignmentExpression') {
      shape = shape === 'seq' ? null : 'assign';
      tail = peelTransparentExpr(tail.right);
      // a stored value with a prefix of its own reads the surface in its tail: the whole write
      // replays ahead of the re-read (`(kw = (eff(), _globalThis), _globalThis.Object)`)
      if (tail?.type === 'SequenceExpression') tail = peelTransparentExpr(tail.expressions.at(-1));
    }
    // an ALL-proxy SELECTING tail names the same surface on every live branch, so the
    // selection drops with the re-anchor (`c ? globalThis : self` -> `_globalThis.Array`)
    if ((tail?.type === 'ConditionalExpression' || tail?.type === 'LogicalExpression')
      && allProxySelectingInit(tail, { adapter, injectorState })) tail = firstProxyBranch(tail);
    // a GUARD-shaped tail (the probe render) yields the surface its ALTERNATE names, and the
    // residual reads the hop off the WHOLE guard - the source's own read, undefined where the
    // probe is (`(null == _globalThis.window ? void 0 : _self).Object`)
    const guarded = shape === 'ident' && tail?.type === 'ConditionalExpression'
      && tail.consequent?.type === 'UnaryExpression' && tail.consequent.operator === 'void'
      && !!proxySurfaceIdentifier(tail.alternate, { adapter, injectorState });
    if (guarded) return { init, tail, shape: 'guard' };
    if (shape && metaPath && invocationNode(tail)) {
      const dropped = provenRealmCallRoot(tail, metaPath, adapter);
      const proven = dropped ?? provenRealmCallRoot(tail, metaPath, adapter, { allowEffects: true });
      const pure = proven && bareProxyGlobalPure(proven, metaPath, { adapter, resolveGlobalPolyfill });
      if (pure) {
        const prefix = [...shape === 'seq' ? init.expressions.slice(0, -1) : [], ...dropped ? [] : [tail]];
        return {
          init: prefix.length ? sequenceExpression([...prefix, tail]) : init,
          tail: identifier(injectPureImport(pure.entry, pure.hintName)),
          shape: prefix.length ? 'seq' : 'ident',
        };
      }
    }
    if (!shape || !proxySurfaceIdentifier(tail, { adapter, injectorState })) return null;
    return { init, tail, shape };
  }

  // a residual whose SOLE prop is a ctor hop over the surface re-anchors on the pure ctor
  // (`{ Promise: { customZ } } = _globalThis` -> `{ customZ } = _Promise`); pristine proxy
  // KEYS peel first (`{ globalThis: { Map: { g } } }` anchors at Map). a sibling key at the
  // outer level keeps the proxy-root residual (the boundary babel holds)
  function reanchorSoleCtorHopResidual(declarator,
    { forceMutatedHop = false, wholeDeclarator = false, metaPath = null, hopKeyName = null } = {}) {
    const info = surfaceInitInfo(declarator, metaPath);
    if (!info) return false;
    let changed = false;
    for (;;) {
      const pattern = declarator.id;
      if (pattern?.type !== 'ObjectPattern' || pattern.properties.length !== 1) return changed;
      const [hop] = pattern.properties;
      // a slot DEFAULT on the hop is dead for a step that navigates the same surface - the
      // pattern under it is what binds (`{ self: { a } = {} }` anchors like `{ self: { a } }`)
      const hopPattern = patternSlotTarget(hop.value);
      if (hop.type !== 'Property' || hopPattern?.type !== 'ObjectPattern' || !hopPattern.properties.length
        || hopPattern.properties.some(item => item.type === 'RestElement')) {
        return changed;
      }
      // a `core-js-disable` mark on the hop or a leaf keeps the residual raw.
      // a polyfillable default RIDES the re-anchor at any depth: this render re-homes the pattern by
      // mutating it, so every default value stays the live node it was and its own claim renders in
      // place - the shared plan takes the same view, and the other binding, whose render CLONES,
      // rescues those subtrees from its skip seeding instead
      if (isDisabled?.(hop) || hopPattern.properties.some(item => isDisabled?.(item))) return changed;
      const key = hop.computed ? peelTransparentExpr(hop.key) : hop.key;
      const keyName = hop.computed
        ? (key?.type === 'Literal' && typeof key.value === 'string' ? key.value : hopKeyName)
        : key?.name ?? (typeof key?.value === 'string' ? key.value : null);
      if (typeof keyName !== 'string') return changed;
      // a possible-global HOP over a guarded value navigates the same surface, so it drops with
      // the guard standing - the ctor-hop arm below is the one the guard shape serves
      if (POSSIBLE_GLOBAL_OBJECTS.has(keyName) && info.shape !== 'guard') {
        if (!isPristineProxyGlobal(adapter, keyName, metaPath && { node: hop, path: metaPath })) return changed;
        declarator.id = hopPattern;
        // the flatten rewrote the pattern, so the init re-emits as the surface it resolved to: a
        // TS assertion about the SOURCE spelling asserts nothing about that
        // (`((eff(), globalThis) as any)` -> `(eff(), _globalThis)`)
        if (info.init !== declarator.init) declarator.init = info.init;
        // a kept-write init re-reads the surface AFTER the write (`(q = _globalThis,
        // _globalThis)`); ident / seq spellings already read it
        if (info.shape === 'assign') {
          declarator.init = reanchoredInit(declarator, info, null);
          // the re-read is CLONED, and a flatten running DURING the walk clones a root the
          // substitution has not reached yet - it swaps here, as every detached copy does
          if (metaPath) {
            declarator.init = substituteProxyRootsInClone(declarator.init, metaPath,
              { adapter, resolveGlobalPolyfill, injectPureImport });
          }
        }
        changed = true;
        continue;
      }
      // ... and a ctor hop re-anchors only where its key's level names the constructor (the shared
      // ctor-key-anchor gate): a user global is an unknown slot, where the hop's default fires
      // (`{ self: { A: { groupBy } = Map } }` keeps `= Map`), and so is a built-in no target is
      // promised (`{ WeakRef: { of } = Array }`)
      if (!realmLevelNamesCtor(keyName, hop.value, adapter)) return changed;
      // a MUTATED slot holds the user's shim: no static behind it resolves, so the residual
      // re-anchors on the hop's own member READ (`{ groupBy } = _globalThis.Map`) - it
      // flattens whether or not the extraction consumed anything inside
      // a residual an extraction LEFT BEHIND keeps its nested spelling on a mutated hop
      // (babel anchors only what it consumed); a whole-declarator mutated hop flattens,
      // and only the drain's own note reaches here with that proof
      const mutatedHop = adapter.isMutatedStatic('globalThis', keyName, metaPath && { node: hop, path: metaPath });
      if (mutatedHop && !forceMutatedHop) return changed;
      // under a GUARD the hop is read off the guarded VALUE, never off a ctor binding: the
      // ponyfill would answer where the source's probe yields undefined
      const pure = mutatedHop || info.shape === 'guard' ? null : resolveGlobalPolyfill(keyName);
      // the member-read anchor serves a hop the extraction consumed INSIDE (a sentinel
      // rename or a rest exclusion prove it); an untouched hop - a duplicate-key bail's
      // survivor included - keeps the raw residual (babel anchors only what it consumed)
      // ... and a POLYFILLABLE DEFAULT on the hop's own prop is that proof too: its claim
      // rendered in place, so the residual is no longer the raw one the source wrote
      if (!mutatedHop && !pure && !wholeDeclarator && !patternHasPolyfillableDefault(hopPattern)
        && hopPattern.properties.every(item => !(item.type === 'RestElement'
          || (item.type === 'Property' && item.value?.type === 'Identifier'
            && item.value.name?.startsWith('_unused'))))) return changed;
      declarator.id = hopPattern;
      // no pure ctor: the residual re-anchors on the hop's member READ off the surface
      // (`{ from: _unused, ...arrRest } = _globalThis.Array` - babel's shape)
      declarator.init = reanchoredInit(declarator, info, pure
        ? identifier(injectPureImport(pure.entry, pure.hintName))
        : memberFromKeyName(cloneNode(info.tail), keyName));
      return true;
    }
  }

  // the receiver of an assignment-form destructure is read once per extraction plus once by a
  // surviving residual: an unreusable spelling read twice takes the memo the declaration form
  // already mints (`const _ref = obj.list;` - a second read would re-run the getter)
  // eslint-disable-next-line max-statements -- per-form drain dispatch sequence
  function drainAssignment({ hostNode, body, at, jobs, inSequence = false }) {
    if (jobs[0].bodyless) {
      drainBodylessAssignment({ hostNode, jobs }, {
        program,
        markRewrite,
        mintRefName,
        removeConsumedProps,
        reanchorSoleCtorHopResidual,
        surfaceInitInfo,
        // the memo verdict is one question for both spellings of this host: a bodyless slot changes
        // where the statements land, never what the receiver is
        memoCtx: { adapter, injectorState },
      });
      return;
    }
    // an ALL-ANCHORED line has no consumed sibling to drive the split: every job would only
    // re-read its own hop off the pure ctor, and babel leaves that line whole on the substituted
    // global proxy (`({ Set: { intersection }, WeakSet: { customW } } = _globalThis)`)
    // (a SOLE hop keeps its own re-anchor - that shape is the sole-ctor-hop residual's)
    if (jobs.length > 1 && jobs.every(job => job.prop?.value?.type === 'ObjectPattern')) return;
    // babel's cascade order: FLAT extractions run before the residual, NESTED-hop
    // extractions after it; a detached guard keeps its side of the residual. A SE-keyed sentinel
    // keeps the residual FIRST (its key effect must precede the lookup). The seKey view reads the
    // prop's key before any rename.
    // the demotion is asked PER JOB: a rest-forced hop follows the residual, but a FLAT
    // sibling beside it keeps its place ahead (its own slot read owes the hop nothing)
    function demotedBehindResidual(job) {
      return job.guardDetach === 'after' || !!job.chain?.length
        || (job.sentinel && job.prop.computed && computedKeyHasSideEffects(job.prop, patternFrame(job.metaPath)));
    }
    const seKeyResidualFirst = jobs.some(job => job.sentinel
      && job.prop.computed && computedKeyHasSideEffects(job.prop, patternFrame(job.metaPath)));
    const flatJobs = jobs.filter(job => !demotedBehindResidual(job));
    const nestedJobs = jobs.filter(job => demotedBehindResidual(job));
    const flatExtracted = flatJobs
      .map(job => expressionStatement(assignmentExpression('=', propBindingTarget(job.prop), job.value())));
    const nestedExtracted = nestedJobs
      .map(job => expressionStatement(assignmentExpression('=', propBindingTarget(job.prop), job.value())));
    // the SOURCE slot of the residual, read before the removal empties the pattern: an
    // anchored residual keeps its own place among the extractions (babel's cascade)
    const assignSourceProps = jobs[0].assignment.left?.type === 'ObjectPattern'
            ? [...jobs[0].assignment.left.properties] : null;
    removeConsumedProps(jobs);
    const [{ assignment }] = jobs;
    // the source slot of what SURVIVES, read before the re-anchor swaps the pattern for its hop's inner one
    const residualSourceAt = assignment.left?.type === 'ObjectPattern' && assignSourceProps
      ? Math.min(...assignment.left.properties.map(item => assignSourceProps.indexOf(item)).filter(index => index >= 0), Infinity)
      : Infinity;
    // an effectful read the consume DISCARDS still runs: the whole read lifts as its own
    // statement ahead of the extractions (`({ any } = globalThis[(e++, 'Promise')])`) - unless an
    // extraction READS it: that dispatch performs the read, once, where the source did
    const discardedRead = assignment.left?.type === 'ObjectPattern' && !assignment.left.properties.length
            && jobs.some(job => job.rawKeyRootInit) && jobs.every(job => !job.readsReceiver) ? assignment.right : null;
    // the probe the full consume owes for the read it discards, decided BEFORE the prefix below:
    // that read is the probe's, and lifting it as a statement too ran the write inside it twice
    const probeLead = discardedRead ? null : renderDiscardedInitProbe(jobs, probeRenderCtx);
    // the receiver read by an extraction AND by the surviving residual memoizes once - the
    // verdict needs the residual as it survives, so the values re-render onto the ref here
    const holder = jobs[0].receiverHolder;
    const [{ receiverExpression }] = jobs;
    const memoRef = receiverExpression ? holder.left.name : assignmentMemoRef(assignment, jobs, mintRefName, { adapter, injectorState });
    const memoDecl = memoRef ? [variableDeclaration('const',
      [variableDeclarator(identifier(memoRef), holder?.right ?? assignment.right)])] : [];
    if (memoRef) {
      for (const [index, job] of [...flatJobs, ...nestedJobs].entries()) {
        [...flatExtracted, ...nestedExtracted][index].expression.right = job.value(memoRef);
      }
      assignment.right = identifier(memoRef);
      if (receiverExpression) {
        // Its capture moved to the leading declaration; this discarded host owes only its writes.
        const tail = receiverExpression.expressions.at(-1);
        const returnedRef = tail?.type === 'Identifier' && tail.name === memoRef;
        const writes = receiverExpression.expressions.slice(1, returnedRef ? -1 : undefined);
        replaceNodeInTree(body[at], receiverExpression, sequenceExpression(writes));
      } else if (holder) holder.right = identifier(memoRef);
    }
    // an INNER-rest hop re-anchors: the outer hop drops, the inner pattern reads the hop
    // nav directly (`({ Object: { k: _unused, ...inner } } = g)` ->
    // `({ k: _unused, ...inner } = _g.Object)`)
    // ... and so does a CONSUMED one that left survivors behind: the outer hop has nothing but
    // the inner pattern under it, so the residual reads the hop directly - through the pure CTOR
    // where the hop names one (`({ allSettled: _unused, ...r } = _Promise)`)
    if (jobs.length === 1 && jobs[0].chain?.length
      && (jobs[0].sentinel || jobs[0].pattern.properties?.length)) {
      const [job] = jobs;
      const outer = job.chain.at(-1).outerPattern;
      if (outer.properties.length === 1 && job.chain.every(level => !level.outerRest)) {
        const ctorView = { id: assignment.left, init: assignment.right };
        if (reanchorSoleCtorHopResidual(ctorView, { metaPath: jobs[0]?.metaPath ?? null })) {
          assignment.left = ctorView.id;
          assignment.right = ctorView.init;
        } else {
          assignment.left = job.pattern;
          assignment.right = job.chain.reduceRight(
            (acc, level) => memberExpression(acc, cloneNode(level.hopProp.key), { computed: level.hopProp.computed }),
            assignment.right,
          );
        }
      }
    }
    const anchoredResidual = anchorAssignmentResidual(assignment, jobs,
      view => reanchorSoleCtorHopResidual(view, { metaPath: jobs[0]?.metaPath ?? null }), surfaceInitInfo);
    // sentinel names declare ADJACENT to their statement (babel plants the `var` right there)
    const mintedNames = jobs.flatMap(job => job.mintedSentinels ?? []);
    const varDecl = mintedNames.length
      ? [variableDeclaration('var', mintedNames.map(name => variableDeclarator(identifier(name))))] : [];
    // the lifted SE prefix of a consumed seq receiver runs first, once; a SURVIVING
    // residual then reads the quiet tail (`log(); ({ other } = wrapper);` - babel's lift)
    // the prefix is re-derived HERE: the collapse may have rebuilt the receiver since the job
    // recorded, so the recorded nodes can be the detached originals. only a sequence the
    // SOURCE wrote lifts - one the collapse MINTED (a kept write re-emitted beside the pure)
    // is the value's own spelling and stays whole, which its missing span tells us
    // ... and of a right the build decides, what runs of it (`decidedRunningPart`): the rest never does
    const peeledRhs = peelTransparentExpr(decidedRunningPart(assignment.right, patternFrame(jobs[0].metaPath)));
    // the sequence read through the canon split, as the lift plan read it: a NESTED comma run
    // (`(f(), (g(), globalThis))`) lifts every prefix, where the outer level alone dropped the inner, and so
    // does the live arm of a selection the build decides behind it (`liftedPrefixSplit`)
    const { prefix: rhsPrefix, tail: rhsTail } = liftedPrefixSplit(peeledRhs, patternFrame(jobs[0].metaPath));
    // the WHOLE right recorded as the prefix - the call-branch lift (`(() => ...)();`), a kept WRITE -
    // re-emits as a statement whatever the receiver shape is now, but only where the consume DISCARDS
    // it: a surviving residual performs a store where the source did, and the extractions demoted
    // behind it read what it stored (`({ other } = kw = (eff(), _globalThis)); a = _at(...)`)
    const wholeRhsLift = jobs[0].seqPrefix?.length === 1 && jobs[0].seqPrefix[0] === assignment.right
      && assignment.left.properties?.length === 0;
    // ... and a MINTED sequence counts as that source one where the collapse rebuilt it AROUND
    // the recorded prefix: the very nodes the job recorded still lead it, so the tail is the
    // resolved receiver and the prefix lifts to where the source ran it
    const rebuiltSeqPrefix = !!jobs[0].seqPrefix?.length && rhsPrefix.length > 0
      && !Number.isInteger(peeledRhs.start)
      && rhsPrefix.length === jobs[0].seqPrefix.length
      && jobs[0].seqPrefix.every((node, index) => spellsSameSource(rhsPrefix[index], node));
    const rhsExprs = !wholeRhsLift && jobs[0].seqPrefix?.length && rhsPrefix.length > 0
      && (Number.isInteger(peeledRhs.start) || rebuiltSeqPrefix) ? [...rhsPrefix, rhsTail] : null;
    // a hop ANCHOR re-emits the receiver as its extraction's own RHS, and inside a SEQUENCE
    // slot there is no statement ahead of it to lift into: the prefix rides that RHS, where the
    // source wrote it (`({ customW } = (c++, _Map))`)
    const anchorRhsPrefix = inSequence && !wholeRhsLift && rhsExprs && jobs.length === 1
      && jobs[0].prop?.value?.type === 'ObjectPattern' ? rhsExprs.slice(0, -1) : null;
    // A top-level this residual precedes every nested extraction, so it can keep the
    // prefix in its own RHS, preserving both its source slot and its comments.
    const residualCarriesPrefix = rhsExprs && assignment.left.properties?.length > 0
      && !flatJobs.length && !memoDecl.length && !anchoredResidual && !seKeyResidualFirst && !inSequence
      && rhsTail?.type === 'ThisExpression' && isTopLevelThisContext(jobs[0].metaPath);
    const frame = patternFrame(jobs[0].metaPath);
    // a SOLE flat extraction that READS the receiver carries the source's prefix INSIDE its dispatch
    // argument (`at = _atMaybeArray((eff(), arr))`), the declaration hosts' shape and the other leg's:
    // the receiver is read once, where the source read it, and nothing is left to lift
    // ... the dispatch itself, or the one a DEFAULTED reader's guard wraps (`at = (_ref = _atMaybeArray((eff(),
    // arr))) === void 0 ? d : _ref`): the call whose one argument spells the receiver
    const [soleValue] = flatExtracted.map(statement => statement.expression.right);
    let soleDispatch = null;
    if (rhsExprs) {
      walkAstNodes({ root: soleValue ?? null, visit(node) {
        if (!soleDispatch && node.type === 'CallExpression' && node.arguments.length === 1
          && spellsSameSource(peelTransparentExpr(node.arguments[0]), peelTransparentExpr(rhsExprs.at(-1)))) soleDispatch = node;
        return !soleDispatch;
      } });
    }
    const carriesPrefix = !!soleDispatch && !anchorRhsPrefix && !wholeRhsLift && !memoRef && !probeLead && !discardedRead
      && assignment.left.properties?.length === 0 && jobs.length === 1 && jobs[0].readsReceiver && !jobs[0].chain?.length;
    if (carriesPrefix) carryInitPrefix(soleDispatch, rhsExprs.slice(0, -1));
    // ... and a read the consume discards (`discardedRead`) is that whole right already: it lifts once,
    // ahead of the extractions, and the whole-right lift stands down for it as every channel here does
    const stmtSeqPrefix = anchorRhsPrefix || carriesPrefix || residualCarriesPrefix || (wholeRhsLift && discardedRead) ? []
      : wholeRhsLift ? (probeLead
        ? liftedPrefixStatements(partitionEffectsAtProbe(
          discardRescueNodes({ node: assignment.right, ...frame }), probeNavStartOf(probeLead)).ahead)
        // ... a nav off a call the census resolves to a realm keeps only what the call owes (the
        // shared rule) - the whole read printed a dead `mk().Array;` where the babel leg lifts nothing -
        // as ONE expression, the flat consume's shape below (`eff(), mk(); g = _Map$groupBy;`).
        // the rest lifts through the shared trim canon (`liftedInitElements`, the other leg's lift), a
        // dead comma element left behind (`(0, f())`) and a decided selection read as what runs of it
        : liftedPrefixStatements(liftedRealmNavEffect(assignment.right, frame)?.effects ?? liftedInitElements(peeledRhs, frame), frame))
      // a FULLY consumed FLAT pattern discards its receiver, and what stays of it is ONE expression -
      // the shape the other leg's defer-SE route prints there (`eff(), eff2(); d = _WeakSet;`); a
      // SURVIVING residual and a NESTED claim take the per-element prefix both legs print for the
      // nested flatten (`f(); g(); m = _Array$from;`). a receiver READ the tail performs replays
      // with the whole right, which the rescue canon answers with the right itself - unless an
      // extraction reads the receiver again, which performs that read where the source did
      : rhsExprs ? (assignment.left.properties?.length === 0 && jobs.every(job => !job.chain?.length && !job.readsReceiver)
        ? discardRescueNodesWithReads({ node: assignment.right, ...frame })[0] === assignment.right
          ? [expressionStatement(assignment.right)] : liftedPrefixStatements(rhsExprs.slice(0, -1), frame)
        : observablePrefixElements(rhsExprs.slice(0, -1), frame).map(expr => expressionStatement(expr))) : [];
    // A prefix this channel lifted or discarded leaves only the tail in the residual.
    // A residual that carries its own prefix keeps the original RHS instead.
    if (rhsExprs && !anchorRhsPrefix && !residualCarriesPrefix && !wholeRhsLift && assignment.left.properties.length !== 0) {
      assignment.right = rhsExprs.at(-1);
    }
    if (assignment.left.properties.length === 0) {
      // with no residual left there is nothing for the cascade to order against: the extractions
      // run in the order the SOURCE wrote their hops (`from = _Array$from; ({ union } = _Set);`)
      const bySource = [...flatJobs, ...nestedJobs].map((job, index) => ({
        stmt: [...flatExtracted, ...nestedExtracted][index],
        at: assignSourceProps?.indexOf(jobOuterProp(job)) ?? -1,
      })).sort((left, right) => left.at - right.at).map(entry => entry.stmt);
      if (anchorRhsPrefix?.length && bySource.length) {
        bySource[0].expression.right = sequenceExpression([...anchorRhsPrefix, bySource[0].expression.right]);
      }
      // the consume DISCARDS the read the source performs off a guarded init: the first
      // extraction leads with it, rebuilt off the rendered guard (`v = ((null ==
      // _globalThis.window ? void 0 : _self).Math, _Math$sign)`) - the declaration's own rule
      if (probeLead && bySource.length) {
        bySource[0].expression.right = sequenceExpression([probeLead, bySource[0].expression.right]);
      }
      // an SE init NOTHING evaluated (no memo, no lifted prefix, no reader) keeps its own
      // discarded statement ahead - dropping it would erase the call the source performs;
      // an ANCHOR job (a pattern-valued hop) and a SEQUENCE slot own their RHS already
      // ... spelled by its OBSERVABLE elements alone: an anchored residual's right is the rescue
      // prefix ahead of the ctor pure (`(realm(), _Map)`), and with no residual left to read it the
      // pure is a dead read - the babel cascade's dead-tail trim, so neither leg prints it. a nav off
      // a call the census resolves to a realm keeps only what the call owes (the shared rule)
      const { prefix: keptPrefix, tail: keptTail } = peelNestedSequenceExpressions(peelTransparentExpr(assignment.right));
      const rhsFrame = patternFrame(jobs[0].metaPath);
      const keptRealmNav = mayHaveSideEffects(assignment.right, rhsFrame)
        ? liftedRealmNavEffect(assignment.right, { scope: jobs[0].metaPath.scope, adapter, path: jobs[0].metaPath }) : null;
      const rhsKept = !inSequence && !memoDecl.length && !stmtSeqPrefix.length && !discardedRead && !probeLead
        && jobs.every(job => !job.readsReceiver && job.prop?.value?.type !== 'ObjectPattern')
        && mayHaveSideEffects(assignment.right, rhsFrame)
        ? keptRealmNav ? keptRealmNav.effects.map(expr => expressionStatement(expr))
          // ... a SOURCE sequence stays ONE expression, the flat consume's shape; a MINTED one (no span)
          // keeps its per-element statements, which the orphan-memo drop reads statement by statement
          : Number.isInteger(peelTransparentExpr(assignment.right)?.start)
            ? liftedPrefixStatements([...keptPrefix, keptTail], patternFrame(jobs[0].metaPath))
            : observablePrefixElements([...keptPrefix, keptTail], patternFrame(jobs[0].metaPath))
              .map(expr => expressionStatement(expr)) : [];
      // ... and a receiver READ whose value only an object-literal GETTER could name reaches this
      // host through the rescue channel alone where the kept-right test above could not keep it. the
      // consume that emptied the pattern owes that read once, ahead of the bindings the source fed
      // with it - the declaration drain's own rule
      const rescuedRead = !rhsKept.length && !stmtSeqPrefix.length && !discardedRead && !probeLead && !memoDecl.length
        && !mayHaveSideEffects(assignment.right, rhsFrame)
        ? discardRescueNodesWithReads({ node: assignment.right, ...nodeSite(assignment.right, jobs[0].metaPath), adapter })
        : [];
      const effects = [
        ...discardedRead ? [expressionStatement(discardedRead)] : [],
        ...rescuedRead.map(expr => expressionStatement(expr)),
        ...rhsKept,
      ];
      spliceAssignmentRewrite([...memoDecl, ...varDecl, ...effects, ...bySource], memoDecl.length || varDecl.length ? [] : effects);
    } else if (seKeyResidualFirst) {
      spliceAssignmentRewrite([...memoDecl, ...varDecl, body[at], ...flatExtracted, ...nestedExtracted]);
    } else if (anchoredResidual?.split) {
      // SEVERAL anchored hops: each takes an assignment of its own, and every piece - extraction or
      // anchored hop - lands where the source wrote its hop, the babel cascade's order
      // (`S = _Set; ({ customZ } = _Promise); ({ customY } = _Iterator);`)
      const pieces = [...flatJobs, ...nestedJobs].map((job, index) => ({
        stmt: [...flatExtracted, ...nestedExtracted][index],
        at: assignSourceProps?.indexOf(jobOuterProp(job)) ?? -1,
      }));
      pieces.push(...anchoredResidual.split.map(({ hop, view }) => ({
        stmt: expressionStatement(assignmentExpression('=', view.id, view.init)),
        at: assignSourceProps?.indexOf(hop) ?? -1,
      })));
      pieces.sort((left, right) => left.at - right.at);
      spliceAssignmentRewrite([...memoDecl, ...varDecl, ...pieces.map(piece => piece.stmt)]);
    } else if (anchoredResidual) {
      // an ANCHORED residual is one hop among the others: it and every extraction land in the
      // order the SOURCE wrote their hops - the babel cascade's order
      // (`from = _Array$from; ({ union } = _Set); ({ keys } = _Map);`)
      const pieces = [...flatJobs, ...nestedJobs].map((job, index) => ({
        stmt: [...flatExtracted, ...nestedExtracted][index],
        at: assignSourceProps?.indexOf(jobOuterProp(job)) ?? -1,
      }));
      pieces.push({ stmt: body[at], at: residualSourceAt });
      pieces.sort((left, right) => left.at - right.at);
      spliceAssignmentRewrite([...memoDecl, ...varDecl, ...pieces.map(piece => piece.stmt)]);
    } else {
      const residualFirst = !memoDecl.length && residualRuns(assignment);
      // ... and a prefix no lift plan took (a quiet CALL tail is no pure nav) ran before the pattern
      // bound anything all the same: it lands ahead of the extractions, the declaration drain's lift
      const survivingPrefix = residualFirst || inSequence || rhsExprs || memoDecl.length || !flatExtracted.length
        || peelTransparentExpr(body[at]?.expression) !== assignment ? [] : liftSurvivingInitPrefix(assignment, jobs, frame, 'right');
      spliceAssignmentRewrite([
        ...memoDecl,
        ...varDecl,
        ...residualFirst ? [body[at], ...flatExtracted] : [...flatExtracted, body[at]],
        ...nestedExtracted,
      ], survivingPrefix);
    }

    // the rewrite replaces the host statement, the effects lifted out of its right first (`stmtSeqPrefix`
    // and the `lifted` ones leading `rest`): the comments the host owns lead what follows them
    function spliceAssignmentRewrite(rest, lifted = []) {
      const leading = [...stmtSeqPrefix, ...lifted];
      const statements = [...leading, ...rest.filter(statement => !lifted.includes(statement))];
      body.splice(at, 1, ...anchorLeadingStatement({ statements, hostNode: body[at], lifted: leading.length }));
    }
  }

  // the read a quiet bodyless init performs where only a getter names it (past a lifted sequence prefix,
  // of the tail alone), and whether it replays WHOLE: a receiver READ the tail performs replays with
  // the whole init, which the rescue canon answers with the init itself (the statement drain's rule),
  // the prefix riding it, dead elements too. both asked of the tail as REGISTERED, the pristine one:
  // the walk may have respelled it since (a realm memo writes a ref, which no longer reads as quiet),
  // and a read the pristine init performs whole (`pristineInitFacts`) is then that respelled tail,
  // replayed as it now stands
  function bodylessQuietRescue(declarator, jobs) {
    // an extraction that READS the receiver performs that read in its own dispatch - rescuing it again
    // would run it twice (the statement drain's rule)
    if (jobs.some(job => job.readsReceiver)) return { quietRescue: [], wholeReplay: false };
    const quietInit = jobs[0].seqPrefix?.length ? jobs[0].initTail : declarator.init;
    const readWhole = pristineInitFacts.get(declarator)?.readWhole ?? false;
    if (!quietInit || mayHaveSideEffects(jobs[0].initTail ?? quietInit)) return { quietRescue: [], wholeReplay: false };
    const quietRescue = readWhole ? [quietInit]
      : discardRescueNodesWithReads({ node: quietInit, ...nodeSite(quietInit, jobs[0].metaPath), adapter });
    return { quietRescue, wholeReplay: !!jobs[0].seqPrefix?.length && quietRescue.length > 0 && readWhole };
  }

  // the LIVE prefix behind a recorded one: a claim inside the prefix renders by REPLACING its
  // node, so the nodes captured at registration are pre-swap copies - lifting those spells the
  // source read again with its own polyfill lost (`(arr.flat(), globalThis)`)
  function livePrefixOf(declarator, seqPrefix, frame) {
    const { prefix } = liftedPrefixSplit(peelTransparentExpr(declarator.init), frame);
    return prefix.length === seqPrefix.length ? prefix : seqPrefix;
  }

  // a bodyless `var` destructure hosts its extractions in the slot: a block of `var local = pure;`
  // statements (babel's scope.push shape), or the one joined `var` the slot takes back; a residual
  // that survives keeps its own declarator, ordered around the extractions by the shared residual canon
  function drainBodylessDeclaration({ hostNode, jobs }) {
    const [{ declaration }] = jobs;
    // MULTI-declarator: the statement fits the slot as-is - each jobbed declarator keeps
    // its (renamed) residual and appends the extraction as a SIBLING declarator after it
    // (`var first = init, { [SE]: _unused } = rows, fm = _flatMapMaybeArray(rows);`)
    // ... and a SOLE declarator whose SE-key sentinel takes a memo joins the same way: the memo
    // leads the one `var`, the residual and its extraction follow (`if (c) var _ref = eff(), {...}`)
    const soleSeKeyMemo = declaration.declarations.length === 1 && declaration.kind === 'var'
      && jobs.some(job => job.needsMemo)
      && jobs.every(job => job.sentinel && computedKeyHasSideEffects(job.prop, patternFrame(job.metaPath)))
      && (jobs.length > 1 || residualKeepsSibling(jobs[0].declarator, jobs));
    if (declaration.declarations.length > 1 || soleSeKeyMemo) {
      // a job needing a MEMO cannot ride the comma list: the memo is a statement, so the slot
      // becomes a block and each declarator lands as its own statement inside it
      if (jobs.some(job => job.needsMemo || job.seqPrefix?.length)) {
        return drainBodylessMultiMemo({ hostNode, declaration, jobs, adapter },
          { program, mintRefName, removeConsumedProps, markRewrite });
      }
      joinBodylessSiblingExtractions({ declaration, jobs, adapter }, { removeConsumedProps, markRewrite });
      return;
    }
    const [declarator] = declaration.declarations;
    // asked before the drain reshapes the host (`statements` below replays it for an emptied pattern)
    const { quietRescue, wholeReplay } = bodylessQuietRescue(declarator, jobs);
    const sourceInit = declarator.init;
    if (declarator.id?.type !== 'ObjectPattern') return;
    const memoRef = jobs.some(job => job.needsMemo) ? mintRefName() : null;
    // SE-KEY sentinels over a re-readable init interleave into ONE declaration, so the slot
    // needs no block at all (`if (c) var { [k1]: _u } = r, a = ..., { [k2]: _u2 } = r, b = ...`)
    // ... under a DEFAULT (the guard must read PAST its own key effect) and for SEVERAL instance
    // claims (native runs key, read, key, read, and the dispatch reads the property too): segment
    // and extraction alternate. a plain sole claim keeps the block, its extraction ahead of the residual
    if (!memoRef && jobs.every(job => !job.seqPrefix?.length)
      && (jobs.some(job => job.defaulted) || (jobs.length > 1 && jobs.every(job => job.readsReceiver)))
      && declarator.init?.type === 'Identifier' && declarator.id?.type === 'ObjectPattern'
      && jobs.every(job => job.sentinel && job.prop?.computed && computedKeyHasSideEffects(job.prop, patternFrame(job.metaPath))
        && !job.chain?.length && job.pattern === declarator.id)) {
      for (const job of jobs) job.bindingTarget = jobBindingTarget(job);
      removeConsumedProps(jobs);
      declaration.declarations = interleavedSeKeySegments(declarator, jobs, null);
      markRewrite();
      return;
    }
    const statements = [];
    // the lifted SE prefix runs FIRST, once; the residual (and the memo) read the tail
    const [{ seqPrefix, initTail }] = jobs;
    const values = jobs.map(job => job.value(memoRef));
    // a SOLE extraction that READS its receiver (a dispatch with one argument) carries the
    // prefix INSIDE that argument, and the slot keeps its single statement (`if (c) var
    // iter = _getIteratorMethod((se(), obj));`). a receiver-LESS static discards the read,
    // so its prefix must lift and the slot becomes a block
    const ridesArgument = !!seqPrefix?.length && !memoRef && jobs.length === 1
      && values[0]?.type === 'CallExpression' && values[0].arguments.length === 1;
    // a residual SURVIVING over an init that RUNS code leads its extractions and keeps its prefix (the
    // shared residual canon): the init evaluates before the pattern binds anything
    const capturedLeaf = jobs.some(job => job.consumeResidualRead);
    const residualFirst = (!memoRef || capturedLeaf) && residualRuns(declarator)
      && (capturedLeaf
        || patternBindingCount(declarator.id) !== jobs.reduce((count, job) => count + patternBindingCount(job.prop.value), 0));
    // the init is DISCARDED whole where the claims empty the pattern and none reads the receiver: a
    // sole consume's registration records it as the prefix's last element, and several claims that
    // empty the pattern together discard it alike (`if (c) var { from, of } = mk().Array`)
    const discardsInit = !memoRef && !residualFirst && (seqPrefix?.at(-1) === initTail
      || (jobs.every(job => !job.readsReceiver && !job.sentinel) && mayHaveSideEffects(initTail)
        && patternBindingCount(declarator.id) === jobs.reduce((count, job) => count + patternBindingCount(job.prop.value), 0)));
    // ... and a MEMOIZED init keeps its sequence WHOLE: the memo is where it evaluates, and
    // lifting the prefix out of it would take the claims rendered inside that prefix with it
    if ((seqPrefix?.length || discardsInit) && !memoRef && !residualFirst) {
      if (ridesArgument) {
        // the LIVE prefix, like the lift below: a claim inside it renders by REPLACING its node, so
        // the registration-time copy is pre-swap and would ship the raw call (`log.push("e")` beside
        // a polyfilled twin on the other leg)
        values[0].arguments[0] = sequenceExpression([...livePrefixOf(declarator, seqPrefix, patternFrame(jobs[0].metaPath)),
          values[0].arguments[0]]);
      } else if (discardsInit) {
        // a DISCARDED init owes what its LIVE spelling still runs: the record ends with the init itself,
        // which the walk may have respelled past any count the record lines up with (`(arr.flat(),
        // mk().Map)` -> `(_flat(arr), _Map)`), so the pre-swap copies would ship a raw call. a read off
        // an effectful sequence spine lifts whole (babel's sink rule, `keepsWholeRead`); otherwise what
        // the lift canon owes - a realm nav's call, a deciding left's effects - or the live elements
        // that run something
        // ... read through its wrappers: a TS wrapper leaves with the value it wraps
        // ... and of an init the build decides, what runs of it (`decidedRunningPart`): the rest never does
        const frame = patternFrame(jobs[0].metaPath);
        const init = peelTransparentExpr(decidedRunningPart(declarator.init, frame));
        const { prefix, tail } = peelNestedSequenceExpressions(init);
        const owed = pristineInitFacts.get(declarator)?.keepsWholeRead ? [init]
          : liftedRealmNavEffect(declarator.init, frame)?.effects ?? observablePrefixElements([...prefix, tail], frame);
        statements.push(...owed.map(expr => expressionStatement(expr)));
      } else {
        const lifted = observablePrefixElements(livePrefixOf(declarator, seqPrefix, patternFrame(jobs[0].metaPath)),
          patternFrame(jobs[0].metaPath));
        statements.push(...lifted.map(expr => expressionStatement(expr)));
      }
      if (seqPrefix?.length) declarator.init = liveTailOf(declarator, { seqPrefix, initTail, ctx: patternFrame(jobs[0].metaPath) });
    }
    if (memoRef) {
      // the memo is the synthetic block's own binding, and its kind follows the SE-KEY
      // sentinel alone: that residual is planted by the same `var` channel as the segments it
      // interleaves with, while a plain or REST-kept one takes the `const` the block scopes
      // (measured on the other emitters, either host)
      // ... and a job carrying a resolved slot memoizes THAT node, the kept init reading
      // the ref in its slot.
      const elementNode = jobs.find(job => job.nestedMemoNode)?.nestedMemoNode;
      // ... and the memo takes the HOST's own kind when it stands in a block the host wrapped:
      // a `var` declaration keeps its function-scoped binding there, which is what the other
      // leg's memo declares too
      statements.push(variableDeclaration(
        jobs.some(job => job.sentinel && job.prop?.computed && computedKeyHasSideEffects(job.prop, patternFrame(job.metaPath)))
          || (elementNode && hostNode?.kind === 'var') ? 'var' : 'const',
        [variableDeclarator(identifier(memoRef), elementNode ?? declarator.init)]));
      if (elementNode) replaceNodeInTree(declarator.init, elementNode, identifier(memoRef));
      else declarator.init = identifier(memoRef);
    }
    // the ctor hops the claims left in an OBJECT residual re-anchor on their pure ctors, the statement
    // host's own rule - every declarator of the block in the order the source wrote its props. no SE-key
    // segmentation is owed: a memo here never holds several SE-key sentinels or one beside a kept sibling
    const { declarators, residualTaken } = orderResidualDeclarators(
      { declarator, jobs, values },
      { removeConsumedProps, surfaceInitInfo, reanchor: reanchorSoleCtorHopResidual },
    );
    const extractionsAt = statements.length;
    statements.push(...declarators.map(item => variableDeclaration('var', [item])));
    // a PARTIAL consume keeps the residual as its own `var` declaration inside the block
    // (`if (c) var { from, isArray } = Array;` -> `{ var from = _X; var { isArray } = Array; }`)
    const residualLives = declarator.id.properties.length !== 0 && !residualDies(declarator, jobs);
    if (residualLives && !residualTaken) statements.splice(residualFirst ? extractionsAt : statements.length, 0, declaration);
    // ... and an EMPTIED pattern over a quiet init still owes the read only a getter names there
    // (the rescue canon, the statement drain's own rule), ahead of the bindings it fed
    // ... and with a lifted prefix the two run as ONE statement, the other leg's defer-SE spelling -
    // as do several lifted elements with no rescue behind them (`if (c) { n++, w = K.g; ... }`)
    else if (!residualLives && !memoRef && (quietRescue.length || extractionsAt > 1)) {
      const lifted = statements.splice(0, extractionsAt).map(statement => statement.expression);
      const effects = wholeReplay ? [sourceInit] : [...lifted, ...quietRescue];
      statements.unshift(...lifted.length && !wholeReplay ? [expressionStatement(sequenceExpression(effects))]
        : effects.map(expr => expressionStatement(expr)));
    }
    if (replaceNodeInTree(program, hostNode, bodylessSlotReplacement(hostNode, statements))) markRewrite();
  }

  // catch-clause receiver relocation, the babel emitter's `extractCatchClause` on the estree
  // substrate: `catch ({ pattern }) {` becomes `catch (_ref) { let { pattern } = _ref;` and the
  // relocated declaration rides the ordinary declarator machinery of this ledger. runs from the
  // CatchClause visitor BEFORE the pattern's props fire their metas, so every gate below decides
  // on the source shape; both gates are the shared provider predicates the babel twin asks
  function extractCatchClause(path) {
    const { param } = path.node;
    const plan = planCatchClauseExtraction({
      paramNode: param,
      bodyNode: path.node.body,
      scope: path.scope,
      adapter,
      path,
      resolvePure: m => resolvePure(m, path),
      walkNode: (root, visit) => walkAstNodes({ root, visit }),
    });
    if (!plan) return;
    for (const prop of plan.unobservable) skippedNodes.add(prop);
    const refName = mintRefName();
    const relocated = variableDeclaration('let', [variableDeclarator(param, identifier(refName))]);
    path.get('param').replaceWith(identifier(refName));
    path.get('body').unshiftContainer('body', [relocated]);
    path.scope.crawl();
    noteRelocation(path, { slotOwner: path.node, field: 'param', pattern: param, statement: relocated, name: refName });
  }

  // Relocate a loop-head pattern when the shared catch/head plan needs a body extraction slot.
  // The head binds a fresh name; the first body statement declares the bindings, in the head's
  // own kind, or assigns the original targets. Brace a bodyless loop. Record the generated head
  // name for subsequent receiver resolution.
  function extractLoopLeft(path) {
    const { left, body } = path.node;
    const assignment = left?.type === 'ObjectPattern' || left?.type === 'ArrayPattern';
    if (!assignment && (left?.type !== 'VariableDeclaration' || left.declarations?.length !== 1)) return;
    const declarator = assignment ? { id: left } : left.declarations[0];
    if (declarator.init || !declarator.id || declarator.id.type === 'Identifier') return;
    const idPath = assignment ? path.get('left') : path.get('left').get('declarations')[0].get('id');
    const typeProbe = firstPatternProp(idPath);
    if (typeProbe) primeDestructureReceiverTypes?.(typeProbe);
    const elementType = path.node.type === 'ForOfStatement' ? resolveForOfResolvedElement?.(path) ?? null
      : typeProbe ? resolvePropertyObjectType?.(typeProbe) ?? null : null;
    const plan = planCatchClauseExtraction({
      paramNode: declarator.id,
      bodyNode: body,
      scope: path.scope,
      adapter,
      path,
      resolvePure: m => resolvePure(m, path),
      walkNode: (root, visit) => walkAstNodes({ root, visit }),
      objectHint: toHint?.(elementType) ?? null,
      iterableNode: path.node.right,
      mirrorHosts: !!forOfHeadIterableElements(assignment ? path.get('left') : path.get('left').get('declarations')[0]),
      assignment,
    });
    if (!plan) return;
    for (const prop of plan.unobservable) skippedNodes.add(prop);
    const refName = mintRefName();
    const slot = identifier(refName);
    // the relocated pattern is RE-DETECTED off the minted name, and a name has no shape the type
    // ladder can walk back to the iterated value - so the ELEMENT's type is stashed on it first,
    // the pre-mutation channel the resolver keeps for exactly this
    if (elementType) resolvedType?.set(slot, elementType);
    // the head's kind: a `const` binding written in the body throws as the source's does
    const relocated = assignment
      ? expressionStatement(assignmentExpression('=', declarator.id, slot))
      : variableDeclaration(left.kind, [variableDeclarator(declarator.id, slot)]);
    const bodyless = body.type === 'BlockStatement' ? null : body;
    if (bodyless) path.node.body = { type: 'BlockStatement', body: [bodyless] };
    path.node.body.body.unshift(relocated);
    const pattern = declarator.id;
    if (assignment) path.get('left').replaceWith(variableDeclaration('const', [variableDeclarator(identifier(refName))]));
    else declarator.id = identifier(refName);
    // the receiver canon reads the element back through this name; registering it is what tells
    // the canon the declaration below is OURS and not a source one wearing the same shape
    noteRelocatedHeadName(path.node, refName);
    // the head now declares a MINTED name, and a `var` one hoists into an owner whose var index
    // may already be built - drop it, or the relocated pattern reads a receiver with no writes
    if (left.kind === 'var') invalidateScopeVarIndex(path);
    // the head's minted binding is born mid-rewrite, and the relocated pattern is RE-DETECTED
    // against it - but this leg's scope was built at parse and never saw it. a receiver no scope
    // can name is a receiver whose STATICS are lost: the type stash above answers for instance
    // members alone, and a constructor has no value-type to stash. the babel twin registers the
    // same fact through its own scope
    const [headDeclarator] = path.get('left').get('declarations');
    path.scope?.registerBinding?.(assignment ? 'const' : left.kind, headDeclarator.get('id'), headDeclarator);
    noteRelocation(path, {
      slotOwner: assignment ? path.node : declarator,
      field: assignment ? 'left' : 'id',
      pattern,
      statement: relocated,
      name: refName,
      body: bodyless,
    });
  }

  return {
    buildValue,
    drain,
    drainAssignment,
    drainBodylessDeclaration,
    drainDeclaration,
    drainForInit,
    drainSynthLiterals,
    extractCatchClause,
    extractLoopLeft,
    memoJobValue,
    planMemoArg,
    recordJob,
    removeConsumedProps,
    renderPatternLiteral,
    surfaceInitInfo,
  };
}
