// the drain half of the destructure emitter: the per-host ledger drains that run once over
// the final tree - pattern surgery, memo declarations, residual re-anchoring and the
// literal renders. created per transform over the visit half's shared context
import {
  isBuiltInSurfaceNav,
  isInstanceSurfaceNav,
  isSeFreeMemberReceiver,
  firstPatternProp,
  resolveNestedReceiverBase,
  resolvePassthroughRef,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import { planCatchClauseExtraction } from '@core-js/polyfill-provider/detect-usage/destructure-plan';
import {
  planMemoReadTarget,
  shouldDropRescueReceiver,
  SYMBOL_ITERATOR_PURE_RESULT,
} from '@core-js/polyfill-provider/detect-usage/members';
import {
  discardRescueNodes,
  inlineCallHasObservableEffects,
  navValueCanShortCircuit,
  proxyGlobalMemberCtorPureSwap,
} from '@core-js/polyfill-provider/detect-usage/resolve';

import {
  patternKeepsEffectfulKey,
  arrayWrapperResidualDroppable,
  arrayWrapperResidualTrailingShed,
  patternBindingCount,
  hasRealBinding,
  POSSIBLE_GLOBAL_OBJECTS,
  computedKeyHasSideEffects,
  forOfHeadElements,
  invalidateScopeVarIndex,
  isNonReferencePosition,
  isPristineProxyGlobal,
  isMutatedGlobalSlot,
  mayHaveSideEffects,
  observableSequenceElements,
  receiverCarriesLiveOptional,
  statementListOf,
  unwrapRuntimeExpr,
  peelTransparentExpr,
  subtreeContainsNode,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { walkAstNodes } from './plugin-helpers.js';
import { memberFromKeyName, renderProxyReceiverPlan, replaceNodeInTree } from './emit-shared.js';
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
} from './builders.js';
import {
  renderInstanceDefaultGuard,
  renderStaticDefaultGuard,
  renderSynthSlotRead,
  synthEntryKey,
  synthKeyMustBeComputed,
} from '@core-js/polyfill-provider/render';
import {
  allProxySelectingInit,
  anchorAssignmentResidual,
  anchorLeadingStatement,
  assignmentMemoRef,
  buildMemoArg,
  chainAssignOverPureNav,
  cheaplyRereadableInit,
  collectArrayDeclExtractions,
  sourceSpanCovers,
  groupExtractionBesideResidual,
  discardedSinkSlot,
  carryForInitPrefixIntoFirst,
  drainBodylessAssignment,
  liftSurvivingInitPrefix,
  liftedPrefixStatements,
  liveTailOf,
  drainBodylessMultiMemo,
  drainBodylessWrapKinds,
  drainSequenceAssignments,
  duplicateReceiver,
  emitDeclaratorMemo,
  emitLiteralReceiverMemos,
  emitSentinelGroups,
  exportWrap,
  firstProxyBranch,
  flattenArrayWrapInit,
  foldSinkPrefixIntoResidual,
  forInitMemoVerdicts,
  guardedNavPassthrough,
  guardedPureBinding,
  hopChainKeys,
  insideParamPosition,
  interleavedSeKeySegments,
  isMintedOrProxyName,
  isPureNavReceiver,
  jobOwnedNodes,
  joinSeKeySiblingDeclarator,
  keptSymbolSentinelResidual,
  keptWriteRidesValue,
  liftArrayWrapperPrefixes,
  liftAssignInitPrefix,
  carriedInitPrefix,
  carryInitPrefix,
  literalContainerRescue,
  memoJobBindingTarget,
  orderDeclaratorJobs,
  patternDead,
  patternHasPolyfillableDefault,
  propBindingTarget,
  proxySurfaceIdentifier,
  reanchoredInit,
  renderDiscardedInitProbe,
  renderSealedNavProbe,
  residualPrecedesExtractions,
  retargetSoleHopRestSentinels,
  sealedNavProbeRead,
  seKeySegmentedDeclarators,
  sentinelMemoInitShape,
  spellsSameSource,
  splitMultiDeclaratorHost,
  splitStaticSeKeyAhead,
  substituteProxyRootsInClone,
  trailingSeKeyProps,
  withoutCtorHopJobsWithLiveSiblings,
} from './destructure-helpers.js';
import { cloneStamped, markSubtreeSkipped, nodeSite } from './nav-spine.js';

// the ref a memo route declared for a declarator, so that declarator's OTHER jobs read that one
// rather than minting a name nobody binds. keyed by AST nodes, which are fresh per parse
const memoRefNames = new WeakMap();

// a residual the wrapper KEEPS still sheds its trailing emptied elements - the canon says how many,
// and the literal still evaluates every position they stood in
function shedTrailingHusks({ byDeclarator, dropped, emptiedElements }) {
  for (const [declarator] of byDeclarator) {
    if (dropped.has(declarator) || declarator.id?.type !== 'ArrayPattern') continue;
    const shed = arrayWrapperResidualTrailingShed(declarator.id, emptiedElements.get(declarator) ?? new Set());
    if (shed && shed < declarator.id.elements.length) declarator.id.elements.length -= shed;
  }
}

// does the dispatch's own receiver already carry this harvested effect? the rewrite has moved the
// nodes, so identity alone misses - the source span answers either way round
function dispatchAlreadySpells(spelled, expr) {
  return expr === spelled || subtreeContainsNode(spelled, expr) || subtreeContainsNode(expr, spelled)
    || sourceSpanCovers(spelled, expr) || sourceSpanCovers(expr, spelled);
}

export default function createDestructureDrains(ctx) {
  const {
    adapter,
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
    probeRenderCtx,
    program,
    resolveGlobalPolyfill,
    resolvePropertyObjectType,
    resolveProxyNavReceiver,
    resolvePure,
    resolvedType,
    seqDrainedSlots,
    skippedNodes,
    synthLedger,
    toHint,
  } = ctx;

  // the extracted binding's value: a static / global claim is the import binding itself;
  // an instance claim is the method lookup over the (reusable) receiver. a DEFAULT on the
  // prop keeps native-miss semantics at the top level (`_Symbol === void 0 ? d : _Symbol`,
  // the instance form through a memo ref); a default under the nested flatten drops - the
  // extracted static always wins there, exactly babel's split
  // the PASSTHROUGH render: the resolution consumed the RECEIVER's keys, not the pattern's, so a
  // nested leaf under `prototype` still reads through the pattern's own hops
  // (`({ prototype: { flat: x } } = globalThis.Array)` dispatches on `_globalThis.Array.prototype`,
  // not on the ctor - the ctor spelling bound undefined and threw at the first call). the passthrough
  // exists because the in-place substitution may have been SUPPRESSED for this nav; where the tree
  // shows it DID run (a claim on the leaf rendered its own dispatch), that rewrite is the
  // authoritative spelling and re-rendering would ship the raw member instead
  function proxyNavPassthroughValue({ entry, hintName, kind, chainKeys, proxyNav, liveReceiver, receiverNode, guarded }) {
    const id0 = injectPureImport(entry, hintName);
    const patternHops = passthroughPatternHops(chainKeys);
    // ... and the SURFACE rule is asked here too, of the hops this render is about to spell: an
    // INSTANCE leaf off the object the hops merely REACH is a name match (`{ Array: { keys: k } }`),
    // which every other path keeps native - the nested arm asks it of the receiver's own spelling,
    // and a receiver that resolved as a proxy nav reaches the render through here
    if (kind === 'instance' && entry !== 'get-iterator-method'
      && !passthroughHopsNameSurface(patternHops)) return null;
    function passthroughBase(override) {
      if (override) return identifier(override);
      return liveReceiver && liveReceiver() !== receiverNode ? cloneNode(liveReceiver()) : proxyNav();
    }
    return guarded(override => callExpression(identifier(id0),
      [patternHops.reduce(memberFromKeyName, passthroughBase(override))]));
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
    // the STATIC ponyfill an extraction binds is always defined, so a NESTED leaf's default is dead
    // and the flatten drops it (`{ Array: { from = [] } } = globalThis` binds the pure directly)
    const withDefault = defaulted && !nested;
    // the guard a DEFAULT owes wherever the dispatch spells its own receiver: the pure entry answers
    // `it.method` VERBATIM off a surface that is not the polyfilled one, so it may be undefined and the
    // source's default has to fire (`({ navigator: { flat: c = null } } = globalThis.globalThis)` bound
    // undefined where the source binds null). the flat-depth canon renders exactly this guard
    function guarded(build) {
      if (!defaulted) return build;
      const ref = injector.generateDeclaredRef(metaPath);
      // read `.right` LAZILY, like the guard path below: the walker's later in-place rewrites
      // replace the default THROUGH that slot
      const valueNode = prop.value;
      return override => renderInstanceDefaultGuard({
        assignedRef: identifier(ref),
        call: build(override),
        defaultValue: valueNode.right,
        reread: identifier(ref),
      });
    }
    if (kind === 'instance') {
      let receiver = peelTransparentExpr(receiverNode);
      // a lifted SE prefix leaves the TAIL as the nav (the prefix runs as its own statement) -
      // unless this dispatch CARRIES the init, which means no residual survives to run it
      if (!carriesInit && receiver?.type === 'SequenceExpression') {
        receiver = peelTransparentExpr(receiver.expressions.at(-1));
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
      if (typedHop && chainKeys?.length === 1) {
        const leafId = injectPureImport(entry, hintName);
        const hopId = injectPureImport(typedHop.pure.entry, typedHop.pure.hintName);
        const { defaultHost } = typedHop;
        // a STATIC outer step spells an import binding: always defined and free to re-read, so
        // the static guard canon tests it in place - no memo, and no receiver to dispatch on
        if (typedHop.pure.kind !== 'instance') {
          return () => callExpression(identifier(leafId), [renderStaticDefaultGuard({
            read: identifier(hopId), defaultValue: defaultHost.right, reread: identifier(hopId),
          })]);
        }
        // a CATCH-BORN host cannot hoist a `var` past its own binding: the ref is block-scoped and
        // stands as its own declaration ahead of the extraction, which is what the other leg prints
        const guardRef = memoJoin ? mintRefName() : injector.generateDeclaredRef(metaPath);
        function composedGuard(override) {
          return callExpression(identifier(leafId), [renderInstanceDefaultGuard({
            assignedRef: identifier(guardRef),
            // the LIVE spelling, not the node captured at registration: a claim INSIDE the receiver
            // renders by REPLACING its node, and a copy taken before that carries the source read
            // with its own polyfill lost (`{ at: { name } = {} } = [1, 2].slice()` dropped the
            // `slice` step). the same live read the passthrough arm takes
            call: callExpression(identifier(hopId), [override ? identifier(override)
              : duplicateReceiver(liveReceiver?.() ?? receiverSpelling, injector)]),
            defaultValue: defaultHost.right,
            reread: identifier(guardRef),
          })]);
        }
        if (memoJoin) composedGuard.leadDecl = guardRef;
        return composedGuard;
      }
      // a literal-route receiver was already proved single-read / re-referenceable by the
      // shared canon walk - the nav gate below is for raw declarator inits
      if (literalRoute) {
        const literalId = injectPureImport(entry, hintName);
        // the LIVE spelling where the route offers one: a claim INSIDE the receiver renders by
        // REPLACING its node, and the copy captured at registration carries the source read with
        // its own polyfill lost (`({ at: a } = other.flat())` dropped the `flat` step). the
        // MEMO route already reads live - its `_ref` is built from the rewritten init
        return guarded(override => callExpression(identifier(literalId), [override ? identifier(override)
          : duplicateReceiver(liveReceiver?.() ?? receiverSpelling, injector)]));
      }
      // a pure member nav qualifies like a bare name: the lookup reads it once. a nav off a
      // PROXY-GLOBAL root renders through the canonical passthrough resolution - the pure
      // ctor when one exists (`_Promise`), else the proxy member read (`_globalThis.navigator`) -
      // because the detection may have claimed the nav for the destructure and suppressed the
      // in-place substitution the clone would otherwise carry
      // ... asked WITH the guard context: a receiver wearing a dead chain marker is a provable
      // nav all the same, and the predicate is the one that judges its `?.` (peeling the marker
      // ahead of it would strip the wrapper and leave the hop flags saying the opposite)
      if (!literalRoute && !isPureNavReceiver(receiver, guardCtx)) return null;
      // ... asked WITH the guard context for the same reason: the resolution WALKS the hops, and
      // past a dead marker their `?.` flags are trivia. without it the nav resolved for the flat
      // twin and not for the marked one, and the claim shipped native
      // (`({ Array: { prototype: { flat: c } } } = globalThis?.globalThis)`)
      const proxyNav = resolveProxyNavReceiver(receiver, guardCtx);
      // a DEFAULTED prop over a proxy-global receiver takes the GUARD path below, with the
      // passthrough as its dispatch receiver: the guard reads that receiver exactly once, which
      // is what the source's own read does. leaving it in the residual shipped the claim native,
      // and on a target without the method the source's default won over the ponyfill
      if (proxyNav && (nested || !defaulted)) {
        return proxyNavPassthroughValue({
          entry, hintName, kind, chainKeys, proxyNav, liveReceiver, receiverNode, guarded,
        });
      }
      // a BARE pristine proxy-global receiver substitutes its pure binding: the clone is
      // built after the traversal, so the ordinary identifier claim never reaches it
      // (!nested: hop chains resolve through the passthrough below, keys intact)
      // ... and a bare CTOR receiver substitutes the same way - the resolution already proved
      // the identifier IS that global, and a raw `Map` here reads a binding the engine may
      // not have (`{ [Symbol.iterator]: it } = Map` -> `_getIteratorMethod(_Map)`)
      const barePure = !nested && receiver?.type === 'Identifier'
        && (isPristineProxyGlobal(adapter, receiver.name)
          || (!adapter.getBinding(nodeSite(receiver, metaPath).scope, receiver.name, nodeSite(receiver, metaPath).path)
            && !isMutatedGlobalSlot(adapter, receiver.name)))
        ? resolveGlobalPolyfill(receiver.name) : null;
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
        // the symbol leaf under hop props: its receiver is the RESOLVED hop nav - the pure
        // ctor when one exists (`_Map`), else the proxy member read (`_globalThis.Array`);
        // leading pristine proxy hops are pure navigation into the same surface and drop
        // (`{ self: { [S]: it } } = globalThis` reads `_gim(_globalThis)`)
        if (receiver?.type !== 'Identifier' || !chainKeys?.length) return null;
        // the chain must NAME the instance surface it dispatches on: a leaf off the object the hops
        // merely REACH is a name match (`{ Array: { keys: k } } = globalThis` -> `_keys(_globalThis
        // .Array)`), which the declaration family and the babel leg both keep native. the SYMBOL
        // leaf keeps its own rule above - its receiver IS the hop surface, prototype or not
        // ... but ONLY for a nav INTO that namespace: hops naming a user key resolved the leaf through
        // the receiver's own TYPE, and there the surface question has nothing to judge - `{ y: { at } }
        // = src` dispatches on `src.y`, the read the source performs. that nav is a user object, so
        // the extraction must OWN its read - the shared walk grants `typedNavChain` only when every
        // slot it descends dies with it, leaving no residual to call the same getter a second time
        const navSpelling = chainKeys.reduce(memberFromKeyName, receiver);
        if (entry !== 'get-iterator-method' && !isInstanceSurfaceNav(navSpelling)
          && (isBuiltInSurfaceNav(navSpelling) || !typedNavChain)) return null;
        const ref = resolveNestedReceiverBase({
          rootName: receiver.name,
          keys: chainKeys,
          bound: !!adapter.getBinding(nodeSite(receiver, metaPath).scope, receiver.name, nodeSite(receiver, metaPath).path),
          adapter,
          resolveGlobalPolyfill,
        });
        if (!ref) return null;
        return guarded(() => {
          let base = ref.pure ? identifier(injectPureImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
          for (const key of ref.path) base = memberFromKeyName(base, key);
          // a DEFAULT on the way up folds BOTH arms into the receiver: the slot's own value when it
          // is defined, the default when it is not - one read of the nav, and the default evaluated
          // only where the source evaluates it (mirroring the default alone leaves the live arm raw)
          if (!typedNavChain?.slotDefault) return callExpression(identifier(id), [base]);
          const slotRef = injector.generateDeclaredRef(metaPath);
          return callExpression(identifier(id), [renderInstanceDefaultGuard({
            assignedRef: identifier(slotRef),
            call: base,
            defaultValue: typedNavChain.slotDefault,
            reread: identifier(slotRef),
          })]);
        });
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
        return renderInstanceDefaultGuard({
          assignedRef: identifier(ref),
          call: callExpression(identifier(id), [recv]),
          defaultValue: valueNode.right,
          reread: identifier(ref),
        });
      }
      if (memoJoin) thunk.leadRef = ref;
      return thunk;
    }
    const id = injectPureImport(entry, hintName);
    if (!withDefault) return () => identifier(id);
    const staticValueNode = prop.value;
    return () => renderStaticDefaultGuard({
      read: identifier(id),
      defaultValue: staticValueNode.right,
      reread: identifier(id),
    });
  }

  function recordJob({ hostPath, job }) {
    const key = hostPath.node;
    if (!ledger.has(key)) ledger.set(key, { hostPath, jobs: [] });
    ledger.get(key).jobs.push(job);
  }

  // render one pattern's synth literal over a receiver: polyfilled slots take their import,
  // the rest read through the receiver (its pure proxy import when it has one) - the
  // caller's own value still wins, the literal only serves the defaulted path
  // the one synth prop constructor: the canon's `__proto__` rule rides every entry - the
  // key re-spells as a STRING literal (a bare `[__proto__]` would read a binding)
  function synthProp(key, value, { computed = false } = {}) {
    if (!computed && synthKeyMustBeComputed(key)) {
      return objectProperty(literal('__proto__'), value, { computed: true });
    }
    return objectProperty(key, value, { computed });
  }

  function renderPatternLiteral({
    plan,
    receiver,
    baseName = null,
    baseIsProxy = false,
    passthroughPrefix = null,
    slots,
    requireFullCoverage = false,
    // the RESOLVED key spelling (`from:` for a folded `[k]`) is the nested mirror's canon
    // whether or not coverage is required; the flat routes keep the source spelling
    resolvedSpelling = requireFullCoverage,
    memoBaseName = null,
    instanceReceiver = null,
    metaPath = null,
    sealedProbePlan = null,
  }) {
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
        const symbolPure = resolvePure({
          kind: 'property', object: 'Symbol', key: planEntry.wksSpelling, placement: 'static',
        }, metaPath);
        if (!symbolPure) return null;
        key = identifier(injectPureImport(symbolPure.entry, symbolPure.hintName));
        computed = true;
      }
      // ... and an UNCOVERED `Symbol.iterator` slot reads through the method-lookup helper,
      // the one spelling both emitters print for that read anywhere else - a raw
      // `receiver[_Symbol$iterator]` answers undefined off-engine
      const gimPassthrough = planEntry.wks === 'iterator' && !slots.get(planEntry.dedupKey);
      function slotRead(base) {
        return renderSynthSlotRead({ base, key, computed, lookupKey: planEntry.lookupKey });
      }
      function pushSlot(value) {
        entries.push(synthProp(key, gimPassthrough && value.type === 'MemberExpression'
          ? callExpression(identifier(injectPureImport(SYMBOL_ITERATOR_PURE_RESULT.entry,
            SYMBOL_ITERATOR_PURE_RESULT.hintName)), [value.object])
          : value, { computed }));
      }
      const binding = slots.get(planEntry.dedupKey);
      if (binding) {
        // an INSTANCE slot dispatches on a CLONE of the receiver the literal replaces
        // (`{ at } = [1, 2]` -> `{ at: _atMaybeArray([1, 2]) }`)
        pushSlot(typeof binding === 'string' ? identifier(binding)
          : callExpression(identifier(binding.helper), [cloneNode(binding.receiver)]));
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
          const clone = cloneStamped(receiver);
          substituteProxyRootsInClone(clone, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport });
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
      // serves only a fully-covered pattern
      const passthroughName = baseName ?? (receiver.type === 'Identifier' ? receiver.name : null);
      if (!passthroughName) return null;
      const ref = resolvePassthroughRef({
        keyPath: [...passthroughPrefix ?? [], planEntry.lookupKey],
        receiverName: passthroughName,
        receiverIsProxy: baseIsProxy || POSSIBLE_GLOBAL_OBJECTS.has(passthroughName),
        resolveGlobalPolyfill,
        adapter,
      });
      let base = ref.pure ? identifier(injectPureImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
      // a string-spelled source key reads back computed with the same literal
      // (`"z": Array["z"]`), and a `[k]`-slot passthrough reads through the same computed
      // identifier (`[k]: Array[k]`) - the babel spellings
      for (const hop of ref.path) {
        if (hop === planEntry.lookupKey && (computed || key.type === 'Literal')) {
          base = memberExpression(base, cloneNode(key), { computed: true });
        } else base = memberFromKeyName(base, hop);
      }
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
    const target = plan.pure
      ? identifier(injectPureImport(plan.pure.entry, plan.pure.hintName))
      : renderProxyReceiverPlan(plan.plan, { injectImport: injectPureImport });
    if (!target) return null;
    // the plan's clones detach from the walk before their own claims land: a pristine
    // proxy-global root inside a harvested effect substitutes its pure binding here
    // (`(() => (n++, globalThis))()` -> `(() => (n++, _globalThis))()`)
    substituteClonedProxyRoots(target, metaPath);
    // the harvested se nodes stay LIVE - the keepLive span the registration marks lets
    // their claims land in place during the walk - and the DRAIN clones them, so the memo
    // argument carries the rewritten spelling instead of a pre-claim snapshot (a
    // registration-time clone froze `getObj().at(0)` raw and dropped the claim)
    return { prefix: plan.prefix, liveSe: plan.se, target, tail: plan.tail };
  }

  function substituteClonedProxyRoots(root, metaPath) {
    walkAstNodes({
      root,
      visit(node, parent) {
        if (node.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(node.name)) return;
        if (parent && isNonReferencePosition(parent, node)) return;
        if (!isPristineProxyGlobal(adapter, node.name) || adapter.getBinding(metaPath.scope, node.name, metaPath)) return;
        const pure = resolveGlobalPolyfill(node.name);
        if (pure) node.name = injectPureImport(pure.entry, pure.hintName);
      },
    });
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
    const flatLiteral = renderPatternLiteral({ plan, receiver, slots });
    if (!flatLiteral) return false;
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
    for (const node of rescue) {
      substituteProxyRootsInClone(node, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport });
    }
    const resolved = rescue.length ? sequenceExpression([...rescue, flatLiteral]) : flatLiteral;
    if (replaceNodeInTree(program, receiver, resolved)) {
      markRewrite();
      markSubtreeSkipped(skippedNodes, receiver);
    }
    return true;
  }

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
        const memoName = pending.memoName ?? mintRefName();
        const synthLiteral = renderPatternLiteral({ plan, receiver, slots, memoBaseName: memoName });
        if (!synthLiteral) continue;
        const iife = callExpression({
          type: 'FunctionExpression', id: null, params: [identifier(memoName)], generator: false, async: false,
          body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: synthLiteral }] },
        }, [buildMemoArg(pending)]);
        if (replaceNodeInTree(program, receiver, iife)) markRewrite();
        continue;
      }
      // merged nested mirrors: one literal per subtree, wrapped up its own hop chain and
      // joined at the top level - rendered only when every outer hop prop registered
      if (pending.nestedTrees) {
        const [{ outerPattern }] = pending.nestedTrees;
        if (outerPattern && outerPattern.properties.length > 1
          && pending.nestedTrees.length !== outerPattern.properties.length) continue;
        const topProps = [];
        for (const tree of pending.nestedTrees) {
          let sub = renderPatternLiteral({
            plan: tree.plan, receiver, slots: tree.slots, passthroughPrefix: tree.chainKeys, resolvedSpelling: true,
          });
          if (!sub) {
            topProps.length = 0;
            break;
          }
          for (const key of tree.chainKeys.slice(1).toReversed()) {
            sub = objectExpression([objectProperty(identifier(key), sub)]);
          }
          topProps.push(objectProperty(identifier(tree.chainKeys[0]), sub));
        }
        if (!topProps.length) continue;
        const renderedTree = objectExpression(topProps);
        const consumedBranch = receiver;
        if (replaceNodeInTree(program, receiver, renderedTree)) {
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
      });
      if (!rendered) continue;
      // a SEALED receiver read is observable - the source paren ends the chain, so the read past
      // it throws off-engine where the swapped literal just answers. it re-emits as a discarded
      // throw probe ahead of the literal, which is the source's own spelling of what the swap erases
      const sealedProbe = pending.sealedProbePlan
        ? renderSealedNavProbe(pending.sealedProbePlan, pending.metaPath, probeRenderCtx)
        : sealedNavProbeRead(receiver, pending.metaPath, probeRenderCtx);
      if (sealedProbe) rendered = sequenceExpression([sealedProbe, rendered]);
      // a collapsed logical re-runs its left sequence prefix ahead of the literal
      if (leadingEffects) rendered = sequenceExpression([...leadingEffects.expressions.slice(0, -1), rendered]);
      const consumed = receiver;
      if (replaceNodeInTree(program, receiver, rendered)) {
        markRewrite();
        markSubtreeSkipped(skippedNodes, consumed);
      }
    }
    synthLedger.clear();
    pendingBranchSynths.clear();
  }

  function drain() {
    drainSynthLiterals();
    const { owned: jobDeclarators, hostSiblings: jobHostSiblings } = jobOwnedNodes(ledger);
    for (const [host, options] of hopHosts) {
      // every note here speaks for a host the extraction never entered - one that did has
      // its own residual shape (and its own drain, which would emit a second statement
      // beside this one); babel anchors only what it consumed
      if (jobDeclarators.has(host)) continue;
      // an ASSIGNMENT host holds the same shape under different field names - the re-anchor
      // reads a view of it and the result writes back
      if (!options.assignHost) {
        if (reanchorSoleCtorHopResidual(host, options) && !jobHostSiblings.has(host)) {
          splitMultiDeclaratorHost({ program, declarator: host, markRewrite });
        }
        continue;
      }
      const view = { id: host.left, init: host.right };
      // the prefix a lift may take is the SOURCE's own sequence: a kept-write re-read the
      // re-anchor synthesises stays INSIDE the assignment, where the value it stored is what
      // the pattern reads (`({ cr } = (q2 = _globalThis, _globalThis))`). asked before the
      // re-anchor rewrites the init - after it, the two spellings are the same node type
      const sourceSeqInit = peelTransparentExpr(host.right)?.type === 'SequenceExpression';
      if (reanchorSoleCtorHopResidual(view, options)) {
        host.left = view.id;
        host.right = view.init;
        if (sourceSeqInit) liftAssignInitPrefix(host, options.metaPath, program);
      }
    }
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
        if (drainBodylessWrapKinds({ kind, kindJobs, hostNode, declNode },
          { program, drainArrayDeclaration, consumedAssignmentRemains })) continue;
        // the two kinds that bind a MINTED name and read it in the statement after: the element
        // slot rename and the long-hand flat shape. both own their placement, so the table stops here
        if (drainMintedPairKinds({ kind, hostNode, declNode, hostPath, jobs: kindJobs })) continue;
        const body = statementListOf(hostPath.parentPath?.node);
        if (!body) continue;
        const at = body.indexOf(hostNode);
        if (at === -1) continue;
        switch (kind) {
          case 'assign-overwrite':
            drainAssignOverwrite({ body, at, jobs: kindJobs });
            break;
          case 'array-decl':
            drainArrayDeclaration({ hostNode: declNode, body, at, jobs: kindJobs });
            break;
          case 'positional-element':
            drainPositionalElement({ hostNode, body, at, jobs: kindJobs });
            break;
          case 'positional-assign':
            drainPositionalAssign({ hostNode, body, at, jobs: kindJobs });
            break;
          case 'array-assign':
            drainArrayAssignment({ body, at, jobs: kindJobs });
            break;
          case 'declaration':
            drainDeclaration({ hostNode: declNode, body, at, jobs: kindJobs });
            break;
          default: drainAssignment({ hostNode, body, at, jobs: kindJobs });
        }
      }
    }
    ledger.clear();
  }

  // the opaque / effect-bearing init, consumed whole. two spellings, babel's split:
  // a group that READS the receiver (an instance / symbol extraction) memoizes the whole
  // init (`const _ref = (eff(), X); const it = _getIteratorMethod(_ref); ...`); a
  // static-only group LIFTS the init's observables as statements and drops the pure tail
  // (`(class {...}); var from = _Array$from;`). partial consumption drops the jobs and the
  // source stays raw
  // one declarator's opaque-init memo emission into the caller's statement sink; returns
  // 'consumed' when the declarator dissolved, true when statements landed with a residual,
  // false when nothing applied
  // the ctor-pattern re-anchor arm of the memo declarator, extracted for its size
  function emitCtorPatternReanchor({ hostNode, declarator, soleJob, rescues, statements, exported }) {
    // a pristine proxy KEY peels - the inner pattern reads the (already substituted)
    // surface init whole (`{ navigator: nav } = (eff(), _globalThis)`); a ctor key
    // anchors on its pure with the rescues riding the init seq
    if (POSSIBLE_GLOBAL_OBJECTS.has(soleJob.hintName) && isPristineProxyGlobal(adapter, soleJob.hintName)) {
      statements.push(exportWrap(variableDeclaration(hostNode.kind,
        [variableDeclarator(soleJob.prop.value, declarator.init)]), exported));
      markSubtreeSkipped(skippedNodes, soleJob.prop.key);
      return 'consumed';
    }
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

  // one extracted binding's VALUE off the whole-init memo. a DEFAULTED prop keeps
  // native-miss semantics through the guard ternary; a STATIC re-reads its import
  // directly (`_Array$from === void 0 ? [] : _Array$from`), an instance dispatch
  // memoizes through a ref
  function memoJobValue({ job, refName, guardRefs }) {
    const id = injectPureImport(job.entry, job.hintName);
    // a CHAINED instance job dispatches on the surface its hops NAME, read off the memo the init
    // holds (`const _ref = (eff(), _globalThis); const a = _flat(_ref.Array.prototype)`)
    let value = job.kind === 'instance'
      ? callExpression(identifier(id), [job.chain?.length
        ? hopChainKeys(job.chain).reduce(memberFromKeyName, identifier(refName))
        : identifier(refName)])
      : identifier(id);
    // the collapsed symbol leaf dispatches on what the extraction just built
    if (job.collapseLeaf) {
      value = callExpression(
        identifier(injectPureImport(job.collapseLeaf.instanceEntry, job.collapseLeaf.instanceHint)), [value]);
    }
    if (job.prop.value?.type !== 'AssignmentPattern') return value;
    if (job.kind === 'instance') {
      const guardRef = guardRefs.get(job) ?? injector.generateDeclaredRef(job.metaPath);
      return renderInstanceDefaultGuard({
        assignedRef: identifier(guardRef),
        call: value,
        defaultValue: job.prop.value.right,
        reread: identifier(guardRef),
      });
    }
    return renderStaticDefaultGuard({
      read: identifier(id),
      defaultValue: job.prop.value.right,
      reread: identifier(id),
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
    const rescues = consumeProbe ? [] : discardRescueNodes({
      node: declarator.init,
      scope: metaPath.scope,
      adapter,
      path: metaPath,
    });
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
        && !adapter.getBinding(metaPath.scope, value.name, metaPath)?.node;
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
      rescues.push(spliced.length > 1 ? sequenceExpression(spliced) : spliced[0]);
    } else if (seqWriteRoot || buriedKeyInit || seqClaimInit || keptWriteRootAhead
      || (spineRoot?.type === 'CallExpression' && !erasableCall)) {
      // the whole read re-emits verbatim, so every effect harvested out of it rides inside
      // it already - keeping both would run them twice
      rescues.length = 0;
      rescues.push(declarator.init);
    }
    // a full consume DISCARDS the read the source performs: a receiver ending in a
    // resolvable CTOR off a proxy surface re-emits that read as a THROW PROBE on its own
    // binding (`const { iterator } = f().self.Symbol` keeps `_Symbol;`), which is what
    // preserves the native throw on an absent host
    if (!rescues.length && !consumeProbe) {
      // the walk already collapsed the receiver nav onto its pure BINDING: the full consume
      // discards that read, so it re-emits as a throw probe of its own (`const { iterator }
      // = f().self.Symbol` keeps `_Symbol;`) - what preserves the native throw off-host
      const collapsedInit = declJobs.some(job => job.callRootedInit) ? peelTransparentExpr(declarator.init) : null;
      // the probe is the whole collapsed READ: a bare binding (`_Symbol`) or a member off
      // one (`_self.Array` - the ctor has no pure entry of its own)
      let collapsedRoot = collapsedInit;
      while (collapsedRoot?.type === 'MemberExpression') collapsedRoot = peelTransparentExpr(collapsedRoot.object);
      const minted = collapsedRoot?.type === 'Identifier'
        && [...injectorState?.pureImports ?? []].some(([, name]) => name === collapsedRoot.name);
      if (minted) rescues.push(collapsedInit);
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
      const init = peelTransparentExpr(initNode);
      if (init?.type !== 'MemberExpression' || !write || write.type !== 'AssignmentExpression') return null;
      for (let probe = peelTransparentExpr(init.object); probe; probe = peelTransparentExpr(probe.object)) {
        if (probe === write) return init;
        if (probe.type !== 'MemberExpression') return null;
      }
      return null;
    }

    // a KEPT WRITE of a pure NAV rides the first extraction's own seq (`const from =
    // (a = _globalThis, _Array$from)` - babel's rescue slot); every other effect,
    // fallback writes included, lifts ahead - joined into ONE comma statement
    // (`x++, y++;`, babel's lift spelling)
    const liftedRescues = [];
    for (const rescue of rescues) {
      const rescueAssign = peelTransparentExpr(rescue);
      // an EFFECT-BEARING call that IS the discarded receiver rides the extraction's own
      // sequence prefix (`const from = (IIFE(), _Array$from)`, babel's inject shape); a
      // fragment of the init, a kept READ over the call, and a call whose body proves pure
      // (the statement is all that survives of it) stay statements of their own
      // ... and a KEY effect buried in a CHAINED consume's spine rides too: the source ran it
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
      const readOverWrite = spellableStore ? discardedReadOverWrite(declarator.init, rescueAssign) : null;
      // ... and only where the extraction READS THROUGH the stored value: a property binding the
      // ponyfill itself (`{ Map: M }` extracts `_Map`) reads nothing off the store, so the write is
      // a statement of its own - the shape the babel leg spells for the same source
      const ridesTheValue = (!readOverWrite && spellableStore && declJobs.some(job => job.kind !== 'global'))
        || (rescueAssign?.type === 'CallExpression' && rescueAssign === peelTransparentExpr(declarator.init)
          && inlineCallHasObservableEffects({
            callNode: rescueAssign,
            scope: metaPath.scope,
            adapter,
            path: metaPath,
          }))
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

  function emitMemoDeclarator({ hostNode, declarator, declJobs, statements, exported }) {
    const consumed = new Set(declJobs.map(job => job.prop));
    // full consumption reaches through hop levels: a hop prop counts consumed when its
    // nested pattern does
    function patternFullyConsumed(patternNode) {
      return patternNode.properties.every(item => consumed.has(item)
        || (item.type === 'Property' && !item.computed && item.value?.type === 'ObjectPattern'
          && patternFullyConsumed(item.value)));
    }
    if (!patternFullyConsumed(declarator.id)) {
      return emitPartialMemo({ hostNode, declarator, declJobs, consumed, statements, exported });
    }
    const needsValue = declJobs.some(job => job.kind === 'instance');
    let refName = null;
    const seqRescues = [];
    // a chain-assignment init with a pure-nav RHS inlines: the assignment rescues as the
    // extraction's own prefix and the read runs on the RHS value directly
    // (`{ [S]: it } = (g = globalThis)` -> `const it = (g = _globalThis, _gim(_globalThis))`)
    const chainAssignInline = needsValue && declJobs.length === 1
      ? chainAssignOverPureNav(declarator.init) : null;
    if (chainAssignInline) {
      const [job] = declJobs;
      const id = injectPureImport(job.entry, job.hintName);
      const read = callExpression(identifier(id), [cloneNode(peelTransparentExpr(chainAssignInline.right))]);
      statements.push(exportWrap(variableDeclaration(hostNode.kind, [variableDeclarator(
        memoJobBindingTarget(job), sequenceExpression([chainAssignInline, read]))]), exported));
      markSubtreeSkipped(skippedNodes, job.prop);
      return 'consumed';
    }
    // a SOLE instance extraction reads the init exactly once inside its dispatch, so it
    // inlines with no memo slot (`const at = _atMaybeArray((foo(), [1]))`, babel's inline
    // consume) - the memo exists for the SECOND read, and there is none
    // ... and a SYMBOL-pattern value is that same single read: the extracted pattern binds off
    // the helper result, so the receiver rides inside the dispatch with no memo of its own.
    // a COLLAPSED leaf is not that shape - its dispatch reads the memo, like the plain route's
    if (needsValue && declJobs.length === 1 && !declJobs[0].collapseLeaf
      && (declJobs[0].prop.value?.type !== 'ObjectPattern' || declJobs[0].symbolPattern)) {
      const [job] = declJobs;
      const id = injectPureImport(job.entry, job.hintName);
      const dispatch = callExpression(identifier(id), [duplicateReceiver(declarator.init, injector)]);
      statements.push(exportWrap(variableDeclaration(hostNode.kind,
        [variableDeclarator(memoJobBindingTarget(job), dispatch)]), exported));
      markSubtreeSkipped(skippedNodes, job.prop);
      return 'consumed';
    }
    // an SE-prefixed re-readable receiver needs no memo of its own: the prefix lifts as its
    // own statements and the tail IS the token every extraction reads (`(se(), globalThis)`
    // -> `se(); const it = _gim(_globalThis)`, babel's lift)
    const seqInit = peelTransparentExpr(declarator.init);
    const seqTail = seqInit?.type === 'SequenceExpression' ? peelTransparentExpr(seqInit.expressions.at(-1)) : null;
    // ... but only a token the emitter itself MINTED: a source identifier may be shadowed or
    // rebound between the lifted statement and the read, so its residual keeps the memo
    if (needsValue && seqTail?.type === 'Identifier' && isMintedOrProxyName(seqTail.name, injectorState)) {
      for (const expr of seqInit.expressions.slice(0, -1)) statements.push(expressionStatement(expr));
      declarator.init = seqInit.expressions.at(-1);
      refName = seqTail.name;
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
      if (declJobs[0].prop.value?.type === 'AssignmentPattern') {
        guardRefs.set(declJobs[0], injector.generateDeclaredRef(declJobs[0].metaPath));
      }
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
    for (const job of declJobs) {
      let value = memoJobValue({ job, refName, guardRefs });
      if (seqRescues.length || (probePrefix && job === declJobs[0])) {
        value = sequenceExpression([...seqRescues.map(expr => cloneNode(expr)),
          ...probePrefix && job === declJobs[0] ? [probePrefix] : [], value]);
        seqRescues.length = 0;
      }
      statements.push(exportWrap(variableDeclaration(hostNode.kind,
        [variableDeclarator(memoJobBindingTarget(job), value)]), exported));
      markSubtreeSkipped(skippedNodes, job.prop);
    }
    return keptSymbolSentinelResidual(declarator, declJobs, refName, mintUnusedName) ? true : 'consumed';
  }

  // array-wrapped extraction: leaf sentinels keep the structure; a declarator left with no
  // real binding drops whole, its init's observables lifted as statements
  // the POSITIONAL element slot: rename the element the claim sits in to its minted binding and
  // bind the claim off that name right after the declaration. the declaration keeps its init and
  // its ITERATION - this drain discards nothing, so a spread ahead of the element, an opaque init
  // or a live sibling element all ride through untouched (the babel twin renders the same pair)
  function drainMintedPairKinds({ kind, hostNode, declNode, hostPath, jobs }) {
    if (kind === 'positional-element') drainPositionalHost({ hostNode, declNode, hostPath, jobs });
    else if (kind === 'flatten-leaf') drainFlattenLeaf({ hostNode, hostPath, jobs });
    else return false;
    return true;
  }

  // the long-hand flat shape: the declarator takes the LEAF pattern and reads it off a memo of the
  // hop, so the dispatch and the surviving residual share one read (`{ y: { at, other } } = box` ->
  // `const _ref = box.y; const at = _at(_ref); const { other } = _ref;`) - the shape this emitter
  // already prints when the source writes the twin directly
  // the residual half of the flatten, run only once the pair has a PLACE: the claims may take the
  // leaf whole, and then the rewritten declarator binds nothing and leaves with the pattern, the
  // memo alone carrying the read the source performed. rewriting ahead of the placement leaves a
  // half-transformed declarator behind whenever the place turns out not to exist
  function rewriteFlattenResidual(job, kept, jobs) {
    for (const item of jobs) markSubtreeSkipped(item.prop);
    // under a WRAPPER the residual is the declaration itself: the element takes the memo and the
    // pattern the source wrote becomes its flat twin, so the pairing routes read it as one
    if (job.wrapperNode) {
      // a TRAILING twin leaves the element as the source spelled it, so the pattern empties to
      // coerce it and whatever the claims did not take reads the MEMO instead - in a declaration of
      // its own below, never in the wrapper pattern, where it would read off the ELEMENT
      if (job.trailResidual) {
        job.hostPatternNode.properties = [];
        return;
      }
      job.wrapperNode.elements[job.elementIndex] = identifier(job.refName);
      job.hostPatternNode.properties = kept;
      return;
    }
    if (!kept.length) return;
    job.leafPattern.properties = kept;
    job.declaratorNode.id = job.leafPattern;
    job.declaratorNode.init = identifier(job.refName);
  }

  function drainFlattenLeaf({ hostNode, hostPath, jobs }) {
    const [job] = jobs;
    // a claimed prop whose KEY carries an effect does NOT leave with its claim: the effect runs
    // where the source wrote it, so the prop stays and its binding retires to a sentinel - the
    // same shape the flat channel prints for such a key
    // a REST in the leaf gathers what the pattern did not name, so the claim's key has to STAY there
    // (renamed) to keep excluding itself - the same rule the flat channel spells one level up
    const leafHasRest = job.leafPattern.properties.some(item => item.type !== 'Property');
    const kept = job.leafPattern.properties.filter(item => jobs.every(other => other.prop !== item)
      || leafHasRest || (item.type === 'Property' && computedKeyHasSideEffects(item)));
    for (const item of kept) {
      if (jobs.some(other => other.prop === item)) item.value = identifier(mintUnusedName());
    }
    const { kind } = job.declarationNode;
    const memo = variableDeclarator(identifier(job.refName), job.navNode);
    const claims = jobs.map(item => variableDeclarator(identifier(item.local), item.value));
    // a LOOP HEAD hosts declarators, not statements: the pair joins the head ahead of the residual,
    // where declarator order alone binds the memo before the claims read it
    if (job.forInit) {
      const head = job.declarationNode.declarations;
      const at = head.indexOf(job.declaratorNode);
      if (at === -1) return;
      rewriteFlattenResidual(job, kept, jobs);
      head.splice(at, kept.length ? 0 : 1, memo, ...claims);
      markRewrite(hostNode);
      return;
    }
    // ... every other slot takes STATEMENTS, one declarator each: the memo binds nothing the source
    // named, so it is `const` whatever the host declares, while a claim carries the source's own
    // binding and keeps its kind
    const statements = [variableDeclaration('const', [memo]),
      ...claims.map(claim => variableDeclaration(kind, [claim]))];
    if (!job.wrapperNode && kept.length) statements.push(variableDeclaration(kind, [job.declaratorNode]));
    // ... and the TRAILING twin spells that survivor itself: the wrapper's own declarator holds the
    // literal and stays, so what is kept takes a declarator of its own off the memo
    if (job.wrapperNode && job.trailResidual && kept.length) {
      job.leafPattern.properties = kept;
      statements.push(variableDeclaration(kind, [variableDeclarator(job.leafPattern, identifier(job.refName))]));
    }
    // an unbraced control slot holds ONE statement and this route emits several - brace it
    if (job.bodylessWrap) {
      rewriteFlattenResidual(job, kept, jobs);
      replaceNodeInTree(program, hostNode, { type: 'BlockStatement', body: statements });
      markRewrite(hostNode);
      return;
    }
    const body = statementListOf(hostPath.parentPath?.node);
    // the statement this job was recorded against may be GONE: a sibling declarator another route
    // rewrote can have carried the declaration into a shape of its own, and the DECLARATOR is what
    // survives that - so the pair is placed against whatever statement now holds it
    let at = body ? body.indexOf(hostNode) : -1;
    let declarators = job.declarationNode.declarations;
    if (at === -1 && body) {
      at = body.findIndex(statement => (statement.type === 'ExportNamedDeclaration'
        ? statement.declaration : statement)?.declarations?.includes(job.declaratorNode));
      if (at !== -1) declarators = (body[at].type === 'ExportNamedDeclaration'
        ? body[at].declaration : body[at]).declarations;
    }
    if (at === -1) return;
    rewriteFlattenResidual(job, kept, jobs);
    // a SIBLING declarator keeps the declaration NODE alive: another route may be rewriting one of
    // those siblings off this very node, and replacing it wholesale drains that rewrite onto a tree
    // nobody holds any more. so the claim's own declarator LEAVES the list and its pair stands
    // beside the declaration - ahead of it when the declarator led, after it when it trailed, which
    // is the order the source wrote and the shape the babel twin's split prints
    // a wrapper residual STAYS - it holds the literal - so the pair only joins the body ahead of it,
    // unless the claims took the leaf WHOLE: what is left then binds nothing and reads the memo the
    // pair already evaluated, so it goes with them (the babel twin drops it the same way). only OUR
    // declarator goes: a SIBLING in the same declaration still binds, and taking the statement
    // would take it too
    if (job.wrapperNode) {
      // ... and only where the declarator binds NOTHING else: a neighbour ELEMENT of the same
      // wrapper still binds (`[{ at, findLast }, zn] = [nb.y, 7]` keeps `zn`), so there the
      // emptied pattern stays and reads the memo like the babel twin's does
      // a TRAILING residual holding EFFECTS stays - it is what evaluates the literal the effect
      // stands in, and dropping it would take that effect with it. one that holds none goes, memo
      // and all: the memo reads through the same element, so it performs the coercion the emptied
      // pattern would. and it MUST go - a declarator binding nothing beside one that binds is a
      // shape `@babel/plugin-transform-destructuring` lowers wrong, dropping the sibling's binding
      // a TRAILING residual empties WHOLE - whatever the claims did not take reads the memo below -
      // so what decides its fate is only the literal's own effects
      const residualDropped = (job.trailResidual ? !mayHaveSideEffects(job.wrapperNode) : !kept.length)
        && !hasRealBinding(job.declaratorNode.id, new Set());
      let residualGone = false;
      if (residualDropped) {
        if (declarators.length > 1) declarators.splice(declarators.indexOf(job.declaratorNode), 1);
        else {
          body.splice(at, 1);
          residualGone = true;
        }
      }
      // ... and a TRAILING twin goes AFTER whatever residual survived: the literal builds whole
      // first, which is where the source performs the read the memo now holds
      const into = job.trailResidual && !residualGone ? at + 1 : at;
      body.splice(Math.min(into, body.length), 0, ...statements);
    } else if (declarators.length > 1) {
      const index = declarators.indexOf(job.declaratorNode);
      if (index === -1) return;
      declarators.splice(index, 1);
      body.splice(index === 0 ? at : at + 1, 0, ...statements);
    } else body.splice(at, 1, ...statements);
    markRewrite(hostNode);
  }

  // the slot rename itself: the element takes the minted name and the shape it held is quarantined
  // (its props already fired their metas). returns false where the pattern moved on without it
  function renamePositionalSlot(job) {
    // the hop PROPERTY holds the slot where a rest sibling kept it in the pattern; everywhere else
    // it is an array element, found by identity because the pattern may have moved since
    if (job.hopPropNode) {
      if (job.hopPropNode.value !== job.slotNode) return false;
      job.hopPropNode.value = identifier(job.refName);
      markSubtreeSkipped(job.slotNode);
      return true;
    }
    const slotAt = job.arrayPattern.elements.indexOf(job.slotNode);
    if (slotAt === -1) return false;
    job.arrayPattern.elements[slotAt] = identifier(job.refName);
    markSubtreeSkipped(job.slotNode);
    return true;
  }

  // the three placements the pair takes, by the slot its host stands in: an unbraced control slot
  // gets BRACED around the pair, a LOOP HEAD takes it as DECLARATORS (they evaluate in order, so
  // the minted name is bound before the claim reads it), and a statement list takes the extraction
  // after the declaration - found by DECLARATOR identity, since a flatten sibling in the same
  // declaration may have split the statement the job was recorded against
  function drainPositionalHost({ hostNode, declNode, hostPath, jobs }) {
    if (jobs[0]?.bodylessWrap) {
      const synthetic = [declNode];
      drainPositionalElement({ hostNode: declNode, body: synthetic, at: 0, jobs });
      if (synthetic.length > 1) {
        replaceNodeInTree(program, declNode, { type: 'BlockStatement', body: synthetic });
      }
      return;
    }
    if (jobs[0]?.forInit) {
      for (const job of jobs) {
        if (!renamePositionalSlot(job)) continue;
        const head = job.declarationNode.declarations;
        head.splice(head.indexOf(job.declaratorNode) + 1, 0,
          variableDeclarator(identifier(job.local), job.value));
      }
      markRewrite(hostNode);
      return;
    }
    const body = statementListOf(hostPath.parentPath?.node);
    if (!body) return;
    let at = body.indexOf(hostNode);
    if (at === -1) {
      at = body.findIndex(statement => (statement.type === 'ExportNamedDeclaration'
        ? statement.declaration : statement)?.declarations?.includes(jobs[0].declaratorNode));
    }
    if (at !== -1) drainPositionalElement({ hostNode: body[at], body, at, jobs });
  }

  function drainPositionalElement({ hostNode, body, at, jobs }) {
    const statements = [];
    const residuals = [];
    for (const job of jobs) {
      if (!renamePositionalSlot(job)) continue;
      const declaration = hostNode.type === 'ExportNamedDeclaration' ? hostNode.declaration : hostNode;
      const kind = declaration.kind ?? job.declarationNode.kind;
      // a REST in the dropped pattern gathers what that pattern did not name, so the pattern itself
      // survives - reading the minted name, with the claim's key renamed to a sentinel so it goes on
      // excluding itself. renamed FIRST, so the count below sees what the residual really binds
      job.prop.value = identifier(mintUnusedName());
      job.prop.shorthand = false;
      const residualBinds = patternBindingCount(job.slotNode) > 1;
      // a hop between the element and the claim is read ONCE, into a memo both sides take: the
      // dispatch's argument and the residual's root. re-emitting the element pattern instead would
      // read every hop key a second time, running a getter the source runs once
      // the OUTER levels bind their own slots, so each reads the value ITS level reads - the order
      // the source's nesting spells, and the babel twin's own emission
      const outer = (job.levels ?? []).slice(0, -1);
      const outerBinds = outer.some(level => level.before.length || level.after.length);
      const hopName = (residualBinds || outerBinds) && job.hopKeys?.length ? mintRefName() : null;
      const trailing = [];
      if (hopName && outerBinds) {
        let root = job.refName;
        for (const [index, level] of outer.entries()) {
          if (level.before.length) {
            statements.push(variableDeclaration(kind, [variableDeclarator(
              { type: 'ObjectPattern', properties: level.before }, identifier(root))]));
          }
          const next = index === outer.length - 1 ? hopName : mintRefName();
          statements.push(variableDeclaration(kind, [variableDeclarator(identifier(next),
            memberFromKeyName(identifier(root), job.hopKeys[index]))]));
          if (level.after.length) {
            trailing.unshift(variableDeclaration(kind, [variableDeclarator(
              { type: 'ObjectPattern', properties: level.after }, identifier(root))]));
          }
          root = next;
        }
      } else if (hopName) {
        statements.push(variableDeclaration(kind, [variableDeclarator(identifier(hopName),
          job.hopKeys.reduce(memberFromKeyName, identifier(job.refName)))]));
      }
      statements.push(variableDeclaration(kind, [variableDeclarator(identifier(job.local),
        hopName ? { ...job.value, arguments: [identifier(hopName)] } : job.value)]));
      // ... and the residual is NEVER export-wrapped: an exported host keeps its source names through
      // the specifier list below, and exporting the residual too declares the same name twice
      if (residualBinds) {
        residuals.push(variableDeclaration(kind, [variableDeclarator(
          hopName ? job.claimPatternNode : job.slotNode, identifier(hopName ?? job.refName))]));
      }
      residuals.push(...trailing);
    }
    if (!statements.length) return;
    // an exported host drops its wrapper: the extraction is what carries the export the source
    // wrote, and the residual declaration binds only the minted name
    if (jobs[0].exported) {
      const siblings = jobs[0].exportedSiblings ?? [];
      body.splice(at, 1, jobs[0].declarationNode, ...statements.map(statement => exportWrap(statement, true)), ...residuals,
        ...siblings.length ? [{
          type: 'ExportNamedDeclaration',
          declaration: null,
          specifiers: siblings.map(name => ({
            type: 'ExportSpecifier',
            local: identifier(name),
            exported: identifier(name),
          })),
          source: null,
          attributes: [],
        }] : []);
    } else body.splice(at + 1, 0, ...statements, ...residuals);
    markRewrite(hostNode);
  }

  // the ASSIGNMENT twin of the drain above: no declaration to carry the pair, so the claim's binding
  // takes an ordinary write after the statement and the minted name rides its hoisted `var`
  function drainPositionalAssign({ hostNode, body, at, jobs }) {
    const statements = [];
    for (const job of jobs) {
      if (!renamePositionalSlot(job)) continue;
      statements.push(expressionStatement(assignmentExpression('=', identifier(job.local), job.value)));
    }
    if (!statements.length) return;
    body.splice(at + 1, 0, ...statements);
    markRewrite(hostNode);
  }

  function drainArrayDeclaration({ hostNode, body, at, jobs }) {
    const sentinelNames = new Set();
    const byDeclarator = new Map();
    const extracted = [];
    const { memoStatements, emptiedElements } = arrayDeclPreamble({ hostNode, jobs });
    collectArrayDeclExtractions({ hostNode, jobs, sentinelNames, byDeclarator, extracted },
      { probeRenderCtx, mintUnusedName, removeConsumedProps, markSubtreeSkipped, skippedNodes });
    const dropped = new Set();
    let carriedWrites = false;
    const rescueExprs = [];
    const rescueStatements = [];
    for (const [declarator, job] of byDeclarator) {
      if (hasRealBinding(declarator.id, sentinelNames)) {
        rescueStatements.push(...observableSequenceElements(liftArrayWrapperPrefixes(declarator))
          .map(expr => expressionStatement(expr)));
        continue;
      }
      // an element this drain did NOT claim still coerces its own value, and nothing else repeats
      // that (`const [{}, { at }] = [x, arr]` throws on a nullish `x` with or without the claim),
      // so the wrapper leaves only when every element is a hole or one of ours
      if (!arrayWrapperResidualDroppable(declarator.id, emptiedElements.get(declarator) ?? new Set())) continue;
      // ... and a MULTI-element wrapper needs every claim on it to READ its element: a receiver-less
      // static reads nothing, which leaves the residual as the only reader of that element's key
      if ((declarator.id.elements ?? declarator.id.properties).length > 1
        && jobs.some(item => item.declarator === declarator && item.kind !== 'instance')) continue;
      // ... and so does one whose KEPT key still carries an effect: native runs the key
      // once, and dropping the skeleton would erase it
      // (`[{ [(log.push("e"), "from")]: _unused }] = [Array]` keeps its residual)
      if (patternKeepsEffectfulKey(declarator.id)) continue;
      dropped.add(declarator);
      // a FLAT extraction absorbs its discarded-init effects as a sequence prefix
      // (`const from = (IIFE(), _Array$from);`); the nested flatten lifts them as
      // statements ahead (`sideEffect(); const from = _Array$from;`), babel's split
      // ... and a nested one whose receiver IS that call absorbs it the same way (the sole
      // wrapped element is the read, not an effect running ahead of it)
      const soleElement = declarator.init?.type === 'ArrayExpression' && declarator.init.elements.length === 1
        ? peelTransparentExpr(declarator.init.elements[0]) : null;
      function rescueLift(rescueNode) {
        // a rescued sequence whose tail is a pure nav lifts only its prefixes - the tail
        // was the discarded receiver itself
        const peeled = peelTransparentExpr(rescueNode);
        if (peeled?.type === 'SequenceExpression' && isPureNavReceiver(peeled.expressions.at(-1))) {
          return peeled.expressions.slice(0, -1);
        }
        // ... and a sequence whose tail is another discarded ARRAY WRAPPER is one more level
        // of the same flatten: its own buried effects lift too, in source order
        // (`(m(), [(i(), R)])` -> `m(); i();`)
        if (peeled?.type === 'SequenceExpression'
          && peelTransparentExpr(peeled.expressions.at(-1))?.type === 'ArrayExpression') {
          return [...peeled.expressions.slice(0, -1), ...discardRescueNodes({
            node: peelTransparentExpr(peeled.expressions.at(-1)), scope: job.metaPath.scope, adapter, path: job.metaPath,
          }).flatMap(rescueLift)];
        }
        // a rescued MEMBER read off a kept write trims to the write - the pristine hop
        // above it has no observer (`(a = _globalThis).Array` -> `a = _globalThis`) - and a
        // COMPUTED hop hands its key's effect prefix over in source order (object before
        // key, inner hop before outer): `[(r = _globalThis)[(se(), "Array")]]` splices to
        // `r = _globalThis, se()` - babel's flat spelling. an exotic key (a bare call) keeps
        // the whole read - its evaluation is not separable from the hop
        let trimmed = peeled;
        const keyEffects = [];
        while (trimmed?.type === 'MemberExpression') {
          if (trimmed.computed) {
            const keyExpr = peelTransparentExpr(trimmed.property);
            if (keyExpr?.type === 'SequenceExpression') keyEffects.unshift(...keyExpr.expressions.slice(0, -1));
            else if (keyExpr?.type !== 'Literal' && keyExpr?.type !== 'Identifier') break;
          }
          trimmed = peelTransparentExpr(trimmed.object);
        }
        // ... and a SEQUENCE root keeps only its prefix, for the same reason: the pristine
        // hops above the tail observe nothing (`(n++, _globalThis).Object` -> `n++`)
        if (trimmed !== peeled && trimmed?.type === 'SequenceExpression'
          && isPureNavReceiver(trimmed.expressions.at(-1))) {
          return [...trimmed.expressions.slice(0, -1), ...keyEffects];
        }
        if (trimmed !== peeled && trimmed?.type === 'AssignmentExpression') {
          const writtenValue = peelTransparentExpr(trimmed.right);
          const writtenCallee = writtenValue?.type === 'CallExpression' ? peelTransparentExpr(writtenValue.callee) : null;
          if ((writtenValue?.type === 'Identifier' && isMintedOrProxyName(writtenValue.name, injectorState))
            || writtenCallee?.type === 'ArrowFunctionExpression' || writtenCallee?.type === 'FunctionExpression') {
            return [trimmed, ...keyEffects];
          }
        }
        // a provably pure LITERAL call falls away (`[(() => Array)()]` - babel drops it);
        // the effects canon mirrors the inline fold, so a body effect keeps the rescue.
        // asked of the call the plain hops sit ON: a member read off it observes nothing
        // and its value is discarded (`[(() => { c++; return globalThis; })().Array]`
        // re-emits the CALL alone)
        const bottom = trimmed?.type === 'CallExpression' ? trimmed : peeled;
        if (bottom?.type === 'CallExpression') {
          const rescueCallee = peelTransparentExpr(bottom.callee);
          if ((rescueCallee?.type === 'ArrowFunctionExpression' || rescueCallee?.type === 'FunctionExpression')
            && !inlineCallHasObservableEffects({
              callNode: bottom,
              scope: job.metaPath.scope,
              adapter,
              path: job.metaPath,
            })) return [];
          if (bottom !== peeled) return [bottom];
        }
        return [rescueNode];
      }
      // the discarded init's observables - minus whatever the dispatch already SPELLS. a carried
      // receiver renders the init's own effect, so harvesting it again would run it twice
      const spelled = job.carriedReceiverLive?.() ?? null;
      const exprs = discardRescueNodes({
        node: declarator.init,
        scope: job.metaPath.scope,
        adapter,
        path: job.metaPath,
      }).flatMap(rescueLift).filter(expr => !spelled || !dispatchAlreadySpells(spelled, expr));
      const carriedWrite = byDeclarator.size === 1 && !!extracted.length && rescueIsCarriedWrite(exprs);
      if (carriedWrite) carriedWrites = true;
      const intoSeq = !job.chain?.length || carriedWrite
        || (exprs.length === 1 && soleElement?.type === 'CallExpression' && peelTransparentExpr(exprs[0]) === soleElement
          && inlineCallHasObservableEffects({
            callNode: soleElement,
            scope: job.metaPath.scope,
            adapter,
            path: job.metaPath,
          }));
      // ... and what is rescued is what can be OBSERVED: a quiet element of the discarded init is a
      // comma the source wrote, not work it did, and a statement of its own for it is dead output
      if (intoSeq) rescueExprs.push(...exprs);
      else rescueStatements.push(...observableSequenceElements(exprs).map(expr => expressionStatement(expr)));
    }
    if (rescueExprs.length && extracted.length) {
      // an EXPORTED extraction carries its declaration under the export wrapper
      const first = extracted[0].type === 'ExportNamedDeclaration' ? extracted[0].declaration : extracted[0];
      const [firstDeclarator] = first.declarations;
      // a carried WRITE rides the dispatch ARGUMENT, the canon placement for a prefix its own claim
      // reads; a rescued EFFECT prefixes the value, which is where its discarded receiver stood
      firstDeclarator.init = carriedWrites
        ? carryInitPrefix(firstDeclarator.init, rescueExprs)
        : sequenceExpression([...rescueExprs, firstDeclarator.init]);
    }
    shedTrailingHusks({ byDeclarator, dropped, emptiedElements });
    const declarations = hostNode.declarations.filter(declarator => !dropped.has(declarator));
    // an effect-bearing NEIGHBOUR pins the reads behind the whole literal: those extractions
    // follow the residual instead of leading it
    const after = jobs.some(job => job.extractAfterResidual) ? extracted : [];
    const statements = [...memoStatements, ...rescueStatements, ...after.length ? [] : extracted];
    if (!declarations.length) {
      body.splice(at, 1, ...statements, ...after);
      return;
    }
    // survivors keep their SOURCE SLOT around the lift: the ones written before the consumed
    // declarator stay ahead of it, the ones after it follow - each as its own statement
    // (`const keep = 1; outer(); const groupBy = ...; const keep2 = 2;`).
    // the pivot is the CLAIMED declarator, not the dropped one: a claimed declarator that keeps a
    // residual still reads the memo these statements declare, so leaving it ahead of them is a TDZ
    const claimed = new Set(jobs.map(job => job.declarator));
    const firstClaimed = hostNode.declarations.findIndex(declarator => claimed.has(declarator));
    const lastClaimed = hostNode.declarations.findLastIndex(declarator => claimed.has(declarator));
    const ahead = hostNode.declarations.slice(0, firstClaimed);
    const behind = declarations.filter(declarator => !ahead.includes(declarator));
    if (body[at] === hostNode && ahead.length && behind.length) {
      body.splice(at, 1, variableDeclaration(hostNode.kind, ahead), ...statements,
        variableDeclaration(hostNode.kind, behind));
      return;
    }
    if (!after.length && groupExtractionBesideResidual({
      hostNode, body, at, declarations, claimed, extracted, leading: [...memoStatements, ...rescueStatements],
    })) return;
    // a SURVIVING claimed declarator reads the memo these statements declare, so it can never lead them;
    // otherwise the statements follow the declaration whenever every survivor was written ahead of them
    const trailing = declarations.every(declarator => !claimed.has(declarator)
      && hostNode.declarations.indexOf(declarator) < lastClaimed);
    hostNode.declarations = declarations;
    body.splice(trailing ? at + 1 : at, 0, ...statements);
    if (after.length) body.splice(body.indexOf(hostNode) + 1, 0, ...after);
  }

  // PARTIAL consumption still memoizes when the group READS the receiver: the memo holds
  // one eval, the residual re-anchors on it (`export const { at, other } = getArr()` ->
  // `const _ref = getArr(); export const at = _at(_ref); export const { other } = _ref;`)
  function emitPartialMemo({ hostNode, declarator, declJobs, consumed, statements, exported }) {
    // receiverless STATICS need no memo: each extracts pure, the leftover residual keeps
    // the init (its SE runs there once) and re-anchors when a sole ctor hop remains
    // (`tryFn = _Promise$try; { customP } = (eff(), _Promise);` - babel's lift-not-replay)
    // a GLOBAL claim is receiverless the same way a static is: it substitutes its own binding
    // and the leftover residual keeps the init (`{ Map, parseInt } = (eff(), globalThis)`)
    if (declJobs.every(job => job.kind === 'static' || job.kind === 'global')) {
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
      if (surface) reanchorSoleCtorHopResidual(declarator);
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
      const init = seqTail && declarator.init === initBeforeReanchor
        && declJobs.every(job => !(job.buriedKeyEffect && job.chain?.length))
        ? peeledInit : null;
      if (init?.type === 'SequenceExpression') {
        statements.push(...observableSequenceElements(init.expressions.slice(0, -1))
          .map(expr => expressionStatement(expr)));
        declarator.init = init.expressions.at(-1);
      }
      statements.push(...extracted);
      return true;
    }
    if (declJobs.every(job => job.kind !== 'instance')
      || declJobs.some(job => job.chain?.length && job.kind !== 'instance')) return false;
    const refName = mintRefName();
    // the name is published for the caller: a declarator can carry BOTH this memo route and ordinary
    // jobs, and those read the ref this route declared rather than minting one nobody binds
    memoRefNames.set(declarator, refName);
    statements.push(variableDeclaration(hostNode.kind, [variableDeclarator(identifier(refName), declarator.init)]));
    // the SAME value the fully-consumed memo builds - dispatch, collapsed symbol leaf and
    // defaulted guard alike; a partial residual changes what SURVIVES, not what binds
    for (const job of declJobs) {
      const bound = variableDeclarator(memoJobBindingTarget(job), memoJobValue({ job, refName, guardRefs: new Map() }));
      statements.push(exportWrap(variableDeclaration(hostNode.kind, [bound]), exported));
      markSubtreeSkipped(skippedNodes, job.prop);
    }
    // a SYMBOL-pattern extraction leaves the key SPELLED in the residual: the source reads that
    // slot there, and the sentinel is what keeps the read (`{ [_Symbol$iterator]: _unused, other }`)
    // ... and so does a CHAINED leaf: what the top-level filter below removes is the HOP prop, and
    // this claim's own prop sits inside it - left as it was, the residual would declare a second time
    // the very binding the extraction just made
    for (const job of declJobs) {
      if (!job.symbolPattern && !(job.kind === 'instance' && job.chain?.length)) continue;
      consumed.delete(job.prop);
      job.prop.value = identifier(mintUnusedName());
      job.prop.shorthand = false;
    }
    declarator.id.properties = declarator.id.properties.filter(item => !consumed.has(item));
    declarator.init = identifier(refName);
    return true;
  }

  // does the discarded init STORE into a binding? a kept write is not a droppable effect - what it
  // fills is read back, and the source fills it BEFORE the pattern binds
  function sinkStoresBinding(node) {
    const core = peelTransparentExpr(node);
    return core?.type === 'AssignmentExpression'
      || (core?.type === 'SequenceExpression'
        && peelTransparentExpr(core.expressions.at(-1))?.type === 'AssignmentExpression');
  }

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
    const memoRefs = forInitMemoVerdicts(byDeclarator, mintRefName);
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
        if (seKeyJobs.length) {
          declarations.push(memoDeclarator, ...declare(declJobs.filter(job => !seKeyJobs.includes(job))),
            declarator, ...declare(seKeyJobs));
        } else {
          declarations.push(memoDeclarator, ...declare(declJobs));
          if (!patternDead(declarator.id)) declarations.push(declarator);
        }
        continue;
      }
      const emptied = patternDead(declarator.id);
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
        if (declJobs.length > 1 && declJobs.every(job => job.sentinel && job.seKey)) {
          declarations.push(...interleavedSeKeySegments(declarator, orderDeclaratorJobs(declJobs), null));
        } else if (declJobs.some(job => (job.sentinel && job.seKey) || (job.chain?.length && job.readsReceiver))) {
          declarations.push(declarator, ...extracted);
        } else {
          carryForInitPrefixIntoFirst(declarator, declJobs, extracted);
          declarations.push(...extracted, declarator);
        }
        continue;
      }
      // ... unless the init needs no slot of its own: it already RIDES its own extraction (the
      // for-init opaque route puts it at the head of the extraction's sequence, where the source
      // evaluated it - a second slot would run it twice), or it is quiet and the sink says so.
      // the sink question is the PRISTINE init's: a receiver that carried a call collapses to a
      // quiet spelling, and babel still keeps the loop-header slot for it
      // (`(() => globalThis)().self.Promise` -> `_ref = _Promise`)
      if (declJobs.every(job => job.initRidesValue)
        || (declJobs.every(job => !job.sinkKeep) && !mayHaveSideEffects(declarator.init))) {
        declarations.push(...extracted);
        continue;
      }
      // a SOLE instance extraction reads the SE init exactly once inside its dispatch -
      // no memo slot needed (`var at = _at(getObj())`, babel's inline consume)
      if (declJobs.length === 1 && declJobs[0].readsReceiver && !declJobs[0].chain?.length) {
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
        pushChainedSinkSlot({ declarator, declJobs, extracted, declarations });
      } else {
        const slot = discardedSinkSlot(peelTransparentExpr(declarator.init),
          {
            metaPath: declJobs[0]?.metaPath, sinkDrop: declJobs.some(job => job.sinkDrop),
            sinkPlan: declJobs.find(job => job.sinkPlan)?.sinkPlan ?? null, planMemoArg, adapter,
          });
        if (!foldSinkPrefixIntoResidual(extracted, slot) && slot) {
          declarations.push(variableDeclarator(identifier(mintRefName()), slot));
        }
        declarations.push(...extracted);
      }
    }
    hostNode.declarations = declarations;
  }

  // remove every consumed prop - or, under a rest sibling, RENAME its binding to an
  // `_unused` sentinel (the key stays, so rest keeps excluding it) - then cascade: a hop
  // prop whose nested pattern emptied is itself consumed, up the recorded chain
  function removeConsumedProps(jobs) {
    for (const job of jobs) {
      const mint = job.mintSentinel ?? mintUnusedName;
      if (job.sentinel) {
        if (!job.keepSentinelBinding) {
          markSubtreeSkipped(skippedNodes, job.prop.value);
          job.prop.value = identifier(mint());
          job.prop.shorthand = false;
        }
        continue;
      }
      job.pattern.properties = job.pattern.properties.filter(item => item !== job.prop);
      markSubtreeSkipped(skippedNodes, job.prop);
      for (const { hopProp, outerPattern, outerRest } of job.chain ?? []) {
        const hopPatternNode = hopProp.value?.type === 'AssignmentPattern' ? hopProp.value.left : hopProp.value;
        if (hopPatternNode.properties.length) break;
        if (outerRest) {
          markSubtreeSkipped(skippedNodes, hopProp.value);
          hopProp.value = identifier(mint());
          hopProp.shorthand = false;
          break;
        }
        outerPattern.properties = outerPattern.properties.filter(item => item !== hopProp);
      }
    }
  }

  // the sentinel MEMO keeps one declaration: `var _ref = <init>, { ..._unused } = _ref,
  // a = _at(_ref), z = 1;` - memo first, residual, extractions after (babel's shape). an
  // EXPORT host splits instead (the memo must not be exported), and so does a
  // SINGLE-declarator constant-literal host (its overwrite channel owns the whole slot)
  function drainSentinelMemoSiblings({ hostNode, body, at, jobs, jobsByDeclarator, memoByDeclarator }) {
    if (!memoByDeclarator.size
      || jobs.some(job => memoByDeclarator.has(job.declarator) && !job.memoSibling)
      // a HOP-anchored sibling renders its own declarator whole (the flatten's slots), so the
      // comma join would bake this memo into a declaration that emitter is about to replace
      || jobs.some(job => !memoByDeclarator.has(job.declarator) && job.chain?.length)
      // a SOLE declarator splits per statement instead - the memo, the extraction, then the
      // residual (`var _ref = holder.p; var m = _flat(_ref); var { ..._unused } = _ref;`);
      // the sibling join is the MULTI-declarator / for-init shape
      || hostNode.declarations.length === 1
      // ... and so does an OPAQUE memoized init: the comma join is the shape for a receiver the other
      // leg can also spell twice for free (an SE-free member), and one it has to memoize outright
      // takes a statement there - `const _ref = eff().constructor.prototype;` ahead of the split
      || memoByDeclarator.keys().some(declarator => !cheaplyRereadableInit(declarator.init))) {
      return false;
    }
    const exported = jobs.some(job => job.exported);
    // an EXPORTED host whose SIBLING was consumed whole splits per statement instead: that
    // sibling's extraction is its own export, and the join would put the memo behind it
    if (exported && hostNode.declarations.some(item => item.id?.type === 'ObjectPattern'
      && !item.id.properties.length)) return false;
    // an EXPORTED host keeps the comma join, and only the FIRST declarator's memo lifts out
    // ahead of it: a later one would run its receiver read before an earlier declarator's init,
    // so it keeps the comma slot - and its `_ref` on the module surface, the documented residue
    const ahead = [];
    const declarators = [];
    for (const [index, declarator] of hostNode.declarations.entries()) {
      const declJobs = jobsByDeclarator.get(declarator) ?? [];
      const refName = memoByDeclarator.get(declarator);
      if (refName) {
        const memoDeclarator = variableDeclarator(identifier(refName), declarator.init);
        if (exported && index === 0) ahead.push(variableDeclaration(hostNode.kind, [memoDeclarator]));
        else declarators.push(memoDeclarator);
        declarator.init = identifier(refName);
        declarators.push(...seKeySegmentedDeclarators(declarator, orderDeclaratorJobs(declJobs), refName));
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
    if (ahead.length) body.splice(at, 0, ...ahead);
    markRewrite();
    return true;
  }

  // partition drain jobs per declarator; a sentinel-kept declarator whose init cannot be
  // re-read raw takes a shared memo ref, and every job captures its binding target before
  // the sentinel rename mutates the prop
  function partitionDeclarationJobs(jobs, hostNode) {
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
      if (job.sentinel && !job.memoRecv && job.readsReceiver
        && sentinelMemoInitShape(init, job.allProxyInit,
          !hostNode?.declarations || hostNode.declarations[0] === job.declarator)
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
      const declJobs = orderDeclaratorJobs(jobsByDeclarator.get(declarator) ?? []);
      // SEVERAL keys on one pattern interleave with their own extractions - the same
      // per-prop evaluation order the single-declarator join spells
      if (declJobs.length > 1 || (declJobs.length === 1 && trailingSeKeyProps(declarator, declJobs[0]))) {
        declarators.push(...seKeySegmentedDeclarators(declarator, declJobs, null));
        continue;
      }
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
    const dropExprs = dropMetaPath ? discardRescueNodes({
      node: declarator.init,
      scope: dropMetaPath.scope,
      adapter,
      path: dropMetaPath,
    }) : [];
    const droppedInit = peelTransparentExpr(declarator.init);
    // a value-SELECTING init re-emits WHOLE - an effect buried in an operand (a proxy-hop KEY) has
    // no slot of its own, so the rescue canon answers with the selection itself. the POSITION is the
    // separate half: it LEADS the extraction, because the source evaluates the init before it binds
    if (insertAt >= 0 && dropExprs.length
      && (droppedInit?.type === 'LogicalExpression' || droppedInit?.type === 'ConditionalExpression')) {
      statements.splice(insertAt, 0, ...dropExprs.map(expr => expressionStatement(expr)));
      return;
    }
    for (const expr of dropExprs) statements.push(expressionStatement(expr));
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
    return mayHaveSideEffects(assignment.right) ? [expressionStatement(assignment.right)] : [];
  }

  // the statement-position OVERWRITE host: the dispatches land after the destructure, and a slot the
  // claim consumed leaves with it
  function drainAssignOverwrite({ body, at, jobs }) {
    const overwrites = jobs.map(job => expressionStatement(
      assignmentExpression('=', identifier(job.local), job.value())));
    const remains = consumedAssignmentRemains(jobs);
    if (remains) body.splice(at, 1, ...remains, ...overwrites);
    else body.splice(at + 1, 0, ...overwrites);
  }

  // what the array-declaration drain needs before it decides anything: the shared element MEMOS
  // (they land first, their slot swapped inside the wrapper array, so every extraction reads the one
  // `_ref` the residual reads too) and the wrapper elements this declaration CLAIMED, by declarator -
  // an element resolved through a nested hop answers with its TOP pattern, the one the claim shapes
  function arrayDeclPreamble({ hostNode, jobs }) {
    const memoStatements = [];
    for (const declarator of new Set(jobs.map(job => job.declarator))) {
      emitLiteralReceiverMemos({
        declarator,
        jobs: jobs.filter(job => job.declarator === declarator),
        statements: memoStatements,
        kind: hostNode.kind,
        mintRefName,
      });
    }
    const emptiedElements = new Map();
    for (const job of jobs) {
      const pattern = job.chain?.length ? job.chain.at(-1).outerPattern : job.pattern;
      if (!emptiedElements.has(job.declarator)) emptiedElements.set(job.declarator, new Set());
      emptiedElements.get(job.declarator).add(pattern);
    }
    return { memoStatements, emptiedElements };
  }

  // the NESTED flatten's discarded init in a loop header: its sink keeps a declarator slot, riding
  // AFTER the extractions as `_unused` (that route's accepted reorder) - except a kept WRITE, which
  // is not a discardable effect but a STORE the source performs BEFORE the pattern binds. a STORING
  // init rides the SOLE extraction's own dispatch, where the write runs ahead of the read of its
  // argument and the header keeps ONE declarator (`for (const m = _m((kw = _g, _g.Array.prototype));`)
  function pushChainedSinkSlot({ declarator, declJobs, extracted, declarations }) {
    const sinkValue = declJobs.some(job => job.arrayWrapSink)
      ? flattenArrayWrapInit(declarator.init) : peelTransparentExpr(declarator.init);
    const carrySink = sinkStoresBinding(sinkValue) && extracted.length === 1
      && extracted[0].init?.type === 'CallExpression' && extracted[0].init.arguments.length === 1;
    if (carrySink) {
      extracted[0].init = carryInitPrefix(extracted[0].init, [sinkValue]);
      declarations.push(...extracted);
      return;
    }
    const sink = variableDeclarator(identifier(mintUnusedName()), sinkValue);
    if (sinkStoresBinding(sinkValue)) declarations.push(sink, ...extracted);
    else declarations.push(...extracted, sink);
  }

  // a rescued WRITE carries even out of a chained claim: the extraction READS what the write stored,
  // so the store belongs inside the argument it feeds - the same placement a non-wrapped receiver
  // takes. the caller adds the one condition this cannot see: only the SOLE claimed declarator
  // qualifies, since the prefix lands on the first extraction, which is another declarator's read as
  // soon as there are two
  function rescueIsCarriedWrite(exprs) {
    return exprs.length > 0 && exprs.every(expr => {
      const peeled = peelTransparentExpr(expr);
      return peeled?.type === 'AssignmentExpression' && peeled.operator === '=' && peeled.left?.type === 'Identifier';
    });
  }

  // the array-wrapped ASSIGNMENT: when every binding of the left died into extractions,
  // the destructure drops whole - the RHS array stays as an expression statement (its
  // element SEs run in place), the overwrites follow (babel's shape)
  function drainArrayAssignment({ body, at, jobs }) {
    retargetSoleHopRestSentinels(jobs, { markSubtreeSkipped, skippedNodes });
    removeConsumedProps(jobs);
    const [{ assignment }] = jobs;
    const extracted = jobs.map(job => expressionStatement(assignmentExpression('=', identifier(job.local), job.value())));
    const mintedNames = jobs.flatMap(job => job.mintedSentinels ?? []);
    const varDecl = mintedNames.length
      ? [variableDeclaration('var', mintedNames.map(name => variableDeclarator(identifier(name))))] : [];
    if (!patternDead(assignment.left)) {
      // a surviving residual (a rest exclusion) runs first, the overwrites follow
      body.splice(at, 1, ...varDecl, body[at], ...extracted);
      return;
    }
    // the dead left drops whole; the RHS stays as an expression only for its effects - and a
    // SOURCE sequence splits per element, each buried effect keeping its own statement while
    // the discarded tail keeps one of its own (`(o(), [(i(), R)])` -> `o(); [(i(), R)];`)
    const rhsCore = peelTransparentExpr(assignment.right);
    // ... unless the extractions CARRY it: each dispatch spells its own element, so re-emitting the
    // RHS would run those effects a second time (`([{ at: v }] = [eff()])` ran `eff` twice)
    const keepRhs = !mayHaveSideEffects(assignment.right) || jobs.every(job => job.carriesInit) ? []
      : rhsCore?.type === 'SequenceExpression' && Number.isInteger(rhsCore.start)
        ? rhsCore.expressions.map(expr => expressionStatement(expr))
        : [expressionStatement(assignment.right)];
    body.splice(at, 1, ...keepRhs, ...extracted);
  }

  // sibling-declarator mode: the declaration stays ONE statement, each extraction appended
  // as a declarator after its residual (babel's multi-declarator kept-key shape)
  function drainSiblingAppend({ hostNode, body, at, jobs, jobsByDeclarator }) {
    if (jobs.every(job => !job.siblingAppend)) return false;
    const appendExported = jobs.some(job => job.exported);
    const appendStatements = [];
    let group = [];
    function flushGroup() {
      if (group.length) appendStatements.push(exportWrap(variableDeclaration(hostNode.kind, group), appendExported));
      group = [];
    }
    for (const declarator of hostNode.declarations) {
      const declJobsHere = jobsByDeclarator.get(declarator) ?? [];
      const extractions = declJobsHere.map(job => variableDeclarator(job.bindingTarget, job.value()));
      // a declarator the extraction consumed WHOLE splits off as its own statement, its
      // emptied residual dropped (`const { Array: { from } } = globalThis, <rest>` ->
      // `const from = _Array$from;` ahead of the rest) - babel's shape
      if (declarator.id.type === 'ObjectPattern' && !declarator.id.properties.length) {
        flushGroup();
        appendStatements.push(exportWrap(variableDeclaration(hostNode.kind, extractions), appendExported));
        if (declJobsHere.length) rescueEmptiedDeclaratorInit({ declarator, declJobsHere, statements: appendStatements });
        continue;
      }
      group.push(declarator, ...extractions);
    }
    flushGroup();
    markRewrite();
    body.splice(at, 1, ...appendStatements);
    return true;
  }

  // eslint-disable-next-line max-statements -- per-form drain dispatch sequence
  function drainDeclaration({ hostNode, body, at, jobs }) {
    jobs = withoutCtorHopJobsWithLiveSiblings(jobs);
    if (!jobs.length) return;
    const { memoByDeclarator, jobsByDeclarator, memoDeclJobs } = partitionDeclarationJobs(jobs, hostNode);
    // the SOURCE prop order, taken before the consumed ones leave: a re-anchored residual
    // is emitted at the position its surviving hop was written in
    const sourceProps = new Map(hostNode.declarations
      .filter(declarator => declarator.id?.type === 'ObjectPattern')
      .map(declarator => [declarator, [...declarator.id.properties]]));
    removeConsumedProps(jobs.filter(job => job.host !== 'memo-decl'));
    if (drainSentinelMemoSiblings({ hostNode, body, at, jobs, jobsByDeclarator, memoByDeclarator })) return;
    if (drainSeKeySentinelSiblings({ hostNode, jobsByDeclarator, memoDeclJobs })) return;
    // sibling-declarator mode: the declaration stays ONE statement, each extraction appended
    // as a declarator after its residual (babel's multi-declarator kept-key shape)
    if (drainSiblingAppend({ hostNode, body, at, jobs, jobsByDeclarator })) return;
    if (splitStaticSeKeyAhead({ hostNode, body, at, jobs, markRewrite })) return;
    // statement-per-declarator split, in SOURCE order: each declarator's extractions land
    // ahead of its own residual, and untouched siblings keep their own statements
    const exported = jobs.some(job => job.exported);
    const statements = [];
    let touched = jobsByDeclarator.size > 0;
    for (const declarator of hostNode.declarations) {
      const declMemoJobs = memoDeclJobs.get(declarator);
      if (declMemoJobs) {
        // the slot the memo route is about to fill: an ordinary job whose prop the SOURCE wrote
        // AHEAD of the memo route's own binds there, so the two land in the order they were written
        const memoAt = statements.length;
        const sourceOrder = sourceProps.get(declarator) ?? [];
        const emitted = emitMemoDeclarator({ hostNode, declarator, declJobs: declMemoJobs, statements, exported });
        touched ||= emitted;
        // ... and the declarator's OTHER jobs drain here too: `continue`ing past them dropped their
        // extraction outright and left the binding UNDECLARED, which an export then referenced -
        // invalid output (`const { [(k(), 'at')]: a, flat: f } = eff()` lost `a`). they FOLLOW the
        // residual, where the source reads them - its kept KEY runs first - and join its declaration,
        // since the ref they read is a plain identifier either spelling
        const sharedRef = memoRefNames.get(declarator) ?? memoByDeclarator.get(declarator);
        const alsoJobs = orderDeclaratorJobs(jobsByDeclarator.get(declarator) ?? []);
        const alsoHere = alsoJobs.map(job => variableDeclarator(job.bindingTarget, job.value(sharedRef)));
        if (alsoHere.length) touched = true;
        // an EXPORTED host keeps each binding in its own statement - the join would export the
        // sentinel beside them - and one the SOURCE wrote ahead of the memo route's own lands right
        // after the ref DECLARATION, never before it, which would TDZ
        if (exported && alsoHere.length) {
          const leads = alsoJobs.every(job => sourceOrder.includes(job.prop)
            && declMemoJobs.every(memo => sourceOrder.indexOf(job.prop) < sourceOrder.indexOf(memo.prop)));
          const wrapped = alsoHere.map(bound => exportWrap(variableDeclaration(hostNode.kind, [bound]), exported));
          if (leads && statements.length > memoAt) statements.splice(memoAt + 1, 0, ...wrapped);
          else statements.push(...wrapped);
          if (emitted !== 'consumed') statements.push(exportWrap(variableDeclaration(hostNode.kind, [declarator]), exported));
        } else if (emitted !== 'consumed') {
          statements.push(exportWrap(variableDeclaration(hostNode.kind, [declarator, ...alsoHere]), exported));
        } else if (alsoHere.length) {
          statements.push(exportWrap(variableDeclaration(hostNode.kind, alsoHere), exported));
        }
        continue;
      }
      const declJobsHere = jobsByDeclarator.get(declarator) ?? [];
      // an ALL-sentinel declarator off a plain identifier splits its residual PER GROUP:
      // each job prop opens a group (its sentinel + the non-job props after it), a
      // DEFAULTED job places its extraction after the group's residual (the guard reads
      // past the key effect), a plain one before - the catch SE-key evaluation order
      if (declJobsHere.length && declarator.init?.type === 'Identifier'
        && declJobsHere.every(job => job.sentinel && job.seKey && job.catchBorn && !job.chain?.length)
        && !exported && declarator.id.type === 'ObjectPattern'
        // the split changes evaluation shape only where a DEFAULTED SE-key needs its
        // residual ahead, or several key effects interleave with extractions - and it is
        // the CATCH relocation's channel; block hosts keep the single residual
        && declJobsHere.some(job => job.defaulted || declJobsHere.length > 1)) {
        emitSentinelGroups({ hostNode, declarator, declJobs: declJobsHere, statements });
        touched = true;
        continue;
      }
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
      if (joinSeKeySiblingDeclarator({
        hostNode,
        declarator,
        declJobsHere,
        exported,
        statements,
        markRewrite,
        refName,
      })) {
        touched = true;
        continue;
      }
      emitLiteralReceiverMemos({
        declarator, jobs: jobsByDeclarator.get(declarator) ?? [], statements, kind: hostNode.kind, mintRefName,
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
      const initPrefix = carriedInitPrefix(declarator, declJobsHere);
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
        // source ran it, or the effect observes the write the extraction has already made
        const survivingPrefix = initPrefix.length || hostNode.declarations.length > 1 ? []
          : liftSurvivingInitPrefix(declarator, declJobsHere);
        // the re-anchor serves a residual the extraction LEFT BEHIND; an untouched
        // sibling declarator keeps its raw pattern (babel anchors only what it consumed)
        // ... and it keeps its own SOURCE slot: a hop written before every consumed one is
        // emitted first (`{ [S]: kept } = _Map; const fe = _Object$fromEntries;`). asked
        // BEFORE the re-anchor, which swaps the pattern for the hop's own inner one
        const residualFirst = residualPrecedesExtractions(declarator, declJobsHere, sourceProps.get(declarator));
        const anchored = declJobsHere.length > 0 && reanchorSoleCtorHopResidual(declarator);
        if (anchored) touched = true;
        const residual = exportWrap(variableDeclaration(hostNode.kind, [declarator]), exported);
        // only an ANCHORED residual re-homes: a raw one stays where the extraction left it
        if (residualFirst && anchored) statements.push(...survivingPrefix, residual, ...extractedHere);
        else statements.push(...survivingPrefix, ...extractedHere, residual);
      } else {
        statements.push(
          ...initPrefix.length && !carryIntoFirst
            ? observableSequenceElements(initPrefix).map(expr => expressionStatement(expr)) : [],
          ...extractedHere,
        );
        if (declJobsHere.length && !containerPrefix.length) {
          rescueEmptiedDeclaratorInit({ declarator, declJobsHere, statements, insertAt: emptiedAt });
        }
      }
    }
    if (!touched) return;
    markRewrite();
    body.splice(at, 1, ...anchorLeadingStatement(statements, hostNode));
  }

  // the ONE statement a lifted prefix becomes, through the shared trim canon: the value slot is
  // gone, so a trailing effect-free element is a read nobody performs, and a prefix left with no
  // observable at all is not a statement the source ran (`({ Map: m } = (0, globalThis))`)
  // a residual whose SOLE prop is a ctor hop over the surface re-anchors on the pure ctor
  // (`{ Promise: { customZ } } = _globalThis` -> `{ customZ } = _Promise`); pristine proxy
  // KEYS peel first (`{ globalThis: { Map: { g } } }` anchors at Map). a sibling key at the
  // outer level keeps the proxy-root residual (the boundary babel holds)
  // the init's SURFACE view: a bare identifier, a sequence whose tail reads the surface,
  // or a kept write storing it - each re-anchors by swapping only the VALUE slot
  function surfaceInitInfo(declarator) {
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
    if (!shape || !proxySurfaceIdentifier(tail, { adapter, injectorState })) return null;
    return { init, tail, shape };
  }

  function reanchorSoleCtorHopResidual(declarator,
    { forceMutatedHop = false, wholeDeclarator = false, metaPath = null, hopKeyName = null } = {}) {
    const info = surfaceInitInfo(declarator);
    if (!info) return false;
    let changed = false;
    for (;;) {
      const pattern = declarator.id;
      if (pattern?.type !== 'ObjectPattern' || pattern.properties.length !== 1) return changed;
      const [hop] = pattern.properties;
      // a slot DEFAULT on the hop is dead for a step that navigates the same surface - the
      // pattern under it is what binds (`{ self: { a } = {} }` anchors like `{ self: { a } }`)
      const hopPattern = hop.value?.type === 'AssignmentPattern' ? hop.value.left : hop.value;
      if (hop.type !== 'Property' || hopPattern?.type !== 'ObjectPattern' || !hopPattern.properties.length) {
        return changed;
      }
      // a DEFAULT at any depth defers (the re-anchored render would drop a polyfillable
      // default); a `core-js-disable` mark on the hop or a leaf keeps the residual raw
      // a REST inside the hop anchors too - its exclusion set rides the pure ctor (the
      // symbol-extract channel's locked shape)
      // a polyfillable default on the hop's OWN prop rides the re-anchor - the residual keeps it
      // spelled and its claim renders in place; one NESTED deeper would be re-rendered verbatim
      // and lose that claim (`Set: { union, nested: { customA = [1].at(0) } }` bails)
      if (hopPattern.properties.some(item => item.type !== 'Property' && item.type !== 'RestElement')
        || hopPattern.properties.some(item => {
          const leaf = item.type === 'Property' && item.value?.type === 'AssignmentPattern'
            ? item.value.left : item.value;
          return leaf?.type === 'ObjectPattern' && patternHasPolyfillableDefault(leaf);
        })) return changed;
      if (isDisabled?.(hop) || hopPattern.properties.some(item => isDisabled?.(item))) return changed;
      const key = hop.computed ? peelTransparentExpr(hop.key) : hop.key;
      const keyName = hop.computed
        ? (key?.type === 'Literal' && typeof key.value === 'string' ? key.value : hopKeyName)
        : key?.name ?? (typeof key?.value === 'string' ? key.value : null);
      if (typeof keyName !== 'string') return changed;
      // a possible-global HOP over a guarded value navigates the same surface, so it drops with
      // the guard standing - the ctor-hop arm below is the one the guard shape serves
      if (POSSIBLE_GLOBAL_OBJECTS.has(keyName) && info.shape !== 'guard') {
        // a REST under the proxy key stays put - babel keeps the hop spelled (the
        // exclusion set reads the hop's own surface)
        if (!isPristineProxyGlobal(adapter, keyName)
          || hopPattern.properties.some(item => item.type === 'RestElement')) return changed;
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
            substituteProxyRootsInClone(declarator.init, metaPath,
              { adapter, resolveGlobalPolyfill, injectPureImport });
          }
        }
        changed = true;
        continue;
      }
      // a MUTATED slot holds the user's shim: no static behind it resolves, so the residual
      // re-anchors on the hop's own member READ (`{ groupBy } = _globalThis.Map`) - it
      // flattens whether or not the extraction consumed anything inside
      // a residual an extraction LEFT BEHIND keeps its nested spelling on a mutated hop
      // (babel anchors only what it consumed); a whole-declarator mutated hop flattens,
      // and only the drain's own note reaches here with that proof
      const mutatedHop = adapter.isMutatedStatic('globalThis', keyName);
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

  // eslint-disable-next-line max-statements -- per-form drain dispatch sequence
  function drainAssignment({ hostNode, body, at, jobs, inSequence = false }) {
    if (jobs[0].bodyless) {
      drainBodylessAssignment({ hostNode, jobs },
        { program, markRewrite, mintRefName, removeConsumedProps, reanchorSoleCtorHopResidual });
      return;
    }
    // an ALL-ANCHORED line has no consumed sibling to drive the split: every job would only
    // re-read its own hop off the pure ctor, and babel leaves that line whole on the substituted
    // global proxy (`({ Set: { intersection }, WeakSet: { customW } } = _globalThis)`)
    // (a SOLE hop keeps its own re-anchor - that shape is the sole-ctor-hop residual's)
    if (jobs.length > 1 && jobs.every(job => job.prop?.value?.type === 'ObjectPattern')) return;
    // babel's cascade order: FLAT extractions run before the residual, NESTED-hop
    // extractions after it; a SE-keyed sentinel keeps the residual FIRST (its key effect
    // must precede the lookup). the seKey view reads the prop's key before any rename
    // the demotion is asked PER JOB: a rest-forced hop follows the residual, but a FLAT
    // sibling beside it keeps its place ahead (its own slot read owes the hop nothing)
    function demotedBehindResidual(job) {
      return !!job.chain?.length
        || (job.sentinel && job.prop.computed && computedKeyHasSideEffects(job.prop));
    }
    const seKeyResidualFirst = jobs.some(job => job.sentinel
      && job.prop.computed && computedKeyHasSideEffects(job.prop));
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
    const residualPrecedes = residualPrecedesExtractions({ id: assignment.left }, jobs, assignSourceProps,
      { sharedHop: true });
    // an effectful read the consume DISCARDS still runs: the whole read lifts as its own
    // statement ahead of the extractions (`({ any } = globalThis[(e++, 'Promise')])`)
    const discardedRead = assignment.left?.type === 'ObjectPattern' && !assignment.left.properties.length
            && jobs.some(job => job.rawKeyRootInit) ? assignment.right : null;
    // the receiver read by an extraction AND by the surviving residual memoizes once - the
    // verdict needs the residual as it survives, so the values re-render onto the ref here
    const memoRef = assignmentMemoRef(assignment, jobs, mintRefName);
    const memoDecl = memoRef ? [variableDeclaration('const',
      [variableDeclarator(identifier(memoRef), assignment.right)])] : [];
    if (memoRef) {
      for (const [index, job] of [...flatJobs, ...nestedJobs].entries()) {
        [...flatExtracted, ...nestedExtracted][index].expression.right = job.value(memoRef);
      }
      assignment.right = identifier(memoRef);
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
        if (reanchorSoleCtorHopResidual(ctorView)) {
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
    const anchoredResidual = anchorAssignmentResidual(assignment, jobs, reanchorSoleCtorHopResidual);
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
    const peeledRhs = peelTransparentExpr(assignment.right);
    // the WHOLE right recorded as the prefix is the call-branch lift (`(() => ...)();`) - it
    // re-emits as a statement whatever the receiver shape is now
    const wholeRhsLift = jobs[0].seqPrefix?.length === 1 && jobs[0].seqPrefix[0] === assignment.right;
    // ... and a MINTED sequence counts as that source one where the collapse rebuilt it AROUND
    // the recorded prefix: the very nodes the job recorded still lead it, so the tail is the
    // resolved receiver and the prefix lifts to where the source ran it
    const rebuiltSeqPrefix = !!jobs[0].seqPrefix?.length && peeledRhs?.type === 'SequenceExpression'
      && !Number.isInteger(peeledRhs.start)
      && peeledRhs.expressions.length === jobs[0].seqPrefix.length + 1
      && jobs[0].seqPrefix.every((node, index) => spellsSameSource(peeledRhs.expressions[index], node));
    const rhsExprs = !wholeRhsLift && jobs[0].seqPrefix?.length && peeledRhs?.type === 'SequenceExpression'
      && (Number.isInteger(peeledRhs.start) || rebuiltSeqPrefix) ? peeledRhs.expressions : null;
    // a hop ANCHOR re-emits the receiver as its extraction's own RHS, and inside a SEQUENCE
    // slot there is no statement ahead of it to lift into: the prefix rides that RHS, where the
    // source wrote it (`({ customW } = (c++, _Map))`)
    const anchorRhsPrefix = inSequence && !wholeRhsLift && rhsExprs && jobs.length === 1
      && jobs[0].prop?.value?.type === 'ObjectPattern' ? rhsExprs.slice(0, -1) : null;
    const stmtSeqPrefix = anchorRhsPrefix ? []
      : wholeRhsLift ? [expressionStatement(assignment.right)]
      // a FULLY consumed pattern discards its receiver, and what stays of it is ONE expression - the
      // shape the other leg's defer-SE route prints there; a SURVIVING residual takes the per-element
      // prefix both legs print for the lift
      : rhsExprs ? (assignment.left.properties?.length === 0
        ? liftedPrefixStatements(rhsExprs.slice(0, -1))
        : observableSequenceElements(rhsExprs.slice(0, -1)).map(expr => expressionStatement(expr))) : [];
    // the tail moves into the residual whether or not the prefix left a statement behind: a prefix
    // with nothing to observe still gave up its slot (`({ Map: m, other } = (0, globalThis))`)
    if (rhsExprs && !anchorRhsPrefix && !wholeRhsLift && assignment.left.properties.length !== 0) {
      assignment.right = rhsExprs.at(-1);
    }
    if (assignment.left.properties.length === 0) {
      // with no residual left there is nothing for the cascade to order against: the extractions
      // run in the order the SOURCE wrote their hops (`from = _Array$from; ({ union } = _Set);`)
      const bySource = [...flatJobs, ...nestedJobs].map((job, index) => ({
        stmt: [...flatExtracted, ...nestedExtracted][index],
        at: assignSourceProps?.indexOf(job.chain?.length ? job.chain.at(-1).hopProp : job.prop) ?? -1,
      })).sort((left, right) => left.at - right.at).map(entry => entry.stmt);
      if (anchorRhsPrefix?.length && bySource.length) {
        bySource[0].expression.right = sequenceExpression([...anchorRhsPrefix, bySource[0].expression.right]);
      }
      // the consume DISCARDS the read the source performs off a guarded init: the first
      // extraction leads with it, rebuilt off the rendered guard (`v = ((null ==
      // _globalThis.window ? void 0 : _self).Math, _Math$sign)`) - the declaration's own rule
      const probeLead = discardedRead ? null : renderDiscardedInitProbe(jobs, probeRenderCtx);
      if (probeLead && bySource.length) {
        bySource[0].expression.right = sequenceExpression([probeLead, bySource[0].expression.right]);
      }
      // an SE init NOTHING evaluated (no memo, no lifted prefix, no reader) keeps its own
      // discarded statement ahead - dropping it would erase the call the source performs;
      // an ANCHOR job (a pattern-valued hop) and a SEQUENCE slot own their RHS already
      const rhsKept = !inSequence && !memoDecl.length && !stmtSeqPrefix.length && !discardedRead && !probeLead
        && jobs.every(job => !job.readsReceiver && job.prop?.value?.type !== 'ObjectPattern')
        && mayHaveSideEffects(assignment.right)
        ? [expressionStatement(assignment.right)] : [];
      body.splice(at, 1, ...stmtSeqPrefix, ...memoDecl, ...varDecl,
        ...discardedRead ? [expressionStatement(discardedRead)] : [], ...rhsKept, ...bySource);
    } else if (seKeyResidualFirst || (anchoredResidual && residualPrecedes)) {
      body.splice(at, 1, ...stmtSeqPrefix, ...memoDecl, ...varDecl, body[at], ...flatExtracted, ...nestedExtracted);
    } else if (anchoredResidual) {
      // an ANCHORED residual re-homes to its own source slot - past every extraction whose
      // hop the source wrote first (`g2 = _Object$fromEntries; ({ [S]: f2 } = _Set);`)
      body.splice(at, 1, ...stmtSeqPrefix, ...memoDecl, ...varDecl, ...flatExtracted, ...nestedExtracted, body[at]);
    } else {
      body.splice(at, 1, ...stmtSeqPrefix, ...memoDecl, ...varDecl, ...flatExtracted, body[at], ...nestedExtracted);
    }
  }

  // a bodyless `var` destructure whose EVERY binding extracts replaces the slot with a
  // block of `var local = pure;` statements (babel's scope.push shape); a partial consume
  // keeps the declaration raw - the residual would still need its receiver
  // the LIVE prefix behind a recorded one: a claim inside the prefix renders by REPLACING its
  // node, so the nodes captured at registration are pre-swap copies - lifting those spells the
  // source read again with its own polyfill lost (`(arr.flat(), globalThis)`)
  function livePrefixOf(declarator, seqPrefix) {
    const liveInit = peelTransparentExpr(declarator.init);
    return liveInit?.type === 'SequenceExpression' && liveInit.expressions.length === seqPrefix.length + 1
      ? liveInit.expressions.slice(0, -1) : seqPrefix;
  }

  function drainBodylessDeclaration({ hostNode, jobs }) {
    const [{ declaration }] = jobs;
    // MULTI-declarator: the statement fits the slot as-is - each jobbed declarator keeps
    // its (renamed) residual and appends the extraction as a SIBLING declarator after it
    // (`var first = init, { [SE]: _unused } = rows, fm = _flatMapMaybeArray(rows);`)
    if (declaration.declarations.length > 1) {
      // a job needing a MEMO cannot ride the comma list: the memo is a statement, so the slot
      // becomes a block and each declarator lands as its own statement inside it
      if (jobs.some(job => job.needsMemo || job.seqPrefix?.length)) {
        return drainBodylessMultiMemo({ hostNode, declaration, jobs },
          { program, mintRefName, removeConsumedProps, markRewrite });
      }
      const byDeclarator = new Map();
      for (const job of jobs) {
        if (!byDeclarator.has(job.declarator)) byDeclarator.set(job.declarator, []);
        byDeclarator.get(job.declarator).push(job);
      }
      const declarators = [];
      for (const declarator of declaration.declarations) {
        const declJobs = byDeclarator.get(declarator) ?? [];
        const extracted = declJobs.map(job => variableDeclarator(identifier(job.local), job.value()));
        removeConsumedProps(declJobs);
        const emptied = declarator.id.type === 'ObjectPattern' && declarator.id.properties.length === 0;
        if (!emptied) declarators.push(declarator);
        declarators.push(...extracted);
      }
      declaration.declarations = declarators;
      markRewrite();
      return;
    }
    const [declarator] = declaration.declarations;
    // an ARRAY-wrapped pattern hosts the same way - only its residual spelling differs: the
    // quiet tail lands in the ELEMENT slot and the wrapper survives with it
    const arrayWrapped = declarator.id?.type === 'ArrayPattern';
    if (!arrayWrapped && declarator.id?.type !== 'ObjectPattern') return;
    const memoRef = jobs.some(job => job.needsMemo) ? mintRefName() : null;
    // SE-KEY sentinels over a re-readable init interleave into ONE declaration, so the slot
    // needs no block at all (`if (c) var { [k1]: _u } = r, a = ..., { [k2]: _u2 } = r, b = ...`)
    // ... but only under a DEFAULT: the guard must read PAST its own key effect, so segment and
    // extraction have to alternate. plain slots keep the block, extractions ahead of the residual
    if (!arrayWrapped && !memoRef && jobs.every(job => !job.seqPrefix?.length)
      && jobs.some(job => job.defaulted)
      && declarator.init?.type === 'Identifier' && declarator.id?.type === 'ObjectPattern'
      && jobs.every(job => job.sentinel && job.prop?.computed && computedKeyHasSideEffects(job.prop)
        && !job.chain?.length && job.pattern === declarator.id)) {
      for (const job of jobs) job.bindingTarget = identifier(job.local);
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
    // ... and a MEMOIZED init keeps its sequence WHOLE: the memo is where it evaluates, and
    // lifting the prefix out of it would take the claims rendered inside that prefix with it
    if (seqPrefix?.length && !memoRef) {
      if (ridesArgument) {
        // the LIVE prefix, like the lift below: a claim inside it renders by REPLACING its node, so
        // the registration-time copy is pre-swap and would ship the raw call (`log.push("e")` beside
        // a polyfilled twin on the other leg)
        values[0].arguments[0] = sequenceExpression([
          ...livePrefixOf(declarator, seqPrefix), values[0].arguments[0],
        ]);
      } else statements.push(...observableSequenceElements(livePrefixOf(declarator, seqPrefix))
        .map(expr => expressionStatement(expr)));
      const [{ initHost }] = jobs;
      const liveTail = liveTailOf(declarator, seqPrefix, initTail);
      if (arrayWrapped && initHost) replaceNodeInTree(declarator.init, initHost, liveTail);
      else declarator.init = liveTail;
    }
    if (memoRef) {
      // the memo is the synthetic block's own binding, and its kind follows the SE-KEY
      // sentinel alone: that residual is planted by the same `var` channel as the segments it
      // interleaves with, while a plain or REST-kept one takes the `const` the block scopes
      // (measured on the other emitters, either host)
      // ... and a job carrying a resolved ELEMENT memoizes THAT node, the kept init reading
      // the ref in its slot. an ARRAY-WRAPPED host memoizes its ELEMENT for the same reason:
      // the receiver every dispatch reads is the paired element, and memoizing the wrapper
      // array instead hands them the wrapper (`_at([recv])` - a different receiver entirely)
      const elementNode = jobs.find(job => job.nestedMemoNode)?.nestedMemoNode
        ?? (arrayWrapped ? jobs.find(job => job.initHost)?.initHost ?? null : null);
      // ... and the memo takes the HOST's own kind when it stands in a block the host wrapped:
      // a `var` declaration keeps its function-scoped binding there, which is what the other
      // leg's memo declares too
      statements.push(variableDeclaration(
        jobs.some(job => job.sentinel && job.prop?.computed && computedKeyHasSideEffects(job.prop))
          || (elementNode && hostNode?.kind === 'var') ? 'var' : 'const',
        [variableDeclarator(identifier(memoRef), elementNode ?? declarator.init)]));
      if (elementNode) replaceNodeInTree(declarator.init, elementNode, identifier(memoRef));
      else declarator.init = identifier(memoRef);
    }
    statements.push(...jobs.map((job, at) => variableDeclaration('var',
      [variableDeclarator(identifier(job.local), values[at])])));
    removeConsumedProps(jobs);
    // a PARTIAL consume keeps the residual as its own `var` declaration inside the block
    // (`if (c) var { from, isArray } = Array;` -> `{ var from = _X; var { isArray } = Array; }`)
    const residualLives = arrayWrapped
      ? declarator.id.elements.some(element => element
        && !(element.type === 'ObjectPattern' && element.properties.length === 0))
      : declarator.id.properties.length !== 0;
    if (residualLives) statements.push(declaration);
    const replacement = statements.length === 1
      ? statements[0] : { type: 'BlockStatement', body: statements };
    if (replaceNodeInTree(program, hostNode, replacement)) markRewrite();
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
    path.node.body.body.unshift(variableDeclaration('let', [variableDeclarator(param, identifier(refName))]));
    path.node.param = identifier(refName);
  }

  // the LOOP HEAD is the catch param's twin on this substrate too: the loop variable binds per
  // iteration with no declaration a claim could extract into, so the head takes a minted name and
  // the pattern moves to the body's first statement. the KIND travels (that is what keeps `const`
  // per-iteration) and a bodyless loop is braced around the pair; the plan is the catch host's own
  function extractLoopLeft(path) {
    const { left, body } = path.node;
    if (left?.type !== 'VariableDeclaration' || left.declarations?.length !== 1) return;
    const [declarator] = left.declarations;
    // an assignment target (`for ({ at } of rows)`) declares nothing to relocate, and an
    // already-plain binding needs no host
    if (declarator.init || !declarator.id || declarator.id.type === 'Identifier') return;
    const idPath = path.get('left').get('declarations')[0].get('id');
    const typeProbe = firstPatternProp(idPath);
    const elementType = typeProbe ? resolvePropertyObjectType?.(typeProbe) ?? null : null;
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
      mirrorHosts: !!forOfHeadElements(path.get('left').get('declarations')[0]),
    });
    if (!plan) return;
    for (const prop of plan.unobservable) skippedNodes.add(prop);
    const refName = mintRefName();
    const slot = identifier(refName);
    // the relocated pattern is RE-DETECTED off the minted name, and a name has no shape the type
    // ladder can walk back to the iterated value - so the ELEMENT's type is stashed on it first,
    // the pre-mutation channel the resolver keeps for exactly this
    if (elementType) resolvedType?.set(slot, elementType);
    // `let` where the head wrote `const`: a claim's own default guard folds its test ref in as an
    // initializer-less declarator, which `const` cannot carry - the per-iteration binding comes from
    // the HEAD, which keeps its kind
    const relocatedKind = left.kind === 'const' ? 'let' : left.kind;
    const relocated = variableDeclaration(relocatedKind, [variableDeclarator(declarator.id, slot)]);
    if (body.type !== 'BlockStatement') path.node.body = { type: 'BlockStatement', body: [body] };
    path.node.body.body.unshift(relocated);
    declarator.id = identifier(refName);
    // the head now declares a MINTED name, and a `var` one hoists into an owner whose var index
    // may already be built - drop it, or the relocated pattern reads a receiver with no writes
    if (left.kind === 'var') invalidateScopeVarIndex(path);
    // the head's minted binding is born mid-rewrite, and the relocated pattern is RE-DETECTED
    // against it - but this leg's scope was built at parse and never saw it. a receiver no scope
    // can name is a receiver whose STATICS are lost: the type stash above answers for instance
    // members alone, and a constructor has no value-type to stash. the babel twin registers the
    // same fact through its own scope
    const [headDeclarator] = path.get('left').get('declarations');
    path.scope?.registerBinding?.(left.kind, headDeclarator.get('id'), headDeclarator);
  }

  return {
    buildValue,
    drain,
    drainArrayAssignment,
    drainArrayDeclaration,
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
