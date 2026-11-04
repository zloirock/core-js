import {
  optionalConstructorLanding, planOptionalMemberSplit, optionalSplitReusesSurface, planSplitMemberLanding, splitConstructorClaim,
} from '@core-js/polyfill-provider/detect-usage/optional-split';
import { spineHoldsKeptWrite } from '@core-js/polyfill-provider/detect-usage/proxy-navigation';
// the optional-dispatch channel of the usage-pure emitter: the `?.` split forms (a doubly
// optional call, an optional member hop, the receiver splits) and the instance/inherited
// dispatches with their guard spellings. created per transform over the factory's context
import {
  navRootPrefixNodes,
  peelReceiverSequenceTail,
  resolveKey,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  prepareGuardReceiver, prepareStaticReceiver, memoReceiverGlobalName, holdsProxySurface as receiverHoldsProxySurface,
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
  peelNestedSequenceExpressions,
  receiverCarriesLiveOptional,
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
  renderGuardedMethodCall,
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
import { guardProbeUndefinable, optionalCallSegmentBelow, replaceGuardedHop } from './claim-guards.js';
import {
  climbToCallerPath,
  cloneSpinePeeled,
  cloneStamped,
  foldSeqKeyLiteralTail,
  isDeleteOperand,
  markSubtreeSkipped,
  memoizedCallResultType,
  navRootIsProxyIdentifier,
  nodeTypeRefinement,
  spineCarriesComputedHop,
  stampSourceCallType,
} from './nav-spine.js';
import {
  emitBareOptionalSeDispatch,
  emitOptionalCallWithLiftedSe,
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
    if (landing.kind === 'surface') return { hopKind: 'member', disjuncts, receiver: makeBase(), proxySurface: true };
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
    const receiverCtx = {
      scope: metaPath.scope, path: metaPath, adapter, injectorState, resolvePure: meta => resolvePure(meta, metaPath),
    };
    effObject = prepareStaticReceiver(effObject, receiverCtx, { injectImport: injectPureImport, embed: cloneNode });
    if (!memberOptional && isCall) return {
      callDecision: planMethodCall({
        receiver: effObject, sourceReceiver, sideEffects, receiverEffectCount, args, optional, ctx: receiverCtx,
      }),
      check: null,
      guardDisjuncts,
    };
    const decision = planReceiverMemo(effObject, { ctx: receiverCtx });
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
      lookupArg = cloneStamped(effObject, typeStampCtx);
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
    const { object } = memberNode;
    // A constructor landing can erase this optional only if the source guard is dead.
    // Leave an effect-bearing landing to the ordinary split, which emits its prefix.
    const landing = memberNode.optional && optionalConstructorLanding(object, {
      scope: metaPath.scope, adapter, path: metaPath, resolvePure: m => resolvePure(m, metaPath),
    });
    const deadCtorOptional = landing && !landing.effects.length;
    const memberOptional = memberNode.optional === true && !deadCtorOptional;
    const deadCtorSwap = deadCtorOptional && receiverCarriesOptional(object);
    eraseVestigialReceiverOptionals({ memberOptional, object, metaPath });
    const { splitSource, rewrapNonNull } = peelNonNullWraps(object);
    let guardDisjuncts = null;
    let effObject = deadCtorSwap
      ? landing.source ? cloneNode(landing.source) : identifier(injectPureImport(landing.pure.entry, landing.pure.hintName)) : object;
    if (deadCtorSwap) markSubtreeSkipped(skippedNodes, object);
    else if (!memberOptional) {
      const split = splitOptionalReceiver(splitSource, metaPath);
      if (split === STAGED_SPLIT) return false;
      if (split) {
        ({ disjuncts: guardDisjuncts } = split);
        effObject = collapseSplitReceiver(rewrapNonNull(split.receiver), metaPath);
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

  // Bind an instance claim carrying harvested effects. Ordinary reads ask the shared
  // receiver/effect plan; method calls and live optional receivers retain native
  // preparation, so each source guard still owns its continuation and effect order.
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
    // A live inner optional still needs native split preparation below. Ordinary
    // reads use the same first-read/capture decision as the other binding.
    if (!methodCall && !receiverCarriesLiveOptional(node.object)) {
      return emitSeKeyReadMemo({ node, metaPath, meta, entry, hintName }, seKeyReadCtx);
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
    const receiverCtx = { scope: metaPath.scope, path: metaPath, adapter, injectorState };
    const receiverPure = instanceSynthReceiverPure(node.object, { ...receiverCtx, resolvePure: m => resolvePure(m, metaPath) });
    if (receiverPure) node.object = identifier(injectPureImport(receiverPure.entry, receiverPure.hintName));
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
          collapseSplitReceiver,
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
    eraseVestigialReceiverOptionals,
    guardObject,
    replaceInstanceLike,
    splitOptionalReceiver,
  };
}
