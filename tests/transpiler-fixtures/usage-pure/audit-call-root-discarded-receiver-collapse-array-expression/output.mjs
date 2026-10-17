import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A DISCARDED call/IIFE-rooted proxy receiver with a pure-ctor leaf whole-swaps the leaf and re-emits every side effect the
// dropped navigation carried - the SE-bearing chain-root call, a computed hop-key effect, and an effect buried in the LEAF's own
// computed key - in source order ahead of it.
let c = 0;
function sf() {
  c++;
  return _globalThis;
}
sf(), c++;
const groupBy = _Map$groupBy;
export const r = [typeof groupBy, c];