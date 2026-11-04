import {
  isAliasProxyRoot,
  isMemberAccessNode,
  isMutatedGlobalSlot,
  isPristineProxyGlobal,
  POSSIBLE_GLOBAL_OBJECTS,
  receiverContainsOptional,
  staticMemberKeyName,
  TS_EXPR_WRAPPERS,
  unwrapRuntimeExpr,
} from '../helpers/ast-patterns.js';
import {
  chainReadsThroughSeal,
  foldSeqKeyLiteralTail,
  findProxyGlobal,
  navValueCanShortCircuit,
  proxyGlobalMemberCtorPureSwap,
  peelChainRootValue,
  pristineRealmHopKey,
  resolveKey,
  resolveObjectName,
  unbackedProxyHopKey,
} from './resolve.js';
import { decidedReusableReceiver } from './destructure.js';
import { guardProbeUndefinable, holdsProxySurface } from './guard-preparation.js';

// A named constructor read owns its ponyfill, except a mutated slot. Realm names
// are navigation, not constructor claims. Delete ownership ignores the slot write;
// the entry resolver still decides whether this build can serve the claim.
export function splitConstructorClaim(key, { adapter, resolveGlobal }, deleteHosted = false) {
  return typeof key === 'string' && !POSSIBLE_GLOBAL_OBJECTS.has(key)
    && (deleteHosted || !isMutatedGlobalSlot(adapter, key)) ? resolveGlobal(key) : null;
}

// A named host can yield a static or a realm's global, never an instance dispatch.
// The latter owns its receiver and cannot be substituted as a receiverless value.
function splitStaticClaim(host, key, { resolvePure }) {
  if (!host || !key) return null;
  const pure = resolvePure({ kind: 'property', object: host, key, placement: 'static' });
  return pure && pure.kind !== 'instance' ? pure : null;
}

// A constructor replacement makes its next optional member unconditional only
// when the source has no live environment probe. Alias realm roots keep their
// binding; constructor leaves land on their own ponyfill. Effects still precede
// the landing. No import or native allocation belongs to this proof.
export function optionalConstructorLanding(receiver, ctx) {
  const swap = proxyGlobalMemberCtorPureSwap({ receiver, aliasCtx: ctx, resolvePure: ctx.resolvePure });
  if (!swap) return null;
  const realm = POSSIBLE_GLOBAL_OBJECTS.has(swap.pure.hintName);
  const root = realm || swap.se.length ? findProxyGlobal(receiver, ctx, true) : null;
  if ((swap.se.length && !root)
    || navValueCanShortCircuit(unwrapRuntimeExpr(receiver), ctx.resolvePure, ctx, { throughChainAssign: true })) return null;
  return { pure: swap.pure, effects: swap.se,
    source: realm && isAliasProxyRoot(root, ctx) ? root : null };
}

// Decide a single optional member's landing before allocating a guard or import.
// A live environment probe defeats the whole-constructor swap, even through a
// seal or an alias. Kept writes and sequence prefixes stay in the guard source;
// only their value is followed when the continuation needs a named claim.
export function planOptionalMemberSplit(node, ctx) {
  const { adapter } = ctx;
  const landing = optionalConstructorLanding(node.object, ctx);
  if (landing) return { kind: 'unguarded', ...landing };
  const surface = holdsProxySurface(node.object, ctx);
  const hop = surface && pristineRealmHopKey(node, ctx, { allowOptional: true });
  const key = node.computed ? null : node.property?.name ?? null;
  const decided = decidedReusableReceiver(node.object, ctx);
  const guard = { decided, bareMemo: !!hop, mutatedLeaf: !!key && isMutatedGlobalSlot(adapter, key), readerKey: key };
  if (hop) return { kind: 'surface', guard };
  const pure = surface && node.property?.type === 'Identifier' ? splitConstructorClaim(key, ctx) : null;
  if (pure) return { kind: 'pure', guard, pure };
  if (key && (!surface || unwrapRuntimeExpr(node.object)?.type === 'SequenceExpression')) {
    const name = resolveObjectName({ ...ctx, objectNode: peelChainRootValue(node.object) });
    if (name && POSSIBLE_GLOBAL_OBJECTS.has(name) && isPristineProxyGlobal(adapter, name)) {
      return { kind: 'proven', guard, key };
    }
  }
  return { kind: 'member', guard };
}

// A second optional may reuse the first surface proof only while that proof is
// live and its value can still be spelled off the memo. An unbacked hop is its
// own environment read. Effectful keys never enter the quiet-hop collapse.
export function optionalSplitReusesSurface(node, ctx) {
  if (!receiverContainsOptional(node.object) || !pristineRealmHopKey(node, ctx, { allowOptional: true })) return false;
  const inner = unwrapRuntimeExpr(node.object);
  const nav = unwrapRuntimeExpr(inner?.object);
  return !!inner && !unbackedProxyHopKey(inner, ctx.resolvePure)
    && !(isMemberAccessNode(nav) && holdsProxySurface(nav, ctx))
    && (!isMemberAccessNode(inner) || !inner.optional || guardProbeUndefinable(inner.object, ctx));
}

// A continuation reads either the guarded surface or a named chain carried from
// it. A computed constructor key may resolve quietly; a static key folds only
// with an explicit spelling whose effects can accompany the replacement.
export function planSplitMemberLanding(node, { proxySurface, provenKey }, ctx) {
  if (proxySurface && !node.computed && isPristineProxyGlobal(ctx.adapter, node.property?.name)) return { kind: 'surface' };
  let folded = null;
  if (proxySurface || provenKey) {
    folded = node.computed ? foldSeqKeyLiteralTail(node.property, ctx)
      : node.property?.type === 'Identifier' ? { key: node.property.name, effects: [] } : null;
  }
  if (proxySurface) {
    if (!folded && node.computed) {
      const key = resolveKey({ ...ctx, node: node.property, computed: true, bailOnSideEffectKey: true });
      if (typeof key === 'string') folded = { key, effects: [] };
    }
    const pure = folded && splitConstructorClaim(folded.key, ctx);
    if (pure) return { kind: 'pure', pure, effects: folded.effects };
  }
  if (provenKey) {
    const pure = folded && splitStaticClaim(provenKey, folded.key, ctx);
    if (pure) return { kind: 'pure', pure, effects: folded.effects };
    return { kind: 'member', base: isPristineProxyGlobal(ctx.adapter, provenKey)
      ? {} : { key: provenKey, pure: splitConstructorClaim(provenKey, ctx) } };
  }
  return { kind: 'member' };
}

// A claim below the end owns the later guard rendering; the end itself does not.
// An unknown middle key is a step, not a stop. A sealed prototype read cannot
// carry the nav's short-circuit, while constructor/static claims still own their
// substitution and throw probe. Native walkers only supply the source and the
// delete consumer; the same claim decisions serve split continuation landings.
export function nestedOptionalClaim(node, ctx, { deleteHosted = false } = {}) {
  const sealed = chainReadsThroughSeal(node, meta => ctx.resolveGlobal(meta.name), ctx);
  for (let member = node.object; member;) {
    while (member && TS_EXPR_WRAPPERS.has(member.type)) member = member.expression;
    if (!isMemberAccessNode(member)) break;
    const key = staticMemberKeyName(member);
    if (POSSIBLE_GLOBAL_OBJECTS.has(key)) break;
    const global = splitConstructorClaim(key, ctx, deleteHosted);
    if (global) return { node: member, pure: global };
    const host = key ? staticMemberKeyName(member.object) : null;
    const pure = host && !POSSIBLE_GLOBAL_OBJECTS.has(host) ? splitStaticClaim(host, key, ctx) : null;
    if (pure?.kind === 'static') return { node: member, pure };
    const ctor = !sealed && host === 'prototype' ? staticMemberKeyName(unwrapRuntimeExpr(member.object).object) : null;
    const prototype = ctor && key && ctx.resolvePrototype?.(ctor, key);
    if (prototype) return { node: member, pure: prototype };
    member = member.object;
  }
  return null;
}
