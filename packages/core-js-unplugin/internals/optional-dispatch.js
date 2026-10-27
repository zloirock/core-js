// the optional-dispatch channel of the usage-pure emitter: the `?.` split forms (a doubly
// optional call, an optional member hop, the receiver splits) and the instance/inherited
// dispatches with their guard spellings. created per transform over the factory's context
import {
  chainSealsAShortCircuit,
  findProxyGlobal,
  inlineCallProxyGlobalRoot,
  navValueCanShortCircuit,
  navRootPrefixNodes,
  peelReceiverSequenceTail,
  proxyGlobalMemberCtorPureSwap,
  proxyReceiverValueCanBeUndefined,
  resolveKey,
  resolveObjectName,
  vestigialNavOptionals,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  prepareGuardReceiver, memoReceiverGlobalName, holdsProxySurface as receiverHoldsProxySurface,
} from '@core-js/polyfill-provider/detect-usage/guard-preparation';
import { storedProxyNavProvesHop } from '@core-js/polyfill-provider/detect-usage/annotations';
import { decidedReusableReceiver, instanceSynthReceiverPure } from '@core-js/polyfill-provider/detect-usage/destructure';
import { nodePathInScope } from '@core-js/polyfill-provider/resolve-node-type';
import {
  POSSIBLE_GLOBAL_OBJECTS,
  calleeParenWrapped,
  TS_EXPR_WRAPPERS,
  isMemberAccessNode,
  isMutatedGlobalSlot,
  isPristineProxyGlobal,
  isReusableReceiver,
  nestedSequenceValueSpelling,
  observableSequenceElements,
  peelNestedSequenceExpressions,
  receiverCarriesLiveOptional,
  singleSequenceTail,
  unwrapRuntimeExpr,
  subtreeContainsNode,
  bindingPolyfillHint,
  isAliasProxyRoot,
  computedKeyStaticName,
  peelChainAssignmentDeep,
  staticMemberKeyName,
  climbTransparentWrapperPath,
  valueIsDroppedAt,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  remapInheritedStaticMeta,
} from '@core-js/polyfill-provider/helpers/class-walk';
import {
  assignmentExpression,
  callExpression,
  chainExpression,
  cloneNode,
  composeNullGuardTest,
  identifier,
  memberExpression,
  nullGuardTest,
  renderMethodCall,
  renderGuardedMethodCall,
  renderOptionalMethodCall,
  renderReceiverMemo,
  renderKeptSequenceTail,
  planMethodCall,
  planOptionalMethodCall,
  renderNavCollapseValue,
  renderShortCircuitGuard,
  sequenceExpression,
  memberFromKeyName,
} from '@core-js/polyfill-provider/render';
import {
  mintedProxyGlobalName,
  receiverCarriesOptional,
  stampReplacementSpan,
  withSideEffects,
} from './emit-shared.js';
import { guardProbeUndefinable, optionalCallSegmentBelow, replaceGuardedHop } from './claim-guards.js';
import {
  chainContainsMutatedStatic,
  climbToCallerPath,
  cloneSpinePeeled,
  cloneStamped,
  foldSeqKeyLiteralTail,
  foldedResolvedKey,
  isDeleteOperand,
  markSubtreeSkipped,
  memoizedCallResultType,
  navRootIsProxyIdentifier,
  nodeTypeRefinement,
  spineCarriesComputedHop,
  spineHoldsKeptWrite,
  stampSourceCallType,
} from './nav-spine.js';
import {
  emitBareOptionalSeDispatch,
  emitOptionalCallWithLiftedSe,
  emitSeCarryingReceiverRead,
  emitSeKeyReadMemo,
  emitSeReadFormOverLiveOptional,
  inheritedStaticCalleeSplit,
} from './se-dispatch.js';

export default function createOptionalDispatchChannel(ctx) {
  const {
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
  } = ctx;

  // Bind the shared guard preparation to ESTree cloning and native memo/type state.
  function guardObject(objectNode, metaPath, options = {}) {
    const aliasCtx = { scope: metaPath.scope, path: metaPath, adapter, injectorState,
      resolvePure: meta => resolvePure(meta, metaPath) };
    const decision = prepareGuardReceiver(objectNode, aliasCtx, {
      pure: pure => identifier(injectPureImport(pure.entry, pure.hintName)),
      renderNav: plan => renderNavCollapseValue(plan,
        identifier(injectPureImport(plan.leafPure.entry, plan.leafPure.hintName)), {
          prefix: plan.kind === 'sequence' ? navRootPrefixNodes(plan, cloneNode) : [], cloneHost: cloneNode,
        }),
      folded: (pure, effects) => withSideEffects(identifier(injectPureImport(pure.entry, pure.hintName)), effects),
      guarded: (probe, pure) => renderShortCircuitGuard(nullGuardTest(cloneNode(probe)),
        identifier(injectPureImport(pure.entry, pure.hintName))),
      cloneMemo: (node, bare) => bare ? cloneNode(unwrapRuntimeExpr(node)) : cloneSpinePeeled(node),
      renderKeptTail: plan => renderKeptSequenceTail(plan, { injectImport: injectPureImport }),
      deoptionalize(hop) { hop.optional = false; },
    }, options);
    const { source, surface, capture } = decision;
    const baseType = capture && !surface && (resolvedType.get(source)
      ?? memoizedCallResultType(source, metaPath, resolveNodeType)
      ?? nodeTypeRefinement(unwrapRuntimeExpr(source), metaPath.scope, resolveNodeType));
    const memo = renderReceiverMemo(decision, {
      mintRef() {
        const ref = injector.generateDeclaredRef(metaPath);
        const name = surface || memoReceiverGlobalName(source, aliasCtx, { constructors: true });
        if (name) injectorState?.registerGlobalAlias?.(ref, name, { trusted: true, minted: true });
        return ref;
      },
      embed(node, role) {
        if (role === 'capture') {
          memoValueClones.add(node);
          return receiverCarriesOptional(node) ? chainExpression(node) : node;
        }
        const clone = cloneNode(node);
        if (role === 'receiver' && baseType) resolvedType.set(clone, baseType);
        return clone;
      },
    });
    return { disjuncts: [memo.firstRead], makeBase: memo.makeBase };
  }

  // Bind the shared optional call product to source spans, receiver types and live claims.
  // Receiver clones retain the existing proxy-hop skip ownership; generated calls keep
  // the source return type for a continuing claim above them.
  function renderOptionalCallSplit({ node, callee, decision, metaPath, helper = null, guard = null, checks = [] }) {
    const recvType = !callee.optional && decision.capture
      && nodeTypeRefinement(unwrapRuntimeExpr(callee.object), metaPath.scope, resolveNodeType);
    const product = renderOptionalMethodCall(decision, {
      callee, args: node.arguments, helper, guard, checks,
      mintRef: () => injector.generateDeclaredRef(metaPath),
      embed(source, role) {
        const clone = guard && role === 'receiver' ? cloneStamped(source, typeStampCtx) : cloneNode(source);
        if (role === 'receiver' && recvType) resolvedType.set(clone, recvType);
        if (role === 'capture' && holdsProxySurface(callee.object, metaPath)) {
          for (let hop = unwrapRuntimeExpr(clone); hop?.type === 'MemberExpression' && !hop.computed
            && POSSIBLE_GLOBAL_OBJECTS.has(hop.property?.name); hop = unwrapRuntimeExpr(hop.object)) {
            skippedNodes.add(hop);
          }
        }
        return clone;
      },
      recordLookup: lookup => stampReplacementSpan(lookup, callee),
    });
    if (!callee.optional && product.methodCheck?.type === 'SequenceExpression') guardCommaMemos.add(product.methodCheck);
    return {
      hopKind: 'call',
      disjuncts: product.disjuncts,
      receiver: stampSourceCallType(product.receiver, node, metaPath, typeStampCtx),
    };
  }

  // the DOUBLY-optional arm (`X?.m?.()` / `X.m?.()` with an optional method hop): the
  // probe decides between the guarded-disjunct shape and the kept-`?.` memo
  function splitDoublyOptionalCall({ node, metaPath, callee, decision }) {
    // the stand-down mirrors the single-`?.` arm: a resolvable STATIC claim over a
    // provably DEFINED object erases BOTH `?.` once substituted (`Array?.from?.(x)` ->
    // `_Array$from(x)`; the result's own `?.` still guards above)
    if (!callee.computed && callee.property?.type === 'Identifier') {
      const dCalleeObject = unwrapRuntimeExpr(callee.object);
      const dObjName = resolveObjectName({ objectNode: callee.object, scope: metaPath.scope, adapter, path: metaPath });
      if (dObjName && !proxyReceiverValueCanBeUndefined(dCalleeObject, m => resolvePure(m, metaPath),
        { scope: metaPath.scope, adapter, path: metaPath }, { throughChainAssign: true })) {
        const dClaim = resolvePure(
          { kind: 'property', object: dObjName, key: callee.property.name, placement: 'static' }, metaPath);
        if (dClaim && dClaim.kind !== 'instance') return null;
      }
    }
    const calleePath = nodePathInScope(callee, metaPath.scope, ['MemberExpression']) ?? metaPath;
    const { result: optionalCalleeProbe } = resolvePureOrGlobalFallback({
      kind: 'property',
      object: splitReceiverTypeHint(callee.object, metaPath),
      key: callee.computed ? resolveKey({
        node: callee.property,
        computed: true,
        scope: calleePath.scope,
        adapter,
        path: calleePath,
        bailOnSideEffectKey: true,
      }) : callee.property?.name,
      placement: 'prototype',
    }, calleePath);
    if (!optionalCalleeProbe) return renderOptionalCallSplit({ node, callee, decision, metaPath });
    // The navigation guard already owns its receiver capture. Keep the source entry:
    // a mutable receiver can resolve through hints without one recoverable memo Type.
    const rootGuard = guardObject(callee.object, metaPath, { interveningEffects: decision.interveningEffects });
    return renderOptionalCallSplit({
      node, callee, decision, metaPath,
      helper: optionalCalleeProbe.kind === 'instance'
        ? identifier(injectPureImport(optionalCalleeProbe.entry, optionalCalleeProbe.hintName)) : null,
      guard: { checks: rootGuard.disjuncts, receiver: rootGuard.makeBase() },
    });
  }

  // the receiver's RESOLVED TYPE names the typed instance entry for the split's own
  // method resolution (`[].at?.(1)` -> `_atMaybeArray`, babel's typed probe); null when
  // the type does not resolve - the bare prototype meta then keeps the generic entry
  function splitReceiverTypeHint(receiverNode, metaPath) {
    const value = unwrapRuntimeExpr(receiverNode);
    if (!value) return null;
    return toHint(nodeTypeRefinement(value, metaPath.scope, resolveNodeType)) ?? null;
  }

  // a callee that spells a resolvable STATIC claim is always defined once substituted -
  // the `?.()` erases with it (extracted from the split for its size)
  function staticCalleeStandsDown({ callee, calleeObject, metaPath }) {
    // a `this` / `super` STATIC lookup resolves through the class's INHERITED chain, not
    // through an object name: its own emitter owns the call, so the split stands down
    // (`this[(k++, 'from')]?.([1, 2])` inside `class C extends Array`)
    if (calleeObject?.type === 'ThisExpression' || calleeObject?.type === 'Super') {
      // the key answers through the same canon the object-named arm uses; the class context is
      // asked off THIS path (a sibling read in the same static member sees the same class)
      const inheritedKey = callee.computed
        ? foldSeqKeyLiteralTail(callee.property)?.key
          ?? resolveKey({
            node: callee.property,
            computed: true,
            scope: metaPath.scope,
            adapter,
            path: metaPath,
            bailOnSideEffectKey: true,
          })
        : callee.property?.name;
      const shadowed = calleeObject.type === 'ThisExpression'
        && isShadowedByClassOwnMember(metaPath, inheritedKey);
      const inherited = typeof inheritedKey === 'string' && !shadowed
        ? remapInheritedStaticMeta(injectorState, null, resolveStaticInheritedMember(metaPath, inheritedKey)) : null;
      // a MUTATED slot keeps the live read, and an inherited INSTANCE member is no static claim
      const inheritedClaim = inherited && !isMutatedStatics(inherited) ? resolvePure(inherited, metaPath) : null;
      if (inheritedClaim && inheritedClaim.kind !== 'instance') return true;
    }
    // the `?.()` erases with it and babel keeps NO guard (`Array.from?.([1]).at(-1)` ->
    // `_atMaybeArray(_ref = _Array$from([1])).call(_ref, -1)`) - stand down, the memo
    // clone's descent claim owns the call
    // the receiver name comes from the canon, never from the raw spelling: a bound ALIAS of a
    // global (`const A = Array; A.from?.([1]).at(-1)`) is the same always-defined static as the
    // direct form, and reading "bound means not a global" kept a guard here that babel's own
    // skip-check erased
    const calleeObjectName = resolveObjectName({
      objectNode: calleeObject, scope: metaPath.scope, adapter, path: metaPath,
    });
    if (calleeObjectName) {
      // a SEQ-prefixed key folds to its literal tail - the claim's own render carries
      // the effects (`?.[(c++, 'from')]` stands down like `.from`)
      // ... and every other computed spelling answers through the canonical key resolver (a
      // const alias, a folded concatenation): only the KEY decides the stand-down. an
      // EFFECT-bearing key bails - it owns a slot the erased spelling would drop
      const staticKey = callee.computed
        ? foldSeqKeyLiteralTail(callee.property)?.key
          ?? resolveKey({
            node: callee.property,
            computed: true,
            scope: metaPath.scope,
            adapter,
            path: metaPath,
            bailOnSideEffectKey: true,
          })
        : callee.property?.name;
      if (typeof staticKey === 'string') {
        const staticClaim = resolvePure(
          { kind: 'property', object: calleeObjectName, key: staticKey, placement: 'static' }, metaPath);
        if (staticClaim && staticClaim.kind !== 'instance') return true;
      }
    }
    return false;
  }

  // the OPTIONAL-CALL arm of the split (`X.m?.(...)`), extracted for its size: the
  // callee spelling decides the guard shape
  function splitOptionalCallReceiver(node, metaPath) {
    let callee = unwrapRuntimeExpr(node.callee);
    const receiverCtx = { scope: metaPath.scope, path: metaPath, adapter, injectorState };
    // a BARE callee's `?.()` guards on the callee value itself: reusable re-reads
    // (`a == null ? void 0 : _at(_ref = a()).call(_ref, 0)`); a COMPLEX or non-reusable
    // callee memoizes, the disjunct guards the memo and the call reads it exactly once
    // (`pick(1)?.()` -> `null == (_ref = pick(1)) || ... _ref()`, babel's callee-split)
    if (callee?.type !== 'MemberExpression') {
      if (callee?.type === 'Super') return STAGED_SPLIT;
      const calleeSequence = callee?.type === 'SequenceExpression' ? peelNestedSequenceExpressions(callee) : null;
      let calleeValue = calleeSequence?.tail ?? callee;
      const pure = instanceSynthReceiverPure(calleeValue, { ...receiverCtx, resolvePure: meta => resolvePure(meta, metaPath) });
      if (pure) {
        calleeValue = identifier(injectPureImport(pure.entry, pure.hintName));
        callee = calleeSequence
          ? sequenceExpression([...calleeSequence.prefix.map(prefix => cloneNode(prefix)), cloneNode(calleeValue)])
          : calleeValue;
      }
      const capture = !isReusableReceiver(calleeValue, { directCallee: true, ctx: receiverCtx });
      // SOURCE-authored callees only: a plugin-built callee (no source span - a rewritten
      // inner dispatch on re-visit) belongs to the chain-threading route, and memoizing it
      // here would freeze a half-threaded chain
      if (capture && typeof callee?.start !== 'number') return STAGED_SPLIT;
      const { firstRead, makeBase } = renderReceiverMemo({ firstReceiver: callee, receiver: calleeValue, capture }, {
        mintRef: () => injector.generateDeclaredRef(metaPath), embed: cloneNode,
      });
      return {
        hopKind: 'call',
        disjuncts: [firstRead],
        receiver: callExpression(makeBase(), node.arguments.map(argument => cloneNode(argument))),
      };
    }
    // an INHERITED STATIC callee substitutes to an always-defined binding, so its `?.()`
    // erases with it and the call binds `this` (the subclass) - the dispatch above needs no
    // guard at all (`super.from?.().at(0)` -> `_at(_ref = _Array$from.call(this)).call(_ref, 0)`)
    const inheritedSplit = inheritedStaticCalleeSplit(node, callee, metaPath, inheritedCtx);
    if (inheritedSplit) return inheritedSplit;
    // The shared handoff reads the runtime receiver through source wrappers. Its first
    // method lookup still owns the whole value; later reads use its stable rendered tail.
    let calleeObject = unwrapRuntimeExpr(callee.object);
    let reusabilityView = calleeObject;
    const receiverSequence = reusabilityView?.type === 'SequenceExpression'
      ? peelNestedSequenceExpressions(reusabilityView) : null;
    if (receiverSequence) reusabilityView = receiverSequence.tail;
    const pure = instanceSynthReceiverPure(reusabilityView, { ...receiverCtx, resolvePure: meta => resolvePure(meta, metaPath) });
    if (pure) {
      reusabilityView = identifier(injectPureImport(pure.entry, pure.hintName));
      calleeObject = receiverSequence
        ? sequenceExpression([...receiverSequence.prefix.map(prefix => cloneNode(prefix)), cloneNode(reusabilityView)])
        : reusabilityView;
      callee = { ...cloneNode(callee), object: cloneNode(calleeObject) };
    }
    // `super` cannot memoize (`_ref = super` does not parse) - the method memoizes whole
    // and the call runs on `this`, babel's dedicated super-call spelling
    const decision = planOptionalMethodCall({
      callee, call: node, continuation: metaPath.node, ctx: receiverCtx,
    });
    // Only the callee's own optional call is redundant. A guard below the static
    // receiver still owns the outer instance dispatch, so thread that split through.
    // Undefined means no static claim; null is a static claim needing no receiver split.
    const staticSplit = staticCalleeStandsDown({ callee, calleeObject, metaPath })
      ? splitOptionalReceiver(callee.object, metaPath) : undefined;
    if (staticSplit && staticSplit !== STAGED_SPLIT) return {
      ...staticSplit,
      hopKind: 'call',
      receiver: stampSourceCallType(callExpression(
        { ...cloneNode(callee), object: staticSplit.receiver, optional: false },
        node.arguments.map(argument => cloneNode(argument))), node, metaPath, typeStampCtx),
    };
    if (staticSplit !== undefined && (!callee.optional || staticSplit === STAGED_SPLIT)) return staticSplit;
    if (callee.optional) {
      return splitDoublyOptionalCall({ node, metaPath, callee, decision });
    }
    const receiverSplit = decision.capture && decision.receiverGuard === 'link'
      ? splitOptionalReceiver(callee.object, metaPath) ?? STAGED_SPLIT : null;
    if (receiverSplit === STAGED_SPLIT) return STAGED_SPLIT;
    // Resolve only the same source-owned lookups as before: captured receivers,
    // compact result guards, and proxy surfaces whose raw hop is already handled.
    let helper = null;
    if (decision.capture || decision.compactMethod
      || (!callee.computed && callee.property?.type === 'Identifier' && holdsProxySurface(calleeObject, metaPath))) {
      const calleePath = nodePathInScope(callee, metaPath.scope, ['MemberExpression']) ?? metaPath;
      const { result: probe } = resolvePureOrGlobalFallback({
        kind: 'property',
        object: splitReceiverTypeHint(callee.object, metaPath),
        key: callee.computed ? resolveKey({
          node: callee.property,
          computed: true,
          scope: calleePath.scope,
          adapter,
          path: calleePath,
          bailOnSideEffectKey: true,
        }) : callee.property?.name,
        placement: 'prototype',
      }, calleePath);
      if (probe?.kind === 'instance') helper = identifier(injectPureImport(probe.entry, probe.hintName));
    }
    return renderOptionalCallSplit({
      node, callee, metaPath, helper,
      decision: receiverSplit ? { ...decision, firstReceiver: receiverSplit.receiver } : decision,
      checks: receiverSplit?.disjuncts,
    });
  }

  // one OPTIONAL member hop of the split: the guard, the proxy-surface drop, the
  // proven chains - extracted from the recursion for its size
  function splitOptionalMemberHop(node, metaPath) {
    // the `?.` tests a value that COLLAPSES to a pure CTOR binding - the polyfill makes it
    // always-defined, so the guard is dead and the hop reads straight off the ponyfill
    // (`globalThis.Map?.list.at(0)` -> `_at(_ref = _Map.list).call(_ref, 0)`, babel's
    // flatten). an identifier-rooted navigation carries its effects ahead of that binding;
    // a call root keeps the memo route, which preserves the call's own guard spelling
    const deadCtorSwap = proxyGlobalMemberCtorPureSwap({
      receiver: node.object,
      aliasCtx: { scope: metaPath.scope, adapter, path: metaPath },
      resolvePure: meta => resolvePure(meta, metaPath),
    });
    // ... unless the navigation still owes an ENVIRONMENT PROBE: a live `?.` over a hop pure
    // cannot back short-circuits the whole read off-engine, and swapping the always-defined
    // ponyfill in its place answers a value where the source answers undefined
    // (`globalThis.window?.self?.Array.of(1)` must keep `null == _globalThis.window`)
    // asked THROUGH the seal: a paren or a TS cast around the navigation is printer trivia here, and
    // reading the sealed node raw answered "no live `?.`" for a nav whose probe the read still owes -
    // the swap then handed back the always-defined ponyfill where the source yields undefined
    // ... asked of the value canon, which sees the ROOT too: an alias holding a probe read short-
    // circuits at its own `?.` with every hop above it backed (`w?.self?.WeakSet.name` off
    // `w = globalThis.window`), and the hop census alone called that nav always-defined
    const probedNavObject = unwrapRuntimeExpr(node.object);
    const probedNav = navValueCanShortCircuit(probedNavObject, m => resolvePure(m, metaPath),
      { scope: metaPath.scope, adapter, path: metaPath });
    const navAliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
    const navRoot = deadCtorSwap && findProxyGlobal(node.object, navAliasCtx, true);
    if (deadCtorSwap && (!deadCtorSwap.se.length || navRoot) && !probedNav) {
      // an ALIAS root keeps its OWN binding and only drops the hops (the alias canon): landing the
      // leaf ponyfill here would re-root the read on a binding the source never named, where every
      // other spelling of the same nav keeps the alias (`ga.window.self?.Array.prototype`)
      // ... only where the swapped leaf is a PROXY HOP: a CTOR leaf names its own ponyfill and the
      // alias cannot stand for it (`g.Set?.foo` reads `_Set.foo`, never `g.foo`)
      const base = POSSIBLE_GLOBAL_OBJECTS.has(deadCtorSwap.pure.hintName)
        && isAliasProxyRoot(navRoot, navAliasCtx) ? cloneNode(navRoot)
        : identifier(injectPureImport(deadCtorSwap.pure.entry, deadCtorSwap.pure.hintName));
      return {
        hopKind: 'member',
        disjuncts: [],
        receiver: stampReplacementSpan(memberExpression(withSideEffects(base, deadCtorSwap.se),
          cloneNode(node.property), { computed: node.computed }), node),
      };
    }
    const surfaceHeld = holdsProxySurface(node.object, metaPath);
    const surfaceHop = surfaceHeld ? proxyHopKey(node, { allowOptional: true, metaPath }) : null;
    const leafKey = node.computed ? null : node.property?.name ?? null;
    // a hop off a selection the build decides re-reads the name it folds to (`decidedReusableReceiver`), the
    // other leg's chain-base memo: the read above it then takes the identity guard that name's read takes
    const decided = decidedReusableReceiver(node.object, { ...navAliasCtx, injectorState });
    const { disjuncts, makeBase } = decided ? { disjuncts: [cloneNode(node.object)], makeBase: () => cloneNode(decided) }
      : guardObject(node.object, metaPath, {
        bareMemo: !!surfaceHop,
        mutatedLeaf: !!leafKey && isMutatedGlobalSlot(adapter, leafKey),
        readerKey: leafKey,
      });
    // a pristine hop read off a guarded PROXY-surface value drops - `(q = gw)?.self
    // .Array` reads `_ref.Array` (window.self is the same surface, babel's kept canon).
    if (surfaceHop) {
      return { hopKind: 'member', disjuncts, receiver: makeBase(), proxySurface: true };
    }
    // a key that names a pure CTOR is answered by the substitution below, never by the chain
    // respell: respelled off the memo it reads the constructor off the ponyfill surface, which is
    // the polyfill this claim exists for
    const surfaceCtorPure = surfaceHeld && !node.computed && node.property?.type === 'Identifier'
      ? surfaceCtorPureForKey(node.property.name) : null;
    // a guarded base holding a PROVEN global through an ALIAS surfaces its statics: the
    // hops above are the same claim they were before the memo (`(w = g)?.Array.of(1)` -
    // babel requeues the memo and resolves `_Array$of`). the DIRECT spellings belong to
    // the older guarded-nav routes - only the alias gap rides the chain up
    // a SEQ-wrapped base rides the chain too: the older guarded-nav routes stage
    // sequence wrappers out, so nothing else resolves its statics
    if (!surfaceCtorPure && !node.computed && node.property?.type === 'Identifier'
      && (!holdsProxySurface(node.object, metaPath)
        || unwrapRuntimeExpr(node.object)?.type === 'SequenceExpression')) {
      // the base VALUE folds through effectful sequence tails and kept writes - the
      // memo test keeps their spelling, the chain only needs the surface they yield
      let baseValue = unwrapRuntimeExpr(node.object);
      for (;;) {
        if (baseValue?.type === 'SequenceExpression') {
          baseValue = unwrapRuntimeExpr(baseValue.expressions.at(-1));
          continue;
        }
        const dechained = peelChainAssignmentDeep(baseValue);
        if (dechained === baseValue) break;
        baseValue = unwrapRuntimeExpr(dechained);
      }
      const aliasName = resolveObjectName({ objectNode: baseValue, scope: metaPath.scope, adapter, path: metaPath });
      if (aliasName && POSSIBLE_GLOBAL_OBJECTS.has(aliasName) && isPristineProxyGlobal(adapter, aliasName)) {
        return {
          hopKind: 'member', disjuncts, receiver: makeBase(),
          provenChain: [node.property.name], provenBase: makeBase,
        };
      }
    }
    // a resolvable CTOR read off the guarded SURFACE base substitutes its pure
    // (`(n = gw)?.WeakSet` -> `_WeakSet` in the alternate - babel's requeue resolves
    // it off the memo); a MUTATED slot keeps the live read off the memo (`_ref.Set`)
    if (surfaceCtorPure) {
      return {
        hopKind: 'member', disjuncts,
        receiver: identifier(injectPureImport(surfaceCtorPure.entry, surfaceCtorPure.hintName)),
      };
    }
    const receiver = stampReplacementSpan(
      memberExpression(makeBase(), cloneNode(node.property), { computed: node.computed }), node);
    return { hopKind: 'member', disjuncts, receiver };
  }

  // split a receiver chain at its LAST-evaluated optional hop: the guard disjuncts hoist
  // into the caller's ternary test and the returned receiver is the de-optionalized spine
  // rebuilt over the guarded base. hops the split leaves RAW inside a memo (`_g = arr.flat`)
  // are the walker's descent problem: it re-visits the replacement and polyfills them in
  // place, which is what composes `null == (_ref = _flatMaybeArray(arr)) ? ...` without any
  // chain orchestration. returns null when the spine carries no optional (an args-only `?.`
  // or a paren-sealed sub-chain: the standalone path treats those receivers as opaque)
  function splitOptionalReceiver(node, metaPath) {
    const split = splitOptionalReceiverInner(node, metaPath);
    // a proven chain nothing above consumed respells its hops off the memo base
    // (`(w = g)?.Array` terminal - the `.Array` read must survive)
    if (split && split !== STAGED_SPLIT && split.provenChain) {
      let spelled = split.provenBase();
      for (const key of split.provenChain) {
        // the same substitution the hop route makes: a respelled CTOR key would read the
        // constructor off the memoized ponyfill surface
        const ctorPure = surfaceCtorPureForKey(key);
        spelled = ctorPure ? identifier(injectPureImport(ctorPure.entry, ctorPure.hintName))
          : memberFromKeyName(spelled, key);
      }
      return { hopKind: split.hopKind, disjuncts: split.disjuncts, receiver: spelled };
    }
    return split;
  }

  // the proven chain, spelled: a hop naming a polyfillable CTOR is answered by its own substitution,
  // never by a respell off the memo - read off `_ref` it is the native constructor on exactly the
  // hosts the ponyfill exists for. the hops above it keep their source spelling off that binding
  function spellProvenChain(inner) {
    let chainKeys = inner.provenChain;
    // a PRISTINE proxy hop names the surface the base already holds (`globalThis`, `self` and
    // `window` are one object), so it drops here exactly as it drops on the surface route - spelled
    // off the memo it reads an engine `window` the ponyfill exists to stand in for
    while (chainKeys.length && isPristineProxyGlobal(adapter, chainKeys[0])
      && !surfaceCtorPureForKey(chainKeys[0])) chainKeys = chainKeys.slice(1);
    const chainCtor = chainKeys.length ? surfaceCtorPureForKey(chainKeys[0]) : null;
    let spelled = inner.provenBase();
    if (chainCtor) {
      spelled = identifier(injectPureImport(chainCtor.entry, chainCtor.hintName));
      chainKeys = chainKeys.slice(1);
    }
    for (const key of chainKeys) spelled = memberFromKeyName(spelled, key);
    return spelled;
  }

  function splitOptionalReceiverInner(node, metaPath) {
    // a TS wrapper MID-CHAIN (`arr?.b!.c.d`) is transparent to the walk, and the rebuilt
    // receiver keeps it - the assertion is source text babel carries into the memo
    if (TS_EXPR_WRAPPERS.has(node.type)) {
      const wrapped = splitOptionalReceiverInner(node.expression, metaPath);
      if (!wrapped || wrapped === STAGED_SPLIT) return wrapped;
      return { ...wrapped, receiver: { ...cloneNode(node), expression: wrapped.receiver } };
    }
    if (node.type === 'CallExpression') {
      if (node.optional) return splitOptionalCallReceiver(node, metaPath);
      const inner = splitOptionalReceiverInner(node.callee, metaPath);
      if (!inner || inner === STAGED_SPLIT) return inner;
      let callee = inner.receiver;
      if (inner.provenChain) {
        // an unconsumed proven chain respells its hops before the call reads them
        callee = inner.provenBase();
        for (const key of inner.provenChain) callee = memberFromKeyName(callee, key);
      }
      return {
        hopKind: inner.hopKind,
        disjuncts: inner.disjuncts,
        receiver: callExpression(callee, node.arguments.map(argument => cloneNode(argument))),
      };
    }
    if (node.type === 'MemberExpression') {
      if (node.optional) {
        // a SECOND `?.` over the same surface folds into the first probe instead of
        // nesting a guard of its own (`(w)?.self?.self.Array` - both hops read the memo's
        // value, which the outer test already proved)
        // ... but only while the INNER probe is the live one: over a provably defined object
        // its guard is dead, and folding into it drops the hop this `?.` actually tests
        // (`globalThis?.window?.self.box` must test `_globalThis.window`, not `_globalThis`)
        // Only quiet keys enter the hop collapse; effectful keys keep their source slots.
        const foldKey = receiverCarriesOptional(node.object)
          ? proxyHopKey(node, { allowOptional: true, metaPath }) : null;
        const innerHop = foldKey ? unwrapRuntimeExpr(node.object) : null;
        // ... and only while the inner probe's own value stays SPELLABLE off the memo: a PLAIN
        // proxy nav collapses to a ponyfill, leaving no member read to re-run off the memo base,
        // so the inner hop renders its own guard and THAT is what the memo holds
        // (`globalThis.window?.self?.self.Array` memoizes `null == _globalThis.window ? void 0
        // : _self`). a write or an effect-bearing sequence has a spelling that MUST be kept
        // whole in the memo, and the hops fold onto it as before (`(sc++, p = globalThis.window)
        // ?.self?.self.Array`)
        const innerNav = unwrapRuntimeExpr(innerHop?.object);
        if (innerHop && !(innerNav?.type === 'MemberExpression' && holdsProxySurface(innerNav, metaPath))
          && (innerHop.type !== 'MemberExpression' || !innerHop.optional
            || guardProbeUndefinable(innerHop.object, { metaPath, adapter, resolvePure }))) {
          const surfaced = splitOptionalReceiverInner(node.object, metaPath);
          if (surfaced && surfaced !== STAGED_SPLIT && surfaced.proxySurface) return surfaced;
        }
        return splitOptionalMemberHop(node, metaPath);
      }
      const inner = splitOptionalReceiverInner(node.object, metaPath);
      if (!inner || inner === STAGED_SPLIT) return inner;
      if (inner.proxySurface && !node.computed && isPristineProxyGlobal(adapter, node.property?.name)) {
        return inner;
      }
      // a resolvable CTOR read off the surface memo substitutes its own pure inside the
      // alternate (`(o = gw)?.self.Map.prototype.has.name` -> `_Map.prototype.has`), the
      // same requeue the hop split does one level down; a MUTATED slot keeps the live read
      // a COMPUTED key folds the same way the proven-chain route already does: an SE-bearing
      // spelling keeps its prefix around the substituted ctor (`[(c += 1, 'Set')]` ->
      // `(c += 1, _Set)`), a quiet one resolves through the canonical key resolver
      const surfaceKey = inner.proxySurface
        ? (node.computed
          ? foldSeqKeyLiteralTail(node.property, { scope: metaPath.scope, adapter, path: metaPath })
            ?? foldedResolvedKey(node.property, metaPath, adapter)
          : node.property?.type === 'Identifier' ? { key: node.property.name, effects: [] } : null)
        : null;
      if (surfaceKey) {
        const ctorPure = surfaceCtorPureForKey(surfaceKey.key);
        if (ctorPure) {
          return {
            hopKind: inner.hopKind,
            disjuncts: inner.disjuncts,
            receiver: withSideEffects(identifier(injectPureImport(ctorPure.entry, ctorPure.hintName)),
              surfaceKey.effects),
          };
        }
      }
      if (inner.provenChain) {
        // two hops in: `<ctor>.<static>` resolves as the claim it spells - a SEQ-prefixed
        // computed key folds to its literal tail, the prefix riding the substitution
        // (`[(k++, 'values')]` -> `(k++, _Object$values)`, babel's requeue); an
        // unresolved pair falls back to the spelled members off the memo base
        const folded = node.computed ? foldSeqKeyLiteralTail(node.property, { scope: metaPath.scope, adapter, path: metaPath })
          : node.property?.type === 'Identifier' ? { key: node.property.name, effects: [] } : null;
        if (folded && inner.provenChain.length === 1) {
          const claim = resolvePure({
            kind: 'property', object: inner.provenChain[0], key: folded.key, placement: 'static',
          }, metaPath);
          if (claim && claim.kind !== 'instance') {
            return {
              hopKind: inner.hopKind,
              disjuncts: inner.disjuncts,
              receiver: withSideEffects(identifier(injectPureImport(claim.entry, claim.hintName)), folded.effects),
            };
          }
        }
        const spelled = spellProvenChain(inner);
        return {
          hopKind: inner.hopKind,
          disjuncts: inner.disjuncts,
          receiver: stampReplacementSpan(
            memberExpression(spelled, cloneNode(node.property), { computed: node.computed }), node),
        };
      }
      return {
        hopKind: inner.hopKind,
        disjuncts: inner.disjuncts,
        receiver: stampReplacementSpan(
          memberExpression(inner.receiver, cloneNode(node.property), { computed: node.computed }), node),
      };
    }
    return null;
  }

  // does this KEY name a constructor the read off a guarded proxy SURFACE substitutes? a
  // proxy-global name is a hop, not a claim, and a MUTATED slot keeps the live read off the memo.
  // one spelling for the three routes that spell a surface read: the hop split, the member arm
  // above it, and the proven-chain respell
  function surfaceCtorPureForKey(key) {
    return typeof key === 'string' && !POSSIBLE_GLOBAL_OBJECTS.has(key)
      && !isMutatedGlobalSlot(adapter, key) ? resolveGlobalPolyfill(key) : null;
  }

  // Native frame binding for the shared realm-value classifier.
  function holdsProxySurface(objectNode, metaPath = null) {
    return receiverHoldsProxySurface(objectNode, { path: metaPath, scope: metaPath?.scope, adapter });
  }

  // `recv.at(args)` -> `_at(recv).call(recv, args)`; `recv.at` -> `_at(recv)`; the receiver
  // memoizes through `var _ref;` when repeating it would re-run effects. the `?.` directly
  // at the member becomes the null-check conditional (`arr == null ? void 0 : ...` for a
  // reusable receiver, `null == (_ref = make()) ? void 0 : ...` for a memoized one - the
  // operand order is the legs' shared spelling), an optional CALL keeps its `?.` on `.call`
  // guard-comma fusion: the split's `(_r = X, _g = _r.m)` memo with a RESOLVING method -
  // the lookup absorbs the receiver memo (`_g = _mMaybe(_r = X)`), babel's nesting
  function fuseGuardCommaMemo({ metaPath, id }) {
    const assignUp = metaPath.parentPath?.node;
    const seqPath = metaPath.parentPath?.parentPath;
    if (assignUp?.type !== 'AssignmentExpression' || assignUp.right !== metaPath.node
      || !seqPath?.node || !guardCommaMemos.has(seqPath.node)) return false;
    const [recvAssign] = seqPath.node.expressions;
    markRewrite();
    const consumed = seqPath.node;
    const recvClone = cloneNode(recvAssign);
    // the memo build may have claim-suppressed the receiver's proxy-surface hops (the memo
    // holds the VALUE, babel keeps the hops spelled) - the fresh clone inherits those marks
    for (let orig = unwrapRuntimeExpr(recvAssign.right), copy = unwrapRuntimeExpr(recvClone.right);
      orig?.type === 'MemberExpression' && copy?.type === 'MemberExpression';
      orig = unwrapRuntimeExpr(orig.object), copy = unwrapRuntimeExpr(copy.object)) {
      if (skippedNodes.has(orig)) skippedNodes.add(copy);
    }
    seqPath.replaceWith(assignmentExpression('=', cloneNode(assignUp.left),
      callExpression(identifier(id), [recvClone])));
    markSubtreeSkipped(skippedNodes, consumed);
    return true;
  }

  // one guard test out of the split's CHECKS and the member-optional one; the spelling rule
  // (single test ident-first, a chain literal-first) is the render canon's
  function composeGuardTest(guardChecks, check) {
    return composeNullGuardTest([...guardChecks ?? [], ...check ? [check] : []]);
  }

  // Receiver copies retain the source frame and resolved type; arguments and effects keep
  // their own live claims. The provider owns the placement of every embedded slot.
  function cloneCallSlot(node, role) {
    return role === 'argument' || role === 'effect' ? cloneNode(node) : cloneStamped(node, typeStampCtx);
  }

  // the receiver / guard spelling of one instance dispatch: how the lookup argument and the
  // `this` slot re-read or memoize the receiver, and where the member-optional null test
  // lands (its memo joins split disjuncts when the split ran)
  function resolveDispatchSpelling({
    metaPath, effObject, memberOptional, isCall, guardDisjuncts,
    sourceReceiver = effObject, sideEffects = [], receiverEffectCount = 0, args = [], optional = false,
  }) {
    // source parens are printer trivia - the reusability question and the re-spelled
    // receiver both read through them (`(arr).at(0)` -> `_at(arr).call(arr, 0)`); TS
    // casts stay (the `satisfies` memo canon)
    while (effObject?.type === 'ParenthesizedExpression') effObject = effObject.expression;
    const runtimeReceiver = unwrapRuntimeExpr(effObject);
    const receiverSequence = runtimeReceiver?.type === 'SequenceExpression' ? peelNestedSequenceExpressions(runtimeReceiver) : null;
    let receiver = receiverSequence?.tail ?? runtimeReceiver;
    const objectSequence = isMemberAccessNode(receiver) ? peelNestedSequenceExpressions(receiver.object) : null;
    const keySequence = isMemberAccessNode(receiver) && receiver.computed ? peelNestedSequenceExpressions(receiver.property) : null;
    // Prove the quiet static value through the same shared handoff. Original object
    // and key prefixes stay in its first evaluation, ahead of the stable static value.
    const objectTail = objectSequence?.tail;
    const objectKeySequence = isMemberAccessNode(objectTail) && objectTail.computed
      ? peelNestedSequenceExpressions(objectTail.property) : null;
    const objectKey = objectKeySequence && staticMemberKeyName({ ...objectTail, property: objectKeySequence.tail });
    // A realm key keeps its effects in the source read; a quiet proof view must not
    // manufacture the removed collapse. Ordinary static leaf keys still use this slot.
    const quietObject = typeof objectKey === 'string' && !POSSIBLE_GLOBAL_OBJECTS.has(objectKey)
      ? memberFromKeyName(unwrapRuntimeExpr(objectTail.object), objectKey, { optional: objectTail.optional === true }) : objectTail;
    const staticKey = objectSequence && staticMemberKeyName(keySequence ? { ...receiver, property: keySequence.tail } : receiver);
    const pureView = typeof staticKey === 'string'
      ? memberFromKeyName(quietObject, staticKey, { optional: receiver.optional === true }) : receiver;
    // The quiet proof view cannot retire a live optional or a sealed source throw.
    const receiverCtx = { scope: metaPath.scope, path: metaPath, adapter, injectorState };
    const pure = !navValueCanShortCircuit(effObject, meta => resolvePure(meta, metaPath), receiverCtx)
      && !chainSealsAShortCircuit(effObject, meta => resolvePure(meta, metaPath), receiverCtx)
      && instanceSynthReceiverPure(pureView, { ...receiverCtx, resolvePure: meta => resolvePure(meta, metaPath) });
    if (pure) {
      receiver = identifier(injectPureImport(pure.entry, pure.hintName));
      const prefix = [
        ...receiverSequence?.prefix ?? [],
        ...objectSequence?.prefix ?? [],
        ...objectKeySequence?.prefix ?? [],
        ...keySequence?.prefix ?? [],
      ];
      const effects = observableSequenceElements(prefix, receiverCtx, { preserveSourceReads: true });
      effObject = effects.length ? sequenceExpression([...effects.map(effect => cloneNode(effect)), cloneNode(receiver)]) : receiver;
    } else if (!receiverSequence) receiver = effObject;
    if (!memberOptional && isCall) return {
      callDecision: planMethodCall({
        receiver: effObject, sourceReceiver, sideEffects, receiverEffectCount, args, optional, ctx: receiverCtx,
      }),
      check: null,
      guardDisjuncts,
    };
    // A current-pass pure import owns its stable receiver binding. An inherited import
    // hint alone does not prove that the adjacent reads still name the same value.
    const mintedImport = receiver.type === 'Identifier' && !!bindingPolyfillHint({
      binding: adapter.getBinding({ scope: metaPath.scope, name: receiver.name, path: metaPath, read: receiver }),
      scope: metaPath.scope,
      name: receiver.name,
      adapter,
    });
    const reusable = isReusableReceiver(receiver, {
      ctx: {
        scope: metaPath.scope,
        path: metaPath,
        adapter,
        injectorState,
      },
    }) && (!mintedImport || injectorState.isOwnPassPureBinding(receiver.name));
    let check = null;
    let lookupArg;
    let callReceiver;
    if (memberOptional) {
      // The extracted receiver keeps its own chain seal; the shared memo owns its first read.
      const peeledMemo = reusable ? effObject : cloneSpinePeeled(effObject);
      const firstReceiver = !reusable && receiverCarriesOptional(effObject) ? chainExpression(peeledMemo) : peeledMemo;
      const memo = renderReceiverMemo({ firstReceiver, receiver, capture: !reusable }, {
        mintRef: () => injector.generateDeclaredRef(metaPath),
        embed: (source, role) => role === 'capture' ? source : cloneStamped(source, typeStampCtx),
      });
      check = memo.firstRead;
      if (!reusable && guardDisjuncts) {
        guardDisjuncts = [...guardDisjuncts, check];
        check = null;
      }
      lookupArg = memo.makeBase();
      callReceiver = memo.makeBase();
    } else {
      lookupArg = cloneStamped(effObject, typeStampCtx);
    }
    return { check, lookupArg, callReceiver, guardDisjuncts };
  }

  // dead `?.` hops erase before the split (the shared vestigial verdict), inside three
  // boundaries: the hop's OBJECT spine is pristine proxy down to a resolvable root, no
  // MUTATED static sits in the chain, and only a LITERAL IIFE proves through a call
  function eraseVestigialReceiverOptionals({ memberOptional, object, metaPath }) {
    if (memberOptional || !receiverCarriesOptional(object)) return;
    // A nested sequence is the established value boundary for optional receivers.  Keep the
    // guard even when its tail is a write that will later collapse to a realm ponyfill; the
    // outer read still owns the nested evaluation shape.
    for (let cur = unwrapRuntimeExpr(object); cur?.type === 'MemberExpression';
      cur = unwrapRuntimeExpr(cur.object)) {
      if (cur.optional && nestedSequenceValueSpelling(cur.object)) return;
    }
    function surfaceObject(node) {
      // a KEPT WRITE is transparent to the verdict: what flows is its VALUE
      // (`(w = globalThis)?.Array` - the erased `?.` reads the always-defined global)
      // a SEQUENCE root hands its TAIL value on, and the prefix effects fold into the
      // substituted spine (`(e++, globalThis)?.Set` erases, `e++` rides the collapsed read).
      // a tail that is itself a WRITE stays wrapped: the guard then answers over the write's
      // own subject, which is the non-sequence shape below (`(c++, p = globalThis.window)`)
      const seqTail = singleSequenceTail(node);
      const peeled = seqTail && peelChainAssignmentDeep(seqTail) === seqTail
        ? seqTail : unwrapRuntimeExpr(node);
      let cur = peelChainAssignmentDeep(peeled);
      const throughWrite = cur !== peeled;
      // a SEQUENCE stored BY the write hands its tail on the same way a bare one does - the
      // value the write keeps is that tail (`(s = (e++, globalThis.self))?.self`)
      if (throughWrite) cur = singleSequenceTail(cur, { nested: true }) ?? cur;
      while (cur?.type === 'MemberExpression') {
        if (!proxyHopKey(cur, { allowOptional: true, metaPath })) return false;
        // a kept write UNDER the hops is as transparent as one above them
        // (`((r = globalThis).self)?.Array` - the erased `?.` reads the pure root), and so is a
        // sequence handing its tail on (`(e++, globalThis.self).window?.Array`)
        cur = peelChainAssignmentDeep(unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object)));
      }
      if (cur?.type === 'Identifier') {
        // binding-aware like the ctor arm below: a SHADOWED realm name holds the user's object
        if (POSSIBLE_GLOBAL_OBJECTS.has(cur.name)) {
          return isPristineProxyGlobal(adapter, cur.name) && !adapter.getBinding?.({
            scope: metaPath.scope,
            name: cur.name,
            path: metaPath,
          });
        }
        // an ALIAS binding answers the same as the direct spelling, the realm hops above it
        // included - but never through a kept write, which is where babel's own erase stops
        // (`(e++, g.self)?.` erases, `(a = gw)?.` keeps)
        if (!throughWrite) {
          const aliased = resolveObjectName({ objectNode: cur, scope: metaPath.scope, adapter, path: metaPath });
          if (aliased && POSSIBLE_GLOBAL_OBJECTS.has(aliased) && isPristineProxyGlobal(adapter, aliased)) return true;
        }
        // a RESOLVABLE global ctor substitutes to its always-defined pure - the `?.`
        // over it is dead (`Promise?.X.flat?.()` reads `_Promise.X`)
        return !adapter.getBinding?.({ scope: metaPath.scope, name: cur.name })
          && !isMutatedGlobalSlot(adapter, cur.name) && !!resolveGlobalPolyfill(cur.name);
      }
      if (cur?.type === 'CallExpression' && !cur.optional) {
        // a LITERAL IIFE proves through the call; a NAMED callee proves only inside a
        // kept write (`(u = g())?.Array` erases, bare `dh().self?.` keeps its guard -
        // babel's erase stops at named bindings outside the write shape), and its yield
        // must be a defined proxy global (const-arrow followed by the call canon)
        const callee = unwrapRuntimeExpr(cur.callee);
        const literalCallee = callee?.type === 'ArrowFunctionExpression' || callee?.type === 'FunctionExpression';
        if (literalCallee) {
          const rootName = resolveObjectName({ objectNode: cur, scope: metaPath.scope, adapter, path: metaPath });
          return !!rootName && POSSIBLE_GLOBAL_OBJECTS.has(rootName) && isPristineProxyGlobal(adapter, rootName);
        }
        return throughWrite
          && !!inlineCallProxyGlobalRoot({
            callNode: cur,
            scope: metaPath.scope,
            adapter,
            path: metaPath,
            rejectConditional: true,
          })
          && !guardProbeUndefinable(cur, { metaPath, adapter, resolvePure });
      }
      return false;
    }
    // the walk stops at a call; the `?.` under its CALLEE is the same navigation
    // (`(w = globalThis)?.Array.of(5)` - the hop sits below `.of`), so descend there - and on
    // through a plain member reading such a call's result, which continues that same chain
    // (`globalThis.self?.window?.Array.from(x).map(f)` - the hops sit below `.from`)
    let navNode = object;
    for (let peeled = unwrapRuntimeExpr(navNode); peeled?.type === 'CallExpression' && !peeled.optional;
      peeled = unwrapRuntimeExpr(navNode)) {
      navNode = peeled.callee;
      const callee = unwrapRuntimeExpr(navNode);
      if (callee?.type === 'MemberExpression' && !callee.optional
        && unwrapRuntimeExpr(callee.object)?.type === 'CallExpression') navNode = callee.object;
    }
    const deadHops = vestigialNavOptionals(navNode, m => resolvePure(m, metaPath),
      { scope: metaPath.scope, adapter, path: metaPath });
    // a dead hop erases only when PROVABLE (its object collapses to a defined surface or
    // the hop itself is a resolvable claim); any optional hop that is not both dead and
    // provable is LIVE, and a live hop keeps the memo's source spelling whole - the dead
    // `?.` rides it un-erased (`(Promise?.foo)?.bar` memoizes `_ref = _Promise?.foo`)
    function hopProvable(hop) {
      const written = unwrapRuntimeExpr(hop.object);
      // a kept WRITE proves through the shared store verdict - the value the store hands on is
      // always defined once substituted (`(g = globalThis, v = g.self)?.X` erases); a SEQUENCE
      // hands its tail on, so the store may sit under one and the verdict peels it the same way
      const storeCore = unwrapRuntimeExpr(peelReceiverSequenceTail(written));
      if (storeCore?.type === 'AssignmentExpression' && storedProxyNavProvesHop(storeCore,
        { scope: metaPath.scope, adapter, path: metaPath, resolve: m => resolvePure(m, metaPath) })) return true;
      // ... and a store the verdict did NOT prove declines on a BINDING value outright
      // (`(n = gw)?.self` keeps its guard): what an unproven alias holds is the write's business,
      // and the arms below must not re-derive it from the name
      if (written?.type === 'AssignmentExpression') {
        const stored = unwrapRuntimeExpr(peelChainAssignmentDeep(written));
        if (stored?.type === 'Identifier' && !POSSIBLE_GLOBAL_OBJECTS.has(stored.name)) return false;
      }
      // a `?.` whose probe IS a bare call keeps its guard - proving WHICH global a call
      // yields is not proving it yields a DEFINED one (the strict opaque-root canon);
      // only a KEPT WRITE of the call value erases (`(u = g())?.` - the write observes)
      if (unwrapRuntimeExpr(hop.object)?.type === 'CallExpression') return false;
      const hopKeyName = !hop.computed && hop.property?.name;
      if (hopKeyName && POSSIBLE_GLOBAL_OBJECTS.has(hopKeyName)
        && !isPristineProxyGlobal(adapter, hopKeyName, { node: hop, path: metaPath })) return false;
      if (chainContainsMutatedStatic(hop.object, { metaPath, adapter })) return false;
      // a hop that ITSELF resolves as a static claim substitutes to an always-defined
      // import - its `?.` is as dead as the call-twin's (`Array?.from(x).at(0)` erases), the claim
      // asked of the hop it reads (a read ahead of every write of the global's slot is served).
      // named by its sequence TAIL, as the surface arm below reads one: the claim keeps the
      // prefix, and a selection the build decides behind it names its operand
      // (`(n++, Map || Set)?.groupBy` reads `Map.groupBy`, as its unprefixed twin does)
      if (hopKeyName && hop.property?.type === 'Identifier') {
        const hopObjName = resolveObjectName({
          objectNode: peelReceiverSequenceTail(hop.object),
          scope: metaPath.scope,
          adapter,
          path: metaPath,
        });
        if (hopObjName && !adapter.isMutatedStatic?.(hopObjName, hopKeyName, { node: hop, path: metaPath })) {
          const hopClaim = resolvePure({
            kind: 'property', object: hopObjName, key: hopKeyName, placement: 'static',
          }, metaPath);
          if (hopClaim && hopClaim.kind !== 'instance') return true;
        }
      }
      return surfaceObject(hop.object);
    }
    const provable = new Set(deadHops.filter(hop => hopProvable(hop)));
    let liveHops = false;
    for (let cur = unwrapRuntimeExpr(navNode); cur?.type === 'MemberExpression';
      cur = unwrapRuntimeExpr(cur.object)) {
      if (cur.optional && !provable.has(cur)) liveHops = true;
    }
    if (!liveHops) for (const hop of provable) hop.optional = false;
  }

  // does this memo's value navigate the REALM - a chain bottoming out on a proxy global, minted or
  // bare? the fold below is `X.self === X`, true of the realm object and of nothing else, so the
  // proof is what keeps a user object with a `self` slot of its own from losing it
  function memoHoldsTheRealm(value, metaPath) {
    // a kept WRITE hands its own value on, so the proof reads through it
    let root = peelChainAssignmentDeep(unwrapRuntimeExpr(value));
    while (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') {
      const key = root.computed ? computedKeyStaticName(root) : root.property?.name ?? null;
      if (key === null || !POSSIBLE_GLOBAL_OBJECTS.has(key)) return false;
      root = peelChainAssignmentDeep(unwrapRuntimeExpr(root.object));
    }
    if (root?.type !== 'Identifier') return false;
    // either spelling: the walk may or may not have substituted the root by the time a split memo is
    // built, and a MINTED name carries its realm in the import it was minted from. a bare one is the
    // realm only while nothing shadows it
    return !!mintedProxyGlobalName(root.name, injectorState)
      || (isPristineProxyGlobal(adapter, root.name) && !adapter.getBinding?.({ scope: metaPath.scope, name: root.name, path: metaPath }));
  }

  // the realm hops a SPLIT receiver reads off its own MEMO. inside the guard's alternate that memo is
  // provably the realm object the probe yielded, and `X.self` IS `X` there - so the hop folds onto it
  // when its key is quiet. The fold stops at the first hop that is not a realm self-reference,
  // and stands down entirely when the leaf names a pure CONSTRUCTOR - that nav whole-swaps to the
  // ctor's own binding, and folding under it would leave a native read of the ctor off the memo
  function foldRealmHopsOverSplitMemo(receiverNode, disjuncts, metaPath) {
    const memoNames = new Set((disjuncts ?? [])
      .filter(disjunct => disjunct?.type === 'AssignmentExpression' && disjunct.left?.type === 'Identifier'
        && memoHoldsTheRealm(disjunct.right, metaPath))
      .map(disjunct => disjunct.left.name));
    if (!memoNames.size) return receiverNode;
    const hops = [];
    let base = unwrapRuntimeExpr(receiverNode);
    while (base?.type === 'MemberExpression') {
      hops.unshift(base);
      base = unwrapRuntimeExpr(base.object);
    }
    if (base?.type !== 'Identifier' || !memoNames.has(base.name)) return receiverNode;
    let folding = true;
    let rebuilt = base;
    for (const hop of hops) {
      const key = hop.computed ? foldSeqKeyLiteralTail(hop.property)?.key ?? null
        : hop.property?.type === 'Identifier' ? hop.property.name : null;
      if (folding && proxyHopKey(hop, { metaPath, allowOptional: true })) continue;
      if (folding && key !== null && resolvePure({ kind: 'global', name: key }, metaPath)) return receiverNode;
      folding = false;
      rebuilt = memberExpression(rebuilt, hop.property, { computed: hop.computed, optional: hop.optional });
    }
    return rebuilt === base ? receiverNode : rebuilt;
  }

  // eslint-disable-next-line max-statements -- sequential emission steps of one instance claim
  function replaceInstanceLike({ metaPath, id, sideEffects = [], receiverEffectCount = 0 }) {
    const memberNode = metaPath.node;
    if (fuseGuardCommaMemo({ metaPath, id })) return true;
    if (isDeleteOperand(metaPath)) return false;
    // the caller past transparent wrappers; `calleeIsMember` holds when the call's callee
    // unwraps to exactly this member (the paren-lookup class included)
    const callerPath = climbToCallerPath(metaPath);
    const parent = callerPath?.node;
    const isCall = (parent?.type === 'CallExpression' ? unwrapRuntimeExpr(parent.callee) : null) === memberNode;
    const callOptional = isCall && parent.optional;
    // the member's own `?.` is DEAD over a value the polyfill makes always-defined - a pure CTOR
    // binding: it erases with the substitution, and a guard there would test a binding that
    // cannot be nullish (`globalThis.WeakMap?.name` -> `_nameMaybeFunction(_WeakMap)`)
    const deadCtorOptional = memberNode.optional === true && proxyGlobalMemberCtorPureSwap({
      receiver: memberNode.object,
      aliasCtx: { scope: metaPath.scope, adapter, path: metaPath },
      resolvePure: m => resolvePure(m, metaPath),
    });
    const memberOptional = memberNode.optional === true
            && !(deadCtorOptional && !deadCtorOptional.se.length);
    const { object } = memberNode;
    // a DEAD ctor optional means a SECOND `?.` sits in the chain: the tail collapses to
    // the pure ctor either way, so babel calls the whole nav vestigially defined and the
    // receiver's own guard drops with it (`(call)?.self.WeakMap?.name` -> `_name(_WeakMap)`)
    const deadCtorSwap = deadCtorOptional && !deadCtorOptional.se.length
            && receiverCarriesOptional(object) ? deadCtorOptional.pure : null;
    eraseVestigialReceiverOptionals({ memberOptional, object, metaPath });
    const { splitSource, rewrapNonNull } = peelNonNullWraps(object);
    let guardDisjuncts = null;
    let effObject = deadCtorSwap
      ? identifier(injectPureImport(deadCtorSwap.entry, deadCtorSwap.hintName)) : object;
    if (deadCtorSwap) markSubtreeSkipped(skippedNodes, object);
    else if (!memberOptional) {
      const split = splitOptionalReceiver(splitSource, metaPath);
      if (split === STAGED_SPLIT) return false;
      if (split) {
        ({ disjuncts: guardDisjuncts } = split);
        effObject = foldRealmHopsOverSplitMemo(rewrapNonNull(split.receiver), guardDisjuncts, metaPath);
      }
    } else if (receiverCarriesOptional(object)) {
      // a receiver whose LAST optional hop is a CALL splits (the dispatch memo guards as its
      // own disjunct, the member-optional memo joins it); one ending on an optional MEMBER
      // stays whole - its memo IS the guard (`null == (_ref = a?.b)`), and the descent
      // recursion builds the nesting inside it
      // ... unless a DEEPER optional segment sits below that member: the memo would hold that
      // segment's own rendered guard, where the disjunct chain joins both in ONE test
      // (`arr.flat?.()?.flatMap(f)?.at(0)`)
      const split = splitOptionalReceiver(splitSource, metaPath);
      if (split === STAGED_SPLIT) return false;
      const splitCall = unwrapRuntimeExpr(splitSource);
      const splitHop = splitCall?.type === 'CallExpression'
              ? unwrapRuntimeExpr(splitCall.callee) : null;
      const splitHopKey = splitHop?.type === 'MemberExpression'
              ? (splitHop.computed ? foldSeqKeyLiteralTail(splitHop.property)?.key ?? null
                : splitHop.property?.type === 'Identifier' ? splitHop.property.name : null)
              : null;
      // ... and only where THIS hop is a claim of its own: a raw member read has no
      // dispatch to hold the disjunct, so its whole segment memoizes as one value
      const splitHopClaim = typeof splitHopKey === 'string'
              && resolvePure({ kind: 'property', key: splitHopKey, placement: 'prototype' },
                metaPath)?.kind === 'instance';
      const deeperSegment = splitHopClaim && optionalCallSegmentBelow(splitHop.object);
      // a `?.()` whose callee is no claim of its own memoizes as WRITTEN, any `?.` below it
      // riding inside the memo (babel: `null == (_ref = box?.get?.())`); a rewritten dispatch
      // callee threads its disjuncts
      const splitCallCallee = splitCall?.type === 'CallExpression' && splitCall.optional === true
              ? unwrapRuntimeExpr(splitCall.callee) : null;
      const soleRootOptCall = !!splitCallCallee && !splitHopClaim;
      // ... and a PAREN-SEALED lookup keeps its whole segment in ONE memo: the `.call` rides
      // outside the ternary and reads `this` off that memo, so the split's second disjunct has
      // no reader (`(getArr().flat?.()?.flatMap)(f)` -> `_ref = _flat(_ref2 = getArr())?.call(_ref2)`)
      if (split && ((split.hopKind === 'call' && !soleRootOptCall) || deeperSegment)
        && !(isCall && !callOptional && calleeParenWrapped(parent))) {
        ({ disjuncts: guardDisjuncts } = split);
        effObject = rewrapNonNull(split.receiver);
      }
    }
    const spelling = resolveDispatchSpelling({
      metaPath, effObject, memberOptional, isCall, guardDisjuncts, sourceReceiver: object,
      sideEffects, receiverEffectCount, args: isCall ? parent.arguments : [], optional: callOptional,
    });
    const { check, lookupArg, callReceiver, callDecision } = spelling;
    ({ guardDisjuncts } = spelling);
    let built;
    const receiverCtx = { scope: metaPath.scope, path: metaPath, adapter, injectorState };
    // the paren-lookup twin under a guard: `(X?.nav.m)(args)` keeps the native throw on the
    // void branch - the guard wraps only the LOOKUP and `.call` rides the ternary
    // (`(test ? void 0 : _mMaybe(_ref = nav)).call(_ref, args)`)
    const parenWrapped = isCall && calleeParenWrapped(parent);
    const test = composeGuardTest(guardDisjuncts, check);
    const sealedLookup = isCall && parenWrapped && test && !callOptional;
    if (isCall) {
      // the `?.call` needs a chain wrapper of its own ONLY when the original chain does not
      // continue above: a continuing hop keeps riding the source ChainExpression, and sealing
      // the dispatch under a nested wrapper would cut the short-circuit off from the tail
      const upNode = callerPath.parentPath?.node;
      const chainContinues = upNode
        && ((upNode.type === 'MemberExpression' && upNode.object === parent)
          || (upNode.type === 'CallExpression' && upNode.callee === parent));
      built = renderMethodCall(callDecision ?? planMethodCall({
        receiver: callReceiver, prepared: true, optional: callOptional, args: parent.arguments, ctx: receiverCtx,
      }), {
        helper: identifier(id),
        lookup: callDecision ? null : callExpression(identifier(id), [lookupArg]),
        lookupGuard: sealedLookup ? test : null,
        chain: !chainContinues,
        mintRef: () => injector.generateDeclaredRef(metaPath),
        embed: cloneCallSlot,
      });
    } else {
      built = callExpression(identifier(id), [lookupArg]);
    }
    // the ORIGINAL node's resolved type travels to the replacement: a member ABOVE reads off
    // it, and untyped there the next claim resolves generic (`.name` off an array value
    // pulled the function-name ponyfill on this leg alone) - babel's resolvedType stamp
    // A discarded call value has no downstream type consumer.
    const returnType = isCall && valueIsDroppedAt(climbTransparentWrapperPath(callerPath))
      ? null : resolveNodeType(isCall ? callerPath : metaPath);
    if (returnType) resolvedType.set(built, returnType);
    markRewrite();
    replaceGuardedHop({
      hopPath: isCall ? callerPath : metaPath, test: sealedLookup ? null : test, built, skippedNodes, returnType, resolvedType,
    });
    return true;
  }

  // `(fn(), arr).at(0)` / `arr[(k(), 'at')](0)`: the harvested SE PEELS off - the dispatch
  // runs on the bare receiver tail and the effects re-run as a sequence prefix around it,
  // in source order. optional / memo-worthy shapes under SE are staged
  // eslint-disable-next-line max-statements -- sequential emission steps of one instance claim
  function emitInstanceWithPeeledSe(meta, metaPath, entry, hintName) {
    // an OPTIONAL SE-keyed member combines with its split receiver below - the memo joins
    // the disjuncts; a BARE reusable receiver is its own test, and nothing else carries one
    const { node } = metaPath;
    const memberOptional = node.optional === true;
    // a VESTIGIAL `?.` in the receiver is not a live one: the render below erases it anyway, so the
    // routing must not read the spelling it is about to discard. left un-erased, every arm here
    // saw a live optional, fell through to the staged bail and lost the claim outright - and the
    // stand-down it fell into only pays off where a resolvable inner claim CLIMBS over this node
    // and re-drives it, which the root-claim fold of an unbacked run never does
    eraseVestigialReceiverOptionals({ memberOptional, object: node.object, metaPath });
    const callerPath = climbToCallerPath(metaPath);
    const parent = callerPath?.node;
    // the climb finds the enclosing expression, which is a CALL only when this claim is its
    // CALLEE - an argument-position claim (`_name(x[(eff(), 'flat')])`, a sibling render's
    // own call) reads like the plain form, and rewriting the call would consume a span this
    // claim does not own
    const methodCall = parent?.type === 'CallExpression' && unwrapRuntimeExpr(parent.callee) === node;
    // the READ form (an SE computed key folding to a member read - the split's memo, a bare
    // read): `arr[(eff(), 'flat')]` -> `(eff(), _flatMaybeArray(arr))`
    // effects the receiver spelling ALREADY carries (a rescued chain-assign the earlier
    // claim spliced in) ride with it whole - `((v = g))?.Map.name` reads the rewritten
    // `(v = _globalThis, _Map)` once: `_nameMaybeFunction((v = _globalThis, _Map))`.
    // a receiver still carrying a live `?.` goes to the SPLIT below - its guard owns
    // the render and the write rides the memo test
    if (!memberOptional && !methodCall && meta.sideEffects?.length
      && !receiverCarriesLiveOptional(node.object)
      && meta.sideEffects.every(effect => subtreeContainsNode(node.object, effect))) {
      return emitSeCarryingReceiverRead({ node, metaPath, entry, hintName },
        { injectPureImport, markRewrite, skippedNodes });
    }
    // The ordinary handoff owns the complete first receiver and only re-reads its stable tail.
    // A receiver-only harvest needs no separate prefix replay before that lookup argument.
    if (meta.sideEffects?.length && meta.sideEffects.length <= (meta.receiverEffectCount ?? 0)
      && meta.sideEffects.every(effect => subtreeContainsNode(node.object, effect))) {
      return replaceInstanceLike({ metaPath, id: injectPureImport(entry, hintName) });
    }
    if (methodCall && !parent.optional && !memberOptional && !receiverCarriesOptional(node.object)) {
      return replaceInstanceLike({
        metaPath, id: injectPureImport(entry, hintName),
        sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
      });
    }
    const interveningEffects = (meta.sideEffects?.length ?? 0) > (meta.receiverEffectCount ?? 0);
    const receiverCtx = { scope: metaPath.scope, path: metaPath, adapter, injectorState };
    const receiverPure = instanceSynthReceiverPure(node.object, { ...receiverCtx, resolvePure: m => resolvePure(m, metaPath) });
    if (receiverPure) node.object = identifier(injectPureImport(receiverPure.entry, receiverPure.hintName));
    if (!memberOptional && !methodCall && isReusableReceiver(unwrapRuntimeExpr(node.object), { interveningEffects, ctx: receiverCtx })) {
      const receiver = unwrapRuntimeExpr(node.object);
      const id = injectPureImport(entry, hintName);
      markRewrite();
      replaceGuardedHop({
        hopPath: metaPath,
        test: null,
        built: withSideEffects(callExpression(identifier(id), [cloneNode(receiver)]),
          receiverPure || interveningEffects ? [cloneNode(receiver), ...meta.sideEffects] : meta.sideEffects),
        skippedNodes,
      });
      return;
    }
    if (!methodCall && meta.sideEffects?.length
      && !receiverCarriesOptional(node.object)) {
      emitSeKeyReadMemo({ node, metaPath, meta, entry, hintName }, seKeyReadCtx);
      return;
    }
    // an OPTIONAL method call lifts its harvested effects - and a SOURCE sequence prefix on
    // the receiver - ahead of the plain `?.call` dispatch, babel's shape:
    // `(a(), arr)[(k(), 'flat')]?.()` -> `(a(), k(), _flatMaybeArray(arr)?.call(arr))`
    if (methodCall && parent.optional && !memberOptional && !receiverCarriesOptional(node.object)) {
      return emitOptionalCallWithLiftedSe({ node, parent, callerPath, metaPath, meta, entry, hintName },
        {
          injectPureImport,
          markRewrite,
          skippedNodes,
          injector,
          injectorState,
          adapter,
          resolvePure,
          receiverPure,
        });
    }
    if (!methodCall && !memberOptional && receiverCarriesLiveOptional(node.object)
      && spineHoldsKeptWrite(node.object)
      && guardProbeUndefinable(node.object, { metaPath, adapter, resolvePure })
      && spineCarriesComputedHop(node.object)) {
      return emitSeReadFormOverLiveOptional({ node, metaPath, entry, hintName },
        {
          splitOptionalReceiver,
          stagedSplit: STAGED_SPLIT,
          injectPureImport,
          markRewrite,
          composeGuardTest,
          skippedNodes,
          foldRealmHopsOverSplitMemo,
        });
    }
    // a non-call instance READ over a live `?.` guarding a GENUINE probe, every harvested
    // effect inside the receiver: the ordinary split owns it - the receiver spelling rides
    // the guard test whole, the way a chain-assign receiver already does. the stand-down
    // below is for claims a resolvable inner claim re-drives; over an unresolvable probe
    // there is nobody, and standing down lost the claim outright (a raw `?.Map.name`)
    // ... and the question is about the receiver's LIVE `?.`, not about the value the whole
    // receiver yields: a chain ending on a BACKED read answers "defined" for its leaf while the
    // `?.` below it still tests the environment, and the value ask turned the arm away and lost
    // the claim (`f().window[(c++, 'window')]?.window.Array.name` kept every hop raw)
    // An excluded root has no later collapse to wait for either: the live split owns that read.
    if (!methodCall && !memberOptional && receiverCarriesLiveOptional(node.object)
      && (guardProbeUndefinable(node.object, { metaPath, adapter, resolvePure })
        || !navRootIsProxyIdentifier(node, metaPath, adapter, { requireBareName: true }))
      && (meta.sideEffects ?? []).every(effect => subtreeContainsNode(node.object, effect))) {
      const id = injectPureImport(entry, hintName);
      return replaceInstanceLike({ metaPath, id });
    }

    if (!methodCall || (parent.optional && !memberOptional)) return;
    // The proof view uses the nested tail; the first evaluation still carries the whole source.
    let receiver = peelReceiverSequenceTail(node.object);
    const tailPure = receiverPure ?? instanceSynthReceiverPure(receiver, { ...receiverCtx, resolvePure: m => resolvePure(m, metaPath) });
    if (tailPure) receiver = identifier(injectPureImport(tailPure.entry, tailPure.hintName));
    const receiverSequence = peelNestedSequenceExpressions(node.object);
    const renderedFirstReceiver = tailPure
      ? sequenceExpression([...receiverSequence.prefix, receiver]) : node.object;
    const ordinaryDecision = !memberOptional && planMethodCall({
      receiver: renderedFirstReceiver, sourceReceiver: node.object,
      sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
      args: parent.arguments, ctx: receiverCtx,
    });
    if (ordinaryDecision && !ordinaryDecision.capture) {
      const id = injectPureImport(entry, hintName);
      const dispatch = renderMethodCall(ordinaryDecision, { helper: identifier(id), embed: cloneCallSlot });
      markRewrite();
      callerPath.replaceWith(dispatch);
      return;
    }
    // a non-reusable receiver memoizes FIRST, then the harvested key SE, then the dispatch
    // on the memo - ECMA receiver-before-key; an optional-carrying receiver splits into the
    // guard and the memo seq rides the alternate:
    // `a.flat?.()[(eff(), 'k')](2)` -> `null == (_r = _flat(a)) ? void 0 :
    // (_r2 = _r.call(a), eff(), _k(_r2).call(_r2, 2))`
    let guardDisjuncts = null;
    let effReceiver = node.object;
    if (receiverCarriesOptional(node.object)) {
      const split = splitOptionalReceiver(node.object, metaPath);
      // A receiver value outside the split grammar can still ride its own optional
      // member's whole-value memo. Its effects stay inside that memo, and its nested
      // claims remain visitable instead of waiting for a later transform pass.
      if (split === null && memberOptional
        && (meta.sideEffects ?? []).every(effect => subtreeContainsNode(node.object, effect))) {
        return replaceInstanceLike({ metaPath, id: injectPureImport(entry, hintName) });
      }
      if (!split || split === STAGED_SPLIT) return;
      ({ disjuncts: guardDisjuncts, receiver: effReceiver } = split);
    } else if (memberOptional) {
      emitBareOptionalSeDispatch({ node, parent, callerPath, metaPath, meta, entry, hintName }, bareOptionalCtx);
      return;
    }
    const id = injectPureImport(entry, hintName);
    if (!memberOptional) {
      const decision = planMethodCall({
        receiver: effReceiver, sourceReceiver: node.object,
        sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
        args: parent.arguments, ctx: receiverCtx,
      });
      const dispatch = renderMethodCall(decision, {
        helper: identifier(id), mintRef: () => injector.generateDeclaredRef(metaPath), embed: cloneCallSlot,
      });
      markRewrite();
      replaceGuardedHop({
        hopPath: callerPath, test: composeGuardTest(guardDisjuncts, null),
        built: dispatch, skippedNodes,
      });
      return;
    }
    // The optional member's own guard captures the receiver before its key effects.
    const decision = planMethodCall({
      receiver: effReceiver,
      sideEffects: meta.sideEffects.filter(effect => !subtreeContainsNode(effReceiver, effect)),
      args: parent.arguments, ctx: receiverCtx,
    });
    const { checks, built } = renderGuardedMethodCall({ ...decision, capture: true }, {
      helper: identifier(id), mintRef: () => injector.generateDeclaredRef(metaPath), embed: cloneNode,
    });
    markRewrite();
    replaceGuardedHop({
      hopPath: callerPath, test: composeGuardTest([...guardDisjuncts ?? [], ...checks], null),
      built, skippedNodes,
    });
  }

  // `this.from(x)` / `super.of(x)` in static context resolve against the super class's
  // static surface: `_Array$from.call(this, x)` - the receiver stays the live constructor
  function emitInheritedStatic(meta, metaPath) {
    const callerPath = climbToCallerPath(metaPath);
    const parent = callerPath?.node;
    if (metaPath.node.optional) return;
    // a VALUE-position read swaps the member for the binding itself, dropping the `this`
    // bind with the read - babel's shape (`const f = this.from` -> `const f = _Array$from`);
    // a harvested effect has no slot in the bare swap, and `super`'s dispatch spelling
    // stays with the call form
    if (parent?.type !== 'CallExpression') {
      if (meta.receiverEffectCount || meta.sideEffects?.length
        || metaPath.node.object?.type === 'Super') return;
      const { result: valueResult } = resolvePureOrGlobalFallback(meta, metaPath);
      if (!valueResult) return;
      markRewrite();
      if (metaPath.node.computed) markSubtreeSkipped(skippedNodes, metaPath.node.property);
      metaPath.replaceWith(identifier(injectPureImport(valueResult.entry, valueResult.hintName)));
      return;
    }
    // a harvested KEY effect rides as a sequence prefix around the whole dispatch - the swap
    // erases the key spelling, and this is the slot that runs it exactly once, before the call
    // (`super[(fn(), 'try')](f)` -> `(fn(), _Promise$try.call(this, f))`). a RECEIVER effect
    // has no such slot here: `this` is the receiver and nothing else evaluates
    if (meta.receiverEffectCount) return;
    const { result } = resolvePureOrGlobalFallback(meta, metaPath);
    if (!result) return;
    const id = injectPureImport(result.entry, result.hintName);
    markRewrite();
    // an optional CALL of the substituted binding erases with it - the ponyfill is always
    // defined, so the short-circuit can never fire (`super.from?.([1])` reads the same as
    // its plain twin); the chain wrapper goes with the `?.` it carried
    const target = parent.optional && callerPath.parentPath?.node?.type === 'ChainExpression'
      ? callerPath.parentPath : callerPath;
    target.replaceWith(renderMethodCall(planMethodCall({
      receiver: { type: 'ThisExpression' }, prepared: true, methodGuarded: true, args: parent.arguments,
    }), { lookup: identifier(id), leadingEffects: meta.sideEffects, embed: cloneNode }));
  }

  return {
    composeGuardTest,
    emitInheritedStatic,
    emitInstanceWithPeeledSe,
    guardObject,
    holdsProxySurface,
    replaceInstanceLike,
    splitOptionalReceiver,
  };
}
