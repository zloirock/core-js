import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a chain-assign optional subject whose VALUE is a global-proxy navigation keeps its guard
// (the value may be undefined off-engine), while the redundant trailing global hop over the
// memoized root is dropped: re-reading the hop off the memo would throw on engines without it
let q;
export const viaSelfHop = _flatMaybeArray((q = _self, _globalThis).Array.prototype);

// a call through the guarded tail keeps its receiver binding and drops the same trailing hop
let w;
export const viaSelfCallHop = _includesMaybeArray((w = _self, _globalThis).Array.prototype).call([1, 2], 2);