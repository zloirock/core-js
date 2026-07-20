import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2;
// SE-bearing computed keys around the kept-assign claim: a key SE on the CLAIM hop folds into
// the claim sequence at its native slot; a key SE on a dropped PROXY hop rides the detection's
// side-effect channel (the emitters agree on order and differ only in sequence flattening -
// the sidecar carries the unflattened spelling)
let m;
let c = 0;
export const seClaimKey = (_ref = (m = _globalThis.window, c++, _Set), _nameMaybeFunction(_ref));
let p;
let k = 0;
export const seProxyKey = (_ref2 = (k++, p = _globalThis.window, _Map), _nameMaybeFunction(_ref2));