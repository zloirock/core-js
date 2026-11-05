// Source-specific receiver preparation for the optional dispatch channel.
import { planSymbolReceiverRoot } from '@core-js/polyfill-provider/detect-usage/guard-preparation';
import { resolveKey } from '@core-js/polyfill-provider/detect-usage/resolve';
import { memberKeyName, unwrapRuntimeExpr } from '@core-js/polyfill-provider/helpers/ast-patterns';
import { remapInheritedStaticMeta } from '@core-js/polyfill-provider/helpers/class-walk';
import { cloneNode, identifier, planMethodCall, renderMethodCall, renderSymbolReceiverRoot } from '@core-js/polyfill-provider/render';
import { markSubtreeSkipped } from './nav-spine.js';

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
    : memberKeyName(callee);
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
