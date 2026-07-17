// a deferred-SE destructure host (a `({ hop: { leaf } } = root)` assignment buried in a consumed
// init's sequence prefix) must re-anchor exactly like the plain statement form even though no
// leaf resolves: the AST emitter re-enters the anchored-plan trigger on its drain re-traversal;
// the text emitter records the lifted operand and composes the anchored rebuild into the lifted
// statement by needle.
let customY;
export const { of } = (({ Map: { customY } } = globalThis), Array);
// assignment-host consume lifts and re-anchors the same way
let customZ, from1;
({ from: from1 } = (({ Map: { customZ } } = globalThis), Array));
export { from1 };
// a RESOLVABLE leaf folds to the same bare extraction on both emitters (statement vs
// paren-wrapped expression is a print-only divergence)
let picked;
export const { from } = (({ Map: { groupBy: picked } } = globalThis), Array);
export { picked };
// an SE inside the host's own RHS folds too: the effect runs exactly once in both
// emitters (statement-lift vs in-place sequence is a print-only divergence)
let customW;
let c = 0;
export const { entries } = (({ Map: { customW } } = (c++, globalThis)), Object);
// a FOR-INIT consumed prefix re-embeds into the sink AND folds: the host rebuilds before
// the sink captures it, so the re-anchored read lands inside the re-embedded slot
let customV, out;
for (const { keys } = (({ Map: { customV } } = globalThis), Object); !out;) out = keys;
export { out };
// a VERBATIM computed sibling + consumed static under one anchored ctor: the static
// extraction rides the discarded-value slot (polyfill always wins - a default-injection
// fallback would let a buggy-but-present native shadow it), the computed key re-keys in
// the re-anchored residual
let avx, fvx;
export const { getOwnPropertySymbols } = (({ Array: { [Symbol.asyncIterator]: avx, from: fvx } } = globalThis), Object);
export { avx, fvx };
let avy, fvy, oy;
for (const { isFrozen } = (({ Array: { [Symbol.asyncIterator]: avy, of: fvy } } = globalThis), Object); !oy;) oy = isFrozen;
// a ctor-ALIAS host folds too (anchor-less full consume): the alias binds the pure ctor
let aM;
export const { getOwnPropertyDescriptors: gpd2 } = (({ Map: aM } = globalThis), Object);
export { aM };
// a REST sibling keeps its sentinel'd residual while the static extraction still wins,
// and the sentinel is PRE-DECLARED (an assignment host's LHS write needs the `var`)
let fRe, rRe;
export const { create: crD } = (({ Promise: { allSettled: fRe, ...rRe } } = globalThis), Object);
export { fRe, rRe };
let fRf, rRf, oRf;
for (const { isSealed } = (({ Array: { fromAsync: fRf, ...rRf } } = globalThis), Object); !oRf;) oRf = isSealed;
// an anchor-less full consume with an SE-bearing init: the prefix stays verbatim ahead of
// the alias assign (by parts, no anchor read involved)
let mS2;
export const { isExtensible } = (({ Set: mS2 } = (eff(), globalThis)), Object);
export { mS2 };
// gate boundaries: a MULTI-prop host stays un-anchored (single-hop shape only); a DEEPER nest
// re-anchors one level; a binding-resolved computed key re-anchors like the dotted form
let m1, m2, deep, viaKey;
const hopKey = 'Map';
export const { getOwnPropertyNames } = (({ Map: { m1 }, Set: { m2 } } = globalThis), Object);
export const { values } = (({ Map: { customY: { deep } } } = globalThis), Object);
export const { assign } = (({ [hopKey]: { viaKey } } = globalThis), Object);
// a LATER `var _ref;` hoist (minted by the guarded default below) must not displace the
// lifted statements queued ABOVE - the drain re-anchors, keeping each lift under its `let`
const plainRecv = getObj();
const { [Symbol.iterator]: guarded = null } = plainRecv;
guarded;
