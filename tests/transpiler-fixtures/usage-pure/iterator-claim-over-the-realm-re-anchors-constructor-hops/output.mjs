import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// An assignment pattern over the realm whose iterator claim keeps the host from its mirror: a constructor hop
// beside it re-anchors on the constructor's ponyfill in a statement of its own, every piece in the order the
// source wrote its hop - one hop written first, and two around the claim.
let it, it2, customU, customP, customM;
({
  customU
} = _Set);
it = _getIteratorMethod(_globalThis);
({
  customP
} = _Promise);
it2 = _getIteratorMethod(_globalThis);
({
  customM
} = _Map);
export const r = [it, it2, customU, customP, customM];