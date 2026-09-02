// the optional-dispatch channel of the usage-pure emitter: the `?.` split forms (a doubly
// optional call, an optional member hop, the receiver splits) and the instance/inherited
// dispatches with their guard spellings. created per transform over the factory's context
import {
  composableNavGuardPlan,
  findProxyGlobal,
  inlineCallHasObservableEffects,
  inlineCallProxyGlobalRoot,
  navValueCanShortCircuit,
  peelChainAssignment,
  peelChainAssignmentDeep,
  peelReceiverSequenceTail,
  proxyGlobalMemberCtorPureSwap,
  proxyReceiverValueCanBeUndefined,
  resolveKey,
  resolveObjectName,
  unwrapParensCollectingEffects,
  vestigialNavOptionals,
  peelChainRootValue,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { storedProxyNavProvesHop } from '@core-js/polyfill-provider/detect-usage/annotations';
import {
  POSSIBLE_GLOBAL_OBJECTS,
  TS_EXPR_WRAPPERS,
  isMemberAccessNode,
  isMutatedGlobalSlot,
  isPristineProxyGlobal,
  isReusableReceiver,
  mayHaveSideEffects,
  receiverCarriesLiveOptional,
  singleSequenceTail,
  unwrapRuntimeExpr,
  subtreeContainsNode,
  bindingPolyfillHint,
  isAliasProxyRoot,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  remapInheritedStaticMeta,
  staticMemberKeyName,
} from '@core-js/polyfill-provider/helpers/class-walk';
import {
  assignmentExpression,
  callExpression,
  chainExpression,
  cloneNode,
  composeNullGuardTest,
  identifier,
  literal,
  memberExpression,
  nullGuardTest,
  renderShortCircuitGuard,
  sequenceExpression,
} from './builders.js';
import {
  memberFromKeyName,
  mintedProxyGlobalName,
  receiverCarriesOptional,
  stampReplacementSpan,
  withSideEffects,
} from './emit-shared.js';
import { calleeParenWrapped, guardProbeUndefinable, optionalCallSegmentBelow, replaceGuardedHop } from './claim-guards.js';
import {
  LITERAL_RECEIVER_TYPES,
  chainContainsMutatedStatic,
  climbToCallerPath,
  cloneSpinePeeled,
  cloneStamped,
  foldSeqKeyLiteralTail,
  foldTailPristineProxyHops,
  foldedResolvedKey,
  isDeleteOperand,
  markSubtreeSkipped,
  memoizedCallResultType,
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

  // a dropped hop's base PROVEN always-defined makes the hop's `?.` dead: the memo folds
  // straight onto the ponyfill, keeping only what the base observably did - the seq-prefix
  // effects, and the call itself when its body or arguments carry any (`dh()?.self` memoizes
  // `_self`, `(c++, dh(a++))?.self` memoizes `(c++, dh(a++), _self)`) - the other leg's
  // spelling for this shape. proving WHICH global the call yields is not proving it yields a
  // DEFINED one, so the probe-yield gate stands between; null = unproven, the caller keeps
  // its guard render
  function provenDroppedHopFoldedMemo(baseNode, dropped, metaPath) {
    const effects = [];
    const core = unwrapParensCollectingEffects(baseNode, effects);
    const proven = core?.type === 'CallExpression' && !core.optional
      && !!inlineCallProxyGlobalRoot({
        callNode: core, scope: metaPath.scope, adapter, path: metaPath, rejectConditional: true,
      })
      && !guardProbeUndefinable(core, { metaPath, adapter, resolvePure });
    if (!proven) return null;
    if (inlineCallHasObservableEffects({ callNode: core, scope: metaPath.scope, adapter, path: metaPath })) {
      effects.push(core);
    }
    return withSideEffects(identifier(injectPureImport(dropped.entry, dropped.hintName)), effects);
  }

  // guard for the OBJECT of a chain's last optional hop: a reusable single token spells
  // `X == null` and is re-read; anything else memoizes - KEEPING its own inner `?.` (that
  // short-circuit routes into this guard), wrapped back into a chain of its own when the
  // extraction strands it outside the original ChainExpression
  function guardObject(objectNode, metaPath, { bareMemo = false, mutatedLeaf = false } = {}) {
    if (isReusableReceiver(objectNode)) {
      return {
        disjuncts: [cloneNode(objectNode)],
        makeBase: () => cloneNode(objectNode),
      };
    }
    // the ref is minted only where a memo survives: a value that renders as a guard of this canon
    // composes instead, and an eagerly minted ref would leave a dead declaration behind
    const surface = proxySurfaceNameOf(objectNode, metaPath);
    // under a PROXY hop the memo respells bare - babel's hop-drop rebuild starts from the
    // kept write, the TS wrappers drop (`((a = gw) as any)?.self...` -> `_ref = a =
    // _globalThis.window`); every other memo keeps its cast (the `satisfies` canon, and a
    // ctor hop above - `((v = gw) as any)?.Array...` keeps `as any`)
    let memoSource = objectNode;
    if (surface) {
      // trailing ERASABLE hops drop from a SURFACE memo - the surface below them IS the
      // memo's value (`(v = gw)?.self` memoizes `_ref = v = _globalThis.window`); a hop
      // pure cannot back (`window`) is the probe the test must read and stays
      for (let peeledVal = unwrapRuntimeExpr(memoSource);
        peeledVal?.type === 'MemberExpression' && !peeledVal.computed
          && POSSIBLE_GLOBAL_OBJECTS.has(peeledVal.property?.name)
          && isPristineProxyGlobal(adapter, peeledVal.property.name)
          && resolveGlobalPolyfill(peeledVal.property.name);
        peeledVal = unwrapRuntimeExpr(memoSource)) {
        // a dropped hop that carried a LIVE `?.` owed a short-circuit of its own: the memo
        // holds that RENDER, not the bare probe below it (`window?.window?.self` memoizes
        // `null == _globalThis.window?.window ? void 0 : _self`). over a KEPT WRITE the memo
        // IS the stored value and the drop stands (`(v = gw)?.self` memoizes `v = _gw.window`)
        // - asked as the canon's own `outer` answer: the identity spelling peeled an effect-free
        // sequence tail along with the wrappers, so `(0, dh())?.self` read as a write and the
        // plain drop lost both the short-circuit and the ponyfill
        const droppedBase = unwrapRuntimeExpr(peeledVal.object);
        if (peeledVal.optional && !peelChainAssignment(droppedBase).outer) {
          const dropped = resolveGlobalPolyfill(peeledVal.property.name);
          memoSource = provenDroppedHopFoldedMemo(peeledVal.object, dropped, metaPath)
            ?? renderShortCircuitGuard(nullGuardTest(cloneNode(peeledVal.object)),
              identifier(injectPureImport(dropped.entry, dropped.hintName)));
          break;
        }
        memoSource = peeledVal.object;
      }
      // a NAMED pure proven call at the bottom folds onto the surface's pure spelling
      // (`dh().self` memoizes `_ref = _self`); a LITERAL IIFE keeps its source spelling.
      // the probe-yield gate stands between, as in the dropped-hop fold above: a call
      // yielding the PROBE is the one value the guard exists for, and folding it leaves an
      // always-defined ponyfill under the null test - the memo keeps the raw call instead
      const bottomCall = unwrapRuntimeExpr(memoSource);
      if (bottomCall?.type === 'CallExpression' && !bottomCall.optional
        && unwrapRuntimeExpr(bottomCall.callee)?.type === 'Identifier'
        && !guardProbeUndefinable(bottomCall, { metaPath, adapter, resolvePure })
        && !inlineCallHasObservableEffects({ callNode: bottomCall, scope: metaPath.scope, adapter, path: metaPath })) {
        const surfacePure = resolveGlobalPolyfill(surface);
        if (surfacePure) memoSource = identifier(injectPureImport(surfacePure.entry, surfacePure.hintName));
      }
    }
    const peeled = bareMemo ? cloneNode(unwrapRuntimeExpr(memoSource)) : cloneSpinePeeled(memoSource);
    // a memo holding a KEPT SEQUENCE observes its value by construction (the null test reads the
    // ref), so the sequence tail takes the kept-value canon NOW - the ponyfill fold, or the guarded
    // render over the probe - instead of the plain fold the clone's re-visit would land. a tail
    // carrying its own live `?.` stands down: that short-circuit belongs to the composed-guard
    // machinery, and the fold would erase the probe read the source wrote
    const peeledCore = unwrapRuntimeExpr(peeled);
    if (peeledCore?.type === 'SequenceExpression'
      && !receiverCarriesLiveOptional(singleSequenceTail(peeledCore, { nested: true }))) {
      foldTailPristineProxyHops(peeledCore, {
        adapter,
        resolveGlobalPolyfill,
        injectPureImport,
        aliasCtx: { scope: metaPath.scope, adapter, path: metaPath },
        // the memo is a VALUE slot (its null test reads the ref): an alias root's kept value
        // folds to the leaf ponyfill exactly like the guard test's
      });
    }
    // the nav under this memo COLLAPSES to a ponyfill under one probe (the kept-nav plan's own
    // verdict): memoizing it then spells a SECOND test over the guard that render builds, so
    // compose with it instead - the probe decides the branch and the claim reads the always-defined
    // leaf. asked AHEAD of the memo deopts below: those read the value as the memo's own spelling,
    // where a written call yield proves definedness the composed test may not assume - it IS that
    // read, so the `?.` the source wrote stays. the babel binding asks the same plan at its own
    // memo site
    // ... never under a MUTATED leaf: the read above must reach the user's patch through the
    // memoized surface, and a composed ponyfill base would read the pristine slot instead
    const composed = !mutatedLeaf && composableNavGuardPlan(objectNode, {
      scope: metaPath.scope, adapter, path: metaPath, resolvePure: meta => resolvePure(meta, metaPath),
    });
    if (composed) {
      return {
        disjuncts: [cloneNode(composed.probe)],
        makeBase: () => identifier(injectPureImport(composed.pure.entry, composed.pure.hintName)),
      };
    }
    // a `?.` sitting directly on a KEPT WRITE whose stored value is provably defined is dead
    // in the memo spelling too - babel writes the read plain (`(h = globalThis)?.window`
    // memoizes `(h = _globalThis).window`). only that hop: every other `?.` in the spelling
    // belongs to a probe the test still owes
    // a rendered dropped hop carries the same spine inside its TEST - deoptionalize there too
    const rendered = peeled.type === 'ConditionalExpression';
    const spine = rendered ? unwrapRuntimeExpr(peeled.test?.right) : peeled;
    for (let hop = spine; hop?.type === 'MemberExpression'; hop = unwrapRuntimeExpr(hop.object)) {
      let base = unwrapRuntimeExpr(hop.object);
      // a PLAIN erasable hop between the `?.` and a kept write already throws on a nullish
      // stored value, so the `?.` above it can never fire and erases with the collapse
      // (`(w = globalThis.window).self?.Array` memoizes `(w = _globalThis.window).Array`)
      let crossedHop = false;
      while (base?.type === 'MemberExpression' && !base.computed && !base.optional
        && POSSIBLE_GLOBAL_OBJECTS.has(base.property?.name) && isPristineProxyGlobal(adapter, base.property.name)
        && resolveGlobalPolyfill(base.property.name)) {
        base = unwrapRuntimeExpr(base.object);
        crossedHop = true;
      }
      // inside a RENDERED drop the whole prefix is the test's OWN read, and a proven inline
      // call proves there the way a kept write proves everywhere (`dr()?.window` reads plain);
      // a bare probe memo keeps its `?.` - the test is the source's short-circuit itself
      // a kept write of a CALL YIELD proves nothing about definedness - proving WHICH global a
      // call yields is not proving it yields a defined one (the strict opaque-root canon), so
      // the memo keeps the `?.` the source spelled (`(held = ca())?.window`)
      const writtenValue = base?.type === 'AssignmentExpression'
        ? unwrapRuntimeExpr(peelChainAssignmentDeep(base)) : null;
      const provenBase = (writtenValue ? rendered || writtenValue.type !== 'CallExpression' : false)
        || (rendered && base?.type === 'CallExpression' && !base.optional && !!inlineCallProxyGlobalRoot({
          callNode: base,
          scope: metaPath.scope,
          adapter,
          path: metaPath,
          rejectConditional: true,
        }));
      if (hop.optional && provenBase
        && (crossedHop || !guardProbeUndefinable(base, { metaPath, adapter, resolvePure }))) hop.optional = false;
    }
    memoValueClones.add(peeled);
    const memoized = receiverCarriesOptional(peeled) ? chainExpression(peeled) : peeled;
    // the base REF stands for the guarded object's VALUE, so it carries that type - a claim
    // rebuilt onto it resolves its typed entry instead of falling generic (`arr.at(0)?.at(0)
    // .at(0)` - the middle dispatch owes `_atMaybeArray`). a MINTED object has no path to
    // descend, so its stamp is the only channel. a PROXY-SURFACE memo stands down: it
    // registers as a global alias and its claims resolve through that table, not the type
    // ... a SOURCE receiver with no stamp still refines through the resolver directly - a
    // literal receiver is a KNOWN type, and losing it under the memo minted a generic Maybe
    // dispatch over a certain receiver (`"abcde"?.slice(1)` kept `.slice` native on the
    // other emitters)
    const baseType = surface ? null
      : resolvedType.get(objectNode)
        ?? memoizedCallResultType(objectNode, metaPath, resolveNodeType)
        ?? nodeTypeRefinement(unwrapRuntimeExpr(objectNode), metaPath.scope, resolveNodeType);
    const ref = injector.generateDeclaredRef(metaPath);
    // a memo holding a PROXY SURFACE registers as a global alias - the rebuilt spine's
    // claims must resolve through `_ref` exactly like the source root (babel's
    // `tagProxyGlobalMemoRef`); trusted: the ref is plugin-minted, user code cannot rebind
    if (surface) injectorState?.registerGlobalAlias?.(ref, surface, { trusted: true, minted: true });
    else {
      const ctorSurface = proxyCtorSurfaceOf(objectNode, metaPath);
      if (ctorSurface) injectorState?.registerGlobalAlias?.(ref, ctorSurface, { trusted: true, minted: true });
    }
    return {
      disjuncts: [assignmentExpression('=', identifier(ref), memoized)],
      makeBase() {
        const base = identifier(ref);
        if (baseType) resolvedType.set(base, baseType);
        return base;
      },
    };
  }

  // the possible-global SURFACE a receiver's value denotes (`globalThis.window` -> 'window',
  // a bare pristine root -> its own name), or null when the value is not that shape
  // a CTOR read off the proxy surface, for the memo tag: the ref holds the constructor itself, so a
  // static claim rebuilt onto it resolves through the alias table (`_ref = <nav>.Number` serves
  // `_ref.MAX_SAFE_INTEGER`) - babel's `tagProxyGlobalMemoRef` ctor arm, missing here, left the claim
  // reading raw off the memo and the polyfill never landed. the CONSTRUCTOR spelling is what makes it
  // one: a lowercase key off the surface is a user property, and a proxy HOP names the realm again
  function proxyCtorSurfaceOf(objectNode, metaPath) {
    if (!metaPath) return null;
    const value = peelChainRootValue(objectNode);
    if (!isMemberAccessNode(value)) return null;
    const aliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
    const name = resolveObjectName({ objectNode: value, ...aliasCtx });
    if (!name || !/^[A-Z]/u.test(name) || POSSIBLE_GLOBAL_OBJECTS.has(name)
      || adapter.isMutatedStatic?.('globalThis', name)) return null;
    const host = resolveObjectName({ objectNode: peelChainRootValue(value.object), ...aliasCtx });
    return host && POSSIBLE_GLOBAL_OBJECTS.has(host) && isPristineProxyGlobal(adapter, host) ? name : null;
  }

  function proxySurfaceNameOf(objectNode, metaPath = null) {
    const value = peelChainRootValue(objectNode);
    // a PROVEN call yields the surface too (`(() => self)()` - the inline canon)
    if (value?.type === 'CallExpression' && !value.optional && metaPath) {
      const called = resolveObjectName({ objectNode: value, scope: metaPath.scope, adapter, path: metaPath });
      return called && POSSIBLE_GLOBAL_OBJECTS.has(called) && isPristineProxyGlobal(adapter, called) ? called : null;
    }
    const surfaceKey = isMemberAccessNode(value) ? staticMemberKeyName(value) : null;
    if (surfaceKey && POSSIBLE_GLOBAL_OBJECTS.has(surfaceKey) && holdsProxySurface(objectNode, metaPath)) {
      return surfaceKey;
    }
    if (value?.type === 'Identifier') {
      // binding-aware: a SHADOWED realm name holds the user's object, not the surface
      if (POSSIBLE_GLOBAL_OBJECTS.has(value.name)) {
        return isPristineProxyGlobal(adapter, value.name)
          && !(metaPath && adapter.getBinding?.(metaPath.scope, value.name, metaPath)) ? value.name : null;
      }
      const minted = mintedProxyGlobalName(value.name, injectorState);
      if (minted) return minted;
      // an ALIAS resolves through the canon (`const w = globalThis.window; (a = w)`)
      const aliased = metaPath && resolveObjectName({
        objectNode: value,
        scope: metaPath.scope,
        adapter,
        path: metaPath,
      });
      if (aliased && POSSIBLE_GLOBAL_OBJECTS.has(aliased) && isPristineProxyGlobal(adapter, aliased)) return aliased;
    }
    return null;
  }

  // split a receiver chain at its LAST-evaluated optional hop: the guard disjuncts hoist
  // into the caller's ternary test and the returned receiver is the de-optionalized spine
  // rebuilt over the guarded base. hops the split leaves RAW inside a memo (`_g = arr.flat`)
  // are the walker's descent problem: it re-visits the replacement and polyfills them in
  // place, which is what composes `null == (_ref = _flatMaybeArray(arr)) ? ...` without any
  // chain orchestration. returns null when the spine carries no optional (an args-only `?.`
  // or a paren-sealed sub-chain: the standalone path treats those receivers as opaque)
  // the OPTIONAL-CALL arm of the split (`X.m?.(...)`), extracted for its size: the
  // callee spelling decides the guard shape
  // the DOUBLY-optional arm (`X?.m?.()` / `X.m?.()` with an optional method hop): the
  // probe decides between the guarded-disjunct shape and the kept-`?.` memo
  function splitDoublyOptionalCall({ node, metaPath, callee, split }) {
    const { reusabilityView, superReceiver, reusableThisArg, cloneReceiverValue } = split;
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
    const { result: optionalCalleeProbe } = resolvePureOrGlobalFallback({
      kind: 'property', object: splitReceiverTypeHint(callee.object, metaPath),
      key: callee.computed ? null : callee.property?.name, placement: 'prototype',
    }, metaPath);
    if (!optionalCalleeProbe) {
      // an UNRESOLVABLE optional method keeps its `?.` in the read and memoizes in the
      // same test (`(_r = recv, _m = _r?.notPoly)`); a reusable receiver reads directly
      let refMethod;
      let disjuncts;
      let thisArg;
      if (isReusableReceiver(reusabilityView) || superReceiver) {
        refMethod = injector.generateDeclaredRef(metaPath);
        disjuncts = [assignmentExpression('=', identifier(refMethod), chainExpression(cloneNode(callee)))];
        thisArg = reusableThisArg();
      } else {
        // refs mint in EVALUATION order (receiver memo, then method) - the babel push
        // order the function-host declaration preserves
        const refRecv = injector.generateDeclaredRef(metaPath);
        refMethod = injector.generateDeclaredRef(metaPath);
        const recvClone = cloneReceiverValue();
        const optRead = stampReplacementSpan(memberExpression(identifier(refRecv), cloneNode(callee.property),
          { computed: callee.computed, optional: true }), callee);
        disjuncts = [sequenceExpression([
          assignmentExpression('=', identifier(refRecv),
            receiverCarriesOptional(callee.object) ? chainExpression(recvClone) : recvClone),
          assignmentExpression('=', identifier(refMethod), chainExpression(optRead)),
        ])];
        thisArg = identifier(refRecv);
      }
      return {
        hopKind: 'call',
        disjuncts,
        receiver: stampSourceCallType(
          callExpression(memberExpression(identifier(refMethod), identifier('call')),
            [thisArg, ...node.arguments.map(argument => cloneNode(argument))]), node, metaPath, typeStampCtx),
      };
    }
    // `X?.m?.()`: the root guards first, the method memo joins as a second disjunct
    // and the call keeps `this` through the shared base (`_ref2.call(_ref)`)
    const rootGuard = guardObject(callee.object, metaPath);
    const ref = injector.generateDeclaredRef(metaPath);
    const methodRead = stampReplacementSpan(
      memberExpression(rootGuard.makeBase(), cloneNode(callee.property), { computed: callee.computed }), callee);
    return {
      hopKind: 'call',
      disjuncts: [...rootGuard.disjuncts,
        assignmentExpression('=', identifier(ref), methodRead)],
      receiver: stampSourceCallType(
        callExpression(memberExpression(identifier(ref), identifier('call')),
          [rootGuard.makeBase(), ...node.arguments.map(argument => cloneNode(argument))]), node, metaPath, typeStampCtx),
    };
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

  function splitOptionalCallReceiver(node, metaPath) {
    const callee = unwrapRuntimeExpr(node.callee);
    // a BARE callee's `?.()` guards on the callee value itself: reusable re-reads
    // (`a == null ? void 0 : _at(_ref = a()).call(_ref, 0)`); a COMPLEX or non-reusable
    // callee memoizes, the disjunct guards the memo and the call reads it exactly once
    // (`pick(1)?.()` -> `null == (_ref = pick(1)) || ... _ref()`, babel's callee-split)
    if (callee?.type !== 'MemberExpression') {
      if (callee?.type === 'Super') return STAGED_SPLIT;
      if ((callee?.type === 'Identifier' || callee?.type === 'ThisExpression') && isReusableReceiver(callee)) {
        return {
          hopKind: 'call',
          disjuncts: [cloneNode(callee)],
          receiver: callExpression(cloneNode(callee), node.arguments.map(argument => cloneNode(argument))),
        };
      }
      // SOURCE-authored callees only: a plugin-built callee (no source span - a rewritten
      // inner dispatch on re-visit) belongs to the chain-threading route, and memoizing it
      // here would freeze a half-threaded chain
      if (typeof callee?.start !== 'number') return STAGED_SPLIT;
      const calleeRef = injector.generateDeclaredRef(metaPath);
      return {
        hopKind: 'call',
        disjuncts: [assignmentExpression('=', identifier(calleeRef), cloneNode(callee))],
        receiver: callExpression(identifier(calleeRef), node.arguments.map(argument => cloneNode(argument))),
      };
    }
    // an INHERITED STATIC callee substitutes to an always-defined binding, so its `?.()`
    // erases with it and the call binds `this` (the subclass) - the dispatch above needs no
    // guard at all (`super.from?.().at(0)` -> `_at(_ref = _Array$from.call(this)).call(_ref, 0)`)
    const inheritedSplit = inheritedStaticCalleeSplit(node, callee, metaPath, inheritedCtx);
    if (inheritedSplit) return inheritedSplit;
    // the repeated receiver respells on the fully-peeled view (`(globalThis).flat?.()`
    // reuses `_globalThis` bare), but REUSABILITY peels parens only - a TS cast keeps
    // babel memoizing (`(globalThis as any).flat?.()` -> `_ref2 = _globalThis`), and the
    // SEAL semantics of the live-optional test read the unpeeled spelling
    const calleeObject = unwrapRuntimeExpr(callee.object);
    let reusabilityView = callee.object;
    while (reusabilityView?.type === 'ParenthesizedExpression') reusabilityView = reusabilityView.expression;
    // `super` cannot memoize (`_ref = super` does not parse) - the method memoizes whole
    // and the call runs on `this`, babel's dedicated super-call spelling
    const superReceiver = calleeObject?.type === 'Super';
    function reusableThisArg() {
      return superReceiver ? { type: 'ThisExpression' } : cloneNode(calleeObject);
    }
    // a proxy-surface receiver memoizes as a VALUE: the hops stay spelled (babel keeps
    // the original node, whose hop claims detection already marked handled) - suppress
    // the clone's hop claims so only the root substitutes (`_ref2 = _globalThis.self`)
    // the memo VALUE clones unpeeled: a TS cast stays spelled unless a claim on the
    // clone consumes it (`(() => _globalThis)() as any` keeps the cast, a pristine
    // global's claim eats its wrapper)
    function cloneReceiverValue() {
      const clone = cloneNode(callee.object);
      if (holdsProxySurface(callee.object, metaPath)) {
        for (let hop = unwrapRuntimeExpr(clone); hop?.type === 'MemberExpression' && !hop.computed
          && POSSIBLE_GLOBAL_OBJECTS.has(hop.property?.name); hop = unwrapRuntimeExpr(hop.object)) {
          skippedNodes.add(hop);
        }
      }
      return clone;
    }
    const split = { reusabilityView, superReceiver, reusableThisArg, cloneReceiverValue };
    if (callee.optional) {
      return splitDoublyOptionalCall({ node, metaPath, callee, split });
    }
    if (staticCalleeStandsDown({ callee, calleeObject, metaPath })) return null;
    if (!isReusableReceiver(reusabilityView) && !superReceiver) {
      const refRecv = injector.generateDeclaredRef(metaPath);
      const refMethod = injector.generateDeclaredRef(metaPath);
      const recvIdForRead = identifier(refRecv);
      // the memo ref carries the RECEIVER's resolved type: the re-visited method read
      // resolves its typed instance entry off it (`[].at?.(1)...` -> `_atMaybeArray`)
      const recvType = nodeTypeRefinement(unwrapRuntimeExpr(callee.object), metaPath.scope, resolveNodeType);
      if (recvType) resolvedType.set(recvIdForRead, recvType);
      const methodRead = stampReplacementSpan(
        memberExpression(recvIdForRead, cloneNode(callee.property), { computed: callee.computed }), callee);
      const methodAssign = assignmentExpression('=', identifier(refMethod), methodRead);
      let disjuncts;
      if (receiverCarriesLiveOptional(callee.object)) {
        // X's own short-circuit must run before the method read. a RESOLVING method
        // guards as its own disjunct (the descent swaps the read for the lookup); an
        // unresolvable one keeps the comma memo with an OPTIONALIZED read - the memo can
        // be nullish and the plain read would throw where native short-circuits
        const { result: probe } = resolvePureOrGlobalFallback({
          kind: 'property', object: splitReceiverTypeHint(callee.object, metaPath),
          key: callee.computed ? null : callee.property?.name, placement: 'prototype',
        }, metaPath);
        if (!probe) {
          const optRecvId = identifier(refRecv);
          if (recvType) resolvedType.set(optRecvId, recvType);
          const optRead = stampReplacementSpan(memberExpression(optRecvId, cloneNode(callee.property),
            { computed: callee.computed, optional: true }), callee);
          disjuncts = [sequenceExpression([
            assignmentExpression('=', identifier(refRecv), chainExpression(cloneReceiverValue())),
            assignmentExpression('=', identifier(refMethod), chainExpression(optRead)),
          ])];
        } else {
          disjuncts = [
            assignmentExpression('=', identifier(refRecv), chainExpression(cloneReceiverValue())),
            methodAssign,
          ];
        }
      } else {
        // a plain receiver evaluates in the same test: the comma memo
        const memo = sequenceExpression([
          assignmentExpression('=', identifier(refRecv), cloneReceiverValue()), methodAssign,
        ]);
        guardCommaMemos.add(memo);
        disjuncts = [memo];
      }
      return {
        hopKind: 'call',
        disjuncts,
        receiver: stampSourceCallType(
          callExpression(memberExpression(identifier(refMethod), identifier('call')),
            [identifier(refRecv), ...node.arguments.map(argument => cloneNode(argument))]), node, metaPath, typeStampCtx),
      };
    }
    const ref = injector.generateDeclaredRef(metaPath);
    // a proxy-surface receiver blocks the descent's instance claim on the memoized read
    // (`_ref = _globalThis.flat` would stay raw), so the split resolves the method itself -
    // babel's chain-combine canon: a bare prototype extraction, receiver reused as `this`
    let methodRead = cloneNode(callee);
    if (!callee.computed && callee.property?.type === 'Identifier' && holdsProxySurface(calleeObject, metaPath)) {
      const { result: probe } = resolvePureOrGlobalFallback({
        kind: 'property', object: splitReceiverTypeHint(calleeObject, metaPath),
        key: callee.property.name, placement: 'prototype',
      }, metaPath);
      if (probe?.kind === 'instance') {
        methodRead = callExpression(identifier(injectPureImport(probe.entry, probe.hintName)),
          [cloneNode(calleeObject)]);
      }
    }
    return {
      hopKind: 'call',
      disjuncts: [assignmentExpression('=', identifier(ref), methodRead)],
      receiver: stampSourceCallType(
        callExpression(memberExpression(identifier(ref), identifier('call')),
          [reusableThisArg(), ...node.arguments.map(argument => cloneNode(argument))]), node, metaPath, typeStampCtx),
    };
  }

  // one OPTIONAL member hop of the split: the guard, the proxy-surface drop, the
  // proven chains - extracted from the recursion for its size
  function splitOptionalMemberHop(node, metaPath) {
    // the `?.` tests a value that COLLAPSES to a pure CTOR binding - the polyfill makes it
    // always-defined, so the guard is dead and the hop reads straight off the ponyfill
    // (`globalThis.Map?.list.at(0)` -> `_at(_ref = _Map.list).call(_ref, 0)`, babel's
    // flatten). effect-bearing navigation keeps the guard - its rescue nodes have no slot
    // here, and the memo the guard mints is what carries them
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
    if (deadCtorSwap && !deadCtorSwap.se.length && !probedNav) {
      // an ALIAS root keeps its OWN binding and only drops the hops (the alias canon): landing the
      // leaf ponyfill here would re-root the read on a binding the source never named, where every
      // other spelling of the same nav keeps the alias (`ga.window.self?.Array.prototype`)
      const navAliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
      const navRoot = findProxyGlobal(node.object, navAliasCtx, true);
      // ... only where the swapped leaf is a PROXY HOP: a CTOR leaf names its own ponyfill and the
      // alias cannot stand for it (`g.Set?.foo` reads `_Set.foo`, never `g.foo`)
      const base = POSSIBLE_GLOBAL_OBJECTS.has(deadCtorSwap.pure.hintName)
        && isAliasProxyRoot(navRoot, navAliasCtx) ? cloneNode(navRoot)
        : identifier(injectPureImport(deadCtorSwap.pure.entry, deadCtorSwap.pure.hintName));
      return {
        hopKind: 'member',
        disjuncts: [],
        receiver: stampReplacementSpan(memberExpression(base, cloneNode(node.property), { computed: node.computed }), node),
      };
    }
    const surfaceHeld = holdsProxySurface(node.object, metaPath);
    const surfaceHop = surfaceHeld ? proxyHopKey(node, { allowOptional: true }) : null;
    const leafKey = node.computed ? null : node.property?.name ?? null;
    const { disjuncts, makeBase } = guardObject(node.object, metaPath,
      { bareMemo: !!surfaceHop, mutatedLeaf: !!leafKey && isMutatedGlobalSlot(adapter, leafKey) });
    // a pristine hop read off a guarded PROXY-surface value drops - `(q = gw)?.self
    // .Array` reads `_ref.Array` (window.self is the same surface, babel's kept canon);
    // an SE-bearing key's effects MIGRATE into the next surviving key (native order:
    // the key evaluates past the guard, before the next read)
    if (surfaceHeld) {
      const hop = surfaceHop;
      // SE-key migration is the KEPT-root canon (the write anchors the prefix, buried
      // under hops included); a plain memoized nav keeps its SE-keyed hop reading off
      // the memo instead
      if (hop && (!hop.effects.length || spineHoldsKeptWrite(node.object))) {
        return {
          hopKind: 'member', disjuncts, receiver: makeBase(), proxySurface: true,
          pendingKeySe: hop.effects,
        };
      }
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
        // the hop KEY is asked through the canonical resolver, so an SE-bearing computed
        // spelling folds like its dotted twin and its effects MIGRATE into the surviving key
        // (`(w = gw)?.[(c++, 'self')]?.[(c++, 'self')].Array` -> `_ref[c++, c++, 'Array']`)
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
          if (surfaced && surfaced !== STAGED_SPLIT && surfaced.proxySurface) {
            const pendingKeySe = [...surfaced.pendingKeySe ?? [], ...foldKey.effects];
            if (!pendingKeySe.length) return surfaced;
            return { ...surfaced, pendingKeySe };
          }
        }
        return splitOptionalMemberHop(node, metaPath);
      }
      const inner = splitOptionalReceiverInner(node.object, metaPath);
      if (!inner || inner === STAGED_SPLIT) return inner;
      if (inner.proxySurface && !inner.pendingKeySe?.length
        && !node.computed && isPristineProxyGlobal(adapter, node.property?.name)) {
        return inner;
      }
      // a resolvable CTOR read off the surface memo substitutes its own pure inside the
      // alternate (`(o = gw)?.self.Map.prototype.has.name` -> `_Map.prototype.has`), the
      // same requeue the hop split does one level down; a MUTATED slot keeps the live read
      // a COMPUTED key folds the same way the proven-chain route already does: an SE-bearing
      // spelling keeps its prefix around the substituted ctor (`[(c += 1, 'Set')]` ->
      // `(c += 1, _Set)`), a quiet one resolves through the canonical key resolver
      const surfaceKey = inner.proxySurface && !inner.pendingKeySe?.length
        ? (node.computed
          ? foldSeqKeyLiteralTail(node.property) ?? foldedResolvedKey(node.property, metaPath, adapter)
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
        const folded = node.computed ? foldSeqKeyLiteralTail(node.property)
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
      if (inner.pendingKeySe?.length) {
        // the migrated key effects respell the surviving key computed (`[c++, "Array"]`);
        // a computed STRING-LITERAL key respells the same way - only a dynamic computed
        // key (whose own read the prefix would reorder against) stays staged
        const computedTail = node.computed ? unwrapRuntimeExpr(node.property) : null;
        const surviving = !node.computed && node.property?.type === 'Identifier'
          ? literal(node.property.name)
          : computedTail?.type === 'Literal' && typeof computedTail.value === 'string'
            ? literal(computedTail.value)
            : computedTail?.type === 'SequenceExpression'
              && unwrapRuntimeExpr(computedTail.expressions.at(-1))?.type === 'Literal'
              ? cloneNode(computedTail)
              : null;
        if (!surviving) return STAGED_SPLIT;
        return {
          hopKind: inner.hopKind,
          disjuncts: inner.disjuncts,
          receiver: stampReplacementSpan(memberExpression(inner.receiver,
            sequenceExpression([...inner.pendingKeySe.map(expr => cloneNode(expr)),
              ...surviving.type === 'SequenceExpression' ? surviving.expressions : [surviving]]),
            { computed: true }), node),
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

  // does this receiver hold a pristine proxy-global SURFACE (the value of `q = globalThis
  // .window` is the window global itself) - the question the pristine-hop drop above asks
  function holdsProxySurface(objectNode, metaPath = null) {
    // a write EARLIER in the same sequence dominates every read below it, and that is the only
    // flow fact this question needs: `(g = globalThis, v = g.window?.self)` navigates the realm,
    // while the alias walk can prove nothing about `g` - pure bails on a reassigned binding, and
    // the write it would have to trust is right here beside the read. NOT the canon's
    // before-use reassignment question (that one weighs textual order across a function body,
    // where a loop back-edge or a conditional write can reach the use): inside ONE sequence the
    // order IS the evaluation, so the fact is local and needs no flow proof
    const sequenceWrites = new Map();
    const followed = new Set();
    // writes interleave with the hops (`((dw = gw) as any)?.self` holds the surface too),
    // so the peel alternates instead of running write-then-members once
    let value = unwrapRuntimeExpr(objectNode);
    for (;;) {
      // ... and the value of a SEQUENCE is its tail, which the hops read through
      if (value?.type === 'SequenceExpression') {
        for (const expr of value.expressions.slice(0, -1)) {
          const write = unwrapRuntimeExpr(expr);
          if (write?.type === 'AssignmentExpression' && write.operator === '='
            && write.left?.type === 'Identifier') {
            sequenceWrites.set(write.left.name, unwrapRuntimeExpr(write.right));
          }
        }
        value = unwrapRuntimeExpr(value.expressions.at(-1));
        continue;
      }
      if (value?.type === 'Identifier' && sequenceWrites.has(value.name) && !followed.has(value.name)) {
        followed.add(value.name);
        value = sequenceWrites.get(value.name);
        continue;
      }
      if (value?.type === 'AssignmentExpression') {
        value = unwrapRuntimeExpr(value.right);
        continue;
      }
      const hopKey = isMemberAccessNode(value) ? staticMemberKeyName(value) : null;
      if (hopKey && POSSIBLE_GLOBAL_OBJECTS.has(hopKey) && isPristineProxyGlobal(adapter, hopKey)) {
        value = unwrapRuntimeExpr(value.object);
        continue;
      }
      break;
    }
    // a PROVEN call yields the surface too (`(() => globalThis)()` - the inline canon)
    if (value?.type === 'CallExpression' && !value.optional && metaPath) {
      const called = resolveObjectName({ objectNode: value, scope: metaPath.scope, adapter, path: metaPath });
      return !!called && POSSIBLE_GLOBAL_OBJECTS.has(called) && isPristineProxyGlobal(adapter, called);
    }
    if (value?.type !== 'Identifier') return false;
    // binding-aware: a SHADOWED realm name holds the user's object, not the surface
    if (POSSIBLE_GLOBAL_OBJECTS.has(value.name)) {
      return isPristineProxyGlobal(adapter, value.name)
        && !(metaPath && adapter.getBinding?.(metaPath.scope, value.name, metaPath));
    }
    // an ALIAS root resolves through the canon (`const w = globalThis.window; (a = w)`
    // holds the window surface exactly like the direct spelling)
    const aliased = metaPath && resolveObjectName({
      objectNode: value,
      scope: metaPath.scope,
      adapter,
      path: metaPath,
    });
    return !!aliased && POSSIBLE_GLOBAL_OBJECTS.has(aliased) && isPristineProxyGlobal(adapter, aliased);
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

  // the receiver / guard spelling of one instance dispatch: how the lookup argument and the
  // `this` slot re-read or memoize the receiver, and where the member-optional null test
  // lands (its memo joins split disjuncts when the split ran)
  function resolveDispatchSpelling({ metaPath, effObject, memberOptional, isCall, guardDisjuncts }) {
    // source parens are printer trivia - the reusability question and the re-spelled
    // receiver both read through them (`(arr).at(0)` -> `_at(arr).call(arr, 0)`); TS
    // casts stay (the `satisfies` memo canon)
    while (effObject?.type === 'ParenthesizedExpression') effObject = effObject.expression;
    // a MINTED pure import at the receiver memoizes anyway - babel's dispatch renders
    // from the source member and never re-reads the substituted binding verbatim
    // (`_toFixedMaybeNumber(_ref = _Number$MAX_SAFE_INTEGER).call(_ref, 2)`)
    const mintedImport = effObject.type === 'Identifier' && !!bindingPolyfillHint({
      binding: adapter.getBinding(metaPath.scope, effObject.name, metaPath),
      scope: metaPath.scope,
      name: effObject.name,
      adapter,
    });
    const reusable = isReusableReceiver(effObject) && !mintedImport;
    let check = null;
    let lookupArg;
    let callReceiver;
    if (memberOptional) {
      if (reusable) {
        check = cloneStamped(effObject, typeStampCtx);
        lookupArg = cloneStamped(effObject, typeStampCtx);
        callReceiver = cloneStamped(effObject, typeStampCtx);
      } else {
        const ref = injector.generateDeclaredRef(metaPath);
        // the memo keeps the receiver's own inner `?.` (its short-circuit routes into this
        // guard), rewrapped for the print once extracted from the original chain; type-only
        // wrappers peel off the memoized spine
        const peeledMemo = cloneSpinePeeled(effObject);
        const memoized = receiverCarriesOptional(effObject) ? chainExpression(peeledMemo) : peeledMemo;
        check = assignmentExpression('=', identifier(ref), memoized);
        if (guardDisjuncts) {
          guardDisjuncts = [...guardDisjuncts, check];
          check = null;
        }
        lookupArg = identifier(ref);
        callReceiver = identifier(ref);
      }
    } else if (reusable) {
      lookupArg = cloneStamped(effObject, typeStampCtx);
      callReceiver = cloneStamped(effObject, typeStampCtx);
    } else if (isCall) {
      const ref = injector.generateDeclaredRef(metaPath);
      lookupArg = assignmentExpression('=', identifier(ref), cloneStamped(effObject, typeStampCtx));
      callReceiver = identifier(ref);
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
      const rootBeforeHops = cur;
      while (cur?.type === 'MemberExpression') {
        if (!proxyHopKey(cur, { allowOptional: true, metaPath })) return false;
        // a kept write UNDER the hops is as transparent as one above them
        // (`((r = globalThis).self)?.Array` - the erased `?.` reads the pure root)
        cur = peelChainAssignmentDeep(unwrapRuntimeExpr(cur.object));
      }
      if (cur?.type === 'Identifier') {
        // binding-aware like the ctor arm below: a SHADOWED realm name holds the user's object
        if (POSSIBLE_GLOBAL_OBJECTS.has(cur.name)) {
          return isPristineProxyGlobal(adapter, cur.name) && !adapter.getBinding?.(metaPath.scope, cur.name, metaPath);
        }
        // an ALIAS binding answers the same as the direct spelling - but only as the BARE
        // root: neither a kept write nor a hop above it may sit in between, which is where
        // babel's own erase stops (`(e++, gw)?.` erases, `(a = gw)?.` and `(e++, g.self)?.` keep)
        if (!throughWrite && cur === rootBeforeHops) {
          const aliased = resolveObjectName({ objectNode: cur, scope: metaPath.scope, adapter, path: metaPath });
          if (aliased && POSSIBLE_GLOBAL_OBJECTS.has(aliased) && isPristineProxyGlobal(adapter, aliased)) return true;
        }
        // a RESOLVABLE global ctor substitutes to its always-defined pure - the `?.`
        // over it is dead (`Promise?.X.flat?.()` reads `_Promise.X`)
        return !adapter.getBinding?.(metaPath.scope, cur.name)
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
    // (`(w = globalThis)?.Array.of(5)` - the hop sits below `.of`), so descend there
    let navNode = object;
    for (let peeled = unwrapRuntimeExpr(navNode); peeled?.type === 'CallExpression' && !peeled.optional;
      peeled = unwrapRuntimeExpr(navNode)) navNode = peeled.callee;
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
      if (hopKeyName && POSSIBLE_GLOBAL_OBJECTS.has(hopKeyName) && !isPristineProxyGlobal(adapter, hopKeyName)) return false;
      if (chainContainsMutatedStatic(hop.object, { metaPath, adapter })) return false;
      // a hop that ITSELF resolves as a static claim substitutes to an always-defined
      // import - its `?.` is as dead as the call-twin's (`Array?.from(x).at(0)` erases)
      if (hopKeyName && hop.property?.type === 'Identifier') {
        const hopObjName = resolveObjectName({
          objectNode: hop.object,
          scope: metaPath.scope,
          adapter,
          path: metaPath,
        });
        if (hopObjName && !adapter.isMutatedStatic?.(hopObjName, hopKeyName)) {
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

  // eslint-disable-next-line max-statements -- sequential emission steps of one instance claim
  function replaceInstanceLike({ metaPath, id }) {
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
        effObject = rewrapNonNull(split.receiver);
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
      // a `?.()` that IS the receiver's root segment - nothing optional below its
      // callee spine and the callee is no claim of its own - memoizes as WRITTEN
      // (babel: `null == (_ref = box.get?.())`); every other call shape threads its
      // disjuncts as before (an inner optional segment, a rewritten dispatch callee)
      const splitCallCallee = splitCall?.type === 'CallExpression' && splitCall.optional === true
              ? unwrapRuntimeExpr(splitCall.callee) : null;
      const soleRootOptCall = !!splitCallCallee && !splitHopClaim
              && !receiverCarriesOptional(splitCallCallee) && !optionalCallSegmentBelow(splitCallCallee);
      // ... and a PAREN-SEALED lookup keeps its whole segment in ONE memo: the `.call` rides
      // outside the ternary and reads `this` off that memo, so the split's second disjunct has
      // no reader (`(getArr().flat?.()?.flatMap)(f)` -> `_ref = _flat(_ref2 = getArr())?.call(_ref2)`)
      if (split && ((split.hopKind === 'call' && !soleRootOptCall) || deeperSegment)
        && !(isCall && !callOptional && calleeParenWrapped(parent))) {
        ({ disjuncts: guardDisjuncts } = split);
        effObject = rewrapNonNull(split.receiver);
      }
    }
    const spelling = resolveDispatchSpelling({ metaPath, effObject, memberOptional, isCall, guardDisjuncts });
    const { check, lookupArg, callReceiver } = spelling;
    ({ guardDisjuncts } = spelling);
    let built;
    // the paren-lookup twin under a guard: `(X?.nav.m)(args)` keeps the native throw on the
    // void branch - the guard wraps only the LOOKUP and `.call` rides the ternary
    // (`(test ? void 0 : _mMaybe(_ref = nav)).call(_ref, args)`)
    const parenWrapped = isCall && calleeParenWrapped(parent);
    const test = composeGuardTest(guardDisjuncts, check);
    if (isCall && parenWrapped && test && !callOptional) {
      const lookup = callExpression(identifier(id), [lookupArg]);
      built = callExpression(
        memberExpression(renderShortCircuitGuard(test, lookup), identifier('call')),
        [callReceiver, ...parent.arguments.map(argument => cloneNode(argument))],
      );
      const returnTypePl = resolveNodeType(callerPath);
      if (returnTypePl) resolvedType.set(built, returnTypePl);
      markRewrite();
      replaceGuardedHop({ hopPath: callerPath, test: null, built, skippedNodes });
      return true;
    }
    if (isCall) {
      const lookup = callExpression(identifier(id), [lookupArg]);
      const dispatch = callExpression(
        memberExpression(lookup, identifier('call'), { optional: callOptional }),
        [callReceiver, ...parent.arguments.map(argument => cloneNode(argument))],
      );
      // the `?.call` needs a chain wrapper of its own ONLY when the original chain does not
      // continue above: a continuing hop keeps riding the source ChainExpression, and sealing
      // the dispatch under a nested wrapper would cut the short-circuit off from the tail
      const upNode = callerPath.parentPath?.node;
      const chainContinues = upNode
        && ((upNode.type === 'MemberExpression' && upNode.object === parent)
          || (upNode.type === 'CallExpression' && upNode.callee === parent));
      built = callOptional && !chainContinues ? chainExpression(dispatch) : dispatch;
    } else {
      built = callExpression(identifier(id), [lookupArg]);
    }
    // the ORIGINAL node's resolved type travels to the replacement: a member ABOVE reads off
    // it, and untyped there the next claim resolves generic (`.name` off an array value
    // pulled the function-name ponyfill on this leg alone) - babel's resolvedType stamp
    const returnType = resolveNodeType(isCall ? callerPath : metaPath);
    if (returnType) resolvedType.set(built, returnType);
    markRewrite();
    replaceGuardedHop({ hopPath: isCall ? callerPath : metaPath, test, built, skippedNodes, returnType, resolvedType });
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
        { adapter, injector, injectPureImport, markRewrite, skippedNodes });
    }
    if (!memberOptional && !methodCall && isReusableReceiver(unwrapRuntimeExpr(node.object))) {
      const receiver = unwrapRuntimeExpr(node.object);
      const id = injectPureImport(entry, hintName);
      markRewrite();
      replaceGuardedHop({
        hopPath: metaPath,
        test: null,
        built: withSideEffects(callExpression(identifier(id), [cloneNode(receiver)]), meta.sideEffects),
        skippedNodes,
      });
      return;
    }
    if (!memberOptional && !methodCall && meta.sideEffects?.length && !meta.receiverEffectCount
      && !receiverCarriesOptional(node.object)) {
      emitSeKeyReadMemo({ node, metaPath, meta, entry, hintName }, seKeyReadCtx);
      return;
    }
    // an OPTIONAL method call lifts its harvested effects - and a SOURCE sequence prefix on
    // the receiver - ahead of the plain `?.call` dispatch, babel's shape:
    // `(a(), arr)[(k(), 'flat')]?.()` -> `(a(), k(), _flatMaybeArray(arr)?.call(arr))`
    if (methodCall && parent.optional && !memberOptional && !receiverCarriesOptional(node.object)) {
      return emitOptionalCallWithLiftedSe({ node, parent, callerPath, metaPath, meta, entry, hintName },
        { isReusableReceiver, injectPureImport, markRewrite, skippedNodes, injector, assignmentExpression });
    }
    if (!methodCall && !memberOptional && receiverCarriesLiveOptional(node.object)
      && spineHoldsKeptWrite(node.object)
      && guardProbeUndefinable(node.object, { metaPath, adapter, resolvePure })
      && spineCarriesComputedHop(node.object)) {
      return emitSeReadFormOverLiveOptional({ node, metaPath, entry, hintName },
        { splitOptionalReceiver, stagedSplit: STAGED_SPLIT, injectPureImport, markRewrite, composeGuardTest, skippedNodes });
    }
    // a non-call instance READ over a live `?.` guarding a GENUINE probe, every harvested
    // effect inside the receiver: the ordinary split owns it - the receiver spelling rides
    // the guard test whole, the way a chain-assign receiver already does. the stand-down
    // below is for claims a resolvable inner claim re-drives; over an unresolvable probe
    // there is nobody, and standing down lost the claim outright (a raw `?.Map.name`)
    if (!methodCall && !memberOptional && receiverCarriesLiveOptional(node.object)
      && guardProbeUndefinable(node.object, { metaPath, adapter, resolvePure })
      && (meta.sideEffects ?? []).every(effect => subtreeContainsNode(node.object, effect))) {
      const id = injectPureImport(entry, hintName);
      return replaceInstanceLike({ metaPath, id });
    }

    if (!methodCall || (parent.optional && !memberOptional)) return;
    let receiver = unwrapRuntimeExpr(node.object);
    if (receiver?.type === 'SequenceExpression') receiver = receiver.expressions.at(-1);
    // ... and THROUGH nested sequences whose prefixes the harvest carries: a memo of the
    // nested tail would run the inner effect once in the memo and again in the replay
    // (`(a(), (b(), arr)).flat()` ran b, a, b)
    for (let seq = unwrapRuntimeExpr(receiver); seq?.type === 'SequenceExpression'
      && seq.expressions.slice(0, -1).every(expr => meta.sideEffects?.includes(expr));
      seq = unwrapRuntimeExpr(receiver)) {
      receiver = seq.expressions.at(-1);
    }
    if (!memberOptional && isReusableReceiver(receiver)) {
      const id = injectPureImport(entry, hintName);
      const dispatch = callExpression(
        memberExpression(callExpression(identifier(id), [cloneNode(receiver)]), identifier('call')),
        [cloneNode(receiver), ...parent.arguments.map(argument => cloneNode(argument))],
      );
      markRewrite();
      callerPath.replaceWith(withSideEffects(dispatch, meta.sideEffects));
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
      if (!split || split === STAGED_SPLIT) return;
      ({ disjuncts: guardDisjuncts, receiver: effReceiver } = split);
    } else if (memberOptional) {
      emitBareOptionalSeDispatch({ node, parent, callerPath, metaPath, meta, entry, hintName }, bareOptionalCtx);
      return;
    }
    // the receiver's own SEQUENCE prefix IS the harvested effect list: memoizing the whole
    // sequence would spell it TWICE - once inside the memo, once in the prefix. the memo takes
    // the tail and the effects keep their single slot (`(se(), [1, 2]).at(-1)` ->
    // `(se(), _at(_ref = [1, 2]).call(_ref, -1))`)
    const id = injectPureImport(entry, hintName);
    const ref = injector.generateDeclaredRef(metaPath);
    for (let seq = unwrapRuntimeExpr(effReceiver); seq?.type === 'SequenceExpression'
      && seq.expressions.slice(0, -1).every(expr => meta.sideEffects?.includes(expr));
      seq = unwrapRuntimeExpr(effReceiver)) {
      effReceiver = unwrapRuntimeExpr(seq.expressions.at(-1));
    }
    const memo = assignmentExpression('=', identifier(ref), cloneNode(effReceiver));
    // a LITERAL receiver's memo fuses into the lookup argument and the harvested key SE
    // hoists ahead - constructing it observes nothing, so the order is unobservable
    // (`[3, 4][(k(), 'at')](0)` -> `(k(), _at(_ref = [3, 4]).call(_ref, 0))`). every other
    // receiver READS (a member's getter, a call), and ECMA evaluates the receiver BEFORE
    // the key: the memo leads the sequence (`(_ref = box.list, k++, _at(_ref)...)`). under
    // a split's guard the alternate keeps the memo-first seq too (the disjuncts' own canon)
    const fusableReceiver = LITERAL_RECEIVER_TYPES.has(unwrapRuntimeExpr(effReceiver)?.type);
    const fuseMemo = !memberOptional && !guardDisjuncts && fusableReceiver && !mayHaveSideEffects(effReceiver);
    const dispatch = callExpression(
      memberExpression(callExpression(identifier(id), [fuseMemo ? memo : identifier(ref)]), identifier('call')),
      [identifier(ref), ...parent.arguments.map(argument => cloneNode(argument))],
    );
    const effects = (meta.sideEffects ?? []).map(effect => cloneNode(effect));
    let built,
        test;
    if (memberOptional) {
      // the member's own `?.` folds into the guard: the receiver memo is its null test
      // (`... || null == (_ref2 = _ref.call(arr, 0)) ? void 0 : (eff(), _k(_ref2)...)`)
      test = composeGuardTest(guardDisjuncts, memo);
      built = effects.length ? sequenceExpression([...effects, dispatch]) : dispatch;
    } else {
      test = composeGuardTest(guardDisjuncts, null);
      built = fuseMemo
        ? (effects.length ? sequenceExpression([...effects, dispatch]) : dispatch)
        : sequenceExpression([memo, ...effects, dispatch]);
    }
    markRewrite();
    replaceGuardedHop({ hopPath: callerPath, test, built, skippedNodes });
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
    target.replaceWith(withSideEffects(callExpression(
      memberExpression(identifier(id), identifier('call')),
      [{ type: 'ThisExpression' }, ...parent.arguments.map(argument => cloneNode(argument))],
    ), meta.sideEffects));
  }

  return {
    composeGuardTest,
    emitInheritedStatic,
    emitInstanceWithPeeledSe,
    eraseVestigialReceiverOptionals,
    fuseGuardCommaMemo,
    guardObject,
    holdsProxySurface,
    proxySurfaceNameOf,
    replaceInstanceLike,
    resolveDispatchSpelling,
    splitDoublyOptionalCall,
    splitOptionalCallReceiver,
    splitOptionalMemberHop,
    splitOptionalReceiver,
    staticCalleeStandsDown,
  };
}
