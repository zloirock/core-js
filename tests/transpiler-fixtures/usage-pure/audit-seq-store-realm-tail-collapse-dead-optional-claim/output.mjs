import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the `?.` over the store is DEAD for a claim above too: the store hands the always-defined
// ponyfill on, so the instance dispatch takes its receiver plain instead of memoizing a guard
let g6, w6;
export const deadOptionalClaim = _atMaybeArray((g6 = _globalThis, w6 = _self).Array.prototype);