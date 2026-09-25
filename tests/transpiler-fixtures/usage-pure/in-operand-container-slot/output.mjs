import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol from "@core-js/pure/actual/symbol";
// an `in` probe whose object is a container slot - a class static stored in a literal, a literal
// slot, an array slot over a call or over a constructor, a const-folded key - names the
// constructor the slot holds: pure folds the probe, global injects the probed static
class K {
  static M = _Map;
}
const box = {
  M: K.M,
  P: _Promise
};
function iterator() {
  return _Iterator;
}
const symbols = {
  s: _Symbol
};
const k = 's';
const held = {
  A: Array
};
export const grouped = true;
export const attempted = true;
export const iterated = (iterator(), true);
export const keyed = 'for' in symbols[k];
export const isError = true;
export const fromAsync = true;