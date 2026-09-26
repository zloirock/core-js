import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// Source stores keep their own values and evaluation order when a carrier hands them to a claim.
// A plain run ending at backed self stores that ponyfill, so the outer optional adds no guard.
// Each alias is assigned once to keep the store-follow boundary visible.
let v, g, out;
out = (g = _globalThis, v = _self, _Number$MAX_SAFE_INTEGER).name;
export const read = out;