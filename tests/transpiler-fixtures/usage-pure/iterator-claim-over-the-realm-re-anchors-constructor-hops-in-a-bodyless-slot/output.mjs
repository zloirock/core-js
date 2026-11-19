import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// The same realm pattern in a bodyless slot: the iterator claim keeps the host from its mirror, and every
// constructor hop beside it still re-anchors on the constructor's ponyfill - an assignment as a statement
// of its own in the block the slot becomes, a `var` as a declarator of its own - in the order the source
// wrote its hops, whether one hop stands beside the claim or two around it.
let it, customU, customM, it2, customP;
if (c) {
  ({
    customU
  } = _Set);
  it = _getIteratorMethod(_globalThis);
  ({
    customM
  } = _Map);
}
if (d) {
  ({
    customP
  } = _Promise);
  it2 = _getIteratorMethod(_globalThis);
}
if (e) var {
    customW
  } = _WeakMap,
  it3 = _getIteratorMethod(_globalThis),
  {
    customS
  } = _WeakSet;
if (f) var {
    customI
  } = _Iterator,
  it4 = _getIteratorMethod(_globalThis);
export const r = [it, customU, customM, it2, customP, it3, customW, customS, it4, customI];