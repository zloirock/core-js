// SE-carrying emission forms: dispatches and reads that replay harvested side effects
// ahead of (or inside) the spelling they guard
import { resolveKey } from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  mayHaveSideEffects,
  subtreeContainsNode,
  unwrapRuntimeExpr,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { remapInheritedStaticMeta } from '@core-js/polyfill-provider/helpers/class-walk';
import {
  assignmentExpression,
  callExpression,
  chainExpression,
  cloneNode,
  identifier,
  memberExpression,
  sequenceExpression,
  voidZero,
  nullGuardTest,
  renderShortCircuitGuard,
} from './builders.js';
import { withSideEffects } from './emit-shared.js';
import { replaceGuardedHop } from './claim-guards.js';
import {
  LITERAL_RECEIVER_TYPES,
  climbToCallerPath,
  collectSourceSpans,
  markSubtreeSkipped,
  receiverMintsSpelling,
  sourceSpanKey,
} from './nav-spine.js';

// the harvested effects a THROW PROBE does not already run: the ones it consumed, and the ones its
// RENDER spells - a prefix copy of either would evaluate it twice
// (`(dheCombo(), (null == dheCombo().window ? ...).Array, _Array$of)`)
export function effectsPastThrowProbe(effects, throwProbe) {
  const spans = collectSourceSpans(throwProbe.node);
  return (effects ?? []).filter(effect => !throwProbe.consumed.includes(effect)
    && !(sourceSpanKey(effect) && spans.has(sourceSpanKey(effect))));
}

// an OPTIONAL method call over a plain receiver: harvested effects (and a SOURCE sequence
// prefix) lift ahead of the plain `?.call` dispatch - babel's shape; a receiver the guard
// cannot spell twice memoizes ahead of them (`(_ref = <recv>, k2, _at(_ref)?.call(_ref, 0))`)
export function emitOptionalCallWithLiftedSe({ node, parent, callerPath, metaPath, meta, entry, hintName }, ctx) {
  const seqRecvOpt = unwrapRuntimeExpr(node.object);
  const recvPrefix = seqRecvOpt?.type === 'SequenceExpression' && Number.isInteger(seqRecvOpt.start)
    ? seqRecvOpt.expressions.slice(0, -1) : [];
  const recvTail = seqRecvOpt?.type === 'SequenceExpression'
    ? unwrapRuntimeExpr(seqRecvOpt.expressions.at(-1)) : seqRecvOpt;
  const reusable = ctx.isReusableReceiver(recvTail);
  const ref = reusable ? null : ctx.injector.generateDeclaredRef(metaPath);
  function held() {
    return reusable ? cloneNode(recvTail) : identifier(ref);
  }
  const liftable = (meta.sideEffects ?? []).filter(effect => !recvPrefix.includes(effect));
  const lookup = callExpression(identifier(ctx.injectPureImport(entry, hintName)), [held()]);
  const dispatch = chainExpression(callExpression(
    memberExpression(lookup, identifier('call'), { optional: true }),
    [held(), ...parent.arguments.map(argument => cloneNode(argument))]));
  ctx.markRewrite();
  const optTarget = callerPath.parentPath?.node?.type === 'ChainExpression' ? callerPath.parentPath : callerPath;
  const consumed = optTarget.node;
  const memoLead = reusable ? [] : [ctx.assignmentExpression('=', identifier(ref), cloneNode(recvTail))];
  optTarget.replaceWith(withSideEffects(dispatch,
    [...memoLead, ...recvPrefix.map(expr => cloneNode(expr)), ...liftable]));
  markSubtreeSkipped(ctx.skippedNodes, consumed);
}

export function emitBareOptionalSeDispatch({ node, parent, callerPath, metaPath, meta, entry, hintName }, ctx) {
  const bare = unwrapRuntimeExpr(node.object);
  // a receiver the guard cannot SPELL TWICE - the test reads it and so does the dispatch -
  // memoizes into the test itself, which is the one evaluation the source performs
  // (`(eff(), arr)?.flat()` -> `null == (_ref = (eff(), arr)) ? void 0 : _flat(_ref).call(_ref)`)
  const reusable = ctx.isReusableReceiver(bare);
  // a PAREN-SEALED lookup keeps the plain emitter's twin: the guard wraps ONLY the lookup -
  // the harvested key effects ride its alternate, where native runs them past the
  // short-circuit - and `.call` stays outside the ternary
  // (`(arr?.[(probe++, "includes")])(1)` -> `(arr == null ? void 0 : (probe++, _includes(arr))).call(arr, 1)`)
  if (ctx.calleeParenWrapped(parent)) {
    if (!reusable) return;
    const keyEffects = (meta.sideEffects ?? [])
      .filter(effect => !subtreeContainsNode(bare, effect))
      .map(effect => cloneNode(effect));
    const lookup = callExpression(identifier(ctx.injectPureImport(entry, hintName)), [cloneNode(bare)]);
    const sealedGuard = renderShortCircuitGuard(nullGuardTest(cloneNode(bare)),
      keyEffects.length ? sequenceExpression([...keyEffects, lookup]) : lookup);
    ctx.markRewrite();
    const consumed = callerPath.node;
    callerPath.replaceWith(callExpression(
      memberExpression(sealedGuard, identifier('call')),
      [cloneNode(bare), ...parent.arguments.map(argument => cloneNode(argument))]));
    markSubtreeSkipped(ctx.skippedNodes, consumed);
    return;
  }
  const ref = reusable ? null : ctx.injector.generateDeclaredRef(metaPath);
  const held = reusable ? cloneNode(bare) : identifier(ref);
  const optionalCall = parent.optional === true;
  let dispatch = callExpression(
    memberExpression(callExpression(identifier(ctx.injectPureImport(entry, hintName)), [cloneNode(held)]),
      identifier('call'), { optional: optionalCall }),
    [cloneNode(held), ...parent.arguments.map(argument => cloneNode(argument))],
  );
  if (optionalCall) dispatch = chainExpression(dispatch);
  // the memo SPELLS the receiver whole, its own sequence prefix included: an effect the test
  // already runs must not run a second time in the alternate - only the KEY's effects are left
  // for it (`(eff(), arr)?.[(k(), 'flat')]()` -> `... ? void 0 : (k(), _flat(_ref)...)`)
  const effects = (meta.sideEffects ?? [])
    .filter(effect => !subtreeContainsNode(bare, effect))
    .map(effect => cloneNode(effect));
  ctx.markRewrite();
  replaceGuardedHop({
    hopPath: callerPath,
    test: nullGuardTest(reusable ? cloneNode(bare)
      : ctx.assignmentExpression('=', identifier(ref), cloneNode(bare))),
    built: effects.length ? sequenceExpression([...effects, dispatch]) : dispatch,
    skippedNodes: ctx.skippedNodes,
  });
}

// a PAREN-SEALED callee / tag above a guarded hop: the call sits OUTSIDE the seal, so pulling
// its receiver into the alternate would hand the call a bare value and lose `this`. returns the
// FIRST tail member that must stay outside instead, taking the short-circuit the source owed it
// a READ form whose receiver's own evaluation is OBSERVABLE (a member get off a nullish-able
// value, a call): the substitution erases the key spelling, and ECMA runs the receiver BEFORE
// the key, so the memo leads and the harvested effects ride behind it
// (`probeHeld.Object[(k++, 'keys')]` -> `(_ref = probeHeld.Object, k++, _keys(_ref))`).
// a LITERAL receiver constructs unobservably and keeps the plain prefix instead
export function emitSeKeyReadMemo({ node, metaPath, meta, entry, hintName }, ctx) {
  const { injectPureImport, injector, markRewrite, skippedNodes } = ctx;
  const receiver = unwrapRuntimeExpr(node.object);
  const id = injectPureImport(entry, hintName);
  const effects = meta.sideEffects.map(effect => cloneNode(effect));
  markRewrite();
  if (LITERAL_RECEIVER_TYPES.has(receiver?.type) && !mayHaveSideEffects(receiver)) {
    replaceGuardedHop({
      hopPath: metaPath,
      test: null,
      built: withSideEffects(callExpression(identifier(id), [cloneNode(receiver)]), effects),
      skippedNodes,
    });
    return;
  }
  const ref = injector.generateDeclaredRef(metaPath);
  replaceGuardedHop({
    hopPath: metaPath,
    test: null,
    built: sequenceExpression([
      ctx.assignmentExpression('=', identifier(ref), cloneNode(receiver)),
      ...effects,
      callExpression(identifier(id), [identifier(ref)]),
    ]),
    skippedNodes,
  });
}

// the sealed optional-lookup emission: the KEY effect rides its own nullish guard while the
// helper call stays unconditional (it throws on null like the native `(undefined)()`)
export function emitSealedKeySeConsume({ id, object, metaPath, hopPath, callerPath, effects, methodCallConsume }, ctx) {
  // a MEMO'd receiver carries its own store as the leading effect: that store IS what the guard
  // tests (`null == (_ref = (mark(), _globalThis)) ? void 0 : (tag(), void 0)`), so it moves into
  // the test instead of running ahead of it
  const memoStore = object?.type === 'Identifier' && effects[0]?.type === 'AssignmentExpression'
    && effects[0].left?.type === 'Identifier' && effects[0].left.name === object.name ? effects[0] : null;
  const { disjuncts, makeBase } = memoStore
    ? { disjuncts: [memoStore], makeBase: () => cloneNode(object) }
    : ctx.guardObject(object, metaPath);
  const guardedKeySe = renderShortCircuitGuard(ctx.composeGuardTest(disjuncts, null),
    sequenceExpression([...effects.slice(memoStore ? 1 : 0).map(effect => cloneNode(effect)), voidZero()]));
  const consumed = hopPath.node;
  hopPath.replaceWith(sequenceExpression([guardedKeySe, ctx.buildSymbolConsumeCore({
    id, object: makeBase(), methodCallConsume, callerPath, metaPath, receiverClone: () => makeBase(),
  })]));
  markSubtreeSkipped(ctx.skippedNodes, consumed);
}

// will this receiver COLLAPSE into a spelling the source never wrote? a hop over a sequence
// always does, and a hop over a call does when the call yields a proxy global (an opaque one
// stays spelled and needs no memo). babel memoizes exactly that minted spelling
// the provider's `symbolReceiverProxyRoot`: a proxy-global receiver directly under the symbol hop
// resolves to its ROOT pure import ONCE, shared, so all three emitters render the same
// `_getIteratorMethod((droppedSe, _root))` instead of a dead leaf hop. a SUBSTITUTED root is always
// defined, so the erased span's `?.` dies with it; a KEPT root can be absent, so its guard re-hangs
// on the symbol member itself
export function collapseSymbolProxyRoot(meta, metaPath, { resolvePure, injectPureImport, skippedNodes }) {
  const proxyRoot = meta.symbolReceiverProxyRoot;
  if (!proxyRoot) return false;
  const keptClone = proxyRoot.keepRoot ? cloneNode(proxyRoot.keepRoot) : null;
  const rootPure = keptClone ? null : resolvePure({ kind: 'global', name: proxyRoot.rootName }, metaPath);
  if (!keptClone && !rootPure) return false;
  const { node } = metaPath;
  const rootBinding = keptClone ?? identifier(injectPureImport(rootPure.entry, rootPure.hintName));
  const droppedSe = proxyRoot.droppedSe.map(effect => cloneNode(effect));
  const isOptional = !!proxyRoot.isOptionalAccess;
  // the collapse replaces the WHOLE receiver span with the root plus the harvested effects: every
  // other claim queued inside it composes against source that is gone
  markSubtreeSkipped(skippedNodes, node.object);
  // a following key SE would make the emit PEEL a sequence receiver and replay only the recorded
  // prefix, losing droppedSe - route it through the SE channel instead. the optional access
  // memoizes the whole receiver in its guard, so it keeps the tighter inline form
  if (droppedSe.length && meta.sideEffects?.length && !isOptional) {
    meta.sideEffects = [...droppedSe, ...meta.sideEffects];
    meta.receiverEffectCount = (meta.receiverEffectCount ?? 0) + droppedSe.length;
    node.object = rootBinding;
  } else node.object = droppedSe.length ? sequenceExpression([...droppedSe, rootBinding]) : rootBinding;
  if (keptClone && isOptional) node.optional = true;
  return true;
}

// the READ whose receiver spelling already carries every harvested effect. a KEPT WRITE
// anchors the prefix and the whole sequence rides INSIDE the dispatch (`((v = g)).Map.name`
// -> `_name((v = _globalThis, _Map))`); a plain SE prefix lifts OUT instead and the quiet
// tail is the receiver. a receiver reading THROUGH a sequence the source never wrote - a
// kept write anywhere in it, or a spelling an earlier render MINTED - memoizes into a ref
// the helper sees (`(_ref = (eff(), _Set), _name(_ref))`); only an author-written sequence
// lifts (a synthesized node carries no source span)
export function emitSeCarryingReceiverRead({ node, metaPath, entry, hintName },
  { adapter, injector, injectPureImport, markRewrite, skippedNodes }) {
  const id = injectPureImport(entry, hintName);
  markRewrite();
  const seqRecv = unwrapRuntimeExpr(node.object);
  const seqTail = seqRecv?.type === 'SequenceExpression'
          ? unwrapRuntimeExpr(seqRecv.expressions.at(-1)) : null;
  const seqWrites = seqRecv?.type === 'SequenceExpression'
          && seqRecv.expressions.slice(0, -1)
            .some(expr => {
              const stored = unwrapRuntimeExpr(expr);
              // a COMPOUND assignment is an ordinary effect, not a kept write: nothing
              // downstream reads what it stored (`(n += 100, _Promise).name` lifts)
              return stored?.type === 'AssignmentExpression' && stored.operator === '=';
            });
  const liftedPrefix = seqTail && seqTail.type !== 'AssignmentExpression' && !seqWrites
          && Number.isInteger(seqRecv.start)
          ? seqRecv.expressions.slice(0, -1) : null;
  const hopOverSeq = seqWrites || receiverMintsSpelling(seqRecv, { adapter, metaPath })
          ? injector.generateDeclaredRef(metaPath) : null;
  replaceGuardedHop({
    hopPath: metaPath,
    test: null,
    built: liftedPrefix
      ? withSideEffects(callExpression(identifier(id), [cloneNode(seqTail)]), liftedPrefix)
      : hopOverSeq ? sequenceExpression([
        assignmentExpression('=', identifier(hopOverSeq), cloneNode(node.object)),
        callExpression(identifier(id), [identifier(hopOverSeq)]),
      ])
      : callExpression(identifier(id), [cloneNode(node.object)]),
    skippedNodes,
  });
}

// the `?.()` of an inherited static resolves like its plain twin: the ponyfill is always
// defined, so nothing short-circuits and the split hands back a guard-less receiver. the key
// is passed EXPLICITLY - this path anchors on the trailing claim, not on `super.<key>` itself
export function inheritedStaticCalleeSplit(node, callee, metaPath, ctx) {
  const calleeObject = unwrapRuntimeExpr(callee.object);
  // a COMPUTED key answers through the canonical resolver, but only when it carries NO
  // effect: this split has no slot that spells an effectful key exactly once, so the raw
  // guarded read stays the honest answer there
  // an EFFECT-FREE computed key answers through the canonical resolver; an SE-BEARING one
  // stays out - the claim ABOVE harvests those effects and spells them itself, so a copy
  // here runs them twice, and there is no channel to tell that harvest they were consumed
  const key = callee.computed
    ? resolveKey({
      node: callee.property,
      computed: true,
      scope: metaPath.scope,
      adapter: ctx.adapter,
      path: metaPath,
      bailOnSideEffectKey: true,
    })
    : callee.property?.type === 'Identifier' ? callee.property.name : null;
  if (typeof key !== 'string') return null;
  const thisReceiver = ctx.isThisReceiver(calleeObject);
  if (calleeObject?.type !== 'Super' && !thisReceiver) return null;
  // an own class member SHADOWS the inherited surface - `this.<key>` reads that one
  if (thisReceiver && ctx.isShadowedByClassOwnMember(metaPath, key)) return null;
  const inherited = ctx.resolveStaticInheritedMember(metaPath, key);
  const remapped = inherited && remapInheritedStaticMeta(ctx.injectorState,
    { kind: 'property', object: null, key, placement: 'static' }, inherited);
  const result = remapped && !ctx.isMutatedStatics(remapped) ? ctx.resolvePure(remapped, metaPath) : null;
  if (!result || result.kind === 'instance') return null;
  return {
    hopKind: 'call',
    disjuncts: [],
    receiver: callExpression(
      memberExpression(identifier(ctx.injectPureImport(result.entry, result.hintName)), identifier('call')),
      [{ type: 'ThisExpression' }, ...node.arguments.map(argument => cloneNode(argument))],
    ),
  };
}

// the READ form of an SE-carrying claim over a LIVE-optional receiver: the guard owns the
// split, the read-form dispatch rides the alternate with the rebuilt receiver spelling -
// its kept key effects run inside it, where the source ran them (babel: `null == (_ref =
// t = gw) ? void 0 : _atMaybeArray(_ref[(k(), "Array")].prototype).call([5], 0)`)
export function emitSeReadFormOverLiveOptional({ node, metaPath, entry, hintName }, ctx) {
  const readSplit = ctx.splitOptionalReceiver(node.object, metaPath);
  if (!readSplit || readSplit === ctx.stagedSplit) return;
  const id = ctx.injectPureImport(entry, hintName);
  ctx.markRewrite();
  replaceGuardedHop({ hopPath: metaPath, test: ctx.composeGuardTest(readSplit.disjuncts, null),
    built: callExpression(identifier(id), [readSplit.receiver]), skippedNodes: ctx.skippedNodes });
}

// the sealed plainly-called lookup shape (`(arr?.[S])()`): zero args, no `?.` on the call
export function isSealedDirectSymbolCall(metaPath) {
  const sealedCallerPath = climbToCallerPath(metaPath);
  const sealedCaller = sealedCallerPath !== metaPath.parentPath ? sealedCallerPath?.node : null;
  return !!sealedCaller && sealedCaller.type === 'CallExpression' && !sealedCaller.optional
    && unwrapRuntimeExpr(sealedCaller.callee) === metaPath.node && sealedCaller.arguments.length === 0;
}
