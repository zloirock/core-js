import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$create from "@core-js/pure/actual/object/create";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getOwnPropertyDescriptors from "@core-js/pure/actual/object/get-own-property-descriptors";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$getOwnPropertySymbols from "@core-js/pure/actual/object/get-own-property-symbols";
import _Object$isExtensible from "@core-js/pure/actual/object/is-extensible";
import _Object$isFrozen from "@core-js/pure/actual/object/is-frozen";
import _Object$isSealed from "@core-js/pure/actual/object/is-sealed";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
var _ref;
// a deferred-SE destructure host (a `({ hop: { leaf } } = root)` assignment buried in a consumed
// init's sequence prefix) must re-anchor exactly like the plain statement form even though no
// leaf resolves: the AST emitter re-enters the anchored-plan trigger on its drain re-traversal;
// the text emitter records the lifted operand and composes the anchored rebuild into the lifted
// statement by needle.
let customY;
({ customY } = _Map);
export const of = _Array$of;
// assignment-host consume lifts and re-anchors the same way
let customZ, from1;
({ customZ } = _Map);
from1 = _Array$from;
export { from1 };
// a RESOLVABLE leaf folds to the same bare extraction on both emitters (statement vs
// paren-wrapped expression is a print-only divergence)
let picked;
(picked = _Map$groupBy);
export const from = _Array$from;
export { picked };
// an SE inside the host's own RHS folds too: the effect runs exactly once in both
// emitters (statement-lift vs in-place sequence is a print-only divergence)
let customW;
let c = 0;
({ customW } = (c++, _Map));
export const entries = _Object$entries;
// a FOR-INIT consumed prefix re-embeds into the sink AND folds: the host rebuilds before
// the sink captures it, so the re-anchored read lands inside the re-embedded slot
let customV, out;
for (const _ref4 = (({ customV } = _Map), Object), keys = _Object$keys; !out;) out = keys;
export { out };
// a VERBATIM computed sibling + consumed static under one anchored ctor: the static
// extraction rides the discarded-value slot (polyfill always wins - a default-injection
// fallback would let a buggy-but-present native shadow it), the computed key re-keys in
// the re-anchored residual
let avx, fvx;
({ [_Symbol$asyncIterator]: avx } = _globalThis.Array, fvx = _Array$from);
export const getOwnPropertySymbols = _Object$getOwnPropertySymbols;
export { avx, fvx };
let avy, fvy, oy;
for (const _ref3 = (({ [_Symbol$asyncIterator]: avy } = _globalThis.Array, fvy = _Array$of), Object), isFrozen = _Object$isFrozen; !oy;) oy = isFrozen;
// a ctor-ALIAS host folds too (anchor-less full consume): the alias binds the pure ctor
let aM;
(aM = _Map);
export const gpd2 = _Object$getOwnPropertyDescriptors;
export { aM };
// a REST sibling keeps its sentinel'd residual while the static extraction still wins,
// and the sentinel is PRE-DECLARED (an assignment host's LHS write needs the `var`)
let fRe, rRe;
var _unused;
({ allSettled: _unused, ...rRe } = _Promise, fRe = _Promise$allSettled);
export const crD = _Object$create;
export { fRe, rRe };
let fRf, rRf, oRf;
var _unused2;
for (const _ref2 = (({ fromAsync: _unused2, ...rRf } = _globalThis.Array, fRf = _Array$fromAsync), Object), isSealed = _Object$isSealed; !oRf;) oRf = isSealed;
// an anchor-less full consume with an SE-bearing init: the prefix stays verbatim ahead of
// the alias assign (by parts, no anchor read involved)
let mS2;
((eff(), mS2 = _Set));
export const isExtensible = _Object$isExtensible;
export { mS2 };
// gate boundaries: a MULTI-prop host stays un-anchored (single-hop shape only); a DEEPER nest
// re-anchors one level; a binding-resolved computed key re-anchors like the dotted form
let m1, m2, deep, viaKey;
const hopKey = 'Map';
({ Map: { m1 }, Set: { m2 } } = _globalThis);
export const getOwnPropertyNames = _Object$getOwnPropertyNames;
({ customY: { deep } } = _Map);
export const values = _Object$values;
({ viaKey } = _Map);
export const assign = _Object$assign;
// a LATER `var _ref;` hoist (minted by the guarded default below) must not displace the
// lifted statements queued ABOVE - the drain re-anchors, keeping each lift under its `let`
const plainRecv = getObj();
const guarded = (_ref = _getIteratorMethod(plainRecv)) === void 0 ? null : _ref;
guarded;