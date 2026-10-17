import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _self from "@core-js/pure/actual/self";
// a call through the tail keeps its receiver binding and drops the same trailing hop
let w;
export const viaSelfCallHop = _includesMaybeArray((w = _self, _self).Array.prototype).call([1, 2], 2);