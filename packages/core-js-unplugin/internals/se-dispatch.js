// SE-carrying emission forms: dispatches and reads that replay harvested side effects
// ahead of (or inside) the spelling they guard
import {
  planReceiverEffects,
  planSymbolReceiverRoot,
  prepareStaticReceiver,
} from '@core-js/polyfill-provider/detect-usage/guard-preparation';
import { resolveKey } from '@core-js/polyfill-provider/detect-usage/resolve';
import { instanceSynthReceiverPure } from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  calleeParenWrapped,
  subtreeContainsNode,
  unwrapRuntimeExpr,
  peelNestedSequenceExpressions,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { remapInheritedStaticMeta } from '@core-js/polyfill-provider/helpers/class-walk';
import {
  callExpression,
  cloneNode,
  identifier,
  sequenceExpression,
  nullGuardTest,
  composeNullGuardTest,
  planMethodCall,
  planReceiverMemo,
  renderMethodCall,
  renderReceiverMemo,
  renderReceiverEffects,
  renderGuardedMethodCall,
  renderSymbolReceiverRoot,
} from '@core-js/polyfill-provider/render';
import { replaceGuardedHop, sealedLayerAbove } from './claim-guards.js';
import { climbToCallerPath, markSubtreeSkipped } from './nav-spine.js';

// An optional method call keeps the complete first receiver in its lookup argument.
// A computed key instead follows that evaluation, before the lookup and its this-value.
export function emitOptionalCallWithLiftedSe({ node, parent, callerPath, metaPath, meta, entry, hintName }, ctx) {
  const seqRecvOpt = unwrapRuntimeExpr(node.object);
  const receiverSequence = seqRecvOpt?.type === 'SequenceExpression' ? peelNestedSequenceExpressions(seqRecvOpt) : null;
  const recvPrefix = receiverSequence?.prefix ?? [];
  let recvTail = receiverSequence?.tail ?? seqRecvOpt;
  const pure = ctx.receiverPure ?? instanceSynthReceiverPure(recvTail, {
    scope: metaPath.scope,
    path: metaPath,
    adapter: ctx.adapter,
    injectorState: ctx.injectorState,
    resolvePure: m => ctx.resolvePure(m, metaPath),
  });
  if (pure) recvTail = identifier(ctx.injectPureImport(pure.entry, pure.hintName));
  const renderedReceiver = pure
    ? receiverSequence ? sequenceExpression([...recvPrefix.map(expr => cloneNode(expr)), cloneNode(recvTail)]) : cloneNode(recvTail)
    : cloneNode(node.object);
  const liftedReceiverEffects = (meta.sideEffects ?? []).slice(0, meta.receiverEffectCount ?? 0)
    .filter(effect => !subtreeContainsNode(node.object, effect));
  const firstReceiver = liftedReceiverEffects.length
    ? sequenceExpression([...liftedReceiverEffects.map(expr => cloneNode(expr)), renderedReceiver]) : renderedReceiver;
  const decision = planMethodCall({
    receiver: firstReceiver,
    sideEffects: (meta.sideEffects ?? []).slice(meta.receiverEffectCount ?? 0),
    optional: true, args: parent.arguments, callPath: callerPath,
    ctx: { scope: metaPath.scope, path: metaPath, adapter: ctx.adapter, injectorState: ctx.injectorState },
  });
  const dispatch = renderMethodCall(decision, {
    helper: identifier(ctx.injectPureImport(entry, hintName)),
    mintRef: () => ctx.injector.generateDeclaredRef(metaPath), embed: cloneNode,
  });
  ctx.markRewrite();
  const optTarget = callerPath.parentPath?.node?.type === 'ChainExpression' ? callerPath.parentPath : callerPath;
  const consumed = optTarget.node;
  optTarget.replaceWith(dispatch);
  markSubtreeSkipped(ctx.skippedNodes, consumed);
}

export function emitBareOptionalSeDispatch({ node, parent, callerPath, metaPath, meta, entry, hintName }, ctx) {
  const bare = unwrapRuntimeExpr(node.object);
  const decision = planMethodCall({
    receiver: bare,
    sideEffects: (meta.sideEffects ?? []).filter(effect => !subtreeContainsNode(bare, effect)),
    optional: parent.optional === true, args: parent.arguments, callPath: callerPath,
    ctx: { scope: metaPath.scope, path: metaPath, adapter: ctx.adapter, injectorState: ctx.injectorState },
  });
  const { checks, built } = renderGuardedMethodCall(decision, {
    helper: identifier(ctx.injectPureImport(entry, hintName)), sealed: calleeParenWrapped(parent),
    mintRef: () => ctx.injector.generateDeclaredRef(metaPath), embed: cloneNode,
  });
  ctx.markRewrite();
  replaceGuardedHop({
    hopPath: callerPath, test: composeNullGuardTest(checks), built, skippedNodes: ctx.skippedNodes,
  });
}

// Bind an ordinary member read to the common receiver/effect plan. Native optional
// preparation owns the first guard read; the plan sees its prepared receiver. Effects
// already carried by the source stay there across static-receiver preparation.
export function emitSeKeyReadMemo({ node, metaPath, meta, entry, hintName }, ctx) {
  const { injectPureImport, injector, markRewrite, skippedNodes } = ctx;
  const sourceReceiver = unwrapRuntimeExpr(node.object);
  const receiverCtx = {
    scope: metaPath.scope, path: metaPath, adapter: ctx.adapter, injectorState: ctx.injectorState,
    resolvePure: usage => ctx.resolvePure(usage, metaPath),
  };
  const prepared = prepareStaticReceiver(sourceReceiver, receiverCtx, { injectImport: injectPureImport, embed: cloneNode });
  const id = injectPureImport(entry, hintName);
  const effects = (meta.sideEffects ?? []).filter(effect => !subtreeContainsNode(sourceReceiver, effect));
  const hooks = { mintRef: () => injector.generateDeclaredRef(metaPath), embed: cloneNode };
  const guard = node.optional && renderReceiverMemo(planReceiverMemo(prepared, {
    interveningEffects: effects.length > 0, ctx: receiverCtx,
  }), hooks);
  const plan = planReceiverEffects({
    receiver: guard ? guard.makeBase() : prepared,
    sideEffects: effects,
    guarded: !!guard,
    receiverReads: 1,
    ctx: receiverCtx,
  });
  const product = renderReceiverEffects(plan, hooks);
  markRewrite();
  replaceGuardedHop({
    hopPath: metaPath,
    test: guard ? nullGuardTest(guard.firstRead) : null,
    built: sequenceExpression([
      ...product.effects ?? [],
      callExpression(identifier(id), [product.receiver]),
    ]),
    skippedNodes,
  });
}

// Bind a sealed lookup to its prepared checks and ordered effects. Invocation and
// arguments stay outside that lookup's guard; a whole-call helper receives its value.
export function emitSealedKeySeConsume({ id, object, metaPath, hopPath, callerPath, effects, capture, checks, methodCallConsume }, ctx) {
  // The producer declares the leading capture that can move into this guard. Move
  // that same node and remove its old effect slot; no generated spelling is inspected.
  const { disjuncts, makeBase } = checks || capture
    ? { disjuncts: checks ?? [capture], makeBase: () => cloneNode(object) }
    : ctx.guardObject(object, metaPath, { interveningEffects: effects.length > 0 });
  const decision = planMethodCall({
    receiver: makeBase(), prepared: true,
    sideEffects: effects.slice(capture ? 1 : 0), args: callerPath.node.arguments,
    ctx: { scope: metaPath.scope, path: metaPath, adapter: ctx.adapter, injectorState: ctx.injectorState },
  });
  const { built } = renderGuardedMethodCall(decision, {
    helper: identifier(id), guard: { checks: disjuncts, receiver: makeBase() },
    invoke: methodCallConsume, sealed: true,
    embed: (node, role) => role === 'receiver' ? makeBase() : cloneNode(node),
  });
  const consumed = hopPath.node;
  hopPath.replaceWith(built);
  markSubtreeSkipped(ctx.skippedNodes, consumed);
}

// Apply the shared symbol root and effect decision, retiring only the erased
// receiver span. Kept source slots are cloned and remain available for traversal.
export function collapseSymbolProxyRoot(meta, metaPath, { resolvePure, injectPureImport, skippedNodes }) {
  const plan = planSymbolReceiverRoot(meta.symbolReceiverProxyRoot, {
    sideEffects: meta.sideEffects,
    receiverEffectCount: meta.receiverEffectCount,
    resolvePure: entry => resolvePure(entry, metaPath),
  });
  if (!plan) return false;
  const root = renderSymbolReceiverRoot(plan, { injectImport: injectPureImport, embed: cloneNode });
  markSubtreeSkipped(skippedNodes, metaPath.node.object);
  meta.sideEffects = root.sideEffects;
  meta.receiverEffectCount = root.receiverEffectCount;
  metaPath.node.object = root.receiver;
  if (root.optional) metaPath.node.optional = true;
  return true;
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
    receiver: renderMethodCall(planMethodCall({
      receiver: { type: 'ThisExpression' }, prepared: true, methodGuarded: true, args: node.arguments,
    }), { lookup: identifier(ctx.injectPureImport(result.entry, result.hintName)), embed: cloneNode }),
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
  // the rebuilt spelling folds the realm hops it reads off the split's own memo, exactly as the
  // ordinary split's does - one receiver question, asked wherever a split hands its value on
  const receiver = ctx.collapseSplitReceiver(readSplit.receiver, metaPath);
  replaceGuardedHop({ hopPath: metaPath, test: ctx.composeGuardTest(readSplit.disjuncts, null),
    built: callExpression(identifier(id), [receiver]), skippedNodes: ctx.skippedNodes });
}

// the sealed plainly-called lookup shape (`(arr?.[S])()`): zero args, no `?.` on the call.
// a paren seals; a `!` before the call continues the chain (`arr?.[S]!()`)
export function isSealedDirectSymbolCall(metaPath) {
  const sealedCaller = sealedLayerAbove(metaPath, metaPath.node) ? climbToCallerPath(metaPath)?.node : null;
  return !!sealedCaller && sealedCaller.type === 'CallExpression' && !sealedCaller.optional
    && unwrapRuntimeExpr(sealedCaller.callee) === metaPath.node && sealedCaller.arguments.length === 0;
}
