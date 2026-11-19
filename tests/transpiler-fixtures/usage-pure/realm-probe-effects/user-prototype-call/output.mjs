import _globalThis from "@core-js/pure/actual/global-this";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Set from "@core-js/pure/actual/set/constructor";
// A user consumer does not own the throwing read of its effectful realm argument.
const effects = [];
export function read() {
  return ((x => _globalThis)(_Number$parseFloat("1.5")).window.Set, _Set).prototype.has.call(new _Set([1]), 1);
}