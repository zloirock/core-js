import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2;
// SE-bearing computed keys around the kept-assign claim: both a key SE on the CLAIM hop and one on
// a DROPPED proxy hop fold into the claim sequence at their native slot - after the assignment, which
// is the object being read and so evaluates first. the dropped-hop key used to ride the detection's
// side-effect channel and got wrapped AROUND the whole render, running before the assignment.
// the emitters agree on order and differ only in memoizing the sequence - the sidecar carries that
let m;
let c = 0;
export const seClaimKey = (_ref = (m = _globalThis.window, c++, _Set), _nameMaybeFunction(_ref));
let p;
let k = 0;
export const seProxyKey = (_ref2 = (p = _globalThis.window, k++, _Map), _nameMaybeFunction(_ref2));