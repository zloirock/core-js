import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// every channel writing into ONE host statement emits in the order its props dispatched: the
// cascade renders the statics and the per-prop route the instance overwrites, and two anchors of
// their own put whichever ran second in front. both orders of the same pair are spelled here
let eff = 0;
let staticFirst;
let instanceSecond;
let instanceFirst;
let staticSecond;
let other;
eff += 1;
staticFirst = _Object$keys;
instanceSecond = _atMaybeArray(_globalThis.Array.prototype);
eff += 1;
({
  other
} = _globalThis);
instanceFirst = _atMaybeArray(_globalThis.Array.prototype);
staticSecond = _Object$keys;
export const r = [typeof staticFirst, typeof instanceSecond, typeof instanceFirst, typeof staticSecond, typeof other, eff];