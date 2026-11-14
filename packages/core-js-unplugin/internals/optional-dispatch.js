import {
  optionalConstructorLanding, planOptionalMemberSplit, optionalSplitReusesSurface, planSplitMemberLanding, splitConstructorClaim,
} from '@core-js/polyfill-provider/detect-usage/optional-split';
// the optional-dispatch channel of the usage-pure emitter: the `?.` split forms (a doubly
// optional call, an optional member hop, the receiver splits) and the instance/inherited
// dispatches with their guard spellings. created per transform over the factory's context
import {
  navRootPrefixNodes,
  resolveKey,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  planReceiverEffects,
  prepareGuardReceiver,
  prepareStaticReceiver,
  registerGuardReceiverAlias,
  holdsProxySurface as receiverHoldsProxySurface,
} from '@core-js/polyfill-provider/detect-usage/guard-preparation';
import { planProxyReceiver } from '@core-js/polyfill-provider/detect-usage/members';
import { isPolyfillableOptional, vestigialReceiverOptionals } from '@core-js/polyfill-provider/detect-usage/annotations';
import { instanceSynthReceiverPure } from '@core-js/polyfill-provider/detect-usage/destructure';
import { nodePathInScope } from '@core-js/polyfill-provider/resolve-node-type';
import {
  POSSIBLE_GLOBAL_OBJECTS,
  calleeParenWrapped,
  TS_EXPR_WRAPPERS,
  isReusableReceiver,
  memberKeyName,
  peelNestedSequenceExpressions,
  unwrapRuntimeExpr,
  subtreeContainsNode,
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
  renderReceiverEffects,
  renderOptionalMethodCall,
  renderReceiverMemo,
  renderKeptSequenceTail,
  planMethodCall,
  planReceiverMemo,
  renderProxyReceiverPlan,
  planOptionalMethodCall,
  renderNavCollapseValue,
  renderShortCircuitGuard,
  sequenceExpression,
  memberFromKeyName,
} from '@core-js/polyfill-provider/render';
import {
  receiverCarriesOptional,
  stampReplacementSpan,
  withSideEffects,
} from './emit-shared.js';
import { optionalCallSegmentBelow, replaceGuardedHop } from './claim-guards.js';
import {
  climbToCallerPath,
  cloneSpinePeeled,
  cloneStamped,
  isDeleteOperand,
  markSubtreeSkipped,
  memoizedCallResultType,
  nodeTypeRefinement,
  stampSourceCallType,
} from './nav-spine.js';
import {
  inheritedStaticCalleeSplit,
} from './se-dispatch.js';

export default function createOptionalDispatchChannel(ctx) {
  const {
    STAGED_SPLIT,
    adapter,
    guardCommaMemos,
    inheritedCtx,
    injectPureImport,
    injector,
    injectorState,
    isShadowedByClassOwnMember,
    markRewrite,
    memoValueClones,
    peelNonNullWraps,
    resolveGlobalPolyfill,
    resolveNodeType,
    resolvePure,
    resolvePureOrGlobalFallback,
    resolveStaticInheritedMember,
    resolvedType,
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
        registerGuardReceiverAlias(ref, source, aliasCtx, { surface });
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
            && POSSIBLE_GLOBAL_OBJECTS.has(memberKeyName(hop)); hop = unwrapRuntimeExpr(hop.object)) {
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
      }) : memberKeyName(callee),
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
    // The next optional member guards the whole private call. Keeping that call
    // intact also preserves its receiver and brand check.
    if (decision.compactMethod && !callee.computed && memberKeyName(callee) === null) {
      return { hopKind: 'call', disjuncts: [], receiver: node };
    }
    // Only the callee's own optional call is redundant. A guard below the static
    // receiver still owns the outer instance dispatch, so thread that split through.
    // Undefined means no static claim; null is a static claim needing no receiver split.
    const claimContext = {
      scope: metaPath.scope, path: metaPath, adapter,
      resolve: meta => resolvePure(meta, metaPath),
      resolveSuperStatic: (path, key) => remapInheritedStaticMeta(injectorState, null, resolveStaticInheritedMember(path, key)),
      isShadowedByClassOwnMember,
    };
    const staticSplit = isPolyfillableOptional({ node: { ...node, callee }, ...claimContext })
      ? splitOptionalReceiver(callee.object, metaPath) : undefined;
    if (staticSplit && staticSplit !== STAGED_SPLIT) return {
      ...staticSplit,
      hopKind: 'call',
      receiver: stampSourceCallType(callExpression(
        { ...cloneNode(callee), object: staticSplit.receiver, optional: false },
        node.arguments.map(argument => cloneNode(argument))), node, metaPath, typeStampCtx),
    };
    // The method's claim removes its call guard. The shared member proof separately
    // decides whether its receiver guard survives; kept stores retain that first read.
    if (staticSplit !== undefined && (!callee.optional || staticSplit === STAGED_SPLIT
      || isPolyfillableOptional({ node: callee, ...claimContext }))) return staticSplit;
    if (staticSplit === null) {
      const memberSplit = splitOptionalMemberHop(callee, metaPath);
      return {
        ...memberSplit,
        hopKind: 'call',
        receiver: stampSourceCallType(callExpression(memberSplit.receiver,
          node.arguments.map(argument => cloneNode(argument))), node, metaPath, typeStampCtx),
      };
    }
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
        }) : memberKeyName(callee),
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

  // Bind the native scope and entry services; source decisions remain in the provider.
  function splitLandingContext(metaPath) {
    return { scope: metaPath.scope, adapter, path: metaPath, injectorState,
      resolvePure: meta => resolvePure(meta, metaPath), resolveGlobal: resolveGlobalPolyfill };
  }

  // Allocate only the guard and landing chosen for this optional member.
  function splitOptionalMemberHop(node, metaPath) {
    const landing = planOptionalMemberSplit(node, splitLandingContext(metaPath));
    function member(base) {
      return stampReplacementSpan(memberExpression(base, cloneNode(node.property), { computed: node.computed }), node);
    }
    function pure(entry) { return identifier(injectPureImport(entry.entry, entry.hintName)); }
    if (landing.kind === 'unguarded') return {
      hopKind: 'member', disjuncts: [],
      receiver: member(withSideEffects(landing.source ? cloneNode(landing.source) : pure(landing.pure), landing.effects)),
    };
    const { decided, ...options } = landing.guard;
    const { disjuncts, makeBase } = decided
      ? { disjuncts: [cloneNode(node.object)], makeBase: () => cloneNode(decided) }
      : guardObject(node.object, metaPath, options);
    if (landing.kind === 'surface') return {
      hopKind: 'member', disjuncts, proxySurface: true,
      receiver: landing.pure ? pure(landing.pure) : landing.member ? member(makeBase()) : makeBase(),
    };
    if (landing.kind === 'proven') return {
      hopKind: 'member', disjuncts, receiver: makeBase(), provenKey: landing.key, provenBase: makeBase,
    };
    return { hopKind: 'member', disjuncts, receiver: landing.kind === 'pure' ? pure(landing.pure) : member(makeBase()) };
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
    if (split && split !== STAGED_SPLIT && split.provenKey) {
      const pure = splitConstructorClaim(split.provenKey, splitLandingContext(metaPath));
      const spelled = pure ? identifier(injectPureImport(pure.entry, pure.hintName))
        : memberFromKeyName(split.provenBase(), split.provenKey);
      return { hopKind: split.hopKind, disjuncts: split.disjuncts, receiver: spelled };
    }
    return split;
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
      if (inner.provenKey) {
        callee = memberFromKeyName(inner.provenBase(), inner.provenKey);
      }
      return {
        hopKind: inner.hopKind,
        disjuncts: inner.disjuncts,
        receiver: callExpression(callee, node.arguments.map(argument => cloneNode(argument))),
      };
    }
    if (node.type === 'MemberExpression') {
      if (node.optional) {
        if (optionalSplitReusesSurface(node, splitLandingContext(metaPath))) {
          const surfaced = splitOptionalReceiverInner(node.object, metaPath);
          if (surfaced && surfaced !== STAGED_SPLIT && surfaced.proxySurface) return surfaced;
        }
        return splitOptionalMemberHop(node, metaPath);
      }
      const inner = splitOptionalReceiverInner(node.object, metaPath);
      if (!inner || inner === STAGED_SPLIT) return inner;
      const landing = planSplitMemberLanding(node, inner, splitLandingContext(metaPath));
      if (landing.kind === 'surface') return inner;
      const { base } = landing;
      const object = base?.pure ? identifier(injectPureImport(base.pure.entry, base.pure.hintName))
        : base?.key ? memberFromKeyName(inner.provenBase(), base.key)
          : base ? inner.provenBase() : inner.receiver;
      const receiver = landing.kind === 'pure'
        ? withSideEffects(identifier(injectPureImport(landing.pure.entry, landing.pure.hintName)), landing.effects)
        : stampReplacementSpan(memberExpression(object,
          cloneNode(node.property), { computed: node.computed }), node);
      return { hopKind: inner.hopKind, disjuncts: inner.disjuncts, receiver };
    }
    return null;
  }

  // Native frame binding for the shared realm-value classifier.
  function holdsProxySurface(objectNode, metaPath = null) {
    return receiverHoldsProxySurface(objectNode, { path: metaPath, scope: metaPath?.scope, adapter });
  }

  // guard-comma fusion: the split's `(_r = X, _g = _r.m)` memo with a RESOLVING method -
  // the lookup absorbs the receiver memo (`_g = _mMaybe(_r = X)`), babel's nesting
  function fuseGuardCommaMemo({ metaPath, entry, hintName }) {
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
      callExpression(identifier(injectPureImport(entry, hintName)), [recvClone])));
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
    sourceReceiver = effObject, sideEffects = [], receiverEffectCount = 0, args = [], optional = false, callPath = null,
  }) {
    // source parens are printer trivia - the reusability question and the re-spelled
    // receiver both read through them (`(arr).at(0)` -> `_at(arr).call(arr, 0)`); TS
    // casts stay (the `satisfies` memo canon)
    while (effObject?.type === 'ParenthesizedExpression') effObject = effObject.expression;
    const receiverCtx = {
      scope: metaPath.scope, path: metaPath, adapter, injectorState, resolvePure: meta => resolvePure(meta, metaPath),
    };
    effObject = prepareStaticReceiver(effObject, receiverCtx, { injectImport: injectPureImport, embed: cloneNode });
    if (!memberOptional && isCall) return {
      callDecision: planMethodCall({
        receiver: effObject, sourceReceiver, sideEffects, receiverEffectCount, args, optional, callPath, ctx: receiverCtx,
      }),
      check: null,
      guardDisjuncts,
    };
    const decision = planReceiverMemo(effObject, { interveningEffects: sideEffects.length > receiverEffectCount, ctx: receiverCtx });
    const reusable = !decision.capture;
    let check = null;
    let lookupArg;
    let callReceiver;
    if (memberOptional) {
      // The extracted receiver keeps its own chain seal; the shared memo owns its first read.
      const peeledMemo = reusable ? effObject : cloneSpinePeeled(effObject);
      const firstReceiver = !reusable && receiverCarriesOptional(effObject) ? chainExpression(peeledMemo) : peeledMemo;
      const memo = renderReceiverMemo({ ...decision, firstReceiver }, {
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
      lookupArg = effObject;
    }
    return { check, lookupArg, callReceiver, guardDisjuncts };
  }

  function eraseVestigialReceiverOptionals({ memberOptional, object, metaPath }) {
    for (const hop of vestigialReceiverOptionals({
      object,
      memberOptional,
      scope: metaPath.scope,
      adapter,
      path: metaPath,
      resolve: meta => resolvePure(meta, metaPath),
    })) hop.optional = false;
  }

  // The split already registered its native memo aliases. The same receiver plan
  // used by Babel owns hop removal; this binding only clones the resulting shell.
  function collapseSplitReceiver(receiverNode, metaPath) {
    const plan = planProxyReceiver(unwrapRuntimeExpr(receiverNode), {
      aliasCtx: { scope: metaPath.scope, path: metaPath, adapter },
      resolvePure: meta => resolvePure(meta, metaPath),
    });
    return plan && !plan.rootBinding?.pure
      ? renderProxyReceiverPlan(plan, { injectImport: injectPureImport, cloneHost: cloneNode }) : receiverNode;
  }

  // Apply one instance or iterator lookup through the common receiver/call plan.
  // Key effects stay after the first read and inside its guard; a sealed method
  // leaves its arguments outside that guard. Only whole-call helpers consume the call.
  // eslint-disable-next-line max-statements -- sequential emission steps of one instance claim
  function replaceInstanceLike({
    metaPath, entry, hintName, sideEffects = [], receiverEffectCount = 0,
    object = metaPath.node.object, sourceOptional = metaPath.node.optional === true, consumesCall = false, preparedOptionals = false,
  }) {
    const memberNode = metaPath.node;
    if (!sideEffects.length && fuseGuardCommaMemo({ metaPath, entry, hintName })) return true;
    if (isDeleteOperand(metaPath)) return false;
    // the caller past transparent wrappers; `calleeIsMember` holds when the call's callee
    // unwraps to exactly this member (the paren-lookup class included)
    const callerPath = climbToCallerPath(metaPath);
    const parent = callerPath?.node;
    const isCall = (parent?.type === 'CallExpression' ? unwrapRuntimeExpr(parent.callee) : null) === memberNode;
    const callOptional = isCall && parent.optional;
    const methodCall = isCall && !consumesCall;
    // A constructor landing can erase this optional only if the source guard is dead.
    // Leave an effect-bearing landing to the ordinary split, which emits its prefix.
    const landing = sourceOptional && optionalConstructorLanding(object, {
      scope: metaPath.scope, adapter, path: metaPath, resolvePure: m => resolvePure(m, metaPath),
    });
    const deadCtorOptional = landing && !landing.effects.length;
    // A plainly called, sealed iterator lookup throws in the whole-call helper.
    // With no detached receiver or key effect, its source chain can go directly into that argument.
    const sealedIterator = isCall && consumesCall && calleeParenWrapped(parent) && sideEffects.length === receiverEffectCount
      && sideEffects.every(effect => subtreeContainsNode(object, effect));
    const memberOptional = sourceOptional && !deadCtorOptional && !sealedIterator;
    const deadCtorSwap = deadCtorOptional && receiverCarriesOptional(object);
    if (!preparedOptionals) eraseVestigialReceiverOptionals({ memberOptional, object, metaPath });
    const { splitSource, rewrapNonNull } = peelNonNullWraps(object);
    let guardDisjuncts = null;
    let effObject = deadCtorSwap
      ? landing.source ? cloneNode(landing.source) : identifier(injectPureImport(landing.pure.entry, landing.pure.hintName)) : object;
    if (deadCtorSwap) markSubtreeSkipped(skippedNodes, object);
    else if (!memberOptional && !sealedIterator) {
      const split = splitOptionalReceiver(splitSource, metaPath);
      if (split === STAGED_SPLIT) return false;
      if (split) {
        ({ disjuncts: guardDisjuncts } = split);
        effObject = collapseSplitReceiver(rewrapNonNull(split.receiver), metaPath);
      }
    } else if (memberOptional && receiverCarriesOptional(object)) {
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
              ? memberKeyName(splitHop)
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
      metaPath, effObject, memberOptional, isCall: methodCall, guardDisjuncts, sourceReceiver: object,
      sideEffects, receiverEffectCount, args: isCall ? parent.arguments : [], optional: callOptional, callPath: callerPath,
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
    if (methodCall) {
      const id = injectPureImport(entry, hintName);
      // the `?.call` needs a chain wrapper of its own ONLY when the original chain does not
      // continue above: a continuing hop keeps riding the source ChainExpression, and sealing
      // the dispatch under a nested wrapper would cut the short-circuit off from the tail
      const upNode = callerPath.parentPath?.node;
      const chainContinues = upNode
        && ((upNode.type === 'MemberExpression' && upNode.object === parent)
          || (upNode.type === 'CallExpression' && upNode.callee === parent));
      built = renderMethodCall(callDecision ?? planMethodCall({
        receiver: callReceiver, prepared: true, optional: callOptional, args: parent.arguments, callPath: callerPath,
        sideEffects: sideEffects.slice(receiverEffectCount), ctx: receiverCtx,
      }), {
        helper: identifier(id),
        lookup: callDecision ? null : callExpression(identifier(id), [lookupArg]),
        lookupGuard: sealedLookup ? test : null,
        chain: !chainContinues,
        mintRef: () => injector.generateDeclaredRef(metaPath),
        embed: cloneCallSlot,
      });
    } else {
      // The source receiver or its guard already carries its own effects. The key
      // follows the live receiver and never runs on the short-circuited branch.
      const plan = sideEffects.length && planReceiverEffects({
        receiver: lookupArg, sourceReceiver: object, sideEffects, receiverEffectCount,
        guarded: memberOptional, receiverReads: 1, ctx: receiverCtx,
      });
      const product = plan ? renderReceiverEffects(plan, {
        mintRef: () => injector.generateDeclaredRef(metaPath),
        embed: (node, role) => role === 'effect' ? node : cloneStamped(node, typeStampCtx),
      }) : { receiver: cloneStamped(lookupArg, typeStampCtx) };
      const id = injectPureImport(entry, hintName);
      built = sealedLookup
        ? callExpression(identifier(id), [renderShortCircuitGuard(test, withSideEffects(product.receiver, product.effects))])
        : withSideEffects(callExpression(identifier(id), [product.receiver]), product.effects);
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

  // Inherited statics resolve against the captured base. Calls keep the live subclass
  // receiver; a named value read preserves the class lookup and its possible TDZ throw.
  function emitInheritedStatic(meta, metaPath) {
    const callerPath = climbToCallerPath(metaPath);
    const parent = callerPath?.node;
    if (metaPath.node.optional && !meta.inheritedReceiver) return;
    // A value read does not bind its receiver, including `super.from`. Preserve its
    // computed-key effects around the imported binding, just as for a named class.
    if (parent?.type !== 'CallExpression' || unwrapRuntimeExpr(parent.callee) !== metaPath.node) {
      if (meta.receiverEffectCount) return;
      const { result: valueResult } = resolvePureOrGlobalFallback(meta, metaPath);
      if (!valueResult) return;
      markRewrite();
      if (metaPath.node.computed) markSubtreeSkipped(skippedNodes, metaPath.node.property);
      metaPath.replaceWith(withSideEffects(identifier(injectPureImport(valueResult.entry, valueResult.hintName)),
        meta.inheritedReadEffects ?? meta.sideEffects));
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
      receiver: meta.inheritedReceiver ?? { type: 'ThisExpression' }, prepared: true, methodGuarded: true, args: parent.arguments,
    }), { lookup: identifier(id), leadingEffects: meta.inheritedCallEffects ?? meta.sideEffects, embed: cloneNode }));
  }

  return {
    emitInheritedStatic,
    eraseVestigialReceiverOptionals,
    guardObject,
    replaceInstanceLike,
  };
}
