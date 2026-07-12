import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// a chain-assign optional subject whose VALUE is a global-proxy navigation keeps its guard
// (the value may be undefined off-engine), while the redundant trailing global hop over the
// memoized root is dropped: re-reading the hop off the memo would throw on engines without it
let q;
export const viaSelfHop = null == (_ref = q = _self) ? void 0 : _flatMaybeArray(_ref.Array.prototype);

// a call through the guarded tail keeps its receiver binding and drops the same trailing hop
let w;
export const viaSelfCallHop = null == (_ref2 = w = _self) ? void 0 : _includesMaybeArray(_ref2.Array.prototype).call([1, 2], 2);